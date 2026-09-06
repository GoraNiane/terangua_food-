import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  PieChart as PieIcon,
  Filter,
  Calendar,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { StatCard } from '../../components/admin/StatCard';
import { formatFCFA } from '../../services/whatsappService';

type PeriodType = 'today' | '7days' | '30days' | '3months' | 'custom';

export const AdminStatisticsPage: React.FC = () => {
  const { orders } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('today');

  const totalRevenue = orders.reduce((s, o) => s + (o.status !== 'CANCELLED' ? o.total : 0), 0);
  const totalItemsSold = orders.reduce(
    (s, o) => s + o.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const avgBasket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 8250;

  // Peak hours data (Section 43)
  const peakHoursData = [
    { hour: '11h', commandes: 4, bar: '██' },
    { hour: '12h', commandes: 16, bar: '█████' },
    { hour: '13h', commandes: 28, bar: '███████' },
    { hour: '14h', commandes: 12, bar: '███' },
    { hour: '15h', commandes: 6, bar: '██' },
    { hour: '18h', commandes: 10, bar: '███' },
    { hour: '19h', commandes: 32, bar: '█████████' },
    { hour: '20h', commandes: 44, bar: '███████████', isPeak: true },
    { hour: '21h', commandes: 26, bar: '███████' },
    { hour: '22h', commandes: 14, bar: '████' },
  ];

  // Sales Trend based on filter period
  const trendDataToday = [
    { label: '11h', ca: 15000, commandes: 3 },
    { label: '12h', ca: 48000, commandes: 9 },
    { label: '13h', ca: 72000, commandes: 14 },
    { label: '14h', ca: 39000, commandes: 7 },
    { label: '18h', ca: 24000, commandes: 5 },
    { label: '19h', ca: 68000, commandes: 13 },
    { label: '20h', ca: 95000, commandes: 18 },
    { label: '21h', ca: 62000, commandes: 12 },
    { label: '22h', ca: 32000, commandes: 6 },
  ];

  const trendData7Days = [
    { label: 'Lun', ca: 210000, commandes: 42 },
    { label: 'Mar', ca: 245000, commandes: 48 },
    { label: 'Mer', ca: 280000, commandes: 55 },
    { label: 'Jeu', ca: 295000, commandes: 58 },
    { label: 'Ven', ca: 420000, commandes: 82 },
    { label: 'Sam', ca: 490000, commandes: 96 },
    { label: 'Dim', ca: 440000, commandes: 88 },
  ];

  const trendData30Days = [
    { label: 'Sem 1', ca: 1650000, commandes: 320 },
    { label: 'Sem 2', ca: 1820000, commandes: 355 },
    { label: 'Sem 3', ca: 2100000, commandes: 410 },
    { label: 'Sem 4', ca: 2350000, commandes: 460 },
  ];

  const trendData3Months = [
    { label: 'Mois 1', ca: 7450000, commandes: 1450 },
    { label: 'Mois 2', ca: 8200000, commandes: 1620 },
    { label: 'Mois 3', ca: 9100000, commandes: 1780 },
  ];

  const activeTrendData =
    period === 'today'
      ? trendDataToday
      : period === '7days'
      ? trendData7Days
      : period === '30days'
      ? trendData30Days
      : trendData3Months;

  // Top Selling Dishes (Section 42)
  const topDishes = [
    { rank: 1, name: 'Poulet Braisé Teranga', sales: 45, ca: 202500, evolution: '+18,5%' },
    { rank: 2, name: 'Thiéboudienne Penda Mbaye', sales: 38, ca: 171000, evolution: '+12,0%' },
    { rank: 3, name: 'Burger Dakar Signature', sales: 32, ca: 112000, evolution: '+24,2%' },
    { rank: 4, name: 'Yassa Poulet Fermier', sales: 26, ca: 104000, evolution: '+8,4%' },
    { rank: 5, name: 'Jus de Bissap Royal', sales: 58, ca: 58000, evolution: '+15,0%' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="fixed inset-y-0 w-64">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs h-full">
            <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Statistiques Commerciales"
          subtitle="Analyse financière, heures de pointe et performance des plats"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Section 40: Filtres Temporels */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EAEAEA] shadow-soft">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
              <Calendar className="w-4 h-4 text-[#0A0A0A]" />
              <span>Période d'analyse :</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { id: 'today', label: "Aujourd'hui" },
                  { id: '7days', label: '7 jours' },
                  { id: '30days', label: '30 jours' },
                  { id: '3months', label: '3 mois' },
                  { id: 'custom', label: 'Personnalisé' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPeriod(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    period === tab.id
                      ? 'bg-[#0A0A0A] text-white shadow-sm'
                      : 'bg-[#F5F5F5] hover:bg-gray-200 text-[#333333]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 40: 4 Grands KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Chiffre d'affaires"
              value={formatFCFA(totalRevenue || 245000)}
              evolution="+12,5 %"
              isPositive={true}
              icon={DollarSign}
              subtitle="vs. période précédente"
            />
            <StatCard
              title="Commandes"
              value={String(orders.length || 68)}
              evolution="+8,2 %"
              isPositive={true}
              icon={ShoppingBag}
              subtitle="Toutes tables & emporter"
            />
            <StatCard
              title="Panier moyen"
              value={formatFCFA(avgBasket || 8250)}
              evolution="+4,1 %"
              isPositive={true}
              icon={TrendingUp}
              subtitle="Ticket moyen par client"
            />
            <StatCard
              title="Produits vendus"
              value={String(totalItemsSold || 142)}
              evolution="+16,4 %"
              isPositive={true}
              icon={Award}
              subtitle="Portions et boissons servies"
            />
          </div>

          {/* Section 41: Graphique des Ventes (Monochrome Noir et Gris) */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAEAEA] shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-sans font-black text-base sm:text-lg text-[#0A0A0A]">
                  ÉVOLUTION DES VENTES (FCFA)
                </h3>
                <p className="text-xs text-[#888888]">
                  Chiffre d'affaires et volume des commandes selon la période sélectionnée
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#F5F5F5] px-3 py-1 rounded-full text-[#0A0A0A]">
                Palette Monochrome GORATECH
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" vertical={false} />
                  <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#0A0A0A',
                      borderRadius: '0.75rem',
                      color: '#0A0A0A',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [formatFCFA(val), 'Chiffre']}
                  />
                  <Area
                    type="monotone"
                    dataKey="ca"
                    stroke="#0A0A0A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCA)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Section 42: Produits les plus vendus */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#EAEAEA] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-black text-base text-[#0A0A0A]">
                    PRODUITS LES PLUS VENDUS
                  </h3>
                  <p className="text-xs text-[#888888]">
                    Top 5 des plats générateurs de revenus
                  </p>
                </div>
                <Award className="w-5 h-5 text-[#0A0A0A]" />
              </div>

              <div className="divide-y divide-[#EEEEEE]">
                {topDishes.map(dish => (
                  <div key={dish.rank} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-mono font-bold text-xs">
                        {dish.rank}
                      </span>
                      <div>
                        <span className="font-bold text-[#0A0A0A] block">{dish.name}</span>
                        <span className="text-[11px] text-[#888888]">{dish.sales} portions vendues</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[#0A0A0A] block">{formatFCFA(dish.ca)}</span>
                      <span className="text-[11px] text-[#0A0A0A] font-semibold">{dish.evolution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 43: Heures de forte activité */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-[#EAEAEA] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-black text-base text-[#0A0A0A]">
                    HEURES LES PLUS ACTIVES
                  </h3>
                  <p className="text-xs text-[#888888]">
                    Affluence horaire constatée
                  </p>
                </div>
                <Clock className="w-5 h-5 text-[#0A0A0A]" />
              </div>

              {/* Peak Hour Highlight Card */}
              <div className="p-3.5 rounded-2xl bg-[#0A0A0A] text-white space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#BDBDBD] block">
                  Heure de pointe maximale
                </span>
                <p className="font-sans font-black text-xl">
                  20h00 — Service du dîner
                </p>
                <p className="text-xs text-[#EAEAEA]">
                  44 commandes concentrées sur ce créneau (31% de la journée).
                </p>
              </div>

              {/* Bar visualization according to Section 43 */}
              <div className="space-y-2 pt-2 text-xs font-mono">
                {peakHoursData.map(item => (
                  <div
                    key={item.hour}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                      item.isPeak ? 'bg-[#FAFAFA] border border-[#0A0A0A] font-bold' : ''
                    }`}
                  >
                    <span className="w-8 font-bold text-[#0A0A0A]">{item.hour}</span>
                    <span className="text-xs tracking-tighter text-[#0A0A0A] flex-1 px-3">
                      {item.bar}
                    </span>
                    <span className="text-[#666666] font-sans text-xs">
                      {item.commandes} cmd
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
