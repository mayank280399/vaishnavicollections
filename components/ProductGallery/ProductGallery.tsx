"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const primaryIndex = Math.max(
    0,
    images.findIndex((image) => image.is_primary)
  );

  const [activeIndex, setActiveIndex] = useState(primaryIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const activeImage = images[activeIndex];

  const goPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }, [images.length]);

  const goNext = useCallback(() => {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }, [images.length]);

  const openLightbox = () => {
    setZoom(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setZoom(1);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();

      if (event.key === "+" || event.key === "=") {
        setZoom((current) => Math.min(current + 0.25, 3));
      }

      if (event.key === "-") {
        setZoom((current) => Math.max(current - 0.25, 1));
      }

      if (event.key === "0") {
        setZoom(1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxOpen, goPrevious, goNext]);

  if (!images.length) {
    return (
      <div className="w-full">
        <div className="aspect-square w-full max-w-[420px] mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-sm text-slate-400">
          No image available
        </div>
      </div>
    );
  }

  return (
    <>
      {/* =========================
          PRODUCT GALLERY
      ========================== */}
      <div className="w-full min-w-0">
        <div className="flex flex-col gap-3">
          {/* Main Image */}
          <div
            className="
              relative
              w-full
              max-w-[380px]
              mx-auto
              aspect-square
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              cursor-zoom-in
              group
            "
            onClick={openLightbox}
          >
            <Image
              src={activeImage.image_url}
              alt={`${productName} - Image ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 380px"
              className="object-contain p-3 sm:p-5 transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {/* Zoom indicator */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
              <Maximize2 className="h-3 w-3" />
              <span className="hidden sm:inline">View larger</span>
            </div>

            {/* Previous */}
            {images.length > 1 && (
              <button
                type="button"
                aria-label="Previous image"
                onClick={(event) => {
                  event.stopPropagation();
                  goPrevious();
                }}
                className="
                  absolute
                  left-2
                  top-1/2
                  -translate-y-1/2
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-white/90
                  text-slate-700
                  shadow-md
                  transition
                  hover:bg-white
                  sm:h-9
                  sm:w-9
                "
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Next */}
            {images.length > 1 && (
              <button
                type="button"
                aria-label="Next image"
                onClick={(event) => {
                  event.stopPropagation();
                  goNext();
                }}
                className="
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-white/90
                  text-slate-700
                  shadow-md
                  transition
                  hover:bg-white
                  sm:h-9
                  sm:w-9
                "
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile Thumbnail Strip */}
          {images.length > 1 && (
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex w-max min-w-full justify-center gap-2 px-1">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={`
                      relative
                      h-14
                      w-14
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      border
                      bg-white
                      transition-all
                      sm:h-16
                      sm:w-16
                      ${
                        activeIndex === index
                          ? "border-[#c9a227] ring-1 ring-[#c9a227]"
                          : "border-slate-200 hover:border-slate-400"
                      }
                    `}
                  >
                    <Image
                      src={image.image_url}
                      alt={`${productName} thumbnail ${index + 1}`}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="text-center text-[11px] text-slate-400">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* =========================
          LIGHTBOX
      ========================== */}
      {lightboxOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/90
            p-3
            sm:p-6
          "
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            type="button"
            aria-label="Close image viewer"
            onClick={closeLightbox}
            className="
              absolute
              right-3
              top-3
              z-20
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              backdrop-blur
              transition
              hover:bg-white/20
              sm:right-5
              sm:top-5
              sm:h-10
              sm:w-10
            "
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="absolute left-3 top-4 z-20 text-xs text-white/80 sm:left-5">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Main Lightbox Image */}
          <div
            className="
              relative
              flex
              h-[75vh]
              w-full
              max-w-5xl
              items-center
              justify-center
              overflow-hidden
            "
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage.image_url}
              alt={`${productName} - Image ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom})`,
              }}
            />

            {/* Previous */}
            {images.length > 1 && (
              <button
                type="button"
                aria-label="Previous image"
                onClick={goPrevious}
                className="
                  absolute
                  left-1
                  top-1/2
                  -translate-y-1/2
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-white
                  backdrop-blur
                  hover:bg-white/20
                  sm:left-3
                  sm:h-11
                  sm:w-11
                "
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Next */}
            {images.length > 1 && (
              <button
                type="button"
                aria-label="Next image"
                onClick={goNext}
                className="
                  absolute
                  right-1
                  top-1/2
                  -translate-y-1/2
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-white
                  backdrop-blur
                  hover:bg-white/20
                  sm:right-3
                  sm:h-11
                  sm:w-11
                "
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Zoom Controls */}
          <div
            className="
              absolute
              bottom-4
              left-1/2
              -translate-x-1/2
              flex
              items-center
              gap-1
              rounded-full
              bg-white/10
              p-1
              backdrop-blur
            "
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() =>
                setZoom((current) => Math.max(current - 0.25, 1))
              }
              disabled={zoom <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="min-w-[45px] text-center text-xs text-white">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              aria-label="Zoom in"
              onClick={() =>
                setZoom((current) => Math.min(current + 0.25, 3))
              }
              disabled={zoom >= 3}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Reset zoom"
              onClick={() => setZoom(1)}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}