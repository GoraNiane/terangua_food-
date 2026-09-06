# Multi-stage Dockerfile pour TERANGA FOOD (Frontend + Backend unifiés)

# 1. Étape de build du Frontend React (Vite)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 2. Étape de build du Backend Node.js (TypeScript + Prisma)
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY backend/ ./
RUN npm run build

# 3. Étape d'exécution finale en production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Dépendances de production du backend
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
RUN cd backend && npm install --omit=dev && npx prisma generate

# Copie des fichiers compilés
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

# Démarrage du serveur unifié
CMD ["node", "backend/dist/server.js"]
