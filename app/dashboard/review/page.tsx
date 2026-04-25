import { notFound } from "next/navigation";
import { getReviewGridRows } from "@/lib/sanity";
import ReviewGridClient from "./ReviewGridClient";

// KALLOS content review dashboard.
// Server-rendered, revalidated every 60s, gated by DASHBOARD_ENABLED env var.
// All data fetched server-side once and passed to the client component for
// interactive filtering/sorting/expansion. See
// content-docs/KALLOS-CC-Content-Review-Dashboard-Build.html for full spec.

export const revalidate = 60;
export const metadata = {
  title: "KALLOS · Content Review",
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
  return <ReviewGridClient rows={rows} />;
}
