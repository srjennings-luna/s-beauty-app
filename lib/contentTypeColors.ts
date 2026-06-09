/**
 * P&P Gradient Color System — type → color mapping
 * Matches the Type→Color table in CLAUDE.md
 * Used by: Library page, Explore page, P&P screen
 */
export const CONTENT_TYPE_COLORS: Record<string, string> = {
  "sacred-art":   "#7ba2b8",  // Mineral Blue
  "music":        "#9a8a9e",  // Fresco Plum
  "literature":   "#c9a07c",  // Old Ochre
  "landscape":    "#a8ae9a",  // Sage Stone
  "food-wine":    "#c68a77",  // Clay Terra
  "math-science": "#84a9a2",  // Verdigris
  "thinker":      "#E4C371",  // Illuminated Gold
  "watch-listen": "#b8869a",  // Pompeian Crimson
  "photography":  "#a49898",  // Warm Slate
};

export function getContentTypeColor(contentType: string | undefined, fallback = "#C19B5F"): string {
  return CONTENT_TYPE_COLORS[contentType ?? ""] ?? fallback;
}

/**
 * Uppercase display label for each contentType. Used on Explore detail
 * cards and Visio Divina type-label slot (per the June 9, 2026 Explore
 * Cards build brief). Keeps labels short and brand-consistent: prefer
 * "SACRED ART" over the Studio title "Sacred Art & Architecture" so
 * the label reads as a tag, not a category sentence.
 */
export const CONTENT_TYPE_DISPLAY_LABELS: Record<string, string> = {
  "sacred-art":   "SACRED ART",
  "photography":  "PHOTOGRAPHY",
  "thinker":      "THINKER",
  "literature":   "LITERATURE",
  "music":        "MUSIC",
  "food-wine":    "FOOD & WINE",
  "landscape":    "LANDSCAPE",
  "watch-listen": "WATCH & LISTEN",
  "math-science": "PATTERN & PROOF",
};

export function getContentTypeLabel(contentType: string | undefined): string {
  return CONTENT_TYPE_DISPLAY_LABELS[contentType ?? ""] ?? "";
}
