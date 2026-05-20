import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { sanityClient } from "@/lib/sanity";
import type { NextRequest } from "next/server";

/**
 * Sanity Presentation — enable Next.js draft mode.
 *
 * Presentation calls this route with a `?sanity-preview-secret=<secret>` that
 * it auto-provisions in the dataset. `validatePreviewUrl` checks the secret
 * against that document. No manually-rolled secret, Sanity manages the
 * rotation. The token on the Sanity client must have draft-read permission;
 * use server-only SANITY_TOKEN (never NEXT_PUBLIC_*, which leaks to client JS).
 *
 * Once draft mode is on, pages that read `draftMode()` from next/headers
 * can swap to the preview client / drafts perspective. See:
 *   app/journeys/[slug]/page.tsx
 *   app/prompt/[date]/page.tsx (URL-param path still also supported)
 *   app/pray/[artworkId]/page.tsx
 */
export async function GET(request: NextRequest) {
  try {
    const { isValid, redirectTo = "/" } = await validatePreviewUrl(
      sanityClient.withConfig({
        token: process.env.SANITY_TOKEN,
      }),
      request.url,
    );
    if (!isValid) {
      return new Response("Invalid preview secret", { status: 401 });
    }
    const dm = await draftMode();
    dm.enable();
    // Only allow same-origin relative redirects.
    const safePath =
      typeof redirectTo === "string" && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/";
    redirect(safePath);
  } catch (err) {
    // `redirect` throws a Next.js redirect error — let it propagate.
    if (err && typeof err === "object" && "digest" in err) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Preview setup failed: ${msg}`, { status: 500 });
  }
}
