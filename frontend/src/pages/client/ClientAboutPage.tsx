import React, { useState } from 'react';
import { Sparkles, Utensils, Heart, ShieldCheck, MapPin, Clock, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClientHeader } from '../../components/client/ClientHeader';
import { BottomNav } from '../../components/client/BottomNav';
import { CartDrawer } from '../../components/client/CartDrawer';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useLanguage, getRestaurantSlogan } from '../../services/i18n';

export const ClientAboutPage: React.FC = () => {
  const { restaurant } = useRestaurantStore();
  const { t, lang } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pb-24 sm:pb-16 selection:bg-[#0A0A0A] selection:text-white">
      <ClientHeader onOpenCart={() => setIsCartOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 space-y-16 sm:space-y-24">
        {/* Editorial Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#F3F3F3] border border-[#EAEAEA] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0A0A0A]">
            <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
            <span>{t.aboutTagline}</span>
          </div>

          <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#0A0A0A] leading-[1.08] uppercase">
            {t.aboutHeadline1}
            <br />
            <span className="text-[#888888]">{t.aboutHeadline2}</span>
          </h1>

          <p className="text-sm sm:text-base text-[#666666] leading-relaxed font-normal">
            {t.aboutDesc}
          </p>
        </section>

        {/* Large Editorial Visual */}
        <section className="relative rounded-3xl overflow-hidden border border-[#EAEAEA] shadow-card bg-[#F3F3F3] aspect-[16/9] sm:aspect-[21/9]">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80"
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-10">
            <p className="text-white text-xs sm:text-sm font-medium tracking-wide">
              {t.aboutKitchenQuote}
            </p>
          </div>
        </section>

        {/* The 3 Pillars */}
        <section className="space-y-8">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#888888]">
              {t.aboutValuesTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
              {t.aboutValuesSubtitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#0A0A0A]">
                {t.aboutPillar1Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {t.aboutPillar1Desc}
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#0A0A0A]">
                {t.aboutPillar2Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {t.aboutPillar2Desc}
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#0A0A0A]">
                {t.aboutPillar3Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {t.aboutPillar3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* Contact, Horaires & Visite */}
        <section id="contact" className="rounded-3xl bg-[#0A0A0A] text-white p-8 sm:p-12 space-y-8">
          <div className="border-b border-[#222222] pb-6 space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#888888]">
              {t.aboutFindUsTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.aboutFindUsTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{t.aboutAddressLabel}</h4>
                <p className="text-xs text-[#AAAAAA] mt-1 leading-relaxed">
                  {restaurant.address}
                  <br />
                  {restaurant.city}, Sénégal
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{t.aboutHoursLabel}</h4>
                <p className="text-xs text-[#AAAAAA] mt-1 leading-relaxed">
                  {restaurant.openingHours}
                  <br />
                  {t.aboutHoursSub}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{t.aboutBookingsLabel}</h4>
                <p className="text-xs text-[#AAAAAA] mt-1 leading-relaxed">
                  Tél : {restaurant.phone}
                  <br />
                  WhatsApp : +{restaurant.whatsappNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#888888]">
              {t.aboutSmartTablesNotice}
            </p>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#FAFAFA] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              <span>{t.aboutDiscoverMenuBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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
              <Link to="/promotions" className="hover:text-white transition-colors">
                {t.navPromotions}
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                {t.navAbout}
              </Link>
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
