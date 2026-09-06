import { Request, Response } from 'express';
import { prisma } from '../config';

interface DateRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
}

const computeDateRange = (period: string, customStart?: string, customEnd?: string): DateRange => {
  const now = new Date();

  // Début et fin de la journée actuelle
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case 'yesterday': {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 1);
      const end = new Date(endOfToday);
      end.setDate(end.getDate() - 1);

      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 1);
      const prevEnd = new Date(end);
      prevEnd.setDate(prevEnd.getDate() - 1);

      return { start, end, prevStart, prevEnd };
    }

    case 'this_week': {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Lundi début de semaine
      const start = new Date(startOfToday);
      start.setDate(start.getDate() + diffToMonday);
      const end = new Date(endOfToday);

      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(start);
      prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

      return { start, end, prevStart, prevEnd };
    }

    case 'last_week': {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const thisMonday = new Date(startOfToday);
      thisMonday.setDate(thisMonday.getDate() + diffToMonday);

      const start = new Date(thisMonday);
      start.setDate(start.getDate() - 7);
      const end = new Date(thisMonday);
      end.setMilliseconds(end.getMilliseconds() - 1);

      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(start);
      prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);

      return { start, end, prevStart, prevEnd };
    }

    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const end = new Date(endOfToday);

      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      return { start, end, prevStart, prevEnd };
    }

    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      const prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0);
      const prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);

      return { start, end, prevStart, prevEnd };
    }

    case 'custom': {
      const start = customStart ? new Date(customStart) : new Date(startOfToday);
      start.setHours(0, 0, 0, 0);
      const end = customEnd ? new Date(customEnd) : new Date(endOfToday);
      end.setHours(23, 59, 59, 999);

      const diff = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - diff);
      const prevEnd = new Date(start.getTime() - 1);

      return { start, end, prevStart, prevEnd };
    }

    case 'today':
    default: {
      const start = startOfToday;
      const end = endOfToday;

      const prevStart = new Date(startOfToday);
      prevStart.setDate(prevStart.getDate() - 1);
      const prevEnd = new Date(endOfToday);
      prevEnd.setDate(prevEnd.getDate() - 1);

      return { start, end, prevStart, prevEnd };
    }
  }
};

