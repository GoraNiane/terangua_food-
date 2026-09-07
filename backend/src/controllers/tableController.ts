import { Request, Response } from 'express';
import { prisma, config } from '../config';
import { AuthRequest } from '../middleware/auth';

export const getTables = async (req: Request, res: Response): Promise<void> => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
    });
    res.json({ tables });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tables', details: err.message });
  }
};

export const createTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { number, capacity, area, status } = req.body;
    const formattedNumber = String(number).padStart(2, '0');

    const table = await (prisma as any).table.create({
      data: {
        number: formattedNumber,
        capacity: Number(capacity) || 4,
        area: area || 'Salle Principale',
        status: status || 'FREE',
        qrCodeUrl: `${config.clientUrl}/menu?table=${formattedNumber}`,
      },
    });
    res.status(201).json({ table });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la création de la table', details: err.message });
  }
};

export const deleteTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.table.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Table supprimée avec succès' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la table', details: err.message });
  }
};

export const updateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const table = await prisma.table.update({
      where: { id },
      data,
    });
    res.json({ table });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la table', details: err.message });
  }
};

export const updateTableStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['FREE', 'OCCUPIED', 'RESERVED'].includes(status)) {
      res.status(400).json({
        error: 'Statut de table invalide (valeurs autorisées : FREE, OCCUPIED, RESERVED)',
      });
      return;
    }

    const table = await prisma.table.update({
      where: { id },
      data: { status },
    });

    const io = (req.app as any).get('io');
    if (io) {
      io.to('admin').emit('table_status_updated', table);
      io.to('kitchen').emit('table_status_updated', table);
    }

    res.json({ table });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut de la table', details: err.message });
  }
};

export const getQRCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
    });

    const qrCodes = tables.map(t => ({
      tableNumber: t.number,
      url: `${config.clientUrl}/menu?table=${t.number}`,
      capacity: t.capacity,
      status: t.status,
    }));

    res.json({ qrcodes: qrCodes });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des QR codes', details: err.message });
  }
};
