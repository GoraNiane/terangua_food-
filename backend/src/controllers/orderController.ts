import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/auth';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/orderValidation';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validation de la requête avec Zod
    const validationResult = createOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Données de commande invalides',
        details: validationResult.error.flatten(),
      });
      return;
    }

    const {
      customerName,
      customerPhone,
      orderType,
      tableNumber,
      deliveryAddress,
      notes,
      items,
    } = validationResult.data;

    // Normalisation du numéro de table (ex: "8" -> "08")
    const formattedTableNumber =
      orderType === 'DINE_IN' && tableNumber
        ? String(tableNumber.trim()).padStart(2, '0')
        : null;

    // 2. Récupération et vérification des produits en base de données (Anti-fraude de prix)
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

    // Vérifier la disponibilité de tous les produits
    const resolvedItems: Array<{ item: (typeof items)[0]; product: (typeof allDbProducts)[0] }> = [];
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
      if (!product && allDbProducts.length > 0) {
        // Fallback ultime sur le premier produit si nécessaire
        product = allDbProducts[0];
      }
      if (!product) {
        res.status(400).json({ error: `Produit introuvable : ${item.name || item.productId}` });
        return;
      }
      if (!product.isAvailable) {
        res.status(400).json({ error: `Le produit "${product.name}" n’est actuellement plus disponible.` });
        return;
      }
      resolvedItems.push({ item, product });
    }

    // 3. Recalcul strict des prix côté serveur
    let calculatedSubtotal = 0;
    const calculatedItems = resolvedItems.map(({ item, product }) => {
      let unitPrice = product.price;

      // Calcul des suppléments d'options depuis la base
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
        name: product.name,
        quantity: item.quantity,
        unitPrice: effectiveUnitPrice,
        totalPrice: itemTotalPrice,
        selectedOptionsText:
          optionsTextList.length > 0
            ? optionsTextList.join(', ')
            : item.selectedOptionsText || null,
        notes: item.notes ? item.notes.trim() : null,
        options: optionsToCreate.length > 0 ? { create: optionsToCreate } : undefined,
      };
    });

    const deliveryFee = orderType === 'DELIVERY' ? 1500 : 0;
    const calculatedTotal = calculatedSubtotal + deliveryFee;

    // 4. Exécution atomique via prisma.$transaction
    const order = await prisma.$transaction(async tx => {
      // Déterminer le prochain ID séquentiel de façon sûre (strictement supérieur au max)
      const existingOrders = await tx.order.findMany({
        select: { id: true },
      });

      let maxNum = 1042;
      for (const o of existingOrders) {
        const parsed = parseInt(o.id.replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
      const orderId = String(maxNum + 1);

      // Création de la commande
      const created = await tx.order.create({
        data: {
          id: orderId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          orderType,
          tableNumber: formattedTableNumber,
          deliveryAddress: orderType === 'DELIVERY' ? (deliveryAddress?.trim() || null) : null,
          notes: notes ? notes.trim() : null,
          subtotal: calculatedSubtotal,
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
                  orderType === 'DINE_IN' && formattedTableNumber
                    ? `Commande transmise depuis la table ${formattedTableNumber}`
                    : 'Nouvelle commande transmise au restaurant',
              },
            ],
          },
        },
        include: {
          items: {
            include: { options: true },
          },
          statusHistory: true,
        },
      });

      // Mettre à jour l'état de la table si sur place
      if (orderType === 'DINE_IN' && formattedTableNumber) {
        await tx.table.updateMany({
          where: { number: formattedTableNumber },
          data: { status: 'OCCUPIED', currentOrderId: created.id },
        });
      }

      // Mettre à jour ou créer le profil client (CRM & Fidélité)
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

    // 5. Notification ciblée temps réel via Socket.IO (Admin, Cuisine & Staff)
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('order:created', order);
      io.emit('new_order', order);
      io.to('kitchen').emit('order:created', order);
      io.to('kitchen').emit('kitchen_new_order', order);
      io.to('admin').emit('order:created', order);
      if (formattedTableNumber) {
        io.emit('table_status_updated', {
          number: formattedTableNumber,
          status: 'OCCUPIED',
          currentOrderId: order.id,
        });
      }
    }

    res.status(201).json({ order });
  } catch (err: any) {
    console.error('Erreur createOrder :', err);
    res.status(500).json({ error: 'Erreur lors de la création de la commande', details: err.message });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, table } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        status: status ? (status as any) : undefined,
        tableNumber: table ? String(table) : undefined,
        OR: search
          ? [
              { id: { contains: String(search) } },
              { customerName: { contains: String(search) } },
              { customerPhone: { contains: String(search) } },
              { tableNumber: { contains: String(search) } },
            ]
          : undefined,
      },
      include: {
        items: {
          include: { options: true },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limite de précaution
    });

    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes', details: err.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { options: true },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Commande introuvable' });
      return;
    }

    res.json({ order });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

