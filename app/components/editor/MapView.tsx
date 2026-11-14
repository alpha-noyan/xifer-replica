
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapViewProps {
  position: [number, number];
  onLocationChange: (position: [number, number]) => void;
}

export default function MapView({
  position,
  onLocationChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Keep the latest callback without recreating the map.
  const onLocationChangeRef = useRef(onLocationChange);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  // Initialize the map once and clean it up properly.
  useEffect(() => {
    const container = containerRef.current;

    if (!container || mapRef.current) return;

    // Remove any leftover Leaflet instance identifier.
    const leafletContainer = container as HTMLDivElement & {
      _leaflet_id?: number;
    };

    if (leafletContainer._leaflet_id) {
      delete leafletContainer._leaflet_id;
    }

    const map = L.map(container, {
      center: position,
      zoom: 13,
      scrollWheelZoom: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: "gps-map-marker",
      html: '<div class="gps-marker-dot"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const marker = L.marker(position, {
      icon: markerIcon,
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    map.on("click", (event: L.LeafletMouseEvent) => {
      onLocationChangeRef.current([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    });

    marker.on("dragend", () => {
      const location = marker.getLatLng();

      onLocationChangeRef.current([
        location.lat,
        location.lng,
      ]);
    });

    return () => {
      map.off();
      marker.off();

      map.remove();

      mapRef.current = null;
      markerRef.current = null;

      // Ensure the container can be initialized again.
      delete leafletContainer._leaflet_id;
    };
  }, []);

  // Update the map and marker when coordinates change.
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    mapRef.current.setView(position, mapRef.current.getZoom());
    markerRef.current.setLatLng(position);
  }, [position]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}
