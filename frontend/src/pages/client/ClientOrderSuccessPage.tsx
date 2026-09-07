import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ArrowRight, Utensils, MapPin, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRestaurantStore } from '../../store/restaurantStore';
import { formatFCFA, generateWhatsAppUrl } from '../../services/whatsappService';
import { useLanguage } from '../../services/i18n';
import { API_BASE_URL } from '../../config/api';
import { Order } from '../../types';

export const ClientOrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, restaurant } = useRestaurantStore();
  const { t } = useLanguage();
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cleanId = (orderId || '').replace(/^[#\s]*TF-/i, '').trim();
  const order =
    orders.find(
      o =>
        o.id === orderId ||
        o.orderNumber === orderId ||
        (cleanId !== '' && (o.id === cleanId || o.orderNumber === `#TF-${cleanId}`))
    ) || fetchedOrder;

  useEffect(() => {
    if (!order && orderId) {
      setIsLoading(true);
      fetch(`${API_BASE_URL}/api/orders/${cleanId || orderId}`)
        .then(r => (r.ok ? r.json() : null))
        .then(d => {
          if (d?.order) setFetchedOrder(d.order);
        })
        .finally(() => setIsLoading(false));
    }
  }, [orderId, cleanId, order]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#0A0A0A', '#8A8A8A', '#EAEAEA'],
      });
    } catch (e) {
      console.log('Confetti error', e);
    }
  }, []);

  if (isLoading && !order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex flex-col items-center justify-center p-4 gap-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#8A8A8A] font-semibold">Récupération de votre commande...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex flex-col items-center justify-center p-4 gap-3">
        <p className="text-sm font-semibold">{t.orderNotFoundTitle}</p>
        <Link to="/menu" className="text-xs underline text-amber-600 font-bold">Retour au menu</Link>
      </div>
    );
  }

  const statusDescriptions: Record<string, { label: string; step: number }> = {
    PENDING: { label: t.statusStep1, step: 1 },
    CONFIRMED: { label: t.statusStep2, step: 2 },
    PREPARING: { label: t.statusStep3, step: 3 },
    READY: { label: t.statusStep4, step: 4 },
    SERVED: { label: t.statusStep5, step: 5 },
    CANCELLED: { label: t.statusCancelled, step: 0 },
  };

  const currentStatus = statusDescriptions[order.status] || statusDescriptions.PENDING;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] p-4 sm:p-6 flex flex-col justify-between max-w-lg mx-auto">
      <div className="space-y-6 pt-6 sm:pt-10">
        {/* Grand check noir dans un cercle blanc */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-white border-2 border-[#0A0A0A] flex items-center justify-center shadow-card mx-auto">
            <Check className="w-10 h-10 text-[#0A0A0A] stroke-[3]" />
          </div>

          <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight uppercase">
            {t.orderConfirmedTitle}
          </h1>

          <p className="text-xs sm:text-sm text-[#8A8A8A] max-w-xs mx-auto">
            {t.orderConfirmedSubtitle} {restaurant.name}.
          </p>
        </div>

        {/* Order Details Receipt Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAEAEA] shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-semibold">
                {t.orderNumberLabel}
              </span>
              <p className="font-mono font-bold text-lg sm:text-xl text-[#0A0A0A]">
                #{order.id}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-semibold">
                {t.totalLabel}
              </span>
              <p className="font-sans font-black text-xl text-[#0A0A0A]">
                {formatFCFA(order.total)}
              </p>
            </div>
          </div>

          {/* Stepper tracker */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A8A8A]">{t.statusLabel}</span>
              <span className="font-bold text-[#0A0A0A]">
                {currentStatus.label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className={`h-1.5 rounded-full ${currentStatus.step >= 1 ? 'bg-[#0A0A0A]' : 'bg-[#EAEAEA]'}`} />
              <div className={`h-1.5 rounded-full ${currentStatus.step >= 2 ? 'bg-[#0A0A0A]' : 'bg-[#EAEAEA]'}`} />
              <div className={`h-1.5 rounded-full ${currentStatus.step >= 3 ? 'bg-[#0A0A0A]' : 'bg-[#EAEAEA]'}`} />
            </div>
            <div className="flex justify-between text-[10px] text-[#8A8A8A]">
              <span>{t.step1Received}</span>
              <span className="text-center">{t.step2Kitchen}</span>
              <span className="text-right">{t.step3Ready}</span>
            </div>
          </div>

          {/* Service & Client details */}
          <div className="pt-3 border-t border-[#EEEEEE] text-xs space-y-1 text-[#666666]">
            <div className="flex justify-between">
              <span>{t.clientLabel}</span>
              <span className="font-semibold text-[#0A0A0A]">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.serviceTypeLabel}</span>
              <span className="font-semibold text-[#0A0A0A]">
                {order.orderType === 'DINE_IN'
                  ? `${t.dineIn} (${t.tableLabel} ${order.tableNumber})`
                  : order.orderType === 'TAKEAWAY'
                  ? t.takeaway
                  : t.delivery}
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA Button */}
        <a
          href={generateWhatsAppUrl(order, restaurant)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white border border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] hover:bg-[#FAFAFA] transition-all shadow-sm active:scale-98"
        >
          <Send className="w-4 h-4 text-[#0A0A0A]" />
          <span>{t.sendWhatsAppBtn}</span>
        </a>
      </div>

      {/* Bottom CTA — SUIVRE MA COMMANDE & RETOUR */}
      <div className="pt-6 pb-4 space-y-3">
        <Link
          to={`/order/${order.id}`}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#0A0A0A] hover:bg-[#262626] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md active:scale-98"
        >
          <span>{t.trackOrderBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/menu"
            className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] text-xs font-semibold text-[#0A0A0A] transition-colors"
          >
            <span>{t.backToMenuBtn}</span>
          </Link>

          <Link
            to={`/receipt/${order.id}`}
            className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] text-xs font-semibold text-[#0A0A0A] transition-colors"
          >
            <span>{t.receiptBtn}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
