import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Edit3,
  Check,
  Plus,
  Trash2,
  UtensilsCrossed,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ArrowRight,
  Flame,
  Tag,
  Gift,
} from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { useRestaurantStore } from '../../store/restaurantStore';
import { DailyMenuSchedule, Product } from '../../types';
import { formatFCFA } from '../../services/whatsappService';

export const AdminMenuSchedulePage: React.FC = () => {
  const {
    restaurant,
    products,
    weeklySchedule,
    updateDaySchedule,
    updateTodayMenu,
    getTodaySchedule,
  } = useRestaurantStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<DailyMenuSchedule | null>(null);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Jour actuel (0 = Dimanche, 1 = Lundi, ...)
  const todayIndex = new Date().getDay();
  const todayData = getTodaySchedule();

  // Jours ordonnés du Lundi (1) au Dimanche (0)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0].map(
    dayNum => weeklySchedule.find(s => s.dayOfWeek === dayNum)!
  ).filter(Boolean);

  // Formulaire d'édition
  const [formThemeTitle, setFormThemeTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSpecialPrice, setFormSpecialPrice] = useState<string>('');
  const [formSpecialNote, setFormSpecialNote] = useState('');
  const [formSelectedProductIds, setFormSelectedProductIds] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  const handleOpenEditModal = (day: DailyMenuSchedule) => {
    setEditingDay(day);
    setFormThemeTitle(day.themeTitle || '');
    setFormDescription(day.description || '');
    setFormSpecialPrice(day.specialPrice ? String(day.specialPrice) : '');
    setFormSpecialNote(day.specialNote || '');
    setFormSelectedProductIds(day.productIds || []);
    setFormIsActive(day.isActive ?? true);
    setSearchProductQuery('');
  };

  const handleToggleProductSelection = (prodId: string) => {
    setFormSelectedProductIds(prev =>
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSaveDaySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    const updates: Partial<DailyMenuSchedule> = {
      themeTitle: formThemeTitle.trim() || `Spécial ${editingDay.dayName}`,
      description: formDescription.trim(),
      specialPrice: formSpecialPrice ? parseInt(formSpecialPrice, 10) : undefined,
      specialNote: formSpecialNote.trim(),
      productIds: formSelectedProductIds,
      isActive: formIsActive,
    };

    await updateDaySchedule(editingDay.dayOfWeek, updates);

    setSaveSuccessNotice(`Le menu du ${editingDay.dayName} a été mis à jour avec succès.`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
    setEditingDay(null);
  };

  const handleToggleDayActive = async (day: DailyMenuSchedule) => {
    await updateDaySchedule(day.dayOfWeek, { isActive: !day.isActive });
  };

  // Filtrage des produits pour la modale
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A0A0A] flex flex-col font-sans">
      <AdminHeader
        title="Menu du Jour & Semainier"
        subtitle="Programmation hebdomadaire et rotation automatique"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Bureau & Mobile */}
        <div
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Contenu Principal */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Notification de succès */}
          {saveSuccessNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-800 flex items-center justify-between shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessNotice}</span>
              </div>
              <button
                onClick={() => setSaveSuccessNotice(null)}
                className="text-emerald-600 hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Titre & Description de la page */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAEAEA] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/70 border border-neutral-300 text-[10px] font-bold uppercase tracking-wider text-neutral-800 mb-2">
                <CalendarDays className="w-3.5 h-3.5 text-neutral-900" />
                <span>Rotation Automatique & Programmation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0A0A]">
                Menu du Jour & Semainier
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-2xl">
                Configurez le plat du jour pour chaque jour de la semaine. Le restaurant met automatiquement à jour sa vitrine client chaque matin sans aucune action manuelle nécessaire.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleOpenEditModal(weeklySchedule.find(s => s.dayOfWeek === todayIndex) || weeklySchedule[0])}
                className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Modifier le menu d'aujourd'hui</span>
              </button>
            </div>
          </div>

          {/* Section 1 : Carte En Direct Aujourd'hui */}
          <section className="bg-white rounded-3xl border border-[#EAEAEA] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F0F0] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-orange-600">
                      En direct aujourd'hui • {todayData.schedule.dayName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                      Actif sur le site
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0A0A0A] tracking-tight">
                    {todayData.schedule.themeTitle}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => handleOpenEditModal(todayData.schedule)}
                className="px-3.5 py-2 rounded-xl border border-[#D0D0D0] hover:bg-neutral-50 text-xs font-bold text-[#0A0A0A] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Éditer Aujourd'hui</span>
              </button>
            </div>

            {/* Détails du jour actif */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                  {todayData.schedule.description || 'Aucune description saisie pour aujourd’hui.'}
                </p>

                {todayData.schedule.specialNote && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{todayData.schedule.specialNote}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs pt-1">
                  {todayData.schedule.specialPrice ? (
                    <div>
                      <span className="text-[#888888] block text-[10px] uppercase font-bold">Prix Formule du Jour :</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {formatFCFA(todayData.schedule.specialPrice)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[#888888] block text-[10px] uppercase font-bold">Tarification :</span>
                      <span className="text-xs font-semibold text-[#555555]">Prix standard à la carte</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Plats associés à aujourd'hui */}
              <div className="space-y-2.5">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#888888] block">
                  Plats inclus dans le menu ({todayData.products.length})
                </span>
                <div className="space-y-2">
                  {todayData.products.map(prod => (
                    <div
                      key={prod.id}
                      className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#EEEEEE] flex items-center gap-3"
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-11 h-11 rounded-lg object-cover border border-[#E0E0E0] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#0A0A0A] truncate">{prod.name}</h4>
                        <span className="text-[11px] font-semibold text-[#666666]">
                          {formatFCFA(prod.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 : Semainier Complet (7 jours de la semaine) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0A0A0A] tracking-tight">
                  Programmation Hebdomadaire (7 Jours)
                </h2>
                <p className="text-xs text-[#666666]">
                  Chaque jour bascule automatiquement à minuit selon cette configuration.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {orderedDays.map(day => {
                const isToday = day.dayOfWeek === todayIndex;
                const dayProducts = products.filter(p => day.productIds.includes(p.id));

                return (
                  <div
                    key={day.id}
                    className={`rounded-3xl border transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-white ${
                      isToday
                        ? 'ring-2 ring-[#0A0A0A] border-[#0A0A0A] shadow-md'
                        : 'border-[#EAEAEA] hover:border-[#CCCCCC] shadow-xs'
                    }`}
                  >
                    {/* En-tête de la carte jour */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                              isToday
                                ? 'bg-[#0A0A0A] text-white'
                                : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                            }`}
                          >
                            {day.dayName}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              Aujourd'hui
                            </span>
                          )}
                        </div>

                        {/* Switch d'activation du jour */}
                        <button
                          type="button"
                          onClick={() => handleToggleDayActive(day)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                            day.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                          }`}
                          title={day.isActive ? 'Jour actif' : 'Jour suspendu'}
                        >
                          {day.isActive ? 'Actif' : 'Désactivé'}
                        </button>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-[#0A0A0A] leading-snug">
                        {day.themeTitle}
                      </h3>

                      <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                        {day.description || 'Aucune description.'}
                      </p>

                      {day.specialNote && (
                        <div className="text-[11px] font-medium text-amber-900 bg-amber-50/80 border border-amber-200/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{day.specialNote}</span>
                        </div>
                      )}
                    </div>

                    {/* Plats du jour */}
                    <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#888888]">
                        <span className="font-bold uppercase tracking-wider">Plats programmés</span>
                        {day.specialPrice && (
                          <span className="font-bold text-emerald-700">
                            Formule : {formatFCFA(day.specialPrice)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {dayProducts.slice(0, 2).map(prod => (
                          <div
                            key={prod.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#FAFAFA] border border-[#EEEEEE]"
                          >
                            <span className="font-medium text-[#0A0A0A] truncate pr-2">
                              {prod.name}
                            </span>
                            <span className="font-semibold text-[#666666] shrink-0">
                              {formatFCFA(prod.price)}
                            </span>
                          </div>
                        ))}
                        {dayProducts.length === 0 && (
                          <span className="text-xs text-neutral-400 italic block py-1">
                            Aucun plat assigné.
                          </span>
                        )}
                      </div>

                      {/* Bouton pour éditer ce jour */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(day)}
                        className="w-full mt-2 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-[#0A0A0A] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Configurer {day.dayName}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* Modal d'édition du jour */}
      {editingDay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#EAEAEA] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="p-6 border-b border-[#EEEEEE] flex items-center justify-between bg-[#FAFAFA]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                  Configuration du Semainier
                </span>
                <h3 className="text-xl font-extrabold text-[#0A0A0A]">
                  Menu du {editingDay.dayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="p-2 rounded-full hover:bg-neutral-200 text-[#888888] hover:text-[#0A0A0A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire Modal */}
            <form onSubmit={handleSaveDaySchedule} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Titre du Thème */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A0A0A]">
                  Titre du Plat / Thème du Jour *
                </label>
                <input
                  type="text"
                  value={formThemeTitle}
                  onChange={e => setFormThemeTitle(e.target.value)}
                  placeholder="Ex: Vendredi Saint-Louis — Grand Thiéboudienne Pêcheur"
                  required
                  className="w-full h-11 px-3.5 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-xs sm:text-sm text-[#0A0A0A] outline-none"
                />
              </div>

              {/* Description du plat */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A0A0A]">
                  Description / Histoire du plat
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Détaillez les ingrédients nobles, la cuisson traditionnelle..."
                  className="w-full p-3 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-xs sm:text-sm text-[#0A0A0A] outline-none resize-none"
                />
              </div>

              {/* Prix promo & Note offerte */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0A0A0A]">
                    Prix Formule Spéciale (Optionnel, en FCFA)
                  </label>
                  <input
                    type="number"
                    value={formSpecialPrice}
                    onChange={e => setFormSpecialPrice(e.target.value)}
                    placeholder="Ex: 5000"
                    className="w-full h-11 px-3.5 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-xs sm:text-sm text-[#0A0A0A] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#0A0A0A]">
                    Avantage / Note du Chef
                  </label>
                  <input
                    type="text"
                    value={formSpecialNote}
                    onChange={e => setFormSpecialNote(e.target.value)}
                    placeholder="Ex: 1 verre de Bissap artisanal offert !"
                    className="w-full h-11 px-3.5 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-xs sm:text-sm text-[#0A0A0A] outline-none"
                  />
                </div>
              </div>

              {/* Statut d'activation */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formIsActive}
                  onChange={e => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D0D0D0] text-[#0A0A0A] accent-[#0A0A0A] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-[#0A0A0A] cursor-pointer">
                  Activer la rotation automatique pour ce jour
                </label>
              </div>

              {/* Sélection des plats du catalogue */}
              <div className="space-y-3 pt-2 border-t border-[#F0F0F0]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0A0A0A]">
                    Sélectionnez les plats associés ({formSelectedProductIds.length} sélectionné(s))
                  </label>
                  <span className="text-[11px] text-[#888888]">
                    Cliquez sur les plats pour les inclure
                  </span>
                </div>

                {/* Champ de recherche de produit */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchProductQuery}
                    onChange={e => setSearchProductQuery(e.target.value)}
                    placeholder="Rechercher un plat dans le catalogue..."
                    className="w-full h-10 pl-9 pr-3.5 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-xs text-[#0A0A0A] outline-none"
                  />
                  <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Grille de sélection des produits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto no-scrollbar p-1">
                  {filteredProducts.map(product => {
                    const isSelected = formSelectedProductIds.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleToggleProductSelection(product.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-white text-[#0A0A0A] border-[#EAEAEA] hover:border-[#CCCCCC]'
                        }`}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold truncate">{product.name}</h5>
                          <span
                            className={`text-[11px] font-semibold ${
                              isSelected ? 'text-neutral-300' : 'text-[#666666]'
                            }`}
                          >
                            {formatFCFA(product.price)}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-white text-black border-white'
                              : 'border-neutral-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Boutons d'action du formulaire */}
              <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#D0D0D0] text-xs font-bold text-[#555555] hover:bg-neutral-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Enregistrer et Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
