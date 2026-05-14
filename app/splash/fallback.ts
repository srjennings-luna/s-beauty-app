import type { SplashScreen } from "./SplashClient";

// Used when Sanity returns zero splash documents (or the query fails).
// Mirrors the original hardcoded 5 screens so a fresh install never sees
// an empty splash. Keep in sync with content seeded by
// scripts/seed-splash-pages.ts.
export const FALLBACK_SCREENS: SplashScreen[] = [
  {
    _id: "fallback-1",
    screenNumber: 1,
    screenTitle: "Brand Identity",
    blocks: [
      { _type: "wordmark", _key: "f1-wordmark", text: "KALLOS" },
      { _type: "pronunciation", _key: "f1-pronunciation", text: "kal · os" },
      { _type: "goldRule", _key: "f1-rule" },
      { _type: "quote", _key: "f1-quote", text: "Beauty will save the world." },
      {
        _type: "body",
        _key: "f1-body",
        text: "Rediscover beauty, truth and goodness through tradition. The Greeks called it KALLOS, and they believed the three were inseparable.",
      },
      { _type: "tagline", _key: "f1-tagline", text: "Your daily dose of what is beautiful. true. good." },
    ],
  },
  {
    _id: "fallback-2",
    screenNumber: 2,
    screenTitle: "The Three",
    blocks: [
      { _type: "heading", _key: "f2-heading", text: "Beauty. Truth. Goodness." },
      { _type: "goldRule", _key: "f2-rule" },
      {
        _type: "body",
        _key: "f2-body1",
        text: "Ancient philosophers called them the transcendentals: beauty, truth, goodness. Three things woven together that finding one means brushing against the divine.",
      },
      {
        _type: "body",
        _key: "f2-body2",
        text: "The tradition that produced the greatest art in the Western world kept all three in the same room.",
      },
      { _type: "tagline", _key: "f2-tagline", text: "KALLOS is built on that." },
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
        body: "Every day, a piece of art and a question to sit with.",
      },
      {
        _type: "featureCard",
        _key: "f3-card2",
        label: "Journeys",
        body: "Or go deeper. A theme, an artist, a question. One day at a time.",
      },
    ],
  },
  {
    _id: "fallback-4",
    screenNumber: 4,
    screenTitle: "Hook",
    blocks: [
      { _type: "heading", _key: "f4-heading", text: "You already know this feeling." },
      { _type: "goldRule", _key: "f4-rule" },
      {
        _type: "body",
        _key: "f4-body1",
        text: "The painting you can’t look away from. The piece of music that opens something in you. The line from a book you’ve carried for years.",
      },
      { _type: "body", _key: "f4-body2", text: "KALLOS is built for exactly that." },
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
        text: "No preparation needed. No right way to begin. Start a 3-day journey into beauty, truth and goodness. Something new every day.",
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
        label: "See today’s Pause & Ponder →",
        linkPath: "/prompt",
      },
    ],
  },
];
