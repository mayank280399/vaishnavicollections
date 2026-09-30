import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ShoppingProvider from "@/components/providers/ShoppingProvider";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShoppingProvider>
      <Navbar />

      <main>{children}</main>

      <Footer />
    </ShoppingProvider>
  );
}