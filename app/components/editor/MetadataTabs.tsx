"use client";

import { useEffect, useMemo, useState } from "react";
import { extractMetadata } from "@/utils/extratcMetadata";
import { buildMetadataFields } from "@/utils/metadataSchema";
import { useImageStore } from "@/lib/store/imageStore";
import { readAllMetadata } from "@/utils/readAllMetadata";
import { writeImageMetadata } from "@/utils/writeImageMetadata";

type Tab =
  | "EXIF"
  | "IPTC"
  | "GPS"
  | "XMP"
  | "FILE"
  | "RIFF"
  | "COMPOSITE"
  | "EXIFTOOL"
  | "ALL";

// Convert ExifTool date formats into HTML input formats.
function formatInputValue(
  value: string | number,
  dateType?: "date" | "time" | "datetime-local",
): string {
  const text = String(value);

  if (!dateType || !text) return text;

  if (dateType === "datetime-local") {
    const match = text.match(
      /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2})/,
    );

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
    }
  }

  if (dateType === "date") {
    const match = text.match(/^(\d{4})[:-](\d{2})[:-](\d{2})/);

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  if (dateType === "time") {
    return text.slice(0, 5);
  }

  return text;
}

function convertDateForExifTool(value: string, dateType?: string) {
  if (dateType === "datetime-local") {
    const [date, time] = value.split("T");
    if (!date || !time) return value;

    const formattedDate = date.replaceAll("-", ":");
    const formattedTime = time.length === 5 ? `${time}:00` : time;

    return `${formattedDate} ${formattedTime}`;
  }

  if (dateType === "date") {
    return value.replaceAll("-", ":");
  }

  return value;
}

