"use client";

import { useAmbientSound } from "./AmbientSoundProvider";
import { AMBIENT_SOUNDS, type AmbientSoundId } from "@/lib/userData";

// Contueri · AmbientSettingsSection
//
// Renders the SOUND section inside /settings per Section 6 of
// CONTUERI-CC-Ambient-Sound-Brief.html (MVP: inline picker + simple
// slider — arc dial is v1.1).
//
// Layout:
//   ┌─ SOUND  ────────────────────────────────────────────────┐
//   │  ╭─ Off ─────────────────────────────────────────────╮  │
//   │  │  Off                                              │  │
//   │  ╰───────────────────────────────────────────────────╯  │
//   │  ╭─ Gregorian Chant ─────────────────────────────────╮  │
//   │  │  Gregorian Chant                            ✓ sage│  │
//   │  ╰───────────────────────────────────────────────────╯  │
//   │  ... (one row per sound in AMBIENT_SOUNDS order)        │
//   │                                                          │
//   │  VOLUME                                              60% │
//   │  ──────────●──────────                                   │
//   │                                                          │
//   │  Tap any row to select. Selection previews immediately.  │
//   └──────────────────────────────────────────────────────────┘
//
// Tap a row → selectSound(id) + play() so the user hears the choice
// immediately. Tap "Off" → selectSound(null) and pause. Volume slider
// uses the hook's debounced setter under the hood (200ms trailing) so
// dragging doesn't thrash localStorage.

export default function AmbientSettingsSection() {
  const {
    selectedSound,
    volume,
    isPlaying,
    selectSound,
    play,
    pause,
    setVolume,
  } = useAmbientSound();

  const handleSelectSound = async (id: AmbientSoundId | null) => {
    selectSound(id);
    if (id === null) {
      pause();
    } else {
      // Wait a tick for the provider's effect to swap audio src, then play.
      // Play() handles src setup if needed.
      setTimeout(() => {
        void play();
      }, 0);
    }
  };

  const volumePercent = Math.round(volume * 100);

  return (
    <section id="sound" aria-labelledby="sound-section-label">
      {/* Section header — matches the SectionLabel pattern in
          app/settings/page.tsx (Montserrat sage caps + bottom hairline).
          Inlined here so this component can mount anywhere without
          dragging the SectionLabel definition along. */}
      <div
        id="sound-section-label"
        className="text-[11px] font-semibold tracking-widest uppercase pt-6 pb-3 px-4"
        style={{ color: "var(--color-sage, #4a7a62)" }}
      >
        Sound
      </div>

      {/* Picker rows. "Off" first so users can always quiet the system,
          then the 6 sounds in their canonical order. */}
      <div className="border-t border-b border-espresso/10">
        <SoundRow
          label="Off"
          selected={selectedSound === null}
          onSelect={() => handleSelectSound(null)}
        />
        {AMBIENT_SOUNDS.map((s) => (
          <SoundRow
            key={s.id}
            label={s.label}
            selected={selectedSound === s.id}
            onSelect={() => handleSelectSound(s.id)}
          />
        ))}
      </div>

      {/* Volume label + slider. Disabled when nothing is selected, since
          there's nothing to set the volume of. */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "var(--color-sage-muted, #7a9a8a)" }}
          >
            Volume
          </span>
          <span
            className="text-xs tabular-nums"
            style={{
              color: selectedSound
                ? "var(--color-accent-gold, #C19B5F)"
                : "rgba(22,17,13,0.35)",
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
          className="w-full h-2 appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: "rgba(22,17,13,0.15)",
            outline: "none",
          }}
        />
      </div>

      {/* Footer instructions — faint cream-on-parchment matching the
          help-text pattern used elsewhere in Settings. */}
      <div className="px-4 pb-6">
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: "rgba(22,17,13,0.5)" }}
        >
          Tap any row to select. Selection previews immediately. Drag
          the slider to set the volume.
          {isPlaying ? " Playing now." : ""}
        </p>
      </div>
    </section>
  );
}

function SoundRow({
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
      onClick={onSelect}
      aria-pressed={selected}
      className="w-full flex items-center justify-between px-4 py-3 text-left border-l-[3px] transition-colors"
      style={{
        background: selected ? "rgba(74,122,98,0.08)" : "transparent",
        borderLeftColor: selected
          ? "var(--color-sage, #4a7a62)"
          : "transparent",
        color: selected
          ? "var(--color-sage, #4a7a62)"
          : "var(--color-espresso, #16110d)",
      }}
    >
      <span
        className="text-sm"
        style={{ fontWeight: selected ? 600 : 400 }}
      >
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
          width={16}
          height={16}
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
