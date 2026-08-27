import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteSettings, buildColorOverrideCss, buildFontFaceCss, escapeForStyleTag } from "@/lib/settings";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const conferenceName = settings.conferenceName || process.env.CONFERENCE_NAME || "";
  const title = conferenceName ? `${conferenceName} — prijave na radionice` : "Prijave na radionice";
  const description = "Prijava i odjava s konferencijskih radionica";

  // Needed so a relative "/uploads/..." favicon/OG image resolves to an absolute
  // URL — social previews (Viber, LinkedIn...) fetch the raw HTML and require one.
  const metadata: Metadata = {
    title,
    description,
    metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  };

  if (settings.faviconUrl) {
    metadata.icons = { icon: settings.faviconUrl };
  }
  if (settings.ogImageUrl) {
    metadata.openGraph = { title, description, images: [settings.ogImageUrl] };
    metadata.twitter = { card: "summary_large_image", title, description, images: [settings.ogImageUrl] };
  }

  return metadata;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  const colorCss = buildColorOverrideCss(settings);
  const fontFaceCss = buildFontFaceCss(settings);
  const customCss = escapeForStyleTag(settings.customCss);

  return (
    <html lang="hr" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {colorCss && <style dangerouslySetInnerHTML={{ __html: colorCss }} />}
        {fontFaceCss && <style dangerouslySetInnerHTML={{ __html: fontFaceCss }} />}
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
        {children}
      </body>
    </html>
  );
}
