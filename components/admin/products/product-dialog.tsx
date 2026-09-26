"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Loader2,
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  ProductImageUploader,
  type ExistingProductImage,
  type ProductImageItem,
  MIN_PRODUCT_IMAGES,
  MAX_PRODUCT_IMAGES,
} from "@/components/admin/products/product-image-uploader";

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  active: boolean;
};

type Product = {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  short_description: string | null;
  selling_price: number | null;
  cost_price: number | null;
  stock_quantity: number | null;
  online_enabled: boolean | null;
  online_price: number | null;
  visibility:
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";
  featured: boolean | null;
  created_at: string;
  updated_at: string;
};

type ProductDialogProps = {
  product?: Product | null;
  categories: Category[];

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  onSaved?: () => void;
};

const PRODUCT_IMAGE_BUCKET =
  "product-images";

const generateSlug = (
  value: string
) => {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export function ProductDialog({
  product = null,
  categories,
  open: controlledOpen,
  onOpenChange,
  onSaved,
}: ProductDialogProps) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const isEditMode =
    Boolean(product);

  const isControlled =
    controlledOpen !== undefined;

  const [internalOpen, setInternalOpen] =
    useState(false);

  const open =
    controlledOpen ?? internalOpen;

  const [saving, setSaving] =
    useState(false);

  const [loadingImages, setLoadingImages] =
    useState(false);

  const [error, setError] =
    useState("");

  const [name, setName] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [parentCategoryId, setParentCategoryId] =
    useState("");

  const [sku, setSku] =
    useState("");

  const [shortDescription, setShortDescription] =
    useState("");

  const [costPrice, setCostPrice] =
    useState("");

  const [sellingPrice, setSellingPrice] =
    useState("");

  const [onlinePrice, setOnlinePrice] =
    useState("");

  const [stockQuantity, setStockQuantity] =
    useState("");

  const [onlineEnabled, setOnlineEnabled] =
    useState(false);

  const [featured, setFeatured] =
    useState(false);

  const [visibility, setVisibility] =
    useState<
      "DRAFT" | "PUBLISHED" | "ARCHIVED"
    >("PUBLISHED");

  const [images, setImages] =
    useState<ProductImageItem[]>([]);

  const [originalImages, setOriginalImages] =
    useState<ExistingProductImage[]>([]);

  const parentCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.parent_id ===
            null
        ),
      [categories]
    );

  const subcategories =
    useMemo(() => {
      if (!parentCategoryId) {
        return [];
      }

      return categories.filter(
        (category) =>
          category.parent_id ===
          parentCategoryId
      );
    }, [
      categories,
      parentCategoryId,
    ]);

  function resetForm() {
    setName("");
    setCategoryId("");
    setParentCategoryId("");
    setSku("");
    setShortDescription("");

    setCostPrice("");
    setSellingPrice("");
    setOnlinePrice("");
    setStockQuantity("");

    setOnlineEnabled(false);
    setFeatured(false);
    setVisibility("PUBLISHED");

    setImages([]);
    setOriginalImages([]);

    setError("");
    setLoadingImages(false);
  }

  async function loadProductImages(
    productId: string
  ) {
    setLoadingImages(true);

    const {
      data,
      error: imageError,
    } = await supabase
      .from("product_images")
      .select(`
        id,
        product_id,
        variant_id,
        image_url,
        alt_text,
        sort_order,
        is_primary
      `)
      .eq(
        "product_id",
        productId
      )
      .order("sort_order", {
        ascending: true,
      });

    if (imageError) {
      console.error(
        "Error loading product images:",
        imageError
      );

      setError(
        imageError.message
      );
      setOriginalImages([]);
      setImages([]);
      setLoadingImages(false);

      return;
    }

    const loaded =
      (data ??
        []) as ExistingProductImage[];

    setOriginalImages(loaded);

    setImages(
      loaded.map((image) => ({
        tempId: `existing-${image.id}`,
        id: image.id,
        previewUrl:
          image.image_url,
        imageUrl:
          image.image_url,
        altText:
          image.alt_text ?? "",
        isPrimary:
          image.is_primary,
        sortOrder:
          image.sort_order,
        isNew: false,
      }))
    );

    setLoadingImages(false);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    if (!product) {
      resetForm();
      return;
    }

    const selectedCategory =
      categories.find(
        (category) =>
          category.id ===
          product.category_id
      );

    let parentId = "";

    if (selectedCategory) {
      parentId =
        selectedCategory.parent_id ??
        selectedCategory.id;
    }

    setName(
      product.name ?? ""
    );

    setCategoryId(
      product.category_id ?? ""
    );

    setParentCategoryId(
      parentId
    );

    setSku(
      product.sku ?? ""
    );

    setShortDescription(
      product.short_description ?? ""
    );

    setCostPrice(
      product.cost_price !==
        null &&
        product.cost_price !==
          undefined
        ? String(
            product.cost_price
          )
        : ""
    );

    setSellingPrice(
      product.selling_price !==
        null &&
        product.selling_price !==
          undefined
        ? String(
            product.selling_price
          )
        : ""
    );

    setOnlinePrice(
      product.online_price !==
        null &&
        product.online_price !==
          undefined
        ? String(
            product.online_price
          )
        : ""
    );

    setStockQuantity(
      product.stock_quantity !==
        null &&
        product.stock_quantity !==
          undefined
        ? String(
            product.stock_quantity
          )
        : ""
    );

    setOnlineEnabled(
      Boolean(
        product.online_enabled
      )
    );

    setFeatured(
      Boolean(product.featured)
    );

    setVisibility(
      product.visibility ??
        "PUBLISHED"
    );

    loadProductImages(
      product.id
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    product,
    categories,
  ]);

  function handleOpenChange(
    value: boolean
  ) {
    if (!isControlled) {
      setInternalOpen(value);
    }

    onOpenChange?.(value);

    if (!value && !saving) {
      resetForm();
    }
  }

  function handleParentCategoryChange(
    value: string
  ) {
    setParentCategoryId(value);
    setCategoryId("");
  }

  function handleSubcategoryChange(
    value: string
  ) {
    setCategoryId(value);
  }

  function validateImages() {
    if (
      images.length <
      MIN_PRODUCT_IMAGES
    ) {
      return `Please add at least ${MIN_PRODUCT_IMAGES} product images.`;
    }

    if (
      images.length >
      MAX_PRODUCT_IMAGES
    ) {
      return `You can have a maximum of ${MAX_PRODUCT_IMAGES} product images.`;
    }

    const primaryCount =
      images.filter(
        (image) =>
          image.isPrimary
      ).length;

    if (primaryCount !== 1) {
      return "Please select exactly one primary image.";
    }

    return null;
  }

  async function uploadNewImages(
    productId: string,
    newImages: ProductImageItem[]
  ) {
    const uploaded: {
      storagePath: string;
      imageUrl: string;
      tempId: string;
      altText: string;
      isPrimary: boolean;
      sortOrder: number;
    }[] = [];

    try {
      for (
        let index = 0;
        index < newImages.length;
        index++
      ) {
        const image =
          newImages[index];

        if (!image.file) {
          continue;
        }

        const extension =
          image.file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const storagePath =
          `${productId}/${crypto.randomUUID()}.${extension}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from(
            PRODUCT_IMAGE_BUCKET
          )
          .upload(
            storagePath,
            image.file,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                image.file.type,
            }
          );

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrlData,
        } =
          supabase.storage
            .from(
              PRODUCT_IMAGE_BUCKET
            )
            .getPublicUrl(
              storagePath
            );

        uploaded.push({
          storagePath,
          imageUrl:
            publicUrlData.publicUrl,
          tempId: image.tempId,
          altText:
            image.altText.trim(),
          isPrimary:
            image.isPrimary,
          sortOrder:
            image.sortOrder,
        });
      }

      return uploaded;
    } catch (error) {
      if (uploaded.length) {
        await supabase.storage
          .from(
            PRODUCT_IMAGE_BUCKET
          )
          .remove(
            uploaded.map(
              (item) =>
                item.storagePath
            )
          );
      }

      throw error;
    }
  }

  function getStoragePathFromUrl(
    imageUrl: string
  ) {
    const marker =
      `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;

    const index =
      imageUrl.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(
      imageUrl.slice(
        index + marker.length
      )
    );
  }

  async function deleteStorageFiles(
    urls: string[]
  ) {
    const paths = urls
      .map(
        getStoragePathFromUrl
      )
      .filter(
        (
          path
        ): path is string =>
          Boolean(path)
      );

    if (!paths.length) {
      return;
    }

    const {
      error: storageError,
    } =
      await supabase.storage
        .from(
          PRODUCT_IMAGE_BUCKET
        )
        .remove(paths);

    if (storageError) {
      console.error(
        "Storage cleanup error:",
        storageError
      );
    }
  }

  async function saveProductImages(
    productId: string
  ) {
    const currentExistingIds =
      new Set(
        images
          .filter(
            (image) =>
              !image.isNew &&
              image.id
          )
          .map(
            (image) =>
              image.id as string
          )
      );

    const removedExisting =
      originalImages.filter(
        (image) =>
          !currentExistingIds.has(
            image.id
          )
      );

    /*
     * Delete removed image records.
     */
    if (
      removedExisting.length
    ) {
      const removedIds =
        removedExisting.map(
          (image) =>
            image.id
        );

      const {
        error:
          deleteImageError,
      } = await supabase
        .from("product_images")
        .delete()
        .in(
          "id",
          removedIds
        );

      if (deleteImageError) {
        throw deleteImageError;
      }

      await deleteStorageFiles(
        removedExisting.map(
          (image) =>
            image.image_url
        )
      );
    }

    /*
     * Upload new images.
     */
    const newImages =
      images.filter(
        (image) =>
          image.isNew
      );

    const uploaded =
      await uploadNewImages(
        productId,
        newImages
      );

    /*
     * Insert uploaded image records.
     */
    if (uploaded.length) {
      const rows =
        uploaded.map(
          (image) => ({
            product_id:
              productId,
            variant_id:
              null,
            image_url:
              image.imageUrl,
            alt_text:
              image.altText ||
              null,
            sort_order:
              image.sortOrder,
            is_primary:
              image.isPrimary,
          })
        );

      const {
        error:
          insertImageError,
      } = await supabase
        .from("product_images")
        .insert(rows);

      if (insertImageError) {
        await deleteStorageFiles(
          uploaded.map(
            (image) =>
              image.storagePath
          )
        );

        throw insertImageError;
      }
    }

    /*
     * Refresh all current image IDs.
     */
    const {
      data: savedImages,
      error:
        savedImagesError,
    } = await supabase
      .from("product_images")
      .select(`
        id,
        image_url,
        alt_text,
        sort_order,
        is_primary
      `)
      .eq(
        "product_id",
        productId
      );

    if (savedImagesError) {
      throw savedImagesError;
    }

    /*
     * Reapply primary + ordering safely.
     *
     * First set all images to non-primary.
     */
    if (savedImages?.length) {
      const {
        error:
          resetPrimaryError,
      } = await supabase
        .from("product_images")
        .update({
          is_primary:
            false,
        })
        .eq(
          "product_id",
          productId
        );

      if (resetPrimaryError) {
        throw resetPrimaryError;
      }

      /*
       * Match images by URL.
       */
      for (
        const image of images
      ) {
        const dbImage =
          savedImages.find(
            (saved) =>
              saved.id ===
                image.id ||
              saved.image_url ===
                image.imageUrl
          );

        if (!dbImage) {
          continue;
        }

        const {
          error:
            updateImageError,
        } = await supabase
          .from("product_images")
          .update({
            sort_order:
              image.sortOrder,
            alt_text:
              image.altText.trim() ||
              null,
          })
          .eq(
            "id",
            dbImage.id
          );

        if (updateImageError) {
          throw updateImageError;
        }
      }

      const primaryImage =
        images.find(
          (image) =>
            image.isPrimary
        );

      if (primaryImage) {
        const dbPrimary =
          savedImages.find(
            (saved) =>
              saved.id ===
                primaryImage.id ||
              saved.image_url ===
                primaryImage.imageUrl
          );

        if (dbPrimary) {
          const {
            error:
              primaryError,
          } = await supabase
            .from("product_images")
            .update({
              is_primary:
                true,
            })
            .eq(
              "id",
              dbPrimary.id
            );

          if (primaryError) {
            throw primaryError;
          }
        }
      }
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!parentCategoryId) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (!categoryId) {
      setError(
        "Please select a subcategory."
      );
      return;
    }

    if (
      sellingPrice === "" ||
      Number(sellingPrice) < 0
    ) {
      setError(
        "Please enter a valid selling price."
      );
      return;
    }

    if (
      costPrice !== "" &&
      Number(costPrice) < 0
    ) {
      setError(
        "Cost price cannot be negative."
      );
      return;
    }

    if (
      onlinePrice !== "" &&
      Number(onlinePrice) < 0
    ) {
      setError(
        "Online price cannot be negative."
      );
      return;
    }

    if (
      stockQuantity !== "" &&
      Number(stockQuantity) < 0
    ) {
      setError(
        "Stock quantity cannot be negative."
      );
      return;
    }

    const imageValidation =
      validateImages();

    if (imageValidation) {
      setError(
        imageValidation
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: trimmedName,

        slug:
          generateSlug(
            trimmedName
          ),

        category_id:
          categoryId,

        sku:
          sku.trim() || null,

        short_description:
          shortDescription.trim() ||
          null,

        cost_price:
          Number(
            costPrice || 0
          ),

        selling_price:
          Number(
            sellingPrice || 0
          ),

        online_price:
          onlinePrice === ""
            ? null
            : Number(
                onlinePrice
              ),

        stock_quantity:
          Number(
            stockQuantity || 0
          ),

        online_enabled:
          onlineEnabled,

        featured:
          featured,

        visibility:
          visibility,
      };

      let productId =
        product?.id ?? null;

      if (
        isEditMode &&
        product
      ) {
        const {
          error: updateError,
        } = await supabase
          .from("products")
          .update(payload)
          .eq(
            "id",
            product.id
          );

        if (updateError) {
          throw updateError;
        }
      } else {
        const {
          data:
            insertedProduct,
          error:
            insertError,
        } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) {
          throw insertError;
        }

        productId =
          insertedProduct.id;
      }

      if (!productId) {
        throw new Error(
          "Unable to determine product ID."
        );
      }

      try {
        await saveProductImages(
          productId
        );
      } catch (imageError) {
        /*
         * If this was a brand-new product,
         * remove it when image saving fails.
         */
        if (!isEditMode) {
          await supabase
            .from("products")
            .delete()
            .eq(
              "id",
              productId
            );
        }

        throw imageError;
      }

      onSaved?.();

      handleOpenChange(false);
    } catch (err) {
      console.error(
        "Product save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      {!isEditMode && (
        <Button
          type="button"
          onClick={() =>
            handleOpenChange(true)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? "Edit Product"
              : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >
          {/* BASIC INFORMATION */}
          <section className="space-y-4">
            <div>
              <h3 className="font-medium">
                Basic Information
              </h3>

              <p className="text-sm text-muted-foreground">
                Enter the basic details of the product.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-name">
                Product Name *
              </Label>

              <Input
                id="product-name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="e.g. Designer Laddu Gopal Poshak"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Category *
                </Label>

                <select
                  value={
                    parentCategoryId
                  }
                  onChange={(event) =>
                    handleParentCategoryChange(
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">
                    Select Category
                  </option>

                  {parentCategories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  Subcategory *
                </Label>

                <select
                  value={
                    categoryId
                  }
                  onChange={(event) =>
                    handleSubcategoryChange(
                      event.target.value
                    )
                  }
                  disabled={
                    !parentCategoryId
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    Select Subcategory
                  </option>

                  {subcategories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-sku">
                SKU
              </Label>

              <Input
                id="product-sku"
                value={sku}
                onChange={(event) =>
                  setSku(
                    event.target.value
                  )
                }
                placeholder="e.g. LG-POS-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-description">
                Short Description
              </Label>

              <textarea
                id="short-description"
                value={
                  shortDescription
                }
                onChange={(event) =>
                  setShortDescription(
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Short product description..."
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </section>

          {/* IMAGES */}
          <section className="border-t pt-5">
            {loadingImages ? (
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading product images...
              </div>
            ) : (
              <ProductImageUploader
                key={
                  product?.id ??
                  "new-product"
                }
                productId={
                  product?.id
                }
                initialImages={
                  originalImages
                }
                value={images}
                onChange={
                  setImages
                }
                disabled={saving}
              />
            )}
          </section>

          {/* PRICING */}
          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">
                Pricing
              </h3>

              <p className="text-sm text-muted-foreground">
                Set the cost and selling prices.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cost-price">
                  Cost Price
                </Label>

                <Input
                  id="cost-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={costPrice}
                  onChange={(event) =>
                    setCostPrice(
                      event.target.value
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="selling-price">
                  Selling Price *
                </Label>

                <Input
                  id="selling-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    sellingPrice
                  }
                  onChange={(event) =>
                    setSellingPrice(
                      event.target.value
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="online-price">
                  Online Price
                </Label>

                <Input
                  id="online-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    onlinePrice
                  }
                  onChange={(event) =>
                    setOnlinePrice(
                      event.target.value
                    )
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
          </section>

          {/* INVENTORY */}
          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">
                Inventory
              </h3>

              <p className="text-sm text-muted-foreground">
                Set the current available stock.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-quantity">
                Stock Quantity
              </Label>

              <Input
                id="stock-quantity"
                type="number"
                min="0"
                step="1"
                value={
                  stockQuantity
                }
                onChange={(event) =>
                  setStockQuantity(
                    event.target.value
                  )
                }
                placeholder="0"
              />
            </div>
          </section>

          {/* ONLINE STORE */}
          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">
                Online Store
              </h3>
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={
                  onlineEnabled
                }
                onChange={(event) =>
                  setOnlineEnabled(
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="text-sm font-medium">
                  Available for online orders
                </p>

                <p className="text-xs text-muted-foreground">
                  Allow this product to be used for online orders.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={
                  featured
                }
                onChange={(event) =>
                  setFeatured(
                    event.target.checked
                  )
                }
                className="mt-1 h-4 w-4"
              />

              <div>
                <p className="text-sm font-medium">
                  Featured Product
                </p>

                <p className="text-xs text-muted-foreground">
                  Mark this product as featured.
                </p>
              </div>
            </label>
          </section>

          {/* VISIBILITY */}
          <section className="space-y-2 border-t pt-5">
            <Label>
              Visibility
            </Label>

            <select
              value={
                visibility
              }
              onChange={(event) =>
                setVisibility(
                  event.target.value as
                    | "DRAFT"
                    | "PUBLISHED"
                    | "ARCHIVED"
                )
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="PUBLISHED">
                Published
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </section>

          {/* ERROR */}
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 border-t pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleOpenChange(
                  false
                )
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                saving ||
                loadingImages
              }
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {isEditMode
                ? "Update Product"
                : "Save Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}