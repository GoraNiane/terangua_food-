import { Request, Response } from 'express';
import { prisma } from '../config';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0';

    res.json({
      reviews,
      averageRating: Number(averageRating),
      totalReviews: reviews.length,
      satisfactionRate: 96,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des avis', details: err.message });
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, customerName, rating, comment } = req.body;

    const review = await prisma.review.create({
      data: {
        orderId: orderId || '1042',
        customerName: customerName || 'Client Teranga',
        rating: Number(rating) || 5,
        comment: comment || 'Expérience excellente !',
      },
    });

    res.status(201).json({ review });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de l’envoi de l’avis', details: err.message });
  }
};

export const replyToReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { reply },
    });

    res.json({ review });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la réponse à l’avis', details: err.message });
  }
};
