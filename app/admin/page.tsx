import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/admin";
import { AdminHeader } from "@/components/AdminHeader";
import { CapacityBar } from "@/components/CapacityBar";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const { days, approvedEmailCount, participantCount } = await getAdminOverview();
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";

  return (
    <>
      <AdminHeader conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-5">Pregled popunjenosti</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden mb-8 max-w-md">
          <div className="bg-paper-card p-4">
            <div className="text-2xl font-mono font-semibold text-accent tabular-nums">{approvedEmailCount}</div>
            <div className="text-xs text-ink-dim mt-0.5">odobrenih e-mailova</div>
          </div>
          <div className="bg-paper-card p-4">
            <div className="text-2xl font-mono font-semibold text-accent tabular-nums">{participantCount}</div>
            <div className="text-xs text-ink-dim mt-0.5">prijavljenih korisnika</div>
          </div>
        </div>

        {days.length === 0 && (
          <p className="text-ink-dim">
            Program još nije unesen.{" "}
            <a href="/admin/program" className="text-accent font-medium">
              Dodaj dane i radionice →
            </a>
          </p>
        )}

        {days.map((day) => (
          <section key={day.id} className="mb-8">
            <h2 className="font-semibold mb-3">{day.labelHr}</h2>
            <div className="flex flex-col gap-5">
              {day.blocks.map((block) => (
                <div key={block.id}>
                  <div className="text-xs font-mono uppercase tracking-wide text-ink-dim mb-2">
                    {block.startLabel}–{block.endLabel}
                  </div>
                  <div className="border border-border rounded-xl overflow-x-auto">
                    <table className="w-full text-sm min-w-[520px]">
                      <thead>
                        <tr className="text-left text-[11px] font-mono uppercase tracking-wide text-ink-dim border-b border-border">
                          <th className="px-3 py-2">Sesija</th>
                          <th className="px-3 py-2">Dvorana</th>
                          <th className="px-3 py-2">Popunjenost</th>
                          <th className="px-3 py-2">Lista čekanja</th>
                        </tr>
                      </thead>
                      <tbody>
                        {block.programItems.map((item) => (
                          <tr key={item.id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2.5 font-medium">{item.titleHr}</td>
                            <td className="px-3 py-2.5 text-ink-dim">{item.room || "—"}</td>
                            <td className="px-3 py-2.5">
                              {item.capacity != null ? (
                                <div className="flex items-center gap-2 min-w-[140px]">
                                  <span className="font-mono tabular-nums text-xs">
                                    {item._count.registrations}/{item.capacity}
                                  </span>
                                  <div className="flex-1">
                                    <CapacityBar confirmedCount={item._count.registrations} capacity={item.capacity} />
                                  </div>
                                </div>
                              ) : (
                                <span className="font-mono tabular-nums text-xs text-ink-dim">
                                  {item._count.registrations} · uvijek otvorena
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 font-mono tabular-nums text-xs">
                              {item.capacity != null ? item._count.waitlistEntries : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
