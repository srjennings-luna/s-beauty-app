"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite as checkIsFavorite,
} from "@/lib/favorites";
import { Favorite, FavoriteItemType } from "@/lib/types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount (client-side only)
  useEffect(() => {
    setFavorites(getFavorites());
    setIsLoaded(true);
  }, []);

  const toggleFavorite = useCallback(
    (type: FavoriteItemType, itemId: string) => {
      if (checkIsFavorite(itemId, type)) {
        removeFavorite(itemId, type);
      } else {
        addFavorite(type, itemId);
      }
      setFavorites(getFavorites());
    },
    []
  );

  const isFavorite = useCallback(
    (itemId: string, type: FavoriteItemType): boolean => {
      if (!isLoaded) return false;
      return favorites.some((f) => f.itemId === itemId && f.type === type);
    },
    [favorites, isLoaded]
  );

  const getByType = useCallback(
    (type: FavoriteItemType): Favorite[] => {
      return favorites.filter((f) => f.type === type);
    },
    [favorites]
  );

  return {
    favorites,
    isLoaded,
    toggleFavorite,
    isFavorite,
    getByType,
  };
}
