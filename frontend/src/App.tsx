import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider } from './store/restaurantStore';
import { AuthProvider } from './store/authContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Client Pages (Public)
import { ClientHomePage } from './pages/client/ClientHomePage';
import { ClientMenuPage } from './pages/client/ClientMenuPage';
import { ClientAboutPage } from './pages/client/ClientAboutPage';
import { ClientPromotionsPage } from './pages/client/ClientPromotionsPage';
import { ClientCheckoutPage } from './pages/client/ClientCheckoutPage';
import { ClientOrderSuccessPage } from './pages/client/ClientOrderSuccessPage';
import { ClientOrderTrackingPage } from './pages/client/ClientOrderTrackingPage';
import { ClientReceiptPage } from './pages/client/ClientReceiptPage';

// Kitchen Page (Espace Cuisine Dédié — 100% Isolé, Sans Prix)
import { KitchenPage } from './pages/kitchen/KitchenPage';

// Admin Pages (Strictement Réservées au Gérant & Staff — 403 pour KITCHEN)
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminForgotPasswordPage } from './pages/admin/AdminForgotPasswordPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminMenuSchedulePage } from './pages/admin/AdminMenuSchedulePage';
import { AdminSalesPage } from './pages/admin/AdminSalesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminTablesPage } from './pages/admin/AdminTablesPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminStatisticsPage } from './pages/admin/AdminStatisticsPage';
import { AdminInsightsPage } from './pages/admin/AdminInsightsPage';
import { AdminScorePage } from './pages/admin/AdminScorePage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminQRCodePage } from './pages/admin/AdminQRCodePage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export function App() {
  return (
    <RestaurantProvider>
      <AuthProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </AuthProvider>
    </RestaurantProvider>
  );
}

export default App;
