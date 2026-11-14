"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useImageStore } from "@/lib/store/imageStore";
import MetadataBrowser from "./MetadataBrowser";

import EditorHeader from "../components/editor/EditorHeader";
import ImagePreview from "../components/editor/ImagePreview";
import MetadataTabs from "../components/editor/MetadataTabs";
import EditorSidebar from "../components/editor/EditorSidebar";
import GPSGeotagging from "../components/editor/GPSGeotagging";

export default function EditorPage() {
  const router = useRouter();

  const isHydrated = useImageStore((state) => state.isHydrated);

  const images = useImageStore((state) => state.images);

  const selectedImageId = useImageStore((state) => state.selectedImageId);

  const selectedImage = images.find((image) => image.id === selectedImageId);

  

  useEffect(() => {
    if (isHydrated && images.length === 0) {
      router.replace("/");
    }
  }, [isHydrated, images.length, router]);

  if (!isHydrated || images.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d12] text-gray-400">
        Restoring your workspace...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] text-white">
      <EditorHeader />

      <div className="mx-auto max-w-[1600px] px-5 py-8">
        <GPSGeotagging />

        <div className="mb-8">
          <h2 className="text-2xl font-bold">Image Editor</h2>

          <p className="mt-2 text-sm text-gray-400">
            Inspect your images and manage their metadata.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_350px]">
          <EditorSidebar />

          <ImagePreview />

          <MetadataTabs />
        </div>
        {/* {selectedImage && (
          <div className="mt-8">
            <MetadataBrowser key={selectedImage.id} file={selectedImage.file} />
          </div>
        )} */}
      </div>
    </main>
  );
}
