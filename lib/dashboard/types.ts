export type RevenuePoint = {
  date: string;
  revenue: number;
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

export type DashboardData = {
  // Main metrics
  totalSales: number;
  totalExpenses: number;
  grossProfit: number;
  profitLoss: number;

  // Percentage changes
  revenueChange: number;
  expenseChange: number;
  profitChange: number;
  grossProfitChange: number;

  // Charts
  revenueTrend: RevenuePoint[];
  salesVsExpenses: SalesExpensePoint[];

  // Other dashboard sections
  topProducts: DashboardProduct[];
  recentSales: RecentSale[];
};