import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { AdminHeader } from "@/components/AdminHeader";

function UploadField({
  field,
  label,
  hint,
  accept,
  currentPath,
  preview,
}: {
  field: string;
  label: string;
  hint: string;
  accept: string;
  currentPath: string;
  preview: "image" | "filename";
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>

      {currentPath && (
        <div className="flex items-center gap-3 mb-2.5">
          {preview === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentPath} alt="" className="h-12 w-auto max-w-[160px] object-contain rounded border border-border bg-paper" />
          ) : (
            <span className="text-xs font-mono text-ink-dim truncate max-w-[220px]">{currentPath.split("/").pop()}</span>
          )}
          <form action="/api/admin/settings/upload" method="POST">
            <input type="hidden" name="field" value={field} />
            <input type="hidden" name="clear" value="1" />
            <button type="submit" className="text-xs text-bad hover:underline">
              Ukloni
            </button>
          </form>
        </div>
      )}

      <form action="/api/admin/settings/upload" method="POST" encType="multipart/form-data" className="flex items-center gap-2.5">
        <input type="hidden" name="field" value={field} />
        <input
          type="file"
          name="file"
          accept={accept}
          required
          className="flex-1 text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-paper-card file:px-3 file:py-1.5 file:text-sm file:font-medium file:cursor-pointer"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-paper-dim transition"
        >
          Učitaj
        </button>
      </form>
      <p className="text-xs text-ink-dim mt-1">{hint}</p>
    </div>
  );
}

export default async function BrandingPage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  await requireAdmin();
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";
  const { done, error } = await searchParams;
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
        {error === "invalid" && (
          <div className="mb-5 rounded-lg border border-bad bg-paper-card px-3 py-2.5 text-sm text-bad">
            Ta datoteka nije podržana ili je prevelika. Provjeri format i veličinu pa pokušaj ponovno.
          </div>
        )}
        {error === "nofile" && (
          <div className="mb-5 rounded-lg border border-bad bg-paper-card px-3 py-2.5 text-sm text-bad">
            Nisi izabrala datoteku.
          </div>
        )}

        <div className="flex flex-col gap-6 mb-6">
          <UploadField
            field="logoUrl"
            label="Logo"
            hint="PNG, JPG, WEBP ili SVG, do 4MB. Prikazuje se pored naziva konferencije."
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            currentPath={settings.logoUrl}
            preview="image"
          />
          <UploadField
            field="faviconUrl"
            label="Favicon (sličica u tabu preglednika)"
            hint="Mala kvadratna slika, npr. 32×32 ili 64×64 piksela, do 4MB."
            accept="image/png,image/x-icon,image/svg+xml"
            currentPath={settings.faviconUrl}
            preview="image"
          />
          <UploadField
            field="ogImageUrl"
            label="Slika za dijeljenje linka (društvene mreže)"
            hint="Kad netko podijeli link na aplikaciju (Viber, LinkedIn, Facebook...), pokaže se ova slika uz naslov. Preporučeno cca 1200×630 piksela, do 4MB."
            accept="image/png,image/jpeg,image/webp"
            currentPath={settings.ogImageUrl}
            preview="image"
          />
        </div>

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

          <details className="border border-border rounded-xl p-4" open={!!settings.fontUrl}>
            <summary className="cursor-pointer text-sm font-medium">Napredno: font i vlastiti CSS</summary>

            <div className="mt-3 mb-4">
              <UploadField
                field="fontUrl"
                label="Prilagođeni font"
                hint="WOFF2, WOFF, TTF ili OTF, do 8MB. Ako ništa ne učitaš, aplikacija koristi Inter (zadano)."
                accept=".woff2,.woff,.ttf,.otf"
                currentPath={settings.fontUrl}
                preview="filename"
              />
            </div>

            <p className="text-xs text-ink-dim mt-2 mb-3">
              Vlastiti CSS je za svakoga tko zna CSS. Ubacuje se izravno u izgled stranice — loše
              napisan CSS može pokvariti raspored ili čitljivost (npr. sakriti gumbe), ali{" "}
              <strong>ne može</strong> obrisati ni pokvariti prijave, sudionike ili program. Ako nešto
              krene po zlu, samo izbriši ono što si upisala ovdje i spremi ponovno.
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
            Vrati sve na zadano (ukloni naziv, logo, favicon, sliku, font, boje i vlastiti CSS)
          </button>
        </form>
      </main>
    </>
  );
}
