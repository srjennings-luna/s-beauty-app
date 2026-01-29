import { Favorite, FavoriteItemType } from "./types";

const STORAGE_KEY = "seeking-beauty-favorites";

export function getFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
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
