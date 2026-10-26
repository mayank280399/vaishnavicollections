import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  MapPin,
  Play,
  Star,
  Youtube,
} from "lucide-react";
import { getAppSettings } from "@/lib/settings/queries";

type SocialLink = {
  name: string;
  description: string;
  action: string;
  href: string;
  icon: typeof Instagram;
  enabled: boolean;
};

function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export default async function InstagramGallery() {
  const settings = await getAppSettings();

  const links: SocialLink[] = [
    {
      name: "Instagram",
      description: "New arrivals & behind the scenes",
      action: "Follow us",
      href: safeExternalUrl(settings?.instagram_url) || "",
      icon: Instagram,
      enabled: Boolean(settings?.instagram_enabled && safeExternalUrl(settings?.instagram_url)),
    },
    {
      name: "YouTube",
      description: "Watch videos & product highlights",
      action: "Watch videos",
      href: safeExternalUrl(settings?.youtube_url) || "",
      icon: Youtube,
      enabled: Boolean(settings?.youtube_enabled && safeExternalUrl(settings?.youtube_url)),
    },
    {
      name: "Facebook",
      description: "Updates from our community",
      action: "Visit page",
      href: safeExternalUrl(settings?.facebook_url) || "",
      icon: Facebook,
      enabled: Boolean(settings?.facebook_enabled && safeExternalUrl(settings?.facebook_url)),
    },
    {
      name: "Google Business",
      description: "Find our shop & share your feedback",
      action: "View profile",
      href: safeExternalUrl(settings?.google_review_url) || safeExternalUrl(settings?.google_business_url) || "",
      icon: MapPin,
      enabled: Boolean(settings?.google_review_enabled && (safeExternalUrl(settings?.google_review_url) || safeExternalUrl(settings?.google_business_url))),
    },
  ];

  const activeLinks = links.filter((link) => link.enabled && link.href);
  if (activeLinks.length === 0) return null;

  return (
    <section
      aria-labelledby="connect-with-us-heading"
      className="relative overflow-hidden bg-[#071A35] px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full border border-[#D4AF37]/15 sm:size-96" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 size-80 rounded-full bg-[#D4AF37]/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] sm:text-xs">
            <Star className="size-3.5" />
            The VC community
          </span>
          <h2
            id="connect-with-us-heading"
            className="mt-4 font-serif text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
          >
            Connect with Vaishnavi Collections
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
            Discover new arrivals, watch our videos, explore shop updates and stay connected wherever you love to follow us.
          </p>
        </div>

        <div className={`mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 ${activeLinks.length >= 4 ? "lg:grid-cols-4" : activeLinks.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {activeLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.action} on ${link.name} (opens in a new tab)`}
                className="group flex min-h-[112px] min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#D4AF37]/45 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071A35] sm:min-h-[132px] sm:p-5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#D4AF37] transition group-hover:bg-[#D4AF37] group-hover:text-[#071A35] sm:size-14">
                  <Icon className="size-6 sm:size-7" strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold tracking-tight text-white sm:text-[17px]">
                    {link.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-white/55 sm:text-sm">
                    {link.description}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37] sm:text-sm">
                    {link.action}
                    {link.name === "YouTube" ? <Play className="size-3.5 fill-current" /> : <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[11px] leading-5 text-white/40 sm:mt-8 sm:text-xs">
          Follow along for inspiration, new arrivals and a little more of what makes VC special.
        </p>
      </div>
    </section>
  );
}
