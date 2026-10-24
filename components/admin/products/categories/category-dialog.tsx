
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

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

import {
  CategoryFormData,
  ProductCategory,
} from "@/lib/categories/category-types";

const supabase = createClient();

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
  const [description, setDescription] = useState("");

  const [categoryType, setCategoryType] =
    useState<"PRODUCT" | "SERVICE">("PRODUCT");

  const [parentId, setParentId] = useState("");
  const [active, setActive] = useState(true);
  const [showSubcategory, setShowSubcategory] =
    useState(true);
  const [isTopCollection, setIsTopCollection] =
    useState(false);

  // Existing category-card image state.
  const [imageUrl, setImageUrl] =
    useState<string | null>(null);
  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);
  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  // Separate banner image state.
  const [bannerImageUrl, setBannerImageUrl] =
    useState<string | null>(null);
  const [selectedBannerImage, setSelectedBannerImage] =
    useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] =
    useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  /*
   * Only top-level categories can be selected
   * as parents.
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
  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  /*
   * Populate form when dialog opens.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (category) {
      setName(category.name);
      setSlug(category.slug);

      setDescription(category.description ?? "");

      setCategoryType(
        category.category_type === "SERVICE"
          ? "SERVICE"
          : "PRODUCT"
      );

      setParentId(category.parent_id ?? "");
      setActive(category.active);

      /*
       * Existing categories created before
       * show_subcategory was added default to true.
       */
      setShowSubcategory(
        category.show_subcategory ?? true
      );

      setIsTopCollection(
        category.is_top_collection ?? false
      );

      // Existing category-card image.
      setImageUrl(category.image_url ?? null);
      setImagePreview(category.image_url ?? null);
      setSelectedImage(null);

      // Existing banner image.
      setBannerImageUrl(
        category.banner_image_url ?? null
      );
      setBannerImagePreview(
        category.banner_image_url ?? null
      );
      setSelectedBannerImage(null);

      setSortOrder(category.sort_order ?? 0);
    } else {
      setName("");
      setSlug("");
      setDescription("");

      setCategoryType("PRODUCT");
      setParentId(selectedParent?.id ?? "");
      setActive(true);

      /*
       * New subcategories are visible by default
       * unless the user turns this off.
       */
      setShowSubcategory(true);
      setIsTopCollection(false);

      // Reset category-card image.
      setImageUrl(null);
      setImagePreview(null);
      setSelectedImage(null);

      // Reset banner image.
      setBannerImageUrl(null);
      setBannerImagePreview(null);
      setSelectedBannerImage(null);

      setSortOrder(0);
    }
  }, [open, category, selectedParent]);

  /*
   * Automatically generate slug while creating.
   */
  function handleNameChange(value: string) {
    setName(value);

    if (!category) {
      setSlug(generateSlug(value));
    }
  }

  /*
   * Validate an image file.
   * Used independently by both image fields.
   */
  function validateImageFile(file: File): boolean {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return false;
    }

    return true;
  }

  /*
   * Handle category-card image selection.
   */
  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImageFile(file)) {
      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    setImagePreview(URL.createObjectURL(file));
  }

  /*
   * Handle banner image selection.
   */
  function handleBannerImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImageFile(file)) {
      event.target.value = "";
      return;
    }

    setSelectedBannerImage(file);

    setBannerImagePreview(URL.createObjectURL(file));
  }

  /*
   * Remove the banner from this form.
   * The database is updated when the form is saved.
   */
  function handleRemoveBannerImage() {
    setSelectedBannerImage(null);
    setBannerImageUrl(null);
    setBannerImagePreview(null);
  }

  /*
   * Upload an image to Supabase Storage.
   *
   * Category images keep their existing root-level
   * path. Banner images are stored under /banners.
   */
  async function uploadImage(
    file: File,
    folder?: string
  ): Promise<string> {
    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const safeName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const fileName =
      `${safeName || "category"}-${crypto.randomUUID()}.${fileExtension}`;

    const filePath = folder
      ? `${folder}/${fileName}`
      : fileName;

    const { error: uploadError } =
      await supabase.storage
        .from("category-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } =
      supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  /*
   * Submit form.
   */
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Category name is required.");
      return;
    }

    const finalSlug =
      slug.trim() || generateSlug(trimmedName);

    if (!finalSlug) {
      alert("Category slug is required.");
      return;
    }

    /*
     * Top Collections are only intended
     * for top-level categories.
     */
    const finalIsTopCollection = parentId
      ? false
      : isTopCollection;

    /*
     * Show Subcategory only applies to
     * subcategories.
     *
     * Top-level categories always get true
     * because this field controls subcategory
     * visibility, not category visibility.
     */
    const finalShowSubcategory = parentId
      ? showSubcategory
      : true;

    setSaving(true);

    try {
      let finalImageUrl = imageUrl;
      let finalBannerImageUrl = bannerImageUrl;

      /*
       * Upload a new category-card image only
       * when the user selected one.
       */
      if (selectedImage) {
        finalImageUrl = await uploadImage(selectedImage);
      }

      /*
       * Upload a new banner only when the user
       * selected one. If the banner was removed,
       * finalBannerImageUrl remains null.
       */
      if (selectedBannerImage) {
        finalBannerImageUrl = await uploadImage(
          selectedBannerImage,
          "banners"
        );
      }

      await onSubmit({
        name: trimmedName,
        slug: finalSlug,
        description: description.trim(),
        category_type: categoryType,
        parent_id: parentId || null,
        active,
        show_subcategory: finalShowSubcategory,
        is_top_collection: finalIsTopCollection,
        image_url: finalImageUrl,
        banner_image_url: finalBannerImageUrl,
        sort_order: finalIsTopCollection
          ? Math.max(0, Number(sortOrder) || 0)
          : 0,
      });
    } catch (error) {
      console.error("Failed to save category:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  const isEditing = Boolean(category);

  const isSubcategory = Boolean(
    category?.parent_id || selectedParent
  );

  const title = isEditing
    ? category?.parent_id
      ? "Edit Subcategory"
      : "Edit Category"
    : isSubcategory
      ? "Add Subcategory"
      : "Add Category";

  const descriptionText = isEditing
    ? "Update the category details below."
    : isSubcategory
      ? "Create a subcategory under the selected parent category."
      : "Create a new product category.";

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-lg !max-w-[1400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

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
                handleNameChange(event.target.value)
              }
              placeholder="e.g. Laddu Gopal Poshak & Shringar"
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
                setSlug(generateSlug(event.target.value))
              }
              placeholder="e.g. laddu-gopal-poshak-shringar"
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
                setDescription(event.target.value)
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
                  event.target.value as "PRODUCT" | "SERVICE"
                )
              }
              disabled={saving}
              className="flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="PRODUCT">Product</option>
              <option value="SERVICE">Service</option>
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
              onChange={(event) => {
                const nextParentId = event.target.value;

                setParentId(nextParentId);

                /*
                 * Subcategories cannot be
                 * Top Collections.
                 */
                if (nextParentId) {
                  setIsTopCollection(false);
                  setSortOrder(0);
                }
              }}
              disabled={saving}
              className="flex h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                None — Top Level Category
              </option>

              {parentCategories.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>

            {selectedParent && !category && (
              <p className="text-xs text-muted-foreground">
                This subcategory will be created under{" "}
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

          {/* Category Image — existing functionality */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="category-image">
                Category Image
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                This image will be used for the
                category card on the storefront.
              </p>
            </div>

            {imagePreview && (
              <div className="overflow-hidden rounded-xl border bg-muted">
                <img
                  src={imagePreview}
                  alt={name || "Category preview"}
                  className="h-48 w-full object-cover"
                />
              </div>
            )}

            <Input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={saving}
              className="cursor-pointer"
            />

            <p className="text-xs text-muted-foreground">
              Recommended: high-quality JPG, PNG
              or WebP. Maximum 5 MB.
            </p>
          </div>

          {/* Banner Image — new functionality */}
          <div className="space-y-3 rounded-xl border p-4">
            <div>
              <Label htmlFor="category-banner-image">
                Banner Image
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Optional. Used for the category or
                collection banner on the storefront.
                This is separate from the Category Image.
              </p>
            </div>

            {bannerImagePreview ? (
              <div className="space-y-2">
                <div className="overflow-hidden rounded-xl border bg-muted">
                  <img
                    src={bannerImagePreview}
                    alt={`${name || "Category"} banner preview`}
                    className="max-h-64 w-full object-cover"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveBannerImage}
                    disabled={saving}
                  >
                    Remove Banner
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed bg-muted/30 p-4 text-center">
                <div>
                  <p className="text-sm font-medium">
                    No banner image selected
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose an image below to add a banner.
                  </p>
                </div>
              </div>
            )}

            <Input
              id="category-banner-image"
              type="file"
              accept="image/*"
              onChange={handleBannerImageChange}
              disabled={saving}
              className="cursor-pointer"
            />

            <p className="text-xs text-muted-foreground">
              Recommended: a wide landscape image.
              JPG, PNG or WebP. Maximum 5 MB.
            </p>
          </div>

          {/* Top Collection */}
          <div
            className={`rounded-xl border p-4 ${
              isSubcategory ? "bg-muted/40" : ""
            }`}
          >
            <label
              htmlFor="category-top-collection"
              className={`flex items-start gap-3 ${
                isSubcategory
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <input
                id="category-top-collection"
                type="checkbox"
                checked={
                  isSubcategory ? false : isTopCollection
                }
                onChange={(event) =>
                  setIsTopCollection(event.target.checked)
                }
                disabled={saving || isSubcategory}
                className="mt-0.5 h-4 w-4 rounded border"
              />

              <div>
                <p className="text-sm font-medium">
                  Is Top Collection
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Show this category in the Top Collections
                  section on the storefront.
                </p>

                {isSubcategory && (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Top Collections can only contain
                    top-level categories.
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Display Order */}
          {!isSubcategory && isTopCollection && (
            <div className="space-y-2">
              <Label htmlFor="category-sort-order">
                Display Order
              </Label>

              <Input
                id="category-sort-order"
                type="number"
                min={0}
                step={1}
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(Number(event.target.value))
                }
                disabled={saving}
                placeholder="1"
              />

              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in Top Collections.
              </p>
            </div>
          )}

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
                  setActive(event.target.checked)
                }
                disabled={saving}
                className="mt-0.5 h-4 w-4 rounded border"
              />

              <div>
                <p className="text-sm font-medium">
                  Active
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Active categories can be assigned to products.
                </p>
              </div>
            </label>
          </div>

          {/* Show Subcategory */}
          {isSubcategory && (
            <div className="rounded-xl border p-4">
              <label
                htmlFor="category-show-subcategory"
                className="flex cursor-pointer items-start gap-3"
              >
                <input
                  id="category-show-subcategory"
                  type="checkbox"
                  checked={showSubcategory}
                  onChange={(event) =>
                    setShowSubcategory(event.target.checked)
                  }
                  disabled={saving}
                  className="mt-0.5 h-4 w-4 rounded border"
                />

                <div>
                  <p className="text-sm font-medium">
                    Show Subcategory
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Show this subcategory on the storefront
                    category page.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving || !name.trim()}
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
