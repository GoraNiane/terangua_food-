import React, { createContext, useContext, useState, useEffect } from 'react';
import { ENDPOINTS } from '../config/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'KITCHEN';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'teranga_auth_token';
const USER_KEY = 'teranga_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialisation à partir du stockage sécurisé au montage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      const savedUserStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

      if (savedToken && savedUserStr) {
        const parsedUser = JSON.parse(savedUserStr);
        setToken(savedToken);
        setUser(parsedUser);
      }
    } catch {
      // Nettoyage en cas de corruption
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const DEMO_ACCOUNTS: Record<string, { pass: string; user: AuthUser }> = {
    'admin@restaurant.com': {
      pass: 'Restaurant@2026',
      user: {
        id: 'demo-admin-1',
        email: 'admin@restaurant.com',
        name: 'Direction TERANGA FOOD',
        role: 'ADMIN',
      },
    },
    'kitchen@restaurant.com': {
      pass: 'Restaurant@2026',
      user: {
        id: 'demo-kitchen-1',
        email: 'kitchen@restaurant.com',
        name: 'Chef Ousmane (Cuisine)',
        role: 'KITCHEN',
      },
    },
    'staff@restaurant.com': {
      pass: 'Restaurant@2026',
      user: {
        id: 'demo-staff-1',
        email: 'staff@restaurant.com',
        name: 'Responsable Salle & Accueil',
        role: 'STAFF',
      },
    },
  };

  const login = async (
    email: string,
    pass: string,
    rememberMe = false
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    setIsLoading(true);

    const cleanEmail = email.toLowerCase().trim();
    const demoAcc = DEMO_ACCOUNTS[cleanEmail];

    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.token && data?.user) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, data.token);
        storage.setItem(USER_KEY, JSON.stringify(data.user));

        // Si l'autre stockage contenait d'anciennes données, les nettoyer
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem(TOKEN_KEY);
        otherStorage.removeItem(USER_KEY);

        setToken(data.token);
        setUser(data.user);
        setIsLoading(false);
        return { success: true, user: data.user };
      }

      // Si le backend renvoie une erreur mais que ce sont les identifiants préconfigurés
      if (demoAcc && demoAcc.pass === pass) {
        const mockToken = `demo_token_${demoAcc.user.role.toLowerCase()}_${Date.now()}`;
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, mockToken);
        storage.setItem(USER_KEY, JSON.stringify(demoAcc.user));

        setToken(mockToken);
        setUser(demoAcc.user);
        setIsLoading(false);
        return { success: true, user: demoAcc.user };
      }

      setIsLoading(false);
      return {
        success: false,
        error: data?.error || 'Email ou mot de passe incorrect.',
      };
    } catch {
      // Si le serveur distant ne répond pas, autoriser les comptes de démonstration
      if (demoAcc && demoAcc.pass === pass) {
        const mockToken = `demo_token_${demoAcc.user.role.toLowerCase()}_${Date.now()}`;
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, mockToken);
        storage.setItem(USER_KEY, JSON.stringify(demoAcc.user));

        setToken(mockToken);
        setUser(demoAcc.user);
        setIsLoading(false);
        return { success: true, user: demoAcc.user };
      }

      setIsLoading(false);
      return {
        success: false,
        error: 'Impossible de joindre le serveur d’authentification. Veuillez vérifier votre connexion.',
      };
    }
  };

  const logout = () => {
    // Appel asynchrone non bloquant vers le backend
    fetch(ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).catch(() => {});

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l’intérieur d’un AuthProvider');
  }
  return context;
};
