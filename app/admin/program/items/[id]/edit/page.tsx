import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/AdminHeader";

export default async function EditProgramItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const item = await prisma.programItem.findUnique({ where: { id } });
  if (!item) redirect("/admin/program");
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";

  return (
    <>
      <AdminHeader conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <a href="/admin/program" className="text-sm text-ink-dim hover:text-ink">
          ← Program
        </a>
        <h1 className="text-2xl font-semibold mt-2 mb-5">Uredi sesiju</h1>

        <form action="/api/admin/program-items/update" method="POST" className="flex flex-col gap-3">
          <input type="hidden" name="id" value={item.id} />

          <label className="text-sm font-medium">Vrsta</label>
          <select name="type" defaultValue={item.type} className="rounded-lg border border-border px-3 py-2 text-sm">
            <option value="WORKSHOP">Radionica (ima kapacitet)</option>
            <option value="MAIN_HALL">Glavna dvorana (uvijek otvorena)</option>
          </select>

          <label className="text-sm font-medium">Naziv (HR)</label>
          <input name="titleHr" defaultValue={item.titleHr} required className="rounded-lg border border-border px-3 py-2 text-sm" />

          <label className="text-sm font-medium">Title (EN)</label>
          <input name="titleEn" defaultValue={item.titleEn} required className="rounded-lg border border-border px-3 py-2 text-sm" />

          <label className="text-sm font-medium">Opis (HR)</label>
          <textarea name="descriptionHr" defaultValue={item.descriptionHr} rows={3} className="rounded-lg border border-border px-3 py-2 text-sm" />

          <label className="text-sm font-medium">Description (EN)</label>
          <textarea name="descriptionEn" defaultValue={item.descriptionEn} rows={3} className="rounded-lg border border-border px-3 py-2 text-sm" />

          <label className="text-sm font-medium">Predavač/ica</label>
          <input name="speaker" defaultValue={item.speaker} className="rounded-lg border border-border px-3 py-2 text-sm" />

          <label className="text-sm font-medium">Dvorana</label>
          <input name="room" defaultValue={item.room} className="rounded-lg border border-border px-3 py-2 text-sm" />

          <label className="text-sm font-medium">Kapacitet (prazno = bez limita)</label>
          <input
            name="capacity"
            type="number"
            min={0}
            defaultValue={item.capacity ?? ""}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />

          <button type="submit" className="mt-2 rounded-lg bg-accent text-accent-ink font-semibold py-2.5 text-sm">
            Spremi promjene
          </button>
        </form>
      </main>
    </>
  );
}
