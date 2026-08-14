import { redirect } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { checkWaitlistOffer } from "@/lib/registrations";

export default async function WaitlistConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = await getLocale();
  const { token } = await searchParams;
  const result = token ? await checkWaitlistOffer(token) : ({ status: "expired" } as const);

  if (result.status === "expired") redirect("/waitlist/expired");

  const title = locale === "hr" ? result.titleHr : result.titleEn;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-paper-card border border-border rounded-2xl p-6 shadow-sm text-center">
        <h1 className="text-xl font-semibold mb-2">{t(locale, "waitlist.confirm.title")}</h1>
        <p className="text-sm text-ink-dim mb-5">{title}</p>
        <form action="/api/waitlist/confirm" method="POST">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="w-full rounded-lg bg-accent text-accent-ink font-semibold py-2.5 hover:opacity-90 transition"
          >
            {t(locale, "waitlist.confirm.button")}
          </button>
        </form>
      </div>
    </main>
  );
}
