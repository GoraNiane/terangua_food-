import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../store/authContext';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { StatCard } from '../../components/admin/StatCard';
import { formatFCFA } from '../../services/whatsappService';
import { ENDPOINTS } from '../../config/api';

type PeriodType = 'today' | '7days' | '30days' | '3months' | 'custom';

export const AdminStatisticsPage: React.FC = () => {
  const { token } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('today');
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const authToken = token || localStorage.getItem('teranga_auth_token');
      const res = await fetch(`${ENDPOINTS.STATISTICS}?period=${period}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [period, token]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const kpis = stats?.kpis || {
    totalRevenue: 0,
    ordersCount: 0,
    salesCount: 0,
    averageBasket: 0,
    itemsSold: 0,
    revenueEvolutionPercent: 0,
    ordersEvolutionPercent: 0,
    basketEvolutionPercent: 0,
    itemsEvolutionPercent: 0,
  };

  const activeTrendData = stats?.charts?.evolution || [];
  const topDishes = (stats?.charts?.topProducts || []).map((prod: any, idx: number) => ({
    rank: idx + 1,
    name: prod.name,
    sales: prod.sales,
    ca: prod.revenue || prod.sales * (prod.price || 0),
    evolution: `${prod.sales} ventes`,
  }));

  const peakHoursData = (stats?.charts?.peakHours || []).map((ph: any) => ({
    hour: ph.hour,
    commandes: ph.orders || 0,
    bar: '█'.repeat(Math.max(1, Math.min(12, ph.orders || 1))),
    isPeak: ph.level === 4,
    label: ph.label,
  }));

  const bestPeak = peakHoursData.find((p: any) => p.isPeak) || peakHoursData[0] || null;

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
          subtitle="Analyse financière, heures de pointe et performance des plats (100% données réelles)"
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

              <button
                onClick={() => fetchStats()}
                disabled={isLoading}
                className="ml-2 px-3 py-1.5 rounded-xl bg-white border border-[#EAEAEA] hover:bg-[#FAFAFA] text-xs font-bold text-[#0A0A0A] inline-flex items-center gap-1.5 shadow-xs"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Rafraîchir</span>
              </button>
            </div>
          </div>

          {/* Section 40: 4 Grands KPIs Réels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Chiffre d'affaires"
              value={formatFCFA(kpis.totalRevenue)}
              evolution={`${kpis.revenueEvolutionPercent >= 0 ? '+' : ''}${kpis.revenueEvolutionPercent.toFixed(1)} %`}
              isPositive={kpis.revenueEvolutionPercent >= 0}
              icon={DollarSign}
              subtitle="Commandes servies exclusivement"
            />
            <StatCard
              title="Commandes"
              value={String(kpis.ordersCount)}
              evolution={`${kpis.ordersEvolutionPercent >= 0 ? '+' : ''}${kpis.ordersEvolutionPercent.toFixed(1)} %`}
              isPositive={kpis.ordersEvolutionPercent >= 0}
              icon={ShoppingBag}
              subtitle="Toutes tables & emporter"
            />
            <StatCard
              title="Panier moyen"
              value={formatFCFA(kpis.averageBasket)}
              evolution={`${kpis.basketEvolutionPercent >= 0 ? '+' : ''}${kpis.basketEvolutionPercent.toFixed(1)} %`}
              isPositive={kpis.basketEvolutionPercent >= 0}
              icon={TrendingUp}
              subtitle="Ticket moyen par table servie"
            />
            <StatCard
              title="Produits vendus"
              value={String(kpis.itemsSold)}
              evolution={`${kpis.itemsEvolutionPercent >= 0 ? '+' : ''}${kpis.itemsEvolutionPercent.toFixed(1)} %`}
              isPositive={kpis.itemsEvolutionPercent >= 0}
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
                  Chiffre d'affaires et volume des commandes réelles selon la période sélectionnée
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-[#F5F5F5] px-3 py-1 rounded-full text-[#0A0A0A]">
                Données Réelles DB
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              {activeTrendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#888888]">
                  Aucune vente finalisée sur cette période.
                </div>
              ) : (
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
              )}
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
                    Classement des plats générateurs de revenus réels
                  </p>
                </div>
                <Award className="w-5 h-5 text-[#0A0A0A]" />
              </div>

              <div className="divide-y divide-[#EEEEEE]">
                {topDishes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#888888]">
                    Aucune vente enregistrée pour cette période.
                  </div>
                ) : (
                  topDishes.map((dish: any) => (
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
                  ))
                )}
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
                    Affluence horaire constatée en direct
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
                  {bestPeak ? `${bestPeak.hour} — Pic d'affluence` : 'Aucun pic détecté'}
                </p>
                <p className="text-xs text-[#EAEAEA]">
                  {bestPeak
                    ? `${bestPeak.commandes} commandes enregistrées sur ce créneau.`
                    : 'Les commandes servies détermineront automatiquement les heures de pointe.'}
                </p>
              </div>

              {/* Bar visualization according to Section 43 */}
              <div className="space-y-2 pt-2 text-xs font-mono">
                {peakHoursData.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#888888] font-sans">
                    Aucune affluence enregistrée sur cette période.
                  </div>
                ) : (
                  peakHoursData.map((item: any) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
