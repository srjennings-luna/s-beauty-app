"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAmbientSound } from "./AmbientSoundProvider";
import AmbientQuickPicker from "./AmbientQuickPicker";

// Contueri · AmbientFloatingButton
//
// Three-state floating button per the MVP scope of
// CONTUERI-CC-Ambient-Sound-Brief.html:
//
//   Playing    — round, espresso surface, white play indicator solid;
//                tap pauses.
//   Paused     — round, espresso surface, dimmed play triangle;
//                tap resumes.
//   Off-hidden — no button at all; user has never selected a sound,
//                or has selected "off" via Settings.
//
// Position (locked spec, do not edit without re-reading the brief):
//   bottom: calc(env(safe-area-inset-bottom, 0px) + 64px)
//   right:  16px
//
// 64px lifts the button above the bottom Navigation (which sits at
// bottom: 0 with a height of ~64px) on the parchment / espresso
// dual-mode surfaces. On Visio Divina and other Navigation-hidden
// surfaces the button still works — it just floats higher above the
// screen edge than strictly needed, which is the right tradeoff for
// a single global control.
//
// Long-press quick picker (added June 6, 2026):
//   When a sound is already selected, holding the button for ~450ms
//   opens AmbientQuickPicker — a small espresso popover anchored above
//   the button with the same Off + 6-sound list as Settings. Lets the
//   user switch sounds without detouring through Settings. The tap
//   that follows the long-press is suppressed so the popover isn't
//   instantly torn down by an unintended play/pause toggle.
//
//   In the "no sound selected" state we keep the original Link → Settings
//   behaviour. The Link routes the user to the canonical picker (which
//   doubles as the discovery surface), and we don't try to make a Link
//   long-pressable. Once they've picked a sound the long-press shortcut
//   takes over.
//
// Surfaces where the button is hidden:
//   - /splash (onboarding)
//   - inside Sanity Presentation iframe (handled by provider)
//   - any future "fully immersive" surface where chrome should
//     disappear
//
// Reduced-motion respect: the button uses no animations that need
// disabling (a CSS color transition only), so we don't need a
// prefers-reduced-motion query here. The discovery pulse — which IS
// motion — is v1.1.

const HIDE_ON_PATHS = ["/splash"];
const LONG_PRESS_MS = 450;

export default function AmbientFloatingButton() {
  const pathname = usePathname();
  const { selectedSound, isPlaying, isReady, toggle, markDiscoverySeen } =
    useAmbientSound();

  // Quick-picker state. The two refs coordinate long-press vs tap:
  //   - longPressTimerRef holds the setTimeout id while pointer is down
  //   - longPressFiredRef is true if the timer reached its deadline
  //     before pointerup — in that case the onClick that follows
  //     should be swallowed (the picker is the action, not the toggle).
  const [pickerOpen, setPickerOpen] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);

  // Dismiss the picker on any route change so it doesn't linger across
  // navigation. Pathname change is the trigger; the picker also closes
  // itself on outside-tap / Escape internally.
  useEffect(() => {
    setPickerOpen(false);
  }, [pathname]);

  // Cleanup any pending long-press timer on unmount (defensive — usually
  // pointerup clears it, but if the component unmounts mid-press we
  // don't want the timer firing into a stale closure).
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };
  }, []);

  const startLongPress = useCallback(() => {
    longPressFiredRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      longPressTimerRef.current = null;
      markDiscoverySeen();
      setPickerOpen(true);
      // Haptic "tick" on iOS the moment the long-press deadline fires.
      // Gives users physical confirmation the gesture registered —
      // important for a long-press because there's no other immediate
      // feedback until the popover finishes appearing. Dynamic import
      // so web / SSR / haptic-less devices fall through to a silent
      // no-op rather than crashing.
      void (async () => {
        try {
          const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch {
          /* plugin unavailable (web preview, older device, or sync not run) — silent no-op */
        }
      })();
    }, LONG_PRESS_MS);
  }, [markDiscoverySeen]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTapClick = useCallback(() => {
    // If the long-press timer fired before pointerup, the gesture was
    // a hold — the picker is now open, and the synthetic click that
    // follows pointerup should NOT also toggle play/pause.
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    markDiscoverySeen();
    void toggle();
  }, [markDiscoverySeen, toggle]);

  // Hide during onboarding, before prefs hydrate, or when in a
  // route that should stay chrome-free.
  if (!isReady) return null;
  if (HIDE_ON_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  // No sound selected → render an entry-point button that routes to
  // Settings → SOUND section so the user can pick. This is the MVP
  // alternative to the brief's "First-launch discovery pulse" state.
  if (!selectedSound) {
    return (
      <Link
        href="/settings#sound"
        onClick={() => markDiscoverySeen()}
        aria-label="Choose an ambient sound"
        className="fixed z-[70] flex items-center justify-center text-cream/85"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 64px)",
          right: 16,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(22,17,13,0.92)",
          border: "1px solid rgba(253,246,232,0.18)",
          color: "rgba(253,246,232,0.7)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        }}
      >
        {/* Speaker / musical-note glyph indicating "pick a sound" */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          width={22}
          height={22}
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </Link>
    );
  }

  // Sound is selected → render the play/pause toggle with long-press
  // → quick picker layered on top.
  return (
    <>
      <button
        type="button"
        onClick={handleTapClick}
        onPointerDown={startLongPress}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onPointerLeave={cancelLongPress}
        aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
        aria-pressed={isPlaying}
        aria-haspopup="menu"
        aria-expanded={pickerOpen}
        className="fixed z-[70] flex items-center justify-center transition-colors select-none"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 64px)",
          right: 16,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "rgba(22,17,13,0.92)",
          border: "1px solid rgba(253,246,232,0.18)",
          color: isPlaying ? "rgba(253,246,232,0.95)" : "rgba(253,246,232,0.6)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          // Disable iOS Safari's long-press magnifier / callout on this control
          // so the gesture lands as our handler instead of the system selection
          // UI. WebkitTouchCallout works on iOS; webkitUserSelect blocks the
          // selection that triggers the menu in the first place.
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
        }}
      >
        {isPlaying ? (
          // Pause: two thick vertical bars
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width={20}
            height={20}
          >
            <rect x="7" y="5" width="4" height="14" rx="0.5" />
            <rect x="13" y="5" width="4" height="14" rx="0.5" />
          </svg>
        ) : (
          // Play: right-facing triangle
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width={22}
            height={22}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <AmbientQuickPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
