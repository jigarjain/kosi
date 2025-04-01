import { dbOperations } from "@/lib/db";
import { LocalEntry } from "@/types/Entry";
import { LocalPage, Page } from "@/types/Page";

class Store {
  private constructor() {}

  public static async getPageByDate(date: string): Promise<Page | null> {
    console.debug("[Store] getPageByDate", date);
    return dbOperations.getPageByDate(date);
  }

  public static async addPage(page: LocalPage): Promise<LocalPage> {
    console.debug("[Store] addPage", page);
    return dbOperations.addPage(page);
  }

  public static async getEntriesByPage(pageId: string): Promise<LocalEntry[]> {
    console.debug("[Store] getEntriesByPage", pageId);
    return dbOperations.getEntriesByPageId(pageId);
  }

  public static async addEntry(entry: LocalEntry): Promise<LocalEntry> {
    console.debug("[Store] addEntry", entry);
    return dbOperations.addEntry(entry);
  }

  public static async updateEntry(entry: LocalEntry): Promise<LocalEntry> {
    console.debug("[Store] updateEntry", entry);
    return dbOperations.updateEntry(entry);
  }

  public static async deleteEntry(entryId: string): Promise<void> {
    console.debug("[Store] deleteEntry", entryId);
    return dbOperations.deleteEntry(entryId);
  }
}

export default Store;
