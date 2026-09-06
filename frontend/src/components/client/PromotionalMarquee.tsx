import React from 'react';
import { useLanguage } from '../../services/i18n';

export interface PromotionItem {
  id: string;
  icon: string;
  label: string;
  highlight?: string;
}

interface PromotionalMarqueeProps {
  items?: PromotionItem[];
  className?: string;
}

export const PromotionalMarquee: React.FC<PromotionalMarqueeProps> = ({
  items,
  className = '',
}) => {
  const { t } = useLanguage();

  const defaultItems: PromotionItem[] = [
    { id: 'promo-1', icon: '🔥', label: t.marqueePromo1 },
    { id: 'promo-2', icon: '📱', label: t.marqueePromo2 },
    { id: 'promo-3', icon: '⭐', label: t.marqueePromo3 },
    { id: 'promo-4', icon: '🍹', label: t.marqueePromo4 },
    { id: 'promo-5', icon: '✨', label: t.marqueePromo5 },
    { id: 'promo-6', icon: '🤍', label: t.marqueePromo6 },
  ];

  const activeItems = items || defaultItems;

  const renderItemSet = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center">
      {activeItems.map((item, index) => (
        <div
          key={`${keyPrefix}-${item.id}-${index}`}
          className="inline-flex items-center shrink-0"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 cursor-default">
            <span
              className="text-xs sm:text-sm select-none shrink-0"
              role="img"
              aria-label={item.label}
            >
              {item.icon}
            </span>

            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white whitespace-nowrap">
              {item.label}
            </span>

            {item.highlight && (
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
                {item.highlight}
              </span>
            )}
          </div>

          {/* Minimalist dot separator */}
          <span
            className="text-[#666666] text-xs select-none mx-3 shrink-0"
            aria-hidden="true"
          >
            •
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`marquee-group relative w-full h-9 sm:h-10 bg-[#0A0A0A] border-b border-[#222222] overflow-hidden flex items-center select-none z-30 ${className}`}
      role="region"
      aria-label="Annonces promotionnelles défilantes"
    >
      {/* Left vignette fade */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10"
        aria-hidden="true"
      />

      {/* Right vignette fade */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10"
        aria-hidden="true"
      />

      {/* Continuous scrolling marquee track */}
      <div className="flex w-full overflow-hidden items-center">
        <div className="animate-marquee flex shrink-0 items-center">
          {renderItemSet('t1-a')}
          {renderItemSet('t1-b')}
        </div>

        <div className="animate-marquee flex shrink-0 items-center" aria-hidden="true">
          {renderItemSet('t2-a')}
          {renderItemSet('t2-b')}
        </div>
      </div>
    </div>
  );
};
