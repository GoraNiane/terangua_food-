import React, { createContext, useContext, useState, useEffect } from 'react';
import { io as socketIOClient, Socket } from 'socket.io-client';
import {
  Restaurant,
  Category,
  Product,
  CartItem,
  Order,
  OrderStatus,
  Customer,
  RestaurantTable,
  TableStatus,
  Promotion,
  Review,
  LoyaltyReward,
  Insight,
  DailyMenuSchedule,
} from '../types';
import {
  INITIAL_RESTAURANT,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_TABLES,
  INITIAL_PROMOTIONS,
  INITIAL_REVIEWS,
  INITIAL_LOYALTY_REWARDS,
  INITIAL_INSIGHTS,
  INITIAL_WEEKLY_SCHEDULE,
} from '../data/seedData';

import { API_BASE_URL } from '../config/api';

const STORAGE_KEY = 'teranga_food_db_v4';
const BACKEND_URL = API_BASE_URL;

interface StoreState {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  tables: RestaurantTable[];
  promotions: Promotion[];
  reviews: Review[];
  loyaltyRewards: LoyaltyReward[];
  insights: Insight[];
  cart: CartItem[];
  weeklySchedule: DailyMenuSchedule[];
  activeTable: string | null;
  notification: { id: string; title: string; subtitle: string; amount: number } | null;
  isSoundEnabled: boolean;
  isOnline: boolean;
}

interface RestaurantContextType extends StoreState {
  setActiveTable: (table: string | null) => void;
  updateDaySchedule: (dayOfWeek: number, updates: Partial<DailyMenuSchedule>) => Promise<void>;
  updateTodayMenu: (updates: Partial<DailyMenuSchedule>) => Promise<void>;
  getTodaySchedule: () => { schedule: DailyMenuSchedule; products: Product[] };
  addToCart: (
    product: Product,
    quantity: number,
    selectedOptions?: { groupName: string; optionName: string; extraPrice: number }[],
    notes?: string
  ) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    orderType: Order['orderType'];
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
    items: Order['items'];
    subtotal: number;
    discount?: number;
    deliveryFee: number;
    total: number;
  }) => Promise<Order>;
  confirmOrderPayment: (orderId: string, paymentMethod: 'WAVE' | 'OM', amount?: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  updateTableStatus: (tableNumber: string, status: TableStatus) => void;
  addTable: (tableData: { number: string; capacity: number; area?: string; status?: TableStatus }) => Promise<void>;
  deleteTable: (tableIdOrNumber: string) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void> | void;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void> | void;
  deleteProduct: (id: string) => Promise<void> | void;
  toggleProductAvailability: (id: string) => void;
  addCategory: (categoryData: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, categoryData: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  togglePromotion: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  replyToReview: (id: string, reply: string) => void;
  updateRestaurantSettings: (settings: Partial<Restaurant>) => void;
  dismissNotification: () => void;
  toggleSound: () => void;
  testAudioChime: () => void;
  resetToInitialData: () => void;
  resetToDemoData: () => void;
  cartTotal: number;
  cartCount: number;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

function loadInitialData(): Partial<StoreState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved data from localStorage', e);
  }
  return {};
}

// Carillon sonore avec Web Audio API (100% autonome, zéro dépendance audio externe)
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Navigateur bloqué avant interaction
  }
}

