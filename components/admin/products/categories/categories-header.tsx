"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoriesHeaderProps {
  onAdd: () => void;
}

export function CategoriesHeader({
  onAdd,
}: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Categories
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage product categories and subcategories.
        </p>
      </div>

      <Button onClick={onAdd} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Category
      </Button>
    </div>
  );
}