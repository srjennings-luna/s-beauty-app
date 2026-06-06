"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAmbientPreferences,
  setAmbientSound as writeSound,
  setAmbientVolume as writeVolume,
  setAmbientWasPlaying as writeWasPlaying,
  setAmbientDiscoverySeen as writeDiscoverySeen,
  type AmbientPreferences,
  type AmbientSoundId,
} from "@/lib/userData";

// Contueri · useAmbientPreferences
//
// Mirrors the shape of useOnboarded — reads through the auth-ready
// data layer (lib/userData.ts), exposes a typed snapshot of prefs +
// setters that both update React state AND persist to storage.
//
// The volume setter is debounced 200ms trailing so a drag on the
// arc dial / slider doesn't thrash localStorage on every pointer
// move. In-memory volume updates immediately; the write to storage
// happens after the user stops moving.
//
// SSR / first render: returns the safe defaults from lib/userData;
// after the first effect tick the prefs are hydrated from storage.
// The `isReady` flag distinguishes those two states so consumers
// (the Provider) can avoid rendering the floating button etc. before
// they know whether the user has a saved preference.

const VOLUME_PERSIST_DELAY_MS = 200;

const DEFAULTS: AmbientPreferences = {
  sound: null,
  volume: 0.5,
  wasPlaying: false,
  discoverySeen: false,
};

export default function useAmbientPreferences() {
  const [prefs, setPrefs] = useState<AmbientPreferences>(DEFAULTS);
  const [isReady, setIsReady] = useState(false);
  const volumePersistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPrefs(getAmbientPreferences());
    setIsReady(true);
  }, []);

  const setSound = useCallback((id: AmbientSoundId | null) => {
    writeSound(id);
    setPrefs((prev) => ({ ...prev, sound: id }));
  }, []);

  const setVolume = useCallback((v: number) => {
    if (!Number.isFinite(v)) return;
    const clamped = Math.min(1, Math.max(0, v));
    // Update in-memory immediately so the UI tracks the user's
    // drag in real time without waiting on storage.
    setPrefs((prev) => ({ ...prev, volume: clamped }));
    // Persist after a quiet period so a drag doesn't write 60+ times.
    if (volumePersistTimer.current) {
      clearTimeout(volumePersistTimer.current);
    }
    volumePersistTimer.current = setTimeout(() => {
      writeVolume(clamped);
      volumePersistTimer.current = null;
    }, VOLUME_PERSIST_DELAY_MS);
  }, []);

  const setWasPlaying = useCallback((b: boolean) => {
    writeWasPlaying(b);
    setPrefs((prev) => ({ ...prev, wasPlaying: b }));
  }, []);

  const setDiscoverySeen = useCallback((b: boolean) => {
    writeDiscoverySeen(b);
    setPrefs((prev) => ({ ...prev, discoverySeen: b }));
  }, []);

  return {
    prefs,
    isReady,
    setSound,
    setVolume,
    setWasPlaying,
    setDiscoverySeen,
  };
}
