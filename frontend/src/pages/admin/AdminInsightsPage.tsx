import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminInsightsPage: React.FC = () => {
  const { insights } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hourly heatmap data (Days vs Hours)
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const hours = ['12h', '13h', '14h', '18h', '19h', '20h', '21h', '22h'];

  // Intensity matrix (0 to 10)
  const heatmapData: Record<string, number[]> = {
    Lun: [4, 6, 3, 2, 5, 7, 5, 2],
    Mar: [5, 7, 4, 3, 6, 8, 6, 3],
    Mer: [6, 8, 4, 3, 7, 8, 6, 3],
    Jeu: [6, 8, 5, 4, 7, 9, 7, 4],
    Ven: [8, 10, 6, 6, 9, 10, 9, 6],
    Sam: [9, 10, 7, 7, 10, 10, 10, 7],
    Dim: [8, 9, 5, 6, 9, 9, 7, 4],
  };

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 9) return 'bg-[#0A0A0A] text-white font-extrabold shadow-sm';
    if (intensity >= 7) return 'bg-[#333333] text-white font-bold';
    if (intensity >= 5) return 'bg-[#777777] text-white font-medium';
    if (intensity >= 3) return 'bg-[#D5D5D5] text-[#0A0A0A] font-medium';
    return 'bg-[#F5F5F5] text-[#999999]';
  };

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
          title="Smart Insights & Heatmap"
          subtitle="Recommandations algorithmiques et carte thermique d'affluence"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Smart AI Recommendations Section (Section 44) */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0A0A0A]" />
                <h2 className="font-sans font-black text-lg text-[#0A0A0A]">
                  SMART INSIGHTS (Règles Statistiques & Métriques)
                </h2>
              </div>
              <p className="text-xs text-[#888888]">
                Déduction automatique basée sur les données d'encaissement réelles. Architecture prête pour intégration IA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map(item => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-3xl border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <h3 className="font-display font-bold text-sm text-[#0A0A0A]">
                          {item.title}
                        </h3>
                      </div>
                      {item.impact && (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-white bg-[#0A0A0A] px-2.5 py-0.5 rounded-full">
                          {item.impact}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#666666] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.actionCta && (
                    <div className="pt-2 border-t border-[#EEEEEE]">
                      <button
                        onClick={() => alert(`Action simulée : ${item.actionCta}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] hover:underline transition-colors"
                      >
                        <span>{item.actionCta}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap Section */}
          <div className="bg-white p-6 rounded-3xl border border-[#EAEAEA] space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-base text-[#0A0A0A] flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#0A0A0A]" />
                  <span>Heatmap d'Affluence (Heures de pointe)</span>
                </h3>
                <p className="text-xs text-[#666666]">
                  Concentration des commandes selon les jours et les créneaux horaires
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 text-[11px] text-[#666666] font-medium">
                <span>Calme</span>
                <div className="flex gap-1">
                  <div className="w-3.5 h-3.5 rounded bg-[#F5F5F5] border border-[#EAEAEA]" />
                  <div className="w-3.5 h-3.5 rounded bg-[#D5D5D5]" />
                  <div className="w-3.5 h-3.5 rounded bg-[#777777]" />
                  <div className="w-3.5 h-3.5 rounded bg-[#0A0A0A]" />
                </div>
                <span>Forte affluence</span>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr>
                    <th className="text-left font-bold text-[#666666] pb-3 w-16">
                      Jour
                    </th>
                    {hours.map(h => (
                      <th key={h} className="font-mono font-bold text-[#666666] pb-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {days.map(day => (
                    <tr key={day}>
                      <td className="text-left font-bold text-[#0A0A0A] py-2">{day}</td>
                      {heatmapData[day].map((intensity, idx) => (
                        <td key={idx} className="p-1">
                          <div
                            className={`w-full h-8 rounded-lg flex items-center justify-center text-[11px] transition-all hover:scale-105 ${getHeatmapColor(
                              intensity
                            )}`}
                          >
                            {intensity >= 8 ? `${intensity * 4}` : ''}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-[#888888] text-right">
              * Chiffres représentant la moyenne de couverts et commandes servies par heure.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
