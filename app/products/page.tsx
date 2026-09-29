import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductsClient from "./ProductsClient";

export default function ProductsPage() {
  return (
    <>
      <Navbar />

      <ProductsClient />

      <Footer />
    </>
  );
}