function getAuthToken(): string | null {
  try {
    return (
      localStorage.getItem('teranga_auth_token') ||
      sessionStorage.getItem('teranga_auth_token') ||
      localStorage.getItem('teranga_token') ||
      sessionStorage.getItem('teranga_token')
    );
  } catch {
    return null;
  }
}

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadInitialData();
  const [restaurant, setRestaurant] = useState<Restaurant>(initial.restaurant || INITIAL_RESTAURANT);
  const [categories, setCategories] = useState<Category[]>(initial.categories || INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(initial.products || INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(() => {
    if (initial.orders && Array.isArray(initial.orders) && initial.orders.length > 0) {
      return initial.orders;
    }
    return [];
  });
  const [customers, setCustomers] = useState<Customer[]>(initial.customers || INITIAL_CUSTOMERS);
  const [tables, setTables] = useState<RestaurantTable[]>(initial.tables || INITIAL_TABLES);
  const [promotions, setPromotions] = useState<Promotion[]>(initial.promotions || INITIAL_PROMOTIONS);
  const [reviews, setReviews] = useState<Review[]>(initial.reviews || INITIAL_REVIEWS);
  const [loyaltyRewards] = useState<LoyaltyReward[]>(INITIAL_LOYALTY_REWARDS);
  const [insights] = useState<Insight[]>(INITIAL_INSIGHTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<DailyMenuSchedule[]>(
    () => (initial.weeklySchedule && initial.weeklySchedule.length > 0 ? initial.weeklySchedule : INITIAL_WEEKLY_SCHEDULE)
  );
  const [activeTable, setActiveTableState] = useState<string | null>(() => {
    try {
      return (
        sessionStorage.getItem('teranga_active_table') ||
        localStorage.getItem('teranga_active_table') ||
        null
      );
    } catch {
      return null;
    }
  });
  const [notification, setNotification] = useState<{ id: string; title: string; subtitle: string; amount: number } | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  // Synchronisation avec le backend MariaDB au chargement
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const token = getAuthToken();
        const [menuRes, scheduleRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/menu`).catch(() => null),
          fetch(`${BACKEND_URL}/api/menu/schedule`).catch(() => null),
        ]);

        if (scheduleRes && scheduleRes.ok) {
          const schedData = await scheduleRes.json();
          if (schedData.data && schedData.data.length > 0) {
            setWeeklySchedule(schedData.data);
          }
        }

        if (menuRes && menuRes.ok) {
          const menuData = await menuRes.json();
          if (menuData.categories && menuData.categories.length > 0) {
            setCategories(menuData.categories);
            const allProducts: Product[] = [];
            menuData.categories.forEach((cat: any) => {
              if (cat.products) {
                cat.products.forEach((p: any) => {
                  allProducts.push({
                    id: p.id,
                    categoryId: p.categoryId,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    originalPrice: p.originalPrice,
                    imageUrl: p.imageUrl,
                    videoUrl: p.videoUrl || undefined,
                    isAvailable: p.isAvailable,
                    isFeatured: p.isFeatured,
                    badge: p.badge,
                    ingredients: Array.isArray(p.ingredients) ? p.ingredients : [p.ingredients],
                    optionGroups: (p.options || []).map((o: any) => ({
                      id: o.id,
                      name: o.name,
                      required: o.required,
                      minSelect: o.minSelect,
                      maxSelect: o.maxSelect,
                      items: (o.values || []).map((v: any) => ({
                        id: v.id,
                        name: v.name,
                        extraPrice: v.extraPrice,
                        isDefault: v.isDefault,
                      })),
                    })),
                  });
                });
              }
            });
            if (allProducts.length > 0) setProducts(allProducts);
          }
        }

        // Si l'utilisateur est un membre d'équipe authentifié, synchroniser les commandes & tables réelles
        if (token) {
          let ordersUrl = `${BACKEND_URL}/api/orders`;
          try {
            const userStr = localStorage.getItem('teranga_auth_user') || sessionStorage.getItem('teranga_auth_user');
            if (userStr) {
              const u = JSON.parse(userStr);
              if (u.role === 'KITCHEN') {
                ordersUrl = `${BACKEND_URL}/api/orders/kitchen`;
              }
            }
          } catch {}

          const [ordersRes, tablesRes] = await Promise.all([
            fetch(ordersUrl, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null),
            fetch(`${BACKEND_URL}/api/tables`).catch(() => null),
          ]);

          if (ordersRes && ordersRes.ok) {
            const ordersData = await ordersRes.json();
            if (Array.isArray(ordersData.orders)) {
              setOrders(ordersData.orders);
            }
          }

          if (tablesRes && tablesRes.ok) {
            const tablesData = await tablesRes.json();
            if (tablesData.tables && tablesData.tables.length > 0) {
              setTables(tablesData.tables);
            }
          }
        }

        setIsOnline(true);
      } catch (err) {
        console.warn('Mode local hors-ligne activé (Backend non joignable).');
      }
    };

    fetchBackendData();
  }, []);

  // 1. Connexion Socket.IO temps réel avec le serveur (si disponible)
  useEffect(() => {
    const isVercelWithoutWs =
      typeof window !== 'undefined' &&
      window.location.hostname.includes('vercel.app') &&
      !import.meta.env.VITE_WS_URL;

    if (isVercelWithoutWs) {
      setIsOnline(true);
    }

    let socket: Socket | null = null;
    if (!isVercelWithoutWs) {
      try {
        const token = getAuthToken();
        socket = socketIOClient(BACKEND_URL, {
          auth: { token },
          reconnectionAttempts: 5,
          timeout: 3000,
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
          setIsOnline(true);
          socket?.emit('join_kitchen', { token });
          socket?.emit('join_admin', { token });
        });

        const cleanKey = (id: string) => String(id).replace(/^[#\s]*TF-/i, '').trim();

        const handleNewOrder = (newOrder: Order) => {
          setOrders(prev => {
            const existingIndex = prev.findIndex(
              o => o.id === newOrder.id || cleanKey(o.id) === cleanKey(newOrder.id)
            );
            if (existingIndex >= 0) {
              const existing = prev[existingIndex];
              const merged: Order = {
                ...existing,
                ...newOrder,
                total: newOrder.total !== undefined ? newOrder.total : existing.total,
                subtotal: newOrder.subtotal !== undefined ? newOrder.subtotal : existing.subtotal,
                discount: newOrder.discount !== undefined ? newOrder.discount : existing.discount,
                items: (newOrder.items && newOrder.items.length > 0 && (newOrder.items[0] as any)?.unitPrice !== undefined)
                  ? newOrder.items
                  : existing.items,
              };
              const copy = [...prev];
              copy[existingIndex] = merged;
              return copy;
            }
            return [newOrder, ...prev];
          });

          // Si c'est une commande sur place, basculer la table en OCCUPIED
          if (newOrder.orderType === 'DINE_IN' && newOrder.tableNumber) {
            const tNum = String(newOrder.tableNumber).trim().padStart(2, '0');
            setTables(prev =>
              prev.map(t =>
                t.number === tNum
                  ? {
                      ...t,
                      status: 'OCCUPIED',
                      currentOrderId: newOrder.id,
                      totalSpentToday: (t.totalSpentToday || 0) + (newOrder.total || 0),
                    }
                  : t
              )
            );
          }

          setNotification({
            id: newOrder.id,
            title: `🔔 Nouvelle commande #${newOrder.id}`,
            subtitle: `${newOrder.customerName} • ${newOrder.orderType === 'DINE_IN' ? `Table ${newOrder.tableNumber}` : 'À emporter / Livraison'}`,
            amount: newOrder.total || 0,
          });
          if (isSoundEnabled) playOrderChime();
        };

        const handleOrderUpdated = (updated: Order) => {
          setOrders(prev =>
            prev.map(o => {
              if (o.id !== updated.id && cleanKey(o.id) !== cleanKey(updated.id)) return o;
              return {
                ...o,
                ...updated,
                total: updated.total !== undefined ? updated.total : o.total,
                subtotal: updated.subtotal !== undefined ? updated.subtotal : o.subtotal,
                discount: updated.discount !== undefined ? updated.discount : o.discount,
                items: (updated.items && updated.items.length > 0 && (updated.items[0] as any)?.unitPrice !== undefined)
                  ? updated.items
                  : o.items,
              };
            })
          );
          if (updated.tableNumber && (updated.status === 'SERVED' || updated.status === 'CANCELLED')) {
            const tNum = String(updated.tableNumber).trim().padStart(2, '0');
            setTables(prev =>
              prev.map(t => (t.number === tNum ? { ...t, status: 'FREE', currentOrderId: undefined } : t))
            );
          }
        };

        // Écoute des événements de création de commande
        socket.on('order:created', handleNewOrder);
        socket.on('new_order', handleNewOrder);
        socket.on('kitchen_new_order', handleNewOrder);

        // Écoute des événements de mise à jour de statut & cuisine
        socket.on('order:updated', handleOrderUpdated);
        socket.on('order_status_updated', handleOrderUpdated);
        socket.on('kitchen_order_updated', handleOrderUpdated);

        // Écoute des paiements confirmés
        socket.on('payment:confirmed', (payload: any) => {
          if (payload?.orderId) {
            const methodLabel = payload.method === 'OM' ? 'Orange Money' : 'Wave';
            const tag = `[Payé via ${methodLabel}]`;
            const cleanTarget = cleanKey(payload.orderId);

            setOrders(prev =>
              prev.map(o => {
                const cleanCurr = cleanKey(o.id);
                if (o.id === payload.orderId || cleanCurr === cleanTarget) {
                  const currNotes = o.notes || '';
                  const updatedNotes = currNotes.includes(tag)
                    ? currNotes
                    : currNotes ? `${currNotes} • ${tag}` : tag;
                  return { ...o, notes: updatedNotes };
                }
                return o;
              })
            );

            if (isSoundEnabled) playOrderChime();
            setNotification({
              id: String(payload.orderId),
              title: `💳 Paiement ${methodLabel} reçu !`,
              subtitle: `Commande #${payload.orderId} réglée avec succès`,
              amount: payload.amount || 0,
            });
          }
        });

        socket.on('sale:created', (salePayload: any) => {
          if (salePayload?.orderId) {
            setOrders(prev =>
              prev.map(o => (o.id === salePayload.orderId ? { ...o, status: 'SERVED' } : o))
            );
          }
        });

        socket.on('table_status_updated', (updatedTable: any) => {
          setTables(prev =>
            prev.map(t =>
              t.id === updatedTable.id || t.number === updatedTable.number
                ? { ...t, ...updatedTable }
                : t
            )
          );
        });

        socket.on('daily_menu_updated', (payload: any) => {
          if (payload?.dayOfWeek !== undefined && payload?.updated) {
            setWeeklySchedule(prev =>
              prev.map(item => (item.dayOfWeek === payload.dayOfWeek ? { ...item, ...payload.updated } : item))
            );
          }
        });

        socket.on('disconnect', () => {
          setIsOnline(false);
        });
      } catch (e) {
        // socket fallback
      }
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [isSoundEnabled]);

  // 2. Synchronisation instantanée multi-onglets / même appareil (BroadcastChannel & Storage 0ms)
  useEffect(() => {
    const cleanKey = (id: string) => String(id).replace(/^[#\s]*TF-/i, '').trim();

    const handleSyncMessage = (data: any) => {
      if (!data || !data.type) return;

      if (data.type === 'NEW_ORDER' && data.order) {
        const newOrder: Order = data.order;
        setOrders(prev => {
          const exists = prev.some(
            o => o.id === newOrder.id || cleanKey(o.id) === cleanKey(newOrder.id)
          );
          if (exists) return prev;

          if (isSoundEnabled) playOrderChime();
          setNotification({
            id: newOrder.id,
            title: `🔔 Nouvelle commande #${newOrder.id}`,
            subtitle: `${newOrder.customerName} • ${newOrder.orderType === 'DINE_IN' ? `Table ${newOrder.tableNumber}` : 'À emporter / Livraison'}`,
            amount: newOrder.total || 0,
          });

          if (newOrder.orderType === 'DINE_IN' && newOrder.tableNumber) {
            const tNum = String(newOrder.tableNumber).trim().padStart(2, '0');
            setTables(prevTables =>
              prevTables.map(t =>
                t.number === tNum
                  ? {
                      ...t,
                      status: 'OCCUPIED',
                      currentOrderId: newOrder.id,
                      totalSpentToday: (t.totalSpentToday || 0) + (newOrder.total || 0),
                    }
                  : t
              )
            );
          }

          return [newOrder, ...prev];
        });
      }

      if (data.type === 'PAYMENT_CONFIRMED' && data.orderId) {
        const cleanTargetId = cleanKey(data.orderId);
        const methodLabel = data.method === 'OM' ? 'Orange Money' : 'Wave';
        const tag = `[Payé via ${methodLabel}]`;

        setOrders(prev =>
          prev.map(o => {
            if (o.id === data.orderId || cleanKey(o.id) === cleanTargetId) {
              const currentNotes = o.notes || '';
              const updatedNotes = currentNotes.includes(tag)
                ? currentNotes
                : currentNotes ? `${currentNotes} • ${tag}` : tag;
              return {
                ...o,
                notes: updatedNotes,
                ...(data.order || {}),
              };
            }
            return o;
          })
        );

        if (isSoundEnabled) playOrderChime();
        setNotification({
          id: String(data.orderId),
          title: `💳 Paiement ${methodLabel} reçu !`,
          subtitle: `Commande #${data.orderId} réglée avec succès`,
          amount: data.amount || 0,
        });
      }

      if (data.type === 'ORDER_UPDATED' && data.order) {
        const updated: Order = data.order;
        setOrders(prev =>
          prev.map(o => (o.id === updated.id || cleanKey(o.id) === cleanKey(updated.id) ? { ...o, ...updated } : o))
        );
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('teranga_orders_sync');
        bc.onmessage = event => {
          handleSyncMessage(event.data);
        };
      }
    } catch {}

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'teranga_sync_event' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          handleSyncMessage(parsed);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [isSoundEnabled]);

  // 3. Moteur de synchronisation active haute fréquence (Polling résilient 2.5s pour Vercel / Réseau)
  useEffect(() => {
    let isPolling = false;
    const cleanKey = (id: string) => String(id).replace(/^[#\s]*TF-/i, '').trim();

    const syncRemoteOrders = async () => {
      const token = getAuthToken();
      if (isPolling) return;
      isPolling = true;

      try {
        let ordersUrl = `${BACKEND_URL}/api/orders`;
        try {
          const userStr = localStorage.getItem('teranga_auth_user') || sessionStorage.getItem('teranga_auth_user');
          if (userStr) {
            const u = JSON.parse(userStr);
            if (u.role === 'KITCHEN') {
              ordersUrl = `${BACKEND_URL}/api/orders/kitchen`;
            }
          }
        } catch {}

        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(ordersUrl, { headers }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data && Array.isArray(data.orders)) {
            setOrders(prev => {
              const currentIds = new Set(prev.flatMap(o => [String(o.id), cleanKey(o.id)]));
              const newIncomingOrders = data.orders.filter(
                (o: Order) => !currentIds.has(String(o.id)) && !currentIds.has(cleanKey(o.id))
              );

              if (newIncomingOrders.length > 0) {
                // Alerte sonore pour les nouvelles commandes
                const hasPending = newIncomingOrders.some((o: Order) => o.status === 'PENDING');
                if (hasPending && isSoundEnabled) {
                  playOrderChime();
                }

                // Notification visuelle
                const latest = newIncomingOrders[0];
                const isPaidWave = latest.notes?.includes('Wave');
                const isPaidOM = latest.notes?.includes('Orange Money');
                const paySuffix = isPaidWave ? ' [Wave ✓]' : isPaidOM ? ' [OM ✓]' : '';

                setNotification({
                  id: latest.id,
                  title: `🔔 Nouvelle commande #${latest.id}${paySuffix}`,
                  subtitle: `${latest.customerName} • ${latest.orderType === 'DINE_IN' ? `Table ${latest.tableNumber}` : 'À emporter / Livraison'}`,
                  amount: latest.total || 0,
                });

                // Mettre à jour l'état de la table si commande sur place
                if (latest.orderType === 'DINE_IN' && latest.tableNumber) {
                  const tNum = String(latest.tableNumber).trim().padStart(2, '0');
                  setTables(prevTables =>
                    prevTables.map(t =>
                      t.number === tNum
                        ? {
                            ...t,
                            status: 'OCCUPIED',
                            currentOrderId: latest.id,
                            totalSpentToday: (t.totalSpentToday || 0) + (latest.total || 0),
                          }
                        : t
                    )
                  );
                }

                return [...newIncomingOrders, ...prev];
              }

              // Synchroniser les statuts et les paiements Wave modifiés
              const incomingMap = new Map<string, Order>();
              data.orders.forEach((o: Order) => {
                incomingMap.set(String(o.id), o);
                const ck = cleanKey(o.id);
                if (ck) incomingMap.set(ck, o);
              });

              let hasChanges = false;
              const updated = prev.map(o => {
                const inc = incomingMap.get(String(o.id)) || incomingMap.get(cleanKey(o.id));
                if (
                  inc &&
                  (inc.status !== o.status ||
                    inc.notes !== o.notes ||
                    (inc.statusHistory?.length || 0) !== (o.statusHistory?.length || 0))
                ) {
                  hasChanges = true;
                  // Si un paiement Wave ou OM vient d'être tagué, notifier
                  if (
                    inc.notes?.includes('Payé via') &&
                    !o.notes?.includes('Payé via')
                  ) {
                    if (isSoundEnabled) playOrderChime();
                    setNotification({
                      id: inc.id,
                      title: `💳 Paiement confirmé pour la commande #${inc.id}`,
                      subtitle: `${inc.customerName} • ${inc.notes}`,
                      amount: inc.total || 0,
                    });
                  }
                  return {
                    ...o,
                    ...inc,
                    total: inc.total !== undefined ? inc.total : o.total,
                    subtotal: inc.subtotal !== undefined ? inc.subtotal : o.subtotal,
                  };
                }
                return o;
              });

              return hasChanges ? updated : prev;
            });
          }
        }
      } catch {
        // Réseau indisponible momentanément
      } finally {
        isPolling = false;
      }
    };

    // Polling toutes les 2.5 secondes pour réactivité instantanée en production
    const interval = setInterval(syncRemoteOrders, 2500);

    // Déclenchement immédiat au retour sur l'onglet ou au déverrouillage de la tablette
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        syncRemoteOrders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [isSoundEnabled]);

  // Sauvegarde permanente dans le localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          restaurant,
          categories,
          products,
          orders,
          customers,
          tables,
          promotions,
          reviews,
          weeklySchedule,
        })
      );
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [restaurant, categories, products, orders, customers, tables, promotions, reviews, weeklySchedule]);

  // Synchronisation inter-onglets (Storage Event)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          if (fresh.orders && fresh.orders.length > orders.length) {
            const newest = fresh.orders[0];
            setNotification({
              id: newest.id,
              title: `🔔 Nouvelle commande #${newest.id}`,
              subtitle: `${newest.customerName} • ${newest.orderType === 'DINE_IN' ? `Table ${newest.tableNumber}` : 'À emporter'}`,
              amount: newest.total,
            });
            if (isSoundEnabled) playOrderChime();
          }
          if (fresh.restaurant) setRestaurant(fresh.restaurant);
          if (fresh.categories) setCategories(fresh.categories);
          if (fresh.products) setProducts(fresh.products);
          if (fresh.orders) setOrders(fresh.orders);
          if (fresh.customers) setCustomers(fresh.customers);
          if (fresh.tables) setTables(fresh.tables);
          if (fresh.promotions) setPromotions(fresh.promotions);
          if (fresh.reviews) setReviews(fresh.reviews);
        } catch (err) {
          console.error('Error syncing cross-tab store', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [orders.length, isSoundEnabled]);

  const setActiveTable = (table: string | null) => {
    const formatted = table ? String(table).trim().padStart(2, '0') : null;
    setActiveTableState(formatted);
    try {
      if (formatted) {
        sessionStorage.setItem('teranga_active_table', formatted);
        localStorage.setItem('teranga_active_table', formatted);
      } else {
        sessionStorage.removeItem('teranga_active_table');
        localStorage.removeItem('teranga_active_table');
      }
    } catch { }
  };

  const addToCart = (
    product: Product,
    quantity: number,
    selectedOptions: { groupName: string; optionName: string; extraPrice: number }[] = [],
    notes?: string
  ) => {
    const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.extraPrice, 0);
    const unitPrice = product.price + optionsTotal;
    const optionsKey = selectedOptions.map(o => `${o.groupName}:${o.optionName}`).sort().join('|');
    const cartItemId = `${product.id}-${optionsKey}-${notes || ''}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          unitPrice,
          quantity,
          imageUrl: product.imageUrl,
          selectedOptions,
          notes,
        },
      ];
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    orderType: Order['orderType'];
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
    items: Order['items'];
    subtotal: number;
    discount?: number;
    deliveryFee: number;
    total: number;
  }): Promise<Order> => {
    const formattedTable =
      orderData.orderType === 'DINE_IN' && orderData.tableNumber
        ? String(orderData.tableNumber).trim().padStart(2, '0')
        : undefined;

    const payload = {
      ...orderData,
      tableNumber: formattedTable,
      discount: orderData.discount || 0,
    };

    let createdOrder: Order | null = null;

    // 1. Tenter l'envoi au backend transactionnel
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.order) {
          createdOrder = data.order;
        }
      }
    } catch (netErr) {
      console.warn('[Order] Serveur distant non disponible, enregistrement résilient local :', netErr);
    }

    // 2. Mode Résilient Infaillible : Si le backend n'a pas répondu (ex: Vercel statique, coupure réseau)
    // Le client ne doit JAMAIS être bloqué ! On garantit la création de la commande et l'ouverture de WhatsApp.
    if (!createdOrder) {
      const existingIds = orders
        .map(o => parseInt(String(o.id).replace(/\D/g, ''), 10))
        .filter(n => !isNaN(n));
      const maxId = existingIds.length > 0 ? Math.max(...existingIds, 1042) : 1042;
      const fallbackId = String(maxId + 1);

      createdOrder = {
        id: fallbackId,
        customerName: orderData.customerName.trim(),
        customerPhone: orderData.customerPhone.trim(),
        orderType: orderData.orderType,
        tableNumber: formattedTable,
        deliveryAddress: orderData.deliveryAddress?.trim(),
        notes: orderData.notes?.trim(),
        items: orderData.items,
        subtotal: orderData.subtotal,
        discount: orderData.discount || 0,
        deliveryFee: orderData.deliveryFee,
        total: orderData.total,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'PENDING',
            changedAt: new Date().toISOString(),
            note:
              orderData.orderType === 'DINE_IN' && formattedTable
                ? `Commande transmise depuis la table ${formattedTable}`
                : 'Nouvelle commande transmise au restaurant',
          },
        ],
      };
    }

    // 2. Mettre à jour l'état local avec la vraie commande retournée par la BDD
    setOrders(prev => [createdOrder, ...prev.filter(o => o.id !== createdOrder.id)]);

    // 3. Mettre à jour la table si sur place
    if (formattedTable) {
      setTables(prev =>
        prev.map(t =>
          t.number === formattedTable
            ? {
                ...t,
                status: 'OCCUPIED',
                currentOrderId: createdOrder.id,
                totalSpentToday: (t.totalSpentToday || 0) + (createdOrder.total || 0),
              }
            : t
        )
      );
    }

    // 4. Mettre à jour le CRM
    setCustomers(prev => {
      const existing = prev.find(
        c => c.phone.replace(/\s+/g, '') === orderData.customerPhone.replace(/\s+/g, '')
      );
      if (existing) {
        return prev.map(c =>
          c.id === existing.id
            ? {
                ...c,
                ordersCount: c.ordersCount + 1,
                totalSpent: c.totalSpent + createdOrder.total,
                lastOrderDate: 'À l’instant',
                loyaltyPoints: (c.loyaltyPoints || 0) + 10,
              }
            : c
        );
      } else {
        const newCustomer: Customer = {
          id: `cust-${Date.now()}`,
          name: orderData.customerName,
          phone: orderData.customerPhone,
          ordersCount: 1,
          totalSpent: createdOrder.total,
          lastOrderDate: 'À l’instant',
          isVip: false,
          loyaltyPoints: 10,
        };
        return [newCustomer, ...prev];
      }
    });

    if (isSoundEnabled) playOrderChime();

    setNotification({
      id: createdOrder.id,
      title: `🔔 Nouvelle commande #${createdOrder.id}`,
      subtitle: `${createdOrder.customerName} • ${formattedTable ? `Table ${formattedTable}` : 'À emporter'}`,
      amount: createdOrder.total,
    });

    // Diffusion instantanée multi-onglets / même appareil (0ms)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('teranga_orders_sync');
        bc.postMessage({ type: 'NEW_ORDER', order: createdOrder, at: Date.now() });
        bc.close();
      }
    } catch {}
    try {
      localStorage.setItem(
        'teranga_sync_event',
        JSON.stringify({ type: 'NEW_ORDER', order: createdOrder, at: Date.now() })
      );
    } catch {}

    clearCart();
    return createdOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string): Promise<void> => {
    const cleanId = String(orderId).replace(/^[#\s]*TF-/i, '').trim();
    const isTarget = (o: Order) =>
      o.id === orderId ||
      o.orderNumber === orderId ||
      (cleanId !== '' && (o.id === cleanId || o.orderNumber === `#TF-${cleanId}`));

    // 1. Envoyer au backend
    const token = getAuthToken();
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, note }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders(prev => prev.map(o => (isTarget(o) ? data.order : o)));
          if (data.order.tableNumber && (status === 'SERVED' || status === 'CANCELLED')) {
            const tNum = String(data.order.tableNumber).trim().padStart(2, '0');
            setTables(prev =>
              prev.map(t => (t.number === tNum ? { ...t, status: 'FREE', currentOrderId: undefined } : t))
            );
          }

          // Diffusion BroadcastChannel
          try {
            if (typeof BroadcastChannel !== 'undefined') {
              const bc = new BroadcastChannel('teranga_orders_sync');
              bc.postMessage({ type: 'ORDER_UPDATED', order: data.order, at: Date.now() });
              bc.close();
            }
          } catch {}
          try {
            localStorage.setItem(
              'teranga_sync_event',
              JSON.stringify({ type: 'ORDER_UPDATED', order: data.order, at: Date.now() })
            );
          } catch {}

          return;
        }
      }
    } catch (e) {
      console.warn('Sync status fallback', e);
    }

    // 2. Mettre à jour l'état local en cas de problème de réseau
    let fallbackUpdated: Order | null = null;
    setOrders(prev =>
      prev.map(o => {
        if (isTarget(o)) {
          const history = o.statusHistory || [];
          fallbackUpdated = {
            ...o,
            status,
            statusHistory: [
              ...history,
              { status, changedAt: new Date().toISOString(), note: note || `Statut passé à ${status}` },
            ],
          };
          return fallbackUpdated;
        }
        return o;
      })
    );

    // 3. Libérer la table si la commande est servie ou annulée
    const targetOrder = orders.find(isTarget);
    if (targetOrder && targetOrder.tableNumber && (status === 'SERVED' || status === 'CANCELLED')) {
      const tNum = String(targetOrder.tableNumber).trim().padStart(2, '0');
      setTables(prev =>
        prev.map(t => (t.number === tNum ? { ...t, status: 'FREE', currentOrderId: undefined } : t))
      );
    }

    if (fallbackUpdated) {
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('teranga_orders_sync');
          bc.postMessage({ type: 'ORDER_UPDATED', order: fallbackUpdated, at: Date.now() });
          bc.close();
        }
      } catch {}
    }
  };

  const confirmOrderPayment = async (
    orderId: string,
    paymentMethod: 'WAVE' | 'OM',
    amount?: number
  ): Promise<void> => {
    const cleanTargetId = String(orderId).replace(/^[#\s]*TF-/i, '').trim();
    const methodLabel = paymentMethod === 'OM' ? 'Orange Money' : 'Wave';
    const tag = `[Payé via ${methodLabel}]`;

    // 1. Mise à jour immédiate optimiste locale
    setOrders(prev =>
      prev.map(o => {
        const cleanCurrId = String(o.id).replace(/^[#\s]*TF-/i, '').trim();
        if (o.id === orderId || cleanCurrId === cleanTargetId) {
          const currentNotes = o.notes || '';
          const updatedNotes = currentNotes.includes(tag)
            ? currentNotes
            : currentNotes ? `${currentNotes} • ${tag}` : tag;
          return {
            ...o,
            notes: updatedNotes,
            statusHistory: [
              ...(o.statusHistory || []),
              {
                status: o.status,
                changedAt: new Date().toISOString(),
                note: `Paiement ${methodLabel} validé par le client (${amount ? `${amount} FCFA` : 'validé'})`,
              },
            ],
          };
        }
        return o;
      })
    );

    // 2. Diffusion BroadcastChannel 0ms pour la cuisine et les autres écrans
    const syncPayload = {
      type: 'PAYMENT_CONFIRMED',
      orderId,
      method: paymentMethod,
      amount,
      at: Date.now(),
    };
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('teranga_orders_sync');
        bc.postMessage(syncPayload);
        bc.close();
      }
    } catch {}
    try {
      localStorage.setItem('teranga_sync_event', JSON.stringify(syncPayload));
    } catch {}

    // 3. Notification vers l'API backend pour persister en BDD PostgreSQL / MariaDB
    try {
      await fetch(`${BACKEND_URL}/api/orders/${cleanTargetId || orderId}/payment-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod, amount }),
      });
    } catch (e) {
      console.warn('Erreur confirmation paiement backend :', e);
    }
  };

  const updateTableStatus = (tableNumber: string, status: TableStatus) => {
    const formatted = String(tableNumber).trim().padStart(2, '0');
    setTables(prev => prev.map(t => (t.number === formatted ? { ...t, status } : t)));
    const target = tables.find(t => t.number === formatted);
    if (target) {
      const token = getAuthToken();
      fetch(`${BACKEND_URL}/api/tables/${target.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      }).catch(() => { });
    }
  };

  const addTable = async (tableData: { number: string; capacity: number; area?: string; status?: TableStatus }) => {
    const formattedNumber = String(tableData.number).trim().padStart(2, '0');
    const newTable: RestaurantTable = {
      id: `tbl-${formattedNumber}-${Date.now()}`,
      number: formattedNumber,
      capacity: Number(tableData.capacity) || 4,
      status: tableData.status || 'FREE',
      area: tableData.area || 'Salle Principale',
      qrCodeUrl: `${window.location.origin}/menu?table=${formattedNumber}`,
    };

    setTables(prev => {
      if (prev.some(t => t.number === formattedNumber)) {
        return prev.map(t => (t.number === formattedNumber ? { ...t, ...newTable } : t));
      }
      return [...prev, newTable].sort((a, b) => a.number.localeCompare(b.number));
    });

    try {
      const token = localStorage.getItem('teranga_auth_token') || sessionStorage.getItem('teranga_auth_token');
      await fetch(`${BACKEND_URL}/api/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          number: formattedNumber,
          capacity: tableData.capacity,
          area: tableData.area,
          status: tableData.status,
        }),
      });
    } catch (e) {
      console.warn('Backend unavailable, table added locally', e);
    }
  };

  const deleteTable = async (tableIdOrNumber: string) => {
    const target = tables.find(t => t.id === tableIdOrNumber || t.number === tableIdOrNumber);
    setTables(prev => prev.filter(t => t.id !== tableIdOrNumber && t.number !== tableIdOrNumber));

    if (target) {
      try {
        const token = localStorage.getItem('teranga_auth_token') || sessionStorage.getItem('teranga_auth_token');
        await fetch(`${BACKEND_URL}/api/tables/${target.id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch (e) {
        console.warn('Backend unavailable, table deleted locally', e);
      }
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const tempId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: tempId,
    };
    setProducts(prev => [newProduct, ...prev]);

    try {
      const token = localStorage.getItem('teranga_auth_token') || sessionStorage.getItem('teranga_auth_token');
      const response = await fetch(`${BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.product?.id) {
          setProducts(prev => prev.map(p => (p.id === tempId ? { ...p, id: data.product.id } : p)));
        }
      }
    } catch (e) {
      console.warn('Backend unavailable, product added locally', e);
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...productData } : p)));

    try {
      const token = localStorage.getItem('teranga_auth_token') || sessionStorage.getItem('teranga_auth_token');
      await fetch(`${BACKEND_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(productData),
      });
    } catch (e) {
      console.warn('Backend unavailable, product updated locally', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      const token = localStorage.getItem('teranga_auth_token') || sessionStorage.getItem('teranga_auth_token');
      await fetch(`${BACKEND_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {
      console.warn('Backend unavailable, product deleted locally', e);
    }
  };

  const toggleProductAvailability = (id: string) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p)));
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...categoryData } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const togglePromotion = (id: string) => {
    setPromotions(prev => prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: 'À l’instant',
    };
    setReviews(prev => [newRev, ...prev]);

    fetch(`${BACKEND_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    }).catch(() => { });
  };

  const replyToReview = (id: string, reply: string) => {
    setReviews(prev => prev.map(r => (r.id === id ? { ...r, reply } : r)));
  };

  const updateRestaurantSettings = (settings: Partial<Restaurant>) => {
    setRestaurant(prev => ({ ...prev, ...settings }));
    fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch(() => { });
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };

  const resetToInitialData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRestaurant(INITIAL_RESTAURANT);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setTables(INITIAL_TABLES);
    setPromotions(INITIAL_PROMOTIONS);
    setReviews(INITIAL_REVIEWS);
    setCart([]);
  };
  const resetToDemoData = resetToInitialData;

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const updateDaySchedule = async (dayOfWeek: number, updates: Partial<DailyMenuSchedule>) => {
    setWeeklySchedule(prev =>
      prev.map(d => (d.dayOfWeek === dayOfWeek ? { ...d, ...updates } : d))
    );

    try {
      const token = localStorage.getItem('teranga_auth_token') || sessionStorage.getItem('teranga_auth_token');
      await fetch(`${BACKEND_URL}/api/menu/schedule/${dayOfWeek}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Backend offline, schedule updated locally', e);
    }
  };

  const updateTodayMenu = async (updates: Partial<DailyMenuSchedule>) => {
    const todayIndex = new Date().getDay();
    await updateDaySchedule(todayIndex, updates);
  };

  const getTodaySchedule = () => {
    const todayIndex = new Date().getDay();
    const schedule = weeklySchedule.find(s => s.dayOfWeek === todayIndex) || weeklySchedule[0];
    const matchingProducts = products.filter(p => schedule.productIds.includes(p.id));
    return {
      schedule,
      products: matchingProducts.length > 0 ? matchingProducts : products.slice(0, 2),
    };
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        categories,
        products,
        orders,
        customers,
        tables,
        promotions,
        reviews,
        loyaltyRewards,
        insights,
        cart,
        weeklySchedule,
        activeTable,
        notification,
        isSoundEnabled,
        isOnline,
        updateDaySchedule,
        updateTodayMenu,
        getTodaySchedule,
        setActiveTable,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        confirmOrderPayment,
        updateOrderStatus,
        updateTableStatus,
        addTable,
        deleteTable,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        togglePromotion,
        addReview,
        replyToReview,
        updateRestaurantSettings,
        dismissNotification,
        toggleSound,
        testAudioChime: playOrderChime,
        resetToInitialData,
        resetToDemoData,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantStore = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurantStore must be used within a RestaurantProvider');
  }
  return context;
};
