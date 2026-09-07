import { prisma } from '../config';

export interface DateRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
}

/**
 * Calculateur de plages de dates strict (fuseau Sénégal UTC/GMT)
 */
export const computeDateRange = (period: string, customStart?: string, customEnd?: string): DateRange => {
  const now = new Date();

  // Début et fin de la journée en cours
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  switch (period) {
    case 'yesterday': {
      const start = new Date(startOfToday.getTime() - 24 * 3600 * 1000);
      const end = new Date(endOfToday.getTime() - 24 * 3600 * 1000);
      const prevStart = new Date(start.getTime() - 24 * 3600 * 1000);
      const prevEnd = new Date(end.getTime() - 24 * 3600 * 1000);
      return { start, end, prevStart, prevEnd };
    }

    case 'this_week': {
      const day = startOfToday.getUTCDay();
      const diffToMonday = day === 0 ? -6 : 1 - day; // Lundi début de semaine
      const start = new Date(startOfToday.getTime() + diffToMonday * 24 * 3600 * 1000);
      const end = endOfToday;

      const prevStart = new Date(start.getTime() - 7 * 24 * 3600 * 1000);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, prevStart, prevEnd };
    }

    case 'last_week': {
      const day = startOfToday.getUTCDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const thisMonday = new Date(startOfToday.getTime() + diffToMonday * 24 * 3600 * 1000);
      const start = new Date(thisMonday.getTime() - 7 * 24 * 3600 * 1000);
      const end = new Date(thisMonday.getTime() - 1);

      const prevStart = new Date(start.getTime() - 7 * 24 * 3600 * 1000);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, prevStart, prevEnd };
    }

    case 'this_month': {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      const end = endOfToday;

      const prevStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0));
      const prevEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
      return { start, end, prevStart, prevEnd };
    }

    case 'last_month': {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));

      const prevStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1, 0, 0, 0, 0));
      const prevEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 0, 23, 59, 59, 999));
      return { start, end, prevStart, prevEnd };
    }

    case 'custom': {
      const start = customStart ? new Date(customStart) : startOfToday;
      start.setHours(0, 0, 0, 0);
      const end = customEnd ? new Date(customEnd) : endOfToday;
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
      const prevStart = new Date(start.getTime() - 24 * 3600 * 1000);
      const prevEnd = new Date(end.getTime() - 24 * 3600 * 1000);
      return { start, end, prevStart, prevEnd };
    }
  }
};

/**
 * Finalisation d'une vente idempotente (Règle Métier 12 & 13)
 * Empêche formellement tout double comptage grâce à orderId @unique
 */
export const finalizeOrderSale = async (
  orderId: string,
  amount?: number,
  dbClient: any = prisma
): Promise<{ sale: any; wasCreated: boolean }> => {
  // 1. Vérifier si la vente existe déjà pour cet orderId
  const existingSale = await dbClient.sale.findUnique({
    where: { orderId },
    include: { order: true },
  });

  if (existingSale) {
    return { sale: existingSale, wasCreated: false };
  }

  // 2. Vérifier que la commande existe et récupérer son montant officiel si non fourni
  let finalAmount = amount;
  if (finalAmount === undefined || finalAmount <= 0) {
    const order = await dbClient.order.findUnique({
      where: { id: orderId },
      select: { total: true },
    });
    if (!order) {
      throw new Error(`Impossible de finaliser la vente : commande ${orderId} introuvable`);
    }
    finalAmount = order.total;
  }

  // 3. Créer la ligne de vente atomique
  const newSale = await dbClient.sale.create({
    data: {
      orderId,
      amount: finalAmount,
      createdAt: new Date(),
    },
    include: { order: true },
  });

  return { sale: newSale, wasCreated: true };
};

export interface SalesQueryOptions {
  period?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  search?: string;
  limit?: number;
  page?: number;
}

/**
 * Récupération des ventes réelles depuis la base de données (Règle 22)
 */
