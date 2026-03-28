# KALLOS — Visio Divina Bug Fixes & UX Updates

Read this fully before starting. These are bug fixes + UX improvements to the Visio Divina experience (`/pray/[artworkId]`). Work through them in order. `npm run build` after each fix. Commit after each fix.

---

## Context: Current Visio Divina Step Order (WRONG)

Current in code:
1. Gaze
2. Reflect
3. Pray
4. Contemplate
5. Action

Correct order:
1. Gaze
2. Reflect
3. Contemplate
4. Pray
5. Action

---

## Fix 1 — CRITICAL: Finish button does nothing on Action step

**What's happening:** On the final ACTION step (step 5), tapping the "Finish" button does nothing. The user is trapped on the page.

**Also:** The text input on the Action step is behaving as required — it shouldn't be. It's labeled "Optional" but the Finish button won't fire without input. Make the text field genuinely optional — Finish should work whether or not anything is typed.

**Expected behavior after fix:**
- Finish button closes the Visio Divina modal/overlay and navigates back to wherever the user came from (the route that launched `/pray/[artworkId]`)
- If the user typed something in the optional text field, save it to localStorage as a keepsake note
- If the field is empty, Finish still works fine

Find the Action step component and fix the onFinish/onComplete handler. Check if there's a missing navigation call, a broken condition, or an unresolved Promise.

---

## Fix 2 — Music button missing on steps 2, 3, 4

**What's happening:** The "Music" link/button in the top-right of the header is visible on:
- ✓ Step 1 (Gaze) — header shows "1 of 5 · Gaze" + "Music" top right
- ✗ Step 2 (Reflect) — no header, no Music link
- ✗ Step 3 (Pray) — no Music link
- ✗ Step 4 (Contemplate) — no Music link
- ✓ Step 5 (Action) — header shows "5 of 5 · Action" + "Music" top right

Music should be accessible on ALL 5 steps. Find how the Music button is conditionally rendered and make it consistent across all steps.

---

## Fix 3 — Swap step order: Contemplate before Pray

Change the step order from:
`Gaze → Reflect → Pray → Contemplate → Action`

To:
`Gaze → Reflect → Contemplate → Pray → Action`

This is the correct Visio Divina sequence: you contemplate (sit in silence with the image) before you pray (respond to God). Update whatever array or config defines the step order. All step labels, progress indicators, and navigation should update automatically once the order is corrected.

---

## Fix 4 — Pray step: restore image + add Traditional Prayer drawer

**Two things needed on the Pray step:**

### 4a. Restore the image
The Pray step currently shows only a scripture quote on a bare background — the artwork image disappears. The whole point of Visio Divina is praying *with* the image. The image should appear on the Pray step, the same way it appears on the Reflect step (image at top, content below, scrollable).

### 4b. Add "Traditional Prayer" expandable drawer
The "Go Deeper" expandable drawer at the bottom of every step already works perfectly. Add a second expandable drawer on the **Pray step only**, positioned above "Go Deeper," labeled:

```
Traditional Prayer        [chevron down]
```

When expanded, it shows a traditional Catholic prayer text. For now, use this placeholder prayer (we'll replace it with Sanity-driven content in Phase 2):

```
Lord, as I look upon this image, I am reminded of your glory made visible.
Open the eyes of my heart. Let what I see lead me beyond what I can see.

Glory be to the Father, and to the Son, and to the Holy Spirit.
As it was in the beginning, is now, and ever shall be,
world without end. Amen.
```

Style: Same expandable drawer pattern as Go Deeper. Dark background, Cormorant Garamond italic for the prayer text, gold accent for the label.

This drawer is **opt-in** — the user taps to expand it. It does not auto-open.

---

## Fix 5 — Top progress bar: add buffer space on Journey Day steps

The rectangular progress indicator on Journey Day modal steps (ENCOUNTER, REFLECT, CONNECT, GO DEEPER) sits too tight against the header above it. Add at least 12–16px of top margin/padding above the progress bar so it has breathing room.

---

## Fix 6 — Progress bar: unify design across Journey Day and Visio Divina

Currently there are two different progress indicator designs:
- Journey Day modal: Rectangular colored blocks at top of screen
- Visio Divina: Circular dots at bottom of screen

These should use the same visual language.

**Decision: use the circular dot style (Visio Divina style) for both**, but keep Journey Day progress at the **top** of the screen (not the bottom). Update Journey Day steps to use circular dots styled consistently with Visio Divina dots.

Consistent spec:
- Active dot: Gold (#C19B5F), slightly wider pill shape (like a stretched dot — width: 20px, height: 6px, border-radius: 3px)
- Inactive dot: White at 35% opacity, 6px circle
- Position: Centered, same placement in both flows

---

## Testing Checklist

After all fixes:
- [ ] Finish button closes the modal from a fresh Visio Divina session
- [ ] Finish works with no text in the optional field
- [ ] Finish works with text in the optional field
- [ ] Music button visible on all 5 steps
- [ ] Music toggles correctly on every step (not just 1 and 5)
- [ ] Step order reads: Gaze → Reflect → Contemplate → Pray → Action
- [ ] Pray step shows the artwork image
- [ ] Traditional Prayer drawer appears on Pray step, collapsed by default
- [ ] Traditional Prayer drawer expands/collapses cleanly
- [ ] Go Deeper still works on all steps
- [ ] Progress bar has breathing room (not cramped under header)
- [ ] Progress dots look consistent between Journey Day and Visio Divina
- [ ] `npm run build` passes clean
- [ ] Deploy to Vercel and test on mobile

## Commit message when done
`fix: Visio Divina step order, Finish button, Music visibility, Pray step image + prayer drawer, progress bar unification`
