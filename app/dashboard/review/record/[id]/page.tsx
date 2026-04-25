import { notFound } from "next/navigation";
import Link from "next/link";
import { getReviewGridRowById, type GridRow } from "@/lib/sanity";

// Record view: one row, all fields, full viewport, in user-sequence order.
// Reached via the first-identifier link in the grid (or from operational
// /dashboard audit tables). The `from` query param holds the calling
// URL state so "Back to grid" returns to exactly the view the user came
// from. Server-rendered, gated by DASHBOARD_ENABLED.

export const revalidate = 60;
export const metadata = {
  title: "KALLOS · Content Review · Record",
  robots: "noindex, nofollow",
};

export default async function RecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  if (process.env.DASHBOARD_ENABLED !== "true") {
    notFound();
  }
  const { id } = await params;
  const { from } = await searchParams;
  const row = await getReviewGridRowById(id);

  if (!row) {
    return (
      <div className="min-h-screen bg-[#f0e9d8] p-6">
        <div className="max-w-3xl mx-auto">
          <BackLink from={from} />
          <div className="mt-12 text-center">
            <h1 className="font-serif text-2xl text-[#16110d] mb-3">
              Record not found
            </h1>
            <p className="text-sm text-[#7a7062]">
              No journeyDay or dailyPrompt with id <code>{id}</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0e9d8] p-6">
      <div className="max-w-3xl mx-auto">
        <BackLink from={from} />
        <RecordHeader row={row} />
        <RecordBody row={row} />
      </div>
    </div>
  );
}

function BackLink({ from }: { from?: string }) {
  // Validate `from` is a same-origin relative path before using it. This
  // prevents an open-redirect attack via crafted record links.
  const safeFrom =
    from && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard/review";
  return (
    <Link
      href={safeFrom}
      className="inline-block text-[10px] uppercase tracking-widest text-[#7a7062] hover:text-[#16110d] mb-6"
    >
      ← Back to grid
    </Link>
  );
}

function RecordHeader({ row }: { row: GridRow }) {
  if (row._type === "journeyDay") {
    return (
      <header className="mb-8">
        <div className="text-[10px] uppercase tracking-widest text-[#7a7062] mb-1">
          {row.journeyTitle ?? "Untitled journey"}
        </div>
        <h1 className="font-serif text-3xl font-light tracking-wide text-[#16110d]">
          Day {row.dayNumber}: {row.dayTitle}
        </h1>
      </header>
    );
  }
  return (
    <header className="mb-8">
      <div className="text-[10px] uppercase tracking-widest text-[#7a7062] mb-1">
        Pause &amp; Ponder · {row.date}
      </div>
      <h1 className="font-serif text-3xl font-light tracking-wide text-[#16110d]">
        {row.artworkTitle ?? "Untitled"}
      </h1>
    </header>
  );
}

function RecordBody({ row }: { row: GridRow }) {
  if (row._type === "journeyDay") return <JourneyDayBody row={row} />;
  return <DailyPromptBody row={row} />;
}

function JourneyDayBody({ row }: { row: Extract<GridRow, { _type: "journeyDay" }> }) {
  return (
    <div className="space-y-8 pb-16">
      {row.imageUrl && <FieldImage url={row.imageUrl} />}
      <Field label="Open Text" value={row.openText} />
      <Field label="Encounter Guidance" value={row.encounterGuidance} />
      <Field label="Artwork Hook (from content item)" value={row.artworkHook} />
      <Field label="Encounter Note (Look Closer)" value={row.encounterNote} />
      <Field label="Context (from content item)" value={row.context} />
      <FieldGroup label="Lectio">
        <Field
          label="Philosophy"
          value={row.lectioPhilosophyText}
          source={row.lectioPhilosophySource}
        />
        <Field
          label="Scripture"
          value={row.lectioScriptureText}
          source={row.lectioScriptureSource}
        />
        <Field label="Connection Note" value={row.lectioConnectionNote} />
      </FieldGroup>
      <FieldGroup label="Auditio">
        <Field label="Title" value={row.auditioTitle} />
        <Field label="Composer / Artist" value={row.auditioComposerArtist} />
        <Field label="Work Title" value={row.auditioWorkTitle} />
        <Field label="Genre" value={row.auditioGenre} />
        <Field label="External Link" value={row.auditioExternalUrl} />
      </FieldGroup>
      <FieldArray label="Reflection Questions" values={row.reflectionQuestions} />
      <Field label="Connect Thread" value={row.connectThread} />
      <FieldArray
        label="Go Deeper"
        values={
          row.goDeeperTitles
            ?.map((g) => g.title)
            .filter((t): t is string => typeof t === "string" && t.length > 0) ?? null
        }
      />
    </div>
  );
}

function DailyPromptBody({ row }: { row: Extract<GridRow, { _type: "dailyPrompt" }> }) {
  return (
    <div className="space-y-8 pb-16">
      {row.imageUrl && <FieldImage url={row.imageUrl} />}
      <Field label="Prompt Question" value={row.promptQuestion} />
      <Field label="Curator Note" value={row.curatorNote} />
      <Field label="Context (from content item)" value={row.context} />
      <FieldGroup label="Lectio">
        <Field
          label="Philosophy"
          value={row.lectioPhilosophyText}
          source={row.lectioPhilosophySource}
        />
        <Field
          label="Scripture"
          value={row.lectioScriptureText}
          source={row.lectioScriptureSource}
        />
      </FieldGroup>
      <FieldGroup label="Auditio">
        <Field label="Title" value={row.auditioTitle} />
        <Field label="Composer / Artist" value={row.auditioComposerArtist} />
        <Field label="Work Title" value={row.auditioWorkTitle} />
        <Field label="Genre" value={row.auditioGenre} />
        <Field label="External Link" value={row.auditioExternalUrl} />
      </FieldGroup>
      <Field label="Actio" value={row.actio} />
      <Field label="Verba (Lyrics)" value={row.verbaOriginal} />
    </div>
  );
}

function FieldImage({ url }: { url: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="w-full max-h-[420px] object-cover border border-[#e8e0d4]"
    />
  );
}

function Field({
  label,
  value,
  source,
}: {
  label: string;
  value: string | null;
  source?: string | null;
}) {
  if (!value && !source) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[#7a7062] mb-1">
        {label}
      </div>
      {value ? (
        <div className="text-base text-[#16110d] leading-relaxed whitespace-pre-line">
          {value}
        </div>
      ) : null}
      {source ? (
        <div className="text-xs italic text-[#7a7062] mt-1">{source}</div>
      ) : null}
    </div>
  );
}

function FieldArray({ label, values }: { label: string; values: string[] | null }) {
  if (!values || values.length === 0) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[#7a7062] mb-1">
        {label}
      </div>
      <ul className="list-disc ml-5 space-y-1 text-base text-[#16110d]">
        {values.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#e8e0d4] bg-white p-5">
      <div className="text-[11px] uppercase tracking-widest text-[#C19B5F] font-bold mb-3">
        {label}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
