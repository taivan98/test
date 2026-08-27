export const MAX_SPEAKER_FIELDS = 4;

/** Splits the stored "Ana Kos, Ivan Horvat" speaker string into individual names. */
export function parseSpeakers(joined: string): string[] {
  return joined
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Joins individual speaker-field values back into the single stored string. */
export function joinSpeakers(fields: (string | null)[]): string {
  return fields
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(", ");
}
