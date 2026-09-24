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

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function formatDate(date: string | null | undefined) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function dateKey(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
}

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
    .gte("purchased_at", `${range.from}T00:00:00`)
    .lte("purchased_at", `${range.to}T23:59:59`)
    .neq("status", "CANCELLED")
    .order("purchased_at", { ascending: false });

  if (error) throw error;

  const rows = data ?? [];

  const totalSales = rows.reduce(
    (sum, row) => sum + toNumber(row.total_amount),
    0,
  );

  const totalCost = rows.reduce(
    (sum, row) => sum + toNumber(row.cost_amount),
    0,
  );

  const grossProfit = rows.reduce(
    (sum, row) => sum + toNumber(row.gross_profit),
    0,
  );

  const rewardDiscount = rows.reduce(
    (sum, row) => sum + toNumber(row.reward_discount),
    0,
  );

  const paymentMap = new Map<string, number>();
  const dayMap = new Map<string, number>();

  rows.forEach((row) => {
    const payment = row.payment_method ?? "OTHER";
    paymentMap.set(
      payment,
      (paymentMap.get(payment) ?? 0) + toNumber(row.total_amount),
    );

    const day = dateKey(row.purchased_at);

    dayMap.set(
      day,
      (dayMap.get(day) ?? 0) + toNumber(row.total_amount),
    );
  });

  return {
    totalSales,
    invoiceCount: rows.length,
    averageSale: rows.length ? totalSales / rows.length : 0,
    totalCost,
    grossProfit,
    rewardDiscount,

    salesByPayment: Array.from(paymentMap.entries()).map(
      ([payment, amount]) => ({
        payment,
        amount,
      }),
    ),

    salesByDay: Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date,
        amount,
      })),

    recentSales: rows.slice(0, 10).map((row) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      date: formatDate(row.purchased_at),
      amount: toNumber(row.total_amount),
      paymentMethod: row.payment_method,
      customerName:
        Array.isArray(row.customers)
          ? row.customers[0]?.display_name ?? "Walk-in Customer"
          : row.customers?.display_name ?? "Walk-in Customer",
    })),
  };
}

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
    .gte("purchased_at", `${range.from}T00:00:00`)
    .lte("purchased_at", `${range.to}T23:59:59`)
    .neq("status", "CANCELLED")
    .order("purchased_at", { ascending: false });

  if (error) throw error;

  const rows = data ?? [];

  const totalPurchases = rows.reduce(
    (sum, row) => sum + toNumber(row.total_amount),
    0,
  );

  const dayMap = new Map<string, number>();

  rows.forEach((row) => {
    const day = dateKey(row.purchased_at);

    dayMap.set(
      day,
      (dayMap.get(day) ?? 0) + toNumber(row.total_amount),
    );
  });

  return {
    totalPurchases,
    purchaseCount: rows.length,
    averagePurchase: rows.length
      ? totalPurchases / rows.length
      : 0,

    purchasesByDay: Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date,
        amount,
      })),

    recentPurchases: rows.slice(0, 10).map((row) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      supplierName: row.supplier_name ?? "—",
      date: formatDate(row.purchased_at),
      amount: toNumber(row.total_amount),
      paymentMethod: row.payment_method,
      status: row.status,
    })),
  };
}

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
    .gte("expense_date", range.from)
    .lte("expense_date", range.to)
    .order("expense_date", { ascending: false });

  if (error) throw error;

  const rows = data ?? [];

  const totalExpenses = rows.reduce(
    (sum, row) => sum + toNumber(row.amount),
    0,
  );

  const categoryMap = new Map<string, number>();
  const dayMap = new Map<string, number>();

  rows.forEach((row) => {
    const category = row.category || "Other";

    categoryMap.set(
      category,
      (categoryMap.get(category) ?? 0) + toNumber(row.amount),
    );

    dayMap.set(
      row.expense_date,
      (dayMap.get(row.expense_date) ?? 0) +
        toNumber(row.amount),
    );
  });

  return {
    totalExpenses,
    expenseCount: rows.length,
    averageExpense: rows.length
      ? totalExpenses / rows.length
      : 0,

    expensesByCategory: Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
      })),

    expensesByDay: Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date,
        amount,
      })),

    recentExpenses: rows.slice(0, 10).map((row) => ({
      id: row.id,
      expenseNumber: row.expense_number,
      category: row.category,
      description: row.description ?? "",
      date: formatDate(row.expense_date),
      amount: toNumber(row.amount),
      paymentMethod: row.payment_method,
    })),
  };
}

