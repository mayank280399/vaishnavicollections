import AboutCTA from "@/components/about/AboutCTA";
import AboutGrowingWithCustomers from "@/components/about/AboutGrowingWithCustomers";
import AboutHero from "@/components/about/AboutHero";
import AboutHomeBeginning from "@/components/about/AboutHomeBeginning";
import AboutJourney from "@/components/about/AboutJourney";
import AboutMadeByUs from "@/components/about/AboutMadeByUs";
import AboutMoreThanStore from "@/components/about/AboutMoreThanStore";
import AboutNewBeginning from "@/components/about/AboutNewBeginning";
import AboutStats from "@/components/about/AboutStats";
import AboutValues from "@/components/about/AboutValues";
import { createPublicClient } from "@/lib/supabase/public-server";
import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "About Our Story",
  description: "Learn about Vaishnavi Collections and our range of Laddu Gopal poshak, shringar, home décor and handmade accessories.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const supabase = createPublicClient();

  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, name, slug, description, image_url, sort_order")
    .eq("category_type", "PRODUCT")
    .eq("active", true)
    .eq("is_top_collection", true)
    .is("parent_id", null)
    .not("image_url", "is", null)
    .order("sort_order", { ascending: true })
    .limit(5);

  return (
  <main className="overflow-hidden bg-[#F8F6F1] text-[#0B1F3A]">
      <AboutHero />
      <AboutStats />
      <AboutJourney />
      <AboutHomeBeginning />
      <AboutNewBeginning />
      <AboutGrowingWithCustomers categories={categories ?? []} />
      <AboutMadeByUs />n
      <AboutValues />
      <AboutMoreThanStore />
      <AboutCTA />

    </main>

  );
}
