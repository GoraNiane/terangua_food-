import React from 'react';
import { Flame } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useLanguage, getPromotionTitle } from '../../services/i18n';

export const PromotionBanner: React.FC = () => {
  const { promotions } = useRestaurantStore();
  const { t, lang } = useLanguage();
  const activePromo = promotions.find(p => p.isActive);

  if (!activePromo) return null;

  return (
    <div className="bg-[#0A0A0A] text-white px-4 py-2 border-b border-[#222222]">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-white" />
          <span className="font-semibold text-white line-clamp-1">
            {getPromotionTitle(activePromo, lang)}
          </span>
        </div>
        <span className="bg-white text-[#0A0A0A] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shrink-0">
          -{activePromo.discountPercent}% {t.promoDiscountTag}
        </span>
      </div>
    </div>
  );
};
