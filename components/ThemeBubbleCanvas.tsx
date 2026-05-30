"use client";

/**
 * Contueri · ThemeBubbleCanvas
 *
 * Physics-driven floating bubble UI for the Explore landing. Each bubble
 * is a theme; tapping opens that theme's detail feed. Bubbles drift, drag,
 * collide, and breathe — all in a requestAnimationFrame loop kept entirely
 * inside refs (never React state) so the simulation runs at 60fps without
 * triggering re-renders.
 *
 * Ported from `~/Documents/contueri-explore-bubbles.html`. The physics
 * constants are the prototype's tuned values; the JSX layer adds
 * accessibility (each bubble is a `<button>` with aria-label and keyboard
 * activation) and the production-readiness fixes from the audit:
 *
 *   - prefers-reduced-motion: render a static 2-column grid of circles
 *   - rAF cancelled when isHidden (detail screen visible) or on unmount
 *   - aria-label + keyboard (Enter / Space) per bubble
 *   - touch-action: manipulation, e.preventDefault on touchend to suppress
 *     the iOS 300ms ghost click
 *   - touchcancel handler clears drag state
 *   - canvas width/height measured from container via ResizeObserver,
 *     not the hardcoded 390 from the prototype
 *   - text rendered as JSX (no innerHTML)
 *
 * "Music" themes are filtered out as a safety net — Music has Sanity content
 * type support but no app surface yet (per the brief).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { Theme } from "@/lib/types";

interface Props {
  themes: Theme[];
  contentCounts: Map<string, number>;
  onSelect: (theme: Theme) => void;
  /** When true, the canvas is visually hidden by the parent. We use this
   *  to pause the rAF loop without unmounting (which would lose physics
   *  state and re-trigger the entrance animation on return). */
  isHidden?: boolean;
}

// ── Physics constants ────────────────────────────────────────────────────────
// Tuned May 29, 2026. Originals from the prototype noted inline. Tuning
// bar: a contemplative pace, but bubbles must read as objects with their
// own life. First pass overshot on calm (no perceptible bounce, almost no
// idle drift); this revision walks bubble-to-bubble contact and ambient
// motion back toward the original feel while keeping walls absorbed and
// the entrance soft.
const WALL_RESTITUTION   = 0.12;   // was 0.80 — walls absorb ~88% of impact
const BUBBLE_RESTITUTION = 0.70;   // was 0.88 (first pass 0.35 killed the bounce)
const DAMPING            = 0.991;  // was 0.993 (first pass 0.978 stalled idle drift)
const ENTRANCE_DAMPING   = 0.977;
const ENTRANCE_DECAY_MS  = 2400;   // was 1600 — longer ramp into normal damping
const IMPULSE_STRENGTH   = 0.020;  // was 0.022 (first pass 0.016 too gentle)
const IMPULSE_CHANCE     = 0.009;  // was 0.010 (first pass 0.005 too sparse)
const SPEED_SCALE        = 0.065;
const THROW_MULTIPLIER   = 10;     // was 18 — fling release less energetic
const SEPARATION_FORCE   = 0.52;
const COLLISION_IMPULSE  = 1.2;
const TAP_THRESHOLD      = 6;
const MIN_SPEED          = 0.06;
const BREATH_VARIATION   = 0.04;
const ENTRANCE_SPEED     = 1.5;    // was 2.5 — softer initial velocity
const ENTRANCE_STAGGER   = 200;    // was 130 — more breathing room between bubbles
const ENTRANCE_FADE_MS   = 500;    // was 350 — gentler opacity fade-in

// Default canvas dimensions before measurement — typical phone viewport.
const DEFAULT_W = 390;
const DEFAULT_H = 632;

