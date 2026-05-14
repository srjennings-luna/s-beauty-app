import { getSplashPages, getSplashPagesPreview } from "@/lib/sanity";
import SplashClient, { type SplashScreen } from "./SplashClient";
import { FALLBACK_SCREENS } from "./fallback";

export const revalidate = 60;

type SearchParams = Promise<{ preview?: string }>;

export default async function SplashPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const isPreview = sp?.preview === "1";

  let screens: SplashScreen[] = [];
  try {
    const fetched = isPreview ? await getSplashPagesPreview() : await getSplashPages();
    screens = Array.isArray(fetched) ? (fetched as SplashScreen[]) : [];
  } catch {
    screens = [];
  }

  // Defensive: drop screens that ended up with no renderable blocks.
  const usable = screens.filter((s) => Array.isArray(s?.blocks) && s.blocks.length > 0);

  const finalScreens = usable.length > 0 ? usable : FALLBACK_SCREENS;

  return <SplashClient screens={finalScreens} />;
}
