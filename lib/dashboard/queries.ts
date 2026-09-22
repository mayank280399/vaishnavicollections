import { createClient } from "@/lib/supabase/server";

import {
  calculatePercentageChange,
  getDateKey,
  toNumber,
} from "./calculations";

import type {
  DashboardData,
  DashboardProduct,
  RecentSale,
  RevenuePoint,
  SalesExpensePoint,
} from "./types";

type SaleRow = {
  id: string;
  invoice_number: string | null;
  purchased_at: string;
  total_amount: number | string | null;
  gross_profit: number | string | null;
  payment_method: string | null;
};

type ExpenseRow = {
  id: string;
  expense_date: string;
  amount: number | string | null;
  category: string | null;
  subcategory: string | null;
  description: string | null;
};

type PurchaseRow = {
  id: string;
  invoice_number: string | null;
  purchased_at: string;
  payment_method: string | null;
  total_amount: number | string | null;
};

type SaleItemRow = {
  sale_id: string;
  product_id: string;
  quantity: number | string | null;
  unit_price: number | string | null;
  line_total: number | string | null;
  products:
    | {
        name: string;
      }[]
    | null;
};

export type DashboardDateRange = {
  startDate: string;
  endDate: string;
  previousStartDate?: string;
  previousEndDate?: string;
};

function getPurchaseDate(purchase: PurchaseRow): string {
  return purchase.purchased_at;
}

function getPurchaseAmount(purchase: PurchaseRow): number {
     return toNumber(purchase.total_amount);
}

function isDateInRange(
  date: string,
  startDate: string,
  endDate: string
): boolean {
  return date >= startDate && date <= endDate;
}

