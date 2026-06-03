"use client";

import { useEffect, useState } from "react";

// ScrollCue
//
// A subtle visual cue that appears at the bottom of a scrollable container
// when (a) the container has more content than fits in the viewport AND
// (b) the user has not yet scrolled. Auto-hides on first scroll, and on
// resize when the container no longer overflows.
//
// Why this exists (IMG-01, June 2 2026):
// The Journey Day Open step and the Visio Divina Gaze step both render a
// large hero image at the top followed by editorial copy beneath. On
// shorter viewports (iPhone SE, iPhone 8) the editorial text lives below
// the fold and users don't know it's there because nothing signals
// scrollability. This component renders a soft fade + animated chevron
// that says "there's more here" without breaking the contemplative
// silence of the screen.
//
// Usage: attach a ref to the scrollable container, pass it in.
//
//   const containerRef = useRef<HTMLDivElement>(null);
//   <div ref={containerRef} className="overflow-y-auto">
//     {content}
//     <ScrollCue containerRef={containerRef} />
//   </div>
//
// The component itself is absolutely positioned at the bottom of its
// parent, pointer-events: none so it never blocks taps on content
// beneath it.
type ScrollCueProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  // Optional override of the fade gradient color. Defaults to espresso
  // (used everywhere ScrollCue currently mounts). Pass a parchment-toned
  // value when adopting this on browse-mode surfaces.
  fadeColor?: string;
};

export default function ScrollCue({ containerRef, fadeColor = "rgba(22,17,13,0.7)" }: ScrollCueProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const check = () => {
      // Visible iff the container has overflow AND the user has not
      // begun to scroll. 20px tolerance on scrollTop so a tiny inertial
      // bounce on iOS doesn't dismiss the cue prematurely.
      const overflows = el.scrollHeight - el.clientHeight > 1;
      const atTop = el.scrollTop < 20;
      setVisible(overflows && atTop);
    };

    // Initial check after layout.
    check();

    el.addEventListener("scroll", check, { passive: true });
    // Catch image-loaded / orientation-change scenarios where overflow
    // appears after first paint.
    const ro = new ResizeObserver(check);
    ro.observe(el);
    // Also observe any direct children since image loads can change
    // the overflow without resizing the container itself.
    Array.from(el.children).forEach((child) => ro.observe(child as Element));

    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [containerRef]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 72,
        pointerEvents: "none",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 12,
        background: `linear-gradient(to top, ${fadeColor} 0%, transparent 100%)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease-out",
        zIndex: 5,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(253,246,232,0.7)"
        strokeWidth={1.5}
        width={22}
        height={22}
        style={{
          // Slow gentle bounce. Per the design system, motion stays
          // restrained on contemplative surfaces.
          animation: "scrollCueBounce 2.2s ease-in-out infinite",
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
      <style>{`
        @keyframes scrollCueBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          svg { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
