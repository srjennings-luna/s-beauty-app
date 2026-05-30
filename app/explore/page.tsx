"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getAllContentItems, getThemes } from "@/lib/sanity";
import type { ContentItem, Theme, ContentType, Artwork, LocationType } from "@/lib/types";
import ArtworkViewer from "@/components/ArtworkViewer";
import ThemeBubbleCanvas from "@/components/ThemeBubbleCanvas";

// Dynamically import map (no SSR)
const GlobalMap = dynamic(() => import("@/components/GlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-parchment">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-black/10 border-t-sage rounded-full animate-spin mb-2" />
        <p className="text-sage-muted text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  "sacred-art": "Sacred Art",
  "photography": "Photography",
  "thinker": "Thinkers",
  "literature": "Literature",
  "music": "Music",
  "food-wine": "Food & Wine",
  "landscape": "Landscape",
  "watch-listen": "Watch & Listen",
  "math-science": "Pattern & Proof",
};

const CONTENT_TYPE_TO_LOCATION: Record<ContentType, LocationType> = {
  "sacred-art": "sacred-art",
  "photography": "cultural",
  "thinker": "architecture",
  "literature": "cultural",
  "music": "workshop",
  "food-wine": "workshop",
  "landscape": "landscape",
  "watch-listen": "cultural",
  "math-science": "architecture",
};

function toArtwork(item: ContentItem): Artwork {
  return {
    id: item._id,
    title: item.title,
    artist: item.artist,
    year: item.year,
    imageUrl: item.imageUrl,
    description: item.description,
    historicalSummary: item.context,
    scripturePairing: item.scripturePairing,
    quote: item.quote
      ? { text: item.quote.text ?? "", attribution: item.quote.source ?? item.quote.attribution ?? "" }
      : undefined,
    locationType: CONTENT_TYPE_TO_LOCATION[item.contentType] ?? "sacred-art",
    reflectionQuestions: item.reflectionQuestions ?? [],
    locationName: item.locationName ?? "",
    city: item.city ?? "",
    country: item.country ?? "",
    coordinates: item.coordinates ?? { lat: 0, lng: 0 },
    order: 0,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [items, allThemes] = await Promise.all([
          getAllContentItems(),
          getThemes(),
        ]);
        setContent(items ?? []);
        setThemes((allThemes ?? []).sort((a: Theme, b: Theme) => (a.order ?? 99) - (b.order ?? 99)));
      } catch (err) {
        console.error("Error fetching Explore data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [retryCount]);

  // Filter content by selected theme. Dedupe only within a theme view —
  // not across the full feed — so a piece legitimately tagged with two
  // themes still shows up in both theme detail screens.
  //
  // Two-pass dedupe. Both passes keep the instance with the most theme
  // tags (richer copy wins; tie-breaker is first-seen via Map insertion
  // order).
  //
  // Pass 1: same title. Catches records with identical names like
  // "The Supper at Emmaus" ×2 or "Spiegel im Spiegel" ×2.
  //
  // Pass 2: same image asset. Catches records with different titles that
  // share one uploaded image — e.g., "Casina Pio IV" and "Casino of Pius
  // IV" (Vatican building, two naming conventions, one image). Title-only
  // dedupe misses these because the titles legitimately differ.
  //
  // Real fix for both is a Sanity cleanup pass — see Manual Task #52 in
  // CLAUDE.md and UX Backlog DUP-01.
  const filtered = useMemo(() => {
    if (!selectedTheme) return content;
    const themeFiltered = content.filter((i) =>
      i.themes?.some((t) => t._id === selectedTheme._id)
    );

    const dedupeBy = (
      items: typeof themeFiltered,
      keyFn: (item: (typeof themeFiltered)[number]) => string | null,
    ) => {
      const best = new Map<string, (typeof themeFiltered)[number]>();
      for (const item of items) {
        const key = keyFn(item) ?? `__noKey__${item._id}`;
        const existing = best.get(key);
        const itemThemes = item.themes?.length ?? 0;
        const existingThemes = existing?.themes?.length ?? -1;
        if (itemThemes > existingThemes) best.set(key, item);
      }
      return Array.from(best.values());
    };

    const byTitle = dedupeBy(themeFiltered, (i) =>
      i.title ? i.title.toLowerCase().trim() : null,
    );
    const byImage = dedupeBy(byTitle, (i) => {
      if (!i.imageUrl) return null;
      // Sanity CDN URLs end with "<assetHash>-<dim>.<ext>"; the filename
      // portion uniquely identifies the uploaded asset.
      return i.imageUrl.split("?")[0].split("/").pop() ?? null;
    });
    return byImage;
  }, [content, selectedTheme]);

  const mappable = useMemo(
    () => filtered.filter((i) => i.coordinates?.lat && i.coordinates?.lng),
    [filtered]
  );

  const mappableArtworks = useMemo(() => mappable.map(toArtwork), [mappable]);

  // Themes with at least one content item. Empty themes are dropped from the
  // bubble UI (the old grid greyed them out with "Coming soon"; the bubble
  // design doesn't accommodate that, and editorially the cleaner choice is
  // to surface only themes the user can actually browse). They reappear
  // automatically once content is added.
  const populatedThemes = useMemo(() => {
    return themes.filter((theme) =>
      content.some((i) => i.themes?.some((t) => t._id === theme._id))
    );
  }, [themes, content]);

  // Bubble size is proportional to content volume. Computed once here and
  // handed to the canvas so the data layer owns the count, not the visual.
  const contentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const theme of populatedThemes) {
      counts.set(
        theme._id,
        content.filter((i) => i.themes?.some((t) => t._id === theme._id)).length
      );
    }
    return counts;
  }, [populatedThemes, content]);

  const headerTitle = showMap ? "Map" : selectedTheme ? selectedTheme.title : "Explore";

  return (
    <div className="h-screen bg-parchment flex flex-col overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────────
          Two completely different designs:
          (a) Default (bubble landing or map view): the existing single-row
              header with "Explore" title + map toggle.
          (b) Theme detail (Option E): two-zone editorial header — slim nav
              chrome on top (back / CONTUERI wordmark / map), then the
              theme title in the theme's accent color (uppercase, no rule)
              with the italic question below. */}
      {selectedTheme && !showMap ? (
        <>
          {/* Zone 1 — slim nav chrome */}
          <div
            className="bg-parchment flex-shrink-0"
            style={{
              borderBottom: "0.5px solid rgba(22,17,13,0.18)",
              paddingTop: "env(safe-area-inset-top, 16px)",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ height: 46, padding: "0 14px" }}
            >
              <button
                onClick={() => setSelectedTheme(null)}
                aria-label="Back to themes"
                className="w-8 h-8 flex items-center justify-center"
                style={{ color: "#16110d" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <div className="flex-1 flex items-center justify-center">
                <span
                  style={{
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#16110d",
                  }}
                >
                  Contueri
                </span>
              </div>
              <button
                onClick={() => setShowMap((v) => !v)}
                aria-label="Show map view"
                className="w-8 h-8 flex items-center justify-center"
                style={{ color: "#16110d" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[17px] h-[17px]">
                  <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          {/* Zone 2 — editorial header (Option E: no rule, accent-colored title) */}
          <div
            className="bg-parchment text-center flex-shrink-0"
            style={{
              padding: "24px 32px 22px",
              borderBottom: "0.5px solid rgba(22,17,13,0.22)",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                lineHeight: 1.15,
                color: selectedTheme.color ?? "#1a1a1a",
                margin: 0,
              }}
            >
              {selectedTheme.title}
            </h1>
            {selectedTheme.question && (
              <p
                style={{
                  fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
                  fontSize: 14,
                  fontStyle: "italic",
                  // Editorial muted; matches the landing tagline at line ~370.
                  // Token --color-editorial-muted to be added in a later sweep.
                  color: "#978b7d",
                  lineHeight: 1.55,
                  marginTop: 20,
                  maxWidth: 270,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {selectedTheme.question}
              </p>
            )}
          </div>
        </>
      ) : (
        // ── Bubble landing (or map view) header — two-zone, matching the
        //    detail screen's Zone 1 + Zone 2 pattern. Zone 1 is the slim
        //    nav bar (Contueri wordmark + map button, no back chevron since
        //    this is the landing). Zone 2 is the editorial header
        //    ("Explore" Cormorant 40px + tagline). Same overall structure
        //    as the detail header so the two states feel unified. ──
        <>
          {/* Zone 1: slim nav bar */}
          <div
            className="bg-parchment flex-shrink-0"
            style={{
              borderBottom: "0.5px solid rgba(22,17,13,0.18)",
              paddingTop: "env(safe-area-inset-top, 16px)",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ height: 46, padding: "0 14px" }}
            >
              {/* Spacer where back chevron lives on the detail screen.
                  Keeps the wordmark optically centered. */}
              <div style={{ width: 32, height: 32 }} />
              <div className="flex-1 flex items-center justify-center">
                <span
                  style={{
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#16110d",
                  }}
                >
                  Contueri
                </span>
              </div>
              <button
                onClick={() => setShowMap((v) => !v)}
                aria-label={showMap ? "Show list view" : "Show map view"}
                className="w-8 h-8 flex items-center justify-center"
                style={{ color: "#16110d" }}
              >
                {showMap ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[17px] h-[17px]">
                    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[17px] h-[17px]">
                    <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75V15a.75.75 0 01-1.5 0V6.75A.75.75 0 019 6zm6.75 3a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V9z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {/* Zone 2: editorial header — Explore + tagline, centered */}
          <div
            className="bg-parchment text-center flex-shrink-0"
            style={{
              padding: "24px 22px 22px",
              borderBottom: "0.5px solid rgba(22,17,13,0.22)",
            }}
          >
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 40,
                fontWeight: 500,
                color: "#1a1a1a",
                letterSpacing: "0.5px",
                lineHeight: 1,
                margin: 0,
              }}
            >
              {headerTitle}
            </h1>
            {!showMap && (
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 16,
                  color: "#978b7d",
                  fontStyle: "italic",
                  fontWeight: 400,
                  margin: "7px 0 0",
                }}
              >
                What are you drawn to?
              </p>
            )}
          </div>
        </>
      )}

      {/* ── Content Area ── */}
      <div className="flex-1 relative min-h-0">
        {error ? (
          <div className="h-full flex items-center justify-center px-8">
            <div className="text-center">
              <p className="text-sage-muted mb-4">Couldn&apos;t load content.</p>
              <button
                onClick={() => { setError(false); setLoading(true); setRetryCount((c) => c + 1); }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-black/10 border-t-sage rounded-full animate-spin mb-2" />
              <p className="text-sage-muted text-sm">Loading…</p>
            </div>
          </div>
        ) : showMap ? (
          <GlobalMap
            artworks={mappableArtworks}
            onMarkerClick={(aw) => setSelectedItem(aw)}
            selectedArtwork={selectedItem}
          />
        ) : (
          <>
          {/* ── Bubble Landing ──────────────────────────────────────────────
              Always mounted (while not in map view) so the physics state
              survives the trip into a theme detail. Hidden via display:none
              when a theme is selected; the canvas pauses its rAF loop in
              that state so we don't burn battery on an off-screen sim. */}
          <div
            style={{
              display: selectedTheme ? "none" : "block",
              position: "absolute",
              inset: 0,
              paddingBottom: "5rem",
            }}
          >
            <ThemeBubbleCanvas
              themes={populatedThemes}
              contentCounts={contentCounts}
              onSelect={setSelectedTheme}
              isHidden={!!selectedTheme}
            />
          </div>

          {selectedTheme && (
          // ── Themed Content Feed — Option E editorial cards ───────────────
          // 1:1 image, Cormorant title, sage type label, italic excerpt.
          // Cards stack flush (no gap, no horizontal padding) so the images
          // bleed edge-to-edge of the column.
          <div className="h-full overflow-y-auto pb-20">
            <div className="flex flex-col">
              {filtered.map((item) => {
                const attribution =
                  item.artist ??
                  item.composer ??
                  item.author ??
                  item.thinkerName ??
                  item.locationName ??
                  "";
                const showVisio =
                  item.contentType === "sacred-art" ||
                  item.contentType === "landscape";
                return (
                  <button
                    key={item._id}
                    onClick={() => setSelectedItem(toArtwork(item))}
                    className="text-left w-full block"
                  >
                    {/* 1:1 full-bleed image */}
                    <div
                      className="relative w-full overflow-hidden"
                      style={{ aspectRatio: "1 / 1" }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {showVisio && (
                        <Link
                          href={`/pray/${item._id}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Visio Divina prayer"
                          className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </Link>
                      )}
                    </div>
                    {/* Typographic meta — no prop-rule between image and text */}
                    <div style={{ padding: "14px 18px 20px" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                          fontSize: 8,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.18em",
                          color: "#7a9a8a",
                          marginBottom: 7,
                        }}
                      >
                        {CONTENT_TYPE_LABELS[item.contentType]}
                      </div>
                      <h3
                        style={{
                          fontFamily: '"Cormorant Garamond", Georgia, serif',
                          fontSize: 24,
                          fontWeight: 400,
                          color: "#1a1a1a",
                          lineHeight: 1.2,
                          letterSpacing: "0.01em",
                          marginBottom: 4,
                          margin: 0,
                        }}
                      >
                        {item.title}
                      </h3>
                      {attribution && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#7a9a8a",
                            marginTop: 4,
                            marginBottom: 8,
                          }}
                        >
                          {attribution}
                        </p>
                      )}
                      {item.description && (
                        <p
                          style={{
                            fontFamily: '"Cormorant Garamond", Georgia, serif',
                            fontSize: 13,
                            fontStyle: "italic",
                            color: "var(--color-warm-dark)",
                            lineHeight: 1.65,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          )}
          </>
        )}
      </div>

      {/* ── Content Detail Viewer ── */}
      {selectedItem && (
        <ArtworkViewer artwork={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
