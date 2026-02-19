import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/isAdmin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { WaitlistEntry } from "@/types/waitlist";

const PAGE_SIZE = 20;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const rawQ = params.q;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ) ?? "";
  const rawPage = params.page;
  const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const currentPage = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const db = createSupabaseAdminClient();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const baseList = db
    .from("waitlist_entries")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const filteredList = q
    ? baseList.or(`email.ilike.%${q}%,name.ilike.%${q}%`)
    : baseList;

  const [
    { count: totalCount },
    { count: todayCount },
    { data, count: filteredCount },
  ] = await Promise.all([
    db.from("waitlist_entries").select("*", { count: "exact", head: true }),
    db
      .from("waitlist_entries")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
    filteredList.range(from, to),
  ]);

  const entries = (data ?? []) as WaitlistEntry[];
  const totalPages = Math.ceil((filteredCount ?? 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">Admin — Waitlist</h1>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export"
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Export CSV
            </a>
            <form action="/admin/logout" method="POST">
              <button
                type="submit"
                className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 flex gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4">
            <p className="text-xs text-zinc-500">Total</p>
            <p className="text-2xl font-bold text-zinc-900">
              {totalCount ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4">
            <p className="text-xs text-zinc-500">Today</p>
            <p className="text-2xl font-bold text-zinc-900">
              {todayCount ?? 0}
            </p>
          </div>
        </div>

        {/* Search */}
        <form method="GET" className="mb-4 flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={q}
            placeholder="Search email or name…"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Search
          </button>
          {q && (
            <a
              href="/admin"
              className="rounded border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Clear
            </a>
          )}
        </form>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {entries.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600">
                    Signed up
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-900">{entry.email}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {entry.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(entry.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              {q ? "No results for that search." : "No entries yet."}
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
            <span>
              Page {currentPage} of {totalPages}
              {filteredCount != null && ` (${filteredCount} results)`}
            </span>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <a
                  href={`/admin?page=${currentPage - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="rounded border border-zinc-300 bg-white px-3 py-1.5 hover:bg-zinc-50"
                >
                  ← Prev
                </a>
              )}
              {currentPage < totalPages && (
                <a
                  href={`/admin?page=${currentPage + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="rounded border border-zinc-300 bg-white px-3 py-1.5 hover:bg-zinc-50"
                >
                  Next →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
