# Visio Divina in Other Apps & Resources – Research Summary

Research for adding a Visio Divina prayer/meditation page to the Seeking Beauty app.

---

## What is Visio Divina?

**Visio Divina** (“divine seeing”) is a contemplative prayer practice that uses sacred art as a focus for encountering God—similar to Lectio Divina but with images instead of scripture. It’s used across Catholic, Orthodox, and Protestant traditions.

---

## Common Step Structure (4–5 Steps)

Most resources use a variant of these steps (Latin names vary slightly):

| Step | Name | Typical practice |
|------|------|-------------------|
| 1 | **Visio / Gazing** | Look at the image slowly for 1–2 minutes. Notice colors, people, details. Ask God to open the “eyes of your heart.” |
| 2 | **Meditatio / Meditation** | Look deeper. What moves? What relationships? Where are *you* in the image? What meaning emerges? |
| 3 | **Oratio / Prayer** | Respond to God about what you notice—thanksgiving, intercession, or conversation. |
| 4 | **Contemplatio / Contemplation** | Rest in silence with God; allow God to pray in you beyond words. |
| 5 | **Operatio / Action** (optional) | How will you live out what you received? “How will I live this out?” |

Order is often flexible; some sources present a slightly different sequence (e.g. prayer before deeper look). The idea is: **gaze → reflect → pray → rest → (optionally) act**.

---

## How Others Implement It

### 1. **CatholicTV – Visio Divina: Praying With Art** (video series)

- **Format:** Streaming episodes (Apple TV, Roku, Fire TV, mobile apps).
- **Structure:** Host (Katie Weiss) guides viewers through Visio Divina for **7 pieces of sacred art** (Holy Family themes). Each episode: meditate on a painting → reflect on **scripture** → **reflection questions**.
- **Takeaway:** Pair each image with one scripture passage and a small set of reflection questions; can be replicated as a guided flow (text/audio) in an app.

### 2. **InterVarsity Via Divina – Celtic Way** (web app)

- **Format:** Digital pilgrimage with **guided video** + **audio** + **PDF journal**.
- **Structure:**  
  - **Before you walk:** Guided Visio Divina **video** with one of 8 artworks (Celtic saints).  
  - **While you walk:** Audio-guided outdoor walk.  
  - **After you walk:** **Journal** (interactive PDF) + small group debrief.
- **Takeaway:** Visio Divina as a **prelude** to another practice; **video + journal** are key. An app could offer “before” (Visio Divina with one image) and “after” (simple journal or notes).

### 3. **Behold Visio Divina** (books + in-person)

- **Format:** Art prayer books, workshops, group prayer/discussion (not an app).
- **Steps:** Visio → Meditatio (reflect on scripture) → Oratio (reflection questions) → Contemplatio (rest) → Operatio (action).
- **Takeaway:** They tie **scripture** and **reflection questions** explicitly to each image. Your app already has `scripturePairing` and `reflectionQuestions` per artwork—direct fit for a Visio Divina flow.

### 4. **Prayerbook Art Gallery** (web)

- **Format:** Web page with short written instructions.
- **Steps:** Quiet center / breathe → **Respond with prayer** (thanksgiving/intercession) → **Second, deeper look** (movement, relationships, “where are you in the image?”) → **First look** (examine slowly, 1–2 min, optional jotting).
- **Takeaway:** Order can be “pray first, then look again” or “look, then look again, then pray.” Optional “jot down a few words” suggests **light journaling** in an app.

### 5. **The Young Catholic Woman** (digital PDF)

- **Format:** 124-page PDF: **~100 paintings** + **scripture passages** + **reflections**.
- **Takeaway:** Large catalog of image + scripture + reflection is the core; an app can do the same with your Sanity content and add structure (steps, timers).

### 6. **Hallow** (Catholic prayer app)

