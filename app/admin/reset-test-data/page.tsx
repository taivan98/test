import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/AdminHeader";
import { TypeToConfirmForm } from "@/components/TypeToConfirmForm";

const PROGRAM_CONFIRM_TEXT = "OBRIŠI PROGRAM";

export default async function ResetTestDataPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; doneProgram?: string }>;
}) {
  await requireAdmin();
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";
  const { done, doneProgram } = await searchParams;
  const [participantCount, approvedEmailCount, dayCount, blockCount, programItemCount] = await Promise.all([
    prisma.participant.count(),
    prisma.approvedEmail.count(),
    prisma.day.count(),
    prisma.block.count(),
    prisma.programItem.count(),
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
        {doneProgram && (
          <div className="mb-5 rounded-lg border border-good bg-paper-card px-3 py-2.5 text-sm text-good">
            Gotovo — program je obrisan. Sudionici i odobreni e-mailovi su ostali netaknuti.
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

        <hr className="border-border my-10" />

        <h2 className="text-xl font-semibold mb-1 text-bad">Obriši cijeli program</h2>
        <p className="text-sm text-ink-dim mb-6">
          Ovo je posebna, neovisna akcija — ne dira sudionike ni odobrene e-mailove iznad. Koristi
          je samo ako želiš u potpunosti izbrisati dane, blokove i sve radionice/sesije (npr. da
          program krene ispočetka).
        </p>

        <div className="border border-border rounded-xl p-4 bg-paper-card mb-6">
          <p className="text-sm font-medium mb-3">Trenutno stanje programa:</p>
          <div className="grid grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden max-w-sm">
            <div className="bg-paper-card p-3">
              <div className="text-xl font-mono font-semibold text-accent tabular-nums">{dayCount}</div>
              <div className="text-xs text-ink-dim mt-0.5">dana</div>
            </div>
            <div className="bg-paper-card p-3">
              <div className="text-xl font-mono font-semibold text-accent tabular-nums">{blockCount}</div>
              <div className="text-xs text-ink-dim mt-0.5">blokova</div>
            </div>
            <div className="bg-paper-card p-3">
              <div className="text-xl font-mono font-semibold text-accent tabular-nums">{programItemCount}</div>
              <div className="text-xs text-ink-dim mt-0.5">sesija</div>
            </div>
          </div>
        </div>

        <div className="border-2 border-bad rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-bad mb-2">Ovo će se trajno obrisati:</p>
          <ul className="text-sm text-ink-dim list-disc pl-5 mb-3 space-y-0.5">
            <li>svi dani i blokovi</li>
            <li>sve radionice/sesije unutar njih</li>
            <li>sve prijave i liste čekanja vezane uz te sesije</li>
          </ul>
          <p className="text-sm font-semibold mb-2">Ovo ostaje netaknuto:</p>
          <ul className="text-sm text-ink-dim list-disc pl-5 mb-4 space-y-0.5">
            <li>svi sudionici i njihovi računi</li>
            <li>popis odobrenih e-mailova</li>
          </ul>

          <p className="text-sm mb-2">
            Za potvrdu upiši točno <span className="font-mono font-semibold">{PROGRAM_CONFIRM_TEXT}</span> u
            polje ispod:
          </p>
          <TypeToConfirmForm
            action="/api/admin/dev/reset-program"
            confirmText={PROGRAM_CONFIRM_TEXT}
            hiddenFields={{}}
            buttonClassName="rounded-lg bg-bad text-white font-semibold px-4 py-2.5 text-sm hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
          >
            Obriši cijeli program
          </TypeToConfirmForm>
        </div>
      </main>
    </>
  );
}
