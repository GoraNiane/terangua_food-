import { Request, Response } from 'express';
import * as statsService from '../services/statistics.service';

/**
 * Récupération des KPI et statistiques dynamiques
 * GET /api/statistics
 * Accessible uniquement aux administrateurs (403 pour KITCHEN)
 */
export const getStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'today', startDate, endDate } = req.query;

    const data = await statsService.getOperationalAndFinancialStatistics({
      period: String(period),
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      success: true,
      period,
      ...data,
    });
  } catch (err: any) {
    console.error('Erreur getStatistics :', err);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques', details: err.message });
  }
};
