
import { openDB, type IDBPDatabase } from "idb";
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

let dbPromise: Promise<IDBPDatabase> | null = null;

// Only open IndexedDB when a browser-side function actually needs it.
function getDatabase(): Promise<IDBPDatabase> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is only available in the browser.")
    );
  }

  if (!dbPromise) {
    dbPromise = openDB(DATABASE_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    }).catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}

export async function saveWorkspace(
  workspace: StoredWorkspace
): Promise<void> {
  const db = await getDatabase();
  await db.put(STORE_NAME, workspace, "current");
}

export async function loadWorkspace(): Promise<StoredWorkspace | undefined> {
  const db = await getDatabase();
  return db.get(STORE_NAME, "current");
}

export async function clearWorkspace(): Promise<void> {
  const db = await getDatabase();
  await db.delete(STORE_NAME, "current");
}
