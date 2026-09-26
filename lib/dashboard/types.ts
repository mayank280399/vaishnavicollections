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

/* -------------------------------------------------------------------------- */
/* SALES                                                                       */
/* -------------------------------------------------------------------------- */

export type SalesCategoryPoint = {
  category: string;
  revenue: number;
};

export type PaymentMethodPoint = {
  method: string;
  amount: number;
};

/* -------------------------------------------------------------------------- */
/* INVENTORY                                                                   */
/* -------------------------------------------------------------------------- */

export type InventoryOverview = {
  totalProducts: number;
  unitsInStock: number;
  inventoryValue: number;
  lowStock: number;
  outOfStock: number;
};

/* -------------------------------------------------------------------------- */
/* CUSTOMERS                                                                   */
/* -------------------------------------------------------------------------- */

export type CustomerGrowthPoint = {
  period: string;
  customers: number;
};

export type CustomerSourcePoint = {
  source: string;
  customers: number;
};

/* -------------------------------------------------------------------------- */
/* EXPENSES                                                                    */
/* -------------------------------------------------------------------------- */

export type ExpenseCategoryPoint = {
  category: string;
  amount: number;
};

/* -------------------------------------------------------------------------- */
/* PROFITABILITY                                                               */
/* -------------------------------------------------------------------------- */

export type ProfitabilityData = {
  revenue: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  netMargin: number;
};

/* -------------------------------------------------------------------------- */
/* DASHBOARD DATA                                                              */
/* -------------------------------------------------------------------------- */

export type DashboardData = {
  /* ------------------------------ KPI CARDS ------------------------------ */

  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  grossProfit: number;
   cashSurplus: number;

  revenueChange: number;
  expenseChange: number;
  profitChange: number;
  grossProfitChange: number;

  /* ------------------------------ SALES ---------------------------------- */

  revenueTrend: RevenuePoint[];

  salesVsExpenses: SalesExpensePoint[];

  salesByCategory: SalesCategoryPoint[];

  paymentMethods: PaymentMethodPoint[];

  /* ------------------------------ PRODUCTS -------------------------------- */

  topProducts: DashboardProduct[];

  recentSales: RecentSale[];

  /* ------------------------------ INVENTORY ------------------------------- */

  inventory: InventoryOverview;

  /* ------------------------------ CUSTOMERS ------------------------------- */

  customerGrowth: CustomerGrowthPoint[];

  customerSources: CustomerSourcePoint[];

  /* ------------------------------ EXPENSES -------------------------------- */

  expensesByCategory: ExpenseCategoryPoint[];

  /* ------------------------------ PROFITABILITY --------------------------- */

  profitability: ProfitabilityData;
};