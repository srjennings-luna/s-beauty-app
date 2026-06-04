"use client";

/**
 * Contueri · StatusBarController
 *
 * Updates the iOS status bar style + background color to match the
 * current route's surface — espresso surfaces get LIGHT icons,
 * parchment surfaces get DARK icons. Re-fires on route change via
 * Next.js `usePathname`.
 *
 * Surface inventory (per the June 3 mockup + sign-off):
 *
 *   ESPRESSO surfaces (light icons, espresso bg):
 *     /                                         Today (renders PromptClient)
 *     /prompt, /prompt/[date]                   Pause & Ponder
 *     /pray/[artworkId]                         Visio Divina
 *     /journeys/[slug]/day/[dayNumber]          Journey Day stepper
 *     /splash                                   In-app onboarding (Mineral Blue gradient)
 *
 *   PARCHMENT surfaces (dark icons, parchment bg) — everything else:
 *     /explore, /library, /library/saved
 *     /journeys, /journeys/[slug]               (the list + detail, NOT day)
 *     /settings, /settings/notifications
 *     /privacy, /terms
 *     anything not explicitly espresso
 *
 * Capacitor `Style` naming is inverted from what you'd intuit:
 *   Style.Light = LIGHT CONTENT (icons) on a DARK background
 *   Style.Dark  = DARK CONTENT (icons) on a LIGHT background
 * The single constant ROUTE_STYLE_MAP below resolves a pathname to
 * the correct Style + color tuple so the inversion lives in one
 * place.
 *
 * On web / Studio iframe, `Capacitor.isNativePlatform()` returns
 * false and this is a silent no-op.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Returns true if the pathname renders an espresso-mode surface.
 * Order matters: more-specific prefixes checked before broader ones
 * so e.g. `/journeys/x/day/1` matches espresso even though
 * `/journeys/...` also matches the parchment-by-default branch.
 */
function isEspressoRoute(pathname: string): boolean {
  // Exact-match routes
  if (pathname === "/") return true; // Today landing = PromptClient
  if (pathname === "/prompt") return true;
  if (pathname === "/splash") return true;

  // Prefix-match routes
  if (pathname.startsWith("/prompt/")) return true; // /prompt/[date]
  if (pathname.startsWith("/pray/")) return true; // /pray/[artworkId]

  // Journey day = espresso; journey list (/journeys) + detail
  // (/journeys/[slug]) = parchment. Match only when /day/ segment
  // appears.
  if (/^\/journeys\/[^/]+\/day\//.test(pathname)) return true;

  // Default: parchment
  return false;
}

const ESPRESSO_HEX = "#16110d";
const PARCHMENT_HEX = "#fdf6e9";

export default function StatusBarController() {
  const pathname = usePathname();

  useEffect(() => {
    async function updateStatusBar() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { StatusBar, Style } = await import("@capacitor/status-bar");

        const espresso = isEspressoRoute(pathname);
        const style = espresso ? Style.Light : Style.Dark;
        const backgroundColor = espresso ? ESPRESSO_HEX : PARCHMENT_HEX;

        // Order matters: setBackgroundColor first so the bar's
        // background lands before iOS animates the icon-color flip.
        // Both calls are awaited so any error propagates to the
        // catch block (where we silently swallow it).
        await StatusBar.setBackgroundColor({ color: backgroundColor });
        await StatusBar.setStyle({ style });
      } catch {
        // Plugin not available (web/dev). Silent no-op.
      }
    }

    updateStatusBar();
  }, [pathname]);

  return null;
}
