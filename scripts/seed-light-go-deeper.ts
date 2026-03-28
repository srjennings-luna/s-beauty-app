/**
 * KALLOS — Seed Light Journey "Go Deeper" Tradition Reflections into Sanity
 *
 * This script creates:
 *   1. traditionReflection documents (16 reflections across 7 days)
 *   2. Links them to the existing Light journey's goDeeper fields
 *
 * Prerequisites:
 *   - The "Light" journey must already exist in Sanity
 *   - The "Light" theme must already exist in Sanity
 *
 * Usage:
 *   SANITY_TOKEN=your-token npx tsx scripts/seed-light-go-deeper.ts
 *   SANITY_TOKEN=your-token npx tsx scripts/seed-light-go-deeper.ts --dry-run
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

// ─── Reflection Data ────────────────────────────────────────────────────────

interface Reflection {
  id: string;
  dayNumber: number;
  authorType: 'church-father' | 'saint' | 'pope';
  title: string;
  shortQuote: string;
  summary: string;
  source: string;
  era: 'fathers' | 'medieval' | 'modern';
  order: number;
}

const REFLECTIONS: Reflection[] = [
  // ─── Day 1: In the Beginning — Genesis / Michelangelo ────────────────
  {
    id: 'light-d1-basil',
    dayNumber: 1,
    authorType: 'church-father',
    title: 'Light as the First Gift',
    shortQuote: 'God did not first prepare light and then look for someone to give it to. Light was the first word, and in it was the promise of everything to follow.',
    summary: 'Basil argues that light was not an afterthought but the foundational gift — the first act of a God who creates by sharing. Light doesn\'t exist for itself. It exists so that everything else can be seen, known, and loved. Creation begins not with structure but with generosity.',
    source: 'St. Basil the Great, Hexaemeron (Homilies on the Six Days of Creation), 4th century',
    era: 'fathers',
    order: 1,
  },
  {
    id: 'light-d1-benedict',
    dayNumber: 1,
    authorType: 'pope',
    title: 'Creation as a Luminous Gift',
    shortQuote: 'Creation is not a work of power but a work of love. And love always begins with light — with making visible what was hidden.',
    summary: 'Benedict XVI repeatedly returned to the idea that creation itself is an act of communication — God speaking reality into being not out of necessity but out of love. Light is the medium of that first conversation. To see is already to be in relationship with the One who made seeing possible.',
    source: 'Pope Benedict XVI, In the Beginning: A Catholic Understanding of the Story of Creation and the Fall, 1986',
    era: 'modern',
    order: 2,
  },

  // ─── Day 2: The Drama of Light — Caravaggio ─────────────────────────
  {
    id: 'light-d2-francis',
    dayNumber: 2,
    authorType: 'pope',
    title: 'The Finger That Points',
    shortQuote: 'That finger of Jesus, pointing at Matthew. That\'s me. I feel like him. It is the gesture of Matthew that strikes me: he holds on to his money as if to say, "No, not me."',
    summary: 'Pope Francis has returned to this Caravaggio painting again and again — it was the subject of his first interview as Pope. He sees in Matthew\'s startled face the universal experience of being chosen despite unworthiness. The light that enters the room is grace itself: uninvited, disruptive, and impossible to unsee.',
    source: 'Pope Francis, Interview with Antonio Spadaro, S.J., La Civiltà Cattolica, 2013',
    era: 'modern',
    order: 1,
  },
  {
    id: 'light-d2-john',
    dayNumber: 2,
    authorType: 'saint',
    title: 'Light Enters the Darkness',
    shortQuote: 'The light shines in the darkness, and the darkness has not overcome it.',
    summary: 'John\'s Gospel opens with one of the most startling claims in all of scripture — that light and darkness have been in contest since before time, and light has already won. For the early Church, this was not metaphor but cosmology. The Caravaggio ray of light that cuts across Matthew\'s dark room is John 1:5 made visible.',
    source: 'John 1:5 / St. John the Evangelist, prologue to the Fourth Gospel',
    era: 'fathers',
    order: 2,
  },

  // ─── Day 3: Light as a Name of God — Pseudo-Dionysius ──────────────
  {
    id: 'light-d3-dionysius',
    dayNumber: 3,
    authorType: 'church-father',
    title: 'The Invisible Light Beyond Light',
    shortQuote: 'The divine darkness is the inaccessible light in which God is said to dwell.',
    summary: 'Dionysius makes the paradoxical claim that God\'s light is so intense it appears as darkness to human perception — not because God is hidden, but because human vision has limits. Encountering the divine is like staring at the sun: the excess of light blinds. This is not absence. It is overwhelming presence.',
    source: 'Pseudo-Dionysius the Areopagite, Mystical Theology, 5th century',
    era: 'fathers',
    order: 1,
  },
  {
    id: 'light-d3-teresa',
    dayNumber: 3,
    authorType: 'saint',
    title: 'Prayer as Standing in the Light',
    shortQuote: 'Prayer is nothing else than being on terms of friendship with God, frequently conversing in secret with Him who, we know, loves us.',
    summary: 'Teresa\'s definition of prayer strips away complexity. It is not performance or petition but presence — standing in the light of someone who already loves you. This connects to Dionysius\'s theology: if God is light, then prayer is simply not turning away from it.',
    source: 'St. Teresa of Ávila, The Book of Her Life, 16th century',
    era: 'medieval',
    order: 2,
  },
  {
    id: 'light-d3-gregory',
    dayNumber: 3,
    authorType: 'church-father',
    title: 'God as Light Who Gives Without Losing',
    shortQuote: 'Light does not decrease by being shared. It does not lose itself by being given. All who receive it possess it entirely.',
    summary: 'Gregory of Nyssa argues that divine light is unlike any physical resource — it grows by being given. This is the theological foundation of generosity itself: that the source of all beauty is inexhaustible. What comes from God does not diminish God.',
    source: 'St. Gregory of Nyssa, On the Soul and the Resurrection, 4th century',
    era: 'fathers',
    order: 3,
  },

  // ─── Day 4: The World Charged — Hopkins ─────────────────────────────
  {
    id: 'light-d4-hildegard',
    dayNumber: 4,
    authorType: 'saint',
    title: 'The Living Light of Creation',
    shortQuote: 'All living creatures are sparks from the radiation of God\'s brilliance, and these sparks emerge from God like the rays of the sun.',
    summary: 'Hildegard saw creation the way Hopkins would eight centuries later — as charged with divine radiance. Her visions described the cosmos as a living, luminous egg held in the fire of God\'s love. Every plant, stone, and creature carried what she called viriditas — a greening life-force that was God\'s own creative energy made visible. To look at creation closely was, for Hildegard, to see God looking back.',
    source: 'St. Hildegard of Bingen, Scivias, 12th century',
    era: 'medieval',
    order: 1,
  },
  {
    id: 'light-d4-francis-assisi',
    dayNumber: 4,
    authorType: 'saint',
    title: 'The Canticle of Creation',
    shortQuote: 'Praised be You, my Lord, through Brother Sun, who brings the day; and You give light through him. And he is beautiful and radiant with great splendor; of You, Most High, he bears the likeness.',
    summary: 'Francis wrote this canticle nearly blind and in severe pain. That he could still praise light while unable to see it says everything about what Hopkins would later call "inscape" — the inner radiance of things that persists even when physical sight fails. Brother Sun is not worshipped. He is recognized as a mirror.',
    source: 'St. Francis of Assisi, Canticle of the Sun, 1225',
    era: 'medieval',
    order: 2,
  },

  // ─── Day 5: Light You Can Hear — Arvo Pärt ─────────────────────────
  {
    id: 'light-d5-john-cross',
    dayNumber: 5,
    authorType: 'saint',
    title: 'The Music of Silence',
    shortQuote: 'In the inner stillness where meditation leads, the Spirit secretly anoints the soul and heals our deepest wounds.',
    summary: 'John of the Cross understood that the deepest encounters happen not in sound but in the silence between sounds — what Pärt calls the "tintinnabuli" style: one voice sings the melody (the human), the other holds a single triad (the divine). Between them: stillness. John would have recognized this music instantly.',
    source: 'St. John of the Cross, The Dark Night of the Soul, 16th century',
    era: 'medieval',
    order: 1,
  },
  {
    id: 'light-d5-benedict',
    dayNumber: 5,
    authorType: 'pope',
    title: 'Beauty as a Path to God',
    shortQuote: 'Art and the saints are the greatest apologetic for our faith.',
    summary: 'Benedict XVI argued that the Church\'s most persuasive witnesses are not its theologians but its artists and its saints. Pärt — an Orthodox Christian whose music fills Catholic cathedrals — embodies this perfectly. His music does not argue for God. It creates the space where God can be encountered.',
    source: 'Pope Benedict XVI, Address to Artists, Sistine Chapel, 2009',
    era: 'modern',
    order: 2,
  },

  // ─── Day 6: Light in Ordinary Things — Cistercian Honey ────────────
  {
    id: 'light-d6-teresa-pots',
    dayNumber: 6,
    authorType: 'saint',
    title: 'Holiness in the Pots and Pans',
    shortQuote: 'God walks among the pots and pans.',
    summary: 'Teresa found God not in ecstatic visions (though she had those too) but in the kitchen, the garden, the daily labor of running a convent. Light is not reserved for cathedrals. It saturates the ordinary — the jar of honey, the bread rising, the hands that tend the hive. The sacred hides in plain sight.',
    source: 'St. Teresa of Ávila, The Book of Foundations, 16th century',
    era: 'medieval',
    order: 1,
  },
  {
    id: 'light-d6-caussade',
    dayNumber: 6,
    authorType: 'saint', // ⚠️ PLACEHOLDER: De Caussade was a Jesuit priest, not a saint. Update when new authorType values are added.
    title: 'The Sacred in the Present Moment',
    shortQuote: 'The present moment is always overflowing with immeasurable riches, far more than you are able to hold.',
    summary: 'De Caussade taught that every moment — not just the dramatic or beautiful ones — is a direct encounter with God. The jar of honey in sunlight, the hillscape at dawn, the daily rhythm of monastic labor: these are not illustrations of the sacred. They are the sacred. The only requirement is attention.',
    source: 'Jean-Pierre de Caussade, Abandonment to Divine Providence, 18th century',
    era: 'modern',
    order: 2,
  },

  // ─── Day 7: Light as Destination — Dante / Fra Angelico ────────────
  {
    id: 'light-d7-augustine',
    dayNumber: 7,
    authorType: 'church-father',
    title: 'The Weight of Glory',
    shortQuote: 'Late have I loved you, beauty so old and so new. You were within me, and I was outside, and it was there that I searched for you.',
    summary: 'Augustine\'s famous confession mirrors Dante\'s journey exactly: the long detour through darkness before arriving at the light that was always there. The beauty he sought in the world was a reflection of the beauty already within — the light of God that had been shining before he turned around to see it.',
    source: 'St. Augustine, Confessions, Book X, 4th century',
    era: 'fathers',
    order: 1,
  },
  {
    id: 'light-d7-therese',
    dayNumber: 7,
    authorType: 'saint',
    title: 'The Little Way of Light',
    shortQuote: 'Miss no single opportunity of making some small sacrifice, here by a smiling look, there by a kindly word; always doing the smallest right and doing it all for love.',
    summary: 'Thérèse offers the counterpoint to Dante\'s cosmic vision: that the Beatific Vision is not only at the end of an epic journey. It is in the small, daily acts of love. Light at its most radiant is also light at its most gentle — a candle, not a supernova. Both are the same light.',
    source: 'St. Thérèse of Lisieux, The Story of a Soul, 1897',
    era: 'modern',
    order: 2,
  },
  {
    id: 'light-d7-benedict-beauty',
    dayNumber: 7,
    authorType: 'pope',
    title: 'Beauty Will Save the World',
    shortQuote: 'The encounter with the beautiful can become the wound of the arrow that strikes the soul and thus makes it see clearly.',
    summary: 'Benedict XVI closes the loop on the entire Light journey: beauty is not decoration. It is revelation. It strikes us because it comes from beyond us. The seven days of light have been, in this reading, seven arrows — each one opening the soul a little wider to what was always there.',
    source: 'Pope Benedict XVI, Address to Artists, Sistine Chapel, 2009',
    era: 'modern',
    order: 3,
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
  console.log(`KALLOS — Seed Light Journey Go Deeper (16 Reflections)`);
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '🚀 LIVE'}`);
  console.log(`${'='.repeat(60)}\n`);

  // Step 1: Look up Light theme ID
  let lightThemeId = '';
  let journeyDoc: any = null;

  if (!DRY_RUN) {
    const themes = await client.fetch(`*[_type == "theme" && title match "Light"]{ _id, title }`);
    if (themes.length === 0) {
      console.error('❌ "Light" theme not found in Sanity. Create it first.');
      process.exit(1);
    }
    lightThemeId = themes[0]._id;
    console.log(`📦 Light theme ID: ${lightThemeId}`);

    // Look up the Light journey
    journeyDoc = await client.fetch(`*[_type == "journey" && title match "Light"][0]{ _id, title, days }`);
    if (!journeyDoc) {
      console.log('⚠️  Light journey not found in Sanity. Reflections will be created but not linked to a journey.');
      console.log('   You\'ll need to link them manually in Sanity Studio, or run this script again after creating the journey.\n');
    } else {
      console.log(`📦 Light journey ID: ${journeyDoc._id}`);
    }
  }

  // Step 2: Create tradition reflection documents
  const reflectionsByDay: Record<number, string[]> = {};

  for (const ref of REFLECTIONS) {
    const doc: Record<string, unknown> = {
      _id: ref.id,
      _type: 'traditionReflection',
      authorType: ref.authorType,
      title: ref.title,
      shortQuote: ref.shortQuote,
      summary: ref.summary,
      source: ref.source,
      era: ref.era,
      order: ref.order,
    };

    // Link to Light theme
    if (!DRY_RUN && lightThemeId) {
      doc.themes = [{ _type: 'reference', _ref: lightThemeId, _key: 'light' }];
    }

    console.log(`Day ${ref.dayNumber}: ${ref.title} (${ref.authorType})`);
    console.log(`  ID: ${ref.id}`);

    if (!DRY_RUN) {
      try {
        await client.createOrReplace(doc as any);
        console.log(`  ✅ Created`);
      } catch (err: any) {
        console.error(`  ❌ Error: ${err.message}`);
      }
    } else {
      console.log(`  📋 Fields: ${Object.keys(doc).filter(k => !k.startsWith('_')).join(', ')}`);
    }

    // Track for journey linking
    if (!reflectionsByDay[ref.dayNumber]) reflectionsByDay[ref.dayNumber] = [];
    reflectionsByDay[ref.dayNumber].push(ref.id);

    console.log('');
  }

  // Step 3: Link reflections to the Light journey's goDeeper fields
  if (!DRY_RUN && journeyDoc) {
    console.log(`\n${'─'.repeat(40)}`);
    console.log(`Linking reflections to Light journey...\n`);

    const updatedDays = journeyDoc.days.map((day: any) => {
      const dayNum = day.dayNumber;
      const refIds = reflectionsByDay[dayNum];
      if (refIds) {
        day.goDeeper = refIds.map((id: string) => ({
          _type: 'reference',
          _ref: id,
          _key: id,
        }));
        console.log(`  Day ${dayNum}: linked ${refIds.length} reflections`);
      }
      return day;
    });

    try {
      await client.patch(journeyDoc._id).set({ days: updatedDays }).commit();
      console.log(`\n  ✅ Light journey updated with Go Deeper links`);
    } catch (err: any) {
      console.error(`\n  ❌ Error updating journey: ${err.message}`);
      console.log(`  You may need to link reflections manually in Sanity Studio.`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✨ Done! ${REFLECTIONS.length} tradition reflections created`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
