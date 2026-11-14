
import type { ImageMetadata } from "@/types/metadata";
import { readAllMetadata } from "@/utils/readAllMetadata";

function getValue(
  raw: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) {
      return raw[key];
    }
  }

  return undefined;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  return String(value);
}

function formatShutterSpeed(value: unknown): string | undefined {
  const seconds = getNumber(value);

  if (seconds === undefined || seconds <= 0) return undefined;

  if (seconds >= 1) return `${seconds} sec`;

  return `1/${Math.round(1 / seconds)} sec`;
}

export async function extractMetadata(
  file: File
): Promise<ImageMetadata> {
  const records = await readAllMetadata(file);
  const raw = records[0] ?? {};

  let width =
    getNumber(
      getValue(
        raw,
        "EXIF:ExifImageWidth",
        "EXIF:ImageWidth",
        "RIFF:ImageWidth",
        "File:ImageWidth"
      )
    );

  let height =
    getNumber(
      getValue(
        raw,
        "EXIF:ExifImageHeight",
        "EXIF:ImageHeight",
        "RIFF:ImageHeight",
        "File:ImageHeight"
      )
    );

  // Use browser dimensions as a fallback.
  if (!width || !height) {
    try {
      const bitmap = await createImageBitmap(file);
      width = width ?? bitmap.width;
      height = height ?? bitmap.height;
      bitmap.close();
    } catch {
      // Some image formats may not support createImageBitmap.
    }
  }

  const keywords = getValue(
    raw,
    "IPTC:Keywords",
    "XMP:Subject",
    "XMP:Keywords"
  );

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,

    width,
    height,

    make: getString(getValue(raw, "EXIF:Make", "IFD0:Make")),
    model: getString(getValue(raw, "EXIF:Model", "IFD0:Model")),
    software: getString(getValue(raw, "EXIF:Software", "IFD0:Software")),

    dateTimeOriginal: getString(
      getValue(raw, "EXIF:DateTimeOriginal", "XMP:DateCreated")
    ),

    iso: getNumber(getValue(raw, "EXIF:ISO", "EXIF:PhotographicSensitivity")),
    aperture: getNumber(getValue(raw, "EXIF:FNumber")),
    shutterSpeed: formatShutterSpeed(
      getValue(raw, "EXIF:ExposureTime")
    ),
    focalLength: getNumber(getValue(raw, "EXIF:FocalLength")),

    latitude: getNumber(
      getValue(raw, "EXIF:GPSLatitude", "Composite:GPSLatitude")
    ),

    longitude: getNumber(
      getValue(raw, "EXIF:GPSLongitude", "Composite:GPSLongitude")
    ),

    altitude: getNumber(
      getValue(raw, "EXIF:GPSAltitude", "Composite:GPSAltitude")
    ),

    title: getString(
      getValue(raw, "IPTC:ObjectName", "XMP:Title")
    ),

    description: getString(
      getValue(
        raw,
        "EXIF:ImageDescription",
        "IPTC:Caption-Abstract",
        "XMP:Description"
      )
    ),

    author: getString(
      getValue(raw, "EXIF:Artist", "IPTC:By-line", "XMP:Creator")
    ),

    copyright: getString(
      getValue(raw, "EXIF:Copyright", "IPTC:CopyrightNotice", "XMP:Rights")
    ),

    keywords: Array.isArray(keywords)
      ? keywords.join(", ")
      : getString(keywords),

    raw,
  };
}
