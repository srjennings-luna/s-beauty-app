"use client";

/**
 * Contueri · NativeSplashController
 *
 * Programmatically dismisses the iOS native launch splash (the Mineral
 * Blue gradient + centered CONTUERI wordmark from
 * `assets/splash.png`) once React has mounted and painted the
 * destination page. Eliminates the parchment-flash that otherwise
 * appears between the native splash auto-dismiss and the SplashClient
 * (or PromptClient) painting its own background.
 *
 * Pairs with `capacitor.config.ts` SplashScreen plugin settings:
 *   - launchAutoHide: false   (native splash holds until JS hides it)
 *   - launchShowDuration: 0   (no fixed timeout, JS controls it)
 *
 * On web, mobile Safari, and Sanity Studio preview iframes, this is a
 * no-op — the dynamic `@capacitor/core` import returns false from
 * `isNativePlatform()` so the SplashScreen plugin is never called.
 *
 * Sequencing rationale (June 4, 2026 design call):
 *   1. iOS shows the static native splash from icon-tap.
 *   2. WKWebView fetches contueri.app and loads the page.
 *   3. React mounts. This controller mounts as one of the layout's
 *      client islands. Its useEffect fires after the first paint.
 *   4. We wait two requestAnimationFrame ticks to ensure the browser
 *      has actually committed at least one frame of React-rendered
 *      content to the screen, then call SplashScreen.hide() with a
 *      300ms fade. By the time the native splash starts fading, the
 *      React tree underneath has already painted — so the fade
 *      reveals real content, not the body's default parchment
 *      background.
 *
 * Why two rAF ticks instead of one: in practice, one rAF callback
 * fires *before* the browser commits the next frame to the screen. A
 * second rAF guarantees we're past at least one painted frame. This
 * is the standard pattern for "wait until rendered" in React without
 * pulling in heavier libraries.
 */

import { useEffect } from "react";

export default function NativeSplashController() {
  useEffect(() => {
    let cancelled = false;

    async function hideSplash() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { SplashScreen } = await import("@capacitor/splash-screen");

        // Wait for window.load — fires when ALL resources have
        // downloaded (HTML, CSS, fonts, images, scripts) AND React
        // has had time to hydrate the page-specific content
        // underneath the layout. Two rAF ticks after layout mount
        // wasn't enough: the layout components mount before the
        // actual page content (SplashClient, PromptClient) paints,
        // so hide() fired too early and the WebView's body bg
        // (parchment, per globals.css) briefly showed before the
        // page's espresso/gradient background painted.
        if (document.readyState !== "complete") {
          await new Promise<void>((resolve) => {
            const onLoad = () => resolve();
            window.addEventListener("load", onLoad, { once: true });
          });
        }
        if (cancelled) return;

        // Two rAF ticks after load to guarantee at least one painted
        // frame of the now-fully-loaded content.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        if (cancelled) return;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        if (cancelled) return;

        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch {
        // Plugin not available (web/dev). Silent no-op.
      }
    }

    hideSplash();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
