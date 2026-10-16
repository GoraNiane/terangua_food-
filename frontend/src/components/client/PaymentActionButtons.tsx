import React, { useState } from 'react';
import { Smartphone, Zap, ShieldCheck } from 'lucide-react';
import { Order, Restaurant } from '../../types';
import { formatFCFA } from '../../services/whatsappService';
import { PaymentModal, WaveLogo, OrangeMoneyLogo, getWavePaymentUrl } from './PaymentModal';

interface PaymentActionButtonsProps {
  order: Order;
  restaurant: Restaurant;
  className?: string;
  showTitle?: boolean;
}

export const PaymentActionButtons: React.FC<PaymentActionButtonsProps> = ({
  order,
  restaurant,
  className = '',
  showTitle = true,
}) => {
  const [activeModal, setActiveModal] = useState<'wave' | 'om' | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {showTitle && (
        <div className="space-y-1 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8A8A]">
            Règlement mobile sécurisé
          </span>
          <h3 className="font-sans font-black text-sm sm:text-base text-[#0A0A0A]">
            Choisissez votre moyen de paiement
          </h3>
          <p className="text-[11px] text-[#666666]">
            Réglez instantanément votre commande de {formatFCFA(order.total)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Bouton Wave — Navigation directe avec pay.wave.com et montant prescrit */}
        <a
          href={getWavePaymentUrl(order.total)}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#1DC3F2] hover:bg-[#16add7] text-white shadow-soft transition-all duration-200 active:scale-98 cursor-pointer border border-[#18b5e4]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm flex items-center justify-center shrink-0">
              <WaveLogo className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-white/85 block">
                Paiement direct Wave
              </span>
              <span className="font-sans font-black text-sm sm:text-base leading-tight block">
                Payer avec Wave
              </span>
              <span className="text-[10px] text-white/90 font-semibold block">
                Montant pré-rempli • 1 clic
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs sm:text-sm font-black bg-white/20 px-2.5 py-1 rounded-lg">
              {formatFCFA(order.total)}
            </span>
          </div>
        </a>

        {/* Bouton Orange Money (OM) */}
        <button
          type="button"
          onClick={() => setActiveModal('om')}
          className="group relative overflow-hidden flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#FF7900] hover:bg-[#e66c00] text-white shadow-soft transition-all duration-200 active:scale-98 cursor-pointer border border-[#f07200]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black p-1 shadow-sm flex items-center justify-center shrink-0">
              <OrangeMoneyLogo className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-black tracking-wider text-white/85 block">
                Orange Money
              </span>
              <span className="font-sans font-black text-sm sm:text-base leading-tight block">
                Payer avec OM
              </span>
              <span className="text-[10px] text-white/90 font-semibold block">
                Code USSD #144#
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs sm:text-sm font-black bg-white/20 px-2.5 py-1 rounded-lg">
              {formatFCFA(order.total)}
            </span>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-[#8A8A8A] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Paiement sécurisé directement sur votre application mobile habituelle</span>
      </div>

      {activeModal && (
        <PaymentModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          type={activeModal}
          order={order}
          restaurant={restaurant}
        />
      )}
    </div>
  );
};
