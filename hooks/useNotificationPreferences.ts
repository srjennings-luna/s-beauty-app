"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotificationTypePref,
  setNotificationTypePref,
  getNotificationRationaleShown,
  setNotificationRationaleShown,
  type NotificationType,
  type NotificationTypePref,
} from "@/lib/userData";
import { syncNotificationTags } from "@/lib/onesignal";

// Per-D-04-locked-spec hook for the notification preferences UI.
// Mirrors useAmbientPreferences / useOnboarded shape: reads through the
// auth-ready data layer (lib/userData.ts). When auth ships, the
// underlying storage swaps to per-user records without changing this
// hook's surface.
//
// One state object holds all four notification types. Setter mutates a
// single type and persists the slice. Components consume via this hook;
// the W2 OneSignal integration consumes the same data to populate user
// segments and scheduled-send rules.
//
// `ready` is false during SSR + first effect tick; gate UI on it the
// same way the other hooks do.

export type AllPrefs = Record<NotificationType, NotificationTypePref>;

const TYPES: NotificationType[] = ["pp", "journey", "streak", "seasonal"];

export default function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<AllPrefs | null>(null);
  const [rationaleShown, setRationaleShownState] = useState<boolean>(false);
  const ready = prefs !== null;

  useEffect(() => {
    const initial: AllPrefs = {
      pp:       getNotificationTypePref("pp"),
      journey:  getNotificationTypePref("journey"),
      streak:   getNotificationTypePref("streak"),
      seasonal: getNotificationTypePref("seasonal"),
    };
    setPrefs(initial);
    setRationaleShownState(getNotificationRationaleShown());
  }, []);

  const updateType = useCallback(
    (type: NotificationType, patch: Partial<NotificationTypePref>) => {
      setPrefs((prev) => {
        if (!prev) return prev;
        const next = { ...prev[type], ...patch };
        setNotificationTypePref(type, next);
        const nextAll = { ...prev, [type]: next };
        // Mirror the change to OneSignal user tags so the dashboard's
        // segments stay in sync with what the user just set. No-op on
        // web (Capacitor.isNativePlatform() guard inside the helper).
        // Fire-and-forget — failures log but don't block UI.
        void syncNotificationTags(nextAll);
        return nextAll;
      });
    },
    [],
  );

  const markRationaleShown = useCallback(() => {
    setNotificationRationaleShown(true);
    setRationaleShownState(true);
  }, []);

  // Convenience: does any type have enabled === true? Used to gate the
  // pre-permission rationale show-once logic from the page.
  const anyEnabled = ready
    ? TYPES.some((t) => prefs![t].enabled)
    : false;

  return { prefs, ready, anyEnabled, rationaleShown, updateType, markRationaleShown };
}