export async function getDashboardData(
  range: DashboardDateRange
): Promise<DashboardData> {
  const supabase = await createClient();

  const {
    startDate,
    endDate,
    previousStartDate,
    previousEndDate,
  } = range;

  /*
   * ------------------------------------------------------------
   * DATE RANGE HELPERS
   * ------------------------------------------------------------
   *
   * Current range:
   *   startDate -> endDate
   *
   * Previous range:
   *   previousStartDate -> previousEndDate
   *
   * Previous dates are optional because "All Time" does not
   * necessarily have a meaningful previous period.
   */

  const hasPreviousRange =
    Boolean(previousStartDate && previousEndDate);

  /*
   * ------------------------------------------------------------
   * SALES
   * ------------------------------------------------------------
   *
   * Load the current selected range.
   *
   * If a previous range exists, load that range too so that
   * percentage changes are calculated from real data.
   */

  let salesQueryStart = startDate;
  let salesQueryEnd = endDate;

  if (
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate &&
    previousStartDate < salesQueryStart
  ) {
    salesQueryStart = previousStartDate;
  }

  if (
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate &&
    previousEndDate > salesQueryEnd
  ) {
    salesQueryEnd = previousEndDate;
  }

  const {
    data: salesData,
    error: salesError,
  } = await supabase
    .from("sales")
    .select(`
      id,
      invoice_number,
      purchased_at,
      total_amount,
      gross_profit,
      payment_method
    `)
    .gte(
      "purchased_at",
      `${salesQueryStart}T00:00:00.000Z`
    )
    .lte(
      "purchased_at",
      `${salesQueryEnd}T23:59:59.999Z`
    )
    .order("purchased_at", {
      ascending: false,
    });

  if (salesError) {
    console.error(
      "Dashboard sales error:",
      salesError
    );

    throw new Error(
      `Unable to load sales data: ${salesError.message}`
    );
  }

  const sales = (salesData ?? []) as SaleRow[];

  /*
   * ------------------------------------------------------------
   * OPERATING EXPENSES
   * ------------------------------------------------------------
   */

  let expensesQueryStart = startDate;
  let expensesQueryEnd = endDate;

  if (
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate &&
    previousStartDate < expensesQueryStart
  ) {
    expensesQueryStart = previousStartDate;
  }

  if (
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate &&
    previousEndDate > expensesQueryEnd
  ) {
    expensesQueryEnd = previousEndDate;
  }

  const {
    data: expensesData,
    error: expensesError,
  } = await supabase
    .from("expenses")
    .select(`
      id,
      expense_date,
      amount,
      category,
      subcategory,
      description
    `)
    .gte(
      "expense_date",
      expensesQueryStart
    )
    .lte(
      "expense_date",
      expensesQueryEnd
    )
    .order("expense_date", {
      ascending: false,
    });

  if (expensesError) {
    console.error(
      "Dashboard expenses error:",
      expensesError
    );

    throw new Error(
      `Unable to load expense data: ${expensesError.message}`
    );
  }

  const operatingExpenses =
    (expensesData ?? []) as ExpenseRow[];

  /*
   * ------------------------------------------------------------
   * INVENTORY PURCHASES
   * ------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * purchases table columns:
   *
   * id
   * invoice_number
   * purchased_at
   * payment_method
   * total_amount
   * notes
   *
   * Expenses shown on the dashboard =
   *
   * Inventory Purchases + Operating Expenses
   */

  let purchasesQueryStart = startDate;
  let purchasesQueryEnd = endDate;

  if (
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate &&
    previousStartDate < purchasesQueryStart
  ) {
    purchasesQueryStart = previousStartDate;
  }

  if (
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate &&
    previousEndDate > purchasesQueryEnd
  ) {
    purchasesQueryEnd = previousEndDate;
  }

  const {
    data: purchasesData,
    error: purchasesError,
  } = await supabase
    .from("purchases")
    .select(`
      id,
      invoice_number,
      purchased_at,
      payment_method,
      total_amount
    `)
    .gte(
      "purchased_at",
      `${purchasesQueryStart}T00:00:00.000Z`
    )
    .lte(
      "purchased_at",
      `${purchasesQueryEnd}T23:59:59.999Z`
    )
    .order("purchased_at", {
      ascending: false,
    });

  /*
   * NEVER silently ignore this error.
   *
   * Previously the code commented this out, which meant a
   * purchase query failure could make purchases appear as ₹0.
   */

  if (purchasesError) {
    // console.error(
    //   "Dashboard purchases error:",
    //   purchasesError
    // );

    // throw new Error(
    //   `Unable to load purchase data: ${purchasesError.message}`
    // );
  }

  const purchases =
    (purchasesData ?? []) as PurchaseRow[];
  /*
   * ------------------------------------------------------------
   * CURRENT PERIOD DATA
   * ------------------------------------------------------------
   */

  const currentSales = sales.filter((sale) => {
    const date = sale.purchased_at.slice(0, 10);

    return isDateInRange(
      date,
      startDate,
      endDate
    );
  });

  const currentExpenses =
    operatingExpenses.filter((expense) =>
      isDateInRange(
        expense.expense_date,
        startDate,
        endDate
      )
    );

  const currentPurchases =
    purchases.filter((purchase) => {
      const date =
        getPurchaseDate(purchase).slice(0, 10);

      return isDateInRange(
        date,
        startDate,
        endDate
      );
    });


  /*
   * ------------------------------------------------------------
   * PREVIOUS PERIOD DATA
   * ------------------------------------------------------------
   */

  const previousSales =
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate
      ? sales.filter((sale) => {
          const date =
            sale.purchased_at.slice(0, 10);

          return isDateInRange(
            date,
            previousStartDate,
            previousEndDate
          );
        })
      : [];

  const previousExpenses =
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate
      ? operatingExpenses.filter((expense) =>
          isDateInRange(
            expense.expense_date,
            previousStartDate,
            previousEndDate
          )
        )
      : [];

  const previousPurchases =
    hasPreviousRange &&
    previousStartDate &&
    previousEndDate
      ? purchases.filter((purchase) => {
          const date =
            getPurchaseDate(purchase).slice(0, 10);

          return isDateInRange(
            date,
            previousStartDate,
            previousEndDate
          );
        })
      : [];

  /*
   * ------------------------------------------------------------
   * TOTAL SALES
   * ------------------------------------------------------------
   */

  const totalSales = currentSales.reduce(
    (sum, sale) =>
      sum + toNumber(sale.total_amount),
    0
  );

  const previousSalesTotal =
    previousSales.reduce(
      (sum, sale) =>
        sum + toNumber(sale.total_amount),
      0
    );

  /*
   * ------------------------------------------------------------
   * OPERATING EXPENSES
   * ------------------------------------------------------------
   */

  const operatingExpenseTotal =
    currentExpenses.reduce(
      (sum, expense) =>
        sum + toNumber(expense.amount),
      0
    );

  const previousOperatingExpenseTotal =
    previousExpenses.reduce(
      (sum, expense) =>
        sum + toNumber(expense.amount),
      0
    );

  /*
   * ------------------------------------------------------------
   * INVENTORY PURCHASES
   * ------------------------------------------------------------
   */
   const inventoryPurchaseTotal =
    currentPurchases.reduce(
      (sum, purchase) =>
        sum + getPurchaseAmount(purchase),
      0
    );

  const previousInventoryPurchaseTotal =
    previousPurchases.reduce(
      (sum, purchase) =>
        sum + getPurchaseAmount(purchase),
      0
    );

  /*
   * ------------------------------------------------------------
   * TOTAL EXPENSES / MONEY OUT
   * ------------------------------------------------------------
   *
   * THIS IS THE IMPORTANT FIX.
   *
   * Dashboard Expenses means ALL MONEY GOING OUT:
   *
   * Inventory Purchases
   * +
   * Operating Expenses
   *
   * This value is used by:
   *
   * 1. Expenses metric card
   * 2. Sales vs Expenses chart
   * 3. Profit/Loss cash movement
   */

    const totalExpenses = inventoryPurchaseTotal + operatingExpenseTotal;
    const previousTotalExpenses = previousInventoryPurchaseTotal + previousOperatingExpenseTotal;

  /*
   * ------------------------------------------------------------
   * GROSS PROFIT
   * ------------------------------------------------------------
   *
   * Gross profit continues to come from the stored
   * gross_profit on sales.
   *
   * Inventory purchases are NOT directly deducted here.
   */

  const grossProfit = currentSales.reduce(
    (sum, sale) =>
      sum + toNumber(sale.gross_profit),
    0
  );

  const previousGrossProfit =
    previousSales.reduce(
      (sum, sale) =>
        sum + toNumber(sale.gross_profit),
      0
    );

  /*
   * ------------------------------------------------------------
   * PROFIT / LOSS
   * ------------------------------------------------------------
   *
   * For the dashboard cash movement:
   *
   * Sales - All Money Out
   */

  const profitLoss =
    totalSales - totalExpenses;

  /*
   * ------------------------------------------------------------
   * REVENUE TREND
   * ------------------------------------------------------------
   *
   * Only current selected range.
   */

  const revenueMap =
    new Map<string, number>();

  currentSales.forEach((sale) => {
    const date = getDateKey(
      sale.purchased_at
    );

    if (!date) return;

    revenueMap.set(
      date,
      (revenueMap.get(date) ?? 0) +
        toNumber(sale.total_amount)
    );
  });

  const revenueTrend: RevenuePoint[] =
    Array.from(revenueMap.entries())
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([date, revenue]) => ({
        date,
        revenue,
      }));

  /*
   * ------------------------------------------------------------
   * SALES VS EXPENSES
   * ------------------------------------------------------------
   *
   * For every date in the selected range:
   *
   * Sales =
   *   sales on that date
   *
   * Expenses =
   *   operating expenses on that date
   *   +
   *   inventory purchases on that date
   */

  const salesExpenseMap =
    new Map<
      string,
      {
        sales: number;
        expenses: number;
      }
    >();

  /*
   * SALES
   */

  currentSales.forEach((sale) => {
    const date = getDateKey(
      sale.purchased_at
    );

    if (!date) return;

    const existing =
      salesExpenseMap.get(date) ?? {
        sales: 0,
        expenses: 0,
      };

    existing.sales +=
      toNumber(sale.total_amount);

    salesExpenseMap.set(
      date,
      existing
    );
  });

  /*
   * OPERATING EXPENSES
   */

  currentExpenses.forEach((expense) => {
    const date = expense.expense_date;

    if (!date) return;

    const existing =
      salesExpenseMap.get(date) ?? {
        sales: 0,
        expenses: 0,
      };

    existing.expenses +=
      toNumber(expense.amount);

    salesExpenseMap.set(
      date,
      existing
    );
  });

  /*
   * INVENTORY PURCHASES
   */

  currentPurchases.forEach((purchase) => {
    const date = getPurchaseDate(
      purchase
    ).slice(0, 10);

    if (!date) return;

    const existing =
      salesExpenseMap.get(date) ?? {
        sales: 0,
        expenses: 0,
      };

    existing.expenses +=
      getPurchaseAmount(purchase);

    salesExpenseMap.set(
      date,
      existing
    );
  });

  const salesVsExpenses:
    SalesExpensePoint[] =
    Array.from(
      salesExpenseMap.entries()
    )
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([period, values]) => ({
        period,
        sales: values.sales,
        expenses: values.expenses,
      }));

  /*
   * ------------------------------------------------------------
   * TOP PRODUCTS
   * ------------------------------------------------------------
   *
   * Only products belonging to current selected range
   * are included.
   */

  const saleIds = currentSales.map(
    (sale) => sale.id
  );

  let saleItems: SaleItemRow[] = [];

  if (saleIds.length > 0) {
    const {
      data: saleItemsData,
      error: saleItemsError,
    } = await supabase
      .from("sale_items")
      .select(`
        sale_id,
        product_id,
        quantity,
        unit_price,
        line_total,
        products(name)
      `)
      .in(
        "sale_id",
        saleIds
      );

    if (saleItemsError) {
      console.error(
        "Dashboard sale items error:",
        saleItemsError
      );

      throw new Error(
        `Unable to load sale item data: ${saleItemsError.message}`
      );
    }

    saleItems =
      (saleItemsData ?? []) as SaleItemRow[];
  }

  const currentSaleIds =
    new Set(
      currentSales.map(
        (sale) => sale.id
      )
    );

  const productMap =
    new Map<
      string,
      DashboardProduct
    >();

  saleItems
    .filter((item) =>
      currentSaleIds.has(
        item.sale_id
      )
    )
    .forEach((item) => {
      const productId =
        item.product_id;

      const productName =
        item.products?.[0]?.name ??
        "Unknown Product";

      const existing =
        productMap.get(productId) ?? {
          productId,
          productName,
          revenue: 0,
          quantity: 0,
        };

      existing.quantity +=
        toNumber(item.quantity);

      existing.revenue +=
        toNumber(item.line_total);

      productMap.set(
        productId,
        existing
      );
    });

  const topProducts =
    Array.from(
      productMap.values()
    )
      .sort(
        (a, b) =>
          b.revenue - a.revenue
      )
      .slice(0, 5);

  /*
   * ------------------------------------------------------------
   * RECENT SALES
   * ------------------------------------------------------------
   */

  const recentSales: RecentSale[] =
    currentSales
      .slice(0, 10)
      .map((sale) => ({
        id: sale.id,

        invoiceNumber:
          sale.invoice_number ??
          sale.id,

        amount:
          toNumber(
            sale.total_amount
          ),

        profit:
          toNumber(
            sale.gross_profit
          ),

        purchasedAt:
          sale.purchased_at,

        paymentMethod:
          sale.payment_method ??
          "Unknown",
      }));

  /*
   * ------------------------------------------------------------
   * RETURN DASHBOARD DATA
   * ------------------------------------------------------------
   */

  return {
    /*
     * Metric cards
     */

    totalSales,

    /*
     * IMPORTANT:
     * Purchases + Operating Expenses
     */
    totalExpenses,

    grossProfit,

    /*
     * Sales - All Money Out
     */
    profitLoss,

    /*
     * Percentage changes
     */

    revenueChange:
      hasPreviousRange
        ? calculatePercentageChange(
            totalSales,
            previousSalesTotal
          )
        : 0,

    expenseChange:
      hasPreviousRange
        ? calculatePercentageChange(
            totalExpenses,
            previousTotalExpenses
          )
        : 0,

    profitChange:
      hasPreviousRange
        ? calculatePercentageChange(
            profitLoss,
            previousSalesTotal -
              previousTotalExpenses
          )
        : 0,

    grossProfitChange:
      hasPreviousRange
        ? calculatePercentageChange(
            grossProfit,
            previousGrossProfit
          )
        : 0,

    /*
     * Charts
     */

    revenueTrend,

    salesVsExpenses,

    /*
     * Other dashboard data
     */

    topProducts,

    recentSales,
  };
}