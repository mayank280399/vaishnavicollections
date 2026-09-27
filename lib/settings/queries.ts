import { createClient } from "@/lib/supabase/server";
import { AppSettings } from "./settings-types";


export async function getAppSettings(): Promise<AppSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Failed to fetch app settings:", error);
    return null;
  }

  return data as AppSettings;
}