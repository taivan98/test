import { NextRequest, NextResponse } from "next/server";
import { PARTICIPANT_COOKIE_NAME } from "@/lib/session";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const res = NextResponse.redirect(new URL("/login", origin), 303);
  res.cookies.delete(PARTICIPANT_COOKIE_NAME);
  return res;
}
