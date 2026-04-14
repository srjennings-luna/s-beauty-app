# KALLOS Content Rules

These rules apply to all content writing sessions for KALLOS — journeys, Pause & Ponder, and feast days.

## Content Selection Rules

**These apply before any content item is proposed or accepted.**

**1. Check the usage log first — mandatory.** Before suggesting any artwork, artist, thinker, music track, philosophy quote, or scripture, check `KALLOS-Content-Usage-Log.html`. Flag exact duplicates. Flag same-artist, same-tradition, or same-period as potential duplicates even if the specific work differs. If the log is out of date, update it before proceeding.

**2. Ask about existing journeys before proposing content.** When starting any content work, ask: "What journeys already exist that touch this theme or use this artist/thinker?" Do not assume the current doc is the full picture.

**3. Flag similarity before proceeding.** If a proposed content item resembles something already in use — by artist, tradition, period, or emotional register — say so: "This feels similar to [X] in [Y journey] because [reason]. Intentional, or should we look elsewhere?" Claude may be wrong. The point is to surface it.

**4. Content type diversity is enforced, not aspirational.** KALLOS has 8 content types. Sacred art and thinkers are two of them. Before finalizing any day, ask: have we considered landscape, food/wine, math/science, photography, literature, or music-as-content? If all choices cluster in sacred art and thinkers, flag it. Same rule applies to music: have we considered ambient, folk, jazz, world music, or contemporary tracks? If all music suggestions are chant and classical, flag it.

**5. Pictorialist photography is an underused content type that belongs in KALLOS.** The core principle: a photograph should be *made*, not just *taken*. Pictorialism (c. 1845-1945) shows ordinary subjects with the same intentionality and reverence as sacred painting: soft focus, tonal richness, emotional depth, without announcing itself as religious. Key photographers (all public domain pre-1928): Julia Margaret Cameron (*Prayer*, 1866), Alfred Stieglitz, Edward Steichen, Henry Peach Robinson, Peter Henry Emerson. Reference: George Eastman House exhibition "Truth/Beauty: Pictorialism and the Photograph as Art, 1845-1945." Before defaulting to another painting, ask: is there a pictorialist photograph that carries this day's quality?

## Audio (Auditio) Selection Rules

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
- Ellipsis (...): trailing pause with trailing-off quality. Longer than a comma but softer. Avoid if the copy needs to land firmly — use a period instead.
- SSML break tag: precise control. `<break time="300ms"/>` inserts an exact pause. Use when neither a comma nor an ellipsis gives the right weight (e.g., a two-word phrase that needs a beat after it without trailing off).

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
| **Reflect** | Single personal question tied to the emotional core. | Theological framing. Restating the hook as a question. |
| **Connect Thread** | 2-3 sentences bridging to the next day. Story-first. | Summarizing what just happened. Explaining why today mattered. |

**The repetition test:** Read all fields in sequence. Every time the same beat appears twice, cut it from the weaker field. A connection that lands four times lands zero times.

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
