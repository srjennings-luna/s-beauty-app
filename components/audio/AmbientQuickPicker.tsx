"use client";

import { useEffect, useRef } from "react";
import { useAmbientSound } from "./AmbientSoundProvider";
import { AMBIENT_SOUNDS, type AmbientSoundId } from "@/lib/userData";

// Contueri · AmbientQuickPicker
//
// Long-press popover for the floating ambient button — the stretch
// goal called out in CONTUERI-CC-Ambient-Sound-Brief.html section "MVP
// scope notes" (Provider) and section "Surfaces" (button). Built June
// 6, 2026 once the MVP shipped and we still had submission-week runway.
//
// UX intent:
//   - User holds the floating button ~450ms → this popover appears
//     anchored just above the button.
//   - Tap any row → switches sound + starts playback + dismisses.
//   - Tap outside / press Escape / route change → dismisses.
//
// Why a separate component (not inlined in AmbientFloatingButton):
//   The button file is already managing the play/pause toggle, the
//   "no sound" entry point, and now long-press detection. Splitting
//   the popover out keeps each file focused on one concern and lets
//   the picker grow (volume slider, future modes) without ballooning
//   the button.
//
// Positioning:
//   Same anchor as the button (right: 16, bottom: safe-inset + 64) but
//   lifted up by (button-height 52 + gap 12) so it sits just above the
//   button. Width 200 fits the longest label ("Gregorian Chant") with
//   breathing room at 14px and leaves the corner anchor untouched.
//
// z-index parity with the button (z-40). Both sit above page content
// but below the bottom Navigation (z-50). They don't visually overlap
// the nav so the lower z-index is fine.

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AmbientQuickPicker({ open, onClose }: Props) {
  const { selectedSound, selectSound, play, pause, volume, setVolume } =
    useAmbientSound();
  const rootRef = useRef<HTMLDivElement>(null);
  const volumePercent = Math.round(volume * 100);

  // Dismiss on outside-tap, outside-click, or Escape.
  //
  // The setTimeout(0) defer matters: when long-press fires, the
  // pointer/touch is still down on the floating button. If we attach
  // the outside-click handler synchronously the very next pointerup
  // bubbles to document and immediately closes the popover we just
  // opened. Deferring one tick lets the gesture complete before we
  // start listening.
  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (!rootRef.current) return;
      const target = e.target as Node | null;
      if (target && !rootRef.current.contains(target)) {
        onClose();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const t = setTimeout(() => {
      window.addEventListener("mousedown", onOutside);
      window.addEventListener("touchstart", onOutside, { passive: true });
      window.addEventListener("keydown", onKey);
    }, 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousedown", onOutside);
      window.removeEventListener("touchstart", onOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSelect(id: AmbientSoundId | null) {
    selectSound(id);
    if (id === null) {
      pause();
    } else {
      // Tick so the provider's `selectedSound` effect can swap the
      // <audio> src before we call play(). Without the tick, play()
      // races the src write and the browser plays the old sound's
      // last buffered frame before swapping.
      setTimeout(() => {
        void play();
      }, 0);
    }
    onClose();
  }

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-label="Choose ambient sound"
      className="fixed z-40 flex flex-col"
      style={{
        // bottom anchor = same as button + button height (52) + 12 gap.
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 64px + 64px)",
        right: 16,
        width: 200,
        background: "rgba(22,17,13,0.96)",
        border: "1px solid rgba(253,246,232,0.18)",
        borderRadius: 14,
        boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
        overflow: "hidden",
        // Cap height + scroll if future sounds push past viewport.
        maxHeight: "60vh",
        overflowY: "auto",
      }}
    >
      <PickerRow
        label="Off"
        selected={selectedSound === null}
        onSelect={() => handleSelect(null)}
      />
      {AMBIENT_SOUNDS.map((s) => (
        <PickerRow
          key={s.id}
          label={s.label}
          selected={selectedSound === s.id}
          onSelect={() => handleSelect(s.id)}
        />
      ))}

      {/* Volume slider — added June 6, 2026 per the "mix level" rationale
          discussed during the long-press design pass. Ambient sound runs
          underneath other activities (reading, walking, prayer) so users
          adjust the level frequently based on context; routing them out
          to Settings every time would feel heavy. The Calm / Headspace
          pattern is the precedent: small floating control for state,
          expanded surface for mixing.

          Disabled when "Off" is selected since there's nothing to set
          the volume of. The setVolume call goes through the same
          debounced provider setter the Settings slider uses, so storage
          writes don't thrash while dragging. */}
      <div
        style={{
          borderTop: "1px solid rgba(253,246,232,0.10)",
          padding: "10px 12px 12px",
        }}
      >
        <div className="flex items-baseline justify-between mb-2">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "rgba(253,246,232,0.55)" }}
          >
            Volume
          </span>
          <span
            className="text-xs tabular-nums"
            style={{
              color:
                selectedSound === null
                  ? "rgba(253,246,232,0.30)"
                  : "rgba(253,246,232,0.80)",
            }}
          >
            {volumePercent}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={volumePercent}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          disabled={selectedSound === null}
          aria-label="Ambient sound volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={volumePercent}
          // Stop pointerdown from bubbling to the document outside-click
          // handler — dragging the slider would otherwise be read as an
          // outside-tap and dismiss the popover mid-drag.
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full h-1.5 appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: "rgba(253,246,232,0.18)",
            outline: "none",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

function PickerRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onSelect}
      className="w-full flex items-center justify-between text-left transition-colors"
      style={{
        padding: "10px 12px",
        color: selected ? "rgba(253,246,232,0.95)" : "rgba(253,246,232,0.7)",
        background: selected ? "rgba(74,122,98,0.18)" : "transparent",
        borderLeft: selected
          ? "3px solid var(--color-sage, #4a7a62)"
          : "3px solid transparent",
      }}
    >
      <span className="text-sm" style={{ fontWeight: selected ? 600 : 400 }}>
        {label}
      </span>
      {selected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          width={14}
          height={14}
          aria-hidden
          style={{ color: "var(--color-sage, #4a7a62)" }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
