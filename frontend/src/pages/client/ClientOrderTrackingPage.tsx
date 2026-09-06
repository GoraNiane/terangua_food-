import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Utensils,
  MapPin,
  Send,
  Star,
  ArrowLeft,
  Sparkles,
  Phone,
  FileText,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRestaurantStore } from '../../store/restaurantStore';
import { formatFCFA, generateWhatsAppUrl } from '../../services/whatsappService';
import { OrderStatus } from '../../types';
import { useLanguage, getProductName, getOptionItemName } from '../../services/i18n';

export const ClientOrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, restaurant, addReview } = useRestaurantStore();
  const { t, lang } = useLanguage();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Find order from store
  const order = orders.find(o => o.id === orderId) || orders[0];

  useEffect(() => {
    if (order && (order.status === 'READY' || order.status === 'SERVED')) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#0A0A0A', '#888888', '#EAEAEA'],
        });
      } catch (e) {
        // Confetti optional
      }
    }
  }, [order?.status]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex flex-col items-center justify-center p-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-[#888888]" />
        <h2 className="text-lg font-bold">{t.orderNotFoundTitle}</h2>
        <Link
          to="/menu"
          className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-xs font-bold"
        >
          {t.backToMenuBtn}
        </Link>
      </div>
    );
  }

  // Define steps according to prompt:
  // ✓ Commande reçue -> ✓ Commande acceptée -> ● En préparation -> ○ Prête -> ○ Servie
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 1; // Reçue
      case 'CONFIRMED':
        return 2; // Acceptée
      case 'PREPARING':
        return 3; // En préparation
      case 'READY':
        return 4; // Prête
      case 'SERVED':
        return 5; // Servie
      case 'CANCELLED':
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = getStepIndex(order.status);

  const timelineSteps = [
    {
      num: 1,
      title: t.timelineStep1Title,
      desc: t.timelineStep1Desc,
      time: t.timelineTimeImmediate,
    },
    {
      num: 2,
      title: t.timelineStep2Title,
      desc: t.timelineStep2Desc,
      time: t.timelineTimePlus1,
    },
    {
      num: 3,
      title: t.timelineStep3Title,
      desc: t.timelineStep3Desc,
      time: t.timelineTimeInProgress,
    },
    {
      num: 4,
      title: t.timelineStep4Title,
      desc: t.timelineStep4Desc,
      time: t.timelineTimeSoon,
    },
    {
      num: 5,
      title: t.timelineStep5Title,
      desc: t.timelineStep5Desc,
      time: t.timelineTimeEnjoy,
    },
  ];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReview({
      customerName: order.customerName || 'Client Teranga',
      rating,
      comment: reviewComment.trim(),
      orderId: order.id,
    });

    setReviewSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] pb-16 selection:bg-[#0A0A0A] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EEEEEE] px-4 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#0A0A0A] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.navMenu}</span>
          </Link>

          <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#0A0A0A]">
            {t.orderNumberLabel} #{order.id}
          </span>

          <Link
            to={`/receipt/${order.id}`}
            className="text-xs text-[#0A0A0A] hover:underline font-semibold flex items-center gap-1"
            title={t.receiptBtn}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.receiptBtn}</span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Status Callout Banner */}
        {order.status === 'READY' ? (
          <div className="p-4 rounded-2xl bg-[#0A0A0A] text-white border border-[#222222] shadow-xl flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0A0A0A] flex items-center justify-center font-bold text-lg shrink-0 animate-bounce">
              🔔
            </div>
            <div>
              <h2 className="font-sans font-black text-sm sm:text-base tracking-tight">
                {t.readyBannerTitle}
              </h2>
              <p className="text-xs text-[#BDBDBD]">
                {order.orderType === 'DINE_IN'
                  ? t.readyBannerDineIn.replace('{table}', order.tableNumber || '')
                  : t.readyBannerTakeaway}
              </p>
            </div>
          </div>
        ) : order.status === 'SERVED' ? (
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] text-[#0A0A0A] flex items-center justify-center font-bold text-lg shrink-0">
              ✨
            </div>
            <div>
              <h2 className="font-sans font-black text-sm text-[#0A0A0A]">
                {t.servedBannerTitle}
              </h2>
              <p className="text-xs text-[#666666]">
                {t.servedBannerDesc.replace('{name}', restaurant.name)}
              </p>
            </div>
          </div>
        ) : order.status === 'CANCELLED' ? (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
            {t.cancelledBanner}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] shadow-soft flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] text-[#0A0A0A] flex items-center justify-center font-bold text-base shrink-0">
              <Clock className="w-5 h-5 text-[#0A0A0A] animate-spin" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm text-[#0A0A0A]">
                {t.preparingBannerTitle}
              </h2>
              <p className="text-xs text-[#8A8A8A]">
                {t.preparingBannerDesc}
              </p>
            </div>
          </div>
        )}

        {/* Timeline Component */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAEAEA] shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                {t.progressLabel}
              </span>
              <h1 className="font-sans font-black text-lg text-[#0A0A0A]">
                {t.trackingTitle}
              </h1>
            </div>

            <div className="text-right">
              {order.orderType === 'DINE_IN' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-xs font-bold">
                  <Utensils className="w-3 h-3" />
                  <span>{t.tableLabel} {order.tableNumber}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-[#0A0A0A] text-xs font-bold">
                  <span>{order.orderType === 'DELIVERY' ? t.delivery : t.takeaway}</span>
                </span>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-6 relative before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#EEEEEE]">
            {timelineSteps.map(step => {
              const isPast = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              const isFuture = currentStep < step.num;

              return (
                <div key={step.num} className="relative flex items-start gap-4">
                  {/* Indicator Icon/Dot */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-all ${
                      isPast
                        ? 'bg-[#0A0A0A] text-white'
                        : isCurrent
                        ? 'bg-[#0A0A0A] text-white ring-4 ring-[#EAEAEA]'
                        : 'bg-white border-2 border-[#D5D5D5] text-[#888888]'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    ) : (
                      <span>{step.num}</span>
                    )}
                  </div>

                  {/* Step Text */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          isCurrent
                            ? 'text-[#0A0A0A]'
                            : isPast
                            ? 'text-[#333333]'
                            : 'text-[#888888]'
                        }`}
                      >
                        {isPast ? `✓ ${step.title}` : isCurrent ? `● ${step.title}` : `○ ${step.title}`}
                      </p>
                      <span className="text-[10px] text-[#888888] font-mono">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Recap */}
        <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-sm space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#666666] border-b border-[#EEEEEE] pb-2">
            {t.orderedItemsTitle} ({order.items.reduce((sum, i) => sum + i.quantity, 0)})
          </h3>

          <div className="divide-y divide-[#EEEEEE]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-start text-xs">
                <div>
                  <span className="font-bold text-[#0A0A0A]">
                    {getProductName({ id: item.productId, name: item.name }, lang)}{' '}
                    <span className="text-[#888888]">× {item.quantity}</span>
                  </span>
                  {item.selectedOptionsText && (
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      ↳{' '}
                      {item.selectedOptionsText
                        .split(', ')
                        .map(s => getOptionItemName(s, lang))
                        .join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-mono font-bold text-[#0A0A0A]">
                  {formatFCFA(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#EEEEEE] flex justify-between items-center text-sm font-black text-[#0A0A0A]">
            <span>{t.totalLabel}</span>
            <span className="font-mono">{formatFCFA(order.total)}</span>
          </div>
        </div>

        {/* Customer Review Section (Prompt Section 51) */}
        {(order.status === 'READY' || order.status === 'SERVED' || currentStep >= 4) && (
          <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-card space-y-4 animate-fade-in">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                {t.feedbackSectionTag}
              </span>
              <h3 className="font-sans font-black text-base text-[#0A0A0A]">
                {t.feedbackSectionTitle}
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                {t.feedbackSectionSubtitle}
              </p>
            </div>

            {reviewSubmitted ? (
              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] text-center space-y-1">
                <p className="text-xs font-bold text-[#0A0A0A]">
                  {t.feedbackSuccessTitle}
                </p>
                <p className="text-[11px] text-[#666666]">
                  {t.feedbackSuccessDesc}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* 5 Stars Rating Widget */}
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map(star => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        aria-label={`${star} étoiles`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            active
                              ? 'fill-[#0A0A0A] text-[#0A0A0A]'
                              : 'text-[#D5D5D5] fill-transparent'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Comment Textarea */}
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder={t.rateCommentPlaceholder}
                  rows={3}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] focus:bg-white rounded-2xl p-3.5 text-xs text-[#0A0A0A] placeholder:text-[#999999] outline-none transition-all resize-none"
                />

                <button
                  type="submit"
                  disabled={!reviewComment.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {t.rateSubmitBtn} ({rating} ★)
                </button>
              </form>
            )}
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={generateWhatsAppUrl(order, restaurant)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.whatsAppMsgBtn}</span>
          </a>

          <Link
            to="/menu"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>{t.orderSomethingElseBtn}</span>
          </Link>
        </div>
      </main>
    </div>
  );
};
