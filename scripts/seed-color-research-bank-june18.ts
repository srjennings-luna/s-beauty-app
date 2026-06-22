/**
 * Contueri, seed the color + symbolism research bank as a planningItem.
 *
 * Source: Cowork session June 18, 2026, using the Standing Research Prompt
 * (broadened scope: medieval through 1600s, color + symbolism). Two turns
 * of research produced 12 distinct "modern eye misses" angles under a
 * shared meta-thesis: "a period viewer read these paintings the way we
 * read text; we now walk past most of the message."
 *
 * This script captures the bank as a single umbrella planningItem
 * (stream: exploring, status: researching) so individual angles can be
 * promoted to their own P&P or Journey planningItems later when one
 * matures into a piece. Mummy brown is parked in claudeNotes as
 * off-register for Contueri's voice.
 *
 * Em dashes are stripped at write time per the standing rule.
 *
 * Usage:
 *   npx tsx scripts/seed-color-research-bank-june18.ts              DRY RUN
 *   npx tsx scripts/seed-color-research-bank-june18.ts --apply      write
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const APPLY = process.argv.includes('--apply')

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const raw of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (process.env[key] === undefined) process.env[key] = val
  }
}
loadEnvLocal()

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
})

let emDashCount = 0
function stripEmDashes(s: string): string {
  if (!s) return s
  const matches = s.match(/—/g)
  if (matches) emDashCount += matches.length
  return s.replace(/\s*—\s*/g, ', ')
}

const DOC_ID = 'planning-color-symbolism-research-bank-june18-2026'

const WORKING_TITLE = 'Color and symbolism, medieval to 1600s, research bank'

const CENTRAL_IDEA =
  'A period viewer read these paintings the way we read text. The modern eye walks past most of the message.'

