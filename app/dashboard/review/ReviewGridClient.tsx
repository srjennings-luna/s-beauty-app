"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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

// Task 3: preset buttons, parameter dropdowns, doc-type filter, row pin,
// sortable headers + sort-reset, all serialized into URL params.
//
// State model (URL is source of truth — no useState for any of this):
//   preset       active preset id (defaults to "arc")
//   cols         comma list of column keys (overrides preset defaults)
//   docType      "journeyDay" | "dailyPrompt" | "both" (default "both")
//   journey      slug, used by arc preset
//   dayNumber    integer 1-9, used by parallel preset
//   focusField   column key, used by field-comparison preset
//   fieldA       column key, used by content-pairing preset
//   fieldB       column key, used by content-pairing preset
//   sort         "<key>:asc" | "<key>:desc"
//   pinned       comma list of row _id values (floats to top)
//
// useState here is reserved for transient UI state only (panel open/closed,
// search input typing) which intentionally does not survive page reload.

const ALL_COL_KEYS = new Set<ColumnKey>(COLUMNS.map((c) => c.key));

type SortDir = "asc" | "desc";
type SortState = { key: string; dir: SortDir } | null;

export default function ReviewGridClient({ rows }: { rows: GridRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL parsers
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

  // Effective column visibility:
  //   if cols param is present, use it verbatim
  //   else fall back to the active preset's default columns
  const presetDefaults = useMemo(
    () => getPresetDefaultColumns(preset, { focusField, fieldA, fieldB }),
    [preset, focusField, fieldA, fieldB],
  );
  const visibleCols = useMemo<ColumnKey[]>(() => {
    const colsParam = searchParams.get("cols");
    if (colsParam !== null) {
      // Empty string means "no columns" (different from absent).
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

  // Switching preset clears `cols` so the new preset's defaults take effect.
  // Other params (journey, dayNumber, etc.) carry over — harmless if the
  // new preset does not use them.
  const selectPreset = useCallback(
    (id: PresetId) => {
      setURL({ preset: id, cols: null });
    },
    [setURL],
  );

  // Toggling a column writes the FULL new visible set into `cols` (overrides
  // preset defaults from then on). To restore preset defaults, the user
  // hits Reset which clears `cols`.
  const toggleColumn = useCallback(
    (key: ColumnKey) => {
      const set = new Set(visibleCols);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      const next = [...set];
      // Use empty string (not null) to distinguish "user cleared all" from
      // "no override". Empty string = render zero columns. null = use
      // preset defaults.
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

  const setSort = useCallback(
    (key: string) => {
      // Click cycles: unsorted → asc → desc → unsorted.
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

  // Apply filters first, then sort, then pin-float.
  const filteredRows = useMemo(() => {
    return applyFilters(rows, { docType, preset: preset.id, journey, dayNumber });
  }, [rows, docType, preset.id, journey, dayNumber]);

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

  // Param dropdown options derived from row data
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

        <FilterBar docType={docType} setURL={setURL} />

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
        />

        <GridTable
          rows={orderedRows}
          visibleCols={visibleCols}
          sort={sort}
          setSort={setSort}
          pinned={pinned}
          togglePin={togglePin}
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
  // Only render parameter controls relevant to the active preset.
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
  setURL,
}: {
  docType: string;
  setURL: (updates: Record<string, string | null>) => void;
}) {
  const choices: { id: string; label: string }[] = [
    { id: "both", label: "All" },
    { id: "journeyDay", label: "Journey Days" },
    { id: "dailyPrompt", label: "Daily Prompts" },
  ];
  return (
    <div className="flex items-center gap-2 mb-3">
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
}) {
  return (
    <div className="flex items-center gap-3 mb-4 relative">
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

// ─────────────────────────────────────────────────────────────────────────
// Grid + rows
// ─────────────────────────────────────────────────────────────────────────

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

function GridTable({
  rows,
  visibleCols,
  sort,
  setSort,
  pinned,
  togglePin,
}: {
  rows: GridRow[];
  visibleCols: ColumnKey[];
  sort: SortState;
  setSort: (key: string) => void;
  pinned: Set<string>;
  togglePin: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto bg-white border border-[#e8e0d4]">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-[#16110d] text-[#fdf6e8] text-[10px] uppercase tracking-widest">
          <tr>
            <th className="px-2 py-2" style={{ width: 40 }}>
              {/* Pin column header — empty */}
            </th>
            <SortableHeader
              label="Journey / Date"
              sortKey="identifier1"
              sort={sort}
              onClick={setSort}
              sticky
              left={40}
              minWidth={180}
            />
            <SortableHeader
              label="Day / Artwork"
              sortKey="identifier2"
              sort={sort}
              onClick={setSort}
              sticky
              left={220}
              minWidth={240}
            />
            {visibleCols.map((key) => {
              const col = findColumn(key);
              if (!col) return null;
              return (
                <SortableHeader
                  key={key}
                  label={col.label}
                  sortKey={key}
                  sort={sort}
                  onClick={setSort}
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
  minWidth,
}: {
  label: string;
  sortKey: string;
  sort: SortState;
  onClick: (key: string) => void;
  sticky?: boolean;
  left?: number;
  minWidth?: number;
}) {
  const active = sort && sort.key === sortKey;
  const indicator = active ? (sort.dir === "asc" ? "↑" : "↓") : "";
  return (
    <th
      className={`text-left px-3 py-2 whitespace-nowrap cursor-pointer select-none ${
        sticky ? "sticky bg-[#16110d] z-10" : ""
      } hover:bg-[#2b2117]`}
      style={{
        ...(sticky && left !== undefined ? { left } : {}),
        ...(minWidth ? { minWidth } : {}),
      }}
      onClick={() => onClick(sortKey)}
    >
      <span>{label}</span>
      {indicator && <span className="ml-1 text-[#C19B5F]">{indicator}</span>}
    </th>
  );
}

function RowView({
  row,
  visibleCols,
  isPinned,
  onTogglePin,
}: {
  row: GridRow;
  visibleCols: ColumnKey[];
  isPinned: boolean;
  onTogglePin: () => void;
}) {
  const id1 = getIdentifier1(row);
  const id2 = getIdentifier2(row);
  const rowBg = isPinned ? "bg-[#fff5e0]" : "bg-white";
  return (
    <tr className={`border-b border-[#e8e0d4] hover:bg-[#fdf6e8]/60 ${rowBg}`}>
      <td
        className={`px-2 py-3 align-top text-center ${rowBg}`}
        style={{ width: 40 }}
      >
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
        style={{ minWidth: 180, left: 40 }}
      >
        <div className="text-xs font-medium text-[#16110d]">{id1}</div>
        <div className="text-[10px] uppercase tracking-wider text-[#7a7062] mt-0.5">
          {row._type === "journeyDay" ? "Journey Day" : "Daily Prompt"}
        </div>
      </td>
      <td
        className={`px-3 py-3 align-top sticky border-r border-[#e8e0d4] ${rowBg}`}
        style={{ minWidth: 240, left: 220 }}
      >
        <div className="text-xs text-[#16110d]">{id2}</div>
      </td>
      {visibleCols.map((key) => {
        const col = findColumn(key);
        if (!col) return null;
        return (
          <td key={key} className="px-3 py-3 align-top max-w-md">
            <CellRender col={col} value={getCellValue(row, key)} />
          </td>
        );
      })}
    </tr>
  );
}

function CellRender({
  col,
  value,
}: {
  col: ColumnDef;
  value: string | string[] | null;
}) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-[#bfb8aa]">—</span>;
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
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc ml-4 text-xs space-y-0.5 text-[#16110d]">
        {value.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>
    );
  }
  if (col.isLongText) {
    return (
      <div className="text-xs leading-relaxed text-[#16110d] line-clamp-3 whitespace-pre-line">
        {value}
      </div>
    );
  }
  return <div className="text-xs text-[#16110d]">{value}</div>;
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
