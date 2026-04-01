import { ImageResponse } from "next/og";
import { getDailyPrompt } from "@/lib/sanity";

export const runtime = "nodejs";
export const alt = "Pause & Ponder — KALLOS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const prompt = await getDailyPrompt(searchParams.date).catch(() => null);

  const imageUrl = prompt?.content?.imageUrl ?? "";
  const question = prompt?.promptQuestion ?? "A daily pause with beauty.";
  const dateStr = prompt?.date ?? "";

  const formattedDate = dateStr
    ? new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Truncate long questions gracefully
  const displayQuestion =
    question.length > 110 ? question.slice(0, 107) + "..." : question;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          background: "#16110d",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Background artwork */}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        )}

        {/* Gradient overlay: lighter at top, heavier at bottom */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "linear-gradient(to bottom, rgba(22,17,13,0.25) 0%, rgba(22,17,13,0.55) 40%, rgba(22,17,13,0.92) 75%, rgba(22,17,13,0.98) 100%)",
            display: "flex",
          }}
        />

        {/* Content layer */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 52px",
          }}
        >
          {/* Top: KALLOS wordmark + label */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                color: "#C19B5F",
                fontSize: "15px",
                letterSpacing: "0.3em",
                fontWeight: 700,
                fontFamily: "Arial, sans-serif",
                textTransform: "uppercase",
              }}
            >
              KALLOS
            </span>
            <span
              style={{
                color: "rgba(253,246,232,0.35)",
                fontSize: "13px",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.08em",
              }}
            >
              Pause &amp; Ponder
            </span>
          </div>

          {/* Bottom: date + question */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {formattedDate && (
              <span
                style={{
                  color: "rgba(193,155,95,0.75)",
                  fontSize: "13px",
                  letterSpacing: "0.14em",
                  fontFamily: "Arial, sans-serif",
                  textTransform: "uppercase",
                }}
              >
                {formattedDate}
              </span>
            )}
            <p
              style={{
                color: "rgba(253,246,232,0.95)",
                fontSize: "34px",
                lineHeight: 1.45,
                fontStyle: "italic",
                margin: "0",
                maxWidth: "960px",
              }}
            >
              {displayQuestion}
            </p>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
