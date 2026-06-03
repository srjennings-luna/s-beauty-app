// Notification copy library for Contueri push notifications.
//
// Single source of truth consumed by the W2 OneSignal integration and
// the notification preferences UI (Settings -> Notifications). Replaces
// scattered string literals.
//
// Source content: KALLOS-Notification-Copy.html (drafted May 20, 2026
// by Sheri's editorial voice), rebranded to Contueri and mapped onto
// the D-04 locked four-type structure (P&P, journey day, streak,
// seasonal). Streak copy is new here; the original draft predated the
// streak type and explicitly excluded "streak warnings" from the
// allowed categories. The new streak voice in this file keeps that
// rule: the language signals "today is still here" rather than
// "you're about to break something."
//
// VOICE RULES (enforced when adding new variants):
//   - One sentence. One full stop.
//   - Title under 40 characters. Body under 90 characters.
//   - Past tense for content arrival ("Today's prompt is ready" not
//     "Open today's prompt").
//   - Concrete detail in body when possible (artist name, day number,
//     theme, season).
//   - Default to no body text. The title alone is often enough.
//   - No exclamation marks.
//   - No emoji.
//   - No urgency manipulation ("Don't miss," "Last chance," "Hurry").
//   - No "Tap to," "Click to," "Open now."
//   - No re-engagement nags ("It's been three days," "We miss you").
//   - No "transformative," "powerful," "profound," "sacred" when used
//     promotionally.
//   - No Contueri-as-subject ("Contueri thinks you'd love..."). The
//     notification announces; it does not editorialize.
//   - The Lewis test: would this phrase feel right on the lockscreen
//     of someone reading C.S. Lewis? If not, it reads as "Calm
//     notification," rewrite.
//
// Note on rendering: notification text shows in iOS system font, not
// Cormorant. The italic in editorial preview docs is for review only;
// production sends as plain text.

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationVariant = {
  title: string;
  body?: string;
  // Template substitutions inside title or body. Substituted at send
  // time. Keys: {{artist}}, {{dayNumber}}, {{journeyTitle}},
  // {{dayTitle}}, {{seasonName}}, {{feastName}}.
  substitutions?: SubstitutionKey[];
};

export type SubstitutionKey =
  | "artist"
  | "dayNumber"
  | "journeyTitle"
  | "dayTitle"
  | "seasonName"
  | "feastName";

export type NotificationType = "pp" | "journey" | "streak" | "seasonal";

export type NotificationCopyLibrary = {
  pp: {
    default: NotificationVariant[];
    withBody: NotificationVariant[];
  };
  journey: {
    default: NotificationVariant[];
  };
  streak: {
    default: NotificationVariant[];
  };
  seasonal: {
    holyWeek: NotificationVariant[];
    advent: NotificationVariant[];
    feastDay: NotificationVariant[];
    easter: NotificationVariant[];
    other: NotificationVariant[];
  };
};

// ─── The library ─────────────────────────────────────────────────────────────

