import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  Clock,
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { StatCard } from '../../components/admin/StatCard';
import { OrderStatusBadge } from '../../components/admin/OrderStatusBadge';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { formatFCFA } from '../../services/whatsappService';
import { Link } from 'react-router-dom';
import { Order } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { orders } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [period, setPeriod] = useState<'today' | '7days' | '30days' | '3months' | '1year'>('today');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Section 16 & 17 Chart data based on filter
  const chartDataToday = [
    { time: '11h', ca: 15000, commandes: 3 },
    { time: '12h', ca: 48000, commandes: 8 },
    { time: '13h', ca: 72000, commandes: 12 },
    { time: '14h', ca: 39000, commandes: 6 },
    { time: '18h', ca: 24000, commandes: 4 },
    { time: '19h', ca: 56000, commandes: 9 },
    { time: '20h', ca: 84000, commandes: 14 },
    { time: '21h', ca: 62000, commandes: 10 },
    { time: '22h', ca: 32000, commandes: 5 },
  ];

  const chartData7Days = [
    { time: 'Lun', ca: 210000, commandes: 35 },
    { time: 'Mar', ca: 245000, commandes: 40 },
    { time: 'Mer', ca: 280000, commandes: 46 },
    { time: 'Jeu', ca: 295000, commandes: 49 },
    { time: 'Ven', ca: 420000, commandes: 69 },
    { time: 'Sam', ca: 490000, commandes: 81 },
    { time: 'Dim', ca: 440000, commandes: 73 },
  ];

  const chartData30Days = [
    { time: 'Semaine 1', ca: 1650000, commandes: 270 },
    { time: 'Semaine 2', ca: 1820000, commandes: 300 },
    { time: 'Semaine 3', ca: 2100000, commandes: 345 },
    { time: 'Semaine 4', ca: 2350000, commandes: 390 },
  ];

  const chartData3Months = [
    { time: 'Mois 1', ca: 7450000, commandes: 1230 },
    { time: 'Mois 2', ca: 8200000, commandes: 1350 },
    { time: 'Mois 3', ca: 9100000, commandes: 1500 },
  ];

  const chartData1Year = [
    { time: 'Trimestre 1', ca: 22500000, commandes: 3700 },
    { time: 'Trimestre 2', ca: 25800000, commandes: 4250 },
    { time: 'Trimestre 3', ca: 28400000, commandes: 4680 },
    { time: 'Trimestre 4', ca: 31200000, commandes: 5140 },
  ];

  const chartData =
    period === 'today'
      ? chartDataToday
      : period === '7days'
      ? chartData7Days
      : period === '30days'
      ? chartData30Days
      : period === '3months'
      ? chartData3Months
      : chartData1Year;

  const recentOrders = orders.slice(0, 6);

  // Section 18: Top 4 produits les plus vendus
  const topDishes = [
    {
      name: 'Thiéboudienne',
      sales: 142,
      price: 6500,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Yassa Poulet',
      sales: 118,
      price: 5500,
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Mafé',
      sales: 96,
      price: 5000,
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Burger Teranga',
      sales: 74,
      price: 4500,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
    },
  ];

  // Section 19: Visualisation des heures de pointe
  const peakHours = [
    { hour: '12h00', label: 'faible', level: 1, bar: 'w-1/4 bg-[#D5D5D5]' },
    { hour: '13h00', label: 'moyen', level: 2, bar: 'w-1/2 bg-[#888888]' },
    { hour: '14h00', label: 'très élevé', level: 4, bar: 'w-full bg-[#0A0A0A]' },
    { hour: '20h00', label: 'élevé', level: 3, bar: 'w-3/4 bg-[#333333]' },
    { hour: '21h00', label: 'très élevé', level: 4, bar: 'w-full bg-[#0A0A0A]' },
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs h-full">
            <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Tableau de bord"
          subtitle="Aperçu des performances commerciales et des commandes"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Header Title with Link to Ventes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight">
                BONJOUR 👋
              </h1>
              <p className="text-xs text-[#888888]">
                Voici l’activité en direct de TERANGA FOOD aujourd’hui.
              </p>
            </div>

            <Link
              to="/admin/sales"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
            >
              <DollarSign className="w-4 h-4" />
              <span>Consulter les Ventes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Section 16: DASHBOARD KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="CA aujourd'hui"
              value="285 000 FCFA"
              evolution="+18,4%"
              isPositive={true}
              icon={DollarSign}
              subtitle="vs. hier même heure"
            />
            <StatCard
              title="Commandes"
              value="47"
              evolution="+12,7%"
              isPositive={true}
              icon={ShoppingBag}
              subtitle="Toutes tables & à emporter"
            />
            <StatCard
              title="Clients"
              value="38"
              evolution="+14,0%"
              isPositive={true}
              icon={Users}
              subtitle="Clients uniques servis"
            />
            <StatCard
              title="Panier moyen"
              value="6 063 FCFA"
              evolution="+4,1%"
              isPositive={true}
              icon={TrendingUp}
              subtitle="Ticket moyen par couvert"
            />
          </div>

          {/* Section 17: GRAPHIQUE DES VENTES */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] space-y-6 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans font-bold text-base sm:text-lg text-[#0A0A0A]">
                  Évolution du chiffre d'affaires
                </h3>
                <p className="text-xs text-[#8A8A8A]">
                  Volume de commandes et revenus générés en direct
                </p>
              </div>

              {/* 5 Filtres: Aujourd'hui, 7 jours, 30 jours, 3 mois, 1 an */}
              <div className="flex flex-wrap items-center gap-1 bg-[#FAFAFA] border border-[#EAEAEA] p-1 rounded-xl self-start">
                <button
                  onClick={() => setPeriod('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === 'today'
                      ? 'bg-[#0A0A0A] text-white shadow-sm'
                      : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
                  }`}
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setPeriod('7days')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === '7days'
                      ? 'bg-[#0A0A0A] text-white shadow-sm'
                      : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
                  }`}
                >
                  7 jours
                </button>
                <button
                  onClick={() => setPeriod('30days')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === '30days'
                      ? 'bg-[#0A0A0A] text-white shadow-sm'
                      : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
                  }`}
                >
                  30 jours
                </button>
                <button
                  onClick={() => setPeriod('3months')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === '3months'
                      ? 'bg-[#0A0A0A] text-white shadow-sm'
                      : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
                  }`}
                >
                  3 mois
                </button>
                <button
                  onClick={() => setPeriod('1year')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === '1year'
                      ? 'bg-[#0A0A0A] text-white shadow-sm'
                      : 'text-[#8A8A8A] hover:text-[#0A0A0A]'
                  }`}
                >
                  1 an
                </button>
              </div>
            </div>

            {/* Recharts Monochrome Area Chart */}
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="monoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="time" stroke="#8A8A8A" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#8A8A8A"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={val => `${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#EAEAEA',
                      borderRadius: '0.75rem',
                      color: '#0A0A0A',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value: any) => [formatFCFA(Number(value)), 'Chiffre d’affaires']}
                  />
                  <Area
                    type="monotone"
                    dataKey="ca"
                    stroke="#0A0A0A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#monoGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 18 & 19: PRODUITS LES PLUS VENDUS & HEURES DE POINTE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Section 18: Produits les plus vendus avec belles miniatures (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
                <div>
                  <h3 className="font-sans font-bold text-base text-[#0A0A0A]">
                    Produits les plus vendus
                  </h3>
                  <p className="text-xs text-[#8A8A8A]">
                    Plats signatures les plus commandés au restaurant
                  </p>
                </div>
                <Award className="w-5 h-5 text-[#0A0A0A]" />
              </div>

              <div className="divide-y divide-[#EEEEEE]">
                {topDishes.map((dish, i) => (
                  <div key={i} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAFAFA] border border-[#EAEAEA] shrink-0">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#0A0A0A] block">
                          {dish.name}
                        </span>
                        <span className="text-[11px] text-[#8A8A8A]">
                          Prix unitaire : {formatFCFA(dish.price)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs sm:text-sm text-[#0A0A0A] block">
                        {dish.sales} commandes
                      </span>
                      <span className="text-[10px] font-semibold text-[#8A8A8A]">
                        {formatFCFA(dish.sales * dish.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 19: Heures de pointe (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
                <div>
                  <h3 className="font-sans font-bold text-base text-[#0A0A0A]">
                    Heures de pointe
                  </h3>
                  <p className="text-xs text-[#8A8A8A]">
                    Périodes les plus actives de la journée
                  </p>
                </div>
                <Clock className="w-5 h-5 text-[#0A0A0A]" />
              </div>

              <div className="space-y-3 pt-1">
                {peakHours.map((ph, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#0A0A0A]">{ph.hour}</span>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider ${
                          ph.level === 4
                            ? 'text-[#0A0A0A] font-extrabold'
                            : ph.level === 3
                            ? 'text-[#333333]'
                            : 'text-[#8A8A8A]'
                        }`}
                      >
                        — {ph.label}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F2F2F2] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ph.bar}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#EEEEEE] text-[11px] text-[#8A8A8A] flex items-center justify-between">
                <span>Pic du déjeuner : 14h00</span>
                <span>Pic du dîner : 21h00</span>
              </div>
            </div>
          </div>

          {/* Section 20 & 21: SMART INSIGHTS & SCORE DIGITAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Section 20: SMART INSIGHTS (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                    RÈGLES INTELLIGENTES
                  </span>
                  <h3 className="font-sans font-black text-lg text-[#0A0A0A]">
                    Smart Insights
                  </h3>
                </div>
                <Link
                  to="/admin/insights"
                  className="text-xs font-bold text-[#0A0A0A] hover:underline flex items-center gap-1"
                >
                  <span>Tous les insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Thiéboudienne */}
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔥</span>
                    <h4 className="font-bold text-xs text-[#0A0A0A]">Plat n°1 de la semaine</h4>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Le Thiéboudienne est votre plat le plus vendu cette semaine.
                  </p>
                </div>

                {/* 2. Commandes soirée */}
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📈</span>
                    <h4 className="font-bold text-xs text-[#0A0A0A]">Hausse d'affluence</h4>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Les commandes augmentent de 24% entre 20h et 21h.
                  </p>
                </div>

                {/* 3. Yassa & Bissap */}
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🍹</span>
                    <h4 className="font-bold text-xs text-[#0A0A0A]">Association fréquente</h4>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Les clients commandant un Yassa ajoutent souvent un Bissap.
                  </p>
                </div>

                {/* 4. Opportunité */}
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <h4 className="font-bold text-xs text-[#0A0A0A]">Recommandation menu</h4>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Vous pourriez mettre le Bissap en avant pendant les heures de pointe.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 21: SCORE DIGITAL DU RESTAURANT (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">
                    AUDIT NUMÉRIQUE
                  </span>
                  <h3 className="font-sans font-black text-lg text-[#0A0A0A]">
                    DIGITAL SCORE
                  </h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-black text-2xl text-[#0A0A0A]">92</span>
                  <span className="text-xs text-[#8A8A8A] font-bold">/ 100</span>
                </div>
              </div>

              {/* Checklist Section 21 */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA]">
                  <span className="text-[#0A0A0A] font-medium">Photos produits</span>
                  <span className="font-bold text-[#0A0A0A] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Excellent
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA]">
                  <span className="text-[#0A0A0A] font-medium">Menu digital</span>
                  <span className="font-bold text-[#0A0A0A] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Excellent
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA]">
                  <span className="text-[#0A0A0A] font-medium">QR Tables</span>
                  <span className="font-bold text-[#0A0A0A] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFF8E7] border border-[#FFE082]">
                  <span className="text-[#0A0A0A] font-medium">Promotions</span>
                  <span className="font-bold text-[#D97706] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> À améliorer
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAFAFA] border border-[#EAEAEA]">
                  <span className="text-[#0A0A0A] font-medium">Avis clients</span>
                  <span className="font-bold text-[#0A0A0A] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Excellent
                  </span>
                </div>
              </div>

              {/* Suggestion Section 21 */}
              <div className="p-3 rounded-xl bg-[#F4F4F4] border border-[#EAEAEA] text-xs space-y-1">
                <span className="font-bold text-[#0A0A0A] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Suggestion :
                </span>
                <p className="text-[#666666]">
                  Ajouter davantage de photos pour améliorer votre score.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Dernières commandes en direct */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAEAEA] space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
              <div>
                <h3 className="font-sans font-bold text-base text-[#0A0A0A]">
                  Dernières commandes en direct
                </h3>
                <p className="text-xs text-[#8A8A8A]">
                  Flux en temps réel de votre restaurant
                </p>
              </div>
              <Link
                to="/admin/orders"
                className="text-xs font-bold text-[#0A0A0A] hover:underline flex items-center gap-1"
              >
                <span>Toutes les commandes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EEEEEE] text-[#8A8A8A] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Lieu / Type</th>
                    <th className="pb-3 font-semibold">Montant</th>
                    <th className="pb-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {recentOrders.map(order => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                    >
                      <td className="py-3 font-mono font-bold text-[#0A0A0A]">#{order.id}</td>
                      <td className="py-3 font-medium text-[#0A0A0A]">{order.customerName}</td>
                      <td className="py-3 text-[#666666]">
                        {order.orderType === 'DINE_IN'
                          ? `Table ${order.tableNumber}`
                          : order.orderType === 'DELIVERY'
                          ? 'Livraison'
                          : 'À emporter'}
                      </td>
                      <td className="py-3 font-bold text-[#0A0A0A]">
                        {formatFCFA(order.total)}
                      </td>
                      <td className="py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
