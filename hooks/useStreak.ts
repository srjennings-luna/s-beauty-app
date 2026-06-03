"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getStreak,
  setStreak,
  type StreakSnapshot,
} from "@/lib/userData";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayIso(): string {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return y.toISOString().slice(0, 10);
}

// Streak state + a markCompleted action used by P&P (and any future
// surface where "the user did today's contemplation" is the signal).
// The increment rule is the same one PromptClient has run since March
// 2026: completing on the day-after-last bumps the count by one;
// completing after a gap resets to one; completing twice on the same
// day is a no-op. Internal to the hook; consumers just call
// markCompleted() when their integration condition fires.
//
// Auth-ready: implementation swap moves the get/set out of localStorage
// without changing this hook's surface.
export default function useStreak() {
  const [snapshot, setSnapshot] = useState<StreakSnapshot>({ count: 0, lastIso: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSnapshot(getStreak());
    setReady(true);
  }, []);

  const markCompleted = useCallback(() => {
    const today = todayIso();
    const current = getStreak();
    if (current.lastIso === today) return; // already counted today

    const next: StreakSnapshot = {
      count: current.lastIso === yesterdayIso() ? current.count + 1 : 1,
      lastIso: today,
    };
    setStreak(next);
    setSnapshot(next);
  }, []);

  return { streak: snapshot.count, lastIso: snapshot.lastIso, ready, markCompleted };
}
