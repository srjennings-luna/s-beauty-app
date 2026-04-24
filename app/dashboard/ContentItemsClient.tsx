"use client";

import { useMemo, useState } from "react";

export type ContentItemRow = {
  _id: string;
  contentType: string;
  title: string;
  artist?: string;
  thinkerName?: string;
  author?: string;
  composer?: string;
  year?: string;
  medium?: string;
  era?: string;
  hasImage: boolean;
  hasArtworkHook: boolean;
  hasContext: boolean;
  hasAudioFile: boolean;
  themeCount: number;
  themeNames?: string[];
  journeyTitles?: string[];
  needsArtworkHookReview?: boolean;
};

type SortKey = "type" | "title" | "byline" | "era" | "medium" | "themes" | "journey";
type SortDir = "asc" | "desc";
type ReviewFilter = "all" | "review-only" | "missing-hook" | "missing-audio";

function cmpStr(a?: string, b?: string) {
  return (a ?? "").localeCompare(b ?? "");
}
function byline(c: ContentItemRow) {
  return c.artist || c.thinkerName || c.author || c.composer || "";
}

export default function ContentItemsClient({ items }: { items: ContentItemRow[] }) {
  const [filterType, setFilterType] = useState<string>("");
  const [filterTheme, setFilterTheme] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<ReviewFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("type");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const allTypes = useMemo(
    () => Array.from(new Set(items.map((i) => i.contentType))).sort(),
    [items]
  );
  const allThemes = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => (i.themeNames ?? []).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (filterType && c.contentType !== filterType) return false;
      if (filterTheme && !(c.themeNames ?? []).includes(filterTheme)) return false;
      if (filterStatus === "review-only" && !c.needsArtworkHookReview) return false;
      if (filterStatus === "missing-hook" && c.hasArtworkHook) return false;
      if (filterStatus === "missing-audio" && c.hasAudioFile) return false;
      return true;
    });
  }, [items, filterType, filterTheme, filterStatus]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const m = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "type":
          return m * (cmpStr(a.contentType, b.contentType) || cmpStr(a.title, b.title));
        case "title":
          return m * cmpStr(a.title, b.title);
        case "byline":
          return m * cmpStr(byline(a), byline(b));
        case "era":
          return m * cmpStr(a.era || a.year, b.era || b.year);
        case "medium":
          return m * cmpStr(a.medium, b.medium);
        case "themes":
          return m * ((a.themeCount ?? 0) - (b.themeCount ?? 0));
        case "journey":
          return m * cmpStr((a.journeyTitles ?? []).join(""), (b.journeyTitles ?? []).join(""));
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };
  const sortArrow = (k: SortKey) =>
    sortKey === k ? (sortDir === "asc" ? " ▲" : " ▼") : "";
  const h = "px-2 py-1 text-left font-sans text-[9px] tracking-wider cursor-pointer select-none hover:text-[#C19B5F]";
  const hNum = "px-2 py-1 font-sans text-[9px] tracking-wider cursor-pointer select-none hover:text-[#C19B5F]";

  const anyFilter = !!filterType || !!filterTheme || filterStatus !== "all";
  const clear = () => {
    setFilterType("");
    setFilterTheme("");
    setFilterStatus("all");
  };

  return (
    <div className="border border-[#e8e0d4]">
      <div className="bg-[#fdf6e8] text-[#16110d] px-4 py-2 flex items-center flex-wrap gap-2 text-[11px]">
        <span className="font-sans text-sm font-bold">{sorted.length} / {items.length} items</span>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          <select
            className="border border-[#e8e0d4] bg-white px-2 py-1 text-[11px]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="border border-[#e8e0d4] bg-white px-2 py-1 text-[11px]"
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
          >
            <option value="">All themes</option>
            {allThemes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="border border-[#e8e0d4] bg-white px-2 py-1 text-[11px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ReviewFilter)}
          >
            <option value="all">All status</option>
            <option value="review-only">REVIEW only</option>
            <option value="missing-hook">Missing artworkHook</option>
            <option value="missing-audio">Missing audio</option>
          </select>
          {anyFilter && (
            <button
              onClick={clear}
              className="border border-[#C19B5F] text-[#C19B5F] px-2 py-1 text-[10px] font-sans uppercase tracking-wider hover:bg-[#C19B5F] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-[#16110d] text-[#fdf6e8]">
            <tr>
              <th className={h} onClick={() => toggleSort("type")}>
                Type{sortArrow("type")}
              </th>
              <th className={h} onClick={() => toggleSort("title")}>
                Title{sortArrow("title")}
              </th>
              <th className={h} onClick={() => toggleSort("byline")}>
                Byline{sortArrow("byline")}
              </th>
              <th className={h} onClick={() => toggleSort("era")}>
                Era / Year{sortArrow("era")}
              </th>
              <th className={h} onClick={() => toggleSort("medium")}>
                Medium{sortArrow("medium")}
              </th>
              <th className={h} onClick={() => toggleSort("journey")}>
                Journey{sortArrow("journey")}
              </th>
              <th className={hNum}>Img</th>
              <th className={hNum}>ArtworkHook</th>
              <th className={hNum}>Context</th>
              <th className={hNum} onClick={() => toggleSort("themes")}>
                Themes{sortArrow("themes")}
              </th>
              <th className={hNum}>Audio</th>
              <th className={hNum}>Review?</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const red = !c.hasImage || c.themeCount === 0;
              const yellow = !red && c.needsArtworkHookReview;
              const bg = red ? "bg-[#fdf0f0]" : yellow ? "bg-[#fff5e0]" : "";
              return (
                <tr key={c._id} className={`border-b border-[#e8e0d4] ${bg}`}>
                  <td className="px-2 py-1">{c.contentType}</td>
                  <td className="px-2 py-1">{c.title}</td>
                  <td className="px-2 py-1 text-[#5a5048]">{byline(c)}</td>
                  <td className="px-2 py-1 text-[#5a5048]">{c.era || c.year || "—"}</td>
                  <td className="px-2 py-1 text-[#5a5048]">{c.medium || "—"}</td>
                  <td className="px-2 py-1 text-[#5a5048]">{(c.journeyTitles ?? []).join(", ") || "—"}</td>
                  <td className="px-2 py-1 text-center">{c.hasImage ? <span className="text-[#4a7a62] font-bold">Y</span> : <span className="text-[#c25555]">—</span>}</td>
                  <td className="px-2 py-1 text-center">{c.hasArtworkHook ? <span className="text-[#4a7a62] font-bold">Y</span> : <span className="text-[#c25555]">—</span>}</td>
                  <td className="px-2 py-1 text-center">{c.hasContext ? <span className="text-[#4a7a62] font-bold">Y</span> : <span className="text-[#c25555]">—</span>}</td>
                  <td className="px-2 py-1 text-right">{c.themeCount}</td>
                  <td className="px-2 py-1 text-center">{c.hasAudioFile ? <span className="text-[#4a7a62] font-bold">Y</span> : <span className="text-[#c25555]">—</span>}</td>
                  <td className="px-2 py-1 text-center">
                    {c.needsArtworkHookReview ? (
                      <span className="text-[#a06010] font-bold text-[9px] uppercase tracking-wider">review</span>
                    ) : (
                      <span className="text-[#9a8d78]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
