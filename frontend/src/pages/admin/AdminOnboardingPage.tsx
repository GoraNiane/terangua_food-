import React, { useState } from 'react';
import {
  Building,
  Utensils,
  Palette,
  Users,
  QrCode,
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useRestaurantStore } from '../../store/restaurantStore';

export const AdminOnboardingPage: React.FC = () => {
  const { restaurant } = useRestaurantStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const steps = [
    { num: 1, title: 'Informations', icon: Building },
    { num: 2, title: 'Menu & Plats', icon: Utensils },
    { num: 3, title: 'Personnalisation', icon: Palette },
    { num: 4, title: 'Tables en salle', icon: Users },
    { num: 5, title: 'QR Codes', icon: QrCode },
    { num: 6, title: 'Lancement', icon: Rocket },
  ];

  const handleNext = () => {
    if (step === 5) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#0A0A0A', '#888888', '#EAEAEA', '#25D366'],
      });
    }
    setStep(s => Math.min(6, s + 1));
  };

  const handlePrev = () => {
    setStep(s => Math.max(1, s - 1));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] p-4 sm:p-8 flex flex-col justify-between max-w-3xl mx-auto">
      <header className="flex items-center justify-between pb-6 border-b border-[#EEEEEE]">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#666666]">
            Assistant d'Installation SaaS
          </span>
          <h1 className="font-display font-black text-xl text-[#0A0A0A]">
            Configuration Express de votre Restaurant
          </h1>
        </div>

        <Link
          to="/admin"
          className="text-xs text-[#666666] hover:text-[#0A0A0A] font-medium"
        >
          Quitter le guide
        </Link>
      </header>

      {/* Steps Indicator Bar */}
      <div className="py-6">
        <div className="grid grid-cols-6 gap-2 text-center">
          {steps.map(s => {
            const isDone = s.num < step;
            const isCurrent = s.num === step;
            return (
              <div key={s.num} className="space-y-1">
                <div
                  className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-[#0A0A0A] text-white'
                      : isCurrent
                      ? 'bg-[#0A0A0A] text-white ring-2 ring-offset-2 ring-black'
                      : 'bg-white text-[#888888] border border-[#EAEAEA]'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span className="text-[10px] hidden sm:block font-medium text-[#666666]">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <main className="bg-white p-6 sm:p-10 rounded-3xl border border-[#EAEAEA] shadow-sm space-y-6 flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Étape 1 sur 6
            </span>
            <h2 className="font-display font-black text-2xl text-[#0A0A0A]">
              Identité de votre établissement
            </h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Renseignez le nom commercial de votre restaurant et le numéro WhatsApp de réception des commandes.
            </p>
            <div className="space-y-3 pt-2">
              <input
                type="text"
                defaultValue={restaurant.name}
                className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl p-3 text-xs text-[#0A0A0A] outline-none"
                placeholder="Nom du restaurant"
              />
              <input
                type="text"
                defaultValue={restaurant.whatsappNumber}
                className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl p-3 text-xs text-[#0A0A0A] outline-none"
                placeholder="Numéro WhatsApp (ex: 221775678900)"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Étape 2 sur 6
            </span>
            <h2 className="font-display font-black text-2xl text-[#0A0A0A]">
              Catalogue & Carte Gastronomique
            </h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Votre catalogue initial comprend déjà plus de 20 plats sénégalais et 7 catégories configurées.
            </p>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] text-xs space-y-1">
              <p className="font-bold text-[#0A0A0A]">✓ 7 catégories actives</p>
              <p className="font-bold text-[#0A0A0A]">✓ 20 plats avec photographies HD</p>
              <p className="font-bold text-[#0A0A0A]">✓ Prix en FCFA et options accompagnements</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Étape 3 sur 6
            </span>
            <h2 className="font-display font-black text-2xl text-[#0A0A0A]">
              Design & Expérience Visuelle
            </h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Le thème "Minimalist High-Tech" (blanc dominant, noir profond, typographie géométrique) sublime vos créations culinaires.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-white border border-[#EAEAEA] shadow-sm" />
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A]" />
              <div className="w-8 h-8 rounded-full bg-[#333333]" />
              <span className="text-xs text-[#0A0A0A] font-bold">Palette Prédéfinie Minimaliste</span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Étape 4 sur 6
            </span>
            <h2 className="font-display font-black text-2xl text-[#0A0A0A]">
              Plan de Salle (20 Tables)
            </h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              20 tables ont été configurées avec capacités adaptées (2, 4, 6 places).
            </p>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] text-xs text-[#666666]">
              Chaque table est immédiatement reliée à son QR Code dynamique.
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
              Étape 5 sur 6
            </span>
            <h2 className="font-display font-black text-2xl text-[#0A0A0A]">
              Génération des QR Codes
            </h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Les chevalets de table au design haute définition sont prêts pour impression.
            </p>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] text-xs text-[#0A0A0A] font-bold">
              ✓ 20 QR Codes vectoriels générés
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#0A0A0A] text-white mx-auto flex items-center justify-center shadow-md">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="font-display font-black text-3xl text-[#0A0A0A]">
              VOTRE MENU DIGITAL EST PRÊT !
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto">
              Félicitations ! Votre restaurant {restaurant.name} est maintenant équipé de la solution de commande digitale la plus moderne d'Afrique de l'Ouest.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                to="/menu?table=01"
                target="_blank"
                className="px-6 py-3 rounded-full bg-[#0A0A0A] text-white font-extrabold text-xs shadow-sm hover:bg-[#222222] transition-all"
              >
                Tester le menu client (Table 01)
              </Link>
              <Link
                to="/admin"
                className="px-6 py-3 rounded-full bg-white border border-[#EAEAEA] text-[#0A0A0A] font-bold text-xs hover:bg-gray-50 transition-all shadow-sm"
              >
                Accéder au Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Controls */}
      <footer className="pt-6 flex items-center justify-between">
        {step > 1 && step < 6 ? (
          <button
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs text-[#666666] hover:text-[#0A0A0A] font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>
        ) : (
          <div />
        )}

        {step < 6 && (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-extrabold text-xs shadow-sm transition-all"
          >
            <span>{step === 5 ? 'Finaliser l’installation 🚀' : 'Suivant'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </footer>
    </div>
  );
};
