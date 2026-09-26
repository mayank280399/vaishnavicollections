import { createClient } from "@/lib/supabase/server";

import type {
  DashboardData,
  RevenuePoint,
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
      // Monday -> Sunday
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
      const start = new Date(
        today.getFullYear(),
        0,
        1,
      );

      const end = new Date(
        today.getFullYear(),
        11,
        31,
      );

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
          new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
          ),
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
    result = result.gte(
      column,
      range.startDate,
    );
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
  const parsed = new Date(
    `${date}T00:00:00`,
  );

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function formatMonthLabel(month: string): string {
  const parsed = new Date(
    `${month}-01T00:00:00`,
  );

  if (Number.isNaN(parsed.getTime())) {
    return month;
  }

  return parsed.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/* MAIN DASHBOARD QUERY                                                       */
/* -------------------------------------------------------------------------- */

export async function getDashboardData(
  filters: DashboardFilters = {},
): Promise<DashboardData> {
  const supabase = await createClient();

  const range = getDateRange(filters);

  /* ------------------------------------------------------------------------ */
  /* SALES                                                                     */
  /* ------------------------------------------------------------------------ */

  let salesQuery = supabase
    .from("sales")
    .select(
      `
        id,
        invoice_number,
        customer_id,
        total_amount,
        cost_amount,
        gross_profit,
        payment_method,
        status,
        purchased_at
      `,
    )
    .eq("status", "COMPLETED")
    .order("purchased_at", {
      ascending: false,
    });

  salesQuery = applyDateRange(
    salesQuery,
    "purchased_at",
    range,
  ) as typeof salesQuery;

  /* ------------------------------------------------------------------------ */
  /* EXPENSES                                                                  */
  /* ------------------------------------------------------------------------ */

  let expensesQuery = supabase
    .from("expenses")
    .select(
      `
        id,
        amount,
        category,
        description,
        expense_date,
        created_at
      `,
    )
    .order("expense_date", {
      ascending: false,
    });

  expensesQuery = applyDateRange(
    expensesQuery,
    "expense_date",
    range,
  ) as typeof expensesQuery;

  /* ------------------------------------------------------------------------ */
  /* PURCHASES                                                                 */
  /* ------------------------------------------------------------------------ */

  let purchasesQuery = supabase
    .from("purchases")
    .select(
      `
        id,
        total_amount,
        purchased_at,
        status
      `,
    )
     .in("status", ["RECEIVED", "COMPLETED"])
    .order("purchased_at", {
      ascending: false,
    });

  purchasesQuery = applyDateRange(
    purchasesQuery,
    "purchased_at",
    range,
  ) as typeof purchasesQuery;

  /* ------------------------------------------------------------------------ */
  /* CUSTOMERS                                                                 */
  /* ------------------------------------------------------------------------ */

  let customersQuery = supabase
    .from("customers")
    .select(
      `
        id,
        source,
        created_at
      `,
    )
    .order("created_at", {
      ascending: true,
    });

  /*
   * Customer data is date based, so it must follow the dashboard filter too.
   */
  customersQuery = applyDateRange(
    customersQuery,
    "created_at",
    range,
  ) as typeof customersQuery;

  /* ------------------------------------------------------------------------ */
  /* PRODUCTS / INVENTORY                                                      */
  /* ------------------------------------------------------------------------ */

  /*
   * Inventory is intentionally NOT date filtered.
   *
   * products.stock_quantity represents the CURRENT inventory snapshot.
   * A historical inventory value would require inventory movement/history
   * records. Filtering products by a sales date would produce incorrect
   * inventory numbers.
   */
const productsQuery = supabase
  .from("products")
  .select(
    `
      id,
      name,
      stock_quantity,
      cost_price,
      selling_price,
      product_categories (
        id,
        name
      )
    `,
  );

  /* ------------------------------------------------------------------------ */
  /* SALE ITEMS                                                                */
  /* ------------------------------------------------------------------------ */

  /*
   * sale_items themselves don't need a separate date filter.
   *
   * They are restricted using the IDs of the already date-filtered sales.
   */
  const saleItemsQuery = supabase
  .from("sale_items")
  .select(
    `
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
    `,
  );

  /* ------------------------------------------------------------------------ */
  /* EXECUTE QUERIES                                                           */
  /* ------------------------------------------------------------------------ */

  const [
    salesResult,
    expensesResult,
    purchasesResult,
    customersResult,
    productsResult,
    saleItemsResult,
  ] = await Promise.all([
    salesQuery,
    expensesQuery,
    purchasesQuery,
    customersQuery,
    productsQuery,
    saleItemsQuery,
  ]);

  /* ------------------------------------------------------------------------ */
  /* ERROR HANDLING                                                            */
  /* ------------------------------------------------------------------------ */

  if (salesResult.error) {
    throw new Error(
      `Failed to load sales: ${salesResult.error.message}`,
    );
  }

  if (expensesResult.error) {
    throw new Error(
      `Failed to load expenses: ${expensesResult.error.message}`,
    );
  }

  if (purchasesResult.error) {
    throw new Error(
      `Failed to load purchases: ${purchasesResult.error.message}`,
    );
  }

  if (customersResult.error) {
    throw new Error(
      `Failed to load customers: ${customersResult.error.message}`,
    );
  }

  if (productsResult.error) {
    throw new Error(
      `Failed to load products: ${productsResult.error.message}`,
    );
  }

  if (saleItemsResult.error) {
    throw new Error(
      `Failed to load sale items: ${saleItemsResult.error.message}`,
    );
  }

  const sales = salesResult.data ?? [];
  const expenses = expensesResult.data ?? [];
  const purchases = purchasesResult.data ?? [];
  const customers = customersResult.data ?? [];
  const products = productsResult.data ?? [];
  const saleItems = saleItemsResult.data ?? [];
  
console.log(
  "Dashboard sales:",
  sales.length,
);

console.log(
  "Dashboard sale items:",
  saleItems,
);


  /* ------------------------------------------------------------------------ */
  /* KPI VALUES                                                                */
  /* ------------------------------------------------------------------------ */

  const totalSales = sales.reduce(
    (sum, sale) =>
      sum + toNumber(sale.total_amount),
    0,
  );

  const totalPurchases = purchases.reduce(
    (sum, purchase) =>
      sum + toNumber(purchase.total_amount),
    0,
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) =>
      sum + toNumber(expense.amount),
    0,
  );

  const grossProfit = sales.reduce(
    (sum, sale) =>
      sum + toNumber(sale.gross_profit),
    0,
  );

  const cashSurplus =
  totalSales - totalPurchases - totalExpenses;

  /*
   * These are currently placeholders.
   * We can calculate period-over-period changes separately after the
   * filtered dashboard is working correctly.
   */
  const revenueChange = 0;
  const expenseChange = 0;
  const profitChange = 0;
  const grossProfitChange = 0;

  /* ------------------------------------------------------------------------ */
  /* REVENUE TREND                                                             */
  /* ------------------------------------------------------------------------ */

  const revenueMap = new Map<
    string,
    number
  >();

  for (const sale of sales) {
    const date = String(
      sale.purchased_at,
    ).slice(0, 10);

    revenueMap.set(
      date,
      (revenueMap.get(date) ?? 0) +
        toNumber(sale.total_amount),
    );
  }

  const revenueTrend: RevenuePoint[] =
    Array.from(revenueMap.entries())
      .sort(([a], [b]) =>
        a.localeCompare(b),
      )
      .map(([date, revenue]) => ({
        date,
        revenue,
      }));

  /* ------------------------------------------------------------------------ */
  /* SALES VS EXPENSES                                                         */
  /* ------------------------------------------------------------------------ */

  const salesExpenseMap = new Map<
    string,
    {
      sales: number;
      expenses: number;
    }
  >();

  for (const sale of sales) {
    const date = String(
      sale.purchased_at,
    ).slice(0, 10);

    const existing =
      salesExpenseMap.get(date) ?? {
        sales: 0,
        expenses: 0,
      };

    existing.sales += toNumber(
      sale.total_amount,
    );

    salesExpenseMap.set(
      date,
      existing,
    );
  }

  for (const expense of expenses) {
    const date = String(
      expense.expense_date ??
        expense.created_at,
    ).slice(0, 10);

    const existing =
      salesExpenseMap.get(date) ?? {
        sales: 0,
        expenses: 0,
      };

    existing.expenses += toNumber(
      expense.amount,
    );

    salesExpenseMap.set(
      date,
      existing,
    );
  }

  const salesVsExpenses: SalesExpensePoint[] =
    Array.from(
      salesExpenseMap.entries(),
    )
      .sort(([a], [b]) =>
        a.localeCompare(b),
      )
      .map(([period, values]) => ({
        period: formatPeriodLabel(period),
        sales: values.sales,
        expenses: values.expenses,
      }));

  /* ------------------------------------------------------------------------ */
  /* SALES BY CATEGORY                                                         */
  /* ------------------------------------------------------------------------ */

  const salesByCategoryMap = new Map<
    string,
    number
  >();

  const filteredSaleIds = new Set(
    sales.map((sale) => sale.id),
  );

  for (const item of saleItems) {
    if (!filteredSaleIds.has(item.sale_id)) {
      continue;
    }

    const product = Array.isArray(
      item.products,
    )
      ? item.products[0]
      : item.products;

    if (!product) {
      continue;
    }

    const category = Array.isArray(
      product.product_categories,
    )
      ? product.product_categories[0]
      : product.product_categories;

    const categoryName =
      category?.name ??
      "Uncategorized";

    const amount =
  toNumber(item.quantity) *
  toNumber(item.unit_price);
          

    salesByCategoryMap.set(
      categoryName,
      (salesByCategoryMap.get(
        categoryName,
      ) ?? 0) + amount,
    );
  }

  const salesByCategory: SalesCategoryPoint[] =
    Array.from(
      salesByCategoryMap.entries(),
    )
      .sort(([, a], [, b]) => b - a)
      .map(([category, revenue]) => ({
        category,
        revenue,
      }));

  /* ------------------------------------------------------------------------ */
  /* PAYMENT METHODS                                                           */
  /* ------------------------------------------------------------------------ */

  const paymentMethodMap = new Map<
    string,
    number
  >();

  for (const sale of sales) {
    const method =
      sale.payment_method ?? "OTHER";

    paymentMethodMap.set(
      method,
      (paymentMethodMap.get(method) ?? 0) +
        toNumber(sale.total_amount),
    );
  }

  const paymentMethods: PaymentMethodPoint[] =
    Array.from(
      paymentMethodMap.entries(),
    )
      .sort(([, a], [, b]) => b - a)
      .map(([method, amount]) => ({
        method,
        amount,
      }));

  /* ------------------------------------------------------------------------ */
  /* TOP PRODUCTS                                                              */
  /* ------------------------------------------------------------------------ */

  const productMap = new Map<
    string,
    DashboardProduct
  >();

  for (const item of saleItems) {
    if (!filteredSaleIds.has(item.sale_id)) {
      continue;
    }

    const product = Array.isArray(
      item.products,
    )
      ? item.products[0]
      : item.products;

    if (!product) {
      continue;
    }

    const productId = product.id;

    const existing =
      productMap.get(productId) ?? {
        productId,
        productName:
          product.name ??
          "Unknown Product",
        revenue: 0,
        quantity: 0,
      };

  const revenue =
  toNumber(item.quantity) *
  toNumber(item.unit_price);

    existing.revenue += revenue;

    existing.quantity += toNumber(
      item.quantity,
    );

    productMap.set(
      productId,
      existing,
    );
  }

  const topProducts: DashboardProduct[] =
    Array.from(productMap.values())
      .sort(
        (a, b) =>
          b.revenue - a.revenue,
      )
      .slice(0, 10);

  /* ------------------------------------------------------------------------ */
  /* RECENT SALES                                                              */
  /* ------------------------------------------------------------------------ */

  const recentSales: RecentSale[] =
    sales.slice(0, 10).map((sale) => ({
      id: sale.id,
      invoiceNumber:
        sale.invoice_number ?? "N/A",
      amount: toNumber(
        sale.total_amount,
      ),
      profit: toNumber(
        sale.gross_profit,
      ),
      purchasedAt:
        sale.purchased_at,
      paymentMethod:
        sale.payment_method ??
        "OTHER",
    }));

  /* ------------------------------------------------------------------------ */
  /* INVENTORY                                                                 */
  /* ------------------------------------------------------------------------ */

  const totalProducts =
    products.length;

  const unitsInStock = products.reduce(
    (sum, product) =>
      sum +
      Math.max(
        0,
        toNumber(
          product.stock_quantity,
        ),
      ),
    0,
  );

  const inventoryValue =
    products.reduce(
      (sum, product) =>
        sum +
        Math.max(
          0,
          toNumber(
            product.stock_quantity,
          ),
        ) *
          toNumber(
            product.cost_price,
          ),
      0,
    );

  const lowStock = products.filter(
    (product) => {
      const stock = toNumber(
        product.stock_quantity,
      );

      return (
        stock > 0 &&
        stock <= 5
      );
    },
  ).length;

  const outOfStock =
    products.filter(
      (product) =>
        toNumber(
          product.stock_quantity,
        ) <= 0,
    ).length;

  const inventory: InventoryOverview = {
    totalProducts,
    unitsInStock,
    inventoryValue,
    lowStock,
    outOfStock,
  };

  /* ------------------------------------------------------------------------ */
  /* CUSTOMER GROWTH                                                           */
  /* ------------------------------------------------------------------------ */

  const customerGrowthMap =
    new Map<string, number>();

  for (const customer of customers) {
    const createdDate = String(
      customer.created_at,
    ).slice(0, 10);

    let period = createdDate;

    if (
      filters.range === "year"
    ) {
      period =
        createdDate.slice(0, 7);
    }

    customerGrowthMap.set(
      period,
      (customerGrowthMap.get(
        period,
      ) ?? 0) + 1,
    );
  }

  const customerGrowth: CustomerGrowthPoint[] =
    Array.from(
      customerGrowthMap.entries(),
    )
      .sort(([a], [b]) =>
        a.localeCompare(b),
      )
      .map(
        ([period, customers]) => ({
          period:
            filters.range === "year"
              ? formatMonthLabel(
                  period,
                )
              : formatPeriodLabel(
                  period,
                ),
          customers,
        }),
      );

  /* ------------------------------------------------------------------------ */
  /* CUSTOMER SOURCES                                                          */
  /* ------------------------------------------------------------------------ */

  const customerSourceMap =
    new Map<string, number>();

  for (const customer of customers) {
    const source =
      customer.source ?? "OTHER";

    customerSourceMap.set(
      source,
      (customerSourceMap.get(
        source,
      ) ?? 0) + 1,
    );
  }

  const customerSources: CustomerSourcePoint[] =
    Array.from(
      customerSourceMap.entries(),
    )
      .sort(([, a], [, b]) => b - a)
      .map(
        ([source, customers]) => ({
          source,
          customers,
        }),
      );

  /* ------------------------------------------------------------------------ */
  /* EXPENSES BY CATEGORY                                                      */
  /* ------------------------------------------------------------------------ */

  const expenseCategoryMap =
    new Map<string, number>();

  for (const expense of expenses) {
    const category =
      expense.category ?? "Other";

    expenseCategoryMap.set(
      category,
      (expenseCategoryMap.get(
        category,
      ) ?? 0) +
        toNumber(expense.amount),
    );
  }

  const expensesByCategory: ExpenseCategoryPoint[] =
    Array.from(
      expenseCategoryMap.entries(),
    )
      .sort(([, a], [, b]) => b - a)
      .map(
        ([category, amount]) => ({
          category,
          amount,
        }),
      );

  /* ------------------------------------------------------------------------ */
  /* PROFITABILITY                                                             */
  /* ------------------------------------------------------------------------ */

  const netProfit = cashSurplus; // Assuming cashSurplus is the net profit for this example

  const netMargin =
    totalSales > 0
      ? (netProfit / totalSales) *
        100
      : 0;

  const profitability: ProfitabilityData =
    {
      revenue: totalSales,
      grossProfit,
      expenses: totalExpenses,
      netProfit,
      netMargin,
    };

  /* ------------------------------------------------------------------------ */
  /* FINAL RESULT                                                              */
  /* ------------------------------------------------------------------------ */

  return {
    /* KPI */
    totalSales,
    totalPurchases,
    totalExpenses,
    grossProfit,
    cashSurplus,

    revenueChange,
    expenseChange,
    profitChange,
    grossProfitChange,

    /* SALES */
    revenueTrend,
    salesVsExpenses,
    salesByCategory,
    paymentMethods,

    /* PRODUCTS */
    topProducts,
    recentSales,

    /* INVENTORY */
    inventory,

    /* CUSTOMERS */
    customerGrowth,
    customerSources,

    /* EXPENSES */
    expensesByCategory,

    /* PROFITABILITY */
    profitability,
  };
}