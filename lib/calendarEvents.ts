import { CalendarEventInput } from "./ics";
import { Locale } from "./i18n";

export function toCalendarEvent(
  item: { id: string; titleHr: string; titleEn: string; room: string },
  block: { startLabel: string; endLabel: string },
  day: { date: Date },
  locale: Locale
): CalendarEventInput {
  return {
    uid: `${item.id}@prijave-radionice`,
    summary: locale === "hr" ? item.titleHr : item.titleEn,
    location: item.room || undefined,
    dayDate: day.date,
    startLabel: block.startLabel,
    endLabel: block.endLabel,
  };
}
