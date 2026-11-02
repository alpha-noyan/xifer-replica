
import { create } from "zustand";
import type { ImageMetadata } from "@/types/metadata";

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageStore {
  images: ImageFile[];
  selectedImageId: string | null;

  metadataByImageId: Record<string, ImageMetadata>;

  setImages: (images: ImageFile[]) => void;
  selectImage: (id: string) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;

  setImageMetadata: (id: string, metadata: ImageMetadata) => void;
  updateImageMetadata: (
    id: string,
    changes: Partial<ImageMetadata>
  ) => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  selectedImageId: null,
  metadataByImageId: {},

  setImages: (images) =>
    set({
      images,
      selectedImageId: images[0]?.id ?? null,
      metadataByImageId: {},
    }),

  selectImage: (id) => set({ selectedImageId: id }),

  removeImage: (id) =>
    set((state) => {
      const image = state.images.find((item) => item.id === id);

      if (image) URL.revokeObjectURL(image.preview);

      const images = state.images.filter((item) => item.id !== id);
      const { [id]: removedMetadata, ...remainingMetadata } =
        state.metadataByImageId;

      return {
        images,
        metadataByImageId: remainingMetadata,
        selectedImageId:
          state.selectedImageId === id
            ? images[0]?.id ?? null
            : state.selectedImageId,
      };
    }),

  clearImages: () => {
    set((state) => {
      state.images.forEach((image) =>
        URL.revokeObjectURL(image.preview)
      );

      return {
        images: [],
        selectedImageId: null,
        metadataByImageId: {},
      };
    });
  },

  setImageMetadata: (id, metadata) =>
    set((state) => ({
      metadataByImageId: {
        ...state.metadataByImageId,
        [id]: metadata,
      },
    })),

  updateImageMetadata: (id, changes) =>
    set((state) => {
      const existing = state.metadataByImageId[id];

      if (!existing) return state;

      return {
        metadataByImageId: {
          ...state.metadataByImageId,
          [id]: {
            ...existing,
            ...changes,
          },
        },
      };
    }),
}));
