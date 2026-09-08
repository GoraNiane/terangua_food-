import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, QrCode, MapPin, Search, ArrowRight, Globe, ChevronDown, Check } from 'lucide-react';
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

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const isMenu = location.pathname === '/menu';
  const isAbout = location.pathname === '/about';
  const isPromos = location.pathname === '/promotions';
  const isHome = location.pathname === '/';

  // Fermer le popover de langue au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Accès administrateur discret : 5 clics rapides sur le logo en moins de 2,5 secondes
  const clickTimestampsRef = useRef<number[]>([]);

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const recent = clickTimestampsRef.current.filter(t => now - t <= 2500);
    recent.push(now);
    clickTimestampsRef.current = recent;

    if (recent.length >= 5) {
      e.preventDefault();
      clickTimestampsRef.current = [];
      navigate('/admin/login');
      return;
    }

    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const languagesList = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'wo', label: 'Wolof', flag: '🇸🇳' },
  ] as const;

  return (
    <header
      className="sticky top-0 z-40 w-full max-w-full overflow-x-clip bg-white border-b border-[#EAEAEA] transition-all shadow-xs"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Navigation principale TERANGA FOOD */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 w-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0 w-full">
          {/* Brand / Logo avec porte d'accès cachée (5 clics) */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial select-none cursor-pointer group"
            title={restaurant.name}
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#0A0A0A]/10 bg-[#FAFAFA] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs shrink-0">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="font-sans font-extrabold text-xs xs:text-sm sm:text-base md:text-lg tracking-tight text-[#0A0A0A] block truncate leading-tight">
                {restaurant.name}
              </span>
              <p className="text-[10px] sm:text-[11px] text-[#666666] font-medium tracking-normal truncate hidden sm:flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block"></span>
                Dakar • {getRestaurantSlogan(lang)}
              </p>
              <p className="text-[10px] text-[#666666] font-medium tracking-normal truncate sm:hidden flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block"></span>
                Dakar
              </p>
            </div>
          </Link>

          {/* Desktop Minimal Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-medium text-[#666666]">
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

          {/* Right Actions: Rechercher, Table, Langue, Panier */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 sm:py-2 rounded-xl text-xs text-[#0A0A0A] hover:bg-[#F5F5F5] border border-[#E5E5E5] transition-all font-semibold bg-[#FAFAFA] shadow-xs shrink-0 active:scale-95"
            >
              <Search className="w-4 h-4 shrink-0 text-[#0A0A0A]" />
              <span className="hidden sm:inline ml-1.5">{t.searchAction}</span>
            </button>

            {/* Table Indicator Pill (Si scannée) */}
            {activeTable && (
              <button
                onClick={() => {
                  const newTable = prompt(t.tableChangePrompt, activeTable);
                  if (newTable !== null) setActiveTable(newTable.trim() || null);
                }}
                className="flex items-center gap-1 sm:gap-1.5 bg-[#0A0A0A] text-white h-9 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold hover:bg-[#262626] transition-colors shrink-0 shadow-xs"
                title={t.changeBtn}
              >
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.tableLabel} {activeTable}</span>
                <span className="sm:hidden">T.{activeTable}</span>
              </button>
            )}

            {/* Action 2: Langue Responsive */}
            <div className="relative shrink-0" ref={langMenuRef}>
              {/* Trigger Mobile (< md) */}
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Changer de langue"
                className="md:hidden flex items-center gap-1 text-xs font-bold text-[#0A0A0A] bg-[#FAFAFA] hover:bg-[#F5F5F5] border border-[#E5E5E5] h-9 px-2.5 rounded-xl transition-all shadow-xs active:scale-95"
              >
                <Globe className="w-3.5 h-3.5 text-[#0A0A0A]" />
                <span className="uppercase">{lang}</span>
                <ChevronDown className={`w-3 h-3 text-[#737373] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover Mobile Dropdown */}
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-[#EAEAEA] rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in">
                  {languagesList.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLang(l.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors text-left ${
                        lang === l.code ? 'bg-[#FAFAFA] text-[#0A0A0A] font-bold' : 'text-[#666666] hover:bg-[#F5F5F5]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {lang === l.code && <Check className="w-4 h-4 text-[#0A0A0A]" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Segmented Pill Desktop (>= md) */}
              <div className="hidden md:flex items-center bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-0.5 text-[11px] font-bold">
                {languagesList.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLang(l.code)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      lang === l.code
                        ? 'bg-[#0A0A0A] text-white shadow-xs'
                        : 'text-[#666666] hover:text-[#0A0A0A]'
                    }`}
                    title={l.label}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action 3: Panier (Bouton Premium Sombre à Fort Contraste avec Pastille Dorée) */}
            <button
              onClick={onOpenCart}
              aria-label={t.navCart}
              title={t.navCart}
              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0A0A0A] hover:bg-[#262626] text-white transition-all duration-200 active:scale-95 shadow-sm shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-black text-[10px] font-black shadow-xs ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Action 4: Commander CTA (Grand écran uniquement) */}
            <Link
              to="/menu"
              className="hidden xl:inline-flex items-center gap-1.5 bg-[#0A0A0A] hover:bg-[#262626] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95 shrink-0"
            >
              <span>{t.orderBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bandeau promotionnel défilant sous le header (noir à texte blanc, infini, pleine largeur garantie) */}
      <PromotionalMarquee />
    </header>
  );
};
