import type { GridRow } from "@/lib/sanity";

// All available content columns in the review grid.
// Identifiers (Journey/Date and Day/Artwork) are NOT in this registry.
// they are hard-pinned in ReviewGridClient and never togglable.
//
// `appliesTo` declares which row types the column applies to. A column with
// `appliesTo: "journeyDay"` will render `null` (em dash) on dailyPrompt rows.
// That is by design per the brief: empty cells are acceptable and expected.

export type ColumnKey =
  | "imageUrl"
  | "openText"
  | "artworkHook"
  | "context"
  | "encounterGuidance"
  | "encounterNote"
  | "lectioPhilosophyText"
  | "lectioPhilosophySource"
  | "lectioScriptureText"
  | "lectioScriptureSource"
  | "lectioConnectionNote"
  | "auditioTitle"
  | "auditioComposerArtist"
  | "auditioWorkTitle"
  | "auditioGenre"
  | "auditioExternalUrl"
  | "reflectionQuestions"
  | "connectThread"
  | "goDeeperTitles"
  | "promptQuestion"
  | "curatorNote"
  | "verbaOriginal"
  | "actio";

export type ColumnAppliesTo = "both" | "journeyDay" | "dailyPrompt";

export type ColumnDef = {
  key: ColumnKey;
  label: string;
  appliesTo: ColumnAppliesTo;
  isLongText?: boolean;
  isImage?: boolean;
};

// Columns are ordered to match the sequence a user encounters content in the
// app. Journey Day flow: Image → Opening Text → Artwork Hook → Context →
// Encounter Guidance → Look Closer → Lectio → Auditio → Reflect → Connect →
// Go Deeper. Daily Prompt fields (Prompt Question, Curator Note, Lyrics,
// Actio) are inserted at the equivalent point in that flow.
export const COLUMNS: ColumnDef[] = [
  // ── Opening ────────────────────────────────────────────────────────────────
  { key: "imageUrl",           label: "Image",              appliesTo: "both",         isImage: true },
  { key: "openText",           label: "Opening Text",       appliesTo: "journeyDay",   isLongText: true },
  // ── Artwork / Encounter ────────────────────────────────────────────────────
  { key: "artworkHook",        label: "Artwork Hook",       appliesTo: "journeyDay",   isLongText: true },
  { key: "context",            label: "Context",            appliesTo: "both",         isLongText: true },
  { key: "encounterGuidance",  label: "Encounter Guidance", appliesTo: "journeyDay",   isLongText: true },
  { key: "encounterNote",      label: "Look Closer",        appliesTo: "journeyDay",   isLongText: true },
  // ── Daily Prompt voice fields (appear at the equivalent point in P&P) ──────
  { key: "promptQuestion",     label: "Prompt Question",    appliesTo: "dailyPrompt",  isLongText: true },
  { key: "curatorNote",        label: "Curator Note",       appliesTo: "dailyPrompt",  isLongText: true },
  // ── Lectio ─────────────────────────────────────────────────────────────────
  { key: "lectioPhilosophyText",   label: "Lectio · Philosophy",        appliesTo: "both",       isLongText: true },
  { key: "lectioPhilosophySource", label: "Lectio · Philosophy Source", appliesTo: "both" },
  { key: "lectioScriptureText",    label: "Lectio · Scripture",         appliesTo: "both",       isLongText: true },
  { key: "lectioScriptureSource",  label: "Lectio · Scripture Source",  appliesTo: "both" },
  { key: "lectioConnectionNote",   label: "Lectio · Connection",        appliesTo: "journeyDay", isLongText: true },
  // ── Auditio ────────────────────────────────────────────────────────────────
  { key: "auditioTitle",           label: "Auditio · Title",            appliesTo: "both" },
  { key: "auditioComposerArtist",  label: "Auditio · Composer / Artist",appliesTo: "both" },
  { key: "auditioWorkTitle",       label: "Auditio · Work Title",       appliesTo: "both" },
  { key: "auditioGenre",           label: "Auditio · Genre",            appliesTo: "both" },
  { key: "auditioExternalUrl",     label: "Auditio · External Link",    appliesTo: "both" },
  { key: "verbaOriginal",          label: "Auditio · Lyrics (Verba)",   appliesTo: "dailyPrompt", isLongText: true },
  // ── Closing ────────────────────────────────────────────────────────────────
  { key: "reflectionQuestions", label: "Reflection Questions", appliesTo: "journeyDay", isLongText: true },
  { key: "connectThread",       label: "Connect Thread",       appliesTo: "journeyDay", isLongText: true },
  { key: "goDeeperTitles",      label: "Go Deeper",            appliesTo: "journeyDay" },
  { key: "actio",               label: "Actio",                appliesTo: "dailyPrompt", isLongText: true },
];

