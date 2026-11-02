import exifr from "exifr";
import type { ImageMetadata } from "@/types/metadata";

function formatShutterSpeed(value?: number): string | undefined {
  if (typeof value !== "number") return undefined;

  if (value >= 1) return `${value} sec`;

  return `1/${Math.round(1 / value)} sec`;
}

export async function extractMetadata(file: File): Promise<ImageMetadata> {
  // Read the available EXIF, GPS, IPTC and XMP tags.
  const tags =
    (await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      iptc: true,
      xmp: true,
    })) ?? {};

  let width: number | undefined;
  let height: number | undefined;

  // Read image dimensions using the browser.
  try {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    bitmap.close();
  } catch {
    // Some formats may not support createImageBitmap.
  }

  const raw = tags as Record<string, unknown>;

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    width,
    height,

    make: raw.Make as string | undefined,
    model: raw.Model as string | undefined,
    software: raw.Software as string | undefined,

    dateTimeOriginal: raw.DateTimeOriginal
      ? String(raw.DateTimeOriginal)
      : undefined,

    iso: raw.ISO as number | undefined,
    aperture: raw.FNumber as number | undefined,
    shutterSpeed: formatShutterSpeed(raw.ExposureTime as number | undefined),
    focalLength: raw.FocalLength as number | undefined,

    latitude: raw.latitude as number | undefined,
    longitude: raw.longitude as number | undefined,
    altitude: raw.GPSAltitude as number | undefined,

    raw,

    title: raw.ObjectName as string | undefined,
    description: (raw.ImageDescription ?? raw.Caption) as string | undefined,
    author: (raw.Artist ?? raw.Byline) as string | undefined,
    copyright: raw.Copyright as string | undefined,
    keywords: Array.isArray(raw.Keywords)
      ? raw.Keywords.join(", ")
      : raw.Keywords
        ? String(raw.Keywords)
        : undefined,
  };
}
