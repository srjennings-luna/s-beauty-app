"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import useOnboarded from "@/hooks/useOnboarded";

// Settings page (SET-01, June 2, 2026 launch readiness lock).
//
// v1.0 minimum contents (per launch plan):
//   Notifications -> chevron, links to /settings/notifications (W2 build)
//   Privacy Policy -> link to /privacy (W2 build of the static page)
//   Terms of Service -> link to /terms (W2 build of the static page)
//   App version (read-only display)
//   Send feedback (mailto:hello@contueri.com)
//   Restart onboarding (resets the onboarded flag, routes to /splash)
//
// Visual: parchment background, Two-Zone Header pattern matching the
// Explore detail screen. Zone 1 is the slim 46px nav (back chevron +
// Contueri wordmark + spacer right). Zone 2 is the editorial header
// ("Settings" + tagline). Below the header, rows in parchment surfaces
// with espresso chrome and sage section labels.
//
// The Settings page is reached via the gear icon top-right on Today
// (per SET-01 spec; see app/page.tsx + app/prompt/PromptClient.tsx
// `showSettings` prop wiring).

const APP_VERSION = "0.1.0"; // pulled from package.json at hand; bump there on release

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-5 pt-6 pb-2">
      <p
        style={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#7a9a8a",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function Row({
  label,
  rightSlot,
  href,
  onClick,
  destructive,
}: {
  label: string;
  rightSlot?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  const labelColor = destructive ? "#8b4557" : "#16110d";
  const inner = (
    <div
      className="flex items-center justify-between px-5"
      style={{
        background: "#ffffff",
        borderTop: "0.5px solid rgba(22,17,13,0.10)",
        borderBottom: "0.5px solid rgba(22,17,13,0.10)",
        marginTop: -0.5, // collapse adjacent row borders into a single hairline
        minHeight: 52,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: 14,
          fontWeight: 500,
          color: labelColor,
        }}
      >
        {label}
      </span>
      <div style={{ color: "#978b7d", fontSize: 13 }}>{rightSlot}</div>
    </div>
  );
  if (href) {
    // Use a plain anchor for mailto links and external paths so they
    // bypass Next.js client routing; Link otherwise.
    if (href.startsWith("mailto:") || href.startsWith("http")) {
      return <a href={href} className="block">{inner}</a>;
    }
    return <Link href={href} className="block">{inner}</Link>;
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {inner}
    </button>
  );
}

function Chevron() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={14}
      height={14}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { resetOnboarded } = useOnboarded();

  const handleRestartOnboarding = () => {
    // Confirm before destructive action to avoid accidental taps. The
    // splash itself does not destroy any other user data; this only
    // flips the onboarded flag.
    if (typeof window !== "undefined" && !window.confirm("Re-show the welcome screens?")) return;
    resetOnboarded();
    router.push("/splash");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment pb-28">

        {/* Zone 1: slim nav, back chevron + Contueri wordmark + spacer */}
        <div
          className="bg-parchment"
          style={{
            borderBottom: "0.5px solid rgba(22,17,13,0.18)",
            paddingTop: "env(safe-area-inset-top, 16px)",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ height: 46, padding: "0 14px" }}
          >
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
              className="w-8 h-8 flex items-center justify-center"
              style={{ color: "#16110d" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex-1 flex items-center justify-center">
              <span
                style={{
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontSize: 12.5,
                  fontWeight: 600,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#16110d",
                }}
              >
                Contueri
              </span>
            </div>
            {/* Right spacer to keep wordmark optically centered. */}
            <div style={{ width: 32, height: 32 }} />
          </div>
        </div>

        {/* Zone 2: editorial header, Cormorant title + sage tagline */}
        <div
          className="bg-parchment"
          style={{
            padding: "24px 22px 18px",
            borderBottom: "0.5px solid rgba(22,17,13,0.22)",
          }}
        >
          <div className="text-center">
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 40,
                fontWeight: 500,
                color: "#1a1a1a",
                letterSpacing: "0.5px",
                lineHeight: 1,
                margin: 0,
              }}
            >
              Settings
            </h1>
            <p
              className="italic"
              style={{
                fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                fontSize: 14,
                color: "#978b7d",
                marginTop: 20,
              }}
            >
              How Contueri shows up for you.
            </p>
          </div>
        </div>

        {/* Notifications */}
        <SectionLabel label="Notifications" />
        <Row
          label="Daily reminders"
          rightSlot={<Chevron />}
          href="/settings/notifications"
        />

        {/* Legal */}
        <SectionLabel label="Legal" />
        <Row label="Privacy Policy" rightSlot={<Chevron />} href="/privacy" />
        <Row label="Terms of Service" rightSlot={<Chevron />} href="/terms" />

        {/* About + feedback */}
        <SectionLabel label="About" />
        <Row label="Version" rightSlot={<span>{APP_VERSION}</span>} />
        <Row
          label="Send feedback"
          rightSlot={<Chevron />}
          href="mailto:hello@contueri.com?subject=Contueri%20feedback"
        />

        {/* Reset */}
        <SectionLabel label="Reset" />
        <Row
          label="Restart onboarding"
          rightSlot={<Chevron />}
          onClick={handleRestartOnboarding}
        />

        <div className="px-5 pt-8 pb-4 text-center">
          <p
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: 13,
              color: "#978b7d",
            }}
          >
            Made with care.
          </p>
        </div>

      </div>
    </PageTransition>
  );
}