export async function getCustomerReport(
  range: DateRange,
): Promise<CustomerReport> {
  const { data: sales, error: salesError } = await createClient()
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
    .gte("purchased_at", `${range.from}T00:00:00`)
    .lte("purchased_at", `${range.to}T23:59:59`)
    .neq("status", "CANCELLED");

  if (salesError) throw salesError;

  const rows = sales ?? [];

  const customerMap = new Map<
    string,
    {
      name: string;
      orders: number;
      spent: number;
    }
  >();

  rows.forEach((row) => {
    if (!row.customer_id) return;

    const customer = Array.isArray(row.customers)
      ? row.customers[0]
      : row.customers;

    const existing = customerMap.get(row.customer_id);

    customerMap.set(row.customer_id, {
      name: customer?.display_name ?? "Customer",
      orders: (existing?.orders ?? 0) + 1,
      spent:
        (existing?.spent ?? 0) +
        toNumber(row.total_amount),
    });
  });

  const totalCustomerSales = rows
    .filter((row) => row.customer_id)
    .reduce(
      (sum, row) => sum + toNumber(row.total_amount),
      0,
    );

  const { count: totalCustomers } = await createClient()
    .from("customers")
    .select("id", { count: "exact", head: true });

  const { count: newCustomers } = await createClient()
    .from("customers")
    .select("id", { count: "exact", head: true })
    .gte("first_purchase_at", range.from)
    .lte("first_purchase_at", `${range.to}T23:59:59`);

  const topCustomers = Array.from(customerMap.entries())
    .sort((a, b) => b[1].spent - a[1].spent)
    .slice(0, 10)
    .map(([id, customer]) => ({
      id,
      name: customer.name,
      orders: customer.orders,
      spent: customer.spent,
    }));

  return {
    totalCustomers: totalCustomers ?? 0,
    newCustomers: newCustomers ?? 0,
    returningCustomers: Array.from(customerMap.values()).filter(
      (customer) => customer.orders > 1,
    ).length,
    totalCustomerSales,
    topCustomers,
  };
}

export async function getLoyaltyReport(
  range: DateRange,
): Promise<LoyaltyReport> {
  const { data: accounts, error: accountError } =
    await createClient()
      .from("reward_accounts")
      .select(`
        customer_id,
        points_balance,
        lifetime_points_earned,
        lifetime_points_redeemed
      `);

  if (accountError) throw accountError;

  const loyaltyCustomers = accounts?.length ?? 0;

  const stampsEarned = (accounts ?? []).reduce(
    (sum, row) =>
      sum + Number(row.lifetime_points_earned ?? 0),
    0,
  );

  const stampsRedeemed = (accounts ?? []).reduce(
    (sum, row) =>
      sum + Number(row.lifetime_points_redeemed ?? 0),
    0,
  );

  const outstandingStamps = (accounts ?? []).reduce(
    (sum, row) => sum + Number(row.points_balance ?? 0),
    0,
  );

  const { count: rewardsRedeemed } = await createClient()
    .from("reward_redemptions")
    .select("id", { count: "exact", head: true })
    .gte("redeemed_at", `${range.from}T00:00:00`)
    .lte("redeemed_at", `${range.to}T23:59:59`);

  const { data: loyaltySales, error: loyaltySalesError } =
    await createClient()
      .from("sales")
      .select("total_amount, customer_id")
      .gte("purchased_at", `${range.from}T00:00:00`)
      .lte("purchased_at", `${range.to}T23:59:59`)
      .neq("status", "CANCELLED");

  if (loyaltySalesError) throw loyaltySalesError;

  const loyaltyCustomerIds = new Set(
    (accounts ?? []).map((account) => account.customer_id),
  );

  const loyaltySalesAmount = (loyaltySales ?? [])
    .filter((sale) =>
      loyaltyCustomerIds.has(sale.customer_id),
    )
    .reduce(
      (sum, sale) => sum + toNumber(sale.total_amount),
      0,
    );

  return {
    loyaltyCustomers,
    stampsEarned,
    stampsRedeemed,
    outstandingStamps,
    rewardsRedeemed: rewardsRedeemed ?? 0,
    loyaltySales: loyaltySalesAmount,
  };
}

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