
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, CheckCheck, LoaderCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  click_url: string | null;
  created_at: string;
  read_at: string | null;
};

const supabase = createClient();

function decodeVapidKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);

  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function NotificationBell({
  variant = "storefront",
}: {
  variant?: "storefront" | "admin";
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setSignedIn(Boolean(user));

      if (!user) {
        setItems([]);
        setUnreadCount(0);
        return;
      }

      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load notifications.");
      }

      const nextItems = Array.isArray(data.notifications)
        ? data.notifications
        : [];

      setItems(nextItems);
      setUnreadCount(
        typeof data.unreadCount === "number"
          ? data.unreadCount
          : nextItems.filter((item: NotificationItem) => !item.read_at).length,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load notifications.",
      );
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Keep browser-push settings separate from the live notification feed.
  useEffect(() => {
    let active = true;

    async function checkPushStatus() {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.getRegistration("/");
          const subscription = await registration?.pushManager.getSubscription();

          if (active) setEnabled(Boolean(subscription));
        } catch {
          if (active) setEnabled(false);
        }
      }
    }

    void checkPushStatus();

    return () => {
      active = false;
    };
  }, []);

  // Subscribe as soon as a user is signed in, not only when the bell is opened.
  // Realtime events refresh the list and exact unread count without a page reload.
  useEffect(() => {
    let mounted = true;
    let activeUserId: string | null | undefined;
    let transition = 0;
    let notificationChannel: ReturnType<typeof supabase.channel> | null = null;

    async function connectUser(userId: string | null) {
      if (
        activeUserId === userId &&
        (userId === null || notificationChannel !== null)
      ) {
        return;
      }

      activeUserId = userId;
      const currentTransition = ++transition;
      const previousChannel = notificationChannel;
      notificationChannel = null;

      if (previousChannel) {
        await supabase.removeChannel(previousChannel);
      }

      if (!mounted || currentTransition !== transition) return;

      if (!userId) {
        setSignedIn(false);
        setItems([]);
        setUnreadCount(0);
        setError("");
        return;
      }

      setSignedIn(true);
      void loadNotifications();

      notificationChannel = supabase
        .channel(`vc-notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void loadNotifications({ silent: true });
          },
        )
        .subscribe((status: "SUBSCRIBED" | "TIMED_OUT" | "CLOSED" | "CHANNEL_ERROR") => {
          // Reconcile after connection/reconnection so missed events are recovered.
          if (status === "SUBSCRIBED") {
            void loadNotifications({ silent: true });
          }
        });
    }

    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) void connectUser(user?.id ?? null);
    }

    void initialize();

    const handleReconnect = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void loadNotifications({ silent: true });
      }
    };

    window.addEventListener("online", handleReconnect);
    document.addEventListener("visibilitychange", handleReconnect);

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      void Promise.resolve().then(() => {
        if (mounted) void connectUser(session?.user.id ?? null);
      });
    });

    return () => {
      mounted = false;
      transition += 1;
      authSubscription.unsubscribe();
      window.removeEventListener("online", handleReconnect);
      document.removeEventListener("visibilitychange", handleReconnect);

      if (notificationChannel) {
        void supabase.removeChannel(notificationChannel);
      }
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return;

    void loadNotifications();

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, loadNotifications]);

  async function togglePush() {
    setBusy(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.assign("/login?next=%2Faccount");
        return;
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("This browser does not support push notifications.");
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      if (enabled) {
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          const response = await fetch("/api/push/subscription", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Could not disable notifications.");
          }

          await subscription.unsubscribe();
        }

        setEnabled(false);
        return;
      }

      if (!("Notification" in window)) {
        throw new Error("This browser does not support notifications.");
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error(
          "Notifications were not allowed. Enable them in your browser settings.",
        );
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("Push notifications are not configured yet.");
      }

      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidKey(publicKey),
        }));

      const response = await fetch("/api/push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      const data = await response.json();

      if (!response.ok) {
        await subscription.unsubscribe();
        throw new Error(data.error || "Could not enable notifications.");
      }

      setEnabled(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update notifications.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function markRead(item: NotificationItem) {
    if (item.read_at) return;

    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Could not update notification.");
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? { ...entry, read_at: new Date().toISOString() }
          : entry,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        className={[
          "relative flex size-9 items-center justify-center rounded-full transition-colors sm:size-10",
          variant === "admin"
            ? "text-[#D4AF37] hover:bg-white/10 hover:text-white"
            : "text-[#171B4D] hover:bg-gray-100 hover:text-[#C9952E]",
        ].join(" ")}
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex min-w-4 items-center justify-center rounded-full bg-[#C9952E] px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-[4.5rem] z-[80] flex max-h-[min(75dvh,36rem)] flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(22rem,calc(100vw-2rem))]">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-[#071A35]">
                Notifications
              </h2>
              <p className="text-xs text-gray-500">
                {unreadCount} unread
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
              className="flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X size={17} />
            </button>
          </div>

          <div className="border-b border-gray-100 bg-[#071A35]/[0.025] p-3">
            <button
              type="button"
              onClick={() => void togglePush()}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-white px-3 py-2.5 text-sm font-semibold text-[#071A35] transition-colors hover:bg-[#D4AF37]/10 disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <BellRing size={17} />
              )}
              {busy
                ? "Updating..."
                : enabled
                  ? "Disable browser notifications"
                  : "Enable browser notifications"}
            </button>

            {!signedIn && (
              <p className="mt-2 text-center text-xs text-gray-500">
                <Link href="/login?next=%2Faccount" className="font-semibold text-[#9A7419] underline">
                  Sign in
                </Link>{" "}
                to receive account notifications.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="px-4 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-gray-500">
                <LoaderCircle size={17} className="animate-spin" />
                Loading notifications...
              </div>
            ) : items.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Bell size={25} className="mx-auto text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-700">
                  You&apos;re all caught up
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  New order and store updates will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.click_url || "/account"}
                      onClick={() => {
                        void markRead(item);
                        setOpen(false);
                      }}
                      className={[
                        "block px-4 py-3 transition-colors hover:bg-[#D4AF37]/[0.07]",
                        item.read_at ? "bg-white" : "bg-[#D4AF37]/[0.06]",
                      ].join(" ")}
                    >
                      <div className="flex gap-3">
                        <span
                          className={[
                            "mt-1.5 size-2 shrink-0 rounded-full",
                            item.read_at ? "bg-gray-200" : "bg-[#C9952E]",
                          ].join(" ")}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#071A35]">
                            {item.title}
                          </p>
                          <p className="mt-1 break-words text-xs leading-5 text-gray-600">
                            {item.body}
                          </p>
                          <p className="mt-2 text-[10px] text-gray-400">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#9A7419] hover:underline"
            >
              Account settings
            </Link>
            <button
              type="button"
              onClick={() => void loadNotifications()}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#071A35] disabled:opacity-50"
            >
              <CheckCheck size={14} />
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
