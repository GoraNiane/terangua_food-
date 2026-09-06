import React, { useState } from 'react';
import { Tag, Clock, ArrowRight, Sparkles, Check, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClientHeader } from '../../components/client/ClientHeader';
import { BottomNav } from '../../components/client/BottomNav';
import { CartDrawer } from '../../components/client/CartDrawer';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useLanguage, getRestaurantSlogan } from '../../services/i18n';
import { formatFCFA } from '../../services/whatsappService';

export const ClientPromotionsPage: React.FC = () => {
  const { restaurant, products, addToCart } = useRestaurantStore();
  const { t, lang } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleApplyPromoBurger = () => {
    const burger = products.find(p => p.id === 'prod-08' || p.name.includes('Burger'));
    if (burger) {
      addToCart({ ...burger, price: 3600 }, 1, undefined, t.promo1Title);
      setAddedItem('burger');
      setIsCartOpen(true);
      setTimeout(() => setAddedItem(null), 2000);
    }
  };

  const handleApplyPromoThieb = () => {
    const thieb = products.find(p => p.id === 'prod-01' || p.name.includes('Thiéboudienne'));
    if (thieb) {
      addToCart({ ...thieb, name: t.promo2Title, price: 7500 }, 1, undefined, 'Formule midi');
      setAddedItem('thieb');
      setIsCartOpen(true);
      setTimeout(() => setAddedItem(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pb-24 sm:pb-16 selection:bg-[#0A0A0A] selection:text-white">
      <ClientHeader onOpenCart={() => setIsCartOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 space-y-12 sm:space-y-16">
        {/* Page Header */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#F3F3F3] border border-[#EAEAEA] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0A0A0A]">
            <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
            <span>{t.promotionsTag}</span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-5xl tracking-tight text-[#0A0A0A] uppercase">
            {t.promotionsTitle}
          </h1>

          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            {t.promotionsSubtitle}
          </p>
        </section>

        {/* Large Promotional Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Promo 1: -20% Burger Teranga */}
          <div className="rounded-3xl border border-[#EAEAEA] hover:border-[#0A0A0A] overflow-hidden bg-white shadow-soft transition-all duration-300 flex flex-col justify-between group">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#FAFAFA]">
              <img
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
                alt={t.promo1Title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#0A0A0A] text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm">
                {t.promo1Badge}
              </div>
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-[#0A0A0A] border border-[#EAEAEA] flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span>{t.promo1Time}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#888888] tracking-widest">
                    {t.promo1Dates}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FAFAFA] text-[#0A0A0A] border border-[#EAEAEA] px-2 py-0.5 rounded-full">
                    {t.promo1Active}
                  </span>
                </div>
                <h3 className="font-sans font-black text-2xl text-[#0A0A0A]">
                  {t.promo1Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {t.promo1Desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#888888] line-through block">
                    {formatFCFA(4500)}
                  </span>
                  <span className="text-xl font-extrabold text-[#0A0A0A]">
                    {formatFCFA(3600)}
                  </span>
                </div>

                <button
                  onClick={handleApplyPromoBurger}
                  className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-[#262626] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  {addedItem === 'burger' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.promo1Added}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.promo1Cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Promo 2: Menu Thiéboudienne d'Exception */}
          <div className="rounded-3xl border border-[#EAEAEA] hover:border-[#0A0A0A] overflow-hidden bg-white shadow-soft transition-all duration-300 flex flex-col justify-between group">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#FAFAFA]">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                alt={t.promo2Title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#0A0A0A] text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm">
                {t.promo2Badge}
              </div>
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-[#0A0A0A] border border-[#EAEAEA] flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span>{t.promo2Time}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#888888] tracking-widest">
                    {t.promo2Dates}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FAFAFA] text-[#0A0A0A] border border-[#EAEAEA] px-2 py-0.5 rounded-full">
                    {t.promo2Active}
                  </span>
                </div>
                <h3 className="font-sans font-black text-2xl text-[#0A0A0A]">
                  {t.promo2Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {t.promo2Desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#888888] line-through block">
                    {formatFCFA(9500)}
                  </span>
                  <span className="text-xl font-extrabold text-[#0A0A0A]">
                    {formatFCFA(7500)}
                  </span>
                </div>

                <button
                  onClick={handleApplyPromoThieb}
                  className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-[#262626] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  {addedItem === 'thieb' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.promo1Added}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.promo2Cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Promo 3: Jus Frais Offert */}
          <div className="rounded-3xl border border-[#EAEAEA] hover:border-[#0A0A0A] overflow-hidden bg-white shadow-soft transition-all duration-300 flex flex-col justify-between group">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#FAFAFA]">
              <img
                src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80"
                alt={t.promo3Title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#0A0A0A] text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm">
                {t.promo3Badge}
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#888888] tracking-widest">
                    {t.promo3Dates}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FAFAFA] text-[#0A0A0A] border border-[#EAEAEA] px-2 py-0.5 rounded-full">
                    {t.promo3Active}
                  </span>
                </div>
                <h3 className="font-sans font-black text-2xl text-[#0A0A0A]">
                  {t.promo3Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {t.promo3Desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xl font-extrabold text-[#0A0A0A]">
                    {t.promo3Value}
                  </span>
                </div>

                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-[#262626] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  <span>{t.promo3Cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Promo 4: Happy Hour 18h - 20h */}
          <div className="rounded-3xl border border-[#EAEAEA] hover:border-[#0A0A0A] overflow-hidden bg-white shadow-soft transition-all duration-300 flex flex-col justify-between group">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#FAFAFA]">
              <img
                src="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80"
                alt={t.promo4Title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#0A0A0A] text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm">
                {t.promo4Badge}
              </div>
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-[#0A0A0A] border border-[#EAEAEA] flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span>{t.promo4Time}</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#888888] tracking-widest">
                    {t.promo4Dates}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FAFAFA] text-[#0A0A0A] border border-[#EAEAEA] px-2 py-0.5 rounded-full">
                    {t.promo4Active}
                  </span>
                </div>
                <h3 className="font-sans font-black text-2xl text-[#0A0A0A]">
                  {t.promo4Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {t.promo4Desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EEEEEE] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xl font-extrabold text-[#0A0A0A]">
                    {t.promo4Value}
                  </span>
                </div>

                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-[#262626] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  <span>{t.promo4Cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Programme Fidélité TERANGA+ */}
        <section className="rounded-3xl bg-[#FAFAFA] border border-[#EAEAEA] p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#888888] flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#0A0A0A]" />
                <span>{t.loyaltyProgramTag}</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A0A0A] tracking-tight">
                {t.loyaltyProgramTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#666666]">
                {t.loyaltyProgramDesc}
              </p>
            </div>

            <div className="text-right">
              <span className="font-mono font-black text-2xl sm:text-3xl text-[#0A0A0A]">
                8 / 10
              </span>
              <p className="text-[11px] text-[#888888] font-bold uppercase tracking-wider">
                {t.loyaltyValidatedLabel}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3.5 bg-[#EAEAEA] rounded-full overflow-hidden">
              <div className="h-full bg-[#0A0A0A] rounded-full w-[80%] transition-all duration-500" />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#0A0A0A]">
              <span>{t.loyaltyProgressText}</span>
              <span className="text-[#888888]">{t.loyaltyRewardLabel}</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer standard avec mention GORATECH */}
      <footer className="mt-20 bg-[#0A0A0A] text-white border-t border-[#222222] py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#222222] pb-8">
            <div>
              <span className="font-sans font-black text-xl tracking-tight text-white block">
                {restaurant.name}
              </span>
              <p className="text-xs text-[#888888] mt-1">
                {getRestaurantSlogan(lang)} • {restaurant.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#888888]">
              <Link to="/" className="hover:text-white transition-colors">
                {t.navHome}
              </Link>
              <Link to="/menu" className="hover:text-white transition-colors">
                {t.navMenu}
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                {t.navAbout}
              </Link>
              <a href="/about#contact" className="hover:text-white transition-colors">
                {t.navContact}
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
            <p>© {new Date().getFullYear()} {restaurant.name} — {t.footerRights}</p>
            <div className="text-center sm:text-right space-y-0.5">
              <p className="text-white font-medium">
                {t.footerGoratech}
              </p>
              <p className="text-[11px] text-[#888888]">
                {t.footerSub}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer & Bottom Nav */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <BottomNav onOpenCart={() => setIsCartOpen(true)} />
    </div>
  );
};
