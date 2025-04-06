import { AxiosError, AxiosResponse } from "axios";
import { LocalEntry } from "@/types/Entry";
import { LocalPage } from "@/types/Page";
import {
  CreateEntryRequestDto,
  CreatePageRequestDto,
  CreatePageResponseDto,
  DeleteEntryResponseDto,
  EntryDto,
  GetPagesResponseDto,
  PageDto,
  UpdateEntryRequestDto
} from "@/types/dto.types";
import { apiClient } from "@/lib/api.client";
import { decryptData, encryptData } from "@/lib/crypto";
import { dbOperations } from "@/lib/db";
import { queryClient } from "@/lib/query.client";
import {
  base64ToUint8Array,
  convertToPageDate,
  uint8ArrayToBase64
} from "@/lib/utils";
import { AuthStore } from "./auth.store";

type fetchPageParams = { pageId: string } | { pageDate: string };

export class PageStore {
  protected constructor() {}

  private static async processPage(
    page: PageDto
  ): Promise<{ page: LocalPage; entries: LocalEntry[] }> {
    const auth = await AuthStore.getLocalAuth();
    const localPage: LocalPage = {
      id: page.id,
      user_id: page.user_id,
      created_at: new Date(page.created_at),
      updated_at: new Date(page.updated_at)
    };

    const localEntries = await Promise.all(
      page.entries.map(async (entry) => ({
        id: entry.id,
        page_id: entry.page_id,
        content: await decryptData(
          base64ToUint8Array(entry.content),
          base64ToUint8Array(entry.iv),
          auth!.dek
        ),
        iv: entry.iv,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at)
      }))
    );

    // Store page in local DB
    await dbOperations.addPage(localPage);
    await Promise.all(
      localEntries.map(async (entry) => {
        await dbOperations.addEntry(entry);
      })
    );

