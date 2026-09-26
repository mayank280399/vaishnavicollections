"use client";

import {
  Banknote,
  ChartNoAxesCombined,
  Receipt,
  ShoppingCart,
  Wallet,
  Percent,
} from "lucide-react";

import type { DashboardData } from "@/lib/dashboard/types";

import { FinancialKpiCard } from "./financial-kpi-card";

type FinancialKpiGridProps = {
  data: DashboardData;
};

export function FinancialKpiGrid({
  data,
}: FinancialKpiGridProps) {
  const isProfit = data.cashSurplus >= 0;

  return (
    <section
      className="
        grid grid-cols-1 gap-3
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-6
      "
    >
      <FinancialKpiCard
        title="Total Sales"
        value={data.totalSales}
        change={data.revenueChange}
        icon={Banknote}
        tone="purple"
      />

      <FinancialKpiCard
        title="Total Purchases"
        value={data.totalPurchases}
        //change={data.purchaseChange}
        icon={ShoppingCart}
        tone="blue"
      />

      <FinancialKpiCard
        title="Total Expenses"
        value={data.totalExpenses}
        change={data.expenseChange}
        icon={Wallet}
        tone="orange"
      />

      <FinancialKpiCard
        title="Gross Profit"
        value={data.grossProfit}
        change={data.grossProfitChange}
        icon={ChartNoAxesCombined}
        tone="green"
      />

      <FinancialKpiCard
  title={data.cashSurplus >= 0 ? "Cash Surplus" : "Cash Deficit"}
  value={data.cashSurplus}
  icon={Receipt}
  tone={data.cashSurplus >= 0 ? "indigo" : "red"}
  showSign
/>

<FinancialKpiCard 
  title="Cash Margin" 
  value={
    data.totalSales > 0
      ? (data.cashSurplus / data.totalSales) * 100
      : 0
  }
  icon={Percent} 
  tone={isProfit ? "green" : "red"} 
  isCurrency={false} 
/>
    </section>
  );
}