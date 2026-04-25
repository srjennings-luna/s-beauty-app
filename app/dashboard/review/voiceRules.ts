// Voice rule scanner config. Each rule is a banned pattern from the KALLOS
// editorial rules in CLAUDE.md. The grid runs every rule against every text
// cell on render and shows a badge on cells with matches. Adding a new rule
// is a one-line change here. No code changes anywhere else.
//
// Note: the no-em-dash rule applies to KALLOS *content* and to *code Claude
// writes*. The U+2014 codepoint appears in this file only as an escaped
// regex literal (`\u2014`), never as a literal em dash character. The
// scanner highlights em dashes in Sanity content for Sheri to fix manually
// in Studio. It does not modify content data.

export type VoiceRuleSeverity = "error" | "warn";

export type VoiceRule = {
  id: string;
  pattern: RegExp;
  label: string;
  severity: VoiceRuleSeverity;
  suggestion: string;
};

export const VOICE_RULES: VoiceRule[] = [
  {
    id: "em-dash",
    pattern: /\u2014/g,
    label: "Em dash",
    severity: "error",
    suggestion:
      "Em dash found. Fix the surrounding punctuation in Sanity Studio. The correct substitute (comma, colon, or period) depends on the sentence. Do not auto-remove.",
  },
  {
    id: "word-journey",
    pattern: /\bjourney\b/gi,
    label: '"journey" (noun)',
    severity: "warn",
    suggestion: "Banned voice word in KALLOS content. Find a more specific noun.",
  },
  {
    id: "word-sacred",
    pattern: /\bsacred\b/gi,
    label: '"sacred"',
    severity: "warn",
    suggestion: "Banned voice word. Be specific about what it is instead.",
  },
  {
    id: "word-profound",
    pattern: /\bprofound(ly)?\b/gi,
    label: '"profound"',
    severity: "warn",
    suggestion: "Banned voice word. Show the depth; do not announce it.",
  },
  {
    id: "word-transformative",
    pattern: /\btransformative\b/gi,
    label: '"transformative"',
    severity: "warn",
    suggestion: "Banned voice word.",
  },
  {
    id: "phrase-spiritual-practice",
    pattern: /spiritual practice/gi,
    label: '"spiritual practice"',
    severity: "warn",
    suggestion: "Banned phrase. Describe the specific action instead.",
  },
  {
    id: "phrase-invitation-to",
    pattern: /invitation to/gi,
    label: '"invitation to"',
    severity: "warn",
    suggestion: "Banned phrase. Be direct about what the content offers.",
  },
  {
    id: "word-shaft",
    pattern: /\bshaft\b/gi,
    label: '"shaft" (describing light)',
    severity: "warn",
    suggestion: 'Use "ray" or "stream" instead.',
  },
];

export type VoiceRuleMatch = { rule: VoiceRule; count: number };

// Scan a string (or array of strings, joined with newline) against every
// rule. Returns a list of rules that matched at least once and how many
// times each. Empty array means clean.
export function scanText(text: string | string[] | null): VoiceRuleMatch[] {
  if (text === null || text === undefined) return [];
  const flat = Array.isArray(text) ? text.join("\n") : text;
  if (!flat) return [];
  const matches: VoiceRuleMatch[] = [];
  for (const rule of VOICE_RULES) {
    // Reset lastIndex on global regex between runs so match() does not skip.
    rule.pattern.lastIndex = 0;
    const m = flat.match(rule.pattern);
    if (m && m.length > 0) {
      matches.push({ rule, count: m.length });
    }
  }
  return matches;
}
