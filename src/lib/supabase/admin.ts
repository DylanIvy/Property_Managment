import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Service-role client — bypasses RLS. Only ever used server-side, and only
// for narrow system actions where we fully control the inserted data (e.g.
// spawning the next occurrence of a recurring task on behalf of whichever
// user just completed the current one). Never expose this client's key to
// the browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
