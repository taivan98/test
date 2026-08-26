import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";

export async function AdminHeader({ conferenceName }: { conferenceName: string }) {
  const { logoUrl } = await getSiteSettings();
  return (
    <header className="border-b border-border bg-paper-card">
      <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-[15px]">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-7 w-auto rounded-sm object-contain" />
            )}
            {conferenceName} <span className="text-ink-dim font-normal">· organizator</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm text-ink-dim">
          <Link href="/admin" className="hover:text-ink">
            Pregled
          </Link>
          <Link href="/admin/program" className="hover:text-ink">
            Program
          </Link>
          <Link href="/admin/approved-emails" className="hover:text-ink">
            Odobreni e-mailovi
          </Link>
          <a href="/api/admin/export" className="hover:text-ink">
            Izvoz (CSV)
          </a>
          <Link href="/admin/branding" className="hover:text-ink">
            Brending
          </Link>
          <Link href="/admin/reset-test-data" className="hover:text-ink">
            Očisti testne podatke
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="hover:text-ink">
              Odjava
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
