import { Locale } from "@/lib/i18n";

export function LanguageSwitch({ locale, path }: { locale: Locale; path: string }) {
  const encodedPath = encodeURIComponent(path);
  return (
    <div className="flex gap-1 font-mono text-xs">
      <a
        href={`/api/locale?lang=hr&next=${encodedPath}`}
        className={`rounded px-2 py-1 border ${
          locale === "hr"
            ? "bg-accent text-accent-ink border-accent"
            : "border-border text-ink-dim"
        }`}
      >
        HR
      </a>
      <a
        href={`/api/locale?lang=en&next=${encodedPath}`}
        className={`rounded px-2 py-1 border ${
          locale === "en"
            ? "bg-accent text-accent-ink border-accent"
            : "border-border text-ink-dim"
        }`}
      >
        EN
      </a>
    </div>
  );
}
