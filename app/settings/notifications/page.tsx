"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/ui/PageTransition";
import useNotificationPreferences from "@/hooks/useNotificationPreferences";
import type { NotificationType, NotificationTypePref } from "@/lib/userData";
import {
  requestNotificationPermission,
  syncNotificationTags,
} from "@/lib/onesignal";

// Notification preferences UI (/settings/notifications).
//
// Per D-04 locked spec (CLAUDE.md June 2, 2026 evening · Launch readiness):
//   - 4 notification types: P&P, journey day, streak, seasonal
//   - Each type: on/off + time-of-day + day-of-week selectors
//   - All four off by default
//   - Streak fires only when user has not opened the app that day
//     (handled W2 via OneSignal user-tag segmentation)
//   - Pre-permission rationale screen before iOS asks
//   - Contemplative copy register, not gamified ("waiting for you"
//     not "don't break your streak")
//
// This page is the UI scaffold. The actual OneSignal API wire-up
// happens in W2 once the APNs cert is generated (gated on Apple
// Developer enrollment activation). For v1.0 W1 build the page
// persists preferences locally via lib/userData.ts; W2 reads the
// same data and pushes to OneSignal segments + scheduled-send rules.
//
// Pre-permission rationale: shown the FIRST time the user enables any
// toggle. Sets contueri-notif-rationale-shown afterwards so it never
// shows again. Once dismissed, subsequent toggles trigger the iOS
// permission prompt directly (W2 wire-up).

// ─── Type metadata ───────────────────────────────────────────────────────────

type TypeMeta = {
  id: NotificationType;
  title: string;
  description: string;
};

const TYPE_META: TypeMeta[] = [
  {
    id: "pp",
    title: "Daily Pause & Ponder",
    description:
      "Today's painting, proof, text, or life is ready. Sent at the time you set.",
  },
  {
    id: "journey",
    title: "Journey reminder",
    description:
      "If you have an active journey, a gentle nudge to continue today's day.",
  },
  {
    id: "streak",
    title: "If you haven't been here",
    description:
      "A quiet check-in at the end of the day, only if you haven't opened Contueri today.",
  },
  {
    id: "seasonal",
    title: "Seasonal moments",
    description:
      "Lent, Holy Week, Advent, and significant feast days when the content calendar marks them.",
  },
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_LONG = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Toggle component ────────────────────────────────────────────────────────

function Toggle({
  on,
  onChange,
  ariaLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 26,
        background: on ? "#7a9a8a" : "rgba(22,17,13,0.15)",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s ease",
        flexShrink: 0,
        // No rounded corners per design system; pill shape was tempting
        // but contradicts the rule. Square toggle reads as deliberate.
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 22 : 3,
          width: 20,
          height: 20,
          background: "#ffffff",
          transition: "left 0.2s ease",
          boxShadow: "0 1px 3px rgba(22,17,13,0.18)",
          display: "block",
        }}
      />
    </button>
  );
}

// ─── Day-of-week chip selector ───────────────────────────────────────────────

