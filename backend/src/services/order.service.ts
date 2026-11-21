import { prisma } from '../config';
import { finalizeOrderSale } from './sales.service';
import { cacheService } from './cache.service';

// Compteur séquentiel en mémoire synchronisé par Promise unique (Pattern Singleflight)
let localOrderSequence = 0;
let initSequencePromise: Promise<number> | null = null;

async function getNextOrderId(): Promise<string> {
  if (localOrderSequence === 0) {
    if (!initSequencePromise) {
      initSequencePromise = (async () => {
        try {
          const recent = await prisma.order.findFirst({
            select: { id: true },
            orderBy: { createdAt: 'desc' },
          });
          const parsed = recent ? parseInt(recent.id.replace(/\D/g, ''), 10) : 1042;
          localOrderSequence = Math.max(1042, isNaN(parsed) ? 1042 : parsed);
        } catch {
          localOrderSequence = 1042;
        }
        return localOrderSequence;
      })();
    }
    await initSequencePromise;
  }
  localOrderSequence += 1;
  return String(localOrderSequence);
}

export interface CreateOrderItemInput {
  productId: string;
  name?: string;
  quantity: number;
  selectedOptions?: Array<{
    optionName: string;
    valueName: string;
    extraPrice?: number;
  }>;
  selectedOptionsText?: string | null;
  notes?: string | null;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | null;
  tableNumber?: string | null;
  deliveryAddress?: string | null;
  paymentMethod?: 'WAVE' | 'OM' | 'CASH' | 'CARD' | null;
  notes?: string | null;
  discount?: number;
  items: CreateOrderItemInput[];
}

/**
 * Création d'une commande réelle avec recalcul strict des prix par le serveur
 * RÈGLE SÉCURITÉ : Ne JAMAIS faire confiance au prix envoyé par le client
 */
