"use client";

import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProductCategory } from "@/lib/categories/category-types";



interface CategoryCardProps {
  category: ProductCategory;
  subcategories: ProductCategory[];
  totalProductCount: number;

  onEdit: (category: ProductCategory) => void;

  onEditSubcategory: (
    category: ProductCategory
  ) => void;

  onAddSubcategory: (
    parent: ProductCategory
  ) => void;

  onToggleActive: (
    category: ProductCategory
  ) => void;

  onDelete: (
    category: ProductCategory
  ) => void;
}

export function CategoryCard({
  category,
  subcategories,
  totalProductCount,
  onEdit,
  onEditSubcategory,
  onAddSubcategory,
  onToggleActive,
  onDelete,
}: CategoryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="rounded-2xl border bg-background shadow-sm">
      {/* Category Header */}
      <div className="flex items-start justify-between gap-3 border-b p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
            <span className="text-lg">📁</span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">
                {category.name}
              </h2>

              <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                  category.active
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {category.active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            {category.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {category.description}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {totalProductCount}{" "}
                {totalProductCount === 1
                  ? "product"
                  : "products"}
              </span>

              <span>•</span>

              <span>
                {subcategories.length}{" "}
                {subcategories.length === 1
                  ? "subcategory"
                  : "subcategories"}
              </span>
            </div>
          </div>
        </div>

        {/* Category Actions */}
        <div className="relative shrink-0">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            aria-label="Category actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <>
              {/* Click-away layer */}
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border bg-background p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(category);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleActive(category);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Power className="h-4 w-4" />

                  {category.active
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <div className="my-1 border-t" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(category);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subcategories */}
      <div className="p-3 sm:p-4">
        {subcategories.length > 0 ? (
          <div className="divide-y rounded-xl border">
            {subcategories.map(
              (subcategory) => (
                <SubcategoryRow
                  key={subcategory.id}
                  subcategory={subcategory}
                  onEdit={
                    onEditSubcategory
                  }
                  onToggleActive={
                    onToggleActive
                  }
                  onDelete={onDelete}
                />
              )
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No subcategories yet
            </p>
          </div>
        )}

        {/* Add Subcategory */}
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() =>
            onAddSubcategory(category)
          }
          className="mt-3 w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Subcategory
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcategory Row                                                            */
/* -------------------------------------------------------------------------- */

interface SubcategoryRowProps {
  subcategory: ProductCategory;

  onEdit: (
    category: ProductCategory
  ) => void;

  onToggleActive: (
    category: ProductCategory
  ) => void;

  onDelete: (
    category: ProductCategory
  ) => void;
}

function SubcategoryRow({
  subcategory,
  onEdit,
  onToggleActive,
  onDelete,
}: SubcategoryRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const productCount =
    subcategory.product_count ?? 0;

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {subcategory.name}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {productCount}{" "}
            {productCount === 1
              ? "product"
              : "products"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {/* Desktop status */}
        <span
          className={`hidden rounded-full px-2 py-1 text-[11px] font-medium sm:inline-flex ${
            subcategory.active
              ? "bg-green-100 text-green-700"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {subcategory.active
            ? "Active"
            : "Inactive"}
        </span>

        {/* Subcategory Actions */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() =>
              setMenuOpen((current) => !current)
            }
            aria-label={`${subcategory.name} actions`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <>
              {/* Click-away layer */}
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border bg-background p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(subcategory);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleActive(
                      subcategory
                    );
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  <Power className="h-4 w-4" />

                  {subcategory.active
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <div className="my-1 border-t" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(subcategory);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}