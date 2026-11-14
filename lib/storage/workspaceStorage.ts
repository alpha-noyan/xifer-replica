
import { openDB } from "idb";
import type { ImageMetadata } from "@/types/metadata";

interface StoredImage {
  id: string;
  file: File;
}

export interface StoredWorkspace {
  images: StoredImage[];
  selectedImageId: string | null;
  metadataByImageId: Record<string, ImageMetadata>;
}

const DATABASE_NAME = "xifer-studio-db";
const STORE_NAME = "workspace";

const dbPromise = openDB(DATABASE_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export async function saveWorkspace(
  workspace: StoredWorkspace
) {
  const db = await dbPromise;

  await db.put(STORE_NAME, workspace, "current");
}

export async function loadWorkspace(): Promise<StoredWorkspace | undefined> {
  const db = await dbPromise;

  return db.get(STORE_NAME, "current");
}

export async function clearWorkspace() {
  const db = await dbPromise;

  await db.delete(STORE_NAME, "current");
}
