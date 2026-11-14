
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

  // Indicates whether IndexedDB restoration has finished
  isHydrated: boolean;

  // Restore saved workspace
  hydrateWorkspace: (
    images: ImageFile[],
    selectedImageId: string | null,
    metadataByImageId: Record<string, ImageMetadata>
  ) => void;

  // Image actions
  setImages: (images: ImageFile[]) => void;
  selectImage: (id: string) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;

  // Metadata actions
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

  isHydrated: false,

  // Restore workspace from IndexedDB
  hydrateWorkspace: (
    images,
    selectedImageId,
    metadataByImageId
  ) =>
    set({
      images,
      selectedImageId,
      metadataByImageId,
      isHydrated: true,
    }),

  // Add or replace uploaded images
  setImages: (images) =>
    set((state) => {
      // Release old preview URLs
      state.images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      return {
        images,
        selectedImageId: images[0]?.id ?? null,
        metadataByImageId: {},
      };
    }),

  // Select an image
  selectImage: (id) =>
    set((state) => ({
      selectedImageId: state.images.some((image) => image.id === id)
        ? id
        : state.selectedImageId,
    })),

  // Remove an image and its metadata
  removeImage: (id) =>
    set((state) => {
      const image = state.images.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      const images = state.images.filter((item) => item.id !== id);

      const {
        [id]: removedMetadata,
        ...remainingMetadata
      } = state.metadataByImageId;

      return {
        images,
        metadataByImageId: remainingMetadata,
        selectedImageId:
          state.selectedImageId === id
            ? images[0]?.id ?? null
            : state.selectedImageId,
      };
    }),

  // Remove all images and metadata
  clearImages: () => {
    set((state) => {
      state.images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      return {
        images: [],
        selectedImageId: null,
        metadataByImageId: {},
      };
    });
  },

  // Save extracted metadata for an image
  setImageMetadata: (id, metadata) =>
    set((state) => ({
      metadataByImageId: {
        ...state.metadataByImageId,
        [id]: metadata,
      },
    })),

  // Update individual metadata fields
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
