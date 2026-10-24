
import { createClient } from "@/lib/supabase/server";

import type {
  DashboardData,
  RevenuePoint,
  PurchaseTrendPoint,
  SalesExpensePoint,
  DashboardProduct,
  RecentSale,
  SalesCategoryPoint,
  PaymentMethodPoint,
  InventoryOverview,
  CustomerGrowthPoint,
  CustomerSourcePoint,
  ExpenseCategoryPoint,
  ProfitabilityData,
  DashboardAlert,
  DashboardActivity,
} from "./types";

export type DashboardRange =
  | "today"
  | "week"
  | "month"
  | "year"
  | "all"
  | "custom";

export type DashboardFilters = {
  range?: DashboardRange;
  start?: string;
  end?: string;
};

type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function toNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateRange(filters: DashboardFilters): DateRange {
  const range = filters.range ?? "month";
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  switch (range) {
    case "today":
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };

    case "week": {
      const day = today.getDay();
      const daysFromMonday = day === 0 ? 6 : day - 1;

      const start = new Date(today);
      start.setDate(today.getDate() - daysFromMonday);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
      };
    }

    case "month": {
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );

      const end = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      );

      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
      };
    }

    case "year": {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);

      return {
        startDate: formatDate(start),
        endDate: formatDate(end),
      };
    }

    case "custom":
      return {
        startDate: filters.start ?? null,
        endDate: filters.end ?? null,
      };

    case "all":
      return {
        startDate: null,
        endDate: null,
      };

    default:
      return {
        startDate: formatDate(
          new Date(today.getFullYear(), today.getMonth(), 1),
        ),
        endDate: formatDate(today),
      };
  }
}

function applyDateRange<
  T extends {
    gte: Function;
    lte: Function;
  },
>(
  query: T,
  column: string,
  range: DateRange,
) {
  let result = query;

  if (range.startDate) {
    result = result.gte(column, range.startDate);
  }

  if (range.endDate) {
    result = result.lte(
      column,
      `${range.endDate}T23:59:59`,
    );
  }

  return result;
}

function formatPeriodLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatMonthLabel(month: string): string {
  const parsed = new Date(`${month}-01T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return month;
  }

  return parsed.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: unknown): string {
  return String(status ?? "UNKNOWN")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isClosedStatus(status: unknown): boolean {
  return [
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ].includes(String(status ?? "").toUpperCase());
}

/**
 * Builds chart buckets from the already-filtered purchase records.
 * Short periods use daily buckets; year/all-time and long custom periods
 * use monthly buckets.
 */
function buildPurchaseTrend(
  purchases: Array<{
    total_amount: number | string | null;
    purchased_at: string | null;
  }>,
  filters: DashboardFilters,
  range: DateRange,
): PurchaseTrendPoint[] {
  const datedPurchases = purchases
    .map((purchase) => ({
      date: String(purchase.purchased_at ?? "").slice(0, 10),
      amount: toNumber(purchase.total_amount),
    }))
    .filter(
      (purchase) =>
        /^\d{4}-\d{2}-\d{2}$/.test(purchase.date) &&
        !Number.isNaN(
          new Date(`${purchase.date}T00:00:00`).getTime(),
        ),
    );

  if (datedPurchases.length === 0) {
    return [];
  }

  const today = formatDate(new Date());

  const earliestPurchase = datedPurchases
    .map((purchase) => purchase.date)
    .sort()[0];

  const latestPurchase = datedPurchases
    .map((purchase) => purchase.date)
    .sort()
    .at(-1)!;

  const startDate = range.startDate ?? earliestPurchase;
  const requestedEndDate = range.endDate ?? latestPurchase;
  const endDate = requestedEndDate > today ? today : requestedEndDate;

  if (startDate > endDate) {
    return [];
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days = Math.floor(
    (end.getTime() - start.getTime()) / 86400000,
  );

  const useMonthlyBuckets =
    filters.range === "year" ||
    filters.range === "all" ||
    (filters.range === "custom" && days > 60);

  const amounts = new Map<string, number>();

  for (const purchase of datedPurchases) {
    const key = useMonthlyBuckets
      ? purchase.date.slice(0, 7)
      : purchase.date;

    amounts.set(
      key,
      (amounts.get(key) ?? 0) + purchase.amount,
    );
  }

  const result: PurchaseTrendPoint[] = [];

  if (useMonthlyBuckets) {
    const cursor = new Date(
      start.getFullYear(),
      start.getMonth(),
      1,
    );

    const lastMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      1,
    );

    while (cursor <= lastMonth) {
      const month = `${cursor.getFullYear()}-${String(
        cursor.getMonth() + 1,
      ).padStart(2, "0")}`;

      result.push({
        period: formatMonthLabel(month),
        amount: amounts.get(month) ?? 0,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    const cursor = new Date(start);

    while (cursor <= end) {
      const date = formatDate(cursor);

      result.push({
        period: formatPeriodLabel(date),
        amount: amounts.get(date) ?? 0,
      });

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* MAIN DASHBOARD QUERY                                                       */
/* -------------------------------------------------------------------------- */

export async function getDashboardData(
  filters: DashboardFilters = {},
): Promise<DashboardData> {
  const supabase = await createClient();
  const range = getDateRange(filters);

  /* SALES */

  let salesQuery = supabase
    .from("sales")
    .select(`
      id,
      invoice_number,
      customer_id,
      total_amount,
      cost_amount,
      gross_profit,
      payment_method,
      status,
      purchased_at
    `)
    .eq("status", "COMPLETED")
    .order("purchased_at", { ascending: false });

  salesQuery = applyDateRange(
    salesQuery,
    "purchased_at",
    range,
  ) as typeof salesQuery;

  /* EXPENSES */

  let expensesQuery = supabase
    .from("expenses")
    .select(`
      id,
      amount,
      category,
      description,
      expense_date,
      created_at
    `)
    .order("expense_date", { ascending: false });

  expensesQuery = applyDateRange(
    expensesQuery,
    "expense_date",
    range,
  ) as typeof expensesQuery;

  /* PURCHASES */

  let purchasesQuery = supabase
    .from("purchases")
    .select(`
      id,
      total_amount,
      purchased_at,
      status
    `)
    .in("status", ["RECEIVED", "COMPLETED"])
    .order("purchased_at", { ascending: false });

  purchasesQuery = applyDateRange(
    purchasesQuery,
    "purchased_at",
    range,
  ) as typeof purchasesQuery;

  /* CUSTOMERS: FILTERED */

  let customersQuery = supabase
    .from("customers")
    .select("id, source, created_at")
    .order("created_at", { ascending: true });

  customersQuery = applyDateRange(
    customersQuery,
    "created_at",
    range,
  ) as typeof customersQuery;

  /* CUSTOMERS: RECENT ACTIVITY */

  const recentCustomersQuery = supabase
    .from("customers")
    .select("id, display_name, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  /* PRODUCTS / INVENTORY */

  const productsQuery = supabase
    .from("products")
    .select(`
      id,
      name,
      stock_quantity,
      cost_price,
      selling_price,
      product_categories (
        id,
        name
      )
    `);

  /* SALE ITEMS */

  const saleItemsQuery = supabase
    .from("sale_items")
    .select(`
      id,
      sale_id,
      product_id,
      quantity,
      unit_price,
      products (
        id,
        name,
        product_categories (
          id,
          name
        )
      )
    `);

  /* ORDERS */

  const pendingOrdersQuery = supabase
    .from("orders")
    .select("id, order_number, total_amount, created_at, status")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  const recentOrdersQuery = supabase
    .from("orders")
    .select("id, order_number, status, total_amount, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  /* RETURNS AND REFUNDS */

  const returnRequestsQuery = supabase
    .from("return_requests")
    .select("id, order_id, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  const refundsQuery = supabase
    .from("refunds")
    .select("id, order_id, status, amount, created_at, updated_at")
    .order("updated_at", { ascending: false });

  /* EXECUTE QUERIES */

  const [
    salesResult,
    expensesResult,
    purchasesResult,
    customersResult,
    recentCustomersResult,
    productsResult,
    saleItemsResult,
    pendingOrdersResult,
    recentOrdersResult,
    returnRequestsResult,
    refundsResult,
  ] = await Promise.all([
    salesQuery,
    expensesQuery,
    purchasesQuery,
    customersQuery,
    recentCustomersQuery,
    productsQuery,
    saleItemsQuery,
    pendingOrdersQuery,
    recentOrdersQuery,
    returnRequestsQuery,
    refundsQuery,
  ]);

  /* ERROR HANDLING */

  if (salesResult.error) {
    throw new Error(`Failed to load sales: ${salesResult.error.message}`);
  }

  if (expensesResult.error) {
    throw new Error(`Failed to load expenses: ${expensesResult.error.message}`);
  }

  if (purchasesResult.error) {
    throw new Error(`Failed to load purchases: ${purchasesResult.error.message}`);
  }

  if (customersResult.error) {
    throw new Error(`Failed to load customers: ${customersResult.error.message}`);
  }

  if (recentCustomersResult.error) {
    throw new Error(
      `Failed to load recent customers: ${recentCustomersResult.error.message}`,
    );
  }

  if (productsResult.error) {
    throw new Error(`Failed to load products: ${productsResult.error.message}`);
  }

  if (saleItemsResult.error) {
    throw new Error(
      `Failed to load sale items: ${saleItemsResult.error.message}`,
    );
  }

  if (pendingOrdersResult.error) {
    throw new Error(
      `Failed to load pending orders: ${pendingOrdersResult.error.message}`,
    );
  }

  if (recentOrdersResult.error) {
    throw new Error(
      `Failed to load recent orders: ${recentOrdersResult.error.message}`,
    );
  }

  if (returnRequestsResult.error) {
    throw new Error(
      `Failed to load return requests: ${returnRequestsResult.error.message}`,
    );
  }

  if (refundsResult.error) {
    throw new Error(
      `Failed to load refunds: ${refundsResult.error.message}`,
    );
  }

  const sales = salesResult.data ?? [];
  const expenses = expensesResult.data ?? [];
  const purchases = purchasesResult.data ?? [];
  const customers = customersResult.data ?? [];
  const recentCustomers = recentCustomersResult.data ?? [];
  const products = productsResult.data ?? [];
  const saleItems = saleItemsResult.data ?? [];
  const pendingOrders = pendingOrdersResult.data ?? [];
  const recentOrders = recentOrdersResult.data ?? [];
  const returnRequests = returnRequestsResult.data ?? [];
  const refunds = refundsResult.data ?? [];

  /* KPI VALUES */

  const totalSales = sales.reduce(
    (sum, sale) => sum + toNumber(sale.total_amount),
    0,
  );

  const totalPurchases = purchases.reduce(
    (sum, purchase) => sum + toNumber(purchase.total_amount),
    0,
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + toNumber(expense.amount),
    0,
  );

  const grossProfit = sales.reduce(
    (sum, sale) => sum + toNumber(sale.gross_profit),
    0,
  );

  const cashSurplus = totalSales - totalPurchases - totalExpenses;

  const revenueChange = 0;
  const expenseChange = 0;
  const profitChange = 0;
  const grossProfitChange = 0;

  /* REVENUE TREND */

  const revenueMap = new Map<string, number>();

  for (const sale of sales) {
    const date = String(sale.purchased_at).slice(0, 10);

    revenueMap.set(
      date,
      (revenueMap.get(date) ?? 0) + toNumber(sale.total_amount),
    );
  }

  const revenueTrend: RevenuePoint[] = [];
  const saleDates = Array.from(revenueMap.keys()).sort();

  if (saleDates.length > 0) {
    const startDate = range.startDate ?? saleDates[0];
    const today = formatDate(new Date());
    const selectedEndDate =
      range.endDate ?? saleDates[saleDates.length - 1];
    const endDate = selectedEndDate > today ? today : selectedEndDate;

    const cursor = new Date(`${startDate}T00:00:00`);
    const lastDate = new Date(`${endDate}T00:00:00`);

    while (cursor <= lastDate) {
      const date = formatDate(cursor);

      revenueTrend.push({
        date,
        revenue: revenueMap.get(date) ?? 0,
      });

      cursor.setDate(cursor.getDate() + 1);
    }
  }

  /* PURCHASE TREND */

  const purchaseTrend: PurchaseTrendPoint[] = buildPurchaseTrend(
    purchases.map((purchase) => ({
      total_amount: purchase.total_amount,
      purchased_at: purchase.purchased_at,
    })),
    filters,
    range,
  );

  /* SALES VS EXPENSES */

  const salesExpenseMap = new Map<
    string,
    { sales: number; expenses: number }
  >();

  for (const sale of sales) {
    const date = String(sale.purchased_at).slice(0, 10);
    const existing = salesExpenseMap.get(date) ?? {
      sales: 0,
      expenses: 0,
    };

    existing.sales += toNumber(sale.total_amount);
    salesExpenseMap.set(date, existing);
  }

  for (const expense of expenses) {
    const date = String(
      expense.expense_date ?? expense.created_at,
    ).slice(0, 10);

    const existing = salesExpenseMap.get(date) ?? {
      sales: 0,
      expenses: 0,
    };

    existing.expenses += toNumber(expense.amount);
    salesExpenseMap.set(date, existing);
  }

  const salesVsExpenses: SalesExpensePoint[] = Array.from(
    salesExpenseMap.entries(),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, values]) => ({
      period: formatPeriodLabel(period),
      sales: values.sales,
      expenses: values.expenses,
    }));

  /* FILTERED SALES IDS */

  const filteredSaleIds = new Set(sales.map((sale) => sale.id));

  /* SALES BY CATEGORY */

  const salesByCategoryMap = new Map<string, number>();

  for (const item of saleItems) {
    if (!filteredSaleIds.has(item.sale_id)) continue;

    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    if (!product) continue;

    const category = Array.isArray(product.product_categories)
      ? product.product_categories[0]
      : product.product_categories;

    const categoryName = category?.name ?? "Uncategorized";
    const amount = toNumber(item.quantity) * toNumber(item.unit_price);

    salesByCategoryMap.set(
      categoryName,
      (salesByCategoryMap.get(categoryName) ?? 0) + amount,
    );
  }

  const salesByCategory: SalesCategoryPoint[] = Array.from(
    salesByCategoryMap.entries(),
  )
    .sort(([, a], [, b]) => b - a)
    .map(([category, revenue]) => ({ category, revenue }));

  /* PAYMENT METHODS */

  const paymentMethodMap = new Map<string, number>();

  for (const sale of sales) {
    const method = sale.payment_method ?? "OTHER";

    paymentMethodMap.set(
      method,
      (paymentMethodMap.get(method) ?? 0) + toNumber(sale.total_amount),
    );
  }

  const paymentMethods: PaymentMethodPoint[] = Array.from(
    paymentMethodMap.entries(),
  )
    .sort(([, a], [, b]) => b - a)
    .map(([method, amount]) => ({ method, amount }));

  /* TOP PRODUCTS */

  const productMap = new Map<string, DashboardProduct>();

  for (const item of saleItems) {
    if (!filteredSaleIds.has(item.sale_id)) continue;

    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    if (!product) continue;

    const productId = product.id;

    const existing = productMap.get(productId) ?? {
      productId,
      productName: product.name ?? "Unknown Product",
      revenue: 0,
      quantity: 0,
    };

    const revenue = toNumber(item.quantity) * toNumber(item.unit_price);

    existing.revenue += revenue;
    existing.quantity += toNumber(item.quantity);

    productMap.set(productId, existing);
  }

  const topProducts: DashboardProduct[] = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  /* RECENT SALES */

  const recentSales: RecentSale[] = sales.slice(0, 10).map((sale) => ({
    id: sale.id,
    invoiceNumber: sale.invoice_number ?? "N/A",
    amount: toNumber(sale.total_amount),
    profit: toNumber(sale.gross_profit),
    purchasedAt: sale.purchased_at,
    paymentMethod: sale.payment_method ?? "OTHER",
  }));

  /* INVENTORY */

  const totalProducts = products.length;

  const unitsInStock = products.reduce(
    (sum, product) =>
      sum + Math.max(0, toNumber(product.stock_quantity)),
    0,
  );

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum +
      Math.max(0, toNumber(product.stock_quantity)) *
        toNumber(product.cost_price),
    0,
  );

  const lowStock = products.filter((product) => {
    const stock = toNumber(product.stock_quantity);
    return stock > 0 && stock <= 5;
  }).length;

  const outOfStock = products.filter(
    (product) => toNumber(product.stock_quantity) <= 0,
  ).length;

  const inventory: InventoryOverview = {
    totalProducts,
    unitsInStock,
    inventoryValue,
    lowStock,
    outOfStock,
  };

  /* CUSTOMER GROWTH */

  const customerGrowthMap = new Map<string, number>();

  for (const customer of customers) {
    const createdDate = String(customer.created_at).slice(0, 10);
    const period =
      filters.range === "year" ? createdDate.slice(0, 7) : createdDate;

    customerGrowthMap.set(
      period,
      (customerGrowthMap.get(period) ?? 0) + 1,
    );
  }

  const customerGrowth: CustomerGrowthPoint[] = Array.from(
    customerGrowthMap.entries(),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, count]) => ({
      period:
        filters.range === "year"
          ? formatMonthLabel(period)
          : formatPeriodLabel(period),
      customers: count,
    }));

  /* CUSTOMER SOURCES */

  const customerSourceMap = new Map<string, number>();

  for (const customer of customers) {
    const source = customer.source ?? "OTHER";

    customerSourceMap.set(
      source,
      (customerSourceMap.get(source) ?? 0) + 1,
    );
  }

  const customerSources: CustomerSourcePoint[] = Array.from(
    customerSourceMap.entries(),
  )
    .sort(([, a], [, b]) => b - a)
    .map(([source, count]) => ({
      source,
      customers: count,
    }));

  /* EXPENSES BY CATEGORY */

  const expenseCategoryMap = new Map<string, number>();

  for (const expense of expenses) {
    const category = expense.category ?? "Other";

    expenseCategoryMap.set(
      category,
      (expenseCategoryMap.get(category) ?? 0) +
        toNumber(expense.amount),
    );
  }

  const expensesByCategory: ExpenseCategoryPoint[] = Array.from(
    expenseCategoryMap.entries(),
  )
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({ category, amount }));

  /* PROFITABILITY */

  const netProfit = cashSurplus;
  const netMargin =
    totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  const profitability: ProfitabilityData = {
    revenue: totalSales,
    grossProfit,
    expenses: totalExpenses,
    netProfit,
    netMargin,
  };

  /* ACTION REQUIRED ALERTS */

  const actionableReturns = returnRequests.filter(
    (item) => !isClosedStatus(item.status),
  );

  const actionableRefunds = refunds.filter(
    (item) => !isClosedStatus(item.status),
  );

  const alerts: DashboardAlert[] = [];

  if (outOfStock > 0) {
    alerts.push({
      id: "inventory-out-of-stock",
      title: "Out of stock",
      description: "Products need inventory replenishment.",
      count: outOfStock,
      severity: "critical",
      href: "/products",
    });
  }

  if (lowStock > 0) {
    alerts.push({
      id: "inventory-low-stock",
      title: "Low stock",
      description: "Products have five or fewer units remaining.",
      count: lowStock,
      severity: "warning",
      href: "/products",
    });
  }

  if (pendingOrders.length > 0) {
    alerts.push({
      id: "pending-orders",
      title: "Pending orders",
      description: "Orders need review.",
      count: pendingOrders.length,
      severity: "warning",
      href: "/admin/orders",
    });
  }

  if (actionableReturns.length > 0) {
    alerts.push({
      id: "actionable-returns",
      title: "Returns requiring attention",
      description:
        "Return requests are not completed, cancelled, or refunded.",
      count: actionableReturns.length,
      severity: "warning",
      href: "/admin/orders/returns",
    });
  }

  if (actionableRefunds.length > 0) {
    alerts.push({
      id: "actionable-refunds",
      title: "Refunds requiring attention",
      description: "Refunds are not yet completed or cancelled.",
      count: actionableRefunds.length,
      severity: "warning",
      href: "/admin/orders/returns",
    });
  }

  /* RECENT ACTIVITY */

  const recentActivity: DashboardActivity[] = [];

  for (const sale of sales.slice(0, 10)) {
    recentActivity.push({
      id: sale.id,
      type: "sale",
      title: "Sale completed",
      description: `Invoice ${sale.invoice_number ?? "N/A"} · ₹${toNumber(sale.total_amount).toLocaleString("en-IN")}`,
      timestamp: sale.purchased_at,
      href: "/sales",
    });
  }

  for (const customer of recentCustomers) {
    recentActivity.push({
      id: customer.id,
      type: "customer",
      title: "Customer registered",
      description: customer.display_name
        ? String(customer.display_name)
        : "A new customer was added.",
      timestamp: customer.created_at,
      href: "/customers",
    });
  }

  for (const order of recentOrders) {
    recentActivity.push({
      id: order.id,
      type: "order",
      title: `Order ${statusLabel(order.status)}`,
      description: `${order.order_number ?? "Order"} · ₹${toNumber(order.total_amount).toLocaleString("en-IN")}`,
      timestamp: order.created_at,
      href: "/admin/orders",
    });
  }

  for (const item of returnRequests.slice(0, 10)) {
    recentActivity.push({
      id: item.id,
      type: "return",
      title: `Return ${statusLabel(item.status)}`,
      description: `Return request for order ${item.order_id}`,
      timestamp: item.updated_at ?? item.created_at,
      href: "/admin/orders/returns",
    });
  }

  for (const item of refunds.slice(0, 10)) {
    recentActivity.push({
      id: item.id,
      type: "refund",
      title: `Refund ${statusLabel(item.status)}`,
      description: `₹${toNumber(item.amount).toLocaleString("en-IN")} · Order ${item.order_id}`,
      timestamp: item.updated_at ?? item.created_at,
      href: "/admin/orders/returns",
    });
  }

  recentActivity.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime(),
  );

  /* FINAL RESULT */

  return {
    totalSales,
    totalPurchases,
    totalExpenses,
    grossProfit,
    cashSurplus,
    revenueChange,
    expenseChange,
    profitChange,
    grossProfitChange,
    revenueTrend,
    purchaseTrend,
    salesVsExpenses,
    salesByCategory,
    paymentMethods,
    topProducts,
    recentSales,
    inventory,
    customerGrowth,
    customerSources,
    expensesByCategory,
    profitability,
    alerts,
    recentActivity: recentActivity.slice(0, 10),
  };
}
