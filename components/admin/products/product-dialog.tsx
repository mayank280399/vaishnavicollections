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
import ProductDescriptionEditor from "@/components/admin/products/product-description-editor";
import { sanitizeProductDescription } from "@/lib/utils/product-description";

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
  product_title: string | null;
  meta_title?: string | null;
  size?: string | null;
  variant_label?: string | null;
  short_description: string | null;
  description?: string | null;
  selling_price: number | null;
  cost_price: number | null;
  stock_quantity: number | null;
  base_unit_code?: string | null;
  base_unit_label?: string | null;
  unit_conversions?: Array<{
    code: string;
    label: string;
    factor: number;
    canPurchase: boolean;
    canSell: boolean;
  }> | null;
  online_enabled: boolean | null;
  online_price: number | null;
  visibility:
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";
  featured: boolean | null;

  /*
   * Handmade / custom product fields
   */
  is_handmade: boolean | null;
  is_made_to_order: boolean | null;
  bulk_orders_available: boolean | null;
  handmade_featured: boolean | null;

  created_at: string;
  updated_at: string;
};

type ProductImageRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
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

  const [productTitle, setProductTitle] =
    useState("");

  const [metaTitle, setMetaTitle] = useState("");

  const [productSize, setProductSize] = useState("");
  const [variantLabel, setVariantLabel] = useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [parentCategoryId, setParentCategoryId] =
    useState("");

  const [sku, setSku] =
    useState("");

  const [shortDescription, setShortDescription] =
    useState("");

  const [fullDescription, setFullDescription] = useState("");

  const [costPrice, setCostPrice] =
    useState("");

  const [sellingPrice, setSellingPrice] =
    useState("");

  const [onlinePrice, setOnlinePrice] =
    useState("");

  const [stockQuantity, setStockQuantity] =
    useState("");

  // Blank means "leave existing product unit configuration untouched".
  // New products start with Piece as the inventory base unit.
  const [baseUnitCode, setBaseUnitCode] = useState("piece");
  const [baseUnitLabel, setBaseUnitLabel] = useState("Piece");
  const [conversionLines, setConversionLines] = useState("");
  const [newVariantLines, setNewVariantLines] = useState("");
  const [existingVariants, setExistingVariants] = useState<Array<{ id: string; name: string; variant_value: string | null; sku: string | null; stock_quantity: number | null; active: boolean | null; attributes: Record<string, string> | null }>>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const [onlineEnabled, setOnlineEnabled] =
    useState(false);

  const [featured, setFeatured] =
    useState(false);

  /*
   * Handmade / custom product states
   */
  const [isHandmade, setIsHandmade] =
    useState(false);

  const [isMadeToOrder, setIsMadeToOrder] =
    useState(false);

  const [bulkOrdersAvailable, setBulkOrdersAvailable] =
    useState(false);

  const [handmadeFeatured, setHandmadeFeatured] =
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
    setProductTitle("");
    setMetaTitle("");
    setProductSize("");
    setVariantLabel("");
    setCategoryId("");
    setParentCategoryId("");
    setSku("");
    setShortDescription("");
    setFullDescription("");

    setCostPrice("");
    setSellingPrice("");
    setOnlinePrice("");
    setStockQuantity("");

    setBaseUnitCode("piece");
    setBaseUnitLabel("Piece");
    setConversionLines("");
    setNewVariantLines("");
    setExistingVariants([]);

    setOnlineEnabled(false);
    setFeatured(false);

    /*
     * Reset handmade / custom fields
     */
    setIsHandmade(false);
    setIsMadeToOrder(false);
    setBulkOrdersAvailable(false);
    setHandmadeFeatured(false);

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

    setProductTitle(
      product.product_title ?? ""
    );
    setMetaTitle(product.meta_title ?? "");
    setProductSize(product.size ?? "");
    setVariantLabel(product.variant_label ?? "");

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
    setFullDescription(product.description ?? "");

    // Product list queries may omit the long description; load it explicitly
    // when opening the editor so saving unrelated fields never clears it.
    void (async () => {
      const { data: descriptionRow, error: descriptionError } = await supabase
        .from("products")
        .select("description")
        .eq("id", product.id)
        .maybeSingle();
      if (descriptionError) {
        console.error("Unable to load product description:", descriptionError);
        setError(`Unable to load product description: ${descriptionError.message}`);
        return;
      }
      setFullDescription(descriptionRow?.description ?? product.description ?? "");
    })();

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

    setBaseUnitCode(product.base_unit_code ?? "");
    setBaseUnitLabel(product.base_unit_label ?? "");
    setConversionLines(
      Array.isArray(product.unit_conversions)
        ? product.unit_conversions
            .filter((unit) => unit && unit.label && Number(unit.factor) > 0)
            .map((unit) => `${unit.label}=${unit.factor}`)
            .join("\n")
        : ""
    );
    setNewVariantLines("");

    setOnlineEnabled(
      Boolean(
        product.online_enabled
      )
    );

    setFeatured(
      Boolean(product.featured)
    );

    /*
     * Load handmade / custom fields.
     *
     * Boolean() also safely handles
     * null values from existing records.
     */
    setIsHandmade(
      Boolean(product.is_handmade)
    );

    setIsMadeToOrder(
      Boolean(
        product.is_made_to_order
      )
    );

    setBulkOrdersAvailable(
      Boolean(
        product.bulk_orders_available
      )
    );

    setHandmadeFeatured(
      Boolean(
        product.handmade_featured
      )
    );

    setVisibility(
      product.visibility ??
        "PUBLISHED"
    );

    loadProductImages(
      product.id
    );
    void loadExistingVariants(product.id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    product,
    categories,
  ]);

  async function loadExistingVariants(productId: string) {
    setLoadingVariants(true);
    const { data, error: variantsError } = await supabase
      .from("product_variants")
      .select("id, name, variant_value, sku, stock_quantity, active, attributes")
      .eq("product_id", productId)
      .order("created_at", { ascending: true });
    if (variantsError) {
      console.error("Unable to load existing variants:", variantsError);
      setError(`Unable to load existing variants: ${variantsError.message}`);
      setExistingVariants([]);
    } else {
      setExistingVariants((data ?? []) as Array<{ id: string; name: string; variant_value: string | null; sku: string | null; stock_quantity: number | null; active: boolean | null; attributes: Record<string, string> | null }>);
    }
    setLoadingVariants(false);
  }

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
     * Explicitly type the rows returned by
     * the product_images query.
     */
    const typedSavedImages =
      (savedImages ??
        []) as ProductImageRow[];

    /*
     * Reapply primary + ordering safely.
     *
     * First set all images to non-primary.
     */
    if (typedSavedImages.length) {
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
       * Match images by ID or URL.
       */
      for (
        const image of images
      ) {
        const dbImage =
          typedSavedImages.find(
            (saved: ProductImageRow) =>
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
          typedSavedImages.find(
            (saved: ProductImageRow) =>
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

    const trimmedProductTitle =
      productTitle.trim();

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

    const parsedConversions: Array<{
      code: string;
      label: string;
      factor: number;
      canPurchase: boolean;
      canSell: boolean;
    }> = [];

    if (baseUnitCode.trim()) {
      if (!baseUnitLabel.trim()) {
        setError("Please enter the base unit label.");
        return;
      }

      const seenLabels = new Set<string>();
      for (const rawLine of conversionLines.split("\n")) {
        const line = rawLine.trim();
        if (!line) continue;
        const separator = line.lastIndexOf("=");
        if (separator <= 0) {
          setError(`Invalid unit conversion "${line}". Use one unit per line in the format Dozen=12.`);
          return;
        }
        const label = line.slice(0, separator).trim();
        const factor = Number(line.slice(separator + 1).trim());
        const key = label.toLowerCase();
        if (!label || !Number.isFinite(factor) || factor <= 0 || key === baseUnitLabel.trim().toLowerCase() || seenLabels.has(key)) {
          setError(`Check the unit conversion "${line}". Unit names must be unique and factors must be greater than zero.`);
          return;
        }
        seenLabels.add(key);
        parsedConversions.push({
          code: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
          label,
          factor,
          canPurchase: true,
          canSell: true,
        });
      }
    }

    // const imageValidation =
    //   validateImages();

    // if (imageValidation) {
    //   setError(
    //     imageValidation
    //   );
    //   return;
    // }

    setSaving(true);

    try {
      const payload = {
        name: trimmedName,

        product_title:
          trimmedProductTitle ||
          null,

        meta_title: metaTitle.trim() || null,

        size: productSize.trim() || null,
        variant_label: variantLabel.trim() || null,

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

        description: sanitizeProductDescription(fullDescription) || null,

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

        /*
         * Handmade / custom product fields
         */
        is_handmade:
          isHandmade,

        is_made_to_order:
          isMadeToOrder,

        bulk_orders_available:
          bulkOrdersAvailable,

        handmade_featured:
          handmadeFeatured,

        visibility:
          visibility,

        // Only write unit metadata when the user explicitly configures it.
        // This keeps untouched legacy products' newly added columns NULL.
        ...(baseUnitCode.trim()
          ? {
              base_unit_code: baseUnitCode.trim().toLowerCase(),
              base_unit_label: baseUnitLabel.trim(),
              unit_conversions: parsedConversions,
            }
          : {}),
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

      // Add new variants only. Existing variants and their stock are never
      // updated or deleted by this form.
      const variantLines = newVariantLines.split("\n").map((line) => line.trim()).filter(Boolean);
      if (variantLines.length > 0) {
        const variantRows = variantLines.map((line) => {
          const attributes: Record<string, string> = {};
          for (const part of line.split(",")) {
            const separator = part.indexOf("=");
            if (separator <= 0) {
              throw new Error(`Invalid variant "${line}". Use attributes like size=2/4, color=Red.`);
            }
            const key = part.slice(0, separator).trim().toLowerCase();
            const value = part.slice(separator + 1).trim();
            if (!key || !value || attributes[key]) {
              throw new Error(`Invalid or repeated attribute in variant "${line}".`);
            }
            attributes[key] = value;
          }
          const name = Object.entries(attributes)
            .map(([key, value]) => `${key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} ${value}`)
            .join(" · ");
          const variantValue = Object.values(attributes).join(" / ");
          return {
            product_id: productId,
            name,
            variant_value: variantValue,
            sku: null,
            cost_price: costPrice === "" ? null : Number(costPrice),
            selling_price: sellingPrice === "" ? null : Number(sellingPrice),
            stock_quantity: 0,
            active: true,
            attributes,
          };
        });
        const { error: variantInsertError } = await supabase
          .from("product_variants")
          .insert(variantRows);
        if (variantInsertError) throw variantInsertError;
        setNewVariantLines("");
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

            {/* PRODUCT NAME */}
            <div className="space-y-2">
              <Label htmlFor="product-name">
                Product Name *
              </Label>

              <Input
                id="product-name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Pink Satin Scrunchie"
              />

              <p className="text-xs text-muted-foreground">
                Internal product name used for your catalogue and
                backend.
              </p>
            </div>

            {/* CUSTOMER-FACING PRODUCT TITLE */}
            <div className="space-y-2">
              <Label htmlFor="product-title">
                Product Title
              </Label>

              <Input
                id="product-title"
                value={
                  productTitle
                }
                onChange={(event) =>
                  setProductTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Pink Satin Scrunchie – Soft Hair Tie for Women & Girls"
              />

              <p className="text-xs text-muted-foreground">
                Customer-facing title shown on your online store.
                Leave blank to use the Product Name.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-size">Size</Label>
                <Input
                  id="product-size"
                  value={productSize}
                  onChange={(event) => setProductSize(event.target.value)}
                  placeholder="e.g. Single, Double, King"
                />
                <p className="text-xs text-muted-foreground">Used for product details and storefront size filters. Leave blank when size does not apply.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-variant-label">Variant / Design</Label>
                <Input
                  id="product-variant-label"
                  value={variantLabel}
                  onChange={(event) => setVariantLabel(event.target.value)}
                  placeholder="e.g. Anokhi, Ikat, Blue Floral"
                />
                <p className="text-xs text-muted-foreground">Use this to identify the design or version shown on this product card.</p>
              </div>
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
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(event) => setMetaTitle(event.target.value)}
                maxLength={70}
                placeholder="e.g. Laddu Gopal Ji Dress & Poshak | Vaishnavi Collections"
              />
              <p className="text-xs text-muted-foreground">
                SEO title used in search results and the product page browser title. Leave blank to use the product title automatically.
              </p>
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
                    event.target
                      .value
                  )
                }
                rows={3}
                placeholder="Short product description..."
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label>Full Product Description</Label>
              <ProductDescriptionEditor
                value={fullDescription}
                onChange={setFullDescription}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Use this for complete product information, features, material, size, care instructions, and bullet points. Formatting is preserved on the storefront.
              </p>
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
                      event.target
                        .value
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
                      event.target
                        .value
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
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
          </section>

          {/* UNITS & CONVERSIONS */}
          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">Inventory Units & Conversions</h3>
              <p className="text-sm text-muted-foreground">
                Configure how this product is counted in stock. Leave the base unit blank when editing an existing product to keep its current configuration unchanged.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="base-unit-code">Base inventory unit</Label>
                <select
                  id="base-unit-code"
                  value={baseUnitCode}
                  disabled={saving || (isEditMode && Boolean(product?.base_unit_code))}
                  onChange={(event) => {
                    const next = event.target.value;
                    setBaseUnitCode(next);
                    setBaseUnitLabel(next ? ({
                      piece: "Piece",
                      bottle: "Bottle",
                      packet: "Packet",
                      set: "Set",
                      pair: "Pair",
                      gram: "Gram",
                      kilogram: "Kilogram",
                      milliliter: "Milliliter",
                      liter: "Liter",
                    } as Record<string, string>)[next] ?? next : "");
                  }}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Leave unchanged / not configured</option>
                  <option value="piece">Piece</option>
                  <option value="pair">Pair</option>
                  <option value="set">Set</option>
                  <option value="packet">Packet</option>
                  <option value="bottle">Bottle</option>
                  <option value="gram">Gram</option>
                  <option value="kilogram">Kilogram</option>
                  <option value="milliliter">Milliliter</option>
                  <option value="liter">Liter</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-unit-label">Base unit label</Label>
                <Input
                  id="base-unit-label"
                  value={baseUnitLabel}
                  onChange={(event) => setBaseUnitLabel(event.target.value)}
                  disabled={!baseUnitCode}
                  placeholder="Piece"
                />
              </div>
            </div>

            {baseUnitCode ? (
              <div className="space-y-2">
                <Label htmlFor="unit-conversions">Additional units (one per line)</Label>
                <textarea
                  id="unit-conversions"
                  value={conversionLines}
                  onChange={(event) => setConversionLines(event.target.value)}
                  rows={3}
                  placeholder={"Dozen=12\nHalf dozen=6\nPair=2"}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The number is how many base units are in one additional unit. For example, if the base unit is Piece, Dozen=12 means 1 dozen = 12 pieces. These units are enabled for both purchase and sale.
                </p>
              </div>
            ) : null}
          </section>

          {/* PRODUCT VARIANTS */}
          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">Variants & Options</h3>
              <p className="text-sm text-muted-foreground">
                Manage real sellable combinations such as size + color + design. Existing variants and their stock are preserved; new variants start at zero stock.
              </p>
            </div>
            {isEditMode && (
              <div className="rounded-lg border bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">Existing variants</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{loadingVariants ? "Loading…" : `${existingVariants.length} variant${existingVariants.length === 1 ? "" : "s"}`}</span>
                </div>
                {loadingVariants ? (
                  <p className="text-sm text-slate-500">Loading current variants…</p>
                ) : existingVariants.length ? (
                  <div className="space-y-2">
                    {existingVariants.map((variant) => {
                      const attributes = variant.attributes && Object.keys(variant.attributes).length
                        ? Object.entries(variant.attributes).map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`).join(" · ")
                        : variant.variant_value || variant.name;
                      return (
                        <div key={variant.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-white px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800">{attributes}</p>
                            <p className="text-xs text-slate-500">{variant.sku ? `SKU ${variant.sku} · ` : ""}{variant.active === false ? "Inactive" : "Active"}</p>
                          </div>
                          <p className="shrink-0 text-xs font-semibold text-slate-700">Stock: {variant.stock_quantity ?? 0}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No variants created yet. Add the combinations you actually sell below.</p>
                )}
                <p className="mt-2 text-xs text-slate-500">This list is read-only here to prevent accidental changes to existing stock.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-product-variants">Add variants (one combination per line)</Label>
              <textarea
                id="new-product-variants"
                value={newVariantLines}
                onChange={(event) => setNewVariantLines(event.target.value)}
                rows={4}
                placeholder={"size=2/4, color=Red\nsize=2/6, color=Red\nsize=2/8, color=Green"}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use comma-separated key=value attributes. Bedsheet examples: size=Single, design=Anokhi, color=Red. Create a separate line for each real size/design/color combination; similar prints should have distinct design names or codes (for example design=Floral-A and design=Floral-B). Do not create combinations you do not stock. New variants start at zero stock; receive stock through Purchases.
              </p>
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
                    event.target
                      .value
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
                    event.target
                      .checked
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
                    event.target
                      .checked
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

          {/* HANDMADE & CUSTOM */}
          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-medium">
                Handmade & Custom
              </h3>

              <p className="text-sm text-muted-foreground">
                Use these options to control how this product
                appears on the Handmade & Made to Order collection.
              </p>
            </div>

            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              {/* HANDMADE */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    isHandmade
                  }
                  onChange={(event) =>
                    setIsHandmade(
                      event.target
                        .checked
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="text-sm font-medium">
                    Handmade Product
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Mark this product as handmade by Vaishnavi Collections.
                  </p>
                </div>
              </label>

              {/* MADE TO ORDER */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    isMadeToOrder
                  }
                  onChange={(event) =>
                    setIsMadeToOrder(
                      event.target
                        .checked
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="text-sm font-medium">
                    Made to Order
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Mark this product as available for made-to-order
                    or customized requests.
                  </p>
                </div>
              </label>

              {/* BULK ORDERS */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    bulkOrdersAvailable
                  }
                  onChange={(event) =>
                    setBulkOrdersAvailable(
                      event.target
                        .checked
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="text-sm font-medium">
                    Bulk Orders Available
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Show that retail and bulk orders can be accepted
                    for this product.
                  </p>
                </div>
              </label>

              {/* HANDMADE FEATURED */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={
                    handmadeFeatured
                  }
                  onChange={(event) =>
                    setHandmadeFeatured(
                      event.target
                        .checked
                    )
                  }
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="text-sm font-medium">
                    Feature in Handmade Collection
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Highlight this product in the featured section
                    of the Handmade page.
                  </p>
                </div>
              </label>
            </div>
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