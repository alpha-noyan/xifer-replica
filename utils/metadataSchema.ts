
export interface MetadataField {
  key: string;
  label: string;
  group: string;
  defaultValue: string | number;
  type: "text" | "number";
}

const groups: Record<string, string[]> = {
  "ExifTool": [
    "ExifTool:ExifToolVersion",
    "ExifTool:Warning",
  ],

  "File": [
    "File:FileName",
    "File:Directory",
    "File:FileSize",
    "File:FileModifyDate",
    "File:FileAccessDate",
    "File:FileInodeChangeDate",
    "File:FilePermissions",
    "File:FileType",
    "File:FileTypeExtension",
    "File:MIMEType",
    "File:ExifByteOrder",
  ],

  "RIFF": [
    "RIFF:WebP_Flags",
    "RIFF:ImageWidth",
    "RIFF:ImageHeight",
    "RIFF:VP8Version",
    "RIFF:HorizontalScale",
    "RIFF:VerticalScale",
  ],

  "EXIF": [
    "EXIF:ImageDescription",
    "EXIF:Orientation",
    "EXIF:XResolution",
    "EXIF:YResolution",
    "EXIF:ResolutionUnit",
    "EXIF:ModifyDate",
    "EXIF:Artist",
    "EXIF:YCbCrPositioning",
    "EXIF:ExifVersion",
    "EXIF:DateTimeOriginal",
    "EXIF:CreateDate",
    "EXIF:ComponentsConfiguration",
    "EXIF:FlashpixVersion",
    "EXIF:ColorSpace",
    "EXIF:ExifImageWidth",
    "EXIF:ExifImageHeight",
    "EXIF:OwnerName",
    "EXIF:GPSLatitudeRef",
    "EXIF:GPSLatitude",
    "EXIF:GPSLongitudeRef",
    "EXIF:GPSLongitude",
    "EXIF:GPSDateStamp",
  ],

  "IPTC": [
    "IPTC:ObjectName",
    "IPTC:Caption-Abstract",
    "IPTC:By-line",
    "IPTC:CopyrightNotice",
    "IPTC:Keywords",
  ],

  "XMP": [
    "XMP:XMPToolkit",
    "XMP:FirstPhotoDate",
    "XMP:LastPhotoDate",
    "XMP:Description",
    "XMP:Title",
    "XMP:Country",
    "XMP:DateCreated",
    "XMP:Headline",
    "XMP:Rating",
  ],

  "Composite": [
    "Composite:ImageSize",
    "Composite:Megapixels",
    "Composite:GPSLatitude",
    "Composite:GPSLongitude",
    "Composite:GPSPosition",
  ],
};

export const metadataSchema: MetadataField[] = Object.entries(groups).flatMap(
  ([group, keys]) =>
    keys.map((key) => ({
      key,
      label: key.split(":")[1],
      group,
      defaultValue: "",
      type: "text" as const,
    }))
);

function getDateType(key: string):
  | "date"
  | "time"
  | "datetime-local"
  | undefined {
  const name = key.split(":")[1].toLowerCase();

  if (
    name.includes("datetime") ||
    name.includes("datecreated") ||
    name.includes("photodate")
  ) {
    return "datetime-local";
  }

  if (name.includes("datestamp") || name.includes("date")) {
    return "date";
  }

  if (name.includes("time")) {
    return "time";
  }

  return undefined;
}

export function buildMetadataFields(
  raw: Record<string, unknown>
): MetadataField[] {
  return metadataSchema.map((field) => {
    const value = raw[field.key];

    return {
      ...field,
      defaultValue:
        value === undefined || value === null
          ? ""
          : typeof value === "object"
            ? JSON.stringify(value)
            : value as string | number,
      type: typeof value === "number" ? "number" : "text",
      dateType: getDateType(field.key)
    };
  });
}

export interface MetadataField {
  key: string;
  label: string;
  group: string;
  defaultValue: string | number;
  type: "text" | "number";
  dateType?: "date" | "time" | "datetime-local";
}
