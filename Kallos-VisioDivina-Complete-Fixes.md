# KALLOS — Visio Divina Complete Fixes + Go Deeper Carousel
# Supersedes: Kallos-VisioDivina-Fixes.md

Read this fully before starting. Work through each fix in order.
`npm run build` after EACH fix. Commit after each fix with a clear message.

---

## Fix 1 — CRITICAL: Step order is WRONG (explicit swap)

**File:** `app/pray/[artworkId]/page.tsx`

**Current STEPS array (lines 30–36):**
```js
const STEPS = [
  { key: "gaze",        title: "Gaze",        label: "Visio" },
  { key: "meditate",    title: "Meditate",     label: "Meditatio" },
  { key: "pray",        title: "Pray",         label: "Oratio" },
  { key: "contemplate", title: "Contemplate",  label: "Contemplatio" },
  { key: "action",      title: "Action",       label: "Operatio" },
];
```

**Replace with (swap pray and contemplate):**
```js
const STEPS = [
  { key: "gaze",        title: "Gaze",        label: "Visio" },
  { key: "meditate",    title: "Meditate",     label: "Meditatio" },
  { key: "contemplate", title: "Contemplate",  label: "Contemplatio" },
  { key: "pray",        title: "Pray",         label: "Oratio" },
  { key: "action",      title: "Action",       label: "Operatio" },
];
```

Then find all the `step === N` conditions in the JSX rendering section of this file and update them to match the new order:

- `step === 0` → Gaze (no change)
- `step === 1` → Meditate/Reflect (no change)
- `step === 2` → NOW Contemplate (was Pray — update the JSX block)
- `step === 3` → NOW Pray (was Contemplate — update the JSX block)
- `step === 4` → Action (no change)

The JSX for the Pray step and the Contemplate step simply need their `step === N` condition numbers swapped.

---

## Fix 2 — CRITICAL: Finish button does nothing on Action step

**File:** `app/pray/[artworkId]/page.tsx`

Find the Action step (step 4 after the reorder above). The "Finish" button currently does nothing.

Fix:
1. The Finish button must call `router.back()` (or `router.push()` to the previous route) to navigate away
2. If the user typed in the optional note field, save it to `localStorage` with key `kallos-visio-note-${artworkId}` before navigating
3. If the note field is empty, Finish still works — do not block navigation on empty input
4. The text area placeholder already says "Optional" — make sure no validation prevents submission

---

## Fix 3 — Music button: make it visible on ALL 5 steps

**File:** `app/pray/[artworkId]/page.tsx`

**Root cause found:** In the header (around line 218), the Music button renders only when `musicMode === "off"`. When music is active, it's replaced with `<div className="w-10" />` and a floating button appears at the bottom. On steps where the header scrolls out of view, Music disappears entirely.

**Fix:** The Music button in the header must always be visible on every step, regardless of musicMode. When music is playing, show the current mode name (e.g., "Chant ♪" or "Ambient ♪") instead of just "Music", but keep it tappable to open the music menu.

```jsx
// Replace the current conditional with:
<button
  type="button"
  onClick={() => { setMusicLoadError(false); setMusicMenuOpen(true); }}
  className="text-white/40 text-xs font-medium"
>
  {musicMode === "off" ? "Music" : musicMode === "chant" ? "Chant ♪" : "Ambient ♪"}
</button>
```

Also make sure the header is `position: sticky` or `position: fixed` so it doesn't scroll out of view on any step. Check the header container's className and ensure it stays visible when content overflows.

---

## Fix 4 — Pray step: restore artwork image + add Traditional Prayer drawer

**File:** `app/pray/[artworkId]/page.tsx`

The Pray step (now step index 3 after reorder) currently shows only a scripture quote with no image.

### 4a. Restore the image
Add the artwork image at the top of the Pray step — same layout as the Meditate/Reflect step (image takes upper portion, content scrolls below). The user is praying *with* the image; it must be present.

### 4b. Add "Traditional Prayer" expandable drawer
On the Pray step only, add a collapsible drawer ABOVE the Go Deeper section, styled identically to Go Deeper. Collapsed by default, opt-in only.

