"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PromptClient from "./prompt/PromptClient";
import useOnboarded from "@/hooks/useOnboarded";

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
  // useOnboarded reads through the auth-ready data layer
  // (lib/userData.ts). Today it resolves from localStorage; when auth
  // ships it resolves from the authenticated user record. Hook surface
  // does not change, so this gate stays the same code.
  const { onboarded } = useOnboarded();
  const [iframeBypass, setIframeBypass] = useState(false);

  useEffect(() => {
    // Never run the onboarding gate inside an iframe (Sanity Presentation
    // preview). Without this, every preview session starts with no
    // user data and bounces to /splash, hijacking the iframe.
    if (typeof window !== "undefined" && window.self !== window.top) {
      setIframeBypass(true);
      return;
    }
    if (onboarded === false) {
      router.push("/splash");
    }
  }, [onboarded, router]);

  // Hold a blank parchment surface while the onboarding gate decides
  // whether to redirect. Avoids a single-frame flash of the espresso
  // P&P atmosphere before sending a first-time user to /splash.
  const resolved = iframeBypass || onboarded === true;
  if (!resolved) {
    return <div className="min-h-screen bg-parchment" />;
  }

  return <PromptClient />;
}
