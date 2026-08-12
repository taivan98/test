import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentParticipant } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getProgram } from "@/lib/program";
import { t } from "@/lib/i18n";
import { Header } from "@/components/Header";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/login");

  const locale = await getLocale();
  const { msg } = await searchParams;
  const days = await getProgram(participant.id);
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";

  const mine = days.flatMap((day) =>
    day.blocks.flatMap((block) =>
      block.items
        .filter((item) => item.myStatus !== "none")
        .map((item) => ({ day, block, item }))
    )
  );

  return (
    <>
      <Header locale={locale} path="/schedule" participantEmail={participant.email} conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-5">{t(locale, "schedule.title")}</h1>

        {msg === "waitlist_confirmed" && (
          <div className="mb-5 rounded-lg bg-good-soft border border-good/30 p-3 text-sm text-good font-medium">
            {t(locale, "waitlist.confirm.success")}
          </div>
        )}

        {mine.length === 0 && (
          <div className="text-center py-10">
            <p className="text-ink-dim mb-4">{t(locale, "schedule.empty")}</p>
            <Link
              href="/program"
              className="inline-block rounded-lg bg-accent text-accent-ink font-semibold px-5 py-2.5 hover:opacity-90 transition"
            >
              {t(locale, "schedule.browseProgram")}
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {mine.map(({ day, block, item }) => {
            const title = locale === "hr" ? item.titleHr : item.titleEn;
            return (
              <Link
                key={item.id}
                href={`/sessions/${item.id}`}
                className="block bg-paper-card border border-border rounded-xl px-4 py-3 hover:border-accent transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[15px]">{title}</div>
                    <div className="text-xs text-ink-dim mt-0.5">
                      {locale === "hr" ? day.labelHr : day.labelEn} · {block.startLabel}–{block.endLabel}
                    </div>
                  </div>
                  {item.myStatus === "registered" && (
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-good-soft text-good">
                      {t(locale, "schedule.confirmed")}
                    </span>
                  )}
                  {(item.myStatus === "waiting" || item.myStatus === "offered") && (
                    <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-warn-soft text-warn">
                      {item.myStatus === "waiting"
                        ? t(locale, "session.waitlistPosition", { position: item.myWaitlistPosition ?? "?" })
                        : t(locale, "status.waitlisted")}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
