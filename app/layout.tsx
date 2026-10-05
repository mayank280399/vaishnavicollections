import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

export const metadata: Metadata = {
  metadataBase: new URL("https://vaishnavicollections.vercel.app"),
  applicationName: "Vaishnavi Collections",
  title: {
    default: "Vaishnavi Collections | Modern Essentials for Inspired Living",
    template: "%s | Vaishnavi Collections",
  },
  description:
    "Curated collection of high-end furniture, lighting, decor, Laddu Gopal Ji poshak & shringar, handmade accessories, and more from Vaishnavi Collections.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "VC Collections",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Vaishnavi Collections",
    title: "Vaishnavi Collections | Modern Essentials for Inspired Living",
    description: "Discover beautiful products from Vaishnavi Collections.",
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
    title: "Vaishnavi Collections | Modern Essentials for Inspired Living",
    description: "Discover beautiful products from Vaishnavi Collections.",
    images: ["/vc-round-logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071A35",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}<ServiceWorkerRegistration /></body>
    </html>
  );
}
