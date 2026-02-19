import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, referred_by, website } = body as {
    email?: unknown;
    name?: unknown;
    referred_by?: unknown;
    website?: unknown;
  };

  // Honeypot — bots fill this in; humans never see it
  if (website) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedName =
    name && typeof name === "string" ? name.trim() || null : null;

  const normalizedReferredBy =
    referred_by && typeof referred_by === "string"
      ? referred_by.trim() || null
      : null;

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("waitlist_entries").insert({
    email: normalizedEmail,
    name: normalizedName,
    referred_by: normalizedReferredBy,
  });

  if (error) {
    // PostgreSQL unique_violation → duplicate email
    if (error.code === "23505") {
      return NextResponse.json({ status: "already_joined" }, { status: 200 });
    }
    console.error("Waitlist insert error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
