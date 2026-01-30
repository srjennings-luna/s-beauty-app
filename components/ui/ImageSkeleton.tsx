"use client";

interface ImageSkeletonProps {
  aspectRatio?: "16/9" | "4/3" | "square" | "auto";
  className?: string;
}

export default function ImageSkeleton({
  aspectRatio = "16/9",
  className = "",
}: ImageSkeletonProps) {
  const aspectClasses = {
    "16/9": "aspect-[16/9]",
    "4/3": "aspect-[4/3]",
    square: "aspect-square",
    auto: "",
  };

  return (
    <div
      className={`skeleton-dark bg-white/5 ${aspectClasses[aspectRatio]} ${className}`}
    />
  );
}

// Card skeleton for episode/artwork lists
export function CardSkeleton() {
  return (
    <div className="w-full">
      <div className="skeleton-dark bg-white/5 aspect-[16/9] mb-1.5" />
      <div className="skeleton-dark bg-white/5 h-4 w-3/4 mb-1" />
      <div className="skeleton-dark bg-white/5 h-3 w-1/2" />
    </div>
  );
}

// Episode card skeleton
export function EpisodeCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[280px]">
      <div className="skeleton-dark bg-white/5 aspect-[4/3] mb-3" />
      <div className="skeleton-dark bg-white/5 h-5 w-3/4 mb-2" />
      <div className="skeleton-dark bg-white/5 h-3 w-1/4 mb-2" />
      <div className="skeleton-dark bg-white/5 h-3 w-full mb-1" />
      <div className="skeleton-dark bg-white/5 h-3 w-2/3" />
    </div>
  );
}
