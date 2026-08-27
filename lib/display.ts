/** Up to 2 uppercase initials from a person's name, e.g. "Ana Petrušić" -> "AP". */
export function initials(name: string): string {
  const firstPerson = name.split(",")[0].trim();
  const parts = firstPerson.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const letters = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[1][0];
  return letters.toUpperCase();
}

const KIND_ICONS: { match: RegExp; icon: string }[] = [
  { match: /radionic|workshop/i, icon: "🛠️" },
  { match: /panel/i, icon: "🗣️" },
  { match: /predavanj|talk|keynote/i, icon: "🎤" },
  { match: /masterclass/i, icon: "⭐" },
  { match: /aktivnost|activity|party|tasting/i, icon: "🎉" },
  { match: /otvorenj|pozdrav|welcome|opening/i, icon: "👋" },
];

/** Small emoji matching a free-text session kind label, or "" if nothing matches. */
export function kindIcon(kind: string): string {
  const found = KIND_ICONS.find((k) => k.match.test(kind));
  return found ? found.icon : "";
}
