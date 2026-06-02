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
// A thin JourneyContinueStrip sits above the P&P content when the user
// has a journey in progress, surfacing the single most-recently-touched
// active journey. If no journey is active, the strip is null and Today
// is pure P&P. Multi-journey users navigate to the Journeys tab to see
// the full list.
//
// PromptClient is rendered in homeMode so its chrome header drops the
// fixed-positioning behavior (the strip needs the top of the scroll) and
// suppresses the back chevron (there is nowhere to go back to from the
// landing route).
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

  return (
    <>
      <JourneyContinueStrip />
      <PromptClient homeMode />
    </>
  );
}
