"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAmbientSound } from "./AmbientSoundProvider";

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
// MVP does NOT include the long-press popover (stretch goal). The
// button is purely a play/pause toggle; sound selection happens in
// Settings → SOUND. To get the user there in one tap, the button
// also wraps in a Link to /settings when there's no sound selected
// (the Off-hidden state's "discovery affordance") so first-time
// users have an obvious path. Once a sound is selected, the button
// becomes the play/pause toggle.
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

export default function AmbientFloatingButton() {
  const pathname = usePathname();
  const { selectedSound, isPlaying, isReady, toggle, markDiscoverySeen } =
    useAmbientSound();

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
        className="fixed z-40 flex items-center justify-center text-cream/85"
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

  // Sound is selected → render the play/pause toggle.
  return (
    <button
      type="button"
      onClick={() => {
        markDiscoverySeen();
        void toggle();
      }}
      aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
      aria-pressed={isPlaying}
      className="fixed z-40 flex items-center justify-center transition-colors"
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
  );
}
