# Seeking Beauty App – Review & Recommendations

This document summarizes a codebase review and prioritized recommendations to improve reliability, consistency, and maintainability.

---

## Critical: Fix Favorites Data Source

**Issue:** The Favorites page uses **static data** from `data/episodes.ts` (e.g. IDs like `s1e01`, `s1e01-art01`), while the rest of the app uses **Sanity** (document IDs like `abc123xyz`). When users favorite an episode or artwork from Home/Map/Episode detail, those IDs are Sanity IDs. `getEpisodeById(fav.itemId)` and the artwork lookup only search the static array, so **favorited items from Sanity will never appear** on the Favorites page (or will show as empty).

**Recommendation:**  
- **Option A (recommended):** Make the Favorites page fetch from Sanity. On load, call `getReleasedEpisodes()` (and optionally a dedicated “get artworks by IDs” if you add one). Resolve favorited episode IDs and artwork IDs from that data so the page shows the same content as the rest of the app.  
- **Option B:** If you ever phase out Sanity and go back to static data, then switch Favorites to use that single source; until then, Favorites must resolve Sanity IDs.

**Files to change:**  
- `app/favorites/page.tsx` – replace `data/episodes` and `getEpisodeById` with Sanity fetches and resolve favorites by Sanity `_id`.  
- You can keep `data/episodes.ts` for reference or remove it once nothing uses it.

---

## High: Design System Consistency

**Issue:**  
- **CLAUDE_REFERENCE.md** says “NO rounded corners” and specifies a dark theme.  
- `app/globals.css` still has:
  - `body { background-color: var(--color-catskill-white); color: #1a1a2e; }` (light theme).
  - `.btn-primary`, `.btn-secondary`, `.btn-outline` use `border-radius: 0.75rem`.
  - `.card` uses `border-radius: 1rem`.
  - `.leaflet-control-zoom` uses `border-radius: 12px`.

So global styles don’t fully match the “dark, no rounded corners” rule.

**Recommendation:**  
- Set default body background to the app background (e.g. `#203545`) and default text color to a light tone so any unstyled fallback still matches the app.  
- For buttons and cards used in this app, use square corners (e.g. `rounded-none` or `border-radius: 0`) and, if needed, add a single utility class like `.btn-primary-square` so the design system is consistent.  
- For Leaflet, either keep a small radius for the zoom control only (and note it as an exception) or make it square to match.

---

## High: Next.js Image Optimization & Sanity

**Issue:**  
- Hero and artwork images use raw `<img>` with Sanity URLs.  
- `next.config.ts` only has `remotePatterns` for `upload.wikimedia.org` and `images.unsplash.com`.  
- Sanity image URLs (e.g. `cdn.sanity.io`) are not in `remotePatterns`, so you can’t use `next/image` for them (and you’re not using it yet).

**Recommendation:**  
- Add `cdn.sanity.io` to `images.remotePatterns` in `next.config.ts` so you can safely switch to `next/image` later.  
- Where possible, use `next/image` for above-the-fold images (e.g. hero, episode cards, artwork thumbnails) with appropriate `sizes` and Sanity URLs. You already have `urlFor()` in `lib/sanity.ts`; you can pass the Sanity image object and build the URL, or use the same URL you use for `<img>` with `next/image` and a reasonable width/height or fill.

---

## Medium: Single Source of Truth for Types

**Issue:**  
- Sanity responses use `_id`; app types use `id`.  
- `Episode` / `Artwork`-like shapes are redefined in multiple places: `app/page.tsx`, `app/episodes/[id]/page.tsx`, `app/map/page.tsx` (e.g. `SanityArtwork`, `SanityEpisode`, local `Episode`).  
- `lib/types.ts` has `Episode` and `Artwork` with `id` (and optional fields), but pages don’t always use them and instead define ad-hoc interfaces.

