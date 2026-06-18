/**
 * Contueri, seed planningItem records for the four-journey Lewis Space Trilogy arc.
 *
 * Source: ~/Documents/CONTUERI-Journey-Map-ThreeWays-OOTSP.html (June 1, 2026 Cowork doc)
 * Plus 2 concept-level placeholders for Perelandra and That Hideous Strength,
 * which do not yet have day-maps.
 *
 * Idempotent: createOrReplace with deterministic _ids. Re-running is safe.
 *
 * Em-dash strip is applied at write time (not at source) so the Cowork content
 * stays faithful and the rule violations are reportable (count in / count out).
 *
 * Usage:
 *   npx tsx scripts/seed-planning-journeys.ts            DRY RUN (default)
 *   npx tsx scripts/seed-planning-journeys.ts --apply    write to Sanity
 */

import {createClient} from '@sanity/client'
import {readFileSync, existsSync} from 'fs'
import {resolve} from 'path'

const APPLY = process.argv.includes('--apply')
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='))
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : undefined

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  const text = readFileSync(envPath, 'utf8')
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
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

const SOURCE_DOC =
  '~/Documents/CONTUERI-Journey-Map-ThreeWays-OOTSP.html (Cowork journey map, June 1, 2026). ' +
  'Plus ~/Documents/Three-Ways-Reference.html and ~/Documents/Three-Ways-Timeline.html for background.'

type PlanningItem = {
  _id: string
  _type: 'planningItem'
  workingTitle: string
  stream: 'journey'
  status: 'idea'
  journeyArcKey: 'three-ways' | 'ootsp' | 'perelandra' | 'ths'
  contentType?: string
  feastDayAnchor?: string
  subjectNotes: string
  sourceMaterial: string
  claudeNotes?: string
  actionItems: Array<{
    _key: string
    _type: 'actionItem'
    item: string
    owner: 'claude' | 'sheri' | 'cowork'
    status: 'pending'
  }>
}

