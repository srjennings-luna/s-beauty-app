import { Episode } from "@/lib/types";

export const episodes: Episode[] = [
  // === RELEASED EPISODES ===
  {
    id: "s1e01",
    season: 1,
    episodeNumber: 1,
    title: "Seeking Beauty in Vatican City",
    shortTitle: "Vatican City",
    summary:
      "David Henrie explores the artistic and spiritual heart of the Vatican, discovering how beauty serves as 'the language of the divine and a reflection of God' through architecture, sculpture, and everyday encounters with the sacred.",
    locationLabel: "Vatican City, Rome, Italy",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg/1280px-St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg",
    durationMinutes: 30,
    airDate: "January 19, 2026",
    ewtnPlusUrl: "https://www.ewtn.com/tv/shows/seeking-beauty",
    isReleased: true,
    featuredExperts: [
      { name: "Elizabeth Lev", role: "Art Historian" },
      { name: "Kelly Medford", role: "Artist" },
      { name: "Ilaria Della Bidia", role: "Vatican Guide" },
      { name: "Fulvio De Bonis", role: "Swiss Guard" },
    ],
    artworks: [
      {
        id: "s1e01-art01",
        title: "St. Peter's Square Colonnade",
        artist: "Gian Lorenzo Bernini",
        year: "1656-1667",
        description:
          "The magnificent colonnades of St. Peter's Square embrace pilgrims as they enter the Vatican, with 284 columns arranged in four rows, representing the welcoming arms of Mother Church.",
        historicalSummary:
          "Bernini designed these sweeping colonnades to represent the 'maternal arms of Mother Church' embracing the faithful. The 284 columns arranged in four rows create a space that can hold 300,000 people, serving both practical and spiritual purposes.",
        scripturePairing: {
          verse: "How often I have longed to gather your children together, as a hen gathers her chicks under her wings.",
          reference: "Matthew 23:37",
        },
        episodeId: "s1e01",
        city: "Vatican City",
        country: "Italy",
        coordinates: { lat: 41.9022, lng: 12.4568 },
        locationName: "St. Peter's Square",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg/1280px-St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg",
        order: 1,
        reflectionQuestions: [
          "When have you felt welcomed or embraced by a sacred place?",
          "How does this space prepare your heart for prayer?",
        ],
      },
      {
        id: "s1e01-art02",
        title: "Pietà",
        artist: "Michelangelo Buonarroti",
        year: "1498-1499",
        description:
          "Michelangelo's masterpiece depicts the Virgin Mary cradling the body of Christ after the Crucifixion. Carved when the artist was just 23, it remains the only work he ever signed.",
        historicalSummary:
          "Michelangelo carved this masterpiece at age 23 for French Cardinal Jean de Bilhères-Lagraulas. It depicts Mary holding the body of Christ after the Crucifixion. The work is remarkable for Mary's youthful appearance, which Michelangelo explained by saying that pure, virtuous women maintain their youth. It is the only work Michelangelo ever signed—across Mary's sash.",
        scripturePairing: {
          verse: "Is it nothing to you, all you who pass by? Look and see if there is any sorrow like my sorrow.",
          reference: "Lamentations 1:12",
        },
        episodeId: "s1e01",
        city: "Vatican City",
        country: "Italy",
        coordinates: { lat: 41.9021, lng: 12.4536 },
        locationName: "St. Peter's Basilica - North Aisle",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Michelangelo%27s_Pieta_5450_cropncleaned_edit.jpg/800px-Michelangelo%27s_Pieta_5450_cropncleaned_edit.jpg",
        order: 2,
        reflectionQuestions: [
          "What emotions arise as you contemplate Mary holding her Son?",
          "How does sorrow become beautiful in this sculpture?",
          "Where have you found beauty in moments of grief?",
        ],
      },
      {
        id: "s1e01-art03",
        title: "Baldacchino",
        artist: "Gian Lorenzo Bernini",
        year: "1624-1633",
        description:
          "This massive bronze canopy stands 98 feet tall over the papal altar, directly above St. Peter's tomb. The twisted 'Solomonic' columns reference the Temple of Jerusalem, connecting the New Covenant to the Old.",
        historicalSummary:
          "Pope Urban VIII commissioned Bernini to create this massive bronze canopy using bronze stripped from the Pantheon's portico. Standing 98 feet tall over the papal altar, it marks the spot directly above St. Peter's tomb. The twisted 'Solomonic' columns reference the Temple of Jerusalem, connecting the New Covenant to the Old.",
        scripturePairing: {
          verse: "You are Peter, and on this rock I will build my church.",
          reference: "Matthew 16:18",
        },
        episodeId: "s1e01",
        city: "Vatican City",
        country: "Italy",
        coordinates: { lat: 41.9022, lng: 12.4534 },
        locationName: "St. Peter's Basilica - Papal Altar",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Baldachino_San_Pietro.jpg/800px-Baldachino_San_Pietro.jpg",
        order: 3,
        reflectionQuestions: [
          "How does this canopy draw your eyes upward toward heaven?",
          "What does it mean to build something that honors the foundation of the Church?",
        ],
      },
      {
        id: "s1e01-art04",
        title: "St. Peter's Basilica",
        artist: "Bramante, Michelangelo, Maderno, Bernini",
        year: "1506-1626",
        description:
          "The largest church in the world, St. Peter's Basilica represents 120 years of collaboration among the greatest architects of the Renaissance and Baroque periods, built over the tomb of St. Peter.",
        historicalSummary:
          "Construction spanned 120 years and involved the greatest architects of the age: Bramante designed the original plan, Michelangelo created the dome, Maderno extended the nave and built the facade, and Bernini added the colonnade and interior decorations. It stands over the tomb of St. Peter, the first pope.",
        scripturePairing: {
          verse: "Unless the Lord builds the house, the builders labor in vain.",
          reference: "Psalm 127:1",
        },
        episodeId: "s1e01",
        city: "Vatican City",
        country: "Italy",
        coordinates: { lat: 41.9022, lng: 12.4539 },
        locationName: "St. Peter's Basilica",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/1280px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg",
        order: 4,
        reflectionQuestions: [
          "What does the grandeur of this building say about what lies within?",
          "How can exterior beauty point us toward interior truth?",
        ],
      },
    ],
    reflections: [
      {
        id: "s1e01-ref01",
        episodeId: "s1e01",
        question:
          "Where in your life has beauty helped you trust God more deeply?",
        suggestedUse: "family",
      },
      {
        id: "s1e01-ref02",
        episodeId: "s1e01",
        question:
          "What is one beautiful thing you encountered today that you might have overlooked?",
        suggestedUse: "individual",
      },
    ],
  },
  {
    id: "s1e02",
    season: 1,
    episodeNumber: 2,
    title: "Seeking Beauty in Rome",
    shortTitle: "Rome",
    summary:
      "Explore the Eternal City's artistic treasures, including a moving look at Caravaggio restoration work that reveals how even the great masters were human—they made mistakes, painted over errors, and struggled with their craft.",
    locationLabel: "Rome, Italy",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg/1280px-The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg",
    durationMinutes: 33,
    airDate: "January 19, 2026",
    ewtnPlusUrl: "https://www.ewtn.com/tv/shows/seeking-beauty",
    isReleased: true,
    featuredExperts: [
      { name: "Art Restoration Specialists", role: "Conservators" },
      { name: "Local Artisans", role: "Craftspeople" },
    ],
    artworks: [
      {
        id: "s1e02-art01",
        title: "The Calling of St. Matthew",
        artist: "Michelangelo Merisi da Caravaggio",
        year: "1599-1600",
        description:
          "Located in San Luigi dei Francesi, this masterpiece depicts the moment Christ calls Matthew from his life as a tax collector. A beam of light cuts through the darkness, symbolizing divine grace piercing worldly concerns.",
        historicalSummary:
          "Caravaggio revolutionized religious painting with his dramatic use of light and shadow (chiaroscuro) and unflinching realism. This painting shows the moment Jesus calls Matthew from his tax booth. The beam of light entering from the right represents divine grace—Christ's call cutting through the darkness of sin.",
        scripturePairing: {
          verse: "As Jesus went on from there, he saw a man named Matthew sitting at the tax collector's booth. 'Follow me,' he told him, and Matthew got up and followed him.",
          reference: "Matthew 9:9",
        },
        episodeId: "s1e02",
        city: "Rome",
        country: "Italy",
        coordinates: { lat: 41.8992, lng: 12.4742 },
        locationName: "San Luigi dei Francesi",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg/1280px-The_Calling_of_Saint_Matthew-Caravaggo_%281599-1600%29.jpg",
        order: 1,
        reflectionQuestions: [
          "Have you ever felt God calling you away from something comfortable into something unknown?",
          "How does light represent grace in your own life?",
          "What would it mean for you to 'get up and follow'?",
        ],
      },
      {
        id: "s1e02-art02",
        title: "Caravaggio Restoration Work",
        artist: "Michelangelo Merisi da Caravaggio",
        year: "c. 1600",
        description:
          "The episode features a moving scene of Caravaggio restoration work, showing how artists were human and made mistakes—revealing places where the master completely painted over what he did and tried approaches that didn't work.",
        historicalSummary:
          "Close examination during restoration reveals the artist's humanity—his mistakes, corrections, and struggles. David Henrie noted seeing places where Caravaggio 'completely painted over what he did' and 'tried something that didn't work at all.' This humanizes the masters and reminds us that beauty emerges through struggle.",
        scripturePairing: {
          verse: "But we have this treasure in jars of clay to show that this all-surpassing power is from God and not from us.",
          reference: "2 Corinthians 4:7",
        },
        episodeId: "s1e02",
        city: "Rome",
        country: "Italy",
        coordinates: { lat: 41.8986, lng: 12.473 },
        locationName: "Rome Restoration Workshop",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Caravaggio_-_La_conversione_di_San_Paolo.jpg/800px-Caravaggio_-_La_conversione_di_San_Paolo.jpg",
        order: 2,
        reflectionQuestions: [
          "How does knowing artists made mistakes change how you view great art?",
          "Where in your life have struggles and failures led to something beautiful?",
          "What does it mean to have 'treasure in jars of clay'?",
        ],
      },
      {
        id: "s1e02-art03",
        title: "Dome of St. Peter's Basilica",
        artist: "Michelangelo Buonarroti",
        year: "1547-1590",
        description:
          "Michelangelo designed this dome at age 72 and never saw it completed. Rising 448 feet from the floor, it remains one of the largest domes in the world and a masterpiece of Renaissance engineering.",
        historicalSummary:
          "Michelangelo took over as chief architect of St. Peter's at age 72 and designed this magnificent dome, though he never saw it completed. The dome rises 448 feet from floor to cross and remains a testament to both engineering genius and artistic vision in service of faith.",
        scripturePairing: {
          verse: "I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth.",
          reference: "Psalm 121:1-2",
        },
        episodeId: "s1e02",
        city: "Rome",
        country: "Italy",
        coordinates: { lat: 41.9022, lng: 12.4534 },
        locationName: "St. Peter's Basilica - Interior",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Petersdom_von_Engelsburg_gesehen.jpg/1280px-Petersdom_von_Engelsburg_gesehen.jpg",
        order: 3,
        reflectionQuestions: [
          "How does looking upward at this dome change your perspective?",
          "What projects in your life require faith to begin, even if you may not see them completed?",
        ],
      },
    ],
    reflections: [
      {
        id: "s1e02-ref01",
        episodeId: "s1e02",
        question:
          "The great masters made mistakes and struggled. How does this encourage you in your own creative or spiritual journey?",
        suggestedUse: "family",
      },
      {
        id: "s1e02-ref02",
        episodeId: "s1e02",
        question:
          "Where has God's light broken through into a dark area of your life?",
        suggestedUse: "individual",
      },
    ],
  },
  {
    id: "s1e03",
    season: 1,
    episodeNumber: 3,
    title: "Seeking Beauty in Florence",
    shortTitle: "Florence",
    summary:
      "Journey through the birthplace of the Renaissance, where faith and art intertwined to create some of humanity's most enduring masterpieces. Explore Fra Angelico's sublime frescoes and meet sacred goldsmiths continuing ancient traditions.",
    locationLabel: "Florence, Tuscany, Italy",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Florence_Duomo_from_Michelangelo_hill.jpg/1280px-Florence_Duomo_from_Michelangelo_hill.jpg",
    durationMinutes: 37,
    airDate: "January 26, 2026",
    ewtnPlusUrl: "https://www.ewtn.com/tv/shows/seeking-beauty",
    isReleased: true,
    featuredExperts: [
      { name: "Sacred Goldsmiths", role: "Florentine Artisans" },
      { name: "Local Guides", role: "Art Historians" },
    ],
    artworks: [
      {
        id: "s1e03-art01",
        title: "Fra Angelico's Annunciation",
        artist: "Fra Angelico (Guido di Pietro)",
        year: "c. 1438-1445",
        description:
          "This sublime fresco on the stairway of the San Marco convent depicts the moment Gabriel announces to Mary that she will bear the Son of God. Fra Angelico was beatified by Pope John Paul II and named patron saint of artists.",
        historicalSummary:
          "Dominican friar Fra Angelico (c. 1395-1455) painted sublime frescoes in individual monks' cells at the San Marco convent. Each cell contains a meditation scene designed to aid contemplation. His Annunciation on the stairway is among the most beloved images in Western art. Pope John Paul II beatified him in 1982 and named him patron saint of artists.",
        scripturePairing: {
          verse: "The angel went to her and said, 'Greetings, you who are highly favored! The Lord is with you.'",
          reference: "Luke 1:28",
        },
        episodeId: "s1e03",
        city: "Florence",
        country: "Italy",
        coordinates: { lat: 43.7779, lng: 11.259 },
        locationName: "San Marco Convent",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/ANGELICO%2C_Fra_Annunciation%2C_1437-46_%282236990916%29.jpg/1280px-ANGELICO%2C_Fra_Annunciation%2C_1437-46_%282236990916%29.jpg",
        order: 1,
        reflectionQuestions: [
          "How does Mary's posture in this painting speak to you about receiving God's will?",
          "What 'annunciations'—unexpected callings—have come into your life?",
        ],
      },
      {
        id: "s1e03-art02",
        title: "Brunelleschi's Dome",
        artist: "Filippo Brunelleschi",
        year: "1420-1436",
        description:
          "The dome of the Cathedral of Santa Maria del Fiore was an engineering miracle—the largest brick dome ever constructed without external scaffolding. Brunelleschi invented new techniques to accomplish what many believed impossible.",
        historicalSummary:
          "Filippo Brunelleschi's dome (completed 1436) was an engineering miracle—the largest brick dome ever constructed without external scaffolding. It remains the largest masonry dome in the world. Brunelleschi invented new techniques and machinery to accomplish what many believed impossible, making it a testament to human ingenuity in service of divine glory.",
        scripturePairing: {
          verse: "Unless the Lord builds the house, the builders labor in vain.",
          reference: "Psalm 127:1",
        },
        episodeId: "s1e03",
        city: "Florence",
        country: "Italy",
        coordinates: { lat: 43.7731, lng: 11.256 },
        locationName: "Cathedral of Santa Maria del Fiore",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Florence_Duomo_from_Michelangelo_hill.jpg/1280px-Florence_Duomo_from_Michelangelo_hill.jpg",
        order: 2,
        reflectionQuestions: [
          "What does it mean to build something that points toward heaven?",
          "How did Brunelleschi's faith and ingenuity work together?",
          "What 'impossible' things might God be calling you to attempt?",
        ],
      },
      {
        id: "s1e03-art03",
        title: "Florentine Sacred Goldsmith Tradition",
        artist: "Florentine Artisans",
        year: "Medieval to Present",
        description:
          "Florence has been a center for goldsmithing since the Medieval period. Sacred vessels, reliquaries, and liturgical objects created by Florentine masters adorned churches throughout Europe. The tradition continues today.",
        historicalSummary:
          "Florence has been a center for goldsmithing since the Medieval period. Sacred vessels, reliquaries, and liturgical objects created by Florentine masters adorned churches throughout Europe. The tradition continues today, with artisans using techniques passed down through generations.",
        scripturePairing: {
          verse: "The crucible is for silver and the furnace for gold, but the Lord tests the heart.",
          reference: "Proverbs 17:3",
        },
        episodeId: "s1e03",
        city: "Florence",
        country: "Italy",
        coordinates: { lat: 43.7696, lng: 12.4797 },
        locationName: "Florence Goldsmith Workshops",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Goldsmith_at_work_in_his_shop%2C_Firenze.jpg/800px-Goldsmith_at_work_in_his_shop%2C_Firenze.jpg",
        order: 3,
        reflectionQuestions: [
          "What traditions or crafts connect you to previous generations?",
          "How is your heart being 'refined' like gold in a crucible?",
        ],
      },
    ],
    reflections: [
      {
        id: "s1e03-ref01",
        episodeId: "s1e03",
        question:
          "The Renaissance artists believed beauty could lead souls to God. Has art ever drawn you closer to faith?",
        suggestedUse: "family",
      },
      {
        id: "s1e03-ref02",
        episodeId: "s1e03",
        question:
          "What creative gift has God given you to share with the world?",
        suggestedUse: "individual",
      },
    ],
  },

  // === COMING SOON EPISODES ===
  {
    id: "s1e04",
    season: 1,
    episodeNumber: 4,
    title: "Seeking Beauty in Milan",
    shortTitle: "Milan",
    summary:
      "Discover Leonardo da Vinci's Last Supper and the magnificent Milan Cathedral, where centuries of artistic achievement reveal the power of beauty to convey sacred truths.",
    locationLabel: "Milan, Lombardy, Italy",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/%C3%9Altima_Cena_-_Da_Vinci_5.jpg/1280px-%C3%9Altima_Cena_-_Da_Vinci_5.jpg",
    airDate: "February 2, 2026",
    isReleased: false,
    artworks: [],
    reflections: [],
  },
  {
    id: "s1e05",
    season: 1,
    episodeNumber: 5,
    title: "Seeking Beauty in Venice",
    shortTitle: "Venice",
    summary:
      "Discover the floating city where Byzantine and Western traditions merge, from the golden mosaics of St. Mark's Basilica to the masterpieces of Titian and the glassmakers of Murano.",
    locationLabel: "Venice, Veneto, Italy",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Basilica_di_San_Marco%2C_Venice.jpg/1280px-Basilica_di_San_Marco%2C_Venice.jpg",
    airDate: "February 9, 2026",
    isReleased: false,
    artworks: [],
    reflections: [],
  },
  {
    id: "s1e06",
    season: 1,
    episodeNumber: 6,
    title: "Seeking Beauty in Subiaco",
    shortTitle: "Subiaco",
    summary:
      "Journey to the birthplace of Western monasticism, where St. Benedict lived as a hermit before founding the monastic tradition. Medieval frescoes in the Sacred Cave include one of the earliest portraits of St. Francis.",
    locationLabel: "Subiaco, Lazio, Italy",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sacro_Speco._Upper_church._General_view.jpg/800px-Sacro_Speco._Upper_church._General_view.jpg",
    airDate: "February 16, 2026",
    isReleased: false,
    artworks: [],
    reflections: [],
  },
];

export function getEpisodeById(id: string): Episode | undefined {
  return episodes.find((ep) => ep.id === id);
}

export function getReleasedEpisodes(): Episode[] {
  return episodes.filter((ep) => ep.isReleased);
}

export function getComingSoonEpisodes(): Episode[] {
  return episodes.filter((ep) => !ep.isReleased);
}
