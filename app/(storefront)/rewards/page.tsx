import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import RewardsLandingPage from "@/components/storefront/rewards/RewardsLandingPage";

export const metadata = {
  title: "VC Rewards Club | Vaishnavi Collections",
  description:
    "Explore VC Rewards, discover member benefits, and shop Laddu Gopal poshak, shringar, home décor, beauty and handmade accessories.",
};

type WelcomePromotion = {
  code: string;
  name: string;
  description: string | null;
  discount_type: "FIXED" | "PERCENTAGE";
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  first_order_only: boolean;
};

async function getWelcomePromotion(): Promise<WelcomePromotion | null> {
  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await admin
      .from("promotions")
      .select(
        "code,name,description,discount_type,discount_value,minimum_order_amount,maximum_discount_amount,starts_at,ends_at,first_order_only",
      )
      .eq("active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Unable to load active rewards promotion:", error.message);
      return null;
    }

    const promotion = (data ?? []).find((item) => {
      const code = String(item.code ?? "").toUpperCase();
      const name = String(item.name ?? "").toLowerCase();
      return code.includes("WELCOME") || name.includes("welcome");
    });

    if (!promotion) return null;

    return {
      code: String(promotion.code),
      name: String(promotion.name),
      description: promotion.description ? String(promotion.description) : null,
      discount_type: promotion.discount_type as "FIXED" | "PERCENTAGE",
      discount_value: Number(promotion.discount_value),
      minimum_order_amount: Number(promotion.minimum_order_amount),
      maximum_discount_amount:
        promotion.maximum_discount_amount == null
          ? null
          : Number(promotion.maximum_discount_amount),
      starts_at: promotion.starts_at ? String(promotion.starts_at) : null,
      ends_at: promotion.ends_at ? String(promotion.ends_at) : null,
      first_order_only: Boolean(promotion.first_order_only),
    };
  } catch (error) {
    console.error("Unable to load rewards promotion:", error);
    return null;
  }
}

export default async function RewardsPage() {
  const promotion = await getWelcomePromotion();

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <RewardsLandingPage promotion={promotion} />
    </main>
  );
}
