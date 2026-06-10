"use client";

// Inline colors so this component is self-contained; matches the values
// of the local C const in JourneyDaySteps.tsx and the rest of the brand.
const GOLD = "#C19B5F";
const GOLD_MID = "rgba(193,155,95,0.5)";

/**
 * Journey Complete screen — shown when a user finishes the last day of a
 * journey. Atmospheric framed centerpiece holding the Contueri brand mark
 * (Ballet C + Kalam "l") animation, with "JOURNEY COMPLETE" text appearing
 * as the "l" mark resolves. Static Share + Start CTAs below.
 *
 * Animation timing:
 *   0.3s - 2.6s   Ballet C fills in (opacity fade)
 *   1.7s - 2.2s   Kalam "l" + JOURNEY COMPLETE text fade in together
 *
 * The image behind the mark is the journey's hero image (pulled from Sanity).
 */
type Props = {
  /** When false, the entry animations don't run — the brand mark and text
   *  remain at opacity 0 until isActive flips to true. The parent stepper
   *  mounts every step at once, so we wait for the user to swipe here. */
  isActive: boolean;
  journeyTitle?: string;
  journeyImageUrl?: string;
  onShare: () => void;
  onStartNewJourney: () => void;
  onClose: () => void;
};

const BALLET_C_PATH =
  "M19.968 30.208C18.432 30.208 17.152 29.952 16.128 29.44C15.104 28.9493 14.2827 28.2773 13.664 27.424C13.0667 26.592 12.64 25.664 12.384 24.64C12.128 23.5947 12 22.528 12 21.44C12 19.584 12.3413 17.7707 13.024 16C13.728 14.2293 14.688 12.5547 15.904 10.976C17.1413 9.376 18.5387 7.91467 20.096 6.592C21.6533 5.248 23.2853 4.08533 24.992 3.104C26.6987 2.12267 28.3947 1.36533 30.08 0.831999C31.7867 0.277333 33.376 0 34.848 0C35.616 0 36.352 0.149333 37.056 0.448C37.7813 0.725334 38.368 1.19467 38.816 1.856C39.264 2.496 39.488 3.37067 39.488 4.48C39.488 5.824 39.2213 7.21067 38.688 8.64C38.176 10.048 37.472 11.424 36.576 12.768C35.68 14.112 34.6667 15.3813 33.536 16.576C32.4267 17.7493 31.2747 18.7947 30.08 19.712C28.8853 20.608 27.7227 21.312 26.592 21.824C25.4613 22.3147 24.4373 22.56 23.52 22.56C22.7307 22.56 22.048 22.272 21.472 21.696C20.896 21.12 20.608 20.2453 20.608 19.072C20.608 18.0907 20.8107 17.0667 21.216 16C21.6213 14.912 22.1653 13.8453 22.848 12.8C23.5307 11.7547 24.288 10.7733 25.12 9.856C25.9733 8.93867 26.8267 8.11733 27.68 7.392C28.5547 6.66667 29.376 6.10133 30.144 5.696C30.9333 5.29067 31.5947 5.088 32.128 5.088C32.6827 5.088 33.1093 5.23733 33.408 5.536C33.728 5.81333 33.888 6.19733 33.888 6.688C33.888 7.60533 33.568 8.59733 32.928 9.664C32.288 10.7307 31.4027 11.8187 30.272 12.928C29.1413 14.016 27.8187 15.0613 26.304 16.064C24.8107 17.0667 23.1893 17.9627 21.44 18.752C19.712 19.5413 17.92 20.1707 16.064 20.64C14.2293 21.1093 12.4053 21.344 10.592 21.344C9.14133 21.344 7.776 21.184 6.496 20.864C5.216 20.544 4.08533 20.096 3.104 19.52C2.12267 18.9227 1.36533 18.208 0.832 17.376C0.277333 16.544 0 15.616 0 14.592C0 13.2693 0.373333 12.0533 1.12 10.944C1.86667 9.83467 2.93333 8.88533 4.32 8.096C5.68533 7.28533 7.30667 6.66667 9.184 6.24C11.0613 5.81333 13.12 5.6 15.36 5.6C17.7707 5.6 20.096 5.89867 22.336 6.496C24.576 7.09333 26.656 7.91467 28.576 8.96C30.5173 10.0053 32.2133 11.1893 33.664 12.512L33.472 12.768C32.064 11.4453 30.4 10.272 28.48 9.248C26.56 8.20267 24.48 7.38133 22.24 6.784C20.0213 6.18667 17.728 5.888 15.36 5.888C13.2693 5.888 11.3067 6.10133 9.472 6.528C7.65867 6.93333 6.06933 7.52 4.704 8.288C3.31733 9.056 2.24 9.97333 1.472 11.04C0.682667 12.1067 0.288 13.3013 0.288 14.624C0.288 15.904 0.768 17.0347 1.728 18.016C2.66667 18.976 3.91467 19.7227 5.472 20.256C7.05067 20.7893 8.77867 21.056 10.656 21.056C12.4053 21.056 14.176 20.832 15.968 20.384C17.7813 19.9147 19.5413 19.296 21.248 18.528C22.976 17.7387 24.576 16.8533 26.048 15.872C27.5413 14.8693 28.8533 13.8347 29.984 12.768C31.1147 11.7013 32 10.6453 32.64 9.6C33.28 8.55467 33.6 7.584 33.6 6.688C33.6 6.28267 33.472 5.96267 33.216 5.728C32.96 5.472 32.608 5.344 32.16 5.344C31.6693 5.344 31.0507 5.54667 30.304 5.952C29.5573 6.35733 28.7573 6.912 27.904 7.616C27.0507 8.29867 26.208 9.09867 25.376 10.016C24.5653 10.912 23.808 11.872 23.104 12.896C22.4213 13.8987 21.8773 14.9227 21.472 15.968C21.0667 16.992 20.864 17.9733 20.864 18.912C20.864 19.9787 21.1093 20.8107 21.6 21.408C22.112 21.984 22.752 22.272 23.52 22.272C24.416 22.272 25.4187 22.016 26.528 21.504C27.6373 20.992 28.7787 20.288 29.952 19.392C31.1253 18.496 32.256 17.472 33.344 16.32C34.4533 15.1467 35.4453 13.8987 36.32 12.576C37.1947 11.232 37.888 9.87733 38.4 8.512C38.9333 7.12533 39.2 5.78133 39.2 4.48C39.2 3.456 38.9973 2.64533 38.592 2.048C38.208 1.45067 37.7067 1.024 37.088 0.768C36.4693 0.511999 35.7973 0.383999 35.072 0.383999C33.8773 0.383999 32.5227 0.693333 31.008 1.312C29.4933 1.93067 27.9253 2.79467 26.304 3.904C24.704 4.992 23.1467 6.272 21.632 7.744C20.1387 9.19467 18.784 10.7733 17.568 12.48C16.3733 14.1653 15.4133 15.9147 14.688 17.728C13.984 19.5413 13.632 21.344 13.632 23.136C13.632 24.5653 13.856 25.7813 14.304 26.784C14.7733 27.808 15.4773 28.5867 16.416 29.12C17.3547 29.6533 18.5387 29.92 19.968 29.92C21.1413 29.92 22.336 29.7387 23.552 29.376C24.7893 29.0133 26.0267 28.48 27.264 27.776C28.5227 27.072 29.7707 26.208 31.008 25.184C32.2667 24.16 33.504 22.9867 34.72 21.664L35.776 20.512H36.064L34.976 21.728C33.76 23.072 32.5227 24.2773 31.264 25.344C30.0053 26.3893 28.7253 27.2747 27.424 28C26.144 28.7253 24.8747 29.2693 23.616 29.632C22.3573 30.016 21.1413 30.208 19.968 30.208Z";

