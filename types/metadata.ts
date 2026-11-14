
export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;

  width?: number;
  height?: number;

  make?: string;
  model?: string;
  software?: string;
  dateTimeOriginal?: string;

  iso?: number;
  aperture?: number;
  shutterSpeed?: string;
  focalLength?: number;

  latitude?: number;
  longitude?: number;
  altitude?: number;

  title?: string;
  description?: string;
  author?: string;
  copyright?: string;
  keywords?: string;

  // Complete metadata returned by ExifTool
  raw: Record<string, unknown>;
}
