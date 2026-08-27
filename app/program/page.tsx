import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentParticipant } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getProgram } from "@/lib/program";
import { zagrebDateKey } from "@/lib/scheduleTime";
import { t } from "@/lib/i18n";
import { capacityStatus, capacityColor } from "@/lib/status";
import { Header } from "@/components/Header";
import { CapacityBar } from "@/components/CapacityBar";

const SEAT_TEXT_CLASS = { good: "text-good", warn: "text-warn", bad: "text-bad" };
const ACTION_BUTTON_CLASS =
  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap";

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; msg?: string; item?: string }>;
}) {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/login");

  const locale = await getLocale();
  const { day: dayParam, msg, item: msgItemId } = await searchParams;
  const days = await getProgram(participant.id);
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";

  const todayKey = zagrebDateKey(new Date());
  const todayDay = days.find((d) => zagrebDateKey(d.date) === todayKey);
  const activeDay = days.find((d) => d.id === dayParam) ?? todayDay ?? days[0];
  const redirectTo = `/program?day=${activeDay?.id ?? ""}`;

  return (
    <>
      <Header locale={locale} path="/program" participantEmail={participant.email} conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-1">{t(locale, "program.title")}</h1>
        <p className="text-sm text-ink-dim mb-5">{t(locale, "program.subtitle")}</p>

        {days.length === 0 && <p className="text-ink-dim">{t(locale, "program.noDays")}</p>}

        {days.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-6 sm:flex sm:flex-wrap sm:gap-2">
            {days.map((d) => (
              <Link
                key={d.id}
                href={`/program?day=${d.id}`}
                className={`rounded-full px-4 py-1.5 text-sm border text-center sm:shrink-0 ${
                  activeDay?.id === d.id
                    ? "bg-accent text-accent-ink border-accent font-semibold"
                    : "border-border text-ink-dim"
                }`}
              >
                {locale === "hr" ? d.labelHr : d.labelEn}
              </Link>
            ))}
          </div>
        )}

        {activeDay?.blocks.map((block) => (
          <section key={block.id} className="mb-7">
            <h2 className="text-xs font-mono uppercase tracking-wide text-ink-dim mb-2">
              {block.startLabel}–{block.endLabel}
            </h2>
            {block.myBlockPick && (
              <div className="mb-2.5 rounded-lg bg-good-soft border border-good/30 px-3 py-2 text-xs font-medium text-good">
                {t(locale, "program.yourPick", {
                  title: locale === "hr" ? block.myBlockPick.titleHr : block.myBlockPick.titleEn,
                })}
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {block.items.map((item) => {
                const status = capacityStatus(item.confirmedCount, item.capacity);
                const title = locale === "hr" ? item.titleHr : item.titleEn;
                const kind = locale === "hr" ? item.kindHr : item.kindEn;
                const blockedByOther =
                  item.registrationRequired && !!block.myBlockPick && block.myBlockPick.id !== item.id;
                const showFullNotice = msg === "full" && msgItemId === item.id;
                const seatColor = item.capacity != null ? SEAT_TEXT_CLASS[capacityColor(item.confirmedCount, item.capacity)] : "";
                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl px-4 py-3 ${
                      blockedByOther ? "bg-paper-dim border-border opacity-70" : "bg-paper-card border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/sessions/${item.id}`} className="block min-w-0">
                        {kind && (
                          <div className="text-[10.5px] font-mono uppercase tracking-wide text-accent mb-0.5">
                            {kind}
                          </div>
                        )}
                        <div className="font-semibold text-[15px]">{title}</div>
                        {(item.room || item.speaker) && (
                          <div className="text-xs text-ink-dim mt-0.5 flex flex-wrap gap-x-1.5">
                            {item.room && <span>{item.room}</span>}
                            {item.room && item.speaker && <span>·</span>}
                            {item.speaker && <span>{item.speaker}</span>}
                          </div>
                        )}
                      </Link>

                      {blockedByOther ? (
                        <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-paper-dim text-ink-dim border border-border">
                          {t(locale, "program.blockTaken")}
                        </span>
                      ) : !item.registrationRequired ? (
                        <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-paper-dim text-ink-dim">
                          {t(locale, "session.noRegistrationNeeded")}
                        </span>
                      ) : item.myStatus === "registered" ? (
                        <form action="/api/registrations/cancel" method="POST">
                          <input type="hidden" name="programItemId" value={item.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <button
                            type="submit"
                            className={`${ACTION_BUTTON_CLASS} border border-border hover:bg-paper-dim`}
                          >
                            {t(locale, "session.cancel")}
                          </button>
                        </form>
                      ) : item.myStatus === "waiting" || item.myStatus === "offered" ? (
                        <form action="/api/waitlist/leave" method="POST">
                          <input type="hidden" name="programItemId" value={item.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <button
                            type="submit"
                            className={`${ACTION_BUTTON_CLASS} border border-border hover:bg-paper-dim`}
                          >
                            {t(locale, "session.leaveWaitlist")}
                          </button>
                        </form>
                      ) : status === "full" ? (
                        <form action="/api/waitlist/join" method="POST">
                          <input type="hidden" name="programItemId" value={item.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <button
                            type="submit"
                            className={`${ACTION_BUTTON_CLASS} border border-accent text-accent hover:bg-accent-soft`}
                          >
                            {t(locale, "session.joinWaitlist")}
                          </button>
                        </form>
                      ) : (
                        <form action="/api/registrations" method="POST">
                          <input type="hidden" name="programItemId" value={item.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <button type="submit" className={`${ACTION_BUTTON_CLASS} bg-accent text-accent-ink hover:opacity-90`}>
                            {t(locale, "session.register")}
                          </button>
                        </form>
                      )}
                    </div>

                    {item.detailsUrl && (
                      <a
                        href={item.detailsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                      >
                        {t(locale, "session.moreDetails")} ↗
                      </a>
                    )}

                    {item.registrationRequired && item.myStatus === "registered" && (
                      <div className="text-xs text-good font-medium mt-2">✓ {t(locale, "status.registered")}</div>
                    )}
                    {item.registrationRequired && (item.myStatus === "waiting" || item.myStatus === "offered") && (
                      <div className="text-xs text-warn font-medium mt-2">
                        {item.myStatus === "waiting"
                          ? t(locale, "session.waitlistPosition", { position: item.myWaitlistPosition ?? "?" })
                          : t(locale, "status.waitlisted")}
                      </div>
                    )}
                    {item.registrationRequired && item.capacity != null && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1">
                          <CapacityBar confirmedCount={item.confirmedCount} capacity={item.capacity} />
                        </div>
                        <span className={`text-xs font-mono font-bold tabular-nums ${seatColor}`}>
                          {t(locale, "session.seatsLeft", { taken: item.confirmedCount, capacity: item.capacity })}
                        </span>
                      </div>
                    )}

                    {showFullNotice && (
                      <div className="mt-2.5 rounded-lg bg-warn-soft border border-warn/30 p-2.5 text-xs text-ink">
                        {t(locale, "session.fullJoinWaitlist")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
