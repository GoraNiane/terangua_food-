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
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip bg-white/95 backdrop-blur-md transition-all">
      {/* Navigation principale TERANGA FOOD */}
      <div className="border-b border-[#EEEEEE] px-2.5 sm:px-4 py-2 sm:py-3 w-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4 min-w-0 w-full">
          {/* Brand / Logo avec porte d'accès cachée (5 clics) */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial select-none cursor-pointer group"
            title={restaurant.name}
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-[#EAEAEA] bg-[#FAFAFA] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs shrink-0">
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
              <p className="text-[10px] sm:text-[11px] text-[#8A8A8A] tracking-normal truncate hidden sm:block">
                Dakar • {getRestaurantSlogan(lang)}
              </p>
              <p className="text-[9px] xs:text-[10px] text-[#8A8A8A] tracking-normal truncate sm:hidden">
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
              className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-full text-xs text-[#666666] hover:text-[#0A0A0A] border border-[#EAEAEA] hover:border-[#0A0A0A] transition-colors font-medium bg-white shadow-xs shrink-0"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline ml-1.5">{t.searchAction}</span>
            </button>

            {/* Table Indicator Pill (Si scannée) */}
            {activeTable && (
              <button
                onClick={() => {
                  const newTable = prompt(t.tableChangePrompt, activeTable);
                  if (newTable !== null) setActiveTable(newTable.trim() || null);
                }}
                className="flex items-center gap-1 sm:gap-1.5 bg-[#0A0A0A] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold hover:bg-[#262626] transition-colors shrink-0"
                title={t.changeBtn}
              >
                <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t.tableLabel} {activeTable}</span>
                <span className="sm:hidden">T.{activeTable}</span>
              </button>
            )}

            {/* Action 2: Langue Responsive (Menu déroulant compact sur mobile, pilule complète sur desktop) */}
            <div className="relative shrink-0" ref={langMenuRef}>
              {/* Trigger Mobile (< md) */}
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Changer de langue"
                className="md:hidden flex items-center gap-1 text-[10px] font-bold text-[#0A0A0A] bg-[#FAFAFA] border border-[#EAEAEA] hover:border-[#0A0A0A] px-2 py-1 rounded-full transition-colors shadow-xs"
              >
                <Globe className="w-3 h-3 text-[#666666]" />
                <span className="uppercase">{lang}</span>
                <ChevronDown className={`w-2.5 h-2.5 text-[#8A8A8A] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover Mobile Dropdown */}
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-[#EAEAEA] rounded-2xl shadow-xl py-1 z-50 animate-fade-in">
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
                        <span className="text-sm">{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {lang === l.code && <Check className="w-3.5 h-3.5 text-[#0A0A0A]" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Segmented Pill Desktop (>= md) */}
              <div className="hidden md:flex items-center bg-[#FAFAFA] border border-[#EAEAEA] rounded-full p-0.5 text-[10px] font-bold">
                {languagesList.map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLang(l.code)}
                    className={`px-2 py-0.5 rounded-full transition-all ${
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

            {/* Action 3: Panier (Toujours 100% visible et cliquable) */}
            <button
              onClick={onOpenCart}
              aria-label={t.navCart}
              title={t.navCart}
              className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] text-[#0A0A0A] transition-all duration-200 active:scale-95 shadow-xs shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-[#0A0A0A] text-white text-[9px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Action 4: Commander CTA (Grand écran uniquement) */}
            <Link
              to="/menu"
              className="hidden xl:inline-flex items-center gap-1.5 bg-[#0A0A0A] hover:bg-[#262626] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 shrink-0"
            >
              <span>{t.orderBtn}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bandeau promotionnel défilant sous le header (noir à texte blanc, infini, pleine largeur garantie) */}
      <PromotionalMarquee />
    </header>
  );
};