const SUBJECT_NOTES = `Thirteen angles surfaced June 18, 2026 (Cowork, two-turn research). Each is a candidate hook + context for a future P&P or Journey day. Each "modern eye misses" thread sits under the meta-thesis above. Mummy brown was retired (off-register; see claudeNotes).

==========================================================
PART A. NARRATIVE SUMMARIES (the field, in prose)
==========================================================

1. ULTRAMARINE ITEMIZED IN COMMISSION CONTRACTS. Lapis lazuli hauled out of Afghanistan ran dearer than gold by weight, so contracts named grade and quantity of ultramarine as a separate line item. Putting it on the Virgin's mantle told viewers what the patron had spent. Devotion was priced.

2. MARY'S BLUE REPLACED IMPERIAL PURPLE AFTER 431. In early Byzantine images Mary wears purple, the dye reserved for emperors. After the Council of Ephesus in 431 named her Queen of Heaven, blue became the Christian heir to imperial purple. The color was a statement about rank, not a costume choice.

3. BLACK WAS THE LOUDEST COLOR IN THE ROOM. A deep, even, non-fading black was the hardest dye to achieve and the most expensive to buy, propped up by a Spanish monopoly on logwood. The sober black of Reformation-era merchants was a display of wealth disguised as restraint.

4. ALBERTI, 1435, TOLD PAINTERS TO STOP USING REAL GOLD. "There is more admiration and praise for the painter who imitates the rays of gold with colours." Prestige was meant to shift from costly material to the skill of the hand. A whole revolution in what art was FOR sits in that one sentence.

5. GREEN'S CHEMISTRY AND MORALITY WERE THE SAME STORY. Green dyes and pigments genuinely faded and browned because they could not be fixed, so green came to stand for inconstancy, young love, fools, and traitors. Also tagged the devil's color and the color of poison. The unstable pigment and the unstable meaning were one story.

6. DISEGNO VS COLORE. The Florentine school held that a painting's worth lived in design and draftsmanship, "art as a moral geometry," while color was the seductive Venetian surface laid on top. To one serious strand of Renaissance thinking, line was virtue and intellect; color was the almost morally suspect element.

7. NETHERLANDISH DISGUISED SYMBOLISM. In 15th-century Netherlandish painting almost nothing in the room is innocent. The single lit candle reads as the eye of God, the dog as fidelity, the shoes set aside as standing on holy ground, the oranges as both costly luxury and lost paradise. Erwin Panofsky called it "disguised symbolism." Each ordinary household object carries a doctrine.

8. THE GOLDFINCH HIDES THE PASSION IN THE CRADLE. The little goldfinch tucked into hundreds of Madonna-and-Child paintings is a Passion symbol. Legend held the bird got its red face flecks pulling a thorn from Christ's brow, and it feeds on thistle seeds. A bird in the Christ child's hand quietly puts the cross inside the cradle.

9. HOLBEIN HID A SKULL IN PLAIN SIGHT, 1533. *The Ambassadors* has a smeared diagonal blur across the foreground that only resolves into a human skull when viewed from the lower right. Two men at the height of wealth and learning, with death stretched across the floor in front of them, invisible until you stand in the one spot that reveals it.

10. SMALT AND COPPER-GREEN DECAY: WE ARE NOT SEEING WHAT WAS PAINTED. The Virgin's robe in Tintoretto's *Madonna of the Stars* and the sky in Veronese's *Four Allegories of Love* were painted brilliant blue using smalt, a cobalt-glass pigment that chemically decays. They have shifted to dull brown. Copper greens did the same. We routinely mistake a painting's decay for its intent.

11. INDIGO WAS BANNED AS "THE DEVIL'S DYE." When cheap Indian indigo arrived in Europe by sea in the 16th century, it threatened the homegrown woad industry. The defense was prohibition: in 1577 the German authorities banned indigo as "that pernicious, deceitful and corrosive substance, the Devil's dye," reissuing the ban in 1594 and 1603. France made its use a capital offense in 1609. Dyers ignored all of it and mixed the two anyway.

12. THE STANDARD LITURGICAL COLORS ARE YOUNGER THAN THE REFORMATION. We assume the white-red-green-violet-black sequence is ancient and fixed. It was only locked in for the whole Roman Church by Pius V's missal in 1570. Before that, regional uses varied: the English Use of Sarum counted blue among its primary liturgical colors and switched to unbleached cloth in Lent. The standard color calendar was being hardened at the exact moment the Reformation was tearing color out of churches elsewhere.

13. WHITEWASH THAT PRESERVED WHAT IT ERASED. The English Reformation limewash of medieval wall paintings (Edward VI, 1548-1550) was meant to erase color from English churches. The whitewash sealed and preserved many of the very paintings it was meant to destroy; restorers in the 19th-20th centuries found whole Doom cycles intact under the lime. Destruction can be conservation in disguise.

==========================================================
PART B. ANGLE / HYPOTHETICAL THESIS TABLE
(Theses are hypothetical, to help Sheri choose. Real thesis
locks after Sheri picks and Cowork deep-researches.)
==========================================================

#  | ANGLE                                              | HYPOTHETICAL THESIS
---|----------------------------------------------------|---------------------------------------
1  | Ultramarine priced in the contract                 | The most expensive substance on earth was reserved for one figure. Cost was devotion made visible; the patron's faith could be read in the price of the paint.
2  | Mary's robe shifts from purple to blue (431)       | What the Church came to believe about Mary, it said in pigment before it said in words. A change of color was a change of doctrine you could see.
3  | Black as expensive sobriety                        | Restraint can be its own kind of display. The eye that reads only modesty misses the wealth speaking quietly underneath.
4  | Alberti tells painters to drop real gold           | There was a moment when worth moved from the material to the maker. Beauty stopped being something you bought and became something a human hand could make.
5  | Green, unstable in chemistry and meaning           | A color's chemistry and its morality were the same story. The age trusted what endured and distrusted what would not hold.
6  | Disegno versus colore                              | A whole age argued over whether color was the soul of a painting or its temptation. The question was really about whether beauty can be trusted.
7  | Disguised symbolism in the room                    | Nothing in the painting was decoration. A viewer read the room the way we read a sentence, and we now walk past the whole message.
8  | The goldfinch in the Christ child's hand           | Painters hid the cross inside the cradle. The joy of the Nativity was always painted by people who knew how the story ends.
9  | Holbein's hidden skull                             | The painting tells the truth only when you stand where almost no one stands. Death was set in front of the proud in the one place they would not look.
10 | Smalt and copper greens decaying                   | We mistake a painting's ruin for its intent. What we praise as a master's muted restraint is often just time.
11 | Whitewash that preserved what it erased            | The attempt to wipe out beauty is what saved it. Color went into hiding under the whitewash and waited four hundred years.
12 | Liturgical colors fixed only in 1570               | The color code we assume is ancient was being locked down at the very moment color was being torn out of churches elsewhere.
13 | The "Devil's dye" indigo bans                      | People legislated, moralized, and went to war over a single color. Color was never trivial; treating it as mere taste is the modern mistake.

==========================================================
PART C. META-PATTERN: FOUR FAMILIES THE 13 ANGLES CLUSTER INTO
==========================================================

FAMILY 1: "Color was an argument, not decoration"  [SHERI: PRIORITY, next to deep-research, June 18]
   Rows: 5 (green chemistry=morality) · 7 (disguised symbolism) · 8 (goldfinch) · 9 (Holbein skull) · 12 (liturgical colors 1570) · 13 (Devil's dye indigo)
   Voice register: most natively contemplative. Reads paintings the way you'd read a sentence. Lewis-register comes naturally.
   Six diverse vectors under one thesis (most "argument" in row 7; most "tradition" in row 8; most "moral" in row 9; most "philosophical" in row 5; most "ecclesial" in row 12; most "political" in row 13). Journey-sized if Sheri wants; or any one row anchors a single P&P.

FAMILY 2: "What we see is not what was painted" (misperception)  [SHERI: SAVE FOR LATER, June 18]
   Rows: 10 (smalt + copper-green decay) · 11 (whitewash that preserved)
   Voice register: strongest "modern eye literally misses." Surprise-driven. Reversal stories.

FAMILY 3: "Material economics = devotion made visible"  [SHERI: SIDE NOTE, lower priority, June 18]
   Rows: 1 (ultramarine) · 3 (black) · 6 (disegno vs colore)
   Voice register: intellectual / economic. Needs care to stay Lewis-register; easy to slip into market history.

FAMILY 4: "A shift made visible in pigment" (change over time)  [SHERI: SIDE NOTE, lower priority, June 18]
   Rows: 2 (Mary purple→blue, 431) · 4 (Alberti drops gold, 1435)
   Voice register: cleanest single-fact hooks. Specific dates, specific shifts, specific stakes.

==========================================================
NEXT MOVE (June 18, 2026, after Sheri's family pick)
==========================================================
Sheri picked Family 1 as the next thread to deep-research. Two paths to choose between:

PATH A (Journey-sized): Cowork researches the Family 1 thesis ("Color was an argument, not decoration") as a whole, proposes a 5-7 day Journey arc where each day takes a different row's evidence and the user assembles the meta-thesis across the arc. The Discovery framework fits (overturn the assumption that paintings are "just pictures"). Each day's hook comes from one row; the arc closes on the meta-thesis.

PATH B (P&P-sized): Sheri picks ONE row from Family 1 (row 8 Goldfinch and row 9 Holbein are the strongest standalone Tier-1 candidates for the Inklings test bar; rows 5, 12, 13 are stronger as part of a larger arc; row 7 needs a specific painting chosen first). Cowork deep-researches that row, proposes a thesis with 3-5 evidence points spanning it.

Sheri picks the path next.`

