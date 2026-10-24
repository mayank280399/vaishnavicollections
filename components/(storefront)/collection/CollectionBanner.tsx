
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

interface CollectionBannerProps {
  title: string;
  description?: string | null;
  bannerImageUrl?: string | null;
  fallbackImageUrl?: string | null;
  productCount?: number;
  eyebrow?: string;
}

export default function CollectionBanner({
  title,
  description,
  bannerImageUrl,
  fallbackImageUrl,
  productCount,
  eyebrow = "Vaishnavi Collections",
}: CollectionBannerProps) {
  const imageUrl = bannerImageUrl || fallbackImageUrl || null;

  return (
    <section
      aria-labelledby="collection-banner-title"
      className="relative isolate w-full overflow-hidden bg-[#071A35]"
    >
      {/* 16:9 banner image */}
      <div className="relative h-[220px] w-full overflow-hidden sm:h-[280px] lg:h-[320px] xl:h-[500px]">
        {imageUrl ? (
          <Image src={imageUrl} alt={`${title} collection`} fill priority sizes="100vw" className="object-cover object-center"/>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#071A35] via-[#10294A] to-[#071A35]"
          />
        )}

        {/* Navy overlay keeps text readable */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#071A35]/90 via-[#071A35]/20 to-[#071A35]/0"
        />

        {/* Additional bottom shading */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#071A35]/45 via-transparent to-[#071A35]/10"
        />

        {/* Banner content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 sm:py-10 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] sm:text-xs sm:tracking-[0.24em]">
                {eyebrow}
              </p>

              <div className="mt-2 h-0.5 w-10 rounded-full bg-[#D4AF37] sm:mt-3 sm:w-14" />

              <h1
                id="collection-banner-title"
                className="mt-3 max-w-xl text-2xl font-semibold leading-tight tracking-tight text-white sm:mt-4 sm:text-4xl sm:leading-tight lg:text-5xl xl:text-6xl"
              >
                {title}
              </h1>

              {description?.trim() && (
                <p className="mt-2 line-clamp-3 max-w-lg text-xs leading-5 text-white/85 sm:mt-4 sm:text-sm sm:leading-6 lg:text-base">
                  {description}
                </p>
              )}

              {productCount !== undefined && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#071A35]/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#F2D98B] backdrop-blur-sm sm:mt-5 sm:px-4 sm:py-2 sm:text-xs">
                  <ShoppingBag
                    size={14}
                    aria-hidden="true"
                  />

                  <span>
                    {productCount}{" "}
                    {productCount === 1 ? "product" : "products"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
