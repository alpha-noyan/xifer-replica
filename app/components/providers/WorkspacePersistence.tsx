
"use client";

import { useEffect } from "react";
import { useImageStore } from "@/lib/store/imageStore";
import {
  loadWorkspace,
  saveWorkspace,
} from "@/lib/storage/workspaceStorage";

export default function WorkspacePersistence() {
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    let unsubscribe: (() => void) | undefined;

    async function initialize() {
      try {
        const saved = await loadWorkspace();

        if (!active) return;

        if (saved) {
          const images = saved.images.map((image) => ({
            id: image.id,
            file: image.file,
            preview: URL.createObjectURL(image.file),
          }));

          const selectedImageId = images.some(
            (image) => image.id === saved.selectedImageId
          )
            ? saved.selectedImageId
            : images[0]?.id ?? null;

          useImageStore.getState().hydrateWorkspace(
            images,
            selectedImageId,
            saved.metadataByImageId ?? {}
          );
        } else {
          useImageStore.getState().hydrateWorkspace(
            [],
            null,
            {}
          );
        }

        if (!active) return;

        unsubscribe = useImageStore.subscribe((state) => {
          if (!state.isHydrated) return;

          if (timeout) clearTimeout(timeout);

          timeout = setTimeout(async () => {
            try {
              await saveWorkspace({
                images: state.images.map((image) => ({
                  id: image.id,
                  file: image.file,
                })),
                selectedImageId: state.selectedImageId,
                metadataByImageId: state.metadataByImageId,
              });
            } catch (error) {
              console.error("Workspace save failed:", error);
            }
          }, 500);
        });
      } catch (error) {
        console.error("Workspace loading failed:", error);

        if (active) {
          useImageStore.getState().hydrateWorkspace(
            [],
            null,
            {}
          );
        }
      }
    }

    initialize();

    return () => {
      active = false;

      if (timeout) clearTimeout(timeout);

      unsubscribe?.();
    };
  }, []);

  return null;
}
