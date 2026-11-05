"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesReport } from "@/lib/reports/reports-types";

const NAVY = "#0f1f3d";
const GOLD = "#d4af37";
const COLORS = [NAVY, GOLD, "#7890ad", "#c58a4b", "#91a4bd"];

function money(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
function compactMoney(value: number) {
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}
function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(`${value}T00:00:00`));
}

export function ReportsSales({ data }: { data: SalesReport }) {
  const payments = data.salesByPayment.filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount);
  return (
    <div className="min-w-0 space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric icon={Banknote} label="Net sales" value={money(data.totalSales)} />
        <Metric icon={ReceiptText} label="Invoices" value={String(data.invoiceCount)} />
        <Metric icon={Wallet} label="Average sale" value={money(data.averageSale)} />
        <Metric icon={TrendingUp} label="Gross profit" value={money(data.grossProfit)} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
        <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Sales trend</CardTitle><p className="text-xs text-muted-foreground">Recorded sales by day</p></CardHeader>
          <CardContent className="px-2 pb-4 sm:px-5">
            {data.salesByDay.length ? <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesByDay.map((item) => ({ ...item, label: dateLabel(item.date) }))} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                  <defs><linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={NAVY} stopOpacity={0.22} /><stop offset="95%" stopColor={NAVY} stopOpacity={0.01} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.65 }} minTickGap={20} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} tickFormatter={compactMoney} width={55} />
                  <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="amount" name="Sales" stroke={NAVY} strokeWidth={2.5} fill="url(#salesTrendFill)" activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div> : <EmptyState text="Sales trend will appear once sales are recorded for this period." />}
          </CardContent>
        </Card>

        <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Payment breakdown</CardTitle><p className="text-xs text-muted-foreground">Sales grouped by recorded payment method</p></CardHeader>
          <CardContent className="pb-5">
            {payments.length ? <>
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={payments} dataKey="amount" nameKey="payment" innerRadius={54} outerRadius={80} paddingAngle={3} stroke="none">{payments.map((item, index) => <Cell key={item.payment} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 12, fontSize: 12 }} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">{payments.map((item, index) => <div key={item.payment} className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-2 text-muted-foreground"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} /><span className="truncate">{item.payment.replaceAll("_", " ")}</span></span><span className="font-semibold">{money(item.amount)}</span></div>)}</div>
            </> : <EmptyState text="Payment breakdown will appear when sales are recorded." />}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base">Recent sales</CardTitle><p className="text-xs text-muted-foreground">Latest invoices in the selected reporting period</p></CardHeader>
        <CardContent>
          {data.recentSales.length ? <div className="space-y-3">
            {data.recentSales.map((sale) => <div key={sale.id} className="flex min-w-0 items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0">
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{sale.invoiceNumber}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{sale.customerName} · {sale.date} · {sale.paymentMethod.replaceAll("_", " ")}</p></div>
              <span className="shrink-0 text-sm font-bold">{money(sale.amount)}</span>
            </div>)}
          </div> : <EmptyState text="No sales found for this reporting period." />}
        </CardContent>
      </Card>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm"><CardContent className="flex items-center gap-3 p-3.5 sm:p-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy"><Icon className="size-4" /></span><div className="min-w-0"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 truncate text-lg font-bold sm:text-xl">{value}</p></div></CardContent></Card>;
}
function EmptyState({ text }: { text: string }) {
  return <div className="flex h-[210px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 text-center text-sm text-muted-foreground">{text}</div>;
}
