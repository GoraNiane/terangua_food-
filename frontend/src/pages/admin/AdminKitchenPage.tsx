import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Printer,
  Bell,
  Check,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { ThermalReceiptModal } from '../../components/common/ThermalReceiptModal';
import { Order, OrderStatus } from '../../types';

export const AdminKitchenPage: React.FC = () => {
  const { orders, updateOrderStatus, isSoundEnabled, toggleSound, testAudioChime } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [thermalOrder, setThermalOrder] = useState<Order | null>(null);
  const [now, setNow] = useState(Date.now());

  // Horloge pour les minutes écoulées
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const getElapsedMinutes = (dateString: string) => {
    const diff = Math.max(0, Math.floor((now - new Date(dateString).getTime()) / 60000));
    return diff;
  };

  const toggleFullscreenMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 4 Colonnes KDS Cuisine
  const newOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED');
  const prepOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');
  const servedOrders = orders.filter(o => o.status === 'SERVED').slice(0, 6);

  const renderOrderCard = (order: Order, currentStatus: OrderStatus) => {
    const elapsed = getElapsedMinutes(order.createdAt);
    const isLate = elapsed > 15;

    return (
      <div
        key={order.id}
        className={`bg-white rounded-2xl border p-4 space-y-3.5 transition-all shadow-sm hover:shadow-md ${
          currentStatus === 'PENDING' || currentStatus === 'CONFIRMED'
            ? 'border-l-4 border-l-[#0A0A0A] border-[#EAEAEA]'
            : currentStatus === 'PREPARING'
            ? 'border-l-4 border-l-[#333333] border-[#EAEAEA]'
            : currentStatus === 'READY'
            ? 'border-l-4 border-l-[#888888] border-[#EAEAEA]'
            : 'border-[#EAEAEA] opacity-75'
        }`}
      >
        {/* Card Top */}
        <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-2">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-lg text-[#0A0A0A]">
              #{order.id}
            </span>
            {order.orderType === 'DINE_IN' ? (
              <span className="bg-[#0A0A0A] text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                TABLE {order.tableNumber}
              </span>
            ) : order.orderType === 'DELIVERY' ? (
              <span className="bg-[#333333] text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full">
                LIVRAISON
              </span>
            ) : (
              <span className="bg-[#F0F0F0] text-[#0A0A0A] font-extrabold text-[11px] px-2 py-0.5 rounded-full border border-[#EAEAEA]">
                À EMPORTER
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setThermalOrder(order)}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#0A0A0A] hover:text-white text-[#666666] transition-colors"
              title="Imprimer le bon de commande cuisine (80mm)"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <div
              className={`flex items-center gap-1 text-xs font-mono font-bold ${
                isLate ? 'text-red-600 animate-pulse' : 'text-[#666666]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{elapsed} min</span>
            </div>
          </div>
        </div>

        {/* Client details & notes */}
        <div className="text-xs">
          <span className="font-bold text-[#0A0A0A]">{order.customerName}</span>
          {order.notes && (
            <div className="mt-1.5 p-2 rounded-xl bg-[#F9F9F9] border border-[#EAEAEA] text-[#333333] text-[11px] font-medium flex items-start gap-1.5">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider shrink-0 mt-0.5">
                Note :
              </span>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-2 border-t border-[#EEEEEE] pt-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-xs flex items-start justify-between gap-2">
              <div>
                <span className="font-extrabold text-[#0A0A0A]">
                  {item.quantity}× {item.name}
                </span>
                {item.selectedOptionsText && (
                  <p className="text-[11px] text-[#666666] italic pl-2 border-l-2 border-[#EAEAEA] mt-0.5">
                    {item.selectedOptionsText}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sequential Kitchen Action Buttons */}
        <div className="pt-2 border-t border-[#EEEEEE] flex flex-col gap-2">
          {order.status === 'PENDING' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateOrderStatus(order.id, 'CONFIRMED', 'Commande acceptée par la cuisine')}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#222222] hover:bg-[#0A0A0A] text-white font-extrabold text-xs transition-all shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ACCEPTER</span>
              </button>

              <button
                onClick={() => updateOrderStatus(order.id, 'PREPARING', 'Passage direct en cuisson')}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#333333] text-white font-extrabold text-xs transition-all shadow-sm"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>EN PRÉPARATION</span>
              </button>
            </div>
          )}

          {order.status === 'CONFIRMED' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'PREPARING', 'Commande prise en main par le chef')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#262626] text-white font-extrabold text-xs transition-all shadow-sm"
            >
              <Flame className="w-4 h-4" />
              <span>EN PRÉPARATION</span>
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'READY', 'Plats dressés et prêts au passe')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-extrabold text-xs transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>PRÊTE 🔔</span>
            </button>
          )}

          {order.status === 'READY' && (
            <button
              onClick={() => updateOrderStatus(order.id, 'SERVED', 'Commande servie à table')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-extrabold text-xs transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>SERVIE</span>
            </button>
          )}

          {order.status === 'SERVED' && (
            <div className="flex items-center justify-between text-xs text-[#888888] py-1">
              <span>Commande servie ✓</span>
              <button
                onClick={() => updateOrderStatus(order.id, 'PREPARING', 'Rappelée en cuisine')}
                className="flex items-center gap-1 text-[11px] hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rappeler</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#0A0A0A] flex">
      {/* Desktop Sidebar */}
      {!isFullscreen && (
        <div className="hidden md:block w-64 shrink-0">
          <div className="fixed inset-y-0 w-64">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isFullscreen && (
          <AdminHeader
            title="TERANGA KITCHEN — Écran Cuisine (KDS)"
            subtitle="Gestion visuelle en temps réel des préparations culinaires"
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
        )}

        <main className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col">
          {/* Top Bar with sound and fullscreen toggles */}
          <div className="flex items-center justify-between bg-white border border-[#EAEAEA] p-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-black text-sm sm:text-base text-[#0A0A0A]">
                  TERANGA KITCHEN DISPLAY
                </h2>
                <p className="text-[11px] text-[#666666]">
                  Flux cuisine temps réel connecté à MariaDB & Socket.IO
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSoundEnabled
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                    : 'bg-white border-[#EAEAEA] text-[#666666] hover:bg-gray-50'
                }`}
                title={isSoundEnabled ? 'Son activé' : 'Son désactivé'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSoundEnabled ? 'Alerte sonore ON' : 'Son OFF'}</span>
              </button>

              <button
                onClick={toggleFullscreenMode}
                className="p-2 rounded-xl bg-white hover:bg-gray-100 text-[#0A0A0A] border border-[#EAEAEA] transition-colors"
                title="Plein écran tablette cuisine"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 4 Colonnes KDS : NOUVELLES | EN PRÉPARATION | PRÊTES | SERVIES */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-start">
            {/* 1. NOUVELLES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0A0A0A] text-white shadow-sm">
                <span className="font-display font-bold text-xs uppercase tracking-wider">
                  NOUVELLES ({newOrders.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </div>

              <div className="space-y-3">
                {newOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 text-center text-xs text-[#888888]">
                    Aucune nouvelle commande
                  </div>
                ) : (
                  newOrders.map(o => renderOrderCard(o, o.status))
                )}
              </div>
            </div>

            {/* 2. EN PRÉPARATION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#333333] text-white shadow-sm">
                <span className="font-display font-bold text-xs uppercase tracking-wider">
                  EN PRÉPARATION ({prepOrders.length})
                </span>
                <Flame className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-3">
                {prepOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 text-center text-xs text-[#888888]">
                    Aucun plat sur le feu
                  </div>
                ) : (
                  prepOrders.map(o => renderOrderCard(o, 'PREPARING'))
                )}
              </div>
            </div>

            {/* 3. PRÊTES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EAEAEA] text-[#0A0A0A] border border-[#D5D5D5] shadow-sm">
                <span className="font-display font-bold text-xs uppercase tracking-wider">
                  PRÊTES ({readyOrders.length})
                </span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-3">
                {readyOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 text-center text-xs text-[#888888]">
                    Aucun plat en attente de service
                  </div>
                ) : (
                  readyOrders.map(o => renderOrderCard(o, 'READY'))
                )}
              </div>
            </div>

            {/* 4. SERVIES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F0F0F0] text-[#0A0A0A] border border-[#EAEAEA] shadow-sm">
                <span className="font-display font-bold text-xs uppercase tracking-wider">
                  SERVIES ({servedOrders.length})
                </span>
                <Clock className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-3">
                {servedOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 text-center text-xs text-[#888888]">
                    Aucune commande terminée
                  </div>
                ) : (
                  servedOrders.map(o => renderOrderCard(o, 'SERVED'))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Thermal Receipt Modal for Kitchen Printer (80mm) */}
      <ThermalReceiptModal
        order={thermalOrder}
        isOpen={!!thermalOrder}
        onClose={() => setThermalOrder(null)}
      />
    </div>
  );
};
