import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

if (!process.env.KOSI_SUPABASE_API_URL)
  throw new Error("Missing KOSI_SUPABASE_API_URL");
if (!process.env.KOSI_SUPABASE_SERVICE_ROLE_KEY)
  throw new Error("Missing KOSI_SUPABASE_SERVICE_ROLE_KEY");

// Use HTTP URL format for Supabase client
const supabaseUrl = process.env.KOSI_SUPABASE_API_URL;
const supabaseKey = process.env.KOSI_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  db: {
    schema: "public"
  }
});
