import Link from "next/link";
import PageTransition from "@/components/ui/PageTransition";

// Terms of Service page (/terms).
//
// Source content: ~/Documents/KALLOS Launch/KALLOS-Terms-of-Service-Draft.html
// (draft prepared May 20, 2026; Contueri rebrand applied here).
//
// Required for App Store submission. App Store Connect won't accept
// submission without a working Terms URL.
//
// LEGAL PLACEHOLDERS still in this file (shown in pink boxes). These
// MUST be filled before App Store submission:
//   - [LEGAL ENTITY NAME]
//   - [STATE]
//   - [COUNTY, STATE]
//   - [LAUNCH DATE]
//
// Drafted by counsel-adjacent voice. Review with qualified counsel
// before publishing.
//
// Server component (no "use client"). Pure content; prerendered at build.

export const metadata = {
  title: "Terms of Service | Contueri",
  description: "The terms that govern your use of Contueri.",
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "#7a9a8a",
        marginTop: 36,
        marginBottom: 14,
      }}
    >
      {children}
    </p>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  // aria-hidden so screen readers do not narrate bracketed placeholder
  // text as part of the legal content. The visual pink box still shows
  // for sighted review. Resolves to plain text once Sheri fills in
  // before App Store submission.
  return (
    <span
      aria-hidden="true"
      style={{
        background: "rgba(139,69,87,0.10)",
        color: "#8b4557",
        padding: "1px 8px",
        fontFamily: "var(--font-montserrat), monospace",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

export default function TermsPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment pb-28">

        {/* Zone 1: slim nav */}
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
            <Link
              href="/settings"
              aria-label="Back"
              className="w-8 h-8 flex items-center justify-center"
              style={{ color: "#16110d" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
              </svg>
            </Link>
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
            <div style={{ width: 32, height: 32 }} />
          </div>
        </div>

        {/* Zone 2: editorial header */}
        <div
          className="bg-parchment"
          style={{
            padding: "28px 22px 22px",
            borderBottom: "0.5px solid rgba(22,17,13,0.22)",
          }}
        >
          <div className="text-center">
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontStyle: "italic",
                fontSize: 40,
                fontWeight: 500,
                color: "#1a1a1a",
                letterSpacing: "0.003em",
                lineHeight: 1.02,
                margin: 0,
              }}
            >
              Terms of Service
            </h1>
            <p
              style={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#978b7d",
                marginTop: 18,
              }}
            >
              Effective <Placeholder>[LAUNCH DATE]</Placeholder>
              {"  "}&middot;{"  "}
              Last updated <Placeholder>[LAUNCH DATE]</Placeholder>
            </p>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "32px 22px 16px",
            fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
            color: "#3d3530",
            fontSize: 14.5,
            lineHeight: 1.75,
          }}
        >

          <p>
            These terms govern your use of the Contueri app and the Contueri
            website. By using Contueri, you agree to them. They are written
            to be readable. If anything is unclear, email{" "}
            <a href="mailto:hello@contueri.com" style={{ color: "#8a6a3a" }}>
              hello@contueri.com
            </a>.
          </p>

          <Eyebrow>1. The service</Eyebrow>
          <p>
            Contueri is a contemplative discovery app, free to use, offered by{" "}
            <Placeholder>[LEGAL ENTITY NAME]</Placeholder>{" "}
            (&ldquo;Contueri,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). It
            includes daily Pause &amp; Ponder prompts, multi-day Journeys,
            Visio Divina sessions, a Library of saved content, and related
            features.
          </p>
          <p>
            The Contueri Mail subscription, sold separately at{" "}
            <a href="https://contueri.com/mail" style={{ color: "#8a6a3a" }}>
              contueri.com/mail
            </a>, is a physical product and is governed by its own terms.
          </p>

          <Eyebrow>2. Using Contueri</Eyebrow>
          <p>
            You may use Contueri for personal, non-commercial purposes. You
            agree not to:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 8 }}>Use Contueri in any way that violates applicable law</li>
            <li style={{ marginBottom: 8 }}>Attempt to interfere with, disrupt, or reverse-engineer the app</li>
            <li style={{ marginBottom: 8 }}>Use automated systems to access Contueri in a way that disrupts service</li>
            <li style={{ marginBottom: 8 }}>Resell, redistribute, or commercialize any Contueri content without our written permission</li>
          </ul>

          <Eyebrow>3. Account and security</Eyebrow>
          <p>
            You may use Contueri without an account. If you choose to create
            one (by signing in with a magic link to your email), you are
            responsible for the email address you provide. We will only ever
            email you a sign-in link or, if required, a notice about changes
            to this agreement or our privacy policy.
          </p>
          <p>
            You can delete your account at any time from Settings, or by
            emailing{" "}
            <a href="mailto:hello@contueri.com" style={{ color: "#8a6a3a" }}>
              hello@contueri.com
            </a>.
          </p>

          <Eyebrow>4. Contueri content</Eyebrow>
          <p>
            The artwork, writing, audio, and editorial content displayed in
            Contueri are either:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 8 }}>Created by Contueri (curator notes, editorial framing, prompts, journey structure) and are copyright Contueri</li>
            <li style={{ marginBottom: 8 }}>In the public domain (most artwork displayed in Contueri)</li>
            <li style={{ marginBottom: 8 }}>Licensed from third parties under terms permitting Contueri to display them</li>
          </ul>
          <p>
            You may not copy, redistribute, or reproduce Contueri-original
            content (curator notes, editorial writing, audio narration)
            without written permission. Public-domain works displayed in
            Contueri remain in the public domain; the curatorial framing
            around them does not.
          </p>

          <Eyebrow>5. Your content</Eyebrow>
          <p>
            You may write notes during Visio Divina sessions. Those notes are
            yours. We store them only so you can read them again on your
            devices. We will not display them publicly, sell them, or use
            them for any purpose other than displaying them back to you in
            the app.
          </p>
          <p>
            You grant us a limited, revocable license to store and display
            your notes only to you. You can delete them at any time. When you
            delete your account, your notes are deleted.
          </p>

          <Eyebrow>6. Free service</Eyebrow>
          <p>
            Contueri is free. We may, in the future, introduce optional paid
            features. If we do, we will notify you in advance and the core
            experience will remain accessible without payment. We will never
            put currently-free features behind a paywall without prior
            notice.
          </p>

          <Eyebrow>7. Termination</Eyebrow>
          <p>
            You can stop using Contueri at any time. We can suspend or
            terminate access to Contueri, with or without notice, if you
            violate these terms. We can discontinue any part of Contueri at
            any time; if we do so in a way that materially affects you, we
            will notify you and provide a way to export your data.
          </p>

          <Eyebrow>8. Warranties</Eyebrow>
          <p>
            Contueri is provided &ldquo;as is&rdquo; and &ldquo;as
            available.&rdquo; We do our best to keep it running, accurate,
            and beautiful, but we make no warranty that it will be
            uninterrupted, error-free, or suitable for any particular
            purpose. To the maximum extent permitted by law, we disclaim all
            implied warranties.
          </p>

          <Eyebrow>9. Limitation of liability</Eyebrow>
          <p>
            To the maximum extent permitted by law, Contueri and its
            operators shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising out of your
            use of Contueri. Our total liability for any direct damages will
            not exceed one hundred US dollars.
          </p>

          <Eyebrow>10. Indemnity</Eyebrow>
          <p>
            You agree to defend and hold harmless Contueri, its officers, and
            operators from any claim, demand, or expense arising from your
            use of Contueri in violation of these terms or applicable law.
          </p>

          <Eyebrow>11. Governing law</Eyebrow>
          <p>
            These terms are governed by the laws of{" "}
            <Placeholder>[STATE]</Placeholder>, United States, without regard
            to conflict-of-law principles. Any dispute must be brought in the
            state or federal courts located in{" "}
            <Placeholder>[COUNTY, STATE]</Placeholder>.
          </p>

          <Eyebrow>12. Changes</Eyebrow>
          <p>
            If we materially change these terms, we will notify you in-app on
            your next open. Continued use of Contueri after the change means
            you accept the new terms. If you do not accept them, you may
            close your account.
          </p>

          <Eyebrow>13. Contact</Eyebrow>
          <p>
            Questions, requests, anything:{" "}
            <a href="mailto:hello@contueri.com" style={{ color: "#8a6a3a" }}>
              hello@contueri.com
            </a>.
          </p>

          <div
            style={{
              marginTop: 48,
              paddingTop: 22,
              borderTop: "0.5px solid rgba(22,17,13,0.18)",
              fontSize: 12,
              color: "#978b7d",
              fontStyle: "italic",
            }}
          >
            Drafted May 20, 2026. Reviewed for Contueri rebrand June 3, 2026.
            Items shown in pink boxes must be filled before App Store
            submission.
          </div>

        </div>

      </div>
    </PageTransition>
  );
}
