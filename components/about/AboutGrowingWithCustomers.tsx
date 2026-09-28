import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
}

interface AboutGrowingWithCustomersProps {
  categories: Category[];
}

export default function AboutGrowingWithCustomers({
  categories,
}: AboutGrowingWithCustomersProps) {
  return (
    <section className="bg-[#F8F6F1] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            Growing With What People Need
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight text-[#0B1F3A] sm:text-5xl">
            Our collection grew as our understanding grew.
          </h2>

          <p className="mt-5 text-base leading-8 text-[#0B1F3A]/60 sm:text-lg">
            We didn't want to remain limited to just one type of product. As
            different seasons, occasions and customer needs came around, we
            gradually expanded what we offer.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-3xl bg-[#0B1F3A]"
            >
              <div className="relative aspect-[4/5]">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#102846]" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-serif text-xl text-white">
                    {category.name}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-white/60">
                      Explore collection
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A227] text-[#0B1F3A] transition-transform group-hover:rotate-45">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-[#0B1F3A]/10 bg-white p-6 sm:p-8">
          <p className="text-sm leading-7 text-[#0B1F3A]/65">
            From{" "}
            <strong className="text-[#0B1F3A]">Navratri products</strong> and{" "}
            <strong className="text-[#0B1F3A]">Rakhi items</strong> to{" "}
            <strong className="text-[#0B1F3A]">cosmetics</strong> and{" "}
            <strong className="text-[#0B1F3A]">
              Laddu Gopal dresses and accessories
            </strong>
            , every addition has come from what we noticed, what people asked
            for and what we felt was worth bringing to our collection.
          </p>
        </div>
      </div>
    </section>
  );
}