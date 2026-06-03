"use client";

import { useEffect, useState } from "react";
import { getOnboarded, setOnboarded } from "@/lib/userData";

// Returns the user's onboarded state and a setter that flips the flag to
// true (used by SplashClient when the user finishes or skips the
// splash). `onboarded === null` during the first render and during SSR;
// becomes a boolean once the client effect runs. Consumers redirect to
// the splash when it resolves to false. Auth-ready: when auth ships,
// the underlying lib/userData functions swap from localStorage to the
// authenticated user record; this hook's API does not change.
export default function useOnboarded() {
  const [onboarded, setOnboardedState] = useState<boolean | null>(null);

  useEffect(() => {
    setOnboardedState(getOnboarded());
  }, []);

  const markOnboarded = () => {
    setOnboarded(true);
    setOnboardedState(true);
  };

  // resetOnboarded flips the flag back to false so the next visit to
  // the Today page redirects to the splash. Used by the Settings page
  // "Restart onboarding" row so the user can intentionally re-see the
  // splash experience.
  const resetOnboarded = () => {
    setOnboarded(false);
    setOnboardedState(false);
  };

  return { onboarded, markOnboarded, resetOnboarded };
}
