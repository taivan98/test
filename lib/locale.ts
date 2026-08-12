import { cookies } from "next/headers";
import { DEFAULT_LOCALE, Locale, LOCALES } from "./i18n";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return (LOCALES as string[]).includes(value ?? "") ? (value as Locale) : DEFAULT_LOCALE;
}