export default function MetadataTabs() {
  const updateImageFile = useImageStore((state) => state.updateImageFile);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const images = useImageStore((state) => state.images);

  const selectedImageId = useImageStore((state) => state.selectedImageId);

  const metadataByImageId = useImageStore((state) => state.metadataByImageId);

  const setImageMetadata = useImageStore((state) => state.setImageMetadata);

  const selectedImage = images.find((image) => image.id === selectedImageId);

  const metadata = selectedImageId
    ? metadataByImageId[selectedImageId]
    : undefined;

  const [activeTab, setActiveTab] = useState<Tab>("EXIF");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const draftValuesByImageId = useImageStore(
    (state) => state.draftValuesByImageId,
  );

  const updateImageDraft = useImageStore((state) => state.updateImageDraft);

  const setImageDraft = useImageStore((state) => state.setImageDraft);

  const resetImageDraft = useImageStore((state) => state.resetImageDraft);

  const draftValues = selectedImageId
    ? (draftValuesByImageId[selectedImageId] ?? {})
    : {};

  // Extract metadata when a new image is selected.
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [selectedImage, selectedImageId, metadataByImageId, setImageMetadata]);

  // Build fields from the complete metadata schema.
  const fields = useMemo(
    () => buildMetadataFields(metadata?.raw ?? {}),
    [metadata?.raw],
  );

  useEffect(() => {
  // Wait until metadata has actually been extracted.
  if (!selectedImageId || !metadata?.raw) return;

  const existingDraft = draftValuesByImageId[selectedImageId];

  // Preserve existing drafts, but ignore empty drafts created prematurely.
  if (existingDraft && Object.keys(existingDraft).length > 0) {
    return;
  }

  const originalValues = Object.fromEntries(
    fields.map((field) => [
      field.key,
      formatInputValue(field.defaultValue, field.dateType),
    ]),
  );

  setImageDraft(selectedImageId, originalValues);
}, [
  selectedImageId,
  metadata?.raw,
  fields,
  draftValuesByImageId,
  setImageDraft,
]);

  const tabs: Tab[] = [
    "EXIF",
    "IPTC",
    "GPS",
    "XMP",
    "FILE",
    "RIFF",
    "COMPOSITE",
    "EXIFTOOL",
    "ALL",
  ];

  const groupForTab: Record<Tab, string | null> = {
    EXIF: "EXIF",
    IPTC: "IPTC",
    GPS: "EXIF",
    XMP: "XMP",
    FILE: "File",
    RIFF: "RIFF",
    COMPOSITE: "Composite",
    EXIFTOOL: "ExifTool",
    ALL: null,
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500";

  if (!selectedImage) {
    return <p className="text-sm text-gray-400">Select an image first.</p>;
  }

  // Filter fields according to the selected tab.
  const visibleFields = fields.filter((field) => {
    if (activeTab === "ALL") return true;

    if (activeTab === "GPS") {
      return field.key.toLowerCase().includes("gps");
    }

    return field.group === groupForTab[activeTab];
  });

  // Update an individual draft value.
  const updateField = (key: string, value: string) => {
    if (!selectedImageId) return;

    updateImageDraft(selectedImageId, key, value);
  };

  // Restore original extracted values.
  const handleResetChanges = () => {
    if (!selectedImageId) return;

    resetImageDraft(selectedImageId);
  };

  const handleSaveChanges = async () => {
    if (!selectedImage || !selectedImageId || !metadata?.raw) return;

    if (changedFields.length === 0) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      // These groups contain calculated or filesystem information,
      // rather than metadata that can reliably be written into an image.
      const unsupportedFields = changedFields.filter(
        (field) => !["EXIF", "IPTC", "XMP"].includes(field.group),
      );

      if (unsupportedFields.length > 0) {
        throw new Error(
          `These fields cannot be saved as image metadata: ${unsupportedFields
            .map((field) => field.label)
            .join(", ")}. Reset those fields before saving.`,
        );
      }

      const tags: Record<string, string | number> = {};

      for (const field of changedFields) {
        const value = draftValues[field.key] ?? "";
        const originalValue = metadata.raw[field.key];

        if (typeof originalValue === "number") {
          const numericValue = Number(value);

          if (!Number.isFinite(numericValue)) {
            throw new Error(`Please enter a valid number for ${field.label}.`);
          }

          tags[field.key] = numericValue;
        } else {
          tags[field.key] = convertDateForExifTool(value, field.dateType);
        }
      }

      const modifiedFile = await writeImageMetadata(
        selectedImage.file,
        tags as Parameters<typeof writeImageMetadata>[1],
      );

      // Read the saved file again to verify that the changes were written.
      const savedMetadata = await readAllMetadata(modifiedFile);
      const savedRaw = savedMetadata[0] ?? {};

      for (const field of changedFields) {
        const expectedValue = tags[field.key];
        const actualValue = savedRaw[field.key];

        const matches =
          typeof expectedValue === "number"
            ? Number(actualValue) === expectedValue
            : String(actualValue ?? "") === String(expectedValue);

        if (!matches) {
          throw new Error(
            `Could not verify the saved value for ${field.label}.`,
          );
        }
      }

      // Download the updated image.
      const url = URL.createObjectURL(modifiedFile);
      const link = document.createElement("a");

      const lastDotIndex = modifiedFile.name.lastIndexOf(".");
      const baseName =
        lastDotIndex > 0
          ? modifiedFile.name.slice(0, lastDotIndex)
          : modifiedFile.name;
      const extension =
        lastDotIndex > 0 ? modifiedFile.name.slice(lastDotIndex) : "";

      link.href = url;
      link.download = `${baseName}-edited${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      // Re-extract metadata from the updated image.
const refreshedMetadata = await extractMetadata(modifiedFile);

// Rebuild the draft values using the updated metadata.
const refreshedFields = buildMetadataFields(
  refreshedMetadata.raw ?? {},
);

const refreshedDraft = Object.fromEntries(
  refreshedFields.map((field) => [
    field.key,
    formatInputValue(field.defaultValue, field.dateType),
  ]),
);

// Update the image while preserving its metadata in the workspace.
updateImageFile(selectedImageId, modifiedFile);

setImageMetadata(selectedImageId, refreshedMetadata);

setImageDraft(selectedImageId, refreshedDraft);

      setSaveSuccess("Metadata saved and image downloaded successfully.");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving metadata.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Count fields changed from their original extracted values.
  const changedFields = fields.filter(
  (field) =>
    draftValues[field.key] !==
    formatInputValue(field.defaultValue, field.dateType),
);

  return (
    <section className="min-w-0 rounded-xl border border-white/10 bg-[#11151e]">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <h3 className="font-semibold">Image Metadata Editor</h3>

        <p className="mt-1 truncate text-xs text-gray-500">
          {selectedImage.file.name}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {fields.length} metadata fields
          </p>

          <p className="text-xs text-amber-400">
            {changedFields.length} unsaved changes
          </p>
        </div>

        <button
          onClick={handleResetChanges}
          disabled={changedFields.length === 0}
          className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset Changes
        </button>

        <button
          onClick={handleSaveChanges}
          disabled={saving || changedFields.length === 0}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save & Download"}
        </button>
      </div>

      {saveError && <p className="mt-2 text-sm text-red-500">{saveError}</p>}

      {saveSuccess && (
        <p className="mt-2 text-sm text-green-600">{saveSuccess}</p>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-white/10 p-2">
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

      {/* Metadata fields */}
      <div className="max-h-[620px] space-y-4 overflow-y-auto p-4">
        {loading && (
          <p className="text-sm text-gray-400">Reading metadata...</p>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && metadata && (
          <>
            {visibleFields.length === 0 ? (
              <p className="text-sm text-gray-500">
                No fields available in this group.
              </p>
            ) : (
              visibleFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-xs text-gray-400">
                    {field.label}

                    <span className="ml-2 text-gray-600">{field.key}</span>
                  </label>

                  <input
                    type={field.dateType ?? field.type}
                    step={field.dateType === "time" ? 1 : "any"}
                    value={draftValues[field.key] ?? ""}
                    onChange={(event) =>
                      updateField(field.key, event.target.value)
                    }
                    onFocus={(event) => {
                      if (field.dateType) {
                        event.currentTarget.showPicker?.();
                      }
                    }}
                    className={`${inputClass} ${
                      field.dateType ? "[color-scheme:dark] cursor-pointer" : ""
                    }`}
                    placeholder="Empty"
                  />
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        <p className="text-xs text-amber-400">
          Changes are saved as drafts automatically. Click Save & Download to
          write them into the image.
        </p>
      </div>
    </section>
  );
}
