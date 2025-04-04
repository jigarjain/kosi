import { LocalAuth } from "@/types/Auth";
import { LocalEntry } from "@/types/Entry";
import { LocalPage } from "@/types/Page";
import { LocalUser } from "@/types/User";
import { initializeApiClient } from "@/lib/api.client";
import { AuthStore } from "./auth.store";
import { PageStore } from "./page.store";
import { UserStore } from "./user.store";

// Define the Store class using composition
class Store {
  private static _instance: Store | null = null;

  private constructor() {}

  public static get instance(): Store {
    if (!this._instance) {
      this._instance = new Store();
    }
    return this._instance;
  }

  public static async setupLocalDB(): Promise<void> {
    console.debug("[Store] setupLocalDB");
    let localUser = await UserStore.getLocalUser();

    if (!localUser) {
      localUser = {
        id: crypto.randomUUID(),
        name: "Elorin",
        username: "elorin",
        created_at: new Date(),
        updated_at: new Date()
      };

      await UserStore.updateLocalUser(localUser);
    }
  }

  public static async initialize(): Promise<void> {
    console.debug("[Store] initialize");
    initializeApiClient(async () => {
      const auth = await AuthStore.getLocalAuth();
      return auth?.jwt || null;
    });
  }

  // Auth methods
  public static async registerUser(
    name: string,
    username: string,
    password: string
  ): Promise<{ recoveryPhrase: string; user_id: string }> {
    return await AuthStore.registerUser(name, username, password);
  }

  public static async getAuth(
    username: string,
    password: string
  ): Promise<{ localAuth: LocalAuth | null; localUser: LocalUser | null }> {
    return await AuthStore.getAuth(username, password);
  }

  public static async getLocalAuth(): Promise<LocalAuth | null> {
    return await AuthStore.getLocalAuth();
  }

  public static async updateLocalAuth(auth: LocalAuth): Promise<void> {
    await AuthStore.updateLocalAuth(auth);
  }

  public static async clearAuthStore(): Promise<void> {
    await AuthStore.clearAuthStore();
  }

  // User methods
  public static async getLocalUser(): Promise<LocalUser | null> {
    return await UserStore.getLocalUser();
  }

  public static async updateLocalUser(user: LocalUser): Promise<LocalUser> {
    return await UserStore.updateLocalUser(user);
  }

  public static async clearUserStore(): Promise<void> {
    await UserStore.clearUserStore();
  }

  public static async addPage(page: LocalPage): Promise<LocalPage> {
    return await PageStore.addPage(page);
  }

  public static async getPages(): Promise<LocalPage[]> {
    return await PageStore.getPages();
  }

  // Page methods
  public static async getPageByDate(date: string): Promise<LocalPage | null> {
    return await PageStore.getPageByDate(date);
  }

  // Entry methods
  public static async getEntriesByPage(pageId: string): Promise<LocalEntry[]> {
    return await PageStore.getEntriesByPage(pageId);
  }

  public static async addEntry(entry: LocalEntry): Promise<LocalEntry> {
    return await PageStore.addEntry(entry);
  }

  public static async updateEntry(entry: LocalEntry): Promise<LocalEntry> {
    return await PageStore.updateEntry(entry);
  }

  public static async deleteEntry(
    pageId: string,
    entryId: string
  ): Promise<void> {
    await PageStore.deleteEntry(pageId, entryId);
  }

  public static async clearPageStore(): Promise<void> {
    await PageStore.clearPageStore();
  }

  public static async clearEntryStore(): Promise<void> {
    await PageStore.clearEntryStore();
  }
}

// Initialize the store
Store.initialize().catch(console.error);

// Export the Store class
export default Store;