export const NOTIFICATION_COPY: NotificationCopyLibrary = {
  // ── Daily Pause & Ponder ───────────────────────────────────────────
  // Fires at the user's chosen time per the D-04 spec (default 7am,
  // user-adjustable). One per day. Body text optional and varies by
  // day to keep them fresh. OneSignal picks a random variant from
  // the default array unless content-specific substitution data is
  // available, in which case it can use the withBody variants.
  pp: {
    default: [
      { title: "Today's Pause and Ponder is ready." },
      { title: "A new piece for the morning." },
      { title: "Today's piece is waiting." },
      { title: "One piece, one question." },
      { title: "Today's Pause and Ponder." },
    ],
    withBody: [
      {
        title: "Today's Pause and Ponder is ready.",
        body: "A piece by {{artist}}. Five minutes.",
        substitutions: ["artist"],
      },
      {
        title: "A new piece for the morning.",
        body: "{{artist}} and a question.",
        substitutions: ["artist"],
      },
      {
        title: "Today's piece.",
        body: "{{artist}}, and one question.",
        substitutions: ["artist"],
      },
    ],
  },

  // ── Journey day available ──────────────────────────────────────────
  // Fires only when a journey is active AND the user opted in to
  // daily reminders for journeys. Stops automatically when the
  // journey completes. OneSignal segment filters on
  // active_journey_slug being set on the user record.
  journey: {
    default: [
      {
        title: "Day {{dayNumber}} is ready.",
        substitutions: ["dayNumber"],
      },
      {
        title: "Day {{dayNumber}} of {{journeyTitle}}.",
        substitutions: ["dayNumber", "journeyTitle"],
      },
      {
        title: "The next day of {{journeyTitle}}.",
        substitutions: ["journeyTitle"],
      },
      {
        title: "Day {{dayNumber}}: {{dayTitle}}.",
        substitutions: ["dayNumber", "dayTitle"],
      },
    ],
  },

  // ── Streak / "if you haven't been here" ────────────────────────────
  // D-04 LOCKED: fires only when the user has NOT opened the app
  // today, at the user's chosen time (default 8pm, user-adjustable).
  // OneSignal user-tag segmentation: app reports last_open_date on
  // every launch; OneSignal segments users where
  // last_open_date != today and sends streak push only to that
  // segment.
  //
  // VOICE: contemplative, not gamified. NEVER say "your streak is
  // at risk" or anything implying loss. The frame is "today is
  // still here" not "you missed something." Same voice rules as P&P.
  streak: {
    default: [
      { title: "Today is still here." },
      { title: "A pause before the day ends?" },
      { title: "The evening still has a quiet minute." },
      { title: "Today's piece is still waiting." },
      { title: "There is still time." },
      { title: "Five minutes before the day closes." },
    ],
  },

  // ── Seasonal moments ───────────────────────────────────────────────
  // Calendar-driven. Fires on the morning of specific liturgical
  // moments (Lent, Holy Week, Advent, Easter, feast days). User
  // opts in via the seasonal toggle in Settings. Each entry in
  // each subcategory is a complete variant; OneSignal picks based
  // on which season/feast matches the calendar trigger date.
  seasonal: {
    holyWeek: [
      { title: "Holy Week begins today." },
      { title: "Holy Week begins.", body: "A new piece for the week ahead." },
    ],
    advent: [
      { title: "Advent begins today." },
      { title: "Advent begins.", body: "Twenty-four pieces for the season." },
    ],
    feastDay: [
      {
        title: "Today is the feast of {{feastName}}.",
        substitutions: ["feastName"],
      },
      {
        title: "{{feastName}}.",
        body: "A new piece for the feast.",
        substitutions: ["feastName"],
      },
    ],
    easter: [
      { title: "Easter Sunday." },
      { title: "Easter Sunday.", body: "A new piece for the morning." },
    ],
    other: [
      { title: "All Saints.", body: "A new piece for today." },
      {
        title: "Today is {{seasonName}}.",
        substitutions: ["seasonName"],
      },
    ],
  },
};

// ─── Permission prompt copy ──────────────────────────────────────────────────
//
// The pre-permission rationale screen shown BEFORE iOS's system
// permission alert. Matches the modal already shipped on the
// /settings/notifications page (RationaleModal component); single
// source of truth.

export const PERMISSION_RATIONALE = {
  eyebrow: "Before iOS asks",
  title: "A quiet word about notifications",
  body1:
    "Contueri sends only the reminders you ask for. No marketing. No interruption you did not choose. You can turn each one off any time, and you can leave them all off and the app works the same.",
  body2:
    "When you tap Continue, iOS will ask if Contueri can send you notifications. Allow it once and the reminders you set on this screen will start arriving.",
  acceptCta: "Continue",
  skipCta: "Not now",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Pick a deterministic-ish variant from a list based on a seed (e.g.,
// the day-of-year or the userId), so the same user sees variety across
// days but not necessarily the same variant every send. Pure function,
// safe for SSR and server-side OneSignal calls.
//
// W2 OneSignal integration: pass `dayOfYearSeed = Math.floor(Date.now() /
// 86400000)` for daily rotation, or use the user's hash for per-user
// stable picks.
export function pickVariant(
  variants: NotificationVariant[],
  seed: number,
): NotificationVariant {
  if (variants.length === 0) {
    throw new Error("pickVariant called with empty variants array");
  }
  const idx = Math.abs(seed) % variants.length;
  return variants[idx];
}

// Apply substitutions to a variant's title and body. Replaces
// {{key}} placeholders with the provided values. Unknown keys are
// left as the literal placeholder (visible bug to surface during
// review, not a silent failure).
export function formatVariant(
  variant: NotificationVariant,
  substitutions: Partial<Record<SubstitutionKey, string>>,
): { title: string; body?: string } {
  const apply = (s: string): string =>
    s.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      const value = substitutions[key as SubstitutionKey];
      return value !== undefined ? value : match;
    });
  return {
    title: apply(variant.title),
    body: variant.body ? apply(variant.body) : undefined,
  };
}

// ─── Out-of-scope for v1.0 (commented reference, not exported) ──────────────
//
// The May 20 draft included these additional categories that the D-04
// lock does NOT include in v1.0:
//
//   - New content drop (manual, occasional): "A new journey is here."
//     Future v1.1+ if push-on-content-publish becomes a feature.
//
//   - User-set reminder (personal): "A few minutes for Contueri."
//     Different mental model than the D-04 toggles; future v1.1+.
//
//   - Lifecycle (magic-link, welcome, app-update): "Welcome to
//     Contueri." Implementation note: lifecycle messages should be
//     in-app banners or transactional emails, NOT push. Push is
//     reserved for the four D-04 types.
//
// Preserved here so a future agent can re-introduce them with the
// same voice rules, without having to re-discover them.
