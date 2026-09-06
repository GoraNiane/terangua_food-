import { Request, Response } from 'express';
import { prisma } from '../config';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: String(search) } },
              { phone: { contains: String(search) } },
            ],
          }
        : undefined,
      include: {
        loyalty: true,
      },
      orderBy: { totalSpent: 'desc' },
    });

    res.json({ customers });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des clients', details: err.message });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        loyalty: {
          include: { transactions: true },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Client introuvable' });
      return;
    }

    // Récupérer l'historique des commandes de ce client
    const orders = await prisma.order.findMany({
      where: { customerPhone: customer.phone },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({ customer, orders });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};
