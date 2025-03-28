import { openDB } from "idb";
import Page from "@/types/Page";
import Entry from "@/types/Entry";

export const DB_NAME = "kosi-dev";
export const PAGES_STORE = "pages";
export const ENTRIES_STORE = "entries";

export const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        db.createObjectStore(ENTRIES_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(PAGES_STORE)) {
        db.createObjectStore(PAGES_STORE, { keyPath: "id" });
      }
    },
  });
};

export const dbOperations = {
  getPage: async (pageId: string): Promise<Page | null> => {
    const db = await getDB();
    const result = await db.get(PAGES_STORE, pageId);
    return (result as Page) || null;
  },

  getPageBySlug: async (pageSlug: string): Promise<Page | null> => {
    const db = await getDB();
    const allPages = await db.getAll(PAGES_STORE);
    const result = allPages.find((page) => page.slug === pageSlug);
    return (result as Page) || null;
  },

  addPage: async (page: Page): Promise<void> => {
    const db = await getDB();
    await db.put(PAGES_STORE, page);
  },

  updatePage: async (page: Page): Promise<void> => {
    const db = await getDB();
    await db.put(PAGES_STORE, page);
  },

  getEntry: async (entryId: string): Promise<Entry | null> => {
    const db = await getDB();
    const result = await db.get(ENTRIES_STORE, entryId);
    return (result as Entry) || null;
  },

  addEntry: async (entry: Entry): Promise<void> => {
    const db = await getDB();
    await db.put(ENTRIES_STORE, entry);
  },

  updateEntry: async (entry: Entry): Promise<void> => {
    const db = await getDB();
    await db.put(ENTRIES_STORE, entry);
  },

  deleteEntry: async (entryId: string): Promise<void> => {
    const db = await getDB();
    await db.delete(ENTRIES_STORE, entryId);
  },
};
