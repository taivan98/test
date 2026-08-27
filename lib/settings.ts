import { prisma } from "./db";

const SETTINGS_ID = "singleton";

export type SiteSettings = {
  conferenceName: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  accentColor: string;
  accentInk: string;
  pageBackground: string;
  fontUrl: string;
  customCss: string;
};

const EMPTY: SiteSettings = {
  conferenceName: "",
  logoUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  accentColor: "",
  accentInk: "",
  pageBackground: "",
  fontUrl: "",
  customCss: "",
};

/**
 * Falls back to defaults on any DB error instead of throwing. Every page pulls
 * branding through this (via the root layout, Header, AdminHeader), including
 * ones statically prerendered at build time — when the DB/volume isn't
 * reachable yet (e.g. Railway's image-build step, before the volume is
 * mounted), throwing here would fail the whole build.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!row) return EMPTY;
    return {
      conferenceName: row.conferenceName,
      logoUrl: row.logoUrl,
      faviconUrl: row.faviconUrl,
      ogImageUrl: row.ogImageUrl,
      accentColor: row.accentColor,
      accentInk: row.accentInk,
      pageBackground: row.pageBackground,
      fontUrl: row.fontUrl,
      customCss: row.customCss,
    };
  } catch (err) {
    console.error("getSiteSettings: falling back to defaults", err);
    return EMPTY;
  }
}

export async function updateSiteSettings(data: SiteSettings): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}

/** Builds a `:root{...}` override block from validated settings, or "" if nothing to override. */
export function buildColorOverrideCss(settings: SiteSettings): string {
  const decls: string[] = [];
  if (/^#[0-9a-fA-F]{6}$/.test(settings.accentColor)) {
    decls.push(`--accent:${settings.accentColor};`);
  }
  if (settings.accentInk === "dark") decls.push(`--accent-ink:#1b1d24;`);
  else if (settings.accentInk === "light") decls.push(`--accent-ink:#ffffff;`);
  if (/^#[0-9a-fA-F]{6}$/.test(settings.pageBackground)) {
    decls.push(`--paper:${settings.pageBackground};`);
  }
  if (decls.length === 0) return "";
  return `:root{${decls.join("")}}`;
}

const FONT_FORMATS: Record<string, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
};

/**
 * Builds an @font-face + --font-custom override for an uploaded font, or ""
 * if none is set. fontUrl is always our own server-generated "/uploads/..."
 * path (see lib/uploads.ts) with a validated extension, never arbitrary
 * user-typed text, so interpolating it into CSS here is safe.
 */
export function buildFontFaceCss(settings: SiteSettings): string {
  if (!settings.fontUrl) return "";
  const ext = settings.fontUrl.split(".").pop()?.toLowerCase() || "";
  const format = FONT_FORMATS[ext];
  if (!format) return "";
  return `@font-face{font-family:'CustomFont';src:url('${settings.fontUrl}') format('${format}');font-display:swap;}:root{--font-custom:'CustomFont';}`;
}

/** Neutralizes a literal "</style" so custom CSS can't prematurely close the <style> tag it's injected into. */
export function escapeForStyleTag(css: string): string {
  return css.replace(/<\/style/gi, "<\\/style");
}
