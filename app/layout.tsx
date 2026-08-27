import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings, buildColorOverrideCss, escapeForStyleTag } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const conferenceName = settings.conferenceName || process.env.CONFERENCE_NAME || "";
  const title = conferenceName ? `${conferenceName} — prijave na radionice` : "Prijave na radionice";
  const description = "Prijava i odjava s konferencijskih radionica";

  const metadata: Metadata = { title, description };

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
  const customCss = escapeForStyleTag(settings.customCss);

  return (
    <html lang="hr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {colorCss && <style dangerouslySetInnerHTML={{ __html: colorCss }} />}
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
        {children}
      </body>
    </html>
  );
}
