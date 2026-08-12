import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { joinWaitlist, BlockConflictError, AlreadyOnWaitlistError, NotFoundError } from "@/lib/registrations";

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const participant = await getCurrentParticipant();
  if (!participant) return NextResponse.redirect(new URL("/login", origin));

  const form = await req.formData();
  const programItemId = String(form.get("programItemId") || "");
  const backTo = new URL(`/sessions/${programItemId}`, origin);

  try {
    await joinWaitlist(participant.id, programItemId);
    backTo.searchParams.set("msg", "waitlisted");
  } catch (err) {
    if (err instanceof BlockConflictError) {
      backTo.searchParams.set("msg", "conflict");
      backTo.searchParams.set("conflictHr", err.conflictTitleHr);
      backTo.searchParams.set("conflictEn", err.conflictTitleEn);
    } else if (err instanceof AlreadyOnWaitlistError) {
      backTo.searchParams.set("msg", "already_waitlisted");
    } else if (err instanceof NotFoundError) {
      return NextResponse.redirect(new URL("/program", origin));
    } else {
      throw err;
    }
  }

  return NextResponse.redirect(backTo);
}
