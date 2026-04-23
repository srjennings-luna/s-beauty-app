# KALLOS Content Rules

These rules apply to all content writing sessions for KALLOS — journeys, Pause & Ponder, and feast days.

## Content Selection Rules

**These apply before any content item is proposed or accepted.**

**1. Check the usage log first — mandatory.** Before suggesting any artwork, artist, thinker, music track, philosophy quote, or scripture, check `KALLOS-Content-Usage-Log.html`. Flag exact duplicates. Flag same-artist, same-tradition, or same-period as potential duplicates even if the specific work differs. If the log is out of date, update it before proceeding.

**2. Ask about existing journeys before proposing content.** When starting any content work, ask: "What journeys already exist that touch this theme or use this artist/thinker?" Do not assume the current doc is the full picture.

**3. Flag similarity before proceeding.** If a proposed content item resembles something already in use — by artist, tradition, period, or emotional register — say so: "This feels similar to [X] in [Y journey] because [reason]. Intentional, or should we look elsewhere?" Claude may be wrong. The point is to surface it.

**4. Content type diversity is enforced, not aspirational.** KALLOS has 8 content types. Sacred art and thinkers are two of them. Before finalizing any day, ask: have we considered landscape, food/wine, math/science, photography, literature, or music-as-content? If all choices cluster in sacred art and thinkers, flag it. Same rule applies to music: have we considered ambient, folk, jazz, world music, or contemporary tracks? If all music suggestions are chant and classical, flag it.

**5. Pictorialist photography is an underused content type that belongs in KALLOS.** The core principle: a photograph should be *made*, not just *taken*. Pictorialism (c. 1845-1945) shows ordinary subjects with the same intentionality and reverence as sacred painting: soft focus, tonal richness, emotional depth, without announcing itself as religious. Key photographers (all public domain pre-1928): Julia Margaret Cameron (*Prayer*, 1866), Alfred Stieglitz, Edward Steichen, Henry Peach Robinson, Peter Henry Emerson. Reference: George Eastman House exhibition "Truth/Beauty: Pictorialism and the Photograph as Art, 1845-1945." Before defaulting to another painting, ask: is there a pictorialist photograph that carries this day's quality?

## Art and Music Are a Single Content Decision

The art and music for each journey day are not selected separately. They are a pairing — one content decision, not two. The art alone is less than. The music alone is less than. Together they create the full experience the copy is built to carry. When selecting content for any day, find the pair. Do not lock the art and then hunt for music to fit it. Find what works as a unit.

This applies to content selection order: propose art and music together, not sequentially.

## Audio (Auditio) Selection Rules

- **Target length: 3-5 minutes.** Journey day audio plays during a contemplative step, not a concert. Longer pieces (10+ minutes) can still be used — trim to the most evocative section using ffmpeg. Claude can do this: download the recording, trim to the right time range, export as MP3. No separate tool needed.
- Music should match the story and emotional arc of the day, not necessarily the historical period of the artwork
- Option A vs Option B must be genuinely different: different sound, different genre, different mood. Never two similar tracks as options.
- Must be free to download with no copyright restrictions (Pixabay, Musopen, Free Music Archive, Internet Archive)
- MP3 preferred
- For multi-day journeys: audio across all days should work together like a playlist — curated and intentional as a sequence, not just individually appropriate

## Content Preservation

Never delete rewrites. Keep the original in a collapsed/hidden block with a label noting when it was replaced and why.

## Voice Rules

