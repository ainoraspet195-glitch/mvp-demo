import { isAdmin } from "@/lib/auth/isAdmin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import type { WaitlistEntry } from "@/types/waitlist";

function toCSVField(val: string | null): string {
  return `"${(val ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("waitlist_entries")
    .select("id,email,name,referred_by,created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("CSV export error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const header = "id,email,name,referred_by,created_at";
  const rows = (data as WaitlistEntry[]).map((r) =>
    [r.id, r.email, r.name, r.referred_by, r.created_at]
      .map(toCSVField)
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="waitlist.csv"',
    },
  });
}
