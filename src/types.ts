export interface MenuItem {
  id: string;
  code: string;
  name: string;
  price: number;
  category: 'Starter' | 'Main Course' | 'Breads' | 'Dessert' | 'Beverage';
  isAvailable: boolean;
}

export type OrderType = 'Dine-In' | 'Takeaway' | 'Room Service';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  orderType: OrderType;
  items: {
    id: string;
    code: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  serviceCharge: number; // Optional service charge
  discount: number; // Discount amount
  discountType: 'percentage' | 'flat';
  discountValue: number;
  total: number;
  date: string; // ISO String or YYYY-MM-DD
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Pending';
}

export interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  totalDiscount: number;
  categorySales: Record<string, number>;
}

export interface HotelSettings {
  logoUrl: string;
  name: string;
  address: string;
  phone: string;
  fssaiNumber: string;
  currency: string;
  enableServiceCharge: boolean;
  serviceChargeRate: number;
  footerMessage: string;
}

export type KotStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served';

export interface KotItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  notes?: string;
}

export interface KOT {
  id: string;
  kotNumber: string;
  tableNumber: string;
  customerName?: string;
  orderType: OrderType;
  items: KotItem[];
  status: KotStatus;
  createdAt: string; // ISO String
  notes?: string;
  isBilled?: boolean;
  billId?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export type UserRole = 'Admin' | 'Staff';

export interface User {
  fullName: string;
  mobileNumber: string;
  passwordHash: string; // Stored securely
  role: UserRole;
  createdAt: string;
}
