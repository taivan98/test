import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { AdminHeader } from "@/components/AdminHeader";

export default async function BrandingPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  await requireAdmin();
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";
  const { done } = await searchParams;
  const settings = await getSiteSettings();
  const accentColor = settings.accentColor || "#5b4fe8";
  const pageBackground = settings.pageBackground || "#f4f5f8";

  return (
    <>
      <AdminHeader conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-1">Brending</h1>
        <p className="text-sm text-ink-dim mb-6">
          Logo, boje i (za napredne) vlastiti CSS. Ovo mijenja samo izgled — ne dira podatke,
          prijave ni program.
        </p>

        {done === "1" && (
          <div className="mb-5 rounded-lg border border-good bg-paper-card px-3 py-2.5 text-sm text-good">
            Spremljeno.
          </div>
        )}
        {done === "reset" && (
          <div className="mb-5 rounded-lg border border-good bg-paper-card px-3 py-2.5 text-sm text-good">
            Vraćeno na zadani izgled.
          </div>
        )}

        <form action="/api/admin/settings/update" method="POST" className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Naziv konferencije</label>
            <input
              type="text"
              name="conferenceName"
              defaultValue={settings.conferenceName}
              placeholder={conferenceName}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <p className="text-xs text-ink-dim mt-1">
              Ostavi prazno da ostane "{conferenceName}" (zadano iz postavki hostinga).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Logo (poveznica na sliku)</label>
            <input
              type="url"
              name="logoUrl"
              defaultValue={settings.logoUrl}
              placeholder="https://hrdays.net/wp-content/uploads/logo.png"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <p className="text-xs text-ink-dim mt-1">
              Zalijepi poveznicu na sliku (npr. iz medijske biblioteke na WordPress stranici). Ostavi
              prazno da nema loga, samo naziv konferencije.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Favicon (sličica u tabu preglednika)</label>
            <input
              type="url"
              name="faviconUrl"
              defaultValue={settings.faviconUrl}
              placeholder="https://hrdays.net/wp-content/uploads/favicon.png"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <p className="text-xs text-ink-dim mt-1">
              Poveznica na malu kvadratnu sliku (npr. 32×32 ili 64×64 piksela). Ostavi prazno za zadanu.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Slika za dijeljenje linka (društvene mreže)
            </label>
            <input
              type="url"
              name="ogImageUrl"
              defaultValue={settings.ogImageUrl}
              placeholder="https://hrdays.net/wp-content/uploads/najava.jpg"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
            <p className="text-xs text-ink-dim mt-1">
              Kad netko podijeli link na aplikaciju (Viber, LinkedIn, Facebook...), pokaže se ova
              slika uz naslov. Preporučeno cca 1200×630 piksela.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Boja naglaska (gumbi, poveznice)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="accentColor"
                defaultValue={accentColor}
                className="h-10 w-16 rounded border border-border cursor-pointer"
              />
              <span className="text-xs text-ink-dim font-mono">{accentColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tekst na gumbima naglaska</label>
            <select
              name="accentInk"
              defaultValue={settings.accentInk || "light"}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="light">Bijeli tekst (za tamnije boje)</option>
              <option value="dark">Tamni tekst (za svjetlije boje)</option>
            </select>
            <p className="text-xs text-ink-dim mt-1">
              Ako izabereš svijetlu boju naglaska (npr. žutu), prebaci na tamni tekst da gumbi ostanu
              čitljivi.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Boja pozadine stranice</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="pageBackground"
                defaultValue={pageBackground}
                className="h-10 w-16 rounded border border-border cursor-pointer"
              />
              <span className="text-xs text-ink-dim font-mono">{pageBackground}</span>
            </div>
            <p className="text-xs text-ink-dim mt-1">
              Pozadina iza kartica, odvojena od boje gumba. Zadana je svijetlo siva.
            </p>
          </div>

          <details className="border border-border rounded-xl p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Napredno: vlastiti CSS
            </summary>
            <p className="text-xs text-ink-dim mt-2 mb-3">
              Za svakoga tko zna CSS. Ovo se ubacuje izravno u izgled stranice — loše napisan CSS
              može pokvariti raspored ili čitljivost (npr. sakriti gumbe), ali <strong>ne može</strong>{" "}
              obrisati ni pokvariti prijave, sudionike ili program. Ako nešto krene po zlu, samo
              izbriši ono što si upisala ovdje i spremi ponovno.
            </p>
            <textarea
              name="customCss"
              defaultValue={settings.customCss}
              rows={8}
              placeholder={".accent { }\n/* npr. zaobljeniji gumbi: */\nbutton { border-radius: 999px; }"}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono"
            />
          </details>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-accent text-accent-ink font-semibold px-4 py-2.5 text-sm hover:opacity-90 transition"
            >
              Spremi
            </button>
          </div>
        </form>

        <form action="/api/admin/settings/update" method="POST" className="mt-4">
          <input type="hidden" name="reset" value="1" />
          <button type="submit" className="text-xs text-bad hover:underline">
            Vrati sve na zadano (ukloni naziv, logo, favicon, sliku, boje i vlastiti CSS)
          </button>
        </form>
      </main>
    </>
  );
}