export const createOrder = async (payload: CreateOrderPayload) => {
  const { customerName, customerPhone, tableNumber, deliveryAddress, notes, items } = payload;
  const cleanPhone = customerPhone ? customerPhone.replace(/\s+/g, '') : '';
  const orderType = payload.orderType || 'DINE_IN';

  const formattedTableNumber =
    orderType === 'DINE_IN' && tableNumber ? String(tableNumber).trim().padStart(2, '0') : null;

  // 1. Récupération des produits avec cache mémoire résilient
  const allDbProducts = await cacheService.getOrSet('order:products:lookup', async () => {
    return await prisma.product.findMany({
      include: {
        options: {
          include: { values: true },
        },
      },
    });
  }, 60);

  const productById = new Map(allDbProducts.map(p => [p.id, p]));
  const productByName = new Map(allDbProducts.map(p => [p.name.toLowerCase().trim(), p]));

  const normalize = (str?: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

  const resolvedItems: Array<{ item: CreateOrderItemInput; product: (typeof allDbProducts)[number] }> = [];

  for (const item of items) {
    let product = productById.get(item.productId);
    if (!product && item.name) {
      product = productByName.get(item.name.toLowerCase().trim());
    }
    if (!product) {
      const normItemName = normalize(item.name);
      const normItemId = normalize(item.productId);
      product = allDbProducts.find(p => {
        const normDb = normalize(p.name);
        return (
          (normItemName && (normDb.includes(normItemName) || normItemName.includes(normDb))) ||
          (normItemId && normDb.includes(normItemId))
        );
      });
    }
    if (!product) {
      throw new Error(`Produit introuvable : ${item.name || item.productId}`);
    }
    if (!product.isAvailable) {
      throw new Error(`Le produit "${product.name}" n’est actuellement plus disponible.`);
    }
    resolvedItems.push({ item, product });
  }

  // 2. Recalcul strict et snapshot des prix côté serveur
  let calculatedSubtotal = 0;
  const calculatedItems = resolvedItems.map(({ item, product }) => {
    let unitPrice = product.price;

    let extraPriceTotal = 0;
    const optionsTextList: string[] = [];
    const optionsToCreate: Array<{ optionName: string; valueName: string; extraPrice: number }> = [];

    if (item.selectedOptions && item.selectedOptions.length > 0) {
      for (const selOpt of item.selectedOptions) {
        const dbOpt = product.options.find(
          o => o.name.toLowerCase() === selOpt.optionName.trim().toLowerCase()
        );
        let extra = 0;
        let valName = selOpt.valueName;
        if (dbOpt) {
          const dbVal = dbOpt.values.find(
            v => v.name.toLowerCase() === selOpt.valueName.trim().toLowerCase()
          );
          if (dbVal) {
            extra = dbVal.extraPrice;
            valName = dbVal.name;
          }
        }
        extraPriceTotal += extra;
        optionsTextList.push(valName);
        optionsToCreate.push({
          optionName: selOpt.optionName,
          valueName: valName,
          extraPrice: extra,
        });
      }
    }

    const effectiveUnitPrice = unitPrice + extraPriceTotal;
    const itemTotalPrice = effectiveUnitPrice * item.quantity;
    calculatedSubtotal += itemTotalPrice;

    const calculatedItem: any = {
      productId: product.id,
      name: product.name, // Snapshot immuable
      quantity: item.quantity,
      unitPrice: effectiveUnitPrice, // Snapshot immuable
      totalPrice: itemTotalPrice, // Snapshot immuable
      selectedOptionsText:
        optionsTextList.length > 0 ? optionsTextList.join(', ') : item.selectedOptionsText || null,
      notes: item.notes ? item.notes.trim() : null,
    };

    if (optionsToCreate.length > 0) {
      calculatedItem.options = { create: optionsToCreate };
    }

    return calculatedItem;
  });

  const deliveryFee = orderType === 'DELIVERY' ? 1500 : 0;
  const discount = Math.max(0, Number(payload.discount || 0));
  const calculatedTotal = Math.max(0, calculatedSubtotal + deliveryFee - discount);

  const rawMethod = String(payload.paymentMethod || 'WAVE').toUpperCase();
  const paymentMethod = ['WAVE', 'OM', 'CASH', 'CARD'].includes(rawMethod) ? rawMethod : 'WAVE';
  const isMobilePayment = paymentMethod === 'WAVE' || paymentMethod === 'OM';
  const initialStatus = isMobilePayment ? 'PENDING_PAYMENT' : 'CONFIRMED';
  const initialNote = isMobilePayment
    ? `Commande passée (${orderType === 'DINE_IN' ? `Table ${formattedTableNumber}` : orderType === 'DELIVERY' ? 'Livraison' : 'À emporter'}) — En attente de paiement mobile ${paymentMethod === 'OM' ? 'Orange Money' : 'Wave'}`
    : `Commande passée (${orderType === 'DINE_IN' ? `Table ${formattedTableNumber}` : orderType === 'DELIVERY' ? 'Livraison' : 'À emporter'}) — Règlement sur place`;

  // 3. Transaction ultra-rapide et légère (seulement Commande + Table + Paiement)
  let createdOrder: any = null;
  let lastError: any = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const orderId = await getNextOrderId();
      const orderNumber = `#TF-${orderId}`;

      createdOrder = await prisma.$transaction(
        async tx => {
          const created = await tx.order.create({
            data: {
              id: orderId,
              orderNumber,
              customerName: customerName.trim(),
              customerPhone: cleanPhone || customerPhone.trim(),
              orderType,
              tableNumber: formattedTableNumber,
              deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress?.trim() || null : null,
              notes: notes ? notes.trim() : null,
              subtotal: calculatedSubtotal,
              discount,
              deliveryFee,
              total: calculatedTotal,
              status: initialStatus,
              items: {
                create: calculatedItems,
              },
              statusHistory: {
                create: [
                  {
                    status: initialStatus,
                    note: initialNote,
                  },
                ],
              },
              payment: {
                create: {
                  amount: calculatedTotal,
                  currency: 'FCFA',
                  method: paymentMethod,
                  status: 'PENDING',
                },
              },
            },
            include: {
              items: {
                include: { options: true },
              },
              statusHistory: {
                orderBy: { changedAt: 'asc' },
              },
              payment: true,
            },
          });

          if (orderType === 'DINE_IN' && formattedTableNumber) {
            await tx.table.updateMany({
              where: { number: formattedTableNumber },
              data: { status: 'OCCUPIED', currentOrderId: created.id },
            });
          }

          return created;
        },
        { timeout: 15000, maxWait: 10000 }
      );

      break; // Succès
    } catch (err: any) {
      lastError = err;
      if (err?.code === 'P2002') {
        localOrderSequence += Math.floor(Math.random() * 5) + 1;
        continue;
      }
      throw err;
    }
  }

  if (!createdOrder) {
    throw lastError || new Error('Impossible de finaliser la commande');
  }

  // 5. Mise à jour CRM et Programme de Fidélité hors-transaction (asynchrone, non bloquante)
  if (cleanPhone) {
    prisma.customer
      .upsert({
        where: { phone: cleanPhone },
        update: {
          name: customerName.trim(),
          ordersCount: { increment: 1 },
          totalSpent: { increment: calculatedTotal },
          loyaltyPoints: { increment: 10 },
        },
        create: {
          name: customerName.trim(),
          phone: cleanPhone,
          ordersCount: 1,
          totalSpent: calculatedTotal,
          loyaltyPoints: 10,
          loyalty: {
            create: {
              points: 10,
              tier: 'Bronze',
            },
          },
        },
      })
      .catch(crmErr => console.warn('ℹ️ Mise à jour CRM async :', crmErr.message));
  }

  return createdOrder;
};

