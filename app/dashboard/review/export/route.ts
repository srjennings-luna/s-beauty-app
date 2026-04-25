import type { NextRequest } from "next/server";
import { getReviewGridRows, type GridRow } from "@/lib/sanity";
import {
  COLUMNS,
  type ColumnKey,
  findColumn,
  getCellValue,
  getIdentifier1,
  getIdentifier2,
} from "../columns";
import { findPreset, getPresetDefaultColumns, type PresetId } from "../presets";

// CSV export. Re-runs the same query as the grid, applies the same filters
// from URL params, and returns a UTF-8 CSV with a BOM (so Excel detects
// encoding correctly). Column ordering matches the grid: identifiers first,
// then visible content columns in the order specified by the cols param
// (or preset defaults).
//
// Read-only. Gated by DASHBOARD_ENABLED. Triggered by the Download CSV
// button in the grid toolbar.

const ALL_COL_KEYS = new Set<ColumnKey>(COLUMNS.map((c) => c.key));

export async function GET(request: NextRequest) {
  if (process.env.DASHBOARD_ENABLED !== "true") {
    return new Response("Not found", { status: 404 });
  }

  const sp = request.nextUrl.searchParams;
  const presetId = (sp.get("preset") as PresetId | null) ?? "arc";
  const preset = findPreset(presetId);
  const docType = sp.get("docType") ?? "both";
  const journey = sp.get("journey");
  const dayNumberStr = sp.get("dayNumber");
  const dayNumber = dayNumberStr ? parseInt(dayNumberStr, 10) : null;
  const focusField = sp.get("focusField");
  const fieldA = sp.get("fieldA");
  const fieldB = sp.get("fieldB");

  // Visible cols: explicit override beats preset defaults. Empty string
  // means "no content columns" (identifiers still export).
  const colsParam = sp.get("cols");
  let visibleCols: ColumnKey[];
  if (colsParam !== null) {
    if (colsParam === "") visibleCols = [];
    else
      visibleCols = colsParam
        .split(",")
        .filter((k): k is ColumnKey => ALL_COL_KEYS.has(k as ColumnKey));
  } else {
    visibleCols = getPresetDefaultColumns(preset, { focusField, fieldA, fieldB });
  }

  const data = await getReviewGridRows();
  const all: GridRow[] = [...data.journeyDays, ...data.dailyPrompts];

  let rows = all;
  if (docType === "journeyDay") rows = rows.filter((r) => r._type === "journeyDay");
  else if (docType === "dailyPrompt")
    rows = rows.filter((r) => r._type === "dailyPrompt");
  if (preset.id === "arc" && journey)
    rows = rows.filter((r) => r._type === "journeyDay" && r.journeySlug === journey);
  if (preset.id === "parallel" && dayNumber !== null)
    rows = rows.filter(
      (r) => r._type === "journeyDay" && r.dayNumber === dayNumber,
    );

  const headerLabels = [
    "Journey / Date",
    "Day / Artwork",
    "Doc Type",
    ...visibleCols.map((k) => findColumn(k)?.label ?? k),
  ];

  const dataRows = rows.map((row) => [
    getIdentifier1(row),
    getIdentifier2(row),
    row._type,
    ...visibleCols.map((k) => stringifyCell(getCellValue(row, k))),
  ]);

  // \uFEFF BOM so Excel detects UTF-8 encoding correctly.
  const csv =
    "\uFEFF" +
    [headerLabels, ...dataRows]
      .map((cells) => cells.map(csvEscape).join(","))
      .join("\r\n");

  const today = new Date().toISOString().slice(0, 10);
  const filename = `kallos-review-${today}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function stringifyCell(v: string | string[] | null): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join("; ");
  return v;
}

function csvEscape(value: string): string {
  if (value === null || value === undefined) return "";
  const v = String(value);
  if (v.length === 0) return "";
  if (
    v.includes(",") ||
    v.includes('"') ||
    v.includes("\n") ||
    v.includes("\r")
  ) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
