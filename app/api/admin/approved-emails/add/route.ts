import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/adminGuard";
import { normalizeEmail } from "@/lib/auth";

function extractEmails(text: string): string[] {
  const found = text.split(/[\n,;]+/).map((s) => normalizeEmail(s)).filter((s) => s.includes("@"));
  return Array.from(new Set(found));
}

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const file = form.get("file");
  const pasted = String(form.get("emails") || "");

  let text = pasted;
  if (file instanceof File && file.size > 0) {
    text += "\n" + (await file.text());
  }

  const emails = extractEmails(text);
  for (const email of emails) {
    await prisma.approvedEmail.upsert({ where: { email }, update: {}, create: { email } });
  }

  const url = new URL("/admin/approved-emails", origin);
  url.searchParams.set("added", String(emails.length));
  return NextResponse.redirect(url, 303);
}