/**
 * Mise à jour de statut avec enregistrement des horodatages et déclenchement de la vente
 */
export const updateOrderStatus = async (orderId: string, newStatus: string, note?: string | null) => {
  const upperStatus = String(newStatus || '').toUpperCase().trim();
  const status =
    upperStatus === 'ACCEPTED'
      ? 'CONFIRMED'
      : upperStatus === 'NEW'
      ? 'PENDING'
      : upperStatus === 'DELIVERED'
      ? 'SERVED'
      : (upperStatus as any);

  const cleanId = orderId ? String(orderId).replace(/^[#\s]*TF-/i, '').trim() : '';

  return await prisma.$transaction(
    async tx => {
      let existing = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existing && cleanId && cleanId !== orderId) {
      existing = await tx.order.findUnique({
        where: { id: cleanId },
        include: { items: true },
      });
    }

    if (!existing) {
      existing = await tx.order.findFirst({
        where: { orderNumber: orderId },
        include: { items: true },
      });
    }

    if (!existing) {
      throw new Error(`Commande introuvable : ${orderId}`);
    }

    if (existing.status === 'CANCELLED' && status !== 'CANCELLED') {
      throw new Error('Une commande annulée ne peut plus être réactivée.');
    }

    const noteText =
      note ||
      (status === 'SERVED'
        ? 'Commande remise au client — Vente finalisée automatiquement'
        : status === 'READY'
        ? 'Commande prête à être servie'
        : status === 'PREPARING'
        ? 'Préparation en cuisine démarrée'
        : status === 'CONFIRMED'
        ? 'Commande acceptée par le restaurant'
        : `Statut passé à ${status}`);

    const now = new Date();
    const timestampUpdates: Record<string, Date | null> = {};

    if (status === 'CONFIRMED' && !existing.acceptedAt) {
      timestampUpdates.acceptedAt = now;
    } else if (status === 'PREPARING' && !existing.preparingAt) {
      timestampUpdates.preparingAt = now;
    } else if (status === 'READY' && !existing.readyAt) {
      timestampUpdates.readyAt = now;
    } else if (status === 'SERVED' && !existing.servedAt) {
      timestampUpdates.servedAt = now;
    } else if (status === 'CANCELLED' && !existing.cancelledAt) {
      timestampUpdates.cancelledAt = now;
    }

    // 1. Mettre à jour la commande
    const updated = await tx.order.update({
      where: { id: existing.id },
      data: {
        status,
        ...timestampUpdates,
        statusHistory: {
          create: {
            status,
            note: noteText,
          },
        },
      },
      include: {
        items: {
          include: { options: true },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    // 2. Si la commande passe à SERVED : Création automatique et idempotente de la Vente (Règle 12 & 13)
    let saleCreated: any = null;
    if (status === 'SERVED') {
      const saleResult = await finalizeOrderSale(existing.id, updated.total, tx);
      saleCreated = saleResult.sale;
    }

    // 3. Si la commande est servie ou annulée, libérer la table
    if (updated.tableNumber && (status === 'SERVED' || status === 'CANCELLED')) {
      const formattedTable = String(updated.tableNumber).trim().padStart(2, '0');
      await tx.table.updateMany({
        where: {
          OR: [
            { number: updated.tableNumber },
            { number: formattedTable },
          ],
        },
        data: { status: 'FREE', currentOrderId: null },
      });
    }

    return { order: updated, saleCreated };
  },
  { timeout: 15000, maxWait: 10000 }
);
};

/**
 * Formate et assainit une commande pour l'écran Cuisine
 * RÈGLE STRICTE : AUCUNE DONNÉE FINANCIÈRE (zéro prix, zéro sous-total, zéro montant total)
 */
export const sanitizeOrderForKitchen = (o: any) => ({
  id: o?.id || '',
  orderNumber: o?.orderNumber || (o?.id ? `#TF-${o.id}` : ''),
  customerName: o?.customerName || '',
  customerPhone: o?.customerPhone || '',
  tableNumber: o?.tableNumber || null,
  orderType: o?.orderType || 'DINE_IN',
  notes: o?.notes || null,
  status: o?.status || 'PENDING',
  createdAt: o?.createdAt || new Date(),
  acceptedAt: o?.acceptedAt || null,
  preparingAt: o?.preparingAt || null,
  readyAt: o?.readyAt || null,
  servedAt: o?.servedAt || null,
  cancelledAt: o?.cancelledAt || null,
  items: (o?.items || []).map((it: any) => ({
    id: it?.id,
    productId: it?.productId,
    name: it?.name,
    quantity: it?.quantity,
    selectedOptionsText: it?.selectedOptionsText,
    notes: it?.notes,
  })),
  statusHistory: (o?.statusHistory || []).map((h: any) => ({
    status: h?.status,
    changedAt: h?.changedAt,
    note: h?.note,
  })),
});

/**
 * Récupération des commandes pour l'écran Cuisine
 * RÈGLE ABSOLUE : Une commande payée par Wave ou OM n'apparaît JAMAIS tant qu'elle n'est pas CONFIRMED.
 * RÈGLE STRICTE : AUCUNE DONNÉE FINANCIÈRE (zéro prix, zéro montant retourné)
 */
export const getKitchenOrders = async () => {
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'SERVED'] },
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: { changedAt: 'asc' },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return orders.map(sanitizeOrderForKitchen);
};

/**
 * Helper de recherche résiliente de commande par ID ou orderNumber
 */
async function findOrderWithPayment(tx: any, orderId: string) {
  const clean = orderId ? String(orderId).replace(/^[#\s]*TF-/i, '').trim() : '';
  let existing = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { options: true } },
      statusHistory: { orderBy: { changedAt: 'asc' } },
      payment: { include: { verifiedByUser: { select: { id: true, name: true, role: true } } } },
    },
  });

  if (!existing && clean && clean !== orderId) {
    existing = await tx.order.findUnique({
      where: { id: clean },
      include: {
        items: { include: { options: true } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
        payment: { include: { verifiedByUser: { select: { id: true, name: true, role: true } } } },
      },
    });
  }

  if (!existing) {
    existing = await tx.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderId },
          ...(clean ? [{ orderNumber: `#TF-${clean}` }] : []),
        ],
      },
      include: {
        items: { include: { options: true } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
        payment: { include: { verifiedByUser: { select: { id: true, name: true, role: true } } } },
      },
    });
  }

  return existing;
}

