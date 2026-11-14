
import { parseMetadata } from "@colorhythm/exiftool-wasm";

export type MetadataRecord = Record<string, unknown>;

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
    args: [
      "-json",
      "-G",
      "-a",
      "-u",
      "-n",
    ],
    transform: (data) => JSON.parse(data),
  });

  if (!result.success) {
    throw new Error(
      result.error || "Unable to read image metadata."
    );
  }

  if (!Array.isArray(result.data)) {
    throw new Error("Unexpected metadata response.");
  }

  return result.data as MetadataRecord[];
}
