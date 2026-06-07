// Contueri · OneSignal integration
//
// Thin wrapper around @onesignal/capacitor-plugin so the rest of the
// app can call typed helpers (initOneSignal, requestNotificationPermission,
// syncNotificationTags) without each call site repeating the
// "is this native? dynamic-import the plugin? catch errors?" boilerplate.
//
// Every helper:
//   1. No-ops on web (Capacitor.isNativePlatform() === false). Means the
//      Vercel-served live preview, Sanity Presentation iframe, and any
//      desktop Safari test all just silently skip the OneSignal work
//      instead of throwing.
//   2. Dynamically imports the plugin so SSR + Next.js build don't try
//      to load native code at compile time.
//   3. Catches errors and console.warns rather than throwing. Push is
//      a nice-to-have; if it breaks, the rest of the app keeps working.
//
// The App ID is the OneSignal "public" identifier — meant to be embedded
// in client code. It's NOT a secret (the REST API Key would be the
// secret, and we don't expose that here — server-side automation only).
//
// Architecture: this module is imported by:
//   - components/OneSignalInitializer.tsx (mounts in root layout, calls
//     initOneSignal + tagLastOpenDate on every cold launch)
//   - app/settings/notifications/page.tsx (acceptRationale fires the
//     iOS permission prompt via requestNotificationPermission)
//   - hooks/useNotificationPreferences.ts (syncs preference toggles to
//     OneSignal user tags via syncNotificationTags)

import { Capacitor } from "@capacitor/core";
import type {
  NotificationType,
  NotificationTypePref,
} from "@/lib/userData";

/**
 * Mirror of useNotificationPreferences' `AllPrefs` shape. Inlined here
 * to avoid a hook→lib circular dependency. If the canonical type ever
 * moves to lib/userData.ts, switch this to a re-export.
 */
export type AllNotificationPrefs = Record<NotificationType, NotificationTypePref>;

// OneSignal app identifier. Public by design — embedded in client code.
// Created June 6, 2026 in the Contueri app's OneSignal account.
// Apple iOS (APNs) configuration uses Auth Key CBXQ6PC624 (Sheri's
// Apple Developer team X6HT86XZVP, bundle id app.contueri.ios).
export const ONESIGNAL_APP_ID = "c49ea9b5-2f9d-4d61-8ca5-ab3f55ea7d85";

let initialized = false;

/**
 * Initialize the OneSignal SDK. Safe to call multiple times — guarded by
 * `initialized` so subsequent calls return immediately. Called once at
 * app boot from <OneSignalInitializer/>.
 */
export async function initOneSignal(): Promise<void> {
  if (initialized) return;
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { default: OneSignal } = await import("@onesignal/capacitor-plugin");
    await OneSignal.initialize(ONESIGNAL_APP_ID);
    initialized = true;
  } catch (e) {
    console.warn("[onesignal] init failed", e);
  }
}

/**
 * Trigger the iOS permission prompt. Returns true if the user grants
 * permission, false if denied or if we're on web (no-op).
 *
 * Called from notifications page's acceptRationale handler — only AFTER
 * the user has accepted Contueri's own contextual rationale. iOS shows
 * its system prompt once per install; after that, the user has to flip
 * the toggle in iOS Settings → Notifications themselves.
 *
 * `fallbackToSettings=true` means: if the user has already denied once,
 * tapping "enable" again opens iOS Settings → Notifications for them
 * instead of silently doing nothing.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { default: OneSignal } = await import("@onesignal/capacitor-plugin");
    // The plugin's typing returns Promise<void> on the top-level API and
    // Promise<boolean> on the namespaced one. Cast loosely + check the
    // current permission state afterwards for the actual answer.
    await OneSignal.Notifications.requestPermission(true);
    return !!OneSignal.Notifications.hasPermission();
  } catch (e) {
    console.warn("[onesignal] requestPermission failed", e);
    return false;
  }
}

/**
 * Set OneSignal user tags. Tags are key/value strings OneSignal uses for
 * audience segmentation in the dashboard (e.g. "send to users where
 * pp_enabled=true AND pp_hour=8").
 */
export async function setOneSignalTags(
  tags: Record<string, string>,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { default: OneSignal } = await import("@onesignal/capacitor-plugin");
    await OneSignal.User.addTags(tags);
  } catch (e) {
    console.warn("[onesignal] addTags failed", e);
  }
}

/**
 * Tag the current device with today's date (YYYY-MM-DD in user's local
 * timezone). The streak notification segment uses this tag: send streak
 * push only to devices where last_open_date != today AND streak_enabled
 * = true. Called from <OneSignalInitializer/> on every cold launch.
 */
export async function tagLastOpenDate(): Promise<void> {
  const now = new Date();
  // YYYY-MM-DD in local time (NOT UTC) — streak day-of-year is meaningful
  // in the user's timezone, not server time.
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  await setOneSignalTags({ last_open_date: today });
}

/**
 * Sync the user's notification preferences (4 types × on/off + time +
 * day-of-week) to OneSignal user tags. Called whenever the user toggles
 * a preference in the notifications page.
 *
 * Each type produces three tags:
 *   {type}_enabled  — "true" | "false"
 *   {type}_time     — "HH:MM" (24-hour, local TZ)
 *   {type}_days     — comma-separated day numbers 0-6 (0=Sun)
 *
 * OneSignal's dashboard uses these tags to build delivery segments:
 *   "send to users where pp_enabled=true AND pp_time=07:00 AND pp_days contains 1"
 *
 * Tag values must be strings (OneSignal limitation).
 */
export async function syncNotificationTags(
  prefs: AllNotificationPrefs,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const tags: Record<string, string> = {};
  for (const typeId of ["pp", "journey", "streak", "seasonal"] as const) {
    const typePref = prefs[typeId];
    tags[`${typeId}_enabled`] = typePref.enabled ? "true" : "false";
    tags[`${typeId}_time`] = typePref.time;
    tags[`${typeId}_days`] = typePref.daysOfWeek.join(",");
  }
  await setOneSignalTags(tags);
}
