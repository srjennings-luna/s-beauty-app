"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Artwork, LocationType } from "@/lib/types";

// Color mapping for location types
const locationTypeColors: Record<LocationType, string> = {
  'sacred-art': '#66293C',    // Maroon (Sacred Art palette)
  'architecture': '#4C3759',  // Plum
  'workshop': '#C19B5F',      // Gold
  'cultural': '#93583E',      // Rust
  'landscape': '#2D5A27',     // Green
};

// Custom marker icon with location type coloring
const createMarkerIcon = (isSelected: boolean, locationType?: LocationType) => {
  // Get color based on location type, default to sacred-art blue
  const baseColor = locationType ? locationTypeColors[locationType] : locationTypeColors['sacred-art'];
  const color = isSelected ? "#EA002A" : baseColor;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${isSelected ? "36px" : "28px"};
        height: ${isSelected ? "36px" : "28px"};
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" style="width: ${isSelected ? "16px" : "12px"}; height: ${isSelected ? "16px" : "12px"};">
            <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
    iconAnchor: [isSelected ? 18 : 14, isSelected ? 36 : 28],
    popupAnchor: [0, -36],
  });
};

// Custom cluster icon with animation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 5 ? 40 : count < 10 ? 48 : 56;

  return L.divIcon({
    html: `
      <div class="cluster-marker" style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #66293C 0%, #4C3759 100%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 15px rgba(0,45,98,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: ${count < 10 ? "14px" : "13px"};
        font-family: system-ui, -apple-system, sans-serif;
      ">
        ${count}
      </div>
    `,
    className: "custom-cluster-icon",
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
  });
};

// Component to fit map to all markers
function MapBoundsController({ artworks }: { artworks: Artwork[] }) {
  const map = useMap();

  useEffect(() => {
    if (artworks.length > 0) {
      const bounds = L.latLngBounds(
        artworks.map((a) => [a.coordinates.lat, a.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, artworks]);

  return null;
}

interface GlobalMapProps {
  artworks: (Artwork & { episodeTitle?: string })[];
  onMarkerClick: (artwork: Artwork) => void;
  selectedArtwork: Artwork | null;
}

export default function GlobalMap({
  artworks,
  onMarkerClick,
  selectedArtwork,
}: GlobalMapProps) {
  // Calculate center based on all artworks
  const center = artworks.length > 0
    ? {
        lat: artworks.reduce((sum, a) => sum + a.coordinates.lat, 0) / artworks.length,
        lng: artworks.reduce((sum, a) => sum + a.coordinates.lng, 0) / artworks.length,
      }
    : { lat: 42.5, lng: 12.5 }; // Default to center of Italy

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={6}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBoundsController artworks={artworks} />
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        animate={true}
        animateAddingMarkers={true}
      >
        {artworks.map((artwork) => (
          <Marker
            key={artwork.id}
            position={[artwork.coordinates.lat, artwork.coordinates.lng]}
            icon={createMarkerIcon(selectedArtwork?.id === artwork.id, artwork.locationType)}
            eventHandlers={{
              click: () => onMarkerClick(artwork),
            }}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