    return { page: localPage, entries: localEntries };
  }

  private static async fetchPages() {
    console.debug("[PageStore] fetchPages");
    const auth = await AuthStore.getLocalAuth();

    if (!auth) {
      return;
    }

    let response: AxiosResponse<GetPagesResponseDto>;

    try {
      response = await apiClient.get<GetPagesResponseDto>("/pages");
    } catch (error) {
      console.error("Error fetching pages:", error);
      return;
    }

    const processedPages = await Promise.all(
      response.data.pages.map(async (page) => {
        return await this.processPage(page);
      })
    );

    processedPages.forEach(({ page, entries }) => {
      queryClient.setQueryData(["pages", page.id], page);
      queryClient.setQueryData(
        ["pages", convertToPageDate(page.created_at)],
        page
      );
      queryClient.setQueryData(["entries", "byPage", page.id], entries);
    });
  }

  private static async fetchPage(params: fetchPageParams) {
    console.debug("[PageStore] fetchPage", params);
    const auth = await AuthStore.getLocalAuth();

    if (!auth) {
      return;
    }

    let url = "/pages";
    let response;
    let queryKey: string[];

    try {
      if ("pageId" in params) {
        url = `${url}/${params.pageId}`;
        response = await apiClient.get<PageDto>(url);
        queryKey = ["pages", params.pageId];
      } else {
        url = `${url}?date=${params.pageDate}`;
        response = await apiClient.get<GetPagesResponseDto>(url);
        queryKey = ["pages", params.pageDate];
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        console.log("Page not found with params", params);
        return;
      } else {
        console.error("Error fetching page", error);
        return;
      }
    }

    let page;

    if ("pageId" in params) {
      page = (response as AxiosResponse<PageDto>).data;
    } else {
      page = (response as AxiosResponse<GetPagesResponseDto>).data.pages[0];
    }

    const { page: localPage, entries: localEntries } =
      await this.processPage(page);

    queryClient.setQueryData(queryKey, () => localPage);
    queryClient.setQueryData(
      ["entries", "byPage", localPage.id],
      () => localEntries
    );
  }

  public static async getPages(): Promise<LocalPage[]> {
    console.debug("[PageStore] getPages");

    this.fetchPages();
    return await dbOperations.getAllPages();
  }

  public static async getPageByDate(
    pageDate: string
  ): Promise<LocalPage | null> {
    console.debug("[PageStore] getPageByDate", pageDate);

    this.fetchPage({ pageDate });
    return await dbOperations.getPageByDate(pageDate);
  }

  public static async getPageById(pageId: string): Promise<LocalPage | null> {
    console.debug("[PageStore] getPageById", pageId);

    this.fetchPage({ pageId });
    return await dbOperations.getPage(pageId);
  }

  public static async addPage(page: LocalPage): Promise<LocalPage> {
    console.debug("[PageStore] addPage", page);

    const auth = await AuthStore.getLocalAuth();
    if (!auth) {
      console.warn("Not logged in, persisting page locally only");
      await dbOperations.addPage(page);
      return page;
    }

    try {
      const pageData: CreatePageRequestDto = {
        created_at: page.created_at.toISOString(),
        updated_at: page.updated_at.toISOString()
      };

      const response = await apiClient.post<
        CreatePageRequestDto,
        AxiosResponse<CreatePageResponseDto>
      >("/pages", pageData);

      if (response.status !== 201) {
        throw new Error("Failed to create page");
      }

      // Store page in local DB
      const responsePage = response.data.page;
      const localPage: LocalPage = {
        id: responsePage.id,
        user_id: responsePage.user_id,
        created_at: new Date(responsePage.created_at),
        updated_at: new Date(responsePage.updated_at)
      };
      await dbOperations.addPage(localPage);
      return localPage;
    } catch (error) {
      console.error("Error creating page:", error);
      throw error;
    }
  }

  public static async getEntriesByPage(pageId: string): Promise<LocalEntry[]> {
    console.debug("[PageStore] getEntriesByPage", pageId);

    this.fetchPage({ pageId });
    return await dbOperations.getEntriesByPageId(pageId);
  }

  public static async addEntry(entry: LocalEntry): Promise<LocalEntry> {
    console.debug("[PageStore] addEntry", entry);

    const auth = await AuthStore.getLocalAuth();
    if (!auth) {
      console.warn("Not logged in, persisting entry locally only");
      await dbOperations.addEntry(entry);
      return entry;
    }

    try {
      const encryptResult = await encryptData(entry.content, auth.dek);

      // Convert binary data to base64 strings if necessary
      const content = uint8ArrayToBase64(encryptResult.encryptedData);
      const iv = uint8ArrayToBase64(encryptResult.iv);

      const entryData: CreateEntryRequestDto = {
        created_at: entry.created_at.toISOString(),
        updated_at: entry.updated_at.toISOString(),
        content,
        iv
      };

      const response = await apiClient.post<
        CreateEntryRequestDto,
        AxiosResponse<EntryDto>
      >(`/pages/${entry.page_id}/entries`, entryData);

      if (response.status !== 201) {
        throw new Error("Failed to create entry");
      }

      const responseEntry = response.data;
      const createdEntry: LocalEntry = {
        id: responseEntry.id,
        page_id: responseEntry.page_id,
        content: entry.content,
        iv,
        created_at: new Date(responseEntry.created_at),
        updated_at: new Date(responseEntry.updated_at)
      };

      // Store entry in local DB
      await dbOperations.addEntry(createdEntry);

      return createdEntry;
    } catch (error) {
      console.error("Error creating entry:", error);
      throw error;
    }
  }

  public static async updateEntry(entry: LocalEntry): Promise<LocalEntry> {
    console.debug("[PageStore] updateEntry", entry);

    const auth = await AuthStore.getLocalAuth();
    if (!auth) {
      console.warn("Not logged in, updating entry locally only");
      const updatedEntry: LocalEntry = { ...entry, updated_at: new Date() };
      await dbOperations.updateEntry(updatedEntry);
      return updatedEntry;
    }

    try {
      const encryptResult = await encryptData(entry.content, auth.dek);

      // Convert binary data to base64 strings if necessary
      const content = uint8ArrayToBase64(encryptResult.encryptedData);
      const iv = uint8ArrayToBase64(encryptResult.iv);

      const entryData: UpdateEntryRequestDto = {
        content,
        iv
      };

      const response = await apiClient.put<
        UpdateEntryRequestDto,
        AxiosResponse<EntryDto>
      >(`/pages/${entry.page_id}/entries/${entry.id}`, entryData);

      if (response.status !== 200) {
        throw new Error("Failed to update entry");
      }

      const responseEntry = response.data;

      const updatedEntry: LocalEntry = {
        id: responseEntry.id,
        page_id: responseEntry.page_id,
        content: entry.content,
        iv,
        created_at: new Date(responseEntry.created_at),
        updated_at: new Date(responseEntry.updated_at)
      };

      // Update entry in local DB
      await dbOperations.updateEntry(updatedEntry);

      return updatedEntry;
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
  }

  public static async deleteEntry(
    pageId: string,
    entryId: string
  ): Promise<void> {
    console.debug("[PageStore] deleteEntry", entryId);

    await dbOperations.deleteEntry(entryId);

    const auth = await AuthStore.getLocalAuth();
    if (!auth) {
      console.warn("Not logged in, local deletion only");
      return;
    }
    try {
      const response = await apiClient.delete<DeleteEntryResponseDto>(
        `/pages/${pageId}/entries/${entryId}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  }

  public static async clearPageStore(): Promise<void> {
    console.debug("[PageStore] clearPageStore");
    await dbOperations.clearPageStore();
  }

  public static async clearEntryStore(): Promise<void> {
    console.debug("[PageStore] clearEntryStore");
    await dbOperations.clearEntryStore();
  }
}
