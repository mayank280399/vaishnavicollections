import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}

/**
 * Service-role client.
 *
 * IMPORTANT:
 * This file is server-only.
 * The service-role key must NEVER be exposed to the browser.
 */
const adminSupabase = createAdminSupabaseClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Normalize an Indian mobile number to +91XXXXXXXXXX.
 */
function normalizeIndianPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  return value.trim();
}

/**
 * Validate canonical Indian mobile number.
 */
function isValidIndianPhone(phone: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(phone);
}

/**
 * Internal email used ONLY by Supabase Auth.
 *
 * This must never be generated or displayed in the client.
 */
function getInternalAuthEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  return `reward-${digits}@auth.vaishnavicollections.local`;
}

/**
 * Generate a customer code.
 */
function generateCustomerCode(): string {
  return `VC-CUS-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

/**
 * Safely convert unknown errors to a readable message.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return String((error as { message: string }).message);
  }

  return String(error);
}

/**
 * Delete records created during a failed registration.
 *
 * Order:
 * 1. customer
 * 2. profile
 * 3. auth user
 */
async function cleanupFailedRegistration(
  userId: string,
): Promise<void> {
  try {
    await adminSupabase
      .from("customers")
      .delete()
      .eq("profile_id", userId);
  } catch (error) {
    console.error(
      "[Rewards Registration] Customer cleanup failed:",
      error,
    );
  }

  try {
    await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", userId);
  } catch (error) {
    console.error(
      "[Rewards Registration] Profile cleanup failed:",
      error,
    );
  }

  try {
    const { error } =
      await adminSupabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error(
        "[Rewards Registration] Auth cleanup failed:",
        error,
      );
    }
  } catch (error) {
    console.error(
      "[Rewards Registration] Auth cleanup exception:",
      error,
    );
  }
}

/**
 * Synchronize a customer with the authenticated profile.
 *
 * This is intentionally authoritative for the physical-shop
 * rewards registration flow.
 *
 * Customer lookup order:
 *
 * 1. profile_id
 * 2. internal email
 * 3. create a new customer
 *
 * It also protects against accidentally attaching a customer
 * belonging to another profile.
 */
async function synchronizeRewardsCustomer(params: {
  profileId: string;
  name: string;
  phone: string;
  internalEmail: string;
}) {
  const {
    profileId,
    name,
    phone,
    internalEmail,
  } = params;

  console.log(
    "[Rewards Customer Sync] Starting synchronization:",
    {
      profileId,
      phone,
      internalEmail,
    },
  );

  /**
   * ---------------------------------------------------------
   * 1. Find customer by profile_id
   * ---------------------------------------------------------
   */
  const {
    data: customerByProfile,
    error: profileLookupError,
  } = await adminSupabase
    .from("customers")
    .select(
      `
        id,
        profile_id,
        customer_code,
        display_name,
        phone,
        email,
        source
      `,
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (profileLookupError) {
    throw new Error(
      `Customer profile lookup failed: ${profileLookupError.message}`,
    );
  }

  /**
   * ---------------------------------------------------------
   * 2. If no customer by profile_id, look by internal email
   * ---------------------------------------------------------
   *
   * This handles malformed/orphan customer rows created by
   * an earlier registration attempt.
   */
  let existingCustomer = customerByProfile;

  if (!existingCustomer) {
    const {
      data: customerByEmail,
      error: emailLookupError,
    } = await adminSupabase
      .from("customers")
      .select(
        `
          id,
          profile_id,
          customer_code,
          display_name,
          phone,
          email,
          source
        `,
      )
      .eq("email", internalEmail)
      .maybeSingle();

    if (emailLookupError) {
      throw new Error(
        `Customer email lookup failed: ${emailLookupError.message}`,
      );
    }

    if (customerByEmail) {
      existingCustomer = customerByEmail;
    }
  }

  /**
   * ---------------------------------------------------------
   * 3. Protect against profile conflicts
   * ---------------------------------------------------------
   */
  if (
    existingCustomer &&
    existingCustomer.profile_id &&
    existingCustomer.profile_id !== profileId
  ) {
    console.error(
      "[Rewards Customer Sync] Customer belongs to another profile:",
      {
        customerId: existingCustomer.id,
        existingProfileId: existingCustomer.profile_id,
        requestedProfileId: profileId,
        email: existingCustomer.email,
      },
    );

    throw new Error(
      "This rewards account is already linked to another profile.",
    );
  }

  /**
   * ---------------------------------------------------------
   * 4. If customer exists, UPDATE it.
   * ---------------------------------------------------------
   *
   * This is the critical fix.
   *
   * We do NOT assume that an existing customer is already
   * correctly populated.
   *
   * Phone/source/email/profile_id are synchronized here.
   */
  if (existingCustomer) {
    console.log(
      "[Rewards Customer Sync] Existing customer found. Updating:",
      {
        customerId: existingCustomer.id,
        previousProfileId: existingCustomer.profile_id,
        previousPhone: existingCustomer.phone,
        previousEmail: existingCustomer.email,
        previousSource: existingCustomer.source,
      },
    );

    const {
      data: updatedCustomer,
      error: updateError,
    } = await adminSupabase
      .from("customers")
      .update({
        profile_id: profileId,
        display_name: name,
        phone,
        email: internalEmail,
        source: "PHYSICAL_SHOP",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingCustomer.id)
      .select(
        `
          id,
          profile_id,
          customer_code,
          display_name,
          phone,
          email,
          source
        `,
      )
      .single();

    if (updateError) {
      throw new Error(
        `Customer synchronization failed: ${updateError.message}`,
      );
    }

    existingCustomer = updatedCustomer;
  } else {
    /**
     * -------------------------------------------------------
     * 5. No customer exists. Create one.
     * -------------------------------------------------------
     */
    const customerCode = generateCustomerCode();

    console.log(
      "[Rewards Customer Sync] Creating new customer:",
      {
        profileId,
        customerCode,
        phone,
        internalEmail,
      },
    );

    const {
      data: createdCustomer,
      error: insertError,
    } = await adminSupabase
      .from("customers")
      .insert({
        profile_id: profileId,
        customer_code: customerCode,
        display_name: name,
        phone,
        email: internalEmail,
        source: "PHYSICAL_SHOP",
      })
      .select(
        `
          id,
          profile_id,
          customer_code,
          display_name,
          phone,
          email,
          source
        `,
      )
      .single();

    if (insertError) {
      /**
       * A race condition or another process may have created
       * the customer between our lookup and insert.
       *
       * Re-fetch by profile_id before failing.
       */
      console.warn(
        "[Rewards Customer Sync] Customer insert failed. Rechecking:",
        insertError.message,
      );

      const {
        data: raceCustomer,
        error: raceLookupError,
      } = await adminSupabase
        .from("customers")
        .select(
          `
            id,
            profile_id,
            customer_code,
            display_name,
            phone,
            email,
            source
          `,
        )
        .eq("profile_id", profileId)
        .maybeSingle();

      if (raceLookupError) {
        throw new Error(
          `Customer insert failed and recovery lookup failed: ${raceLookupError.message}`,
        );
      }

      if (!raceCustomer) {
        throw new Error(
          `Customer creation failed: ${insertError.message}`,
        );
      }

      /**
       * Synchronize the race-created customer as well.
       */
      const {
        data: synchronizedRaceCustomer,
        error: raceUpdateError,
      } = await adminSupabase
        .from("customers")
        .update({
          display_name: name,
          phone,
          email: internalEmail,
          source: "PHYSICAL_SHOP",
          updated_at: new Date().toISOString(),
        })
        .eq("id", raceCustomer.id)
        .select(
          `
            id,
            profile_id,
            customer_code,
            display_name,
            phone,
            email,
            source
          `,
        )
        .single();

      if (raceUpdateError) {
        throw new Error(
          `Customer recovery synchronization failed: ${raceUpdateError.message}`,
        );
      }

      existingCustomer = synchronizedRaceCustomer;
    } else {
      existingCustomer = createdCustomer;
    }
  }

  /**
   * ---------------------------------------------------------
   * 6. Final verification
   * ---------------------------------------------------------
   *
   * Never continue to authentication unless the database
   * contains the expected customer state.
   */
  const {
    data: verifiedCustomer,
    error: verificationError,
  } = await adminSupabase
    .from("customers")
    .select(
      `
        id,
        profile_id,
        customer_code,
        display_name,
        phone,
        email,
        source
      `,
    )
    .eq("id", existingCustomer.id)
    .single();

  if (verificationError || !verifiedCustomer) {
    throw new Error(
      `Customer verification failed: ${
        verificationError?.message ?? "Customer not found"
      }`,
    );
  }

  const customerIsCorrect =
    verifiedCustomer.profile_id === profileId &&
    verifiedCustomer.phone === phone &&
    verifiedCustomer.email === internalEmail &&
    verifiedCustomer.source === "PHYSICAL_SHOP";

  if (!customerIsCorrect) {
    console.error(
      "[Rewards Customer Sync] Final verification failed:",
      {
        expected: {
          profileId,
          phone,
          email: internalEmail,
          source: "PHYSICAL_SHOP",
        },
        actual: verifiedCustomer,
      },
    );

    throw new Error(
      "Customer account could not be synchronized correctly.",
    );
  }

  console.log(
    "[Rewards Customer Sync] Customer synchronization successful:",
    {
      customerId: verifiedCustomer.id,
      profileId: verifiedCustomer.profile_id,
      customerCode: verifiedCustomer.customer_code,
      phone: verifiedCustomer.phone,
      email: verifiedCustomer.email,
      source: verifiedCustomer.source,
    },
  );

  return verifiedCustomer;
}

/**
 * Synchronize profile information as well.
 */
async function synchronizeRewardsProfile(params: {
  userId: string;
  name: string;
  phone: string;
  internalEmail: string;
}) {
  const {
    userId,
    name,
    phone,
    internalEmail,
  } = params;

  const {
    data: profile,
    error: profileError,
  } = await adminSupabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        role: "CUSTOMER",
        full_name: name,
        phone,
        email: internalEmail,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    )
    .select(
      `
        id,
        role,
        full_name,
        phone,
        email
      `,
    )
    .single();

  if (profileError) {
    throw new Error(
      `Profile synchronization failed: ${profileError.message}`,
    );
  }

  if (!profile) {
    throw new Error(
      "Profile synchronization returned no profile.",
    );
  }

  if (profile.role !== "CUSTOMER") {
    throw new Error(
      "Rewards registration cannot modify an existing non-customer role.",
    );
  }

  return profile;
}

/**
 * POST /api/auth/rewards-mobile?action=register
 *
 * Body:
 * {
 *   name: string;
 *   phone: string;
 *   password: string;
 * }
 */
async function handleRegister(request: NextRequest) {
  let body: {
    name?: string;
    phone?: string;
    password?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_REQUEST",
        message: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const name = String(body.name ?? "").trim();
  const rawPhone = String(body.phone ?? "").trim();
  const password = String(body.password ?? "");

  if (!name) {
    return NextResponse.json(
      {
        success: false,
        error: "NAME_REQUIRED",
        message: "Name is required.",
      },
      { status: 400 },
    );
  }

  if (!rawPhone) {
    return NextResponse.json(
      {
        success: false,
        error: "PHONE_REQUIRED",
        message: "Mobile number is required.",
      },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      {
        success: false,
        error: "PASSWORD_REQUIRED",
        message: "Password is required.",
      },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      {
        success: false,
        error: "PASSWORD_TOO_SHORT",
        message: "Password must be at least 6 characters.",
      },
      { status: 400 },
    );
  }

  const phone = normalizeIndianPhone(rawPhone);

  if (!isValidIndianPhone(phone)) {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_PHONE",
        message: "Please enter a valid Indian mobile number.",
      },
      { status: 400 },
    );
  }

  const internalEmail = getInternalAuthEmail(phone);

  console.log("[Rewards Registration] Starting:", {
    name,
    phone,
    internalEmail,
  });

  /**
   * ---------------------------------------------------------
   * Prevent duplicate physical-shop accounts by phone.
   * ---------------------------------------------------------
   */
  const {
    data: existingCustomerByPhone,
    error: phoneLookupError,
  } = await adminSupabase
    .from("customers")
    .select(
      `
        id,
        profile_id,
        customer_code,
        display_name,
        phone,
        email,
        source
      `,
    )
    .eq("phone", phone)
    .maybeSingle();

  if (phoneLookupError) {
    console.error(
      "[Rewards Registration] Phone lookup failed:",
      phoneLookupError,
    );

    return NextResponse.json(
      {
        success: false,
        error: "CUSTOMER_LOOKUP_FAILED",
        message: "Unable to check the mobile number right now.",
      },
      { status: 500 },
    );
  }

  if (existingCustomerByPhone) {
    return NextResponse.json(
      {
        success: false,
        error: "CUSTOMER_EXISTS",
        message:
          "An account with this mobile number already exists. Please log in.",
      },
      { status: 409 },
    );
  }

  /**
   * ---------------------------------------------------------
   * Check whether Auth user already exists.
   * ---------------------------------------------------------
   */
  let authUserId: string | null = null;

  try {
    let page = 1;
    const perPage = 1000;

    while (true) {
      const {
        data: authUsers,
        error: listUsersError,
      } = await adminSupabase.auth.admin.listUsers({
        page,
        perPage,
      });

      if (listUsersError) {
        throw new Error(
          `Unable to check existing auth users: ${listUsersError.message}`,
        );
      }

      const matchingUser = authUsers.users.find(
        (user) =>
          user.email?.toLowerCase() ===
          internalEmail.toLowerCase(),
      );

      if (matchingUser) {
        authUserId = matchingUser.id;
        break;
      }

      if (authUsers.users.length < perPage) {
        break;
      }

      page += 1;
    }
  } catch (error) {
    console.error(
      "[Rewards Registration] Auth user lookup failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "AUTH_LOOKUP_FAILED",
        message:
          "Unable to check the rewards account right now.",
      },
      { status: 500 },
    );
  }

  /**
   * If Auth user already exists, do not create another one.
   *
   * We synchronize its profile/customer and tell the client
   * to log in.
   */
  if (authUserId) {
    console.log(
      "[Rewards Registration] Existing Auth user found:",
      authUserId,
    );

    const {
      data: existingAuthUser,
      error: existingAuthUserError,
    } = await adminSupabase.auth.admin.getUserById(
      authUserId,
    );

    if (
      existingAuthUserError ||
      !existingAuthUser.user
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "AUTH_USER_LOOKUP_FAILED",
          message:
            "Unable to load the existing rewards account.",
        },
        { status: 500 },
      );
    }

    try {
      await synchronizeRewardsProfile({
        userId: authUserId,
        name,
        phone,
        internalEmail,
      });

      await synchronizeRewardsCustomer({
        profileId: authUserId,
        name,
        phone,
        internalEmail,
      });
    } catch (error) {
      console.error(
        "[Rewards Registration] Existing account synchronization failed:",
        error,
      );

      return NextResponse.json(
        {
          success: false,
          error: "ACCOUNT_SYNC_FAILED",
          message:
            "The existing rewards account could not be synchronized.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_EXISTS",
        message:
          "This mobile number is already registered. Please log in.",
        loginRequired: true,
      },
      { status: 409 },
    );
  }

  /**
   * ---------------------------------------------------------
   * Create Auth user.
   * ---------------------------------------------------------
   */
  const {
    data: createdAuth,
    error: createAuthError,
  } = await adminSupabase.auth.admin.createUser({
    email: internalEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
      phone,
      auth_flow: "REWARDS_PHYSICAL_SHOP",
    },
  });

  if (createAuthError || !createdAuth.user) {
    console.error(
      "[Rewards Registration] Auth creation failed:",
      createAuthError,
    );

    return NextResponse.json(
      {
        success: false,
        error: "AUTH_CREATE_FAILED",
        message:
          createAuthError?.message ??
          "Unable to create the rewards account.",
      },
      { status: 500 },
    );
  }

  authUserId = createdAuth.user.id;

  console.log(
    "[Rewards Registration] Auth user created:",
    authUserId,
  );

  /**
   * ---------------------------------------------------------
   * Synchronize profile + customer.
   * ---------------------------------------------------------
   */
  try {
    await synchronizeRewardsProfile({
      userId: authUserId,
      name,
      phone,
      internalEmail,
    });

    await synchronizeRewardsCustomer({
      profileId: authUserId,
      name,
      phone,
      internalEmail,
    });
  } catch (error) {
    console.error(
      "[Rewards Registration] Profile/customer synchronization failed:",
      error,
    );

    await cleanupFailedRegistration(authUserId);

    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_SETUP_FAILED",
        message:
          "Your rewards account could not be completed. Please try again.",
      },
      { status: 500 },
    );
  }

  /**
   * ---------------------------------------------------------
   * Automatically sign the new customer in.
   * ---------------------------------------------------------
   */
  const supabase = await createServerSupabaseClient();

  try {
    await supabase.auth.signOut();

    const {
      data: loginData,
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password,
    });

    if (loginError || !loginData.user) {
      console.error(
        "[Rewards Registration] Automatic login failed:",
        loginError,
      );

      return NextResponse.json(
        {
          success: true,
          accountCreated: true,
          loginRequired: true,
          message:
            "Account created successfully. Please log in with your mobile number.",
        },
        { status: 200 },
      );
    }

    if (loginData.user.id !== authUserId) {
      console.error(
        "[Rewards Registration] Automatic login returned unexpected user:",
        {
          expected: authUserId,
          received: loginData.user.id,
        },
      );

      await supabase.auth.signOut();

      return NextResponse.json(
        {
          success: true,
          accountCreated: true,
          loginRequired: true,
          message:
            "Account created successfully. Please log in with your mobile number.",
        },
        { status: 200 },
      );
    }

    console.log(
      "[Rewards Registration] Registration + automatic login successful:",
      authUserId,
    );

    return NextResponse.json(
      {
        success: true,
        accountCreated: true,
        loginRequired: false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "[Rewards Registration] Automatic login exception:",
      error,
    );

    return NextResponse.json(
      {
        success: true,
        accountCreated: true,
        loginRequired: true,
        message:
          "Account created successfully. Please log in with your mobile number.",
      },
      { status: 200 },
    );
  }
}

/**
 * POST /api/auth/rewards-mobile?action=login
 *
 * Body:
 * {
 *   phone: string;
 *   password: string;
 * }
 */
async function handleLogin(request: NextRequest) {
  let body: {
    phone?: string;
    password?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_REQUEST",
        message: "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const rawPhone = String(body.phone ?? "").trim();
  const password = String(body.password ?? "");

  if (!rawPhone) {
    return NextResponse.json(
      {
        success: false,
        error: "PHONE_REQUIRED",
        message: "Mobile number is required.",
      },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      {
        success: false,
        error: "PASSWORD_REQUIRED",
        message: "Password is required.",
      },
      { status: 400 },
    );
  }

  const phone = normalizeIndianPhone(rawPhone);

  if (!isValidIndianPhone(phone)) {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_PHONE",
        message: "Please enter a valid Indian mobile number.",
      },
      { status: 400 },
    );
  }

  const internalEmail = getInternalAuthEmail(phone);

  console.log("[Rewards Login] Starting:", {
    phone,
    internalEmail,
  });

  /**
   * ---------------------------------------------------------
   * 1. Find customer by phone.
   * ---------------------------------------------------------
   */
  const {
    data: customerByPhone,
    error: phoneLookupError,
  } = await adminSupabase
    .from("customers")
    .select(
      `
        id,
        profile_id,
        customer_code,
        display_name,
        phone,
        email,
        source
      `,
    )
    .eq("phone", phone)
    .maybeSingle();

  if (phoneLookupError) {
    console.error(
      "[Rewards Login] Customer lookup failed:",
      phoneLookupError,
    );

    return NextResponse.json(
      {
        success: false,
        error: "CUSTOMER_LOOKUP_FAILED",
        message:
          "Unable to verify the mobile number right now.",
      },
      { status: 500 },
    );
  }

  /**
   * ---------------------------------------------------------
   * 2. If phone lookup fails, try internal email.
   * ---------------------------------------------------------
   *
   * This is important for recovering existing malformed
   * customer rows such as:
   *
   * phone = NULL
   * email = reward-XXXXXXXXXX@auth...
   */
  let customer = customerByPhone;

  if (!customer) {
    console.log(
      "[Rewards Login] No customer found by phone. Looking up by internal email...",
    );

    const {
      data: customerByEmail,
      error: emailLookupError,
    } = await adminSupabase
      .from("customers")
      .select(
        `
          id,
          profile_id,
          customer_code,
          display_name,
          phone,
          email,
          source
        `,
      )
      .eq("email", internalEmail)
      .maybeSingle();

    if (emailLookupError) {
      console.error(
        "[Rewards Login] Customer email lookup failed:",
        emailLookupError,
      );

      return NextResponse.json(
        {
          success: false,
          error: "CUSTOMER_LOOKUP_FAILED",
          message:
            "Unable to verify the rewards account right now.",
        },
        { status: 500 },
      );
    }

    customer = customerByEmail;
  }

  if (!customer) {
    console.warn(
      "[Rewards Login] No customer found:",
      {
        phone,
        internalEmail,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: "INVALID_CREDENTIALS",
        message:
          "Mobile number ya password sahi nahi hai. Please dobara check kijiye.",
      },
      { status: 401 },
    );
  }

  console.log(
    "[Rewards Login] Customer found:",
    {
      customerId: customer.id,
      profileId: customer.profile_id,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      source: customer.source,
    },
  );

  /**
   * ---------------------------------------------------------
   * 3. Customer must have a profile.
   * ---------------------------------------------------------
   */
  if (!customer.profile_id) {
    console.error(
      "[Rewards Login] Customer has no profile_id:",
      customer.id,
    );

    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_NOT_LINKED",
        message:
          "This rewards account is not linked correctly. Please contact the shop.",
      },
      { status: 409 },
    );
  }

  /**
   * ---------------------------------------------------------
   * 4. Load Auth user by profile_id.
   * ---------------------------------------------------------
   */
  const {
    data: authUserData,
    error: authUserError,
  } = await adminSupabase.auth.admin.getUserById(
    customer.profile_id,
  );

  if (
    authUserError ||
    !authUserData.user
  ) {
    console.error(
      "[Rewards Login] Auth user lookup failed:",
      {
        customerId: customer.id,
        profileId: customer.profile_id,
        error: authUserError,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_NOT_FOUND",
        message:
          "The rewards account could not be found. Please contact the shop.",
      },
      { status: 404 },
    );
  }

  const authUser = authUserData.user;

  /**
   * ---------------------------------------------------------
   * 5. Verify Auth email corresponds to the mobile number.
   * ---------------------------------------------------------
   */
  if (
    !authUser.email ||
    authUser.email.toLowerCase() !==
      internalEmail.toLowerCase()
  ) {
    console.error(
      "[Rewards Login] Auth identity mismatch:",
      {
        profileId: customer.profile_id,
        expectedEmail: internalEmail,
        actualEmail: authUser.email,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_MISMATCH",
        message:
          "This rewards account is not configured correctly. Please contact the shop.",
      },
      { status: 409 },
    );
  }

  /**
   * ---------------------------------------------------------
   * 6. Synchronize malformed customer data before login.
   * ---------------------------------------------------------
   *
   * This repairs records where:
   *
   * phone = NULL
   * source = ONLINE
   *
   * even though the Auth identity is a rewards physical-shop
   * account.
   */
  try {
    customer = await synchronizeRewardsCustomer({
      profileId: authUser.id,
      name:
        String(
          authUser.user_metadata?.full_name ??
            customer.display_name ??
            "Customer",
        ).trim() || "Customer",
      phone,
      internalEmail,
    });
  } catch (error) {
    console.error(
      "[Rewards Login] Customer synchronization failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_SYNC_FAILED",
        message:
          "The rewards account could not be synchronized. Please contact the shop.",
      },
      { status: 500 },
    );
  }

  /**
   * ---------------------------------------------------------
   * 7. Verify profile/customer relationship.
   * ---------------------------------------------------------
   */
  if (customer.profile_id !== authUser.id) {
    console.error(
      "[Rewards Login] Profile/customer mismatch:",
      {
        customerProfileId: customer.profile_id,
        authUserId: authUser.id,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_MISMATCH",
        message:
          "This rewards account is not linked correctly. Please contact the shop.",
      },
      { status: 409 },
    );
  }

  /**
   * ---------------------------------------------------------
   * 8. Authenticate using the hidden internal email.
   *
   * The client NEVER sees this email.
   * ---------------------------------------------------------
   */
  const supabase = await createServerSupabaseClient();

  await supabase.auth.signOut();

  console.log(
    "[Rewards Login] Authenticating internal Auth identity:",
    internalEmail,
  );

  const {
    data: loginData,
    error: loginError,
  } = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password,
  });

  if (loginError || !loginData.user) {
    console.error(
      "[Rewards Login] Password authentication failed:",
      {
        message: loginError?.message,
        status: loginError?.status,
        code: loginError?.code,
      },
    );

    return NextResponse.json(
      {
        success: false,
        error: "INVALID_CREDENTIALS",
        message:
          "Mobile number ya password sahi nahi hai. Please dobara check kijiye.",
      },
      { status: 401 },
    );
  }

  /**
   * ---------------------------------------------------------
   * 9. Final Auth identity verification.
   * ---------------------------------------------------------
   */
  if (loginData.user.id !== customer.profile_id) {
    console.error(
      "[Rewards Login] Auth user/profile mismatch after login:",
      {
        authUserId: loginData.user.id,
        customerProfileId: customer.profile_id,
      },
    );

    await supabase.auth.signOut();

    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_MISMATCH",
        message:
          "The rewards account could not be verified. Please contact the shop.",
      },
      { status: 409 },
    );
  }

  console.log(
    "[Rewards Login] Login successful:",
    {
      userId: loginData.user.id,
      customerId: customer.id,
      customerCode: customer.customer_code,
      phone: customer.phone,
    },
  );

  return NextResponse.json(
    {
      success: true,
      accountCreated: false,
      loginRequired: false,
    },
    { status: 200 },
  );
}

/**
 * -----------------------------------------------------------
 * POST ROUTE
 * -----------------------------------------------------------
 */
export async function POST(request: NextRequest) {
  const action =
    request.nextUrl.searchParams.get("action")?.toLowerCase();

  try {
    if (action === "register") {
      return await handleRegister(request);
    }

    if (action === "login") {
      return await handleLogin(request);
    }

    return NextResponse.json(
      {
        success: false,
        error: "INVALID_ACTION",
        message:
          "Invalid rewards authentication action.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error(
      "[Rewards Mobile Auth] Unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message:
          "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}