
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Trash2,
  FileImage,
  CheckCircle2,
} from "lucide-react";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 10;

export default function UploadZone() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [error, setError] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError("");

      const remaining = MAX_FILES - images.length;

      if (remaining <= 0) {
        setError("Maximum 10 images allowed.");
        return;
      }

      const selected = acceptedFiles.slice(0, remaining);

      const newImages = selected.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));

      setImages((prev) => [...prev, ...newImages]);
    },
    [images]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    multiple: true,
  });

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    setImages([]);
    setError("");
  };

  const handleUpload = () => {
    if (!images.length) return;

    // Backend integration will be added later.
    console.log(
      "Selected files:",
      images.map((image) => image.file)
    );

    alert(`${images.length} images ready for processing!`);
  };

  return (
    <section id="upload" className="mx-auto max-w-6xl px-6 pb-24">

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold">
          Upload Your Images
        </h2>

        <p className="mt-3 text-gray-400">
          Start by selecting the photos you want to edit.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition md:p-16 ${
          isDragActive
            ? "border-blue-400 bg-blue-500/10"
            : "border-white/15 bg-[#141821] hover:border-blue-500/60"
        }`}
      >
        <input {...getInputProps()} />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
          <UploadCloud size={34} />
        </div>

        <h3 className="text-xl font-semibold">
          {isDragActive
            ? "Drop your images here"
            : "Drag & drop your images here"}
        </h3>

        <p className="mt-3 text-sm text-gray-400">
          Or click anywhere in this area to browse
        </p>

        <div className="mt-6">
          <span className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold">
            Browse Images
          </span>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          JPG, JPEG, PNG, WEBP · Maximum 25 MB per image · Up to 10 images
        </p>
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-4 text-sm text-red-400">
          Some files were rejected. Only JPG, PNG and WebP images up to 25 MB are allowed.
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      {images.length > 0 && (
        <div className="mt-10">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Selected Images
              </h3>

              <p className="text-sm text-gray-400">
                {images.length} of {MAX_FILES} images
              </p>
            </div>

            <button
              onClick={clearAll}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group overflow-hidden rounded-xl border border-white/10 bg-[#141821]"
              >
                <div className="relative aspect-square">
                  <img
                    src={image.preview}
                    alt={image.file.name}
                    className="h-full w-full object-cover"
                  />

                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-2 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Remove ${image.file.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-medium">
                    {image.file.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#141821] p-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400" size={22} />

              <div>
                <p className="text-sm font-semibold">
                  Images ready
                </p>

                <p className="text-xs text-gray-400">
                  Your images are ready for metadata processing.
                </p>
              </div>
            </div>

            <button
              onClick={handleUpload}
              className="w-full rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold transition hover:bg-blue-500 sm:w-auto"
            >
              Continue to Editor
            </button>
          </div>

        </div>
      )}

    </section>
  );
}
