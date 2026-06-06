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
import {
  NARRATION_START_EVENT,
  NARRATION_END_EVENT,
} from "@/components/NarrationButton";

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

  // When the selected sound changes, swap the audio src. If we were
  // playing, keep playing the new sound; otherwise stay paused.
  useEffect(() => {
    if (!audioRef.current) return;
    const url = fileFor(prefs.sound);
    if (!url) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      setIsPlaying(false);
      return;
    }
    // Avoid reloading if the src is already correct (same sound).
    if (audioRef.current.currentSrc.endsWith(url)) return;
    const wasPlaying = !audioRef.current.paused;
    audioRef.current.src = url;
    audioRef.current.load();
    if (wasPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
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
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      persistWasPlaying(true);
    } catch {
      // Autoplay blocked or other failure. Stay paused.
      setIsPlaying(false);
    }
  }, [prefs.sound, persistWasPlaying, ensureWebAudio]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
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

  // Pause / resume around TTS narration. PromptClient + NarrationButton
  // dispatch window events on the narration lifecycle (already wired
  // for the existing Auditio audio coordination). We listen for the
  // same events and apply a simple auto-pause / auto-resume.
  //
  // Real "ducking" (volume drop instead of pause) is a stretch goal
  // for this MVP — the current pattern is what the user sees today
  // for Auditio so this matches.
  const wasPlayingBeforeTTSRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStart = () => {
      if (!audioRef.current) return;
      wasPlayingBeforeTTSRef.current = !audioRef.current.paused;
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
    const onEnd = () => {
      if (!audioRef.current) return;
      if (wasPlayingBeforeTTSRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        wasPlayingBeforeTTSRef.current = false;
      }
    };

    window.addEventListener(NARRATION_START_EVENT, onStart);
    window.addEventListener(NARRATION_END_EVENT, onEnd);
    return () => {
      window.removeEventListener(NARRATION_START_EVENT, onStart);
      window.removeEventListener(NARRATION_END_EVENT, onEnd);
    };
  }, []);

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
        The shared <audio> element. preload="none" is intentional per
        the brief — we don't fetch any MP3 until the user has chosen
        a sound. loop ensures the gapless-loop-processed source (see
        public/music/README.md) plays continuously. playsInline + the
        absence of a controls attribute keep it invisible.
      */}
      {!inIframe && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio
          ref={audioRef}
          preload="none"
          loop
          playsInline
          aria-hidden
        />
      )}
      {children}
    </AmbientContext.Provider>
  );
}
