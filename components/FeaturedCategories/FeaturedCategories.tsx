import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
};

async function getFeaturedCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      sort_order
    `)
    .eq("category_type", "PRODUCT")
    .eq("active", true)
    .eq("is_top_collection", true)
    .is("parent_id", null)
    .not("image_url", "is", null)
    .order("sort_order", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    console.error("Featured categories error:", error);
    return [];
  }

  return data ?? [];
}

export default async function FeaturedCategories() {
  const categories = await getFeaturedCategories();

  if (!categories.length) {
    return null;
  }

  return (
    <section className="bg-[#fbfaf7] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <header className="mb-7 text-center sm:mb-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b18425] sm:text-xs">
            Shop by category
          </p>

          <h2 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight text-[#10233e] sm:text-3xl lg:text-4xl">
            Explore Our Collections
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm">
            Discover beautiful pieces for your home, your style and your Kanha Ji.
          </p>
        </header>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
  {categories.map((category) => (
    <Link
      key={category.id}
      href={`/products?category=${encodeURIComponent(category.slug)}`}
      className="group w-[calc(50%-0.375rem)] overflow-hidden rounded-2xl border border-[#e9e1d4] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d7bd7b] hover:shadow-lg sm:w-[calc(33.333%-0.667rem)] lg:w-[calc(20%-0.8rem)]"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#f5f0e8]">
        <Image
          src={category.image_url!}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#10233e]/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="flex min-h-[82px] flex-col items-center justify-center px-2.5 py-3 text-center">
        <h3 className="text-xs font-semibold leading-4 text-[#10233e] sm:text-sm">
          {category.name}
        </h3>

        {category.description && (
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500 sm:text-xs">
            {category.description}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#b18425] transition-transform duration-300 group-hover:translate-x-0.5">
          Explore
          <ArrowRight size={12} strokeWidth={2.2} />
        </div>
      </div>
    </Link>
  ))}
</div>
      </div>
    </section>
  );
}