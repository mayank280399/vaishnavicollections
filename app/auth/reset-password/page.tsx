"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Your password has been updated. Redirecting to sign in…");
      window.setTimeout(() => router.replace("/login"), 1200);
    } catch (resetError) {
      console.error("Password update error:", resetError);
      setError("Unable to update your password. Request a new reset link and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-navy px-4 py-8 sm:px-6">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <Image src="/vc_white_logo.png" alt="Vaishnavi Collections" width={190} height={64} priority className="h-auto w-[170px] sm:w-[190px]" />
        </div>

        <section className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-brand-navy">Choose a new password</h1>
            <p className="mt-2 text-sm text-slate-600">Enter and confirm your new account password.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-900 outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 px-4 text-base text-slate-900 outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
              />
            </label>

            {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {message && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

            <button type="submit" disabled={loading} className="min-h-12 w-full rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Updating password…" : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="font-semibold text-brand-navy hover:underline">Back to sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
