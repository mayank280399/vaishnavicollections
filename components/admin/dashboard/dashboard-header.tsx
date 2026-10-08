"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardFilters } from "./dashboard-filters";

export function DashboardHeader() {
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {data: { user }} = await supabase.auth.getUser();
      const displayName = user?.user_metadata?.display_name;

      if (displayName) {
        setUserName(displayName);
      }
    }

    loadUser();
  }, []);

  return (
    <header className="mb-5 rounded-2xl border border-[#E8E4D8] bg-white p-4 shadow-[0_8px_24px_rgba(23,27,77,0.04)] sm:mb-6 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Left: Heading */}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
              
            Hello, {userName}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your business performance
          </p>
        </div>

        {/* Right: Filter */}
        <div className="w-full shrink-0 sm:w-auto">
          <DashboardFilters />
        </div>
      </div>
    </header>
  );
}