export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'today', startDate, endDate, groupBy = 'day' } = req.query;

    const range = computeDateRange(String(period), startDate as string, endDate as string);

    // 1. Récupération des commandes finalisées (SERVED uniquement — CANCELLED exclu)
    const finalizedOrders = await prisma.order.findMany({
      where: {
        status: 'SERVED',
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Récupération de la période précédente pour le calcul d'évolution
    const prevOrders = await prisma.order.findMany({
      where: {
        status: 'SERVED',
        createdAt: {
          gte: range.prevStart,
          lte: range.prevEnd,
        },
      },
      select: { total: true },
    });

    // 3. Calculs des KPIs globaux
    const totalRevenue = finalizedOrders.reduce((sum, o) => sum + o.total, 0);
    const ordersCount = finalizedOrders.length;
    const averageBasket = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

    let totalProductsSold = 0;
    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    const hourlySalesMap = new Map<number, { orders: number; revenue: number }>();

    // Initialiser les heures de 11h à 23h
    for (let h = 11; h <= 23; h++) {
      hourlySalesMap.set(h, { orders: 0, revenue: 0 });
    }

    // Calcul des ventes et ventilations
    finalizedOrders.forEach(o => {
      const hour = new Date(o.createdAt).getHours();
      const existingHour = hourlySalesMap.get(hour) || { orders: 0, revenue: 0 };
      hourlySalesMap.set(hour, {
        orders: existingHour.orders + 1,
        revenue: existingHour.revenue + o.total,
      });

      o.items.forEach(item => {
        totalProductsSold += item.quantity;
        const currentProd = productSalesMap.get(item.name) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        currentProd.quantity += item.quantity;
        currentProd.revenue += item.totalPrice;
        productSalesMap.set(item.name, currentProd);
      });
    });

    // Produits les plus vendus (triés par quantité)
    const topProducts = Array.from(productSalesMap.values()).sort(
      (a, b) => b.quantity - a.quantity
    );

    // Évolution en pourcentage par rapport à la période précédente
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.total, 0);
    let evolutionPercent = 0;
    if (prevRevenue > 0) {
      evolutionPercent = Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 1000) / 10;
    } else if (totalRevenue > 0) {
      evolutionPercent = 100;
    }

    // Meilleure heure
    let bestHour = '14h00';
    let maxHourRev = -1;
    hourlySalesMap.forEach((data, h) => {
      if (data.revenue > maxHourRev) {
        maxHourRev = data.revenue;
        bestHour = `${h}h00`;
      }
    });

    // 4. Liste détaillée des ventes pour le tableau
    const salesList = finalizedOrders.map(o => {
      const dateObj = new Date(o.createdAt);
      const dayStr = String(dateObj.getDate()).padStart(2, '0');
      const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
      const yearStr = dateObj.getFullYear();
      const hourStr = String(dateObj.getHours()).padStart(2, '0');
      const minStr = String(dateObj.getMinutes()).padStart(2, '0');

      // Résumé des produits (ex: "Yassa Poulet ×2 + Bissap ×1")
      const itemsSummary = o.items
        .map(i => `${i.name} ×${i.quantity}`)
        .join(' + ');

      return {
        id: o.id,
        orderNumber: `#TF-${o.id}`,
        date: `${dayStr}/${monthStr}/${yearStr}`,
        time: `${hourStr}:${minStr}`,
        timestamp: dateObj.toISOString(),
        tableNumber: o.tableNumber || (o.orderType === 'TAKEAWAY' ? 'À emporter' : 'Livraison'),
        orderType: o.orderType,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        itemsSummary,
        itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
        items: o.items.map(i => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
          selectedOptionsText: i.selectedOptionsText,
        })),
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        total: o.total,
        status: o.status,
        statusHistory: o.statusHistory,
      };
    });

    // 5. Regroupement pour les graphiques et vues (JOUR, SEMAINE, MOIS)
    // Vue JOUR : ventilation horaire
    const chartHourly = Array.from(hourlySalesMap.entries()).map(([h, data]) => ({
      label: `${h}h`,
      orders: data.orders,
      revenue: data.revenue,
    }));

    // Regroupement par jour pour les vues SEMAINE et MOIS
    const dailyMap = new Map<string, { date: string; label: string; orders: number; revenue: number }>();
    finalizedOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

      const existing = dailyMap.get(key) || { date: key, label: dayLabel, orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += o.total;
      dailyMap.set(key, existing);
    });

    const chartDaily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Regroupements par blocs (Ex: 05 septembre 2026 : 47 commandes, CA 285 000 FCFA)
    const groupedBlocks = Array.from(dailyMap.entries())
      .map(([key, data]) => {
        const dateObj = new Date(key);
        const fullDateLabel = dateObj.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        return {
          key,
          label: fullDateLabel,
          ordersCount: data.orders,
          revenue: data.revenue,
          averageBasket: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
        };
      })
      .sort((a, b) => b.key.localeCompare(a.key));

    res.json({
      period,
      range: {
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      },
      kpis: {
        totalRevenue,
        ordersCount,
        averageBasket,
        totalProductsSold,
        topProduct: topProducts[0]?.name || 'Thiéboudienne',
        topCategory: 'Plats Sénégalais',
        bestHour,
        bestDay: groupedBlocks[0]?.label || 'Aujourd’hui',
        evolutionPercent,
      },
      topProducts: topProducts.slice(0, 10),
      sales: salesList,
      groupedBlocks,
      charts: {
        hourly: chartHourly,
        daily: chartDaily,
      },
    });
  } catch (err: any) {
    console.error('Erreur getSales :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des ventes', details: err.message });
  }
};
