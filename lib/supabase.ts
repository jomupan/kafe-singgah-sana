import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing Supabase keys. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart `npm run dev`.",
  );
}

// One shared connection used by every page.
// The publishable key is safe in the browser because Row Level Security
// (see supabase/schema.sql) decides what each visitor is allowed to do.
export const supabase = createClient(url, key);