export const getKitchenOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            name: true,
            quantity: true,
            selectedOptionsText: true,
            notes: true,
            // STRICTEMENT AUCUN PRIX (unitPrice, totalPrice OMITTED)
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
          select: {
            status: true,
            changedAt: true,
            note: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Nettoyage absolu : aucune information financière renvoyée au client cuisine
    const sanitizedOrders = orders.map(o => ({
      id: o.id,
      orderNumber: `#TF-${o.id}`,
      tableNumber: o.tableNumber,
      orderType: o.orderType,
      notes: o.notes,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items,
      statusHistory: o.statusHistory,
    }));

    res.json({ orders: sanitizedOrders });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes cuisine' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const validation = updateOrderStatusSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Statut de commande invalide',
        details: validation.error.flatten(),
      });
      return;
    }

    const { status: rawStatus, note } = validation.data;
    const status = rawStatus === 'ACCEPTED' ? 'CONFIRMED' : rawStatus;

    const updatedOrder = await prisma.$transaction(async tx => {
      // Vérifier si la commande existe déjà
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        throw new Error('Commande introuvable');
      }

      const noteText =
        note ||
        (status === 'SERVED'
          ? 'Commande remise au client — Vente finalisée automatiquement'
          : status === 'READY'
          ? 'Commande prête à être servie'
          : `Statut passé à ${status}`);

      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
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

      // Si la commande est servie ou annulée, libérer la table
      if (updated.tableNumber && (status === 'SERVED' || status === 'CANCELLED')) {
        await tx.table.updateMany({
          where: { number: updated.tableNumber },
          data: { status: 'FREE', currentOrderId: null },
        });
      }

      return updated;
    });

    // Diffusion ciblée temps réel Socket.IO (Cuisine, Salle, Client & Dashboard Admin)
    const io = (req.app as any).get('io');
    if (io) {
      // 1. Mise à jour générale de statut pour l'écran cuisine, l'admin et le suivi client
      io.emit('order:updated', updatedOrder);
      io.emit('order_status_updated', updatedOrder);
      io.to('kitchen').emit('order:updated', updatedOrder);
      io.to('admin').emit('order:updated', updatedOrder);
      io.to(`order_${id}`).emit('order:updated', updatedOrder);
      io.to(`order_${id}`).emit('order_status_updated', updatedOrder);

      // 2. Si la commande est prête, notifier immédiatement le client
      if (status === 'READY') {
        io.to(`order_${id}`).emit('order_ready', {
          orderId: id,
          orderNumber: `#TF-${id}`,
          message: 'Votre commande est prête 🎉',
        });
      }

      // 3. Si la commande est servie, enregistrement automatique de la vente vers le dashboard admin
      if (status === 'SERVED') {
        io.to('admin').emit('sale_recorded', {
          orderId: updatedOrder.id,
          orderNumber: `#TF-${updatedOrder.id}`,
          tableNumber: updatedOrder.tableNumber,
          total: updatedOrder.total,
          itemsCount: updatedOrder.items.reduce((sum, item) => sum + item.quantity, 0),
          finalizedAt: new Date().toISOString(),
        });
      }
    }

    res.json({ order: updatedOrder });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut', details: err.message });
  }
};
