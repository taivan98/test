import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.CONFERENCE_NAME
    ? `${process.env.CONFERENCE_NAME} — prijave na radionice`
    : "Prijave na radionice",
  description: "Prijava i odjava s konferencijskih radionica",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
