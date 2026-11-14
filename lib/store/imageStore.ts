
import { create } from "zustand";
import type { ImageMetadata } from "@/types/metadata";

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export type ImageDraft = Record<string, string>;

interface ImageStore {
  images: ImageFile[];
  selectedImageId: string | null;
  metadataByImageId: Record<string, ImageMetadata>;

  // Unsaved metadata drafts, separated by image ID
  draftValuesByImageId: Record<string, ImageDraft>;

  isHydrated: boolean;

  // Restore saved workspace
  hydrateWorkspace: (
    images: ImageFile[],
    selectedImageId: string | null,
    metadataByImageId: Record<string, ImageMetadata>,
    draftValuesByImageId?: Record<string, ImageDraft>
  ) => void;

  // Image actions
  updateImageFile: (id: string, file: File) => void;
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

  // Draft actions
  updateImageDraft: (
    id: string,
    key: string,
    value: string
  ) => void;
  setImageDraft: (id: string, draft: ImageDraft) => void;
  resetImageDraft: (id: string) => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  selectedImageId: null,
  metadataByImageId: {},
  draftValuesByImageId: {},

  isHydrated: false,

  // Restore workspace from IndexedDB
  hydrateWorkspace: (
    images,
    selectedImageId,
    metadataByImageId,
    draftValuesByImageId = {}
  ) =>
    set({
      images,
      selectedImageId,
      metadataByImageId,
      draftValuesByImageId,
      isHydrated: true,
    }),

  // Add or replace uploaded images
  setImages: (images) =>
    set((state) => {
      state.images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      return {
        images,
        selectedImageId: images[0]?.id ?? null,
        metadataByImageId: {},
        draftValuesByImageId: {},
      };
    }),

  // Select an image
  selectImage: (id) =>
    set((state) => ({
      selectedImageId: state.images.some(
        (image) => image.id === id
      )
        ? id
        : state.selectedImageId,
    })),

  // Remove an image and its metadata/drafts
  removeImage: (id) =>
    set((state) => {
      const image = state.images.find(
        (item) => item.id === id
      );

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      const images = state.images.filter(
        (item) => item.id !== id
      );

      const { [id]: removedMetadata, ...remainingMetadata } =
        state.metadataByImageId;

      const {
        [id]: removedDraft,
        ...remainingDrafts
      } = state.draftValuesByImageId;

      return {
        images,
        metadataByImageId: remainingMetadata,
        draftValuesByImageId: remainingDrafts,
        selectedImageId:
          state.selectedImageId === id
            ? images[0]?.id ?? null
            : state.selectedImageId,
      };
    }),

  // Remove all images, metadata and drafts
  clearImages: () => {
    set((state) => {
      state.images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      return {
        images: [],
        selectedImageId: null,
        metadataByImageId: {},
        draftValuesByImageId: {},
      };
    });
  },

  // Replace an image file after metadata editing
  updateImageFile: (id, file) =>
    set((state) => {
      const existingImage = state.images.find(
        (image) => image.id === id
      );

      if (!existingImage) return state;

      URL.revokeObjectURL(existingImage.preview);

      const {
        [id]: removedDraft,
        ...remainingDrafts
      } = state.draftValuesByImageId;

      return {
        images: state.images.map((image) =>
          image.id === id
            ? {
                ...image,
                file,
                preview: URL.createObjectURL(file),
              }
            : image
        ),

        metadataByImageId: Object.fromEntries(
          Object.entries(state.metadataByImageId).filter(
            ([imageId]) => imageId !== id
          )
        ),

        // Clear drafts for the image whose file was saved
        draftValuesByImageId: remainingDrafts,
      };
    }),

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

  // Update one draft field for a specific image
  updateImageDraft: (id, key, value) =>
    set((state) => ({
      draftValuesByImageId: {
        ...state.draftValuesByImageId,
        [id]: {
          ...(state.draftValuesByImageId[id] ?? {}),
          [key]: value,
        },
      },
    })),

  // Set all draft fields for a specific image
  setImageDraft: (id, draft) =>
    set((state) => ({
      draftValuesByImageId: {
        ...state.draftValuesByImageId,
        [id]: draft,
      },
    })),

  // Reset drafts for a specific image only
  resetImageDraft: (id) =>
    set((state) => {
      const {
        [id]: removedDraft,
        ...remainingDrafts
      } = state.draftValuesByImageId;

      return {
        draftValuesByImageId: remainingDrafts,
      };
    }),
}));
