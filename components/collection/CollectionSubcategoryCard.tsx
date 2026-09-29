import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type CollectionSubcategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  productCount?: number;
};

interface CollectionSubcategoryCardProps {
  category: CollectionSubcategory;
  parentSlug: string;
}

export default function CollectionSubcategoryCard({
  category,
  parentSlug,
}: CollectionSubcategoryCardProps) {
  return (
    <Link
      href={`/collections/${encodeURIComponent(
        parentSlug,
      )}/${encodeURIComponent(category.slug)}`}
      className="group overflow-hidden rounded-2xl border border-[#e9e1d4] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d7bd7b] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#b18425]/40 focus:ring-offset-2"
    >
      {/* Image */}
      <div className="relative aspect-[1.25] overflow-hidden bg-[#f5f0e8]">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={`${category.name} at Vaishnavi Collections`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#f5f0e8]">
            <span className="text-xs font-medium text-[#10233e]/40">
              {category.name}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#10233e]/50 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
            Explore
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#10233e] sm:text-base">
              {category.name}
            </h3>

            {category.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {category.description}
              </p>
            )}

            {typeof category.productCount === "number" && (
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-[#b18425]">
                {category.productCount}{" "}
                {category.productCount === 1 ? "product" : "products"}
              </p>
            )}
          </div>

          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e9e1d4] text-[#b18425] transition-all duration-300 group-hover:border-[#b18425] group-hover:bg-[#b18425] group-hover:text-white">
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}