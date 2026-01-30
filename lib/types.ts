// Episode data type
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

// Expert featured in episode
export type Expert = {
  name: string;
  role: string; // e.g., "Art Historian", "Artist", "Local Artisan"
};

// Artwork / location type
export type Artwork = {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  description?: string;
  historicalSummary?: string; // Richer historical context
  scripturePairing?: {
    verse: string;
    reference: string; // e.g., "Lamentations 1:12"
  };
  episodeId?: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  locationName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  order: number;
  reflectionQuestions: string[];
};

// Episode-level reflection questions
export type Reflection = {
  id: string;
  episodeId: string;
  question: string;
  suggestedUse?: "family" | "individual" | "group";
};

// Favorites (stored in localStorage)
export type FavoriteItemType = "episode" | "artwork" | "reflection";

export type Favorite = {
  id: string;
  type: FavoriteItemType;
  itemId: string;
  addedAt: string;
};
