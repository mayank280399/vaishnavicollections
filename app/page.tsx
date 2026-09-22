import Navbar from '@/components/Navbar/Navbar';
import HeroBanner from '@/components/HeroBanner/HeroBanner';
import LogoCloud from '@/components/LogoCloud/LogoCloud';
import FeaturedCategories from '@/components/FeaturedCategories/FeaturedCategories';
import FeaturedProducts from '@/components/FeaturedProducts/FeaturedProducts';
import OffersBento from '@/components/OffersBento/OffersBento';
import Testimonials from '@/components/Testimonials/Testimonials';
import CallToAction from '@/components/CallToAction/CallToAction';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroBanner />
      <LogoCloud />
      <FeaturedCategories />
      <FeaturedProducts />
      <OffersBento />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}
