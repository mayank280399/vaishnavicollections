"use client";

import { DashboardHeader } from "./dashboard-header";
import { FinancialKpiGrid } from "./financial/financial-kpi-grid";

import { SalesTrend } from "./sales/sales-trend";
import { SalesByCategory } from "./sales/sales-by-category";
import { PaymentMethodBreakdown } from "./sales/payment-method-breakdown";

import { InventoryOverview } from "./inventory/inventory-overview";

import { TopSellingProducts } from "./products/top-selling-products";
import { RecentSales } from "./products/recent-sales";

import { CustomerGrowth } from "./customers/customer-growth";
import { CustomerSource } from "./customers/customer-source";

import { ExpensesByCategory } from "./expenses/expenses-by-category";

import { ProfitabilityOverview } from "./profitability/profitability-overview";

import { QuickActions } from "./quick-actions/quick-actions";
import { AlertsActionRequired } from "./alerts/alerts-action-required";
import { RecentActivity } from "./activity/recent-activity";
import { LoyaltyProgram } from "./loyalty/loyalty-program";

import type { DashboardData } from "@/lib/dashboard/types";

type DashboardProps = {
  data: DashboardData;
};

export function Dashboard({ data }: DashboardProps) {
  console.log("Dashboard data:", data); // Debugging line to check the data being passed
  return (
    <div className="w-full min-w-0">
      {/* HEADER */}
      <DashboardHeader />

      {/* MAIN DASHBOARD + RIGHT RAIL */}
      <div
        className="
          mt-5 grid min-w-0 grid-cols-1 gap-4
          xl:grid-cols-[minmax(0,1fr)_220px]
        "
      >
        {/* =========================================
            MAIN DASHBOARD
        ========================================== */}
        <main className="min-w-0">
          {/* FINANCIAL KPI CARDS */}
          <FinancialKpiGrid data={data} />

          {/* =========================================
              SALES ANALYTICS
          ========================================== */}
          <section
            className="
              mt-4 grid min-w-0 grid-cols-1 gap-4
              lg:grid-cols-12
            "
          >
            <div className="min-w-0 lg:col-span-5">
              <SalesTrend data={data} />
            </div>

            <div className="min-w-0 lg:col-span-4">
              <SalesByCategory data={data.salesByCategory} />
            </div>

            <div className="min-w-0 lg:col-span-3">
              <PaymentMethodBreakdown data={data} />
            </div>
          </section>

          {/* =========================================
              INVENTORY / PRODUCTS / RECENT SALES
          ========================================== */}
          <section
            className="
              mt-4 grid min-w-0 grid-cols-1 gap-4
              lg:grid-cols-12
            "
          >
            <div className="min-w-0 lg:col-span-4">
              <InventoryOverview data={data} />
            </div>

            <div className="min-w-0 lg:col-span-4">
              <TopSellingProducts data={data} />
            </div>

            <div className="min-w-0 lg:col-span-4">
              <RecentSales data={data} />
            </div>
          </section>

          {/* =========================================
              CUSTOMER / EXPENSE / PROFITABILITY
          ========================================== */}
          <section
            className="
              mt-4 grid min-w-0 grid-cols-1 gap-4
              sm:grid-cols-2
              lg:grid-cols-12
            "
          >
            <div className="min-w-0 lg:col-span-3">
              <CustomerGrowth data={data} />
            </div>

            <div className="min-w-0 lg:col-span-3">
              <CustomerSource data={data} />
            </div>

            <div className="min-w-0 lg:col-span-3">
              <ExpensesByCategory data={data} />
            </div>

            <div className="min-w-0 lg:col-span-3">
              <ProfitabilityOverview data={data} />
            </div>
          </section>
        </main>

        {/* =========================================
            RIGHT RAIL
        ========================================== */}
        <aside
          className="
            grid min-w-0 grid-cols-1 gap-4
            sm:grid-cols-2
            xl:block xl:space-y-4
          "
        >
          <QuickActions />

          <AlertsActionRequired data={data} />

          <RecentActivity data={data} />

          <LoyaltyProgram data={data} />
        </aside>
      </div>
    </div>
  );
}