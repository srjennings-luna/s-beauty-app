"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PromptClient from "./prompt/PromptClient";

// Today landing.
//
// Per the March 30, 2026 decision and the June 2 design lock: Today IS the
// daily Pause & Ponder experience. No tap-to-begin gate, no dashboard
// surface of Journeys / Explore, no separate header chrome. The user
// opens the app and lands directly inside today's contemplative moment.
//
// JourneyContinueStrip rollback (June 2, 2026): the strip component
// remains in the repo at components/JourneyContinueStrip.tsx but is no
// longer rendered here. Earlier attempts to surface it above the chrome
// row failed to render reliably on device despite multiple stacking-
// context fixes. The leading hypothesis is a slug mismatch between
// localStorage progress records and Sanity's slug.current, but cost of
// further iteration outweighed the value of an auxiliary surface.
// Backlog item: revisit with a fresh investigation in a dedicated build.
// Today now collapses to pure P&P, matching standalone /prompt.
export default function TodayPage() {
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    // Never run the onboarding gate inside an iframe (Sanity Presentation
    // preview). Without this, every preview session starts with no
    // localStorage and bounces to /splash, hijacking the iframe.
    const inIframe = typeof window !== "undefined" && window.self !== window.top;
    if (inIframe) {
      setHasOnboarded(true);
      return;
    }
    const onboarded = localStorage.getItem("contueri-onboarded");
    if (!onboarded) {
      router.push("/splash");
    } else {
      setHasOnboarded(true);
    }
  }, [router]);

  // Hold a blank parchment surface while the onboarding gate decides
  // whether to redirect. Avoids a single-frame flash of the espresso
  // P&P atmosphere before sending a first-time user to /splash.
  if (hasOnboarded === null) {
    return <div className="min-h-screen bg-parchment" />;
  }

  return <PromptClient />;
}
