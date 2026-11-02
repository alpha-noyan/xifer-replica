"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin, Search, Crosshair, Navigation } from "lucide-react";
import { useImageStore } from "@/lib/store/imageStore";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#151923] text-gray-400">
      Loading map...
    </div>
  ),
});

type SearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export default function GPSGeotagging() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const selectedImageId = useImageStore((state) => state.selectedImageId);

  const metadataByImageId = useImageStore((state) => state.metadataByImageId);

  const updateImageMetadata = useImageStore(
    (state) => state.updateImageMetadata,
  );

  const metadata = selectedImageId
    ? metadataByImageId[selectedImageId]
    : undefined;

  const position: [number, number] = [
    metadata?.latitude ?? 33.6844,
    metadata?.longitude ?? 73.0479,
  ];

  const altitude = metadata?.altitude ?? 0;

  const updatePosition = (next: [number, number]) => {
    if (!selectedImageId) return;

    updateImageMetadata(selectedImageId, {
      latitude: next[0],
      longitude: next[1],
    });
  };

  const searchLocation = async () => {
    if (!query.trim()) return;

    setSearching(true);
    setError("");
    setResults([]);

    try {
      const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        limit: "5",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const data: SearchResult[] = await response.json();

      setResults(data);

      if (data.length === 0) {
        setError("No locations found. Try another search.");
      }
    } catch {
      setError("Unable to search right now. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (result: SearchResult) => {
    updatePosition([Number(result.lat), Number(result.lon)]);
    setSelectedPlace(result.display_name);
    setQuery(result.display_name);
    setResults([]);
  };

 const useCurrentLocation = () => {
  if (!navigator.geolocation) {
    setError("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (location) => {
      // Update latitude and longitude
      updatePosition([
        location.coords.latitude,
        location.coords.longitude,
      ]);

      // Update altitude in the selected image's metadata
      if (selectedImageId) {
        updateImageMetadata(selectedImageId, {
          altitude: location.coords.altitude ?? undefined,
        });
      }

      setError("");
    },
    () => {
      setError("Unable to access your current location.");
    }
  );
};

  const updateCoordinate = (index: 0 | 1, value: string) => {
    if (value.trim() === "" || value === "-") {
      setPosition((current) => {
        const next: [number, number] = [...current];
        next[index] = 0;
        return next;
      });
      return;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) return;

    const limit = index === 0 ? 90 : 180;
    if (number < -limit || number > limit) return;

    setPosition((current) => {
      const next: [number, number] = [...current];
      next[index] = number;
      return next;
    });

    setSelectedPlace("");
  };

  if (!selectedImageId) {
  return (
    <p className="text-sm text-gray-400">
      Select an image first.
    </p>
  );
}

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-[#11151e] p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-400" size={20} />
          <h2 className="text-xl font-semibold">GPS Geotagging</h2>
        </div>

        <p className="mt-1 text-sm text-gray-400">
          Select a location to assign GPS coordinates to your image.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") searchLocation();
                }}
                placeholder="Search city, address or place..."
                className="w-full rounded-lg border border-white/10 bg-[#0b0d12] py-3 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={searchLocation}
              disabled={searching}
              className="rounded-lg bg-blue-600 px-4 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {results.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#191f2b]">
              {results.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => selectResult(result)}
                  className="block w-full border-b border-white/5 px-4 py-3 text-left text-sm text-gray-300 last:border-0 hover:bg-white/5"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="h-[420px] overflow-hidden rounded-xl border border-white/10">
            <MapView position={position} onLocationChange={updatePosition} />
          </div>

          <p className="text-xs text-gray-500">
            Click anywhere on the map or drag the marker to select a location.
            Map data © OpenStreetMap contributors.
          </p>
        </div>

        <div className="space-y-5">
          <button
            onClick={useCurrentLocation}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 hover:bg-blue-500/20"
          >
            <Crosshair size={17} />
            Use My Current Location
          </button>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-200">
              GPS Coordinates
            </h3>

            <label className="mb-2 block text-xs text-gray-400">Latitude</label>
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              value={position[0]}
              onChange={(event) => updateCoordinate(0, event.target.value)}
              className="mb-4 w-full rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            <label className="mb-2 block text-xs text-gray-400">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              value={position[1]}
              onChange={(event) => updateCoordinate(1, event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-gray-400">
              Altitude (meters)
            </label>
            <input
              type="number"
              step="any"
              value={altitude}
              onChange={(event) => {
                if (!selectedImageId) return;

                updateImageMetadata(selectedImageId, {
                  altitude:
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value),
                });
              }}
              className="w-full rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0b0d12] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Navigation size={16} className="text-blue-400" />
              Selected Location
            </div>

            <p className="break-all text-xs text-gray-400">
              {selectedPlace || "Custom map coordinates"}
            </p>

            <div className="mt-4 space-y-2 text-xs text-gray-400">
              <div className="flex justify-between gap-3">
                <span>Latitude</span>
                <span className="text-white">{position[0].toFixed(6)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Longitude</span>
                <span className="text-white">{position[1].toFixed(6)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Altitude</span>
                <span className="text-white">{altitude} m</span>
              </div>
            </div>
          </div>

          <p className="text-xs leading-5 text-gray-500">
            These coordinates are currently held in the editor interface. They
            have not yet been saved to the image file.
          </p>
        </div>
      </div>
    </section>
  );
}
