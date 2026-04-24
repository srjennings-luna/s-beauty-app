import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getDashboardJourneyCompletion,
  getDashboardContentItems,
  getDashboardTraditionReflections,
  getDashboardAudioStatus,
  getDashboardTTSAudit,
} from "@/lib/sanity";

// KALLOS content dashboard.
// Server-rendered, revalidated every 60s, gated by DASHBOARD_ENABLED env var.
// All data fetched server-side. See content-docs/KALLOS-CC-Audit-Brief.html for scope.

export const revalidate = 60;
export const metadata = { title: "KALLOS — Content Dashboard", robots: "noindex, nofollow" };

// Schema audit manually maintained — see Task 1 output for underlying detail.
const SCHEMA_HEALTH = {
  lastAudited: "2026-04-24",
  overall: "yellow" as "green" | "yellow" | "red",
  topIssues: [
    "R1 — RESOLVED. contentItem.curatorNote renamed to artworkHook with distinct job (artwork-specific, safe anywhere the piece appears). dailyPrompt.curatorNote and journeyDay.encounterNote keep their distinct roles.",
    "R5 — RESOLVED. journeyDay promoted from inline object to standalone document schema. 25 days migrated April 24, 2026.",
    "R3/R4 — lectio and auditio objects have different shapes on journeyDay vs dailyPrompt. One dashboard cannot treat them uniformly. Still open.",
  ],
  updateInstructions:
    "After any schema audit session, update SCHEMA_HEALTH in app/dashboard/page.tsx: change lastAudited to today, overall traffic light (green=all fixed, yellow=some open, red=blocking), and top 3 open issues by recommendation ID from KALLOS-Schema-Audit.html.",
};

// ─── Type shapes ──────────────────────────────────────────────────────────
type JourneyDaySummary = {
  _id?: string;
  dayNumber: number;
  dayTitle?: string;
  hasOpenImage: boolean;
  openTextLen: number;
  hasOpenTextAudio: boolean;
  hasEncounterRef: boolean;
  encNoteLen: number;
  hasEncNoteAudio: boolean;
  hasAuditio: boolean;
  hasAuditioFile: boolean;
  auditioGenre?: string;
  auditioComposerArtist?: string;
  auditioWorkTitle?: string;
  hasLectio: boolean;
  reflectCount: number;
  hasConnect: boolean;
  goDeeperCount: number;
};

type JourneyCompletionRow = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  order?: number;
  isPublished: boolean;
  totalDays: number | null;
  daysBuilt: number;
  plannedCount: number;
  themeName?: string;
  estimatedMinutesPerDay?: number;
  days?: JourneyDaySummary[];
};

type ContentItemRow = {
  _id: string;
  contentType: string;
  title: string;
  artist?: string;
  thinkerName?: string;
  author?: string;
  composer?: string;
  year?: string;
  medium?: string;
  era?: string;
  hasImage: boolean;
  hasArtworkHook: boolean;
  hasContext: boolean;
  hasAudioFile: boolean;
  themeCount: number;
  themeNames?: string[];
  journeyTitles?: string[];
  needsArtworkHookReview?: boolean;
};

type TRRow = {
  _id: string;
  authorType?: string;
  title: string;
  source?: string;
  era?: string;
  hasSummary: boolean;
  hasAudio: boolean;
  themeCount: number;
  themeNames?: string[];
  journeyCount: number;
  journeyTitles?: string[];
};

type TRByJourney = {
  _id: string;
  title: string;
  slug: string;
  daysBuilt: number;
  trRefs?: Array<{ _id: string; title: string; source: string; authorType: string; era?: string }>;
};

type AudioDay = { dayNumber: number; dayTitle?: string; hasOpenTextAudio: boolean; hasEncNoteAudio: boolean; hasAuditio: boolean };
type AudioJourney = { title: string; slug: string; days?: AudioDay[] };
type AudioPrompt = {
  _id: string;
  date: string;
  contentTitle?: string;
  hasCuratorAudio: boolean;
  hasAuditioFile: boolean;
  hasAuditioUrl: boolean;
  hasAuditioExt: boolean;
};
type GenreTally = { journeyDay: Array<{ genre?: string }>; dailyPrompt: Array<{ genre?: string }> };
type AudioStatusResult = { journeys: AudioJourney[]; prompts: AudioPrompt[]; genres?: GenreTally };

