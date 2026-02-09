import type { TraditionReflection } from "@/lib/types";

/**
 * Built-in tradition reflections (Church Fathers, Saints, Popes) for "Go deeper."
 * Used when Sanity has no traditionReflection documents yet. Theme: beauty → truth → God.
 */
export const defaultTraditionReflections: TraditionReflection[] = [
  {
    _id: "fallback-augustine",
    authorType: "church-father",
    title: "Beauty as a path to God",
    summary:
      "Created beauty points to the Creator. When we love what is beautiful in the right way—not clinging to it as an end in itself—our souls are drawn toward the One who is Beauty itself. The beauty of the world is a kind of language through which God speaks to the heart.",
    shortQuote: "Late have I loved you, O Beauty ever ancient, ever new.",
    source: "St. Augustine, Confessions",
    theme: "beauty",
    order: 0,
  },
  {
    _id: "fallback-benedict-xvi",
    authorType: "pope",
    title: "Art and the path to the transcendent",
    summary:
      "Beauty is a path to the divine. The artist’s intuition of beauty can open people to the transcendent and to the mystery of God. In a world that often ignores the spiritual, beauty can awaken the soul and lead it toward truth.",
    shortQuote: "Beauty leads us to the path of the transcendent.",
    source: "Benedict XVI, Meeting with Artists (2009)",
    theme: "beauty",
    order: 1,
  },
  {
    _id: "fallback-aquinas",
    authorType: "saint",
    title: "Truth, goodness, and beauty in God",
    summary:
      "Truth, goodness, and beauty are one in God. What we call the transcendentals are different ways of seeing the same divine reality. Beauty is not mere appearance—it reveals something true about the world and about God, who is the source of all that is beautiful.",
    source: "St. Thomas Aquinas, Summa theologiae",
    theme: "beauty-and-truth",
    order: 2,
  },
  {
    _id: "fallback-john-paul-ii",
    authorType: "pope",
    title: "Beauty and the mystery of God",
    summary:
      "Beauty is a key to truth and to the mystery of God. Through beauty we glimpse the divine. Artists who pursue beauty in good faith—even when they do not name God—can open the human heart to the One who is Beauty, Truth, and Goodness itself.",
    source: "St. John Paul II, Letter to Artists",
    theme: "beauty-and-truth",
    order: 3,
  },
  {
    _id: "fallback-john-of-the-cross",
    authorType: "saint",
    title: "Creation speaks of the Beloved",
    summary:
      "The beauty of creation speaks of the Beloved. The soul that learns to see with the eyes of faith encounters God through what is beautiful—in nature, in art, in the face of another. Contemplation of beauty can become a real encounter with the Lord.",
    source: "St. John of the Cross, Spiritual Canticle",
    theme: "encounter",
    order: 4,
  },
  {
    _id: "fallback-basil",
    authorType: "church-father",
    title: "Living from the beauty we have received",
    summary:
      "The beauty of creation calls us to glorify the Creator and to live in a way that reflects that beauty. We are not only to admire what is beautiful but to become signs of God’s beauty in the world—through charity, truth, and a life ordered to the good.",
    source: "St. Basil the Great, Hexaemeron",
    theme: "action",
    order: 5,
  },
];
