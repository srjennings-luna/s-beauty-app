"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { Artwork } from "@/lib/types";

// Fix for default marker icons in Leaflet with webpack
import "leaflet/dist/leaflet.css";

// Custom marker icon creator
function createMarkerIcon(order: number, isActive: boolean) {
  const size = isActive ? 40 : 32;
  const bgColor = isActive ? "#EA002A" : "#66293C";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${bgColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        font-size: ${isActive ? "16px" : "14px"};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        ${isActive ? "animation: pulse 2s infinite;" : ""}
      ">
        ${order}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Component to handle map flying to new position
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
    });
  }, [map, center, zoom]);

  return null;
}

interface ArtwalkMapProps {
  artworks: Artwork[];
  activeArtworkIndex: number;
  onMarkerClick: (index: number) => void;
}

export default function ArtwalkMap({
  artworks,
  activeArtworkIndex,
  onMarkerClick,
}: ArtwalkMapProps) {
  const mapRef = useRef<L.Map>(null);

  // Calculate the center of all artworks for initial view
  const initialCenter = useMemo(() => {
    if (artworks.length === 0) return [41.9, 12.5] as [number, number];

    const lats = artworks.map((a) => a.coordinates.lat);
    const lngs = artworks.map((a) => a.coordinates.lng);

    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ] as [number, number];
  }, [artworks]);

  // Get current artwork center
  const activeCenter = useMemo(() => {
    if (artworks.length === 0 || activeArtworkIndex < 0)
      return initialCenter;

    const artwork = artworks[activeArtworkIndex];
    return [artwork.coordinates.lat, artwork.coordinates.lng] as [
      number,
      number
    ];
  }, [artworks, activeArtworkIndex, initialCenter]);

  if (artworks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No artworks to display</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={initialCenter}
      zoom={15}
      className="w-full h-full"
      ref={mapRef}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Controller for flying to active artwork */}
      <MapController center={activeCenter} zoom={17} />

      {/* Markers for each artwork */}
      {artworks.map((artwork, index) => (
        <Marker
          key={artwork.id}
          position={[artwork.coordinates.lat, artwork.coordinates.lng]}
          icon={createMarkerIcon(artwork.order, index === activeArtworkIndex)}
          eventHandlers={{
            click: () => onMarkerClick(index),
          }}
        >
          <Popup>
            <div className="text-center p-1">
              <strong
                className="block text-sm"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {artwork.title}
              </strong>
              <span className="text-xs text-gray-600">
                {artwork.locationName}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
