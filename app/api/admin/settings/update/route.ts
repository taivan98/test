import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import { getSiteSettings, updateSiteSettings } from "@/lib/settings";
import { deleteUploadByServingPath } from "@/lib/uploads";

const MAX_CUSTOM_CSS_LENGTH = 20000;
const MAX_NAME_LENGTH = 120;

function readHexColor(form: FormData, name: string): string {
  const raw = String(form.get(name) || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : "";
}

export async function POST(req: NextRequest) {
  const origin = process.env.APP_URL || new URL(req.url).origin;
  const guard = await requireAdminApi(origin);
  if (guard) return guard;

  const form = await req.formData();
  const current = await getSiteSettings();

  if (form.get("reset")) {
    await Promise.all([
      deleteUploadByServingPath(current.logoUrl),
      deleteUploadByServingPath(current.faviconUrl),
      deleteUploadByServingPath(current.ogImageUrl),
      deleteUploadByServingPath(current.fontUrl),
    ]);
    await updateSiteSettings({
      conferenceName: "",
      logoUrl: "",
      faviconUrl: "",
      ogImageUrl: "",
      accentColor: "",
      accentInk: "",
      pageBackground: "",
      fontUrl: "",
      customCss: "",
    });
    return NextResponse.redirect(new URL("/admin/branding?done=reset", origin), 303);
  }

  // This form only edits text/color fields — logo/favicon/OG-image/font are
  // uploaded through separate forms (see /api/admin/settings/upload), so
  // carry those over unchanged from the current settings.
  const conferenceName = String(form.get("conferenceName") || "").trim().slice(0, MAX_NAME_LENGTH);
  const accentColor = readHexColor(form, "accentColor");
  const pageBackground = readHexColor(form, "pageBackground");

  const accentInkRaw = String(form.get("accentInk") || "");
  const accentInk = accentInkRaw === "dark" ? "dark" : "light";

  const customCss = String(form.get("customCss") || "").slice(0, MAX_CUSTOM_CSS_LENGTH);

  await updateSiteSettings({
    ...current,
    conferenceName,
    accentColor,
    accentInk,
    pageBackground,
    customCss,
  });

  return NextResponse.redirect(new URL("/admin/branding?done=1", origin), 303);
}
