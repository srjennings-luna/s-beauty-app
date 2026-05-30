import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pause & Ponder — CONTUERI",
  description:
    "A daily encounter with beauty. A piece of art, a question, and a moment to sit with both.",
  openGraph: {
    title: "Pause & Ponder — CONTUERI",
    description:
      "A daily encounter with beauty. A piece of art, a question, and a moment to sit with both.",
    siteName: "CONTUERI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pause & Ponder — CONTUERI",
    description: "A daily encounter with beauty.",
  },
};

export default function PromptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
