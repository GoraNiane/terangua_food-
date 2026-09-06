import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const authRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const key = `login_${ip}`;
  const now = Date.now();

  const record = loginAttempts.get(key);

  if (record) {
    if (record.blockedUntil) {
      if (record.blockedUntil > now) {
        const remainingMinutes = Math.ceil((record.blockedUntil - now) / (60 * 1000));
        res.status(429).json({
          error: `Trop de tentatives infructueuses. Veuillez patienter ${remainingMinutes} minute(s) avant de réessayer.`,
        });
        return;
      } else {
        // La période de blocage a expiré
        loginAttempts.delete(key);
      }
    } else if (now - record.firstAttemptTime > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }

  next();
};

export const recordFailedLogin = (req: Request): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const key = `login_${ip}`;
  const now = Date.now();

  const record = loginAttempts.get(key);

  if (!record) {
    loginAttempts.set(key, {
      count: 1,
      firstAttemptTime: now,
    });
  } else {
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION_MS;
    }
  }
};

export const resetLoginAttempts = (req: Request): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  loginAttempts.delete(`login_${ip}`);
};

