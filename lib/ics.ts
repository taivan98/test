import { zagrebLocalToUtc } from "./scheduleTime";

// Standard EU (CET/CEST) daylight-saving rule, valid for any year — safe to
// hardcode since the EU rule hasn't changed since 1996.
const VTIMEZONE_EUROPE_ZAGREB = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Zagreb",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
].join("\r\n");

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** RFC5545 requires folding lines longer than 75 octets. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75));
    rest = " " + rest.slice(75);
  }
  parts.push(rest);
  return parts.join("\r\n");
}

function formatLocalStamp(date: Date, dayDate: Date, timeLabel: string): string {
  const [h, m] = timeLabel.split(":").map((n) => parseInt(n, 10));
  const y = dayDate.getUTCFullYear();
  const mo = String(dayDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dayDate.getUTCDate()).padStart(2, "0");
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${y}${mo}${d}T${hh}${mm}00`;
}

function formatUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export type CalendarEventInput = {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  dayDate: Date;
  startLabel: string;
  endLabel: string;
};

function buildEvent(ev: CalendarEventInput): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `DTSTAMP:${formatUtcStamp(new Date())}`,
    `DTSTART;TZID=Europe/Zagreb:${formatLocalStamp(zagrebLocalToUtc(ev.dayDate, ev.startLabel), ev.dayDate, ev.startLabel)}`,
    `DTEND;TZID=Europe/Zagreb:${formatLocalStamp(zagrebLocalToUtc(ev.dayDate, ev.endLabel), ev.dayDate, ev.endLabel)}`,
    `SUMMARY:${escapeIcsText(ev.summary)}`,
  ];
  if (ev.description) lines.push(`DESCRIPTION:${escapeIcsText(ev.description)}`);
  if (ev.location) lines.push(`LOCATION:${escapeIcsText(ev.location)}`);
  lines.push("END:VEVENT");
  return lines.map(foldLine).join("\r\n");
}

export function buildCalendar(calName: string, events: CalendarEventInput[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prijave na radionice//HR",
    "CALSCALE:GREGORIAN",
    foldLine(`X-WR-CALNAME:${escapeIcsText(calName)}`),
    VTIMEZONE_EUROPE_ZAGREB,
    ...events.map(buildEvent),
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarLink(ev: CalendarEventInput): string {
  const start = formatUtcStamp(zagrebLocalToUtc(ev.dayDate, ev.startLabel));
  const end = formatUtcStamp(zagrebLocalToUtc(ev.dayDate, ev.endLabel));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.summary,
    dates: `${start}/${end}`,
  });
  if (ev.description) params.set("details", ev.description);
  if (ev.location) params.set("location", ev.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
