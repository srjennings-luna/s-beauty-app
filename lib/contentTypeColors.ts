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
