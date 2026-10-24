
export type RevenuePoint = {
  date: string;
  revenue: number;
};

export type PurchaseTrendPoint = {
  period: string;
  amount: number;
};

export type SalesExpensePoint = {
  period: string;
  sales: number;
  expenses: number;
};

export type DashboardProduct = {
  productId: string;
  productName: string;
  revenue: number;
  quantity: number;
};

export type RecentSale = {
  id: string;
  invoiceNumber: string;
  amount: number;
  profit: number;
  purchasedAt: string;
  paymentMethod: string;
};

export type SalesCategoryPoint = {
  category: string;
  revenue: number;
};

export type PaymentMethodPoint = {
  method: string;
  amount: number;
};

export type InventoryOverview = {
  totalProducts: number;
  unitsInStock: number;
  inventoryValue: number;
  lowStock: number;
  outOfStock: number;
};

export type CustomerGrowthPoint = {
  period: string;
  customers: number;
};

export type CustomerSourcePoint = {
  source: string;
  customers: number;
};

export type ExpenseCategoryPoint = {
  category: string;
  amount: number;
};

export type ProfitabilityData = {
  revenue: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  netMargin: number;
};

export type DashboardAlertSeverity = "critical" | "warning" | "info";

export type DashboardAlert = {
  id: string;
  title: string;
  description: string;
  count: number;
  severity: DashboardAlertSeverity;
  href: string;
};

export type DashboardActivityType =
  | "sale"
  | "customer"
  | "order"
  | "return"
  | "refund";

export type DashboardActivity = {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  timestamp: string;
  href: string;
};

export type DashboardData = {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  grossProfit: number;
  cashSurplus: number;

  revenueChange: number;
  expenseChange: number;
  profitChange: number;
  grossProfitChange: number;

  revenueTrend: RevenuePoint[];
  purchaseTrend: PurchaseTrendPoint[];
  salesVsExpenses: SalesExpensePoint[];
  salesByCategory: SalesCategoryPoint[];
  paymentMethods: PaymentMethodPoint[];

  topProducts: DashboardProduct[];
  recentSales: RecentSale[];

  inventory: InventoryOverview;

  customerGrowth: CustomerGrowthPoint[];
  customerSources: CustomerSourcePoint[];

  expensesByCategory: ExpenseCategoryPoint[];
  profitability: ProfitabilityData;

  alerts: DashboardAlert[];
  recentActivity: DashboardActivity[];
};
