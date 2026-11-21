import { Request, Response, NextFunction } from 'express';

interface AttemptRecord {
  count: number;
  firstAttemptTime: number;
  blockedUntil?: number;
}

// Maps distincts pour chaque type de limite
const loginAttempts = new Map<string, AttemptRecord>();
const generalApiRequests = new Map<string, { count: number; windowStart: number }>();
const orderAttempts = new Map<string, { count: number; windowStart: number }>();

// Nettoyage régulier des entrées obsolètes (anti-fuite mémoire)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts.entries()) {
    if (record.blockedUntil && record.blockedUntil < now) loginAttempts.delete(key);
    else if (now - record.firstAttemptTime > 30 * 60 * 1000) loginAttempts.delete(key);
  }
  for (const [key, record] of generalApiRequests.entries()) {
    if (now - record.windowStart > 2 * 60 * 1000) generalApiRequests.delete(key);
  }
  for (const [key, record] of orderAttempts.entries()) {
    if (now - record.windowStart > 10 * 60 * 1000) orderAttempts.delete(key);
  }
}, 60_000).unref();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Limiteur d'authentification : protège contre les attaques par force brute (mot de passe)
 */
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const authRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = getClientIp(req);
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
        loginAttempts.delete(key);
      }
    } else if (now - record.firstAttemptTime > LOGIN_WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }

  next();
};

export const recordFailedLogin = (req: Request): void => {
  const ip = getClientIp(req);
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
    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      record.blockedUntil = now + LOGIN_BLOCK_DURATION_MS;
    }
  }
};

export const resetLoginAttempts = (req: Request): void => {
  const ip = getClientIp(req);
  loginAttempts.delete(`login_${ip}`);
};

/**
 * Limiteur global d'API : protège l'application et la base contre les attaques DoS / Scraping
 * Autorise jusqu'à 300 requêtes toutes les 2 minutes par IP (très confortable pour un client normal)
 */
export const apiRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = getClientIp(req);
  const now = Date.now();
  const WINDOW_MS = 2 * 60 * 1000; // 2 minutes
  const MAX_REQUESTS = 300;

  let record = generalApiRequests.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { count: 1, windowStart: now };
    generalApiRequests.set(ip, record);
    return next();
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS) {
    res.status(429).json({
      error: 'Trop de requêtes détectées depuis votre réseau. Veuillez ralentir.',
      retryAfter: Math.ceil((record.windowStart + WINDOW_MS - now) / 1000),
    });
    return;
  }

  next();
};

/**
 * Limiteur de création de commande : protège la cuisine et la base contre le spam de faux paniers
 * Autorise jusqu'à 25 commandes par tranche de 10 minutes par IP
 */
export const orderRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = getClientIp(req);
  const now = Date.now();
  const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  const MAX_ORDERS = 25;

  let record = orderAttempts.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { count: 1, windowStart: now };
    orderAttempts.set(ip, record);
    return next();
  }

  record.count += 1;
  if (record.count > MAX_ORDERS) {
    res.status(429).json({
      error: 'Limite de commandes atteinte pour ce réseau. Veuillez patienter quelques minutes.',
    });
    return;
  }

  next();
};
