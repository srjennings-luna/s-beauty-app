import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Contueri · Next.js edge middleware
//
// Purpose: short-circuit first-time visitors at the edge so they land
// DIRECTLY on `/splash` instead of going through Today's render-then-
// redirect chain.
//
// Previously, cold launch flow for a first-time user was:
//   1. WebView loads `/`
//   2. Today (app/page.tsx) renders the espresso placeholder
//   3. Client useEffect reads localStorage → no onboarded flag
//   4. router.push("/splash")
//   5. /splash route loads (server render + Sanity fetch)
//   6. /splash renders
//
// Steps 2–4 add ~300–500ms of visible "Today placeholder + parchment
// nav strip" flicker before the redirect happens. NativeSplashController
// can hold the iOS native splash through it (June 5 fix) but the
// actual round-trip work still happens.
//
// With this middleware, the flow becomes:
//   1. WebView loads `/`
//   2. Edge middleware reads the `contueri-onboarded` cookie
//   3. Cookie absent → 307 redirect to `/splash` BEFORE any rendering
//   4. /splash loads + renders
//
// Returning (onboarded) users have the cookie set and pass straight
// through to Today.
//
// ── Cookie source ───────────────────────────────────────────────────
// The cookie is written by `lib/userData.ts:setOnboarded(true)` (which
// is called from SplashClient when the user taps the CTA or Skip).
// It mirrors the existing `contueri-onboarded` localStorage key so
// both surfaces stay in sync. localStorage is the iOS WebView fallback
// in case WKWebView's cookie store hiccups across cold launches.
//
// ── Iframe exemption ────────────────────────────────────────────────
// Sanity Presentation embeds the app in an iframe for visual editing.
// In that context we DON'T want middleware to redirect anywhere — the
// editor is loading a specific URL to preview, hijacking it to /splash
// breaks the editor. We detect iframe context via the `sec-fetch-dest`
// header, which Chrome/Safari set to `iframe` for sub-resource HTML
// requests inside frames. Bypass middleware entirely in that case.
//
// ── What's NOT matched ──────────────────────────────────────────────
// The matcher at the bottom restricts middleware to the bare root `/`.
// API routes, static assets, every other app route (/splash itself,
// /prompt, /journeys, /explore, /library, /pray, /settings, etc.) are
// not touched. That keeps middleware cost ≈ 0 for non-cold-launch
// traffic.

const ONBOARDED_COOKIE = "contueri-onboarded";

export function middleware(request: NextRequest) {
  // Skip in Sanity Presentation iframe / any iframe context.
  // sec-fetch-dest is sent by all modern browsers per the Fetch Metadata
  // Request Headers spec; iOS WKWebView includes it for resource fetches.
  const secFetchDest = request.headers.get("sec-fetch-dest");
  if (secFetchDest === "iframe") {
    return NextResponse.next();
  }

  // Defense in depth: also bail if the referer matches the Sanity Studio
  // host. Belt-and-braces because some embedded contexts may not set
  // sec-fetch-dest consistently.
  const referer = request.headers.get("referer") ?? "";
  if (
    referer.includes("sanity.io") ||
    referer.includes("seeking-beauty.sanity.studio") ||
    referer.includes(".sanity.studio")
  ) {
    return NextResponse.next();
  }

  const onboardedCookie = request.cookies.get(ONBOARDED_COOKIE);
  const isOnboarded =
    onboardedCookie?.value === "true" || onboardedCookie?.value === "1";

  if (isOnboarded) {
    return NextResponse.next();
  }

  // Redirect to /splash. Use 307 (temporary) rather than 308 (permanent)
  // so browsers / WebView don't aggressively cache the redirect and a
  // re-completion of onboarding flips the user back to / cleanly.
  const url = request.nextUrl.clone();
  url.pathname = "/splash";
  return NextResponse.redirect(url, 307);
}

// Run only on the bare root. Every other path passes through without
// middleware overhead. Static assets, API routes, and other app routes
// are excluded automatically by Next.js's default matcher behavior, and
// the explicit `/` here makes the intent obvious.
export const config = {
  matcher: ["/"],
};