/**
 * 1. Déclaration de paiement par le client (Wave ou Orange Money)
 * RÈGLE ABSOLUE : Ne constitue JAMAIS une preuve de paiement.
 * Ne transmet AUCUNE commande à la cuisine.
 */
export const declarePayment = async (
  orderId: string,
  params: { method: string; transactionRef?: string | null; customerNote?: string | null }
) => {
  return await prisma.$transaction(
    async tx => {
      const existing = await findOrderWithPayment(tx, orderId);
      if (!existing) {
        throw new Error(`Commande introuvable : ${orderId}`);
      }

      if (existing.status === 'CANCELLED') {
        throw new Error('Cette commande a été annulée et ne peut plus faire l’objet d’un paiement.');
      }

      // Si déjà confirmée ou plus avancée, la déclaration est sans objet
      if (['CONFIRMED', 'PREPARING', 'READY', 'SERVED'].includes(existing.status)) {
        return existing;
      }

      const rawMethod = String(params.method || 'WAVE').toUpperCase();
      const method = rawMethod === 'OM' ? 'OM' : rawMethod === 'CASH' ? 'CASH' : 'WAVE';
      const methodLabel = method === 'OM' ? 'Orange Money' : method === 'CASH' ? 'Espèces' : 'Wave';
      const cleanRef = params.transactionRef ? params.transactionRef.trim() : null;

      // 1. Mise à jour / création de l'enregistrement Payment
      await tx.payment.upsert({
        where: { orderId: existing.id },
        create: {
          orderId: existing.id,
          amount: existing.total, // RÈGLE SÉCURITÉ : Montant issu de la BDD, jamais du payload
          currency: 'FCFA',
          method,
          status: 'AWAITING_VERIFICATION',
          transactionRef: cleanRef,
          clientDeclaredAt: new Date(),
        },
        update: {
          method,
          status: 'AWAITING_VERIFICATION',
          transactionRef: cleanRef,
          clientDeclaredAt: new Date(),
        },
      });

      // 2. Mise à jour du statut de la commande vers AWAITING_PAYMENT_VERIFICATION
      const payNote = `Paiement ${methodLabel} déclaré par le client${
        cleanRef ? ` (Réf: ${cleanRef})` : ''
      } — En attente de vérification par le gérant`;

      const updated = await tx.order.update({
        where: { id: existing.id },
        data: {
          status: 'AWAITING_PAYMENT_VERIFICATION',
          statusHistory: {
            create: {
              status: 'AWAITING_PAYMENT_VERIFICATION',
              note: payNote,
            },
          },
        },
        include: {
          items: { include: { options: true } },
          statusHistory: { orderBy: { changedAt: 'asc' } },
          payment: { include: { verifiedByUser: { select: { id: true, name: true, role: true } } } },
        },
      });

      return updated;
    },
    { timeout: 15000, maxWait: 10000 }
  );
};

