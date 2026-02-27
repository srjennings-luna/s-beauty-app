import { Favorite, FavoriteItemType } from "./types";

const STORAGE_KEY = "kallos-favorites";
const LEGACY_KEY = "seeking-beauty-favorites";

// Migrate favorites from old key to new key (runs once per session)
function migrate(): void {
  if (typeof window === "undefined") return;
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_KEY);
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