const SOURCE_MATERIAL = `Primary references (all surfaced June 18, 2026):

Mary's blue + purple: Artsy "Why Jesus and Mary Always Wear Red and Blue"; Wikipedia "Marian blue"; Council of Ephesus 431 dating.

Ultramarine economics: TheCollector "Why Artists Reserved the Rarest Pigment for Mary"; Hyperallergic "Lapis Lazuli, A Blue More Precious than Gold".

Black as wealth: "Burgundian Black: Power, Black Clothing, and the Chromatic Politics of Textiles in Renaissance Europe" (open-access scholarly volume).

Alberti 1435: Open University materials on Alberti's *On Painting*.

Green: Pastoureau, *Green: The History of a Color* (Princeton). Project MUSE review.

Disegno vs colore: The Met essay "Venetian Color and Florentine Design"; TheCollector "Colorito vs Disegno".

Netherlandish disguised symbolism: Panofsky, *Early Netherlandish Painting* (Harvard). Smarthistory primer.

Goldfinch iconography: Smarthistory "Raphael, Madonna of the Goldfinch"; Faith and Verse "The Goldfinch".

Holbein anamorphic skull: National Gallery London catalog entry for *The Ambassadors*; Artsy "Decoding the Symbolism in Holbein's The Ambassadors".

Smalt + verdigris decay: Essential Vermeer "Smalt"; National Gallery Veronese catalog; Atlas Obscura "Why Renaissance Paintings Aren't as Green as They Used to Be".

Indigo bans + woad: University of Chicago "The War Between Woad and Indigo".

Liturgical colors: Wikipedia "Liturgical colours"; New Advent Catholic Encyclopedia "Liturgical Colours"; Pius V Missal 1570.

English Reformation limewash: Heritage Calling (Historic England) "The History of Religious Wall Paintings"; Folgerpedia "Idolatry, Icons and Iconoclasm".`

