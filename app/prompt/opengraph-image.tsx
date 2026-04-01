import { ImageResponse } from "next/og";
import { getDailyPrompt } from "@/lib/sanity";

export const runtime = "nodejs";
export const alt = "Pause & Ponder — KALLOS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = (await searchParams) ?? {};
  const prompt = await getDailyPrompt(date).catch(() => null);

  const imageUrl = prompt?.content?.imageUrl ?? "";
  const question = prompt?.promptQuestion ?? "A daily pause with beauty.";

  // Truncate aggressively — question text renders at ~1/3 scale in iMessage cards
  const displayQuestion =
    question.length > 80 ? question.slice(0, 77) + "..." : question;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#16110d",
        }}
      >
        {/* Top: artwork fills ~68% of height */}
        <div
          style={{
            position: "relative",
            width: "1200px",
            height: "430px",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
          )}
          {/* Subtle fade at bottom edge into the dark strip */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              height: "80px",
              background:
                "linear-gradient(to bottom, rgba(22,17,13,0) 0%, rgba(22,17,13,1) 100%)",
              display: "flex",
            }}
          />
        </div>

        {/* Bottom: solid dark strip with KALLOS branding + question */}
        <div
          style={{
            width: "1200px",
            height: "200px",
            background: "#16110d",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 60px",
            gap: "14px",
          }}
        >
          {/* KALLOS label */}
          <span
            style={{
              color: "#C19B5F",
              fontSize: "22px",
              letterSpacing: "0.3em",
              fontWeight: 700,
              fontFamily: "Arial, sans-serif",
              textTransform: "uppercase",
            }}
          >
            KALLOS &nbsp;·&nbsp; Pause &amp; Ponder
          </span>

          {/* Question */}
          <p
            style={{
              color: "rgba(253,246,232,0.92)",
              fontSize: "52px",
              lineHeight: 1.3,
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              margin: "0",
            }}
          >
            {displayQuestion}
          </p>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
