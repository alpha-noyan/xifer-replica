
"use client";

import { useImageStore } from "@/lib/store/imageStore";
import { Trash2, Image as ImageIcon } from "lucide-react";

export default function EditorSidebar() {
  const images = useImageStore((state) => state.images);
  const selectedImageId = useImageStore(
    (state) => state.selectedImageId
  );
  const selectImage = useImageStore((state) => state.selectImage);
  const removeImage = useImageStore((state) => state.removeImage);

  return (
    <aside className="rounded-xl border border-white/10 bg-[#141821] p-4">

      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-semibold">Your Images</h3>
        <span className="text-xs text-gray-500">
          {images.length} files
        </span>
      </div>

      {images.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <ImageIcon className="mx-auto mb-2" size={28} />
          <p className="text-sm">No images uploaded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image) => (
            <div
              key={image.id}
              onClick={() => selectImage(image.id)}
              className={`group flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition ${
                selectedImageId === image.id
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-transparent hover:bg-white/5"
              }`}
            >
              <img
                src={image.preview}
                alt={image.file.name}
                className="h-12 w-12 rounded-md object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {image.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  removeImage(image.id);
                }}
                aria-label={`Remove ${image.file.name}`}
                className="rounded p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

    </aside>
  );
}
