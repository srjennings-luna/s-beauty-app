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

// Task 2 baseline: identifier columns + togglable content columns + URL-backed
// `cols` param. Default sort comes from the GROQ query order (already
// concatenated server-side). Presets, filters, row pin, sort headers, cell
// expansion, voice scanner, and CSV export arrive in Tasks 3-5.

export default function ReviewGridClient({ rows }: { rows: GridRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL is the source of truth for column visibility. useState below is
  // only for transient UI (panel open/closed, search input) which should
  // not survive page reload.
  const visibleCols = useMemo<ColumnKey[]>(() => {
    const colsParam = searchParams.get("cols") ?? "";
    if (!colsParam) return [];
    const valid = new Set(COLUMNS.map((c) => c.key));
    return colsParam.split(",").filter((k): k is ColumnKey => valid.has(k as ColumnKey));
  }, [searchParams]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");

  const setURL = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleColumn = useCallback(
    (key: ColumnKey) => {
      const set = new Set(visibleCols);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      const next = [...set].join(",");
      setURL({ cols: next || null });
    },
    [setURL, visibleCols],
  );

  const resetColumns = useCallback(() => {
    setURL({ cols: null });
  }, [setURL]);

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
            {rows.length} records loaded
          </div>
        </header>

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
        />

        <GridTable rows={rows} visibleCols={visibleCols} />
      </div>
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
}) {
  return (
    <div className="flex items-center gap-3 mb-4 relative">
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-[#16110d] text-[#16110d] hover:bg-[#16110d] hover:text-[#fdf6e8] transition-colors"
      >
        Columns ({visibleColCount})
      </button>

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
              <div className="px-3 py-3 text-xs text-[#7a7062] italic">No columns match.</div>
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
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

function GridTable({
  rows,
  visibleCols,
}: {
  rows: GridRow[];
  visibleCols: ColumnKey[];
}) {
  return (
    <div className="overflow-x-auto bg-white border border-[#e8e0d4]">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-[#16110d] text-[#fdf6e8] text-[10px] uppercase tracking-widest">
          <tr>
            <th
              className="text-left px-3 py-2 sticky left-0 bg-[#16110d] z-10"
              style={{ minWidth: 180 }}
            >
              Journey / Date
            </th>
            <th
              className="text-left px-3 py-2 sticky bg-[#16110d] z-10"
              style={{ minWidth: 240, left: 180 }}
            >
              Day / Artwork
            </th>
            {visibleCols.map((key) => {
              const col = findColumn(key);
              if (!col) return null;
              return (
                <th key={key} className="text-left px-3 py-2 whitespace-nowrap">
                  {col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <RowView key={row._id} row={row} visibleCols={visibleCols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowView({ row, visibleCols }: { row: GridRow; visibleCols: ColumnKey[] }) {
  const id1 = getIdentifier1(row);
  const id2 = getIdentifier2(row);
  return (
    <tr className="border-b border-[#e8e0d4] hover:bg-[#fdf6e8]/50">
      <td
        className="px-3 py-3 align-top sticky left-0 bg-white border-r border-[#e8e0d4]"
        style={{ minWidth: 180 }}
      >
        <div className="text-xs font-medium text-[#16110d]">{id1}</div>
        <div className="text-[10px] uppercase tracking-wider text-[#7a7062] mt-0.5">
          {row._type === "journeyDay" ? "Journey Day" : "Daily Prompt"}
        </div>
      </td>
      <td
        className="px-3 py-3 align-top sticky bg-white border-r border-[#e8e0d4]"
        style={{ minWidth: 240, left: 180 }}
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
      // Plain img on purpose — Next/Image is overkill for thumbnails
      // in a low-traffic internal tool, and it would require remote
      // patterns config for sanity CDN (already configured but adds
      // latency without benefit at this size).
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
  // Long-form fields get truncated to 3 lines for scanning. Inline expand
  // arrives in Task 4.
  if (col.isLongText) {
    return (
      <div className="text-xs leading-relaxed text-[#16110d] line-clamp-3 whitespace-pre-line">
        {value}
      </div>
    );
  }
  return <div className="text-xs text-[#16110d]">{value}</div>;
}
