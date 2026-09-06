/**
 * Configuration centralisée des URLs de l'API et WebSocket pour TERANGA FOOD
 * 
 * En local (développement) :
 *   Fallback automatique sur http://localhost:5000 si aucune variable n'est définie.
 * 
 * En production (Vercel) :
 *   Définir la variable VITE_API_URL dans les paramètres de votre projet Vercel :
 *   Exemple : https://votre-backend-teranga.up.railway.app
 */

const cleanUrl = (url: string): string => url.replace(/\/+$/, '');

const getDynamicApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const { hostname, port, protocol, origin } = window.location;

    // En développement local avec Vite (port 5173 par défaut)
    if (port === '5173') {
      return `${protocol}//${hostname}:5000`;
    }

    // En production unifiée (le backend sert le frontend sur le même port/domaine)
    return origin;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL: string = cleanUrl(getDynamicApiUrl());

export const WS_URL: string = cleanUrl(
  import.meta.env.VITE_WS_URL || API_BASE_URL
);

export const ENDPOINTS = {
  // Authentification
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  ME: `${API_BASE_URL}/api/auth/me`,

  // Ventes & Commandes
  SALES: `${API_BASE_URL}/api/sales`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  KITCHEN_ORDERS: `${API_BASE_URL}/api/orders/kitchen`,
  STATISTICS: `${API_BASE_URL}/api/statistics`,

  // Menu & Configuration
  MENU: `${API_BASE_URL}/api/menu`,
  MENU_SCHEDULE: `${API_BASE_URL}/api/menu/schedule`,
  MENU_TODAY: `${API_BASE_URL}/api/menu/today`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  TABLES: `${API_BASE_URL}/api/tables`,
  SETTINGS: `${API_BASE_URL}/api/settings`,
  HEALTH: `${API_BASE_URL}/api/health`,
};
