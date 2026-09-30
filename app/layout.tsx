import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
metadataBase: new URL(
 "https://vaishnavicollections.vercel.app"
),
  title: {
    default:
      "Vaishnavi Collections | Modern Essentials for Inspired Living",
    template: "%s | Vaishnavi Collections",
  },

  description:
    "Curated collection of high-end furniture, lighting, decor, Laddu Gopal Ji poshak & shringar, handmade accessories, and more from Vaishnavi Collections.",

  openGraph: {
    type: "website",
    siteName: "Vaishnavi Collections",

    title:
      "Vaishnavi Collections | Modern Essentials for Inspired Living",

    description:
      "Discover beautiful products from Vaishnavi Collections.",

    images: [
      {
        url: "/vc-round-logo.png",
        width: 1200,
        height: 1200,
        alt: "Vaishnavi Collections",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Vaishnavi Collections | Modern Essentials for Inspired Living",

    description:
      "Discover beautiful products from Vaishnavi Collections.",

    images: ["/vc-round-logo.png"],
  },
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