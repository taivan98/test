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
