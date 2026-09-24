"use client";

import {
  FileText,
  Gift,
  Package,
  Settings2,
  Store,
  Users,
} from "lucide-react";

import type { SettingsSection } from "./settings-types";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

const sections = [
  {
    id: "shop" as const,
    label: "Shop & Business",
    description: "Business information",
    icon: Store,
  },
  {
    id: "inventory" as const,
    label: "Inventory",
    description: "Stock preferences",
    icon: Package,
  },
  {
    id: "invoice" as const,
    label: "Invoice",
    description: "Invoice configuration",
    icon: FileText,
  },
  {
    id: "loyalty" as const,
    label: "Loyalty",
    description: "Rewards configuration",
    icon: Gift,
  },
  {
    id: "users" as const,
    label: "Users & Access",
    description: "Staff and permissions",
    icon: Users,
  },
  {
    id: "app" as const,
    label: "App Preferences",
    description: "Application behavior",
    icon: Settings2,
  },
];

export function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <nav className="space-y-1">
      {sections.map((section) => {
        const Icon = section.icon;
        const active = activeSection === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionChange(section.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
              active
                ? "bg-muted font-medium"
                : "hover:bg-muted/60"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                active ? "bg-background" : "bg-muted/40"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-sm">{section.label}</p>

              <p className="truncate text-xs text-muted-foreground">
                {section.description}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}