import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'ADMIN' | 'STAFF' | 'KITCHEN'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
            Vérification de la session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirection stricte vers /admin/login avec mémorisation de la route demandée
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Séparation stricte : le personnel KITCHEN est confiné à /kitchen et banni des routes /admin/*
  if (user && user.role === 'KITCHEN' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/kitchen" replace />;
  }

  // Vérification stricte des rôles autorisés
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'KITCHEN') {
      return <Navigate to="/kitchen" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
