import React, { useState } from 'react';
import { Plus, Check, Award, Flame, Sparkles, Video } from 'lucide-react';
import { Product } from '../../types';
import { formatFCFA } from '../../services/whatsappService';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useLanguage, getProductName, getProductDescription } from '../../services/i18n';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useRestaurantStore();
  const { t, lang } = useLanguage();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If product has options, open details modal to let customer choose
    if (product.optionGroups && product.optionGroups.length > 0) {
      onOpenDetails(product);
      return;
    }

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const getBadgeIcon = (badge?: Product['badge']) => {
    switch (badge) {
      case 'Chef':
        return <Award className="w-3 h-3 text-white" />;
      case 'Populaire':
        return <Flame className="w-3 h-3 text-white" />;
      case 'Nouveau':
        return <Sparkles className="w-3 h-3 text-white" />;
      case 'Épicé':
        return <span className="text-[10px]">🌶️</span>;
      default:
        return null;
    }
  };

  const getBadgeLabel = (badge?: Product['badge']) => {
    switch (badge) {
      case 'Chef':
        return t.badgeChef;
      case 'Populaire':
        return t.badgePopular;
      case 'Nouveau':
        return t.badgeNew;
      case 'Épicé':
        return t.badgeSpicy;
      default:
        return badge;
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card active:scale-[0.99]"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-[#FAFAFA]">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Minimalist Monochrome Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#0A0A0A] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {getBadgeIcon(product.badge)}
            <span>{getBadgeLabel(product.badge)}</span>
          </div>
        )}

        {/* Video Badge */}
        {product.videoUrl && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-sm border border-white/20">
            <Video className="w-3 h-3 text-amber-400" />
            <span>Vidéo</span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs uppercase font-bold tracking-wider text-[#0A0A0A] bg-white px-3 py-1 rounded-full border border-[#EAEAEA] shadow-sm">
              {t.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 justify-between bg-white">
        <div>
          <h3 className="font-sans font-bold text-sm sm:text-base text-[#0A0A0A] leading-snug line-clamp-1">
            {getProductName(product, lang)}
          </h3>
          <p className="mt-1 text-xs text-[#8A8A8A] line-clamp-2 leading-relaxed font-normal">
            {getProductDescription(product, lang)}
          </p>
        </div>

        {/* Bottom Price & Actions: Voir le plat + bouton '+' */}
        <div className="mt-4 pt-3 border-t border-[#EEEEEE] flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-semibold">
              {t.priceLabel}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-[#0A0A0A] tracking-tight">
              {formatFCFA(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(product);
              }}
              className="text-xs font-semibold text-[#0A0A0A] hover:text-[#555555] bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#EAEAEA] px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"
            >
              {t.viewDishBtn}
            </button>

            <button
              onClick={handleQuickAdd}
              disabled={!product.isAvailable}
              aria-label={`${t.addToCartBtn} - ${getProductName(product, lang)}`}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                !product.isAvailable
                  ? 'opacity-30 cursor-not-allowed bg-[#EAEAEA] text-[#8A8A8A]'
                  : justAdded
                  ? 'bg-[#0A0A0A] text-white scale-105'
                  : 'bg-[#0A0A0A] hover:bg-[#262626] active:scale-90 text-white shadow-xs'
              }`}
            >
              {justAdded ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
