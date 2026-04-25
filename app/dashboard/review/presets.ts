import { COLUMNS, type ColumnKey } from "./columns";

// Preset registry. Each preset defines a default column set and exposes a
// small set of URL parameters that the user picks (journey, focusField,
// dayNumber, fieldA/fieldB). Selecting a preset clears the user's `cols`
// override so the grid falls back to the preset defaults; toggling
// columns afterward writes a fresh `cols` URL param.

export type PresetId =
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
    id: "record",
    label: "Record",
    description: "One selected record, all fields in sequential order.",
    parameters: ["id"],
  },
  {
    id: "field",
    label: "Field comparison",
    description: "One focus field across many records. Pick a field to compare.",
    parameters: ["focusField", "docType"],
  },
  {
    id: "arc",
    label: "Journey arc",
    description: "Structural columns for one journey across all its days.",
    parameters: ["journey"],
  },
  {
    id: "parallel",
    label: "Parallel entry point",
    description: "A single day number across every journey. Verifies entry-point distinctiveness.",
    parameters: ["dayNumber"],
  },
  {
    id: "pairing",
    label: "Content pairing",
    description: "Two chosen fields side by side.",
    parameters: ["fieldA", "fieldB"],
  },
  {
    id: "custom",
    label: "Custom",
    description: "Identifiers only. Build your own view from scratch.",
    parameters: [],
  },
];

export const DEFAULT_PRESET: PresetId = "arc";

export function findPreset(id: string | null | undefined): PresetDef {
  const found = PRESETS.find((p) => p.id === id);
  if (found) return found;
  return PRESETS.find((p) => p.id === DEFAULT_PRESET)!;
}

// Compute the effective default column set for a preset given current URL
// params. Field-comparison and content-pairing use parameter values to
// derive their column lists; the others have static defaults.
export function getPresetDefaultColumns(
  preset: PresetDef,
  params: { focusField?: string | null; fieldA?: string | null; fieldB?: string | null },
): ColumnKey[] {
  const allKeys = COLUMNS.map((c) => c.key);
  switch (preset.id) {
    case "record":
      return allKeys;
    case "field": {
      const f = params.focusField as ColumnKey | null | undefined;
      return f && allKeys.includes(f) ? [f] : [];
    }
    case "arc":
      return ["openText", "connectThread", "auditioTitle"];
    case "parallel":
      return ["openText", "encounterNote", "lectioPhilosophyText"];
    case "pairing": {
      const a = params.fieldA as ColumnKey | null | undefined;
      const b = params.fieldB as ColumnKey | null | undefined;
      return [a, b].filter((k): k is ColumnKey => !!k && allKeys.includes(k));
    }
    case "custom":
      return [];
  }
}
