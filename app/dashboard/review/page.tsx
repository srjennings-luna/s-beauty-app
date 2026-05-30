import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getReviewGridRows } from "@/lib/sanity";
import ReviewGridClient from "./ReviewGridClient";

// CONTUERI content review dashboard.
// Server-rendered, revalidated every 60s, gated by DASHBOARD_ENABLED env var.
// All data fetched server-side once and passed to the client component for
// interactive filtering/sorting/expansion. See
// content-docs/KALLOS-CC-Content-Review-Dashboard-Build.html for full spec.
//
// Suspense wrapper is required because ReviewGridClient calls
// useSearchParams(); without it Next.js fails the prerender step.

export const revalidate = 60;
export const metadata = {
  title: "CONTUERI · Content Review",
  robots: "noindex, nofollow",
};

export default async function ReviewPage() {
  if (process.env.DASHBOARD_ENABLED !== "true") {
    notFound();
  }
  const data = await getReviewGridRows();
  // Concatenate so the client iterates one array. GROQ already orders
  // journeyDays (Journey asc, Day asc) and dailyPrompts (Date desc); the
  // concat keeps the journey block first and the prompt block second.
  const rows = [...data.journeyDays, ...data.dailyPrompts];
  return (
    <Suspense fallback={<GridLoadingSkeleton />}>
      <ReviewGridClient rows={rows} />
    </Suspense>
  );
}

function GridLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f0e9d8] p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="font-serif text-3xl font-light tracking-wider text-espresso">
          Content Review
        </div>
        <div className="text-xs italic text-[#7a7062] mt-1">Loading…</div>
      </div>
    </div>
  );
}
