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
  | 'photography'
  | 'thinker'
  | 'literature'
  | 'music'
  | 'food-wine'
  | 'landscape'
  | 'watch-listen'
  | 'math-science';

export type ContentItem = {
  _id: string;
  contentType: ContentType;
  title: string;
  imageUrl: string;
  description: string;
  context?: string;
  themes: Theme[];
  reflectionQuestions?: string[];
  artworkHook?: string;
  artworkHookAudioUrl?: string;
  /** @deprecated — use artworkHook; temporary read-through during R1 migration (April 2026). */
  legacyCuratorNote?: string;
  /** @deprecated — use artworkHookAudioUrl; temporary read-through during R1 migration. */
  legacyCuratorNoteAudioUrl?: string;
  contextAudioUrl?: string;
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
  // Music — consolidated audioSource field
  composer?: string;
  performer?: string;
  durationMinutes?: number;
  audioFileUrl?: string;     // Sanity-hosted MP3 (audioSource.audioFile)
  audioUrl?: string;         // Direct MP3 URL (audioSource.audioUrl)
  externalMusicUrl?: string; // External link only — YouTube/Spotify (audioSource.externalUrl)
  // Legacy fields — backward compat for existing documents
  musicUrl?: string;
  legacyAudioFileUrl?: string;
  // Food & Wine
  craftTradition?: string;
  pointsToward?: string;
  // Natural Landscape
  creationTheology?: string;
  // Watch & Listen
  mediaType?: 'video' | 'podcast' | 'documentary' | 'lecture';
  mediaUrl?: string;
  series?: string;
  // Math & Science
  discipline?: string;
  principle?: string;
  beautyConnection?: string;
  // Visio Divina
  traditionalPrayer?: string;
  traditionalPrayerSource?: string;
  // Per-artwork prompt overrides for Visio Divina. Each, when set,
  // overrides the matching field on the visioDefaults singleton for
  // this artwork's session only. Cascade lives in PrayClient.tsx.
  // Added June 6, 2026 (VD-ACTION-01).
  customPrayerPrompt?: string;
  customActioHeadline?: string;
  customActioInstruction?: string;
  traditionReflections?: Array<{
    _id: string;
    title: string;
    summary: string;
    shortQuote?: string;
    source: string;
    authorType: string;
  }>;
};

// ─── Visio Divina defaults (singleton) ────────────────────────────────────────
// Holds the global default copy for the contemplative prompts on the
// Visio Divina Pray + Action steps. One document per dataset. Cascade
// order: artwork.customX → visioDefaults.defaultX → hardcoded last-resort
// fallback in PrayClient.tsx.
export type VisioDefaults = {
  defaultActioHeadline: string;
  defaultActioInstruction: string;
  defaultPrayerPrompt: string;
  defaultTraditionalPrayer: string;
  defaultTraditionalPrayerSource?: string;
};

// ─── Journey ──────────────────────────────────────────────────────────────────

export type JourneyDayLectio = {
  philosophyQuote?: string;
  philosophySource?: string;
  scriptureVerse?: string;
  scriptureReference?: string;
  connectionNote?: string;
};

// Single Auditio type used by both JourneyDay and DailyPrompt.
// Matches the standalone auditio document shape after R7 migration.
export type Auditio = {
  title?: string;
  composerArtist?: string; // Canonical structured name — for dedup / content-repeat
  workTitle?: string;      // Structured work title — for dedup
  genre?: string;          // Enum — see auditio genre list in schema
  licensingNote?: string;
  audioFileUrl?: string;   // Resolved from audioFile.asset->url — plays in-app
  audioUrl?: string;       // Direct MP3 URL — plays in-app
  externalUrl?: string;    // YouTube/Spotify — opens outside app
  verbaOriginal?: string;  // Lyrics / text shown in VERBA panel (any format)
};

/** @deprecated Use Auditio instead */
export type JourneyDayAuditio = Auditio;
/** @deprecated Use Auditio instead */
export type DailyPromptAuditio = Auditio;

export type JourneyDay = {
  _id?: string;
  dayNumber: number;
  dayTitle: string;
  openImageUrl: string;
  openText?: string;
  openTextAudioUrl?: string;
  encounterContent: ContentItem;
  encounterGuidance?: string;
  encounterNote?: string;
  encounterNoteAudioUrl?: string;
  lectio?: JourneyDayLectio;
  auditio?: Auditio;
  reflectionQuestions: string[];
  reflectionQuestionsAudioUrl?: string;
  connectThread?: string;
  goDeeper?: TraditionReflection[];
};

export type PlannedDay = {
  dayNumber: number;
  dayTitle: string;
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
  plannedDays?: PlannedDay[];
  totalDays?: number;
  // Section assignment on the Journeys page. May be undefined on legacy
  // documents; treat undefined as 'standard'.
  journeyType?: 'standard' | 'intro' | 'companion';
  // Companion journey only. Show/series name and episode label rendered
  // on the companion card teal strip.
  showName?: string;
  episodeLabel?: string;
};

// ─── Daily Prompt ─────────────────────────────────────────────────────────────

export type DailyPromptLectio = {
  text: string;
  attribution?: string;
  philosophyText?: string;
  philosophyAttribution?: string;
};

export type DailyPrompt = {
  _id: string;
  date: string;
  /** Optional editorial title for the day (e.g. "God Does Not Die" for the
   *  Sacred Heart day). Distinct from the work title which lives on the
   *  linked contentItem. Shown prominently above the artwork. PP-DAYTITLE-01. */
  dayTitle?: string;
  content: ContentItem;
  promptQuestion: string;
  curatorNote?: string;
  curatorNoteAudioUrl?: string;
  lectio?: DailyPromptLectio;
  auditio?: Auditio;
  actio?: string;
  relatedJourney?: Pick<Journey, '_id' | 'title' | 'slug' | 'heroImageUrl'>;
  theme?: Theme;
};

// Pause & Ponder defaults singleton. Holds the global default Actio shown
// on any day where dailyPrompt.actio is blank. PP-DEFAULTS-01.
export type PpDefaults = {
  defaultActio: string;
};

// Explore detail card payload — what getExploreDetailItem() returns.
// Per the June 9, 2026 Explore Cards build brief: Explore reads
// contentItem ONLY (no dailyPrompt field bleed). The journeys + dailyPrompts
// arrays are reverse-reference lookups for the contextual links on the
// detail card, not P&P content data.
export type ExploreDetailItem = {
  _id: string;
  _type: string;
  contentType: ContentType;
  title: string;
  description?: string;
  imageUrl?: string;
  /** Computed attribution per content type (e.g. "Rembrandt van Rijn, 1669"). */
  attribution?: string;
  /** Journeys that link this contentItem via journeyDay.encounterContent. */
  journeys: Array<{
    _id: string;
    title: string;
    slug: string;
  }>;
  /** P&P days that reference this contentItem via dailyPrompt.content. */
  dailyPrompts: Array<{
    date: string;
    dayTitle?: string;
  }>;
};

// ─── Tradition Reflection ─────────────────────────────────────────────────────

export type TraditionReflection = {
  _id: string;
  authorType: 'church-father' | 'saint' | 'pope';
  title: string;
  summary: string;
  shortQuote?: string;
  source: string;
  reflectionAudioUrl?: string;
  themes?: Theme[];
  /** @deprecated Use themes (reference array) instead */
  theme?: string;
  order: number;
  era?: string;
};

// ─── Favorites (localStorage) ─────────────────────────────────────────────────

export type FavoriteItemType = 'contentItem' | 'episode' | 'artwork' | 'reflection' | 'dailyPrompt';

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