const CLAUDE_NOTES = `Session notes for this research bank (June 18, 2026):

RETIRED (Sheri's call June 18, 2026, will never use):
- "Mummy brown" pigment (literally ground-up Egyptian mummies as a working pigment from the 16th century onward). Strong "modern eye misses" surprise but too dark for Contueri's register. Sheri: "mummy brown is too dark for me so we will never use that." Do not surface in future Cowork color/symbolism research; the register rule (a fact's surprise value does not override Contueri's contemplative register) governs.

POTENTIAL JOURNEY-SIZE ANGLE (not P&P):
- Netherlandish disguised symbolism + the goldfinch + the standing thesis "a period viewer read these paintings the way we read text" may be too big for a single P&P. Candidate for a 5-7 day journey: each day surfaces a different symbol literacy (candle, dog, oranges, goldfinch, anamorphic skull), arc closes on the meta-thesis the user assembles. If promoted, would map to The Discovery framework (overturn a common assumption: the assumption being "paintings are just pictures").

STRONG STANDALONE P&P CANDIDATES (top 4 by Inklings-test bar):
- Alberti 1435 "stop using real gold" (Thinker or Sacred Art) - the revolution in what art is FOR sits in one sentence.
- Council of Ephesus 431 + Mary's blue/purple shift (Sacred Art) - specific date, theological context, the imperial-to-Marian color inheritance.
- Holbein anamorphic skull, 1533 (Sacred Art) - famous-enough to be Tier 1, but the viewing-angle requirement is the lesser-known fact. The four-tier title bar applies.
- Smalt decay (Sacred Art) - we are literally not seeing what was painted. Different kind of "modern eye misses" from the others.

LITURGICAL PRE-FLIGHT NOTES:
- Most candidates are season-agnostic (analyses of painters, periods, pigments). Holbein's *Ambassadors* is dated to 1533 but is not feast-bound. Mary's blue/purple analysis is not feast-bound either; ties to Annunciation/Nativity content but is its own thinker-style piece.
- Council of Ephesus IS October 22 feast in some calendars - but that is not a strong feast in the modern Roman calendar and probably does not block any non-October slot.

NEXT MOVE WHEN SHERI RETURNS TO THIS BANK:
- Sheri picks one angle. Cowork researches it in depth, proposes a thesis + 3-5 evidence points. Sheri locks the thesis. Cowork drafts the JSON.
- Per Meta-Rule 3, the depth-research step should NOT collapse the broader thesis to a single example. If the picked angle is e.g. ultramarine, the context paragraphs should span ultramarine economics, theological signaling, contract specificity, etc. - NOT all be variations of one Madonna painting.

Research bank seeded June 18, 2026, via scripts/seed-color-research-bank-june18.ts.`

type InspirationLink = {
  _key: string
  _type: 'inspirationLink'
  url: string
  kind: string
  label?: string
  note?: string
}