- Lead with a story, not a lecture. C.S. Lewis style: invite the user to discover, don't tell them what to think.
- **C.S. Lewis is an internal register test, not a name to announce to the audience.** "Would Lewis say this?" is the editorial self-check — specific over general, story before concept, never lectures. Lewis does not appear in user-facing copy unless he IS the content item (e.g., a Thinker day about Lewis himself).
- Start opening text with a person, a scene, a specific moment — never a thesis statement
- **Opening text length follows content, not a target.** One short scene is right for some days. A full myth story is right for others. The test is whether the content earns the length, not whether the length matches a rule. When Myth Became Fact Day 1 opens with a full myth story — that length is correct.
- Every curator note opens with one surprising, specific, shareable fact (the dinner-table test)
- No em dashes (telltale AI text)
- Banned words: "journey" (for the experience), "sacred," "profound," "transformative," "spiritual practice," "invitation to...," "encounter with the divine," "nourish your soul"
- No first person. No app-speak.
- Assume no one knows the content. Explain symbolism inline every time.

## Quote and Attribution Rules

- **No invented quotes.** Never attribute words to someone who did not say them — not even plausible-sounding ones.
- **Paraphrase is allowed only if:** (a) the original quote is real and verifiable, (b) the meaning is not changed, and (c) it is labeled as a paraphrase or summary, not presented in quotation marks as a direct quote.
- **"(paraphrased)" is a red flag.** If a quote needs to be labeled paraphrased in published copy, it should not appear as a quote. Either find the real quote, or summarize it in prose without quotation marks.
- When in doubt, cite the source document (book, speech, interview) so it can be verified.

## Cross-Reference Rule

**When editing any sentence, verify impact on all other fields before saving.** A sentence rarely exists in isolation. Check: does another field reference this fact, date, name, or idea? Does removing it leave a reference hanging? Does changing it contradict something downstream? The Melencolia I/II case is the pattern: removing "he never made Melencolia II" from the curator note left "In 1514, the same year he made Melencolia I, his mother died" without the context that gave the "I" its meaning. Before any edit is confirmed, read the other fields with the change in mind.

## Specificity Rules

- **Never use vague references.** "A monk in the 13th century" is not acceptable if you can name the monk. Name the person, or give enough context that the reader can understand without needing to know who you mean. Vague references ask for trust that hasn't been built yet.
- **No absolute superlatives without sourcing.** "He was the greatest philosopher of the medieval world" is a claim that needs backup. Use "considered by many to be" or "among the most influential" unless you can cite who made the claim and when.
- **Fact-check all time and duration claims.** "He spent 40 years on this question" — verify this before it goes in. If it's wrong, it breaks trust across the whole piece.
- **No jargon or obscure references without inline explanation.** Users will not know what a kestrel is. If using a specific or technical term (bird species, architectural term, Latin phrase), define it or replace it with a term users will immediately understand. "A hawk" is better than "a kestrel" if the distinction doesn't add meaning for the user.

## Copy Length and Text-to-Speech

The app has text-to-speech. Users can listen rather than read. This changes the length constraint for body copy fields.

**Short fields (keep tight regardless of TTS):**
- Opening Text: visual landing, rendered before audio starts. One scene, one turn, stop.
- Connect Thread: a thread, not a paragraph. 2–3 sentences.
- Encounter Guidance: one sentence.

**Fields that can now breathe (TTS removes the wall-of-text problem):**
- Curator Note: can carry a full story if the story earns it. The dinner-table test still applies — it must be surprising and specific — but length is no longer the constraint.
- Encounter Note / Look Closer: can develop; 3–5 sentences is fine.
- Context / Look Closer (collapsible): can be fuller background.
- Tradition Reflections: can carry more texture — biographical detail, a second voice beat — as long as each reflection has one clear point and doesn't repeat another field.

**The rule that does not change:** every field still has one job. TTS gives more room to do that job well; it does not license repetition or padding.

**TTS workflow:** TTS audio is created during Sanity entry, field by field. Every field you enter is also the TTS script. Read each field aloud before confirming the entry. If it sounds wrong when spoken, fix it before moving on.

