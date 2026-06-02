"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PromptClient from "./prompt/PromptClient";
import JourneyContinueStrip from "@/components/JourneyContinueStrip";

// Today landing.
//
// Per the March 30, 2026 decision and the June 2 design lock: Today IS the
// daily Pause & Ponder experience. No tap-to-begin gate, no dashboard
// surface of Journeys / Explore, no separate header chrome. The user
// opens the app and lands directly inside today's contemplative moment.
//
// JourneyContinueStrip is passed to PromptClient via the topSlot prop so
// it renders INSIDE the fixed top chrome (above the back/heart/share/
// music row) and stays in the same stacking context as the P&P gradient.
// Rendering the strip as a sibling outside PromptClient would put it
// behind the gradient because of the fixed-position layering.
//
// The strip returns null when no journey is in progress, collapsing the
// top chrome back to just the chrome row. Multi-journey users see only
// the most-recently-touched journey here; the Journeys tab carries the
// full picture.
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

  return <PromptClient topSlot={<JourneyContinueStrip />} />;
}
