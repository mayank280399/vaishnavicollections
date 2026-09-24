"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  CategoryFormData,
  ProductCategory,
} from "./category-types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ProductCategory | null;
  categories: ProductCategory[];
  selectedParent: ProductCategory | null;
  onSubmit: (
    data: CategoryFormData
  ) => Promise<void>;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  categories,
  selectedParent,
  onSubmit,
}: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] =
    useState("");

  const [categoryType, setCategoryType] =
    useState<"PRODUCT" | "SERVICE">(
      "PRODUCT"
    );

  const [parentId, setParentId] =
    useState("");

  const [active, setActive] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /*
   * Only top-level categories can be selected
   * as parents.
   *
   * This keeps the hierarchy:
   *
   * Category
   *   └── Subcategory
   *
   * instead of allowing:
   *
   * Category
   *   └── Subcategory
   *         └── Sub-subcategory
   */
  const parentCategories = useMemo(
    () =>
      categories.filter(
        (item) =>
          item.parent_id === null &&
          item.id !== category?.id
      ),
    [categories, category?.id]
  );

  /*
   * Generate a URL-friendly slug.
   */
  function generateSlug(
    value: string
  ) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  /*
   * Populate form when the dialog opens.
   *
   * Edit:
   * Load existing category.
   *
   * Add:
   * Start with empty values.
   *
   * Add Subcategory:
   * Automatically select the parent.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      setName(category.name);
      setSlug(category.slug);

      setDescription(
        category.description ?? ""
      );

      setCategoryType(
        category.category_type ===
          "SERVICE"
          ? "SERVICE"
          : "PRODUCT"
      );

      setParentId(
        category.parent_id ?? ""
      );

      setActive(category.active);
    } else {
      setName("");
      setSlug("");
      setDescription("");

      setCategoryType("PRODUCT");

      setParentId(
        selectedParent?.id ?? ""
      );

      setActive(true);
    }
  }, [
    open,
    category,
    selectedParent,
  ]);

  /*
   * Automatically generate slug while creating
   * a new category.
   *
   * Once editing an existing category, we leave
   * the slug under the user's control.
   */
  function handleNameChange(
    value: string
  ) {
    setName(value);

    if (!category) {
      setSlug(generateSlug(value));
    }
  }

  /*
   * Submit form.
   */
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      alert("Category name is required.");
      return;
    }

    const finalSlug =
      slug.trim() ||
      generateSlug(trimmedName);

    if (!finalSlug) {
      alert("Category slug is required.");
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        name: trimmedName,
        slug: finalSlug,
        description:
          description.trim(),
        category_type: categoryType,
        parent_id:
          parentId || null,
        active,
      });
    } finally {
      setSaving(false);
    }
  }

  const isEditing =
    Boolean(category);

  const isSubcategory =
    Boolean(
      category?.parent_id ||
        selectedParent
    );

  const title = isEditing
    ? category?.parent_id
      ? "Edit Subcategory"
      : "Edit Category"
    : isSubcategory
      ? "Add Subcategory"
      : "Add Category";

  const descriptionText =
    isEditing
      ? "Update the category details below."
      : isSubcategory
        ? "Create a subcategory under the selected parent category."
        : "Create a new product category.";

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>

          <DialogDescription>
            {descriptionText}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Category Name
            </Label>

            <Input
              id="category-name"
              value={name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value
                )
              }
              placeholder="e.g. Laddu Gopal"
              autoFocus
              disabled={saving}
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="category-slug">
              Slug
            </Label>

            <Input
              id="category-slug"
              value={slug}
              onChange={(event) =>
                setSlug(
                  generateSlug(
                    event.target.value
                  )
                )
              }
              placeholder="e.g. laddu-gopal"
              disabled={saving}
            />

            <p className="text-xs text-muted-foreground">
              Used as the URL-friendly identifier
              for the category.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="category-description">
              Description
            </Label>

            <textarea
              id="category-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Optional category description..."
              rows={3}
              disabled={saving}
              className="flex w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Category Type */}
          <div className="space-y-2">
            <Label htmlFor="category-type">
              Category Type
            </Label>

            <select
              id="category-type"
              value={categoryType}
              onChange={(event) =>
                setCategoryType(
                  event.target.value as
                    | "PRODUCT"
                    | "SERVICE"
                )
              }
              disabled={saving}
              className="flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="PRODUCT">
                Product
              </option>

              <option value="SERVICE">
                Service
              </option>
            </select>
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label htmlFor="category-parent">
              Parent Category
            </Label>

            <select
              id="category-parent"
              value={parentId}
              onChange={(event) =>
                setParentId(
                  event.target.value
                )
              }
              disabled={saving}
              className="flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                None — Top Level Category
              </option>

              {parentCategories.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>

            {selectedParent &&
              !category && (
                <p className="text-xs text-muted-foreground">
                  This subcategory will be
                  created under{" "}
                  <span className="font-medium text-foreground">
                    {selectedParent.name}
                  </span>
                  .
                </p>
              )}

            {!selectedParent && (
              <p className="text-xs text-muted-foreground">
                Leave this empty to create a
                top-level category.
              </p>
            )}
          </div>

          {/* Active */}
          <div className="rounded-xl border p-4">
            <label
              htmlFor="category-active"
              className="flex cursor-pointer items-start gap-3"
            >
              <input
                id="category-active"
                type="checkbox"
                checked={active}
                onChange={(event) =>
                  setActive(
                    event.target.checked
                  )
                }
                disabled={saving}
                className="mt-0.5 h-4 w-4 rounded border"
              />

              <div>
                <p className="text-sm font-medium">
                  Active
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Active categories can be
                  assigned to products.
                </p>
              </div>
            </label>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                saving ||
                !name.trim()
              }
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : isSubcategory
                    ? "Add Subcategory"
                    : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}