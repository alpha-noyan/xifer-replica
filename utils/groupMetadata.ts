
export interface MetadataField {
  key: string;
  group: string;
  name: string;
  value: unknown;
}

export interface MetadataGroup {
  name: string;
  fields: MetadataField[];
}

export function groupMetadata(
  metadata: Record<string, unknown>[]
): MetadataGroup[] {
  const groups: Record<string, MetadataField[]> = {};

  if (!metadata.length) return [];

  const record = metadata[0];

  for (const [key, value] of Object.entries(record)) {
    // Ignore source file information.
    if (key === "SourceFile") continue;

    // Extract group and tag name.
    const separatorIndex = key.indexOf(":");

    const group =
      separatorIndex !== -1
        ? key.substring(0, separatorIndex)
        : "Other";

    const name =
      separatorIndex !== -1
        ? key.substring(separatorIndex + 1)
        : key;

    if (!groups[group]) {
      groups[group] = [];
    }

    groups[group].push({
      key,
      group,
      name,
      value,
    });
  }

  return Object.entries(groups).map(([name, fields]) => ({
    name,
    fields,
  }));
}
