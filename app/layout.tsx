import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";

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
  title: "KALLOS — Love the beautiful and the good",
  description:
    "KALLOS is a contemplative discovery app for seekers of beauty, truth, and goodness — sacred art, music, literature, landscape, and the great tradition.",
  keywords: ["beauty", "contemplation", "classical", "tradition", "sacred art", "philosophy", "music", "literature"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#203545",
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
      </body>
    </html>
  );
}
