import { COLUMNS, type ColumnKey } from "./columns";

// Preset registry. Each preset defines a default column set and exposes a
// small set of URL parameters the user can pick. Selecting a preset clears
// the `cols` URL override so the grid falls back to preset defaults;
// toggling columns afterward writes a fresh `cols` param.
//
// "overview" is the default: all content columns, all row types. The user
// uses the Filter bar (All / Journey Days / Daily Prompts) to narrow the
// type, and the Columns panel to hide fields they don't need right now.
// The other presets are editorial comparison tools for deeper work.

export type PresetId =
  | "overview"
  | "record"
  | "field"
  | "arc"
  | "parallel"
  | "pairing"
  | "custom";

export type PresetParam =
  | "journey"
  | "focusField"
  | "dayNumber"
  | "fieldA"
  | "fieldB"
  | "docType"
  | "id";

export type PresetDef = {
  id: PresetId;
  label: string;
  description: string;
  parameters: PresetParam[];
};

export const PRESETS: PresetDef[] = [
  {
    id: "overview",
    label: "All content",
    description:
      "Everything you've entered — all Journey Days and Daily Prompts with every field visible. Use the Filter bar to switch between Journey Days and Daily Prompts.",
    parameters: [],
  },
  {
    id: "arc",
    label: "One journey",
    description:
      "All days of a single journey with key content fields. Pick a journey from the dropdown to focus.",
    parameters: ["journey"],
  },
  {
    id: "parallel",
    label: "Same day, all journeys",
    description:
      "Pick a day number (e.g. Day 1) and see that day across every journey side by side. Good for checking that each journey's opening feels distinct.",
    parameters: ["dayNumber"],
  },
  {
    id: "field",
    label: "One field, all records",
    description:
      "Pick a single field (e.g. Artwork Hook, Context, Actio) and scan it across all your content in one column. Good for QA-ing a specific field across everything.",
    parameters: ["focusField", "docType"],
  },
  {
    id: "pairing",
    label: "Two fields side by side",
    description:
      "Pick any two fields and see them next to each other across all records. Good for checking that two elements work together — e.g. Artwork Hook alongside Context.",
    parameters: ["fieldA", "fieldB"],
  },
  {
    id: "record",
    label: "One full record",
    description:
      "See every field for a single Journey Day or Daily Prompt in order, top to bottom. Good for a deep review of one piece of content.",
    parameters: ["id"],
  },
  {
    id: "custom",
    label: "Build my own",
    description:
      "Starts with just the identifier columns (Journey, Day). Use the Columns button to add exactly the fields you want.",
    parameters: [],
  },
];

export const DEFAULT_PRESET: PresetId = "overview";

export function findPreset(id: string | null | undefined): PresetDef {
  const found = PRESETS.find((p) => p.id === id);
  if (found) return found;
  return PRESETS.find((p) => p.id === DEFAULT_PRESET)!;
}

// Compute the effective default column set for a preset given current URL
// params. "overview" shows every column so nothing is hidden on first load.
// Field-comparison and content-pairing use parameter values to derive their
// lists; the others have curated static defaults.
export function getPresetDefaultColumns(
  preset: PresetDef,
  params: { focusField?: string | null; fieldA?: string | null; fieldB?: string | null },
): ColumnKey[] {
  const allKeys = COLUMNS.map((c) => c.key);
  switch (preset.id) {
    case "overview":
      return allKeys;
    case "record":
      return allKeys;
    case "field": {
      const f = params.focusField as ColumnKey | null | undefined;
      return f && allKeys.includes(f) ? [f] : [];
    }
    case "arc":
      return ["imageUrl", "artworkHook", "context", "openText", "encounterNote", "lectioPhilosophyText", "lectioScriptureText", "reflectionQuestions", "connectThread"];
    case "parallel":
      return ["imageUrl", "openText", "artworkHook", "encounterNote", "lectioPhilosophyText"];
    case "pairing": {
      const a = params.fieldA as ColumnKey | null | undefined;
      const b = params.fieldB as ColumnKey | null | undefined;
      return [a, b].filter((k): k is ColumnKey => !!k && allKeys.includes(k));
    }
    case "custom":
      return [];
  }
}
