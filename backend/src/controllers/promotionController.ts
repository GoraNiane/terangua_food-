import { Request, Response } from 'express';
import { prisma } from '../config';

export const getPromotions = async (req: Request, res: Response): Promise<void> => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ promotions });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des promotions', details: err.message });
  }
};

export const createPromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, discountPercent, targetProductId, startTime, endTime } = req.body;
    const promo = await prisma.promotion.create({
      data: {
        title,
        description,
        discountPercent: Number(discountPercent) || 20,
        targetProductId: targetProductId || null,
        startTime: startTime || null,
        endTime: endTime || null,
        isActive: true,
      },
    });
    res.status(201).json({ promotion: promo });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la création de la promotion', details: err.message });
  }
};

export const updatePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const promo = await prisma.promotion.update({
      where: { id },
      data,
    });
    res.json({ promotion: promo });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la promotion', details: err.message });
  }
};

export const deletePromotion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.promotion.delete({ where: { id } });
    res.json({ message: 'Promotion supprimée avec succès' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la promotion', details: err.message });
  }
};
