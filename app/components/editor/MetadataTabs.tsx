"use client";

import { useEffect, useState } from "react";
import { extractMetadata } from "@/utils/extratcMetadata";
import { useImageStore } from "@/lib/store/imageStore";
import type { ImageMetadata } from "@/types/metadata";

type Tab = "EXIF" | "IPTC" | "GPS" | "ALL";

export default function MetadataTabs() {
  const images = useImageStore((state) => state.images);
  const selectedImageId = useImageStore((state) => state.selectedImageId);
  const metadataByImageId = useImageStore((state) => state.metadataByImageId);
  const setImageMetadata = useImageStore((state) => state.setImageMetadata);
  const updateImageMetadata = useImageStore(
    (state) => state.updateImageMetadata,
  );

  const selectedImage = images.find((image) => image.id === selectedImageId);

  const metadata = selectedImageId
    ? metadataByImageId[selectedImageId]
    : undefined;

  const [activeTab, setActiveTab] = useState<Tab>("EXIF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      if (!selectedImage || !selectedImageId) return;

      if (metadataByImageId[selectedImageId]) return;

      setLoading(true);
      setError("");

      try {
        const result = await extractMetadata(selectedImage.file);

        if (!cancelled) {
          setImageMetadata(selectedImageId, result);
        }
      } catch {
        if (!cancelled) {
          setError("Could not extract metadata from this image.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [selectedImage, selectedImageId, metadataByImageId, setImageMetadata]);

  const updateField = (field: keyof ImageMetadata, value: string) => {
    if (!selectedImageId) return;

    const numericFields: (keyof ImageMetadata)[] = [
      "latitude",
      "longitude",
      "altitude",
    ];

    updateImageMetadata(selectedImageId, {
      [field]: numericFields.includes(field)
        ? value === ""
          ? undefined
          : Number(value)
        : value,
    });
  };

  if (!selectedImage) {
    return <p className="text-sm text-gray-400">Select an image first.</p>;
  }

  const tabs: Tab[] = ["EXIF", "IPTC", "GPS", "ALL"];

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500";

  const field = (
    label: string,
    key: keyof ImageMetadata,
    value?: string | number,
    type = "text",
  ) => (
    <div className="space-y-1.5" key={key}>
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => updateField(key, event.target.value)}
        className={inputClass}
      />
    </div>
  );

  const readOnly = (label: string, value?: unknown) => (
    <div className="border-b border-white/5 pb-3" key={label}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-all text-sm text-gray-200">
        {value == null || value === "" ? "Not available" : String(value)}
      </p>
    </div>
  );

  return (
    <section className="min-w-0 rounded-xl border border-white/10 bg-[#11151e]">
      <div className="border-b border-white/10 p-4">
        <h3 className="font-semibold">Image Metadata</h3>
        <p className="mt-1 truncate text-xs text-gray-500">
          {selectedImage.file.name}
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/10 p-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-3 py-2 text-xs ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-h-[620px] space-y-4 overflow-y-auto p-4">
        {loading && (
          <p className="text-sm text-gray-400">Reading metadata...</p>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && metadata && (
          <>
            {activeTab === "EXIF" && (
              <div className="space-y-4">
                {readOnly("File name", metadata.fileName)}
                {readOnly(
                  "Dimensions",
                  metadata.width && metadata.height
                    ? `${metadata.width} × ${metadata.height}`
                    : undefined,
                )}
                {readOnly("Camera make", metadata.make)}
                {readOnly("Camera model", metadata.model)}
                {readOnly("Date taken", metadata.dateTimeOriginal)}
                {readOnly("ISO", metadata.iso)}
                {readOnly("Aperture", metadata.aperture)}
                {readOnly("Shutter speed", metadata.shutterSpeed)}
                {readOnly("Focal length", metadata.focalLength)}
              </div>
            )}

            {activeTab === "IPTC" && (
              <div className="space-y-4">
                {field("Title / Object Name", "title", metadata.title)}
                {field("Description", "description", metadata.description)}
                {field("Author / Creator", "author", metadata.author)}
                {field("Copyright", "copyright", metadata.copyright)}
                {field(
                  "Keywords (comma separated)",
                  "keywords",
                  metadata.keywords,
                )}
              </div>
            )}

            {activeTab === "GPS" && (
              <div className="space-y-4">
                {field("Latitude", "latitude", metadata.latitude, "number")}
                {field("Longitude", "longitude", metadata.longitude, "number")}
                {field(
                  "Altitude (meters)",
                  "altitude",
                  metadata.altitude,
                  "number",
                )}
              </div>
            )}

            {activeTab === "ALL" && (
              <div className="space-y-3">
                {Object.entries(metadata.raw).map(([key, value]) =>
                  readOnly(
                    key,
                    value instanceof Date
                      ? value.toISOString()
                      : typeof value === "object"
                        ? JSON.stringify(value)
                        : value,
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>

      {metadata && (
        <div className="border-t border-white/10 p-3">
          <p className="text-xs text-amber-400">
            Changes are temporary and have not been written to the image.
          </p>
        </div>
      )}
    </section>
  );
}
