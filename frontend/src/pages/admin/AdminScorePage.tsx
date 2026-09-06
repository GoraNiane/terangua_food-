import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminScorePage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const checklist = [
    { title: 'Photos produits', status: 'Excellent', isPositive: true, score: 95 },
    { title: 'Menu digital', status: 'Excellent', isPositive: true, score: 98 },
    { title: 'QR Tables', status: 'Actif', isPositive: true, score: 100 },
    { title: 'Promotions', status: 'À améliorer', isPositive: false, score: 70 },
    { title: 'Avis clients', status: 'Excellent', isPositive: true, score: 96 },
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
          title="Score de Digitalisation Restaurant"
          subtitle="Audit automatisé de votre présence numérique et opportunités d'amélioration"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto w-full">
          {/* Big Score Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs uppercase tracking-wider font-extrabold text-white bg-[#0A0A0A] px-3 py-1 rounded-full">
                Niveau : Établissement d'Excellence
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#0A0A0A]">
                Votre Score Digital
              </h2>
              <p className="text-xs text-[#666666] max-w-md">
                Votre restaurant exploite les standards les plus avancés de la gastronomie connectée à Dakar.
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-36 h-36 rounded-full border-8 border-[#0A0A0A] flex flex-col items-center justify-center bg-white shadow-sm shrink-0">
              <span className="font-display font-black text-4xl text-[#0A0A0A]">92</span>
              <span className="text-[11px] uppercase tracking-widest text-[#666666] font-bold">
                / 100
              </span>
            </div>
          </div>

          {/* Checklist Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-[#EAEAEA] space-y-4 shadow-sm">
            <h3 className="font-display font-black text-base text-[#0A0A0A]">
              Évaluation des piliers numériques
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    item.isPositive
                      ? 'bg-[#FAFAFA] border-[#EAEAEA]'
                      : 'bg-[#FFF8E7] border-[#FFE082]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.isPositive ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0A0A0A] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                    )}
                    <span className="text-xs font-bold text-[#0A0A0A]">{item.title}</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      item.isPositive ? 'text-[#0A0A0A]' : 'text-[#D97706]'
                    }`}
                  >
                    {item.isPositive ? `✓ ${item.status}` : `⚠ ${item.status}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white p-6 rounded-3xl border border-[#EAEAEA] space-y-4 shadow-sm">
            <h3 className="font-display font-black text-base text-[#0A0A0A] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#0A0A0A]" />
              <span>Recommandations pour atteindre 100/100</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#0A0A0A] flex items-start gap-3">
                <span className="text-xl">📸</span>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-[#0A0A0A] block">
                    Ajouter davantage de photos pour améliorer votre score.
                  </span>
                  <p className="text-[#666666]">
                    Les photographies haute définition de vos plats et desserts augmentent la conversion à table de 28%.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-start gap-3">
                <span className="text-xl">🔥</span>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-[#0A0A0A] block">
                    Programmez une promotion flash entre 18h00 et 20h00
                  </span>
                  <p className="text-[#666666]">
                    Ce créneau présente un creux d'affluence avant le coup de feu du dîner.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] flex items-start gap-3">
                <span className="text-xl">🌐</span>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-[#0A0A0A] block">
                    Activez la traduction du menu en anglais pour la clientèle internationale
                  </span>
                  <p className="text-[#666666]">
                    Idéal pour les touristes et hommes d'affaires en déplacement à Dakar-Plateau.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
