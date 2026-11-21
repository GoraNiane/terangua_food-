import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  declarePaymentSchema,
  approvePaymentSchema,
  rejectPaymentSchema,
} from '../validations/orderValidation';
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
      const isReadyForKitchen = order.status === 'CONFIRMED';
      const kitchenOrder = isReadyForKitchen ? orderService.sanitizeOrderForKitchen(order) : null;

      // Toujours diffuser à l'Admin
      io.to('admin').emit('order:created', order);
      io.to('admin').emit('new_order', order);

      // Diffuser au client pour suivi
      io.to(`order_${order.id}`).emit('order:created', order);
      const cleanId = String(order.id).replace(/^[#\s]*TF-/i, '').trim();
      if (cleanId && cleanId !== order.id) {
        io.to(`order_${cleanId}`).emit('order:created', order);
      }

      // RÈGLE ABSOLUE : Transmettre à la cuisine UNIQUEMENT si la commande est CONFIRMED
      if (isReadyForKitchen && kitchenOrder) {
        io.to('kitchen').emit('order:created', kitchenOrder);
        io.to('kitchen').emit('kitchen_new_order', kitchenOrder);
      }
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
    const { status, limit, offset } = req.query;
    const orders = await orderService.getAllOrders(
      status as string,
      limit ? Number(limit) : 150,
      offset ? Number(offset) : 0
    );
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
      const kitchenOrder = orderService.sanitizeOrderForKitchen(order);
      io.to('kitchen').emit('order:updated', kitchenOrder);
      io.to('kitchen').emit('order_status_updated', kitchenOrder);
      io.to('admin').emit('order:updated', order);
      io.to('admin').emit('order_status_updated', order);
      
      const cleanId = String(order.id).replace(/^[#\s]*TF-/i, '').trim();
      const targetRooms = new Set([`order_${order.id}`, `order_${id}`]);
      if (cleanId) targetRooms.add(`order_${cleanId}`);

      targetRooms.forEach(room => {
        io.to(room).emit('order:updated', order);
        io.to(room).emit('order_status_updated', order);
      });

      if (status === 'READY') {
        const orderNum = (order as any)?.orderNumber || (order.id ? `#TF-${order.id}` : `#TF-${id}`);
        const readyPayload = {
          orderId: order.id || id,
          orderNumber: orderNum,
          message: 'Votre commande est prête 🎉',
        };
        targetRooms.forEach(room => {
          io.to(room).emit('order_ready', readyPayload);
        });
      }

      // Si une vente a été finalisée lors du passage à SERVED, notifier uniquement l'Admin et le Dashboard
      if (saleCreated) {
        io.to('admin').emit('sale:created', saleCreated);
      }
    }

    const displayNum = (order as any)?.orderNumber || (order.id ? `#TF-${order.id}` : `#TF-${id}`);
    res.json({
      message: `Statut de la commande ${displayNum} mis à jour vers ${status}`,
      order,
      sale: saleCreated || null,
    });
  } catch (err: any) {
    console.error('Erreur updateOrderStatus :', err);
    res.status(400).json({ error: err.message || 'Erreur lors de la mise à jour du statut' });
  }
};

/**
 * Déclaration de paiement par le client (Wave / OM)
 * RÈGLE ABSOLUE : Cette déclaration NE TRANSMET JAMAIS la commande à la cuisine.
 * POST /api/orders/:id/declare-payment
 */
export const declarePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validation = declarePaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Données de paiement invalides',
        details: validation.error.flatten(),
      });
      return;
    }

    const { method, transactionRef, customerNote } = validation.data;
    const updatedOrder = await orderService.declarePayment(id, {
      method,
      transactionRef,
      customerNote,
    });

    // Diffusion temps réel Socket.IO : UNIQUEMENT Admin et Client (PAS LA CUISINE)
    const io = (req.app as any).get('io');
    if (io) {
      const payload = {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        method,
        transactionRef,
        amount: updatedOrder.total,
        declaredAt: new Date().toISOString(),
      };

      io.to('admin').emit('payment:declared', payload);
      io.to('admin').emit('order:updated', updatedOrder);

      const targetRooms = new Set([`order_${updatedOrder.id}`, `order_${id}`]);
      const cleanId = String(updatedOrder.id).replace(/^[#\s]*TF-/i, '').trim();
      if (cleanId) targetRooms.add(`order_${cleanId}`);

      targetRooms.forEach(room => {
        io.to(room).emit('payment:declared', payload);
        io.to(room).emit('order:updated', updatedOrder);
      });
    }

    res.json({
      message:
        'Votre paiement a été signalé. Votre commande sera transmise à la cuisine après vérification et validation par le restaurant.',
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Erreur declarePayment :', err);
    res.status(400).json({
      error: err.message || 'Erreur lors de la déclaration du paiement',
    });
  }
};

/**
 * Approbation du paiement par le gérant ou un personnel autorisé (ADMIN / STAFF)
 * RÈGLE ABSOLUE : Transmet la commande à la cuisine MAINTENANT ET SEULEMENT MAINTENANT.
 * POST /api/orders/:id/approve-payment
 */
export const approvePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const verifierUserId = req.user?.id;

    if (!verifierUserId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const validation = approvePaymentSchema.safeParse(req.body);
    const note = validation.success ? validation.data.note : undefined;

    const { order, newlyApproved } = await orderService.approvePayment(id, verifierUserId, note);

    // Diffusion temps réel Socket.IO
    const io = (req.app as any).get('io');
    if (io) {
      const kitchenOrder = orderService.sanitizeOrderForKitchen(order);

      // 1. Transmission à la cuisine UNIQUEMENT si nouvellement approuvé
      if (newlyApproved) {
        io.to('kitchen').emit('kitchen_new_order', kitchenOrder);
        io.to('kitchen').emit('order:created', kitchenOrder);
      }
      io.to('kitchen').emit('order:updated', kitchenOrder);

      // 2. Notification Admin
      io.to('admin').emit('payment:approved', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        verifiedBy: verifierUserId,
      });
      io.to('admin').emit('order:updated', order);

      // 3. Notification Client
      const clientPayload = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: 'Votre paiement a été approuvé. Votre commande est maintenant en préparation.',
      };

      const targetRooms = new Set([`order_${order.id}`, `order_${id}`]);
      const cleanId = String(order.id).replace(/^[#\s]*TF-/i, '').trim();
      if (cleanId) targetRooms.add(`order_${cleanId}`);

      targetRooms.forEach(room => {
        io.to(room).emit('payment:approved', clientPayload);
        io.to(room).emit('order:updated', order);
      });
    }

    res.json({
      message: 'Paiement approuvé avec succès. Commande transmise à la cuisine.',
      order,
    });
  } catch (err: any) {
    console.error('Erreur approvePayment :', err);
    res.status(400).json({
      error: err.message || 'Erreur lors de l’approbation du paiement',
    });
  }
};

/**
 * Rejet du paiement par le gérant (ADMIN / STAFF) avec motif obligatoire
 * RÈGLE ABSOLUE : La commande n'est JAMAIS transmise à la cuisine et est annulée.
 * POST /api/orders/:id/reject-payment
 */
export const rejectPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const verifierUserId = req.user?.id;

    if (!verifierUserId) {
      res.status(401).json({ error: 'Utilisateur non authentifié' });
      return;
    }

    const validation = rejectPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Le motif de rejet est obligatoire (au moins 3 caractères)',
        details: validation.error.flatten(),
      });
      return;
    }

    const { reason } = validation.data;
    const updatedOrder = await orderService.rejectPayment(id, verifierUserId, reason);

    // Diffusion temps réel Socket.IO : Admin et Client UNIQUEMENT (JAMAIS la cuisine)
    const io = (req.app as any).get('io');
    if (io) {
      const payload = {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        reason,
        message: `Paiement rejeté : ${reason}`,
      };

      io.to('admin').emit('payment:rejected', payload);
      io.to('admin').emit('order:updated', updatedOrder);

      const targetRooms = new Set([`order_${updatedOrder.id}`, `order_${id}`]);
      const cleanId = String(updatedOrder.id).replace(/^[#\s]*TF-/i, '').trim();
      if (cleanId) targetRooms.add(`order_${cleanId}`);

      targetRooms.forEach(room => {
        io.to(room).emit('payment:rejected', payload);
        io.to(room).emit('order:updated', updatedOrder);
      });
    }

    res.json({
      message: 'Paiement rejeté et commande annulée.',
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error('Erreur rejectPayment :', err);
    res.status(400).json({
      error: err.message || 'Erreur lors du rejet du paiement',
    });
  }
};

/**
 * Rétro-compatibilité : Confirmation / déclaration de paiement client (Wave / OM)
 * POST /api/orders/:id/payment-confirm
 */
export const confirmOrderPayment = async (req: Request, res: Response): Promise<void> => {
  return declarePayment(req, res);
};

