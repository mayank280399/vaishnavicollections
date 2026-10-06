import HeroBanner from '@/components/HeroBanner/HeroBanner';
import FeaturedCategories from '@/components/FeaturedCategories/FeaturedCategories';
import FeaturedProducts from '@/components/FeaturedProducts/FeaturedProducts';
import CustomOrderBanner from '@/components/CustomOrderBanner/CustomOrderBanner';
import ShopByNeed from '@/components/ShopByNeed/ShopByNeed';
import LoyaltyBenefits from '@/components/LoyaltyBenefits/LoyaltyBenefits';
import Testimonials from '@/components/Testimonials/Testimonials';
import InstagramGallery from '@/components/InstagramGallery/InstagramGallery';
import CallToAction from '@/components/CallToAction/CallToAction';
import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
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
      <Testimonials />
      <InstagramGallery />
      <CallToAction />
    </main>
  );
}