export function findColumn(key: ColumnKey): ColumnDef | undefined {
  return COLUMNS.find((c) => c.key === key);
}

// Cell value lookup.switch on the key so TypeScript narrows the row type
// per branch. journeyDay-only fields return null on dailyPrompt rows and
// vice versa; that becomes an em-dash placeholder in the rendered cell.
export function getCellValue(row: GridRow, key: ColumnKey): string | string[] | null {
  switch (key) {
    case "imageUrl":
      return row.imageUrl;
    case "context":
      return row.context;
    case "lectioPhilosophyText":
      return row.lectioPhilosophyText;
    case "lectioPhilosophySource":
      return row.lectioPhilosophySource;
    case "lectioScriptureText":
      return row.lectioScriptureText;
    case "lectioScriptureSource":
      return row.lectioScriptureSource;
    case "auditioTitle":
      return row.auditioTitle;
    case "auditioComposerArtist":
      return row.auditioComposerArtist;
    case "auditioWorkTitle":
      return row.auditioWorkTitle;
    case "auditioGenre":
      return row.auditioGenre;
    case "auditioExternalUrl":
      return row.auditioExternalUrl;
    case "openText":
      return row._type === "journeyDay" ? row.openText : null;
    case "artworkHook":
      return row._type === "journeyDay" ? row.artworkHook : null;
    case "encounterGuidance":
      return row._type === "journeyDay" ? row.encounterGuidance : null;
    case "encounterNote":
      return row._type === "journeyDay" ? row.encounterNote : null;
    case "lectioConnectionNote":
      return row._type === "journeyDay" ? row.lectioConnectionNote : null;
    case "reflectionQuestions":
      return row._type === "journeyDay" ? row.reflectionQuestions : null;
    case "connectThread":
      return row._type === "journeyDay" ? row.connectThread : null;
    case "goDeeperTitles":
      if (row._type !== "journeyDay") return null;
      return (
        row.goDeeperTitles
          ?.map((g) => g.title)
          .filter((t): t is string => typeof t === "string" && t.length > 0) ?? null
      );
    case "promptQuestion":
      return row._type === "dailyPrompt" ? row.promptQuestion : null;
    case "curatorNote":
      return row._type === "dailyPrompt" ? row.curatorNote : null;
    case "verbaOriginal":
      return row._type === "dailyPrompt" ? row.verbaOriginal : null;
    case "actio":
      return row._type === "dailyPrompt" ? row.actio : null;
  }
}

// First identifier.the primary container value. Becomes the link to record view.
// journeyDay: Journey Title. dailyPrompt: Date.
export function getIdentifier1(row: GridRow): string {
  return row._type === "journeyDay" ? (row.journeyTitle ?? "Untitled journey") : row.date;
}

// Second identifier.the specific item within the container.
// journeyDay: "Day N: {dayTitle}". dailyPrompt: Artwork title.
export function getIdentifier2(row: GridRow): string {
  if (row._type === "journeyDay") {
    return `Day ${row.dayNumber}: ${row.dayTitle}`;
  }
  return row.artworkTitle ?? "Untitled";
}
