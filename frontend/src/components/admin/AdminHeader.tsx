import React from 'react';
import { Menu, User, Check, X, ExternalLink } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useNavigate, Link } from 'react-router-dom';
import { formatFCFA } from '../../services/whatsappService';
import { useLanguage } from '../../services/i18n';
import { useAuth } from '../../store/authContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileMenu,
}) => {
  const { notification, dismissNotification, restaurant } = useRestaurantStore();
  const { lang, changeLang, t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EEEEEE] px-3 sm:px-8 py-2.5 sm:py-3.5 flex flex-col gap-2 w-full max-w-full overflow-x-clip">
      <div className="flex items-center justify-between gap-2 min-w-0 w-full">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Menu"
            className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center text-[#0A0A0A] shrink-0"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="font-sans font-bold text-sm sm:text-lg lg:text-xl text-[#0A0A0A] truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-[#8A8A8A] hidden sm:block truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick actions, Language & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#FAFAFA] border border-[#EAEAEA] rounded-full p-0.5 text-[10px] font-bold">
            {(['fr', 'en', 'wo'] as const).map(l => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={`px-2 py-0.5 rounded-full transition-all ${
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

          {/* Quick link to menu */}
          <Link
            to="/menu"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAFAFA] hover:bg-[#EAEAEA] text-xs text-[#0A0A0A] font-semibold border border-[#EAEAEA] transition-colors"
          >
            <span>{t.adminOpenMenu}</span>
            <ExternalLink className="w-3 h-3 text-[#0A0A0A]" />
          </Link>

          {/* User badge */}
          <div className="flex items-center gap-2.5 bg-[#FAFAFA] border border-[#EAEAEA] px-3 py-1.5 rounded-full">
            <div className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-[#0A0A0A] block leading-none">
                {user?.name || t.adminRoleDirector}
              </span>
              <span className="text-[10px] text-[#8A8A8A] leading-none truncate max-w-[120px] block">
                {user?.email || restaurant.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Order Notification Toast Banner */}
      {notification && (
        <div className="bg-[#0A0A0A] text-white border border-[#222222] p-3 rounded-xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {notification.title}
              </p>
              <p className="text-[11px] text-[#8A8A8A]">
                {notification.subtitle} • {formatFCFA(notification.amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                dismissNotification();
                navigate('/admin/kitchen');
              }}
              className="px-3 py-1 rounded-lg bg-white text-[#0A0A0A] text-xs font-bold hover:bg-[#EAEAEA] transition-colors"
            >
              {t.adminSeeKitchen}
            </button>
            <button
              onClick={dismissNotification}
              className="w-6 h-6 rounded-full hover:bg-white/10 text-white flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
