import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/auth';

export const getRestaurantSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.restaurantSettings.findFirst();

    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: {
          id: 'teranga-settings',
          name: 'TERANGA FOOD',
          slogan: 'Le goût du Sénégal, à chaque bouchée.',
          description: 'Restaurant moderne proposant des spécialités sénégalaises et une sélection de plats populaires revisités.',
          address: '14 Rue Victor Schoelcher, Dakar-Plateau',
          city: 'Dakar',
          phone: '+221 33 821 40 50',
          whatsappNumber: '221774888464',
          email: 'contact@terangafood.sn',
          logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
          coverUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
        },
      });
    }

    res.json({ restaurant: settings });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres', details: err.message });
  }
};

export const updateRestaurantSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    let settings = await prisma.restaurantSettings.findFirst();

    if (!settings) {
      settings = await prisma.restaurantSettings.create({ data });
    } else {
      settings = await prisma.restaurantSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    res.json({
      message: 'Paramètres du restaurant mis à jour avec succès',
      restaurant: settings,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres', details: err.message });
  }
};
