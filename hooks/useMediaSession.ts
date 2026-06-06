"use client";

import { useEffect } from "react";

// Contueri · useMediaSession
//
// Wires the Media Session API to a given <audio> element so the iOS
// lockscreen, Control Center, AirPods, and CarPlay all surface the
// currently-playing Auditio track with its title, composer/artist,
// album, and artwork — and let the user pause / resume / seek without
// returning to the app.
//
// Browser support: Media Session is implemented in iOS Safari 15+ and
// macOS Safari 15+, plus all modern Chromium browsers. WKWebView
// inherits Safari's implementation, so this works inside the Capacitor
// shell on iOS. On older browsers and in headless contexts the hook
// is a silent no-op.
//
// Background / lockscreen prerequisites (handled at the iOS shell
// level, not in this hook):
//   - Info.plist: UIBackgroundModes = ["audio"]
//   - AppDelegate: AVAudioSession.setCategory(.playback)
// Without those, audio stops as soon as the screen locks regardless
// of how nicely the metadata is set.
//
// Usage:
//   const [playing, setPlaying] = useState(false);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   useMediaSession({
//     audioRef,
//     active: playing,
//     track: playing ? {
//       title: prompt.auditio.workTitle ?? prompt.auditio.title,
//       artist: prompt.auditio.composerArtist,
//       album: "Contueri",
//       artworkUrl: prompt.imageUrl,
//     } : null,
//     onPlay: () => setPlaying(true),
//     onPause: () => setPlaying(false),
//   });
//
// The hook keeps `navigator.mediaSession.metadata` in sync with
// `track` while `active` is true, and clears it (sets to null and
// removes action handlers) when `active` flips to false or the
// component unmounts.

export type MediaSessionTrack = {
  title: string;
  artist?: string;
  album?: string;
  // The artwork URL is typically the day's painting (DailyPrompt.imageUrl
  // or JourneyDay.openImageUrl). We pass a single URL here and let the
  // hook produce the multiple sizes that iOS uses for different surfaces.
  // Sanity CDN supports on-the-fly resize via query params.
  artworkUrl?: string;
};

export type UseMediaSessionOptions = {
  /** Ref to the <audio> element actually playing. */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** True iff metadata + handlers should be registered. False clears them. */
  active: boolean;
  /** Track metadata. Pass null to clear. */
  track: MediaSessionTrack | null;
  /** Called when the user taps Play on the lockscreen / Control Center. */
  onPlay?: () => void;
  /** Called when the user taps Pause on the lockscreen / Control Center. */
  onPause?: () => void;
  /** Optional — called on lockscreen Stop. Defaults to pause + seek to 0. */
  onStop?: () => void;
};

// Generates a set of artwork descriptors at different sizes from a
// single Sanity CDN URL. iOS picks the closest match for each surface
// (CarPlay wants ~512x512; lockscreen wants ~256x256; AirPods wants
// even smaller). For non-Sanity URLs we pass through the original at
// 512x512 as a single best-guess.
function buildArtwork(url: string): MediaImage[] {
  const isSanity = /\.sanity\.io\//.test(url);
  if (!isSanity) {
    return [{ src: url, sizes: "512x512", type: "image/jpeg" }];
  }
  // Sanity CDN supports `?w=N&h=N&fit=crop&auto=format` for resize.
  // We re-use the same URL with different size params for each.
  const sizes = [128, 256, 512] as const;
  return sizes.map((s) => {
    const sep = url.includes("?") ? "&" : "?";
    return {
      src: `${url}${sep}w=${s}&h=${s}&fit=crop&auto=format`,
      sizes: `${s}x${s}`,
      type: "image/jpeg",
    };
  });
}

// Brand-wordmark fallback artwork shown on the iOS lockscreen Now
// Playing widget when a track doesn't provide its own artworkUrl
// (narration, days without a content imageUrl, etc.). Sourced from
// the iOS app icon. Without this, iOS shows its generic placeholder
// (black square + white play triangle) which reads as "audio playing
// from a generic source" rather than "Contueri." Added June 6, 2026
// as part of AUDITIO-LS-01 / NARR-LS-01.
const FALLBACK_ARTWORK: MediaImage[] = [
  { src: "/contueri-icon-1024.png", sizes: "1024x1024", type: "image/png" },
];

export default function useMediaSession({
  audioRef,
  active,
  track,
  onPlay,
  onPause,
  onStop,
}: UseMediaSessionOptions) {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    const ms = navigator.mediaSession;

    if (!active || !track) {
      // Clear: metadata, playback state, action handlers.
      try {
        ms.metadata = null;
        ms.playbackState = "none";
        const noops: MediaSessionAction[] = ["play", "pause", "stop", "seekto"];
        for (const a of noops) {
          try {
            ms.setActionHandler(a, null);
          } catch {
            /* not supported in this browser — ignore */
          }
        }
      } catch {
        /* defensive */
      }
      return;
    }

    // Set metadata.
    try {
      ms.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist ?? "",
        album: track.album ?? "Contueri",
        artwork: track.artworkUrl
          ? buildArtwork(track.artworkUrl)
          : FALLBACK_ARTWORK,
      });
      ms.playbackState = "playing";
    } catch {
      /* MediaMetadata constructor not available in this browser */
    }

    const audio = audioRef.current;

    // Action handlers — the lockscreen play/pause/stop/seek controls
    // call into these. Each handler nudges both the <audio> element
    // AND the React state via the onX callbacks so the UI stays in
    // sync with the lockscreen.
    const handlers: Array<{
      action: MediaSessionAction;
      handler: MediaSessionActionHandler;
    }> = [
      {
        action: "play",
        handler: () => {
          if (audio && audio.paused) {
            audio.play().catch(() => {});
          }
          try {
            ms.playbackState = "playing";
          } catch {
            /* ignore */
          }
          onPlay?.();
        },
      },
      {
        action: "pause",
        handler: () => {
          if (audio && !audio.paused) {
            audio.pause();
          }
          try {
            ms.playbackState = "paused";
          } catch {
            /* ignore */
          }
          onPause?.();
        },
      },
      {
        action: "stop",
        handler: () => {
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
          try {
            ms.playbackState = "none";
          } catch {
            /* ignore */
          }
          if (onStop) onStop();
          else onPause?.();
        },
      },
      {
        action: "seekto",
        handler: (details) => {
          if (audio && typeof details.seekTime === "number") {
            audio.currentTime = details.seekTime;
          }
        },
      },
    ];

    for (const { action, handler } of handlers) {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        /* unsupported action in this browser — ignore */
      }
    }

    return () => {
      for (const { action } of handlers) {
        try {
          ms.setActionHandler(action, null);
        } catch {
          /* ignore */
        }
      }
    };
    // Re-wire on track change OR on audioRef change. We pull onPlay/
    // onPause/onStop into the dep array so handlers always see the
    // latest closure (otherwise a stale React state setter could leak).
  }, [active, track, audioRef, onPlay, onPause, onStop]);
}
