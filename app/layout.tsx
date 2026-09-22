import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaishnavi Collections | Modern Essentials for Inspired Living",
  description: "Curated collection of high-end furniture, lighting, and decor. Elevate your home with Vaishnavi Collections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
