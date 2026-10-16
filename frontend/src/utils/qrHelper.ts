import { API_BASE_URL } from '../config/api';

const QR_HOST_KEY = 'teranga_qr_base_host';
export const PRODUCTION_SITE_URL = 'https://terangua-food.vercel.app';

/**
 * Récupère l'URL de base pour la génération des QR codes (persistée dans le localStorage)
 */
export const getStoredQrHost = (): string => {
  if (typeof window === 'undefined') return PRODUCTION_SITE_URL;
  const saved = localStorage.getItem(QR_HOST_KEY);
  if (saved && saved.trim()) return saved.trim();

  // Si on est déjà sur le site Vercel ou un domaine de production, utiliser window.location.origin
  if (
    window.location.origin.includes('vercel.app') ||
    (!window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1'))
  ) {
    return window.location.origin;
  }

  // Si on est en développement local, par défaut les QR codes pointent vers l'URL officielle de production pour que le scan smartphone fonctionne immédiatement !
  return PRODUCTION_SITE_URL;
};

/**
 * Enregistre l'URL de base personnalisée pour les QR codes
 */
export const setStoredQrHost = (host: string): void => {
  if (typeof window !== 'undefined') {
    if (host && host.trim()) {
      localStorage.setItem(QR_HOST_KEY, host.trim());
    } else {
      localStorage.removeItem(QR_HOST_KEY);
    }
  }
};

/**
 * Interroge le serveur pour récupérer automatiquement l'adresse IP du réseau local (Wi-Fi)
 */
export const fetchLanIpHost = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/network-ip`);
    if (res.ok) {
      const data = await res.json();
      if (data.suggestedClientUrl) {
        return data.suggestedClientUrl;
      }
      if (data.defaultIp && data.defaultIp !== 'localhost') {
        return `http://${data.defaultIp}:5173`;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

/**
 * Génère l'URL absolue et scannable par un smartphone pour une table donnée
 */
export const generateTableQrUrl = (tableNumber: string | number, customBaseHost?: string): string => {
  const host = customBaseHost || getStoredQrHost();
  const cleanHost = host.replace(/\/+$/, '');
  const formattedNum = String(tableNumber).trim().padStart(2, '0');
  return `${cleanHost}/menu?table=${formattedNum}`;
};
