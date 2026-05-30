import { Favorite, FavoriteItemType } from "./types";

const STORAGE_KEY = "contueri-favorites";
const LEGACY_KALLOS_KEY = "kallos-favorites";
const LEGACY_SEEKING_KEY = "seeking-beauty-favorites";

// Migrate favorites from older keys to the current key (runs once per session).
// Order: seeking-beauty -> kallos -> contueri. Each migration runs only if the
// next key is unset, so users carry favorites forward through every rename.
function migrate(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(STORAGE_KEY)) {
    const kallos = localStorage.getItem(LEGACY_KALLOS_KEY);
    if (kallos) {
      localStorage.setItem(STORAGE_KEY, kallos);
      localStorage.removeItem(LEGACY_KALLOS_KEY);
      return;
    }
    const seeking = localStorage.getItem(LEGACY_SEEKING_KEY);
    if (seeking) {
      localStorage.setItem(STORAGE_KEY, seeking);
      localStorage.removeItem(LEGACY_SEEKING_KEY);
    }
  }
}

export function getFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  migrate();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addFavorite(type: FavoriteItemType, itemId: string): Favorite {
  const favorites = getFavorites();
  const newFavorite: Favorite = {
    id: `${type}-${itemId}-${Date.now()}`,
    type,
    itemId,
    addedAt: new Date().toISOString(),
  };
  favorites.push(newFavorite);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  return newFavorite;
}

export function removeFavorite(itemId: string, type: FavoriteItemType): void {
  const favorites = getFavorites();
  const filtered = favorites.filter(
    (f) => !(f.itemId === itemId && f.type === type)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function isFavorite(itemId: string, type: FavoriteItemType): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.itemId === itemId && f.type === type);
}

export function getFavoritesByType(type: FavoriteItemType): Favorite[] {
  return getFavorites().filter((f) => f.type === type);
}
