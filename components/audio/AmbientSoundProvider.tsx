"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import useAmbientPreferences from "@/hooks/useAmbientPreferences";
import { AMBIENT_SOUNDS, type AmbientSoundId } from "@/lib/userData";
import { primeMediaSession } from "@/hooks/useMediaSession";
import {
  NARRATION_START_EVENT,
  NARRATION_END_EVENT,
  AUDITIO_START_EVENT,
  AUDITIO_END_EVENT,
} from "@/lib/audioEvents";

// Contueri · AmbientSoundProvider
//
// Per CONTUERI-CC-Ambient-Sound-Brief.html (W2 Agent 2, June 5 MVP).
//
// One <audio> element rendered into the root of the React tree —
// outside any route component, outside the Navigation — so it survives
// every route change without recreating playback. The provider exposes
// a context API consumed by:
//   - AmbientFloatingButton (the global tap-to-play control)
//   - Settings SOUND section (picker + volume slider)
//   - PromptClient / NarrationButton (pause/resume on TTS)
//
// MVP scope notes:
//   - One audio stream only. The brief describes three (ambient +
//     auditio + narration) coordinated via a ducking rule; for MVP
//     we just pause ambient when narration plays and auto-resume
//     when it ends. The Auditio audio (P&P + Journey Day) is its
//     own stream managed by PromptClient / JourneyDaySteps and is
//     NOT coordinated with ambient in MVP — they can play together
//     if the user chooses (rare in practice).
//   - No cross-fade between sounds yet. Switching sound = pause
//     current, swap src, play new (stretch goal).
//   - No long-press popover (stretch goal).
//   - No arc dial (v1.1 — slider only).
//   - No discovery pulse animation (v1.1).
//   - Cold launch never auto-resumes. The wasPlaying flag is a UI
//     hint for "show a resume affordance," NOT a "start playing"
//     trigger.
//
// iframe guard: in Sanity Presentation preview, the provider mounts
// but does NOT instantiate the <audio> element so the editor's
// iframe doesn't play surprise audio in the editor's tab.

export type AmbientContextValue = {
  /** The user's current selected sound, or null if never chosen. */
  selectedSound: AmbientSoundId | null;
  /** True if the audio element is actually playing right now. */
  isPlaying: boolean;
  /** Volume in [0, 1]. */
  volume: number;
  /** True after prefs have hydrated from storage. */
  isReady: boolean;
  /** Has the user dismissed / interacted with the first-launch surfacing? */
  discoverySeen: boolean;
  /** Select a sound. Does NOT start playback automatically. */
  selectSound: (id: AmbientSoundId | null) => void;
  /** Start playing the selected sound. If no sound is selected, no-op. */
  play: () => Promise<void>;
  /** Pause without clearing the selected sound. */
  pause: () => void;
  /** Toggle play/pause based on current state. */
  toggle: () => Promise<void>;
  /** Set the volume in [0, 1]. */
  setVolume: (v: number) => void;
  /** Mark discovery as seen (called when user opens Settings, taps the floating button, etc). */
  markDiscoverySeen: () => void;
};

const AmbientContext = createContext<AmbientContextValue | null>(null);

export function useAmbientSound(): AmbientContextValue {
  const ctx = useContext(AmbientContext);
  if (!ctx) {
    throw new Error(
      "useAmbientSound must be used inside <AmbientSoundProvider />",
    );
  }
  return ctx;
}

// Resolve a sound ID → file URL. AMBIENT_SOUNDS is the source of truth.
function fileFor(id: AmbientSoundId | null): string | null {
  if (id === null) return null;
  return AMBIENT_SOUNDS.find((s) => s.id === id)?.file ?? null;
}

// Cross-fade duration. 400ms feels intentional without registering as
// a glitch in either direction. Mirror in seconds for AudioContext
// scheduling (which uses currentTime + offset, not setTimeout's ms).
const FADE_MS = 400;
const FADE_SECONDS = FADE_MS / 1000;

