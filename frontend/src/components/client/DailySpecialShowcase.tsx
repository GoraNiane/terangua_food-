import React, { useState } from 'react';
import {
  Flame,
  Calendar,
  Sparkles,
  ShoppingBag,
  Gift,
  ArrowRight,
  Check,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { formatFCFA } from '../../services/whatsappService';
import { Product } from '../../types';

interface DailySpecialShowcaseProps {
  onOpenProductModal?: (product: Product) => void;
  onOpenCart?: () => void;
}

export const DailySpecialShowcase: React.FC<DailySpecialShowcaseProps> = ({
  onOpenProductModal,
  onOpenCart,
}) => {
  const { weeklySchedule, products, addToCart } = useRestaurantStore();

  const todayIndex = new Date().getDay(); // 0 = Dimanche, 1 = Lundi...
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(todayIndex);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Ordonner du Lundi (1) au Dimanche (0)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0].map(
    dayNum => weeklySchedule.find(s => s.dayOfWeek === dayNum)!
  ).filter(Boolean);

  const activeSchedule = weeklySchedule.find(s => s.dayOfWeek === selectedDayOfWeek) || orderedDays[0];
  const isToday = activeSchedule.dayOfWeek === todayIndex;

  // Récupérer les produits du jour
  const scheduledProducts = products.filter(p => activeSchedule.productIds.includes(p.id));
  const mainProduct = scheduledProducts[0] || products[0];

  const handleOrderSpecial = () => {
    if (!mainProduct) return;
    addToCart(mainProduct, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
    if (onOpenCart) {
      setTimeout(() => onOpenCart(), 300);
    }
  };

  return (
    <section className="rounded-3xl bg-white border border-[#EAEAEA] p-6 sm:p-10 shadow-sm space-y-8 select-none">
      {/* En-tête de la section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F0F0F0] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[10px] font-extrabold uppercase tracking-widest text-orange-700 mb-2">
            <Flame className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span>Spécialité du Jour & Semainier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
            Le Menu du Jour
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-xl">
            Chaque jour à midi et au dîner, nos cuisiniers honorent une grande recette traditionnelle du Sénégal mijotée avec des ingrédients d'exception.
          </p>
        </div>

        {/* Sélecteur compact des 7 jours */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {orderedDays.map(day => {
            const isSelected = day.dayOfWeek === selectedDayOfWeek;
            const isCurrentDay = day.dayOfWeek === todayIndex;

            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelectedDayOfWeek(day.dayOfWeek)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-white shadow-xs'
                    : 'bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#555555]'
                }`}
              >
                <span>{day.dayName.slice(0, 3)}.</span>
                {isCurrentDay && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-orange-400' : 'bg-orange-600'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Carte Vedette du Jour Sélectionné */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Colonne Visuelle Grand Format */}
        <div className="lg:col-span-5 relative group">
          <div className="relative rounded-2xl overflow-hidden border border-[#EAEAEA] aspect-[4/3] bg-[#FAFAFA] shadow-sm">
            <img
              src={mainProduct?.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
              alt={activeSchedule.themeTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isToday && (
              <div className="absolute top-3 left-3 bg-[#0A0A0A]/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                <span>Disponible Aujourd'hui</span>
              </div>
            )}
            {activeSchedule.specialPrice && (
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-[#0A0A0A] text-xs font-black px-3 py-1.5 rounded-xl border border-[#EAEAEA] shadow-md">
                Formule : {formatFCFA(activeSchedule.specialPrice)}
              </div>
            )}
          </div>
        </div>

        {/* Colonne Descriptif & Commande */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#888888]">
                {activeSchedule.dayName}
              </span>
              {isToday && (
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                  Au menu de ce jour
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#0A0A0A] tracking-tight leading-tight">
              {activeSchedule.themeTitle}
            </h3>

            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
              {activeSchedule.description || mainProduct?.description}
            </p>
          </div>

          {/* Avantage spécial du chef */}
          {activeSchedule.specialNote && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-xs font-semibold text-amber-950">
              <Gift className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{activeSchedule.specialNote}</span>
            </div>
          )}

          {/* Plats et boissons compris dans la formule */}
          {scheduledProducts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] block">
                Compris dans cette suggestion ({scheduledProducts.length} articles) :
              </span>
              <div className="flex flex-wrap gap-2">
                {scheduledProducts.map(prod => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => onOpenProductModal && onOpenProductModal(prod)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] hover:border-[#0A0A0A] text-xs font-medium text-[#0A0A0A] transition-colors"
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{prod.name}</span>
                    <span className="text-[#888888] font-bold text-[10px]">
                      ({formatFCFA(prod.price)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="pt-3 border-t border-[#F0F0F0] flex flex-wrap items-center gap-3">
            {isToday ? (
              <button
                type="button"
                onClick={handleOrderSpecial}
                className="px-6 py-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#262626] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs active:scale-98"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Ajouté au Panier !</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Commander le Plat du Jour</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-xs text-[#888888] italic flex items-center gap-1.5 py-2">
                <Clock className="w-4 h-4 text-[#888888]" />
                <span>Ce plat sera à l’honneur le {activeSchedule.dayName}. Vous pouvez également le commander à la carte.</span>
              </div>
            )}

            {mainProduct && (
              <button
                type="button"
                onClick={() => onOpenProductModal && onOpenProductModal(mainProduct)}
                className="px-4 py-3.5 rounded-xl border border-[#D0D0D0] hover:bg-neutral-50 text-[#0A0A0A] text-xs sm:text-sm font-semibold transition-colors"
              >
                Voir la recette & ingrédients
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
