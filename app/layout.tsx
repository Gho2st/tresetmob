import type { Metadata } from "next";
import { Pragati_Narrow } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/contact";

const displayFont = Pragati_Narrow({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Bez tego zdjęcia produktów w openGraph (ścieżki względne) nie pokazują się
  // w podglądzie linku na Messengerze/Instagramie.
  metadataBase: new URL(SITE_URL),
  title: "Tresetmob",
  description: "",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={` ${displayFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
