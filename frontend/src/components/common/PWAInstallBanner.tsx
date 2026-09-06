import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, WifiOff, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    // 1. Détection du mode Standalone (PWA déjà installée et ouverte)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isStandaloneNavigator = (window.navigator as any).standalone === true;
      return isStandaloneMedia || isStandaloneNavigator;
    };

    const standalone = checkStandalone();
    setIsStandalone(standalone);

    // 2. Détection iOS Safari
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    setIsIOS(isIOSDevice && isSafari && !standalone);

    // 3. Vérification si déjà ignoré récemment
    const dismissedTimestamp = localStorage.getItem('teranga_pwa_dismissed_at');
    if (dismissedTimestamp) {
      const diffHours = (Date.now() - parseInt(dismissedTimestamp, 10)) / (1000 * 60 * 60);
      if (diffHours < 24) {
        setIsDismissed(true);
      }
    }

    // 4. Événement PWA Chromium (Android, Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Gestion de l'état réseau (En ligne / Hors-ligne)
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Installation acceptée par l\'utilisateur');
        setDeferredPrompt(null);
        setIsDismissed(true);
      } else {
        console.log('[PWA] Installation refusée par l\'utilisateur');
      }
    } catch (err) {
      console.error('[PWA] Erreur lors de l\'installation :', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('teranga_pwa_dismissed_at', Date.now().toString());
  };

  // Ne pas afficher la bannière d'installation si déjà installé en standalone
  const canPrompt = (deferredPrompt !== null || isIOS) && !isStandalone && !isDismissed;

  return (
    <>
      {/* Toast d'état de connexion Réseau */}
      {isOffline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A]/95 text-amber-400 border border-amber-500/40 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-bounce">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>Mode Hors-Ligne — Consultation du menu en cache actif</span>
        </div>
      )}

      {showReconnected && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#0A0A0A]/95 text-emerald-400 border border-emerald-500/40 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Connexion rétablie — Données en temps réel synchronisées</span>
        </div>
      )}

      {/* Bannière Flottante d'Installation PWA */}
      {canPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#0D0D0D]/95 backdrop-blur-xl border border-amber-500/30 text-white p-4 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-amber-400/40 bg-black">
                  <img
                    src="/pwa-icon-192.png"
                    alt="TERANGA FOOD"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback vers l'icône SVG si le PNG n'est pas encore chargé
                      (e.target as HTMLImageElement).src = '/pwa-icon.svg';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-wide text-white">TERANGA FOOD</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Application
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">
                    Installez l'application pour commander plus vite
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Fermer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guide interactif spécial iOS Safari */}
            {showIOSInstructions && isIOS ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Installation sur iPhone / iPad :</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[11px] font-bold">
                    1
                  </span>
                  <span>Touchez l'icône Partager</span>
                  <Share className="w-3.5 h-3.5 text-blue-400 inline" />
                  <span>en bas de Safari</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[11px] font-bold">
                    2
                  </span>
                  <span>Faites défiler et touchez</span>
                  <strong className="text-white flex items-center gap-1">
                    "Sur l'écran d'accueil" <PlusSquare className="w-3.5 h-3.5 text-gray-300 inline" />
                  </strong>
                </div>
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="w-full mt-1 py-1.5 text-center text-xs font-medium text-amber-400 hover:underline"
                >
                  Compris
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A0A0A] font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4 text-[#0A0A0A]" />
                  <span>{isIOS ? "Comment installer" : "Installer l'App"}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Plus tard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallBanner;
