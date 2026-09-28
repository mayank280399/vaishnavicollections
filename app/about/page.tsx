
// import AboutStats from "@/components/about/AboutStats";
// import AboutJourney from "@/components/about/AboutJourney";
// import AboutHomeBeginning from "@/components/about/AboutHomeBeginning";
// import AboutNewBeginning from "@/components/about/AboutNewBeginning";
// import AboutGrowingWithCustomers from "@/components/about/AboutGrowingWithCustomers";
// import AboutMadeByUs from "@/components/about/AboutMadeByUs";
// import AboutValues from "@/components/about/AboutValues";
// import AboutMoreThanStore from "@/components/about/AboutMoreThanStore";
// import AboutCTA from "@/components/about/AboutCTA";

import AboutCTA from "@/components/admin/about/AboutCTA";
import AboutGrowingWithCustomers from "@/components/admin/about/AboutGrowingWithCustomers";
import AboutHero from "@/components/admin/about/AboutHero";
import AboutHomeBeginning from "@/components/admin/about/AboutHomeBeginning";
import AboutJourney from "@/components/admin/about/AboutJourney";
import AboutMadeByUs from "@/components/admin/about/AboutMadeByUs";
import AboutMoreThanStore from "@/components/admin/about/AboutMoreThanStore";
import AboutNewBeginning from "@/components/admin/about/AboutNewBeginning";
import AboutStats from "@/components/admin/about/AboutStats";
import AboutValues from "@/components/admin/about/AboutValues";
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
      {/* 

     

      

      

      

      

      
 */}
    </main>
  );
}