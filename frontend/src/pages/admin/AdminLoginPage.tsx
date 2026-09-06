import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../store/authContext';
import { useRestaurantStore } from '../../store/restaurantStore';

export const AdminLoginPage: React.FC = () => {
  const { restaurant } = useRestaurantStore();
  const { login, logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Les champs sont strictement vides par défaut : AUCUN compte ou mot de passe pré-rempli
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await login(email, password, rememberMe);

    if (result.success && result.user) {
      // Routage automatique selon le rôle de l'utilisateur
      if (result.user.role === 'KITCHEN') {
        // Redirection immédiate vers l'écran cuisine dédié KDS
        navigate('/kitchen', { replace: true });
      } else {
        // Redirection vers le tableau de bord d'administration
        const requestedPath = (location.state as any)?.from?.pathname;
        if (requestedPath && requestedPath.startsWith('/admin') && requestedPath !== '/admin/login') {
          navigate(requestedPath, { replace: true });
        } else {
          navigate('/admin', { replace: true });
        }
      }
    } else {
      setErrorMessage(result.error || 'Email ou mot de passe incorrect.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#0A0A0A] selection:text-white">
      <div className="w-full max-w-[440px] space-y-7">
        {/* En-tête avec Logo TERANGA FOOD */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center justify-center group" title="Retour au restaurant">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200/60 border border-neutral-300 text-[10px] font-bold uppercase tracking-widest text-[#333333]">
              Portail Professionnel
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0A0A]">
              Connexion Équipe
            </h1>
            <p className="text-xs sm:text-sm text-[#666666]">
              Administration, Gérance & Cuisine Centrale
            </p>
          </div>
        </div>

        {/* Carte de Connexion Sécurisée */}
        <div className="bg-white rounded-3xl border border-[#EAEAEA] p-7 sm:p-9 shadow-xl shadow-black/[0.02] space-y-6">
          {/* Si déjà connecté, afficher clairement la session active avec options */}
          {isAuthenticated && user && (
            <div className="p-4 bg-[#F8F9FA] border border-[#EBEBEB] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-[#0A0A0A]">Session active</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#E2E2E2] text-[#444444]">
                  {user.role === 'KITCHEN' ? 'Personnel Cuisine' : user.role === 'ADMIN' ? 'Administrateur' : 'Staff'}
                </span>
              </div>
              <div className="text-xs text-[#666666]">
                Connecté avec <strong className="text-[#0A0A0A] font-semibold">{user.email}</strong> ({user.name})
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (user.role === 'KITCHEN') {
                      navigate('/kitchen');
                    } else {
                      navigate('/admin');
                    }
                  }}
                  className="w-full sm:flex-1 h-9 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <span>Accéder à {user.role === 'KITCHEN' ? "l'Espace Cuisine" : 'l’Administration'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full sm:w-auto h-9 px-3 rounded-xl border border-[#E0E0E0] hover:bg-neutral-100 text-xs font-semibold text-[#555555] hover:text-red-600 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#EEEEEE]"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold tracking-widest text-[#999999]">
                Ou changer de compte
              </span>
              <div className="flex-grow border-t border-[#EEEEEE]"></div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl text-xs font-semibold text-red-700 flex items-start gap-2.5 animate-fadeIn"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Guide de routage automatique pour l'équipe */}
          <div className="p-3.5 bg-[#F9FAFB] border border-[#EAEAEA] rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#0A0A0A] mt-0.5 shrink-0" />
            <div className="text-[11px] leading-relaxed text-[#555555] space-y-1 w-full">
              <div className="font-bold text-[#0A0A0A] text-xs">
                Accès Unique Équipe & Direction
              </div>
              <p>
                Renseignez vos identifiants ci-dessous. Le système vous oriente automatiquement :
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E5E5E5] text-[10px] font-semibold text-[#222222]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                  Admin → <strong>Dashboard</strong>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E5E5E5] text-[10px] font-semibold text-[#222222]">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Cuisine → <strong>Écran KDS</strong>
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-[#0A0A0A]">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
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

            {/* Champ Mot de passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="pass" className="block text-xs font-bold text-[#0A0A0A]">
                  Mot de passe
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="text-[11px] font-medium text-[#666666] hover:text-[#0A0A0A] transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="pass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-10 pr-10 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-xs sm:text-sm text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#0A0A0A] p-1 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Option Se souvenir de moi */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#D0D0D0] text-[#0A0A0A] accent-[#0A0A0A] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-xs text-[#666666] cursor-pointer select-none">
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton de Connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Connexion en cours...' : 'Se connecter'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Note de Sécurité */}
          <div className="pt-4 border-t border-[#F0F0F0] flex items-center justify-center gap-2 text-[11px] text-[#888888]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A0A0A]" />
            <span>Accès chiffré et protégé par token sécurisé</span>
          </div>
        </div>

        {/* Retour au site public */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-[#888888] hover:text-[#0A0A0A] transition-colors"
          >
            ← Retour au restaurant {restaurant.name}
          </Link>
        </div>
      </div>
    </div>
  );
};
