"use client";

/**
 * Contueri · ExternalLinkInterceptor
 *
 * Catches clicks on external (cross-origin http/https) links anywhere
 * in the app and routes them through Capacitor's Browser plugin so
 * they open in an in-app SFSafariViewController overlay on iOS
 * (Android: Chrome Custom Tabs). The user stays inside Contueri and
 * dismisses the in-app browser with a Done button rather than being
 * kicked out to system Safari.
 *
 * Required for:
 *   - Apple App Store Review Guideline 4.5.4 (in-app browsing
 *     experience for external content)
 *   - Product principle: every external link is a potential break in
 *     the contemplative space. Keep the user grounded in Contueri.
 *
 * On web (mobile Safari, desktop) and inside Sanity Presentation
 * iframes the hook is a silent no-op — the dynamic `@capacitor/core`
 * import returns false from `isNativePlatform()` so no event handler
 * is even attached, and links work via the browser's normal behavior.
 *
 * What gets intercepted:
 *   - Any <a> with href that is `http://` or `https://` AND whose
 *     host differs from `window.location.host`
 *
 * What does NOT get intercepted (intentional fallthroughs):
 *   - Internal navigation (same host) — let Next.js client routing
 *     handle it
 *   - `mailto:`, `tel:`, `sms:`, `whatsapp:`, custom URL schemes —
 *     iOS native handlers open Mail / Phone / etc as users expect
 *   - Anchor links (`#section`) — same-page nav
 *   - Clicks with modifier keys (Cmd / Ctrl / Shift / middle-click)
 *     — desktop users expect "open in new tab" behavior to still work
 *   - `event.defaultPrevented` already true — some other handler has
 *     already claimed the click
 *   - `<a download>` — let the platform handle downloads (and our
 *     standing policy never auto-downloads regardless)
 */

import { useEffect } from "react";

const NATIVE_SCHEMES = new Set([
  "mailto:",
  "tel:",
  "sms:",
  "whatsapp:",
  "facetime:",
  "facetime-audio:",
  "skype:",
]);

export default function ExternalLinkInterceptor() {
  useEffect(() => {
    let cancelled = false;
    let detach: (() => void) | null = null;

    async function attach() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { Browser } = await import("@capacitor/browser");
        if (cancelled) return;

        const handler = async (event: MouseEvent) => {
          // Respect modifier keys: user wants new tab / window behavior.
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0 // not a primary click (1=middle, 2=right)
          ) {
            return;
          }

          // Already handled by something else (e.g., a router Link).
          if (event.defaultPrevented) return;

          // Find the nearest ancestor <a>. `closest` returns null for
          // non-Element targets (text nodes, etc.) — safe to bail.
          const target = event.target;
          if (!(target instanceof Element)) return;
          const anchor = target.closest("a");
          if (!anchor) return;

          // Skip if no href, anchor-only, or marked as a download.
          const rawHref = anchor.getAttribute("href");
          if (!rawHref || rawHref.startsWith("#")) return;
          if (anchor.hasAttribute("download")) return;

          // Resolve to an absolute URL relative to the current page
          // so relative paths and protocol-relative URLs both work.
          let url: URL;
          try {
            url = new URL(anchor.href);
          } catch {
            // Malformed href — let the browser handle / fail.
            return;
          }

          // Native-scheme links: let iOS handle (Mail, Phone, etc).
          // Browser.open would try to render these in
          // SFSafariViewController which doesn't support them.
          if (NATIVE_SCHEMES.has(url.protocol)) return;

          // Only intercept http/https.
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            return;
          }

          // Same-host: internal nav, let Next.js Link handle it.
          // We compare host (includes port if non-default) for safety.
          if (url.host === window.location.host) return;

          // External link — route through the Capacitor Browser plugin.
          event.preventDefault();
          try {
            await Browser.open({
              url: url.href,
              // presentationStyle "popover" gives a sheet-style modal
              // on iPhone (the standard SFSafariViewController
              // presentation). "fullscreen" is also available but
              // popover matches user expectations for in-app browsers.
              presentationStyle: "popover",
            });
          } catch {
            // Plugin call failed (rare). Fall back to letting iOS
            // handle the original click by opening the URL directly
            // — better than the link silently doing nothing.
            window.location.href = url.href;
          }
        };

        // Capture phase so we run BEFORE any element-level handlers
        // (which might call stopPropagation and prevent a bubbling
        // listener from seeing the event). False (bubble) would also
        // work for most cases — capture is the safer choice.
        document.addEventListener("click", handler, true);
        detach = () => document.removeEventListener("click", handler, true);
      } catch {
        // Capacitor / Browser plugin not available (web/dev). No-op.
      }
    }

    attach();

    return () => {
      cancelled = true;
      if (detach) detach();
    };
  }, []);

  return null;
}
