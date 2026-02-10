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
  title: "Seeking Beauty - EWTN+ Companion App",
  description:
    "Explore the art, locations, and spiritual themes from the EWTN+ series Seeking Beauty with David Henrie.",
  keywords: ["EWTN", "Catholic", "art", "beauty", "David Henrie", "sacred art"],
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
