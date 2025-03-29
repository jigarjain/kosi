import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dbOperations } from "@/lib/db";
import Page from "@/types/Page";

export function usePageBySlug(pageSlug: string) {
  return useQuery<Page | null>({
    queryKey: ["pages", pageSlug],
    queryFn: async () => dbOperations.getPageBySlug(pageSlug),
    enabled: !!pageSlug
  });
}

export function useAddPage() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, Page>({
    mutationFn: async (newPage: Page) => {
      await dbOperations.addPage(newPage);
      return newPage.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    }
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, Page>({
    mutationFn: async (updatedPage: Page) => {
      await dbOperations.updatePage(updatedPage);
      return updatedPage.slug;
    },
    onSuccess: (_, updatedPage) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["pages", updatedPage.slug] });
    }
  });
}
