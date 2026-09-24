"use client";

import { Button } from "@/components/ui/button";

import { SettingsSectionCard } from "./settings-section-card";

export function UserSettings() {
  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title="Users & Access"
        description="Manage who can access the administration area."
      >
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm font-medium">
            User management
          </p>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Add staff members, assign roles and control
            access to different parts of the application.
          </p>

          <Button
            variant="outline"
            className="mt-4"
          >
            Manage Users
          </Button>
        </div>
      </SettingsSectionCard>
    </div>
  );
}