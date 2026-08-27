import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { updateSiteSettings } from "@/lib/settings";

const MAX_CUSTOM_CSS_LENGTH = 20000;
const MAX_NAME_LENGTH = 120;

function readUrl(form: FormData, name: string): string {
  const raw = String(form.get(name) || "").trim();
  return /^https?:\/\//i.test(raw) ? raw : "";
}

function readHexColor(form: FormData, name: string): string {
  const raw = String(form.get(name) || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : "";
}

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();

  if (form.get("reset")) {
    await updateSiteSettings({
      conferenceName: "",
      logoUrl: "",
      faviconUrl: "",
      ogImageUrl: "",
      accentColor: "",
      accentInk: "",
      pageBackground: "",
      customCss: "",
    });
    return NextResponse.redirect(new URL("/admin/branding?done=reset", origin));
  }

  const conferenceName = String(form.get("conferenceName") || "").trim().slice(0, MAX_NAME_LENGTH);
  const logoUrl = readUrl(form, "logoUrl");
  const faviconUrl = readUrl(form, "faviconUrl");
  const ogImageUrl = readUrl(form, "ogImageUrl");
  const accentColor = readHexColor(form, "accentColor");
  const pageBackground = readHexColor(form, "pageBackground");

  const accentInkRaw = String(form.get("accentInk") || "");
  const accentInk = accentInkRaw === "dark" ? "dark" : "light";

  const customCss = String(form.get("customCss") || "").slice(0, MAX_CUSTOM_CSS_LENGTH);

  await updateSiteSettings({
    conferenceName,
    logoUrl,
    faviconUrl,
    ogImageUrl,
    accentColor,
    accentInk,
    pageBackground,
    customCss,
  });

  return NextResponse.redirect(new URL("/admin/branding?done=1", origin));
}