// Verrouillage de concurrence en mémoire par commande pour éliminer les courses d'approbation
const approvalMutexes = new Map<string, Promise<any>>();

/**
 * 2. Approbation du paiement par le gérant ou un personnel autorisé (ADMIN / STAFF)
 * RÈGLE ABSOLUE : Transmet la commande à la cuisine MAINTENANT ET SEULEMENT MAINTENANT.
 * Protection contre la double validation concurrente (idempotence stricte et verrou atomique).
 */
export const approvePayment = async (
  orderId: string,
  verifierUserId: string,
  note?: string | null
): Promise<{ order: any; newlyApproved: boolean }> => {
  if (!verifierUserId || !verifierUserId.trim()) {
    throw new Error('Utilisateur non authentifié : ID du vérificateur requis.');
  }

  const cleanKey = String(orderId).replace(/^[#\s]*TF-/i, '').trim() || orderId;

  // Attendre si une approbation est déjà en cours sur cette commande
  while (approvalMutexes.has(cleanKey)) {
    try {
      await approvalMutexes.get(cleanKey);
    } catch {
      // Ignorer l'erreur du prédécesseur
    }
  }

  let resolveLock: () => void = () => {};
  const lockPromise = new Promise<void>(res => {
    resolveLock = res;
  });
  approvalMutexes.set(cleanKey, lockPromise);

  try {
    return await prisma.$transaction(
      async tx => {
        const existing = await findOrderWithPayment(tx, orderId);
        if (!existing) {
          throw new Error(`Commande introuvable : ${orderId}`);
        }

        if (existing.status === 'CANCELLED') {
          throw new Error('Impossible d’approuver le paiement d’une commande annulée.');
        }

        // Idempotence : si déjà payée et confirmée, ne pas réémettre en cuisine
        if (
          ['CONFIRMED', 'PREPARING', 'READY', 'SERVED'].includes(existing.status) &&
          existing.payment?.status === 'PAID'
        ) {
          return { order: existing, newlyApproved: false };
        }

        // 1. Mise à jour atomique du statut Payment vers PAID avec vérification d'état
        let isFirstApproval = false;
        const existingPayment = await tx.payment.findUnique({
          where: { orderId: existing.id },
        });

        if (!existingPayment) {
          await tx.payment.create({
            data: {
              orderId: existing.id,
              amount: existing.total,
              currency: 'FCFA',
              method: 'WAVE',
              status: 'PAID',
              verifiedByUserId: verifierUserId,
              verifiedAt: new Date(),
            },
          });
          isFirstApproval = true;
        } else if (existingPayment.status !== 'PAID') {
          const updateCount = await tx.payment.updateMany({
            where: {
              orderId: existing.id,
              status: { not: 'PAID' },
            },
            data: {
              status: 'PAID',
              verifiedByUserId: verifierUserId,
              verifiedAt: new Date(),
            },
          });
          isFirstApproval = updateCount.count > 0;
        } else {
          isFirstApproval = false;
        }

        // Si ce n'est pas la première approbation, retourner sans réémettre
        if (!isFirstApproval) {
          return { order: existing, newlyApproved: false };
        }

        // Récupérer le nom du vérificateur pour traçabilité
        const verifier = await tx.user.findUnique({
          where: { id: verifierUserId },
          select: { id: true, name: true, role: true },
        });

        const verifierName = verifier ? `${verifier.name} (${verifier.role})` : 'Gérance';
        const methodLabel = existing.payment?.method === 'OM' ? 'Orange Money' : 'Wave';
        const paymentTag = `[Payé via ${methodLabel}]`;

        let currentNotes = existing.notes || '';
        if (!currentNotes.includes(paymentTag)) {
          currentNotes = currentNotes ? `${currentNotes} • ${paymentTag}` : paymentTag;
        }

        // 2. Mettre à jour Order vers CONFIRMED
        const validationNote =
          note ||
          `Paiement validé par ${verifierName} — Commande approuvée et transmise en cuisine`;

        const updated = await tx.order.update({
          where: { id: existing.id },
          data: {
            status: 'CONFIRMED',
            acceptedAt: new Date(),
            notes: currentNotes,
            statusHistory: {
              create: {
                status: 'CONFIRMED',
                note: validationNote,
              },
            },
          },
          include: {
            items: { include: { options: true } },
            statusHistory: { orderBy: { changedAt: 'asc' } },
            payment: { include: { verifiedByUser: { select: { id: true, name: true, role: true } } } },
          },
        });

        return { order: updated, newlyApproved: true };
      },
      { timeout: 15000, maxWait: 10000 }
    );
  } finally {
    approvalMutexes.delete(cleanKey);
    resolveLock();
  }
};

/**
 * 3. Rejet du paiement par le gérant (ADMIN / STAFF) avec motif obligatoire
 * RÈGLE ABSOLUE : La commande n'est JAMAIS transmise à la cuisine et est annulée.
 */
export const rejectPayment = async (
  orderId: string,
  verifierUserId: string,
  reason: string
) => {
  if (!reason || reason.trim().length < 3) {
    throw new Error('Un motif de rejet obligatoire doit être renseigné (au moins 3 caractères).');
  }

  return await prisma.$transaction(
    async tx => {
      const existing = await findOrderWithPayment(tx, orderId);
      if (!existing) {
        throw new Error(`Commande introuvable : ${orderId}`);
      }

      if (existing.payment?.status === 'PAID') {
        throw new Error('Impossible de rejeter un paiement déjà approuvé et encaissé.');
      }

      const verifier = await tx.user.findUnique({
        where: { id: verifierUserId },
        select: { id: true, name: true, role: true },
      });
      const verifierName = verifier ? `${verifier.name} (${verifier.role})` : 'Gérance';
      const cleanReason = reason.trim();

      // 1. Mettre à jour Payment vers REJECTED
      await tx.payment.upsert({
        where: { orderId: existing.id },
        create: {
          orderId: existing.id,
          amount: existing.total,
          currency: 'FCFA',
          method: existing.payment?.method || 'WAVE',
          status: 'REJECTED',
          rejectionReason: cleanReason,
          verifiedByUserId: verifierUserId,
          verifiedAt: new Date(),
        },
        update: {
          status: 'REJECTED',
          rejectionReason: cleanReason,
          verifiedByUserId: verifierUserId,
          verifiedAt: new Date(),
        },
      });

      // 2. Mettre à jour Order vers CANCELLED
      const updated = await tx.order.update({
        where: { id: existing.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          statusHistory: {
            create: {
              status: 'CANCELLED',
              note: `Paiement rejeté par ${verifierName} : "${cleanReason}" — Commande annulée`,
            },
          },
        },
        include: {
          items: { include: { options: true } },
          statusHistory: { orderBy: { changedAt: 'asc' } },
          payment: { include: { verifiedByUser: { select: { id: true, name: true, role: true } } } },
        },
      });

      // 3. Libérer la table si occupée
      if (existing.tableNumber && existing.orderType === 'DINE_IN') {
        await tx.table.updateMany({
          where: { number: existing.tableNumber },
          data: { status: 'FREE', currentOrderId: null },
        });
      }

      return updated;
    },
    { timeout: 15000, maxWait: 10000 }
  );
};

/**
 * Confirmation de paiement Wave ou Orange Money par le client (Alias de déclaration)
 */
export const confirmPayment = async (
  orderId: string,
  params: { method: string; amount?: number; note?: string; transactionRef?: string }
) => {
  return await declarePayment(orderId, {
    method: params.method,
    transactionRef: params.transactionRef,
    customerNote: params.note,
  });
};

/**
 * Récupération des commandes pour l'écran Admin (supporte filtres sensibles ou insensibles à la casse)
 * Protection anti-OOM : Limitation par défaut à 150 commandes
 */
export const getAllOrders = async (statusFilter?: string, limit = 150, offset = 0) => {
  const whereClause: any = {};
  if (statusFilter && statusFilter.trim()) {
    const upper = statusFilter.trim().toUpperCase();
    if (upper === 'PAYMENTS_PENDING' || upper === 'AWAITING_VERIFICATION') {
      whereClause.status = 'AWAITING_PAYMENT_VERIFICATION';
    } else if (upper !== 'ALL') {
      whereClause.status = upper;
    }
  }

  const safeLimit = Math.min(Math.max(1, Number(limit) || 150), 500);
  const safeOffset = Math.max(0, Number(offset) || 0);

  return await prisma.order.findMany({
    where: whereClause,
    include: {
      items: {
        include: { options: true },
      },
      statusHistory: {
        orderBy: { changedAt: 'asc' },
      },
      payment: {
        include: {
          verifiedByUser: {
            select: { id: true, name: true, role: true },
          },
        },
      },
      sale: true,
    },
    orderBy: { createdAt: 'desc' },
    take: safeLimit,
    skip: safeOffset,
  });
};

export const getOrderById = async (id: string) => {
  if (!id || typeof id !== 'string') return null;
  const cleanId = String(id).replace(/^[#\s]*TF-/i, '').trim();
  return await prisma.order.findFirst({
    where: {
      OR: [
        { id },
        ...(cleanId && cleanId !== id ? [{ id: cleanId }] : []),
        { orderNumber: id },
        ...(cleanId ? [{ orderNumber: `#TF-${cleanId}` }] : []),
      ],
    },
    include: {
      items: {
        include: { options: true },
      },
      statusHistory: {
        orderBy: { changedAt: 'asc' },
      },
      payment: {
        include: {
          verifiedByUser: {
            select: { id: true, name: true, role: true },
          },
        },
      },
      sale: true,
    },
  });
};
