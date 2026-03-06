"use client";

import { useEffect, useState, ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  /** "fade" (default) — opacity only, 300ms, for browse screens
   *  "slide-up" — translateY 100%→0 + opacity, 600ms, for immersive/pray screens
   */
  variant?: "fade" | "slide-up";
}

export default function PageTransition({
  children,
  className = "",
  variant = "fade",
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (variant === "slide-up") {
    return (
      <div
        className={className}
        style={{
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          opacity: isVisible ? 1 : 0,
          transition: isVisible
            ? "transform 600ms cubic-bezier(0.32, 0, 0.67, 0), opacity 600ms ease"
            : "none",
          willChange: "transform, opacity",
        }}
      >
        {children}
      </div>
    );
  }

  // Default: fade
  return (
    <div
      className={`transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