Header row (collapsed state):
```
Traditional Prayer        [chevron down]
```

When expanded, show:
- Prayer text in Cormorant Garamond italic, white/80, centered
- Source attribution below in small text (white/40)

For the prayer content: Read it from `artwork.traditionalPrayer` (new Sanity field — see Fix 7 below). If that field is empty or null, show this fallback:

```
Lord, as I look upon this image, I am reminded of your glory made visible.
Open the eyes of my heart. Let what I see lead me beyond what I see.

Glory be to the Father, and to the Son, and to the Holy Spirit.
As it was in the beginning, is now, and ever shall be,
world without end. Amen.
```

No source attribution for the fallback. Show attribution only when content comes from Sanity.

---

## Fix 5 — Go Deeper: change from stacked list to swipeable carousel

**File:** `components/GoDeeperSection.tsx`

Currently when expanded, Go Deeper stacks multiple reflections vertically. Replace with a horizontal swipe carousel — one reflection visible at a time.

### Carousel behavior:
- Shows one reflection card at a time
- Swipe left = next reflection, swipe right = previous
- Dot indicators at the bottom showing position (e.g., 3 dots if 3 reflections, active dot = current)
- Dot style: active = gold (#C19B5F) pill (20px × 6px, border-radius 3px), inactive = white 35% opacity (6px circle)
- No arrows/buttons needed — swipe only (touch events)
- First reflection shown by default when expanded

### Implementation notes:
- Use the same touch event pattern already in `page.tsx` (`touchStartX`, `touchEndX`, swipe threshold ~50px)
- Add `currentIndex` state (useState, default 0), reset to 0 when collapsed
- The card layout per reflection:
  - Title: white, font-semibold, text-base, mb-2
  - Short quote (if present): Cormorant Garamond italic, white/80, border-left 2px gold, pl-3, mb-2
  - Summary: white/70, text-sm, leading-relaxed, mb-2
  - Source: white/40, text-xs, "— {source}"
- No `max-h-[60vh] overflow-y-auto` wrapper needed — single card doesn't overflow

### Updated GoDeeperSection signature:
Accept an optional `reflections` prop so Journey Day steps can pass their own day-specific reflections, while Visio Divina continues fetching from Sanity:

```tsx
interface GoDeeperSectionProps {
  reflections?: TraditionReflection[];
}
export default function GoDeeperSection({ reflections: propReflections }: GoDeeperSectionProps)
```

If `propReflections` is provided, use those. If not, fetch from Sanity as before.

---

## Fix 6 — Progress bar: spacing + unified design

### 6a. Buffer space (Journey Day steps)
**File:** `components/JourneyDaySteps.tsx`

The progress indicator at the top of Journey Day step screens sits too tight under the header. Add `mt-3` or `pt-3` (12px) above the progress bar container.

### 6b. Unified dot design
Both Journey Day steps and Visio Divina steps should use the same dot style:
- Active: gold (#C19B5F), pill shape — `width: 20px, height: 6px, border-radius: 3px`
- Inactive: white at 35% opacity, 6px circle — `width: 6px, height: 6px, border-radius: 50%, opacity: 0.35`
- Gap between dots: 6px
- Centered

Update both `components/JourneyDaySteps.tsx` and `app/pray/[artworkId]/page.tsx` to use this same style.

---

## Fix 7 — Sanity schema: two new fields on contentItem

**File:** `sanity/schemaTypes/contentItem.ts`

Add two new fields. Place them in the "Reflection & Prayer" section, after `reflectionQuestions` and before `curatorNote`.

### Field A: Traditional Prayer
```typescript
defineField({
  name: 'traditionalPrayer',
  title: 'Traditional Prayer (Pray step)',
  type: 'text',
  rows: 6,
  description: 'Optional. A traditional Catholic prayer shown in the expandable "Traditional Prayer" drawer on the Pray step of Visio Divina. Leave blank to use the built-in fallback prayer.',
}),
defineField({
  name: 'traditionalPrayerSource',
  title: 'Traditional Prayer — Source',
  type: 'string',
  description: 'Attribution for the prayer above, e.g. "Act of Adoration, Traditional" or "St. Francis of Assisi". Shown below the prayer text.',
  hidden: ({ document }) => !document?.traditionalPrayer,
}),
```

### Field B: Go Deeper Reflections (for Visio Divina carousel)
```typescript
defineField({
  name: 'traditionReflections',
  title: 'Go Deeper: Tradition Reflections',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'traditionReflection' }] }],
  description: 'Link specific tradition reflections to this content item for the Visio Divina "Go Deeper" carousel. Order here = carousel order. If empty, the carousel shows reflections matching this item\'s themes.',
}),
```

### After adding these fields:
1. Run `npx sanity deploy` to push schema changes to the Sanity Studio
2. The new fields will appear in Sanity Studio on every content item document
3. Sheri will manually fill these in for existing content items

### Update the GROQ query for artwork:
**File:** `lib/sanity.ts`

In the query that fetches a single artwork by ID, add the two new fields:
```groq
traditionalPrayer,
traditionalPrayerSource,
"traditionReflections": traditionReflections[]->{
  _id,
  title,
  summary,
  shortQuote,
  source,
  authorType,
}
```

### Update TypeScript types:
**File:** `lib/types.ts`

Add to the `SanityArtwork` (or `ContentItem`) type:
```typescript
traditionalPrayer?: string;
traditionalPrayerSource?: string;
traditionReflections?: TraditionReflection[];
```

### Update GoDeeperSection in Visio Divina:
**File:** `app/pray/[artworkId]/page.tsx`

Pass `artwork.traditionReflections` to `GoDeeperSection` when available:
```tsx
<GoDeeperSection reflections={artwork?.traditionReflections} />
```

---

## Testing Checklist

After all fixes:

**Step order:**
- [ ] Steps read: Gaze → Meditate → Contemplate → Pray → Action
- [ ] Progress dots update correctly for all 5 steps
- [ ] Step labels in header match: "1 of 5 · Gaze", "2 of 5 · Meditate", etc.

**Finish button:**
- [ ] Finish button on Action step (step 5) navigates away from page
- [ ] Finish works with empty note field
- [ ] Finish works after typing in note field

**Music:**
- [ ] Music button visible in header on ALL 5 steps
- [ ] Music button shows current mode when active ("Chant ♪" / "Ambient ♪")
- [ ] Tapping Music on any step opens the music menu
- [ ] Music continues playing when moving between steps

**Pray step:**
- [ ] Artwork image visible on Pray step
- [ ] "Traditional Prayer" drawer present below the prayer prompt, collapsed by default
- [ ] Tapping "Traditional Prayer" expands the drawer
- [ ] Prayer text shows in Cormorant Garamond italic
- [ ] Fallback prayer shows when `artwork.traditionalPrayer` is empty

**Go Deeper carousel:**
- [ ] Expanded Go Deeper shows ONE reflection at a time (not stacked)
- [ ] Swipe left advances to next reflection
- [ ] Swipe right goes to previous reflection
- [ ] Dot indicators show correct position
- [ ] Dots use gold pill (active) + white circle (inactive) style
- [ ] Carousel resets to first item when collapsed and re-opened
- [ ] Works in Journey Day steps AND Visio Divina

**Progress bar:**
- [ ] Top progress bar on Journey Day steps has breathing room (not cramped)
- [ ] Dot style matches between Journey Day and Visio Divina

**Sanity:**
- [ ] `npx sanity deploy` ran successfully
- [ ] "Traditional Prayer" field appears on content items in Studio
- [ ] "Go Deeper: Tradition Reflections" array field appears on content items in Studio
- [ ] Existing content items are unaffected (new fields are optional, empty by default)

**Build:**
- [ ] `npm run build` passes clean
- [ ] Deploy to Vercel and test on mobile

## Commit message when done
`feat: Visio Divina carousel Go Deeper, correct step order, Finish fix, Music on all steps, Pray step image + prayer drawer, Sanity schema updates`
