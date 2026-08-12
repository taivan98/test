import { redirect } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { getCurrentParticipant } from "@/lib/auth";
import { LanguageSwitch } from "@/components/LanguageSwitch";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; email?: string }>;
}) {
  const participant = await getCurrentParticipant();
  if (participant) redirect("/program");

  const locale = await getLocale();
  const { status, email } = await searchParams;
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";
  const contact = process.env.CONTACT_EMAIL || "";

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-4">
          <LanguageSwitch locale={locale} path="/login" />
        </div>
        <div className="bg-paper-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wide text-accent mb-1">
            {conferenceName}
          </div>
          <h1 className="text-xl font-semibold mb-2">{t(locale, "login.title")}</h1>

          {status === "sent" && email ? (
            <div>
              <p className="text-sm text-ink-dim mb-4">
                {t(locale, "login.sent.body", { email })}
              </p>
              <a href="/login" className="text-sm text-accent font-medium">
                {t(locale, "login.sent.resend")}
              </a>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink-dim mb-5">{t(locale, "login.subtitle")}</p>

              {status === "not_approved" && (
                <div className="mb-4 rounded-lg bg-warn-soft border border-warn/30 p-3 text-sm">
                  <p className="font-medium text-warn mb-1">
                    {t(locale, "login.notApproved.title")}
                  </p>
                  <p className="text-ink-dim">
                    {t(locale, "login.notApproved.body")}
                    {contact ? ` (${contact})` : ""}
                  </p>
                </div>
              )}
              {status === "invalid" && (
                <div className="mb-4 rounded-lg bg-bad-soft border border-bad/30 p-3 text-sm text-bad">
                  {t(locale, "common.error")}
                </div>
              )}

              <form action="/api/auth/request-link" method="POST" className="flex flex-col gap-3">
                <label className="text-sm font-medium" htmlFor="email">
                  {t(locale, "login.emailLabel")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={email || ""}
                  placeholder={t(locale, "login.emailPlaceholder")}
                  className="rounded-lg border border-border px-3 py-2.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="mt-1 rounded-lg bg-accent text-accent-ink font-semibold py-2.5 hover:opacity-90 transition"
                >
                  {t(locale, "login.submit")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
