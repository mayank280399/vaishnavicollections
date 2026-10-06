
import ProductsClient from "./ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Products",
  description: "Browse Laddu Gopal poshak and shringar, home décor, cosmetics, beauty products and handmade accessories.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
      <ProductsClient />
  );
}
