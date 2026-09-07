import { prisma } from '../config';
import { finalizeOrderSale } from './sales.service';

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
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  tableNumber?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  items: CreateOrderItemInput[];
}

/**
 * Création d'une commande réelle avec recalcul strict des prix par le serveur
 * RÈGLE SÉCURITÉ : Ne JAMAIS faire confiance au prix envoyé par le client
 */
export const createOrder = async (payload: CreateOrderPayload) => {
  const { customerName, customerPhone, orderType, tableNumber, deliveryAddress, notes, items } = payload;

  const formattedTableNumber =
    orderType === 'DINE_IN' && tableNumber ? String(tableNumber.trim()).padStart(2, '0') : null;

  // 1. Récupération et vérification des produits en base de données
  const allDbProducts = await prisma.product.findMany({
    include: {
      options: {
        include: { values: true },
      },
    },
  });

  const productById = new Map(allDbProducts.map(p => [p.id, p]));
  const productByName = new Map(allDbProducts.map(p => [p.name.toLowerCase().trim(), p]));

  const normalize = (str?: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

  const resolvedItems: Array<{ item: CreateOrderItemInput; product: (typeof allDbProducts)[0] }> = [];

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

    return {
      productId: product.id,
      name: product.name, // Snapshot immuable
      quantity: item.quantity,
      unitPrice: effectiveUnitPrice, // Snapshot immuable
      totalPrice: itemTotalPrice, // Snapshot immuable
      selectedOptionsText:
        optionsTextList.length > 0 ? optionsTextList.join(', ') : item.selectedOptionsText || null,
      notes: item.notes ? item.notes.trim() : null,
      options: optionsToCreate.length > 0 ? { create: optionsToCreate } : undefined,
    };
  });

  const deliveryFee = orderType === 'DELIVERY' ? 1500 : 0;
  const calculatedTotal = calculatedSubtotal + deliveryFee;

  // 3. Exécution atomique dans une transaction Prisma
  return await prisma.$transaction(async tx => {
    const recentOrders = await tx.order.findMany({
      select: { id: true },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
    let maxNum = 1042;
    for (const o of recentOrders) {
      const parsed = parseInt(o.id.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
    const orderId = String(maxNum + 1);
    const orderNumber = `#TF-${orderId}`;

    const created = await tx.order.create({
      data: {
        id: orderId,
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        tableNumber: formattedTableNumber,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress?.trim() || null : null,
        notes: notes ? notes.trim() : null,
        subtotal: calculatedSubtotal,
        discount: 0,
        deliveryFee,
        total: calculatedTotal,
        status: 'PENDING',
        items: {
          create: calculatedItems,
        },
        statusHistory: {
          create: [
            {
              status: 'PENDING',
              note:
                orderType === 'DINE_IN'
                  ? `Commande passée à table ${formattedTableNumber}`
                  : `Commande en ${orderType === 'DELIVERY' ? 'livraison' : 'à emporter'}`,
            },
          ],
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

    if (orderType === 'DINE_IN' && formattedTableNumber) {
      await tx.table.updateMany({
        where: { number: formattedTableNumber },
        data: { status: 'OCCUPIED', currentOrderId: created.id },
      });
    }

    // CRM & Fidélité
    await tx.customer.upsert({
      where: { phone: customerPhone.trim() },
      update: {
        name: customerName.trim(),
        ordersCount: { increment: 1 },
        totalSpent: { increment: calculatedTotal },
        loyaltyPoints: { increment: 10 },
      },
      create: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
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
    });

    return created;
  });
};

/**
 * Mise à jour de statut avec enregistrement des horodatages et déclenchement de la vente
 */
export const updateOrderStatus = async (orderId: string, newStatus: string, note?: string | null) => {
  const status =
    newStatus === 'ACCEPTED' ? 'CONFIRMED' : newStatus === 'NEW' ? 'PENDING' : (newStatus as any);

  return await prisma.$transaction(async tx => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

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
      where: { id: orderId },
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
      const saleResult = await finalizeOrderSale(orderId, updated.total, tx);
      saleCreated = saleResult.sale;
    }

    // 3. Si la commande est servie ou annulée, libérer la table
    if (updated.tableNumber && (status === 'SERVED' || status === 'CANCELLED')) {
      await tx.table.updateMany({
        where: { number: updated.tableNumber },
        data: { status: 'FREE', currentOrderId: null },
      });
    }

    return { order: updated, saleCreated };
  });
};

/**
 * Formate et assainit une commande pour l'écran Cuisine
 * RÈGLE STRICTE : AUCUNE DONNÉE FINANCIÈRE (zéro prix, zéro sous-total, zéro montant total)
 */
export const sanitizeOrderForKitchen = (o: any) => ({
  id: o.id,
  orderNumber: o.orderNumber || `#TF-${o.id}`,
  customerName: o.customerName,
  customerPhone: o.customerPhone,
  tableNumber: o.tableNumber,
  orderType: o.orderType,
  notes: o.notes,
  status: o.status,
  createdAt: o.createdAt,
  acceptedAt: o.acceptedAt,
  preparingAt: o.preparingAt,
  readyAt: o.readyAt,
  servedAt: o.servedAt,
  cancelledAt: o.cancelledAt,
  items: (o.items || []).map((it: any) => ({
    id: it.id,
    productId: it.productId,
    name: it.name,
    quantity: it.quantity,
    selectedOptionsText: it.selectedOptionsText,
    notes: it.notes,
  })),
  statusHistory: (o.statusHistory || []).map((h: any) => ({
    status: h.status,
    changedAt: h.changedAt,
    note: h.note,
  })),
});

/**
 * Récupération des commandes pour l'écran Cuisine
 * RÈGLE STRICTE : AUCUNE DONNÉE FINANCIÈRE (zéro prix, zéro CA)
 */
export const getKitchenOrders = async () => {
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: { changedAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return orders.map(sanitizeOrderForKitchen);
};

/**
 * Récupération des commandes pour l'écran Admin
 */
export const getAllOrders = async (statusFilter?: string) => {
  const whereClause: any = {};
  if (statusFilter && statusFilter !== 'ALL') {
    whereClause.status = statusFilter;
  }

  return await prisma.order.findMany({
    where: whereClause,
    include: {
      items: {
        include: { options: true },
      },
      statusHistory: {
        orderBy: { changedAt: 'asc' },
      },
      sale: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOrderById = async (id: string) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { options: true },
      },
      statusHistory: {
        orderBy: { changedAt: 'asc' },
      },
      sale: true,
    },
  });
};
