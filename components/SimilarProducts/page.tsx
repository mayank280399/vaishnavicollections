"use client";

import ProductCard, {
  type StorefrontProduct,
} from "@/components/ProductCard/ProductCard";

interface SimilarProductsProps {
  products: StorefrontProduct[];
  title?: string;
  subtitle?: string;
}

export default function SimilarProducts({
  products,
  title = "Similar Products",
  subtitle = "Explore similar styles",
}: SimilarProductsProps) {
  // Don't show the section when there are no products
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-10 sm:mt-16 sm:pt-12">
      {/* Section Header */}
      <div className="mb-6 text-center sm:mb-8">
        {/* VC Gold Accent */}
        <div className="mx-auto mb-2 h-0.5 w-10 bg-[#c9a227]" />

        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {/* Similar Products */}
      <div
        className="
          grid
          grid-cols-2
          justify-items-center
          gap-x-3
          gap-y-6
          sm:grid-cols-2
          sm:gap-x-5
          sm:gap-y-8
          lg:grid-cols-4
          lg:gap-6
        "
      >
        {products.slice(0, 4).map((product) => (
          <div key={product.id} className="w-full min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}