"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseReport } from "@/lib/reports/reports-types";

function money(value: number) { return \`₹\${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}\`; }
function compactMoney(value: number) {
  if (Math.abs(value) >= 100000) return \`₹\${(value / 100000).toFixed(1)}L\`;
  if (Math.abs(value) >= 1000) return \`₹\${(value / 1000).toFixed(0)}k\`;
  return \`₹\${value}\`;
}
function dateLabel(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(\`\${value}T00:00:00\`)); }

export function ReportsPurchases({ data }: { data: PurchaseReport }) {
  return (
    <div className="min-w-0 space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <Metric label="Total purchases" value={money(data.totalPurchases)} />
        <Metric label="Purchase transactions" value={String(data.purchaseCount)} />
        <Metric label="Average purchase" value={money(data.averagePurchase)} />
      </div>

      <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-base">Purchase trend</CardTitle><p className="text-xs text-muted-foreground">Inventory purchases by recorded date</p></CardHeader>
        <CardContent className="px-2 pb-4 sm:px-5">
          {data.purchasesByDay.length ? <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.purchasesByDay.map((item) => ({ ...item, label: dateLabel(item.date) }))} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                <defs><linearGradient id="purchaseTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d4af37" stopOpacity={0.25} /><stop offset="95%" stopColor="#d4af37" stopOpacity={0.01} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.65 }} minTickGap={20} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} tickFormatter={compactMoney} width={55} />
                <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="amount" name="Purchases" stroke="#b18b18" strokeWidth={2.5} fill="url(#purchaseTrendFill)" activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div> : <EmptyState text="Purchase trend will appear once purchase records are available for this period." />}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base">Purchase transactions</CardTitle><p className="text-xs text-muted-foreground">Latest stock purchases in the selected period</p></CardHeader>
        <CardContent>
          {data.recentPurchases.length ? <div className="space-y-3">
            {data.recentPurchases.map((purchase) => <div key={purchase.id} className="flex min-w-0 items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0">
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{purchase.invoiceNumber}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{purchase.supplierName} · {purchase.date}</p><p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{purchase.status.replaceAll("_", " ")}</p></div>
              <span className="shrink-0 text-sm font-bold">{money(purchase.amount)}</span>
            </div>)}
          </div> : <EmptyState text="No purchase transactions found for this period." />}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm"><CardContent className="p-3.5 sm:p-4"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 truncate text-lg font-bold sm:text-xl">{value}</p></CardContent></Card>;
}
function EmptyState({ text }: { text: string }) {
  return <div className="flex h-[210px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 text-center text-sm text-muted-foreground">{text}</div>;
}
