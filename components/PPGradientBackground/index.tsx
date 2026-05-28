/**
 * Contueri · PPGradientBackground
 *
 * Wraps the Pause & Ponder (P&P) screen with a three-layer ambient gradient
 * fixed to the viewport. Color is selected by `contentType` and applied two
 * ways:
 *
 *   1. Inline to the wrapper as CSS custom properties (--pp-accent and
 *      --pp-accent-rgb) so every descendant element on the P&P screen can
 *      reference them via `var(--pp-accent)` without prop drilling.
 *
 *   2. To the three gradient layers via the rgba() patterns in
 *      gradient.module.css, which read --pp-accent-rgb directly.
 *
 * This is the only place the gradient layer DOM is constructed. Migration
 * surface area for native (when Contueri ships on iOS/Android) is exactly
 * this component — the consumer (PromptClient) passes a contentType and
 * children, and never touches gradient internals.
 *
 * See `content-docs/CONTUERI-CC-PP-Gradient-Brief.html` for full spec.
 */

import type { CSSProperties, ReactNode } from 'react';
import { getPPGradient } from '@/lib/ppGradients';
import type { ContentType } from '@/lib/types';
import styles from './gradient.module.css';

interface PPGradientBackgroundProps {
  contentType: ContentType | undefined | null;
  children: ReactNode;
}

// CSS custom properties need an index-signature type to satisfy
// React.CSSProperties without TypeScript complaining about unknown keys.
type CSSVars = CSSProperties & {
  '--pp-accent': string;
  '--pp-accent-rgb': string;
};

export default function PPGradientBackground({ contentType, children }: PPGradientBackgroundProps) {
  const token = getPPGradient(contentType);

  const cssVars: CSSVars = {
    '--pp-accent': token.hex,
    '--pp-accent-rgb': token.rgb,
  };

  return (
    <div className={styles.phone} style={cssVars}>
      <div className={styles.gradientBg} aria-hidden="true">
        <div className={styles.gSweep} />
        <div className={styles.gBand} />
        <div className={styles.gPool} />
      </div>
      {children}
    </div>
  );
}
