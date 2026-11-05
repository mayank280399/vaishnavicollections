"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseReport } from "@/lib/reports/reports-types";

const COLORS = ["#0f1f3d", "#d4af37", "#7890ad", "#c58a4b", "#91a4bd", "#8b9a75", "#9b829e"];
function money(value: number) { return \`₹\${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}\`; }
function compactMoney(value: number) {
  if (Math.abs(value) >= 100000) return \`₹\${(value / 100000).toFixed(1)}L\`;
  if (Math.abs(value) >= 1000) return \`₹\${(value / 1000).toFixed(0)}k\`;
  return \`₹\${value}\`;
}
function dateLabel(value: string) { return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(\`\${value}T00:00:00\`)); }

export function ReportsExpenses({ data }: { data: ExpenseReport }) {
  const categories = data.expensesByCategory.filter((item) => item.amount > 0);
  return (
    <div className="min-w-0 space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <Metric label="Total expenses" value={money(data.totalExpenses)} />
        <Metric label="Expense transactions" value={String(data.expenseCount)} />
        <Metric label="Average expense" value={money(data.averageExpense)} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Expenses by category</CardTitle><p className="text-xs text-muted-foreground">Where operating costs are going</p></CardHeader>
          <CardContent className="px-2 pb-4 sm:px-5">
            {categories.length ? <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" opacity={0.1} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} tickFormatter={compactMoney} />
                  <YAxis type="category" dataKey="category" width={95} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor" }} />
                  <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="amount" name="Expense" radius={[0, 6, 6, 0]} barSize={18}>{categories.map((item, index) => <Cell key={item.category} fill={COLORS[index % COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div> : <EmptyState text="Category analysis will appear when expenses are recorded." />}
          </CardContent>
        </Card>

        <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base">Expense trend</CardTitle><p className="text-xs text-muted-foreground">Daily operating expenses</p></CardHeader>
          <CardContent className="px-2 pb-4 sm:px-5">
            {data.expensesByDay.length ? <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.expensesByDay.map((item) => ({ ...item, label: dateLabel(item.date) }))} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.65 }} minTickGap={20} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }} tickFormatter={compactMoney} width={55} />
                  <Tooltip formatter={(value) => money(Number(value))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="amount" name="Expenses" fill="#7890ad" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div> : <EmptyState text="Expense trend will appear when expense records are available." />}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base">Recent expenses</CardTitle><p className="text-xs text-muted-foreground">Latest recorded business expenses</p></CardHeader>
        <CardContent>
          {data.recentExpenses.length ? <div className="space-y-3">
            {data.recentExpenses.map((expense) => <div key={expense.id} className="flex min-w-0 items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0">
              <div className="min-w-0"><p className="truncate text-sm font-semibold">{expense.category}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{expense.description || expense.expenseNumber} · {expense.date}</p></div>
              <span className="shrink-0 text-sm font-bold">{money(expense.amount)}</span>
            </div>)}
          </div> : <EmptyState text="No expense transactions found for this period." />}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <Card className="min-w-0 rounded-2xl border-border/80 shadow-sm"><CardContent className="p-3.5 sm:p-4"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 truncate text-lg font-bold sm:text-xl">{value}</p></CardContent></Card>;
}
function EmptyState({ text }: { text: string }) {
  return <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 text-center text-sm text-muted-foreground">{text}</div>;
}
