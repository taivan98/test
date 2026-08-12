import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { status } = await searchParams;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-paper-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="text-xs font-mono uppercase tracking-wide text-accent mb-1">Organizator</div>
        <h1 className="text-xl font-semibold mb-5">Prijava</h1>

        {status === "invalid" && (
          <div className="mb-4 rounded-lg bg-bad-soft border border-bad/30 p-3 text-sm text-bad">
            Pogrešna lozinka.
          </div>
        )}

        <form action="/api/admin/login" method="POST" className="flex flex-col gap-3">
          <label className="text-sm font-medium" htmlFor="password">
            Lozinka
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded-lg border border-border px-3 py-2.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="mt-1 rounded-lg bg-accent text-accent-ink font-semibold py-2.5 hover:opacity-90 transition"
          >
            Uđi
          </button>
        </form>
      </div>
    </main>
  );
}
