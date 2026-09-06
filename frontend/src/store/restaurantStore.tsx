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
    deliveryFee: number;
    total: number;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
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
  const [orders, setOrders] = useState<Order[]>(initial.orders || INITIAL_ORDERS);
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
        const [menuRes, ordersRes, tablesRes, scheduleRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/menu`).catch(() => null),
          fetch(`${BACKEND_URL}/api/orders`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }).catch(() => null),
          fetch(`${BACKEND_URL}/api/tables`).catch(() => null),
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

        if (ordersRes && ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.orders && ordersData.orders.length > 0) {
            setOrders(ordersData.orders);
          }
        }

        if (tablesRes && tablesRes.ok) {
          const tablesData = await tablesRes.json();
          if (tablesData.tables && tablesData.tables.length > 0) {
            setTables(tablesData.tables);
          }
        }

        setIsOnline(true);
      } catch (err) {
        console.warn('Mode local hors-ligne activé (Backend non joignable).');
      }
    };

    fetchBackendData();
  }, []);

  // Connexion Socket.IO temps réel avec le serveur MariaDB
  useEffect(() => {
    let socket: Socket | null = null;
    try {
      const token = getAuthToken();
      socket = socketIOClient(BACKEND_URL, {
        auth: { token },
        reconnectionAttempts: 5,
        timeout: 3000,
      });

      socket.on('connect', () => {
        setIsOnline(true);
        socket?.emit('join_kitchen', { token });
        socket?.emit('join_admin', { token });
      });

      socket.on('new_order', (newOrder: Order) => {
        setOrders(prev => {
          if (prev.some(o => o.id === newOrder.id)) return prev;
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
                    totalSpentToday: (t.totalSpentToday || 0) + newOrder.total,
                  }
                : t
            )
          );
        }
        setNotification({
          id: newOrder.id,
          title: `🔔 Nouvelle commande #${newOrder.id}`,
          subtitle: `${newOrder.customerName} • ${newOrder.orderType === 'DINE_IN' ? `Table ${newOrder.tableNumber}` : 'À emporter / Livraison'}`,
          amount: newOrder.total,
        });
        if (isSoundEnabled) playOrderChime();
      });

      socket.on('order_status_updated', (updated: Order) => {
        setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
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

    return () => {
      if (socket) socket.disconnect();
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

  const createOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    orderType: Order['orderType'];
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
    items: Order['items'];
    subtotal: number;
    deliveryFee: number;
    total: number;
  }): Order => {
    const highestId = orders.reduce((max, o) => {
      const num = parseInt(o.id.replace(/\D/g, ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 1042);
    const newId = String(highestId + 1);

    const formattedTable =
      orderData.orderType === 'DINE_IN' && orderData.tableNumber
        ? String(orderData.tableNumber).trim().padStart(2, '0')
        : undefined;

    const newOrder: Order = {
      id: newId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      orderType: orderData.orderType,
      tableNumber: formattedTable,
      deliveryAddress: orderData.deliveryAddress,
      notes: orderData.notes,
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'PENDING',
          changedAt: new Date().toISOString(),
          note: formattedTable ? `Commande transmise depuis la table ${formattedTable}` : 'Nouvelle commande',
        },
      ],
    };

    const payload = {
      ...orderData,
      tableNumber: formattedTable,
    };

    // 1. Envoyer au backend MariaDB
    fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            // Remplacer la commande optimiste par la commande officielle du serveur (avec son ID définitif)
            setOrders(prev => prev.map(o => (o.id === newOrder.id ? data.order : o)));
          }
        }
      })
      .catch(e => console.warn('Sync local fallback order', e));

    // 2. Mettre à jour l'état local immédiat
    setOrders(prev => [newOrder, ...prev]);

    // 3. Mettre à jour la table
    if (formattedTable) {
      setTables(prev =>
        prev.map(t =>
          t.number === formattedTable
            ? {
              ...t,
              status: 'OCCUPIED',
              currentOrderId: newOrder.id,
              totalSpentToday: (t.totalSpentToday || 0) + orderData.total,
            }
            : t
        )
      );
    }

    // 4. Mettre à jour le CRM client
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
              totalSpent: c.totalSpent + orderData.total,
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
          totalSpent: orderData.total,
          lastOrderDate: 'À l’instant',
          isVip: false,
          loyaltyPoints: 10,
        };
        return [newCustomer, ...prev];
      }
    });

    if (isSoundEnabled) playOrderChime();

    setNotification({
      id: newOrder.id,
      title: `🔔 Nouvelle commande #${newOrder.id}`,
      subtitle: `${newOrder.customerName} • ${formattedTable ? `Table ${formattedTable}` : 'À emporter'}`,
      amount: newOrder.total,
    });

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    // 1. Envoyer au backend MariaDB
    const token = getAuthToken();
    fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status, note }),
    }).catch(e => console.warn('Sync status fallback', e));

    // 2. Mettre à jour l'état local
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const history = o.statusHistory || [];
          return {
            ...o,
            status,
            statusHistory: [
              ...history,
              { status, changedAt: new Date().toISOString(), note: note || `Statut passé à ${status}` },
            ],
          };
        }
        return o;
      })
    );

    // 3. Libérer la table si la commande est servie ou annulée
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && targetOrder.tableNumber && (status === 'SERVED' || status === 'CANCELLED')) {
      const tNum = String(targetOrder.tableNumber).trim().padStart(2, '0');
      setTables(prev =>
        prev.map(t => (t.number === tNum ? { ...t, status: 'FREE', currentOrderId: undefined } : t))
      );
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
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [newProduct, ...prev]);

    try {
      const token = localStorage.getItem('teranga_auth_token') || sessionStorage.getItem('teranga_auth_token');
      await fetch(`${BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(productData),
      });
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
