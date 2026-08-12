/**
 * The conference is a single, in-person, single-timezone event (Europe/Zagreb).
 * Rather than pull in a timezone database, this hardcodes the EU daylight-saving
 * rule (last Sunday of March -> last Sunday of October) to convert a block's
 * "10:00" label on a given conference day into a real UTC instant, which is all
 * that's needed for calendar exports.
 */

function lastSundayUtc(year: number, monthIndex0: number): Date {
  const d = new Date(Date.UTC(year, monthIndex0 + 1, 0)); // last day of month
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d;
}

function isEuSummerTime(utcGuess: Date): boolean {
  const year = utcGuess.getUTCFullYear();
  const start = lastSundayUtc(year, 2); // March
  start.setUTCHours(1, 0, 0, 0);
  const end = lastSundayUtc(year, 9); // October
  end.setUTCHours(1, 0, 0, 0);
  return utcGuess >= start && utcGuess < end;
}

export function parseTimeLabel(label: string): { h: number; m: number } {
  const [h, m] = label.split(":").map((n) => parseInt(n, 10));
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 };
}

/** Converts a conference day + "HH:mm" block label (Europe/Zagreb local time) to a UTC Date. */
export function zagrebLocalToUtc(dayDate: Date, timeLabel: string): Date {
  const { h, m } = parseTimeLabel(timeLabel);
  const y = dayDate.getUTCFullYear();
  const mo = dayDate.getUTCMonth();
  const d = dayDate.getUTCDate();
  const guess = new Date(Date.UTC(y, mo, d, h, m));
  const offsetHours = isEuSummerTime(guess) ? 2 : 1;
  return new Date(Date.UTC(y, mo, d, h - offsetHours, m));
}
