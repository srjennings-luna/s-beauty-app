import type { SplashScreen } from "./SplashClient";

// Used when Sanity returns zero splash documents (or the query fails).
// Mirrors the live Sanity content so a fresh install never sees an empty
// splash. Last synced from Sanity on 2026-05-29. Keep in sync when Studio
// is edited.
export const FALLBACK_SCREENS: SplashScreen[] = [
  {
    _id: "fallback-1",
    screenNumber: 1,
    screenTitle: "Brand Identity",
    blocks: [
      { _type: "wordmark", _key: "f1-wordmark", text: "CONTUERI" },
      { _type: "pronunciation", _key: "f1-pronunciation", text: "kon·too·air·ee" },
      { _type: "goldRule", _key: "f1-rule" },
      { _type: "quote", _key: "f1-quote", text: "Beauty will save the world." },
      {
        _type: "body",
        _key: "f1-body",
        text: "Rediscover beauty, truth and goodness through sacred art, tradition & those who came before.",
      },
      {
        _type: "tagline",
        _key: "f1-tagline",
        // Word definition (etymology), held in the tagline block as a
        // rebrand-day stopgap; brand tagline TBD. "Contueri:" prefix
        // dropped June 3 — the wordmark + pronunciation above already
        // name the word twice; repeating it a third time before the
        // definition reads anxious.
        text: "To gaze on, behold, contemplate with purpose.",
      },
    ],
  },
  {
    _id: "fallback-2",
    screenNumber: 2,
    screenTitle: "The Three",
    blocks: [
      { _type: "heading", _key: "f2-heading", text: "Beauty. Truth. Goodness." },
      {
        _type: "body",
        _key: "f2-body1",
        text: "Ancient philosophers called them the transcendentals: beauty, truth, goodness. Follow any one far enough, you might find something unexpected.",
      },
      {
        _type: "body",
        _key: "f2-body2",
        text: "The tradition that produced the greatest art in the Western world also produced great musicians, scientists and philosophers.",
      },
      // Screen 2 closer ("CONTUERI is built on that.") removed June 3.
      // Heading + body paragraphs do all the work; the closer told the
      // reader what conclusion to draw instead of trusting them to
      // arrive there. Same editorial register as the voice-rule bans on
      // "spiritual practice," "invitation to," etc. — explaining
      // instead of showing.
    ],
  },
  {
    _id: "fallback-3",
    screenNumber: 3,
    screenTitle: "Feature Tour",
    blocks: [
      { _type: "heading", _key: "f3-heading", text: "Two ways to explore." },
      {
        _type: "featureCard",
        _key: "f3-card1",
        label: "Pause & Ponder",
        body: "Every day, a painting, a proof, a text, a life to sit with.",
      },
      {
        _type: "featureCard",
        _key: "f3-card2",
        label: "Journeys",
        body: "Or go deeper. A theme, artist, or author. One day at a time.",
      },
    ],
  },
  {
    _id: "fallback-4",
    screenNumber: 4,
    screenTitle: "Hook",
    blocks: [
      { _type: "heading", _key: "f4-heading", text: "Ever had that feeling?" },
      { _type: "goldRule", _key: "f4-rule" },
      {
        _type: "body",
        _key: "f4-body1",
        text: "The painting you can’t look away from. The piece of music that opens something in you. The line from a book you’ve carried for years.",
      },
      // Screen 4 closer ("CONTUERI is built for exactly that.") removed
      // June 3. Same line as screen 2's closer in different wrapping —
      // a rebrand-era template that explained instead of showed. The
      // hook ("Ever had that feeling?") + the description lands the
      // encounter on its own; the closer was telling the reader what
      // they had just felt.
    ],
  },
  {
    _id: "fallback-5",
    screenNumber: 5,
    screenTitle: "Invitation",
    blocks: [
      { _type: "heading", _key: "f5-heading", text: "Start where you are." },
      { _type: "goldRule", _key: "f5-rule" },
      {
        _type: "body",
        _key: "f5-body",
        text: "Start a 3-day journey into beauty, truth and goodness. Something new every day.",
      },
      {
        _type: "primaryCta",
        _key: "f5-primary",
        label: "Start here →",
        linkPath: "/journeys/beauty-truth-and-goodness",
      },
      {
        _type: "secondaryCta",
        _key: "f5-secondary",
        label: "SKIP",
        linkPath: "/prompt",
      },
    ],
  },
];
