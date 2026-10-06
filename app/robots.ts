import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/orders/",
        "/checkout/",
        "/cart/",
        "/wishlist/",
        "/login",
        "/auth/",
      ],
    },
    sitemap: "https://vaishnavicollections.vercel.app/sitemap.xml",
  };
}
