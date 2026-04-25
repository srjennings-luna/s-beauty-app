"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { GridRow } from "@/lib/sanity";
import {
  COLUMNS,
  type ColumnKey,
  type ColumnDef,
  findColumn,
  getCellValue,
  getIdentifier1,
  getIdentifier2,
} from "./columns";
import {
  PRESETS,
  DEFAULT_PRESET,
  findPreset,
  getPresetDefaultColumns,
  type PresetId,
} from "./presets";
import { scanText, type VoiceRuleMatch } from "./voiceRules";

// Task 4 added: inline cell expansion (URL-backed), per-content-column drag
// resize (URL-backed), first-identifier column links to record view with
// `from` param preserving full grid state.
//
// State model (URL is source of truth; no useState for any of this):
//   preset       active preset id
//   cols         column visibility override
//   docType      row-type filter
//   journey      arc-preset journey slug
//   dayNumber    parallel-preset day 1-9
//   focusField   field-preset focus column
//   fieldA       pairing-preset column A
//   fieldB       pairing-preset column B
//   sort         "<key>:asc" | "<key>:desc"
//   pinned       comma-list of row ids
//   expanded     comma-list of "rowId:colKey" pairs (cells in expanded state)
//   widths       comma-list of "colKey:px" pairs (resized content columns)
//
// useState is reserved for transient UI: panel open/closed, column-search
// input typing, mid-drag width feedback. None of those should survive reload.

const ALL_COL_KEYS = new Set<ColumnKey>(COLUMNS.map((c) => c.key));

const DEFAULT_CONTENT_WIDTH = 260;
const MIN_CONTENT_WIDTH = 80;

type SortDir = "asc" | "desc";
type SortState = { key: string; dir: SortDir } | null;