const INSPIRATION_LINKS: InspirationLink[] = [
  {
    _key: 'k01',
    _type: 'inspirationLink',
    url: 'https://www.thecollector.com/artists-used-the-rarest-pigment-for-mary/',
    kind: 'article',
    label: 'TheCollector: Why Artists Reserved the Rarest Pigment for Mary',
    note: 'Ultramarine economics, commission contracts naming the pigment as a line item.',
  },
  {
    _key: 'k02',
    _type: 'inspirationLink',
    url: 'https://hyperallergic.com/lapis-lazuli-a-blue-more-precious-than-gold/',
    kind: 'article',
    label: 'Hyperallergic: Lapis Lazuli, A Blue More Precious than Gold',
    note: 'Companion piece on ultramarine economics + Afghan source.',
  },
  {
    _key: 'k03',
    _type: 'inspirationLink',
    url: 'https://www.artsy.net/article/artsy-editorial-jesus-mary-wear-red-blue-art-history',
    kind: 'article',
    label: 'Artsy: Why Jesus and Mary Always Wear Red and Blue',
    note: 'Mary blue/purple shift; Council of Ephesus 431.',
  },
  {
    _key: 'k04',
    _type: 'inspirationLink',
    url: 'https://en.wikipedia.org/wiki/Marian_blue',
    kind: 'article',
    label: 'Wikipedia: Marian blue',
    note: 'Encyclopedia reference for blue + imperial purple inheritance.',
  },
  {
    _key: 'k05',
    _type: 'inspirationLink',
    url: 'https://burgundianblack.tome.press/chapter/power-black-clothing-and-the-chromatic-politics-of-textiles-in-renaissance-europe/',
    kind: 'book',
    label: 'Burgundian Black: Chromatic Politics of Textiles',
    note: 'Black as the most expensive color; Spanish logwood monopoly.',
  },
  {
    _key: 'k06',
    _type: 'inspirationLink',
    url: 'https://www.open.edu/openlearn/history-the-arts/art-and-visual-culture-medieval-modern/content-section-1.1.6',
    kind: 'article',
    label: 'Open University: Alberti on Painting',
    note: 'Alberti 1435 quote on imitating gold with colors.',
  },
  {
    _key: 'k07',
    _type: 'inspirationLink',
    url: 'https://www.medievalists.net/2024/06/colour-middle-ages/',
    kind: 'article',
    label: 'Medievalists.net: Colour in the Middle Ages',
    note: 'Background on medieval color symbolism + reception.',
  },
  {
    _key: 'k08',
    _type: 'inspirationLink',
    url: 'https://muse.jhu.edu/article/620085',
    kind: 'article',
    label: 'Project MUSE: Pastoureau, Green - The History of a Color (review)',
    note: 'Green chemistry + morality as one story.',
  },
  {
    _key: 'k09',
    _type: 'inspirationLink',
    url: 'https://www.metmuseum.org/essays/venetian-color-and-florentine-design',
    kind: 'article',
    label: 'The Met: Venetian Color and Florentine Design',
    note: 'Disegno vs colore debate.',
  },
  {
    _key: 'k10',
    _type: 'inspirationLink',
    url: 'https://www.thecollector.com/colorito-disegno-art-historical-debate/',
    kind: 'article',
    label: 'TheCollector: Colorito vs Disegno',
    note: 'Companion piece on the design vs color debate.',
  },
  {
    _key: 'k11',
    _type: 'inspirationLink',
    url: 'https://smarthistory.org/raphael-madonna-of-the-goldfinch/',
    kind: 'article',
    label: 'Smarthistory: Raphael, Madonna of the Goldfinch',
    note: 'Goldfinch as Passion symbol in Madonna-and-Child paintings.',
  },
  {
    _key: 'k12',
    _type: 'inspirationLink',
    url: 'https://www.faithandverse.art/the-goldfinch',
    kind: 'article',
    label: 'Faith and Verse: The Goldfinch',
    note: 'Goldfinch legend + Passion symbolism.',
  },
  {
    _key: 'k13',
    _type: 'inspirationLink',
    url: 'https://www.artsy.net/article/artsy-editorial-decoding-symbolism-hans-holbeins-ambassadors',
    kind: 'article',
    label: 'Artsy: Decoding the Symbolism in Holbein\'s The Ambassadors',
    note: 'Holbein anamorphic skull + objects in the painting.',
  },
  {
    _key: 'k14',
    _type: 'inspirationLink',
    url: 'https://www.nationalgallery.org.uk/paintings/hans-holbein-the-younger-the-ambassadors',
    kind: 'artwork',
    label: 'National Gallery London: The Ambassadors',
    note: 'Primary museum source for Holbein 1533.',
  },
  {
    _key: 'k15',
    _type: 'inspirationLink',
    url: 'https://www.essentialvermeer.com/palette/palette_smalt.html',
    kind: 'article',
    label: 'Essential Vermeer: Smalt',
    note: 'Smalt chemistry + decay; primary technical reference.',
  },
  {
    _key: 'k16',
    _type: 'inspirationLink',
    url: 'https://www.nationalgallery.org.uk/paintings/catalogues/penny-2008/four-allegories-of-love',
    kind: 'artwork',
    label: 'National Gallery London: Veronese, Four Allegories of Love',
    note: 'Specific example of smalt decay (sky shifted brown).',
  },
  {
    _key: 'k17',
    _type: 'inspirationLink',
    url: 'https://www.atlasobscura.com/articles/renaissance-verdigris-green-pigment',
    kind: 'article',
    label: 'Atlas Obscura: Why Renaissance Paintings Aren\'t as Green as They Used to Be',
    note: 'Copper-green pigment decay.',
  },
  {
    _key: 'k18',
    _type: 'inspirationLink',
    url: 'https://www.lib.uchicago.edu/collex/exhibits/originsof-color/organic-dyes-and-lakes/war-between-woad-and-indigo/',
    kind: 'article',
    label: 'University of Chicago: The War Between Woad and Indigo',
    note: 'Indigo bans + woad industry defense; 1577 + 1594 + 1603 + 1609 dates.',
  },
  {
    _key: 'k19',
    _type: 'inspirationLink',
    url: 'https://en.wikipedia.org/wiki/Liturgical_colours',
    kind: 'article',
    label: 'Wikipedia: Liturgical colours',
    note: 'Pius V 1570 missal locking the color sequence.',
  },
  {
    _key: 'k20',
    _type: 'inspirationLink',
    url: 'https://www.newadvent.org/cathen/04134a.htm',
    kind: 'article',
    label: 'Catholic Encyclopedia (New Advent): Liturgical Colours',
    note: 'Companion reference on liturgical color history.',
  },
  {
    _key: 'k21',
    _type: 'inspirationLink',
    url: 'https://heritagecalling.com/2025/08/07/the-history-of-religious-wall-paintings-in-england-from-the-middle-ages-to-the-victorian-era/',
    kind: 'article',
    label: 'Heritage Calling (Historic England): Religious Wall Paintings',
    note: 'English Reformation limewash; whitewash preserved what it tried to destroy.',
  },
  {
    _key: 'k22',
    _type: 'inspirationLink',
    url: 'https://folgerpedia.folger.edu/Idolatry:_Icons_and_Iconoclasm',
    kind: 'article',
    label: 'Folgerpedia: Idolatry, Icons and Iconoclasm',
    note: 'Edward VI 1548 + 1550 injunctions on image defacement.',
  },
  {
    _key: 'k23',
    _type: 'inspirationLink',
    url: 'https://hmsc.harvard.edu/online-exhibits/cochineal1/color-power/',
    kind: 'article',
    label: 'Harvard Museums: Cochineal, The Color of Power',
    note: 'Cochineal red as Spain\'s 2nd-largest export from the Americas after silver.',
  },
  {
    _key: 'k24',
    _type: 'inspirationLink',
    url: 'https://roguearthistorian.substack.com/p/when-god-came-through-the-glass',
    kind: 'article',
    label: 'The Rogue Art Historian: When God Came Through the Glass (Suger)',
    note: 'Abbot Suger + medieval theology of stained glass + light as divine.',
  },
]