function DaysOfWeek({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (next: number[]) => void;
}) {
  const toggle = (day: number) => {
    if (selected.includes(day)) onChange(selected.filter((d) => d !== day));
    else onChange([...selected, day].sort((a, b) => a - b));
  };
  return (
    <div className="flex items-center gap-1.5">
      {DAY_LABELS.map((label, i) => {
        const on = selected.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            aria-label={`Toggle ${DAY_LONG[i]}`}
            aria-pressed={on}
            style={{
              width: 32,
              height: 32,
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: on ? "#ffffff" : "#4a7a62",
              background: on ? "#4a7a62" : "transparent",
              border: `1px solid ${on ? "#4a7a62" : "rgba(74,122,98,0.4)"}`,
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Per-type row ────────────────────────────────────────────────────────────

function NotificationTypeRow({
  meta,
  pref,
  onChange,
  onFirstEnable,
}: {
  meta: TypeMeta;
  pref: NotificationTypePref;
  onChange: (patch: Partial<NotificationTypePref>) => void;
  onFirstEnable: () => void;
}) {
  const toggle = (next: boolean) => {
    if (next && !pref.enabled) onFirstEnable();
    onChange({ enabled: next });
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px 22px",
        marginBottom: 14,
        border: "1px solid rgba(22,17,13,0.10)",
      }}
    >
      {/* Top row: title + description (left), toggle (right) */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 14.5,
              fontWeight: 600,
              color: "#16110d",
              marginBottom: 6,
              letterSpacing: "0.01em",
            }}
          >
            {meta.title}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
              fontSize: 13,
              lineHeight: 1.55,
              color: "#3d3530",
            }}
          >
            {meta.description}
          </p>
        </div>
        <Toggle
          on={pref.enabled}
          onChange={toggle}
          ariaLabel={`Toggle ${meta.title}`}
        />
      </div>

      {/* Revealed when toggle is on: time + day-of-week selectors */}
      {pref.enabled && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: "0.5px solid rgba(22,17,13,0.10)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <label
              htmlFor={`time-${meta.id}`}
              style={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#7a9a8a",
              }}
            >
              Time
            </label>
            <input
              id={`time-${meta.id}`}
              type="time"
              value={pref.time}
              onChange={(e) => onChange({ time: e.target.value })}
              style={{
                fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                fontSize: 15,
                color: "#16110d",
                background: "transparent",
                border: "0.5px solid rgba(22,17,13,0.18)",
                padding: "6px 10px",
              }}
            />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span
              style={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#7a9a8a",
              }}
            >
              Days
            </span>
            <DaysOfWeek
              selected={pref.daysOfWeek}
              onChange={(next) => onChange({ daysOfWeek: next })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pre-permission rationale modal ──────────────────────────────────────────
//
// A11y polish (June 3, 2026 audit findings):
//   - Auto-focus the Continue button on open (primary action default)
//   - Trap focus inside the modal: Tab from last focusable element wraps
//     to the first, Shift+Tab from first wraps to the last
//   - Restore focus to the element that opened the modal (the
//     triggering toggle) on close, captured via document.activeElement
//     at mount
//   - Escape key calls onSkip() so keyboard users can dismiss

function RationaleModal({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const continueRef  = useRef<HTMLButtonElement>(null);
  // Captured at mount so we can restore focus to the triggering toggle
  // on unmount, regardless of whether the user dismissed via Continue,
  // Not now, Escape, or outside tap (no outside-tap-to-dismiss in this
  // modal by design, but the ref still survives all close paths).
  const triggerRef   = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    // Defer the focus call one tick so iOS Safari renders the modal
    // before we move focus. Same pattern used in other Settings flows.
    const t = window.setTimeout(() => continueRef.current?.focus(), 0);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
        return;
      }
      if (e.key !== "Tab") return;
      const container = containerRef.current;
      if (!container) return;
      const focusables = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", handleKey);
      // Restore focus to the triggering element on unmount. Safari
      // sometimes drops focus during DOM removal; guard with optional
      // chaining + cast to HTMLElement for focus() availability.
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [onSkip]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-rationale-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "rgba(22,17,13,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "env(safe-area-inset-bottom, 24px)",
      }}
    >
      <div
        style={{
          background: "#fdf6e9",
          maxWidth: 480,
          width: "100%",
          margin: 16,
          padding: "32px 24px 24px",
          border: "1px solid rgba(22,17,13,0.10)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7a9a8a",
            marginBottom: 14,
          }}
        >
          Before iOS asks
        </p>
        <h2
          id="notif-rationale-title"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontStyle: "italic",
            fontSize: 30,
            fontWeight: 500,
            color: "#1a1a1a",
            lineHeight: 1.05,
            marginBottom: 14,
          }}
        >
          A quiet word about notifications
        </h2>
        <p
          style={{
            fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
            fontSize: 14.5,
            lineHeight: 1.65,
            color: "#3d3530",
            marginBottom: 12,
          }}
        >
          Contueri sends only the reminders you ask for. No marketing. No
          interruption you did not choose. You can turn each one off any
          time, and you can leave them all off and the app works the same.
        </p>
        <p
          style={{
            fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
            fontSize: 14.5,
            lineHeight: 1.65,
            color: "#3d3530",
            marginBottom: 24,
          }}
        >
          When you tap Continue, iOS will ask if Contueri can send you
          notifications. Allow it once and the reminders you set on this
          screen will start arriving.
        </p>
        <div className="flex items-center justify-end gap-12">
          <button
            type="button"
            onClick={onSkip}
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#978b7d",
              background: "transparent",
              padding: "10px 4px",
              cursor: "pointer",
            }}
          >
            Not now
          </button>
          <button
            ref={continueRef}
            type="button"
            onClick={onContinue}
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#ffffff",
              background: "#16110d",
              padding: "12px 24px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const { prefs, ready, rationaleShown, updateType, markRationaleShown } =
    useNotificationPreferences();
  const [showRationale, setShowRationale] = useState(false);
  // Stash the first-enable patch so we can apply it after the user
  // accepts the rationale prompt. Without this, toggling on twice would
  // re-show the rationale instead of completing the enable.
  const [pendingEnable, setPendingEnable] = useState<NotificationType | null>(null);

  const handleFirstEnable = (type: NotificationType) => {
    if (!rationaleShown) {
      setPendingEnable(type);
      setShowRationale(true);
      // Revert the toggle that just fired; we'll re-apply on Continue
      updateType(type, { enabled: false });
    }
  };

  const acceptRationale = () => {
    markRationaleShown();
    setShowRationale(false);
    if (pendingEnable) {
      updateType(pendingEnable, { enabled: true });
      setPendingEnable(null);
    }
    // Trigger the iOS permission prompt via OneSignal SDK. On accept,
    // OneSignal registers the APNs token automatically and the device
    // becomes addressable from the dashboard. On decline, the toggle
    // stays "enabled" in our local prefs but iOS won't deliver pushes —
    // user must flip Settings → Notifications → Contueri themselves.
    // The fallbackToSettings=true behaviour (handled inside
    // requestNotificationPermission) means a second tap will open iOS
    // Settings directly instead of silently failing.
    void requestNotificationPermission();
  };

  const skipRationale = () => {
    markRationaleShown();
    setShowRationale(false);
    setPendingEnable(null);
    // User declined the rationale; toggle stays off. The "shown" flag
    // still flips so this prompt does not nag on every subsequent
    // toggle attempt. If they later turn one on, the OS-level prompt
    // fires directly.
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment pb-28">

        {/* Zone 1: slim nav */}
        <div
          className="bg-parchment"
          style={{
            borderBottom: "0.5px solid rgba(22,17,13,0.18)",
            paddingTop: "env(safe-area-inset-top, 16px)",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ height: 46, padding: "0 14px" }}
          >
            <Link
              href="/settings"
              aria-label="Back"
              className="w-8 h-8 flex items-center justify-center"
              style={{ color: "#16110d" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
              </svg>
            </Link>
            <div className="flex-1 flex items-center justify-center">
              <span
                style={{
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontSize: 12.5,
                  fontWeight: 600,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#16110d",
                }}
              >
                Contueri
              </span>
            </div>
            <div style={{ width: 32, height: 32 }} />
          </div>
        </div>

        {/* Zone 2: editorial header */}
        <div
          className="bg-parchment"
          style={{
            padding: "28px 22px 22px",
            borderBottom: "0.5px solid rgba(22,17,13,0.22)",
          }}
        >
          <div className="text-center">
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontStyle: "italic",
                fontSize: 40,
                fontWeight: 500,
                color: "#1a1a1a",
                letterSpacing: "0.003em",
                lineHeight: 1.02,
                margin: 0,
              }}
            >
              Notifications
            </h1>
            <p
              className="italic"
              style={{
                fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                fontSize: 14,
                color: "#978b7d",
                marginTop: 18,
              }}
            >
              Set the reminders you actually want. All off by default.
            </p>
          </div>
        </div>

        {/* Body: per-type cards */}
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "24px 16px 16px",
          }}
        >
          {ready && prefs ? (
            TYPE_META.map((meta) => (
              <NotificationTypeRow
                key={meta.id}
                meta={meta}
                pref={prefs[meta.id]}
                onChange={(patch) => updateType(meta.id, patch)}
                onFirstEnable={() => handleFirstEnable(meta.id)}
              />
            ))
          ) : (
            <p
              style={{
                fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                fontSize: 13,
                color: "#978b7d",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              Loading your preferences&hellip;
            </p>
          )}

          {/* Footer hint about iOS-level control */}
          <p
            style={{
              fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
              fontSize: 12,
              color: "#978b7d",
              fontStyle: "italic",
              textAlign: "center",
              marginTop: 24,
              padding: "0 18px",
              lineHeight: 1.6,
            }}
          >
            You can also pause everything from your device&apos;s Settings app
            without losing the times and days you set here.
          </p>
        </div>

      </div>

      {showRationale && (
        <RationaleModal onContinue={acceptRationale} onSkip={skipRationale} />
      )}
    </PageTransition>
  );
}
