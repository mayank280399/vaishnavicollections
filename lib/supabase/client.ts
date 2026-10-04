import { createBrowserClient } from "@supabase/ssr";

let supabaseClient:
  | ReturnType<typeof createBrowserClient>
  | undefined;

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
    );
  }

  return supabaseClient;
}