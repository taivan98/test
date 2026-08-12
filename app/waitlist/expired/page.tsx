import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default async function WaitlistExpiredPage() {
  const locale = await getLocale();
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-paper-card border border-border rounded-2xl p-6 shadow-sm text-center">
        <h1 className="text-xl font-semibold mb-2">{t(locale, "waitlist.confirm.expired.title")}</h1>
        <p className="text-sm text-ink-dim mb-5">{t(locale, "waitlist.confirm.expired.body")}</p>
        <a
          href="/program"
          className="inline-block rounded-lg bg-accent text-accent-ink font-semibold px-5 py-2.5 hover:opacity-90 transition"
        >
          {t(locale, "schedule.browseProgram")}
        </a>
      </div>
    </main>
  );
}
