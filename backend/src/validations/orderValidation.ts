import { z } from 'zod';

export const orderItemOptionSchema = z.object({
  optionName: z.string().min(1),
  valueName: z.string().min(1),
  extraPrice: z.number().int().nonnegative().optional().default(0),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'L’identifiant du produit est requis'),
  name: z.string().optional(),
  quantity: z.number().int().positive('La quantité doit être supérieure à 0').default(1),
  selectedOptions: z.array(orderItemOptionSchema).optional(),
  selectedOptionsText: z.string().optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
});

export const createOrderSchema = z
  .object({
    customerName: z.string().min(2, 'Le nom du client est requis (min 2 caractères)').max(100),
    customerPhone: z
      .string()
      .min(8, 'Le numéro de téléphone doit comporter au moins 8 caractères')
      .max(20),
    orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']).default('DINE_IN'),
    tableNumber: z.string().optional().nullable(),
    deliveryAddress: z.string().max(255).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    subtotal: z.number().optional(),
    deliveryFee: z.number().optional(),
    total: z.number().optional(),
    items: z.array(orderItemSchema).min(1, 'La commande doit contenir au moins un article'),
  })
  .refine(
    data => {
      if (data.orderType === 'DINE_IN') {
        return !!data.tableNumber && data.tableNumber.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Le numéro de table est obligatoire pour une commande sur place',
      path: ['tableNumber'],
    }
  )
  .refine(
    data => {
      if (data.orderType === 'DELIVERY') {
        return !!data.deliveryAddress && data.deliveryAddress.trim().length > 0;
      }
      return true;
    },
    {
      message: 'L’adresse de livraison est obligatoire pour une commande en livraison',
      path: ['deliveryAddress'],
    }
  );

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']),
  note: z.string().max(300).optional().nullable(),
});
