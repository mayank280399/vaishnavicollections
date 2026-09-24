"use client";

import { Settings } from "lucide-react";
import { useState } from "react";

import { SettingsHeader } from "@/components/admin/settings/settings-header";
import { ShopSettings } from "@/components/admin/settings/shop-settings";

import type { SettingsSection } from "@/lib/settings/settings-types";
import { InventorySettings } from "@/components/admin/settings/inventory-settings";
import { InvoiceSettings } from "@/components/admin/settings/invoice-settings";
import { SettingsSidebar } from "@/components/admin/settings/setting-sidebar";
import { LoyaltySettings } from "@/components/admin/settings/loyalty-settings";
import { UserSettings } from "@/components/admin/settings/user-settings";
import { AppSettings } from "@/components/admin/settings/app-settings";

const sectionLabels: Record<
  SettingsSection,
  string
> = {
  shop: "Shop & Business",
  inventory: "Inventory",
  invoice: "Invoice",
  loyalty: "Loyalty",
  users: "Users & Access",
  app: "App Preferences",
};

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("shop");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      <SettingsHeader />

      {/* Mobile / Tablet */}
      <div className="lg:hidden">
        <div className="relative">
          <Settings className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <select
            value={activeSection}
            onChange={(e) =>
              setActiveSection(
                e.target.value as SettingsSection
              )
            }
            className="h-11 w-full appearance-none rounded-lg border bg-background pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
          >
            {Object.entries(sectionLabels).map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <SettingsSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
        </aside>

        <main className="min-w-0">
          {activeSection === "shop" && (
            <ShopSettings />
          )}

          {activeSection === "inventory" && (
            <InventorySettings />
          )}

          {activeSection === "invoice" && (
            <InvoiceSettings />
          )}

          {activeSection === "loyalty" && (
            <LoyaltySettings />
          )}

          {activeSection === "users" && (
            <UserSettings />
          )}

          {activeSection === "app" && (
            <AppSettings />
          )}
        </main>
      </div>
    </div>
  );
}