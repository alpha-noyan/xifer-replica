
import { parseMetadata } from "@colorhythm/exiftool-wasm";

export type MetadataRecord = Record<string, unknown>;

// Find the first complete JSON array in a text response.
function extractFirstJsonArray(text: string): MetadataRecord[] {
  const start = text.indexOf("[");

  if (start === -1) {
    throw new Error("No JSON array found in ExifTool response.");
  }

  let depth = 0;
  let insideString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (insideString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        insideString = false;
      }

      continue;
    }

    if (char === '"') {
      insideString = true;
    } else if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;

      if (depth === 0) {
        const parsed: unknown = JSON.parse(text.slice(start, i + 1));

        if (!Array.isArray(parsed)) {
          throw new Error("Metadata response is not an array.");
        }

        return parsed as MetadataRecord[];
      }
    }
  }

  throw new Error("Incomplete JSON array in ExifTool response.");
}

export async function readAllMetadata(
  file: File
): Promise<MetadataRecord[]> {
  if (typeof window === "undefined") {
    throw new Error("Metadata reading is only available in the browser.");
  }

  if (!file) {
    throw new Error("No image file was provided.");
  }

  const result = await parseMetadata(file, {
    args: ["-json", "-G", "-a", "-u", "-n", "-m", "-q"],
  });

  if (!result.success) {
    throw new Error(result.error || "Unable to read image metadata.");
  }

  let data: unknown = result.data;

  // Handle responses that are JSON-encoded more than once.
  for (let attempt = 0; attempt < 3; attempt++) {
    if (Array.isArray(data)) {
      return data as MetadataRecord[];
    }

    if (typeof data !== "string") {
      break;
    }

    const trimmed = data.trim();

    try {
      const parsed: unknown = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed as MetadataRecord[];
      }

      if (typeof parsed === "string") {
        data = parsed;
        continue;
      }
    } catch {
      // The response may contain multiple JSON arrays.
    }

    return extractFirstJsonArray(trimmed);
  }

  throw new Error("Unable to interpret ExifTool metadata response.");
}
