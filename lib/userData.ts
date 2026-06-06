// ─── User-data storage layer ─────────────────────────────────────────────────
//
// This module is the SINGLE point in the app where user-specific data is
// read from or written to underlying storage. Today's implementation
// reads/writes browser localStorage. When auth ships (v1.0 stretch or
// v1.1 per the June 2 2026 launch plan), the implementations of the
// functions below swap to API calls against the authenticated user
// record. Consumers (hooks and components) do not change.
//
// This is the auth-ready data layer abstraction recorded in CLAUDE.md
// under "June 2, 2026 evening · Launch readiness gates closed" / Q-04.
//
// Storage key contract (frozen, never rename):
//   contueri-onboarded            onboarding completion flag
//   kallos-prompt-streak          consecutive day count
//   kallos-prompt-last            ISO date of last completed prompt
//   kallos-journey-progress       JSON map of slug → completed-day list
//   kallos-visio-note-<artworkId> per-artwork user note text
//
// Renaming any kallos-* key wipes existing user data on next read.
// The contueri-onboarded key intentionally diverged from the old
// kallos-onboarded so existing users re-see the rebranded splash once.

// ─── Storage key constants ───────────────────────────────────────────────────

export const ONBOARDED_KEY        = "contueri-onboarded";
export const STREAK_COUNT_KEY     = "kallos-prompt-streak";
export const STREAK_LAST_KEY      = "kallos-prompt-last";
export const JOURNEY_PROGRESS_KEY = "kallos-journey-progress";

// ─── Notification preferences (D-04 locked spec) ────────────────────────────
// One storage key per type containing { enabled, time, daysOfWeek }.
// Time is "HH:MM" 24h local. daysOfWeek is array of 0-6 (Sunday=0).
// Defaults: all disabled; per-type defaults applied in the hook on first read.
// W2 OneSignal integration reads these to populate user-tag segments and
// scheduled-send time-of-day rules. Pre-permission rationale screen state
// stored as a separate boolean so the rationale only shows once per install.

export const NOTIF_PP_KEY          = "contueri-notif-pp";
export const NOTIF_JOURNEY_KEY     = "contueri-notif-journey-day";
export const NOTIF_STREAK_KEY      = "contueri-notif-streak";
export const NOTIF_SEASONAL_KEY    = "contueri-notif-seasonal";
export const NOTIF_RATIONALE_KEY   = "contueri-notif-rationale-shown";

// ─── Ambient Sound System (W2 — see CONTUERI-CC-Ambient-Sound-Brief.html) ───
//
// Four storage keys + a typed sound identifier so the AmbientSoundProvider
// can persist user preference across cold launches. Discovery flag is
// intentionally SEPARATE from contueri-onboarded — resetting onboarding
// must NOT reset the discovery flag, per the brief's "shows once per
// install for any user who has completed splash" rule.

export const AMBIENT_SOUND_KEY            = "contueri-ambient-sound";
export const AMBIENT_VOLUME_KEY           = "contueri-ambient-volume";
export const AMBIENT_WAS_PLAYING_KEY      = "contueri-ambient-was-playing";
export const AMBIENT_DISCOVERY_SEEN_KEY   = "contueri-ambient-discovery-seen";

