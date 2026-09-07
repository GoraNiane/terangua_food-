import { Request, Response } from 'express';
import * as salesService from '../services/sales.service';

/**
 * Récupération des ventes réelles finalisées (statut SERVED uniquement)
 * GET /api/sales
 * Accessible uniquement aux rôles autorisés (ADMIN, STAFF — 403 pour KITCHEN)
 */
export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'today', startDate, endDate, groupBy = 'day', search, limit, page } = req.query;

    const result = await salesService.getFinalizedSales({
      period: String(period),
      startDate: startDate as string,
      endDate: endDate as string,
      groupBy: groupBy as any,
      search: search as string,
      limit: limit ? parseInt(String(limit), 10) : 100,
      page: page ? parseInt(String(page), 10) : 1,
    });

    res.json({
      success: true,
      period,
      kpis: result.kpis,
      sales: result.sales,
      topProducts: result.topProducts,
      totalCount: result.totalCount,
    });
  } catch (err: any) {
    console.error('Erreur getSales :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des ventes', details: err.message });
  }
};
