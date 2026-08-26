import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings, buildAccentOverrideCss, escapeForStyleTag } from "@/lib/settings";

export const metadata: Metadata = {
  title: process.env.CONFERENCE_NAME
    ? `${process.env.CONFERENCE_NAME} — prijave na radionice`
    : "Prijave na radionice",
  description: "Prijava i odjava s konferencijskih radionica",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  const accentCss = buildAccentOverrideCss(settings);
  const customCss = escapeForStyleTag(settings.customCss);

  return (
    <html lang="hr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {accentCss && <style dangerouslySetInnerHTML={{ __html: accentCss }} />}
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
        {children}
      </body>
    </html>
  );
}
