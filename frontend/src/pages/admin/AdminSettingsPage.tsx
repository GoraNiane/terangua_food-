import React, { useState } from 'react';
import {
  Settings,
  Save,
  Check,
  Building,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminSettingsPage: React.FC = () => {
  const { restaurant, updateRestaurantSettings } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: restaurant.name,
    slogan: restaurant.slogan,
    description: restaurant.description,
    address: restaurant.address,
    city: restaurant.city,
    phone: restaurant.phone,
    whatsappNumber: restaurant.whatsappNumber,
    openingHours: restaurant.openingHours,
    tablesCount: restaurant.tablesCount,
    logoUrl: restaurant.logoUrl,
    coverUrl: restaurant.coverUrl,
    isOpen: restaurant.isOpen,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurantSettings({
      ...formData,
      tablesCount: Number(formData.tablesCount) || 20,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

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
          title="Paramètres de l'établissement"
          subtitle="Configurez les coordonnées, le numéro WhatsApp récepteur et les horaires"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAEAEA] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#0A0A0A] pb-2 border-b border-[#EEEEEE]">
                <Building className="w-5 h-5" />
                <h3 className="font-display font-black text-base text-[#0A0A0A]">
                  Identité du Restaurant
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Nom de l'enseigne *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Slogan accrocheur</label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#0A0A0A] font-bold">Description de l'établissement</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl p-3 text-xs text-[#0A0A0A] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">URL du Logo</label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">URL de la photo de couverture</label>
                  <input
                    type="url"
                    value={formData.coverUrl}
                    onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp & Orders Configuration */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAEAEA] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#0A0A0A] pb-2 border-b border-[#EEEEEE]">
                <MessageSquare className="w-5 h-5" />
                <h3 className="font-display font-black text-base text-[#0A0A0A]">
                  Réception des Commandes WhatsApp
                </h3>
              </div>

              <p className="text-xs text-[#666666]">
                C'est à ce numéro que les clients envoient automatiquement leur commande détaillée.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">
                    Numéro WhatsApp du restaurant (sans +) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.whatsappNumber}
                    onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="221775678900"
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none font-mono"
                  />
                  <span className="text-[10px] text-[#666666]">
                    Exemple pour le Sénégal : 22177XXXXXXX
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Téléphone fixe / standard</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Practical Info & Service */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAEAEA] space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-[#0A0A0A] pb-2 border-b border-[#EEEEEE]">
                <Clock className="w-5 h-5" />
                <h3 className="font-display font-black text-base text-[#0A0A0A]">
                  Localisation & Service
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Adresse physique</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Nombre de tables</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.tablesCount}
                    onChange={e => setFormData({ ...formData, tablesCount: Number(e.target.value) })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#0A0A0A] font-bold">Horaires d'ouverture</label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs text-[#0A0A0A] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="restaurantOpen"
                  checked={formData.isOpen}
                  onChange={e => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="w-4 h-4 accent-[#0A0A0A] rounded"
                />
                <label htmlFor="restaurantOpen" className="text-xs text-[#0A0A0A] font-semibold cursor-pointer">
                  Restaurant actuellement ouvert aux commandes
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span>Modifications enregistrées avec succès !</span>
                </div>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-sm transition-all active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les paramètres</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
