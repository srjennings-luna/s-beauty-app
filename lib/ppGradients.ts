/**
 * Contueri · P&P Gradient Color Tokens
 *
 * Pure TypeScript color source-of-truth for the P&P (Pause & Ponder) gradient
 * system. Each of the nine content types maps to a fresco-pigment hue that
 * drives both the ambient gradient background AND the accent color cascade
 * (section labels, READ MORE/LISTEN buttons, scripture attribution, checkbox
 * borders, active tab indicators) on the P&P screen.
 *
 * No web-specific imports. Survives the eventual React Native migration
 * unchanged — the consuming component (PPGradientBackground) is the only
 * surface that needs platform-specific rewriting when going native.
 *
 * See `content-docs/CONTUERI-CC-PP-Gradient-Brief.html` for full design
 * decisions, type-to-color mapping rationale, and mockup references.
 */

import type { ContentType } from './types';

export const PP_GRADIENTS = {
  'sacred-art':   { hex: '#7ba2b8', rgb: '123,162,184' }, // Mineral Blue
  'music':        { hex: '#9a8a9e', rgb: '154,138,158' }, // Fresco Plum
  'literature':   { hex: '#c9a07c', rgb: '201,160,124' }, // Old Ochre
  'landscape':    { hex: '#a8ae9a', rgb: '168,174,154' }, // Sage Stone
  'food-wine':    { hex: '#c68a77', rgb: '198,138,119' }, // Clay Terra
  'math-science': { hex: '#84a9a2', rgb: '132,169,162' }, // Verdigris
  'thinker':      { hex: '#E4C371', rgb: '228,195,113' }, // Illuminated Gold
  'watch-listen': { hex: '#b8869a', rgb: '184,134,154' }, // Pompeian Crimson
  'photography':  { hex: '#a49898', rgb: '164,152,152' }, // Warm Slate
} as const satisfies Record<ContentType, { hex: string; rgb: string }>;

export type PPGradientType = keyof typeof PP_GRADIENTS;
export type PPGradientToken = { hex: string; rgb: string };

/**
 * Returns the gradient token for a given content type. Falls back to
 * `sacred-art` (Mineral Blue) for any future content type added before a
 * color is assigned. Safe default rather than throwing.
 */
export function getPPGradient(contentType: ContentType | undefined | null): PPGradientToken {
  if (contentType && contentType in PP_GRADIENTS) {
    return PP_GRADIENTS[contentType as PPGradientType];
  }
  return PP_GRADIENTS['sacred-art'];
}