export default function ReviewGridClient({ rows }: { rows: GridRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetId = (searchParams.get("preset") as PresetId | null) ?? DEFAULT_PRESET;
  const preset = findPreset(presetId);
  const docType = searchParams.get("docType") ?? "both";
  const journey = searchParams.get("journey");
  const dayNumberStr = searchParams.get("dayNumber");
  const dayNumber = dayNumberStr ? parseInt(dayNumberStr, 10) : null;
  const focusField = searchParams.get("focusField");
  const fieldA = searchParams.get("fieldA");
  const fieldB = searchParams.get("fieldB");
  const sort = parseSort(searchParams.get("sort"));
  const pinned = useMemo(
    () => new Set((searchParams.get("pinned") ?? "").split(",").filter(Boolean)),
    [searchParams],
  );
  const expanded = useMemo(
    () => new Set((searchParams.get("expanded") ?? "").split(",").filter(Boolean)),
    [searchParams],
  );
  const widths = useMemo(() => parseWidths(searchParams.get("widths")), [searchParams]);
  const voiceFlagsActive = searchParams.get("voiceFlags") === "1";

  const presetDefaults = useMemo(
    () => getPresetDefaultColumns(preset, { focusField, fieldA, fieldB }),
    [preset, focusField, fieldA, fieldB],
  );
  const visibleCols = useMemo<ColumnKey[]>(() => {
    const colsParam = searchParams.get("cols");
    if (colsParam !== null) {
      if (colsParam === "") return [];
      return colsParam
        .split(",")
        .filter((k): k is ColumnKey => ALL_COL_KEYS.has(k as ColumnKey));
    }
    return presetDefaults;
  }, [searchParams, presetDefaults]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");

  const setURL = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectPreset = useCallback(
    (id: PresetId) => {
      setURL({ preset: id, cols: null });
    },
    [setURL],
  );

  const toggleColumn = useCallback(
    (key: ColumnKey) => {
      const set = new Set(visibleCols);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      const next = [...set];
      setURL({ cols: next.length === 0 ? "" : next.join(",") });
    },
    [setURL, visibleCols],
  );

  const resetColumns = useCallback(() => {
    setURL({ cols: null });
  }, [setURL]);

  const togglePin = useCallback(
    (id: string) => {
      const set = new Set(pinned);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      const next = [...set];
      setURL({ pinned: next.length === 0 ? null : next.join(",") });
    },
    [pinned, setURL],
  );

  const toggleExpand = useCallback(
    (rowId: string, colKey: string) => {
      const cellId = `${rowId}:${colKey}`;
      const set = new Set(expanded);
      if (set.has(cellId)) set.delete(cellId);
      else set.add(cellId);
      const next = [...set];
      setURL({ expanded: next.length === 0 ? null : next.join(",") });
    },
    [expanded, setURL],
  );

  const commitWidth = useCallback(
    (colKey: ColumnKey, width: number) => {
      const next = { ...widths, [colKey]: Math.round(width) };
      setURL({ widths: serializeWidths(next) });
    },
    [setURL, widths],
  );

  const setSort = useCallback(
    (key: string) => {
      if (!sort || sort.key !== key) {
        setURL({ sort: `${key}:asc` });
      } else if (sort.dir === "asc") {
        setURL({ sort: `${key}:desc` });
      } else {
        setURL({ sort: null });
      }
    },
    [setURL, sort],
  );

  const resetSort = useCallback(() => {
    setURL({ sort: null });
  }, [setURL]);

  // Build the `from` URL captured in record-view links. It serializes the
  // current grid state so "Back to grid" returns to exactly this view.
  const fromQuery = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  const filteredRows = useMemo(() => {
    let r = applyFilters(rows, { docType, preset: preset.id, journey, dayNumber });
    if (voiceFlagsActive) {
      r = r.filter((row) => rowHasVoiceFlag(row, visibleCols));
    }
    return r;
  }, [rows, docType, preset.id, journey, dayNumber, voiceFlagsActive, visibleCols]);

  const sortedRows = useMemo(() => {
    if (!sort) return filteredRows;
    return [...filteredRows].sort((a, b) => compareRows(a, b, sort));
  }, [filteredRows, sort]);

  const orderedRows = useMemo(() => {
    if (pinned.size === 0) return sortedRows;
    const pinnedRows: GridRow[] = [];
    const unpinnedRows: GridRow[] = [];
    for (const r of sortedRows) {
      if (pinned.has(r._id)) pinnedRows.push(r);
      else unpinnedRows.push(r);
    }
    return [...pinnedRows, ...unpinnedRows];
  }, [sortedRows, pinned]);

  const journeyOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const r of rows) {
      if (r._type === "journeyDay" && r.journeySlug && r.journeyTitle) {
        seen.set(r.journeySlug, r.journeyTitle);
      }
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const filteredColumnDefs = useMemo(() => {
    const q = columnSearch.trim().toLowerCase();
    if (!q) return COLUMNS;
    return COLUMNS.filter((c) => c.label.toLowerCase().includes(q));
  }, [columnSearch]);

  const csvHref = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `/dashboard/review/export?${qs}` : "/dashboard/review/export";
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#f0e9d8] p-6">
      <div className="max-w-[1800px] mx-auto">
        <header className="mb-5">
          <h1 className="font-serif text-3xl font-light tracking-wider text-[#16110d]">
            Content Review
          </h1>
          <div className="text-xs italic text-[#7a7062] mt-1">
            {orderedRows.length} of {rows.length} records
            {pinned.size > 0 ? ` · ${pinned.size} pinned` : ""}
          </div>
        </header>

        <PresetBar activePreset={preset.id} onSelect={selectPreset} />

        <ParameterBar
          presetId={preset.id}
          journey={journey}
          dayNumber={dayNumber}
          focusField={focusField}
          fieldA={fieldA}
          fieldB={fieldB}
          journeyOptions={journeyOptions}
          setURL={setURL}
        />

        <FilterBar
          docType={docType}
          voiceFlagsActive={voiceFlagsActive}
          setURL={setURL}
        />

        <Toolbar
          visibleColCount={visibleCols.length}
          panelOpen={panelOpen}
          setPanelOpen={setPanelOpen}
          columnSearch={columnSearch}
          setColumnSearch={setColumnSearch}
          filteredColumnDefs={filteredColumnDefs}
          visibleCols={visibleCols}
          toggleColumn={toggleColumn}
          resetColumns={resetColumns}
          sort={sort}
          resetSort={resetSort}
          csvHref={csvHref}
        />

        <GridTable
          rows={orderedRows}
          visibleCols={visibleCols}
          sort={sort}
          setSort={setSort}
          pinned={pinned}
          togglePin={togglePin}
          expanded={expanded}
          toggleExpand={toggleExpand}
          widths={widths}
          commitWidth={commitWidth}
          fromQuery={fromQuery}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Toolbar pieces
// ─────────────────────────────────────────────────────────────────────────

function PresetBar({
  activePreset,
  onSelect,
}: {
  activePreset: PresetId;
  onSelect: (id: PresetId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <span className="text-[10px] uppercase tracking-widest text-[#7a7062] mr-2">
        Preset
      </span>
      {PRESETS.map((p) => {
        const active = p.id === activePreset;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            title={p.description}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
              active
                ? "bg-[#16110d] text-[#fdf6e8] border-[#16110d]"
                : "bg-white text-[#16110d] border-[#16110d] hover:bg-[#16110d] hover:text-[#fdf6e8]"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

function ParameterBar({
  presetId,
  journey,
  dayNumber,
  focusField,
  fieldA,
  fieldB,
  journeyOptions,
  setURL,
}: {
  presetId: PresetId;
  journey: string | null;
  dayNumber: number | null;
  focusField: string | null;
  fieldA: string | null;
  fieldB: string | null;
  journeyOptions: [string, string][];
  setURL: (updates: Record<string, string | null>) => void;
}) {
  if (presetId === "record" || presetId === "custom") return null;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-3 px-3 py-2 bg-white border border-[#e8e0d4]">
      <span className="text-[10px] uppercase tracking-widest text-[#7a7062]">
        Parameter
      </span>

      {presetId === "arc" && (
        <Dropdown
          label="Journey"
          value={journey}
          onChange={(v) => setURL({ journey: v })}
          placeholder="All journeys"
          options={journeyOptions.map(([slug, title]) => ({ value: slug, label: title }))}
        />
      )}

      {presetId === "parallel" && (
        <Dropdown
          label="Day"
          value={dayNumber !== null ? String(dayNumber) : null}
          onChange={(v) => setURL({ dayNumber: v })}
          placeholder="Pick a day"
          options={Array.from({ length: 9 }, (_, i) => ({
            value: String(i + 1),
            label: `Day ${i + 1}`,
          }))}
        />
      )}

      {presetId === "field" && (
        <Dropdown
          label="Focus field"
          value={focusField}
          onChange={(v) => setURL({ focusField: v })}
          placeholder="Pick a field"
          options={COLUMNS.filter((c) => !c.isImage).map((c) => ({
            value: c.key,
            label: c.label,
          }))}
        />
      )}

      {presetId === "pairing" && (
        <>
          <Dropdown
            label="Field A"
            value={fieldA}
            onChange={(v) => setURL({ fieldA: v })}
            placeholder="Pick field A"
            options={COLUMNS.filter((c) => !c.isImage).map((c) => ({
              value: c.key,
              label: c.label,
            }))}
          />
          <Dropdown
            label="Field B"
            value={fieldB}
            onChange={(v) => setURL({ fieldB: v })}
            placeholder="Pick field B"
            options={COLUMNS.filter((c) => !c.isImage).map((c) => ({
              value: c.key,
              label: c.label,
            }))}
          />
        </>
      )}
    </div>
  );
}

function FilterBar({
  docType,
  voiceFlagsActive,
  setURL,
}: {
  docType: string;
  voiceFlagsActive: boolean;
  setURL: (updates: Record<string, string | null>) => void;
}) {
  const choices: { id: string; label: string }[] = [
    { id: "both", label: "All" },
    { id: "journeyDay", label: "Journey Days" },
    { id: "dailyPrompt", label: "Daily Prompts" },
  ];
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span className="text-[10px] uppercase tracking-widest text-[#7a7062] mr-1">
        Filter
      </span>
      {choices.map((c) => {
        const active = docType === c.id;
        return (
          <button
            key={c.id}
            onClick={() => setURL({ docType: c.id === "both" ? null : c.id })}
            className={`px-3 py-1 text-[11px] tracking-wide border transition-colors ${
              active
                ? "bg-[#4a7a62] text-white border-[#4a7a62]"
                : "bg-white text-[#16110d] border-[#e8e0d4] hover:border-[#4a7a62]"
            }`}
          >
            {c.label}
          </button>
        );
      })}
      <span className="mx-2 text-[#bfb8aa]">·</span>
      <button
        onClick={() => setURL({ voiceFlags: voiceFlagsActive ? null : "1" })}
        className={`px-3 py-1 text-[11px] tracking-wide border transition-colors ${
          voiceFlagsActive
            ? "bg-[#a06010] text-white border-[#a06010]"
            : "bg-white text-[#a06010] border-[#a06010] hover:bg-[#fff5e0]"
        }`}
        title="Show only rows with at least one voice-rule match in a visible column"
      >
        Voice flags{voiceFlagsActive ? " ✓" : ""}
      </button>
    </div>
  );
}

function Toolbar({
  visibleColCount,
  panelOpen,
  setPanelOpen,
  columnSearch,
  setColumnSearch,
  filteredColumnDefs,
  visibleCols,
  toggleColumn,
  resetColumns,
  sort,
  resetSort,
  csvHref,
}: {
  visibleColCount: number;
  panelOpen: boolean;
  setPanelOpen: (v: boolean) => void;
  columnSearch: string;
  setColumnSearch: (v: string) => void;
  filteredColumnDefs: ColumnDef[];
  visibleCols: ColumnKey[];
  toggleColumn: (key: ColumnKey) => void;
  resetColumns: () => void;
  sort: SortState;
  resetSort: () => void;
  csvHref: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4 relative flex-wrap">
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-[#16110d] text-[#16110d] hover:bg-[#16110d] hover:text-[#fdf6e8] transition-colors"
      >
        Columns ({visibleColCount})
      </button>

      {sort && (
        <button
          onClick={resetSort}
          className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-[#7a7062] text-[#7a7062] hover:bg-[#7a7062] hover:text-white transition-colors"
        >
          Reset sort ({sort.key} {sort.dir})
        </button>
      )}

      <a
        href={csvHref}
        download
        className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-[#4a7a62] text-[#4a7a62] hover:bg-[#4a7a62] hover:text-white transition-colors"
        title="Download current view as CSV"
      >
        Download CSV
      </a>

      {panelOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-80 bg-white border border-[#e8e0d4] shadow-lg z-20 max-h-[70vh] overflow-y-auto"
          role="dialog"
          aria-label="Column toggle"
        >
          <input
            type="text"
            value={columnSearch}
            onChange={(e) => setColumnSearch(e.target.value)}
            placeholder="Search columns…"
            className="w-full px-3 py-2 text-sm border-b border-[#e8e0d4] focus:outline-none focus:bg-[#fdf6e8]"
          />
          <div className="py-1">
            {filteredColumnDefs.length === 0 ? (
              <div className="px-3 py-3 text-xs text-[#7a7062] italic">
                No columns match.
              </div>
            ) : (
              filteredColumnDefs.map((col) => {
                const checked = visibleCols.includes(col.key);
                return (
                  <label
                    key={col.key}
                    className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-[#fdf6e8] ${
                      checked ? "text-[#4a7a62] font-medium" : "text-[#16110d]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleColumn(col.key)}
                      className="w-4 h-4 accent-[#4a7a62]"
                    />
                    <span className="text-sm flex-1">{col.label}</span>
                    {col.appliesTo !== "both" && (
                      <span
                        className="text-[9px] uppercase tracking-wider text-[#7a7062]"
                        title={
                          col.appliesTo === "journeyDay"
                            ? "Applies to journey day rows only"
                            : "Applies to daily prompt rows only"
                        }
                      >
                        {col.appliesTo === "journeyDay" ? "JD" : "DP"}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
          <button
            onClick={resetColumns}
            className="w-full px-3 py-2 text-[10px] uppercase tracking-widest border-t border-[#e8e0d4] text-[#7a7062] hover:bg-[#fdf6e8]"
          >
            Reset to preset defaults
          </button>
        </div>
      )}
    </div>
  );
}

function Dropdown({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-[11px]">
      <span className="text-[10px] uppercase tracking-widest text-[#7a7062]">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="px-2 py-1 text-[11px] border border-[#e8e0d4] bg-white focus:outline-none focus:border-[#4a7a62]"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Grid + rows
// ─────────────────────────────────────────────────────────────────────────

const PIN_COL_WIDTH = 40;
const ID1_COL_WIDTH = 200;
const ID2_COL_WIDTH = 260;

function GridTable({
  rows,
  visibleCols,
  sort,
  setSort,
  pinned,
  togglePin,
  expanded,
  toggleExpand,
  widths,
  commitWidth,
  fromQuery,
}: {
  rows: GridRow[];
  visibleCols: ColumnKey[];
  sort: SortState;
  setSort: (key: string) => void;
  pinned: Set<string>;
  togglePin: (id: string) => void;
  expanded: Set<string>;
  toggleExpand: (rowId: string, colKey: string) => void;
  widths: Record<string, number>;
  commitWidth: (colKey: ColumnKey, width: number) => void;
  fromQuery: string;
}) {
  return (
    <div className="overflow-x-auto bg-white border border-[#e8e0d4]">
      <table
        className="text-sm border-collapse"
        style={{ tableLayout: "fixed", width: "max-content", minWidth: "100%" }}
      >
        <colgroup>
          <col style={{ width: PIN_COL_WIDTH }} />
          <col style={{ width: ID1_COL_WIDTH }} />
          <col style={{ width: ID2_COL_WIDTH }} />
          {visibleCols.map((key) => (
            <col
              key={key}
              style={{ width: widths[key] ?? DEFAULT_CONTENT_WIDTH }}
            />
          ))}
        </colgroup>
        <thead className="bg-[#16110d] text-[#fdf6e8] text-[10px] uppercase tracking-widest">
          <tr>
            <th className="px-2 py-2" />
            <SortableHeader
              label="Journey / Date"
              sortKey="identifier1"
              sort={sort}
              onClick={setSort}
              sticky
              left={PIN_COL_WIDTH}
            />
            <SortableHeader
              label="Day / Artwork"
              sortKey="identifier2"
              sort={sort}
              onClick={setSort}
              sticky
              left={PIN_COL_WIDTH + ID1_COL_WIDTH}
            />
            {visibleCols.map((key) => {
              const col = findColumn(key);
              if (!col) return null;
              return (
                <ResizableHeader
                  key={key}
                  colKey={key}
                  label={col.label}
                  sort={sort}
                  onClickSort={setSort}
                  width={widths[key] ?? DEFAULT_CONTENT_WIDTH}
                  onCommitWidth={commitWidth}
                />
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={3 + visibleCols.length}
                className="px-3 py-8 text-center text-[#7a7062] italic"
              >
                No rows match the current filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <RowView
                key={row._id}
                row={row}
                visibleCols={visibleCols}
                isPinned={pinned.has(row._id)}
                onTogglePin={() => togglePin(row._id)}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                fromQuery={fromQuery}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onClick,
  sticky = false,
  left,
}: {
  label: string;
  sortKey: string;
  sort: SortState;
  onClick: (key: string) => void;
  sticky?: boolean;
  left?: number;
}) {
  const active = sort && sort.key === sortKey;
  const indicator = active ? (sort.dir === "asc" ? "↑" : "↓") : "";
  return (
    <th
      className={`text-left px-3 py-2 cursor-pointer select-none ${
        sticky ? "sticky bg-[#16110d] z-10" : ""
      } hover:bg-[#2b2117]`}
      style={{ ...(sticky && left !== undefined ? { left } : {}) }}
      onClick={() => onClick(sortKey)}
    >
      <span>{label}</span>
      {indicator && <span className="ml-1 text-[#C19B5F]">{indicator}</span>}
    </th>
  );
}

function ResizableHeader({
  colKey,
  label,
  sort,
  onClickSort,
  width,
  onCommitWidth,
}: {
  colKey: ColumnKey;
  label: string;
  sort: SortState;
  onClickSort: (key: string) => void;
  width: number;
  onCommitWidth: (colKey: ColumnKey, width: number) => void;
}) {
  const active = sort && sort.key === colKey;
  const indicator = active ? (sort.dir === "asc" ? "↑" : "↓") : "";
  // Track in-progress drag width in state so the col element can re-render.
  // Final width is committed to URL on mouseup; the URL is the source of
  // truth, this state is only for live drag feedback.
  const [draggedWidth, setDraggedWidth] = useState<number | null>(null);
  const draggingRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = { startX: e.clientX, startWidth: width };
    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = ev.clientX - draggingRef.current.startX;
      const next = Math.max(MIN_CONTENT_WIDTH, draggingRef.current.startWidth + delta);
      setDraggedWidth(next);
    };
    const onUp = () => {
      const final = draggingRef.current
        ? Math.max(
            MIN_CONTENT_WIDTH,
            draggingRef.current.startWidth +
              (typeof window !== "undefined" ? 0 : 0),
          )
        : null;
      // Use the last dragged width if any; otherwise nothing to commit.
      setDraggedWidth((current) => {
        if (current !== null) onCommitWidth(colKey, current);
        return null;
      });
      draggingRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      void final;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // While dragging, override the col width via inline width on the th too,
  // since the colgroup's col only updates after URL commit. Note: this
  // creates a visible drag preview but the table will snap to URL value
  // immediately after the colgroup re-renders.
  const effectiveWidth = draggedWidth ?? width;

  return (
    <th
      className="text-left px-3 py-2 hover:bg-[#2b2117] relative select-none"
      style={{ width: effectiveWidth }}
    >
      <span
        onClick={() => onClickSort(colKey)}
        className="cursor-pointer block pr-3"
      >
        {label}
        {indicator && <span className="ml-1 text-[#C19B5F]">{indicator}</span>}
      </span>
      <span
        onMouseDown={onMouseDown}
        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-[#C19B5F]/60"
        title="Drag to resize"
        aria-label="Resize column"
      />
    </th>
  );
}

function RowView({
  row,
  visibleCols,
  isPinned,
  onTogglePin,
  expanded,
  onToggleExpand,
  fromQuery,
}: {
  row: GridRow;
  visibleCols: ColumnKey[];
  isPinned: boolean;
  onTogglePin: () => void;
  expanded: Set<string>;
  onToggleExpand: (rowId: string, colKey: string) => void;
  fromQuery: string;
}) {
  const id1 = getIdentifier1(row);
  const id2 = getIdentifier2(row);
  const rowBg = isPinned ? "bg-[#fff5e0]" : "bg-white";
  const recordHref = `/dashboard/review/record/${row._id}?from=${encodeURIComponent(fromQuery)}`;
  return (
    <tr className={`border-b border-[#e8e0d4] hover:bg-[#fdf6e8]/60 ${rowBg}`}>
      <td className={`px-2 py-3 align-top text-center ${rowBg}`}>
        <button
          onClick={onTogglePin}
          aria-label={isPinned ? "Unpin row" : "Pin row"}
          title={isPinned ? "Unpin row" : "Pin row"}
          className={`w-5 h-5 inline-flex items-center justify-center text-sm ${
            isPinned ? "text-[#C19B5F]" : "text-[#bfb8aa] hover:text-[#16110d]"
          }`}
        >
          {isPinned ? "★" : "☆"}
        </button>
      </td>
      <td
        className={`px-3 py-3 align-top sticky border-r border-[#e8e0d4] ${rowBg}`}
        style={{ left: PIN_COL_WIDTH }}
      >
        <Link
          href={recordHref}
          className="text-xs font-medium text-[#16110d] hover:text-[#C19B5F] underline decoration-transparent hover:decoration-[#C19B5F]"
        >
          {id1}
        </Link>
        <div className="text-[10px] uppercase tracking-wider text-[#7a7062] mt-0.5">
          {row._type === "journeyDay" ? "Journey Day" : "Daily Prompt"}
        </div>
      </td>
      <td
        className={`px-3 py-3 align-top sticky border-r border-[#e8e0d4] ${rowBg}`}
        style={{ left: PIN_COL_WIDTH + ID1_COL_WIDTH }}
      >
        <div className="text-xs text-[#16110d]">{id2}</div>
      </td>
      {visibleCols.map((key) => {
        const col = findColumn(key);
        if (!col) return null;
        const cellId = `${row._id}:${key}`;
        const isExpanded = expanded.has(cellId);
        return (
          <td key={key} className="px-3 py-3 align-top">
            <CellRender
              col={col}
              value={getCellValue(row, key)}
              isExpanded={isExpanded}
              onToggle={() => onToggleExpand(row._id, key)}
            />
          </td>
        );
      })}
    </tr>
  );
}

function CellRender({
  col,
  value,
  isExpanded,
  onToggle,
}: {
  col: ColumnDef;
  value: string | string[] | null;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-[#bfb8aa]">·</span>;
  }
  if (col.isImage && typeof value === "string") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt=""
        className="w-14 h-14 object-cover border border-[#e8e0d4]"
        loading="lazy"
      />
    );
  }

  // Voice scan applies to text content (string or array of strings).
  // Non-text cells (image already handled above) are unaffected.
  const matches = scanText(value);

  if (Array.isArray(value)) {
    return (
      <div className="relative pr-5">
        <ul className="list-disc ml-4 text-xs space-y-0.5 text-[#16110d]">
          {value.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
        <VoiceBadge matches={matches} />
      </div>
    );
  }
  if (col.isLongText) {
    return (
      <div className="relative pr-5">
        <div
          onClick={onToggle}
          onDoubleClick={() => isExpanded && onToggle()}
          title={isExpanded ? "Click to collapse" : "Click to expand"}
          className={`text-xs leading-relaxed text-[#16110d] whitespace-pre-line cursor-pointer ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {value}
        </div>
        <VoiceBadge matches={matches} />
      </div>
    );
  }
  return (
    <div className="relative pr-5">
      <div className="text-xs text-[#16110d]">{value}</div>
      <VoiceBadge matches={matches} />
    </div>
  );
}

function VoiceBadge({ matches }: { matches: VoiceRuleMatch[] }) {
  if (matches.length === 0) return null;
  // Build a tooltip listing each rule + suggestion. The amber dot is small
  // enough not to disrupt scanning. Hover reveals the why.
  const tooltip = matches
    .map((m) => `${m.rule.label} (${m.count}): ${m.rule.suggestion}`)
    .join("\n\n");
  const totalCount = matches.reduce((sum, m) => sum + m.count, 0);
  // Error severity (em dash) gets red; warn severity (banned words) gets amber.
  const hasError = matches.some((m) => m.rule.severity === "error");
  const bg = hasError ? "bg-[#c25555]" : "bg-[#a06010]";
  return (
    <span
      className={`absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 ${bg} text-white text-[9px] font-bold rounded-full leading-none`}
      title={tooltip}
      aria-label={`${matches.length} voice rule match${matches.length === 1 ? "" : "es"}: ${matches.map((m) => m.rule.label).join(", ")}`}
    >
      {totalCount > 9 ? "9+" : totalCount}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────────────────

function applyFilters(
  rows: GridRow[],
  opts: {
    docType: string;
    preset: PresetId;
    journey: string | null;
    dayNumber: number | null;
  },
): GridRow[] {
  let filtered = rows;
  if (opts.docType === "journeyDay") {
    filtered = filtered.filter((r) => r._type === "journeyDay");
  } else if (opts.docType === "dailyPrompt") {
    filtered = filtered.filter((r) => r._type === "dailyPrompt");
  }
  if (opts.preset === "arc" && opts.journey) {
    filtered = filtered.filter(
      (r) => r._type === "journeyDay" && r.journeySlug === opts.journey,
    );
  }
  if (opts.preset === "parallel" && opts.dayNumber !== null) {
    filtered = filtered.filter(
      (r) => r._type === "journeyDay" && r.dayNumber === opts.dayNumber,
    );
  }
  return filtered;
}

function parseSort(s: string | null): SortState {
  if (!s) return null;
  const idx = s.lastIndexOf(":");
  if (idx === -1) return null;
  const key = s.slice(0, idx);
  const dir = s.slice(idx + 1);
  if (dir !== "asc" && dir !== "desc") return null;
  if (!key) return null;
  return { key, dir };
}

function sortValueForKey(row: GridRow, key: string): string | number | null {
  if (key === "identifier1") return getIdentifier1(row);
  if (key === "identifier2") return getIdentifier2(row);
  const v = getCellValue(row, key as ColumnKey);
  if (Array.isArray(v)) return v.join(", ") || null;
  return v;
}

function compareRows(a: GridRow, b: GridRow, sort: NonNullable<SortState>): number {
  const av = sortValueForKey(a, sort.key);
  const bv = sortValueForKey(b, sort.key);
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  let cmp: number;
  if (typeof av === "string" && typeof bv === "string") {
    cmp = av.localeCompare(bv);
  } else {
    cmp = Number(av) - Number(bv);
  }
  return sort.dir === "asc" ? cmp : -cmp;
}

function rowHasVoiceFlag(row: GridRow, visibleCols: ColumnKey[]): boolean {
  // Match the brief: only visible content columns count for the filter.
  // Identifiers are not scanned (titles/dates are unlikely to need it).
  for (const key of visibleCols) {
    const v = getCellValue(row, key);
    if (v === null || v === undefined) continue;
    if (scanText(v).length > 0) return true;
  }
  return false;
}

function parseWidths(s: string | null): Record<string, number> {
  if (!s) return {};
  const out: Record<string, number> = {};
  for (const pair of s.split(",")) {
    const idx = pair.lastIndexOf(":");
    if (idx === -1) continue;
    const key = pair.slice(0, idx);
    const px = parseInt(pair.slice(idx + 1), 10);
    if (key && Number.isFinite(px) && px >= MIN_CONTENT_WIDTH) {
      out[key] = px;
    }
  }
  return out;
}

function serializeWidths(widths: Record<string, number>): string | null {
  const entries = Object.entries(widths).filter(
    ([, px]) => Number.isFinite(px) && px >= MIN_CONTENT_WIDTH,
  );
  if (entries.length === 0) return null;
  return entries.map(([k, v]) => `${k}:${Math.round(v)}`).join(",");
}
