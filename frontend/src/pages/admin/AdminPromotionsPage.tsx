import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle,
  X,
  Percent,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminPromotionsPage: React.FC = () => {
  const { promotions, togglePromotion } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="fixed inset-y-0 w-64">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs h-full">
            <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Promotions & Offres Spéciales"
          subtitle="Créez des remises dynamiques visibles sur le bandeau et le menu digital"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#666666] font-medium">
              {promotions.length} offres configurées
            </p>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Créer une offre</span>
            </button>
          </div>

          {/* Promotions list */}
          <div className="space-y-4">
            {promotions.map(promo => (
              <div
                key={promo.id}
                className={`bg-white p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                  promo.isActive ? 'border-[#0A0A0A]' : 'border-[#EAEAEA] opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Percent className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-base text-[#0A0A0A]">
                        {promo.title}
                      </h3>
                      <span className="bg-[#0A0A0A] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                        -{promo.discountPercent}%
                      </span>
                    </div>

                    <p className="text-xs text-[#666666] leading-relaxed">
                      {promo.description}
                    </p>

                    {promo.startTime && (
                      <p className="text-[11px] text-[#0A0A0A] font-semibold flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Valable de {promo.startTime} à {promo.endTime}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Toggle */}
                <div className="flex items-center justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#EEEEEE]">
                  <button
                    onClick={() => togglePromotion(promo.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                      promo.isActive
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                        : 'bg-white text-[#666666] border-[#EAEAEA] hover:bg-gray-50'
                    }`}
                  >
                    {promo.isActive ? 'Actif sur le menu' : 'Désactivé'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-[#EAEAEA] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
              <h3 className="font-display font-black text-base text-[#0A0A0A]">
                Créer une promotion
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                alert('Offre créée avec succès !');
                setIsAddModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-[#0A0A0A] font-bold">Titre de l'offre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 🔥 HAPPY HOUR GRILLADES"
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl p-2.5 text-[#0A0A0A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#0A0A0A] font-bold">Remise en % *</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  defaultValue={20}
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl p-2.5 text-[#0A0A0A] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#0A0A0A] font-bold">Description pour le client</label>
                <textarea
                  rows={2}
                  placeholder="Ex: -20% sur toutes les grillades entre 18h et 20h."
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl p-2.5 text-[#0A0A0A] outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#666666] hover:text-[#0A0A0A]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold shadow-sm"
                >
                  Activer l'offre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
