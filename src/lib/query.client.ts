import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }
  }
});
