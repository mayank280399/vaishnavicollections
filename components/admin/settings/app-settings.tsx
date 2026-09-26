"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { SettingsSectionCard } from "./settings-section-card";

export function AppSettings() {
  const [theme, setTheme] = useState("system");
  const [currency, setCurrency] = useState("INR");
  const [dateFormat, setDateFormat] =
    useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] =
    useState("12");
  const [pageSize, setPageSize] = useState("25");
  const [dashboardPeriod, setDashboardPeriod] =
    useState("30");

  const [confirmDelete, setConfirmDelete] =
    useState(true);

  const [autoRefresh, setAutoRefresh] =
    useState(false);

  const [notifications, setNotifications] =
    useState(true);

  const [compactTables, setCompactTables] =
    useState(false);

  const handleSave = () => {
    console.log({
      theme,
      currency,
      dateFormat,
      timeFormat,
      pageSize,
      dashboardPeriod,
      confirmDelete,
      autoRefresh,
      notifications,
      compactTables,
    });
  };

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Appearance"
        description="Control how the admin application looks."
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingSelect
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                ["system", "System"],
                ["light", "Light"],
                ["dark", "Dark"],
              ]}
            />

            <SettingSelect
              label="Default Page Size"
              value={pageSize}
              onChange={setPageSize}
              options={[
                ["10", "10 records"],
                ["25", "25 records"],
                ["50", "50 records"],
                ["100", "100 records"],
              ]}
            />
          </div>

          <SettingToggle
            title="Compact Tables"
            description="Reduce spacing in tables to display more records."
            checked={compactTables}
            onChange={setCompactTables}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Date & Time"
        description="Choose how dates and times are displayed."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingSelect
            label="Date Format"
            value={dateFormat}
            onChange={setDateFormat}
            options={[
              ["DD/MM/YYYY", "DD/MM/YYYY"],
              ["MM/DD/YYYY", "MM/DD/YYYY"],
              ["YYYY-MM-DD", "YYYY-MM-DD"],
            ]}
          />

          <SettingSelect
            label="Time Format"
            value={timeFormat}
            onChange={setTimeFormat}
            options={[
              ["12", "12-hour"],
              ["24", "24-hour"],
            ]}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Currency"
        description="Default currency used throughout the application."
      >
        <SettingSelect
          label="Currency"
          value={currency}
          onChange={setCurrency}
          options={[
            ["INR", "₹ Indian Rupee (INR)"],
            ["USD", "$ US Dollar (USD)"],
            ["EUR", "€ Euro (EUR)"],
          ]}
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Dashboard"
        description="Configure the default dashboard reporting period."
      >
        <div className="max-w-md">
          <SettingSelect
            label="Default Dashboard Period"
            value={dashboardPeriod}
            onChange={setDashboardPeriod}
            options={[
              ["1", "Today"],
              ["7", "Last 7 days"],
              ["30", "Last 30 days"],
              ["90", "Last 90 days"],
              ["365", "Last 12 months"],
            ]}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Application Behavior"
        description="Control common application behavior."
      >
        <div className="space-y-3">
          <SettingToggle
            title="Confirm Before Delete"
            description="Ask for confirmation before deleting records."
            checked={confirmDelete}
            onChange={setConfirmDelete}
          />

          <SettingToggle
            title="Automatic Refresh"
            description="Automatically refresh data on supported pages."
            checked={autoRefresh}
            onChange={setAutoRefresh}
          />

          <SettingToggle
            title="Notifications"
            description="Show success and warning notifications."
            checked={notifications}
            onChange={setNotifications}
          />
        </div>
      </SettingsSectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save App Preferences
        </Button>
      </div>
    </div>
  );
}

function SettingSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map(([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
        className="h-4 w-4 shrink-0"
      />
    </label>
  );
}