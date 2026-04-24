import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/**
 * Sanity Presentation — enable draft mode.
 *
 * Presentation calls this route in the iframe with:
 *   ?sanity-preview-secret=<secret>&sanity-preview-pathname=<app-path>
 *
 * We verify the secret against SANITY_PREVIEW_SECRET (set in Vercel + .env.local),
 * enable Next.js draftMode(), then redirect to the requested pathname so the
 * iframe renders the app view.
 *
 * Fuller draft rendering (pages reading drafts from Sanity via the preview
 * perspective) is only wired on the P&P page today — see PromptClient's
 * ?preview=1 path. Other routes will serve published content until the draft
 * read-path is extended.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("sanity-preview-secret");
  const pathname = searchParams.get("sanity-preview-pathname") ?? "/";

  if (!process.env.SANITY_PREVIEW_SECRET) {
    return new Response(
      "SANITY_PREVIEW_SECRET is not configured on this deploy. Add it to Vercel env vars.",
      { status: 500 }
    );
  }
  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  // Path safety — only allow same-origin relative paths.
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return new Response("Invalid preview pathname", { status: 400 });
  }

  const dm = await draftMode();
  dm.enable();

  redirect(pathname);
}
