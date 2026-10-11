import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://vaishnavicollections.vercel.app/"),
  verification: {
    google: "ojJXy2jaFiCgc0NSQh9Ky9hYFIjKZBHBVdXPf2YpPCI",
  },
  applicationName: "Vaishnavi Collections",
  title: {
    default: "Vaishnavi Collections | Laddu Gopal Poshak, Shringar & Home Décor",
    template: "%s | Vaishnavi Collections",
  },
  description:
    "Shop Laddu Gopal Ji poshak and shringar, home décor, cosmetics, beauty products, handmade hair accessories and more from Vaishnavi Collections. Pan India shipping available.",
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
    title: "Vaishnavi Collections | Laddu Gopal Poshak, Shringar & Home Décor",
    description: "Shop Laddu Gopal Ji poshak and shringar, home décor, cosmetics, beauty products and handmade accessories. Pan India shipping available.",
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
    title: "Vaishnavi Collections | Laddu Gopal Poshak, Shringar & Home Décor",
    description: "Shop Laddu Gopal Ji poshak and shringar, home décor, cosmetics, beauty products and handmade accessories. Pan India shipping available.",
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
      <body>
        <GoogleAnalytics  gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        {children}
        <ServiceWorkerRegistration /></body>
    </html>
  );
}
