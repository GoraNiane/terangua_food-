export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED';

export interface Restaurant {
  id: string;
  name: string;
  slogan: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  whatsappNumber: string; // Ex: 221774888464
  logoUrl: string;
  coverUrl: string;
  openingHours: string;
  currency: string;
  tablesCount: number;
  isOpen: boolean;
  slug?: string;
  productionUrl?: string;
  dineInEnabled?: boolean;
  takeawayEnabled?: boolean;
  deliveryEnabled?: boolean;
}

export interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  area?: string; // Ex: "Salle Principale", "Terrasse", "Salon VIP"
  currentOrderId?: string;
  totalSpentToday?: number;
  qrCodeUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductOptionItem {
  id: string;
  name: string;
  extraPrice: number; // in FCFA
  isDefault?: boolean;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  items: ProductOptionItem[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number; // in FCFA
  originalPrice?: number; // for promotions
  imageUrl: string;
  videoUrl?: string; // URL directe MP4, Cloudinary ou lien vidéo
  isAvailable: boolean;
  isFeatured?: boolean;
  badge?: 'Chef' | 'Populaire' | 'Nouveau' | 'Épicé' | null;
  ingredients: string[];
  optionGroups: ProductOptionGroup[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  selectedOptions: {
    groupName: string;
    optionName: string;
    extraPrice: number;
  }[];
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedOptionsText?: string;
  notes?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  changedAt: string;
  note?: string;
}

export interface Order {
  id: string; // ex: '1042'
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  statusHistory?: OrderStatusHistoryItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  isVip?: boolean;
  loyaltyPoints?: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  targetCategory?: string;
  targetProductId?: string;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  orderId: string;
  createdAt: string;
  reply?: string;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  ordersRequired: number;
  discountAmount?: number;
  freeItemName?: string;
}

export interface Insight {
  id: string;
  type: 'TOP_PRODUCT' | 'PEAK_HOUR' | 'COMBO' | 'RECOMMENDATION';
  icon: string;
  title: string;
  description: string;
  impact?: string;
  actionCta?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'KITCHEN';
}

export interface DailyMenuSchedule {
  id: string;
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  dayName: string; // "Lundi", "Mardi", etc.
  themeTitle: string; // Ex: "Vendredi Saint-Louis — Grand Thiéboudienne Pêcheur"
  description?: string;
  specialPrice?: number;
  specialNote?: string;
  productIds: string[];
  isActive: boolean;
}

