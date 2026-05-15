/**
 * KALLOS — shared design tokens (TypeScript runtime values)
 *
 * Tailwind theme tokens (colors, spacing, fonts) live in app/globals.css.
 * This file is for runtime values consumed by inline styles and component
 * logic — kept centralized so tuning happens in one place.
 */

/**
 * Whisper gradient — immersive-mode page background.
 *
 * Mauve-tinted espresso (#3A2D2E) at top fading to pure espresso by
 * mid-screen. Applied to every espresso/immersive surface: splash, P&P,
 * Journey day flow, Visio Divina, ArtworkViewer.
 *
 * The mauve at top differentiates KALLOS from the wellness-app category
 * convention (flat espresso + gold) without being a dramatic change. See
 * Kallos-Splash-High-End.html and Kallos-Gradient-Mauve-Espresso.html for
 * the design exploration.
 */
export const WHISPER_GRADIENT =
  "linear-gradient(180deg, #3A2D2E 0%, #16110d 50%)";
