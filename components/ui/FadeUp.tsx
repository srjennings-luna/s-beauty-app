"use client";

import { useEffect, useState, ReactNode } from "react";

interface FadeUpProps {
  children: ReactNode;
  /** Delay in ms before the animation starts. Use multiples of 60 for staggering. */
  delay?: number;
  className?: string;
  /**
   * Optional inline styles merged with the animation styles. Useful when a
   * caller needs paddingTop with env(safe-area-inset-top) or any other
   * dynamic value Tailwind cannot express. Caller styles win on collision.
   */
  style?: React.CSSProperties;
}

/**
 * Wraps children in a fade-up entrance animation.
 * Use `delay` (in ms) to stagger multiple items:
 *   <FadeUp delay={0}>   first card  </FadeUp>
 *   <FadeUp delay={60}>  second card </FadeUp>
 *   <FadeUp delay={120}> third card  </FadeUp>
 */
export default function FadeUp({
  children,
  delay = 0,
  className = "",
  style,
}: FadeUpProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 400ms ease, transform 400ms ease",
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
