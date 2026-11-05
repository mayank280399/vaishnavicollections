"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsData } from "@/lib/reports/reports-types";

function money(value: number) {
  return \`₹\${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}\`;
}
function compactMoney(value: number) {
  if (Math.abs(value) >= 100000) return \`₹\${(value / 100000).toFixed(1)}L\`;
  if (Math.abs(value) >= 1000) return \`₹\${(value / 1000).toFixed(0)}k\`;
  return \`₹\${value}\`;
}

export function ReportsProfitLoss({ data }: { data: ReportsData }) {
  const revenue = data.sales.totalSales;
  const costOfGoods = data.sales.totalCost;
  const grossProfit = data.sales.grossProfit;
  const expenses = data.expenses.totalExpenses;
  const netProfit = grossProfit - expenses;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const chartData = [
    { name: "Sales", amount: revenue, fill: "#0f1f3d" },
    { name: "Product cost", amount: costOfGoods, fill: "#7890ad" },
    { name: "Expenses", amount: expenses, fill: "#d4af37" },
    { name: "Net profit", amount: Math.max(0, netProfit), fill: "#66866e" },
  ];

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric label="Gross profit" value={money(grossProfit)} />
        <Metric label="Gross margin" value={\`\${grossMargin.toFixed(1)}%\`} />
        <Metric label="Net profit" value={money(netProfit)} highlight={netProfit >= 0} />
        <Metric label="Net margin" value={\`\${netMargin.toFixed(1)}%\`} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profit & loss statement</CardTitle>
            <p className="text-xs text-muted-foreground">How sales revenue turns into estimated profit</p>
          </CardHeader>
          <CardContent className="space-y-4 pb-5">
            <Row label="Sales revenue" value={money(revenue)} />
            <Row label="Cost of goods sold" value={\`− \${money(costOfGoods)}\`} />
            <div className="rounded-lg bg-muted/60 px-3 py-3"><Row label="Gross profit" value={money(grossProfit)} strong /></div>
            <Row label="Operating expenses" value={\`− \${money(expenses)}\`} />
            <div className={\`rounded-xl px-4 py-4 text-white \${netProfit >= 0 ? "bg-brand-navy" : "bg-rose-800"}\`}>
              <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">Estimated net profit</span><span className="text-xl font-bold">{money(netProfit)}</span></div>
              <p className="mt-1 text-xs text-white/65">Net margin: {netMargin.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financial breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Compare sales, product cost and operating costs</p>
          </CardHeader>
          <CardContent className="px-2 pb-5 sm:px-4">
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor" }} interval={0} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} tickFormatter={compactMoney} width={55} />
                  <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="amount" name="Amount" radius={[6, 6, 0, 0]} maxBarSize={42}>
                    {chartData.map((item) => <Cell key={item.name} fill={item.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <strong className="text-foreground">How this is calculated:</strong> Gross profit uses the recorded gross-profit and cost fields on sales. Estimated net profit subtracts recorded operating expenses. Inventory purchases are shown separately and are not deducted again; unsold stock is not treated as an expense. This is an operational estimate, not a statutory or tax P&L.
      </div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-4"><span className={strong ? "text-sm font-semibold" : "text-sm text-muted-foreground"}>{label}</span><span className={strong ? "text-sm font-bold" : "text-sm font-medium"}>{value}</span></div>;
}
function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm"><CardContent className="p-3.5 sm:p-4"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className={\`mt-1 truncate text-lg font-bold sm:text-xl \${highlight ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"}\`}>{value}</p></CardContent></Card>;
}