// Soft-fade duration for play/pause. Bumped through 40ms → 100ms →
// 200ms over a single afternoon of iteration. 200ms is where the fade
// crosses from "imperceptible click suppression" into "deliberately
// audible graceful exhale" — Sheri's call. At 100ms the click was
// suppressed but the audio still felt like it stopped on whatever
// waveform position it happened to land on, which sounded harsh on
// certain notes. At 200ms the audio gently winds down regardless of
// the underlying note, matching the contemplative app feel.
//
// PRE_PLAY_GAIN_SETTLE_MS: short delay between setting gain to 0 and
// calling audio.play(). Gives the GainNode's scheduled value time to
// propagate into the audio output buffer so audio doesn't start at
// full volume before the fade-in begins.
//
// PAUSE_FIRE_DELAY_MS: longer than SOFT_FADE_MS so the fade-out has
// fully completed (and propagated through the buffer) before
// audio.pause() interrupts the waveform.
const SOFT_FADE_MS = 200;
const SOFT_FADE_SECONDS = SOFT_FADE_MS / 1000;
const PRE_PLAY_GAIN_SETTLE_MS = 15;
const PAUSE_FIRE_DELAY_MS = 220;

export default function AmbientSoundProvider({ children }: { children: ReactNode }) {
  const {
    prefs,
    isReady,
    setSound: persistSound,
    setVolume: persistVolume,
    setWasPlaying: persistWasPlaying,
    setDiscoverySeen: persistDiscoverySeen,
  } = useAmbientPreferences();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inIframe, setInIframe] = useState(false);

  // ── Web Audio volume control ────────────────────────────────────────
  //
  // iOS Safari / WKWebView ignores `HTMLMediaElement.volume` — Apple
  // treats audio volume as user-hardware-controlled and the property
  // is effectively read-only on the platform. Setting `audio.volume`
  // from JS silently does nothing on iPhone.
  //
  // The workaround (which works on iOS) is to route the <audio>
  // element through Web Audio:
  //
  //     audio ── MediaElementSource ── GainNode ── destination
  //
  // The GainNode's `gain.value` is honored everywhere, including iOS
  // WebView. We create the AudioContext lazily on the first play()
  // call (autoplay policies require a user gesture before audio
  // contexts can start producing sound) and re-use it for every
  // sound change.
  //
  // audio.volume is still set to 1.0 as a fallback for desktop
  // browsers where Web Audio routing might fail; the gain node then
  // performs the actual volume math.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  // Tracks the setTimeout id for an in-flight cross-fade swap so a
  // second sound-change (user tapping rapidly through the picker)
  // can cancel the pending swap and the latest selection wins.
  const pendingSwapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Always-current volume value for the fade-in target. Without this,
  // the cross-fade setTimeout would close over the volume value at
  // fade-out start; if the user drags the slider during the ~400ms
  // fade, the fade-in would ramp to the stale target.
  const volumeRef = useRef(prefs.volume);
  useEffect(() => {
    volumeRef.current = prefs.volume;
  }, [prefs.volume]);

  // Always-current selected sound for the resume-after-duck path. The
  // resume callback lives inside a useEffect with [] deps (intentional —
  // re-registering window event handlers on every prefs change is what
  // caused the v1.0 ambient ticking bug). Read the latest sound here
  // instead of pulling it through the closure.
  const soundRef = useRef(prefs.sound);
  useEffect(() => {
    soundRef.current = prefs.sound;
  }, [prefs.sound]);

  // Synchronously set the lockscreen Now Playing metadata for the
  // current ambient sound. Call this BEFORE audio.play() so iOS
  // captures it on the play event (otherwise it falls back to the
  // page <title>). Metadata-only — we deliberately don't register
  // play/pause action handlers here because handler churn on every
  // provider render is what caused the earlier ambient lockscreen
  // attempts to produce audio ticking. iOS's default Now Playing
  // controls still drive the <audio> element directly without our
  // custom handlers; ambient pause/resume from the lockscreen will
  // work, just without React state sync (worst case: a brief mismatch
  // between the floating-button icon and actual playback until next
  // render). AMBIENT-LS-02 metadata-only fix shipped June 11, 2026.
  const primeAmbientMetadata = useCallback(() => {
    const id = soundRef.current;
    if (!id) return;
    const label = AMBIENT_SOUNDS.find((s) => s.id === id)?.label ?? "Ambient";
    primeMediaSession({
      title: label,
      album: "Contueri · Ambient",
    });
  }, []);

  // Detect iframe (Sanity Presentation) on mount. If we're embedded,
  // the audio element never mounts — preserves the editor tab's
  // expectation that previewing a page doesn't trigger media playback.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setInIframe(window.self !== window.top);
  }, []);

  // Lazy Web Audio setup — runs the first time we need to play and
  // the user has provided a gesture. Idempotent: subsequent calls
  // return the existing graph.
  const ensureWebAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) return null;
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(audioRef.current);
      const gain = ctx.createGain();
      gain.gain.value = prefs.volume;
      source.connect(gain);
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      sourceNodeRef.current = source;
      gainNodeRef.current = gain;
      return ctx;
    } catch {
      // createMediaElementSource throws if called twice on the same
      // element (we guard against that above) or if Web Audio is
      // unavailable. Fall back to the (non-functional on iOS but
      // working everywhere else) audio.volume path.
      return null;
    }
  }, [prefs.volume]);

  // Keep both the GainNode and the <audio>.volume in sync with prefs.
  // Web Audio handles iOS; audio.volume covers any fallback case.
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      // setValueAtTime + AudioContext.currentTime is the canonical
      // way to schedule gain changes; assigning .value directly works
      // but produces a small zipper noise on rapid drags.
      try {
        gainNodeRef.current.gain.setValueAtTime(
          prefs.volume,
          audioCtxRef.current.currentTime,
        );
      } catch {
        gainNodeRef.current.gain.value = prefs.volume;
      }
    }
    if (audioRef.current) {
      audioRef.current.volume = prefs.volume;
    }
  }, [prefs.volume]);

  // When the selected sound changes, swap the audio src.
  //
  // Cross-fade behaviour (added June 6, 2026 — stretch goal in the
  // brief, picked up after MVP shipped):
  //   - Switching between two sounds WHILE PLAYING → fade gain to 0
  //     (FADE_MS), swap src, fade gain back up to user volume (FADE_MS).
  //     Total transition ~800ms — long enough to feel intentional,
  //     short enough not to register as a glitch.
  //   - Switching to Off WHILE PLAYING → fade gain to 0 then pause.
  //   - All other transitions (off→sound, or any swap while paused)
  //     stay instant. The picker calls play() right after selectSound
  //     for the off→sound case, and instant response is correct UX
  //     for a user gesture.
  //
  // Implementation notes:
  //   - Uses the existing GainNode (Web Audio chain). On browsers
  //     where Web Audio isn't available (rare — desktop Firefox
  //     historical bugs), falls back to instant swap so behaviour
  //     degrades gracefully.
  //   - `linearRampToValueAtTime` is scheduled on AudioContext.currentTime
  //     so multiple in-flight fades don't fight (each fade calls
  //     cancelScheduledValues + setValueAtTime first to anchor the
  //     starting point).
  //   - The fade-out timer (setTimeout) is tracked in a ref so a
  //     rapid second sound-change cancels the pending swap and starts
  //     a fresh fade. Without that, picking sound A → B → C in
  //     quick succession would leave the B-load pending after C
  //     already became the prefs target.
  useEffect(() => {
    if (!audioRef.current) return;
    const url = fileFor(prefs.sound);
    const audio = audioRef.current;
    const wasPlaying = !audio.paused;
    const gain = gainNodeRef.current;
    const ctx = audioCtxRef.current;
    const canFade = wasPlaying && gain && ctx;

    // Cancel any pending swap from a previous fade so the latest
    // selection wins.
    if (pendingSwapTimerRef.current) {
      clearTimeout(pendingSwapTimerRef.current);
      pendingSwapTimerRef.current = null;
    }

    if (!url) {
      // sound → Off
      if (canFade) {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + FADE_SECONDS);
        pendingSwapTimerRef.current = setTimeout(() => {
          pendingSwapTimerRef.current = null;
          audio.pause();
          audio.removeAttribute("src");
          audio.load();
          setIsPlaying(false);
          // Intentionally do not restore gain — see provider.pause()
          // comment. play() resets gain to 0 + ramps up on next start.
        }, FADE_MS);
      } else {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        setIsPlaying(false);
      }
      return;
    }

    // Same sound — no-op.
    if (audio.currentSrc.endsWith(url)) return;

    if (canFade) {
      // sound → different sound, while playing: cross-fade.
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + FADE_SECONDS);
      pendingSwapTimerRef.current = setTimeout(() => {
        pendingSwapTimerRef.current = null;
        if (!audioRef.current) return;
        audioRef.current.src = url;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => {
            if (!gainNodeRef.current || !audioCtxRef.current) return;
            const ctx2 = audioCtxRef.current;
            const g2 = gainNodeRef.current;
            const t2 = ctx2.currentTime;
            g2.gain.cancelScheduledValues(t2);
            g2.gain.setValueAtTime(0, t2);
            g2.gain.linearRampToValueAtTime(volumeRef.current, t2 + FADE_SECONDS);
          })
          .catch(() => {
            setIsPlaying(false);
            // Restore gain on play() failure so a later play() works.
            if (gainNodeRef.current && audioCtxRef.current) {
              gainNodeRef.current.gain.setValueAtTime(
                volumeRef.current,
                audioCtxRef.current.currentTime,
              );
            }
          });
      }, FADE_MS);
      return;
    }

    // Not playing (or no Web Audio graph) — just swap, no fade needed.
    audio.src = url;
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // Deps intentionally exclude prefs.volume — that's read via
    // volumeRef inside the cross-fade callbacks so the effect doesn't
    // re-run on every slider tick.
  }, [prefs.sound]);

  const play = useCallback(async () => {
    const url = fileFor(prefs.sound);
    if (!url || !audioRef.current) return;
    // Build the Web Audio graph if it doesn't exist yet — this
    // happens during a user tap so iOS will allow the AudioContext
    // to start. If Web Audio isn't available, we fall through and
    // play via the bare audio element (volume control degrades to
    // hardware-only on iOS in that case).
    const ctx = ensureWebAudio();
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        /* iOS sometimes errors on resume from a non-running state — fine to ignore */
      }
    }
    if (audioRef.current.currentSrc === "" || audioRef.current.src === "") {
      audioRef.current.src = url;
      audioRef.current.load();
    }
    // Click suppression: start gain at 0, wait PRE_PLAY_GAIN_SETTLE_MS
    // for the value to propagate into iOS's audio output buffer, then
    // call audio.play() and ramp gain up to user volume over
    // SOFT_FADE_MS. Without the settle delay, audio.play() can produce
    // its first sample before the gain-at-0 reaches the speaker, and
    // the listener hears an abrupt full-volume start instead of a fade.
    const gain = gainNodeRef.current;
    if (ctx && gain) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0, now);
      // Wait briefly so the gain-at-0 is in the output buffer.
      await new Promise<void>((resolve) =>
        setTimeout(resolve, PRE_PLAY_GAIN_SETTLE_MS),
      );
      // Schedule the fade-in starting from the (now-current) currentTime.
      const fadeStart = ctx.currentTime;
      gain.gain.cancelScheduledValues(fadeStart);
      gain.gain.setValueAtTime(0, fadeStart);
      gain.gain.linearRampToValueAtTime(
        volumeRef.current,
        fadeStart + SOFT_FADE_SECONDS,
      );
    }
    primeAmbientMetadata();
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      persistWasPlaying(true);
    } catch {
      // Autoplay blocked or other failure. Stay paused.
      setIsPlaying(false);
    }
  }, [prefs.sound, persistWasPlaying, ensureWebAudio, primeAmbientMetadata]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    // Click suppression: fade gain to 0 over SOFT_FADE_MS, then call
    // audio.pause() once the ramp completes. Without this, an abrupt
    // pause mid-waveform produces a speaker pop. Restore gain to user
    // volume immediately after pausing so the next play() can rely on
    // its own fade-in starting from a clean 0 → volume ramp.
    //
    // Also cancel any in-flight cross-fade swap timer — if user pauses
    // during a sound transition, we don't want the pending src-swap
    // and play() to fire after we've paused.
    if (pendingSwapTimerRef.current) {
      clearTimeout(pendingSwapTimerRef.current);
      pendingSwapTimerRef.current = null;
    }
    const ctx = audioCtxRef.current;
    const gain = gainNodeRef.current;
    if (ctx && gain && !audioRef.current.paused) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + SOFT_FADE_SECONDS);
      // Wait PAUSE_FIRE_DELAY_MS (longer than SOFT_FADE_MS) before
      // audio.pause() so the fade-out has fully reached the output
      // buffer before we interrupt the waveform.
      //
      // INTENTIONALLY DO NOT restore gain to user volume here. iOS
      // WKWebView holds ~30-60ms of audio queued in its output buffer
      // ahead of currentTime. If we restore gain immediately after
      // audio.pause() (especially within the buffer window), the
      // restored gain re-amplifies the queued samples BEFORE iOS
      // completes the pause — producing a brief audible burst that
      // reads as a "tick" after the fade-out. Waveform analysis on
      // June 6, 2026 caught this directly: 50ms of audio appearing
      // ~100ms after the pause, at exactly the moment gain was
      // restored. play() already resets gain to 0 at start and ramps
      // up to volume, so leaving gain at 0 after pause is safe.
      setTimeout(() => {
        audioRef.current?.pause();
      }, PAUSE_FIRE_DELAY_MS);
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    persistWasPlaying(false);
  }, [persistWasPlaying]);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const selectSound = useCallback(
    (id: AmbientSoundId | null) => {
      persistSound(id);
    },
    [persistSound],
  );

  const setVolume = useCallback(
    (v: number) => {
      persistVolume(v);
    },
    [persistVolume],
  );

  const markDiscoverySeen = useCallback(() => {
    if (!prefs.discoverySeen) {
      persistDiscoverySeen(true);
    }
  }, [prefs.discoverySeen, persistDiscoverySeen]);

  // Pause / resume around any higher-priority audio stream — narration
  // (TTS via NarrationButton) and Auditio (curated music in P&P +
  // Journey Day). All four streams dispatch START / END events from
  // lib/audioEvents.ts; we refcount them here so ambient stays paused
  // while ANY of them is active and only resumes when the count
  // reaches zero.
  //
  // Why a refcount instead of a single "paused-for-X" flag: if
  // narration starts during Auditio playback, then narration ends, the
  // user would expect ambient to STAY paused (Auditio is still going).
  // A simple flag would resume too eagerly. The refcount handles
  // any combination of overlapping sources correctly.
  //
  // Real "ducking" (drop ambient volume to ~20% instead of fully
  // pausing) is v1.1 — confirmed June 5 with Sheri.
  const higherPriorityCountRef = useRef(0);
  const wasPlayingBeforeDuckRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onAnyStart = () => {
      if (!audioRef.current) return;
      // Snapshot was-playing BEFORE incrementing — only the first
      // START in a chain captures the original ambient state.
      if (higherPriorityCountRef.current === 0) {
        wasPlayingBeforeDuckRef.current = !audioRef.current.paused;
        if (!audioRef.current.paused) {
          // Soft fade-out before pausing so the speaker doesn't pop
          // when narration / Auditio cuts ambient. Same 40ms ramp
          // pattern as provider.pause().
          const ctx = audioCtxRef.current;
          const gain = gainNodeRef.current;
          if (ctx && gain) {
            const now = ctx.currentTime;
            gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(gain.gain.value, now);
            gain.gain.linearRampToValueAtTime(0, now + SOFT_FADE_SECONDS);
            // Don't restore gain — same iOS audio-buffer-burst reason
            // as provider.pause(). play() resets gain to 0 + ramps up
            // on next start.
            setTimeout(() => {
              audioRef.current?.pause();
            }, PAUSE_FIRE_DELAY_MS);
          } else {
            audioRef.current.pause();
          }
          setIsPlaying(false);
        }
      }
      higherPriorityCountRef.current += 1;
    };
    const onAnyEnd = () => {
      if (!audioRef.current) return;
      higherPriorityCountRef.current = Math.max(
        0,
        higherPriorityCountRef.current - 1,
      );
      // Only resume once ALL higher-priority sources have finished.
      if (
        higherPriorityCountRef.current === 0 &&
        wasPlayingBeforeDuckRef.current
      ) {
        // Soft fade-in on resume so the speaker doesn't pop when
        // ambient comes back after narration / Auditio ends.
        const ctx = audioCtxRef.current;
        const gain = gainNodeRef.current;
        if (ctx && gain) {
          const now = ctx.currentTime;
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(volumeRef.current, now + SOFT_FADE_SECONDS);
        }
        primeAmbientMetadata();
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        wasPlayingBeforeDuckRef.current = false;
      }
    };

    window.addEventListener(NARRATION_START_EVENT, onAnyStart);
    window.addEventListener(AUDITIO_START_EVENT, onAnyStart);
    window.addEventListener(NARRATION_END_EVENT, onAnyEnd);
    window.addEventListener(AUDITIO_END_EVENT, onAnyEnd);
    return () => {
      window.removeEventListener(NARRATION_START_EVENT, onAnyStart);
      window.removeEventListener(AUDITIO_START_EVENT, onAnyStart);
      window.removeEventListener(NARRATION_END_EVENT, onAnyEnd);
      window.removeEventListener(AUDITIO_END_EVENT, onAnyEnd);
    };
  }, []);

  // MediaSession for ambient is set synchronously inside primeAmbientMetadata
  // (above), called from play() and the duck-resume path. Metadata only —
  // no setActionHandler() calls. The earlier attempts that registered action
  // handlers via useMediaSession's effect cycle churned on every consumer
  // render and caused intermittent audio ticking on iOS Safari (reverted in
  // commits e4dee973 + e10af45b + 421abe38). iOS's default Now Playing
  // controls still drive the <audio> element for lockscreen play/pause; we
  // accept that the floating-button React state may briefly lag a lockscreen
  // gesture in exchange for a stable audio path. AMBIENT-LS-02 closed
  // June 11, 2026.

  // Context value is memoized so consumers don't re-render on every
  // parent render. Identity changes only when actual state changes.
  const value = useMemo<AmbientContextValue>(
    () => ({
      selectedSound: prefs.sound,
      isPlaying,
      volume: prefs.volume,
      isReady,
      discoverySeen: prefs.discoverySeen,
      selectSound,
      play,
      pause,
      toggle,
      setVolume,
      markDiscoverySeen,
    }),
    [
      prefs.sound,
      prefs.volume,
      prefs.discoverySeen,
      isPlaying,
      isReady,
      selectSound,
      play,
      pause,
      toggle,
      setVolume,
      markDiscoverySeen,
    ],
  );

  return (
    <AmbientContext.Provider value={value}>
      {/*
        The shared <audio> element. preload="auto" lets iOS WKWebView
        fetch the full MP3 as soon as src is set, instead of chunking
        it on demand. Sheri caught periodic ticks every ~5-6s in the
        first ~10s of playback on the Xcode build (June 6, 2026) — those
        were chunk-transition glitches. preload="auto" eliminates them
        by letting iOS build a comfortable buffer ahead. The brief's
        original preload="none" was intended to avoid fetching MP3s
        before the user chose a sound; that's still true because the
        src attribute isn't set until the user selects (and load() is
        only called inside the src-swap effect). loop=true plays the
        gapless-loop-processed source (see public/music/README.md)
        continuously. playsInline + the absence of a controls attribute
        keep it invisible.
      */}
      {!inIframe && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audioRef}
          preload="auto"
          loop
          playsInline
          aria-hidden
          // Explicit display:none — Safari without `controls` sometimes
          // still renders <audio> as a zero-size inline element that
          // takes a line of vertical space in the flow, which can shift
          // nearby layouts. Belt-and-braces guard.
          style={{ display: "none" }}
        />
      )}
      {children}
    </AmbientContext.Provider>
  );
}
