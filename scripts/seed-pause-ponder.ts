/**
 * KALLOS — Seed Pause & Ponder Content into Sanity
 *
 * This script creates:
 *   1. contentItem documents (the featured content for each day)
 *   2. dailyPrompt documents (linking each day to its content item)
 *
 * Images and audio are uploaded automatically from local files.
 * Days 6 (Atacama) and 17 (Webb) skip image upload — add manually in Studio.
 *
 * Skips Day 1 (March 17) — manually entered in Sanity with edits.
 *
 * Usage:
 *   SANITY_TOKEN=your-token npx tsx scripts/seed-pause-ponder.ts
 *   SANITY_TOKEN=your-token npx tsx scripts/seed-pause-ponder.ts --dry-run
 */

import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

// ─── File Path Helpers ───────────────────────────────────────────────────────
// Paths are resolved at runtime relative to the project root and user's home dir

const HOME = process.env.HOME || '';
const PROJECT_ROOT = path.join(__dirname, '..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'Pause Ponder Content', 'pause-ponder-images');
const DOWNLOADS_DIR = path.join(HOME, 'Downloads');
const DOCUMENTS_DIR = path.join(HOME, 'Documents');

// ─── Asset Upload Helpers ────────────────────────────────────────────────────

async function uploadImageAsset(filePath: string): Promise<string> {
  const filename = path.basename(filePath);
  console.log(`  📤 Uploading image: ${filename}`);
  const asset = await client.assets.upload('image', fs.createReadStream(filePath), { filename });
  return asset._id;
}

async function uploadAudioAsset(filePath: string): Promise<string> {
  const filename = path.basename(filePath);
  console.log(`  📤 Uploading audio: ${filename}`);
  const asset = await client.assets.upload('file', fs.createReadStream(filePath), { filename });
  return asset._id;
}

// ─── Theme IDs ──────────────────────────────────────────────────────────────
// These need to be looked up from Sanity before running.
// Run: npx tsx scripts/seed-pause-ponder.ts --lookup-themes
const LOOKUP_THEMES = process.argv.includes('--lookup-themes');

async function getThemeIds(): Promise<Record<string, string>> {
  const themes = await client.fetch(`*[_type == "theme"]{ _id, title }`);
  const map: Record<string, string> = {};
  for (const t of themes) {
    // Normalize: "Light" → "light", "Suffering & Beauty" → "suffering-beauty"
    const key = t.title.toLowerCase().replace(/[&\s]+/g, '-').replace(/-+/g, '-');
    map[key] = t._id;
    // Also store the raw lowercase
    map[t.title.toLowerCase()] = t._id;
  }
  return map;
}

// ─── 18 Days of Content ─────────────────────────────────────────────────────

interface PausePonderDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  contentType: string;
  title: string;
  // Type-specific identity fields
  artist?: string;
  composer?: string;
  author?: string;
  thinkerName?: string;
  // Math-science specific
  discipline?: string;
  principle?: string;
  beautyConnection?: string;
  // Shared fields
  year?: string;
  description: string;
  context: string;
  imageSearchTerm: string;
  themes: string[]; // theme name keys
  // Daily prompt fields
  promptQuestion: string;
  curatorNote: string;
  lectio?: { text: string; attribution: string; philosophyText?: string; philosophyAttribution?: string };
  auditio?: { title: string; artist: string; audioUrl?: string; url?: string };
  actio: string;
  // Content type specific
  medium?: string;
  scripturePairing?: { verse: string; reference: string };
  workTitle?: string;
  literaryForm?: string;
  excerpt?: string;
  performer?: string;
  musicUrl?: string;
  craftTradition?: string;
  pointsToward?: string;
  creationTheology?: string;
  mediaType?: string;
  mediaUrl?: string;
  // Local asset paths — resolved at upload time
  localImagePath?: string;  // absolute path to local image file
  localAudioPath?: string;  // absolute path to local audio file (for Sanity file upload)
}