export const getFinalizedSales = async (options: SalesQueryOptions = {}) => {
  const { period = 'today', startDate, endDate, search, limit = 100, page = 1 } = options;
  const range = computeDateRange(period, startDate, endDate);

  // 1. Récupérer toutes les ventes réelles sur la période
  const sales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: range.start,
        lte: range.end,
      },
      order: {
        status: 'SERVED',
        ...(search
          ? {
              OR: [
                { id: { contains: search } },
                { orderNumber: { contains: search } },
                { customerName: { contains: search } },
                { customerPhone: { contains: search } },
                { tableNumber: { contains: search } },
              ],
            }
          : {}),
      },
    },
    include: {
      order: {
        include: {
          items: true,
          statusHistory: { orderBy: { changedAt: 'asc' } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  // 2. Ventes de la période précédente pour comparaison
  const prevSales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: range.prevStart,
        lte: range.prevEnd,
      },
      order: { status: 'SERVED' },
    },
    select: { amount: true },
  });

  // 3. KPIs financiers réels calculés exclusivement depuis Sale
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const ordersCount = sales.length;
  const averageBasket = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

  const prevRevenue = prevSales.reduce((sum, s) => sum + s.amount, 0);
  let evolutionPercent = 0;
  if (prevRevenue > 0) {
    evolutionPercent = Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 1000) / 10;
  } else if (totalRevenue > 0) {
    evolutionPercent = 100;
  }

  let totalProductsSold = 0;
  const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  const hourlySalesMap = new Map<number, { orders: number; revenue: number }>();

  for (let h = 11; h <= 23; h++) {
    hourlySalesMap.set(h, { orders: 0, revenue: 0 });
  }

  sales.forEach(s => {
    const o = s.order;
    const hour = new Date(s.createdAt).getHours();
    const existingHour = hourlySalesMap.get(hour) || { orders: 0, revenue: 0 };
    hourlySalesMap.set(hour, {
      orders: existingHour.orders + 1,
      revenue: existingHour.revenue + s.amount,
    });

    o.items.forEach(item => {
      totalProductsSold += item.quantity;
      const current = productSalesMap.get(item.name) || {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += item.totalPrice;
      productSalesMap.set(item.name, current);
    });
  });

  const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.quantity - a.quantity);

  // Meilleure heure
  let bestHour = '14h00';
  let maxHourRev = -1;
  hourlySalesMap.forEach((data, h) => {
    if (data.revenue > maxHourRev) {
      maxHourRev = data.revenue;
      bestHour = `${h}h00`;
    }
  });

  // Liste formatée pour l'UI
  const formattedSalesList = sales.map(s => {
    const o = s.order;
    const dateObj = new Date(s.createdAt);
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yearStr = dateObj.getFullYear();
    const hourStr = String(dateObj.getHours()).padStart(2, '0');
    const minStr = String(dateObj.getMinutes()).padStart(2, '0');

    const itemsSummary = o.items.map(i => `${i.name} ×${i.quantity}`).join(' + ');

    return {
      id: s.id,
      orderId: o.id,
      orderNumber: o.orderNumber || `#TF-${o.id}`,
      date: `${dayStr}/${monthStr}/${yearStr}`,
      time: `${hourStr}:${minStr}`,
      timestamp: dateObj.toISOString(),
      tableNumber: o.tableNumber || (o.orderType === 'TAKEAWAY' ? 'À emporter' : 'Livraison'),
      orderType: o.orderType,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      itemsSummary,
      itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      items: o.items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        selectedOptionsText: i.selectedOptionsText,
      })),
      subtotal: o.subtotal,
      discount: o.discount,
      deliveryFee: o.deliveryFee,
      total: s.amount,
      status: o.status,
      statusHistory: o.statusHistory,
    };
  });

  return {
    kpis: {
      totalRevenue,
      ordersCount,
      averageBasket,
      totalProductsSold,
      topProduct: topProducts[0]?.name || 'N/A',
      bestHour,
      bestDay: 'Aujourd’hui',
      evolutionPercent,
    },
    sales: formattedSalesList,
    topProducts,
    totalCount: sales.length,
  };
};
