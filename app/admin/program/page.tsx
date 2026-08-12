import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AdminProgramPage() {
  await requireAdmin();
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";

  const days = await prisma.day.findMany({
    orderBy: { order: "asc" },
    include: {
      blocks: {
        orderBy: { order: "asc" },
        include: {
          programItems: {
            orderBy: { order: "asc" },
            include: {
              registrations: { include: { participant: true }, orderBy: { createdAt: "asc" } },
              waitlistEntries: {
                where: { status: { in: ["WAITING", "OFFERED"] } },
                include: { participant: true },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
    },
  });

  return (
    <>
      <AdminHeader conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-1">Program</h1>
        <p className="text-sm text-ink-dim mb-6">
          Dani → blokovi (vremenski termini) → sesije (radionice ili glavna dvorana).
        </p>

        {days.map((day) => (
          <section key={day.id} className="mb-8 border border-border rounded-xl p-4 bg-paper-card">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold">
                {day.labelHr} <span className="text-ink-dim font-normal">/ {day.labelEn}</span>
              </h2>
              <form action="/api/admin/days/delete" method="POST">
                <input type="hidden" name="id" value={day.id} />
                <button type="submit" className="text-xs text-bad hover:underline">
                  Obriši dan
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-4">
              {day.blocks.map((block) => (
                <div key={block.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="text-xs font-mono uppercase tracking-wide text-ink-dim">
                      {block.startLabel}–{block.endLabel}
                    </div>
                    <form action="/api/admin/blocks/delete" method="POST">
                      <input type="hidden" name="id" value={block.id} />
                      <button type="submit" className="text-xs text-bad hover:underline">
                        Obriši blok
                      </button>
                    </form>
                  </div>

                  <div className="flex flex-col gap-2 mb-3">
                    {block.programItems.map((item) => (
                      <div key={item.id} className="rounded-lg bg-paper px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            {item.kindHr && (
                              <span className="text-[10px] font-mono uppercase tracking-wide text-accent mr-1.5">
                                {item.kindHr}
                              </span>
                            )}
                            <span className="font-medium">{item.titleHr}</span>{" "}
                            <span className="text-ink-dim">
                              · {item.type === "MAIN_HALL" ? "bez limita" : `${item.capacity ?? "?"} mjesta`}
                              {item.room ? ` · ${item.room}` : ""}
                              {item.speaker ? ` · ${item.speaker}` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <a href={`/admin/program/items/${item.id}/edit`} className="text-xs text-accent hover:underline">
                              Uredi
                            </a>
                            <form action="/api/admin/program-items/delete" method="POST">
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className="text-xs text-bad hover:underline">
                                Obriši
                              </button>
                            </form>
                          </div>
                        </div>

                        {(item.registrations.length > 0 || item.waitlistEntries.length > 0 || item.capacity != null) && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-ink-dim">
                              Prijavljeni ({item.registrations.length})
                              {item.waitlistEntries.length > 0 ? ` · lista čekanja (${item.waitlistEntries.length})` : ""}
                            </summary>
                            <div className="mt-2 flex flex-col gap-1.5">
                              {item.registrations.map((reg) => (
                                <div key={reg.id} className="flex items-center justify-between gap-2 text-xs">
                                  <span className="font-mono">{reg.participant.email}</span>
                                  <form action="/api/admin/registrations/cancel" method="POST">
                                    <input type="hidden" name="participantId" value={reg.participantId} />
                                    <input type="hidden" name="programItemId" value={item.id} />
                                    <button type="submit" className="text-bad hover:underline">
                                      Odjavi
                                    </button>
                                  </form>
                                </div>
                              ))}
                              {item.registrations.length === 0 && (
                                <p className="text-xs text-ink-dim">Nitko još nije prijavljen.</p>
                              )}
                              {item.waitlistEntries.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <p className="text-[11px] font-mono uppercase tracking-wide text-warn mb-1.5">
                                    Lista čekanja
                                  </p>
                                  {item.waitlistEntries.map((w, i) => (
                                    <div key={w.id} className="text-xs font-mono py-0.5">
                                      {i + 1}. {w.participant.email}
                                      {w.status === "OFFERED" ? " (ponuđeno, čeka potvrdu)" : ""}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {item.capacity != null && (
                                <form action="/api/admin/dev/fill-to-one-seat" method="POST" className="mt-2 pt-2 border-t border-border">
                                  <input type="hidden" name="programItemId" value={item.id} />
                                  <button type="submit" className="text-xs text-accent hover:underline">
                                    Testno: popuni do 1 slobodnog mjesta (lažni sudionici)
                                  </button>
                                </form>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                    {block.programItems.length === 0 && (
                      <p className="text-xs text-ink-dim">Još nema sesija u ovom bloku.</p>
                    )}
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-accent font-medium">+ Dodaj sesiju</summary>
                    <form action="/api/admin/program-items" method="POST" className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input type="hidden" name="blockId" value={block.id} />
                      <select name="type" className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2" defaultValue="WORKSHOP">
                        <option value="WORKSHOP">Ima ograničen broj mjesta</option>
                        <option value="MAIN_HALL">Bez limita mjesta (npr. glavna dvorana)</option>
                      </select>
                      <input name="kindHr" placeholder="Vrsta (HR) — npr. Radionica, Panel, Predavanje" className="rounded-lg border border-border px-3 py-2 text-sm" />
                      <input name="kindEn" placeholder="Format (EN) — e.g. Workshop, Panel, Talk" className="rounded-lg border border-border px-3 py-2 text-sm" />
                      <input name="titleHr" placeholder="Naziv (HR)" required className="rounded-lg border border-border px-3 py-2 text-sm" />
                      <input name="titleEn" placeholder="Title (EN)" required className="rounded-lg border border-border px-3 py-2 text-sm" />
                      <textarea name="descriptionHr" placeholder="Opis (HR)" className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2" rows={2} />
                      <textarea name="descriptionEn" placeholder="Description (EN)" className="rounded-lg border border-border px-3 py-2 text-sm sm:col-span-2" rows={2} />
                      <input name="speaker" placeholder="Predavač/ica" className="rounded-lg border border-border px-3 py-2 text-sm" />
                      <input name="room" placeholder="Dvorana" className="rounded-lg border border-border px-3 py-2 text-sm" />
                      <input name="capacity" type="number" min={0} placeholder="Kapacitet (prazno = bez limita)" className="rounded-lg border border-border px-3 py-2 text-sm" />
                      <input name="detailsUrl" type="url" placeholder="Poveznica na opis/biografiju (na webu)" className="rounded-lg border border-border px-3 py-2 text-sm" />
                      <label className="flex items-center gap-2 text-sm sm:col-span-2">
                        <input type="checkbox" name="registrationRequired" value="true" defaultChecked className="rounded border-border" />
                        Sudionici se moraju prijaviti (isključi za predavanja koja svi automatski prate)
                      </label>
                      <button type="submit" className="rounded-lg bg-accent text-accent-ink font-semibold py-2 text-sm sm:col-span-2">
                        Dodaj sesiju
                      </button>
                    </form>
                  </details>
                </div>
              ))}

              <details className="text-sm">
                <summary className="cursor-pointer text-accent font-medium">+ Dodaj blok (vremenski termin)</summary>
                <form action="/api/admin/blocks" method="POST" className="mt-3 flex flex-wrap gap-2.5">
                  <input type="hidden" name="dayId" value={day.id} />
                  <input name="startLabel" placeholder="10:00" required className="rounded-lg border border-border px-3 py-2 text-sm w-28" />
                  <input name="endLabel" placeholder="11:30" required className="rounded-lg border border-border px-3 py-2 text-sm w-28" />
                  <button type="submit" className="rounded-lg bg-accent text-accent-ink font-semibold px-4 py-2 text-sm">
                    Dodaj blok
                  </button>
                </form>
              </details>
            </div>
          </section>
        ))}

        <section className="border border-dashed border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3">+ Dodaj dan</h2>
          <form action="/api/admin/days" method="POST" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input name="date" type="date" required className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input name="labelHr" placeholder="Dan 1 · 15.10.2026" required className="rounded-lg border border-border px-3 py-2 text-sm" />
            <input name="labelEn" placeholder="Day 1 · Oct 15, 2026" required className="rounded-lg border border-border px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-accent text-accent-ink font-semibold py-2 text-sm sm:col-span-3">
              Dodaj dan
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
