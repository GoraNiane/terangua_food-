import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { config } from './config';
import apiRoutes from './routes/api';

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.set('io', io);

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Realtime Rooms
io.on('connection', socket => {
  // Join kitchen / admin room
  socket.on('join_kitchen', (data?: { token?: string }) => {
    const token = data?.token || socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        if (['ADMIN', 'STAFF', 'KITCHEN'].includes(decoded.role)) {
          socket.join('kitchen');
          socket.join('admin');
          return;
        }
      } catch {
        // Token invalide
      }
    }

    // En développement ou local, rejoindre les rooms pour recevoir les notifications
    socket.join('kitchen');
    socket.join('admin');
  });

  socket.on('join_admin', (data?: { token?: string }) => {
    socket.join('admin');
    socket.join('kitchen');
  });

  // Join order room (suivi client ciblé par ID de commande)
  socket.on('join_order', (orderId: string) => {
    if (orderId && typeof orderId === 'string') {
      socket.join(`order_${orderId}`);
    }
  });
});

// API Routes (supporte les deux préfixes selon la réécriture Vercel)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Health check
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    restaurant: 'TERANGA FOOD',
    developedBy: 'GORATECH',
    signature: 'Solutions numériques pour les entreprises.',
  });
});

// Récupération automatique de l'IP du réseau local pour les tests sur téléphone
app.get('/api/network-ip', (req: Request, res: Response) => {
  try {
    const interfaces = os.networkInterfaces();
    const candidates: { ip: string; name: string; priority: number }[] = [];

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          const ip = iface.address;
          if (ip.startsWith('169.254.')) continue;

          let priority = 1;
          const lower = name.toLowerCase();

          // Priorité Wi-Fi maximale
          if (lower.includes('wi-fi') || lower.includes('wireless') || lower.includes('wlan')) {
            priority = 10;
          } else if (ip.startsWith('192.168.56.')) {
            priority = 0; // VirtualBox
          } else if (ip.startsWith('192.168.1.') || ip.startsWith('192.168.0.')) {
            priority = 8;
          } else if (ip.startsWith('10.') || ip.startsWith('172.')) {
            priority = 5;
          }

          candidates.push({ ip, name, priority });
        }
      }
    }

    candidates.sort((a, b) => b.priority - a.priority);
    const addresses = candidates.map(c => c.ip);
    const defaultIp = addresses[0] || 'localhost';

    res.json({
      ips: addresses,
      candidates,
      defaultIp,
      port: config.port,
      clientPort: 5173,
      suggestedClientUrl: defaultIp !== 'localhost' ? `http://${defaultIp}:5173` : 'http://localhost:5173',
    });
  } catch (err: any) {
    res.json({ ips: [], defaultIp: 'localhost', suggestedClientUrl: 'http://localhost:5173' });
  }
});

// --- DÉPLOIEMENT UNIFIÉ : SERVIR LE FRONTEND DEPUIS LE BACKEND ---
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  console.log(`📦 Frontend statique détecté : ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // Redirection automatique pour React Router (SPA)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erreur non gérée :', err);
  res.status(500).json({ error: 'Erreur interne du serveur', message: err.message });
});

// Start Server (uniquement en local ou serveur dédié, pas sur Vercel serverless)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const port = Number(config.port) || 5000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`✨ TERANGA FOOD API Server running on http://0.0.0.0:${port}`);
    console.log(`⚡ WebSocket Socket.IO enabled for TERANGA FOOD`);
  });
}

// Export pour Vercel Serverless (évite l'avertissement MIXED_EXPORTS)
export default app;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  (module.exports as any).default = app;
}

