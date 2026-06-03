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

  return { onboarded, markOnboarded };
}
