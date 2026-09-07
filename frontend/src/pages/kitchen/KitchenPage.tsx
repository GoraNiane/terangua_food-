import React, { useState, useEffect } from 'react';
import {
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flame,
  CheckCircle2,
  Sparkles,
  Printer,
  LogOut,
  Bell,
  Check,
  AlertCircle,
  Timer,
  UtensilsCrossed,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useAuth } from '../../store/authContext';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';

export const KitchenPage: React.FC = () => {
  const { orders, updateOrderStatus, isSoundEnabled, toggleSound, testAudioChime } = useRestaurantStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'served'>('active');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horloge en direct
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Calcul dynamique du temps écoulé (chronomètre en minutes et secondes)
  const getElapsedFormatted = (dateString: string) => {
    const diffSeconds = Math.max(0, Math.floor((currentTime.getTime() - new Date(dateString).getTime()) / 1000));
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getElapsedMinutes = (dateString: string) => {
    return Math.max(0, Math.floor((currentTime.getTime() - new Date(dateString).getTime()) / 60000));
  };

  // Filtrage des commandes par statut pour les 4 colonnes KDS
  // RÈGLE STRICTE : AUCUN PRIX NI INFORMATION FINANCIÈRE N'EST AFFICHÉ DANS L'ESPACE CUISINE
  const newOrders = orders.filter(o => o.status === 'PENDING');
  const acceptedOrders = orders.filter(o => o.status === 'CONFIRMED');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');
  const servedOrders = orders.filter(o => o.status === 'SERVED').slice(0, 12);

  const activeCount = newOrders.length + acceptedOrders.length + preparingOrders.length + readyOrders.length;

  const renderOrderCard = (order: Order, stage: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED') => {
    const elapsedMinutes = getElapsedMinutes(order.createdAt);
    const elapsedClock = getElapsedFormatted(order.createdAt);
    const isLate = elapsedMinutes > 15;

    const timeStr = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        key={order.id}
        className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
          stage === 'NEW'
            ? 'border-neutral-900 border-2 shadow-md ring-1 ring-neutral-900/10'
            : stage === 'ACCEPTED'
            ? 'border-neutral-400 border-l-4 border-l-neutral-900'
            : stage === 'PREPARING'
            ? 'border-neutral-300 border-l-4 border-l-neutral-700'
            : stage === 'READY'
            ? 'border-emerald-300 border-l-4 border-l-emerald-600 bg-emerald-50/20'
            : 'border-neutral-200 opacity-80'
        }`}
      >
        {/* En-tête de la commande (Numéro, Table, Heure) — AUCUN PRIX */}
        <div className="p-3.5 bg-neutral-50/60 border-b border-neutral-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-base text-neutral-900">
              {order.orderNumber || (String(order.id).startsWith('#TF-') ? order.id : `#TF-${order.id}`)}
            </span>
            {order.orderType === 'DINE_IN' ? (
              <span className="bg-neutral-900 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-md">
                TABLE {order.tableNumber || '01'}
              </span>
            ) : order.orderType === 'DELIVERY' ? (
              <span className="bg-neutral-700 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                LIVRAISON
              </span>
            ) : (
              <span className="bg-neutral-200 text-neutral-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                À EMPORTER
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{timeStr}</span>
          </div>
        </div>

        {/* Corps : Liste des produits, quantités, accompagnements et sauces */}
        <div className="p-4 space-y-3 flex-1">
          {/* Note spéciale de préparation */}
          {order.notes && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wider text-[10px] text-amber-800">
                  Instruction spéciale :
                </span>
                <span>{order.notes}</span>
              </div>
            </div>
          )}

          {/* Articles de la commande */}
          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-neutral-900 text-sm">
                    {item.name}
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-neutral-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                    ×{item.quantity}
                  </span>
                </div>

                {/* Options / Personnalisations (Riz, sauce, suppléments) */}
                {item.selectedOptionsText && (
                  <div className="text-xs text-neutral-600 space-y-0.5 pt-1 border-t border-neutral-200/50">
                    {item.selectedOptionsText.split(',').map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-1.5 text-[11px] text-neutral-700">
                        <span className="text-neutral-400 font-bold">→</span>
                        <span className="font-medium">{opt.trim()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chronomètre dynamique pour les commandes en préparation */}
          {stage === 'PREPARING' && (
            <div
              className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-mono font-bold ${
                isLate
                  ? 'bg-red-50 border border-red-200 text-red-700 animate-pulse'
                  : 'bg-neutral-100 border border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4" />
                <span>Préparation depuis :</span>
              </div>
              <span className="text-sm font-black">{elapsedClock}</span>
            </div>
          )}
        </div>

        {/* Boutons d'action séquentiels du workflow cuisine */}
        <div className="p-3 bg-neutral-50/60 border-t border-neutral-100">
          {stage === 'NEW' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'CONFIRMED', 'Commande acceptée par la cuisine')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>ACCEPTER</span>
            </button>
          )}

          {stage === 'ACCEPTED' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'PREPARING', 'Début de cuisson par la cuisine')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>COMMENCER PRÉPARATION</span>
            </button>
          )}

          {stage === 'PREPARING' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'READY', 'Plats terminés et prêts au passe')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>PRÊTE / LIVRER 🔔</span>
            </button>
          )}

          {stage === 'READY' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'SERVED', 'Commande servie à table — Vente finalisée')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>SERVIE / REMISE AU CLIENT</span>
            </button>
          )}

          {stage === 'SERVED' && (
            <div className="py-2 text-center text-xs font-semibold text-neutral-500 flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Commande finalisée et servie</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans select-none">
      {/* Barre Supérieure Dédiée Cuisine (Ultra-lisible, sans données financières) */}
      <header className="bg-neutral-900 text-white px-4 sm:px-6 py-3 border-b border-neutral-800 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        {/* Identité & Rôle Cuisine */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-neutral-900 flex items-center justify-center font-black shadow-sm">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white uppercase">
                TERANGA FOOD • CUISINE
              </span>
              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                KDS
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {user?.name || 'Cuisine Centrale'} • Service en direct
            </p>
          </div>
        </div>

        {/* Indicateurs Centraux : Horloge & Compteur de commandes en cours */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-neutral-800/90 border border-neutral-700 px-4 py-1.5 rounded-xl font-mono text-sm font-bold text-neutral-200">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>
              {currentTime.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-neutral-800/90 border border-neutral-700 px-4 py-1.5 rounded-xl text-xs font-bold text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeCount} commande(s) en préparation</span>
          </div>
        </div>

        {/* Actions Rapides : Son, Plein écran, Déconnexion */}
        <div className="flex items-center gap-2">
          {/* Alerte Sonore Cuisine */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSoundEnabled
                ? 'bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700'
                : 'bg-red-950/40 text-red-300 border-red-800/60'
            }`}
            title={isSoundEnabled ? 'Sonnerie cuisine activée' : 'Sonnerie désactivée'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            <span className="hidden sm:inline">{isSoundEnabled ? 'Bip Actif' : 'Muet'}</span>
          </button>

          {/* Test Bip */}
          <button
            onClick={testAudioChime}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs transition-colors hidden sm:flex items-center gap-1"
            title="Tester le carillon cuisine"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Plein écran */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs transition-colors"
            title={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Déconnexion Cuisine */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-red-900/60 text-neutral-300 hover:text-red-200 border border-neutral-700 text-xs font-bold transition-all"
            title="Fermer la session cuisine"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </header>

      {/* Onglets rapides : En cours vs Servies récemment */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Passes Actifs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('served')}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'served'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <span>Servies Récemment</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-300 text-neutral-800 font-bold">
              {servedOrders.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-neutral-500 font-medium hidden sm:block">
          Mise à jour instantanée par Socket.IO • Rafraîchissement automatique
        </div>
      </div>

      {/* Vue Principale : 4 Colonnes du Workflow KDS */}
      <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
        {activeTab === 'active' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 min-w-[1024px] xl:min-w-0 h-full">
            {/* Colonne 1 : NOUVELLES (REÇUES) */}
            <div className="flex flex-col bg-neutral-200/50 rounded-2xl p-3 border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-300 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 animate-ping" />
                  <h2 className="font-extrabold text-xs uppercase tracking-wider text-neutral-900">
                    1. Reçues
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white text-xs font-black">
                  {newOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[calc(100vh-190px)]">
                {newOrders.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-neutral-400 text-xs text-center">
                    <Check className="w-6 h-6 mb-1 text-neutral-300" />
                    <span>Aucune nouvelle commande</span>
                  </div>
                ) : (
                  newOrders.map(o => renderOrderCard(o, 'NEW'))
                )}
              </div>
            </div>

            {/* Colonne 2 : ACCEPTÉES */}
            <div className="flex flex-col bg-neutral-200/50 rounded-2xl p-3 border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-300 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                  <h2 className="font-extrabold text-xs uppercase tracking-wider text-neutral-900">
                    2. Acceptées
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-neutral-700 text-white text-xs font-black">
                  {acceptedOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[calc(100vh-190px)]">
                {acceptedOrders.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-neutral-400 text-xs text-center">
                    <span>Aucune commande en attente</span>
                  </div>
                ) : (
                  acceptedOrders.map(o => renderOrderCard(o, 'ACCEPTED'))
                )}
              </div>
            </div>

            {/* Colonne 3 : EN PRÉPARATION (CUISSON) */}
            <div className="flex flex-col bg-neutral-200/50 rounded-2xl p-3 border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-300 px-1">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                  <h2 className="font-extrabold text-xs uppercase tracking-wider text-neutral-900">
                    3. En Préparation
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-white text-xs font-black">
                  {preparingOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[calc(100vh-190px)]">
                {preparingOrders.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-neutral-400 text-xs text-center">
                    <span>Aucune cuisson en cours</span>
                  </div>
                ) : (
                  preparingOrders.map(o => renderOrderCard(o, 'PREPARING'))
                )}
              </div>
            </div>

            {/* Colonne 4 : PRÊTES (AU PASSE) */}
            <div className="flex flex-col bg-emerald-100/40 rounded-2xl p-3 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-300 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <h2 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950">
                    4. Prêtes (Passe)
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-xs font-black">
                  {readyOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[calc(100vh-190px)]">
                {readyOrders.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-neutral-400 text-xs text-center">
                    <span>Aucun plat en attente au passe</span>
                  </div>
                ) : (
                  readyOrders.map(o => renderOrderCard(o, 'READY'))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Onglet des Commandes Servies Récemment */
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Historique récent des commandes servies
                </h3>
                <p className="text-xs text-neutral-500">
                  Les commandes servies sont automatiquement enregistrées comme ventes par le système.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold">
                {servedOrders.length} commande(s)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servedOrders.map(o => renderOrderCard(o, 'SERVED'))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
