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
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function AboutPage() {
  const supabase = await createClient();

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
  <><Navbar /><main className="overflow-hidden bg-[#F8F6F1] text-[#0B1F3A]">
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

    </main><Footer /></>

  );
}