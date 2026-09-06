import React, { useState } from 'react';
import { ArrowRight, QrCode, Utensils, Send, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore';
import { ClientHeader } from '../../components/client/ClientHeader';
import { BottomNav } from '../../components/client/BottomNav';
import { CartDrawer } from '../../components/client/CartDrawer';
import { ProductCard } from '../../components/client/ProductCard';
import { ProductModal } from '../../components/client/ProductModal';
import { HeroCinematicCarousel } from '../../components/client/HeroCinematicCarousel';
import { DailySpecialShowcase } from '../../components/client/DailySpecialShowcase';
import { useLanguage, getRestaurantSlogan } from '../../services/i18n';
import { Product } from '../../types';

export const ClientHomePage: React.FC = () => {
  const { restaurant, products } = useRestaurantStore();
  const { t, lang } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pb-24 sm:pb-16 selection:bg-[#0A0A0A] selection:text-white">
      {/* Header with Marquee */}
      <ClientHeader onOpenCart={() => setIsCartOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-16 sm:space-y-24">
        {/* Hero Section — 2 Columns Desktop Editorial Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#F3F3F3] border border-[#EAEAEA] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0A0A0A]">
              <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
              <span>{t.tagline}</span>
            </div>

            <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight text-[#0A0A0A] leading-[1.08] uppercase">
              {t.heroHeadline1}
              <br />
              <span className="text-[#8A8A8A]">{t.heroHeadline2}</span>
            </h1>

            <p className="text-sm sm:text-base text-[#666666] leading-relaxed max-w-lg font-normal">
              {t.heroDesc}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#262626] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm active:scale-95"
              >
                <span>{t.viewMenu}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FAFAFA] text-[#0A0A0A] border border-[#0A0A0A] text-xs sm:text-sm font-semibold transition-colors active:scale-95"
              >
                <span>{t.orderNowBtn}</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 border-t border-[#EEEEEE] flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-[#8A8A8A]">
              <span>{t.dishPreparedCarefully}</span>
              <span>•</span>
              <span>{t.freshProducts}</span>
              <span>•</span>
              <span>{t.fastService}</span>
            </div>
          </div>

          {/* Right Column: Original Media Frame with Cinematic Video Carousel */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#EAEAEA] shadow-card bg-[#F3F3F3] aspect-[4/3] sm:aspect-[16/11]">
              <HeroCinematicCarousel />
            </div>
          </div>
        </section>

        {/* Section 2: 3 Steps Advantages — White Minimalist Cards */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8A8A8A]">
              {t.stepsTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
              {t.stepsSubtitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#0A0A0A]">
                {t.step1Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {t.step1Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#0A0A0A]">
                {t.step2Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {t.step2Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all space-y-3 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#0A0A0A]">
                {t.step3Title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </section>

        {/* Section Spéciale : Plat du Jour & Semainier */}
        <DailySpecialShowcase
          onOpenProductModal={prod => setSelectedProduct(prod)}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Section 3: NOS INCONTOURNABLES */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-[#EEEEEE] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A8A8A]">
                {t.chefSelectionTitle}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
                {t.featuredDishes}
              </h2>
            </div>

            <Link
              to="/menu"
              className="text-xs sm:text-sm font-bold text-[#0A0A0A] hover:underline flex items-center gap-1.5"
            >
              <span>{t.viewAllMenu}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={prod => setSelectedProduct(prod)}
              />
            ))}
          </div>
        </section>

        {/* Section 4: TERANGA FIDÉLITÉ */}
        <section className="rounded-3xl bg-[#FAFAFA] border border-[#EAEAEA] p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A8A8A]">
                {t.fidelityProgram}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A0A0A] tracking-tight">
                {t.fidelityTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] mt-1">
                {t.fidelityDesc}
              </p>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-lg sm:text-xl text-[#0A0A0A]">
                {t.fidelityOrdersCount}
              </span>
            </div>
          </div>

          {/* Monochrome Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-[#EAEAEA] rounded-full overflow-hidden">
              <div className="h-full bg-[#0A0A0A] rounded-full w-[80%] transition-all duration-500" />
            </div>
            <p className="text-xs font-medium text-[#0A0A0A]">
              {t.fidelityRemaining}
            </p>
          </div>
        </section>

        {/* Section 5: CE QUE DISENT NOS CLIENTS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#EEEEEE] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8A8A8A]">
                {t.reviewsTitle}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
                {t.reviewsHeading}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex text-[#0A0A0A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-[#0A0A0A]" />
                ))}
              </div>
              <span className="font-bold text-sm text-[#0A0A0A]">4.8 / 5</span>
              <span className="text-xs text-[#8A8A8A]">({t.reviewsCount})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] space-y-3 shadow-soft">
              <div className="flex text-[#0A0A0A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#333333] italic leading-relaxed">
                {t.review1Text}
              </p>
              <div className="pt-2 border-t border-[#EEEEEE]">
                <span className="font-bold text-xs text-[#0A0A0A] block">Moussa Diop</span>
                <span className="text-[11px] text-[#8A8A8A]">{t.review1Meta}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] space-y-3 shadow-soft">
              <div className="flex text-[#0A0A0A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#333333] italic leading-relaxed">
                {t.review2Text}
              </p>
              <div className="pt-2 border-t border-[#EEEEEE]">
                <span className="font-bold text-xs text-[#0A0A0A] block">Aïssatou Ndiaye</span>
                <span className="text-[11px] text-[#8A8A8A]">{t.review2Meta}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] space-y-3 shadow-soft">
              <div className="flex text-[#0A0A0A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#333333] italic leading-relaxed">
                {t.review3Text}
              </p>
              <div className="pt-2 border-t border-[#EEEEEE]">
                <span className="font-bold text-xs text-[#0A0A0A] block">Cheikh Seck</span>
                <span className="text-[11px] text-[#8A8A8A]">{t.review3Meta}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Invitation Expérience Culinaire & Commande */}
        <section className="rounded-3xl bg-[#0A0A0A] text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A8A8A]">
              Dakar • Plateau
            </span>
            <h3 className="font-bold text-xl sm:text-2xl text-white">
              Une table vous attend chez {restaurant.name}
            </h3>
            <p className="text-xs sm:text-sm text-[#8A8A8A] max-w-md">
              Scannez le QR Code de votre table ou parcourez notre carte en ligne pour commander vos spécialités préférées en quelques secondes.
            </p>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FAFAFA] text-[#0A0A0A] font-bold text-xs sm:text-sm transition-all shrink-0 active:scale-95 shadow-sm"
          >
            <Utensils className="w-4 h-4" />
            <span>{t.navMenu}</span>
          </Link>
        </section>
      </main>

      {/* Footer — Pure Black Contrast */}
      <footer className="mt-20 bg-[#0A0A0A] text-white border-t border-[#222222] py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#222222] pb-8">
            <div>
              <span className="font-sans font-black text-xl tracking-tight text-white block">
                {restaurant.name}
              </span>
              <p className="text-xs text-[#8A8A8A] mt-1">
                {getRestaurantSlogan(lang)} • {restaurant.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#8A8A8A]">
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
            <p>© {new Date().getFullYear()} {restaurant.name}. {t.footerRights}</p>
            <div className="text-center sm:text-right space-y-0.5">
              <p className="text-white font-medium">
                {t.footerGoratech}
              </p>
              <p className="text-[11px] text-[#8A8A8A]">
                {t.footerSub}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenCart={() => setIsCartOpen(true)} />
    </div>
  );
};
