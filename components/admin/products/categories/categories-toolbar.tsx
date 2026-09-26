"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CategoriesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: "ALL" | "ACTIVE" | "INACTIVE";
  onFilterChange: (
    value: "ALL" | "ACTIVE" | "INACTIVE"
  ) => void;
}

export function CategoriesToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: CategoriesToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search categories..."
          className="pl-9"
        />
      </div>

      <div className="flex rounded-lg border p-1">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              filter === item
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {item === "ALL"
              ? "All"
              : item === "ACTIVE"
                ? "Active"
                : "Inactive"}
          </button>
        ))}
      </div>
    </div>
  );
}