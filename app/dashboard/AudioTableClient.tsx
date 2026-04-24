"use client";

import { useMemo, useState } from "react";

export type AudioDay = {
  _id?: string;
  dayNumber: number;
  dayTitle?: string;
  hasOpenTextAudio: boolean;
  hasEncNoteAudio: boolean;
  hasArtworkHookAudio: boolean;
  hasContextAudio: boolean;
  hasReflectionQuestionsAudio: boolean;
  hasAuditio: boolean;
  goDeeperTotal: number;
  goDeeperWithAudio: number;
};
export type AudioJourney = { title: string; slug: string; days?: AudioDay[] };

function Yes({ value }: { value: boolean | undefined }) {
  return value ? (
    <span className="text-[#4a7a62] font-bold">Y</span>
  ) : (
    <span className="text-[#c25555]">—</span>
  );
}

function narrationMissing(d: AudioDay) {
  return !d.hasOpenTextAudio && !d.hasEncNoteAudio && !d.hasArtworkHookAudio && !d.hasContextAudio && !d.hasReflectionQuestionsAudio;
}

function dayHasAnyMissing(d: AudioDay) {
  const missingNarration =
    !d.hasOpenTextAudio ||
    !d.hasEncNoteAudio ||
    !d.hasArtworkHookAudio ||
    !d.hasContextAudio ||
    !d.hasReflectionQuestionsAudio;
  const missingAuditio = !d.hasAuditio;
  const missingGoDeeper = d.goDeeperTotal > 0 && d.goDeeperWithAudio < d.goDeeperTotal;
  return missingNarration || missingAuditio || missingGoDeeper;
}

export default function AudioTableClient({ journeys }: { journeys: AudioJourney[] }) {
  const [filterJourney, setFilterJourney] = useState<string>("");
  const [missingOnly, setMissingOnly] = useState<boolean>(false);

  const filteredJourneys = useMemo(() => {
    return journeys
      .filter((j) => (filterJourney ? j.title === filterJourney : true))
      .map((j) => ({
        ...j,
        days: (j.days ?? []).filter((d) => (missingOnly ? dayHasAnyMissing(d) : true)),
      }));
  }, [journeys, filterJourney, missingOnly]);

  const totalDays = journeys.reduce((n, j) => n + (j.days?.length ?? 0), 0);
  const shown = filteredJourneys.reduce((n, j) => n + j.days.length, 0);

  return (
    <>
      <div className="bg-[#fdf6e8] border border-[#e8e0d4] px-4 py-2 flex items-center flex-wrap gap-2 text-[11px] mb-3">
        <span className="font-sans text-[10px] text-[#7a7062]">
          {shown} of {totalDays} days shown
        </span>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          <select
            className="border border-[#e8e0d4] bg-white px-2 py-1 text-[11px]"
            value={filterJourney}
            onChange={(e) => setFilterJourney(e.target.value)}
          >
            <option value="">All journeys</option>
            {journeys.map((j) => (
              <option key={j.slug} value={j.title}>
                {j.title}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-[11px] text-[#16110d]">
            <input
              type="checkbox"
              checked={missingOnly}
              onChange={(e) => setMissingOnly(e.target.checked)}
            />
            Show days with gaps only
          </label>
          {(filterJourney || missingOnly) && (
            <button
              onClick={() => {
                setFilterJourney("");
                setMissingOnly(false);
              }}
              className="border border-[#C19B5F] text-[#C19B5F] px-2 py-1 text-[10px] font-sans uppercase tracking-wider hover:bg-[#C19B5F] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filteredJourneys.map((j) => (
        <div key={j.slug} className="border border-[#e8e0d4] mb-3">
          <div className="bg-[#16110d] text-[#fdf6e8] px-4 py-2 font-sans text-sm flex justify-between">
            <span>{j.title}</span>
            <span className="text-[10px] text-[#C19B5F] tracking-wider">
              {j.days.length} {missingOnly ? "day(s) with gaps" : "day(s)"}
            </span>
          </div>
          {j.days.length === 0 ? (
            <p className="text-[11px] text-[#4a7a62] italic px-4 py-3">All days complete for this journey.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-[#fdf6e8]">
                  <tr>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Day</th>
                    <th className="px-2 py-1 text-left font-sans text-[9px] tracking-wider">Title</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">openText</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">encNote</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">artworkHook</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">context</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">reflectQ</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">auditio</th>
                    <th className="px-2 py-1 font-sans text-[9px] tracking-wider">goDeeper</th>
                  </tr>
                </thead>
                <tbody>
                  {j.days.map((d) => {
                    const red = narrationMissing(d) && !d.hasAuditio && d.goDeeperWithAudio === 0;
                    const goDeeperCell =
                      d.goDeeperTotal === 0 ? (
                        <span className="text-[#9a8d78]">—</span>
                      ) : (
                        <span
                          className={
                            d.goDeeperWithAudio === d.goDeeperTotal
                              ? "text-[#4a7a62]"
                              : d.goDeeperWithAudio === 0
                              ? "text-[#c25555]"
                              : "text-[#a06010]"
                          }
                        >
                          {d.goDeeperWithAudio}/{d.goDeeperTotal}
                        </span>
                      );
                    return (
                      <tr
                        key={d._id ?? d.dayNumber}
                        className={`border-b border-[#e8e0d4] ${red ? "bg-[#fdf0f0]" : ""}`}
                      >
                        <td className="px-2 py-1 text-right">{d.dayNumber}</td>
                        <td className="px-2 py-1">{d.dayTitle || "(no title)"}</td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasOpenTextAudio} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasEncNoteAudio} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasArtworkHookAudio} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasContextAudio} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasReflectionQuestionsAudio} /></td>
                        <td className="px-2 py-1 text-center"><Yes value={d.hasAuditio} /></td>
                        <td className="px-2 py-1 text-center font-bold">{goDeeperCell}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