function hexToRgba(hex: string, a: number): string {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

/**
 * Theme-name → bubble color overrides, drawn from the original Variant
 * design palette (the same fresco-pigment family used by the P&P gradient
 * system shipped May 28, 2026). The Sanity `theme.color` field may not yet
 * be in sync with this map; until it is, we look up the bubble color by
 * normalized theme name here so production looks right without requiring
 * an editorial pass first.
 *
 * Keys are normalized (lowercased, ampersands and "the"/"and" stripped,
 * collapsed whitespace) so that minor title variations in Sanity
 * ("Home / The Restless Heart" vs "The Restless Heart" vs "Restless Heart")
 * still resolve correctly.
 */
const THEME_COLOR_OVERRIDES: Record<string, string> = {
  silence: "#9a8a9e",                  // Fresco Plum
  "restless heart": "#c68a77",         // Clay Terra
  "beauty truth goodness": "#a8ae9a",  // Sage Stone
  creation: "#83a9a2",                 // Verdigris
  "suffering beauty": "#8b4557",       // Roman Wine
  light: "#c9a07c",                    // Old Ochre
};

function normalizeThemeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[&/,.()]/g, " ")
    .replace(/\bthe\b/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolve a theme's bubble color. Looks up the Variant fresco palette
 * override by normalized name; falls back to whatever color was provided
 * (typically theme.color from Sanity). Exported so the list-view rows
 * can render the same color dot as the corresponding bubble while
 * Sanity theme.color drifts behind the deepened palette. Will be
 * obsolete once Tech Debt item 1 lands (overrides moved to Sanity).
 */
export function getThemeColor(themeTitle: string, fallback: string): string {
  const norm = normalizeThemeName(themeTitle);
  if (THEME_COLOR_OVERRIDES[norm]) return THEME_COLOR_OVERRIDES[norm];
  // Partial match — "home restless heart" contains "restless heart" → match
  for (const [key, color] of Object.entries(THEME_COLOR_OVERRIDES)) {
    if (norm.includes(key)) return color;
  }
  return fallback;
}

interface BubbleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseR: number;
  r: number;
  maxR: number;
  breathPhase: number;
  breathSpeed: number;
  isDragging: boolean;
  dragOffX: number;
  dragOffY: number;
  dragVelX: number;
  dragVelY: number;
  lastDragX: number;
  lastDragY: number;
}

