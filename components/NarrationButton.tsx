"use client";

import { useState, useEffect, useRef } from "react";
import {
  NARRATION_START_EVENT,
  NARRATION_END_EVENT,
} from "@/lib/audioEvents";
import useMediaSession from "@/hooks/useMediaSession";

// Re-export the narration event names from this module for back-compat
// with existing imports (`import { NARRATION_START_EVENT } from
// "@/components/NarrationButton"`). The canonical source of truth is
// now lib/audioEvents.ts, where the auditio + ambient coordination
// constants live alongside.
export { NARRATION_START_EVENT, NARRATION_END_EVENT };

interface NarrationButtonProps {
  audioUrl?: string;
  // Color of the icon. Defaults to gold.
  color?: string;
}

export default function NarrationButton({ audioUrl, color = "#C19B5F" }: NarrationButtonProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Register MediaSession metadata + lockscreen handlers while
  // narration is active. Without this, iOS shows its generic
  // Now Playing widget (page <title> as title, black square +
  // play-triangle as artwork) and — worse — the play/pause icon
  // never updates when the audio actually pauses or ends, so users
  // see a stuck "pause" button on lock even after narration is done.
  //
  // The hook also wires play/pause action handlers so the lockscreen
  // play/pause button calls into our state directly. Pausing via
  // lockscreen → audio.pause() → "pause" event listener dispatches
  // NARRATION_END (centralised in toggle's audio listener) → ambient
  // refcount decrements → ambient resumes.
  //
  // NARR-LS-01 fix shipped June 6, 2026.
  useMediaSession({
    audioRef,
    active: playing,
    track: playing
      ? {
          title: "Narration",
          album: "Contueri",
        }
      : null,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
  });

  // Stop and clean up when unmounted (step change, page navigation, etc.)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Stop narration if another NarrationButton fires its own start event
  useEffect(() => {
    const handler = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setPlaying(false);
      }
    };
    window.addEventListener(NARRATION_START_EVENT, handler);
    return () => window.removeEventListener(NARRATION_START_EVENT, handler);
  }, []);

  if (!audioUrl) return null;

  const toggle = () => {
    if (playing) {
      // Just pause — the "pause" event listener below handles the
      // NARRATION_END dispatch so we don't double-fire it.
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      // Signal all audio players (Auditio music, background music) to pause
      window.dispatchEvent(new CustomEvent(NARRATION_START_EVENT));
      if (!audioRef.current) {
        const audio = new Audio(audioUrl);
        // "ended" fires when playback reaches the natural end. Also
        // sets playing=false so the button flips sooner; the
        // companion "pause" event (which fires immediately after
        // "ended") is what dispatches NARRATION_END.
        audio.addEventListener("ended", () => setPlaying(false));
        // "pause" is the single canonical place we dispatch
        // NARRATION_END. It fires uniformly whether the user tapped
        // STOP, the audio finished naturally, or iOS auto-paused us
        // (the Vercel-URL lockscreen case — iOS Safari has no
        // background audio permission without a Capacitor shell that
        // sets UIBackgroundModes=audio). Centralising the dispatch
        // here means ambient resume logic kicks in for ALL pause
        // paths, including the auto-pause-on-lock that caused the
        // June 6, 2026 stuck-paused bug Sheri caught.
        audio.addEventListener("pause", () => {
          setPlaying(false);
          window.dispatchEvent(new CustomEvent(NARRATION_END_EVENT));
        });
        audioRef.current = audio;
      }
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Stop narration" : "Listen to this text"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: "none",
        border: "none",
        padding: "4px 2px",
        cursor: "pointer",
        color: playing ? color : `${color}80`,
        transition: "color 0.2s ease",
        flexShrink: 0,
      }}
    >
      {playing ? (
        // Pause icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
          <path fillRule="evenodd" d="M5.75 3a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-1.5 0V3.75A.75.75 0 0 1 5.75 3zm8.5 0a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-1.5 0V3.75a.75.75 0 0 1 .75-.75z" clipRule="evenodd" />
        </svg>
      ) : (
        // Headphones icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
          <path fillRule="evenodd" d="M10 2a8 8 0 0 0-8 8v3.5a2.5 2.5 0 1 0 5 0V11a2.5 2.5 0 0 0-2-2.45V10a5 5 0 1 1 10 0v.55A2.5 2.5 0 0 0 13 13v.5a2.5 2.5 0 1 0 5 0V10a8 8 0 0 0-8-8z" clipRule="evenodd" />
        </svg>
      )}
      <span style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
        {playing ? "Stop" : "Listen"}
      </span>
    </button>
  );
}
