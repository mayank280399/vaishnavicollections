import type { NextConfig } from "next";

const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rwwqpuyhnsgfiaflnquu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {  protocol: "https",
        hostname: "lh3.googleusercontent.com",}
    ],
  },
};

export default nextConfig;