**ElevenLabs pacing controls:**
- Comma: natural breath beat. Use for a short pause mid-sentence.
- Em dash (—): medium pause, slightly shorter than a period. Also adjusts tone — less final than a period, more of a held beat. **Approved for TTS audio fields only.** Em dashes are banned in visible copy (AI-text tell) but are a valid pacing tool when Sheri is editing audio scripts. Never use in fields the user reads.
- Ellipsis (...): trailing pause with trailing-off quality. Longer than a comma but softer. Avoid if the copy needs to land firmly — use a period instead.
- Period: full stop. Longest, most final pause. Use when the sentence needs to land and close.
- SSML break tag: precise control. `<break time="300ms"/>` inserts an exact pause. Use when neither a comma nor an ellipsis gives the right weight (e.g., a two-word phrase that needs a beat after it without trailing off).

**ElevenLabs pronunciation fixes (confirmed in v2):**
- "blessed" → reads as "bless-ed" (two syllables). Replace with "blest" in audio fields.
- "Jesus's" → reads as "Jesuses". Use "Jesus'" (no second s) in audio fields.

**When to pause — the principle behind the punctuation:**

Punctuation paces both the reading eye and the listening ear. The question is not which mark to use — it is whether this moment needs a beat before moving on.

Pause after a short sentence that carries weight. "He never made Melencolia II." is complete. Don't soften it with a comma into the next thought.

Pause inside a long sentence when detail is stacking. "Imagine prisoners who have been chained since birth facing a wall, watching shadows cast by a fire burning behind them, shadows of objects carried past by people they cannot see, or the people who pass along that walkway carrying figures of animals and men." Read it aloud. The listener gets lost before the sentence ends. A comma after "cannot see" gives them back their footing.

Pause before a shift in register. "You can follow beauty. You can follow truth. Goodness works differently." The third sentence changes direction. It needs its own space to land before the story begins.

Pause after a turn. "That is what goodness actually is. Not an achievement. A recognition." Each fragment is doing its own work. Run them together and none of them land.

The test: read the passage aloud slowly. Where you naturally want to breathe, the copy should give you permission to breathe. If the punctuation doesn't match the breath, fix the punctuation.

## Field-by-Field Rules — The Most Important Section

Every field has a specific job. **Fields must not repeat each other's work.** This is the most common failure mode — re-explaining the opening text in every subsequent field.

The major "turn" or connection lands exactly **once**, in the field where it hits hardest. If it appears in two fields, cut it from the weaker one.

| Field | Its One Job | What Does Not Belong Here |
|-------|-------------|--------------------------|
| **Opening Text** | Tell the myth or story fully. Start in a scene. End on the major turn if it belongs here. | Significance claims. Theology. Explaining what the story means. |
| **Curator Note** | One surprising fact about the artwork or artist. End on the unexpected detail and stop. | Retelling the opening text. Explaining what the fact means. |
| **Brief Description** | Describe what you see in the image. 2-3 sentences. | The hook. Significance. Connections to the journey theme. |
| **Context** | Background that deepens the encounter — historical, cultural, theological, whatever serves the day. | Anything already told in the opening text or curator note. Anything another field will say better. |
| **Encounter Note** | 2-3 sentences. Point at one specific thing. Give a fact that lets them feel a connection without being told what to feel. | Explaining the significance. Restating the opening text. |
| **Encounter Guidance** | One sentence. Tell the user exactly where to look. | Explanation. More than one instruction. |
| **Lectio Connection Note** | Where the major "turn" lands if held back from the opening text. Short. Let the scripture speak. | Over-explanation. Connections already made in another field. |
| **Reflect** | Single personal question tied to the emotional core. Short and to the point — the simpler the better. | Theological framing. Restating the hook as a question. Long or multi-part questions. |
| **Connect Thread** | 2-3 sentences bridging to the next day. Story-first. | Summarizing what just happened. Explaining why today mattered. |

**Connect Thread — what it is and what it is not:**

The Connect Thread carries the journey arc forward, not the artwork backward. It is about where the user is going next in the philosophical or emotional progression — not about the content item they just encountered.

