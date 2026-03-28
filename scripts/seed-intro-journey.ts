/**
 * KALLOS — Seed "Beauty, Truth & Goodness" Intro Journey into Sanity
 *
 * This script creates:
 *   1. contentItem documents (encounter content for each day)
 *   2. traditionReflection documents (Go Deeper voices, 3 per day = 21 total)
 *   3. The journey document itself (with 7 days, linking content + reflections)
 *
 * IMPORTANT: Images must be uploaded separately via Sanity Studio.
 * The journey document requires a heroImage and each day requires an openImage.
 * You'll also need to upload images for each content item.
 *
 * Prerequisites:
 *   - A theme for this journey (either create an "Introduction" theme or use existing ones)
 *
 * Usage:
 *   SANITY_TOKEN=your-token npx tsx scripts/seed-intro-journey.ts
 *   SANITY_TOKEN=your-token npx tsx scripts/seed-intro-journey.ts --dry-run
 */

import { createClient } from '@sanity/client';

const DRY_RUN = process.argv.includes('--dry-run');

const client = createClient({
  projectId: 'em44j9m8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

// ─── Content Items (Encounter content for each day) ─────────────────────────

interface ContentItemData {
  id: string;
  contentType: string;
  title: string;
  description: string;
  context: string;
  // Type-specific
  artist?: string;
  thinkerName?: string;
  composer?: string;
  author?: string;
  year?: string;
  performer?: string;
  craftTradition?: string;
  pointsToward?: string;
  quote?: { text: string; source: string };
  imageNote: string;
}

const CONTENT_ITEMS: ContentItemData[] = [
  {
    id: 'intro-encounter-d1',
    contentType: 'thinker',
    title: 'The Art of Being Moved: C.S. Lewis and Joy',
    thinkerName: 'C.S. Lewis',
    description: 'C.S. Lewis called it "joy" — not happiness, but a kind of longing that comes when beauty touches us. This feeling is one of the most real things we experience, and it tells you something crucial: you are capable of encountering something beyond yourself.',
    context: 'For centuries, Western philosophy taught that reality has three transcendental properties — Beauty, Truth, and Goodness. They are not separate. When something is truly beautiful, it also points toward truth. When we understand the truth of something, it calls us toward goodness. And when we act with genuine goodness, there is always beauty in it. This journey follows that natural progression: we are awakened by Beauty, led to understand Truth, and called toward Goodness.',
    quote: { text: 'The heart has eyes which the intellect cannot understand.', source: 'John Henry Newman' },
    imageNote: 'Fra Angelico detail — golden light, two figures in a moment of connection, or light through stained glass creating patterns on stone',
  },
  {
    id: 'intro-encounter-d2',
    contentType: 'sacred-art',
    title: 'The Calling of Saint Matthew',
    artist: 'Caravaggio',
    year: '1599–1600',
    description: 'Matthew sits in a dark corner counting coins. Then: a shaft of light breaks through the darkness. In that light, a finger points. Jesus enters the frame and points at Matthew — just Matthew. The light finds him. Everything changes.',
    context: 'What makes this painting transcendent is Caravaggio\'s understanding of light itself. For him, light is not mere illumination. It is the medium of divine action. When light touches something, that thing is no longer hidden — it is revealed, chosen, transformed. Caravaggio shows us the deepest truth about beauty: it is always a call. It always asks something of us. And it is always specific — it finds us where we are, not where we think we should be.',
    imageNote: 'High-resolution detail of Caravaggio\'s The Calling of Saint Matthew, focusing on the light touching Matthew\'s face. 2000px minimum.',
  },
  {
    id: 'intro-encounter-d3',
    contentType: 'thinker',
    title: 'Aquinas and the Splendor of Truth',
    thinkerName: 'Thomas Aquinas',
    description: 'Thomas Aquinas defined truth simply: it is the correspondence between the mind and reality. All genuine beauty is a form of truth. When something is truly beautiful, it is because it reveals something real.',
    context: 'Aquinas called it splendor veri — the splendor of truth. Beauty is what truth looks like when light falls on it. The beauty of Caravaggio\'s painting points to the truth that we can be seen, known, and called. The beauty of a face points to the truth that humans are worthy of love. The beauty of a landscape points to the truth that the world is not random — it is ordered, it speaks, it means something. When we encounter genuine beauty, we are not escaping from truth. We are being led toward it.',
    quote: { text: 'Pulchrum est id quod visum placet — Beauty is that which, when seen, gives pleasure.', source: 'Thomas Aquinas, Summa Theologiae' },
    imageNote: 'Byzantine mosaic with gold light or Renaissance painting showing divine light breaking through clouds',
  },
  {
    id: 'intro-encounter-d4',
    contentType: 'literature',
    title: 'God\'s Grandeur',
    author: 'Gerard Manley Hopkins',
    description: 'Hopkins wrote "The world is charged with the grandeur of God. It will flame out, like shining from shook foil." Every particular thing — every dappled thing — radiates divine light. Not as metaphor. As literal truth.',
    context: 'Hopkins invented the concept of "inscape" — the inner pattern that makes each thing uniquely itself. He saw that when you really look — at a landscape, at a person, at the grain of wood or the flight of a bird — you encounter truth. You encounter the Good behind all things. And you are transformed by the beauty of what is. Seeing beauty is a practice. It requires attention. The practice of really seeing is itself an act of prayer.',
    imageNote: 'Natural light breaking through in an unexpected way. Dappled light on forest floor, or morning mist lifting from hills.',
  },
  {
    id: 'intro-encounter-d5',
    contentType: 'music',
    title: 'Spiegel im Spiegel (Mirror in the Mirror)',
    composer: 'Arvo Pärt',
    performer: 'Tasmin Little (violin), Martin Roscoe (piano)',
    description: 'Listen to Pärt\'s "Spiegel im Spiegel" and you will hear what truth sounds like when it is freed from words. Each phrase rings out and reflects off itself, like light between two mirrors. The silence between phrases is not emptiness. It is presence held open.',
    context: 'Pärt developed a compositional technique called "tintinnabuli" — meaning "little bells." His music sounds like bells ringing in a great cathedral, each tone pure and crystalline. But what makes his music transcendent is not the notes themselves. It is the silence. Music speaks directly to the soul. That is why every monastery, every cathedral, prioritizes the beauty of music. It is not luxury. It is a transmission of truth that bypasses words and touches something essential in us.',
    imageNote: 'Light reflecting on still water creating ripples, or frost crystals catching light, or a bell in a cathedral from below',
  },
  {
    id: 'intro-encounter-d6',
    contentType: 'food-wine',
    title: 'The Liturgy of Eating Well: Monastic Bread',
    craftTradition: 'Benedictine monastic bakery, southern Italy, 8 centuries',
    description: 'A monastery in southern Italy has made bread for eight centuries using the same method. Flour, water, salt, time. The bread is beautiful because it is true — it contains nothing but what is essential. It tastes like the place it comes from.',
    context: 'The Rule of Saint Benedict teaches that when you feed someone, you are feeding Christ. Eating is not mere fuel. It is a liturgy — a sacred action. When you choose to eat something made with care and integrity, you are making a spiritual statement: I believe that the world matters. I believe that what we consume shapes who we become. To taste food made with integrity is to taste goodness made visible.',
    pointsToward: 'The shared table and the bread broken together are images of communion itself — beauty, truth, and goodness made edible.',
    imageNote: 'Bread, broken and beautiful, in sunlight. Or hands working with dough. Or a simple monastery kitchen.',
  },
  {
    id: 'intro-encounter-d7',
    contentType: 'sacred-art',
    title: 'The Return of the Prodigal Son',
    artist: 'Rembrandt van Rijn',
    year: '1667',
    description: 'An old man — worn, broken, at the end of his life — painted his understanding of what it means to be received back into love. A younger man kneels, broken and ashamed. And the father — ancient, hands trembling — touches him. The light falls on the place where the two bodies meet.',
    context: 'This painting contains everything we have learned. The beauty of light and form. The truth it reveals — that we can be known and still loved, that returning home is possible. And the goodness it calls forth — the tenderness of touch, the willingness to receive another without judgment. Rembrandt understood that the deepest vision of human life is the vision of being seen fully and loved completely anyway.',
    imageNote: 'Rembrandt\'s Return of the Prodigal Son, full composition or detail of the embrace. 2500px+ high-resolution.',
  },
];

// ─── Tradition Reflections (Go Deeper, 3 per day) ───────────────────────────

interface TraditionData {
  id: string;
  dayNumber: number;
  authorType: 'church-father' | 'saint' | 'pope';
  title: string;
  figureName: string;
  era: string;
  shortQuote: string;
  summary: string;
  source: string;
  order: number;
}

const TRADITIONS: TraditionData[] = [
  // Day 1
  { id: 'intro-tr-d1-plato', dayNumber: 1, authorType: 'church-father', title: 'Beauty as the Splendor of Truth', figureName: 'Plato', era: 'fathers', shortQuote: 'Beauty is the splendor of truth, seen in its proper form.', summary: 'For Plato, beauty is not decorative. It is the visible form of truth itself. When you feel drawn to beauty, you are being drawn toward reality — toward what is actually true, even if you can\'t yet name it.', source: 'Plato, Phaedrus, 5th–4th century BCE', order: 1 },
  { id: 'intro-tr-d1-augustine', dayNumber: 1, authorType: 'church-father', title: 'Created Beauty Points Beyond Itself', figureName: 'Augustine of Hippo', era: 'fathers', shortQuote: 'How can beauty bring you to the Beautiful? Ask the earth, and it will cry out "I am beautiful, but I am not the Beautiful."', summary: 'Augustine teaches that created beauty — a painting, a landscape, a face — is always a sign of something greater. Beauty makes us homesick for God because we were made for God, and beautiful things echo that truth.', source: 'St. Augustine, Confessions, 4th century', order: 2 },
  { id: 'intro-tr-d1-jpii', dayNumber: 1, authorType: 'pope', title: 'Beauty as Divine Presence', figureName: 'John Paul II', era: 'modern', shortQuote: 'Beauty is not primarily a gateway to the divine; it is divine presence itself, made visible in form.', summary: 'Modern theology affirms the ancient wisdom: beauty is not merely a sign. When we stand before genuine beauty, we are encountering the divine in a way that bypasses language and doctrine.', source: 'Pope John Paul II, Letter to Artists, 1999', order: 3 },

  // Day 2
  { id: 'intro-tr-d2-dionysius', dayNumber: 2, authorType: 'church-father', title: 'Light as Divine Action', figureName: 'Pseudo-Dionysius', era: 'fathers', shortQuote: 'The Good emanates as light does from the sun — not diminished by giving, but eternally pouring forth.', summary: 'The Eastern Christian mystical tradition taught that light is more than a symbol for God\'s presence. It is actually how God acts in the world. Like the sun giving without diminishing, the source of all goodness pours forth endlessly.', source: 'Pseudo-Dionysius the Areopagite, The Divine Names, 5th century', order: 1 },
  { id: 'intro-tr-d2-aquinas', dayNumber: 2, authorType: 'saint', title: 'Physical Light Participates in the Divine', figureName: 'Thomas Aquinas', era: 'medieval', shortQuote: 'God is light, and the light we see in creation participates in His nature.', summary: 'Medieval theology developed the idea that physical light actually participates in divine reality. When Caravaggio paints light choosing Matthew, he is painting a real spiritual truth.', source: 'Thomas Aquinas, Summa Theologiae, 13th century', order: 2 },
  { id: 'intro-tr-d2-john-cross', dayNumber: 2, authorType: 'saint', title: 'The Soul Becomes Luminous', figureName: 'John of the Cross', era: 'medieval', shortQuote: 'The soul touched by divine light becomes luminous itself.', summary: 'The Spanish mystic understood that being "called" by divine action doesn\'t just change you externally. It transforms you from within. You become a carrier of the light you\'ve encountered.', source: 'St. John of the Cross, The Living Flame of Love, 16th century', order: 3 },

  // Day 3
  { id: 'intro-tr-d3-dante', dayNumber: 3, authorType: 'saint', title: 'The Truest Things Come Clothed in Beauty', figureName: 'Dante Alighieri', era: 'medieval', shortQuote: 'In its effect is every virtue known.', summary: 'The great medieval poet understood that the truest things always come clothed in beauty. Love is true, so love is beautiful. Deception is false, so deception is ultimately ugly, no matter how it\'s painted.', source: 'Dante Alighieri, Paradiso, 14th century', order: 1 },
  { id: 'intro-tr-d3-balthasar', dayNumber: 3, authorType: 'saint', title: 'Truth Is Symphonic', figureName: 'Hans Urs von Balthasar', era: 'modern', shortQuote: 'Truth is symphonic. It shows itself, and is not merely thought about. It is given to our senses before it is given to our intellect.', summary: 'A modern theologian recovering ancient wisdom: we know the deepest truths through beauty before we understand them with our minds. This is why every genuine spiritual tradition uses art, music, and poetry, not just doctrine.', source: 'Hans Urs von Balthasar, The Glory of the Lord, 20th century', order: 2 },
  { id: 'intro-tr-d3-weil', dayNumber: 3, authorType: 'saint', title: 'Beauty Compels Surrender', figureName: 'Simone Weil', era: 'modern', shortQuote: 'Beauty is the only thing that compels us to bow before what we do not understand.', summary: 'A modern Christian mystic: beauty breaks through our defenses in a way argument cannot. When we are genuinely moved by beauty, we are surrendering ourselves to truth we haven\'t yet learned to articulate.', source: 'Simone Weil, Gravity and Grace, 20th century', order: 3 },

  // Day 4
  { id: 'intro-tr-d4-basil', dayNumber: 4, authorType: 'church-father', title: 'Creation as God\'s Book', figureName: 'Basil the Great', era: 'fathers', shortQuote: 'The heavens declare the glory of God; and the firmament showeth his handiwork.', summary: 'An early Church Father taught that the natural world is a book written by God. Every creature, every landscape is a word God speaks. To contemplate nature is to contemplate the divine directly.', source: 'St. Basil the Great, Hexaemeron, 4th century', order: 1 },
  { id: 'intro-tr-d4-bonaventure', dayNumber: 4, authorType: 'saint', title: 'The World as Ladder to God', figureName: 'Bonaventure', era: 'medieval', shortQuote: 'The whole world is a ladder by which we ascend to God.', summary: 'Medieval theology saw creation not as separate from the sacred, but as its literal expression. To contemplate a flower or a stone is to be contemplating divine action made visible.', source: 'St. Bonaventure, The Mind\'s Journey to God, 13th century', order: 2 },
  { id: 'intro-tr-d4-tolkien', dayNumber: 4, authorType: 'saint', title: 'We Are Sub-Creators', figureName: 'J.R.R. Tolkien', era: 'modern', shortQuote: 'We are sub-creators, made in the image of the Creator. Our art participates in the act of creation itself.', summary: 'A modern Christian understood that the human capacity to see beauty in creation and create beauty in response is itself a participation in divine work. When we truly see the world, we become co-creators with God.', source: 'J.R.R. Tolkien, On Fairy-Stories, 1947', order: 3 },

  // Day 5
  { id: 'intro-tr-d5-dionysius', dayNumber: 5, authorType: 'church-father', title: 'Divine Reality Is Musical', figureName: 'Pseudo-Dionysius', era: 'fathers', shortQuote: 'The Godhead is music, and all creation responds in harmony.', summary: 'Ancient Christian mysticism taught that divine reality is fundamentally musical — ordered, harmonic, resonant. When we hear beautiful music, we are hearing a reflection of the underlying structure of reality itself.', source: 'Pseudo-Dionysius the Areopagite, 5th century', order: 1 },
  { id: 'intro-tr-d5-john-cross', dayNumber: 5, authorType: 'saint', title: 'Letting Go to Encounter Truth', figureName: 'John of the Cross', era: 'medieval', shortQuote: 'The soul that is attached to anything will not arrive at the liberty of divine union.', summary: 'The Spanish mystic taught that the greatest truths come when we let go of our need to understand or control. In silence and surrender, we encounter what words cannot reach.', source: 'St. John of the Cross, The Ascent of Mount Carmel, 16th century', order: 2 },
  { id: 'intro-tr-d5-merton', dayNumber: 5, authorType: 'saint', title: 'Silence as God\'s Language', figureName: 'Thomas Merton', era: 'modern', shortQuote: 'Silence is the language God loves best.', summary: 'A modern contemplative monk recovered the ancient wisdom that in silence — not absence of sound, but the space of receptivity — we most deeply encounter truth.', source: 'Thomas Merton, New Seeds of Contemplation, 1962', order: 3 },

  // Day 6
  { id: 'intro-tr-d6-augustine', dayNumber: 6, authorType: 'church-father', title: 'Beauty as a Call to Love', figureName: 'Augustine of Hippo', era: 'fathers', shortQuote: 'When we experience beauty, we are experiencing a call to love.', summary: 'Augustine taught that beauty is inherently relational. We are not moved by beauty to retreat into ourselves, but to move toward others. To share, to give, to serve.', source: 'St. Augustine, On True Religion, 4th century', order: 1 },
  { id: 'intro-tr-d6-benedict', dayNumber: 6, authorType: 'saint', title: 'Every Tool a Sacred Vessel', figureName: 'Saint Benedict', era: 'medieval', shortQuote: 'Treat every guest as Christ. Treat every tool as a sacred vessel.', summary: 'The monastic tradition understands that goodness is embodied in everyday life. How we work, how we eat, how we welcome the stranger — these are not separate from prayer. They are prayer.', source: 'The Rule of Saint Benedict, 6th century', order: 2 },
  { id: 'intro-tr-d6-day', dayNumber: 6, authorType: 'saint', title: 'Goodness Is Always About Another Person', figureName: 'Dorothy Day', era: 'modern', shortQuote: 'I really only love God as much as I love the person I love the least.', summary: 'A modern Christian activist recovered the deepest meaning of the good: it is concrete, particular, and always expressed in how we treat the most vulnerable. Goodness is never abstract.', source: 'Dorothy Day, The Long Loneliness, 1952', order: 3 },

  // Day 7
  { id: 'intro-tr-d7-dante', dayNumber: 7, authorType: 'saint', title: 'Following Beauty to the End', figureName: 'Dante Alighieri', era: 'medieval', shortQuote: 'In the eternal light I saw... and in that vision, I understood what love is: the force that moves all things.', summary: 'Dante spent his life following a vision of Beauty. It led him through Hell and Purgatory, through the Heavens, and finally to the Beatific Vision — the direct encounter with divine love. His life teaches: when you follow beauty with your whole heart, it transforms you.', source: 'Dante Alighieri, Paradiso, Canto XXXIII, 14th century', order: 1 },
  { id: 'intro-tr-d7-jpii', dayNumber: 7, authorType: 'pope', title: 'The Three Transcendentals United', figureName: 'John Paul II', era: 'modern', shortQuote: 'The splendor of truth can shine forth only when the heart is purified... And this transformation happens through beauty.', summary: 'A modern pope understood that the three transcendentals work together. We cannot encounter deep truth without being transformed by beauty. And we cannot embody goodness without having been changed by both. This is the complete vision.', source: 'Pope John Paul II, Veritatis Splendor, 1993', order: 2 },
  { id: 'intro-tr-d7-you', dayNumber: 7, authorType: 'saint', title: 'Your Voice in the Conversation', figureName: 'You — The Seeker', era: 'modern', shortQuote: 'I came here because something moved me. I have learned what that movement means. Now I will live it.', summary: 'You are part of this ancient conversation. Your voice, your encounter with beauty, your commitment to seeking truth and living the good — these matter. You belong to a tradition that stretches back to Plato and extends forward into a future you will help create.', source: 'Your own journey, beginning now', order: 3 },
];

// ─── Journey Day Structure ──────────────────────────────────────────────────

interface JourneyDayData {
  dayNumber: number;
  dayTitle: string;
  openText: string;
  contentItemId: string;
  reflectQuestions: string[];
  connectThread: string;
  traditionIds: string[];
}

const JOURNEY_DAYS: JourneyDayData[] = [
  {
    dayNumber: 1,
    dayTitle: 'You felt something',
    openText: 'You came here because something moved you. A painting in a museum. A line of poetry. A piece of music. The beauty of a place. Something you couldn\'t quite name, but it mattered. That feeling is not an accident. It is an invitation.',
    contentItemId: 'intro-encounter-d1',
    reflectQuestions: [
      'What is the most beautiful thing you\'ve encountered in the past year? What did it make you want to do?',
      'When you felt that pull of beauty, what made you feel most alive?',
    ],
    connectThread: 'Beauty is never accidental. It always points somewhere. Tomorrow, we meet a painter who understood this perfectly.',
    traditionIds: ['intro-tr-d1-plato', 'intro-tr-d1-augustine', 'intro-tr-d1-jpii'],
  },
  {
    dayNumber: 2,
    dayTitle: 'The painter who saw God\'s light',
    openText: 'Stand in front of this painting and you understand something immediately: light is not neutral. It chooses. It illuminates and it awakens. It is an act of grace.',
    contentItemId: 'intro-encounter-d2',
    reflectQuestions: [
      'When has something or someone "called" you — singled you out, seen you in a way that changed things?',
      'What did it feel like to be truly seen?',
    ],
    connectThread: 'Caravaggio painted light as divine action. But where does this light come from? Tomorrow, we meet a mystic who spent his life thinking about exactly this question.',
    traditionIds: ['intro-tr-d2-dionysius', 'intro-tr-d2-aquinas', 'intro-tr-d2-john-cross'],
  },
  {
    dayNumber: 3,
    dayTitle: 'Where beauty points',
    openText: 'At some point, every genuine beauty asks the same silent question: "Where do I come from? What does it mean that I exist?"',
    contentItemId: 'intro-encounter-d3',
    reflectQuestions: [
      'What truth about yourself or the world has been revealed to you through beauty?',
      'Can you think of something you find beautiful precisely because it tells the truth?',
    ],
    connectThread: 'If beauty reveals truth, then every beautiful thing is telling us something about what is real. Tomorrow, we listen to a poet who spent his life learning to hear what creation is saying.',
    traditionIds: ['intro-tr-d3-dante', 'intro-tr-d3-balthasar', 'intro-tr-d3-weil'],
  },
  {
    dayNumber: 4,
    dayTitle: 'Everything speaks',
    openText: 'A poet walked through an ordinary world and saw it burning with light. He spent his life trying to help others see what he saw. That seeing is available to you.',
    contentItemId: 'intro-encounter-d4',
    reflectQuestions: [
      'What did you notice today that is more beautiful than you realized?',
      'Where do you see the "shining" that Hopkins describes — in your own life, in nature, in ordinary things?',
    ],
    connectThread: 'When we see the world as Hopkins did, we begin to understand its music. Tomorrow, we listen to what happens when sound becomes a language for the sacred.',
    traditionIds: ['intro-tr-d4-basil', 'intro-tr-d4-bonaventure', 'intro-tr-d4-tolkien'],
  },
  {
    dayNumber: 5,
    dayTitle: 'The language of silence',
    openText: 'Some truths cannot be spoken. They can only be heard in the spaces between words, in sound that seems to come from nowhere and everywhere at once.',
    contentItemId: 'intro-encounter-d5',
    reflectQuestions: [
      'What music or sound has ever moved you without you understanding why?',
      'What truth about yourself or the world have you learned through beauty that you could never explain in words?',
    ],
    connectThread: 'Truth speaks through light and through sound. But the deepest truths call us to do something. They call us toward the good. Tomorrow, we meet a contemplative tradition that understands action as prayer.',
    traditionIds: ['intro-tr-d5-dionysius', 'intro-tr-d5-john-cross', 'intro-tr-d5-merton'],
  },
  {
    dayNumber: 6,
    dayTitle: 'What beauty asks of us',
    openText: 'Beauty is not just something we observe. It is something that transforms us into people who are capable of responding to it. And the deepest response to beauty is always an act of love.',
    contentItemId: 'intro-encounter-d6',
    reflectQuestions: [
      'What small, good thing could you do today in response to beauty? How could you live out what has moved you?',
      'What would it mean to treat ordinary things (food, time, conversation) as sacred?',
    ],
    connectThread: 'Beauty, truth, and goodness are not separate. Tomorrow, we see them whole — the complete vision of a life transformed by encounter with what is sacred.',
    traditionIds: ['intro-tr-d6-augustine', 'intro-tr-d6-benedict', 'intro-tr-d6-day'],
  },
  {
    dayNumber: 7,
    dayTitle: 'The complete vision',
    openText: 'You have followed a path. From the moment beauty moved you, through the truths it revealed, to the good it calls you toward. Now we look at the vision whole — what it means to live a life awakened to beauty, shaped by truth, and oriented toward goodness.',
    contentItemId: 'intro-encounter-d7',
    reflectQuestions: [
      'What has this week changed in how you see the world?',
      'What beauty called you here — and what is it calling you toward now?',
    ],
    connectThread: 'You have completed an introduction. Five deeper Journeys await: Light, Silence, Suffering & Beauty, Creation, and Home / The Restless Heart. Explore them when you are ready.',
    traditionIds: ['intro-tr-d7-dante', 'intro-tr-d7-jpii', 'intro-tr-d7-you'],
  },
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_TOKEN && !DRY_RUN) {
    console.error('❌ Set SANITY_TOKEN environment variable. Get one from:');
    console.error('   https://www.sanity.io/manage/project/em44j9m8/api#tokens');
    console.error('   Or run with --dry-run to preview without writing.');
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KALLOS — Seed Intro Journey: Beauty, Truth & Goodness`);
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '🚀 LIVE'}`);
  console.log(`${'='.repeat(60)}\n`);

  // ── Step 1: Create Content Items ──────────────────────────────────────
  console.log('📦 STEP 1: Creating Content Items (7 encounter pieces)\n');

  for (const item of CONTENT_ITEMS) {
    const doc: Record<string, unknown> = {
      _id: item.id,
      _type: 'contentItem',
      contentType: item.contentType,
      title: item.title,
      description: item.description,
      context: item.context,
    };

    if (item.artist) doc.artist = item.artist;
    if (item.thinkerName) doc.thinkerName = item.thinkerName;
    if (item.composer) doc.composer = item.composer;
    if (item.author) doc.author = item.author;
    if (item.year) doc.year = item.year;
    if (item.performer) doc.performer = item.performer;
    if (item.craftTradition) doc.craftTradition = item.craftTradition;
    if (item.pointsToward) doc.pointsToward = item.pointsToward;
    if (item.quote) doc.quote = { _type: 'object', text: item.quote.text, source: item.quote.source };

    console.log(`  ${item.id}: ${item.title} (${item.contentType})`);

    if (!DRY_RUN) {
      try {
        await client.createOrReplace(doc as any);
        console.log(`    ✅ Created`);
      } catch (err: any) {
        console.error(`    ❌ ${err.message}`);
      }
    }
  }

  // ── Step 2: Create Tradition Reflections ──────────────────────────────
  console.log(`\n📦 STEP 2: Creating Tradition Reflections (${TRADITIONS.length} voices)\n`);

  for (const tr of TRADITIONS) {
    const doc: Record<string, unknown> = {
      _id: tr.id,
      _type: 'traditionReflection',
      authorType: tr.authorType,
      title: tr.title,
      shortQuote: tr.shortQuote,
      summary: tr.summary,
      source: tr.source,
      era: tr.era,
      order: tr.order,
    };

    console.log(`  Day ${tr.dayNumber}: ${tr.figureName} — "${tr.title}"`);

    if (!DRY_RUN) {
      try {
        await client.createOrReplace(doc as any);
        console.log(`    ✅ Created`);
      } catch (err: any) {
        console.error(`    ❌ ${err.message}`);
      }
    }
  }

  // ── Step 3: Create Journey Document ───────────────────────────────────
  console.log(`\n📦 STEP 3: Creating Journey document\n`);

  const journeyDoc: Record<string, unknown> = {
    _id: 'journey-intro-beauty-truth-goodness',
    _type: 'journey',
    title: 'Beauty, Truth & Goodness',
    slug: { _type: 'slug', current: 'beauty-truth-goodness' },
    description: 'A 7-day introduction to KALLOS designed for first-time users and curious seekers. What happens when we follow beauty into truth, and truth into the good? No religious background assumed. Led by beauty, not belief.',
    estimatedMinutesPerDay: 10,
    isPublished: false, // Set to true after images are added
    order: 0, // Appears first
    days: JOURNEY_DAYS.map(day => ({
      _type: 'journeyDay',
      _key: `day-${day.dayNumber}`,
      dayNumber: day.dayNumber,
      dayTitle: day.dayTitle,
      openText: day.openText,
      encounterContent: { _type: 'reference', _ref: day.contentItemId },
      reflectQuestions: day.reflectQuestions,
      connectThread: day.connectThread,
      goDeeper: day.traditionIds.map(id => ({
        _type: 'reference',
        _ref: id,
        _key: id,
      })),
    })),
  };

  console.log(`  Journey: Beauty, Truth & Goodness (7 days)`);
  console.log(`  ID: journey-intro-beauty-truth-goodness`);
  console.log(`  Published: false (set to true after adding images)`);

  if (!DRY_RUN) {
    try {
      await client.createOrReplace(journeyDoc as any);
      console.log(`  ✅ Journey created`);
    } catch (err: any) {
      console.error(`  ❌ ${err.message}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ Done!`);
  console.log(`   ${CONTENT_ITEMS.length} content items`);
  console.log(`   ${TRADITIONS.length} tradition reflections`);
  console.log(`   1 journey document (7 days)`);
  if (!DRY_RUN) {
    console.log(`\n⚠️  NEXT STEPS:`);
    console.log(`   1. Upload images for all content items in Sanity Studio`);
    console.log(`   2. Upload openImage for each journey day`);
    console.log(`   3. Upload heroImage for the journey`);
    console.log(`   4. Create/assign a theme reference for the journey`);
    console.log(`   5. Set isPublished to true when ready`);
  }
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
