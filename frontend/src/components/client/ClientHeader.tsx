import React from 'react';
import { ShoppingBag, QrCode, MapPin, Search, ArrowRight } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PromotionalMarquee } from './PromotionalMarquee';
import { useLanguage, getRestaurantSlogan } from '../../services/i18n';

interface ClientHeaderProps {
  onOpenCart?: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({ onOpenCart }) => {
  const { restaurant, cartCount, activeTable, setActiveTable } = useRestaurantStore();
  const { lang, changeLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isMenu = location.pathname === '/menu';
  const isAbout = location.pathname === '/about';
  const isPromos = location.pathname === '/promotions';
  const isHome = location.pathname === '/';

  // Accès administrateur discret : 5 clics rapides sur le logo en moins de 1,5 seconde
  const clickTimestampsRef = React.useRef<number[]>([]);

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    // Conserver uniquement les clics survenus dans la fenêtre de 2500ms (5 clics naturels)
    const recent = clickTimestampsRef.current.filter(t => now - t <= 2500);
    recent.push(now);
    clickTimestampsRef.current = recent;

    if (recent.length >= 5) {
      e.preventDefault();
      clickTimestampsRef.current = [];
      navigate('/admin/login');
      return;
    }

    // Comportement habituel pour un clic unique client
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md transition-all">
      {/* Navigation principale TERANGA FOOD */}
      <div className="border-b border-[#EEEEEE] px-4 py-3 sm:py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand / Logo avec porte d'accès cachée (5 clics en 1,5s) */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group shrink-0 select-none cursor-pointer"
            title={restaurant.name}
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#EAEAEA] bg-[#FAFAFA] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-sans font-extrabold text-base sm:text-lg tracking-tight text-[#0A0A0A]">
                {restaurant.name}
              </span>
              <p className="text-[11px] text-[#8A8A8A] tracking-normal line-clamp-1">
                Dakar • {getRestaurantSlogan(lang)}
              </p>
            </div>
          </Link>

          {/* Desktop Minimal Navigation Links (Accueil, Menu, À propos, Promotions, Contact) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-[#666666]">
            <Link
              to="/"
              className={`transition-colors hover:text-[#0A0A0A] ${isHome ? 'text-[#0A0A0A] font-bold border-b-2 border-[#0A0A0A] pb-0.5' : ''}`}
            >
              {t.navHome}
            </Link>
            <Link
              to="/menu"
              className={`transition-colors hover:text-[#0A0A0A] ${isMenu ? 'text-[#0A0A0A] font-bold border-b-2 border-[#0A0A0A] pb-0.5' : ''}`}
            >
              {t.navMenu}
            </Link>
            <Link
              to="/about"
              className={`transition-colors hover:text-[#0A0A0A] ${isAbout ? 'text-[#0A0A0A] font-bold border-b-2 border-[#0A0A0A] pb-0.5' : ''}`}
            >
              {t.navAbout}
            </Link>
            <Link
              to="/promotions"
              className={`transition-colors hover:text-[#0A0A0A] ${isPromos ? 'text-[#0A0A0A] font-bold border-b-2 border-[#0A0A0A] pb-0.5' : ''}`}
            >
              {t.navPromotions}
            </Link>
            <a
              href="/about#contact"
              className="transition-colors hover:text-[#0A0A0A]"
            >
              {t.navContact}
            </a>
          </nav>

          {/* Right Actions: Rechercher, Panier, Langue, Commander */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Action 1: Rechercher */}
            <button
              onClick={() => {
                if (isMenu) {
                  const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement | null;
                  searchInput?.focus();
                } else {
                  navigate('/menu?focus=1');
                }
              }}
              aria-label={t.searchAction}
              title={t.searchAction}
              className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#0A0A0A] border border-[#EAEAEA] hover:border-[#0A0A0A] px-2.5 sm:px-3 py-1.5 rounded-full transition-colors font-medium bg-white shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.searchAction}</span>
            </button>

            {/* Table Indicator Pill */}
            {activeTable ? (
              <button
                onClick={() => {
                  const newTable = prompt(t.tableChangePrompt, activeTable);
                  if (newTable !== null) setActiveTable(newTable.trim() || null);
                }}
                className="flex items-center gap-1.5 bg-[#0A0A0A] text-white px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#262626] transition-colors"
                title={t.changeBtn}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{t.tableLabel} {activeTable}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  const table = prompt(t.tableEnterPrompt);
                  if (table) setActiveTable(table.trim());
                }}
                className="hidden xl:flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#0A0A0A] border border-[#EAEAEA] hover:border-[#0A0A0A] px-2.5 py-1.5 rounded-full transition-colors font-medium bg-white"
              >
                <MapPin className="w-3 h-3" />
                <span>{t.dineInShort}</span>
              </button>
            )}

            {/* Action 2: Langue (FR / EN / WO) */}
            <div className="flex items-center bg-[#FAFAFA] border border-[#EAEAEA] rounded-full p-0.5 text-[10px] font-bold">
              {(['fr', 'en', 'wo'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className={`px-1.5 sm:px-2 py-0.5 rounded-full transition-all ${
                    lang === l
                      ? 'bg-[#0A0A0A] text-white shadow-xs'
                      : 'text-[#666666] hover:text-[#0A0A0A]'
                  }`}
                  title={l === 'fr' ? 'Français' : l === 'en' ? 'English' : 'Wolof'}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Action 3: Panier */}
            <button
              onClick={onOpenCart}
              aria-label={t.navCart}
              title={t.navCart}
              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] text-[#0A0A0A] transition-all duration-200 active:scale-95 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#0A0A0A] text-white text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Action 4: Commander CTA */}
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#0A0A0A] hover:bg-[#262626] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95"
            >
              <span>{t.orderBtn}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bandeau promotionnel défilant sous le header (noir à texte blanc, infini, pause survol) */}
      <PromotionalMarquee />
    </header>
  );
};
