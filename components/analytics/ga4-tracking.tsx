"use client";

import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

let hasPublicAnalyticsInitialized = false;

export function GA4Tracking({ gaId }: { gaId?: string }) {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const warnedMissingId = useRef(false);

  const privateRoute = pathname.startsWith("/admin") || pathname === "/auth/reset-password";

  useEffect(() => {
    if (!gaId) {
      if (process.env.NODE_ENV === "development" && !warnedMissingId.current) {
        warnedMissingId.current = true;
        console.warn("NEXT_PUBLIC_GA_ID is not set; Google Analytics is disabled.");
      }
      return;
    }

    if (privateRoute) {
      previousPathname.current = pathname;
      return;
    }

    if (!hasPublicAnalyticsInitialized) {
      hasPublicAnalyticsInitialized = true;
      previousPathname.current = pathname;
      return;
    }

    // GoogleAnalytics sends the initial page view. Send one event for later
    // App Router navigations, using only the pathname to avoid query-string PII.
    if (previousPathname.current !== null && previousPathname.current !== pathname) {
      sendGAEvent("event", "page_view", {
        page_path: pathname,
        page_location: `${window.location.origin}${pathname}`,
      });
    }
    previousPathname.current = pathname;
  }, [gaId, pathname, privateRoute]);

  if (!gaId || (privateRoute && !hasPublicAnalyticsInitialized)) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
