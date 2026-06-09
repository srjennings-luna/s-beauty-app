"use client";

/**
 * ExploreDetailCard — the intermediate detail surface for sacred-art and
 * landscape contentItems on Explore (Phase B of the June 9, 2026 Explore
 * Cards build brief).
 *
 * The two image-based contentTypes used to bypass this surface and tap
 * straight into Visio Divina. Per the brief, they now stop here first:
 * the user sees the artwork + title + attribution + description, then
 * taps ENTER VISIO DIVINA to enter the Gaze step.
 *
 * Data source rule (brief Section "Data source rule"): reads contentItem
 * ONLY via ExploreDetailItem. The reverse-reference arrays (journeys,
 * dailyPrompts) on that type are reference lookups for contextual links,
 * not P&P field bleed.
 *
 * Image rule (brief Section "Image: expand to full bleed", refined June 9
 * after Sheri tested portrait + landscape edge cases): match the VD Gaze
 * step pattern exactly — fixed-height image container (65dvh) with
 * object-cover. The earlier flex-1 + object-contain approach created
 * espresso bars on any image whose aspect ratio didn't match the
 * available space; the VD pattern gives full-bleed visual every time,
 * and TransformWrapper's pinch + pan let users recover any cropped
 * region (same affordance as VD Gaze). Bottom panel sits naturally below
 * the image; the inner scroll container handles any overflow content.
 *
 * Phase C will refactor non-VD types to use a sibling pattern; this
 * component is purposely scoped to sacred-art + landscape for now.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ExploreDetailItem } from "@/lib/types";
import FavoriteButton from "./ui/FavoriteButton";
import { getContentTypeColor, getContentTypeLabel } from "@/lib/contentTypeColors";
import { anchorIdFromDate } from "@/app/library/PromptCard";

interface ExploreDetailCardProps {
  item: ExploreDetailItem;
  onClose: () => void;
}

// Brand colors (espresso surfaces).
const C = {
  espresso: "#16110d",
  cream: "rgba(253,246,232,0.88)",
  creamWarm: "rgba(232,217,184,0.92)",
  creamDim: "rgba(253,246,232,0.5)",
  creamFaint: "rgba(253,246,232,0.3)",
  divider: "rgba(253,246,232,0.1)",
  gold: "#C19B5F",
};

// Format an ISO date string "2026-06-12" → "June 12" for the P&P link label.
function formatPpDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

// Derive "june-2026" from "2026-06-12" for the Library ?expand= param.
function expandFromDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.toLocaleDateString("en-US", { month: "long" }).toLowerCase();
  const year = d.getFullYear();
  return `${month}-${year}`;
}

export default function ExploreDetailCard({ item, onClose }: ExploreDetailCardProps) {
  const typeColor = getContentTypeColor(item.contentType);
  const typeLabel = getContentTypeLabel(item.contentType);

  // VD-eligible: sacred-art + landscape get ENTER VISIO DIVINA. Other 7
  // contentTypes (photography, thinker, literature, music, food-wine,
  // watch-listen, math-science) get text-only REFLECT below the
  // description, which expands an inline panel showing scripture/quote/
  // reflection questions/context (Phase C, June 9, 2026 build brief).
  const isVdEligible =
    item.contentType === "sacred-art" || item.contentType === "landscape";
  // Per the June 9, 2026 build brief: NO context field on Explore.
  // contentItem.context is editorial background that's meant for P&P
  // and Journey contexts — Explore stays out of that lane entirely.
  const hasReflectContent =
    (item.reflectionQuestions?.length ?? 0) > 0 ||
    !!item.scripturePairing ||
    !!item.quote?.text;

  // Lock body scroll while modal is open (matches PrayClient pattern).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const [showReflect, setShowReflect] = useState(false);

  // The 4 visible journey + P&P links collapse into an "expand more"
  // toggle when there are multiples (brief: "Multiple journeys or
  // multiple P&P dates → Expandable list (collapsed by default)").
  // Two sibling lists; if either has >1 entry, collapse the extras.
  const [showAllJourneys, setShowAllJourneys] = useState(false);
  const [showAllPp, setShowAllPp] = useState(false);
  const journeysVisible = showAllJourneys ? item.journeys : item.journeys.slice(0, 1);
  const ppVisible = showAllPp ? item.dailyPrompts : item.dailyPrompts.slice(0, 1);
  const moreJourneys = Math.max(0, item.journeys.length - 1);
  const morePp = Math.max(0, item.dailyPrompts.length - 1);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: C.espresso,
        height: "100dvh",
      }}
    >
      {/* Image area — flex-1 fills from y=0 to top of bottom panel.
          Chrome (close + favorite) overlays on top as absolutely-
          positioned floating buttons so the image reaches the very top
          of the viewport with no chrome bar pushing it down. Matches
          the VD Gaze pattern where the image extends behind the chrome
          row (calc 65vh + safe-area + chrome height in PrayClient.tsx). */}
      <div className="flex-1 min-h-0">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={8}
          centerOnInit={false}
          doubleClick={{ mode: "toggle", step: 2 }}
        >
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "100%", height: "100%" }}
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                className="select-none"
              />
            )}
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Bottom content panel — natural height anchored to the bottom of
          the viewport. Caps internal scroll at 55dvh so a long REFLECT
          expand can scroll within the panel without pushing the image
          off-screen. */}
      <div
        className="flex-shrink-0 overflow-y-auto"
        style={{
          background: C.espresso,
          borderTop: `1px solid ${C.divider}`,
          maxHeight: "55dvh",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
      >
        <div className="px-5 pt-4 pb-2">
          {/* Type label — Montserrat caps, P&P gradient color. The ONLY
              colored text on the card (per brief Section "The only
              colored text"). */}
          {typeLabel && (
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-2"
              style={{
                color: typeColor,
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              }}
            >
              {typeLabel}
            </div>
          )}

          {/* Title — Montserrat semibold, cream. No competing element. */}
          <h2
            className="font-semibold leading-tight mb-1"
            style={{
              color: C.cream,
              fontSize: "clamp(1.25rem, 4.5vw, 1.5rem)",
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            }}
          >
            {item.title}
          </h2>

          {/* Attribution — Open Sans, dim cream. Hidden if blank
              (per Phase A smoke test, 3 of 9 types may return null). */}
          {item.attribution && (
            <p
              className="text-sm"
              style={{
                color: C.creamDim,
                fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
              }}
            >
              {item.attribution}
            </p>
          )}

          {/* Description — body text, cream. Open Sans regular. */}
          {item.description && (
            <p
              className="mt-4 text-[15px] leading-relaxed"
              style={{
                color: C.cream,
                fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
              }}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Action zone — sacred-art + landscape get ENTER VISIO DIVINA
            (Phase B); other 7 contentTypes get REFLECT (Phase C).
            "PRAY WITH THIS IMAGE" is retired everywhere per the brief. */}
        {isVdEligible && (
          <div className="px-5 pt-4 pb-1">
            <div
              className="h-px mb-4"
              style={{ background: C.divider }}
              aria-hidden="true"
            />
            <Link
              href={`/pray/${item._id}`}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{
                color: C.gold,
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              }}
            >
              ENTER VISIO DIVINA
              <span aria-hidden="true">›</span>
            </Link>
          </div>
        )}

        {/* REFLECT (text + chevron, no border box). Sits below description,
            above contextual links. Tapping toggles an inline expand panel
            with scripture / quote / reflection questions / context. */}
        {!isVdEligible && hasReflectContent && (
          <div className="px-5 pt-4 pb-1">
            <div
              className="h-px mb-4"
              style={{ background: C.divider }}
              aria-hidden="true"
            />
            <button
              onClick={() => setShowReflect((v) => !v)}
              aria-expanded={showReflect}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
              style={{
                color: C.cream,
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              }}
            >
              REFLECT
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 transition-transform"
                style={{
                  transform: showReflect ? "rotate(180deg)" : "rotate(0deg)",
                }}
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showReflect && (
              <div className="mt-4 space-y-4">
                {item.scripturePairing && (
                  <div>
                    <h4
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1.5"
                      style={{
                        color: C.creamFaint,
                        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                      }}
                    >
                      Scripture
                    </h4>
                    <div
                      className="p-3"
                      style={{
                        background: "rgba(253,246,232,0.05)",
                        borderLeft: `2px solid ${C.gold}`,
                      }}
                    >
                      <p
                        className="italic text-[15px] leading-relaxed"
                        style={{
                          color: C.cream,
                          fontFamily:
                            "var(--font-cormorant), 'Cormorant Garamond', serif",
                        }}
                      >
                        &ldquo;{item.scripturePairing.verse}&rdquo;
                      </p>
                      <p
                        className="text-xs mt-2"
                        style={{
                          color: C.gold,
                          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                        }}
                      >
                        — {item.scripturePairing.reference}
                      </p>
                    </div>
                  </div>
                )}

                {item.quote?.text && (
                  <div>
                    <h4
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1.5"
                      style={{
                        color: C.creamFaint,
                        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                      }}
                    >
                      Quote
                    </h4>
                    <div
                      className="p-3"
                      style={{
                        background: "rgba(253,246,232,0.05)",
                        borderLeft: `2px solid ${C.gold}`,
                      }}
                    >
                      <p
                        className="italic text-[15px] leading-relaxed"
                        style={{
                          color: C.cream,
                          fontFamily:
                            "var(--font-cormorant), 'Cormorant Garamond', serif",
                        }}
                      >
                        &ldquo;{item.quote.text}&rdquo;
                      </p>
                      {(item.quote.attribution || item.quote.source) && (
                        <p
                          className="text-xs mt-2"
                          style={{
                            color: C.gold,
                            fontFamily:
                              "var(--font-montserrat), Montserrat, sans-serif",
                          }}
                        >
                          — {item.quote.attribution ?? item.quote.source}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {(item.reflectionQuestions?.length ?? 0) > 0 && (
                  <div>
                    <h4
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
                      style={{
                        color: C.creamFaint,
                        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                      }}
                    >
                      Reflect
                    </h4>
                    <div className="space-y-3">
                      {item.reflectionQuestions!.map((q, i) => (
                        <p
                          key={i}
                          className="text-sm leading-relaxed"
                          style={{
                            color: C.cream,
                            fontFamily:
                              "var(--font-open-sans), 'Open Sans', sans-serif",
                          }}
                        >
                          {q}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contextual links — Journey + P&P. Rendered only when
            reverse-ref lookups returned results. Shown below action
            zone with a divider above (brief Section "Contextual links"). */}
        {(item.journeys.length > 0 || item.dailyPrompts.length > 0) && (
          <div className="px-5 pt-4 pb-2">
            <div
              className="h-px mb-3"
              style={{ background: C.divider }}
              aria-hidden="true"
            />
            {/* Journey link(s) */}
            {item.journeys.length > 0 && (
              <div className="mb-2">
                {journeysVisible.map((j) => (
                  <Link
                    key={j._id}
                    href={`/journeys/${j.slug}`}
                    className="block text-sm py-1"
                    style={{
                      color: C.creamDim,
                      fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                    }}
                  >
                    Part of: {j.title} ›
                  </Link>
                ))}
                {moreJourneys > 0 && !showAllJourneys && (
                  <button
                    onClick={() => setShowAllJourneys(true)}
                    className="text-xs mt-1"
                    style={{
                      color: C.creamFaint,
                      fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                    }}
                  >
                    + {moreJourneys} more journey{moreJourneys === 1 ? "" : "s"}
                  </button>
                )}
              </div>
            )}
            {/* P&P link(s) */}
            {item.dailyPrompts.length > 0 && (
              <div>
                {ppVisible.map((p) => (
                  <Link
                    key={p.date}
                    href={`/library?expand=${expandFromDate(p.date)}#${anchorIdFromDate(p.date)}`}
                    className="block text-sm py-1"
                    style={{
                      color: C.creamDim,
                      fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                    }}
                  >
                    Pause & Ponder — {formatPpDate(p.date)} ›
                  </Link>
                ))}
                {morePp > 0 && !showAllPp && (
                  <button
                    onClick={() => setShowAllPp(true)}
                    className="text-xs mt-1"
                    style={{
                      color: C.creamFaint,
                      fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                    }}
                  >
                    + {morePp} more date{morePp === 1 ? "" : "s"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chrome overlay — absolutely positioned over the image so the image
          reaches the very top of the viewport. Subtle dark gradient backdrop
          keeps the close + favorite icons readable against bright images
          (gold icons, white skies) without painting a hard espresso bar
          that interrupts the image. Safe-area-inset-top so the chrome
          clears the iOS notch / Dynamic Island. */}
      <div
        className="absolute top-0 left-0 right-0 z-[61] flex items-center justify-between px-4 pb-2"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)",
          background:
            "linear-gradient(to bottom, rgba(22,17,13,0.55) 0%, rgba(22,17,13,0.25) 50%, rgba(22,17,13,0) 100%)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 flex items-center justify-center"
          style={{ color: C.cream }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
            style={{
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            }}
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <FavoriteButton itemId={item._id} type="contentItem" />
      </div>
    </div>
  );
}
