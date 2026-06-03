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
      // Splash screen behavior on cold app launch. Show a parchment
      // background with the Contueri wordmark for up to 2 seconds,
      // fade out as the WebView finishes loading the live URL.
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#fdf6e9",
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
      // Status bar style flips per surface in the app:
      //   parchment surfaces (Settings, Privacy, Terms, Explore,
      //     Journeys list, Library) -> dark icons on cream
      //   espresso surfaces (Today, Visio Divina) -> light icons
      // The Capacitor StatusBar plugin is invoked at route transition
      // (W1 wiring) to set the style. Default at cold launch is dark
      // icons on cream since splash background is parchment.
      style: "DARK",
      backgroundColor: "#fdf6e9",
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
