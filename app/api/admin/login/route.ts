import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ADMIN_COOKIE_NAME, packAdminSession } from "@/lib/session";
import { isHttpsOrigin } from "@/lib/cookieSecurity";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const form = await req.formData();
  const password = String(form.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD || "";

  const ok =
    expected.length > 0 &&
    password.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected));

  if (!ok) {
    const url = new URL("/admin/login", origin);
    url.searchParams.set("status", "invalid");
    return NextResponse.redirect(url);
  }

  const res = NextResponse.redirect(new URL("/admin", origin));
  const { value, maxAge } = packAdminSession();
  res.cookies.set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    secure: isHttpsOrigin(origin),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
