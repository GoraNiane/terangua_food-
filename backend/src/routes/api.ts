import { Router } from 'express';
import * as authCtrl from '../controllers/authController';
import * as restCtrl from '../controllers/restaurantController';
import * as menuCtrl from '../controllers/menuController';
import * as orderCtrl from '../controllers/orderController';
import * as tableCtrl from '../controllers/tableController';
import * as statsCtrl from '../controllers/statsController';
import * as salesCtrl from '../controllers/salesController';
import * as custCtrl from '../controllers/customerController';
import * as promoCtrl from '../controllers/promotionController';
import * as reviewCtrl from '../controllers/reviewController';
import * as scheduleCtrl from '../controllers/menuScheduleController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// --- AUTHENTIFICATION SÉCURISÉE ---
router.post('/auth/login', authRateLimiter, authCtrl.login);
router.post('/auth/logout', authCtrl.logout);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.get('/auth/me', authenticateToken, authCtrl.getMe);

// --- PARAMÈTRES RESTAURANT (ADMIN UNIQUEMENT) ---
router.get('/settings', restCtrl.getRestaurantSettings);
router.put('/settings', authenticateToken, requireRole(['ADMIN']), restCtrl.updateRestaurantSettings);

// --- MENU & CATÉGORIES (PUBLIC & ADMIN) ---
router.get('/menu', menuCtrl.getFullMenu);
router.get('/menu/schedule', scheduleCtrl.getWeeklySchedule);
router.get('/menu/today', scheduleCtrl.getTodayMenu);
router.put('/menu/schedule/:dayOfWeek', authenticateToken, requireRole(['ADMIN']), scheduleCtrl.updateDaySchedule);
router.put('/menu/today', authenticateToken, requireRole(['ADMIN']), scheduleCtrl.updateTodayMenu);
router.get('/categories', menuCtrl.getCategories);
router.post('/categories', authenticateToken, requireRole(['ADMIN']), menuCtrl.createCategory);
router.put('/categories/:id', authenticateToken, requireRole(['ADMIN']), menuCtrl.updateCategory);
router.delete('/categories/:id', authenticateToken, requireRole(['ADMIN']), menuCtrl.deleteCategory);

// --- PRODUITS (ADMIN UNIQUEMENT POUR MODIFICATION) ---
router.get('/products', menuCtrl.getProducts);
router.get('/products/:id', menuCtrl.getProductById);
router.post('/products', authenticateToken, requireRole(['ADMIN']), menuCtrl.createProduct);
router.put('/products/:id', authenticateToken, requireRole(['ADMIN']), menuCtrl.updateProduct);
router.delete('/products/:id', authenticateToken, requireRole(['ADMIN']), menuCtrl.deleteProduct);

// --- TABLES & QR CODES ---
router.get('/tables', tableCtrl.getTables);
router.post('/tables', authenticateToken, requireRole(['ADMIN']), tableCtrl.createTable);
router.put('/tables/:id', authenticateToken, requireRole(['ADMIN']), tableCtrl.updateTable);
router.delete('/tables/:id', authenticateToken, requireRole(['ADMIN']), tableCtrl.deleteTable);
router.patch('/tables/:id/status', authenticateToken, requireRole(['ADMIN', 'STAFF']), tableCtrl.updateTableStatus);
router.put('/tables/:id/status', authenticateToken, requireRole(['ADMIN', 'STAFF']), tableCtrl.updateTableStatus);
router.get('/qrcodes', tableCtrl.getQRCodes);

// --- ESPACE CUISINE DÉDIÉ (SANS PRIX NI DONNÉES FINANCIÈRES) ---
router.get('/orders/kitchen', authenticateToken, requireRole(['ADMIN', 'STAFF', 'KITCHEN']), orderCtrl.getKitchenOrders);

// --- COMMANDES ADMINISTRATIVES (ADMIN & STAFF UNIQUEMENT — 403 POUR KITCHEN) ---
router.post('/orders', orderCtrl.createOrder); // Commande publique client
router.get('/orders', authenticateToken, requireRole(['ADMIN', 'STAFF']), orderCtrl.getOrders);
router.get('/orders/:id', orderCtrl.getOrderById); // Suivi de commande client
router.patch('/orders/:id/status', authenticateToken, requireRole(['ADMIN', 'STAFF', 'KITCHEN']), orderCtrl.updateOrderStatus);
router.put('/orders/:id/status', authenticateToken, requireRole(['ADMIN', 'STAFF', 'KITCHEN']), orderCtrl.updateOrderStatus);

// --- VENTES FINALISÉES AUTOMATIQUES (ADMIN UNIQUEMENT — 403 POUR KITCHEN) ---
router.get('/sales', authenticateToken, requireRole(['ADMIN']), salesCtrl.getSales);

// --- CLIENTS / CRM (ADMIN & STAFF — 403 POUR KITCHEN) ---
router.get('/customers', authenticateToken, requireRole(['ADMIN', 'STAFF']), custCtrl.getCustomers);
router.get('/customers/:id', authenticateToken, requireRole(['ADMIN', 'STAFF']), custCtrl.getCustomerById);

// --- STATISTIQUES FINANCIÈRES & INSIGHTS (ADMIN UNIQUEMENT — 403 POUR KITCHEN) ---
router.get('/statistics', authenticateToken, requireRole(['ADMIN']), statsCtrl.getStatistics);

// --- PROMOTIONS ---
router.get('/promotions', promoCtrl.getPromotions);
router.post('/promotions', authenticateToken, requireRole(['ADMIN']), promoCtrl.createPromotion);
router.put('/promotions/:id', authenticateToken, requireRole(['ADMIN']), promoCtrl.updatePromotion);
router.delete('/promotions/:id', authenticateToken, requireRole(['ADMIN']), promoCtrl.deletePromotion);

// --- AVIS CLIENTS ---
router.get('/reviews', reviewCtrl.getReviews);
router.post('/reviews', reviewCtrl.createReview);
router.patch('/reviews/:id/reply', authenticateToken, requireRole(['ADMIN', 'STAFF']), reviewCtrl.replyToReview);

export default router;
