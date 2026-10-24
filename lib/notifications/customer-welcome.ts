import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates the customer's welcome notification once.
 * Returns true only for the request that successfully creates it.
 * The database partial unique index is the final protection against
 * simultaneous login requests creating duplicate welcome messages.
 */
export async function ensureCustomerWelcomeNotification(
  userId: string,
): Promise<boolean> {
  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to read customer profile: ${profileError.message}`);
  }

  if (!profile) {
    throw new Error("The authenticated user profile was not found.");
  }

  if (String(profile.role).toUpperCase() !== "CUSTOMER") {
    return false;
  }

  const { data: existing, error: existingError } = await admin
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "WELCOME")
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Unable to check existing welcome notification: ${existingError.message}`,
    );
  }

  if (existing) {
    return false;
  }

  const customerName =
    typeof profile.full_name === "string" && profile.full_name.trim()
      ? profile.full_name.trim()
      : "there";

  const { error: insertError } = await admin
    .from("notifications")
    .insert({
      user_id: userId,
      type: "WELCOME",
      title: "Welcome to Vaishnavi Collections!",
      body: `Welcome ${customerName}! Please fill your remaining details.`,
      click_url: "/account",
      metadata: { event_key: "customer_welcome_v1" },
    });

  if (insertError) {
    // Concurrent requests can race after both perform the existence check.
    // The unique index makes the losing request a harmless non-first login.
    if (insertError.code === "23505") {
      return false;
    }

    throw new Error(
      `Unable to create welcome notification: ${insertError.message}`,
    );
  }

  return true;
}
