import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor configuration for the Contueri iOS app.
//
// Per the v1.0 Launch Plan: Capacitor 8 with the LIVE-URL approach.
// The iOS shell loads contueri.app (Vercel-hosted Next.js) inside a
// WKWebView instead of bundling a static export. Downloads, push
// notifications, and lockscreen audio carry the "more than a website"
// weight required for Apple Review Guideline 4.2.
//
// Bundle ID locked in DEV-01 (Apple Developer Individual enrollment).
// Update this if Sheri ever migrates to Organization enrollment under
// the Contueri legal entity.
//
// This file exists BEFORE Capacitor scaffolds because `npx cap init`
// would otherwise prompt for these values interactively in W1. With
// this file in place, the W1 agent runs `npx cap init --skip-prompt`
// (or uses --confirm flags) and lands on a deterministic config.

const config: CapacitorConfig = {
  appId: "app.contueri.ios",
  appName: "Contueri",

  // Capacitor requires webDir even with the live URL approach because
  // tooling expects a fallback path. Point at the standard Next.js
  // export target so a static fallback works if the live URL is
  // unreachable. The actual production app fetches from server.url.
  webDir: "out",

  // Live URL configuration. iOS WKWebView fetches the entire app from
  // contueri.app on launch.
  //
  // iosScheme MUST be https for App Store production. Localhost is
  // strictly for local development; never ship with cleartext.
  //
  // allowNavigation is empty so the WebView cannot redirect to
  // arbitrary external domains; specific cross-domain calls (Sanity
  // image CDN, OneSignal API, etc.) are handled via plain fetch.
  // Capacitor's external link handler (SFSafariViewController)
  // intercepts non-allowlisted navigation.
  server: {
    url: "https://contueri.app",
    iosScheme: "https",
    cleartext: false,
    androidScheme: "https",
    allowNavigation: [],
  },

  ios: {
    // Bridges the iOS safe area into the WebView so the existing CSS
    // env(safe-area-inset-*) rules (used throughout the app for the
    // P&P chrome, Settings nav, etc.) behave the same as in mobile
    // Safari. "automatic" lets iOS manage top/bottom inset based on
    // the keyboard state.
    contentInset: "automatic",

    // Custom URL scheme for deep links (e.g. contueri://prompt/2026-06-03
    // could open a specific P&P). Final scheme also gets registered
    // as an associated domain for Universal Links in W3 once the
    // apple-app-site-association file is hosted at contueri.app.
    scheme: "contueri",

    // Audio session category. "playback" allows ambient + Auditio to
    // play with the screen locked and in background, including when
    // the device ring/silent switch is set to silent. Required for
    // the Auditio + ambient sound system to work as designed.
    // limitsNavigationsToAppBoundDomains is unset; leave defaults.
    backgroundColor: "#16110d",
  },

  // Native plugin configuration. Plugins themselves are installed via
  // npm in W2 (OneSignal, Filesystem, etc.). The block stays here
  // empty for W1 scaffold; W2 adds plugin-specific blocks as needed.
  plugins: {
    SplashScreen: {
      // Splash screen behavior on cold app launch. Mineral Blue
      // gradient master + centered CONTUERI wordmark. Background tone
      // matches the in-app `/splash` route (Sacred Art Mineral Blue)
      // so the native → in-app handoff reads as one continuous blue
      // moment.
      //
      // June 4, 2026 — JS-controlled hide:
      // The native splash holds open until React has mounted and
      // painted the destination page; `NativeSplashController` then
      // calls `SplashScreen.hide({ fadeOutDuration: 300 })`. This
      // eliminates the parchment-flash that previously appeared
      // between native splash auto-dismiss and React paint (the
      // WebView's HTML body background defaults to parchment per
      // globals.css; with auto-hide off, the splash holds across
      // that gap).
      //
      // - launchAutoHide: false → splash never auto-dismisses on
      //   the timer; JS alone controls the hide moment.
      // - launchShowDuration: 30000 → 30-second fallback. Capacitor
      //   8 has a subtlety where `launchShowDuration: 0` combined
      //   with `launchAutoHide: false` can still cause the splash to
      //   dismiss when the WebView's page-load event fires
      //   (regardless of launchAutoHide). Setting a long duration
      //   ensures the splash stays visible until JS explicitly
      //   hides it via SplashScreen.hide() — typically within ~500ms
      //   of layout mount, far less than 30s.
      // - launchFadeOutDuration: 300 → kept as the fade duration
      //   passed to hide().
      // - backgroundColor: "#5a7a8a" → Mineral Blue dominant blend
      //   tone, applied to any letterbox slivers iOS shows outside
      //   the splash image.
      launchShowDuration: 30000,
      launchAutoHide: false,
      launchFadeOutDuration: 300,
      backgroundColor: "#5a7a8a",
      // Splash image asset paths populated in W1 once
      // @capacitor/assets generates the splash variants from the
      // single 1024x1024 wordmark source. Until then, default
      // Capacitor splash renders.
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#7a9a8a",
    },
    StatusBar: {
      // Status bar style flips per surface in the app via
      // components/native/StatusBarController.tsx:
      //   espresso surfaces (Today /, /prompt, /pray, journey day,
      //     /splash) -> LIGHT icons on espresso bg
      //   parchment surfaces (Settings, Privacy, Terms, Explore,
      //     Library, Journeys list) -> DARK icons on parchment bg
      //
      // Default at cold launch is LIGHT icons on espresso. Reasoning:
      // 99% of cold-launch routes are espresso surfaces. New users
      // go / -> /splash, both espresso. Returning users land on /
      // (PromptClient, espresso). The previous default (DARK icons
      // on parchment) caused a brief parchment strip flash across
      // the top of the screen during cold launch — visible as a
      // cream bar at the top of Sheri's June 4 Simulator recording
      // — before StatusBarController ran and swapped to espresso.
      // Espresso default eliminates that flash. Parchment routes
      // (rarely entered as cold launch destinations) get the swap
      // via StatusBarController.
      style: "LIGHT",
      backgroundColor: "#16110d",
      overlaysWebView: false,
    },
    Keyboard: {
      // Lets the WebView resize on keyboard show so the Settings
      // notification time pickers and Visio Divina note textarea
      // do not get covered. Standard behavior for text-input-heavy
      // contemplative apps.
      resize: "native",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
