"use client";

import { Settings } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Settings className="h-6 w-6" />
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="text-sm text-muted-foreground">
          Configure your shop and application preferences.
        </p>
      </div>
    </div>
  );
}