**Recommendation:**  
- Add a small `lib/sanity-types.ts` (or extend `lib/types.ts`) with types that match Sanity responses (e.g. `_id`, `heroImageUrl`, `imageUrl`).  
- Use one “app” shape (e.g. `Artwork` with `id`) and a single mapper from Sanity → app (e.g. `mapSanityArtworkToApp(sanityArtwork): Artwork`).  
- Use these types and the mapper in `app/page.tsx`, `app/episodes/[id]/page.tsx`, and `app/map/page.tsx` so you don’t repeat interfaces and manual `id: selectedArtwork._id` mapping.

---

## Medium: Error and Empty States

**Issue:**  
- Fetch errors are only logged (`console.error`); users see loading that never resolves or empty content.  
- No explicit “no episodes” or “no artworks” messaging on Home or Map.

**Recommendation:**  
- For Sanity fetches (episodes, splash, etc.), set an error state (e.g. `error: string | null`) and render a simple message and retry or “Back to home” when error is set.  
- On Home, if `!loading && episodes.length === 0`, show a short “No episodes right now” message.  
- On Map, if there are no artworks (or no released episodes), show a short empty state instead of an empty map/list.

---

## Medium: Accessibility & Semantics

**Issue:**  
- Some buttons are icon-only; a few have `aria-label`, but not all (e.g. ArtworkViewer close, reflection toggle).  
- Map/list toggle has `aria-label`; good.  
- Favorites page “Explore Episodes” uses `rounded-full` (design system says no rounded corners).

**Recommendation:**  
- Add `aria-label` to every icon-only button (e.g. “Close”, “View reflection content”, “Back”).  
- Ensure focus order and keyboard usage are reasonable (e.g. modals trap focus, Escape closes overlays).  
- Change “Explore Episodes” button to square corners to match the design system.

---

## Low: README and Docs

**Issue:**  
- `README.md` is still the default Next.js template (generic “Learn Next.js”, “Deploy on Vercel”).  
- `CLAUDE_REFERENCE.md` is the real project guide and is very helpful.

**Recommendation:**  
- Replace README content with a short project-specific overview: what Seeking Beauty is, tech stack (Next.js, Sanity, React-Leaflet), how to run (`npm run dev`), link to Sanity Studio, and “See CLAUDE_REFERENCE.md for detailed conventions and verification commands.”

---

## Low: Unused / Dead Code

**Issue:**  
- `getAllArtworks()` in `lib/sanity.ts` is not used anywhere. It also omits `locationType` and `quote`, so it’s inconsistent with other queries.  
- `data/episodes.ts` is only used by the Favorites page; after moving Favorites to Sanity, it can be removed or kept only as seed/reference.

**Recommendation:**  
- Remove `getAllArtworks()` or add a single use (e.g. a “all artworks” API or page); if you keep it, add `locationType` and `quote` to the GROQ projection so it matches other artwork queries.  
- After Favorites is fixed, delete or clearly mark `data/episodes.ts` as legacy/seed data.

---

## Low: Home Page Hero Image

**Issue:**  
- Home hero uses a hardcoded Unsplash URL (`https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800`) instead of Sanity or a project asset.

**Recommendation:**  
- Prefer a Sanity “site hero” or “home hero” image so it’s editable without code changes. If you keep a static asset, put it under `public/` and reference it by path. Add Unsplash to `remotePatterns` only if you keep using external URLs.

---

## Summary Table

| Priority  | Item                          | Effort | Impact |
|----------|-------------------------------|--------|--------|
| Critical | Favorites use Sanity data     | Medium | High   |
| High     | Design system (dark, corners) | Low    | Medium |
| High     | Next config + Sanity images   | Low    | Medium |
| Medium   | Single source for types       | Medium | Medium |
| Medium   | Error/empty states            | Low    | Medium |
| Medium   | A11y (aria-labels, focus)     | Low    | Medium |
| Low      | README, dead code, hero image | Low    | Low    |

Implementing the **Critical** and **High** items first will fix the Favorites bug, align the app with the design system, and set you up for better image and type safety. If you tell me which item you want to tackle first (e.g. “fix Favorites” or “align globals.css with the design doc”), I can outline or implement the exact code changes step by step.
