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

export function getOnboarded(): boolean {
  if (!hasWindow()) return false;
  try {
    return localStorage.getItem(ONBOARDED_KEY) !== null;
  } catch {
    return false;
  }
}

export function setOnboarded(value: boolean): void {
  if (!hasWindow()) return;
  try {
    if (value) localStorage.setItem(ONBOARDED_KEY, "true");
    else localStorage.removeItem(ONBOARDED_KEY);
  } catch {
    /* ignore quota / disabled-storage errors */
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
