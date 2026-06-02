"use client";

import Link from "next/link";
import type { DailyPrompt } from "@/lib/types";
import { CONTENT_TYPE_COLORS } from "@/lib/contentTypeColors";

export function formatPromptDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  return `${month} ${day}`;
}

// Pause & Ponder row card.
// Used on the Library landing (main archive + Saved section) and on the
// dedicated /library/saved page. Extracted into its own client component
// so both surfaces stay in sync visually with one source of truth.
export function PromptCard({
  prompt,
  isSaved,
}: {
  prompt: DailyPrompt;
  isSaved: boolean;
}) {
  const typeColor =
    CONTENT_TYPE_COLORS[prompt.content?.contentType ?? ""] ?? "#C19B5F";

  return (
    <Link
      href={prompt.date ? `/prompt?date=${prompt.date}` : "/prompt"}
      className="flex items-start gap-3 px-5 py-3"
      style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}
    >
      {prompt.content?.imageUrl && (
        <div className="flex-shrink-0 w-14 h-14 overflow-hidden">
          <img
            src={prompt.content.imageUrl}
            alt={prompt.content.title ?? ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {/* Date + thin right-side rule */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase flex-shrink-0"
            style={{ color: typeColor }}
          >
            {prompt.date ? formatPromptDate(prompt.date) : "Daily Prompt"}
          </span>
          <span
            className="flex-1 h-px"
            style={{ background: typeColor, opacity: 0.35 }}
          />
          {isSaved && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3 flex-shrink-0"
              style={{ color: typeColor }}
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          )}
        </div>
        <p
          className="text-sm text-near-black line-clamp-1"
          style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontWeight: 600,
          }}
        >
          {prompt.content?.title ?? "Pause & Ponder"}
        </p>
        {prompt.promptQuestion && (
          <p
            className="text-xs text-sage-muted mt-0.5 line-clamp-2 italic"
            style={{
              fontFamily: "var(--font-open-sans), 'Open Sans', sans-serif",
            }}
          >
            {prompt.promptQuestion}
          </p>
        )}
      </div>
    </Link>
  );
}
