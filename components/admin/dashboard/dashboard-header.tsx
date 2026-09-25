"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardFilters } from "./dashboard-filters";

export function DashboardHeader() {
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const displayName =
        user?.user_metadata?.display_name;

      if (displayName) {
        setUserName(displayName);
      }
    }

    loadUser();
  }, []);

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Heading */}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Good Morning, {userName}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your business performance
          </p>
        </div>

        {/* Right: Filter */}
        <div className="shrink-0">
          <DashboardFilters />
        </div>
      </div>
    </header>
  );
}