const FACTS_FOR_ACTIONS: { label: string; owner: string }[] = [
  { label: 'Sheri picks Path A (Family 1 as journey arc) or Path B (one row from Family 1 as a single P&P)', owner: 'sheri' },
  { label: 'After path picked: Cowork deep-research the chosen scope, propose thesis + 3-5 evidence points (no prose yet)', owner: 'cowork' },
  { label: 'If Path A: promote Family 1 to its own journey planningItem with Discovery framework', owner: 'claude' },
  { label: 'Family 2 (smalt decay + whitewash preservation) saved for a future research session', owner: 'sheri' },
]

type ActionItem = {
  _key: string
  _type: 'actionItem'
  item: string
  owner: string
  status: string
}

const ACTION_ITEMS: ActionItem[] = FACTS_FOR_ACTIONS.map((a, idx) => ({
  _key: `a${String(idx + 1).padStart(2, '0')}`,
  _type: 'actionItem',
  item: a.label,
  owner: a.owner,
  status: 'pending',
}))

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}\n`)

  const doc = {
    _id: DOC_ID,
    _type: 'planningItem',
    workingTitle: stripEmDashes(WORKING_TITLE),
    centralIdea: stripEmDashes(CENTRAL_IDEA),
    stream: 'exploring',
    status: 'researching',
    contentType: 'sacred-art',
    targetMonth: 'July 2026',
    subjectNotes: stripEmDashes(SUBJECT_NOTES),
    sourceMaterial: stripEmDashes(SOURCE_MATERIAL),
    claudeNotes: stripEmDashes(CLAUDE_NOTES),
    inspirationLinks: INSPIRATION_LINKS.map((l) => ({
      ...l,
      label: l.label ? stripEmDashes(l.label) : l.label,
      note: l.note ? stripEmDashes(l.note) : l.note,
    })),
    actionItems: ACTION_ITEMS.map((a) => ({
      ...a,
      item: stripEmDashes(a.item),
    })),
  }

  console.log(`--- Planned write ---\n`)
  console.log(`_id:           ${doc._id}`)
  console.log(`workingTitle:  ${doc.workingTitle}`)
  console.log(`centralIdea:   ${doc.centralIdea}`)
  console.log(`stream:        ${doc.stream}`)
  console.log(`status:        ${doc.status}`)
  console.log(`contentType:   ${doc.contentType}`)
  console.log(`targetMonth:   ${doc.targetMonth}`)
  console.log(`subjectNotes:  ${doc.subjectNotes.length} chars`)
  console.log(`sourceMaterial:${doc.sourceMaterial.length} chars`)
  console.log(`claudeNotes:   ${doc.claudeNotes.length} chars`)
  console.log(`inspirationLinks: ${doc.inspirationLinks.length}`)
  console.log(`actionItems:   ${doc.actionItems.length}`)
  console.log()
  console.log(`Em dashes stripped at write time: ${emDashCount}\n`)

  // Pre-flight: check if doc already exists
  const existing = await client.fetch<{_id: string} | null>(
    `*[_id == $id && !(_id in path("drafts.**"))][0]{_id}`,
    {id: DOC_ID},
  )
  if (existing) {
    console.log(`NOTE: planningItem with _id "${DOC_ID}" already exists. createOrReplace will overwrite it.\n`)
  } else {
    console.log(`Will create new planningItem with _id "${DOC_ID}".\n`)
  }

  if (!APPLY) {
    console.log('Dry run complete. Re-run with --apply to write to Sanity.')
    return
  }

  console.log('Writing to Sanity...\n')
  const result = await client.createOrReplace(doc)
  console.log(`  Committed: ${result._id} (rev ${result._rev})`)

  // Verify
  console.log('\nVerifying via GROQ...')
  await new Promise((r) => setTimeout(r, 1500))
  const verify = await client.fetch<{_id: string; workingTitle: string; stream: string; status: string; subjectNotesLen: number; linksCount: number; actionsCount: number} | null>(
    `*[_id == $id && !(_id in path("drafts.**"))][0]{
      _id,
      workingTitle,
      stream,
      status,
      "subjectNotesLen": length(subjectNotes),
      "linksCount": count(inspirationLinks),
      "actionsCount": count(actionItems)
    }`,
    {id: DOC_ID},
  )
  if (verify) {
    console.log(`  ${verify._id}`)
    console.log(`  workingTitle:  ${verify.workingTitle}`)
    console.log(`  stream:        ${verify.stream}`)
    console.log(`  status:        ${verify.status}`)
    console.log(`  subjectNotes:  ${verify.subjectNotesLen} chars`)
    console.log(`  inspirationLinks: ${verify.linksCount}`)
    console.log(`  actionItems:   ${verify.actionsCount}`)
  } else {
    console.log(`  ERROR: doc not found after write.`)
  }
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