export function visioNoteKey(artworkId: string): string {
  return `kallos-visio-note-${artworkId}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

// One row in the journey-progress map. Keyed by journey slug.
export type JourneyProgressRecord = {
  completedDays: number[];
  updatedAt: string;
};

export type JourneyProgressMap = Record<string, JourneyProgressRecord>;

export type StreakSnapshot = {
  count: number;
  lastIso: string | null;  // YYYY-MM-DD or null if never completed
};

// ─── SSR guard ───────────────────────────────────────────────────────────────

// Every function in this module short-circuits to a safe default during
// server rendering. Consumers should always handle the "no data yet"
// case, since both SSR and a brand-new browser will return defaults.
function hasWindow(): boolean {
  return typeof window !== "undefined";
}

// ─── Onboarded flag ──────────────────────────────────────────────────────────
//
// Dual-write strategy (June 5, 2026): the flag now lives in BOTH a
// cookie AND localStorage.
//
//   - Cookie is the source of truth for SERVER-SIDE reads. Next.js
//     middleware reads it at the edge to short-circuit first-time
//     users from `/` → `/splash` without rendering Today first. This
//     eliminates the cold-launch "espresso placeholder + parchment
//     nav flash" that the layered NativeSplashController fix only
//     hides; middleware actually removes the work.
//
//   - localStorage is the fallback for the rare cases where Capacitor
//     WKWebView's cookie store doesn't survive a cold launch (iOS
//     WebView quirk; mostly resolved iOS 14+ but occasional reports
//     remain). The client-side hook reads both and accepts either.
//
// The cookie name MUST match the localStorage key so middleware and
// browser stay in sync.

const ONBOARDED_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function readOnboardedCookie(): boolean {
  if (!hasWindow()) return false;
  try {
    // Parse `document.cookie` for our key. Standard split-on-`;`
    // pattern; trim each pair; check key match.
    const pairs = document.cookie.split(";");
    for (const pair of pairs) {
      const eq = pair.indexOf("=");
      if (eq === -1) continue;
      const key = pair.slice(0, eq).trim();
      if (key === ONBOARDED_KEY) {
        const val = pair.slice(eq + 1).trim();
        return val === "true" || val === "1";
      }
    }
    return false;
  } catch {
    return false;
  }
}

function writeOnboardedCookie(value: boolean): void {
  if (!hasWindow()) return;
  try {
    const base = `${ONBOARDED_KEY}=${value ? "true" : ""}; path=/; samesite=lax`;
    // Production runs over HTTPS (contueri.app via Vercel + the
    // Capacitor live-URL); Secure flag protects the value in transit.
    // Local dev over http://localhost works without Secure.
    const secure =
      window.location.protocol === "https:" ? "; secure" : "";
    if (value) {
      document.cookie = `${base}; max-age=${ONBOARDED_COOKIE_MAX_AGE_SECONDS}${secure}`;
    } else {
      // Clear by setting max-age=0
      document.cookie = `${base}; max-age=0${secure}`;
    }
  } catch {
    /* ignore — cookies disabled */
  }
}

export function getOnboarded(): boolean {
  if (!hasWindow()) return false;
  // Either source counts. Cookie first (matches what middleware sees);
  // localStorage second (iOS WebView fallback + legacy users).
  if (readOnboardedCookie()) return true;
  try {
    return localStorage.getItem(ONBOARDED_KEY) !== null;
  } catch {
    return false;
  }
}

export function setOnboarded(value: boolean): void {
  if (!hasWindow()) return;
  // Dual-write so both surfaces stay in sync. localStorage may fail
  // (quota / disabled) — that's fine, cookie alone is enough for
  // middleware to pass. Cookie may fail (some embedded contexts) —
  // localStorage alone is enough for the client-side hook to return
  // true.
  try {
    if (value) localStorage.setItem(ONBOARDED_KEY, "true");
    else localStorage.removeItem(ONBOARDED_KEY);
  } catch {
    /* ignore */
  }
  writeOnboardedCookie(value);
}

// Used by the SplashClient migration path: returns true iff the user
// has localStorage set but no cookie. When true, SplashClient sets the
// cookie + redirects silently, avoiding showing the splash to someone
// who already onboarded before the middleware deploy.
export function isLegacyOnboardedWithoutCookie(): boolean {
  if (!hasWindow()) return false;
  if (readOnboardedCookie()) return false;
  try {
    return localStorage.getItem(ONBOARDED_KEY) !== null;
  } catch {
    return false;
  }
}

// ─── Streak ──────────────────────────────────────────────────────────────────

export function getStreak(): StreakSnapshot {
  if (!hasWindow()) return { count: 0, lastIso: null };
  try {
    const count = parseInt(localStorage.getItem(STREAK_COUNT_KEY) ?? "0", 10);
    const lastIso = localStorage.getItem(STREAK_LAST_KEY);
    return { count: Number.isFinite(count) ? count : 0, lastIso };
  } catch {
    return { count: 0, lastIso: null };
  }
}

export function setStreak(snapshot: StreakSnapshot): void {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(STREAK_COUNT_KEY, String(snapshot.count));
    if (snapshot.lastIso) localStorage.setItem(STREAK_LAST_KEY, snapshot.lastIso);
    else localStorage.removeItem(STREAK_LAST_KEY);
  } catch {
    /* ignore */
  }
}

// ─── Journey progress ────────────────────────────────────────────────────────

export function getJourneyProgressMap(): JourneyProgressMap {
  if (!hasWindow()) return {};
  try {
    const raw = localStorage.getItem(JOURNEY_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object" ? parsed : {}) as JourneyProgressMap;
  } catch {
    return {};
  }
}

export function getJourneyProgress(slug: string): number[] {
  const map = getJourneyProgressMap();
  return map[slug]?.completedDays ?? [];
}

export function setJourneyProgress(slug: string, completedDays: number[]): void {
  if (!hasWindow()) return;
  try {
    const map = getJourneyProgressMap();
    map[slug] = { completedDays, updatedAt: new Date().toISOString() };
    localStorage.setItem(JOURNEY_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

// ─── Visio note ──────────────────────────────────────────────────────────────

export function getVisioNote(artworkId: string): string {
  if (!hasWindow()) return "";
  try {
    return localStorage.getItem(visioNoteKey(artworkId)) ?? "";
  } catch {
    return "";
  }
}

export function setVisioNote(artworkId: string, note: string): void {
  if (!hasWindow()) return;
  try {
    if (note) localStorage.setItem(visioNoteKey(artworkId), note);
    else localStorage.removeItem(visioNoteKey(artworkId));
  } catch {
    /* ignore */
  }
}

// ─── Notification preferences ────────────────────────────────────────────────

// One row per notification type. daysOfWeek uses 0=Sunday..6=Saturday.
// Time string is "HH:MM" 24h local; consumers convert for display.
export type NotificationTypePref = {
  enabled: boolean;
  time: string;
  daysOfWeek: number[];
};

export type NotificationType = "pp" | "journey" | "streak" | "seasonal";

const NOTIF_KEY_MAP: Record<NotificationType, string> = {
  pp:       NOTIF_PP_KEY,
  journey:  NOTIF_JOURNEY_KEY,
  streak:   NOTIF_STREAK_KEY,
  seasonal: NOTIF_SEASONAL_KEY,
};

// Per-type defaults applied on first read. Time defaults come from the
// D-04 spec: P&P morning (7am), journey midday (noon), streak evening
// (8pm), seasonal morning (7am). All disabled by default per the
// Apple-post-2024 default-off guideline.
const NOTIF_DEFAULTS: Record<NotificationType, NotificationTypePref> = {
  pp:       { enabled: false, time: "07:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  journey:  { enabled: false, time: "12:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  streak:   { enabled: false, time: "20:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  seasonal: { enabled: false, time: "07:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
};

export function getNotificationTypePref(type: NotificationType): NotificationTypePref {
  const fallback = NOTIF_DEFAULTS[type];
  if (!hasWindow()) return fallback;
  try {
    const raw = localStorage.getItem(NOTIF_KEY_MAP[type]);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<NotificationTypePref>;
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : fallback.enabled,
      time: typeof parsed.time === "string" ? parsed.time : fallback.time,
      daysOfWeek: Array.isArray(parsed.daysOfWeek)
        ? parsed.daysOfWeek.filter((d) => typeof d === "number" && d >= 0 && d <= 6)
        : fallback.daysOfWeek,
    };
  } catch {
    return fallback;
  }
}

export function setNotificationTypePref(type: NotificationType, pref: NotificationTypePref): void {
  if (!hasWindow()) return;
  try {
    localStorage.setItem(NOTIF_KEY_MAP[type], JSON.stringify(pref));
  } catch {
    /* ignore */
  }
}

// Pre-permission rationale screen tracking. True once the user has
// seen and dismissed the rationale, regardless of whether they tapped
// "Allow" or "Not now." Subsequent first-toggle taps skip the screen
// and go straight to the iOS permission prompt (handled by W2
// OneSignal integration).
export function getNotificationRationaleShown(): boolean {
  if (!hasWindow()) return false;
  try {
    return localStorage.getItem(NOTIF_RATIONALE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setNotificationRationaleShown(value: boolean): void {
  if (!hasWindow()) return;
  try {
    if (value) localStorage.setItem(NOTIF_RATIONALE_KEY, "true");
    else localStorage.removeItem(NOTIF_RATIONALE_KEY);
  } catch {
    /* ignore */
  }
}

// ─── Ambient Sound preferences ──────────────────────────────────────────────
//
// Per CONTUERI-CC-Ambient-Sound-Brief.html (W2 Agent 2, June 5 build):
// these helpers persist the user's selected ambient sound, last volume,
// "was playing before cold launch" hint, and one-time discovery seen
// flag across launches. AmbientSoundProvider reads them on mount and
// writes them on every preference change.
//
// Sound slate is the 6 (minus nature) selected June 5: gregorian-chant,
// plainchant, light-piano, lofi-piano, gentle-rain, ocean-waves. The
// brief specced "nature-sounds" but Sheri replaced it with lofi-piano
// because nature didn't meet the contemplative register established by
// the splash + onboarding voice.

export type AmbientSoundId =
  | "gregorian-chant"
  | "plainchant"
  | "light-piano"
  | "lofi-piano"
  | "gentle-rain"
  | "ocean-waves";

export type AmbientPreferences = {
  /** Selected sound, null if user has never chosen one. */
  sound: AmbientSoundId | null;
  /** Volume in [0, 1]. Default 0.5. */
  volume: number;
  /**
   * UI hint persisted across cold launches: was the user actively playing
   * before they last quit / backgrounded? Used by the floating button to
   * show a subtle resume affordance — NOT used to auto-resume playback
   * (cold launch never auto-resumes per the brief's non-negotiable
   * autoplay policy).
   */
  wasPlaying: boolean;
  /** True once the user has seen the first-launch discovery surfacing. */
  discoverySeen: boolean;
};

// Defaults for SSR + brand-new browser. Components must handle this state.
const AMBIENT_DEFAULTS: AmbientPreferences = {
  sound: null,
  volume: 0.5,
  wasPlaying: false,
  discoverySeen: false,
};

const VALID_SOUND_IDS: ReadonlySet<AmbientSoundId> = new Set([
  "gregorian-chant",
  "plainchant",
  "light-piano",
  "lofi-piano",
  "gentle-rain",
  "ocean-waves",
]);

export function getAmbientPreferences(): AmbientPreferences {
  if (!hasWindow()) return { ...AMBIENT_DEFAULTS };
  try {
    const rawSound = localStorage.getItem(AMBIENT_SOUND_KEY);
    const sound =
      rawSound && VALID_SOUND_IDS.has(rawSound as AmbientSoundId)
        ? (rawSound as AmbientSoundId)
        : null;

    const rawVolume = localStorage.getItem(AMBIENT_VOLUME_KEY);
    const parsedVolume = rawVolume === null ? NaN : Number(rawVolume);
    const volume = Number.isFinite(parsedVolume)
      ? Math.min(1, Math.max(0, parsedVolume))
      : AMBIENT_DEFAULTS.volume;

    const wasPlaying =
      localStorage.getItem(AMBIENT_WAS_PLAYING_KEY) === "true";

    const discoverySeen =
      localStorage.getItem(AMBIENT_DISCOVERY_SEEN_KEY) === "true";

    return { sound, volume, wasPlaying, discoverySeen };
  } catch {
    return { ...AMBIENT_DEFAULTS };
  }
}

export function setAmbientSound(id: AmbientSoundId | null): void {
  if (!hasWindow()) return;
  try {
    if (id === null) {
      localStorage.removeItem(AMBIENT_SOUND_KEY);
    } else if (VALID_SOUND_IDS.has(id)) {
      localStorage.setItem(AMBIENT_SOUND_KEY, id);
    }
  } catch {
    /* ignore */
  }
}

export function setAmbientVolume(v: number): void {
  if (!hasWindow()) return;
  if (!Number.isFinite(v)) return;
  const clamped = Math.min(1, Math.max(0, v));
  try {
    localStorage.setItem(AMBIENT_VOLUME_KEY, String(clamped));
  } catch {
    /* ignore */
  }
}

export function setAmbientWasPlaying(b: boolean): void {
  if (!hasWindow()) return;
  try {
    if (b) localStorage.setItem(AMBIENT_WAS_PLAYING_KEY, "true");
    else localStorage.removeItem(AMBIENT_WAS_PLAYING_KEY);
  } catch {
    /* ignore */
  }
}

export function setAmbientDiscoverySeen(b: boolean): void {
  if (!hasWindow()) return;
  try {
    if (b) localStorage.setItem(AMBIENT_DISCOVERY_SEEN_KEY, "true");
    else localStorage.removeItem(AMBIENT_DISCOVERY_SEEN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Static metadata for each sound in the slate. Mirrors the
 * /public/music/ filenames produced by the June 5 gapless-loop
 * pipeline (see public/music/README.md). The provider uses this list
 * to build the picker UI and resolve sound IDs to audio file URLs.
 */
export const AMBIENT_SOUNDS: ReadonlyArray<{
  id: AmbientSoundId;
  label: string;
  file: string;
}> = [
  { id: "gregorian-chant", label: "Gregorian Chant", file: "/music/ambient-gregorian-chant.mp3" },
  { id: "plainchant",      label: "Plainchant",      file: "/music/ambient-plainchant.mp3" },
  { id: "light-piano",     label: "Light Piano",     file: "/music/ambient-light-piano.mp3" },
  { id: "lofi-piano",      label: "Lofi Piano",      file: "/music/ambient-lofi-piano.mp3" },
  { id: "gentle-rain",     label: "Gentle Rain",     file: "/music/ambient-gentle-rain.mp3" },
  { id: "ocean-waves",     label: "Ocean Waves",     file: "/music/ambient-ocean-waves.mp3" },
];
