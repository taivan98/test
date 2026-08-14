import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentParticipant } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getProgram } from "@/lib/program";
import { t } from "@/lib/i18n";
import { capacityStatus } from "@/lib/status";
import { Header } from "@/components/Header";
import { StatusChip } from "@/components/StatusChip";
import { CapacityBar } from "@/components/CapacityBar";

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/login");

  const locale = await getLocale();
  const { day: dayParam } = await searchParams;
  const days = await getProgram(participant.id);
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";

  const activeDay = days.find((d) => d.id === dayParam) ?? days[0];

  return (
    <>
      <Header locale={locale} path="/program" participantEmail={participant.email} conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-1">{t(locale, "program.title")}</h1>
        <p className="text-sm text-ink-dim mb-5">{t(locale, "program.subtitle")}</p>

        {days.length === 0 && <p className="text-ink-dim">{t(locale, "program.noDays")}</p>}

        {days.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {days.map((d) => (
              <Link
                key={d.id}
                href={`/program?day=${d.id}`}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm border ${
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
                return (
                  <Link
                    key={item.id}
                    href={`/sessions/${item.id}`}
                    className={`block border rounded-xl px-4 py-3 transition ${
                      blockedByOther
                        ? "bg-paper-dim border-border opacity-70"
                        : "bg-paper-card border-border hover:border-accent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
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
                      </div>
                      {blockedByOther ? (
                        <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-paper-dim text-ink-dim border border-border">
                          {t(locale, "program.blockTaken")}
                        </span>
                      ) : item.registrationRequired ? (
                        <StatusChip status={status} locale={locale} />
                      ) : (
                        <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-paper-dim text-ink-dim">
                          {t(locale, "session.noRegistrationNeeded")}
                        </span>
                      )}
                    </div>
                    {item.registrationRequired && item.myStatus === "registered" && (
                      <div className="text-xs text-good font-medium mt-2">
                        ✓ {t(locale, "status.registered")}
                      </div>
                    )}
                    {item.registrationRequired && item.myStatus === "waiting" && (
                      <div className="text-xs text-warn font-medium mt-2">
                        {t(locale, "session.waitlistPosition", { position: item.myWaitlistPosition ?? "?" })}
                      </div>
                    )}
                    {item.registrationRequired && item.capacity != null && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1">
                          <CapacityBar confirmedCount={item.confirmedCount} capacity={item.capacity} />
                        </div>
                        <span className="text-[11px] text-ink-dim font-mono tabular-nums">
                          {t(locale, "session.seatsLeft", { taken: item.confirmedCount, capacity: item.capacity })}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
