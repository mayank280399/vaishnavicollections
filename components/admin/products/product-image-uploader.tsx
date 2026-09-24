"use client";

import {
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export const MAX_PRODUCT_IMAGES = 6;
export const MIN_PRODUCT_IMAGES = 2;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export type ExistingProductImage = {
  id: string;
  product_id?: string;
  variant_id?: string | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type ProductImageItem = {
  tempId: string;
  id?: string;
  file?: File;
  previewUrl: string;
  imageUrl?: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  isNew: boolean;
};

type ProductImageUploaderProps = {
  productId?: string | null;
  initialImages?: ExistingProductImage[];
  value: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
  disabled?: boolean;
};

export function ProductImageUploader({
  productId,
  initialImages = [],
  value,
  onChange,
  disabled = false,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  /*
   * Initialize existing images when the product changes.
   */
  useEffect(() => {
    if (!initialImages.length) {
      return;
    }

    const existing: ProductImageItem[] =
      initialImages
        .sort(
          (a, b) =>
            a.sort_order - b.sort_order
        )
        .map((image) => ({
          tempId: `existing-${image.id}`,
          id: image.id,
          previewUrl: image.image_url,
          imageUrl: image.image_url,
          altText:
            image.alt_text ?? "",
          isPrimary:
            image.is_primary,
          sortOrder:
            image.sort_order,
          isNew: false,
        }));

    onChange(existing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  function validateFile(file: File): string | null {
    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      return `${file.name}: Only JPG, JPEG, PNG and WEBP images are allowed.`;
    }

    if (
      file.size > MAX_IMAGE_SIZE
    ) {
      return `${file.name}: Image size must be 5 MB or less.`;
    }

    return null;
  }

  function addFiles(files: FileList | File[]) {
    setError("");

    const selectedFiles = Array.from(files);

    if (!selectedFiles.length) {
      return;
    }

    if (
      value.length +
        selectedFiles.length >
      MAX_PRODUCT_IMAGES
    ) {
      setError(
        `You can add a maximum of ${MAX_PRODUCT_IMAGES} images per product.`
      );
      return;
    }

    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      const validationError =
        validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      validFiles.push(file);
    }

    const newItems =
      validFiles.map(
        (file, index) => ({
          tempId: `new-${Date.now()}-${index}-${Math.random()
            .toString(36)
            .slice(2)}`,
          file,
          previewUrl:
            URL.createObjectURL(file),
          altText: "",
          isPrimary:
            value.length === 0 &&
            index === 0,
          sortOrder:
            value.length + index,
          isNew: true,
        })
      );

    onChange([
      ...value,
      ...newItems,
    ]);
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files) {
      addFiles(event.target.files);
    }

    event.target.value = "";
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragging(false);

    if (disabled) {
      return;
    }

    if (event.dataTransfer.files) {
      addFiles(
        event.dataTransfer.files
      );
    }
  }

  function setPrimary(
    tempId: string
  ) {
    setError("");

    onChange(
      value.map((image) => ({
        ...image,
        isPrimary:
          image.tempId === tempId,
      }))
    );
  }

  function removeImage(
    tempId: string
  ) {
    setError("");

    const imageToRemove =
      value.find(
        (image) =>
          image.tempId === tempId
      );

    if (!imageToRemove) {
      return;
    }

    if (
      imageToRemove.isPrimary &&
      value.length > 1
    ) {
      setError(
        "Select another image as primary before removing the current primary image."
      );
      return;
    }

    if (
      imageToRemove.isNew &&
      imageToRemove.previewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imageToRemove.previewUrl
      );
    }

    const remaining =
      value.filter(
        (image) =>
          image.tempId !== tempId
      );

    /*
     * If the removed image was the only
     * primary, automatically make the
     * first remaining image primary.
     */
    if (
      remaining.length > 0 &&
      !remaining.some(
        (image) => image.isPrimary
      )
    ) {
      remaining[0] = {
        ...remaining[0],
        isPrimary: true,
      };
    }

    onChange(
      remaining.map(
        (image, index) => ({
          ...image,
          sortOrder: index,
        })
      )
    );
  }

  function updateAltText(
    tempId: string,
    altText: string
  ) {
    onChange(
      value.map((image) =>
        image.tempId === tempId
          ? {
              ...image,
              altText,
            }
          : image
      )
    );
  }

  const hasPrimary = value.some(
    (image) => image.isPrimary
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">
          Product Images *
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Add {MIN_PRODUCT_IMAGES}–
          {MAX_PRODUCT_IMAGES} images.
          One image must be selected as
          the primary image.
        </p>
      </div>

      {/* UPLOAD AREA */}
      <div
        onDragOver={(event) => {
          event.preventDefault();

          if (!disabled) {
            setDragging(true);
          }
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-5 text-center transition ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        } ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-muted/30"
        }`}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>

          <p className="text-sm font-medium">
            Click to upload or drag images here
          </p>

          <p className="text-xs text-muted-foreground">
            JPG, JPEG, PNG or WEBP • Max 5 MB each
          </p>

          <p className="text-xs text-muted-foreground">
            {value.length}/{MAX_PRODUCT_IMAGES} images
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* IMAGE GRID */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((image) => (
            <div
              key={image.tempId}
              className={`group overflow-hidden rounded-xl border ${
                image.isPrimary
                  ? "border-primary ring-1 ring-primary"
                  : ""
              }`}
            >
              {/* IMAGE */}
              <div className="relative aspect-square bg-muted">
                <img
                  src={image.previewUrl}
                  alt={
                    image.altText ||
                    "Product image"
                  }
                  className="h-full w-full object-cover"
                />

                {/* PRIMARY BADGE */}
                {image.isPrimary && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 text-xs font-medium shadow">
                    <Star className="h-3 w-3 fill-current" />
                    Primary
                  </div>
                )}

                {/* DELETE */}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeImage(
                      image.tempId
                    );
                  }}
                  disabled={disabled}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/95 text-destructive shadow hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* IMAGE CONTROLS */}
              <div className="space-y-2 p-2">
                {!image.isPrimary && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setPrimary(
                        image.tempId
                      )
                    }
                    disabled={disabled}
                  >
                    <Star className="mr-1.5 h-3.5 w-3.5" />
                    Set Primary
                  </Button>
                )}

                {image.isPrimary && (
                  <div className="flex h-9 items-center justify-center rounded-md bg-muted text-xs font-medium">
                    <Star className="mr-1.5 h-3.5 w-3.5 fill-current" />
                    Primary Image
                  </div>
                )}

                <input
                  value={image.altText}
                  onChange={(event) =>
                    updateAltText(
                      image.tempId,
                      event.target.value
                    )
                  }
                  disabled={disabled}
                  placeholder="Alt text (optional)"
                  className="h-9 w-full rounded-md border bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQUIREMENTS */}
      <div className="rounded-lg bg-muted/40 p-3">
        <div className="flex items-start gap-2">
          <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Minimum {MIN_PRODUCT_IMAGES} images required.
            </p>

            <p>
              Maximum {MAX_PRODUCT_IMAGES} images allowed.
            </p>

            <p
              className={
                hasPrimary
                  ? "text-foreground"
                  : "text-destructive"
              }
            >
              {hasPrimary
                ? "✓ Primary image selected."
                : "Primary image must be selected."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}