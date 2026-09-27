"use server";

import { createClient } from "@/lib/supabase/server";
import { AppSettingsUpdate } from "./settings-types";


export async function updateAppSettings(
  settings: AppSettingsUpdate
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  const { data, error } = await supabase
    .from("app_settings")
    .update(settings)
    .eq("id", 1)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to update app settings:", error);

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}