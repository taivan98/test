import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/auth";
import { generateToken } from "@/lib/tokens";
import { sendMagicLinkEmail } from "@/lib/email";
import { getLocale } from "@/lib/locale";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const rawEmail = String(form.get("email") || "");
  const email = normalizeEmail(rawEmail);
  const locale = await getLocale();
  const origin = process.env.APP_URL || new URL(req.url).origin;

  if (!email || !email.includes("@")) {
    const url = new URL("/login", origin);
    url.searchParams.set("status", "invalid");
    return NextResponse.redirect(url);
  }

  const approved = await prisma.approvedEmail.findUnique({ where: { email } });
  if (!approved) {
    const url = new URL("/login", origin);
    url.searchParams.set("status", "not_approved");
    url.searchParams.set("email", email);
    return NextResponse.redirect(url);
  }

  const participant = await prisma.participant.upsert({
    where: { email },
    update: { locale },
    create: { email, locale },
  });

  const { raw, hash } = generateToken();
  await prisma.magicLinkToken.create({
    data: {
      tokenHash: hash,
      participantId: participant.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  const link = new URL(`/verify?token=${raw}`, origin).toString();

  try {
    await sendMagicLinkEmail(email, link, locale);
  } catch (err) {
    console.error("[request-link] failed to send magic-link email:", err);
    const url = new URL("/login", origin);
    url.searchParams.set("status", "send_failed");
    url.searchParams.set("email", email);
    return NextResponse.redirect(url);
  }

  const url = new URL("/login", origin);
  url.searchParams.set("status", "sent");
  url.searchParams.set("email", email);
  return NextResponse.redirect(url);
}
