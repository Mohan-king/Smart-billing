import { Bill } from './types';

// Helper to get formatted ISO dates relative to current date
const getDateDaysAgo = (daysAgo: number, hour: number, minute: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const getInitialBills = (): Bill[] => [
  {
    id: 'b1',
    billNumber: 'INV-2026-001',
    customerName: 'Anand Sharma',
    customerPhone: '9876543210',
    tableNumber: 'Table 4',
    orderType: 'Dine-In',
    items: [
      { id: '1', code: 'P101', name: 'Paneer Tikka', price: 240, quantity: 2 },
      { id: '5', code: 'M202', name: 'Kadai Paneer', price: 290, quantity: 1 },
      { id: '8', code: 'B301', name: 'Butter Naan', price: 45, quantity: 4 },
      { id: '13', code: 'V501', name: 'Mango Lassi', price: 90, quantity: 2 },
    ],
    subtotal: 1130,
    serviceCharge: 56.5, // 5%
    discount: 50,
    discountType: 'flat',
    discountValue: 50,
    total: 1136.5, // 1130 + 56.5 - 50
    date: getDateDaysAgo(0, 13, 15), // Today at 1:15 PM
    paymentMethod: 'UPI',
  },
  {
    id: 'b2',
    billNumber: 'INV-2026-002',
    customerName: 'Meera Nair',
    customerPhone: '8765432109',
    tableNumber: 'Table 12',
    orderType: 'Dine-In',
    items: [
      { id: '4', code: 'M201', name: 'Butter Chicken', price: 380, quantity: 1 },
      { id: '9', code: 'B302', name: 'Garlic Naan', price: 55, quantity: 2 },
      { id: '14', code: 'V502', name: 'Fresh Lime Soda', price: 70, quantity: 1 },
    ],
    subtotal: 560,
    serviceCharge: 28,
    discount: 0,
    discountType: 'flat',
    discountValue: 0,
    total: 588, // 560 + 28
    date: getDateDaysAgo(0, 14, 45), // Today at 2:45 PM
    paymentMethod: 'Card',
  },
  {
    id: 'b3',
    billNumber: 'INV-2026-003',
    customerName: 'Sanjay Gupta',
    customerPhone: '7654321098',
    tableNumber: 'Table 7',
    orderType: 'Dine-In',
    items: [
      { id: '7', code: 'M204', name: 'Hyderabadi Veg Biryani', price: 280, quantity: 2 },
      { id: '12', code: 'D402', name: 'Gulab Jamun (2 Pcs)', price: 80, quantity: 2 },
      { id: '15', code: 'V503', name: 'Mineral Water', price: 40, quantity: 2 },
    ],
    subtotal: 800,
    serviceCharge: 40,
    discount: 80, // 10% discount
    discountType: 'percentage',
    discountValue: 10,
    total: 760, // 800 + 40 - 80
    date: getDateDaysAgo(0, 20, 10), // Today at 8:10 PM
    paymentMethod: 'Cash',
  },
  {
    id: 'b4',
    billNumber: 'INV-2026-004',
    customerName: 'Rohan Deshmukh',
    customerPhone: '9555123456',
    tableNumber: 'Room 304',
    orderType: 'Room Service',
    items: [
      { id: '6', code: 'M203', name: 'Dal Makhani', price: 240, quantity: 1 },
      { id: '10', code: 'B303', name: 'Tandoori Roti', price: 25, quantity: 3 },
      { id: '11', code: 'D401', name: 'Sizzling Brownie with Ice Cream', price: 180, quantity: 1 },
    ],
    subtotal: 495,
    serviceCharge: 24.75,
    discount: 0,
    discountType: 'flat',
    discountValue: 0,
    total: 519.75, // 495 + 24.75
    date: getDateDaysAgo(1, 19, 30), // Yesterday at 7:30 PM
    paymentMethod: 'Card',
  },
  {
    id: 'b5',
    billNumber: 'INV-2026-005',
    customerName: 'Priya Patel',
    customerPhone: '9444123456',
    tableNumber: 'Counter',
    orderType: 'Takeaway',
    items: [
      { id: '2', code: 'P102', name: 'Crispy Chilli Potatoes', price: 180, quantity: 2 },
      { id: '7', code: 'M204', name: 'Hyderabadi Veg Biryani', price: 280, quantity: 1 },
    ],
    subtotal: 640,
    serviceCharge: 0, // No service charge for takeaway
    discount: 32, // 5% discount
    discountType: 'percentage',
    discountValue: 5,
    total: 608, // 640 - 32
    date: getDateDaysAgo(1, 21, 15), // Yesterday at 9:15 PM
    paymentMethod: 'UPI',
  },
  {
    id: 'b6',
    billNumber: 'INV-2026-006',
    customerName: 'Vikram Singh',
    customerPhone: '9333123456',
    tableNumber: 'Table 2',
    orderType: 'Dine-In',
    items: [
      { id: '1', code: 'P101', name: 'Paneer Tikka', price: 240, quantity: 1 },
      { id: '6', code: 'M203', name: 'Dal Makhani', price: 240, quantity: 1 },
      { id: '8', code: 'B301', name: 'Butter Naan', price: 45, quantity: 2 },
    ],
    subtotal: 570,
    serviceCharge: 28.5,
    discount: 0,
    discountType: 'flat',
    discountValue: 0,
    total: 598.5, // 570 + 28.5
    date: getDateDaysAgo(2, 12, 30), // 2 Days ago at 12:30 PM
    paymentMethod: 'Cash',
  },
  {
    id: 'b7',
    billNumber: 'INV-2026-007',
    customerName: 'Karan Malhotra',
    customerPhone: '9222123456',
    tableNumber: 'Table 9',
    orderType: 'Dine-In',
    items: [
      { id: '3', code: 'P103', name: 'Vegetable Spring Rolls', price: 160, quantity: 3 },
      { id: '13', code: 'V501', name: 'Mango Lassi', price: 90, quantity: 3 },
    ],
    subtotal: 750,
    serviceCharge: 37.5,
    discount: 75, // 10% discount
    discountType: 'percentage',
    discountValue: 10,
    total: 712.5, // 750 + 37.5 - 75
    date: getDateDaysAgo(2, 18, 45), // 2 Days ago at 6:45 PM
    paymentMethod: 'UPI',
  },
];
