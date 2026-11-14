"use client";

import { useEffect, useMemo, useState } from "react";
import { readAllMetadata } from "@/utils/readAllMetadata";
import { groupMetadata } from "@/utils/groupMetadata";
import { writeImageMetadata } from "@/utils/writeImageMetadata";
import { useImageStore } from "@/lib/store/imageStore";

interface MetadataBrowserProps {
  file: File;
}

export default function MetadataBrowser({ file }: MetadataBrowserProps) {
  const [metadata, setMetadata] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const updateImageFile = useImageStore((state) => state.updateImageFile);

  const selectedImageId = useImageStore((state) => state.selectedImageId);

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      setLoading(true);
      setError("");
      setMetadata([]);

      try {
        const result = await readAllMetadata(file);

        if (!cancelled) {
          setMetadata(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to read metadata.",
          );
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
  }, [file]);

  useEffect(() => {
    setEditedValues({});
  }, [file]);

  const groups = useMemo(() => groupMetadata(metadata), [metadata]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return groups;

    return groups
      .map((group) => ({
        ...group,
        fields: group.fields.filter(
          (field) =>
            field.name.toLowerCase().includes(query) ||
            field.group.toLowerCase().includes(query) ||
            String(field.value).toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.fields.length > 0);
  }, [groups, search]);

  const totalFields = groups.reduce(
    (total, group) => total + group.fields.length,
    0,
  );

  function formatValue(value: unknown): string {
    if (value === null) return "null";
    if (value === undefined) return "—";

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  }

  async function handleSave() {
    if (Object.keys(editedValues).length === 0) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const originalMetadata = metadata[0] ?? {};
      const tags: Record<string, string | number> = {};

      // Include only fields that the user edited.
      for (const [key, editedValue] of Object.entries(editedValues)) {
        const originalValue = originalMetadata[key];

        if (typeof originalValue === "number") {
          const numericValue = Number(editedValue);

          if (!Number.isFinite(numericValue)) {
            throw new Error(`Invalid numeric value for ${key}.`);
          }

          tags[key] = numericValue;
        } else {
          tags[key] = editedValue;
        }
      }

      // Write changes into a new image file.
      const modifiedFile = await writeImageMetadata(
        file,
        tags as Parameters<typeof writeImageMetadata>[1],
      );

      // Read the modified image again.
      const verifiedMetadata = await readAllMetadata(modifiedFile);
      const verifiedRecord = verifiedMetadata[0] ?? {};

      // Verify every edited field.
      for (const [key, expectedValue] of Object.entries(tags)) {
        const actualValue = verifiedRecord[key];

        if (actualValue === undefined || actualValue === null) {
          throw new Error(`Verification failed: ${key} was not found.`);
        }

        if (typeof expectedValue === "number") {
          if (Number(actualValue) !== expectedValue) {
            throw new Error(`Verification failed for ${key}.`);
          }
        } else if (String(actualValue) !== expectedValue) {
          throw new Error(`Verification failed for ${key}.`);
        }
      }

      // Download only after successful verification.
      const downloadUrl = URL.createObjectURL(modifiedFile);
      const link = document.createElement("a");

      const extension = file.name.match(/\.[^.]+$/)?.[0] ?? "";
      const baseName = file.name.replace(/\.[^.]+$/, "");

      link.href = downloadUrl;
      link.download = `${baseName}-edited${extension}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

      // Update the image in the Zustand workspace.
      if (selectedImageId) {
        updateImageFile(selectedImageId, modifiedFile);
      }

      setSaveSuccess(
        "Metadata saved, verified, and updated in your workspace.",
      );

      setEditedValues({});
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Unable to save image metadata.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#151923] p-6 text-center text-sm text-gray-400">
        Reading image metadata...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">All Metadata</h3>
          <p className="mt-1 text-xs text-gray-400">
            {totalFields} metadata fields across {groups.length} groups
          </p>

          {Object.keys(editedValues).length > 0 && (
            <p className="mt-1 text-xs text-blue-400">
              {Object.keys(editedValues).length} unsaved changes
            </p>
          )}
        </div>

        <input
          type="search"
          placeholder="Search metadata..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#151923] px-3 py-2 text-sm text-white outline-none focus:border-blue-500 sm:w-64"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || Object.keys(editedValues).length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save & Download"}
        </button>
      </div>

      {saveError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-sm text-green-400">
          {saveSuccess}
        </div>
      )}

      {filteredGroups.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#151923] p-6 text-center text-sm text-gray-400">
          {search
            ? "No matching metadata fields found."
            : "No metadata found in this image."}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <details
              key={group.name}
              open
              className="overflow-hidden rounded-xl border border-white/10 bg-[#151923]"
            >
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-white hover:bg-white/5">
                <span>{group.name}</span>

                <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-gray-400">
                  {group.fields.length} fields
                </span>
              </summary>

              <div className="divide-y divide-white/5">
                {group.fields.map((field) => (
                  <div
                    key={field.key}
                    className="grid gap-2 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)]"
                  >
                    <span className="break-words text-xs text-gray-400">
                      {field.name}
                    </span>

                    {["EXIF", "IPTC", "XMP", "GPS"].includes(field.group) &&
                    (typeof field.value === "string" ||
                      typeof field.value === "number") ? (
                      <input
                        type="text"
                        value={
                          editedValues[field.key] ?? formatValue(field.value)
                        }
                        onChange={(event) =>
                          setEditedValues((previous) => ({
                            ...previous,
                            [field.key]: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                    ) : (
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-200">
                        {formatValue(field.value)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
