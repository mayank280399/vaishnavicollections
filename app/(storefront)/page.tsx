import HeroBanner from '@/components/HeroBanner/HeroBanner';
import FeaturedCategories from '@/components/FeaturedCategories/FeaturedCategories';
import FeaturedProducts from '@/components/FeaturedProducts/FeaturedProducts';
import CustomOrderBanner from '@/components/CustomOrderBanner/CustomOrderBanner';
import ShopByNeed from '@/components/ShopByNeed/ShopByNeed';
import LoyaltyBenefits from '@/components/LoyaltyBenefits/LoyaltyBenefits';
import VCRewardsHomeBanner from '@/components/VCRewardsHomeBanner/VCRewardsHomeBanner';
import Testimonials from '@/components/Testimonials/Testimonials';
import InstagramGallery from '@/components/InstagramGallery/InstagramGallery';
import CallToAction from '@/components/CallToAction/CallToAction';
import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Laddu Gopal Poshak & Shringar Online",
  description:
    "Shop Laddu Gopal Ji poshak, shringar, mukut and jewellery, plus home décor, beauty products and handmade hair accessories. Affordable prices and Pan India shipping.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#fbfaf7]">
      <HeroBanner />
      <FeaturedCategories />
      <CustomOrderBanner />
      <FeaturedProducts />
      <ShopByNeed />
      <LoyaltyBenefits />
      <VCRewardsHomeBanner />
      <Testimonials />
      <InstagramGallery />
      <CallToAction />
    </main>
  );
}
