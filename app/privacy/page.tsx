import Link from "next/link";
import PageTransition from "@/components/ui/PageTransition";

// Privacy Policy page (/privacy).
//
// Source content: ~/Documents/KALLOS Launch/KALLOS-Privacy-Policy-Draft.html
// (draft prepared May 20, 2026; Contueri rebrand applied here).
//
// Required for App Store submission. App Store Connect won't accept
// submission without a working Privacy URL.
//
// LEGAL PLACEHOLDERS still in this file (marked .legal-placeholder
// in the CSS). These MUST be filled before App Store submission:
//   - [LEGAL ENTITY NAME]: e.g. "Sheri Jennings" if Individual
//     enrollment on Apple Dev; or "Sheri Jennings dba Contueri" once
//     the DBA is filed
//   - [STATE/JURISDICTION]: the US state Sheri files her business in
//   - [LAUNCH DATE]: the effective date when this policy goes live
//
// Drafted by counsel-adjacent voice. Review with qualified counsel
// before publishing (per Sheri's standing rule on legal docs).
//
// Server component (no "use client"). Pure content; prerendered at build.

export const metadata = {
  title: "Privacy Policy | Contueri",
  description: "How Contueri handles your information.",
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

export default function PrivacyPage() {
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
              Privacy Policy
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
            Contueri is a contemplative discovery app made for the curious
            seeker. We collect as little information as we possibly can, and
            we never sell, rent, or share your data with advertisers. This
            policy explains exactly what we do collect, why, and how to
            remove it.
          </p>

          <Eyebrow>Who we are</Eyebrow>
          <p>
            Contueri is operated by <Placeholder>[LEGAL ENTITY NAME]</Placeholder>,
            located in <Placeholder>[STATE/JURISDICTION]</Placeholder>,
            United States. For privacy questions, contact{" "}
            <a href="mailto:privacy@contueri.com" style={{ color: "#8a6a3a" }}>
              privacy@contueri.com
            </a>.
          </p>

          <Eyebrow>What we collect, and why</Eyebrow>
          <p>
            We collect three categories of information, and only what is
            necessary for Contueri to function.
          </p>
          <p>
            <strong style={{ color: "#16110d" }}>1. Account information.</strong>{" "}
            If you choose to sign in for cross-device sync, we collect your
            email address. We use it for one purpose: sending you a sign-in
            link. We do not send marketing emails. We do not share your
            address with anyone.
          </p>
          <p>
            <strong style={{ color: "#16110d" }}>2. Your in-app activity.</strong>{" "}
            When you sign in, the following information is stored so you can
            pick up where you left off on any device:
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 8 }}>Which prompts and content you have marked as favorite</li>
            <li style={{ marginBottom: 8 }}>Which journey days you have completed</li>
            <li style={{ marginBottom: 8 }}>Your daily streak</li>
            <li style={{ marginBottom: 8 }}>Notes you have written during Visio Divina sessions</li>
            <li style={{ marginBottom: 8 }}>Your notification preferences and chosen times</li>
            <li style={{ marginBottom: 8 }}>Your ambient sound preference and volume</li>
          </ul>
          <p>
            If you use Contueri without signing in, this same information is
            stored only on your device and is not transmitted to our servers.
          </p>
          <p>
            <strong style={{ color: "#16110d" }}>3. Push notification token.</strong>{" "}
            If you turn on notifications, your device generates an anonymous
            token that we use to deliver the notifications you have asked for.
            The token does not identify you personally; if you turn
            notifications off, the token is deleted.
          </p>

          <Eyebrow>What we do not collect</Eyebrow>
          <p>Contueri does not:</p>
          <ul style={{ paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 8 }}>Use any third-party analytics, tracking pixels, or advertising SDKs</li>
            <li style={{ marginBottom: 8 }}>Share your data with advertisers, brokers, or any third party for marketing</li>
            <li style={{ marginBottom: 8 }}>Build a behavioral profile of you</li>
            <li style={{ marginBottom: 8 }}>Sell your data to anyone, ever</li>
            <li style={{ marginBottom: 8 }}>Use cookies for tracking (only for keeping you signed in)</li>
            <li style={{ marginBottom: 8 }}>Track your location</li>
            <li style={{ marginBottom: 8 }}>Access your camera, microphone, contacts, calendar, or health data</li>
          </ul>

          <Eyebrow>Service providers we use</Eyebrow>
          <p>
            We use a small number of trusted services to run Contueri. Each is
            bound by its own privacy obligations. We have chosen providers
            known for strong privacy practices.
          </p>
          <ul style={{ paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>Supabase</strong>: stores your account and activity.{" "}
              <a href="https://supabase.com/privacy" style={{ color: "#8a6a3a" }}>supabase.com/privacy</a>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>Resend</strong>: delivers your sign-in link emails.{" "}
              <a href="https://resend.com/legal/privacy-policy" style={{ color: "#8a6a3a" }}>resend.com/legal/privacy-policy</a>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>Vercel</strong>: hosts the Contueri app.{" "}
              <a href="https://vercel.com/legal/privacy-policy" style={{ color: "#8a6a3a" }}>vercel.com/legal/privacy-policy</a>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>Sanity</strong>: stores the content (artwork, prompts, journeys) that Contueri displays.{" "}
              <a href="https://www.sanity.io/legal/privacy" style={{ color: "#8a6a3a" }}>sanity.io/legal/privacy</a>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>OneSignal</strong>: delivers push notifications.{" "}
              <a href="https://onesignal.com/privacy_policy" style={{ color: "#8a6a3a" }}>onesignal.com/privacy_policy</a>
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>Apple Push Notification Service</strong>: routes notifications to your iOS device.
            </li>
          </ul>

          <Eyebrow>The Contueri Mail subscription (separate service)</Eyebrow>
          <p>
            If you subscribe to Contueri Mail, the monthly physical mail
            offering, that purchase happens on{" "}
            <a href="https://contueri.com/mail" style={{ color: "#8a6a3a" }}>contueri.com/mail</a>{" "}
            and is handled by Stripe. The mail business stores your shipping
            address and payment method. The app and the mail subscription are
            separate services with separate privacy practices. Subscribing to
            one does not require the other.
          </p>

          <Eyebrow>How long we keep your data</Eyebrow>
          <p>
            We keep your account information for as long as you have an
            account. If you delete your account, all your data is erased
            within 30 days. Backups are rotated out within 90 days.
          </p>

          <Eyebrow>Your rights</Eyebrow>
          <p>Regardless of where you live, you can:</p>
          <ul style={{ paddingLeft: 24, marginBottom: 14 }}>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>See what we have.</strong>{" "}
              Email us and we will send you a copy of your data.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>Correct it.</strong>{" "}
              Email us and we will fix anything that is wrong.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>Delete it.</strong>{" "}
              Email us, or use the Delete Account option in Settings, and we
              will remove your data within 30 days.
            </li>
            <li style={{ marginBottom: 8 }}>
              <strong style={{ color: "#16110d" }}>Object to anything we do with it.</strong>{" "}
              Email us and we will discuss.
            </li>
          </ul>
          <p>
            For users in the European Economic Area, the United Kingdom, or
            California, you have additional rights under GDPR, UK GDPR, and
            the CCPA respectively. Email us to exercise any of them. We do not
            sell personal information, so the CCPA right to opt out of sale is
            automatically respected.
          </p>

          <Eyebrow>Children</Eyebrow>
          <p>
            Contueri is not directed to children under 13. We do not knowingly
            collect information from anyone under 13. If you believe a child
            has provided us with personal information, please email us and we
            will delete it.
          </p>

          <Eyebrow>Security</Eyebrow>
          <p>
            We use HTTPS everywhere, encrypted database storage, and
            industry-standard authentication. No system is perfectly secure,
            but we apply the same care to protecting your information that we
            apply to the rest of Contueri.
          </p>

          <Eyebrow>Changes to this policy</Eyebrow>
          <p>
            If we change this policy in any meaningful way, we will notify you
            in-app the next time you open Contueri. The effective date at the
            top will always reflect the most recent revision.
          </p>

          <Eyebrow>Contact</Eyebrow>
          <p>
            For any privacy question or request:{" "}
            <a href="mailto:privacy@contueri.com" style={{ color: "#8a6a3a" }}>
              privacy@contueri.com
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
