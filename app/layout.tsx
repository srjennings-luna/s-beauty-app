import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import VisualEditingClient from "@/components/VisualEditingClient";
import NativeSplashController from "@/components/native/NativeSplashController";
import StatusBarController from "@/components/native/StatusBarController";

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
  title: "CONTUERI · Beauty • Truth • Goodness",
  description:
    "CONTUERI is a contemplative discovery app for seekers of beauty, truth, and goodness: sacred art, music, literature, landscape, and the great tradition.",
  keywords: ["beauty", "contemplation", "classical", "tradition", "sacred art", "philosophy", "music", "literature"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // viewport-fit=cover lets the app extend under the notch / Dynamic Island
  // on iPhone so safe-area-inset-* CSS values work correctly. Required for
  // any full-bleed immersive surface (Encounter, P&P, Visio Divina, the
  // Explore bubble canvas).
  viewportFit: "cover",
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
        {/*
          iOS native controllers (no-ops on web). NativeSplashController
          dismisses the iOS launch image once React has painted, so the
          native splash fades into the real React content with no
          parchment-flash in between. StatusBarController updates the
          iOS status bar style + background per route — light icons on
          espresso surfaces (Today, P&P, Visio Divina, Journey Day,
          splash), dark icons on parchment surfaces (Settings, Explore,
          Library, Journeys list, Privacy, Terms). Both gracefully
          no-op on web via the dynamic-import guard.
        */}
        <NativeSplashController />
        <StatusBarController />
      </body>
    </html>
  );
}
