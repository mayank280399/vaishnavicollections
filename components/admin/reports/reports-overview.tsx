"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  ShoppingBag,
  TrendingUp,
  Wallet,
  ReceiptText,
  Package,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportsData } from "@/lib/reports/reports-types";

const NAVY = "#0f1f3d";
const GOLD = "#d4af37";
const PALETTE = ["#0f1f3d", "#d4af37", "#6f86a8", "#c58a4b", "#91a4bd", "#8b9a75"];

function money(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function compactMoney(value: number) {
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ReportsOverview({ data }: { data: ReportsData }) {
  const netProfit = data.sales.grossProfit - data.expenses.totalExpenses;
  const grossMargin = data.sales.totalSales > 0
    ? (data.sales.grossProfit / data.sales.totalSales) * 100
    : 0;
  const netMargin = data.sales.totalSales > 0
    ? (netProfit / data.sales.totalSales) * 100
    : 0;

  const salesByDate = new Map(data.sales.salesByDay.map((item) => [item.date, item.amount]));
  const purchasesByDate = new Map(data.purchases.purchasesByDay.map((item) => [item.date, item.amount]));
  const expensesByDate = new Map(data.expenses.expensesByDay.map((item) => [item.date, item.amount]));
  const activity = Array.from(new Set([
    ...salesByDate.keys(),
    ...purchasesByDate.keys(),
    ...expensesByDate.keys(),
  ])).sort().map((date) => ({
    date,
    label: shortDate(date),
    sales: salesByDate.get(date) ?? 0,
    purchases: purchasesByDate.get(date) ?? 0,
    expenses: expensesByDate.get(date) ?? 0,
  }));

  const paymentMix = data.sales.salesByPayment
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  const hasActivity = activity.some((item) => item.sales || item.purchases || item.expenses);

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard title="Net sales" value={money(data.sales.totalSales)} detail={`${data.sales.invoiceCount} recorded invoices`} icon={Banknote} tone="navy" />
        <MetricCard title="Gross profit" value={money(data.sales.grossProfit)} detail={`${grossMargin.toFixed(1)}% gross margin`} icon={TrendingUp} tone="gold" />
        <MetricCard title="Operating expenses" value={money(data.expenses.totalExpenses)} detail={`${data.expenses.expenseCount} expense entries`} icon={ReceiptText} tone="slate" />
        <MetricCard title="Net profit" value={money(netProfit)} detail={`${netMargin.toFixed(1)}% net margin`} icon={Wallet} tone={netProfit >= 0 ? "gold" : "rose"} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniMetric label="Inventory purchases" value={money(data.purchases.totalPurchases)} icon={ShoppingBag} />
        <MiniMetric label="Purchase entries" value={String(data.purchases.purchaseCount)} icon={Package} />
        <MiniMetric label="Average sale" value={money(data.sales.averageSale)} icon={ArrowUpRight} />
        <MiniMetric label="Recorded discounts" value={money(data.sales.rewardDiscount)} icon={ArrowDownRight} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <Card className="min-w-0 overflow-hidden rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Business activity</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Daily sales, stock purchases and expenses</p>
            </div>
            <span className="rounded-full bg-brand-navy/5 px-2.5 py-1 text-[11px] font-semibold text-brand-navy">Selected period</span>
          </CardHeader>
          <CardContent className="px-2 pb-4 pt-3 sm:px-5">
            {hasActivity ? (
              <div className="h-[260px] w-full sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={NAVY} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={NAVY} stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="purchasesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GOLD} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={GOLD} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "currentColor", opacity: 0.65 }} minTickGap={22} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} tickFormatter={compactMoney} width={55} />
                    <Tooltip formatter={(value) => money(Number(value))} labelFormatter={(_, payload) => payload?.[0]?.payload?.date ? shortDate(payload[0].payload.date) : ""} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area type="monotone" dataKey="sales" name="Sales" stroke={NAVY} strokeWidth={2.5} fill="url(#salesFill)" activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="purchases" name="Purchases" stroke={GOLD} strokeWidth={2} fill="url(#purchasesFill)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#7890ad" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyChart message="No sales, purchases or expenses were recorded in this period." />}
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Sales by payment method</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">How recorded sales were paid</p>
          </CardHeader>
          <CardContent className="pb-5">
            {paymentMix.length ? (
              <>
                <div className="relative h-[210px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentMix} dataKey="amount" nameKey="payment" innerRadius={57} outerRadius={82} paddingAngle={3} stroke="none">
                        {paymentMix.map((item, index) => <Cell key={item.payment} fill={PALETTE[index % PALETTE.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Total sales</span>
                    <span className="mt-1 text-lg font-bold tracking-tight text-foreground">{compactMoney(data.sales.totalSales)}</span>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {paymentMix.map((item, index) => {
                    const percent = data.sales.totalSales > 0 ? (item.amount / data.sales.totalSales) * 100 : 0;
                    return (
                      <div key={item.payment} className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: PALETTE[index % PALETTE.length] }} />
                          <span className="truncate">{item.payment.replaceAll("_", " ")}</span>
                        </span>
                        <span className="shrink-0 font-semibold text-foreground">{money(item.amount)} <span className="font-normal text-muted-foreground">({percent.toFixed(0)}%)</span></span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : <EmptyChart message="Payment mix will appear when sales are recorded." />}
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Profit snapshot</CardTitle>
            <p className="text-xs text-muted-foreground">Based on recorded cost of goods sold</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="Sales revenue" value={money(data.sales.totalSales)} />
            <SummaryRow label="Cost of goods sold" value={`− ${money(data.sales.totalCost)}`} />
            <div className="border-t border-dashed pt-3"><SummaryRow label="Gross profit" value={money(data.sales.grossProfit)} strong /></div>
            <SummaryRow label="Operating expenses" value={`− ${money(data.expenses.totalExpenses)}`} />
            <div className="rounded-xl bg-brand-navy px-4 py-3 text-white">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Estimated net profit</span>
                <span className="text-lg font-bold">{money(netProfit)}</span>
              </div>
              <p className="mt-1 text-[11px] text-white/65">Gross profit less recorded operating expenses</p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Purchases vs expenses</CardTitle>
            <p className="text-xs text-muted-foreground">Separate stock investment from running costs</p>
          </CardHeader>
          <CardContent>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Stock purchases", amount: data.purchases.totalPurchases },
                  { name: "Operating expenses", amount: data.expenses.totalExpenses },
                ]} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} tickFormatter={compactMoney} width={55} />
                  <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="amount" name="Amount" radius={[7, 7, 0, 0]} barSize={42}>
                    <Cell fill={GOLD} />
                    <Cell fill="#7890ad" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">Purchases are shown as inventory spend and are not deducted again in the profit calculation. Only the cost of items sold is included above.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

function MetricCard({ title, value, detail, icon: Icon, tone }: {
  title: string; value: string; detail: string; icon: LucideIcon;
  tone: "navy" | "gold" | "slate" | "rose";
}) {
  const iconClass = {
    navy: "bg-brand-navy text-white",
    gold: "bg-brand-gold/20 text-brand-navy",
    slate: "bg-slate-100 text-slate-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];
  return (
    <Card className="min-w-0 overflow-hidden rounded-2xl border-border/80 shadow-sm">
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">{title}</p>
            <p className="mt-2 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">{value}</p>
            <p className="mt-1 truncate text-[10px] text-muted-foreground sm:text-xs">{detail}</p>
          </div>
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}><Icon className="size-4" /></span>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border/80 bg-card px-3 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-brand-navy"><Icon className="size-4" /></span>
      <div className="min-w-0"><p className="truncate text-[10px] font-medium text-muted-foreground sm:text-xs">{label}</p><p className="mt-0.5 truncate text-sm font-semibold sm:text-base">{value}</p></div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-3"><span className={strong ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>{label}</span><span className={strong ? "text-sm font-bold" : "text-sm font-medium"}>{value}</span></div>;
}