The failure mode: writing a Connect Thread that is about the day's artwork or artist. "Cameron spent her life following the feeling that ordinary things were carrying more than they knew how to say. Four centuries earlier, a German engraver named Albrecht Dürer had the same feeling. He drew it." — this makes the connection between two artists, not between two stages of the arc. It belongs nowhere.

The working version of the same day: "Every beautiful thing is pointing at something. Tomorrow, find out what Augustine of Hippo discovered about where it points." — this carries the arc (beauty points toward truth), names the next step specifically, and creates a reason to continue. The artwork is not mentioned.

The test: could you swap the Connect Thread from one day into any other day without it reading wrong? If yes, it is not doing its job. A Connect Thread should only work for the specific arc move it is bridging.

For multi-day journeys: the Connect Threads across all days should read like a sequence. Each one advances the same through-line. Read them together before finalizing any single one.

**The repetition test:** Read all fields in sequence. Every time the same beat appears twice, cut it from the weaker field. A connection that lands four times lands zero times.

**The read-through test (for content repeat):**

Before finalizing any day, read all fields in sequence as the user will encounter them: Opening Text → Brief Description → Context → Encounter Note → Encounter Guidance → Lectio → Reflect → Connect Thread.

At each field, ask: does the reader already know this? If a fact, image detail, or argument has appeared in any earlier field, it must not appear again unless it is doing new work — arriving at a new angle, a new application, a new emotional register. Restating is not deepening.

The most common repeat offenders: Encounter Note re-explaining what Context established. Connect Thread summarizing what just happened instead of bridging forward. Curator Note retelling the Opening Text.

## The Context Field Standard

The Context field looks like "background information" so it defaults to art history — movement names, technique descriptions, exhibition records, museum collections. This is the museum label failure mode and it is the most common error in KALLOS content writing.

**The benchmark is the Myth Journey Day 1 Context (Eleusinian Mysteries).** That text drops the reader into an ancient world: rites conducted over nine days, the best-kept secret of the ancient world, Cicero's quote, the Church Fathers wrestling with what the pagan rites meant. By the time the reader reaches the artwork, they feel they have entered something real and alive. Every BTG and subsequent journey Context should be written to that standard.

**The museum label test:** Read the Context field aloud. If it sounds like a museum placard, a Wikipedia article, or an art history survey chapter, rewrite it. If it reads like a world the reader has entered, it passes.

**What Context must do:**
- Give the reader the world the artwork came from: cultural, religious, historical, philosophical
- Name what was at stake when this was created — the argument, the crisis, the question
- Connect to the day's theme without over-explaining the connection (let the reader arrive at it)

**What Context must not do:**
- Summarize technique or medium (unless the technique IS the theological argument — Cameron's blur is an exception because her refusal to correct blur was itself a philosophical claim about beauty)
- List museum provenance or collection information (this belongs in image sourcing notes only)
- Read like an encyclopedia entry or art history survey

**Important caveat:** These are defaults, not absolutes. The right approach for a given journey day is Sheri's call only. Some journeys or content types may call for a different register. Journey type categories are being developed — they are not yet named or defined. Until that framework exists, the Myth Journey standard applies unless there is a specific documented reason to depart from it.

## Lectio Pairing Standard

- Philosophy slot: one-liner pre-Christian thinker/writer. Modern thinkers (Tolkien, Lewis) in the philosophy slot violates this rule.
- Scripture slot: RSV-2CE only

## Reference Documents

- Master context: `KALLOS-Cowork-Briefing.html`
- Journey writing guide: `KALLOS-Content-Guide-7Day-Journey.html`
- P&P writing guide: `KALLOS-Content-Guide-Pause-Ponder.html`
- Active journey: `KALLOS-MythJourney-v3.html`
- Journey arc planning: `KALLOS-Myth-Journey-Arc.html`
- Content usage log: `KALLOS-Content-Usage-Log.html`