function dayItem(
  idSlug: string,
  journeyLabel: string,
  journeyArcKey: PlanningItem['journeyArcKey'],
  dayNum: number,
  dayTitle: string,
  way: string,
  contentType: string,
  theme: string,
  lectio: {text: string; cite: string},
  encounter: string,
  context: string,
  lookCloser: string,
  goDeeper: string,
  supportingTypes: string[],
): PlanningItem {
  const workingTitle = `${journeyLabel} · Day ${dayNum} · ${dayTitle}`
  const subjectNotes = [
    `WAY: ${way}`,
    `THEME: ${theme}`,
    ``,
    `LECTIO: "${lectio.text}"`,
    `, ${lectio.cite}`,
    ``,
    `PRIMARY ENCOUNTER: ${encounter}`,
    ``,
    `CONTEXT: ${context}`,
    ``,
    supportingTypes.length
      ? `Supporting content types in the Cowork map: ${supportingTypes.join(', ')}.`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  const claudeNotes = [
    `LOOK CLOSER: ${lookCloser}`,
    ``,
    `GO DEEPER: ${goDeeper}`,
    ``,
    `Note: this planningItem represents one day in a 7-day journey arc. ` +
      `When seeding the live journey, the primary contentType drives the contentItem record; ` +
      `supporting content types are layered via the journeyDay encounter / auditio / goDeeper fields.`,
  ].join('\n')

  return {
    _id: `planning-${idSlug}`,
    _type: 'planningItem',
    workingTitle: stripEmDashes(workingTitle),
    stream: 'journey',
    status: 'idea',
    journeyArcKey,
    contentType,
    subjectNotes: stripEmDashes(subjectNotes),
    sourceMaterial: stripEmDashes(SOURCE_DOC),
    claudeNotes: stripEmDashes(claudeNotes),
    actionItems: [
      {
        _key: `ai-${idSlug}-1`,
        _type: 'actionItem',
        item: stripEmDashes('Source artwork or primary text, verify Lectio quote against primary source'),
        owner: 'claude',
        status: 'pending',
      },
      {
        _key: `ai-${idSlug}-2`,
        _type: 'actionItem',
        item: stripEmDashes('Confirm content type pairing fits the day, decide auditio'),
        owner: 'sheri',
        status: 'pending',
      },
    ],
  }
}

function conceptItem(
  idSlug: string,
  journeyLabel: string,
  journeyArcKey: PlanningItem['journeyArcKey'],
  question: string,
  subjectNotes: string,
  claudeNotes: string,
): PlanningItem {
  return {
    _id: `planning-${idSlug}`,
    _type: 'planningItem',
    workingTitle: stripEmDashes(`${journeyLabel} (concept placeholder)`),
    stream: 'journey',
    status: 'idea',
    journeyArcKey,
    subjectNotes: stripEmDashes(`QUESTION: "${question}"\n\n${subjectNotes}`),
    sourceMaterial: stripEmDashes(SOURCE_DOC),
    claudeNotes: stripEmDashes(claudeNotes),
    actionItems: [
      {
        _key: `ai-${idSlug}-1`,
        _type: 'actionItem',
        item: stripEmDashes('Draft 7-day arc and per-day content map, mirror Cowork format from Journey 1 and 2'),
        owner: 'cowork',
        status: 'pending',
      },
      {
        _key: `ai-${idSlug}-2`,
        _type: 'actionItem',
        item: stripEmDashes('Decide whether Abolition of Man integrates here or stands alone (re Manual Task 90)'),
        owner: 'sheri',
        status: 'pending',
      },
    ],
  }
}

// ──────────────────────────────────────────────────────────────────────────
// JOURNEY 1 : The Way Within (Three Ways as lived arc)
// ──────────────────────────────────────────────────────────────────────────

const threeWays: PlanningItem[] = [
  dayItem(
    'three-ways-day-1',
    'Three Ways',
    'three-ways',
    1,
    'Restlessness',
    'Purgative, Diagnosis',
    'thinker',
    'The journey begins not with a map but with a recognition. Most people treat restlessness as a problem to solve by addition. Augustine names it as orientation: the soul pointing toward its source.',
    {
      text: 'You have made us for yourself, and our heart is restless until it rests in you.',
      cite: 'Augustine, Confessions, Book I (397 AD)',
    },
    'Rembrandt, "Self-Portrait with Two Circles" (~1665-1669). The late self-portrait. Nothing flattering. A man looking at himself without sentiment and continuing to paint. The purgative way begins with self-knowledge, and Rembrandt\'s late self-portraits are among the most honest acts of self-examination in Western art.',
    'Augustine spent nine years as a Manichaean trying to solve the problem of evil through a philosophical system. He tried Neoplatonism next and found it could tell him what was true but not how to live it. The Confessions describes a man who tried every intellectual solution and found that none of them addressed the actual problem, which was not a question but a condition. The word restless in Latin is inquietum, literally "not quiet." The diagnosis is the absence of quiet as the beginning of the journey toward it.',
    'The "two circles" in Rembrandt\'s self-portrait title refers to the two arcs visible on the wall behind him. Nobody knows what they represent. They may be mappamundi, or cosmic diagrams, or simply a canvas he was working on. Their presence behind the aging, steady painter has never been explained.',
    'Augustine, Confessions Book I and Book VIII (the conversion scene in the garden). The journey from diagnosis to turning point in four chapters.',
    ['sacred-art', 'thinker'],
  ),
  dayItem(
    'three-ways-day-2',
    'Three Ways',
    'three-ways',
    2,
    'Silence',
    'Purgative',
    'sacred-art',
    'The purgative way begins not with effort but with subtraction. Silence is not emptiness. It is the clearing that makes hearing possible.',
    {
      text: 'A monk is someone who has separated himself from all things and who is in harmony with all things.',
      cite: 'Evagrius Ponticus, Chapters on Prayer, 124 (4th century)',
    },
    'Zurbarán, "Saint Francis in Meditation" (~1639). A hooded figure in complete stillness. A skull in his hands. No landscape, no architecture, no narrative, only the man and the silence and the object that will not let him pretend. Zurbarán painted this image multiple times. Each version is slightly different but the posture never changes.',
    'Evagrius Ponticus named eight logismoi, troubling thoughts that crowd the soul and prevent clear sight: gluttony, lust, avarice, sadness, anger, acedia, vainglory, pride. These became the Seven Deadly Sins. His point was not moral primarily but perceptual: these thoughts do not just make us worse people, they make us unable to see. The purgative work is clearing these not through willpower but through the discipline of attention. The Desert Fathers went to the Egyptian desert because the familiar was suffocating their perception.',
    'The skull in Zurbarán\'s painting is a memento mori, a reminder of death used as a spiritual practice. Not morbid but clarifying. Benedict\'s Rule includes the instruction: "Keep death daily before your eyes." The skull is not there to disturb. It is there to strip away pretension and bring the attention back to what is actual.',
    'John Climacus, "The Ladder of Divine Ascent," Steps 4-7, on obedience, penitence, remembrance of death, and weeping. The Eastern Orthodox map of the purgative way in its most practical form. Pair with Gregorian chant "In Paradisum" (antiphon for the burial rite).',
    ['sacred-art', 'music'],
  ),
  dayItem(
    'three-ways-day-3',
    'Three Ways',
    'three-ways',
    3,
    'Suffering and Beauty',
    'Purgative, Dark Night',
    'sacred-art',
    'The hardest part of the purgative way is that it does not feel like progress. John of the Cross is precise: what feels like abandonment is often proximity. The Isenheim Altarpiece was painted for a hospital. The patients who looked at it had bodies covered in the same burning sores as Christ\'s body in the painting. This was not coincidental.',
    {
      text: 'The endurance of darkness is preparation for great light.',
      cite: 'John of the Cross, The Dark Night of the Soul (1584)',
    },
    'Grünewald, Isenheim Altarpiece, Crucifixion Panel (1512-1516). The most unsentimental depiction of suffering in Western sacred art. The body is not dignified. The fingers are clawed. The skin is green-grey. The Magdalene collapses. This is a painting that does not look away, and that refusal to look away is itself a theological act.',
    'John of the Cross distinguishes between the active night (what we do to detach: fasting, silence, prayer) and the passive night (what God does to us: the withdrawal of consolation, the experience of absence). The passive night is harder because it cannot be managed. It arrives. His "Dark Night of the Soul" is not a poem about depression, though it has been read that way. It is a map of a specific spiritual condition: the stripping away of every prop the soul has used to feel close to God, so that closeness itself, naked and unassisted, can be the only thing remaining. Hans Urs von Balthasar argued that beauty which bypasses suffering is sentimentality.',
    'The Isenheim Altarpiece is a polyptych, it opens in three stages. The outer panels show the crucifixion. Open it once and you see the Annunciation, the Nativity, and the Resurrection. Open it again and you see the carved figures of Saints Anthony, Augustine, and Jerome with a predella of the Entombment. Patients in the hospital saw the whole sequence. The suffering was the first image, not the last.',
    'Simone Weil, "Love of God and Affliction" (1942). The essay in which Weil argues that affliction, not ordinary suffering but the kind that destroys the soul\'s sense of its own worth, is the point at which God is most directly present. Pair with Bach, St. Matthew Passion, "Erbarme Dich."',
    ['sacred-art', 'music', 'thinker'],
  ),
  dayItem(
    'three-ways-day-4',
    'Three Ways',
    'three-ways',
    4,
    'Light',
    'Illuminative',
    'sacred-art',
    'The illuminative turn. Something shifts. The world does not change. The perceiver does. Caravaggio\'s light in "The Calling of Saint Matthew" has no earthly source. This is not a technical oversight.',
    {
      text: 'Beauty requires three conditions: integrity or completeness, right proportion or harmony, and clarity or radiance.',
      cite: 'Thomas Aquinas, Summa Theologica, I.39.8 (1265-1274)',
    },
    'Caravaggio, "The Calling of Saint Matthew" (1599-1600). A shaft of light enters from the right, following Christ\'s extended hand. Matthew sits at a tax collector\'s table, surrounded by men with money. He looks up. The painting\'s power is in the question it refuses to answer: which figure is Matthew? The man pointing at himself in surprise, or the one with his head down, still counting?',
    'Aquinas\'s three properties of beauty, integritas (wholeness, nothing missing), consonantia (proportion, right relationship between parts), claritas (radiance, the luminosity of a thing when its inner form is perfectly expressed), are the illuminative way applied to aesthetics. A thing is beautiful when you can see what it actually is. Claritas is the key: it names the experience of seeing a thing so clearly that it seems to be lit from within. Pseudo-Dionysius had argued that God is light so intense it appears as darkness to the human mind. Aquinas is the more accessible version of the same insight.',
    'Caravaggio placed this painting in San Luigi dei Francesi, Rome, where it has hung since 1600. The church is often dark. A coin-operated light switch activates illumination for 30 seconds. Tourists photograph it. The painting about a man being called by light is experienced in darkness and glimpsed in a brief, coin-purchased flash. This is not what Caravaggio intended. It is also, accidentally, a very good parable.',
    'Pseudo-Dionysius, "The Divine Names," Chapter 4, on Beauty and Light as names for God. The foundational text of Christian aesthetic theology. Pair with Arvo Pärt, "Spiegel im Spiegel" (1978). CAVEAT per CLAUDE.md: Pärt Spiegel im Spiegel is a contemplative-app cliché, used by every meditation app on the market. Recommend a different Pärt piece (Für Alina, Cantus, or Da pacem Domine) before seeding the live journey.',
    ['sacred-art', 'music', 'thinker'],
  ),
  dayItem(
    'three-ways-day-5',
    'Three Ways',
    'three-ways',
    5,
    'Creation',
    'Illuminative',
    'literature',
    'Bonaventure called them vestigia Dei, the footprints of God in every created thing. Hopkins named the same experience with a different word: inscape. Both are saying that creation is not background. It is a text, and every creature is a word in it.',
    {
      text: 'The world is charged with the grandeur of God. It will flame out, like shining from shook foil.',
      cite: 'Gerard Manley Hopkins, "God\'s Grandeur" (1877)',
    },
    'Hopkins, "God\'s Grandeur" and "Pied Beauty." Two poems from 1877, the year Hopkins ended a seven-year silence he had imposed on himself as a Jesuit novice. He gave himself permission to write again and produced, in a matter of months, some of the most original poems in the English language. These two are the illuminative way in verse: the world as charged, as dappled, as particular, as pointing.',
    'Hopkins coined "inscape" to name something he had experienced but could not find a word for: the distinctive inner design of a particular thing, the quality that makes a kingfisher a kingfisher rather than any other bird, the quality that reveals the maker\'s specific intention. "Instress" is the energy that holds that design in being and communicates it to the perceiver. Hopkins spent years watching things, birds, waves, trees, the sky, trying to catch the moment of inscape revealed. Bonaventure had named the same phenomenon in the 13th century as vestigia Dei.',
    'Hopkins was a Jesuit priest who destroyed all his early poetry on entering the novitiate. He believed a priest should not seek personal recognition. When he finally wrote again, the poems stayed in a drawer for years. His friend Robert Bridges published them posthumously in 1918, nearly 30 years after Hopkins\'s death. Hopkins never saw his own work in print.',
    'Bonaventure, "Itinerarium Mentis in Deum" (The Soul\'s Journey into God), Chapters 1-2, the world as a mirror of God\'s power, wisdom, and goodness. Written in one session on Mount Alverna in 1259. Cowork suggested a landscape pairing: photograph of something particular (single leaf, shaft of light through water, bird in motion). Per Hopkins\' haecceitas: specific, not grand.',
    ['literature', 'landscape', 'thinker'],
  ),
  dayItem(
    'three-ways-day-6',
    'Three Ways',
    'three-ways',
    6,
    'The Cloud',
    'Illuminative / Unitive Threshold',
    'sacred-art',
    'The illuminative way reaches a point where seeing and knowing are no longer sufficient. Teresa of Ávila called it recollection, the soul gathering inward, withdrawing from sensory noise, preparing for something it cannot produce by effort.',
    {
      text: 'Of all other creatures and their works, yes, and of the works of God himself, may a man through grace have full knowing, but of God himself can no man think.',
      cite: 'The Cloud of Unknowing, Anonymous (14th century)',
    },
    'Andrei Rublev, "Trinity" icon (~1411). Three angels seated at a table. The composition is circular, each figure oriented toward the others, no hierarchy of gaze. At the front of the table, an empty space. Traditionally read as the viewer\'s place at the table. The icon is an invitation, not merely an image. Rublev painted it for the Trinity-Sergius Monastery, for a community that had learned to live with silence.',
    'The Cloud of Unknowing was written in Middle English by an anonymous 14th-century monk for a young contemplative. Its argument is simple: God cannot be reached by intellect. Between the soul and everything it knows hangs a cloud of forgetting. Between the soul and God hangs a cloud of unknowing. The only thing that can pierce the second cloud is love, a "blind stirring" of love, not a reasoned decision. This is Pseudo-Dionysius\'s apophatic theology translated into practical instruction.',
    'Rublev\'s Trinity icon contains a small rectangular notch in the front edge of the table, a detail that has puzzled art historians. Some believe it held a mirror, so that the viewer literally saw themselves reflected in the empty space at the table. Whether or not this is true, the effect is the same: the icon positions the viewer as the missing fourth figure in the composition.',
    'Teresa of Ávila, "The Interior Castle," Fourth Mansions, on the prayer of recollection and the prayer of quiet. The first movements of infused contemplation described by the person who best mapped them. Cowork paired Pärt "Tabula Rasa" (1977) here; same Pärt-default caveat applies as Day 4.',
    ['sacred-art', 'literature', 'music'],
  ),
  dayItem(
    'three-ways-day-7',
    'Three Ways',
    'three-ways',
    7,
    'Home',
    'Unitive',
    'sacred-art',
    'The unitive way is not arrival. It is recognition. The Prodigal Son parable maps the whole journey: purgative (the pigsty, "he came to himself"), illuminative (the journey home, beginning to see clearly), unitive (the father running, the feast that has always been there).',
    {
      text: 'If I find in myself a desire which no experience in this world can satisfy, the most probable explanation is that I was made for another world.',
      cite: 'C.S. Lewis, Mere Christianity, Book III (1952)',
    },
    'Rembrandt, "The Return of the Prodigal Son" (~1668). Painted in the last years of his life, after the death of his son Titus. The son kneels. The father\'s hands rest on his shoulders. The left hand is broader, more masculine. The right hand is smaller, more feminine. Rembrandt may have painted the father with both parents\' grief and love. The son\'s face is turned away. We cannot see whether he has stopped weeping.',
    'Lewis\'s Sehnsucht, the inconsolable longing that appears in moments of great beauty and is not satisfied by them, is the unitive way experienced from outside. The ache points. Something in us recognizes what we have not yet reached. Lewis traced this sensation from his own childhood (a toy garden his brother made, the smell of autumn, a line of Norse poetry) and spent the rest of his life asking what it was pointing toward. His conclusion: if the desire is real and no earthly thing satisfies it, the most likely explanation is that it was designed to point beyond earthly things. NOTE per CLAUDE.md editorial rule: "C.S. Lewis is an internal editorial register test, not an audience-facing name." Do NOT name Lewis in the user-facing copy for this day unless the content item is specifically about him.',
    'Henri Nouwen, the Dutch Catholic priest, visited the Hermitage Museum in 1983 and stood in front of this painting for four hours. He later spent several months living at the Hermitage as a scholar-in-residence, returning to the painting daily. His book "The Return of the Prodigal Son" (1992) tracks his movement through the painting from the younger son\'s position, to the older son\'s, to the father\'s. The book itself traces the Three Ways in a single reading.',
    'Augustine, Confessions, Book IX, the vision at Ostia, shared with his mother Monica shortly before her death. The closest Augustine comes to describing the unitive experience directly: a moment of mutual ascent in conversation, touching something eternal, then returning to ordinary speech. He calls it a first fruit, not the thing itself. Cowork paired Dvořák, New World Symphony, 2nd movement (Largo) (1893).',
    ['sacred-art', 'thinker', 'music'],
  ),
]

// ──────────────────────────────────────────────────────────────────────────
// JOURNEY 2 : Out of the Silent Planet (Purgative through fiction)
// ──────────────────────────────────────────────────────────────────────────

const ootsp: PlanningItem[] = [
  dayItem(
    'ootsp-day-1',
    'OOTSP',
    'ootsp',
    1,
    'The Wrong Picture of Space',
    'Purgative, The First Stripping',
    'literature',
    'The purgative journey begins before Ransom leaves Earth. Lewis\'s first move is to strip away the modern picture of space, cold, dark, empty, hostile, and replace it with the medieval one: full of light, music, and intelligence. The darkness we have projected onto the universe is diagnostic.',
    {
      text: 'He had read of "Space": at the back of his thinking for years had lurked the dismal fancy of the black, cold vacuity, the utter deadness. Now the very name "Space" seemed a blasphemous libel for this empyrean ocean of radiance.',
      cite: 'C.S. Lewis, Out of the Silent Planet, Chapter 5 (1938)',
    },
    'Lewis, "Out of the Silent Planet," Chapters 1-6. Ransom is a Cambridge philologist walking alone in the English countryside when he stumbles into an abduction. Weston and Devine drug him and put him on a spaceship. He wakes in the dark and terror. Then, through a porthole, he sees Deep Heaven for the first time. The expectation and the reality are completely opposite. Lewis is making a theological argument in the first chapter of his first science fiction novel: the darkness is in us, not out there.',
    'Lewis and Tolkien made a bet in 1937, shortly before Lewis wrote this novel. They agreed that there were not enough of the kind of stories they wanted to read, so they would each write one. Tolkien would write a time-travel story and Lewis would write a space-travel story. Tolkien\'s became "The Lost Road," which he abandoned. Lewis\'s became the Space Trilogy. The bet matters because it clarifies what Lewis was trying to do: not science fiction in the modern sense but a recovery project. He wanted to put the medieval heavens back in the reader\'s imagination.',
    'Lewis named his protagonist Ransom deliberately: the word means a payment made to secure someone\'s release. In Christian theology, the Incarnation is the ransom paid for humanity\'s captivity. Lewis did not name this connection in the novel. He let it sit in the background. This is the trilogy\'s method throughout: theological content carried in names, places, and structures without being announced.',
    'Dante, Paradiso, Canto I, the beginning of Dante\'s ascent through the heavens. The cosmos Ransom sees through the porthole is the same cosmos Dante moves through in the final canticle of the Commedia. Lewis was a Dante scholar. The relationship is intentional. Pair: Lewis, "The Discarded Image" (1964), the published Oxford lectures on the medieval cosmological imagination.',
    ['literature', 'thinker'],
  ),
  dayItem(
    'ootsp-day-2',
    'OOTSP',
    'ootsp',
    2,
    'Arriving Blind',
    'Purgative, Displacement',
    'literature',
    'Ransom\'s terror on arriving at Malacandra is not cowardice. It is accurate perception without the categories to process it. The purgative way often begins this way: you are removed from what you assumed and your existing frameworks do not apply. This is distressing. It is also the beginning of seeing.',
    {
      text: 'He saw nothing but colours, colours that refused to form themselves into things. He knew that it ought to have suggested monstrous vegetation. It did not suggest anything, because it refused to be compared with anything he had ever seen.',
      cite: 'C.S. Lewis, Out of the Silent Planet, Chapter 8 (1938)',
    },
    'Lewis, Chapters 7-10. Ransom escapes his captors on the surface of Malacandra and finds himself alone in an alien landscape. The colors are wrong (blue-purple vegetation under a different sun). The scale is wrong (everything taller, thinner). The silence is total. He survives by instinct and then, slowly, begins to be able to see. Lewis based Malacandra\'s colors partly on his own observations of Mars through a telescope and partly on the logic of photosynthesis under a colder, farther sun.',
    'The Desert Fathers chose the Egyptian desert for the same reason Ransom is useful to Lewis\'s argument in an alien landscape: the familiar had to go before clear sight was possible. Abba Moses told a young monk: "Go, sit in your cell, and your cell will teach you everything." The cell removes the distractions, the social performance, the accumulated assumptions, the comfortable habits of perception, and leaves the monk with himself. Malacandra does the same thing to Ransom on a planetary scale.',
    'Lewis described writing this novel quickly and with unusual ease. He said the world of Malacandra arrived almost complete. The séroni, the hrossa, the pfifltriggi, the handramit valleys and the harandra plateau, he did not feel he invented them. This is not mystical autobiography. It is the experience of a writer whose imaginative life had been so saturated with a particular vision (the medieval heavens) that when he needed it, it was there.',
    'The Desert Fathers, "Sayings of the Desert Fathers" (Apophthegmata Patrum), sayings of Abba Moses and Abba Antony. The logic of chosen displacement as the beginning of purgative clarity. Cowork paired Holst, "Mars: Bringer of War" (1914-1916) to establish the expectation Lewis is overturning.',
    ['literature', 'music'],
  ),
  dayItem(
    'ootsp-day-3',
    'OOTSP',
    'ootsp',
    3,
    'Learning a Different Language',
    'Purgative / Illuminative Opening',
    'literature',
    'Ransom is a philologist. His entire professional life has been the study of how meaning is carried in language. On Malacandra, this skill, useless for physical survival, turns out to be the most important thing he has. The illuminative way begins with the restoration of language: learning to say what things actually are.',
    {
      text: 'Long before he had finished learning the language he had begun to form a picture of Malacandrian society, and it was a society which made the distinctions he had been taught to draw seem rather childish.',
      cite: 'C.S. Lewis, Out of the Silent Planet, Chapter 12 (1938)',
    },
    'Lewis, Chapters 10-14. Ransom lives among the hrossa and learns Old Solar (Hressa-Hlab), the ancient language of all worlds. The hrossa are poets, singers, and fishermen. They mate once, grieve once, and do not fear death in the way Ransom does. Their language has no word for an enemy in war because war does not exist on Malacandra. Learning their language, Ransom gradually sees that the categories his own civilization assumed were necessary, competition, conquest, the separation of kinds, are contingent, not universal.',
    'Lewis believed that the modern conception of progress, the idea that human civilization is moving toward something better and that this movement justifies whatever it costs, was not a discovery but an assumption, and a relatively recent one. Weston, who kidnapped Ransom in order to deliver a human body to the Oyarsa of Malacandra (he thought they wanted a sacrifice), is the embodiment of this assumption. His entire existence is justified by the future he is building. The hrossa have no concept of this future-justification. They live entirely in the present. They are not primitive. They are, Lewis suggests, more fully developed than Ransom in the ways that matter.',
    'The hrossa sing their poetry rather than recite it. For them, the distinction between music and language does not exist in the way it does for humans. Lewis is drawing on a medieval idea here: that before the Fall, human language and music were unified, words had their own inherent melody, meaning and beauty were not separate. Old Solar is, among other things, a picture of what language was before Babel.',
    'Lewis, "The Abolition of Man," Chapter 1, "Men Without Chests." The essay version of what the novel is dramatizing: the impoverishment that follows when we strip value from language and leave only description.',
    ['literature', 'thinker'],
  ),
  dayItem(
    'ootsp-day-4',
    'OOTSP',
    'ootsp',
    4,
    'Three Kinds of Rational Being',
    'Illuminative',
    'literature',
    'The three rational species of Malacandra are not primitive life forms below humanity. They are what one complete rational being would look like, divided. Together they embody what humans have fragmented: the poetic life, the contemplative life, and the life of craft, given to three different kinds of being rather than integrated in one.',
    {
      text: 'The sorn asked him what his world was like. And as he answered, Ransom had the curious feeling that he was being examined, that his replies were being fitted into a pattern he could not see.',
      cite: 'C.S. Lewis, Out of the Silent Planet, Chapter 15 (1938)',
    },
    'Lewis, Chapters 15-17. Ransom meets Augray, a sorn (séros), in the mountains. The séroni are the philosophical, contemplative species, tall, thin, dwelling at altitude, concerned with patterns and principles. Augray carries Ransom on his shoulder to look down at the handramit valley from above. It is the first time Ransom sees the whole shape of Malacandra. Illumination requires altitude. The séroni provide it.',
    'Lewis based the three species partly on Plato\'s tripartite soul: the appetitive part (hrossa, poets, singers, physical life, eros), the spirited part (pfifltriggi, craftsmen, artists, makers), and the rational part (séroni, philosophers, contemplatives). In Plato\'s Republic, the just individual has these three parts in right order; the just city has these three kinds of people in right relationship. On Malacandra, Lewis externalizes the internal and gives each faculty its own species. The illuminative insight is this: Ransom came to Malacandra assuming humans were the standard of rational being. He leaves understanding that humanity is one expression of hnau, not the measure of it.',
    'Lewis describes the séroni as beautiful in the way that mathematical proofs are beautiful, not physically appealing but correct, proportioned, inevitable. This is Aquinas\'s consonantia applied to a being rather than an object: the beauty of right proportion, of something being exactly what it is supposed to be. Ransom\'s fear of the sorn dissolves when he sees this. He stops seeing a monster and begins seeing a face.',
    'Pseudo-Dionysius, "The Celestial Hierarchy," Chapters 6-9. The ordering of angelic intelligences as a model for Lewis\'s planetary intelligences. Lewis knew this text directly, he cites it in "The Discarded Image." Cowork suggested pairing with medieval illuminated manuscripts depicting the celestial hierarchies.',
    ['literature', 'sacred-art', 'thinker'],
  ),
  dayItem(
    'ootsp-day-5',
    'OOTSP',
    'ootsp',
    5,
    'Men Without Chests',
    'Purgative, The Mirror',
    'literature',
    'Weston is brilliant. He is also exactly the product Lewis describes in "The Abolition of Man," a man who can reason without being able to perceive value. His speech before the Oyarsa, translated into honest language by Ransom, becomes almost comic. Old Solar does not carry pretensions. This is the purgative function of honest language: it strips away what was never true.',
    {
      text: 'In a sort of ghastly simplicity we remove the organ and demand the function. We make men without chests and expect of them virtue and enterprise. We laugh at honour and are shocked to find traitors in our midst.',
      cite: 'C.S. Lewis, The Abolition of Man, Chapter 1 (1943)',
    },
    'Lewis, Chapters 18-20. Weston delivers his humanist manifesto before the Oyarsa. It is a genuinely held belief: humanity must expand across the universe, and any obstacle to this expansion may be removed. Ransom translates the speech into Old Solar. In translation, it sounds like this: "He says that if we do not let him go, his tribe will come with many bent tubes. He says that his tribe is strong. He says that if he goes back he will tell his tribe that this world is good for them to come to and they will come and do as they like." The Oyarsa responds: "He is speaking, I think, of hnakra-things." (Predators.)',
    'Lewis admitted that Weston was partly inspired by H.G. Wells, the confident progressive humanist who believed in humanity\'s expansion across the universe as a self-evident good. Lewis did not think Wells was evil. He thought Wells had accepted, without examining, an assumption that could not bear examination: that life, defined as biological complexity, was the supreme good, and that its spread justified anything done in its service. The Oyarsa of Malacandra judges Weston not as a villain but as a bent hnau, a rational being whose inner ordering has gone wrong. This is the purgative judgment: not condemnation but diagnosis.',
    'The word "bent" (in Old Solar, "bent hnau") is Lewis\'s term throughout the trilogy for what Christian theology would call sin. He chose "bent" deliberately: it is not a moral condemnation but a structural description. A bent thing retains the shape of what it was made to be. The bend shows what the original form was. This is important for the purgative way: sin is not the absence of the good but its distortion. The cure is not invention but restoration.',
    'Lewis, "The Abolition of Man," full text. 90 pages. The appendix (the Tao) is essential: Lewis lists parallel ethical statements from 15 different traditions, Chinese, Egyptian, Norse, Jewish, Christian, Roman, Hindu, to demonstrate that the perception of objective value is not culturally particular but universally human.',
    ['literature', 'thinker'],
  ),
  dayItem(
    'ootsp-day-6',
    'OOTSP',
    'ootsp',
    6,
    'The Intelligence Behind Creation',
    'Illuminative',
    'literature',
    'The illuminative way eventually leads to encounter with something that knows you better than you know yourself. The Oyarsa of Malacandra is not a god. It is a created intelligence, an eldil, assigned to its world at the beginning of time. Its grief over Thulcandra (Earth) is one of the quieter moments in Lewis. The cosmos mourns for one bent planet.',
    {
      text: 'Long ago, before the world was made ready, there was a great war in the Deep Heaven. The lord of your world, Thulcandra, is not in the fellowship of worlds. He has walked in the Deep Heaven and could not be found.',
      cite: 'C.S. Lewis, Out of the Silent Planet, Chapter 20 (1938)',
    },
    'Lewis, Chapter 20 (Ransom before the Oyarsa). The Oyarsa of Malacandra reveals the cosmic history: Maleldil (God), the Old One, the eldila, the bent Oyarsa of Thulcandra (the Dark Lord), the silent planet. Earth is not forgotten. It is quarantined, cut off from the fellowship of worlds not out of punishment but because its Oyarsa went bent and drew its people into the same distortion. The eldila of the other worlds watch and wait. The silence is not indifference.',
    'Lewis\'s eldila are his version of the angels and planetary intelligences from Pseudo-Dionysius\'s "Celestial Hierarchy" and from the medieval cosmological tradition he describes in "The Discarded Image." They are not human-shaped figures with wings. They are beings of a different ontological order, present in light, barely perceptible to human senses, entirely real. The Oyarsa of Malacandra has watched over its world since before its inhabitants existed. Its conversation with Ransom is the illuminative experience made structural: the soul encounters an intelligence that has a larger view of things.',
    'The Oyarsa tells Ransom that it has spoken to no human being before him, because no human has ever come to Malacandra in the right spirit. Weston and Devine came for gold (Devine) and for the species (Weston). Ransom came against his will and with no agenda. The purgative stripping of motive, Ransom did not choose this journey, turns out to be the qualification for the illuminative encounter at the end of it. This is the consistent logic of the purgative way: what you could not have sought, you can be given.',
    'Pseudo-Dionysius, "The Celestial Hierarchy," Chapter 1, on light as the medium through which the higher intelligences communicate with the lower. The ontological structure Lewis borrowed for his eldila. Cowork paired Holst "Neptune: The Mystic" (1914-1916), the last movement of The Planets.',
    ['literature', 'music', 'thinker'],
  ),
  dayItem(
    'ootsp-day-7',
    'OOTSP',
    'ootsp',
    7,
    'Return to the Silent Planet',
    'Purgative Complete / Illuminative Gift',
    'literature',
    'The purgative journey does not end with feeling better. It ends with seeing what was always true. Ransom left Earth unable to see it. He returns understanding exactly what it is: a wounded world in a living cosmos, the one world that has gone quiet. The displacement has done its work.',
    {
      text: 'He wondered how he could ever have thought of planets, even of the Earth, as islands of life and reality floating in a deadly void. Now, with a different imaginative energy, he saw the planets, the "earths" he called them in his thought, as mere holes or gaps in the living heaven.',
      cite: 'C.S. Lewis, Out of the Silent Planet, Chapter 22 (1938)',
    },
    'Lewis, Chapters 21-22. Ransom returns to Earth in the spacecraft. He looks out at Deep Heaven and sees it as it is: alive, full, ordered, radiant. Then he sees Earth: Thulcandra, the silent planet. The one world that has closed itself off from the fellowship of worlds, whose Oyarsa has gone bent and drawn its people into the same silence. He does not see Earth as home so much as he sees it as a wound in something that was meant to be whole.',
    'Dante, in Paradiso XXII, looks down at Earth from the sphere of Saturn and smiles at how small and vile it appears. Lewis knew this passage. The perspective of Deep Heaven on Thulcandra is a Dantean move: the purgative ascent of the Commedia produces, at its summit, the ability to see the world you left in its true proportions. Ransom has not ascended through the spheres in Dante\'s sense. But the structural effect is the same: departure, journey, altered sight, return with new eyes. The novel ends with a brief coda in which Lewis himself appears as a character, framing the story as something Ransom told him.',
    'The Oyarsa tells Ransom, before he leaves, that Maleldil has been working in Thulcandra despite the silence, that something is happening there that the other worlds watch with interest. This is Lewis\'s way of saying that the Incarnation (which he will address directly in "Perelandra") is the event that the whole cosmos is oriented toward. The silent planet is not abandoned. It is, in some way the other worlds can barely understand, at the center of the story.',
    'Dante, Paradiso, Canto XXII, lines 133-153, the Earth seen from the heavens. The passage Lewis almost certainly had in his mind as he wrote Ransom\'s return. Cowork paired Holst "Jupiter: Bringer of Jollity" (1914-1916): the cosmos at full voice.',
    ['literature', 'music', 'thinker'],
  ),
]

// ──────────────────────────────────────────────────────────────────────────
// JOURNEY 3 & 4 : Perelandra and That Hideous Strength (concept placeholders)
// ──────────────────────────────────────────────────────────────────────────

const perelandra = conceptItem(
  'perelandra-concept',
  'Perelandra (Journey 3)',
  'perelandra',
  'What does a world look like that has not fallen?',
  'Third journey in the four-journey Lewis Space Trilogy arc. The ILLUMINATIVE way through fiction. Lewis, 1943. Ransom is sent to Venus (Perelandra) where the First Mother of a new world is being tempted by a possessed Weston. The novel is the illuminative way as drama: a world where the right choice has not yet been made, and the reader watches what unfallen perception looks like in real time.\n\nNo day-map yet. This planningItem is a CONCEPT PLACEHOLDER. Once Sheri approves the arc, schedule a Cowork session to map 7 days following the same format as Journey 1 (Three Ways) and Journey 2 (OOTSP) in ~/Documents/CONTUERI-Journey-Map-ThreeWays-OOTSP.html.',
  'Arc position: Journey 3 of 4. Connects to: Journey 1 (Three Ways) framework, Journey 2 (OOTSP) purgative work, Journey 4 (THS) unitive stakes.\n\nKey thinkers / source material to consider for the 7-day map: Lewis on the unfallen state (the Green Lady, Tinidril), Augustine on original innocence (Confessions, City of God Book XIV), Maximus the Confessor on the cosmic Christ, Bonaventure Itinerarium Mentis in Deum (already referenced in Three Ways Day 5), Hans Urs von Balthasar on glory.\n\nCowork session deliverable: per-day breakdown with Lectio, Encounter, Context, Look Closer, Go Deeper, content type tags. Same HTML format as the existing Journey Map doc.',
)

const ths = conceptItem(
  'ths-concept',
  'That Hideous Strength (Journey 4)',
  'ths',
  'What does the unitive way require of us at the end of the world?',
  'Fourth and final journey in the four-journey Lewis Space Trilogy arc. The UNITIVE way through fiction. Lewis, 1945. Set on Earth. Ransom returns. The N.I.C.E. (National Institute of Coordinated Experiments) is the bent telos of everything Weston was reaching for. The novel is a unitive vision in inverted form: it shows what happens to a society that has fully refused the order Three Ways and OOTSP described.\n\nNo day-map yet. This planningItem is a CONCEPT PLACEHOLDER. Schedule a Cowork session to map 7 days following the same format as Journey 1 and Journey 2.',
  'Arc position: Journey 4 of 4. Final journey in the arc.\n\nOPEN DECISION (per CLAUDE.md Manual Task #90): Does Abolition of Man warrant a standalone journey, or fold into THS Days 5-6? The Cowork journey-map doc says THS "integrates Abolition of Man Days 5-6." CLAUDE.md flags this as undecided. Resolve before mapping.\n\nKey themes to consider: the N.I.C.E. as the bent picture of progress (Weston completed), Merlin and the medieval substrate, Jane Studdock\'s integrative arc, the descent of the gods (planetary intelligences) on St. Anne\'s. Suggested thinkers: Lewis (Abolition of Man), Augustine (City of God on the two cities), Pseudo-Dionysius (Divine Names, Mystical Theology), Hans Urs von Balthasar (Glory of the Lord). Suggested artists/composers: same Holst Planets sequence (especially Saturn, Bringer of Old Age and Mercury, the Winged Messenger), Charles Williams (Lewis dedicated the book to him), Tolkien (parallel concerns in LOTR).\n\nMarketing positioning per CLAUDE.md Open Decision #90: standalone Abolition of Man journey could be a 5-7 day "What Are We Made For?" arc aimed at classical educators and former evangelicals.',
)

// ──────────────────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────────────────

async function main() {
  const all: PlanningItem[] = [...threeWays, ...ootsp, perelandra, ths]
  const items: PlanningItem[] =
    LIMIT && LIMIT > 0 && LIMIT < all.length ? all.slice(0, LIMIT) : all

  console.log(`Mode: ${APPLY ? 'APPLY (writes enabled)' : 'DRY RUN'}`)
  if (LIMIT) {
    console.log(`Limit: ${LIMIT} of ${all.length} (test slice)`)
  }
  console.log(`planningItems to ${APPLY ? 'write' : 'plan'}: ${items.length}\n`)

  console.log('─── Planned writes ───')
  for (const item of items) {
    const ct = item.contentType ? `[${item.contentType}]` : '[concept]'
    console.log(`  ${item._id.padEnd(40)} ${ct.padEnd(15)} "${item.workingTitle}"`)
  }
  console.log(`\nEm dashes stripped at write time: ${emDashCount} total\n`)

  if (!APPLY) {
    console.log('Dry run complete. Re-run with --apply to write to Sanity.')
    return
  }

  console.log('Writing to Sanity...\n')
  let tx = client.transaction()
  for (const item of items) {
    tx = tx.createOrReplace(item)
  }
  const result = await tx.commit({visibility: 'async'})
  console.log(`  Committed transaction, ${result.results.length} doc(s) written.`)

  console.log('\nVerifying via GROQ...')
  await new Promise((r) => setTimeout(r, 1500))
  const live = await client.fetch<any[]>(
    `*[_type == "planningItem" && _id in $ids]{_id, workingTitle, stream, status}`,
    {ids: items.map((i) => i._id)},
  )
  console.log(`  ${live.length} of ${items.length} planningItems present in Sanity.`)
  if (live.length < items.length) {
    const liveIds = new Set(live.map((d) => d._id))
    for (const item of items) {
      if (!liveIds.has(item._id)) {
        console.log(`  MISSING: ${item._id}`)
      }
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('\nScript failed:', err)
  process.exit(1)
})
