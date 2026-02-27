// ─────────────────────────────────────────────────────────────────────────────
// KALLOS — Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ─── Theme ───────────────────────────────────────────────────────────────────

export type Theme = {
  _id: string;
  title: string;
  slug: { current: string };
  question: string;
  description: string;
  color?: string;
  order?: number;
  imageUrl?: string;
};

// ─── Content Item ─────────────────────────────────────────────────────────────

export type ContentType =
  | 'sacred-art'
  | 'thinker'
  | 'literature'
  | 'music'
  | 'food-wine'
  | 'landscape'
  | 'watch-listen';

export type ContentItem = {
  _id: string;
  contentType: ContentType;
  title: string;
  imageUrl: string;
  description: string;
  context?: string;
  themes: Theme[];
  reflectionQuestions?: string[];
  curatorNote?: string;
  // Location (optional for non-place content)
  locationName?: string;
  city?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
  // Sacred Art & Architecture
  artist?: string;
  year?: string;
  medium?: string;
  scripturePairing?: { verse: string; reference: string };
  // Thinkers & Quotes
  thinkerName?: string;
  quote?: { text?: string; source?: string; attribution?: string };
  era?: string;
  tradition?: string;
  // Literature & Poetry
  author?: string;
  workTitle?: string;
  excerpt?: string;
  literaryForm?: string;
  // Music
  composer?: string;
  performer?: string;
  durationMinutes?: number;
  musicUrl?: string;
  // Food & Wine
  craftTradition?: string;
  pointsToward?: string;
  // Natural Landscape
  creationTheology?: string;
  // Watch & Listen
  mediaType?: 'video' | 'podcast' | 'documentary' | 'lecture';
  mediaUrl?: string;
  series?: string;
};

// ─── Journey ──────────────────────────────────────────────────────────────────

export type JourneyDay = {
  dayNumber: number;
  dayTitle: string;
  openImageUrl: string;
  openText?: string;
  encounterContent: ContentItem;
  encounterGuidance?: string;
  reflectQuestions: string[];
  connectThread?: string;
  goDeeper?: TraditionReflection[];
};

export type Journey = {
  _id: string;
  title: string;
  slug: { current: string };
  theme: Theme;
  description: string;
  heroImageUrl: string;
  estimatedMinutesPerDay?: number;
  isPublished: boolean;
  order?: number;
  days: JourneyDay[];
};

// ─── Daily Prompt ─────────────────────────────────────────────────────────────

export type DailyPrompt = {
  _id: string;
  date: string;
  content: ContentItem;
  promptQuestion: string;
  curatorNote?: string;
  theme?: Theme;
};

// ─── Tradition Reflection ─────────────────────────────────────────────────────

export type TraditionReflection = {
  _id: string;
  authorType: 'church-father' | 'saint' | 'pope';
  title: string;
  summary: string;
  shortQuote?: string;
  source: string;
  themes?: Theme[];
  /** @deprecated Use themes (reference array) instead */
  theme?: string;
  order: number;
  era?: string;
};

// ─── Favorites (localStorage) ─────────────────────────────────────────────────

export type FavoriteItemType = 'contentItem' | 'episode' | 'artwork' | 'reflection';

export type Favorite = {
  id: string;
  type: FavoriteItemType;
  itemId: string;
  addedAt: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy types — kept for existing pages until Steps 3/4 rebuild them
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated Use ContentType instead */
export type LocationType = 'sacred-art' | 'architecture' | 'workshop' | 'cultural' | 'landscape';

/** @deprecated Use ContentItem instead */
export type Artwork = {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  description?: string;
  historicalSummary?: string;
  scripturePairing?: { verse: string; reference: string };
  quote?: { text: string; attribution: string };
  locationType?: LocationType;
  episodeId?: string;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number };
  locationName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  order: number;
  reflectionQuestions: string[];
};

/** @deprecated Episode model is retired. */
export type Expert = {
  name: string;
  role: string;
};

/** @deprecated Episode model is retired. */
export type Episode = {
  id: string;
  season: number;
  episodeNumber: number;
  title: string;
  shortTitle: string;
  summary: string;
  locationLabel: string;
  heroImageUrl: string;
  durationMinutes?: number;
  airDate?: string;
  ewtnPlusUrl?: string;
  artworks: Artwork[];
  reflections: Reflection[];
  isReleased: boolean;
  featuredExperts?: Expert[];
};

/** @deprecated Episode model is retired. */
export type Reflection = {
  id: string;
  episodeId: string;
  question: string;
  suggestedUse?: 'family' | 'individual' | 'group';
};
