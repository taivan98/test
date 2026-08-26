import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/AdminHeader";

export default async function ResetTestDataPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  await requireAdmin();
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";
  const { done } = await searchParams;
  const [participantCount, approvedEmailCount] = await Promise.all([
    prisma.participant.count(),
    prisma.approvedEmail.count(),
  ]);

  return (
    <>
      <AdminHeader conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-1">Očisti testne podatke</h1>
        {done && (
          <div className="mb-5 rounded-lg border border-good bg-paper-card px-3 py-2.5 text-sm text-good">
            Gotovo — baza je očišćena. Program je ostao netaknut.
          </div>
        )}
        <p className="text-sm text-ink-dim mb-6">
          Ovo briše sve sudionike iz baze — one koji su se stvarno prijavili preko magic linka i
          one nastale klikom na "Testno: popuni..." gumbe u Programu. Nema načina razlikovati ih
          automatski, pa se briše popis svih.
        </p>

        <div className="border border-border rounded-xl p-4 bg-paper-card mb-6">
          <p className="text-sm font-medium mb-3">Trenutno stanje baze:</p>
          <div className="grid grid-cols-2 gap-px bg-border border border-border rounded-lg overflow-hidden max-w-xs">
            <div className="bg-paper-card p-3">
              <div className="text-xl font-mono font-semibold text-accent tabular-nums">{participantCount}</div>
              <div className="text-xs text-ink-dim mt-0.5">sudionika (prijava + testni)</div>
            </div>
            <div className="bg-paper-card p-3">
              <div className="text-xl font-mono font-semibold text-accent tabular-nums">{approvedEmailCount}</div>
              <div className="text-xs text-ink-dim mt-0.5">odobrenih e-mailova</div>
            </div>
          </div>
        </div>

        <div className="border border-bad rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-bad mb-2">Ovo će se obrisati:</p>
          <ul className="text-sm text-ink-dim list-disc pl-5 mb-3 space-y-0.5">
            <li>svi sudionici (i njihovi magic-link linkovi za prijavu)</li>
            <li>sve njihove prijave na radionice/glavnu dvoranu</li>
            <li>svi zapisi u listama čekanja</li>
            <li>cijeli popis odobrenih e-mailova</li>
          </ul>
          <p className="text-sm font-semibold mb-2">Ovo ostaje netaknuto:</p>
          <ul className="text-sm text-ink-dim list-disc pl-5 space-y-0.5">
            <li>dani, blokovi i sve radionice/sesije (cijeli program)</li>
          </ul>
        </div>

        <p className="text-sm text-ink-dim mb-4">
          Nakon brisanja morat ćeš ponovno dodati prave e-mailove na popis odobrenih prije nego
          što se sudionici mogu prijaviti (Program ostaje isti).
        </p>

        <form action="/api/admin/dev/reset-test-data" method="POST">
          <button
            type="submit"
            className="rounded-lg bg-bad text-white font-semibold px-4 py-2.5 text-sm hover:opacity-90 transition"
          >
            Obriši sve sudionike i odobrene e-mailove
          </button>
        </form>
      </main>
    </>
  );
}
