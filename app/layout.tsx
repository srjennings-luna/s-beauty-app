import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import VisualEditingClient from "@/components/VisualEditingClient";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-open-sans",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://s-beauty-app.vercel.app",
  ),
  title: "KALLOS · Daily Vibes: Beauty • Truth • Goodness",
  description:
    "KALLOS is a contemplative discovery app for seekers of beauty, truth, and goodness: sacred art, music, literature, landscape, and the great tradition.",
  keywords: ["beauty", "contemplation", "classical", "tradition", "sacred art", "philosophy", "music", "literature"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Mirror --color-parchment in app/globals.css (browser meta accepts only literal hex)
  themeColor: "#fdf6e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} ${cormorantGaramond.variable}`}>
      <body className="antialiased min-h-screen pb-20">
        <main>{children}</main>
        <Navigation />
        {/*
          Visual Editing bridge for Sanity Studio's Presentation tool.
          Self-detects whether the page is rendered inside a Studio iframe
          and only activates the postMessage channel in that case, so the
          script is a near no-op for regular visitors. Without this the
          iframe loads but Presentation throws "Unable to connect".
        */}
        <VisualEditingClient />
      </body>
    </html>
  );
}