export default function JourneyCompleteScreen({
  isActive,
  journeyImageUrl,
  onShare,
  onStartNewJourney,
}: Props) {
  // Belt-and-suspenders: even though the parent remounts via key when the
  // user swipes to this step, ensure animations only start once isActive
  // is true (avoids any racing on the initial render).
  if (!isActive) {
    return (
      <div
        className="h-full flex flex-col"
        style={{ position: "relative" }}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className="h-full flex flex-col" style={{ position: "relative" }}>
      {/* Keyframes + class definitions in a real <style> tag (not styled-jsx).
          Inline animation styles on SVG <path>/<text> don't apply reliably,
          so we use classes with global CSS scoped by unique class names. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes jc-c-fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes jc-l-fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes jc-bg-drift {
              from { transform: scale(1) translate(0, 0); }
              to { transform: scale(1.06) translate(-1%, -1.5%); }
            }
            .jc-ballet-c {
              fill: rgba(253,246,232,0.85);
              opacity: 0;
              animation: jc-c-fade 2.3s cubic-bezier(0.4, 0, 0.6, 1) 0.3s forwards;
            }
            .jc-kalam-l {
              font-family: var(--font-kalam), 'Kalam', cursive;
              font-weight: 400;
              font-size: 7px;
              fill: rgba(253,246,232,0.85);
              opacity: 0;
              animation: jc-l-fade 0.5s cubic-bezier(0.4, 0, 0.6, 1) 1.7s forwards;
            }
            .jc-complete-label {
              opacity: 0;
              animation: jc-l-fade 0.5s cubic-bezier(0.4, 0, 0.6, 1) 1.5s forwards;
            }
          `,
        }}
      />

      {/* Spacer for overlaid chrome (back arrow, progress bar, X close) */}
      <div
        style={{
          height: "calc(max(env(safe-area-inset-top, 0px), 48px) + 56px)",
          flexShrink: 0,
        }}
      />

      {/* Framed centerpiece: blurred journey artwork + C+l brand animation */}
      <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
        <div
          style={{
            position: "relative",
            width: "calc(100% - 130px)",
            margin: "12px auto 0",
            aspectRatio: "1 / 1",
            maxHeight: "32vh",
            overflow: "hidden",
            isolation: "isolate",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "6%",
          }}
        >
          {/* Blurred background image (journey hero from Sanity) */}
          <div
            style={{
              position: "absolute",
              inset: "-6%",
              backgroundImage: journeyImageUrl ? `url(${journeyImageUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#2a1c10",
              filter: "blur(18px) brightness(0.9)",
              zIndex: 0,
              animation: "jc-bg-drift 18s ease-in-out infinite alternate",
            }}
          />
          {/* Espresso overlay for legibility */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(22,17,13,0.5)",
              zIndex: 1,
            }}
          />
          {/* C + l brand animation */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "55%",
                maxWidth: "175px",
                aspectRatio: "40 / 31",
                position: "relative",
              }}
            >
              <svg
                viewBox="0 0 40 31"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: "100%", height: "100%", display: "block" }}
                aria-label="Contueri"
              >
                <path className="jc-ballet-c" d={BALLET_C_PATH} />
                <text className="jc-kalam-l" x="14.3" y="9">l</text>
              </svg>
            </div>
            {/* JOURNEY COMPLETE label, appears with the l */}
            <div
              className="jc-complete-label"
              style={{
                marginTop: "24px",
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: "rgba(253,246,232,0.78)",
                textAlign: "center",
              }}
            >
              Journey Complete
            </div>
          </div>
        </div>
      </div>

      {/* Static CTAs at the bottom — Share + Start a New Journey */}
      <div
        className="flex flex-col items-center"
        style={{
          marginTop: "auto",
          width: "100%",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 90px)",
          gap: "22px",
        }}
      >
        <button
          onClick={onShare}
          aria-label="Share this journey"
          className="flex flex-col items-center"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 12px",
            gap: "7px",
            color: GOLD,
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              border: `1px solid ${GOLD_MID}`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={GOLD}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
          </span>
          <span
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: "9.5px",
              fontWeight: 500,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            Share this journey
          </span>
        </button>

        <button
          onClick={onStartNewJourney}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: GOLD,
            padding: "8px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Start a New Journey
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
