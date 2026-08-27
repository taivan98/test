import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentParticipant } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getProgram, DayView, BlockView, ProgramItemView } from "@/lib/program";
import { t } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { ConfirmSubmitForm } from "@/components/ConfirmSubmitForm";
import { googleCalendarLink } from "@/lib/ics";
import { toCalendarEvent } from "@/lib/calendarEvents";

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

  const dayGroups = days
    .map((day) => ({
      day,
      entries: day.blocks.flatMap((block) =>
        block.items
          .filter((item) => item.myStatus !== "none")
          .map((item) => ({ block, item }))
      ),
    }))
    .filter((g) => g.entries.length > 0);

  const hasConfirmed = dayGroups.some((g) => g.entries.some((e) => e.item.myStatus === "registered"));

  return (
    <>
      <Header locale={locale} path="/schedule" participantEmail={participant.email} conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <h1 className="text-2xl font-semibold">{t(locale, "schedule.title")}</h1>
          {hasConfirmed && (
            <a
              href="/api/calendar/schedule"
              className="text-sm font-semibold text-accent border border-accent rounded-lg px-3 py-1.5 hover:bg-accent-soft transition"
            >
              {t(locale, "schedule.downloadAll")}
            </a>
          )}
        </div>

        {msg === "waitlist_confirmed" && (
          <div className="mb-5 rounded-lg bg-good-soft border border-good/30 p-3 text-sm text-good font-medium">
            {t(locale, "waitlist.confirm.success")}
          </div>
        )}

        {dayGroups.length === 0 && (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">🗓️</div>
            <p className="text-ink-dim mb-4">{t(locale, "schedule.empty")}</p>
            <Link
              href="/program"
              className="inline-block rounded-lg bg-accent text-accent-ink font-semibold px-5 py-2.5 hover:opacity-90 transition"
            >
              {t(locale, "schedule.browseProgram")}
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-8">
          {dayGroups.map(({ day, entries }) => (
            <section key={day.id}>
              <h2 className="text-xs font-mono uppercase tracking-wide text-ink-dim mb-3">
                {locale === "hr" ? day.labelHr : day.labelEn}
              </h2>
              <div className="flex flex-col">
                {entries.map(({ block, item }, i) => (
                  <ScheduleRow
                    key={item.id}
                    day={day}
                    block={block}
                    item={item}
                    locale={locale}
                    isLast={i === entries.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

function ScheduleRow({
  day,
  block,
  item,
  locale,
  isLast,
}: {
  day: DayView;
  block: BlockView;
  item: ProgramItemView;
  locale: "hr" | "en";
  isLast: boolean;
}) {
  const title = locale === "hr" ? item.titleHr : item.titleEn;
  const kind = locale === "hr" ? item.kindHr : item.kindEn;
  const event = toCalendarEvent(item, block, day, locale);

  return (
    <div className="flex gap-4">
      <div className="w-16 shrink-0 text-right pt-3">
        <div className="text-[13px] font-mono font-semibold tabular-nums">{block.startLabel}</div>
        <div className="text-[11px] font-mono text-ink-dim tabular-nums">{block.endLabel}</div>
      </div>

      <div className="relative flex-1 pb-6">
        {!isLast && <div className="absolute left-0 top-3 bottom-0 w-px bg-border" />}
        <div className="absolute left-[-4.5px] top-3.5 w-2.5 h-2.5 rounded-full bg-accent" />

        <div className="ml-4 bg-paper-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              {kind && (
                <div className="text-[10.5px] font-mono uppercase tracking-wide text-accent mb-0.5">{kind}</div>
              )}
              <div className="font-semibold text-[15px]">{title}</div>
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
          {item.room && <div className="text-xs font-medium text-ink mt-0.5">{item.room}</div>}
          {item.speaker && <div className="text-[11px] text-ink-dim mt-0.5">{item.speaker}</div>}
        </div>

        {item.myStatus === "registered" ? (
          <div className="ml-4 mt-2 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              <a
                href={`/api/calendar/session/${item.id}`}
                className="text-xs font-medium text-accent hover:underline"
              >
                {t(locale, "schedule.addIcs")}
              </a>
              <a
                href={googleCalendarLink(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-accent hover:underline"
              >
                {t(locale, "schedule.addGoogle")}
              </a>
            </div>
            <ConfirmSubmitForm
              action="/api/registrations/cancel"
              confirmMessage={t(locale, "schedule.cancelConfirm")}
              hiddenFields={{ programItemId: item.id, redirectTo: "/schedule" }}
              buttonClassName="text-xs font-medium text-ink-dim hover:text-bad ml-auto"
            >
              {t(locale, "session.cancel")}
            </ConfirmSubmitForm>
          </div>
        ) : (
          <div className="ml-4 mt-2 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-ink-dim">{t(locale, "schedule.waitlistCalendarNote")}</span>
            <ConfirmSubmitForm
              action="/api/waitlist/leave"
              confirmMessage={t(locale, "schedule.leaveWaitlistConfirm")}
              hiddenFields={{ programItemId: item.id, redirectTo: "/schedule" }}
              buttonClassName="text-xs font-medium text-ink-dim hover:text-bad ml-auto"
            >
              {t(locale, "session.leaveWaitlist")}
            </ConfirmSubmitForm>
          </div>
        )}
      </div>
    </div>
  );
}
