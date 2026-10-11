"use client";

import React, {FormEvent,Suspense, useEffect,useMemo, useState,} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User,} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
type AuthMode = "login" | "register";

function getSafeRedirect(value: string | null) {
  if (!value) return "/";

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function isValidEmail(value: string) {
  const email = value.trim().toLowerCase();

  if (!email) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function normalizeOtp(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(() => createClient(), []);

  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * ---------------------------------------------------------
   * CONTEXT
   * ---------------------------------------------------------
   */

  const redirectPath = useMemo(
    () => getSafeRedirect(searchParams.get("redirect")),
    [searchParams],
  );

  const pageTitle =
    mode === "login"
      ? "Welcome back! 👋"
      : "Vaishnavi Collections me account banaiye 💛";

  const pageDescription =
    mode === "login"
      ? "Apne account me login karein aur apni shopping, orders aur profile details dekhein."
      : "Apni details save karein aur future shopping ko aur easy banaiye.";

  /*
   * ---------------------------------------------------------
   * EMAIL OTP COUNTDOWN
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((value) =>
        value > 0 ? value - 1 : 0,
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendCooldown]);

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function getUserRole(userId: string) {
    const { data, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (roleError) {
      console.error("Role fetch error:", roleError);

      return null;
    }

    return data?.role ?? null;
  }

  async function verifyProfile(userId: string) {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Profile verification error:",
        profileError,
      );

      return false;
    }

    return Boolean(data);
  }

  async function verifyProfileWithRetry(userId: string) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const exists = await verifyProfile(userId);

      if (exists) {
        return true;
      }

      if (attempt < 2) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, 500),
        );
      }
    }

    return false;
  }

  async function redirectAfterAuth(userId: string) {
    const role = await getUserRole(userId);

    if (
      role === "ADMIN" ||
      role === "OWNER" ||
      role === "STAFF"
    ) {
      router.replace("/admin");
      return;
    }

    router.replace(redirectPath);
  }

  /*
   * ---------------------------------------------------------
   * EMAIL VALIDATION
   * ---------------------------------------------------------
   */

  function validateEmail() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return false;
    }

    if (!isValidEmail(cleanEmail)) {
      setError(
        "Please enter a valid email address.",
      );
      return false;
    }

    return true;
  }

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   */

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    clearMessages();

    const cleanEmail = email.trim().toLowerCase();

    if (!validateEmail()) {
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (result.error) {
        console.error("Login error:", result.error);

        const message =
          result.error.message.toLowerCase();

        if (
          message.includes(
            "invalid login credentials",
          ) ||
          message.includes("invalid credentials")
        ) {
          setError(
            "Email or password is incorrect. Please try again.",
          );
        } else if (
          message.includes("email not confirmed")
        ) {
          setError(
            "Your email has not been confirmed yet. Please verify your email first.",
          );
        } else {
          setError(
            result.error.message ||
              "Login failed. Please try again.",
          );
        }

        return;
      }

      if (!result.data.user) {
        setError(
          "Login failed. Please try again.",
        );
        return;
      }

      const hasProfile = await verifyProfile(
        result.data.user.id,
      );

      if (!hasProfile) {
        setError(
          "Account found, but profile setup is not complete. Please try again.",
        );
        return;
      }

      await redirectAfterAuth(result.data.user.id);
    } catch (err) {
      console.error("Unexpected login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected problem occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * REGISTER
   * ---------------------------------------------------------
   *
   * Name + Email + Password
   * Email OTP verification
   * ---------------------------------------------------------
   */

  async function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    clearMessages();

    const trimmedName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!validateEmail()) {
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords you entered do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
       * Supabase signup.
       *
       * IMPORTANT:
       * When "Confirm email" is enabled in Supabase,
       * signUp() sends the email confirmation OTP and
       * returns session = null until the OTP is verified.
       */
      const result = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: trimmedName,
          },
        },
      });

      if (result.error) {
        console.error(
          "Registration error:",
          result.error,
        );

        const message =
          result.error.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already exists") ||
          message.includes("user already registered")
        ) {
          setError(
            "This email is already registered. Please login instead.",
          );
        } else {
          setError(
            result.error.message ||
              "Failed to create account. Please try again.",
          );
        }

        return;
      }

      if (!result.data.user) {
        setError(
          "Failed to create account. Please try again.",
        );
        return;
      }

      /*
       * With Supabase email confirmation enabled:
       *
       * user  -> exists
       * session -> null
       *
       * This means the account was created but email
       * verification is still pending.
       */
      if (!result.data.session) {
        setOtpSentTo(cleanEmail);
        setOtp("");
        setOtpStep(true);
        setResendCooldown(60);

        setSuccess(
          "A verification code has been sent to your email.",
        );

        return;
      }

      /*
       * If email confirmation is disabled in Supabase,
       * signup may immediately create a session.
       *
       * In that case there is no OTP verification step.
       */
      const hasProfile =
        await verifyProfileWithRetry(
          result.data.user.id,
        );

      if (!hasProfile) {
        setError(
          "Account created, but profile setup is not complete. Please try again.",
        );
        return;
      }

      await redirectAfterAuth(result.data.user.id);
    } catch (err) {
      console.error(
        "Unexpected registration error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "An unexpected problem occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * VERIFY REGISTRATION EMAIL OTP
   * ---------------------------------------------------------
   */

  async function handleVerifyOtp(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    clearMessages();

    const cleanOtp = normalizeOtp(otp);

    if (cleanOtp.length !== 6) {
      setError(
        "Please enter a 6-digit verification code.",
      );
      return;
    }

    if (!otpSentTo) {
      setError(
        "Verification details missing. Please try again.",
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * This is a SIGNUP verification OTP.
       *
       * Use:
       *   type: "signup"
       *
       * NOT:
       *   type: "email"
       */
      const verifyResult =
        await supabase.auth.verifyOtp({
          email: otpSentTo,
          token: cleanOtp,
          type: "signup",
        });

      if (verifyResult.error) {
        console.error(
          "Registration email OTP verification error:",
          verifyResult.error,
        );

        const message =
          verifyResult.error.message.toLowerCase();

        if (
          message.includes("expired") ||
          message.includes("otp expired")
        ) {
          setError(
            "Your verification code has expired. Please request a new OTP.",
          );
        } else if (
          message.includes("invalid") ||
          message.includes("token")
        ) {
          setError(
            "Verification code is invalid. Please check and try again.",
          );
        } else {
          setError(
            verifyResult.error.message ||
              "Failed to verify email. Please try again.",
          );
        }

        return;
      }

      const user = verifyResult.data.user;

      if (!user) {
        setError(
          "Verification could not be completed. Please try again.",
        );
        return;
      }

      /*
       * The OTP verification creates/establishes the
       * authenticated session.
       *
       * Now verify that our profile trigger has created
       * the customer profile.
       */
      const hasProfile =
        await verifyProfileWithRetry(user.id);

      if (!hasProfile) {
        setError(
          "Email successfully verified, but profile setup is not complete. Please try again later.",
        );
        return;
      }

      setSuccess(
        "Email successfully verified! 🎉",
      );

      await redirectAfterAuth(user.id);
    } catch (err) {
      console.error(
        "Unexpected OTP verification error:",
        err,
      );

      setError(
        "An unexpected problem occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * RESEND REGISTRATION EMAIL OTP
   * ---------------------------------------------------------
   */

  async function handleResendOtp() {
    clearMessages();

    if (resendCooldown > 0) {
      return;
    }

    if (!otpSentTo) {
      setError(
        "Verification details missing. Please try again.",
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * type: "signup" tells Supabase that this is the
       * registration/email-confirmation OTP.
       */
      const resendResult =
        await supabase.auth.resend({
          type: "signup",
          email: otpSentTo,
        });

      if (resendResult.error) {
        console.error(
          "Resend registration email OTP error:",
          resendResult.error,
        );

        setError(
          resendResult.error.message ||
            "Failed to resend OTP. Please try again later.",
        );

        return;
      }

      setOtp("");
      setResendCooldown(60);

      setSuccess(
        "A new OTP has been sent to your email.",
      );
    } catch (err) {
      console.error(
        "Unexpected resend OTP error:",
        err,
      );

      setError(
        "An unexpected problem occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * EDIT VERIFICATION DETAILS
   * ---------------------------------------------------------
   */

  function handleEditVerificationDetails() {
    clearMessages();

    setOtpStep(false);
    setOtp("");
    setOtpSentTo("");
    setResendCooldown(0);
  }

  /*
   * ---------------------------------------------------------
   * GOOGLE LOGIN
   * ---------------------------------------------------------
   */

  async function handleGoogleLogin() {
    clearMessages();

    setGoogleLoading(true);

    try {
      const callbackUrl =
        `${window.location.origin}/auth/callback` +
        `?next=${encodeURIComponent(
          redirectPath,
        )}`;

      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callbackUrl,
          },
        });

      if (googleError) {
        console.error(
          "Google login error:",
          googleError,
        );

        setError(
          googleError.message ||
            "Failed to login with Google. Please try again.",
        );
      }
    } catch (err) {
      console.error(
        "Unexpected Google login error:",
        err,
      );

      setError(
        "An unexpected problem occurred. Please try again.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * FORGOT PASSWORD
   * ---------------------------------------------------------
   *
   * Login page -> enter email -> reset email
   * -> /auth/reset-password
   *
   * UI remains unchanged.
   * ---------------------------------------------------------
   */

  async function handleForgotPassword() {
    clearMessages();

    if (!validateEmail()) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    setLoading(true);

    try {
      const resetRedirect =
        `${window.location.origin}/auth/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: resetRedirect,
          },
        );

      if (resetError) {
        console.error(
          "Password reset error:",
          resetError,
        );

        setError(
          resetError.message ||
            "Failed to send password reset email.",
        );

        return;
      }

      /*
       * Supabase intentionally does not expose whether
       * the email actually exists. This prevents account
       * enumeration.
       */
      setSuccess(
        "If an account exists with this email, a password reset link has been sent to your inbox. 📧",
      );
    } catch (err) {
      console.error(
        "Unexpected password reset error:",
        err,
      );

      setError(
        "An unexpected problem occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * MODE CHANGE
   * ---------------------------------------------------------
   */

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);

    clearMessages();

    setOtpStep(false);
    setOtp("");
    setOtpSentTo("");
    setResendCooldown(0);

    setPassword("");
    setConfirmPassword("");
  }

  /*
   * ---------------------------------------------------------
   * OTP SCREEN
   * ---------------------------------------------------------
   */

  if (otpStep && mode === "register") {
    const maskedDestination =
      otpSentTo.replace(
        /^(.{2})(.*)(@.*)$/,
        (_, first, middle, domain) =>
          `${first}${"*".repeat(
            Math.min(middle.length, 6),
          )}${domain}`,
      );

    return (
      <main className="min-h-screen bg-[#071A35] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-6 shadow-2xl sm:p-9">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071A35] text-[#D4AF37]">
                ✦
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Vaishnavi Collections
                </p>

                <p className="font-semibold text-[#071A35]">
                  My Account
                </p>
              </div>
            </div>

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Mail className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-bold text-[#071A35] sm:text-3xl">
              Enter Verification Code
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              We've sent a 6-digit verification code to your
              email address.
            </p>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  Verification sent to
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-[#071A35]">
                  {maskedDestination}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleEditVerificationDetails
                }
                disabled={loading}
                className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#071A35] hover:underline"
              >
                Edit
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}

            <form
              onSubmit={handleVerifyOtp}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  6-digit OTP
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      normalizeOtp(
                        event.target.value,
                      ),
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-center text-xl font-semibold tracking-[0.35em] text-[#071A35] outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading ||
                  otp.length !== 6
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A35] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#071A35]/10 transition hover:bg-[#0b2750] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              {resendCooldown > 0 ? (
                <p className="text-sm text-gray-500">
                  OTP resend karne ke liye{" "}
                  <span className="font-semibold text-[#071A35]">
                    {resendCooldown}s
                  </span>{" "}
                  wait kijiye.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#071A35] hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="mt-7 rounded-2xl bg-[#071A35]/5 p-4">
              <p className="text-xs leading-5 text-gray-500">
                Details galat hain?{" "}
                <button
                  type="button"
                  onClick={
                    handleEditVerificationDetails
                  }
                  className="font-semibold text-[#071A35] underline underline-offset-2"
                >
                  Edit karke
                </button>{" "}
                correct email enter kijiye.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN AUTH UI
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#071A35] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden bg-[#071A35] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-medium text-white/60">
                    Vaishnavi Collections
                  </p>

                  <p className="text-lg font-semibold">
                    My Account
                  </p>
                </div>
              </div>

              <h2 className="max-w-md text-4xl font-bold leading-tight">
                Welcome to
                <span className="block text-[#D4AF37]">
                  Vaishnavi Collections 💛
                </span>
              </h2>

              <p className="mt-5 max-w-md text-base leading-7 text-white/70">
                Apne account se orders, profile,
                address aur shopping details easily
                manage kijiye.
              </p>
            </div>

            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Vaishnavi
              Collections
            </p>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071A35] text-[#D4AF37]">
                ✦
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Vaishnavi Collections
                </p>

                <p className="font-semibold text-[#071A35]">
                  My Account
                </p>
              </div>
            </div>

            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[#071A35] sm:text-3xl">
                {pageTitle}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                {pageDescription}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() =>
                  changeMode("login")
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white text-[#071A35] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() =>
                  changeMode("register")
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mode === "register"
                    ? "bg-white text-[#071A35] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Register
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D4AF37]" />

                <p className="text-sm font-semibold text-[#071A35]">
                  Email se continue kijiye
                </p>
              </div>

              <p className="mt-1 pl-6 text-xs leading-5 text-gray-500">
                Your email is used for account login and
                verification.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}

            <form
              onSubmit={
                mode === "login"
                  ? handleLogin
                  : handleRegister
              }
              className="space-y-4"
            >
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Customer Name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Enter your name"
                      autoComplete="name"
                      maxLength={100}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={254}
                    className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[#D4AF37]/20 ${
                      email &&
                      !isValidEmail(email)
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-[#D4AF37]"
                    }`}
                  />
                </div>

                {email &&
                  !isValidEmail(email) && (
                    <p className="mt-1.5 text-xs text-red-500">
                      Please valid email address enter
                      kijiye.
                    </p>
                  )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Password"
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-11 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {mode === "register" &&
                  password &&
                  password.length < 6 && (
                    <p className="mt-1.5 text-xs text-red-500">
                      Password minimum 6 characters ka
                      hona chahiye.
                    </p>
                  )}
              </div>

              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Enter Password again
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value,
                        )
                      }
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border bg-white py-3 pl-10 pr-11 text-sm outline-none transition focus:ring-2 focus:ring-[#D4AF37]/20 ${
                        confirmPassword &&
                        password !==
                          confirmPassword
                          ? "border-red-300 focus:border-red-400"
                          : "border-gray-200 focus:border-[#D4AF37]"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {confirmPassword &&
                    password !==
                      confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-500">
                        Passwords match nahi kar rahe.
                      </p>
                    )}
                </div>
              )}

              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={
                      handleForgotPassword
                    }
                    className="text-sm font-medium text-[#071A35] underline-offset-4 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading || googleLoading
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#071A35] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#071A35]/10 transition hover:bg-[#0b2750] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode === "login"
                      ? "Login"
                      : "Create Account"}

                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs text-gray-400">
                ya
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={
                loading || googleLoading
              }
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-base font-bold">
                  G
                </span>
              )}

              {googleLoading
                ? "Please wait..."
                : "Continue with Google"}
            </button>

            <div className="mt-7 text-center text-sm text-gray-500">
              {mode === "login" ? (
                <>
                  Pehli baar aaye hain?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      changeMode("register")
                    }
                    className="font-semibold text-[#071A35] underline-offset-4 hover:underline"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already account hai?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      changeMode("login")
                    }
                    className="font-semibold text-[#071A35] underline-offset-4 hover:underline"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#071A35] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
            <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-2xl">
              <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />

              <span className="text-sm font-medium text-[#071A35]">
                Loading...
              </span>
            </div>
          </div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}