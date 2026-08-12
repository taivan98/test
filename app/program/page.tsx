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
            <div className="flex flex-col gap-2.5">
              {block.items.map((item) => {
                const status = capacityStatus(item.confirmedCount, item.capacity);
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
                        {item.room && <div className="text-xs text-ink-dim mt-0.5">{item.room}</div>}
                      </div>
                      <StatusChip status={status} locale={locale} />
                    </div>
                    {item.myStatus === "registered" && (
                      <div className="text-xs text-good font-medium mt-2">
                        ✓ {t(locale, "status.registered")}
                      </div>
                    )}
                    {item.myStatus === "waiting" && (
                      <div className="text-xs text-warn font-medium mt-2">
                        {t(locale, "session.waitlistPosition", { position: item.myWaitlistPosition ?? "?" })}
                      </div>
                    )}
                    {item.capacity != null && (
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
