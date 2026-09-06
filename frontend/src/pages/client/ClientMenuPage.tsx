import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag, Filter, Flame, Gift } from 'lucide-react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore';
import { ClientHeader } from '../../components/client/ClientHeader';
import { CategoryPills } from '../../components/client/CategoryPills';
import { ProductCard } from '../../components/client/ProductCard';
import { ProductModal } from '../../components/client/ProductModal';
import { CartDrawer } from '../../components/client/CartDrawer';
import { BottomNav } from '../../components/client/BottomNav';
import { SmartTableBanner } from '../../components/client/SmartTableBanner';
import { PromotionBanner } from '../../components/client/PromotionBanner';
import { useLanguage, getProductName, getProductDescription, getIngredientName } from '../../services/i18n';
import { Product } from '../../types';
import { formatFCFA } from '../../services/whatsappService';

export const ClientMenuPage: React.FC = () => {
  const { categories, products, cartCount, cartTotal, setActiveTable, getTodaySchedule } = useRestaurantStore();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { tableNumber: pathTable } = useParams<{ tableNumber?: string }>();
  const todaySpecial = getTodaySchedule();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular' | 'name'>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auto-detect table param from QR Code (?table=05 ou /table/05)
  useEffect(() => {
    const rawTable = searchParams.get('table') || pathTable;
    if (rawTable) {
      const formatted = String(rawTable).trim().padStart(2, '0');
      setActiveTable(formatted);
    }
  }, [searchParams, pathTable, setActiveTable]);

  // Filter products by category and search query (supporting original and translated names/desc/ingredients)
  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategoryId === null || product.categoryId === selectedCategoryId;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const translatedName = getProductName(product, lang).toLowerCase();
    const translatedDesc = getProductDescription(product, lang).toLowerCase();
    const matchesName = product.name.toLowerCase().includes(query) || translatedName.includes(query);
    const matchesDesc = product.description.toLowerCase().includes(query) || translatedDesc.includes(query);
    const matchesIng = product.ingredients.some(
      i => i.toLowerCase().includes(query) || getIngredientName(i, lang).toLowerCase().includes(query)
    );

    return matchesCategory && (matchesName || matchesDesc || matchesIng);
  });

  // Sort products according to selected criteria
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'popular') {
      const scoreA = (a.isFeatured ? 2 : 0) + (a.badge ? 1 : 0);
      const scoreB = (b.isFeatured ? 2 : 0) + (b.badge ? 1 : 0);
      return scoreB - scoreA;
    }
    if (sortBy === 'name') {
      const nameA = getProductName(a, lang);
      const nameB = getProductName(b, lang);
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] pb-28 sm:pb-16 selection:bg-[#0A0A0A] selection:text-white">
      <ClientHeader onOpenCart={() => setIsCartOpen(true)} />

      {/* Smart Table Banner if Table Scanned */}
      <SmartTableBanner />

      {/* Daily Promotion Banner */}
      <PromotionBanner />

      {/* Bandeau Plat du Jour */}
      {todaySpecial?.schedule?.isActive && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-200/60 px-2 py-0.5 rounded-md">
                    Plat du Jour • {todaySpecial.schedule.dayName}
                  </span>
                  {todaySpecial.schedule.specialPrice && (
                    <span className="text-xs font-black text-emerald-800">
                      Formule : {formatFCFA(todaySpecial.schedule.specialPrice)}
                    </span>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0A0A0A] truncate mt-0.5">
                  {todaySpecial.schedule.themeTitle}
                </h3>
              </div>
            </div>

            {todaySpecial.products[0] && (
              <button
                type="button"
                onClick={() => setSelectedProduct(todaySpecial.products[0])}
                className="px-4 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold shrink-0 self-start sm:self-auto transition-all shadow-xs"
              >
                Découvrir la formule
              </button>
            )}
          </div>
        </div>
      )}

      {/* Menu Title Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <h1 className="font-sans font-black text-2xl sm:text-4xl text-[#0A0A0A] tracking-tight uppercase">
          {t.menuPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8A8A] mt-1 font-normal">
          {t.menuPageSubtitle}
        </p>
      </div>

      {/* Sticky Search & Category Pills */}
      <div className="sticky top-[101px] sm:top-[105px] z-30 bg-white/95 backdrop-blur-md border-b border-[#EEEEEE] py-3 space-y-2.5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#0A0A0A] placeholder:text-[#8A8A8A] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#EAEAEA] flex items-center justify-center text-[#0A0A0A] hover:bg-[#D5D5D5]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Category horizontal pills */}
        <CategoryPills
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={catId => setSelectedCategoryId(catId)}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        {/* Results Counter / Category Title & Sort Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 text-xs text-[#8A8A8A] border-b border-[#EEEEEE] pb-3 mb-2">
          <div className="flex items-center gap-3">
            <span>
              {sortedProducts.length}{' '}
              {sortedProducts.length > 1 ? t.dishesCountPlural : t.dishesCountSingular}
            </span>
            {selectedCategoryId && (
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="text-[#0A0A0A] font-bold hover:underline flex items-center gap-1"
              >
                <span>{t.resetFilter}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#8A8A8A] hidden sm:inline">
              {t.sortLabel}
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#FAFAFA] border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-2.5 py-1.5 text-xs text-[#0A0A0A] font-semibold outline-none cursor-pointer"
            >
              <option value="default">{t.sortDefault}</option>
              <option value="popular">{t.sortPopular}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
              <option value="name">{t.sortName}</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F3F3F3] mx-auto flex items-center justify-center text-[#0A0A0A] border border-[#EAEAEA]">
              <Filter className="w-5 h-5 opacity-70" />
            </div>
            <h3 className="font-bold text-base text-[#0A0A0A]">
              {t.noDishFoundTitle}
            </h3>
            <p className="text-xs text-[#8A8A8A] max-w-sm mx-auto">
              {t.noDishFoundDesc}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#262626] transition-colors"
            >
              {t.viewAllDishesBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={prod => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar for mobile when items are in cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 z-30 sm:max-w-md sm:mx-auto animate-fade-in">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0A0A0A] text-white shadow-xl hover:bg-[#262626] transition-all active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white text-[#0A0A0A] flex items-center justify-center text-xs font-black">
                {cartCount}
              </div>
              <span className="font-bold text-xs sm:text-sm tracking-wide">
                {t.viewCartBtn}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-black text-sm">
              <span>{formatFCFA(cartTotal)}</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Product Details Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Bottom Navigation */}
      <BottomNav onOpenCart={() => setIsCartOpen(true)} />
    </div>
  );
};
