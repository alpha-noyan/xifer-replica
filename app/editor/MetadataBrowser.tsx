
"use client";

import { useEffect, useMemo, useState } from "react";
import { readAllMetadata } from "@/utils/readAllMetadata";
import { groupMetadata } from "@/utils/groupMetadata";

interface MetadataBrowserProps {
  file: File;
}

export default function MetadataBrowser({
  file,
}: MetadataBrowserProps) {
  const [metadata, setMetadata] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
            err instanceof Error
              ? err.message
              : "Unable to read metadata."
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

  const groups = useMemo(
    () => groupMetadata(metadata),
    [metadata]
  );

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
            String(field.value).toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.fields.length > 0);
  }, [groups, search]);

  const totalFields = groups.reduce(
    (total, group) => total + group.fields.length,
    0
  );

  function formatValue(value: unknown): string {
    if (value === null) return "null";
    if (value === undefined) return "—";

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
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
          <h3 className="text-lg font-semibold text-white">
            All Metadata
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            {totalFields} metadata fields across {groups.length} groups
          </p>
        </div>

        <input
          type="search"
          placeholder="Search metadata..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#151923] px-3 py-2 text-sm text-white outline-none focus:border-blue-500 sm:w-64"
        />
      </div>

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

                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-200">
                      {formatValue(field.value)}
                    </pre>
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