export default function ThemeBubbleCanvas({
  themes,
  contentCounts,
  onSelect,
  isHidden = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef<BubbleState[]>([]);
  const canvasWRef = useRef(DEFAULT_W);
  const canvasHRef = useRef(DEFAULT_H);
  const entranceEndTimeRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const activeDragIdxRef = useRef(-1);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const [reducedMotion, setReducedMotion] = useState(false);

  // ── Compute the visible bubble set ────────────────────────────────────────
  // Filter out "Music" as a safety net (it has Sanity support but no app
  // surface yet). Compute baseR from content count, mapped to 40–60px with
  // a 40px floor for any theme that has at least one item.
  const visibleThemes = useMemo(() => {
    const filtered = themes.filter(
      (t) => t.title?.toLowerCase().trim() !== "music"
    );
    const counts = filtered.map((t) => contentCounts.get(t._id) ?? 0);
    const maxCount = Math.max(1, ...counts);
    return filtered.map((t) => {
      const count = contentCounts.get(t._id) ?? 0;
      const baseR = 40 + (count / maxCount) * 20;
      return { theme: t, baseR };
    });
  }, [themes, contentCounts]);

  // ── Reduced-motion detection ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── ResizeObserver: keep canvas dimensions in sync with the container ────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) canvasWRef.current = rect.width;
      if (rect.height > 0) canvasHRef.current = rect.height;
    });
    observer.observe(el);
    // Initial measurement
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) canvasWRef.current = rect.width;
    if (rect.height > 0) canvasHRef.current = rect.height;
    return () => observer.disconnect();
  }, []);

  // ── Initialize physics state whenever the visible theme set changes ──────
  useEffect(() => {
    const w = canvasWRef.current;
    // Entrance cluster — upper-left of canvas, scaled to width
    const entranceBase = { x: w * 0.24, y: 115 };
    const entranceJitter = [
      { x:  0, y:   0 }, { x: 20, y: -18 }, { x: -12, y:  22 },
      { x: 18, y:  12 }, { x: -6, y: -14 }, { x:  14, y:  28 },
      { x: -16, y:  6 },
    ];
    // Spread targets — direction guides for entrance velocities
    const spreadPos = [
      { x: w * 0.26, y: 100 },
      { x: w * 0.73, y:  80 },
      { x: w * 0.21, y: 280 },
      { x: w * 0.74, y: 255 },
      { x: w * 0.41, y: 430 },
      { x: w * 0.77, y: 430 },
      { x: w * 0.47, y: 185 },
    ];

    stateRef.current = visibleThemes.map(({ baseR }, i) => {
      const jitter = entranceJitter[i % entranceJitter.length];
      const ex = entranceBase.x + jitter.x;
      const ey = entranceBase.y + jitter.y;
      const target = spreadPos[i % spreadPos.length];
      const dx = target.x - ex;
      const dy = target.y - ey;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      return {
        x: ex,
        y: ey,
        vx: (dx / dist) * ENTRANCE_SPEED,
        vy: (dy / dist) * ENTRANCE_SPEED,
        baseR,
        r: baseR,
        maxR: Math.ceil(baseR * (1 + BREATH_VARIATION)) + 1,
        breathPhase: (i / Math.max(1, visibleThemes.length)) * Math.PI * 2,
        breathSpeed: 0.00055 + i * 0.00012,
        isDragging: false,
        dragOffX: 0,
        dragOffY: 0,
        dragVelX: 0,
        dragVelY: 0,
        lastDragX: 0,
        lastDragY: 0,
      };
    });

    // Staggered fade-in. Gentle opacity ramp so each bubble settles into
    // view rather than appearing all at once.
    bubbleRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transition = `opacity ${ENTRANCE_FADE_MS}ms ease`;
      setTimeout(() => {
        if (!el) return;
        el.style.opacity = "1";
        setTimeout(() => {
          if (el) el.style.transition = "none";
        }, ENTRANCE_FADE_MS + 30);
      }, i * ENTRANCE_STAGGER);
    });

    entranceEndTimeRef.current =
      (typeof performance !== "undefined" ? performance.now() : Date.now()) +
      ENTRANCE_DECAY_MS;
    lastTimeRef.current = null;
  }, [visibleThemes]);

  // ── Animation loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isHidden || reducedMotion) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = (ts: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const dt = Math.min(ts - (lastTimeRef.current ?? ts), 32);
      lastTimeRef.current = ts;

      const state = stateRef.current;
      const CANVAS_W = canvasWRef.current;
      const CANVAS_H = canvasHRef.current;
      const activeDamping =
        ts < entranceEndTimeRef.current ? ENTRANCE_DAMPING : DAMPING;

      for (let i = 0; i < state.length; i++) {
        const s = state[i];

        // Independent breathing
        s.breathPhase += s.breathSpeed * dt;
        s.r = s.baseR + Math.sin(s.breathPhase) * (s.baseR * BREATH_VARIATION);

        if (s.isDragging) {
          const circle = circleRefs.current[i];
          const bubble = bubbleRefs.current[i];
          if (circle) circle.style.transform = `scale(${s.r / s.maxR})`;
          if (bubble) {
            bubble.style.transform = `translate(${s.x - s.maxR}px, ${
              s.y - s.maxR
            }px)`;
          }
          continue;
        }

        // Random micro-impulse — organic wander
        if (Math.random() < IMPULSE_CHANCE) {
          const ang = Math.random() * Math.PI * 2;
          s.vx += Math.cos(ang) * IMPULSE_STRENGTH;
          s.vy += Math.sin(ang) * IMPULSE_STRENGTH;
        }

        // Speed floor — bubbles never fully stop
        const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (spd < MIN_SPEED) {
          const ang = Math.random() * Math.PI * 2;
          s.vx += Math.cos(ang) * (MIN_SPEED - spd + 0.05);
          s.vy += Math.sin(ang) * (MIN_SPEED - spd + 0.05);
        }

        // Damping
        s.vx *= activeDamping;
        s.vy *= activeDamping;

        // Move
        s.x += s.vx * dt * SPEED_SCALE;
        s.y += s.vy * dt * SPEED_SCALE;

        // Wall bounce
        if (s.x - s.r < 0) {
          s.x = s.r + 0.5;
          s.vx = Math.abs(s.vx) * WALL_RESTITUTION + 0.12;
        } else if (s.x + s.r > CANVAS_W) {
          s.x = CANVAS_W - s.r - 0.5;
          s.vx = -(Math.abs(s.vx) * WALL_RESTITUTION + 0.12);
        }
        if (s.y - s.r < 0) {
          s.y = s.r + 0.5;
          s.vy = Math.abs(s.vy) * WALL_RESTITUTION + 0.12;
        } else if (s.y + s.r > CANVAS_H) {
          s.y = CANVAS_H - s.r - 0.5;
          s.vy = -(Math.abs(s.vy) * WALL_RESTITUTION + 0.12);
        }

        // Bubble-bubble collision
        for (let j = i + 1; j < state.length; j++) {
          const o = state[j];
          if (o.isDragging) continue;
          const dx = o.x - s.x;
          const dy = o.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minD = s.r + o.r + 4;
          if (dist < minD && dist > 0.01) {
            const ov = (minD - dist) * SEPARATION_FORCE;
            const nx = dx / dist;
            const ny = dy / dist;
            s.x -= nx * ov * 0.5;
            s.y -= ny * ov * 0.5;
            o.x += nx * ov * 0.5;
            o.y += ny * ov * 0.5;
            const dvx = s.vx - o.vx;
            const dvy = s.vy - o.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              const imp = dot * BUBBLE_RESTITUTION * COLLISION_IMPULSE;
              const spin = (Math.random() - 0.5) * 0.35;
              s.vx -= imp * nx + spin;
              s.vy -= imp * ny + spin;
              o.vx += imp * nx + spin;
              o.vy += imp * ny + spin;
            }
          }
        }

        // DOM update
        const circle = circleRefs.current[i];
        const bubble = bubbleRefs.current[i];
        if (circle) circle.style.transform = `scale(${s.r / s.maxR})`;
        if (bubble) {
          bubble.style.transform = `translate(${s.x - s.maxR}px, ${
            s.y - s.maxR
          }px)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isHidden, reducedMotion, visibleThemes]);

  // ── Pointer / touch handlers ──────────────────────────────────────────────
  const getPtr = (e: PointerEvent | TouchEvent | MouseEvent) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const src =
      "touches" in e && e.touches.length > 0
        ? e.touches[0]
        : "changedTouches" in e && e.changedTouches.length > 0
        ? e.changedTouches[0]
        : (e as MouseEvent);
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const handleStart = (e: TouchEvent | MouseEvent) => {
    const { x, y } = getPtr(e);
    pointerStartRef.current = { x, y };
    hasDraggedRef.current = false;
    const state = stateRef.current;
    for (let i = state.length - 1; i >= 0; i--) {
      const s = state[i];
      const dx = x - s.x;
      const dy = y - s.y;
      if (Math.sqrt(dx * dx + dy * dy) <= s.r) {
        activeDragIdxRef.current = i;
        s.isDragging = true;
        s.dragOffX = dx;
        s.dragOffY = dy;
        s.lastDragX = x;
        s.lastDragY = y;
        s.dragVelX = 0;
        s.dragVelY = 0;
        break;
      }
    }
  };

  const handleMove = (e: TouchEvent | MouseEvent) => {
    const idx = activeDragIdxRef.current;
    if (idx < 0) return;
    e.preventDefault();
    const { x, y } = getPtr(e);
    if (
      Math.sqrt(
        (x - pointerStartRef.current.x) ** 2 +
          (y - pointerStartRef.current.y) ** 2
      ) > TAP_THRESHOLD
    ) {
      hasDraggedRef.current = true;
    }
    const s = stateRef.current[idx];
    s.dragVelX = x - s.lastDragX;
    s.dragVelY = y - s.lastDragY;
    s.lastDragX = x;
    s.lastDragY = y;
    s.x = Math.max(s.r, Math.min(canvasWRef.current - s.r, x - s.dragOffX));
    s.y = Math.max(s.r, Math.min(canvasHRef.current - s.r, y - s.dragOffY));
  };

  const handleEnd = (e?: TouchEvent | MouseEvent) => {
    const idx = activeDragIdxRef.current;
    if (idx < 0) return;
    const s = stateRef.current[idx];
    s.isDragging = false;
    if (!hasDraggedRef.current) {
      // Tap — suppress iOS ghost click then open detail
      if (e && "preventDefault" in e) e.preventDefault();
      const theme = visibleThemes[idx]?.theme;
      if (theme) onSelect(theme);
    } else {
      s.vx = s.dragVelX * THROW_MULTIPLIER * 0.04;
      s.vy = s.dragVelY * THROW_MULTIPLIER * 0.04;
      const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      if (spd > 8) {
        s.vx *= 8 / spd;
        s.vy *= 8 / spd;
      }
    }
    activeDragIdxRef.current = -1;
  };

  const handleCancel = () => {
    const idx = activeDragIdxRef.current;
    if (idx < 0) return;
    const s = stateRef.current[idx];
    s.isDragging = false;
    activeDragIdxRef.current = -1;
    hasDraggedRef.current = false;
  };

  // Attach native event listeners so we can call preventDefault on
  // passive-by-default touchmove.
  useEffect(() => {
    if (reducedMotion) return;
    const el = containerRef.current;
    if (!el) return;
    const onMouseDown = (e: MouseEvent) => handleStart(e);
    const onMouseMove = (e: MouseEvent) => handleMove(e);
    const onMouseUp   = (e: MouseEvent) => handleEnd(e);
    const onTouchStart = (e: TouchEvent) => handleStart(e);
    const onTouchMove  = (e: TouchEvent) => handleMove(e);
    const onTouchEnd   = (e: TouchEvent) => handleEnd(e);
    const onTouchCancel = () => handleCancel();
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchCancel);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, visibleThemes]);

  // ── Reduced-motion: static 2-column grid of circles ──────────────────────
  if (reducedMotion) {
    return (
      <div
        className="grid grid-cols-2 gap-5 px-6 py-6 place-items-center overflow-y-auto"
        style={{ height: "100%" }}
      >
        {visibleThemes.map(({ theme, baseR }) => {
          const size = baseR * 2;
          const fillColor = getThemeColor(theme.title ?? "", theme.color ?? "#7a9a8a");
          return (
            <button
              key={theme._id}
              onClick={() => onSelect(theme)}
              aria-label={`${theme.title}${
                theme.question ? ` — ${theme.question}` : ""
              }`}
              className="flex items-center justify-center"
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: fillColor,
                boxShadow: `0 4px 20px ${hexToRgba(fillColor, 0.32)}`,
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.95)",
                  lineHeight: 1.25,
                  letterSpacing: "0.3px",
                  textAlign: "center",
                  fontSize:
                    theme.title.split(" ").length === 1
                      ? 17
                      : theme.title.split(" ").length <= 2
                      ? 14
                      : 12,
                  width: baseR * 2 - 20,
                  display: "block",
                  padding: 0,
                  pointerEvents: "none",
                }}
              >
                {theme.title}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Physics canvas ────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        touchAction: "none",
        overflow: "hidden",
      }}
    >
      {visibleThemes.map(({ theme, baseR }, idx) => {
        const maxR = Math.ceil(baseR * (1 + BREATH_VARIATION)) + 1;
        const containerSize = maxR * 2;
        const words = theme.title.split(" ").length;
        const fontSize = words === 1 ? 17 : words <= 2 ? 14 : 12;
        const fixedTextW = Math.round(baseR * 2 - 20);
        const fillColor = getThemeColor(theme.title ?? "", theme.color ?? "#7a9a8a");
        const themeQuestion = theme.question ?? "";

        return (
          <button
            key={theme._id}
            ref={(el) => {
              bubbleRefs.current[idx] = el;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(theme);
              }
            }}
            aria-label={
              themeQuestion
                ? `${theme.title} — ${themeQuestion}`
                : theme.title
            }
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: containerSize,
              height: containerSize,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              textAlign: "center",
              padding: 0,
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
              willChange: "transform",
              border: "none",
              background: "transparent",
              touchAction: "manipulation",
              transform: "translate(0px, 0px)",
            }}
          >
            <div
              ref={(el) => {
                circleRefs.current[idx] = el;
              }}
              aria-hidden="true"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: fillColor,
                boxShadow: `0 4px 20px ${hexToRgba(fillColor, 0.32)}`,
                willChange: "transform",
              }}
            />
            <span
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontWeight: 400,
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1.25,
                letterSpacing: "0.3px",
                pointerEvents: "none",
                textAlign: "center",
                position: "relative",
                zIndex: 1,
                fontSize,
                width: fixedTextW,
                display: "block",
                padding: 0,
              }}
            >
              {theme.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
