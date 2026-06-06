import { notFound } from "next/navigation";
import Link from "next/link";
import { getDashboardVisioAuditItems } from "@/lib/sanity";

// CONTUERI · Visio Divina content audit
//
// Sheri's spec (June 5, 2026): "I need a dashboard view of the content
// item image and whether or not there is a prayer or if there is a
// trad reflection... the content should show, not just a yes, no or
// 3 (ex 3 reflections)."
//
// Lists every contentItem eligible for /pray/[id] (sacred-art and
// landscape) with the artwork image, the FULL traditionalPrayer text,
// traditionalPrayerSource, and every linked traditionReflection
// expanded inline (title, shortQuote, summary, source). Pure read-
// surface — no edits happen here; this is for editorial decisions.
//
// Pairs with /dashboard (the main content dashboard). Same auth model
// (DASHBOARD_ENABLED env gate, noindex, server-rendered, 60s
// revalidate).

export const revalidate = 60;
export const metadata = {
  title: "CONTUERI — Visio Divina Audit",
  robots: "noindex, nofollow",
};

type Reflection = {
  _id: string;
  title?: string;
  shortQuote?: string;
  summary?: string;
  source?: string;
  authorType?: string;
  era?: string;
  order?: number;
};

type Row = {
  _id: string;
  title?: string;
  contentType: "sacred-art" | "landscape";
  artist?: string;
  year?: string;
  medium?: string;
  era?: string;
  imageUrl?: string;
  hasImage: boolean;
  traditionalPrayer?: string;
  traditionalPrayerSource?: string;
  traditionReflections?: Reflection[];
  reflectionCount: number;
};

export default async function VisioAuditPage() {
  if (process.env.DASHBOARD_ENABLED !== "true") notFound();

  const rows = (await getDashboardVisioAuditItems()) as Row[];

  const totalItems = rows.length;
  const withPrayer = rows.filter(
    (r) => (r.traditionalPrayer ?? "").trim().length > 0,
  ).length;
  const withAnyReflection = rows.filter((r) => r.reflectionCount > 0).length;
  const totalReflections = rows.reduce(
    (acc, r) => acc + r.reflectionCount,
    0,
  );

  return (
    <main className="min-h-screen bg-parchment text-espresso">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="text-xs tracking-widest uppercase opacity-60 mb-2">
            <Link href="/dashboard" className="hover:underline">
              ← Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-light mb-2">Visio Divina Audit</h1>
          <p className="text-sm opacity-70 max-w-2xl">
            Every content item eligible for the Visio Divina flow
            (<code>sacred-art</code> + <code>landscape</code>). Shows the
            full Traditional Prayer text and every Tradition Reflection in
            full — not just counts — so you can see what users will
            actually encounter on /pray/[id].
          </p>
        </div>

        {/* ── Roll-up counters ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Stat label="Total artworks" value={totalItems} />
          <Stat
            label="With prayer"
            value={withPrayer}
            sub={`${pct(withPrayer, totalItems)}%`}
          />
          <Stat
            label="With reflections"
            value={withAnyReflection}
            sub={`${pct(withAnyReflection, totalItems)}%`}
          />
          <Stat label="Total reflections" value={totalReflections} />
        </div>

        {/* ── Cards ── */}
        <div className="space-y-10">
          {rows.length === 0 ? (
            <p className="opacity-60 text-sm">No content items found.</p>
          ) : (
            rows.map((row) => <AuditCard key={row._id} row={row} />)
          )}
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="border border-espresso/15 bg-white/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest opacity-60">
        {label}
      </div>
      <div className="text-2xl font-light mt-1 flex items-baseline gap-2">
        {value}
        {sub && (
          <span className="text-xs opacity-50 font-normal">{sub}</span>
        )}
      </div>
    </div>
  );
}

function AuditCard({ row }: { row: Row }) {
  const hasPrayer = (row.traditionalPrayer ?? "").trim().length > 0;
  const reflections = row.traditionReflections ?? [];

  return (
    <article className="border border-espresso/15 bg-white/40">
      <div className="md:grid md:grid-cols-[260px_1fr] gap-6">
        {/* Image column */}
        <div className="p-4">
          {row.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${row.imageUrl}?w=520&h=520&fit=crop&auto=format`}
              alt={row.title ?? ""}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-espresso/5 flex items-center justify-center text-xs opacity-50">
              No image
            </div>
          )}
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-widest opacity-60">
              {row.contentType}
              {row.era ? ` · ${row.era}` : ""}
            </div>
            <h2 className="text-lg font-medium mt-1 leading-snug">
              {row.title ?? "(untitled)"}
            </h2>
            {(row.artist || row.year) && (
              <div className="text-xs opacity-70 mt-1">
                {[row.artist, row.year].filter(Boolean).join(" · ")}
              </div>
            )}
            {row.medium && (
              <div className="text-xs opacity-60 mt-0.5 italic">
                {row.medium}
              </div>
            )}
            <div className="mt-3 text-[10px] uppercase tracking-widest opacity-60">
              <Link
                href={`/pray/${row._id}`}
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Visio Divina →
              </Link>
            </div>
          </div>
        </div>

        {/* Content column */}
        <div className="p-4 md:pl-0 md:pr-6 md:py-5">
          {/* Traditional Prayer */}
          <section className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-xs uppercase tracking-widest opacity-70 font-semibold">
                Traditional Prayer
              </h3>
              <span
                className={`text-[10px] tracking-widest ${hasPrayer ? "text-green-700" : "text-red-700/70"}`}
              >
                {hasPrayer ? "PRESENT" : "MISSING"}
              </span>
            </div>
            {hasPrayer ? (
              <div className="border-l-2 border-espresso/30 pl-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {row.traditionalPrayer}
                </p>
                {row.traditionalPrayerSource && (
                  <p className="text-xs italic opacity-60 mt-2">
                    — {row.traditionalPrayerSource}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs italic opacity-50">
                No traditionalPrayer field set on this content item.
              </p>
            )}
          </section>

          {/* Tradition Reflections */}
          <section>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-xs uppercase tracking-widest opacity-70 font-semibold">
                Reflections from the Tradition ({reflections.length})
              </h3>
              <span
                className={`text-[10px] tracking-widest ${
                  reflections.length > 0
                    ? "text-green-700"
                    : "text-red-700/70"
                }`}
              >
                {reflections.length > 0 ? "PRESENT" : "MISSING"}
              </span>
            </div>
            {reflections.length === 0 ? (
              <p className="text-xs italic opacity-50">
                No tradition reflections linked.
              </p>
            ) : (
              <ol className="space-y-4">
                {reflections.map((r, i) => (
                  <li
                    key={r._id}
                    className="border border-espresso/15 bg-white/60 p-3"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold leading-tight">
                        {i + 1}. {r.title ?? "(untitled reflection)"}
                      </h4>
                      <span className="text-[10px] uppercase tracking-widest opacity-50 whitespace-nowrap">
                        {[r.authorType, r.era].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    {r.shortQuote && (
                      <p className="text-sm italic border-l-2 border-amber-700/40 pl-3 my-2">
                        &ldquo;{r.shortQuote}&rdquo;
                      </p>
                    )}
                    {r.summary && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {r.summary}
                      </p>
                    )}
                    {r.source && (
                      <p className="text-xs italic opacity-60 mt-2">
                        — {r.source}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}
