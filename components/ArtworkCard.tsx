"use client";

import { Artwork } from "@/lib/types";
import Card, { CardImage, CardContent } from "./ui/Card";
import FavoriteButton from "./ui/FavoriteButton";

interface ArtworkCardProps {
  artwork: Artwork;
  onClick?: () => void;
  showOrder?: boolean;
  isActive?: boolean;
}

export default function ArtworkCard({
  artwork,
  onClick,
  showOrder = false,
  isActive = false,
}: ArtworkCardProps) {
  return (
    <Card
      hover
      onClick={onClick}
      className={`${isActive ? "ring-2 ring-ewtn-red" : ""}`}
    >
      <div className="relative">
        <CardImage
          src={artwork.thumbnailUrl || artwork.imageUrl}
          alt={artwork.title}
          aspectRatio="square"
        />
        <div className="absolute top-3 right-3">
          <FavoriteButton itemId={artwork.id} type="artwork" size="sm" />
        </div>
        {showOrder && (
          <div className="absolute top-3 left-3">
            <span
              className="w-8 h-8 flex items-center justify-center rounded-full bg-deep-navy text-white font-semibold text-sm"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {artwork.order}
            </span>
          </div>
        )}
      </div>
      <CardContent>
        <h3
          className="font-semibold text-deep-navy line-clamp-1"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {artwork.title}
        </h3>
        {artwork.artist && (
          <p className="text-sm text-gray-600 mt-1">{artwork.artist}</p>
        )}
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path
              fillRule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
              clipRule="evenodd"
            />
          </svg>
          {artwork.locationName}
        </p>
      </CardContent>
    </Card>
  );
}

// Compact version for horizontal lists
export function ArtworkCardCompact({
  artwork,
  onClick,
  isActive = false,
}: ArtworkCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 bg-white rounded-lg shadow-sm cursor-pointer transition-all ${
        isActive
          ? "ring-2 ring-ewtn-red bg-red-50"
          : "hover:shadow-md"
      }`}
    >
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={artwork.thumbnailUrl || artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span
            className="text-white font-semibold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            {artwork.order}
          </span>
        </div>
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <h4
          className="font-semibold text-deep-navy text-sm line-clamp-1"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {artwork.title}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-1">
          {artwork.locationName}
        </p>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-5 h-5 text-gray-400 flex-shrink-0"
      >
        <path
          fillRule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
