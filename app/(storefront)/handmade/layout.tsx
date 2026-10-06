import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Handmade Accessories",
  description:
    "Explore handmade hair accessories and other handcrafted pieces from Vaishnavi Collections.",
  alternates: { canonical: "/handmade" },
};

export default function HandmadeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
