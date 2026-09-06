import { Request, Response } from 'express';
import { prisma } from '../config';

// 7 jours par défaut avec la gastronomie traditionnelle sénégalaise
export const DEFAULT_WEEKLY_SCHEDULE = [
  {
    dayOfWeek: 1,
    dayName: 'Lundi',
    themeTitle: 'Lundi Douceur — Yassa Poulet Rôti & Oignons Caramélisés',
    description: 'Poulet fermier mariné au citron vert, oignons confits au feu doux, piment doux et riz blanc parfumé.',
    specialPrice: 4500,
    specialNote: '1 verre de Bissap artisanal glacé offert avec le plat du jour !',
    productIds: ['prod_2', 'prod_4'], // Yassa Poulet + Bissap
    isActive: true,
  },
  {
    dayOfWeek: 2,
    dayName: 'Mardi',
    themeTitle: 'Mardi Généreux — Mafé au Bœuf Tendre & Légumes Mijotés',
    description: 'Bœuf mijoté fondant dans une onctueuse sauce pâte d’arachide parfumée, carottes et patates douces.',
    specialPrice: 4800,
    specialNote: 'Sauce piment maison offerte sur demande.',
    productIds: ['prod_3', 'prod_6'], // Mafé + Boisson
    isActive: true,
  },
  {
    dayOfWeek: 3,
    dayName: 'Mercredi',
    themeTitle: 'Mercredi Braisé — Dibi d’Agneau au Feu de Bois & Alloco',
    description: 'Morceaux d’agneau grillés aux braises de bois rouge, moutarde de Dijon, oignons marinés et bananes plantains.',
    specialPrice: 6500,
    specialNote: 'Assiette XL accompagnée d’alloco doré croustillant.',
    productIds: ['prod_5', 'prod_4'], // Dibi + Bissap
    isActive: true,
  },
  {
    dayOfWeek: 4,
    dayName: 'Jeudi',
    themeTitle: 'Jeudi Océanique — Soupou Kandja Royal Fruits de Mer',
    description: 'Ragoût traditionnel aux gombos frais, huile de palme rouge, crevettes géantes, crabe et poisson fumé.',
    specialPrice: 5800,
    specialNote: 'Cuisiné avec la pêche du jour du port de Soumbédioune.',
    productIds: ['prod_3', 'prod_6'],
    isActive: true,
  },
  {
    dayOfWeek: 5,
    dayName: 'Vendredi',
    themeTitle: 'Vendredi Royal — Grand Thiéboudienne Rouge Pêcheur de Saint-Louis',
    description: 'Le chef-d’œuvre national : Mérou blanc frais piqué au rof, riz rouge mijoté aux sucs, chou, manioc et nététou.',
    specialPrice: 5000,
    specialNote: 'Recette ancestrale de Saint-Louis. Servi traditionnellement le vendredi midi et soir.',
    productIds: ['prod_1', 'prod_4'], // Thieboudienne + Bissap
    isActive: true,
  },
  {
    dayOfWeek: 6,
    dayName: 'Samedi',
    themeTitle: 'Samedi Saveurs — Thiéboudienne Blanc aux Herbes & Pastels Dorés',
    description: 'Thiéboudienne blanc parfumé aux herbes fraîches et beugouth, avec une portion de pastels thon croustillants.',
    specialPrice: 5200,
    specialNote: 'Comprend 4 pastels faits maison et sauce tomate relevée.',
    productIds: ['prod_1', 'prod_7'],
    isActive: true,
  },
  {
    dayOfWeek: 0,
    dayName: 'Dimanche',
    themeTitle: 'Dimanche Festif & Famille — Caldou au Bar Frais & Sauce Bissap Blanc',
    description: 'Poisson bar poché dans un bouillon léger au citron, légumes fondants et sauce beugouth.',
    specialPrice: 5500,
    specialNote: 'Menu dominical convivial préparé pour régaler toute la famille.',
    productIds: ['prod_1', 'prod_4'],
    isActive: true,
  },
];

/**
 * Récupère le semainier complet (7 jours) avec les produits peuplés
 */
