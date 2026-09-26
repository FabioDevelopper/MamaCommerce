export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  active?: boolean;
  createdAt?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  businessName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  creditLimit: number;
  totalPurchases?: number;
  totalPaid?: number;
  totalCredit?: number;
  overdueAmount?: number;
  hasOverdueCredit?: boolean;
  whatsappReminderUrl?: string | null;
  active?: boolean;
  createdAt?: string;
  orders?: Order[];
  payments?: Payment[];
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  country: string;
  totalShipments?: number;
  totalPurchases?: number;
  active?: boolean;
  createdAt?: string;
  shipments?: Shipment[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  reorderLevel: number;
  currentStock?: number;
  isLowStock?: boolean;
  stockValue?: number;
  active: boolean;
  createdAt?: string;
}

export type ShipmentStatus = 'PLANNED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export interface ShipmentItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Shipment {
  id: string;
  reference: string;
  supplierId: string;
  supplier?: Supplier;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  departureDate?: string | null;
  arrivalDate?: string | null;
  transportCost: number;
  otherCosts: number;
  notes?: string | null;
  createdAt: string;
  items?: ShipmentItem[];
  expenses?: Expense[];
  itemsCost?: number;
  totalCost?: number;
  totalQuantity?: number;
}

export type OrderStatus = 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  number: string;
  customerId?: string | null;
  customer?: Customer | null;
  userId: string;
  user?: { id?: string; name: string; role?: string; phone?: string | null };
  status: OrderStatus;
  orderDate: string;
  dueDate?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  paidTotal: number;
  creditTotal: number;
  notes?: string | null;
  items?: OrderItem[];
  payments?: Payment[];
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'TMONEY' | 'MOOV_MONEY' | 'BANK_TRANSFER' | 'OTHER';

export interface Payment {
  id: string;
  reference: string;
  orderId?: string | null;
  order?: { id: string; number: string; total: number; creditTotal: number } | null;
  customerId?: string | null;
  customer?: Customer | null;
  userId: string;
  user?: { id: string; name: string };
  amount: number;
  method: PaymentMethod;
  receivedAt: string;
  note?: string | null;
}

export type ExpenseCategory =
  | 'ACHAT'
  | 'TRANSPORT'
  | 'LIVRAISON'
  | 'CARBURANT'
  | 'COMMUNICATION'
  | 'MANUTENTION'
  | 'AUTRE';

export interface Expense {
  id: string;
  reference: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description: string;
  shipmentId?: string | null;
  shipment?: { id: string; reference: string; origin: string; destination: string } | null;
  userId: string;
  user?: { id: string; name: string };
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  unitCost: number;
  reference?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  metrics: {
    turnover: number;
    salesToday: number;
    ordersTodayCount: number;
    salesMonth: number;
    ordersMonthCount: number;
    activeCreditTotal: number;
    overdueCreditTotal: number;
    paymentsReceivedTotal: number;
    expensesTotal: number;
    totalStockValue: number;
    totalStockKg: number;
    cogs: number;
    estimatedGrossProfit: number;
    estimatedNetProfit: number;
    profitDisclaimer: string;
  };
  alerts: {
    lowStockCount: number;
    lowStockItems: Array<{
      id: string;
      sku: string;
      name: string;
      unit: string;
      currentStock: number;
      reorderLevel: number;
    }>;
    overdueCreditCount: number;
    overdueCreditAmount: number;
  };
  charts: {
    last7Days: Array<{
      date: string;
      label: string;
      sales: number;
      ordersCount: number;
    }>;
  };
  recentActivity: {
    orders: Order[];
    payments: Payment[];
    shipments: Shipment[];
    expenses: Expense[];
  };
}

export interface FinancialReport {
  period: {
    code: string;
    from: string;
    to: string;
  };
  summary: {
    totalSales: number;
    ordersCount: number;
    totalCashReceived: number;
    paymentsCount: number;
    totalNewCredit: number;
    totalExpenses: number;
    expensesCount: number;
    totalCogs: number;
    estimatedGrossProfit: number;
    estimatedNetProfit: number;
    grossMarginPercent: number;
    shipmentsCount: number;
  };
  expensesByCategory: Record<string, number>;
  paymentsByMethod: Record<string, number>;
  topProducts: Array<{
    name: string;
    unit: string;
    quantity: number;
    revenue: number;
    cost: number;
    margin: number;
    marginPercent: number;
  }>;
}
