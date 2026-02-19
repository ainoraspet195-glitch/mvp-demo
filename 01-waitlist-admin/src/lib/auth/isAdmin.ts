import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Returns true if the currently authenticated user's email matches ADMIN_EMAIL.
 * Must only be called from server-side code (Server Components, Route Handlers).
 */
export async function isAdmin(): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.email === adminEmail;
}
