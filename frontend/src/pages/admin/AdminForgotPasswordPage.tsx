import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { ENDPOINTS } from '../../config/api';

export const AdminForgotPasswordPage: React.FC = () => {
  const { restaurant } = useRestaurantStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await fetch(ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSubmitted(true);
    } catch {
      // Message neutre même en cas de coupure réseau pour la sécurité
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#0A0A0A] selection:text-white">
      <div className="w-full max-w-[420px] space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center justify-center group" title="Retour au site">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#888888]">
              {restaurant.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0A0A]">
              Mot de passe oublié ?
            </h1>
            <p className="text-xs sm:text-sm text-[#666666]">
              Saisissez votre adresse email pour réinitialiser vos identifiants d’accès.
            </p>
          </div>
        </div>

        {/* Carte Formulaire */}
        <div className="bg-white rounded-3xl border border-[#EAEAEA] p-7 sm:p-9 shadow-xl shadow-black/[0.02] space-y-6">
          {submitted ? (
            <div className="space-y-5 text-center py-2 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#EAEAEA] mx-auto flex items-center justify-center text-[#0A0A0A]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#0A0A0A]">
                  Demande enregistrée
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  Si l’adresse <span className="font-semibold text-[#0A0A0A]">{email}</span> est associée à un compte administrateur du restaurant, un lien de réinitialisation sécurisé vous a été transmis.
                </p>
              </div>
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#222222] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à la connexion</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="block text-xs font-bold text-[#0A0A0A]">
                  Email administrateur
                </label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nom@restaurant.com"
                    required
                    autoComplete="email"
                    className="w-full h-11 pl-10 pr-3.5 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-xs sm:text-sm text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Envoi en cours...' : 'Réinitialiser mon mot de passe'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>

        {/* Retour connexion */}
        <div className="text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#888888] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à l’authentification</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
