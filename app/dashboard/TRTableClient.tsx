"use client";

import { useMemo, useState } from "react";

export type TRRow = {
  _id: string;
  authorType?: string;
  title: string;
  source?: string;
  era?: string;
  hasSummary: boolean;
  hasAudio: boolean;
  themeCount: number;
  themeNames?: string[];
  journeyCount: number;
  journeyTitles?: string[];
};

type SortKey =
  | "authorType"
  | "era"
  | "title"
  | "source"
  | "hasAudio"
  | "themes"
  | "journeys";
type SortDir = "asc" | "desc";

type AudioFilter = "all" | "has" | "missing";

const AUTHOR_TYPE_OPTIONS = [
  "church-father",
  "saint",
  "pope",
  "doctor",
  "theologian",
  "mystic",
  "philosopher",
];
const ERA_OPTIONS = ["ancient", "fathers", "medieval", "modern"];

function cmpStr(a?: string, b?: string) {
  return (a ?? "").localeCompare(b ?? "");
}

export default function TRTableClient({
  trList,
  repeatedAuthors = [],
}: {
  trList: TRRow[];
  repeatedAuthors?: string[];
}) {
  const repeatedAuthorSet = useMemo(() => new Set(repeatedAuthors), [repeatedAuthors]);

  const isRepeatedAuthor = (tr: TRRow) => {
    const author = (tr.source || "").split(",")[0].split("(")[0].trim();
    return author && repeatedAuthorSet.has(author);
  };
  const [filterJourney, setFilterJourney] = useState<string>("");
  const [filterAuthorType, setFilterAuthorType] = useState<string>("");
  const [filterEra, setFilterEra] = useState<string>("");
  const [filterTheme, setFilterTheme] = useState<string>("");
  const [filterAudio, setFilterAudio] = useState<AudioFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("authorType");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const allJourneys = useMemo(() => {
    const set = new Set<string>();
    trList.forEach((tr) => (tr.journeyTitles ?? []).forEach((j) => set.add(j)));
    return Array.from(set).sort();
  }, [trList]);
  const allThemes = useMemo(() => {
    const set = new Set<string>();
    trList.forEach((tr) => (tr.themeNames ?? []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [trList]);

  const filtered = useMemo(() => {
    return trList.filter((tr) => {
      if (filterJourney && !(tr.journeyTitles ?? []).includes(filterJourney)) return false;
      if (filterAuthorType && tr.authorType !== filterAuthorType) return false;
      if (filterEra && tr.era !== filterEra) return false;
      if (filterTheme && !(tr.themeNames ?? []).includes(filterTheme)) return false;
      if (filterAudio === "has" && !tr.hasAudio) return false;
      if (filterAudio === "missing" && tr.hasAudio) return false;
      return true;
    });
  }, [trList, filterJourney, filterAuthorType, filterEra, filterTheme, filterAudio]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const m = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "authorType":
          return m * cmpStr(a.authorType, b.authorType);
        case "era":
          return m * cmpStr(a.era, b.era);
        case "title":
          return m * cmpStr(a.title, b.title);
        case "source":
          return m * cmpStr(a.source, b.source);
        case "hasAudio":
          return m * (Number(a.hasAudio) - Number(b.hasAudio));
        case "themes":
          return m * ((a.themeCount ?? 0) - (b.themeCount ?? 0));
        case "journeys":
          return m * ((a.journeyCount ?? 0) - (b.journeyCount ?? 0));
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
  const sortArrow = (k: SortKey) => (sortKey === k ? (sortDir === "asc" ? " ▲" : " ▼") : "");
  const headerCls =
    "px-2 py-1 text-left font-sans text-[9px] tracking-wider cursor-pointer select-none hover:text-[#C19B5F]";
  const numHeaderCls =
    "px-2 py-1 font-sans text-[9px] tracking-wider cursor-pointer select-none hover:text-[#C19B5F]";

  const anyFilter =
    !!filterJourney || !!filterAuthorType || !!filterEra || !!filterTheme || filterAudio !== "all";
  const clear = () => {
    setFilterJourney("");
    setFilterAuthorType("");
    setFilterEra("");
    setFilterTheme("");
    setFilterAudio("all");
  };

  return (
    <div className="mt-4 border border-[#e8e0d4]">
      <div className="bg-[#fdf6e8] text-[#16110d] px-4 py-2 flex items-center flex-wrap gap-2 text-[11px]">
        <span className="font-sans text-sm font-bold">Full TR list</span>
        <span className="font-sans text-[10px] text-[#7a7062]">
          {sorted.length} of {trList.length} shown
        </span>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          <select
            className="border border-[#e8e0d4] bg-white px-2 py-1 text-[11px]"
            value={filterJourney}
            onChange={(e) => setFilterJourney(e.target.value)}
          >
            <option value="">All journeys</option>
            {allJourneys.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
          <select
            className="border border-[#e8e0d4] bg-white px-2 py-1 text-[11px]"
            value={filterAuthorType}
            onChange={(e) => setFilterAuthorType(e.target.value)}
          >
            <option value="">All types</option>
            {AUTHOR_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="border border-[#e8e0d4] bg-white px-2 py-1 text-[11px]"
            value={filterEra}
            onChange={(e) => setFilterEra(e.target.value)}
          >
            <option value="">All eras</option>
            {ERA_OPTIONS.map((e) => (
              <option key={e} value={e}>
                {e}
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
            value={filterAudio}
            onChange={(e) => setFilterAudio(e.target.value as AudioFilter)}
          >
            <option value="all">Any audio</option>
            <option value="has">Has audio</option>
            <option value="missing">Missing audio</option>
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
              <th className={headerCls} onClick={() => toggleSort("authorType")}>
                Type{sortArrow("authorType")}
              </th>
              <th className={headerCls} onClick={() => toggleSort("era")}>
                Era{sortArrow("era")}
              </th>
              <th className={headerCls} onClick={() => toggleSort("title")}>
                Title{sortArrow("title")}
              </th>
              <th className={headerCls} onClick={() => toggleSort("source")}>
                Source{sortArrow("source")}
              </th>
              <th className={numHeaderCls} onClick={() => toggleSort("hasAudio")}>
                Audio{sortArrow("hasAudio")}
              </th>
              <th className={headerCls} onClick={() => toggleSort("themes")}>
                Themes{sortArrow("themes")}
              </th>
              <th className={headerCls} onClick={() => toggleSort("journeys")}>
                Journeys{sortArrow("journeys")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((tr) => {
              const red = tr.themeCount === 0 || !tr.era;
              const amber = !red && isRepeatedAuthor(tr);
              const rowCls = red ? "bg-[#fdf0f0]" : amber ? "bg-[#fff5e0]" : "";
              return (
                <tr key={tr._id} className={`border-b border-[#e8e0d4] ${rowCls}`}>
                  <td className="px-2 py-1">{tr.authorType || "—"}</td>
                  <td className="px-2 py-1">
                    {tr.era || <span className="text-[#c25555]">unset</span>}
                  </td>
                  <td className="px-2 py-1">{tr.title}</td>
                  <td className="px-2 py-1 text-[#5a5048] max-w-xs truncate">{tr.source || "—"}</td>
                  <td className="px-2 py-1 text-center">
                    {tr.hasAudio ? (
                      <span className="text-[#4a7a62] font-bold">Y</span>
                    ) : (
                      <span className="text-[#c25555]">—</span>
                    )}
                  </td>
                  <td className="px-2 py-1 text-[#5a5048]">
                    {(tr.themeNames ?? []).join(", ") || "—"}
                  </td>
                  <td className="px-2 py-1 text-[#5a5048]">
                    {(tr.journeyTitles ?? []).join(", ") || "—"}
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
