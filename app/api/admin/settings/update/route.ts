import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { updateSiteSettings } from "@/lib/settings";

const MAX_CUSTOM_CSS_LENGTH = 20000;

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();

  if (form.get("reset")) {
    await updateSiteSettings({ logoUrl: "", accentColor: "", accentInk: "", customCss: "" });
    return NextResponse.redirect(new URL("/admin/branding?done=reset", origin));
  }

  const logoUrlRaw = String(form.get("logoUrl") || "").trim();
  const logoUrl = /^https?:\/\//i.test(logoUrlRaw) ? logoUrlRaw : "";

  const accentColorRaw = String(form.get("accentColor") || "").trim();
  const accentColor = /^#[0-9a-fA-F]{6}$/.test(accentColorRaw) ? accentColorRaw : "";

  const accentInkRaw = String(form.get("accentInk") || "");
  const accentInk = accentInkRaw === "dark" ? "dark" : "light";

  const customCss = String(form.get("customCss") || "").slice(0, MAX_CUSTOM_CSS_LENGTH);

  await updateSiteSettings({ logoUrl, accentColor, accentInk, customCss });

  return NextResponse.redirect(new URL("/admin/branding?done=1", origin));
}
