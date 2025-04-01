import { openDB } from "idb";
import { LocalPage } from "@/types/Page";
import { LocalEntry } from "@/types/Entry";
import { convertToPageDate } from "./utils";

export const DB_NAME = "kosi-local";
export const USERS_STORE = "users";
export const PAGES_STORE = "pages";
export const ENTRIES_STORE = "entries";

export const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        db.createObjectStore(USERS_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(ENTRIES_STORE)) {
        db.createObjectStore(ENTRIES_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(PAGES_STORE)) {
        db.createObjectStore(PAGES_STORE, { keyPath: "id" });
      }
    }
  });
};

export const dbOperations = {
  getPage: async (pageId: string): Promise<LocalPage | null> => {
    const db = await getDB();
    const result = await db.get(PAGES_STORE, pageId);
    return (result as LocalPage) || null;
  },

  getPageByDate: async (pageDate: string): Promise<LocalPage | null> => {
    const db = await getDB();
    const allPages = await db.getAll(PAGES_STORE);
    const result = allPages.find((page) => {
      return convertToPageDate(page.created_at) === pageDate;
    });

    return (result as LocalPage) || null;
  },

  addPage: async (page: LocalPage): Promise<LocalPage> => {
    const db = await getDB();
    await db.put(PAGES_STORE, page);
    return page;
  },

  updatePage: async (page: LocalPage): Promise<void> => {
    const db = await getDB();
    await db.put(PAGES_STORE, page);
  },

  getEntry: async (entryId: string): Promise<LocalEntry | null> => {
    const db = await getDB();
    const result = await db.get(ENTRIES_STORE, entryId);
    return (result as LocalEntry) || null;
  },

  getEntriesByPageId: async (pageId: string): Promise<LocalEntry[]> => {
    const db = await getDB();
    const result = await db.getAll(ENTRIES_STORE);
    return result.filter((entry) => entry.page_id === pageId) as LocalEntry[];
  },

  getEntriesByPageDate: async (pageDate: string): Promise<LocalEntry[]> => {
    const page = await dbOperations.getPageByDate(pageDate);

    if (!page) {
      return [];
    }

    return await dbOperations.getEntriesByPageId(page.id);
  },

  addEntry: async (entry: LocalEntry): Promise<LocalEntry> => {
    const db = await getDB();
    await db.put(ENTRIES_STORE, entry);
    return entry;
  },

  updateEntry: async (entry: LocalEntry): Promise<LocalEntry> => {
    const db = await getDB();
    await db.put(ENTRIES_STORE, entry);
    return entry;
  },

  deleteEntry: async (entryId: string): Promise<void> => {
    const db = await getDB();
    await db.delete(ENTRIES_STORE, entryId);
  }
};
