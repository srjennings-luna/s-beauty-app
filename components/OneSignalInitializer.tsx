"use client";

import { useEffect } from "react";
import { initOneSignal, tagLastOpenDate } from "@/lib/onesignal";

// Contueri · OneSignalInitializer
//
// Boots the OneSignal SDK once per cold app launch and tags the device
// with today's date for streak segmentation. Mounts at the root layout
// level so it runs regardless of which route the user lands on.
//
// Why a dedicated component instead of inline in app/layout.tsx:
//   - layout.tsx is a Server Component. OneSignal init must run in the
//     browser (Capacitor's native bridge isn't reachable from SSR).
//   - Centralizing this in one component makes it easy to add future
//     boot-time concerns (in-app message lifecycle listeners, login,
//     consent flow) without bloating layout.tsx.
//
// Render output is null — this is a side-effect-only component.
//
// `initOneSignal` is idempotent (guarded by an internal `initialized`
// flag) so React strict mode's double-effect-in-dev doesn't cause two
// initializations.
//
// `tagLastOpenDate` runs AFTER init so the SDK has a user context to
// attach the tag to. It's safe to run on every launch because OneSignal
// debounces identical tag values server-side.

export default function OneSignalInitializer() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initOneSignal();
      if (cancelled) return;
      await tagLastOpenDate();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