type TTSRecord = { chars: number; hasAudio: boolean };
type TTSResult = {
  journeyDayTTS: Array<{ title: string; days?: Array<{ dayNumber: number; dayTitle?: string; openTextChars: number; openTextHasAudio: boolean; encounterNoteChars: number; encounterNoteHasAudio: boolean }> }>;
  contentItemTTS: Array<{ _id: string; title: string; contentType: string; artworkHookChars: number; artworkHookHasAudio: boolean; contextChars: number; contextHasAudio: boolean }>;
  dailyPromptTTS: Array<{ _id: string; date: string; contentTitle?: string; curatorChars: number; curatorHasAudio: boolean }>;
  traditionReflectionTTS: Array<{ _id: string; title: string; authorType?: string; summaryChars: number; summaryHasAudio: boolean }>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────
function dayTrafficLight(d: JourneyDaySummary): "green" | "yellow" | "red" {
  if (!d.hasOpenImage || !d.hasEncounterRef || d.reflectCount === 0) return "red";
  const keyFields = [d.openTextLen > 0, d.encNoteLen > 0, d.hasAuditio, d.hasLectio, d.goDeeperCount > 0];
  const populated = keyFields.filter(Boolean).length;
  if (populated >= 4) return "green";
  if (populated >= 2) return "yellow";
  return "red";
}

function lightColor(status: "green" | "yellow" | "red") {
  return status === "green" ? "#4a7a62" : status === "yellow" ? "#C19B5F" : "#c25555";
}

function Yes({ value }: { value: boolean | undefined }) {
  return value ? <span className="text-[#4a7a62] font-bold">Y</span> : <span className="text-[#c25555]">—</span>;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-[#e8e0d4] bg-[#fdfaf2] p-4">
      <div className="font-serif text-3xl font-normal text-[#16110d] leading-none">{value}</div>
      <div className="mt-2 font-sans text-[9px] font-bold tracking-widest uppercase text-[#C19B5F]">{label}</div>
      {sub && <div className="mt-1 text-[11px] text-[#7a7062]">{sub}</div>}
    </div>
  );
}

function SectionHeading({ num, title, note }: { num: number; title: string; note?: string }) {
  return (
    <div className="mt-12 mb-4 border-b border-[#e8e0d4] pb-2">
      <div className="font-sans text-[10px] font-bold tracking-widest uppercase text-[#C19B5F]">Section {num}</div>
      <h2 className="font-sans text-lg font-bold text-[#16110d] mt-1">{title}</h2>
      {note && <p className="text-xs text-[#7a7062] mt-1 italic">{note}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  if (process.env.DASHBOARD_ENABLED !== "true") {
    notFound();
  }

  const [rawJourneys, rawContentItems, rawTrData, rawAudioStatus, rawTTS] = await Promise.all([
    getDashboardJourneyCompletion() as Promise<(JourneyCompletionRow | null)[] | null>,
    getDashboardContentItems() as Promise<(ContentItemRow | null)[] | null>,
    getDashboardTraditionReflections() as Promise<{ list: (TRRow | null)[] | null; byJourney: (TRByJourney | null)[] | null } | null>,
    getDashboardAudioStatus() as Promise<(AudioStatusResult & { journeys: (AudioJourney | null)[] | null; prompts: (AudioPrompt | null)[] | null }) | null>,
    getDashboardTTSAudit() as Promise<TTSResult | null>,
  ]);

  // ─── Null-safe normalization ─────────────────────────────────────────
  // Sanity `->` dereferences return null when a reference target is missing
  // (deleted doc, unpublished, or orphaned). Those nulls flatten into arrays
  // like `days[].goDeeper[]->{...}`. Filter everything once, at the boundary,
  // so downstream code and JSX can assume non-null rows.
  const notNull = <T,>(x: T): x is NonNullable<T> => x != null;

  const journeys: JourneyCompletionRow[] = (rawJourneys ?? []).filter(notNull).map((j) => ({
    ...j,
    days: (j.days ?? []).filter(notNull),
  }));
  const contentItems: ContentItemRow[] = (rawContentItems ?? []).filter(notNull);
  const trData: { list: TRRow[]; byJourney: TRByJourney[] } = {
    list: (rawTrData?.list ?? []).filter(notNull),
    byJourney: (rawTrData?.byJourney ?? []).filter(notNull).map((j) => ({
      ...j,
      trRefs: (j.trRefs ?? []).filter(notNull),
    })),
  };
  const audioStatus: { journeys: AudioJourney[]; prompts: AudioPrompt[]; genres: GenreTally } = {
    journeys: (rawAudioStatus?.journeys ?? []).filter(notNull).map((j) => ({
      ...j,
      days: (j.days ?? []).filter(notNull),
    })),
    prompts: (rawAudioStatus?.prompts ?? []).filter(notNull),
    genres: {
      journeyDay: (rawAudioStatus?.genres?.journeyDay ?? []).filter(notNull),
      dailyPrompt: (rawAudioStatus?.genres?.dailyPrompt ?? []).filter(notNull),
    },
  };
  const tts: TTSResult = {
    journeyDayTTS: (rawTTS?.journeyDayTTS ?? []).filter(notNull).map((j) => ({
      ...j,
      days: (j.days ?? []).filter(notNull),
    })),
    contentItemTTS: (rawTTS?.contentItemTTS ?? []).filter(notNull),
    dailyPromptTTS: (rawTTS?.dailyPromptTTS ?? []).filter(notNull),
    traditionReflectionTTS: (rawTTS?.traditionReflectionTTS ?? []).filter(notNull),
  };

  // ─── Section 1 data prep ─────────────────────────────────────────────
  const journeysSorted = [...journeys].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  // ─── Section 2 data prep — group by type ─────────────────────────────
  const byContentType: Record<string, ContentItemRow[]> = {};
  contentItems.forEach((c) => {
    const k = c.contentType || "(no type)";
    (byContentType[k] ||= []).push(c);
  });
  const contentTypeKeys = Object.keys(byContentType).sort();

  // ─── Section 3 data prep — thinker map + type breakdown ──────────────
  const trList = trData.list;
  const authorCountsAcrossJourneys = new Map<string, Set<string>>();
  trData.byJourney.forEach((j) => {
    (j.trRefs || []).forEach((tr) => {
      if (!tr) return;
      const author = (tr.source || "").split(",")[0].split("(")[0].trim() || "(unknown)";
      if (!authorCountsAcrossJourneys.has(author)) authorCountsAcrossJourneys.set(author, new Set());
      authorCountsAcrossJourneys.get(author)!.add(j.title);
    });
  });
  const authorsInMultipleJourneys = Array.from(authorCountsAcrossJourneys.entries())
    .filter(([, js]) => js.size > 1)
    .map(([a, js]) => ({ author: a, journeys: Array.from(js) }));

  const typeCounts = trList.reduce<Record<string, number>>((acc, tr) => {
    const k = tr.authorType || "(unset)";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const allAuthorTypes = ["church-father", "saint", "pope", "doctor", "theologian", "mystic", "philosopher"];
  const typeRows = allAuthorTypes.map((t) => {
    const count = typeCounts[t] || 0;
    const pct = trList.length ? Math.round((100 * count) / trList.length) : 0;
    return { type: t, count, pct };
  });

  const daysWithZeroTR = trData.byJourney.flatMap((j) => {
    const refs = j.trRefs || [];
    const perDayCount = new Map<number, number>(); // approximation — flat refs list; OK for aggregate flag
    return refs.length === 0 ? [j.title] : [];
  });

  // ─── Section 5 data prep — schema health summary block above ─────────

  // ─── Section 6 data prep — TTS totals by doc type ────────────────────
  type Gap = { recs: number; withAudio: number; missingAudio: number; missingChars: number };
  const gap = (): Gap => ({ recs: 0, withAudio: 0, missingAudio: 0, missingChars: 0 });
  const ttsByType: Record<string, Gap> = {
    journeyDay: gap(),
    contentItem: gap(),
    dailyPrompt: gap(),
    traditionReflection: gap(),
  };

  tts.journeyDayTTS.forEach((j) => {
    (j.days || []).forEach((d) => {
      // openText
      if (d.openTextChars > 0) {
        ttsByType.journeyDay.recs++;
        if (d.openTextHasAudio) ttsByType.journeyDay.withAudio++;
        else {
          ttsByType.journeyDay.missingAudio++;
          ttsByType.journeyDay.missingChars += d.openTextChars;
        }
      }
      if (d.encounterNoteChars > 0) {
        ttsByType.journeyDay.recs++;
        if (d.encounterNoteHasAudio) ttsByType.journeyDay.withAudio++;
        else {
          ttsByType.journeyDay.missingAudio++;
          ttsByType.journeyDay.missingChars += d.encounterNoteChars;
        }
      }
    });
  });
  tts.contentItemTTS.forEach((ci) => {
    if (ci.artworkHookChars > 0) {
      ttsByType.contentItem.recs++;
      if (ci.artworkHookHasAudio) ttsByType.contentItem.withAudio++;
      else {
        ttsByType.contentItem.missingAudio++;
        ttsByType.contentItem.missingChars += ci.artworkHookChars;
      }
    }
    if (ci.contextChars > 0) {
      ttsByType.contentItem.recs++;
      if (ci.contextHasAudio) ttsByType.contentItem.withAudio++;
      else {
        ttsByType.contentItem.missingAudio++;
        ttsByType.contentItem.missingChars += ci.contextChars;
      }
    }
  });
  tts.dailyPromptTTS.forEach((p) => {
    if (p.curatorChars > 0) {
      ttsByType.dailyPrompt.recs++;
      if (p.curatorHasAudio) ttsByType.dailyPrompt.withAudio++;
      else {
        ttsByType.dailyPrompt.missingAudio++;
        ttsByType.dailyPrompt.missingChars += p.curatorChars;
      }
    }
  });
  tts.traditionReflectionTTS.forEach((tr) => {
    if (tr.summaryChars > 0) {
      ttsByType.traditionReflection.recs++;
      if (tr.summaryHasAudio) ttsByType.traditionReflection.withAudio++;
      else {
        ttsByType.traditionReflection.missingAudio++;
        ttsByType.traditionReflection.missingChars += tr.summaryChars;
      }
    }
  });

  const grandChars = Object.values(ttsByType).reduce((sum, g) => sum + g.missingChars, 0);
  const grandWords = Math.round(grandChars / 5.2);

  // Audio coverage counts for Section 4
  const promptAudioMissing = audioStatus.prompts.filter(
    (p) => !p.hasAuditioFile && !p.hasAuditioUrl && !p.hasAuditioExt
  ).length;
  const promptCuratorAudioMissing = audioStatus.prompts.filter((p) => !p.hasCuratorAudio).length;

  // Genre distribution (Section 4). Flag any genre >40% of total.
  const genreEntries = [
    ...audioStatus.genres.journeyDay.map((g) => g.genre).filter((g): g is string => !!g),
    ...audioStatus.genres.dailyPrompt.map((g) => g.genre).filter((g): g is string => !!g),
  ];
  const genreTotals = genreEntries.reduce<Record<string, number>>((acc, g) => {
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const genreRows = Object.entries(genreTotals)
    .map(([genre, count]) => ({
      genre,
      count,
      pct: genreEntries.length ? Math.round((100 * count) / genreEntries.length) : 0,
    }))
    .sort((a, b) => b.count - a.count);
  const genreFlagged = genreRows.filter((r) => r.pct > 40);

  // REVIEW indicator for Section 2. Detected from data state: REVIEW items
  // are content items that still hold legacy curatorNote text (the April 24
  // migration unset curatorNote on KEEP items only).
  const reviewItems = contentItems.filter((c) => c.needsArtworkHookReview);

  return (
    <div className="min-h-screen bg-[#fdf6e8] text-[#2C2C2C] pb-32">
      {/* Cover */}
      <div className="bg-[#16110d] text-[#fdf6e8] py-12 px-6 text-center">
        <div className="font-sans text-[11px] tracking-widest uppercase text-[#C19B5F] mb-2">KALLOS · Content Dashboard</div>
        <h1 className="font-serif text-3xl font-light tracking-wider">Live content state</h1>
        <div className="text-xs italic text-[#bfb8aa] mt-2">Queries live at page load · Revalidated every 60 seconds</div>
        <div className="text-[10px] text-[#7a7062] mt-3">Gated by DASHBOARD_ENABLED env var · noindex</div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* High-level stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="Journeys" value={journeys.length} sub={`${journeys.filter((j) => j.isPublished).length} published`} />
          <StatCard label="Content Items" value={contentItems.length} />
          <StatCard label="Daily Prompts" value={audioStatus.prompts.length} />
          <StatCard label="Tradition Reflections" value={trList.length} />
        </div>

        {/* ═══ Section 1 — Journey Completion Status ═══ */}
        <SectionHeading num={1} title="Journey Completion Status" note="Traffic light per day — green = 4+ key fields populated, yellow = 2–3, red = 0–1 or missing required field" />
        {journeysSorted.map((j) => {
          const pct = j.totalDays ? Math.round((100 * j.daysBuilt) / j.totalDays) : 100;
          return (
            <div key={j._id} className="border border-[#e8e0d4] mb-5">
              <div className="bg-[#16110d] text-[#fdf6e8] px-4 py-2 flex items-baseline gap-4 flex-wrap">
                <span className="font-sans text-base">{j.title}</span>
                <span className="font-sans text-[11px] text-[#C19B5F] tracking-wider">
                  {j.daysBuilt} / {j.totalDays ?? "null"} days ({pct}%){j.plannedCount ? ` · ${j.plannedCount} planned` : ""}
                </span>
                <span className="font-sans text-[10px] text-[#bfb8aa] ml-auto">{j.themeName ?? ""} · order {j.order ?? "—"}</span>
              </div>
              <div className="p-3 overflow-x-auto">
                {j.totalDays === null && (
                  <div className="bg-[#fdf0f0] border-l-2 border-[#c25555] text-xs p-2 mb-2">
                    <strong className="text-[#c25555]">totalDays is null.</strong> Enter the intended arc length in Sanity Studio.
                  </div>
                )}
                <table className="w-full text-[11px]">
                  <thead className="bg-[#16110d] text-[#fdf6e8]">
                    <tr>
                      <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Day</th>
                      <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Title</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Img</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Open</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">OpenAud</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">EncNote</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">EncAud</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Audio</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Lectio</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Rq</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Connect</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">goDeeper</th>
                      <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(j.days || []).map((d) => {
                      const status = dayTrafficLight(d);
                      return (
                        <tr key={d._id ?? d.dayNumber} className="border-b border-[#e8e0d4]">
                          <td className="px-2 py-1 text-right">{d.dayNumber}</td>
                          <td className="px-2 py-1">
                            <a
                              href={
                                d._id
                                  ? `https://seeking-beauty.sanity.studio/structure/journeyDay;${d._id}`
                                  : `https://seeking-beauty.sanity.studio/structure/journey;${j._id}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#16110d] hover:text-[#C19B5F] underline decoration-transparent hover:decoration-[#C19B5F]"
                            >
                              {d.dayTitle || "(no title)"}
                            </a>
                          </td>
                          <td className="px-2 py-1 text-center"><Yes value={d.hasOpenImage} /></td>
                          <td className="px-2 py-1 text-right text-[10px] text-[#5a5048]">{d.openTextLen}</td>
                          <td className="px-2 py-1 text-center"><Yes value={d.hasOpenTextAudio} /></td>
                          <td className="px-2 py-1 text-right text-[10px] text-[#5a5048]">{d.encNoteLen}</td>
                          <td className="px-2 py-1 text-center"><Yes value={d.hasEncNoteAudio} /></td>
                          <td className="px-2 py-1 text-center"><Yes value={d.hasAuditio} /></td>
                          <td className="px-2 py-1 text-center"><Yes value={d.hasLectio} /></td>
                          <td className="px-2 py-1 text-right">{d.reflectCount}</td>
                          <td className="px-2 py-1 text-center"><Yes value={d.hasConnect} /></td>
                          <td className="px-2 py-1 text-right">{d.goDeeperCount}</td>
                          <td className="px-2 py-1 text-center">
                            <span
                              aria-label={status}
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: lightColor(status) }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* ═══ Section 2 — Content Item Library ═══ */}
        <SectionHeading num={2} title="Content Item Library" note="Grouped by content type. Image and ≥1 theme are required. Red = one or more missing." />
        {reviewItems.length > 0 && (
          <div className="bg-[#fff5e0] border-l-2 border-[#a06010] p-3 mb-4 text-xs">
            <div className="flex items-baseline gap-3 flex-wrap">
              <strong className="text-[#a06010] uppercase tracking-widest text-[10px]">
                {reviewItems.length} artworkHook{reviewItems.length === 1 ? "" : "s"} pending rewrite
              </strong>
              <span className="text-[#5a5048]">
                These content items still hold legacy curator-note text that was flagged REVIEW in the April 24 audit. Rewrite the hook at the artwork level (piece-specific, safe anywhere) and paste into the Artwork Hook field; the legacy curatorNote will clear automatically.
              </span>
            </div>
            <ul className="mt-2 ml-4 list-disc space-y-0.5">
              {reviewItems.map((c) => (
                <li key={c._id}>
                  <span className="text-[#16110d]">{c.title}</span>
                  <span className="text-[#5a5048]"> — {c.contentType}</span>
                  {c.journeyTitles && c.journeyTitles.length > 0 && (
                    <span className="text-[#5a5048]"> · {c.journeyTitles.join(", ")}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {contentTypeKeys.map((t) => (
          <div key={t} className="mb-5">
            <div className="bg-[#16110d] text-[#fdf6e8] px-4 py-2 flex items-baseline gap-4">
              <span className="font-sans text-base">{t}</span>
              <span className="font-sans text-[11px] text-[#C19B5F] tracking-wider">{byContentType[t].length} items</span>
            </div>
            <div className="overflow-x-auto border border-t-0 border-[#e8e0d4]">
              <table className="w-full text-[11px]">
                <thead className="bg-[#fdf6e8]">
                  <tr>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Title</th>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Byline</th>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Era / Year</th>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Medium</th>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Journey</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Img</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">ArtworkHook</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Context</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Themes</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {byContentType[t].map((c) => {
                    const red = !c.hasImage || c.themeCount === 0;
                    const byline = c.artist || c.thinkerName || c.author || c.composer || "";
                    return (
                      <tr key={c._id} className={`border-b border-[#e8e0d4] ${red ? "bg-[#fdf0f0]" : ""}`}>
                        <td className="px-2 py-1">{c.title}</td>
                        <td className="px-2 py-1 text-[#5a5048]">{byline}</td>
                        <td className="px-2 py-1 text-[#5a5048]">{c.era || c.year || "—"}</td>
                        <td className="px-2 py-1 text-[#5a5048]">{c.medium || "—"}</td>
                        <td className="px-2 py-1 text-[#5a5048]">{(c.journeyTitles || []).join(", ") || "—"}</td>
                        <td className="px-2 py-1 text-center"><Yes value={c.hasImage} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={c.hasArtworkHook} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={c.hasContext} /></td>
                        <td className="px-2 py-1 text-right">{c.themeCount}</td>
                        <td className="px-2 py-1 text-center"><Yes value={c.hasAudioFile} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* ═══ Section 3 — Tradition Reflection Tracker ═══ */}
        <SectionHeading num={3} title="Go Deeper / Tradition Reflection Tracker" />

        {daysWithZeroTR.length > 0 && (
          <div className="bg-[#fdf0f0] border-l-2 border-[#c25555] text-xs p-3 mb-4">
            <strong className="text-[#c25555] uppercase tracking-widest text-[10px]">Journeys with zero linked TRs:</strong>
            <span className="ml-2">{daysWithZeroTR.join(", ")}</span>
          </div>
        )}

        {authorsInMultipleJourneys.length > 0 ? (
          <div className="bg-[#fff5e0] border-l-2 border-[#a06010] text-xs p-3 mb-4">
            <strong className="text-[#a06010] uppercase tracking-widest text-[10px]">Authors appearing in more than one journey:</strong>
            <ul className="mt-1 ml-4 list-disc">
              {authorsInMultipleJourneys.map((a) => (
                <li key={a.author}>
                  {a.author}: {a.journeys.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-[#f0f7f3] border-l-2 border-[#4a7a62] text-xs p-3 mb-4">
            <strong className="text-[#4a7a62] uppercase tracking-widest text-[10px]">No cross-journey author repeats.</strong>
          </div>
        )}

        <h3 className="font-sans text-sm font-bold text-[#16110d] mt-4 mb-2">AuthorType breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-[#16110d] text-[#fdf6e8]">
              <tr>
                <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Type</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Count</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">%</th>
              </tr>
            </thead>
            <tbody>
              {typeRows.map((r) => (
                <tr key={r.type} className={`border-b border-[#e8e0d4] ${r.count === 0 ? "bg-[#fdf0f0]" : ""}`}>
                  <td className="px-2 py-1">{r.type}</td>
                  <td className="px-2 py-1 text-right">{r.count}</td>
                  <td className="px-2 py-1 text-right">{r.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-sans text-sm font-bold text-[#16110d] mt-4 mb-2">TRs by journey</h3>
        <div className="space-y-4">
          {trData.byJourney.map((j) => (
            <details key={j._id} className="border border-[#e8e0d4]">
              <summary className="bg-[#16110d] text-[#fdf6e8] px-4 py-2 cursor-pointer flex items-baseline gap-4">
                <span className="font-sans text-sm">{j.title}</span>
                <span className="font-sans text-[11px] text-[#C19B5F] tracking-wider">
                  {(j.trRefs || []).length} TRs across {j.daysBuilt} days
                </span>
              </summary>
              <div className="p-3 overflow-x-auto">
                {(j.trRefs || []).length === 0 ? (
                  <p className="text-xs text-[#c25555] italic">No tradition reflections linked to any day in this journey.</p>
                ) : (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Type</th>
                        <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Title</th>
                        <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Source</th>
                        <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Era</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(j.trRefs || []).map((tr) => (
                        <tr key={tr._id} className="border-b border-[#e8e0d4]">
                          <td className="px-2 py-1">{tr.authorType}</td>
                          <td className="px-2 py-1">{tr.title}</td>
                          <td className="px-2 py-1 text-[#5a5048]">{tr.source}</td>
                          <td className="px-2 py-1">{tr.era || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </details>
          ))}
        </div>

        <details className="mt-4 border border-[#e8e0d4]">
          <summary className="bg-[#fdf6e8] text-[#16110d] px-4 py-2 cursor-pointer font-sans text-sm">Full tradition reflection list ({trList.length})</summary>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-[#16110d] text-[#fdf6e8]">
                <tr>
                  <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Type</th>
                  <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Era</th>
                  <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Title</th>
                  <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Source</th>
                  <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Summary</th>
                  <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Audio</th>
                  <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Themes</th>
                  <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Journeys</th>
                </tr>
              </thead>
              <tbody>
                {trList.map((tr) => {
                  const red = tr.themeCount === 0 || !tr.era;
                  return (
                    <tr key={tr._id} className={`border-b border-[#e8e0d4] ${red ? "bg-[#fdf0f0]" : ""}`}>
                      <td className="px-2 py-1">{tr.authorType || "—"}</td>
                      <td className="px-2 py-1">{tr.era || <span className="text-[#c25555]">unset</span>}</td>
                      <td className="px-2 py-1">{tr.title}</td>
                      <td className="px-2 py-1 text-[#5a5048] max-w-xs truncate">{tr.source || "—"}</td>
                      <td className="px-2 py-1 text-center"><Yes value={tr.hasSummary} /></td>
                      <td className="px-2 py-1 text-center"><Yes value={tr.hasAudio} /></td>
                      <td className="px-2 py-1 text-[#5a5048]">{(tr.themeNames || []).join(", ") || "—"}</td>
                      <td className="px-2 py-1 text-[#5a5048]">{(tr.journeyTitles || []).join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>

        {/* ═══ Section 4 — Audio Status ═══ */}
        <SectionHeading num={4} title="Audio Status" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="P&P records missing all audio" value={promptAudioMissing} sub={`${audioStatus.prompts.length} prompts total`} />
          <StatCard label="P&P records missing curator audio" value={promptCuratorAudioMissing} sub="Narration for the daily hook" />
        </div>

        <h3 className="font-sans text-sm font-bold text-[#16110d] mt-4 mb-2">Genre distribution (auditio)</h3>
        {genreEntries.length === 0 ? (
          <p className="text-[11px] text-[#7a7062] italic mb-3">
            No genre values entered yet. Populate <code className="text-[10px] bg-[#f0ebe0] px-1">auditio.genre</code> in Sanity Studio on each journey day and P&P to start tracking variety.
          </p>
        ) : (
          <>
            {genreFlagged.length > 0 && (
              <div className="bg-[#fff5e0] border-l-2 border-[#a06010] p-2 mb-2 text-xs">
                <strong className="text-[#a06010] uppercase tracking-widest text-[10px]">Over-concentration:</strong>{" "}
                {genreFlagged.map((g) => `${g.genre} (${g.pct}%)`).join(", ")} — exceed 40% of all genre-tagged auditio selections.
              </div>
            )}
            <div className="overflow-x-auto border border-[#e8e0d4] mb-4">
              <table className="w-full text-[11px]">
                <thead className="bg-[#16110d] text-[#fdf6e8]">
                  <tr>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Genre</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Count</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">%</th>
                  </tr>
                </thead>
                <tbody>
                  {genreRows.map((r) => (
                    <tr key={r.genre} className={`border-b border-[#e8e0d4] ${r.pct > 40 ? "bg-[#fff5e0]" : ""}`}>
                      <td className="px-2 py-1"><code className="text-[10px] bg-[#f0ebe0] px-1">{r.genre}</code></td>
                      <td className="px-2 py-1 text-right">{r.count}</td>
                      <td className="px-2 py-1 text-right">{r.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h3 className="font-sans text-sm font-bold text-[#16110d] mt-4 mb-2">Journey day audio</h3>
        {audioStatus.journeys.map((j) => (
          <div key={j.slug} className="border border-[#e8e0d4] mb-3">
            <div className="bg-[#16110d] text-[#fdf6e8] px-4 py-2 font-sans text-sm">{j.title}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-[#fdf6e8]">
                  <tr>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Day</th>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Title</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">openTextAudio</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">encounterNoteAudio</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">auditio music</th>
                  </tr>
                </thead>
                <tbody>
                  {(j.days || []).map((d) => {
                    const red = !d.hasOpenTextAudio && !d.hasEncNoteAudio && !d.hasAuditio;
                    return (
                      <tr key={d.dayNumber} className={`border-b border-[#e8e0d4] ${red ? "bg-[#fdf0f0]" : ""}`}>
                        <td className="px-2 py-1 text-right">{d.dayNumber}</td>
                        <td className="px-2 py-1">{d.dayTitle || "(no title)"}</td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasOpenTextAudio} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasEncNoteAudio} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasAuditio} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <h3 className="font-sans text-sm font-bold text-[#16110d] mt-4 mb-2">Daily prompt audio</h3>
        <div className="overflow-x-auto border border-[#e8e0d4]">
          <table className="w-full text-[11px]">
            <thead className="bg-[#16110d] text-[#fdf6e8]">
              <tr>
                <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Date</th>
                <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Content</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">curator audio</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">auditio file</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">auditio URL</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">external</th>
              </tr>
            </thead>
            <tbody>
              {audioStatus.prompts.map((p) => {
                const red = !p.hasAuditioFile && !p.hasAuditioUrl && !p.hasAuditioExt;
                return (
                  <tr key={p._id} className={`border-b border-[#e8e0d4] ${red ? "bg-[#fdf0f0]" : ""}`}>
                    <td className="px-2 py-1">{p.date}</td>
                    <td className="px-2 py-1">{p.contentTitle || "(?)"}</td>
                    <td className="px-2 py-1 text-center"><Yes value={p.hasCuratorAudio} /></td>
                    <td className="px-2 py-1 text-center"><Yes value={p.hasAuditioFile} /></td>
                    <td className="px-2 py-1 text-center"><Yes value={p.hasAuditioUrl} /></td>
                    <td className="px-2 py-1 text-center"><Yes value={p.hasAuditioExt} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ═══ Section 5 — Schema Health (STATIC) ═══ */}
        <SectionHeading num={5} title="Schema Health (static)" note="Hand-maintained from the latest KALLOS-Schema-Audit.html. Does not query Sanity." />
        <div className="border border-[#e8e0d4] p-4 bg-[#fdfaf2]">
          <div className="flex items-baseline gap-4 mb-3">
            <span
              aria-label={`overall status ${SCHEMA_HEALTH.overall}`}
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: lightColor(SCHEMA_HEALTH.overall) }}
            />
            <span className="font-sans text-sm font-bold text-[#16110d] capitalize">{SCHEMA_HEALTH.overall}</span>
            <span className="font-sans text-xs text-[#7a7062] ml-auto">Last audited: {SCHEMA_HEALTH.lastAudited}</span>
          </div>
          <h4 className="font-sans text-[10px] tracking-wider uppercase text-[#C19B5F] font-bold mb-2">Top open issues</h4>
          <ol className="list-decimal ml-5 text-xs space-y-1">
            {SCHEMA_HEALTH.topIssues.map((iss, i) => (
              <li key={i}>{iss}</li>
            ))}
          </ol>
          <details className="mt-4 text-[11px] text-[#7a7062]">
            <summary className="cursor-pointer font-sans uppercase tracking-wider text-[9px] text-[#4a7a62]">How to update this section</summary>
            <p className="mt-2 leading-relaxed italic">{SCHEMA_HEALTH.updateInstructions}</p>
          </details>
        </div>

        {/* ═══ Section 6 — TTS Coverage and Cost Estimate ═══ */}
        <SectionHeading num={6} title="TTS Coverage and Cost Estimate" note="Published records only. Pricing table is static — update manually when provider rates change." />

        <div className="overflow-x-auto border border-[#e8e0d4]">
          <table className="w-full text-[11px]">
            <thead className="bg-[#16110d] text-[#fdf6e8]">
              <tr>
                <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Document type</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Records populated</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">With audio</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Missing audio</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">Missing chars</th>
                <th className="px-2 py-1 font-sans text-[9px] tracking-wider">~Words</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ttsByType).map(([k, v]) => (
                <tr key={k} className="border-b border-[#e8e0d4]">
                  <td className="px-2 py-1"><code className="text-[10px] bg-[#f0ebe0] px-1">{k}</code></td>
                  <td className="px-2 py-1 text-right">{v.recs}</td>
                  <td className="px-2 py-1 text-right text-[#4a7a62]">{v.withAudio}</td>
                  <td className="px-2 py-1 text-right text-[#c25555]">{v.missingAudio}</td>
                  <td className="px-2 py-1 text-right">{v.missingChars.toLocaleString()}</td>
                  <td className="px-2 py-1 text-right">{Math.round(v.missingChars / 5.2).toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-[#16110d] text-[#fdf6e8] font-bold">
                <td className="px-2 py-1 text-[#C19B5F]">GRAND TOTAL</td>
                <td className="px-2 py-1"></td>
                <td className="px-2 py-1"></td>
                <td className="px-2 py-1"></td>
                <td className="px-2 py-1 text-right">{grandChars.toLocaleString()}</td>
                <td className="px-2 py-1 text-right">{grandWords.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-sans text-sm font-bold text-[#16110d] mt-6 mb-2">Cost reference (static — manual update)</h3>
        <p className="text-xs text-[#7a7062] mb-2 italic">Rates current as of April 23, 2026. Verify before costing. Apply to the Grand Total above.</p>
        <div className="overflow-x-auto border border-[#e8e0d4]">
          <table className="w-full text-[11px]">
            <thead className="bg-[#16110d] text-[#fdf6e8]">
              <tr>
                <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Provider</th>
                <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Tier</th>
                <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Rate per 1,000 chars</th>
                <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e8e0d4]"><td className="px-2 py-1">Google Cloud TTS</td><td className="px-2 py-1">Neural2 / WaveNet</td><td className="px-2 py-1">$0.016</td><td className="px-2 py-1 text-[#5a5048]">First 1M chars/mo free tier</td></tr>
              <tr className="border-b border-[#e8e0d4]"><td className="px-2 py-1">Amazon Polly</td><td className="px-2 py-1">Neural</td><td className="px-2 py-1">$0.016</td><td className="px-2 py-1 text-[#5a5048]">1M chars/mo free for first 12 months</td></tr>
              <tr className="border-b border-[#e8e0d4]"><td className="px-2 py-1">ElevenLabs API</td><td className="px-2 py-1">Flash / Turbo</td><td className="px-2 py-1">$0.060</td><td className="px-2 py-1 text-[#5a5048]">Multilingual v2/v3: $0.12/1K</td></tr>
              <tr className="border-b border-[#e8e0d4]"><td className="px-2 py-1">ElevenLabs subscription</td><td className="px-2 py-1">Starter</td><td className="px-2 py-1">~$5/month ≈ 30K chars</td><td className="px-2 py-1 text-[#5a5048]">Commercial license included</td></tr>
            </tbody>
          </table>
        </div>

        {/* ═══ Section 7 — Companion Journey Readiness (placeholder) ═══ */}
        <SectionHeading num={7} title="Companion Journey Readiness" note="Placeholders — will query live once content is entered in Sanity" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "Seeking Beauty — Episode 1 (EWTN)", status: "Planning" },
            { name: "CTS Rome Pilgrimage", status: "Planning" },
            { name: "Elizabeth Lev — Pio Cristiano Lecture", status: "Planning" },
          ].map((c) => (
            <div key={c.name} className="border border-dashed border-[#e8e0d4] p-4 bg-[#fdfaf2]">
              <div className="font-serif text-base text-[#16110d]">{c.name}</div>
              <div className="font-sans text-[10px] tracking-widest uppercase text-[#C19B5F] mt-2">{c.status}</div>
              <div className="text-[11px] text-[#7a7062] mt-2 italic">No Sanity data yet. This card will switch to a Section-1-style completion row once a journey record is created.</div>
            </div>
          ))}
        </div>

        <p className="mt-16 text-[11px] text-[#8a7a6a] italic">
          Dashboard data is revalidated every 60 seconds. Schema health in Section 5 is static and must be updated manually after each audit.{" "}
          <Link href="/" className="text-[#C19B5F] hover:underline">Back to Today</Link>
        </p>
      </div>
    </div>
  );
}
