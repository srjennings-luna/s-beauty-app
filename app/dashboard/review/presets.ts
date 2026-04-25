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
      "Every Journey Day and Daily Prompt with all content fields. Use the Filter bar to narrow by type. Default view.",
    parameters: [],
  },
  {
    id: "arc",
    label: "Journey arc",
    description: "Key content fields for one journey across all its days.",
    parameters: ["journey"],
  },
  {
    id: "parallel",
    label: "Parallel days",
    description: "A single day number across every journey. Verifies entry-point distinctiveness.",
    parameters: ["dayNumber"],
  },
  {
    id: "field",
    label: "Field comparison",
    description: "One focus field across many records. Pick a field to compare.",
    parameters: ["focusField", "docType"],
  },
  {
    id: "pairing",
    label: "Pairing",
    description: "Two chosen fields side by side.",
    parameters: ["fieldA", "fieldB"],
  },
  {
    id: "record",
    label: "Record",
    description: "One selected record, all fields in sequential order.",
    parameters: ["id"],
  },
  {
    id: "custom",
    label: "Custom",
    description: "Identifiers only. Build your own view from scratch.",
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
