"use client";

import dynamic from "next/dynamic";
import { Artwork } from "@/lib/types";

// Dynamically import the map component with no SSR
const ArtwalkMap = dynamic(() => import("./ArtwalkMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-deep-navy border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

interface ArtwalkMapWrapperProps {
  artworks: Artwork[];
  activeArtworkIndex: number;
  onMarkerClick: (index: number) => void;
}

export default function ArtwalkMapWrapper(props: ArtwalkMapWrapperProps) {
  return <ArtwalkMap {...props} />;
}
