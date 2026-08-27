import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { leaveWaitlist } from "@/lib/registrations";
import { notifyPromotion } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const participant = await getCurrentParticipant();
  if (!participant) return NextResponse.redirect(new URL("/login", origin));

  const form = await req.formData();
  const programItemId = String(form.get("programItemId") || "");
  const redirectTo = String(form.get("redirectTo") || `/sessions/${programItemId}`);

  const promoted = await leaveWaitlist(participant.id, programItemId);
  if (promoted) await notifyPromotion(promoted, origin);

  const backTo = new URL(redirectTo, origin);
  backTo.searchParams.set("msg", "left_waitlist");
  return NextResponse.redirect(backTo);
}
