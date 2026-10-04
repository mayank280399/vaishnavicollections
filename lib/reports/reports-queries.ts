import { createClient } from "@/lib/supabase/client";

import type {
  CustomerReport,
  DateRange,
  ExpenseReport,
  LoyaltyReport,
  PurchaseReport,
  ReportsData,
  SalesReport,
} from "./reports-types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function formatDate(
  date: string | null | undefined,
): string {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function dateKey(date: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

/* -------------------------------------------------------------------------- */
/* Database row types                                                         */
/* -------------------------------------------------------------------------- */

type SalesCustomerRow = {
  display_name: string | null;
};

type SalesReportRow = {
  id: string;
  invoice_number: string | null;
  customer_id: string | null;
  total_amount: number | string | null;
  cost_amount: number | string | null;
  gross_profit: number | string | null;
  reward_discount: number | string | null;
  payment_method: string | null;
  status: string | null;
  purchased_at: string;
  customers:
    | SalesCustomerRow
    | SalesCustomerRow[]
    | null;
};

type PurchaseReportRow = {
  id: string;
  invoice_number: string | null;
  supplier_name: string | null;
  total_amount: number | string | null;
  payment_method: string | null;
  status: string | null;
  purchased_at: string;
};

type ExpenseReportRow = {
  id: string;
  expense_number: string | null;
  expense_date: string;
  category: string | null;
  description: string | null;
  amount: number | string | null;
  payment_method: string | null;
};

type CustomerSalesCustomerRow = {
  id: string;
  display_name: string | null;
  total_orders: number | null;
  total_spent: number | string | null;
};

type CustomerSalesRow = {
  id: string;
  customer_id: string | null;
  total_amount: number | string | null;
  purchased_at: string;
  customers:
    | CustomerSalesCustomerRow
    | CustomerSalesCustomerRow[]
    | null;
};

type RewardAccountRow = {
  customer_id: string;
  points_balance: number | string | null;
  lifetime_points_earned: number | string | null;
  lifetime_points_redeemed: number | string | null;
};

type LoyaltySaleRow = {
  total_amount: number | string | null;
  customer_id: string | null;
};

/* -------------------------------------------------------------------------- */
/* Sales Report                                                               */
/* -------------------------------------------------------------------------- */

export async function getSalesReport(
  range: DateRange,
): Promise<SalesReport> {
  const { data, error } = await createClient()
    .from("sales")
    .select(`
      id,
      invoice_number,
      customer_id,
      total_amount,
      cost_amount,
      gross_profit,
      reward_discount,
      payment_method,
      status,
      purchased_at,
      customers (
        display_name
      )
    `)
    .gte(
      "purchased_at",
      `${range.from}T00:00:00`,
    )
    .lte(
      "purchased_at",
      `${range.to}T23:59:59`,
    )
    .neq("status", "CANCELLED")
    .order("purchased_at", {
      ascending: false,
    });

  if (error) throw error;

  const rows: SalesReportRow[] =
    (data ?? []) as SalesReportRow[];

  const totalSales = rows.reduce(
    (
      sum: number,
      row: SalesReportRow,
    ) =>
      sum + toNumber(row.total_amount),
    0,
  );

  const totalCost = rows.reduce(
    (
      sum: number,
      row: SalesReportRow,
    ) =>
      sum + toNumber(row.cost_amount),
    0,
  );

  const grossProfit = rows.reduce(
    (
      sum: number,
      row: SalesReportRow,
    ) =>
      sum + toNumber(row.gross_profit),
    0,
  );

  const rewardDiscount = rows.reduce(
    (
      sum: number,
      row: SalesReportRow,
    ) =>
      sum + toNumber(row.reward_discount),
    0,
  );

  const paymentMap = new Map<
    string,
    number
  >();

  const dayMap = new Map<
    string,
    number
  >();

  rows.forEach(
    (row: SalesReportRow) => {
      const payment =
        row.payment_method ?? "OTHER";

      paymentMap.set(
        payment,
        (paymentMap.get(payment) ?? 0) +
          toNumber(row.total_amount),
      );

      const day = dateKey(
        row.purchased_at,
      );

      dayMap.set(
        day,
        (dayMap.get(day) ?? 0) +
          toNumber(row.total_amount),
      );
    },
  );

  return {
    totalSales,
    invoiceCount: rows.length,
    averageSale: rows.length
      ? totalSales / rows.length
      : 0,
    totalCost,
    grossProfit,
    rewardDiscount,

    salesByPayment:
      Array.from(
        paymentMap.entries(),
      ).map(
        (
          [payment, amount]: [
            string,
            number,
          ],
        ) => ({
          payment,
          amount,
        }),
      ),

    salesByDay:
      Array.from(
        dayMap.entries(),
      )
        .sort(
          (
            [a]: [string, number],
            [b]: [string, number],
          ) => a.localeCompare(b),
        )
        .map(
          (
            [date, amount]: [
              string,
              number,
            ],
          ) => ({
            date,
            amount,
          }),
        ),

    recentSales: rows
      .slice(0, 10)
      .map(
        (row: SalesReportRow) => {
          const customer =
            Array.isArray(row.customers)
              ? row.customers[0]
              : row.customers;

          return {
            id: row.id,

            // Normalize nullable DB value
            // before returning the application model.
            invoiceNumber:
              row.invoice_number ?? "—",

            date: formatDate(
              row.purchased_at,
            ),

            amount: toNumber(
              row.total_amount,
            ),

            // Normalize nullable DB value.
            paymentMethod:
              row.payment_method ?? "OTHER",

            customerName:
              customer?.display_name ??
              "Walk-in Customer",
          };
        },
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Purchase Report                                                            */
/* -------------------------------------------------------------------------- */

export async function getPurchaseReport(
  range: DateRange,
): Promise<PurchaseReport> {
  const { data, error } = await createClient()
    .from("purchases")
    .select(`
      id,
      invoice_number,
      supplier_name,
      total_amount,
      payment_method,
      status,
      purchased_at
    `)
    .gte(
      "purchased_at",
      `${range.from}T00:00:00`,
    )
    .lte(
      "purchased_at",
      `${range.to}T23:59:59`,
    )
    .neq("status", "CANCELLED")
    .order("purchased_at", {
      ascending: false,
    });

  if (error) throw error;

  const rows: PurchaseReportRow[] =
    (data ?? []) as PurchaseReportRow[];

  const totalPurchases = rows.reduce(
    (
      sum: number,
      row: PurchaseReportRow,
    ) =>
      sum + toNumber(row.total_amount),
    0,
  );

  const dayMap = new Map<
    string,
    number
  >();

  rows.forEach(
    (row: PurchaseReportRow) => {
      const day = dateKey(
        row.purchased_at,
      );

      dayMap.set(
        day,
        (dayMap.get(day) ?? 0) +
          toNumber(row.total_amount),
      );
    },
  );

  return {
    totalPurchases,
    purchaseCount: rows.length,

    averagePurchase: rows.length
      ? totalPurchases / rows.length
      : 0,

    purchasesByDay:
      Array.from(
        dayMap.entries(),
      )
        .sort(
          (
            [a]: [string, number],
            [b]: [string, number],
          ) => a.localeCompare(b),
        )
        .map(
          (
            [date, amount]: [
              string,
              number,
            ],
          ) => ({
            date,
            amount,
          }),
        ),

    recentPurchases: rows
      .slice(0, 10)
      .map(
        (
          row: PurchaseReportRow,
        ) => ({
          id: row.id,

          // Normalize nullable DB value.
          invoiceNumber:
            row.invoice_number ?? "—",

          supplierName:
            row.supplier_name ??
            "Unknown Supplier",

          date: formatDate(
            row.purchased_at,
          ),

          amount: toNumber(
            row.total_amount,
          ),

          // Normalize nullable DB value.
          paymentMethod:
            row.payment_method ?? "OTHER",

          // Normalize nullable DB value.
          status:
            row.status ?? "UNKNOWN",
        }),
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Expense Report                                                             */
/* -------------------------------------------------------------------------- */

export async function getExpenseReport(
  range: DateRange,
): Promise<ExpenseReport> {
  const { data, error } = await createClient()
    .from("expenses")
    .select(`
      id,
      expense_number,
      expense_date,
      category,
      description,
      amount,
      payment_method
    `)
    .gte(
      "expense_date",
      range.from,
    )
    .lte(
      "expense_date",
      range.to,
    )
    .order("expense_date", {
      ascending: false,
    });

  if (error) throw error;

  const rows: ExpenseReportRow[] =
    (data ?? []) as ExpenseReportRow[];

  const totalExpenses = rows.reduce(
    (
      sum: number,
      row: ExpenseReportRow,
    ) =>
      sum + toNumber(row.amount),
    0,
  );

  const categoryMap = new Map<
    string,
    number
  >();

  const dayMap = new Map<
    string,
    number
  >();

  rows.forEach(
    (row: ExpenseReportRow) => {
      const category =
        row.category ?? "Other";

      categoryMap.set(
        category,
        (categoryMap.get(category) ??
          0) + toNumber(row.amount),
      );

      dayMap.set(
        row.expense_date,
        (dayMap.get(
          row.expense_date,
        ) ?? 0) +
          toNumber(row.amount),
      );
    },
  );

  return {
    totalExpenses,
    expenseCount: rows.length,

    averageExpense: rows.length
      ? totalExpenses / rows.length
      : 0,

    expensesByCategory:
      Array.from(
        categoryMap.entries(),
      )
        .sort(
          (
            a: [string, number],
            b: [string, number],
          ) => b[1] - a[1],
        )
        .map(
          (
            [
              category,
              amount,
            ]: [string, number],
          ) => ({
            category,
            amount,
          }),
        ),

    expensesByDay:
      Array.from(
        dayMap.entries(),
      )
        .sort(
          (
            [a]: [string, number],
            [b]: [string, number],
          ) => a.localeCompare(b),
        )
        .map(
          (
            [date, amount]: [
              string,
              number,
            ],
          ) => ({
            date,
            amount,
          }),
        ),

    recentExpenses: rows
      .slice(0, 10)
      .map(
        (
          row: ExpenseReportRow,
        ) => ({
          id: row.id,

          // Normalize nullable DB value.
          expenseNumber:
            row.expense_number ?? "—",

          // Normalize nullable DB value.
          category:
            row.category ?? "Other",

          description:
            row.description ?? "—",

          date: formatDate(
            row.expense_date,
          ),

          amount: toNumber(row.amount),

          // Normalize nullable DB value.
          paymentMethod:
            row.payment_method ?? "OTHER",
        }),
      ),
  };
}

/* -------------------------------------------------------------------------- */
/* Customer Report                                                            */
/* -------------------------------------------------------------------------- */

export async function getCustomerReport(
  range: DateRange,
): Promise<CustomerReport> {
  const { data: sales, error: salesError } =
    await createClient()
      .from("sales")
      .select(`
        id,
        customer_id,
        total_amount,
        purchased_at,
        customers (
          id,
          display_name,
          total_orders,
          total_spent
        )
      `)
      .gte(
        "purchased_at",
        `${range.from}T00:00:00`,
      )
      .lte(
        "purchased_at",
        `${range.to}T23:59:59`,
      )
      .neq("status", "CANCELLED");

  if (salesError) throw salesError;

  const rows: CustomerSalesRow[] =
    (sales ?? []) as CustomerSalesRow[];

  const customerMap = new Map<
    string,
    {
      name: string;
      orders: number;
      spent: number;
    }
  >();

  rows.forEach(
    (row: CustomerSalesRow) => {
      if (!row.customer_id) return;

      const customer =
        Array.isArray(row.customers)
          ? row.customers[0]
          : row.customers;

      const existing =
        customerMap.get(
          row.customer_id,
        );

      customerMap.set(
        row.customer_id,
        {
          name:
            customer?.display_name ??
            "Customer",

          orders:
            (existing?.orders ?? 0) + 1,

          spent:
            (existing?.spent ?? 0) +
            toNumber(
              row.total_amount,
            ),
        },
      );
    },
  );

  const totalCustomerSales =
    rows
      .filter(
        (
          row: CustomerSalesRow,
        ) => Boolean(row.customer_id),
      )
      .reduce(
        (
          sum: number,
          row: CustomerSalesRow,
        ) =>
          sum +
          toNumber(
            row.total_amount,
          ),
        0,
      );

  const { count: totalCustomers } =
    await createClient()
      .from("customers")
      .select("id", {
        count: "exact",
        head: true,
      });

  const { count: newCustomers } =
    await createClient()
      .from("customers")
      .select("id", {
        count: "exact",
        head: true,
      })
      .gte(
        "first_purchase_at",
        range.from,
      )
      .lte(
        "first_purchase_at",
        `${range.to}T23:59:59`,
      );

  const topCustomers =
    Array.from(
      customerMap.entries(),
    )
      .sort(
        (
          a: [
            string,
            {
              name: string;
              orders: number;
              spent: number;
            },
          ],
          b: [
            string,
            {
              name: string;
              orders: number;
              spent: number;
            },
          ],
        ) => b[1].spent - a[1].spent,
      )
      .slice(0, 10)
      .map(
        (
          [
            id,
            customer,
          ]: [
            string,
            {
              name: string;
              orders: number;
              spent: number;
            },
          ],
        ) => ({
          id,
          name: customer.name,
          orders: customer.orders,
          spent: customer.spent,
        }),
      );

  return {
    totalCustomers:
      totalCustomers ?? 0,

    newCustomers:
      newCustomers ?? 0,

    returningCustomers:
      Array.from(
        customerMap.values(),
      ).filter(
        (
          customer: {
            name: string;
            orders: number;
            spent: number;
          },
        ) => customer.orders > 1,
      ).length,

    totalCustomerSales,

    topCustomers,
  };
}

/* -------------------------------------------------------------------------- */
/* Loyalty Report                                                             */
/* -------------------------------------------------------------------------- */

export async function getLoyaltyReport(
  range: DateRange,
): Promise<LoyaltyReport> {
  const {
    data: accounts,
    error: accountError,
  } = await createClient()
    .from("reward_accounts")
    .select(`
      customer_id,
      points_balance,
      lifetime_points_earned,
      lifetime_points_redeemed
    `);

  if (accountError) throw accountError;

  const loyaltyAccounts: RewardAccountRow[] =
    (accounts ?? []) as RewardAccountRow[];

  const loyaltyCustomers =
    loyaltyAccounts.length;

  const stampsEarned =
    loyaltyAccounts.reduce(
      (
        sum: number,
        row: RewardAccountRow,
      ) =>
        sum +
        Number(
          row.lifetime_points_earned ??
            0,
        ),
      0,
    );

  const stampsRedeemed =
    loyaltyAccounts.reduce(
      (
        sum: number,
        row: RewardAccountRow,
      ) =>
        sum +
        Number(
          row.lifetime_points_redeemed ??
            0,
        ),
      0,
    );

  const outstandingStamps =
    loyaltyAccounts.reduce(
      (
        sum: number,
        row: RewardAccountRow,
      ) =>
        sum +
        Number(
          row.points_balance ?? 0,
        ),
      0,
    );

  const {
    count: rewardsRedeemed,
  } = await createClient()
    .from("reward_redemptions")
    .select("id", {
      count: "exact",
      head: true,
    })
    .gte(
      "redeemed_at",
      `${range.from}T00:00:00`,
    )
    .lte(
      "redeemed_at",
      `${range.to}T23:59:59`,
    );

  const {
    data: loyaltySales,
    error: loyaltySalesError,
  } = await createClient()
    .from("sales")
    .select(
      "total_amount, customer_id",
    )
    .gte(
      "purchased_at",
      `${range.from}T00:00:00`,
    )
    .lte(
      "purchased_at",
      `${range.to}T23:59:59`,
    )
    .neq("status", "CANCELLED");

  if (loyaltySalesError) {
    throw loyaltySalesError;
  }

  const loyaltySaleRows: LoyaltySaleRow[] =
    (loyaltySales ?? []) as LoyaltySaleRow[];

  const loyaltyCustomerIds =
    new Set<string>(
      loyaltyAccounts.map(
        (
          account: RewardAccountRow,
        ) => account.customer_id,
      ),
    );

  const loyaltySalesAmount =
    loyaltySaleRows
      .filter(
        (
          sale: LoyaltySaleRow,
        ) =>
          sale.customer_id !== null &&
          loyaltyCustomerIds.has(
            sale.customer_id,
          ),
      )
      .reduce(
        (
          sum: number,
          sale: LoyaltySaleRow,
        ) =>
          sum +
          toNumber(
            sale.total_amount,
          ),
        0,
      );

  return {
    loyaltyCustomers,
    stampsEarned,
    stampsRedeemed,
    outstandingStamps,

    rewardsRedeemed:
      rewardsRedeemed ?? 0,

    loyaltySales:
      loyaltySalesAmount,
  };
}

/* -------------------------------------------------------------------------- */
/* Combined Reports Data                                                      */
/* -------------------------------------------------------------------------- */

export async function getReportsData(
  range: DateRange,
): Promise<ReportsData> {
  const [
    sales,
    purchases,
    expenses,
    customers,
    loyalty,
  ] = await Promise.all([
    getSalesReport(range),
    getPurchaseReport(range),
    getExpenseReport(range),
    getCustomerReport(range),
    getLoyaltyReport(range),
  ]);

  return {
    sales,
    purchases,
    expenses,
    customers,
    loyalty,
  };
}