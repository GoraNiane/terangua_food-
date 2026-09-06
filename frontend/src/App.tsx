import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider } from './store/restaurantStore';
import { AuthProvider } from './store/authContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';

// Pages Clientes Principales (Chargement Immédiat Prioritaire)
import { ClientHomePage } from './pages/client/ClientHomePage';
import { ClientMenuPage } from './pages/client/ClientMenuPage';

// Pages Clientes Secondaires (Chargement à la Demande)
const ClientAboutPage = lazy(() => import('./pages/client/ClientAboutPage').then(m => ({ default: m.ClientAboutPage })));
const ClientPromotionsPage = lazy(() => import('./pages/client/ClientPromotionsPage').then(m => ({ default: m.ClientPromotionsPage })));
const ClientCheckoutPage = lazy(() => import('./pages/client/ClientCheckoutPage').then(m => ({ default: m.ClientCheckoutPage })));
const ClientOrderSuccessPage = lazy(() => import('./pages/client/ClientOrderSuccessPage').then(m => ({ default: m.ClientOrderSuccessPage })));
const ClientOrderTrackingPage = lazy(() => import('./pages/client/ClientOrderTrackingPage').then(m => ({ default: m.ClientOrderTrackingPage })));
const ClientReceiptPage = lazy(() => import('./pages/client/ClientReceiptPage').then(m => ({ default: m.ClientReceiptPage })));

// Espace Cuisine (Chargement Séparé Dédié)
const KitchenPage = lazy(() => import('./pages/kitchen/KitchenPage').then(m => ({ default: m.KitchenPage })));

// Pages d'Administration (Lourdes bibliothèques graphiques isolées à la demande)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminForgotPasswordPage = lazy(() => import('./pages/admin/AdminForgotPasswordPage').then(m => ({ default: m.AdminForgotPasswordPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminMenuSchedulePage = lazy(() => import('./pages/admin/AdminMenuSchedulePage').then(m => ({ default: m.AdminMenuSchedulePage })));
const AdminSalesPage = lazy(() => import('./pages/admin/AdminSalesPage').then(m => ({ default: m.AdminSalesPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminTablesPage = lazy(() => import('./pages/admin/AdminTablesPage').then(m => ({ default: m.AdminTablesPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminPromotionsPage = lazy(() => import('./pages/admin/AdminPromotionsPage').then(m => ({ default: m.AdminPromotionsPage })));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage').then(m => ({ default: m.AdminReviewsPage })));
const AdminStatisticsPage = lazy(() => import('./pages/admin/AdminStatisticsPage').then(m => ({ default: m.AdminStatisticsPage })));
const AdminInsightsPage = lazy(() => import('./pages/admin/AdminInsightsPage').then(m => ({ default: m.AdminInsightsPage })));
const AdminScorePage = lazy(() => import('./pages/admin/AdminScorePage').then(m => ({ default: m.AdminScorePage })));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage').then(m => ({ default: m.AdminCustomersPage })));
const AdminQRCodePage = lazy(() => import('./pages/admin/AdminQRCodePage').then(m => ({ default: m.AdminQRCodePage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

const PageLoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
    <div className="w-8 h-8 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold text-[#8A8A8A] tracking-wider uppercase">Chargement...</span>
  </div>
);

export function App() {
  return (
    <RestaurantProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Bannière et gestion de l'état PWA (Installation & Hors-Ligne) */}
          <PWAInstallBanner />
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
            {/* --- EXPÉRIENCE DIGITALE CLIENT PUBLIQUE (TERANGA FOOD) --- */}
            <Route path="/" element={<ClientHomePage />} />
            <Route path="/menu" element={<ClientMenuPage />} />
            <Route path="/about" element={<ClientAboutPage />} />
            <Route path="/promotions" element={<ClientPromotionsPage />} />
            <Route path="/checkout" element={<ClientCheckoutPage />} />
            <Route path="/order/:orderId" element={<ClientOrderTrackingPage />} />
            <Route path="/order-confirmation/:orderId" element={<ClientOrderSuccessPage />} />
            <Route path="/receipt/:orderId" element={<ClientReceiptPage />} />

            {/* Compatibilité table directe */}
            <Route path="/table/:tableNumber" element={<ClientMenuPage />} />

            {/* --- AUTHENTIFICATION UNIQUE RESTAURATEUR & CUISINE (Porte cachée via 5 clics sur le logo ou /login) --- */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/kitchen/login" element={<AdminLoginPage />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />

            {/* --- ESPACE CUISINE DÉDIÉ /kitchen (KDS sans prix) --- */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute allowedRoles={['KITCHEN', 'STAFF', 'ADMIN']}>
                  <KitchenPage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/kitchen" element={<Navigate to="/kitchen" replace />} />

            {/* --- ROUTES ADMINISTRATEUR STRICTEMENT PROTÉGÉES (INTERDITES AU RÔLE KITCHEN) --- */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

            {/* Enregistrement automatique des ventes et analyses financières */}
            <Route
              path="/admin/sales"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminSalesPage />
                </ProtectedRoute>
              }
            />

            {/* Menu du jour & Programmation hebdomadaire */}
            <Route
              path="/admin/menu-schedule"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminMenuSchedulePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/tables"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminTablesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/qrcode"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminQRCodePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCategoriesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/promotions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPromotionsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminReviewsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/statistics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminStatisticsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/insights"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminInsightsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/score"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminScorePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                  <AdminCustomersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback automatique vers l'accueil public */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </RestaurantProvider>
  );
}

export default App;
