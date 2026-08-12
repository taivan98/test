import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/AdminHeader";

export default async function ApprovedEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  await requireAdmin();
  const { added } = await searchParams;
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";
  const emails = await prisma.approvedEmail.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminHeader conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-1">Odobreni e-mailovi</h1>
        <p className="text-sm text-ink-dim mb-6">
          Samo osobe s ovim emailom mogu tražiti poveznicu za prijavu na radionice — dodaj ih kad
          evidentiraš uplatu kotizacije.
        </p>

        {added !== undefined && (
          <div className="mb-5 rounded-lg bg-good-soft border border-good/30 p-3 text-sm text-good font-medium">
            Dodano/ažurirano: {added} e-mail(ova).
          </div>
        )}

        <form
          action="/api/admin/approved-emails/add"
          method="POST"
          encType="multipart/form-data"
          className="border border-border rounded-xl p-4 mb-8 flex flex-col gap-3 bg-paper-card"
        >
          <label className="text-sm font-medium">
            Zalijepi e-mailove (jedan po retku, ili odvojene zarezom)
          </label>
          <textarea
            name="emails"
            rows={5}
            placeholder={"ana.kos@email.com\nivan.horvat@email.com"}
            className="rounded-lg border border-border px-3 py-2 text-sm font-mono"
          />
          <label className="text-sm font-medium">Ili učitaj CSV/TXT datoteku iz Excela</label>
          <input type="file" name="file" accept=".csv,.txt" className="text-sm" />
          <button type="submit" className="mt-1 rounded-lg bg-accent text-accent-ink font-semibold py-2.5 text-sm">
            Dodaj na popis
          </button>
        </form>

        <h2 className="font-semibold mb-3">Trenutni popis ({emails.length})</h2>
        <div className="border border-border rounded-xl divide-y divide-border max-h-[420px] overflow-y-auto">
          {emails.length === 0 && <p className="text-sm text-ink-dim p-4">Popis je prazan.</p>}
          {emails.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="font-mono">{e.email}</span>
              <form action="/api/admin/approved-emails/remove" method="POST">
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className="text-xs text-bad hover:underline">
                  Ukloni
                </button>
              </form>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
