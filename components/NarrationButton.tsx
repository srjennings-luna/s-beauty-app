"use client";

import { useState, useEffect, useRef } from "react";

// Dispatched when narration starts — CircularAudioPlayer and PromptClient listen
// and pause their own audio so two tracks never play simultaneously.
export const NARRATION_START_EVENT = "kallos-narration-start";

interface NarrationButtonProps {
  audioUrl?: string;
  // Color of the icon. Defaults to gold.
  color?: string;
}

export default function NarrationButton({ audioUrl, color = "#C19B5F" }: NarrationButtonProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      // Signal all audio players (Auditio music, background music) to pause
      window.dispatchEvent(new CustomEvent(NARRATION_START_EVENT));
      if (!audioRef.current) {
        const audio = new Audio(audioUrl);
        audio.addEventListener("ended", () => setPlaying(false));
        audio.addEventListener("pause", () => setPlaying(false));
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
