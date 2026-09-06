import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Flame,
  DollarSign,
  UtensilsCrossed,
  Tags,
  Users,
  QrCode,
  Percent,
  Star,
  BarChart3,
  Lightbulb,
  Award,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  CalendarDays,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useAuth } from '../../store/authContext';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const { restaurant, orders } = useRestaurantStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const newOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const prepOrdersCount = orders.filter(o => o.status === 'PREPARING').length;

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/orders', icon: ClipboardList, label: 'Commandes', badge: newOrdersCount > 0 ? newOrdersCount : undefined },
    { to: '/admin/sales', icon: DollarSign, label: 'Ventes' },
    { to: '/kitchen', icon: Flame, label: 'Cuisine (KDS)', badge: prepOrdersCount > 0 ? prepOrdersCount : undefined },
    { to: '/admin/menu-schedule', icon: CalendarDays, label: 'Menu du Jour & Semaine' },
    { to: '/admin/products', icon: UtensilsCrossed, label: 'Produits' },
    { to: '/admin/categories', icon: Tags, label: 'Catégories' },
    { to: '/admin/tables', icon: Users, label: 'Tables' },
    { to: '/admin/qrcode', icon: QrCode, label: 'QR Codes' },
    { to: '/admin/customers', icon: Users, label: 'Clients' },
    { to: '/admin/promotions', icon: Percent, label: 'Promotions' },
    { to: '/admin/score', icon: Award, label: 'Fidélité & Score (92/100)' },
    { to: '/admin/reviews', icon: Star, label: 'Avis' },
    { to: '/admin/statistics', icon: BarChart3, label: 'Statistiques' },
    { to: '/admin/insights', icon: Lightbulb, label: 'Smart Insights' },
    { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-white border-r border-[#EAEAEA] flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#EEEEEE] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-white shadow-sm">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans font-extrabold text-sm text-[#0A0A0A] tracking-tight block">
              {restaurant.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8A8A8A] bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded">
              Dakar • Plateau
            </span>
          </div>
        </div>
      </div>

      {/* Authenticated User Profile Summary */}
      {user && (
        <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#EEEEEE] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-xs font-bold shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0A0A0A] truncate">
              {user.name}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#666666]">
              <Shield className="w-3 h-3 text-[#0A0A0A]" />
              <span className="font-semibold uppercase tracking-wider">{user.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#0A0A0A] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#0A0A0A] hover:bg-[#FAFAFA]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4" />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0A0A0A] text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#EEEEEE] space-y-1.5 bg-white">
        {/* Open Client View Link */}
        <Link
          to="/menu?table=08"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] hover:border-[#0A0A0A] text-xs font-medium text-[#0A0A0A] transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Voir le menu client</span>
          </div>
        </Link>

        {/* Logout (Se déconnecter) */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50/50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
};
