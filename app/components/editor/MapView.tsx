
"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

interface MapViewProps {
  position: [number, number];
  onLocationChange: (position: [number, number]) => void;
}

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);

  return null;
}

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (position: [number, number]) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationChange([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export default function MapView({
  position,
  onLocationChange,
}: MapViewProps) {
  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "gps-map-marker",
        html: '<div class="gps-marker-dot"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    []
  );

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater position={position} />

      <MapClickHandler onLocationChange={onLocationChange} />

      <Marker
        position={position}
        icon={markerIcon}
        draggable
        eventHandlers={{
          dragend(event) {
            const marker = event.target;
            const location = marker.getLatLng();

            onLocationChange([location.lat, location.lng]);
          },
        }}
      />
    </MapContainer>
  );
}
