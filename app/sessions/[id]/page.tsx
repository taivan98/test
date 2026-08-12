import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getProgramItem } from "@/lib/program";
import { t } from "@/lib/i18n";
import { capacityStatus } from "@/lib/status";
import { Header } from "@/components/Header";
import { StatusChip } from "@/components/StatusChip";
import { CapacityBar } from "@/components/CapacityBar";

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string; conflictHr?: string; conflictEn?: string }>;
}) {
  const participant = await getCurrentParticipant();
  if (!participant) redirect("/login");

  const locale = await getLocale();
  const { id } = await params;
  const { msg, conflictHr, conflictEn } = await searchParams;
  const found = await getProgramItem(participant.id, id);
  if (!found) redirect("/program");

  const { day, block, item } = found;
  const conferenceName = process.env.CONFERENCE_NAME || "Konferencija";
  const status = capacityStatus(item.confirmedCount, item.capacity);
  const title = locale === "hr" ? item.titleHr : item.titleEn;
  const kind = locale === "hr" ? item.kindHr : item.kindEn;
  const description = locale === "hr" ? item.descriptionHr : item.descriptionEn;
  const conflictTitle = locale === "hr" ? conflictHr : conflictEn;

  return (
    <>
      <Header locale={locale} path={`/sessions/${id}`} participantEmail={participant.email} conferenceName={conferenceName} />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-6">
        <a href="/program" className="text-sm text-ink-dim hover:text-ink">
          ← {t(locale, "nav.program")}
        </a>

        <div className="mt-3 mb-1 text-xs font-mono uppercase tracking-wide text-ink-dim">
          {locale === "hr" ? day.labelHr : day.labelEn} · {block.startLabel}–{block.endLabel}
        </div>
        {kind && (
          <div className="text-[11px] font-mono uppercase tracking-wide text-accent mb-1">{kind}</div>
        )}
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>

        <div className="flex items-center gap-2 mb-4">
          {item.registrationRequired ? (
            <StatusChip status={status} locale={locale} />
          ) : (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-paper-dim text-ink-dim">
              {t(locale, "session.noRegistrationNeeded")}
            </span>
          )}
          {item.registrationRequired && item.myStatus === "registered" && (
            <span className="text-xs font-semibold text-good">✓ {t(locale, "status.registered")}</span>
          )}
        </div>

        {(item.speaker || item.room) && (
          <dl className="text-sm text-ink-dim mb-4 flex flex-col gap-1">
            {item.speaker && (
              <div>
                <span className="font-medium text-ink">{t(locale, "session.speaker")}:</span> {item.speaker}
              </div>
            )}
            {item.room && (
              <div>
                <span className="font-medium text-ink">{t(locale, "session.room")}:</span> {item.room}
              </div>
            )}
          </dl>
        )}

        {description && <p className="text-sm leading-relaxed mb-3">{description}</p>}

        {item.detailsUrl && (
          <a
            href={item.detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline mb-5"
          >
            {t(locale, "session.moreDetails")} ↗
          </a>
        )}

        {item.registrationRequired && item.capacity != null && (
          <div className="mb-6">
            <CapacityBar confirmedCount={item.confirmedCount} capacity={item.capacity} />
            <div className="text-xs text-ink-dim font-mono mt-1.5">
              {t(locale, "session.seatsLeft", { taken: item.confirmedCount, capacity: item.capacity })}
            </div>
          </div>
        )}

        {msg === "conflict" && conflictTitle && (
          <div className="mb-4 rounded-lg bg-warn-soft border border-warn/30 p-3 text-sm text-ink">
            {t(locale, "session.blockConflict", { title: conflictTitle })}
          </div>
        )}
        {msg === "full" && item.myStatus === "none" && (
          <div className="mb-4 rounded-lg bg-warn-soft border border-warn/30 p-3 text-sm text-ink">
            {t(locale, "session.fullJoinWaitlist")}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {!item.registrationRequired && (
            <p className="text-sm text-ink-dim">{t(locale, "session.noRegistrationNeeded")}</p>
          )}
          {item.registrationRequired && item.myStatus === "registered" && (
            <form action="/api/registrations/cancel" method="POST">
              <input type="hidden" name="programItemId" value={item.id} />
              <button
                type="submit"
                className="w-full rounded-lg border border-border py-2.5 font-semibold hover:bg-paper-dim transition"
              >
                {t(locale, "session.cancel")}
              </button>
            </form>
          )}

          {item.registrationRequired && item.myStatus === "waiting" && (
            <>
              <div className="text-sm font-medium text-warn">
                {t(locale, "session.waitlistPosition", { position: item.myWaitlistPosition ?? "?" })}
              </div>
              <form action="/api/waitlist/leave" method="POST">
                <input type="hidden" name="programItemId" value={item.id} />
                <button
                  type="submit"
                  className="w-full rounded-lg border border-border py-2.5 font-semibold hover:bg-paper-dim transition"
                >
                  {t(locale, "session.leaveWaitlist")}
                </button>
              </form>
            </>
          )}

          {item.registrationRequired && item.myStatus === "offered" && (
            <>
              <div className="text-sm font-medium text-warn">{t(locale, "status.waitlisted")}</div>
              <form action="/api/waitlist/leave" method="POST">
                <input type="hidden" name="programItemId" value={item.id} />
                <button
                  type="submit"
                  className="w-full rounded-lg border border-border py-2.5 font-semibold hover:bg-paper-dim transition"
                >
                  {t(locale, "session.leaveWaitlist")}
                </button>
              </form>
            </>
          )}

          {item.registrationRequired && item.myStatus === "none" && status !== "full" && (
            <form action="/api/registrations" method="POST">
              <input type="hidden" name="programItemId" value={item.id} />
              <button
                type="submit"
                className="w-full rounded-lg bg-accent text-accent-ink py-2.5 font-semibold hover:opacity-90 transition"
              >
                {t(locale, "session.register")}
              </button>
            </form>
          )}

          {item.registrationRequired && item.myStatus === "none" && status === "full" && (
            <form action="/api/waitlist/join" method="POST">
              <input type="hidden" name="programItemId" value={item.id} />
              <button
                type="submit"
                className="w-full rounded-lg border border-accent text-accent py-2.5 font-semibold hover:bg-accent-soft transition"
              >
                {t(locale, "session.joinWaitlist")}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
