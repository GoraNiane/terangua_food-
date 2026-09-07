import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createOrderSchema, updateOrderStatusSchema } from '../validations/orderValidation';
import * as orderService from '../services/order.service';

/**
 * Création d'une vraie commande client avec recalcul strict des prix par le serveur
 * POST /api/orders
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validation du schéma Zod
    const validationResult = createOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Données de commande invalides',
        details: validationResult.error.flatten(),
      });
      return;
    }

    // 2. Appel du service avec recalcul strict des prix depuis PostgreSQL / Prisma
    const order = await orderService.createOrder(validationResult.data as any);

    // 3. Diffusion temps réel Socket.IO (Admin, Cuisine & Client)
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('order:created', order);
      io.emit('new_order', order);
      io.to('kitchen').emit('order:created', order);
      io.to('kitchen').emit('kitchen_new_order', order);
      io.to('admin').emit('order:created', order);
      io.to(`order_${order.id}`).emit('order:created', order);
    }

    res.status(201).json({
      message: 'Commande enregistrée avec succès en base de données',
      order,
    });
  } catch (err: any) {
    console.error('Erreur createOrder :', err);
    res.status(400).json({
      error: err.message || 'Impossible d’enregistrer la commande en base de données',
    });
  }
};

/**
 * Récupération de toutes les commandes pour l'espace d'administration
 * GET /api/orders
 */
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const orders = await orderService.getAllOrders(status as string);
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes', details: err.message });
  }
};

/**
 * Suivi d'une commande par son identifiant
 * GET /api/orders/:id
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      res.status(404).json({ error: 'Commande introuvable' });
      return;
    }

    res.json({ order });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

/**
 * Espace Cuisine Dédié : Récupère les commandes opérationnelles
 * RÈGLE STRICTE : AUCUNE DONNÉE FINANCIÈRE (zéro prix, zéro montant retourné)
 * GET /api/orders/kitchen
 */
export const getKitchenOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await orderService.getKitchenOrders();
    res.json({ orders });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes cuisine' });
  }
};

/**
 * Mise à jour de statut avec enregistrement des horodatages et création de la vente si SERVED
 * PATCH /api/orders/:id/status
 */
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

    const { status, note } = validation.data;
    const { order, saleCreated } = await orderService.updateOrderStatus(id, status, note);

    // Diffusion temps réel Socket.IO (Cuisine, Salle, Client, Admin & Ventes)
    const io = (req.app as any).get('io');
    if (io) {
      io.emit('order:updated', order);
      io.emit('order_status_updated', order);
      io.to('kitchen').emit('order:updated', order);
      io.to('admin').emit('order:updated', order);
      io.to(`order_${id}`).emit('order:updated', order);
      io.to(`order_${id}`).emit('order_status_updated', order);

      if (status === 'READY') {
        io.to(`order_${id}`).emit('order_ready', {
          orderId: id,
          orderNumber: order.orderNumber || `#TF-${id}`,
          message: 'Votre commande est prête 🎉',
        });
      }

      // Si une vente a été finalisée lors du passage à SERVED, notifier l'Admin et le Dashboard en direct
      if (saleCreated) {
        io.emit('sale:created', saleCreated);
        io.to('admin').emit('sale:created', saleCreated);
      }
    }

    res.json({
      message: `Statut de la commande #${id} mis à jour vers ${status}`,
      order,
      sale: saleCreated || null,
    });
  } catch (err: any) {
    console.error('Erreur updateOrderStatus :', err);
    res.status(400).json({ error: err.message || 'Erreur lors de la mise à jour du statut' });
  }
};
