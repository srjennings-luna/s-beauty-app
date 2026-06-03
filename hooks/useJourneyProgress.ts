"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getJourneyProgress,
  getJourneyProgressMap,
  setJourneyProgress,
  type JourneyProgressMap,
} from "@/lib/userData";

// Per-journey progress hook. Used by JourneyDetailClient to drive the
// completed-day badge UI and by the future continue-strip revisit.
// Returns the completedDays array for the given slug plus a
// markDayComplete action. SSR / first-render returns an empty list.
//
// Auth-ready: implementation swap moves the underlying read/write off
// localStorage onto the authenticated user record. Hook surface does
// not change.
export function useJourneyProgress(slug: string | null | undefined) {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!slug) {
      setCompletedDays([]);
      setReady(true);
      return;
    }
    setCompletedDays(getJourneyProgress(slug));
    setReady(true);
  }, [slug]);

  const markDayComplete = useCallback(
    (dayNumber: number) => {
      if (!slug) return;
      const current = getJourneyProgress(slug);
      if (current.includes(dayNumber)) return;
      const next = [...current, dayNumber].sort((a, b) => a - b);
      setJourneyProgress(slug, next);
      setCompletedDays(next);
    },
    [slug],
  );

  return { completedDays, ready, markDayComplete };
}

// Global progress map. Used by the journeys index page to badge each
// journey card with completion state, and by the future continue-strip
// revisit to pick the most-recently-touched active journey.
export function useAllJourneyProgress() {
  const [progressMap, setProgressMap] = useState<JourneyProgressMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgressMap(getJourneyProgressMap());
    setReady(true);
  }, []);

  return { progressMap, ready };
}
