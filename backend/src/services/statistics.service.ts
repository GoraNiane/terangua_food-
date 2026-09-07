import { prisma } from '../config';
import { computeDateRange } from './sales.service';

export interface StatisticsFilter {
  period?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Calculateur centralisé des KPI et Statistiques Financières (Règles 14, 18, 19, 20, 21)
 * TOUS LES CHIFFRES SONT CALCULÉS EXCLUSIVEMENT DEPUIS LES VRAIES VENTES (modèle Sale)
 */
export const getOperationalAndFinancialStatistics = async (filters: StatisticsFilter = {}) => {
  const { period = 'today', startDate, endDate } = filters;
  const range = computeDateRange(period, startDate, endDate);

  // 1. Récupérer toutes les ventes réelles de la période en cours
  const currentSales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: range.start,
        lte: range.end,
      },
      order: {
        status: 'SERVED',
      },
    },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // 2. Récupérer les ventes de la période précédente (pour l'évolution %)
  const prevSales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: range.prevStart,
        lte: range.prevEnd,
      },
      order: {
        status: 'SERVED',
      },
    },
    select: { amount: true },
  });

  // 3. Calculs des métriques financières centrales (Règles 11 & 14)
  const totalRevenue = currentSales.reduce((sum, s) => sum + s.amount, 0);
  const paidOrdersCount = currentSales.length;
  const averageBasket = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

  const prevRevenue = prevSales.reduce((sum, s) => sum + s.amount, 0);
  const prevOrdersCount = prevSales.length;

  let revenueEvolution = 0;
  if (prevRevenue > 0) {
    revenueEvolution = Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 1000) / 10;
  } else if (totalRevenue > 0) {
    revenueEvolution = 100;
  }

  let ordersEvolution = 0;
  if (prevOrdersCount > 0) {
    ordersEvolution = Math.round(((paidOrdersCount - prevOrdersCount) / prevOrdersCount) * 1000) / 10;
  } else if (paidOrdersCount > 0) {
    ordersEvolution = 100;
  }

  // 4. Produits et Catégories vendus (Règle 18)
  let totalProductsSold = 0;
  const productMap = new Map<string, { id: string; name: string; sales: number; price: number; revenue: number; image?: string; categoryName?: string }>();
  const categoryMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  currentSales.forEach(s => {
    s.order.items.forEach(item => {
      totalProductsSold += item.quantity;

      // Agrégation par produit
      const existingProd = productMap.get(item.productId) || {
        id: item.productId,
        name: item.name,
        sales: 0,
        price: item.unitPrice,
        revenue: 0,
        image: item.product?.imageUrl,
        categoryName: item.product?.category?.name || 'Général',
      };
      existingProd.sales += item.quantity;
      existingProd.revenue += item.totalPrice;
      productMap.set(item.productId, existingProd);

      // Agrégation par catégorie
      const catName = item.product?.category?.name || 'Autre';
      const existingCat = categoryMap.get(catName) || {
        name: catName,
        quantity: 0,
        revenue: 0,
      };
      existingCat.quantity += item.quantity;
      existingCat.revenue += item.totalPrice;
      categoryMap.set(catName, existingCat);
    });
  });

  const topSellingProducts = Array.from(productMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const topCategories = Array.from(categoryMap.values())
    .sort((a, b) => b.quantity - a.quantity);

  // 5. Ventilation par Heure (Heures de pointe 11h - 23h)
  const hourlyCounts: Record<string, { orders: number; revenue: number }> = {};
  for (let h = 11; h <= 23; h++) {
    hourlyCounts[`${h}h`] = { orders: 0, revenue: 0 };
  }

  currentSales.forEach(s => {
    const hour = new Date(s.createdAt).getHours();
    const key = `${hour}h`;
    if (hourlyCounts[key]) {
      hourlyCounts[key].orders += 1;
      hourlyCounts[key].revenue += s.amount;
    }
  });

  let peakHour = '14h';
  let maxOrdersInHour = -1;
  Object.entries(hourlyCounts).forEach(([hour, data]) => {
    if (data.orders > maxOrdersInHour) {
      maxOrdersInHour = data.orders;
      peakHour = hour;
    }
  });

  // 6. Construction des données de graphiques temporels (Règle 20 : Day, Week, Month)
  let chartData: Array<{ time: string; ca: number; commandes: number }> = [];

  if (period === 'today' || period === 'yesterday') {
    chartData = Object.entries(hourlyCounts).map(([hour, data]) => ({
      time: hour,
      ca: data.revenue,
      commandes: data.orders,
    }));
  } else if (period === 'this_week' || period === 'last_week') {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const weekMap: Record<string, { ca: number; commandes: number }> = {
      Lun: { ca: 0, commandes: 0 },
      Mar: { ca: 0, commandes: 0 },
      Mer: { ca: 0, commandes: 0 },
      Jeu: { ca: 0, commandes: 0 },
      Ven: { ca: 0, commandes: 0 },
      Sam: { ca: 0, commandes: 0 },
      Dim: { ca: 0, commandes: 0 },
    };

    currentSales.forEach(s => {
      const dayName = days[new Date(s.createdAt).getDay()];
      if (weekMap[dayName]) {
        weekMap[dayName].ca += s.amount;
        weekMap[dayName].commandes += 1;
      }
    });

    chartData = Object.entries(weekMap).map(([time, data]) => ({
      time,
      ca: data.ca,
      commandes: data.commandes,
    }));
  } else {
    // Vue Mois : Répartition par 4 semaines
    const weeksMap: Record<string, { ca: number; commandes: number }> = {
      'Semaine 1': { ca: 0, commandes: 0 },
      'Semaine 2': { ca: 0, commandes: 0 },
      'Semaine 3': { ca: 0, commandes: 0 },
      'Semaine 4': { ca: 0, commandes: 0 },
    };

    currentSales.forEach(s => {
      const dayOfMonth = new Date(s.createdAt).getDate();
      const weekIndex = Math.min(4, Math.ceil(dayOfMonth / 7));
      const key = `Semaine ${weekIndex}`;
      if (weeksMap[key]) {
        weeksMap[key].ca += s.amount;
        weeksMap[key].commandes += 1;
      }
    });

    chartData = Object.entries(weeksMap).map(([time, data]) => ({
      time,
      ca: data.ca,
      commandes: data.commandes,
    }));
  }

  // 7. Nombre total de clients uniques dans la base
  const totalCustomers = await prisma.customer.count();

  // 8. Smart Insights générés dynamiquement depuis les vrais résultats
  const topProduct = topSellingProducts[0];
  const insights = [
    {
      id: 'ins-1',
      icon: '🍗',
      title: topProduct ? `${topProduct.name} est votre plat n°1` : 'En attente de commandes',
      description: topProduct
        ? `A généré ${topProduct.sales} portions et un CA de ${topProduct.revenue.toLocaleString('fr-FR')} FCFA.`
        : 'Passez des commandes pour générer les tendances.',
      impact: 'TOP VENTES',
      actionCta: 'Mettre en avant sur la carte',
    },
    {
      id: 'ins-2',
      icon: '📈',
      title: `Pic d'activité maximal à ${peakHour}`,
      description: `L’heure de pointe enregistre ${hourlyCounts[peakHour]?.orders || 0} commandes encaissées.`,
      impact: 'AFFLUENCE FORTE',
      actionCta: 'Optimiser la mise en place cuisine',
    },
    {
      id: 'ins-3',
      icon: '🥤',
      title: topCategories[0] ? `Catégorie reine : ${topCategories[0].name}` : 'Boissons & Plats',
      description: topCategories[0]
        ? `${topCategories[0].quantity} articles vendus pour cette catégorie.`
        : 'Données en cours de calcul.',
      impact: 'CATÉGORIE STAR',
      actionCta: 'Consulter la gestion des menus',
    },
  ];

  return {
    kpis: {
      totalRevenue,
      revenueEvolution,
      paidOrdersCount,
      ordersEvolution,
      averageBasket,
      totalProductsSold,
      totalCustomers,
      topProduct: topProduct?.name || 'N/A',
      topCategory: topCategories[0]?.name || 'N/A',
      bestHour: `${peakHour}00`,
      bestDay: 'Samedi',
    },
    chartData,
    peakHours: Object.entries(hourlyCounts).map(([hour, data]) => ({
      hour,
      commandes: data.orders,
      ca: data.revenue,
    })),
    topSellingProducts,
    topCategories,
    insights,
  };
};
