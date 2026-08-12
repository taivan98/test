import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/session";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const res = NextResponse.redirect(new URL("/admin/login", origin));
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
