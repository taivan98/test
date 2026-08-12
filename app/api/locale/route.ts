import { NextRequest, NextResponse } from "next/server";
import { LOCALES } from "@/lib/i18n";
import { LOCALE_COOKIE } from "@/lib/locale";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang");
  const next = url.searchParams.get("next") || "/";
  const safeNext = next.startsWith("/") ? next : "/";

  const res = NextResponse.redirect(new URL(safeNext, req.url));
  if (lang && (LOCALES as string[]).includes(lang)) {
    res.cookies.set(LOCALE_COOKIE, lang, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}
