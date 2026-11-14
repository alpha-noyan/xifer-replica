
import { writeMetadata } from "@colorhythm/exiftool-wasm";

type MetadataTags = Parameters<typeof writeMetadata>[1];

export async function writeImageMetadata(
  originalFile: File,
  tags: MetadataTags
): Promise<File> {
  if (typeof window === "undefined") {
    throw new Error("Metadata writing is only available in the browser.");
  }

  if (!originalFile) {
    throw new Error("No image file was provided.");
  }

  // -m tells ExifTool to ignore minor warnings.
  const result = await writeMetadata(originalFile, tags, {
    args: ["-m"],
  });

  if (!result.success) {
    throw new Error(
      result.error || "Unable to write metadata to this image."
    );
  }

  return new File(
    [result.data],
    originalFile.name,
    {
      type: originalFile.type,
      lastModified: Date.now(),
    }
  );
}
