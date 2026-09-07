import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Enregistrement officiel du Service Worker PWA TERANGA FOOD (Mode Standalone & Hors-ligne)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker actif, scope:', registration.scope);

        // Détecter si une mise à jour est disponible
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nouvelle version v3 prête. Mise à jour automatique.');
              }
            });
          }
        });

        // Forcer la vérification de mise à jour au retour sur l'onglet
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });
      })
      .catch((err) => {
        console.warn('[PWA] Enregistrement Service Worker reporté:', err);
      });

    // Prise de contrôle transparente par le nouveau worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Nouveau Service Worker activé avec succès.');
    });
  });
}
