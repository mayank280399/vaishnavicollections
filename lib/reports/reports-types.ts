export type ReportTab =
  | "overview"
  | "sales"
  | "purchases"
  | "expenses"
  | "profit-loss"
  | "customers"
  | "loyalty";

export type DateRange = {
  from: string;
  to: string;
};

export type SalesReport = {
  totalSales: number;
  invoiceCount: number;
  averageSale: number;
  totalCost: number;
  grossProfit: number;
  rewardDiscount: number;
  salesByPayment: {
    payment: string;
    amount: number;
  }[];
  salesByDay: {
    date: string;
    amount: number;
  }[];
  recentSales: {
    id: string;
    invoiceNumber: string;
    date: string;
    amount: number;
    paymentMethod: string;
    customerName: string;
  }[];
};

export type PurchaseReport = {
  totalPurchases: number;
  purchaseCount: number;
  averagePurchase: number;
  purchasesByDay: {
    date: string;
    amount: number;
  }[];
  recentPurchases: {
    id: string;
    invoiceNumber: string;
    supplierName: string;
    date: string;
    amount: number;
    paymentMethod: string;
    status: string;
  }[];
};

export type ExpenseReport = {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  expensesByCategory: {
    category: string;
    amount: number;
  }[];
  expensesByDay: {
    date: string;
    amount: number;
  }[];
  recentExpenses: {
    id: string;
    expenseNumber: string;
    category: string;
    description: string;
    date: string;
    amount: number;
    paymentMethod: string;
  }[];
};

export type CustomerReport = {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  totalCustomerSales: number;
  topCustomers: {
    id: string;
    name: string;
    orders: number;
    spent: number;
  }[];
};

export type LoyaltyReport = {
  loyaltyCustomers: number;
  stampsEarned: number;
  stampsRedeemed: number;
  outstandingStamps: number;
  rewardsRedeemed: number;
  loyaltySales: number;
};

export type ReportsData = {
  sales: SalesReport;
  purchases: PurchaseReport;
  expenses: ExpenseReport;
  customers: CustomerReport;
  loyalty: LoyaltyReport;
};