- **Format:** App with Lectio Divina, Rosary, Examen, etc. **No dedicated “Visio Divina” product** found; they focus on Lectio and other audio-guided prayer.
- **Takeaway:** Opportunity for Seeking Beauty to differentiate with a **focused Visio Divina experience** using your existing sacred art.

---

## UX Patterns That Show Up

| Pattern | Where seen | Use in Seeking Beauty |
|--------|------------|------------------------|
| **Step-by-step flow** | CatholicTV, Behold, InterVarsity, prayerbookart | One screen (or section) per step: Gaze → Meditate → Pray → Contemplate → (optional) Action. |
| **Timed gazing** | Multiple (“1–2 minutes”) | Optional timer (e.g. 1–2 min) on the “gaze” step; soft chime or “Next” when done. |
| **Scripture with image** | CatholicTV, Behold, Young Catholic Woman | You already have `scripturePairing` per artwork—show verse + reference after or during meditation step. |
| **Reflection questions** | CatholicTV, Behold | You have `reflectionQuestions[]`—show 1–3 per artwork during Meditatio/Oratio. |
| **Guided video/audio** | CatholicTV, InterVarsity | Later: optional short audio “guide” per piece; for v1, text prompts are enough. |
| **Journal / notes** | InterVarsity (PDF), prayerbookart (“jot down”) | Optional “Save a few words” or “Journal” at the end; could be localStorage or Sanity later. |
| **Art selection** | All | User picks one artwork (from episode, Artwalk, or Favorites) then enters the Visio Divina flow for that image. |

---

## Recommendations for Seeking Beauty

1. **Reuse what you have**  
   Each artwork already has `scripturePairing`, `reflectionQuestions`, `historicalSummary`, and `locationType` (scripture vs quote). A Visio Divina “session” can be: one artwork + your existing fields, arranged into the 4–5 steps.

2. **Entry points**  
   - From **Artwork Viewer**: “Pray with this image (Visio Divina)”.  
   - Dedicated **“Pray” or “Visio Divina”** in nav or Home: choose an artwork (from episodes, map, or favorites), then start the flow.

3. **Minimum viable flow**  
   - **Step 1 – Gaze:** Full-screen image, optional 1–2 min timer, short prompt (“Let your eyes rest. Notice what draws you.”).  
   - **Step 2 – Meditate:** Same image + 1–3 reflection questions (from `reflectionQuestions`).  
   - **Step 3 – Pray:** Scripture (for sacred/architecture) or Quote (for others) + prompt (“Respond to God in prayer”).  
   - **Step 4 – Contemplate:** Same image, silence prompt (“Rest in God’s presence. No words needed.”), optional short timer.  
   - **Step 5 (optional) – Action:** One question: “How will you live out what you received?” and optional “Save a note” (localStorage or future backend).

4. **Design**  
   - Full-screen or near full-screen image per step; minimal UI (step indicator, Next/Back, optional timer).  
   - Match existing dark theme and square corners; keep typography (Cormorant for scripture/quote, Montserrat for headings).  
   - Optional soft background music or silence; no autoplay audio required for v1.

5. **Differentiation**  
   - Hallow and others don’t emphasize Visio Divina. Your app already has sacred art + scripture + reflections; a dedicated, step-by-step Visio Divina page would be a clear and on-brand feature.

---

## Sources

- CatholicTV: [Visio Divina: Praying With Art](https://www.catholictv.org/visio-divina.html)  
- InterVarsity Via Divina: [Celtic Way – Visio Divina](https://intervarsity.org/via-divina/celtic-way/visio-divina-art)  
- Behold: [Steps of Visio Divina](https://www.beholdvisiodivina.com/more-resources)  
- Prayerbook Art Gallery: [Visio Divina (Praying with Images)](https://prayerbookart.gallery/visio-divina-praying-with-images/)  
- PB Renewal Center, Patheos, Prayer & Possibilities, Calvin Institute of Worship (steps and descriptions)
