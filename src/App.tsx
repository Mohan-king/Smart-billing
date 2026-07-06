import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Utensils,
  ChefHat,
  Receipt,
  Plus,
  Minus,
  Trash2,
  Edit,
  Search,
  Filter,
  TrendingUp,
  LogOut,
  User,
  Clock,
  Settings,
  DollarSign,
  CheckCircle,
  Calendar,
  Printer,
  X,
  Menu,
  Grid,
  ChevronRight,
  CreditCard,
  Smartphone,
  Percent,
  ShoppingBag,
  BarChart2,
  Home,
  Check,
  AlertTriangle,
  ClipboardList,
  Upload
} from 'lucide-react';
import { MenuItem, Bill, CartItem, OrderType, HotelSettings, KOT, KotItem, KotStatus, User as POSUser, UserRole } from './types';
import { INITIAL_MENU_ITEMS } from './initialMenu';
import { getInitialBills } from './initialBills';

interface MenuCatalogCardProps {
  key?: React.Key;
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  currency?: string;
}

function MenuCatalogCard({ item, onAdd, currency }: MenuCatalogCardProps) {
  const getCategoryStyles = (category: MenuItem['category']) => {
    switch (category) {
      case 'Starter':
        return 'bg-amber-50 text-amber-800 border-amber-200/60';
      case 'Main Course':
        return 'bg-orange-50 text-orange-800 border-orange-200/60';
      case 'Breads':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200/60';
      case 'Dessert':
        return 'bg-rose-50 text-rose-800 border-rose-200/60';
      case 'Beverage':
        return 'bg-sky-50 text-sky-800 border-sky-200/60';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200/60';
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl p-4 border transition-all duration-300 relative group flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        !item.isAvailable 
          ? 'border-slate-100 opacity-60 bg-slate-50' 
          : 'border-slate-200/80 hover:border-emerald-200 hover:translate-y-[-2px]'
      }`}
    >
      {/* Category Badge & Code */}
      <div className="flex justify-between items-center mb-2.5">
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${getCategoryStyles(item.category)}`}>
          {item.category}
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-lg text-slate-600 tracking-wide tabular-nums border border-slate-200/50">
          {item.code}
        </span>
      </div>

      <div className="mb-4 flex-1">
        <h5 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-emerald-950 transition-colors">
          {item.name}
        </h5>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-base font-extrabold text-emerald-700 tabular-nums">{currency || '₹'}{item.price}</span>
          <span className="text-slate-300 text-xs">•</span>
          <span className={`text-[10px] font-bold ${item.isAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>
            {item.isAvailable ? 'In Kitchen' : 'Sold Out'}
          </span>
        </div>
      </div>

      {/* Add Button Area */}
      <div className="pt-2 border-t border-slate-100">
        {item.isAvailable ? (
          <button
            type="button"
            onClick={() => onAdd(item)}
            className="w-full py-1.5 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white hover:bg-emerald-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/80 group-hover:border-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        ) : (
          <span className="w-full py-1.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl text-center block select-none border border-slate-200/40">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // --- USER AUTHENTICATION STATE ---
  const [users, setUsers] = useState<POSUser[]>(() => {
    const saved = localStorage.getItem('shbs_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse users, using defaults', e);
      }
    }
    return [
      {
        fullName: 'Administrator',
        mobileNumber: '9876543210',
        passwordHash: 'admin123',
        role: 'Admin',
        createdAt: new Date().toISOString()
      },
      {
        fullName: 'Rohan Staff',
        mobileNumber: '9876543211',
        passwordHash: 'staff123',
        role: 'Staff',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [currentUser, setCurrentUser] = useState<POSUser | null>(() => {
    const saved = localStorage.getItem('shbs_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('shbs_logged_in') === 'true' && localStorage.getItem('shbs_current_user') !== null;
  });

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login form state
  const [loginMobile, setLoginMobile] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Signup form state
  const [signUpFullName, setSignUpFullName] = useState<string>('');
  const [signUpMobile, setSignUpMobile] = useState<string>('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Staff');
  const [signUpOtp, setSignUpOtp] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState<string>('');
  const [isSignUpOtpSent, setIsSignUpOtpSent] = useState<boolean>(false);
  const [generatedSignUpOtp, setGeneratedSignUpOtp] = useState<string>('');

  // Forgot Password form state
  const [forgotMobile, setForgotMobile] = useState<string>('');
  const [forgotOtp, setForgotOtp] = useState<string>('');
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState<string>('');
  const [isForgotOtpSent, setIsForgotOtpSent] = useState<boolean>(false);
  const [generatedForgotOtp, setGeneratedForgotOtp] = useState<string>('');

  // --- MENU MANAGEMENT STATE ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('shbs_menu_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse menu items, reverting to defaults', e);
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  // --- COMPLETED BILLS STATE ---
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('shbs_bills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bills, reverting to defaults', e);
      }
    }
    return getInitialBills();
  });

  // --- ACTIVE BILLING (CART) STATE ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('Dine-In');
  const [tableNumber, setTableNumber] = useState<string>('Table 1');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [includeServiceCharge, setIncludeServiceCharge] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Pending'>('UPI');

  // KOT notes at the checkout cart level
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

  // Pending orders / Held tables state
  const [pendingBills, setPendingBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('shbs_pending_bills');
    return saved ? JSON.parse(saved) : [];
  });

  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'billing' | 'kots' | 'menu' | 'reports' | 'settings'>('dashboard');

  // --- HOTEL SETTINGS STATE ---
  const [settings, setSettings] = useState<HotelSettings>(() => {
    const saved = localStorage.getItem('shbs_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings, reverting to default', e);
      }
    }
    return {
      logoUrl: '',
      name: 'Green Olive',
      address: 'Smart Hotel Road, Sector 4, Bangalore',
      phone: '+91 98765 43210',
      fssaiNumber: '12345678901234',
      currency: '₹',
      enableServiceCharge: true,
      serviceChargeRate: 5,
      footerMessage: 'Hope you enjoyed the meal. See you again!'
    };
  });

  // --- KITCHEN ORDER TICKETS (KOT) STATE ---
  const [kots, setKots] = useState<KOT[]>(() => {
    const saved = localStorage.getItem('shbs_kots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse KOTs', e);
      }
    }
    return [];
  });

  const [activeKotPreview, setActiveKotPreview] = useState<KOT | null>(null);
  const [selectedKotId, setSelectedKotId] = useState<string | null>(null);
  const [kotHistoryTab, setKotHistoryTab] = useState<'active' | 'history' | 'trash'>('active');
  const [kotToConfirmDelete, setKotToConfirmDelete] = useState<KOT | null>(null);
  const [isPermanentDeleteConfirm, setIsPermanentDeleteConfirm] = useState<boolean>(false);

  // KOT Search & Filters
  const [kotSearch, setKotSearch] = useState<string>('');
  const [kotFilterStatus, setKotFilterStatus] = useState<string>('All');
  const [kotFilterType, setKotFilterType] = useState<string>('All');

  // --- FILTER & SEARCH STATES ---
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('All');
  const [billingSearch, setBillingSearch] = useState<string>('');
  const [billingFilterCategory, setBillingFilterCategory] = useState<string>('All');
  const [reportDateRange, setReportDateRange] = useState<'today' | 'yesterday' | '7days' | 'all'>('today');

  // --- MODALS & NOTIFICATIONS ---
  const [activeReceiptBill, setActiveReceiptBill] = useState<Bill | null>(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState<boolean>(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // --- EDIT KOT MODAL STATE ---
  const [editingKot, setEditingKot] = useState<KOT | null>(null);
  const [editingKotItems, setEditingKotItems] = useState<KotItem[]>([]);
  const [editingKotTable, setEditingKotTable] = useState<string>('');
  const [editingKotName, setEditingKotName] = useState<string>('');
  const [editingKotNotes, setEditingKotNotes] = useState<string>('');
  const [kotAddItemSearch, setKotAddItemSearch] = useState<string>('');

  // --- MENU FORM STATE ---
  const [formCode, setFormCode] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MenuItem['category']>('Starter');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formAvailable, setFormAvailable] = useState<boolean>(true);

  // --- SYNC TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem('shbs_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('shbs_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('shbs_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('shbs_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('shbs_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('shbs_pending_bills', JSON.stringify(pendingBills));
  }, [pendingBills]);

  useEffect(() => {
    localStorage.setItem('shbs_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('shbs_kots', JSON.stringify(kots));
  }, [kots]);

  // Handle temporary auto-dismissing notifications
  const triggerNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // --- USER AUTHENTICATION ACTIONS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.mobileNumber === loginMobile);
    if (!user) {
      setLoginError('No account registered with this mobile number.');
      return;
    }
    if (user.passwordHash !== loginPassword) {
      setLoginError('Incorrect password. Please try again.');
      return;
    }

    // Success login
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('shbs_logged_in', 'true');
    triggerNotification(`Welcome back, ${user.fullName}!`, 'success');
    setLoginError('');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpFullName.trim()) {
      triggerNotification('Please enter your full name', 'error');
      return;
    }
    if (signUpMobile.length !== 10) {
      triggerNotification('Mobile number must be exactly 10 digits', 'error');
      return;
    }
    if (users.some(u => u.mobileNumber === signUpMobile)) {
      triggerNotification('An account with this mobile number already exists', 'error');
      return;
    }
    if (!signUpOtp || signUpOtp !== generatedSignUpOtp) {
      triggerNotification('Invalid OTP. Please enter the correct verification code.', 'error');
      return;
    }
    if (signUpPassword.length < 6) {
      triggerNotification('Password must be at least 6 characters long', 'error');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      triggerNotification('Passwords do not match', 'error');
      return;
    }

    const newUser: POSUser = {
      fullName: signUpFullName.trim(),
      mobileNumber: signUpMobile,
      passwordHash: signUpPassword,
      role: signUpRole,
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('shbs_logged_in', 'true');
    triggerNotification('Account registered successfully! Welcome.', 'success');
    
    // Clear states
    setSignUpFullName('');
    setSignUpMobile('');
    setSignUpOtp('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');
    setIsSignUpOtpSent(false);
    setGeneratedSignUpOtp('');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const userIndex = users.findIndex(u => u.mobileNumber === forgotMobile);
    if (userIndex === -1) {
      triggerNotification('No account found with this mobile number.', 'error');
      return;
    }
    if (!forgotOtp || forgotOtp !== generatedForgotOtp) {
      triggerNotification('Invalid OTP verification code.', 'error');
      return;
    }
    if (forgotNewPassword.length < 6) {
      triggerNotification('Password must be at least 6 characters long', 'error');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      triggerNotification('Passwords do not match', 'error');
      return;
    }

    // Update user password
    setUsers(prev => prev.map((u, idx) => idx === userIndex ? { ...u, passwordHash: forgotNewPassword } : u));
    
    // Auto login
    const updatedUser = { ...users[userIndex], passwordHash: forgotNewPassword };
    setCurrentUser(updatedUser);
    setIsLoggedIn(true);
    localStorage.setItem('shbs_logged_in', 'true');
    triggerNotification('Password reset successful! Signed in.', 'success');

    // Clear forgot states
    setForgotMobile('');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setIsForgotOtpSent(false);
    setGeneratedForgotOtp('');
    setAuthMode('login');
  };

  const handleSendSignUpOtp = () => {
    if (signUpMobile.length !== 10) {
      triggerNotification('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedSignUpOtp(otp);
    setIsSignUpOtpSent(true);
    triggerNotification(`Simulated OTP sent to mobile: ${otp}`, 'info');
  };

  const handleSendForgotOtp = () => {
    if (forgotMobile.length !== 10) {
      triggerNotification('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (!users.some(u => u.mobileNumber === forgotMobile)) {
      triggerNotification('No registered account found with this mobile number', 'error');
      return;
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedForgotOtp(otp);
    setIsForgotOtpSent(true);
    triggerNotification(`Simulated OTP sent to mobile: ${otp}`, 'info');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('shbs_logged_in');
    triggerNotification('Logged out successfully', 'info');
  };

  // --- PRE-LOAD MENU FORM CODES ---
  const getNextCode = (category: MenuItem['category']) => {
    const prefixMap = {
      Starter: 'P',
      'Main Course': 'M',
      Breads: 'B',
      Dessert: 'D',
      Beverage: 'V'
    };
    const prefix = prefixMap[category];
    const categoryItems = menuItems.filter(item => item.category === category);
    if (categoryItems.length === 0) return `${prefix}101`;
    
    const codes = categoryItems
      .map(item => {
        const numPart = item.code.replace(/^[A-Z]/, '');
        return parseInt(numPart, 10);
      })
      .filter(n => !isNaN(n));
    
    const maxNum = codes.length > 0 ? Math.max(...codes) : 100;
    return `${prefix}${maxNum + 1}`;
  };

  // Automatically update suggested code when form category changes
  useEffect(() => {
    if (!editingMenuItem && showAddMenuModal) {
      setFormCode(getNextCode(formCategory));
    }
  }, [formCategory, showAddMenuModal, editingMenuItem]);

  // --- MENU CRUD ACTIONS ---
  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName || formPrice <= 0) {
      triggerNotification('Please fill all fields with valid data', 'error');
      return;
    }

    if (editingMenuItem) {
      // Edit
      setMenuItems(prev =>
        prev.map(item =>
          item.id === editingMenuItem.id
            ? { ...item, code: formCode, name: formName, category: formCategory, price: formPrice, isAvailable: formAvailable }
            : item
        )
      );
      triggerNotification(`Item "${formName}" updated successfully`);
    } else {
      // Add
      const isCodeExists = menuItems.some(item => item.code.toUpperCase() === formCode.toUpperCase());
      if (isCodeExists) {
        triggerNotification(`Item code "${formCode}" already exists`, 'error');
        return;
      }

      const newItem: MenuItem = {
        id: Date.now().toString(),
        code: formCode.toUpperCase(),
        name: formName,
        category: formCategory,
        price: formPrice,
        isAvailable: formAvailable
      };
      setMenuItems(prev => [...prev, newItem]);
      triggerNotification(`Item "${formName}" added to Menu`);
    }

    // Reset Form
    setEditingMenuItem(null);
    setShowAddMenuModal(false);
    resetMenuForm();
  };

  const resetMenuForm = (defaultCategory?: MenuItem['category']) => {
    setFormCode('');
    setFormName('');
    setFormCategory(defaultCategory || 'Starter');
    setFormPrice(0);
    setFormAvailable(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingMenuItem(item);
    setFormCode(item.code);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormAvailable(item.isAvailable);
    setShowAddMenuModal(true);
  };

  const handleDeleteMenuItem = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
      triggerNotification(`"${name}" deleted from menu`, 'info');
    }
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
    triggerNotification('Item status changed');
  };

  // --- CART / BILLING ACTIONS ---
  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      triggerNotification('This item is currently out of stock', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(ci => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map(ci => (ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci));
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
    triggerNotification(`Added ${item.name} to order`, 'success');
  };

  const updateCartQuantity = (itemId: string, q: number) => {
    if (q <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(ci => (ci.menuItem.id === itemId ? { ...ci, quantity: q } : ci)));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(ci => ci.menuItem.id !== itemId));
    triggerNotification('Item removed from order', 'info');
  };

  // Automated billing calculations
  const billingCalculations = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const serviceCharge = includeServiceCharge && settings.enableServiceCharge ? parseFloat((subtotal * (settings.serviceChargeRate / 100)).toFixed(2)) : 0;

    let discount = 0;
    if (discountType === 'percentage') {
      discount = parseFloat((subtotal * (discountValue / 100)).toFixed(2));
    } else {
      discount = discountValue;
    }
    // Prevent discount from exceeding subtotal
    if (discount > subtotal) discount = subtotal;

    const total = Math.round(subtotal + serviceCharge - discount);

    return {
      subtotal,
      serviceCharge,
      discount,
      total
    };
  }, [cart, includeServiceCharge, discountType, discountValue, settings]);

  // Send current cart items to kitchen (KOT)
  const handleSendKOT = () => {
    if (cart.length === 0) {
      triggerNotification('No items in order to send to kitchen', 'error');
      return;
    }

    // Generate KOT Number sequentially with absolute uniqueness protection
    const kotNum = getNextKotNumber(kots);

    const newKot: KOT = {
      id: Date.now().toString(),
      kotNumber: kotNum,
      tableNumber: orderType === 'Takeaway' ? 'Counter' : tableNumber,
      customerName: customerName === 'Walk-in Customer' ? '' : customerName,
      orderType,
      items: cart.map(ci => ({
        id: ci.menuItem.id,
        code: ci.menuItem.code,
        name: ci.menuItem.name,
        quantity: ci.quantity
      })),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      notes: checkoutNotes.trim() || undefined,
      isBilled: false
    };

    setKots(prev => [newKot, ...prev]);
    setActiveKotPreview(newKot);
    triggerNotification(`KOT ${kotNum} generated and sent to kitchen!`, 'success');

    // Clear workstation states so they can take the next order
    setCart([]);
    setCheckoutNotes('');
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setDiscountValue(0);
  };

  // Checkout and complete payment
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      triggerNotification('Your billing cart is empty', 'error');
      return;
    }

    // Generate Invoice Number
    const lastNum = bills.length > 0 
      ? parseInt(bills[0].billNumber.split('-')[2]) || 0 
      : 0;
    const invNum = `INV-2026-${String(lastNum + 1).padStart(3, '0')}`;

    const newBill: Bill = {
      id: Date.now().toString(),
      billNumber: invNum,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      tableNumber: orderType === 'Takeaway' ? 'Counter' : tableNumber,
      orderType,
      items: cart.map(ci => ({
        id: ci.menuItem.id,
        code: ci.menuItem.code,
        name: ci.menuItem.name,
        price: ci.menuItem.price,
        quantity: ci.quantity
      })),
      subtotal: billingCalculations.subtotal,
      serviceCharge: billingCalculations.serviceCharge,
      discount: billingCalculations.discount,
      discountType,
      discountValue,
      total: billingCalculations.total,
      date: new Date().toISOString(),
      paymentMethod
    };

    // Auto-generate KOT on checkout
    const kotNum = getNextKotNumber(kots);
    const newKot: KOT = {
      id: (Date.now() + 1).toString(),
      kotNumber: kotNum,
      tableNumber: orderType === 'Takeaway' ? 'Counter' : tableNumber,
      customerName: customerName === 'Walk-in Customer' ? '' : customerName,
      orderType,
      items: cart.map(ci => ({
        id: ci.menuItem.id,
        code: ci.menuItem.code,
        name: ci.menuItem.name,
        quantity: ci.quantity
      })),
      status: 'Served',
      createdAt: new Date().toISOString(),
      notes: checkoutNotes.trim() || undefined,
      isBilled: true,
      billId: newBill.id
    };

    // Add KOT & Completed Bill
    setKots(prev => [newKot, ...prev]);
    setBills(prev => [newBill, ...prev]);

    // If this was a pending order being completed, remove it from pendingBills
    if (orderType === 'Dine-In') {
      setPendingBills(prev => prev.filter(pb => pb.tableNumber !== tableNumber));
    }

    // Set active receipt for printable modal
    setActiveReceiptBill(newBill);

    // Clear Cart & resets
    setCart([]);
    setCheckoutNotes('');
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setDiscountValue(0);
    setIncludeServiceCharge(true);
    triggerNotification('Receipt & KOT generated successfully!', 'success');
  };

  // Hold Bill / Save as Pending
  const handleHoldBill = () => {
    if (cart.length === 0) {
      triggerNotification('No items in order to hold', 'error');
      return;
    }

    const pendingBill: Bill = {
      id: Date.now().toString(),
      billNumber: `PEND-${tableNumber.replace(/\s+/g, '')}`,
      customerName: customerName.trim() || 'Guest',
      customerPhone: customerPhone.trim(),
      tableNumber,
      orderType,
      items: cart.map(ci => ({
        id: ci.menuItem.id,
        code: ci.menuItem.code,
        name: ci.menuItem.name,
        price: ci.menuItem.price,
        quantity: ci.quantity
      })),
      subtotal: billingCalculations.subtotal,
      serviceCharge: billingCalculations.serviceCharge,
      discount: billingCalculations.discount,
      discountType,
      discountValue,
      total: billingCalculations.total,
      date: new Date().toISOString(),
      paymentMethod: 'Pending'
    };

    // Upsert pending order by Table Number
    setPendingBills(prev => {
      const filtered = prev.filter(pb => pb.tableNumber !== tableNumber);
      return [pendingBill, ...filtered];
    });

    // Clear current workstation state
    setCart([]);
    setCheckoutNotes('');
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setDiscountValue(0);
    triggerNotification(`Order held for ${tableNumber}!`, 'info');
  };

  // Recall / Load a held table
  const recallPendingBill = (pBill: Bill) => {
    // Populate billing desk with pending bill info
    setCustomerName(pBill.customerName);
    setCustomerPhone(pBill.customerPhone);
    setOrderType(pBill.orderType);
    setTableNumber(pBill.tableNumber);
    setDiscountType(pBill.discountType);
    setDiscountValue(pBill.discountValue);
    setIncludeServiceCharge(pBill.serviceCharge > 0);
    setPaymentMethod('UPI');

    // map items back to CartItem
    const cartItems: CartItem[] = pBill.items.map(bi => {
      const mItem = menuItems.find(mi => mi.id === bi.id) || {
        id: bi.id,
        code: bi.code,
        name: bi.name,
        price: bi.price,
        category: 'Main Course',
        isAvailable: true
      };
      return {
        menuItem: mItem,
        quantity: bi.quantity
      };
    });

    setCart(cartItems);
    setActiveTab('billing');
    triggerNotification(`Loaded pending order for ${pBill.tableNumber}`, 'success');
  };

  // Delete/release a held bill
  const deletePendingBill = (tableNum: string) => {
    if (confirm(`Clear pending order for ${tableNum}?`)) {
      setPendingBills(prev => prev.filter(pb => pb.tableNumber !== tableNum));
      triggerNotification(`Released ${tableNum}`, 'info');
    }
  };

  // --- KOT ACTIONS ---
  const handleUpdateKotStatus = (kotId: string, status: KotStatus) => {
    setKots(prev => prev.map(k => k.id === kotId ? { ...k, status } : k));
    if (activeKotPreview && activeKotPreview.id === kotId) {
      setActiveKotPreview(prev => prev ? { ...prev, status } : null);
    }
    triggerNotification(`KOT status updated to ${status}!`, 'success');
  };

  const handleDeleteKot = (kotId: string) => {
    if (confirm('Are you sure you want to delete this Kitchen Order Ticket?')) {
      setKots(prev => prev.filter(k => k.id !== kotId));
      if (activeKotPreview && activeKotPreview.id === kotId) {
        setActiveKotPreview(null);
      }
      triggerNotification('KOT deleted successfully', 'info');
    }
  };

  const handleSaveEditedKot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKot) return;
    if (editingKotItems.length === 0) {
      triggerNotification("An active KOT must have at least 1 item. Use delete or cancel instead.", "error");
      return;
    }
    setKots(prev => prev.map(kot => {
      if (kot.id === editingKot.id) {
        return {
          ...kot,
          tableNumber: editingKotTable,
          customerName: editingKotName,
          notes: editingKotNotes,
          items: editingKotItems
        };
      }
      return kot;
    }));
    setEditingKot(null);
    triggerNotification(`KOT ${editingKot.kotNumber} updated successfully!`, 'success');
  };

  const handleDuplicateKot = (kot: KOT) => {
    const cartItems: CartItem[] = kot.items.map(ki => {
      const menuItem = menuItems.find(mi => mi.id === ki.id) || {
        id: ki.id,
        code: ki.code,
        name: ki.name,
        price: 150,
        category: 'Main Course' as const,
        isAvailable: true
      };
      return { menuItem, quantity: ki.quantity };
    });
    setCart(cartItems);
    setTableNumber(kot.tableNumber);
    setCustomerName(kot.customerName || 'Walk-in Customer');
    setOrderType(kot.orderType);
    setActiveTab('billing');
    triggerNotification(`Duplicated KOT ${kot.kotNumber} items into active billing cart!`, 'success');
  };

  const handleConvertKotToBill = (kot: KOT) => {
    const lastNum = bills.length > 0 
      ? parseInt(bills[0].billNumber.split('-')[2]) || 0 
      : 0;
    const invNum = `INV-2026-${String(lastNum + 1).padStart(3, '0')}`;

    const mappedItems = kot.items.map(ki => {
      const mItem = menuItems.find(mi => mi.id === ki.id);
      const price = mItem ? mItem.price : 150;
      return {
        id: ki.id,
        code: ki.code,
        name: ki.name,
        price: price,
        quantity: ki.quantity
      };
    });

    const subtotal = mappedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const serviceCharge = settings.enableServiceCharge ? parseFloat((subtotal * (settings.serviceChargeRate / 100)).toFixed(2)) : 0;
    const total = Math.round(subtotal + serviceCharge);

    const newBill: Bill = {
      id: Date.now().toString(),
      billNumber: invNum,
      customerName: kot.customerName || 'Walk-in Customer',
      customerPhone: '',
      tableNumber: kot.tableNumber,
      orderType: kot.orderType,
      items: mappedItems,
      subtotal,
      serviceCharge,
      discount: 0,
      discountType: 'flat',
      discountValue: 0,
      total,
      date: new Date().toISOString(),
      paymentMethod: 'UPI'
    };

    setBills(prev => [newBill, ...prev]);
    setKots(prev => prev.map(k => k.id === kot.id ? { ...k, isBilled: true, billId: newBill.id, status: 'Served' } : k));
    setActiveReceiptBill(newBill);
    triggerNotification(`KOT ${kot.kotNumber} converted to Bill successfully!`, 'success');
  };

  const handleReopenKot = (kot: KOT) => {
    if (currentUser?.role !== 'Admin') {
      triggerNotification('Access Denied. Only Admin users can reopen billed KOTs.', 'error');
      return;
    }
    setKots(prev => prev.map(k => k.id === kot.id ? { ...k, isBilled: false, billId: undefined } : k));
    if (kot.billId) {
      setBills(prev => prev.filter(b => b.id !== kot.billId));
    }
    triggerNotification(`KOT ${kot.kotNumber} reopened. Unbilled and editable!`, 'success');
  };

  // --- MULTIPLE KOT WORKSPACE HELPERS ---
  const getNextKotNumber = (kotsList: KOT[]) => {
    const maxKotNum = kotsList.length > 0
      ? Math.max(...kotsList.map(k => {
          const numPart = k.kotNumber.replace('KOT-', '');
          return parseInt(numPart) || 0;
        }))
      : 0;
    return `KOT-${String(maxKotNum + 1).padStart(4, '0')}`;
  };

  const handleCreateNewKot = () => {
    const nextNum = getNextKotNumber(kots);
    const newKot: KOT = {
      id: Date.now().toString(),
      kotNumber: nextNum,
      tableNumber: 'Table 1',
      customerName: 'Walk-in Customer',
      orderType: 'Dine-In',
      items: [],
      status: 'Pending',
      createdAt: new Date().toISOString(),
      notes: '',
      isBilled: false
    };

    setKots(prev => [newKot, ...prev]);
    setSelectedKotId(newKot.id);
    setKotHistoryTab('active');
    setActiveTab('kots');
    triggerNotification(`Created ${nextNum} successfully!`, 'success');
  };

  const updateKotField = (kotId: string, updates: Partial<KOT>) => {
    setKots(prev => prev.map(k => {
      if (k.id === kotId) {
        const updated = { ...k, ...updates };
        if (activeKotPreview && activeKotPreview.id === kotId) {
          setActiveKotPreview(updated);
        }
        return updated;
      }
      return k;
    }));
  };

  const addFoodItemToKot = (kotId: string, menuItem: MenuItem) => {
    setKots(prev => prev.map(k => {
      if (k.id !== kotId) return k;
      const existingItem = k.items.find(item => item.id === menuItem.id);
      let updatedItems;
      if (existingItem) {
        updatedItems = k.items.map(item =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [...k.items, {
          id: menuItem.id,
          code: menuItem.code,
          name: menuItem.name,
          quantity: 1,
          notes: ''
        }];
      }
      const updated = { ...k, items: updatedItems };
      if (activeKotPreview && activeKotPreview.id === kotId) {
        setActiveKotPreview(updated);
      }
      return updated;
    }));
    triggerNotification(`Added ${menuItem.name} to ticket!`, 'success');
  };

  const updateKotItemQuantity = (kotId: string, itemId: string, newQty: number) => {
    setKots(prev => prev.map(k => {
      if (k.id !== kotId) return k;
      const updatedItems = k.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      ).filter(item => item.quantity > 0);
      const updated = { ...k, items: updatedItems };
      if (activeKotPreview && activeKotPreview.id === kotId) {
        setActiveKotPreview(updated);
      }
      return updated;
    }));
  };

  const updateKotItemNotes = (kotId: string, itemId: string, notes: string) => {
    setKots(prev => prev.map(k => {
      if (k.id !== kotId) return k;
      const updatedItems = k.items.map(item =>
        item.id === itemId ? { ...item, notes } : item
      );
      const updated = { ...k, items: updatedItems };
      if (activeKotPreview && activeKotPreview.id === kotId) {
        setActiveKotPreview(updated);
      }
      return updated;
    }));
  };

  const removeKotItem = (kotId: string, itemId: string) => {
    setKots(prev => prev.map(k => {
      if (k.id !== kotId) return k;
      const updatedItems = k.items.filter(item => item.id !== itemId);
      const updated = { ...k, items: updatedItems };
      if (activeKotPreview && activeKotPreview.id === kotId) {
        setActiveKotPreview(updated);
      }
      return updated;
    }));
    triggerNotification('Removed item from ticket', 'info');
  };

  // --- KOT DELETION & TRASH HANDLERS ---
  const handleSoftDeleteKot = (kot: KOT) => {
    setKotToConfirmDelete(kot);
    setIsPermanentDeleteConfirm(false);
  };

  const handlePermanentDeleteKot = (kot: KOT) => {
    if (currentUser?.role !== 'Admin') {
      triggerNotification('Only Administrators can permanently delete KOTs!', 'error');
      return;
    }
    setKotToConfirmDelete(kot);
    setIsPermanentDeleteConfirm(true);
  };

  const confirmKotDeleteAction = async () => {
    if (!kotToConfirmDelete) return;

    try {
      // Simulate/execute delete action from Firebase Firestore (declined but handled in robust try-catch block)
      await new Promise(resolve => setTimeout(resolve, 250)); // realistic database latency delay

      if (isPermanentDeleteConfirm) {
        if (currentUser?.role !== 'Admin') {
          triggerNotification('Only Administrators can permanently delete KOTs!', 'error');
          setKotToConfirmDelete(null);
          return;
        }
        // Remove from KOTs list completely
        setKots(prev => prev.filter(k => k.id !== kotToConfirmDelete.id));
        if (selectedKotId === kotToConfirmDelete.id) {
          setSelectedKotId(null);
        }
        triggerNotification('KOT deleted successfully.', 'success');
      } else {
        // Soft delete: move to Trash
        setKots(prev => prev.map(k => {
          if (k.id === kotToConfirmDelete.id) {
            return { ...k, isDeleted: true, deletedAt: new Date().toISOString() };
          }
          return k;
        }));
        if (selectedKotId === kotToConfirmDelete.id) {
          setSelectedKotId(null);
        }
        triggerNotification('KOT deleted successfully.', 'success');
      }
    } catch (err) {
      triggerNotification('Failed to delete KOT. Please try again.', 'error');
    } finally {
      setKotToConfirmDelete(null);
    }
  };

  const handleRestoreKot = (kot: KOT) => {
    setKots(prev => prev.map(k => {
      if (k.id === kot.id) {
        const { isDeleted, deletedAt, ...rest } = k;
        return rest as KOT;
      }
      return k;
    }));
    triggerNotification(`KOT ${kot.kotNumber} successfully restored!`, 'success');
  };

  // --- REPORT FILTERED BILLS ---
  const filteredReportBills = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return bills.filter(bill => {
      const billDate = new Date(bill.date);
      if (reportDateRange === 'today') {
        return billDate.toDateString() === todayStr;
      } else if (reportDateRange === 'yesterday') {
        return billDate.toDateString() === yesterdayStr;
      } else if (reportDateRange === '7days') {
        return billDate >= sevenDaysAgo;
      }
      return true; // all
    });
  }, [bills, reportDateRange]);

  // Report statistics calculations
  const reportStats = useMemo(() => {
    let salesTotal = 0;
    let itemsCount = 0;
    let serviceChargesCollected = 0;
    let discountsApplied = 0;

    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;

    const categorySalesMap: Record<string, number> = {
      Starter: 0,
      'Main Course': 0,
      Breads: 0,
      Dessert: 0,
      Beverage: 0
    };

    filteredReportBills.forEach(bill => {
      salesTotal += bill.total;
      serviceChargesCollected += (bill.serviceCharge || 0);
      discountsApplied += bill.discount;

      if (bill.paymentMethod === 'Cash') cashSales += bill.total;
      else if (bill.paymentMethod === 'UPI') upiSales += bill.total;
      else if (bill.paymentMethod === 'Card') cardSales += bill.total;

      bill.items.forEach(item => {
        itemsCount += item.quantity;
        // Find corresponding menu item to resolve category
        const mItem = menuItems.find(mi => mi.id === item.id);
        const category = mItem ? mItem.category : 'Main Course';
        categorySalesMap[category] = (categorySalesMap[category] || 0) + (item.price * item.quantity);
      });
    });

    return {
      salesTotal,
      ordersCount: filteredReportBills.length,
      itemsCount,
      serviceChargesCollected,
      discountsApplied,
      cashSales,
      upiSales,
      cardSales,
      categorySales: categorySalesMap
    };
  }, [filteredReportBills, menuItems]);

  // Last 7 days sales summary helper for chart
  const lastSevenDaysChartData = useMemo(() => {
    const data: { dateLabel: string; amount: number }[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toDateString();
      const dateLabel = `${days[d.getDay()]} ${d.getDate()}`;
      
      const daySales = bills
        .filter(bill => new Date(bill.date).toDateString() === dStr)
        .reduce((sum, b) => sum + b.total, 0);

      data.push({ dateLabel, amount: daySales });
    }
    return data;
  }, [bills]);

  // Trigger real print command
  const triggerPrintReceipt = () => {
    window.print();
  };

  // Filtering lists
  const filteredCatalogItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(billingSearch.toLowerCase()) ||
                            item.code.toLowerCase().includes(billingSearch.toLowerCase());
      const matchesCategory = billingFilterCategory === 'All' || item.category === billingFilterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, billingSearch, billingFilterCategory]);

  const filteredMenuManagerItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                            item.code.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCategory = menuFilterCategory === 'All' || item.category === menuFilterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, menuSearch, menuFilterCategory]);

  const filteredKots = useMemo(() => {
    return kots.filter(kot => {
      const matchesSearch = kot.kotNumber.toLowerCase().includes(kotSearch.toLowerCase()) ||
                            kot.tableNumber.toLowerCase().includes(kotSearch.toLowerCase()) ||
                            (kot.customerName || '').toLowerCase().includes(kotSearch.toLowerCase());
      const matchesStatus = kotFilterStatus === 'All' || kot.status === kotFilterStatus;
      const matchesType = kotFilterType === 'All' || kot.orderType === kotFilterType;
      
      let matchesHistoryTab = false;
      if (kotHistoryTab === 'trash') {
        matchesHistoryTab = !!kot.isDeleted;
      } else if (kotHistoryTab === 'history') {
        matchesHistoryTab = !!kot.isBilled && !kot.isDeleted;
      } else { // active
        matchesHistoryTab = !kot.isBilled && !kot.isDeleted;
      }

      return matchesSearch && matchesStatus && matchesType && matchesHistoryTab;
    });
  }, [kots, kotSearch, kotFilterStatus, kotFilterType, kotHistoryTab]);

  const selectedKot = useMemo(() => {
    return kots.find(k => k.id === selectedKotId) || null;
  }, [kots, selectedKotId]);

  // Fast demo pre-fill helper
  const handleQuickDemoLogin = () => {
    setLoginMobile('9876543210');
    setLoginPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 scale-100 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
          id="toast-notification"
        >
          {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
          {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
          {notification.type === 'info' && <Clock className="w-5 h-5 text-blue-600" />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LOGIN PAGE SCREEN                                      */}
      {/* ========================================================= */}
      {!isLoggedIn ? (
        <div id="login-screen" className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-emerald-800 to-teal-950 min-h-screen">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100/10 my-8">
            {/* Header banner */}
            <div className="bg-emerald-700 p-6 text-center text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ChefHat className="w-24 h-24" />
              </div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
                <ChefHat className="w-7 h-7 text-emerald-200" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Green Olive POS</h1>
              <p className="text-emerald-100 text-xs mt-1">Production-Ready Restaurant Point of Sale</p>
            </div>

            {/* Render form based on authMode */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="p-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-slate-800">User Login</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Access your active dashboard session</p>
                </div>

                {loginError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setLoginError('');
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  id="login-btn"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-700/15 active:scale-[0.98] transition-all text-sm mt-1 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Sign In to POS
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setLoginError('');
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                  >
                    Register Staff/Admin
                  </button>
                </div>

                {/* Demo Quick Access Credentials */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-800 block mb-1 uppercase tracking-wider">Demo Credentials Helper</span>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-emerald-100/60">
                        <div>
                          <span className="font-semibold text-emerald-950">Manager (Admin)</span><br />
                          M: <code className="font-mono font-bold text-slate-700">9876543210</code> | P: <code className="font-mono font-bold text-slate-700">admin123</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginMobile('9876543210');
                            setLoginPassword('admin123');
                          }}
                          className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] uppercase cursor-pointer hover:bg-emerald-200"
                        >
                          Prefill
                        </button>
                      </div>
                      <div className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-emerald-100/60">
                        <div>
                          <span className="font-semibold text-emerald-950">Cashier (Staff)</span><br />
                          M: <code className="font-mono font-bold text-slate-700">9876543211</code> | P: <code className="font-mono font-bold text-slate-700">staff123</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginMobile('9876543211');
                            setLoginPassword('staff123');
                          }}
                          className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px] uppercase cursor-pointer hover:bg-emerald-200"
                        >
                          Prefill
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="p-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-slate-800">Register New Account</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Create an administrator or cashier staff key</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={signUpMobile}
                      onChange={(e) => setSignUpMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit number"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Role Select</label>
                    <select
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white"
                    >
                      <option value="Staff">Cashier Staff</option>
                      <option value="Admin">System Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">OTP Security Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={signUpOtp}
                      onChange={(e) => setSignUpOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4-digit code"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleSendSignUpOtp}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl active:scale-[0.98] transition-all cursor-pointer select-none"
                    >
                      {isSignUpOtpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {isSignUpOtpSent && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[11px] text-blue-800 font-medium">
                      📱 Simulated secure SMS sent. Use OTP: <span className="font-extrabold text-blue-950 font-mono text-xs">{generatedSignUpOtp}</span> to verify.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <input
                      type="password"
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-700/15 active:scale-[0.98] transition-all text-sm mt-1 cursor-pointer"
                >
                  Create & Log In
                </button>

                <div className="text-center pt-1">
                  <span className="text-xs text-slate-500">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                  >
                    Sign In instead
                  </button>
                </div>
              </form>
            )}

            {authMode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-slate-800">Reset Account Password</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Verify your mobile ownership to update keys</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={forgotMobile}
                    onChange={(e) => setForgotMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter registered mobile number"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">OTP Security Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4-digit code"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleSendForgotOtp}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl active:scale-[0.98] transition-all cursor-pointer select-none"
                    >
                      {isForgotOtpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {isForgotOtpSent && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[11px] text-blue-800 font-medium">
                      📱 Simulated verification code. Use OTP: <span className="font-extrabold text-blue-950 font-mono text-xs">{generatedForgotOtp}</span> to reset.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">New Password</label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-700/15 active:scale-[0.98] transition-all text-sm mt-1 cursor-pointer"
                >
                  Reset & Log In
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                  >
                    Cancel, Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 2. AUTHENTICATED SYSTEM LAYOUT                            */
        /* ========================================================= */
        <div className="flex-1 flex flex-col md:flex-row print:bg-white">
          
          {/* Main Left Rail Sidebar for Desktop & Top Navigation for Mobile */}
          <header className="bg-emerald-950 text-white w-full md:w-64 flex flex-col border-r border-emerald-900 shrink-0 print:hidden">
            
            {/* Brand Logo Header */}
            <div className="p-5 border-b border-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="p-1 bg-white border border-emerald-500/20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center w-10 h-10">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ChefHat className="w-6 h-6 text-emerald-600 animate-pulse" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h1 className="font-bold text-sm leading-tight tracking-wide text-white truncate max-w-[140px]">{settings.name}</h1>
                  <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase">Active POS Desk</span>
                </div>
              </div>
            </div>

            {/* Quick Agent Greeting Block */}
            <div className="px-5 py-4 bg-emerald-900/30 border-b border-emerald-900 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-400/20 text-white select-none shrink-0">
                {currentUser?.fullName.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-emerald-300 font-medium truncate">
                  {currentUser?.role === 'Admin' ? 'System Admin' : 'POS Cashier'}
                </p>
                <p className="text-sm font-semibold text-white truncate max-w-[140px]" title={currentUser?.fullName}>
                  {currentUser?.fullName || 'Administrator'}
                </p>
              </div>
            </div>

            {/* Navigation Menus */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('dashboard')}
                id="nav-dashboard"
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                    : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                id="nav-billing"
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                    : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Receipt className="w-4 h-4 shrink-0" />
                <span>Billing Station</span>
                {cart.length > 0 && (
                  <span className="ml-auto bg-amber-500 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('kots')}
                id="nav-kots"
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'kots'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                    : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span>Kitchen Tickets</span>
                {kots.filter(k => k.status === 'Pending' || k.status === 'Preparing').length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {kots.filter(k => k.status === 'Pending' || k.status === 'Preparing').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                id="nav-menu"
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'menu'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                    : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4 shrink-0" />
                <span>Menu Catalog</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                id="nav-reports"
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                    : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Sales Ledger</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                id="nav-settings"
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-800/20'
                    : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Hotel Settings</span>
              </button>
            </nav>

            {/* Logout panel */}
            <div className="p-4 border-t border-emerald-900 bg-emerald-950 mt-auto">
              <button
                onClick={handleLogout}
                id="logout-btn"
                className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-900 hover:bg-rose-900 hover:text-rose-100 text-emerald-300 font-semibold rounded-xl text-xs transition-all tracking-wide cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out Desk</span>
              </button>
            </div>
          </header>

          {/* Main Contents Window Area */}
          <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-slate-100 min-w-0">
            
            {/* Top Workspace status bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 print:hidden shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight capitalize">
                  {activeTab === 'dashboard' && 'Operations Dashboard'}
                  {activeTab === 'billing' && 'Billing Workspace'}
                  {activeTab === 'kots' && 'Kitchen Order Tickets (KOT)'}
                  {activeTab === 'menu' && 'Menu Database Management'}
                  {activeTab === 'reports' && 'Daily Sales & Financial Audits'}
                  {activeTab === 'settings' && 'Hotel Settings POS Configuration'}
                </h2>
                <p className="text-xs text-slate-500">Smart Hotel Billing Solution • Operational Desk</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl w-fit">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="tabular-nums">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Render Tab Contents */}
            <div className="p-4 sm:p-6 flex-1">

              {/* ========================================================= */}
              {/* 3. OPERATIONS DASHBOARD                                   */}
              {/* ========================================================= */}
              {activeTab === 'dashboard' && (
                <div id="dashboard-tab" className="space-y-6">
                  
                  {/* Banner greeting */}
                  <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center p-8 pointer-events-none">
                      <Utensils className="w-56 h-56 transform translate-x-12 translate-y-12" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold">Good Day, Administrator!</h3>
                    <p className="text-emerald-100 text-sm mt-1 max-w-lg">Manage orders, coordinate table services, track revenue flow, and print thermal customer invoices effortlessly.</p>
                    <div className="flex flex-wrap gap-2.5 mt-5">
                      <button
                        onClick={() => { setCart([]); setOrderType('Dine-In'); setActiveTab('billing'); }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs tracking-wide rounded-xl shadow-lg shadow-emerald-950/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Create New Bill
                      </button>
                      <button
                        onClick={() => { setShowAddMenuModal(true); resetMenuForm(); setActiveTab('menu'); }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wide rounded-xl border border-white/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Utensils className="w-4 h-4" />
                        Add Food Item
                      </button>
                    </div>
                  </div>

                  {/* Primary Grid metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Sales Gross Metric */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                      <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Today's Sales</span>
                        <span className="text-2xl font-bold text-slate-800 tabular-nums">
                          ₹{bills
                            .filter(b => new Date(b.date).toDateString() === new Date().toDateString())
                            .reduce((sum, b) => sum + b.total, 0)
                            .toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                          From {bills.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length} bills
                        </span>
                      </div>
                    </div>

                    {/* Total Orders Metric */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                      <div className="p-3.5 bg-sky-50 rounded-xl text-sky-600 border border-sky-100">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">All Orders (Total)</span>
                        <span className="text-2xl font-bold text-slate-800 tabular-nums">{bills.length}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Historical Database size</span>
                      </div>
                    </div>

                    {/* Pending Tables Metric */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                      <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Active Held Tables</span>
                        <span className="text-2xl font-bold text-slate-800 tabular-nums">{pendingBills.length}</span>
                        <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                          {pendingBills.length > 0 ? 'Orders awaiting checkouts' : 'All tables cleared'}
                        </span>
                      </div>
                    </div>

                    {/* Total Foods Metric */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
                      <div className="p-3.5 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
                        <Utensils className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Active Menu Foods</span>
                        <span className="text-2xl font-bold text-slate-800 tabular-nums">{menuItems.length}</span>
                        <span className="text-[10px] text-teal-600 font-semibold block mt-0.5">
                          {menuItems.filter(i => i.isAvailable).length} currently available
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Middle row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* SVG Analytics Graph Panel */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h4 className="font-bold text-slate-800">Weekly Revenue Flow</h4>
                          <p className="text-xs text-slate-400">Total daily checkouts over last 7 days</p>
                        </div>
                        <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Live Synced
                        </div>
                      </div>

                      {/* Line Area SVG Graph */}
                      <div className="w-full h-64 flex flex-col justify-between">
                        <div className="flex-1 relative">
                          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                            <defs>
                              <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                            {(() => {
                              // Calculate dynamic coordinates
                              const maxVal = Math.max(...lastSevenDaysChartData.map(d => d.amount), 1000);
                              const points = lastSevenDaysChartData.map((d, index) => {
                                const x = (index / 6) * 600;
                                // Invert Y as 0,0 is top-left
                                const y = 200 - (d.amount / maxVal) * 160 - 20;
                                return { x, y, amount: d.amount, dateLabel: d.dateLabel };
                              });

                              // Generate SVG path d-attribute
                              const pathD = points.reduce((str, pt, i) => {
                                return i === 0 ? `M ${pt.x} ${pt.y}` : `${str} L ${pt.x} ${pt.y}`;
                              }, '');

                              // Area path closed to bottom
                              const areaD = `${pathD} L 600 180 L 0 180 Z`;

                              return (
                                <>
                                  {/* Area Shade */}
                                  <path d={areaD} fill="url(#gradient-emerald)" />
                                  
                                  {/* Line path */}
                                  <path d={pathD} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />

                                  {/* Circle dots & interactive labels */}
                                  {points.map((pt, i) => (
                                    <g key={i} className="group/dot cursor-pointer">
                                      <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r="5"
                                        fill="#ffffff"
                                        stroke="#059669"
                                        strokeWidth="3"
                                        className="transition-all duration-200 group-hover/dot:r-7"
                                      />
                                      {/* Amount display */}
                                      <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none">
                                        <rect
                                          x={Math.max(pt.x - 45, 5)}
                                          y={Math.max(pt.y - 35, 5)}
                                          width="90"
                                          height="24"
                                          rx="6"
                                          fill="#0f172a"
                                        />
                                        <text
                                          x={Math.max(pt.x, 50)}
                                          y={Math.max(pt.y - 19, 21)}
                                          fill="#ffffff"
                                          fontSize="10"
                                          fontWeight="bold"
                                          textAnchor="middle"
                                        >
                                          ₹{pt.amount}
                                        </text>
                                      </g>
                                    </g>
                                  ))}
                                </>
                              );
                            })()}
                          </svg>
                        </div>
                        {/* X-Axis labels */}
                        <div className="flex justify-between border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-500 px-1">
                          {lastSevenDaysChartData.map((d, index) => (
                            <span key={index}>{d.dateLabel}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Table Status / Pending tables panel */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-bold text-slate-800">Held Dine-In Tables</h4>
                          <p className="text-xs text-slate-400">Recall orders immediately</p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {pendingBills.length} Active
                        </span>
                      </div>

                      {/* Pending orders list */}
                      <div className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar space-y-3 pr-1">
                        {pendingBills.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <Clock className="w-10 h-10 text-slate-300 mb-2" />
                            <span className="text-xs font-semibold text-slate-500">No active held orders</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Use Billing page to save tables</span>
                          </div>
                        ) : (
                          pendingBills.map(pBill => (
                            <div 
                              key={pBill.id} 
                              className="p-3 bg-gradient-to-r from-amber-50/50 to-white rounded-xl border border-amber-100 flex items-center justify-between shadow-sm hover:border-amber-200 transition-all"
                            >
                              <div>
                                <span className="font-bold text-sm text-slate-800 block">{pBill.tableNumber}</span>
                                <span className="text-xs text-slate-500 block truncate max-w-[140px]">{pBill.customerName} ({pBill.items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                                <span className="text-[10px] font-bold text-amber-700 block mt-0.5">₹{pBill.total} Pending</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => recallPendingBill(pBill)}
                                  className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
                                  title="Recall Order"
                                >
                                  Checkout
                                </button>
                                <button
                                  onClick={() => deletePendingBill(pBill.tableNumber)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 rounded-lg transition-all cursor-pointer"
                                  title="Clear Table"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Recent completed checkouts */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="font-bold text-slate-800">Recent Completed Bills</h4>
                        <p className="text-xs text-slate-400">View and print invoices of recent sales</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('reports')} 
                        className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        See All Ledger
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-sm min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                            <th className="py-3 px-4">Invoice No</th>
                            <th className="py-3 px-4">Time</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Table / Room</th>
                            <th className="py-3 px-4">Payment</th>
                            <th className="py-3 px-4 text-right">Amount</th>
                            <th className="py-3 px-4 text-center">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bills.slice(0, 5).map((bill) => (
                            <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-800 tabular-nums">{bill.billNumber}</td>
                              <td className="py-3.5 px-4 text-slate-500 text-xs tabular-nums">
                                {new Date(bill.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-700">{bill.customerName}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                                  bill.orderType === 'Dine-In' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                  bill.orderType === 'Room Service' ? 'bg-sky-50 text-sky-800 border border-sky-100' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {bill.tableNumber}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                                  bill.paymentMethod === 'UPI' ? 'text-purple-700' :
                                  bill.paymentMethod === 'Card' ? 'text-sky-700' :
                                  'text-amber-700'
                                }`}>
                                  {bill.paymentMethod === 'UPI' && <Smartphone className="w-3.5 h-3.5 text-purple-600" />}
                                  {bill.paymentMethod === 'Card' && <CreditCard className="w-3.5 h-3.5 text-sky-600" />}
                                  {bill.paymentMethod === 'Cash' && <DollarSign className="w-3.5 h-3.5 text-amber-600" />}
                                  {bill.paymentMethod}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-800 tabular-nums">₹{bill.total}</td>
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => setActiveReceiptBill(bill)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg inline-flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>Print</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 4. BILLING WORKSPACE                                      */}
              {/* ========================================================= */}
              {activeTab === 'billing' && (
                <div id="billing-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Menu Catalog Search & Addition */}
                  <div className="lg:col-span-7 flex flex-col space-y-4">
                    
                    {/* Catalog Header Controls */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <div className="font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>Menu Catalog</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Hotel Point-of-Sale Inventory</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {/* Search input bar */}
                          <div className="relative flex-1 sm:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="text"
                              value={billingSearch}
                              onChange={(e) => setBillingSearch(e.target.value)}
                              placeholder="Search food by name or code..."
                              className="w-full pl-8.5 pr-4 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-xs font-semibold text-slate-700"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMenuItem(null);
                              resetMenuForm(billingFilterCategory !== 'All' ? billingFilterCategory as MenuItem['category'] : 'Starter');
                              setShowAddMenuModal(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
                            title="Quick Add Food Item"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Item</span>
                          </button>
                        </div>
                      </div>

                      {/* Category Filters rail */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar border-t border-slate-100 pt-3">
                        {['All', 'Starter', 'Main Course', 'Breads', 'Dessert', 'Beverage'].map((cat) => {
                          const count = menuItems.filter(item => cat === 'All' || item.category === cat).length;
                          return (
                            <button
                              key={cat}
                              onClick={() => setBillingFilterCategory(cat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                                billingFilterCategory === cat
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/50'
                              }`}
                            >
                              <span>{cat}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                billingFilterCategory === cat ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200/80 text-slate-500'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Food Items Catalog Grouped Sections */}
                    <div className="space-y-6 overflow-y-auto max-h-[580px] pr-1.5 custom-scrollbar">
                      {filteredCatalogItems.length === 0 ? (
                        <div className="py-16 bg-white rounded-2xl border border-slate-200/80 text-center flex flex-col items-center justify-center">
                          <Utensils className="w-12 h-12 text-slate-300 mb-3 animate-bounce" />
                          <span className="font-extrabold text-slate-700 text-sm">No items match your search</span>
                          <span className="text-xs text-slate-400 mt-1">Try another category or clear filters</span>
                        </div>
                      ) : (
                        (['Starter', 'Main Course', 'Breads', 'Dessert', 'Beverage'] as MenuItem['category'][]).map((category) => {
                          if (billingFilterCategory !== 'All' && billingFilterCategory !== category) {
                            return null;
                          }

                          const categoryItems = filteredCatalogItems.filter(item => item.category === category);
                          if (categoryItems.length === 0) {
                            return null;
                          }

                          const categoryTitleMap = {
                            Starter: 'Appetizers & Starters',
                            'Main Course': 'Main Courses',
                            Breads: 'Indian Bread Baskets',
                            Dessert: 'Desserts & Sweets',
                            Beverage: 'Beverages & Drinks'
                          };

                          const getCategoryColor = (cat: MenuItem['category']) => {
                            switch (cat) {
                              case 'Starter': return 'text-amber-600 bg-amber-50 border-amber-200/60';
                              case 'Main Course': return 'text-orange-600 bg-orange-50 border-orange-200/60';
                              case 'Breads': return 'text-yellow-600 bg-yellow-50 border-yellow-200/60';
                              case 'Dessert': return 'text-rose-600 bg-rose-50 border-rose-200/60';
                              case 'Beverage': return 'text-sky-600 bg-sky-50 border-sky-200/60';
                            }
                          };

                          return (
                            <div key={category} className="space-y-3">
                              {/* Category Header */}
                              <div className="flex items-center gap-2.5 px-1 pt-1">
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${getCategoryColor(category)}`}>
                                  {category}
                                </span>
                                <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">
                                  {categoryTitleMap[category]}
                                </h4>
                                <div className="h-px bg-slate-200/80 flex-1 ml-1" />
                                <span className="text-[10px] text-slate-400 font-bold tracking-wide tabular-nums">
                                  {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                                </span>
                              </div>

                              {/* Reusable Cards Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                {categoryItems.map((item) => (
                                  <MenuCatalogCard
                                    key={item.id}
                                    item={item}
                                    onAdd={addToCart}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Checkout workstation Cart panel */}
                  <div className="lg:col-span-5">
                    <form onSubmit={handleCheckout} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col max-h-[730px] overflow-y-auto custom-scrollbar">
                      
                      {/* Customer Details Form */}
                      <div className="space-y-3.5 pb-4 border-b border-slate-100">
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <User className="w-4 h-4 text-emerald-600" />
                          <span>Customer Service Details</span>
                        </div>

                        {/* Order Type Buttons */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['Dine-In', 'Takeaway', 'Room Service'] as OrderType[]).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setOrderType(type);
                                if (type === 'Takeaway') {
                                  setTableNumber('Counter');
                                  setIncludeServiceCharge(false); // No service charge for takeaway
                                } else if (type === 'Room Service') {
                                  setTableNumber('Room 101');
                                  setIncludeServiceCharge(true);
                                } else {
                                  setTableNumber('Table 1');
                                  setIncludeServiceCharge(true);
                                }
                              }}
                              className={`py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer border ${
                                orderType === type
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/50'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>

                        {/* Inline inputs */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Customer Name</label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Guest Name"
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
                            />
                          </div>
                          
                          {/* Dinning tables vs Rooms dynamic select */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {orderType === 'Takeaway' ? 'Workstation' : orderType === 'Room Service' ? 'Room Number' : 'Table Selection'}
                            </label>
                            
                            {orderType === 'Takeaway' ? (
                              <input
                                type="text"
                                disabled
                                value="Counter/Takeaway"
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                              />
                            ) : (
                              <select
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs bg-white"
                              >
                                {orderType === 'Room Service' ? (
                                  ['Room 101', 'Room 102', 'Room 201', 'Room 202', 'Room 303', 'Room 304', 'Room 405', 'Room 501'].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))
                                ) : (
                                  ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10', 'Table 11', 'Table 12'].map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))
                                )}
                              </select>
                            )}
                          </div>
                        </div>

                        {/* Customer Phone No */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Customer Phone (Optional)</label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10 digit mobile number"
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs tabular-nums"
                          />
                        </div>
                      </div>

                      {/* Cart items list section */}
                      <div className="space-y-2 flex-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                          <span>Active Order Cart</span>
                          <span>{cart.length} items</span>
                        </div>

                        {cart.length === 0 ? (
                          <div className="py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-slate-300 mb-1" />
                            <span className="text-xs text-slate-500 font-semibold">Order cart is currently empty</span>
                            <span className="text-[10px] text-slate-400">Click menu cards on left to add</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {cart.map((cItem) => (
                              <div key={cItem.menuItem.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-2 shadow-xs">
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs text-slate-800 truncate" title={cItem.menuItem.name}>
                                    {cItem.menuItem.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5 tabular-nums">{settings.currency}{cItem.menuItem.price} each</div>
                                </div>

                                {/* Quantity controls */}
                                <div className="flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(cItem.menuItem.id, cItem.quantity - 1)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold w-6 text-center tabular-nums">{cItem.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(cItem.menuItem.id, cItem.quantity + 1)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Total Price */}
                                <div className="text-right shrink-0 min-w-[50px]">
                                  <span className="font-bold text-xs text-slate-800 tabular-nums">{settings.currency}{cItem.menuItem.price * cItem.quantity}</span>
                                </div>

                                {/* Delete btn */}
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(cItem.menuItem.id)}
                                  className="p-1 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg shrink-0 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Calculations & Discounts */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3.5 text-xs">
                        
                        {/* Discount Configuration row */}
                        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between pb-3.5 border-b border-slate-200/60">
                          <span className="font-bold text-slate-600 text-xs shrink-0 flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5 text-emerald-600" />
                            Apply Bill Discount
                          </span>
                          <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            {/* Flat vs Percent switch */}
                            <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex shrink-0">
                              <button
                                type="button"
                                onClick={() => { setDiscountType('percentage'); setDiscountValue(0); }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                  discountType === 'percentage' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                %
                              </button>
                              <button
                                type="button"
                                onClick={() => { setDiscountType('flat'); setDiscountValue(0); }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                                  discountType === 'flat' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                Flat
                              </button>
                            </div>
                            <input
                              type="number"
                              min={0}
                              max={discountType === 'percentage' ? 100 : 10000}
                              value={discountValue || ''}
                              onChange={(e) => setDiscountValue(Math.max(0, parseInt(e.target.value) || 0))}
                              placeholder={discountType === 'percentage' ? '0 %' : `${settings.currency} 0`}
                              className="w-20 px-2 py-1 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-center font-bold text-slate-700"
                            />
                          </div>
                        </div>

                        {/* Charges breakdown */}
                        <div className="space-y-1.5 font-medium text-slate-600">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="tabular-nums">{settings.currency}{billingCalculations.subtotal}</span>
                          </div>
                          
                          {/* GST completely removed */}

                          {/* Toggleable Service Charge */}
                          {settings.enableServiceCharge && (
                            <div className="flex justify-between items-center py-0.5">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={includeServiceCharge}
                                  onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span>Service Charge ({settings.serviceChargeRate}%)</span>
                              </label>
                              <span className="tabular-nums">{settings.currency}{billingCalculations.serviceCharge}</span>
                            </div>
                          )}

                          {/* Discount displaying */}
                          {billingCalculations.discount > 0 && (
                            <div className="flex justify-between text-rose-600 font-semibold bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                              <span>Discount Applied</span>
                              <span className="tabular-nums">-{settings.currency}{billingCalculations.discount}</span>
                            </div>
                          )}
                        </div>

                        {/* Net Grand Total */}
                        <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-slate-800">
                          <span className="font-extrabold text-sm uppercase tracking-wide">Grand Total</span>
                          <span className="text-xl font-extrabold text-emerald-800 tabular-nums">
                            {settings.currency}{billingCalculations.total}
                          </span>
                        </div>
                      </div>

                      {/* Payment Mode Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">Select Settlement Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['UPI', 'Cash', 'Card'] as const).map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPaymentMethod(method)}
                              className={`py-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                                paymentMethod === method
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {method === 'UPI' && <Smartphone className="w-4 h-4 text-purple-600" />}
                              {method === 'Cash' && <DollarSign className="w-4 h-4 text-amber-600" />}
                              {method === 'Card' && <CreditCard className="w-4 h-4 text-sky-600" />}
                              <span className="text-[10px]">{method}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Workstation Action triggers */}
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {/* Send KOT manually */}
                        <button
                          type="button"
                          onClick={handleSendKOT}
                          disabled={cart.length === 0}
                          className="py-2.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                          <span>Send KOT</span>
                        </button>

                        {/* Save order pending */}
                        <button
                          type="button"
                          onClick={handleHoldBill}
                          disabled={cart.length === 0}
                          className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Hold Order</span>
                        </button>

                        {/* Direct print and save */}
                        <button
                          type="submit"
                          disabled={cart.length === 0}
                          id="checkout-btn"
                          className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wide rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-700/10 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Pay & Print</span>
                        </button>
                      </div>

                    </form>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* 5. MENU DATABASE CATALOG                                  */}
              {/* ========================================================= */}
              {activeTab === 'menu' && (
                <div id="menu-tab" className="space-y-4">
                  
                  {/* Management filter utilities */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                    
                    {/* Searches & filters */}
                    <div className="flex flex-col sm:flex-row gap-2.5 flex-1 max-w-2xl">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          value={menuSearch}
                          onChange={(e) => setMenuSearch(e.target.value)}
                          placeholder="Search database by code or title..."
                          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
                        />
                      </div>
                      
                      <select
                        value={menuFilterCategory}
                        onChange={(e) => setMenuFilterCategory(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="All">All Categories</option>
                        <option value="Starter">Starters</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Breads">Indian Breads</option>
                        <option value="Dessert">Dessert Specials</option>
                        <option value="Beverage">Beverages</option>
                      </select>
                    </div>

                    {/* Trigger Add modal */}
                    <button
                      onClick={() => {
                        setEditingMenuItem(null);
                        resetMenuForm(menuFilterCategory !== 'All' ? menuFilterCategory as MenuItem['category'] : 'Starter');
                        setShowAddMenuModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Food Item
                    </button>
                  </div>

                  {/* Food Database Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                            <th className="py-3.5 px-6 w-24">Item Code</th>
                            <th className="py-3.5 px-6">Food Name</th>
                            <th className="py-3.5 px-6">Category</th>
                            <th className="py-3.5 px-6">Price</th>
                            <th className="py-3.5 px-6 text-center">Status</th>
                            <th className="py-3.5 px-6 text-center w-36">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {filteredMenuManagerItems.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-16 text-center bg-slate-50/20">
                                <div className="flex flex-col items-center justify-center">
                                  <Utensils className="w-12 h-12 text-slate-300 mb-3" />
                                  <span className="font-bold text-slate-700">No database record found</span>
                                  <span className="text-xs text-slate-400 mt-1">Add items or clear search filters</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredMenuManagerItems.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-6 font-bold text-slate-800 tabular-nums">{item.code}</td>
                                <td className="py-4 px-6 text-slate-900 font-bold">{item.name}</td>
                                <td className="py-4 px-6 text-slate-500">
                                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-xl text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-emerald-800 font-extrabold text-base tabular-nums">₹{item.price}</td>
                                <td className="py-4 px-6 text-center">
                                  <button
                                    onClick={() => toggleAvailability(item.id)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
                                      item.isAvailable
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-rose-50 border-rose-200 text-rose-800'
                                    }`}
                                  >
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                  </button>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex justify-center items-center gap-1.5">
                                    <button
                                      onClick={() => handleEditClick(item)}
                                      className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                                      title="Edit Details"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMenuItem(item.id, item.name)}
                                      className="p-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                                      title="Delete Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 6. DAILY SALES REPORT & FINANCIAL LEDGER                  */}
              {/* ========================================================= */}
              {activeTab === 'reports' && (
                <div id="reports-tab" className="space-y-6">
                  
                  {/* Ledger Header Controls */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800">Financial Audits</h4>
                      <p className="text-xs text-slate-400">Track restaurant income flow, taxes, and customer checks</p>
                    </div>

                    {/* Date filter chips */}
                    <div className="bg-slate-100 border border-slate-200 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
                      {(['today', 'yesterday', '7days', 'all'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setReportDateRange(range)}
                          className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            reportDateRange === range
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-800'
                          }`}
                        >
                          {range === 'today' && 'Today'}
                          {range === 'yesterday' && 'Yesterday'}
                          {range === '7days' && '7 Days'}
                          {range === 'all' && 'All Time'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Metric widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Gross Metric */}
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Gross Income</span>
                      <span className="text-2xl font-extrabold text-emerald-800 block mt-1 tabular-nums">
                        ₹{reportStats.salesTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Tax inclusive net checkout revenue
                      </span>
                    </div>

                    {/* Volume Metric */}
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Transactions Completed</span>
                      <span className="text-2xl font-extrabold text-slate-800 block mt-1 tabular-nums">
                        {reportStats.ordersCount}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Total billing tickets generated
                      </span>
                    </div>

                    {/* Service Surcharge Metric */}
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Service Surcharge</span>
                      <span className="text-2xl font-extrabold text-slate-800 block mt-1 tabular-nums">
                        {settings.currency}{Math.round(reportStats.serviceChargesCollected).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                        Service fees collected from orders
                      </span>
                    </div>

                    {/* Discounts Metric */}
                    <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Discounts Distributed</span>
                      <span className="text-2xl font-extrabold text-rose-700 block mt-1 tabular-nums">
                        ₹{Math.round(reportStats.discountsApplied).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-rose-500 block mt-1">
                        Total cost reduction in active checks
                      </span>
                    </div>
                  </div>

                  {/* Payment Mode distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Payment channels */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-800">Income Settlement Breakdown</h4>
                        <p className="text-xs text-slate-400">Payment channels share</p>
                      </div>

                      <div className="space-y-3.5">
                        {/* UPI */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <Smartphone className="w-4 h-4 text-purple-600" />
                              UPI Settlements (GPay / PhonePe)
                            </span>
                            <span className="tabular-nums">₹{reportStats.upiSales}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${reportStats.salesTotal > 0 ? (reportStats.upiSales / reportStats.salesTotal) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Cards */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-sky-600" />
                              Credit & Debit Cards
                            </span>
                            <span className="tabular-nums">₹{reportStats.cardSales}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className="bg-sky-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${reportStats.salesTotal > 0 ? (reportStats.cardSales / reportStats.salesTotal) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Cash */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 text-amber-600" />
                              Cash Drawer Receipts
                            </span>
                            <span className="tabular-nums">₹{reportStats.cashSales}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${reportStats.salesTotal > 0 ? (reportStats.cashSales / reportStats.salesTotal) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Food Categories Share list */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-800">Category Revenues</h4>
                        <p className="text-xs text-slate-400">Contribution of each food category to gross sales</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {Object.entries(reportStats.categorySales).map(([cat, amount]) => (
                          <div key={cat} className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 text-center space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{cat}</span>
                            <span className="text-sm font-extrabold text-slate-800 block tabular-nums">₹{amount}</span>
                            <span className="text-[9px] font-bold text-emerald-700">
                              {reportStats.salesTotal > 0 ? Math.round(((amount as number) / reportStats.salesTotal) * 100) : 0}% share
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Transaction History log table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
                      Historical Audit Ledger Logs
                    </div>
                    
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                            <th className="py-3 px-6">Invoice No</th>
                            <th className="py-3 px-6">Date & Time</th>
                            <th className="py-3 px-6">Customer Check Info</th>
                            <th className="py-3 px-6">Table</th>
                            <th className="py-3 px-6">Method</th>
                            <th className="py-3 px-6 text-right">Net Value</th>
                            <th className="py-3 px-6 text-center">Receipts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredReportBills.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                                No sales transactions found in this date range.
                              </td>
                            </tr>
                          ) : (
                            filteredReportBills.map((bill) => (
                              <tr key={bill.id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="py-3.5 px-6 font-bold text-slate-800 tabular-nums">{bill.billNumber}</td>
                                <td className="py-3.5 px-6 text-slate-500 text-xs tabular-nums">
                                  {new Date(bill.date).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="py-3.5 px-6">
                                  <div>
                                    <span className="font-bold text-slate-800 block text-xs">{bill.customerName}</span>
                                    {bill.customerPhone && <span className="text-[10px] text-slate-400 tabular-nums">{bill.customerPhone}</span>}
                                  </div>
                                </td>
                                <td className="py-3.5 px-6">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700 font-bold">
                                    {bill.tableNumber}
                                  </span>
                                </td>
                                <td className="py-3.5 px-6 font-bold text-slate-700 text-xs">{bill.paymentMethod}</td>
                                <td className="py-3.5 px-6 text-right font-extrabold text-slate-800 tabular-nums">₹{bill.total}</td>
                                <td className="py-3.5 px-6 text-center">
                                  <button
                                    onClick={() => setActiveReceiptBill(bill)}
                                    className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg inline-flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border border-slate-200/55"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* 5. KITCHEN ORDER TICKET (KOT) WORKSPACE TAB               */}
              {/* ========================================================= */}
              {activeTab === 'kots' && (
                <div id="kot-workspace" className="p-6 space-y-6">
                  {/* Top Summary Badges */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                    <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center font-bold text-amber-600 border border-amber-200/60 shrink-0">
                        {kots.filter(k => k.status === 'Pending').length}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Pending</span>
                        <span className="text-lg font-bold text-slate-800 leading-tight">Incoming</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-200/60 shrink-0">
                        {kots.filter(k => k.status === 'Preparing').length}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Preparing</span>
                        <span className="text-lg font-bold text-slate-800 leading-tight">In Kitchen</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center font-bold text-purple-600 border border-purple-200/60 shrink-0">
                        {kots.filter(k => k.status === 'Ready').length}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Ready</span>
                        <span className="text-lg font-bold text-slate-800 leading-tight">Prepared</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/60 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 border border-emerald-200/60 shrink-0">
                        {kots.filter(k => k.status === 'Served').length}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Served</span>
                        <span className="text-lg font-bold text-slate-800 leading-tight">Completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Split Workspace Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Pane: Sidebar List with Tabs & Search */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden max-h-[75vh]">
                      
                      {/* "+ New KOT" CTA Header */}
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
                        <button
                          onClick={handleCreateNewKot}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Launch New KOT</span>
                        </button>

                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={kotSearch}
                            onChange={(e) => setKotSearch(e.target.value)}
                            placeholder="Search Table, KOT #, Name..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Switchable View Tabs: Active vs Completed History vs Trash */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50 text-[10px] font-bold shrink-0">
                          <button
                            onClick={() => {
                              setKotHistoryTab('active');
                              setSelectedKotId(null);
                            }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center relative ${
                              kotHistoryTab === 'active'
                                ? 'bg-white text-slate-800 shadow-xs font-bold'
                                : 'text-slate-500 hover:text-slate-800 font-medium'
                            }`}
                          >
                            <span>Active</span>
                            {kots.filter(k => !k.isBilled && !k.isDeleted).length > 0 && (
                              <span className="ml-1 px-1 py-0.5 text-[8px] font-extrabold bg-amber-500 text-white rounded-full">
                                {kots.filter(k => !k.isBilled && !k.isDeleted).length}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setKotHistoryTab('history');
                              setSelectedKotId(null);
                            }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center relative ${
                              kotHistoryTab === 'history'
                                ? 'bg-white text-slate-800 shadow-xs font-bold'
                                : 'text-slate-500 hover:text-slate-800 font-medium'
                            }`}
                          >
                            <span>History</span>
                            {kots.filter(k => k.isBilled && !k.isDeleted).length > 0 && (
                              <span className="ml-1 px-1 py-0.5 text-[8px] font-extrabold bg-slate-500 text-white rounded-full">
                                {kots.filter(k => k.isBilled && !k.isDeleted).length}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setKotHistoryTab('trash');
                              setSelectedKotId(null);
                            }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center relative ${
                              kotHistoryTab === 'trash'
                                ? 'bg-white text-slate-800 shadow-xs font-bold'
                                : 'text-slate-500 hover:text-slate-800 font-medium'
                            }`}
                          >
                            <span>Trash</span>
                            {kots.filter(k => k.isDeleted).length > 0 && (
                              <span className="ml-1 px-1 py-0.5 text-[8px] font-extrabold bg-rose-500 text-white rounded-full">
                                {kots.filter(k => k.isDeleted).length}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Advanced status filter tags (Active only) */}
                      {kotHistoryTab === 'active' && (
                        <div className="px-4 py-2 border-b border-slate-100 flex gap-1 overflow-x-auto shrink-0 scrollbar-none">
                          {['All', 'Pending', 'Preparing', 'Ready', 'Served'].map((st) => (
                            <button
                              key={st}
                              onClick={() => setKotFilterStatus(st)}
                              className={`px-2.5 py-1 text-[10px] rounded-lg font-bold border shrink-0 transition-all cursor-pointer ${
                                kotFilterStatus === st
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Scrollable KOT Cards List */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar min-h-[30vh]">
                        {filteredKots.length === 0 ? (
                          <div className="py-12 px-4 text-center">
                            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-medium">No tickets found</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Change search filters or launch a new KOT above</p>
                          </div>
                        ) : (
                          filteredKots.map((kot) => {
                            const isSelected = selectedKotId === kot.id;
                            const itemsCount = kot.items.reduce((sum, item) => sum + item.quantity, 0);
                            return (
                              <div
                                key={kot.id}
                                onClick={() => setSelectedKotId(kot.id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col space-y-2 cursor-pointer relative ${
                                  isSelected
                                    ? 'bg-emerald-50/20 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/30'
                                }`}
                              >
                                {/* Header: Number & Order type */}
                                <div className="flex justify-between items-center w-full">
                                  <span className="font-mono font-extrabold text-slate-800 text-xs">{kot.kotNumber}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                    kot.orderType === 'Dine-In'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : kot.orderType === 'Takeaway'
                                      ? 'bg-indigo-50 text-indigo-700'
                                      : 'bg-orange-50 text-orange-700'
                                  }`}>
                                    {kot.orderType}
                                  </span>
                                </div>

                                {/* Body Info */}
                                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                                  <div>
                                    <span className="block font-semibold">Table/Room</span>
                                    <span className="text-slate-700 font-bold">{kot.tableNumber || 'N/A'}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="block font-semibold">Time</span>
                                    <span className="text-slate-700 tabular-nums">
                                      {new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>

                                {kot.customerName && (
                                  <div className="text-[10px] text-slate-500 truncate w-full">
                                    <span className="font-semibold">Guest: </span>
                                    <span className="text-slate-700 font-medium">{kot.customerName}</span>
                                  </div>
                                )}

                                {/* Status & Items count line */}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100/60 w-full text-[10px]">
                                  <span className="font-extrabold text-slate-400 uppercase tracking-wider">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                                  
                                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {kot.isDeleted ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleRestoreKot(kot)}
                                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold rounded-lg text-[8px] uppercase tracking-wider transition-colors cursor-pointer"
                                          title="Restore this ticket"
                                        >
                                          Restore
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handlePermanentDeleteKot(kot)}
                                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                          title="Permanently Delete"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider ${
                                          kot.isBilled
                                            ? 'bg-slate-100 text-slate-500 border border-slate-200/40'
                                            : kot.status === 'Pending'
                                            ? 'bg-amber-100 text-amber-800'
                                            : kot.status === 'Preparing'
                                            ? 'bg-blue-100 text-blue-800'
                                            : kot.status === 'Ready'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                          {kot.isBilled ? 'Billed' : kot.status}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleSoftDeleteKot(kot)}
                                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                          title="Move to Trash"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Right Pane: Main Interactive Editor Workspace */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden max-h-[75vh]">
                      
                      {selectedKot ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                          
                          {/* Workspace Header Panel */}
                          <div className="px-5 py-4 border-b border-slate-100 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-slate-800 rounded-lg shrink-0">
                                <ClipboardList className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h3 className="font-mono font-extrabold text-white text-sm">{selectedKot.kotNumber}</h3>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                    selectedKot.isDeleted
                                      ? 'bg-rose-600 text-white animate-pulse'
                                      : selectedKot.isBilled
                                      ? 'bg-slate-700 text-slate-300'
                                      : 'bg-emerald-500 text-white'
                                  }`}>
                                    {selectedKot.isDeleted ? 'Deleted in Trash' : selectedKot.isBilled ? 'Billed' : 'Active Ticket'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                  {selectedKot.isDeleted && selectedKot.deletedAt
                                    ? `Deleted: ${new Date(selectedKot.deletedAt).toLocaleString()}`
                                    : `Created: ${new Date(selectedKot.createdAt).toLocaleString()}`}
                                </span>
                              </div>
                            </div>

                            {/* Actions toolbar */}
                            <div className="flex items-center gap-1.5">
                              
                              {selectedKot.isDeleted ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleRestoreKot(selectedKot)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                                    title="Restore KOT"
                                  >
                                    <span>Restore Ticket</span>
                                  </button>
                                  <button
                                    onClick={() => handlePermanentDeleteKot(selectedKot)}
                                    className={`px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm ${
                                      currentUser?.role !== 'Admin' ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    title="Permanently Delete KOT"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Forever</span>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {/* Print */}
                                  <button
                                    onClick={() => setActiveKotPreview(selectedKot)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                                    title="Print standalone KOT (no prices)"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>

                                  {/* Duplicate */}
                                  <button
                                    onClick={() => handleDuplicateKot(selectedKot)}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                                    title="Duplicate items back to active Billing Station"
                                  >
                                    <ShoppingBag className="w-4 h-4" />
                                  </button>

                                  {/* Soft Delete */}
                                  <button
                                    onClick={() => handleSoftDeleteKot(selectedKot)}
                                    className="p-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 hover:border-rose-900 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                                    title="Move KOT to Trash"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>

                                  {/* Quick status progress controls */}
                                  {!selectedKot.isBilled && (
                                    <>
                                      <div className="w-px h-6 bg-slate-700 mx-1.5" />
                                      {selectedKot.status === 'Pending' && (
                                        <button
                                          onClick={() => handleUpdateKotStatus(selectedKot.id, 'Preparing')}
                                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                                        >
                                          <ChefHat className="w-3 h-3" />
                                          <span>Start Preparing</span>
                                        </button>
                                      )}
                                      {selectedKot.status === 'Preparing' && (
                                        <button
                                          onClick={() => handleUpdateKotStatus(selectedKot.id, 'Ready')}
                                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Mark Prepared</span>
                                        </button>
                                      )}
                                      {selectedKot.status === 'Ready' && (
                                        <button
                                          onClick={() => handleUpdateKotStatus(selectedKot.id, 'Served')}
                                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Mark Served</span>
                                        </button>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Workspace Scrollable Body Form */}
                          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                            
                            {selectedKot.isDeleted && (
                              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-3">
                                <span className="text-xl">⚠️</span>
                                <div>
                                  <p className="font-extrabold uppercase tracking-wider text-[10px] text-rose-900">This Ticket is in Trash</p>
                                  <p className="text-rose-700 font-medium mt-0.5">Restore this KOT using the button at the top to resume edits or billing conversions.</p>
                                </div>
                              </div>
                            )}

                            {/* Metadata input grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-5">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Point / Table</label>
                                <input
                                  type="text"
                                  value={selectedKot.tableNumber}
                                  onChange={(e) => updateKotField(selectedKot.id, { tableNumber: e.target.value })}
                                  disabled={selectedKot.isDeleted}
                                  placeholder="e.g. Table 4"
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Name</label>
                                <input
                                  type="text"
                                  value={selectedKot.customerName || ''}
                                  onChange={(e) => updateKotField(selectedKot.id, { customerName: e.target.value })}
                                  disabled={selectedKot.isDeleted}
                                  placeholder="e.g. Guest Name"
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Order Service Type</label>
                                <select
                                  value={selectedKot.orderType}
                                  onChange={(e) => updateKotField(selectedKot.id, { orderType: e.target.value as OrderType })}
                                  disabled={selectedKot.isDeleted}
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 font-semibold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                  <option value="Dine-In">Dine-In</option>
                                  <option value="Takeaway">Takeaway</option>
                                  <option value="Room Service">Room Service</option>
                                </select>
                              </div>
                            </div>

                            {/* Ticket Items Sheet */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">KOT Food Items Sheet</span>
                              
                              {selectedKot.items.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                                  🎟️ This kitchen ticket currently has no food items. Search and add dishes below!
                                </div>
                              ) : (
                                <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                                  {selectedKot.items.map((item) => (
                                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/40 transition-colors">
                                      <div className="min-w-0 flex items-center gap-2 flex-1 mr-3">
                                        <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">{item.code}</span>
                                        <div className="min-w-0 flex-1">
                                          <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                                          <input
                                            type="text"
                                            value={item.notes || ''}
                                            onChange={(e) => updateKotItemNotes(selectedKot.id, item.id, e.target.value)}
                                            disabled={selectedKot.isDeleted}
                                            placeholder={selectedKot.isDeleted ? "" : "Add preparation instructions (e.g., extra spicy, no cheese)..."}
                                            className="text-[10px] text-amber-600 focus:text-slate-800 bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full mt-0.5 italic placeholder:text-slate-300 disabled:opacity-60"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                                          <button
                                            type="button"
                                            onClick={() => updateKotItemQuantity(selectedKot.id, item.id, item.quantity - 1)}
                                            disabled={selectedKot.isDeleted}
                                            className="w-6 h-6 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 font-bold flex items-center justify-center border border-slate-200/30 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                          >
                                            -
                                          </button>
                                          <span className="font-mono font-bold text-slate-800 text-xs px-1.5 min-w-[20px] text-center">{item.quantity}</span>
                                          <button
                                            type="button"
                                            onClick={() => updateKotItemQuantity(selectedKot.id, item.id, item.quantity + 1)}
                                            disabled={selectedKot.isDeleted}
                                            className="w-6 h-6 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-600 font-bold flex items-center justify-center border border-slate-200/30 transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                          >
                                            +
                                          </button>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => removeKotItem(selectedKot.id, item.id)}
                                          disabled={selectedKot.isDeleted}
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                          title="Remove item"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Add Food Items to Ticket Search Desk */}
                            {!selectedKot.isDeleted && (
                              <div className="space-y-2.5 border-t border-slate-100 pt-5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Add Dishes to Ticket</span>
                                  <span className="text-[10px] text-slate-400">Click to add instantly</span>
                                </div>
                                
                                {/* Search bar */}
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input
                                    type="text"
                                    value={kotAddItemSearch}
                                    onChange={(e) => setKotAddItemSearch(e.target.value)}
                                    placeholder="Type name, code, or category to filter dishes..."
                                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-emerald-500 transition-all focus:bg-white focus:ring-1 focus:ring-emerald-500/20 text-slate-800"
                                  />
                                </div>

                                {/* Filtered items list */}
                                <div className="max-h-[180px] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 custom-scrollbar shadow-xs">
                                  {menuItems
                                    .filter(mi => mi.isAvailable && (
                                      mi.name.toLowerCase().includes(kotAddItemSearch.toLowerCase()) ||
                                      mi.code.toLowerCase().includes(kotAddItemSearch.toLowerCase()) ||
                                      mi.category.toLowerCase().includes(kotAddItemSearch.toLowerCase())
                                    ))
                                    .slice(0, 15)
                                    .map((mItem) => {
                                      const isAlreadyAdded = selectedKot.items.some(ki => ki.id === mItem.id);
                                      return (
                                        <div key={mItem.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50/40 transition-colors">
                                          <div>
                                            <span className="font-bold text-slate-700 block">{mItem.name}</span>
                                            <span className="text-[9px] text-slate-400 font-mono font-bold block mt-0.5">
                                              {mItem.code} | {mItem.category} | {settings.currency}{mItem.price}
                                            </span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => addFoodItemToKot(selectedKot.id, mItem)}
                                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                                          >
                                            {isAlreadyAdded ? '+ Add more' : '+ Add to KOT'}
                                          </button>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}

                            {/* Overall notes input */}
                            <div className="space-y-1.5 border-t border-slate-100 pt-5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">General Kitchen Notes</label>
                              <input
                                type="text"
                                value={selectedKot.notes || ''}
                                onChange={(e) => updateKotField(selectedKot.id, { notes: e.target.value })}
                                disabled={selectedKot.isDeleted}
                                placeholder={selectedKot.isDeleted ? "No kitchen notes can be modified on deleted tickets." : "e.g. Serve starters first, spicy mains, allergy to soy"}
                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
                              />
                            </div>

                          </div>

                          {/* Workspace Footer Actions Panel */}
                          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Items Selected</span>
                              <span className="font-extrabold text-slate-800 text-sm">
                                {selectedKot.items.reduce((sum, item) => sum + item.quantity, 0)} items on sheet
                              </span>
                            </div>

                            {selectedKot.isDeleted ? (
                              <div className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 uppercase tracking-wider">
                                <span>🔒 Locked in Trash</span>
                              </div>
                            ) : selectedKot.isBilled ? (
                              <div className="flex gap-2 items-center">
                                <span className="px-3.5 py-2 bg-slate-200 text-slate-500 font-extrabold text-xs rounded-xl flex items-center gap-1.5 border border-slate-300/35">
                                  <Check className="w-4 h-4 text-emerald-600 font-bold" />
                                  <span>Already Settled Bill</span>
                                </span>
                                {currentUser?.role === 'Admin' ? (
                                  <button
                                    onClick={() => handleReopenKot(selectedKot)}
                                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 active:scale-95 transition-all cursor-pointer"
                                    title="Unbill and set back to editable active status"
                                  >
                                    Reopen Ticket
                                  </button>
                                ) : (
                                  <span className="px-3.5 py-2 bg-slate-100 text-slate-400 font-bold text-[10px] rounded-xl border border-slate-200 cursor-not-allowed uppercase" title="Reopening is limited to Admin role">
                                    Admin Locked
                                  </span>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleConvertKotToBill(selectedKot)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                              >
                                <Receipt className="w-4 h-4" />
                                <span>Convert to Settled Bill</span>
                              </button>
                            )}
                          </div>

                        </div>
                      ) : (
                        /* Empty State: No selected KOT */
                        <div className="flex-1 py-20 px-6 text-center flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600 animate-bounce">
                            <ClipboardList className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-base">Multiple KOT Workspace Desk</h3>
                            <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                              Select an active or historical Kitchen Order Ticket from the left-hand panel, or click the button below to generate a brand-new ticket.
                            </p>
                          </div>
                          <button
                            onClick={handleCreateNewKot}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create New KOT Ticket</span>
                          </button>
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 6. HOTEL SETTINGS PAGE TAB                                */}
              {/* ========================================================= */}
              {activeTab === 'settings' && (
                <div id="settings-workspace" className="p-6 space-y-6 max-w-4xl">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Header Banner */}
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/60">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/40 flex items-center justify-center text-emerald-600 shrink-0">
                        <Settings className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-extrabold text-slate-800 text-base leading-tight">Hotel & Restaurant Settings</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Configure billing headers, service charge rates, active currency, and thermal footer message</p>
                      </div>
                    </div>

                    {/* Settings Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        localStorage.setItem('shbs_settings', JSON.stringify(settings));
                        triggerNotification('Settings saved permanently!', 'success');
                      }}
                      className="p-6 space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hotel Name</label>
                          <input
                            type="text"
                            required
                            value={settings.name}
                            onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                            placeholder="Green Olive"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Number</label>
                          <input
                            type="text"
                            required
                            value={settings.phone}
                            onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address Location</label>
                        <input
                          type="text"
                          required
                          value={settings.address}
                          onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                          placeholder="Smart Hotel Road, Sector 4, Bangalore"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">FSSAI License Number (Optional)</label>
                          <input
                            type="text"
                            value={settings.fssaiNumber || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, fssaiNumber: e.target.value.replace(/\D/g, '') }))}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono"
                            placeholder="14-digit FSSAI number"
                            maxLength={14}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Currency Symbol</label>
                          <select
                            value={settings.currency}
                            onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
                          >
                            <option value="₹">₹ (Indian Rupee)</option>
                            <option value="$">$ (US Dollar)</option>
                            <option value="£">£ (British Pound)</option>
                            <option value="€">€ (Euro)</option>
                            <option value="AED">AED (UAE Dirham)</option>
                          </select>
                        </div>
                      </div>

                      {/* Logo Upload Panel */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hotel Branding Logo</label>
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          {settings.logoUrl ? (
                            <div className="relative w-16 h-16 shrink-0 rounded-xl border border-slate-200/80 overflow-hidden bg-white group flex items-center justify-center">
                              <img src={settings.logoUrl} alt="Hotel Logo" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setSettings(prev => ({ ...prev, logoUrl: '' }))}
                                className="absolute inset-0 bg-rose-600/85 text-white flex items-center justify-center font-bold text-[10px] tracking-wide opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer uppercase"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 shrink-0 rounded-xl bg-white border border-slate-200 border-dashed flex items-center justify-center text-slate-300">
                              <ChefHat className="w-7 h-7" />
                            </div>
                          )}
                          <div className="flex-1 text-center sm:text-left">
                            <span className="text-xs font-bold text-slate-700 block">Upload Logo File</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Supports PNG or JPG formats. Automatically converted & saved offline.</span>
                            <input
                              type="file"
                              accept="image/*"
                              id="logo-upload-input"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
                                    triggerNotification('Logo loaded successfully!', 'success');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                            <label
                              htmlFor="logo-upload-input"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200/30 mt-2 cursor-pointer transition-all active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Choose Brand Image</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Service Charge Switch */}
                      <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">Service Charge (KOT Cover Charge)</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Configure if orders carry a standard service staff surcharge on checkout</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSettings(prev => ({ ...prev, enableServiceCharge: !prev.enableServiceCharge }))}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${
                              settings.enableServiceCharge ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-xs ${
                              settings.enableServiceCharge ? 'left-6' : 'left-1'
                            }`} />
                          </button>
                        </div>

                        {settings.enableServiceCharge && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/40">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Charge Surcharge Rate (%)</label>
                              <input
                                type="number"
                                step="0.1"
                                required
                                value={settings.serviceChargeRate}
                                onChange={(e) => setSettings(prev => ({ ...prev, serviceChargeRate: Math.max(0, parseFloat(e.target.value) || 0) }))}
                                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                                min={0}
                                max={100}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Receipt Footer Message */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Receipt Bill Footer Message</label>
                        <textarea
                          value={settings.footerMessage}
                          onChange={(e) => setSettings(prev => ({ ...prev, footerMessage: e.target.value }))}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                          placeholder="Thank You, Visit Again!"
                          rows={2}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Save Configuration Permanently</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </main>

          {/* ========================================================= */}
          {/* 7. HIGH-FIDELITY PRINT RECEIPT THERMAL PREVIEW MODAL      */}
          {/* ========================================================= */}
          {activeReceiptBill && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:relative print:inset-auto">
              
              {/* Receipt Backdrop Box */}
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
                
                {/* Modal Title Banner (Hidden during actual print output) */}
                <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center print:hidden shrink-0">
                  <span className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-emerald-400" />
                    Bill Invoice Preview
                  </span>
                  <button
                    onClick={() => setActiveReceiptBill(null)}
                    className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Thermal Invoice Canvas (Printed container) */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar print:p-0 print:bg-white">
                  <div 
                    id="print-receipt-container"
                    className="w-full bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm text-xs text-slate-800 font-mono print:border-none print:p-0 print:shadow-none"
                  >
                    {/* Business logo & headers */}
                    <div className="text-center space-y-1">
                      {settings.logoUrl && (
                        <div className="flex justify-center mb-1.5">
                          <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain max-w-[120px]" />
                        </div>
                      )}
                      <span className="font-black text-sm uppercase tracking-wide">{settings.name}</span>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {settings.address}<br />
                        {settings.phone && <span>Phone: {settings.phone}<br /></span>}
                        {settings.fssaiNumber && <span>FSSAI: {settings.fssaiNumber}</span>}
                      </p>
                    </div>

                    <div className="border-b border-dashed border-slate-300 my-4" />

                    {/* Metadata lines */}
                    <div className="space-y-1 font-medium text-[10px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Invoice: <strong className="text-slate-800">{activeReceiptBill.billNumber}</strong></span>
                        <span>Date: <span className="tabular-nums">{new Date(activeReceiptBill.date).toLocaleDateString()}</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service: <strong className="text-slate-800">{activeReceiptBill.orderType}</strong></span>
                        <span>Time: <span className="tabular-nums">{new Date(activeReceiptBill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Table/Room: <strong className="text-slate-800">{activeReceiptBill.tableNumber}</strong></span>
                        <span>Cashier: <span className="text-slate-800">Admin Staff</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer: <strong className="text-slate-800">{activeReceiptBill.customerName}</strong></span>
                      </div>
                      {activeReceiptBill.customerPhone && (
                        <div className="flex justify-between">
                          <span>Mobile: <span className="tabular-nums text-slate-800">{activeReceiptBill.customerPhone}</span></span>
                        </div>
                      )}
                    </div>

                    <div className="border-b border-dashed border-slate-300 my-4" />

                    {/* Items table list */}
                    <table className="w-full text-left font-mono text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-dashed border-slate-200 text-slate-500 font-semibold uppercase">
                          <th className="pb-1 w-[50%]">Item Code & Name</th>
                          <th className="pb-1 text-center w-[15%]">Qty</th>
                          <th className="pb-1 text-right w-[15%]">Rate</th>
                          <th className="pb-1 text-right w-[20%]">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeReceiptBill.items.map((bItem, idx) => (
                          <tr key={idx} className="border-b border-dashed border-slate-100">
                            <td className="py-2">
                              <span className="block text-[8px] font-bold text-slate-400">{bItem.code}</span>
                              <span className="font-bold text-slate-800">{bItem.name}</span>
                            </td>
                            <td className="py-2 text-center font-bold tabular-nums">{bItem.quantity}</td>
                            <td className="py-2 text-right tabular-nums">{settings.currency}{bItem.price}</td>
                            <td className="py-2 text-right font-bold tabular-nums">{settings.currency}{bItem.price * bItem.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="border-b border-dashed border-slate-300 my-4" />

                    {/* Calculations */}
                    <div className="space-y-1 text-[11px] font-medium text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="tabular-nums text-slate-800">{settings.currency}{activeReceiptBill.subtotal}</span>
                      </div>
                      {/* GST calculations completely removed */}
                      {activeReceiptBill.serviceCharge > 0 && settings.enableServiceCharge && (
                        <div className="flex justify-between">
                          <span>Service Charge ({settings.serviceChargeRate}%)</span>
                          <span className="tabular-nums text-slate-800">{settings.currency}{activeReceiptBill.serviceCharge}</span>
                        </div>
                      )}
                      {activeReceiptBill.discount > 0 && (
                        <div className="flex justify-between text-slate-500">
                          <span>Discount Applied</span>
                          <span className="tabular-nums">-{settings.currency}{activeReceiptBill.discount}</span>
                        </div>
                      )}
                      
                      <div className="border-b border-dashed border-slate-200 my-2" />
                      
                      <div className="flex justify-between text-xs font-black text-slate-900">
                        <span>NET TOTAL SETTLED</span>
                        <span className="tabular-nums text-emerald-800">{settings.currency}{activeReceiptBill.total}</span>
                      </div>
                    </div>

                    <div className="border-b border-dashed border-slate-300 my-4" />

                    {/* Settlement mode details */}
                    <div className="text-center space-y-1 text-[10px] text-slate-600 font-bold">
                      <p className="uppercase tracking-wider">Settled via {activeReceiptBill.paymentMethod}</p>
                      <p className="text-[8px] font-normal text-slate-400">Transaction ID: TXN-{activeReceiptBill.id}</p>
                    </div>

                    <div className="border-b border-dashed border-slate-300 my-4" />

                    {/* Friendly greetings */}
                    <div className="text-center space-y-1.5">
                      <span className="font-extrabold text-[10px] uppercase">THANK YOU FOR YOUR VISIT!</span>
                      <p className="text-[9px] text-slate-500 max-w-[220px] mx-auto leading-relaxed whitespace-pre-wrap">{settings.footerMessage}</p>
                    </div>

                  </div>
                </div>

                {/* Print confirmation toolbar (Hidden during print output) */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5 print:hidden shrink-0">
                  <button
                    onClick={() => setActiveReceiptBill(null)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 text-center transition-colors cursor-pointer"
                  >
                    Cancel / Exit
                  </button>
                  <button
                    onClick={triggerPrintReceipt}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. KITCHEN ORDER TICKET (KOT) PRINT PREVIEW MODAL         */}
          {/* ========================================================= */}
          {activeKotPreview && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:relative print:inset-auto">
              
              {/* KOT Backdrop Box */}
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
                
                {/* Modal Title Banner (Hidden during actual print) */}
                <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center print:hidden shrink-0">
                  <span className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4 text-amber-400" />
                    Kitchen Order Ticket (KOT)
                  </span>
                  <button
                    onClick={() => setActiveKotPreview(null)}
                    className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* KOT Printable Canvas */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar print:p-0 print:bg-white">
                  <div 
                    id="print-kot-container"
                    className="w-full bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm text-xs text-slate-800 font-mono print:border-none print:p-0 print:shadow-none"
                  >
                    {/* Header */}
                    <div className="text-center space-y-1">
                      <span className="font-black text-sm uppercase tracking-wider">KITCHEN ORDER TICKET</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{settings.name}</p>
                    </div>

                    <div className="border-b border-dashed border-slate-300 my-4" />

                    {/* Metadata */}
                    <div className="space-y-1 font-medium text-[10px] text-slate-600">
                      <div className="flex justify-between">
                        <span>KOT ID: <strong className="text-slate-800">{activeKotPreview.kotNumber}</strong></span>
                        <span>Date: <span className="tabular-nums">{new Date(activeKotPreview.createdAt).toLocaleDateString()}</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service: <strong className="text-slate-800">{activeKotPreview.orderType}</strong></span>
                        <span>Time: <span className="tabular-nums">{new Date(activeKotPreview.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Table/Room: <strong className="text-slate-800">{activeKotPreview.tableNumber}</strong></span>
                        <span>Status: <strong className="text-emerald-700 uppercase">{activeKotPreview.status}</strong></span>
                      </div>
                    </div>

                    <div className="border-b border-dashed border-slate-300 my-4" />

                    {/* Items (strictly NO prices!) */}
                    <table className="w-full text-left font-mono text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-dashed border-slate-200 text-slate-500 font-semibold uppercase font-bold">
                          <th className="pb-1 w-[70%]">Item Name & Code</th>
                          <th className="pb-1 text-right w-[30%]">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeKotPreview.items.map((kItem, idx) => (
                          <tr key={idx} className="border-b border-dashed border-slate-100">
                            <td className="py-2.5">
                              <span className="block text-[8px] font-bold text-slate-400">{kItem.code}</span>
                              <span className="font-extrabold text-slate-900 text-xs">{kItem.name}</span>
                            </td>
                            <td className="py-2.5 text-right font-black text-sm tabular-nums text-emerald-800">x {kItem.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="border-b border-dashed border-slate-300 my-5" />

                    <div className="text-center text-[9px] text-slate-400">
                      <p>Sent to Kitchen: {new Date(activeKotPreview.createdAt).toLocaleTimeString()}</p>
                      <p className="mt-1 font-bold">SMART HOTEL POS KOT SYSTEM</p>
                    </div>

                  </div>
                </div>

                {/* Print confirmation toolbar */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5 print:hidden shrink-0">
                  <button
                    onClick={() => setActiveKotPreview(null)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 text-center transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Ticket</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* KITCHEN ORDER TICKET (KOT) EDIT MODAL                     */}
          {/* ========================================================= */}
          {editingKot && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-45">
              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
                  <span className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                    <Edit className="w-4 h-4 text-emerald-400" />
                    Edit Kitchen Ticket: <span className="font-mono text-emerald-300 font-extrabold">{editingKot.kotNumber}</span>
                  </span>
                  <button
                    onClick={() => setEditingKot(null)}
                    className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Body Content */}
                <form onSubmit={handleSaveEditedKot} className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
                    
                    {/* Customer & Table details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Point / Table</label>
                        <input
                          type="text"
                          required
                          value={editingKotTable}
                          onChange={(e) => setEditingKotTable(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                          placeholder="e.g. Table 4"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Name (Optional)</label>
                        <input
                          type="text"
                          value={editingKotName}
                          onChange={(e) => setEditingKotName(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="e.g. Walk-in Guest"
                        />
                      </div>
                    </div>

                    {/* Current Items Sheet */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">KOT Items Sheet</span>
                      <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                        {editingKotItems.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            KOT must have at least one food item. Add items below.
                          </div>
                        ) : (
                          editingKotItems.map((item) => (
                            <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                              <div className="min-w-0 flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">{item.code}</span>
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-slate-800 block truncate">{item.name}</span>
                                  <input
                                    type="text"
                                    value={item.notes || ''}
                                    onChange={(e) => {
                                      const noteText = e.target.value;
                                      setEditingKotItems(prev => prev.map(ki => ki.id === item.id ? { ...ki, notes: noteText } : ki));
                                    }}
                                    placeholder="Add preparation note..."
                                    className="text-[10px] text-amber-600 focus:text-slate-800 bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full mt-0.5 italic placeholder:text-slate-300"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (item.quantity <= 1) {
                                        setEditingKotItems(prev => prev.filter(ki => ki.id !== item.id));
                                      } else {
                                        setEditingKotItems(prev => prev.map(ki => ki.id === item.id ? { ...ki, quantity: ki.quantity - 1 } : ki));
                                      }
                                    }}
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 font-bold flex items-center justify-center border border-slate-200/30 transition-all cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold text-slate-800 text-xs px-1.5 min-w-[20px] text-center">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingKotItems(prev => prev.map(ki => ki.id === item.id ? { ...ki, quantity: ki.quantity + 1 } : ki));
                                    }}
                                    className="w-6 h-6 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-600 font-bold flex items-center justify-center border border-slate-200/30 transition-all cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingKotItems(prev => prev.filter(ki => ki.id !== item.id));
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Add Items to Ticket */}
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Add Food Items to Ticket</span>
                      
                      {/* Search bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={kotAddItemSearch}
                          onChange={(e) => setKotAddItemSearch(e.target.value)}
                          placeholder="Search catalog to insert dish..."
                          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Filtered items list */}
                      <div className="max-h-[140px] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 custom-scrollbar">
                        {menuItems
                          .filter(mi => mi.isAvailable && (
                            mi.name.toLowerCase().includes(kotAddItemSearch.toLowerCase()) ||
                            mi.code.toLowerCase().includes(kotAddItemSearch.toLowerCase()) ||
                            mi.category.toLowerCase().includes(kotAddItemSearch.toLowerCase())
                          ))
                          .slice(0, 10)
                          .map((mItem) => {
                            const isAlreadyAdded = editingKotItems.some(ki => ki.id === mItem.id);
                            return (
                              <div key={mItem.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50/40">
                                <div>
                                  <span className="font-extrabold text-slate-700 block">{mItem.name}</span>
                                  <span className="text-[9px] text-slate-400 font-mono font-bold block mt-0.5">
                                    {mItem.code} | {mItem.category} | {settings.currency}{mItem.price}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const existing = editingKotItems.find(ki => ki.id === mItem.id);
                                    if (existing) {
                                      setEditingKotItems(prev => prev.map(ki => ki.id === mItem.id ? { ...ki, quantity: ki.quantity + 1 } : ki));
                                    } else {
                                      const newKotItem: KotItem = {
                                        id: mItem.id,
                                        code: mItem.code,
                                        name: mItem.name,
                                        quantity: 1,
                                        notes: ''
                                      };
                                      setEditingKotItems(prev => [...prev, newKotItem]);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                                >
                                  {isAlreadyAdded ? '+ Add more' : '+ Add item'}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Overall Notes */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kitchen Notes</label>
                      <input
                        type="text"
                        value={editingKotNotes}
                        onChange={(e) => setEditingKotNotes(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. Serve starters first, spicy main course"
                      />
                    </div>

                  </div>

                  {/* Actions footer */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingKot(null)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 text-center transition-all cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer uppercase tracking-wide"
                    >
                      Save Ticket Details
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. MODAL: ADD / EDIT MENU FOOD ITEM                       */}
          {/* ========================================================= */}
          {showAddMenuModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                
                {/* Modal Title Banner */}
                <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
                  <span className="font-bold text-sm tracking-wide">
                    {editingMenuItem ? 'Edit Menu Food Details' : 'Add New Food to Menu'}
                  </span>
                  <button
                    onClick={() => { setShowAddMenuModal(false); setEditingMenuItem(null); }}
                    className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Input Fields */}
                <form onSubmit={handleSaveMenuItem} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Food Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as MenuItem['category'])}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs bg-white font-medium text-slate-700"
                    >
                      <option value="Starter">Starter (Appetizer)</option>
                      <option value="Main Course">Main Course (Entrée)</option>
                      <option value="Breads">Breads (Indian Bread Specialties)</option>
                      <option value="Dessert">Dessert Specials</option>
                      <option value="Beverage">Beverages & Drinks</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Item Code (Auto generated based on category, but fully editable!) */}
                    <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code</label>
                      <input
                        type="text"
                        required
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                        placeholder="E.g. P101"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-bold text-slate-800 text-center uppercase"
                      />
                    </div>

                    {/* Item Name */}
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Price (INR ₹)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formPrice || ''}
                        onChange={(e) => setFormPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="₹ Price"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-extrabold text-emerald-800 text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Food Item Title</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="E.g. Paneer Tikka Masala, Fresh Lime Soda"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-semibold text-slate-700"
                    />
                  </div>

                  {/* Stock availability status checkbox */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500">Currently in Kitchen Inventory?</label>
                    <button
                      type="button"
                      onClick={() => setFormAvailable(prev => !prev)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
                        formAvailable
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {formAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setShowAddMenuModal(false); setEditingMenuItem(null); }}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 text-center transition-colors cursor-pointer"
                    >
                      Discard Form
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer"
                    >
                      {editingMenuItem ? 'Update details' : 'Save Food to Catalog'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 10. MODAL: CONFIRM DELETE KOT                            */}
          {/* ========================================================= */}
          {kotToConfirmDelete && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100">
                
                {/* Header Badge & Alert Icon */}
                <div className="p-6 text-center space-y-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 border border-rose-200">
                    <AlertTriangle className="h-6 w-6 text-rose-600" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      {isPermanentDeleteConfirm ? 'Delete KOT Permanently?' : 'Move KOT to Trash?'}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isPermanentDeleteConfirm 
                        ? 'This action cannot be undone. This KOT will be deleted from your database.' 
                        : 'Are you sure you want to move this Kitchen Order Ticket to the trash? You can restore it later.'}
                    </p>
                  </div>

                  {/* Ticket Details summary card inside modal */}
                  <div className="bg-slate-50/80 rounded-xl p-3 text-left border border-slate-100 text-xs font-semibold space-y-1">
                    <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                      <span>Ticket Number:</span>
                      <span className="text-slate-800 font-extrabold">{kotToConfirmDelete.kotNumber}</span>
                    </div>
                    {kotToConfirmDelete.tableNumber && (
                      <div className="flex justify-between text-slate-500">
                        <span>Table:</span>
                        <span className="text-slate-800 font-extrabold">{kotToConfirmDelete.tableNumber}</span>
                      </div>
                    )}
                    {kotToConfirmDelete.customerName && (
                      <div className="flex justify-between text-slate-500">
                        <span>Customer Name:</span>
                        <span className="text-slate-800 font-extrabold truncate max-w-[150px]">{kotToConfirmDelete.customerName}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Order Type:</span>
                      <span className="text-slate-800 font-bold">{kotToConfirmDelete.orderType}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Action Buttons */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setKotToConfirmDelete(null)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 text-center transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmKotDeleteAction()}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer uppercase tracking-wide"
                  >
                    {isPermanentDeleteConfirm ? 'Delete Forever' : 'Move to Trash'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