export const getWeeklySchedule = async (req: Request, res: Response) => {
  try {
    // Vérifier si la table contient déjà la programmation
    let schedules: any[] = [];
    try {
      schedules = await (prisma as any).dailyMenuSchedule.findMany({
        orderBy: { dayOfWeek: 'asc' },
      });
    } catch {
      // Si la table n'est pas encore initialisée en BDD, fallback propre
    }

    if (!schedules || schedules.length === 0) {
      // Initialiser avec les valeurs par défaut
      try {
        for (const item of DEFAULT_WEEKLY_SCHEDULE) {
          await (prisma as any).dailyMenuSchedule.upsert({
            where: { dayOfWeek: item.dayOfWeek },
            update: {},
            create: {
              ...item,
              productIds: JSON.stringify(item.productIds),
            },
          });
        }
        schedules = await (prisma as any).dailyMenuSchedule.findMany({
          orderBy: { dayOfWeek: 'asc' },
        });
      } catch {
        // En cas d'indisponibilité BDD, renvoyer les données par défaut en mémoire
        schedules = DEFAULT_WEEKLY_SCHEDULE.map(s => ({
          ...s,
          id: `sched_${s.dayOfWeek}`,
          productIds: JSON.stringify(s.productIds),
        }));
      }
    }

    // Récupérer tous les produits pour peupler les listes
    let allProducts: any[] = [];
    try {
      allProducts = await prisma.product.findMany({
        where: { isAvailable: true },
        include: {
          category: true,
          options: { include: { values: true } },
        },
      });
    } catch {}

    const productMap = new Map(allProducts.map(p => [p.id, p]));

    const populatedSchedules = schedules.map(item => {
      let parsedIds: string[] = [];
      try {
        parsedIds = typeof item.productIds === 'string' ? JSON.parse(item.productIds) : item.productIds || [];
      } catch {
        parsedIds = [];
      }

      const products = parsedIds.map(id => productMap.get(id)).filter(Boolean);

      return {
        ...item,
        productIds: parsedIds,
        products,
      };
    });

    res.json({
      success: true,
      data: populatedSchedules,
      currentDayOfWeek: new Date().getDay(),
    });
  } catch (error: any) {
    console.error('Erreur getWeeklySchedule :', error);
    res.status(500).json({ error: 'Impossible de charger le semainier', details: error.message });
  }
};

/**
 * Récupère le menu actif d'aujourd'hui
 */
export const getTodayMenu = async (req: Request, res: Response) => {
  try {
    const todayIndex = new Date().getDay(); // 0 = Dimanche, 1 = Lundi...

    let schedule: any = null;
    try {
      schedule = await (prisma as any).dailyMenuSchedule.findUnique({
        where: { dayOfWeek: todayIndex },
      });
    } catch {}

    if (!schedule) {
      schedule = DEFAULT_WEEKLY_SCHEDULE.find(s => s.dayOfWeek === todayIndex) || DEFAULT_WEEKLY_SCHEDULE[0];
    }

    let parsedIds: string[] = [];
    try {
      parsedIds = typeof schedule.productIds === 'string' ? JSON.parse(schedule.productIds) : schedule.productIds || [];
    } catch {
      parsedIds = [];
    }

    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: { id: { in: parsedIds } },
        include: {
          category: true,
          options: { include: { values: true } },
        },
      });
    } catch {}

    res.json({
      success: true,
      dayOfWeek: todayIndex,
      data: {
        ...schedule,
        productIds: parsedIds,
        products,
      },
    });
  } catch (error: any) {
    console.error('Erreur getTodayMenu :', error);
    res.status(500).json({ error: 'Impossible de charger le menu du jour' });
  }
};

/**
 * Met à jour la programmation d'un jour précis (0 à 6)
 */
export const updateDaySchedule = async (req: Request, res: Response) => {
  try {
    const dayOfWeek = parseInt(req.params.dayOfWeek, 10);
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Jour de la semaine invalide (doit être compris entre 0 et 6).' });
    }

    const { themeTitle, description, specialPrice, specialNote, productIds, isActive } = req.body;

    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = dayNames[dayOfWeek];

    const stringifiedProductIds = Array.isArray(productIds) ? JSON.stringify(productIds) : JSON.stringify([]);

    const updated = await (prisma as any).dailyMenuSchedule.upsert({
      where: { dayOfWeek },
      update: {
        themeTitle: themeTitle !== undefined ? themeTitle : undefined,
        description: description !== undefined ? description : undefined,
        specialPrice: specialPrice !== undefined ? (specialPrice ? Number(specialPrice) : null) : undefined,
        specialNote: specialNote !== undefined ? specialNote : undefined,
        productIds: stringifiedProductIds,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      create: {
        dayOfWeek,
        dayName,
        themeTitle: themeTitle || `Spécial ${dayName}`,
        description: description || '',
        specialPrice: specialPrice ? Number(specialPrice) : null,
        specialNote: specialNote || '',
        productIds: stringifiedProductIds,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    // Émettre notification Socket.IO temps réel
    const io = req.app.get('io');
    if (io) {
      io.emit('daily_menu_updated', {
        dayOfWeek,
        updated,
      });
    }

    res.json({
      success: true,
      message: `Programmation du ${dayName} mise à jour avec succès.`,
      data: {
        ...updated,
        productIds: Array.isArray(productIds) ? productIds : [],
      },
    });
  } catch (error: any) {
    console.error('Erreur updateDaySchedule :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du semainier', details: error.message });
  }
};

/**
 * Mise à jour instantanée du menu d'aujourd'hui
 */
export const updateTodayMenu = async (req: Request, res: Response) => {
  req.params.dayOfWeek = String(new Date().getDay());
  return updateDaySchedule(req, res);
};
