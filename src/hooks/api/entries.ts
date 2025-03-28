import { useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { dbOperations } from "@/lib/db";
import Entry from "@/types/Entry";
import { useUpdatePage, usePageBySlug, useAddPage } from "./pages";
import { createNewEntry, createNewPage } from "@/lib/utils";

// Entry query for reuse
const createEntryQuery = (id: string) => ({
  queryKey: ["entries", id],
  queryFn: async () => dbOperations.getEntry(id),
  enabled: !!id,
});

export function useEntriesByPageSlug(pageSlug: string) {
  const pageQuery = usePageBySlug(pageSlug);

  // Then use useQueries to fetch all entries in parallel
  const entryIds = pageQuery.data?.entries || [];

  const entryQueries = useQueries({
    queries: entryIds.map((id) => createEntryQuery(id)),
  });

  // Combine the results and handle loading states
  const isLoading =
    pageQuery.isLoading || entryQueries.some((query) => query.isLoading);
  const isError =
    pageQuery.isError || entryQueries.some((query) => query.isError);
  const data =
    isLoading || isError
      ? []
      : entryQueries
          .map((query) => query.data)
          .filter((entry): entry is Entry => entry !== undefined);

  return {
    data,
    isLoading,
    isError,
    error: pageQuery.error || entryQueries.find((query) => query.error)?.error,
  };
}

interface AddEntryParams {
  entryText: string;
  pageSlug: string;
}

export function useAddEntry() {
  const queryClient = useQueryClient();
  const useAddPageMutation = useAddPage();
  const useUpdatePageMutation = useUpdatePage();

  return useMutation<Entry, Error, AddEntryParams>({
    mutationFn: async ({ entryText, pageSlug }: AddEntryParams) => {
      const entry = createNewEntry(entryText);
      let page = await dbOperations.getPageBySlug(pageSlug);

      if (!page) {
        page = createNewPage(pageSlug);
        await useAddPageMutation.mutateAsync(page);
      }

      await dbOperations.addEntry(entry);

      // Update the page to include the new entry
      page.entries.push(entry.id);
      await useUpdatePageMutation.mutateAsync(page);

      return entry;
    },
    onSuccess: (_, { pageSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({
        queryKey: ["entries", "byPage", pageSlug],
      });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation<Entry, Error, Entry>({
    mutationFn: async (entry: Entry) => {
      const updatedEntry = {
        ...entry,
        updatedAt: new Date(),
      };
      await dbOperations.updateEntry(updatedEntry);
      return updatedEntry;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entries", variables.id] });
      // We don't know which page this entry belongs to, so we invalidate all pages
      queryClient.invalidateQueries({ queryKey: ["entries", "byPage"] });
    },
  });
}

interface DeleteEntryParams {
  entryId: string;
  pageSlug: string;
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  const updatePage = useUpdatePage();

  return useMutation<void, Error, DeleteEntryParams>({
    mutationFn: async ({ entryId, pageSlug }: DeleteEntryParams) => {
      const page = await dbOperations.getPageBySlug(pageSlug);

      if (page && page.entries) {
        // Update the page to remove the entry
        const updatedPage = {
          ...page,
          entries: page.entries.filter((id: string) => id !== entryId),
          updatedAt: new Date(),
        };

        await updatePage.mutateAsync(updatedPage);
      }

      // Then delete the entry
      await dbOperations.deleteEntry(entryId);
    },
    onSuccess: (_, { pageSlug }) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({
        queryKey: ["entries", "byPage", pageSlug],
      });
    },
  });
}
