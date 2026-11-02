
"use client";

import { useImageStore } from "@/lib/store/imageStore";
import { ImageIcon, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

export default function ImagePreview() {
  const images = useImageStore((state) => state.images);
  const selectedImageId = useImageStore(
    (state) => state.selectedImageId
  );

  const [zoom, setZoom] = useState(100);

  const image = images.find(
    (item) => item.id === selectedImageId
  );

  if (!image) {
    return (
      <div className="flex min-h-[450px] items-center justify-center rounded-xl border border-white/10 bg-[#141821]">
        <div className="text-center">
          <ImageIcon className="mx-auto mb-3 text-gray-500" size={40} />
          <p className="text-gray-400">No image selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141821]">

      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Image Preview</h3>
          <p className="mt-1 text-xs text-gray-500">
            {image.file.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            className="text-gray-400 hover:text-white"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>

          <span className="text-xs text-gray-400">{zoom}%</span>

          <button
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            className="text-gray-400 hover:text-white"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      <div className="flex min-h-[450px] items-center justify-center overflow-auto p-6">
        <img
          src={image.preview}
          alt={image.file.name}
          style={{ width: `${zoom}%` }}
          className="max-w-none rounded-lg object-contain"
        />
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500">
          <span>{image.file.type || "Unknown format"}</span>
          <span>
            {(image.file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      </div>

    </div>
  );
}
