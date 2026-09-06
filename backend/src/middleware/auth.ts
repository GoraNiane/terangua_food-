import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'STAFF' | 'KITCHEN';
    name?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Accès refusé : token manquant' });
    return;
  }

  try {
    const verified = jwt.verify(token, config.jwtSecret) as any;
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Session expirée ou token invalide' });
  }
};

export const requireRole = (roles: Array<'ADMIN' | 'STAFF' | 'KITCHEN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Permissions insuffisantes pour cette opération' });
      return;
    }
    next();
  };
};
