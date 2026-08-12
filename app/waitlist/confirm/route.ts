import { NextRequest, NextResponse } from "next/server";
import { confirmWaitlistOffer } from "@/lib/registrations";
import { notifyPromotion } from "@/lib/notify";
import { PARTICIPANT_COOKIE_NAME, packParticipantSession } from "@/lib/session";
import { isHttpsOrigin } from "@/lib/cookieSecurity";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = process.env.APP_URL || url.origin;
  const token = url.searchParams.get("token") || "";

  const result = await confirmWaitlistOffer(token);

  if (!result.ok && result.reason === "invalid_or_expired") {
    return NextResponse.redirect(new URL("/waitlist/expired", origin));
  }

  if (!result.ok && result.reason === "conflict") {
    if (result.promoted) await notifyPromotion(result.promoted, origin);
    const dest = new URL("/waitlist/expired", origin);
    dest.searchParams.set("reason", "conflict");
    return NextResponse.redirect(dest);
  }

  if (result.ok) {
    const res = NextResponse.redirect(new URL("/schedule?msg=waitlist_confirmed", origin));
    const { value, maxAge } = packParticipantSession(result.participantId, result.participantEmail);
    res.cookies.set(PARTICIPANT_COOKIE_NAME, value, {
      httpOnly: true,
      secure: isHttpsOrigin(origin),
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return res;
  }

  return NextResponse.redirect(new URL("/waitlist/expired", origin));
}
