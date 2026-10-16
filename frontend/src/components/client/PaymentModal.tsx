import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, PhoneCall, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, Restaurant } from '../../types';
import { formatFCFA } from '../../services/whatsappService';
import { useLanguage } from '../../services/i18n';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'wave' | 'om';
  order: Order;
  restaurant: Restaurant;
}

export const WAVE_MERCHANT_PAY_URL = 'https://pay.wave.com/m/M_sn_UoRxc-HJ7lK-/c/sn/';

export const getWavePaymentUrl = (amount: number): string => {
  if (!amount || amount <= 0) return WAVE_MERCHANT_PAY_URL;
  return `${WAVE_MERCHANT_PAY_URL}?amount=${Math.round(amount)}`;
};

export const WaveLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="50" fill="#1DC3F2" />
    {/* Stylized Penguin / Wave symbol */}
    <ellipse cx="50" cy="53" rx="28" ry="32" fill="#0A0A0A" />
    <ellipse cx="50" cy="55" rx="19" ry="24" fill="#FFFFFF" />
    <circle cx="43" cy="40" r="3.5" fill="#FFFFFF" />
    <circle cx="57" cy="40" r="3.5" fill="#FFFFFF" />
    <circle cx="43" cy="40" r="1.8" fill="#0A0A0A" />
    <circle cx="57" cy="40" r="1.8" fill="#0A0A0A" />
    <polygon points="46,47 54,47 50,54" fill="#FFB703" />
    <ellipse cx="40" cy="83" rx="7" ry="3.5" fill="#FFB703" />
    <ellipse cx="60" cy="83" rx="7" ry="3.5" fill="#FFB703" />
  </svg>
);

export const OrangeMoneyLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="100" height="100" rx="24" fill="#FF7900" />
    <text
      x="50"
      y="44"
      textAnchor="middle"
      fill="#FFFFFF"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="24"
      letterSpacing="1"
    >
      ORANGE
    </text>
    <rect x="20" y="52" width="60" height="26" rx="6" fill="#000000" />
    <text
      x="50"
      y="70"
      textAnchor="middle"
      fill="#FF7900"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="16"
      letterSpacing="2"
    >
      MONEY
    </text>
  </svg>
);

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  type,
  order,
  restaurant,
}) => {
  const { lang } = useLanguage();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  if (!isOpen) return null;

  const isWave = type === 'wave';

  // Format clean phone number
  const rawPhone = (restaurant.whatsappNumber || restaurant.phone || '221774888464').replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('221') ? rawPhone.slice(3) : rawPhone;
  const displayPhone = `+221 ${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5, 7)} ${cleanPhone.slice(7)}`;
  const orderRef = `#TF-${order.id}`;

  const copyToClipboard = (text: string, isPhone: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPhone) {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const handleOpenApp = () => {
    if (isWave) {
      // Wave official merchant payment link with pre-filled amount
      const waveUrl = getWavePaymentUrl(order.total);
      window.open(waveUrl, '_blank');
    } else {
      // Orange money direct USSD call
      window.location.href = `tel:*144#`;
    }
  };

  const handleConfirmPaid = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: isWave ? ['#1DC3F2', '#0A0A0A', '#FFFFFF'] : ['#FF7900', '#000000', '#FFFFFF'],
      });
    } catch {}
    setPaymentConfirmed(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EAEAEA] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          className={`p-5 flex items-center justify-between text-white ${
            isWave
              ? 'bg-gradient-to-r from-[#1DC3F2] to-[#009EDB]'
              : 'bg-gradient-to-r from-[#FF7900] to-[#E55A00]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center">
              {isWave ? <WaveLogo className="w-8 h-8" /> : <OrangeMoneyLogo className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black tracking-widest bg-black/25 px-2 py-0.5 rounded-full">
                  Paiement Mobile
                </span>
              </div>
              <h3 className="font-sans font-black text-lg tracking-tight">
                {isWave ? 'Payer avec Wave' : 'Payer avec Orange Money'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Amount Card */}
          <div className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl p-4 text-center space-y-1">
            <span className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider">
              Montant à régler
            </span>
            <div className="font-sans font-black text-2xl sm:text-3xl text-[#0A0A0A]">
              {formatFCFA(order.total)}
            </div>
            <p className="text-[11px] text-[#666666]">
              Commande {orderRef} • {order.customerName}
            </p>
          </div>

          {/* Recipient details */}
          <div className="space-y-3">
            {/* Numéro du restaurant */}
            <div className="p-3.5 bg-white border border-[#EAEAEA] rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-[#8A8A8A] font-bold uppercase tracking-wider block">
                  Numéro destinataire ({restaurant.name})
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-[#0A0A0A]">
                  {displayPhone}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`221${cleanPhone}`, true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F3F3] hover:bg-[#EAEAEA] text-[#0A0A0A] text-xs font-bold transition-all active:scale-95"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#666666]" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>

            {/* Référence commande */}
            <div className="p-3.5 bg-white border border-[#EAEAEA] rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-[#8A8A8A] font-bold uppercase tracking-wider block">
                  Référence à indiquer en motif
                </span>
                <span className="font-mono font-black text-sm text-[#0A0A0A]">
                  {orderRef}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(orderRef, false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F3F3] hover:bg-[#EAEAEA] text-[#0A0A0A] text-xs font-bold transition-all active:scale-95"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#666666]" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions step by step */}
          <div className="bg-[#F8F9FA] border border-[#EEEEEE] rounded-2xl p-4 text-xs space-y-2 text-[#444444]">
            <span className="font-bold text-[#0A0A0A] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Comment finaliser votre règlement :</span>
            </span>
            {isWave ? (
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                <li>
                  Cliquez sur <strong>« Ouvrir l'application Wave »</strong> : le montant de <strong>{formatFCFA(order.total)}</strong> sera automatiquement pré-rempli.
                </li>
                <li>
                  Il ne vous reste plus qu'à <strong>valider sur votre application Wave</strong> pour finaliser la commande.
                </li>
                <li>
                  La référence <strong>{orderRef}</strong> est rattachée à votre règlement.
                </li>
              </ol>
            ) : (
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                <li>
                  Composez <strong>*144#</strong> ou ouvrez l'application <strong>Orange Money (Max it)</strong>.
                </li>
                <li>
                  Sélectionnez <strong>« Transfert d'argent »</strong> vers le <strong>{displayPhone}</strong>.
                </li>
                <li>
                  Indiquez le montant de <strong>{formatFCFA(order.total)}</strong> avec la référence <strong>{orderRef}</strong>.
                </li>
              </ol>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="space-y-2.5 pt-1">
            {isWave ? (
              <a
                href={getWavePaymentUrl(order.total)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 bg-[#1DC3F2] hover:bg-[#15a9d3]"
              >
                <Smartphone className="w-4 h-4" />
                <span>Ouvrir Wave ({formatFCFA(order.total)})</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handleOpenApp}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 bg-[#FF7900] hover:bg-[#e66c00]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Composer le code OM (*144#)</span>
              </button>
            )}

            {/* I have paid validation button */}
            <button
              type="button"
              onClick={handleConfirmPaid}
              disabled={paymentConfirmed}
              className="w-full py-3 px-4 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] flex items-center justify-center gap-2 transition-all active:scale-98 disabled:bg-emerald-50 disabled:border-emerald-200 disabled:text-emerald-800"
            >
              {paymentConfirmed ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Paiement signalé au restaurant ✓</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>J'ai effectué le paiement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
