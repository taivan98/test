import Link from "next/link";
import { Locale, t } from "@/lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import { getSiteSettings } from "@/lib/settings";

export async function Header({
  locale,
  path,
  participantEmail,
  conferenceName,
}: {
  locale: Locale;
  path: string;
  participantEmail?: string | null;
  conferenceName: string;
}) {
  const settings = await getSiteSettings();
  const displayName = settings.conferenceName || conferenceName;
  return (
    <header className="border-b border-border bg-paper-card">
      <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/program" className="flex items-center gap-2 font-semibold text-[15px] truncate">
          {settings.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoUrl} alt="" className="h-7 w-auto rounded-sm object-contain" />
          )}
          {displayName}
        </Link>
        <div className="flex items-center gap-4">
          {participantEmail && (
            <nav className="hidden sm:flex items-center gap-4 text-sm text-ink-dim">
              <Link href="/program" className="hover:text-ink">
                {t(locale, "nav.program")}
              </Link>
              <Link href="/schedule" className="hover:text-ink">
                {t(locale, "nav.mySchedule")}
              </Link>
            </nav>
          )}
          <LanguageSwitch locale={locale} path={path} />
          {participantEmail && (
            <form action="/api/auth/logout" method="POST">
              <button className="text-sm text-ink-dim hover:text-ink" type="submit">
                {t(locale, "nav.logout")}
              </button>
            </form>
          )}
        </div>
      </div>
      {participantEmail && (
        <nav className="sm:hidden flex items-center gap-4 px-4 pb-3 text-sm text-ink-dim">
          <Link href="/program" className="hover:text-ink">
            {t(locale, "nav.program")}
          </Link>
          <Link href="/schedule" className="hover:text-ink">
            {t(locale, "nav.mySchedule")}
          </Link>
        </nav>
      )}
    </header>
  );
}
