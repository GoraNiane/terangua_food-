import React from 'react';
import { Home, UtensilsCrossed, ShoppingBag, Sparkles, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useLanguage } from '../../services/i18n';

interface BottomNavProps {
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCart }) => {
  const { cartCount } = useRestaurantStore();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-[#EEEEEE] px-3 py-2 shadow-sm">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#0A0A0A] font-bold' : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">{t.navHome}</span>
        </NavLink>

        <NavLink
          to="/menu"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#0A0A0A] font-bold' : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
            }`
          }
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">{t.navMenu}</span>
        </NavLink>

        <NavLink
          to="/promotions"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#0A0A0A] font-bold' : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
            }`
          }
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">{t.navPromotions}</span>
        </NavLink>

        {/* Cart trigger */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-1 py-1 px-3 text-[#8A8A8A] hover:text-[#0A0A0A] transition-all"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#0A0A0A] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{t.navCart}</span>
        </button>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#0A0A0A] font-bold' : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
            }`
          }
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">{t.navAbout}</span>
        </NavLink>
      </div>
    </nav>
  );
};
