import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans, Cormorant_Garamond, Kalam } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import VisualEditingClient from "@/components/VisualEditingClient";
import NativeSplashController from "@/components/native/NativeSplashController";
import StatusBarController from "@/components/native/StatusBarController";
import ExternalLinkInterceptor from "@/components/native/ExternalLinkInterceptor";
import OneSignalInitializer from "@/components/OneSignalInitializer";
import AmbientSoundProvider from "@/components/audio/AmbientSoundProvider";
import AmbientFloatingButton from "@/components/audio/AmbientFloatingButton";

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

// Kalam — used for the lowercase "l" mark in the Contueri brand lockup
// rendered on the Journey Complete screen.
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-kalam",
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
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} ${cormorantGaramond.variable} ${kalam.variable}`}>
      <body className="antialiased min-h-screen pb-20">
        {/*
          AmbientSoundProvider wraps everything that needs cross-route
          audio continuity. Sits above the route content AND above
          Navigation so the floating button (rendered as a sibling of
          Navigation) can consume the context. VisualEditingClient is
          OUTSIDE the provider since it's a Sanity-preview bridge with
          its own lifecycle that shouldn't touch ambient state.
          See components/audio/AmbientSoundProvider.tsx for the full
          contract (autoplay policy, narration coordination, etc.).
        */}
        <AmbientSoundProvider>
          <main>{children}</main>
          <Navigation />
          <AmbientFloatingButton />
        </AmbientSoundProvider>
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
          Library, Journeys list, Privacy, Terms). ExternalLinkInterceptor
          routes cross-origin http/https link clicks through the
          Capacitor Browser plugin (SFSafariViewController on iOS) so
          external content opens in an in-app browser overlay instead
          of kicking the user out to system Safari. Required for App
          Store Review Guideline 4.5.4 and keeps the contemplative
          space intact. All three gracefully no-op on web via the
          dynamic-import guard.
        */}
        <NativeSplashController />
        <StatusBarController />
        <ExternalLinkInterceptor />
        {/*
          OneSignal SDK boot: initializes the SDK with the Contueri app
          ID and tags the device with today's date so the streak
          segment can target devices that haven't opened today. Native
          iOS only — no-ops on web (Vercel preview, Sanity Presentation
          iframe, desktop Safari). See lib/onesignal.ts for the full
          tagging contract + how user preferences flow to OneSignal
          segments.
        */}
        <OneSignalInitializer />
      </body>
    </html>
  );
}
