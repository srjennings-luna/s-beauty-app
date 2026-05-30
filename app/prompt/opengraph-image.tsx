import { ImageResponse } from "next/og";
import { getDailyPrompt } from "@/lib/sanity";

export const runtime = "nodejs";
export const alt = "Pause & Ponder — CONTUERI";
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

  // NOTE: Hex literals are required here — Next.js OG ImageResponse renders
  // server-side without CSS context, so var(--color-*) does not resolve.
  // Keep values in sync with --color-espresso and --color-gold in globals.css.
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          background: "#16110d",
        }}
      >
        {/* Full-bleed artwork */}
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

        {/* Dark vignette — heavier at bottom */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            background:
              "linear-gradient(to bottom, rgba(22,17,13,0.1) 0%, rgba(22,17,13,0.45) 60%, rgba(22,17,13,0.85) 100%)",
            display: "flex",
          }}
        />

        {/* CONTUERI wordmark — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            left: "56px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: "#C19B5F",
              fontSize: "48px",
              letterSpacing: "0.3em",
              fontWeight: 700,
              fontFamily: "Arial, sans-serif",
              textTransform: "uppercase",
            }}
          >
            CONTUERI
          </span>
          <span
            style={{
              color: "rgba(253,246,232,0.6)",
              fontSize: "22px",
              letterSpacing: "0.15em",
              fontFamily: "Arial, sans-serif",
              textTransform: "uppercase",
            }}
          >
            Pause &amp; Ponder
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