const DAYS: PausePonderDay[] = [
  // ─── Day 1: Landscape — St. Patrick (Feast Day) ────────────────────────
  {
    dayNumber: 1,
    date: '2026-03-17',
    contentType: 'landscape',
    title: 'The Hills That Held Him',
    description: 'Slemish Mountain rises 1,500 feet from the flat boglands of County Antrim, a volcanic plug that stops you mid-horizon. In the 5th century, a Romano-British teenager was chained here as a slave shepherd, alone with sheep and silence for six years. The hills aren\'t beautiful in the way a postcard is beautiful — they\'re austere, holding vast sky and wind and the kind of solitude that either breaks you or rewrites you.',
    context: 'Patrick arrived in Ireland at 16 as a captive, separated from everything he knew. The Confession — his own voice, written decades later — tells us he spent his slavery in prayer and longing, sometimes praying a hundred times a day. But something shifted in those hills. The wilderness stopped feeling like punishment and started feeling like encounter. When he finally escaped, he could have stayed safe in Britain. Instead, he returned to Ireland as a bishop, choosing to go back to the place that had held him captive. That\'s not conventional redemption. That\'s something stranger and more human — a man so changed by suffering that he could love the place that caused it.',
    imageSearchTerm: 'Slemish Mountain Ireland dawn mist green hills County Antrim',
    themes: ['home-restless-heart'],
    promptQuestion: 'What\'s a place that hurt you or held you captive — a situation, a time, a geography — that you now see differently than you did when you were in the middle of it?',
    curatorNote: 'The Slemish landscape is deceptively simple: just hills, moorland, and vast Irish sky. But it\'s the backdrop for one of history\'s most radical transformations — not because Patrick became "holy," but because he stayed long enough in his own loneliness to hear something that changed what he wanted. The six-year silence wasn\'t preparation for a grand mission. It was just six years. What makes it remarkable is that he came back anyway.',
    lectio: {
      text: 'I was taken into captivity to Ireland, and there the Lord opened the consciousness of my unbelief… And there indeed the spirit was moved within me…',
      attribution: 'Patrick\'s Confession (Confessio Patricii), 5th century',
    },
    actio: 'Think of a landscape that mattered to you — a park, a street corner, a room — and spend ten minutes there today if you can, or close your eyes and return to it mentally. Don\'t try to find meaning. Just notice what you see differently now than you did before.',
  },

  // ─── Day 2: Sacred Art — Bosch ──────────────────────────────────────────
  {
    dayNumber: 2,
    date: '2026-03-18',
    contentType: 'sacred-art',
    title: 'The Adoration of the Magi (Triptych)',
    artist: 'Hieronymus Bosch',
    year: 'c. 1500',
    description: 'A three-paneled altarpiece showing the three wise men presenting gifts to the Christ child. At the center, the sacred moment. At the margins, a world alive with detail — servants, soldiers, a crumbling stable, a figure lurking in a darkened doorway. Bosch painted what every other artist left out.',
    context: 'Bosch lived in the southern Netherlands in the late 1400s, when religious art was the primary visual language people had for thinking about life and death. The Adoration of the Magi was a subject every painter attempted. Bosch made it strange on purpose — filling the margins with tension, the background with a world that does not yet know what it is witnessing. His was not a comfortable faith. It was a searching one.',
    imageSearchTerm: 'Bosch Adoration Magi triptych Prado high-resolution',
    themes: ['light'],
    promptQuestion: 'Is there something you had to move through darkness to reach — and what you found on the other side was good, even if it wasn\'t what you imagined?',
    curatorNote: 'What you\'re looking at is only half the painting. When this triptych is closed, Bosch painted seven scenes from the Passion of Christ on the outside panels — in grisaille, the gray monochrome used to imitate carved stone. The seven stations: the Agony in the Garden, the Arrest, the Mocking of Christ, the Crowning with Thorns, the Way of the Cross, the Crucifixion, the Pietà. You open the doors through suffering to reach the Adoration. Bosch designed it so the arrival of joy cannot be separated from the path through darkness.',
    lectio: {
      philosophyText: 'The prisoners in the cave see only shadows on the wall. When one is freed and turned toward the light, at first he cannot see — the brightness is too much. But he persists. Eventually he sees things as they really are.',
      philosophyAttribution: 'Plato, Republic — Allegory of the Cave',
      text: 'For now we see through a glass, darkly; but then face to face: now I know in part; but then shall I know even as also I am known.',
      attribution: '1 Corinthians 13:12',
    },
    actio: 'Spend two minutes with the open triptych and find the figure lurking in the doorway of the stable. He is not a wise man. He is not a servant. Bosch placed him there with intention. When you find him, ask yourself: which figure in this painting are you today?',
    localImagePath: path.join(DOWNLOADS_DIR, 'sacred art', 'Bosch - Triptych Adoration of the Magi', 'Triptych of the Adoration of the Magi.jpg'),
  },

  // ─── Day 4: Music — Palestrina ──────────────────────────────────────────
  {
    dayNumber: 4,
    date: '2026-03-20',
    contentType: 'music',
    title: 'Missa Papae Marcelli',
    composer: 'Giovanni Pierluigi da Palestrina',
    performer: 'Pro Cantione Antiqua',
    description: 'A Renaissance polyphonic Mass composed around 1562. Six voices weave in and out—sometimes in unison, sometimes in counterpoint—creating a sound that seems to lift the stone walls of the chapel it was written for. It is music that breathes.',
    context: 'The Council of Trent nearly banned polyphony from Catholic worship—the complex interweaving of voices had become so elaborate that the words of the Mass were lost in the music. Palestrina\'s Missa Papae Marcelli is often credited with saving polyphonic music for the Church. Whether or not the legend is exactly true, the Mass does what the Council demanded: it makes every word audible while keeping the beauty that makes you forget you\'re listening at all.',
    imageSearchTerm: 'sisters singing in chapel polyphony choral music',
    themes: ['silence'],
    promptQuestion: 'What happens to your breathing when you listen to music that was designed for prayer?',
    curatorNote: 'There\'s a legend that this Mass saved polyphonic music from being banned by the Church. True or not, listen to it once and you\'ll understand why. It\'s the sound of six voices becoming one breath.',
    lectio: {
      text: 'Sing to the Lord a new song, for he has done marvelous things.',
      attribution: 'Psalm 98:1',
    },
    auditio: {
      title: 'Missa Papae Marcelli — Kyrie',
      artist: 'Palestrina — Pro Cantione Antiqua',
    },
    actio: 'Find two minutes of silence today. Not empty silence—the kind where you can hear what\'s underneath.',
    localImagePath: path.join(DOWNLOADS_DIR, 'Abbaye_du_Bec-Hellouin_-_vêpres_solennelles.jpg'),
    localAudioPath: path.join(DOWNLOADS_DIR, 'Pro Cantione Antiqua - Giovanni Pierluigi da Palestrina- Missa Papae Marcelli', 'Pro Cantione Antiqua - Giovanni Pierluigi da Palestrina- Missa Papae Marcelli - 01 Missa Papae Marcelli- I. Kyrie.mp3'),
  },

  // ─── Day 5: Sacred Art — Christ in Gethsemane ──────────────────────────
  {
    dayNumber: 5,
    date: '2026-03-21',
    contentType: 'sacred-art',
    title: 'Christ in Gethsemane (Agony in the Garden)',
    artist: 'El Greco',
    year: 'c. 1590–1595',
    description: 'A nocturnal scene of Christ kneeling in prayer while his disciples sleep. El Greco\'s signature elongated figures and electric color give the moment a quality that is both urgent and timeless—a man alone with the weight of what comes next.',
    context: 'El Greco painted this scene multiple times. In each version, the distance between Christ and the sleeping disciples grows more painful. This is not a painting about prayer as comfort. It is about prayer as endurance—the willingness to stay awake when everything in you wants to sleep. The angel appears not to rescue but to witness. The moonlight is cold. The garden is not safe.',
    imageSearchTerm: 'El Greco Agony in the Garden Gethsemane high-resolution',
    themes: ['suffering-beauty', 'silence'],
    promptQuestion: 'Have you ever stayed awake with something difficult when it would have been easier to look away?',
    curatorNote: 'El Greco painted this scene more than once, and each time, the gap between Christ and the sleeping disciples gets wider. That distance is the whole painting. It\'s about being alone with something heavy and choosing not to put it down.',
    lectio: {
      text: 'Could you not keep watch with me for one hour? Watch and pray so that you will not fall into temptation. The spirit is willing, but the flesh is weak.',
      attribution: 'Matthew 26:40–41',
    },
    actio: 'If something difficult is sitting with you today, don\'t rush past it. Give it one honest minute of attention.',
    scripturePairing: {
      verse: 'Could you not keep watch with me for one hour?',
      reference: 'Matthew 26:40',
    },
    localImagePath: path.join(DOWNLOADS_DIR, 'El_Greco_-_The_Agony_in_the_Garden_-_WGA10484.jpg'),
  },

  // ─── Day 6: Landscape — Atacama Desert ─────────────────────────────────
  {
    dayNumber: 6,
    date: '2026-03-22',
    contentType: 'landscape',
    title: 'The Atacama Desert at Dawn',
    description: 'The driest non-polar desert on Earth—a vast, rust-colored plateau in northern Chile where the sky holds more stars per square inch than almost anywhere else on the planet. At dawn, the silence is total. The landscape has not changed in millions of years.',
    context: 'The Atacama is one of the few places on Earth where astronomers can see the Milky Way with the naked eye. It is also where NASA tests Mars rovers, because the terrain is the closest thing on this planet to another world. But for centuries before telescopes, the indigenous Atacameño people read the sky as scripture—a story written in light. The desert strips everything away. What remains is what was always there.',
    imageSearchTerm: 'Atacama Desert dawn stars Chile landscape high-resolution',
    themes: ['creation', 'silence'],
    creationTheology: 'The Atacama reveals creation at its most ancient and unmediated. No trees, no rivers, no softening. Just rock, sky, and 13 billion years of starlight arriving at your eyes.',
    promptQuestion: 'What would it feel like to stand in a place where nothing has changed for a million years?',
    curatorNote: 'The Atacama doesn\'t care about your schedule. It\'s been sitting there for millions of years, not changing, not performing. Sometimes the most honest thing a landscape can do is refuse to be anything other than itself.',
    lectio: {
      text: 'Be still, and know that I am God.',
      attribution: 'Psalm 46:10',
    },
    actio: 'Step outside tonight and look up. Even in a city, find one star. Let it be old.',
    localImagePath: path.join(DOWNLOADS_DIR, 'The_Milky_Way_seen_from_the_Atacama_Desert_(gerd_huedepohl_3).jpg'),
  },

  // ─── Day 7: Pattern & Proof — DNA ──────────────────────────────────────
  {
    dayNumber: 7,
    date: '2026-03-23',
    contentType: 'math-science',
    title: 'The Double Helix: Code Written Before Language',
    discipline: 'Molecular Biology',
    principle: 'DNA Structure — The Double Helix',
    year: '1953 (Watson & Crick)',
    beautyConnection: 'DNA is the most elegant language ever discovered — four letters writing every living thing on Earth. The same alphabet writes a redwood tree and a hummingbird, a coral reef and a human hand. DNA is the oldest language in the world, and it has been writing poetry for 3.8 billion years without a single reader until now.',
    description: 'The double helix is the molecular structure of DNA — two spiraling strands of nucleotides held together by hydrogen bonds. Discovered in 1953, it revealed that all life on Earth is built on an elegant code — a language that predates all human language. The spiral form echoes patterns found in galaxies, seashells, and staircases. That the same four letters write every living thing is either the deepest coincidence in the universe or the signature of something that intended to be read.',
    context: 'When Watson and Crick first saw the structure of DNA, Crick reportedly walked into the Eagle pub in Cambridge and announced they had "found the secret of life." The claim was not modest, but it was not wrong either. What they had found was a code — a set of instructions so precise that it could build a blue whale or a bacterium from the same four chemical letters: A, T, G, C. The elegance of the structure stunned biologists and mathematicians alike. The double helix spirals with geometric precision, its proportions governed by the same mathematical relationships found in sunflower heads and nautilus shells. For many scientists, the moment they understood DNA was the moment the line between biology and poetry dissolved.',
    imageSearchTerm: 'DNA double helix molecular structure beautiful visualization high-resolution',
    themes: ['creation', 'light'],
    promptQuestion: 'Every living thing you see today shares the same four-letter alphabet. What does it mean that a language this old is still writing new sentences?',
    curatorNote: 'Four letters. That\'s it. Every living thing on Earth — every oak tree, every octopus, every person you\'ve ever loved — is written in a four-letter alphabet. DNA has been composing for 3.8 billion years and hasn\'t run out of things to say.',
    lectio: {
      text: 'For you created my inmost being; you knit me together in my mother\'s womb. I praise you because I am fearfully and wonderfully made.',
      attribution: 'Psalm 139:13–14',
    },
    actio: 'Look at your own hand today. Remember that the code that built it is 3.8 billion years old — and it\'s the same code that builds everything alive around you.',
    localImagePath: path.join(DOWNLOADS_DIR, 'double helix DNA.jpg'),
  },

  // ─── Day 8: Food & Wine — Bread Ovens ──────────────────────────────────
  {
    dayNumber: 8,
    date: '2026-03-24',
    contentType: 'food-wine',
    title: 'The Bread Ovens of Tuscany',
    craftTradition: '3rd-generation family bakery, Altamura, Puglia',
    description: 'A wood-fired communal bread oven in a Tuscan hill town—the kind of oven that has been turning flour, water, and salt into something sacred for six hundred years. The bread that comes out is dark-crusted, chewy, and imperfect. It is not artisan. It is ancestral.',
    context: 'Before supermarkets, before even bakeries, bread was communal. Villages shared ovens. Families brought their dough marked with a family stamp so they could tell the loaves apart after baking. The oven was the social center—the place where grain became grace. In the Eucharistic tradition, bread is not a metaphor. It is the thing itself: the daily gift, broken and shared. Tuscan bread is still made without salt (a medieval tradition born from a tax dispute), which means it tastes like nothing on its own—and like everything when paired with olive oil, tomato, or wine.',
    imageSearchTerm: 'Tuscan bread oven wood-fired traditional bakery Italy',
    themes: ['home-restless-heart'],
    pointsToward: 'The shared oven is an image of communion itself — many loaves from one fire, many families around one hearth. Bread-making is theology you can eat.',
    promptQuestion: 'What does it mean that something as simple as bread can carry six hundred years of memory?',
    curatorNote: 'This isn\'t a cooking story. It\'s about what happens when a whole village shares one oven for six hundred years. The bread is just the evidence.',
    lectio: {
      text: 'Give us this day our daily bread.',
      attribution: 'Matthew 6:11',
    },
    actio: 'The next time you eat bread, slow down for one bite. Taste the flour, the water, the heat. Let it be enough.',
    localImagePath: path.join(IMAGES_DIR, 'wood fired bread.avif'),
  },

  // ─── Day 9: Sacred Art — Rublev Trinity ─────────────────────────────────
  {
    dayNumber: 9,
    date: '2026-03-25',
    contentType: 'sacred-art',
    title: 'The Trinity (Troitsa)',
    artist: 'Andrei Rublev',
    year: 'c. 1410',
    description: 'Three angelic figures seated around a table, each holding a staff, their bodies forming a circle that draws the viewer in. The icon\'s colors—gold, blue, green—are luminous and still. There is a space at the front of the table. It is for you.',
    context: 'Rublev painted this icon for the Trinity Lavra of St. Sergius, one of the most important monasteries in Russian Orthodoxy. The three figures represent the three persons of the Trinity, but Rublev resists labeling them. Their faces are identical. Their postures mirror each other. The circle they form has no hierarchy—only communion. The open space at the front of the table is one of the most famous gestures in the history of art: an invitation to sit down.',
    imageSearchTerm: 'Rublev Trinity icon high-resolution Tretyakov Gallery',
    themes: ['light', 'home-restless-heart'],
    promptQuestion: 'There\'s an empty place at the table in Rublev\'s icon. What would it mean to take it?',
    curatorNote: 'The most radical thing about this icon isn\'t the theology — it\'s the empty seat. Rublev left a space at the table, and for 600 years, people have been sitting down in it. That\'s the invitation.',
    lectio: {
      text: 'Where two or three gather in my name, there am I with them.',
      attribution: 'Matthew 18:20',
    },
    actio: 'Set an extra place today—at your table, in your mind, in your schedule. Leave room for someone unexpected.',
    scripturePairing: {
      verse: 'Where two or three gather in my name, there am I with them.',
      reference: 'Matthew 18:20',
    },
    localImagePath: path.join(IMAGES_DIR, 'trinity-1410.jpg'),
  },

  // ─── Day 10: Landscape — Skógafoss ──────────────────────────────────────
  {
    dayNumber: 10,
    date: '2026-03-26',
    contentType: 'landscape',
    title: 'Skógafoss Waterfall, Iceland',
    description: 'A 60-meter curtain of water falling from the edge of a cliff on Iceland\'s southern coast. On sunny days, a double rainbow appears in the mist. The sound is so loud it replaces thought.',
    context: 'Skógafoss sits on the old sea cliffs of the Eyjafjöll range. Viking legend says the first Norse settler in the area, Þrasi Þórólfsson, hid a treasure chest behind the falls. Locals tried to retrieve it for centuries and only ever managed to grab the ring on the side of the chest before it vanished. The ring is now in a nearby church. Whether or not the legend is true, the waterfall has always been understood as a threshold—a place where something is hidden just behind what you can see.',
    imageSearchTerm: 'Skógafoss waterfall Iceland rainbow mist high-resolution',
    themes: ['creation'],
    creationTheology: 'Skógafoss is creation theology in its most visceral form — water, gravity, light, and mist conspiring to make something that stops you mid-sentence. The rainbow is not decoration. It is physics performing theology.',
    promptQuestion: 'When was the last time something in nature was so loud it silenced your inner monologue?',
    curatorNote: 'You don\'t visit Skógafoss. It visits you. The sound alone will rearrange your priorities. There\'s a reason every culture puts something sacred behind a waterfall.',
    lectio: {
      text: 'Deep calls to deep in the roar of your waterfalls; all your waves and breakers have swept over me.',
      attribution: 'Psalm 42:7',
    },
    actio: 'Find moving water today—a fountain, a stream, even a faucet. Listen to it for 30 seconds without thinking about anything else.',
    localImagePath: path.join(IMAGES_DIR, 'Rainbow_under_Skógafoss_waterfall_(Unsplash).jpg'),
  },

  // ─── Day 11: Literature — Pied Beauty ──────────────────────────────────
  {
    dayNumber: 11,
    date: '2026-03-27',
    contentType: 'literature',
    title: 'Pied Beauty',
    author: 'Gerard Manley Hopkins',
    workTitle: 'Pied Beauty',
    literaryForm: 'poetry',
    description: 'A curtal sonnet praising God for "dappled things"—the imperfect, the spotted, the mixed. Hopkins finds beauty not in flawlessness but in the irregular: "landscape plotted and pieced," "finches\' wings," "all things counter, original, spare, strange."',
    context: 'Hopkins was a Jesuit priest and one of the most original poets in the English language. He invented the concept of "inscape"—the inner pattern that makes each thing uniquely itself—and "instress"—the force that holds that pattern together. For Hopkins, the world was not beautiful despite its imperfections but because of them. Pied Beauty is a praise poem for irregularity. The word "pied" means having patches of two or more colors—and Hopkins sees this patchwork as God\'s signature: not uniformity but dazzling variety.',
    imageSearchTerm: 'Gerard Manley Hopkins nature dappled light landscape',
    themes: ['creation', 'light'],
    excerpt: 'Glory be to God for dappled things —\nFor skies of couple-colour as a brinded cow;\nFor rose-moles all in stipple upon trout that swim;\nFresh-firecoal chestnut-falls; finches\' wings;\nLandscape plotted and pieced — fold, fallow, and plough;\nAnd áll trádes, their gear and tackle and trim.\n\nAll things counter, original, spare, strange;\nWhatever is fickle, freckled (who knows how?)\nWith swift, slow; sweet, sour; adazzle, dim;\nHe fathers-forth whose beauty is past change:\nPraise him.',
    promptQuestion: 'Hopkins praised "all things counter, original, spare, strange." What imperfect, dappled thing in your life deserves praise?',
    curatorNote: 'Hopkins invented a whole new way of seeing. He looked at a trout and saw theology. He looked at a chestnut and saw fire. This poem is basically a dare: can you look at one imperfect thing today and call it glory?',
    lectio: {
      text: 'Glory be to God for dappled things — For skies of couple-colour as a brinded cow.',
      attribution: 'Gerard Manley Hopkins, "Pied Beauty," 1877',
    },
    actio: 'Find one "dappled" thing today—something imperfect, patchy, irregular—and let it be beautiful without fixing it.',
    localImagePath: path.join(DOCUMENTS_DIR, 'Nottuln,_Gladbeck,_Grashalm_--_2024_--_4342.jpg'),
  },

  // ─── Day 12: Pattern & Proof — Fibonacci ───────────────────────────────
  {
    dayNumber: 12,
    date: '2026-03-28',
    contentType: 'math-science',
    title: 'The Fibonacci Spiral: Mathematics the Eye Already Knows',
    discipline: 'Mathematics / Botany',
    principle: 'Fibonacci Sequence & the Golden Spiral',
    year: '1202 (Fibonacci\'s Liber Abaci)',
    beautyConnection: 'The Fibonacci sequence appears in sunflower heads, pine cones, hurricane formations, and spiral galaxies. It is a number pattern that nature has been using for millions of years before any human noticed. The fact that the same ratio governs the curve of a nautilus shell and the arm of a galaxy suggests either a deep structural law or a creator with a favorite ratio.',
    description: 'The Fibonacci sequence — 1, 1, 2, 3, 5, 8, 13, 21... — is a series where each number is the sum of the two before it. When you draw arcs connecting these numbers on a grid, a spiral appears: the Golden Spiral. This shape shows up in sunflower seed patterns, nautilus shells, hurricane formations, and the arms of spiral galaxies. It was first described in the West by Leonardo of Pisa (Fibonacci) in 1202, though Indian mathematicians knew it centuries earlier.',
    context: 'Fibonacci was trying to solve a problem about rabbit populations when he stumbled onto one of the most pervasive patterns in nature. The sequence he described has since been found governing the arrangement of petals on flowers (lilies have 3, buttercups 5, daisies 34 or 55), the branching of trees, the geometry of shells, and the structure of galaxies. Mathematicians call the ratio between successive Fibonacci numbers the Golden Ratio (approximately 1.618), and it has been used by architects, artists, and composers from the Parthenon to Le Corbusier. The question it raises is deceptively simple: why does the universe keep using the same number?',
    imageSearchTerm: 'Fibonacci spiral sunflower golden ratio nature mathematics beautiful',
    themes: ['creation', 'light'],
    promptQuestion: 'The same spiral appears in a sunflower, a seashell, and a galaxy. What does it mean that nature keeps repeating itself at every scale?',
    curatorNote: 'Math isn\'t cold. Math is the part of creation that can\'t help showing its work. The Fibonacci spiral is everywhere — sunflowers, seashells, galaxies — and nobody taught nature to count.',
    lectio: {
      text: 'He has made everything beautiful in its time. He has also set eternity in the human heart; yet no one can fathom what God has done from beginning to end.',
      attribution: 'Ecclesiastes 3:11',
    },
    actio: 'Look for a spiral today — in a flower, a shell, a staircase, the cream in your coffee. Notice how it curves.',
    localImagePath: path.join(DOWNLOADS_DIR, 'sunflower.jpg'),
  },

  // ─── Day 13: Music — Spiegel im Spiegel ────────────────────────────────
  {
    dayNumber: 13,
    date: '2026-03-29',
    contentType: 'music',
    title: 'Spiegel im Spiegel',
    composer: 'Arvo Pärt',
    performer: 'Tasmin Little (violin), Martin Roscoe (piano)',
    description: 'A piece for piano and violin so spare it seems to be made of silence as much as sound. The piano plays a steady, ascending arpeggio in F major. The violin sings a single, long melody over it. The title means "Mirror in Mirror"—an image reflected infinitely, getting simpler the further it goes.',
    context: 'Pärt composed Spiegel im Spiegel in 1978, just before leaving Estonia for exile in the West. It belongs to his "tintinnabuli" style—named after the Latin word for small bells—where one voice follows the melody and the other outlines a triad. The result is music stripped to its mathematical bones: just two voices, one scale, no development. It has been used in films, hospices, and meditation halls around the world. Many listeners report that time seems to slow down or stop entirely.',
    imageSearchTerm: 'Arvo Pärt tintinnabuli minimalist music quiet contemplative',
    themes: ['silence', 'light'],
    promptQuestion: 'What happens in the space between two notes? Is the silence part of the music, or the other way around?',
    curatorNote: 'Pärt wrote this right before leaving his home country for good. Two instruments, one scale, almost no movement. It\'s the sound of someone deciding that less is not just more — it\'s everything.',
    lectio: {
      text: 'For God alone, O my soul, wait in silence, for my hope is from him.',
      attribution: 'Psalm 62:5',
    },
    auditio: {
      title: 'Spiegel im Spiegel',
      artist: 'Arvo Pärt — Tasmin Little, Martin Roscoe',
    },
    actio: 'Listen to one piece of music today all the way through without doing anything else. Let the silence after it finish be part of it.',
    localImagePath: path.join(IMAGES_DIR, 'eric-prouzet-UL20QQKXCoM-unsplash.jpg'),
    localAudioPath: path.join(DOCUMENTS_DIR, '01 Spiegel im Spiegel, for Violin & Piano.mp3'),
  },

  // ─── Day 14: Thinker — Roger Scruton ────────────────────────────────────
  {
    dayNumber: 14,
    date: '2026-03-30',
    contentType: 'thinker',
    title: 'Roger Scruton on the Sacred and the Beautiful',
    thinkerName: 'Roger Scruton',
    description: 'A British philosopher who spent his career arguing that beauty is not subjective, not a luxury, and not optional—that it is a fundamental human need and a pathway to the sacred. His work on aesthetics bridges analytical philosophy and spiritual longing.',
    context: 'Scruton was an unlikely defender of beauty in an academic culture that had largely abandoned the concept. He argued that the modern world\'s ugliness—in architecture, music, art, and public life—was not just an aesthetic failure but a spiritual one. Beauty, for Scruton, was "the real presence of the sacred in the world of perception." To destroy beauty was to close a door that should stay open. His BBC documentary "Why Beauty Matters" reached millions who had never read a philosophy book.',
    imageSearchTerm: 'English Gothic church interior stone arches light — or — Palladian facade golden hour — or — Oxford college courtyard evening. Evokes architectural beauty as moral order.',
    themes: ['light', 'home-restless-heart'],
    promptQuestion: 'Scruton believed beauty is a need, not a luxury. Do you agree—and if so, what happens when it\'s missing?',
    curatorNote: 'Scruton spent his whole career saying one thing: beauty matters. Not as decoration, not as opinion, but as a fundamental human need. In a world that keeps building ugly things and calling them progress, that\'s a radical position.',
    lectio: {
      text: 'Beauty is the real presence of the sacred in the world of perception.',
      attribution: 'Roger Scruton, Beauty: A Very Short Introduction, 2009',
    },
    actio: 'Notice one ugly thing in your environment today—and one beautiful thing. Ask yourself what each one does to you.',
    localImagePath: path.join(IMAGES_DIR, 'day 2 sebastien-le-derout-UHmBlmvW8rw-unsplash.jpg'),
  },

  // ─── Day 15: Watch/Listen — My Octopus Teacher ─────────────────────────
  {
    dayNumber: 15,
    date: '2026-03-31',
    contentType: 'watch-listen',
    title: 'My Octopus Teacher',
    mediaType: 'documentary',
    mediaUrl: 'https://www.netflix.com/title/81045007',
    description: 'A documentary about a filmmaker who spends a year visiting a wild octopus in a South African kelp forest. What begins as nature observation becomes something closer to friendship—a daily practice of attention that changes both the man and, possibly, the animal.',
    context: 'Craig Foster was burnt out—exhausted by years of wildlife filmmaking and disconnected from his own life. He began free-diving in the frigid kelp forests near Cape Town, and one day he encountered an octopus. He returned every day for a year. The film documents not just the octopus\'s remarkable intelligence and vulnerability, but Foster\'s own transformation through sustained attention. It won the Academy Award for Best Documentary in 2021. Many viewers have described it as a spiritual experience—not because it mentions God, but because it shows what happens when someone pays attention to one small creature for long enough.',
    imageSearchTerm: 'My Octopus Teacher kelp forest underwater octopus',
    themes: ['creation', 'silence'],
    promptQuestion: 'What would happen if you visited the same place in nature every day for a year? What would you start to see?',
    curatorNote: 'A man visits one octopus every day for a year. That\'s it. That\'s the whole movie. And somehow it became one of the most watched documentaries on the planet. Turns out, sustained attention is its own kind of miracle.',
    lectio: {
      text: 'Consider the lilies of the field, how they grow: they neither toil nor spin, yet I tell you, even Solomon in all his glory was not arrayed like one of these.',
      attribution: 'Matthew 6:28–29',
    },
    actio: 'Pick one living thing near you—a plant, a bird outside, even an insect—and watch it for two full minutes. Just watch.',
    localImagePath: path.join(IMAGES_DIR, 'octopus-Pieuvre_abyssale_(Ifremer_00558-66991).jpg'),
  },

  // ─── Day 16: Literature — Lake Isle of Innisfree ───────────────────────
  {
    dayNumber: 16,
    date: '2026-04-01',
    contentType: 'literature',
    title: 'The Lake Isle of Innisfree',
    author: 'William Butler Yeats',
    workTitle: 'The Lake Isle of Innisfree',
    literaryForm: 'poetry',
    year: '1890',
    description: 'Twelve lines about a man standing on a grey city pavement, hearing the sound of lake water in his chest. Yeats wrote it at 23 in London, homesick for Sligo, remembering a tiny island in Lough Gill where he\'d once imagined building a cabin. The poem is not really about the island. It\'s about what the longing itself tells you — that somewhere in you, there\'s a place you already know, even if you\'ve never been there.',
    context: 'Yeats was walking down Fleet Street in London when the sound of a small fountain in a shop window triggered a wave of homesickness so intense it became this poem. Innisfree is real — a small, uninhabited island in Lough Gill, County Sligo — but Yeats never actually lived there. What he longed for was something the island represented: simplicity, solitude, a life stripped to its essentials. The poem became one of the most beloved in the English language because that longing is universal. Everyone has an Innisfree — a place, real or imagined, where they imagine they could finally be at peace.',
    imageSearchTerm: 'Innisfree Lough Gill Sligo Ireland misty lake island dawn',
    themes: ['home-restless-heart', 'silence'],
    promptQuestion: 'Where is your Innisfree — the place, real or imagined, where you picture yourself finally at rest?',
    curatorNote: 'Yeats wrote this on a London street at 23, homesick for a tiny island he\'d never actually lived on. That\'s the thing about longing — it doesn\'t need to be reasonable. It just needs to be true. Everyone has a place like this. The question is whether you can hear it over the noise.',
    lectio: {
      text: 'I will arise and go now, for always night and day / I hear lake water lapping with low sounds by the shore; / While I stand on the roadway, or on the pavements grey, / I hear it in the deep heart\'s core.',
      attribution: 'W.B. Yeats, "The Lake Isle of Innisfree," 1890',
    },
    actio: 'Close your eyes for thirty seconds and picture the place where you feel most at peace — real or imagined. Notice the sounds. The light. What you smell. Carry that place with you today like a quiet room you can return to.',
    localImagePath: path.join(DOWNLOADS_DIR, 'k-mitch-hodge-JxQHK_gvyBE-unsplash.jpg'),
  },

  // ─── Day 17: Pattern & Proof — Webb Telescope ──────────────────────────
  {
    dayNumber: 17,
    date: '2026-04-02',
    contentType: 'math-science',
    title: 'Webb\'s First Deep Field: 13 Billion Years of Light',
    discipline: 'Astronomy / Cosmology',
    principle: 'Deep Field Imaging — Infrared Cosmology',
    year: '2022 (First image released July 11)',
    beautyConnection: 'The Webb Deep Field image captures light that has been traveling for 13 billion years. Every bright smudge is an entire galaxy — billions of stars, many with their own planets. The image covers a patch of sky no bigger than a grain of sand held at arm\'s length. What it reveals is not emptiness but an almost incomprehensible fullness.',
    description: 'On July 11, 2022, NASA released the first full-color image from the James Webb Space Telescope: a deep field photograph of galaxy cluster SMACS 0723 as it appeared 4.6 billion years ago. Behind the cluster, gravitational lensing reveals galaxies from even deeper in time — some from just 600 million years after the Big Bang. The image covers an area of sky that would be hidden behind a grain of sand held at arm\'s length. In that grain of sand: thousands of galaxies, each containing billions of stars.',
    context: 'The James Webb Space Telescope orbits the sun nearly a million miles from Earth at a point called L2. Its gold-plated mirror — 21 feet across — collects infrared light that has been traveling through space for billions of years. The Deep Field image was the first glimpse of what Webb could see, and it stunned even the scientists who built it. President Biden unveiled it at the White House, calling it "a new window into the history of our universe." For contemplatives, the image raises the oldest question in new clothing: if the universe is this vast, this old, and this beautiful — what does that say about the mind behind it?',
    imageSearchTerm: 'James Webb Space Telescope deep field SMACS 0723 high resolution NASA',
    themes: ['creation', 'light'],
    promptQuestion: 'Behind a grain of sand: thousands of galaxies. What do you do with a universe this large?',
    curatorNote: 'Hold a grain of sand at arm\'s length against the night sky. Behind that grain of sand, the Webb telescope found thousands of galaxies. Each one has billions of stars. Every single point of light in this image is an entire world we\'ll never visit. Let that settle.',
    lectio: {
      text: 'When I consider your heavens, the work of your fingers, the moon and the stars, which you have set in place, what is mankind that you are mindful of them, human beings that you care for them?',
      attribution: 'Psalm 8:3–4',
    },
    actio: 'Look at the sky tonight — or even now, through a window. Remember that the light you\'re seeing has traveled an almost incomprehensible distance just to reach your eyes.',
    localImagePath: path.join(DOWNLOADS_DIR, 'webb first imageSTScI-01G8H1K2BCNATEZSKVRN9Z69SR.png'),
  },

  // ─── Day 18: Sacred Art — Prodigal Son ──────────────────────────────────
  {
    dayNumber: 18,
    date: '2026-04-03',
    contentType: 'sacred-art',
    title: 'The Return of the Prodigal Son',
    artist: 'Rembrandt van Rijn',
    year: 'c. 1668',
    description: 'A son kneels before his father, his shoes worn through, his head pressed against the old man\'s chest. The father\'s hands rest on the son\'s back—one masculine, one feminine, both gentle. The older brother stands in shadow, watching. The light falls only on the reunion.',
    context: 'Rembrandt painted this near the end of his life, after losing his wife, his son, his fortune, and his reputation. He was the prodigal. The painting is enormous—nearly nine feet tall—and it hangs in the Hermitage in Saint Petersburg. Henri Nouwen spent months sitting in front of it and wrote an entire book about what he saw. The father\'s hands are the center of the painting: one firm, one tender, both receiving. Rembrandt gave the father the hands of someone who has been waiting a long time—and who would wait forever.',
    imageSearchTerm: 'Rembrandt Return Prodigal Son Hermitage high-resolution',
    themes: ['home-restless-heart', 'suffering-beauty'],
    promptQuestion: 'Are you the son coming home, the father waiting, or the older brother watching from the shadow?',
    curatorNote: 'Rembrandt painted this broke, grieving, and near the end of his life. He was the prodigal son. He was also the father. That\'s why the painting lands the way it does — it was made by someone who\'d been both.',
    lectio: {
      text: 'But while he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son, threw his arms around him and kissed him.',
      attribution: 'Luke 15:20',
    },
    actio: 'Is there someone you\'ve been keeping at arm\'s length? Consider one small step toward them today.',
    scripturePairing: {
      verse: 'But while he was still a long way off, his father saw him and was filled with compassion for him.',
      reference: 'Luke 15:20',
    },
    localImagePath: path.join(DOWNLOADS_DIR, 'Rembrandt_Harmensz._van_Rijn_-_The_Return_of_the_Prodigal_Son.jpg'),
  },
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_TOKEN && !DRY_RUN && !LOOKUP_THEMES) {
    console.error('❌ Set SANITY_TOKEN environment variable. Get one from:');
    console.error('   https://www.sanity.io/manage/project/em44j9m8/api#tokens');
    console.error('   Or run with --dry-run to preview without writing.');
    process.exit(1);
  }

  // Look up theme IDs
  if (LOOKUP_THEMES) {
    const themes = await getThemeIds();
    console.log('📦 Theme IDs in Sanity:');
    for (const [key, id] of Object.entries(themes)) {
      console.log(`   ${key} → ${id}`);
    }
    return;
  }

  let themeMap: Record<string, string> = {};
  if (!DRY_RUN) {
    themeMap = await getThemeIds();
    console.log(`📦 Found ${Object.keys(themeMap).length / 2} themes in Sanity`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KALLOS — Seed Pause & Ponder (17 Days, skipping Mar 17 — manually entered)`);
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '🚀 LIVE'}`);
  console.log(`${'='.repeat(60)}\n`);

  const contentItemIds: string[] = [];

  // Skip March 17 — manually entered in Sanity with edits
  const daysToSeed = DAYS.filter(d => d.date !== '2026-03-17');

  for (const day of daysToSeed) {
    const contentItemId = `pp-content-day${String(day.dayNumber).padStart(2, '0')}`;
    const dailyPromptId = `pp-prompt-day${String(day.dayNumber).padStart(2, '0')}`;

    // Build content item document
    const contentDoc: Record<string, unknown> = {
      _id: contentItemId,
      _type: 'contentItem',
      contentType: day.contentType,
      title: day.title,
      description: day.description,
      context: day.context,
      curatorNote: day.curatorNote,
    };

    // Theme references
    if (!DRY_RUN) {
      contentDoc.themes = day.themes.map(t => {
        const id = themeMap[t];
        if (!id) console.warn(`  ⚠️  Theme "${t}" not found in Sanity`);
        return { _type: 'reference', _ref: id, _key: t };
      }).filter(r => r._ref);
    }

    // Type-specific fields
    if (day.artist) contentDoc.artist = day.artist;
    if (day.composer) contentDoc.composer = day.composer;
    if (day.author) contentDoc.author = day.author;
    if (day.thinkerName) contentDoc.thinkerName = day.thinkerName;
    if (day.year) contentDoc.year = day.year;
    if (day.medium) contentDoc.medium = day.medium;
    if (day.performer) contentDoc.performer = day.performer;
    if (day.musicUrl) contentDoc.musicUrl = day.musicUrl;
    if (day.workTitle) contentDoc.workTitle = day.workTitle;
    if (day.literaryForm) contentDoc.literaryForm = day.literaryForm;
    if (day.excerpt) contentDoc.excerpt = day.excerpt;
    if (day.craftTradition) contentDoc.craftTradition = day.craftTradition;
    if (day.pointsToward) contentDoc.pointsToward = day.pointsToward;
    if (day.creationTheology) contentDoc.creationTheology = day.creationTheology;
    if (day.mediaType) contentDoc.mediaType = day.mediaType;
    if (day.mediaUrl) contentDoc.mediaUrl = day.mediaUrl;
    if (day.discipline) contentDoc.discipline = day.discipline;
    if (day.principle) contentDoc.principle = day.principle;
    if (day.beautyConnection) contentDoc.beautyConnection = day.beautyConnection;
    if (day.scripturePairing) contentDoc.scripturePairing = day.scripturePairing;

    // Build daily prompt document
    const promptDoc: Record<string, unknown> = {
      _id: dailyPromptId,
      _type: 'dailyPrompt',
      date: day.date,
      content: { _type: 'reference', _ref: contentItemId },
      promptQuestion: day.promptQuestion,
      curatorNote: day.curatorNote,
      actio: day.actio,
    };

    if (day.lectio) {
      promptDoc.lectio = {
        _type: 'object',
        text: day.lectio.text,
        attribution: day.lectio.attribution,
      };
    }

    if (day.auditio) {
      // Will be extended below with audioFile ref after upload
      promptDoc.auditio = {
        _type: 'object',
        title: day.auditio.title,
        artist: day.auditio.artist,
        ...(day.auditio.url ? { url: day.auditio.url } : {}),
      };
    }

    console.log(`Day ${day.dayNumber}: ${day.title}`);
    console.log(`  Content Item: ${contentItemId} (${day.contentType})`);
    console.log(`  Daily Prompt: ${dailyPromptId} (${day.date})`);

    if (!DRY_RUN) {
      try {
        // ── Upload image ──────────────────────────────────────────────────
        if (day.localImagePath) {
          if (fs.existsSync(day.localImagePath)) {
            const imageAssetId = await uploadImageAsset(day.localImagePath);
            contentDoc.image = {
              _type: 'image',
              asset: { _type: 'reference', _ref: imageAssetId },
            };
            console.log(`  ✅ Image uploaded → ${imageAssetId}`);
          } else {
            console.warn(`  ⚠️  Image file not found: ${day.localImagePath}`);
          }
        } else {
          console.warn(`  ⚠️  No localImagePath — add image manually in Sanity Studio`);
        }

        // ── Upload audio ──────────────────────────────────────────────────
        if (day.localAudioPath && day.auditio) {
          if (fs.existsSync(day.localAudioPath)) {
            const audioAssetId = await uploadAudioAsset(day.localAudioPath);
            (promptDoc.auditio as Record<string, unknown>).audioUrl = {
              _type: 'object',
              audioFile: {
                _type: 'file',
                asset: { _type: 'reference', _ref: audioAssetId },
              },
            };
            console.log(`  ✅ Audio uploaded → ${audioAssetId}`);
          } else {
            console.warn(`  ⚠️  Audio file not found: ${day.localAudioPath}`);
          }
        }

        // ── Write documents ───────────────────────────────────────────────
        await client.createOrReplace(contentDoc as any);
        console.log(`  ✅ Content Item created`);
        await client.createOrReplace(promptDoc as any);
        console.log(`  ✅ Daily Prompt created`);
      } catch (err: any) {
        console.error(`  ❌ Error: ${err.message}`);
      }
    } else {
      if (day.localImagePath) console.log(`  🖼  Image: ${path.basename(day.localImagePath)}`);
      if (day.localAudioPath) console.log(`  🎵  Audio: ${path.basename(day.localAudioPath)}`);
      console.log(`  📋 Content Item fields: ${Object.keys(contentDoc).filter(k => !k.startsWith('_')).join(', ')}`);
      console.log(`  📋 Daily Prompt fields: ${Object.keys(promptDoc).filter(k => !k.startsWith('_')).join(', ')}`);
    }

    contentItemIds.push(contentItemId);
    console.log('');
  }

  const seededCount = daysToSeed.length;
  console.log(`${'='.repeat(60)}`);
  console.log(`✨ Done! ${seededCount} content items + ${seededCount} daily prompts`);
  if (!DRY_RUN) {
    console.log(`\n⚠️  MANUAL STEPS REMAINING:`);
    console.log(`   Day 17 (Webb Deep Field): upload image manually in Sanity Studio.`);
  }
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
