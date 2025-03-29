"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppStateContext, defaultAppState } from "@/context/AppState";
import { validatePageSlug } from "@/lib/utils";
import Header from "@/components/Header";
import DevTools from "@/components/DevTools";

export default function App({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { pageSlug } = useParams();
  const [currentPageSlug, setCurrentPageSlug] = useState(pageSlug as string);

  // Update currentPage when route changes
  useEffect(() => {
    if (pageSlug && validatePageSlug(pageSlug as string)) {
      setCurrentPageSlug(pageSlug as string);
    }
  }, [pageSlug]);

  const appState = useMemo(
    () => ({
      ...defaultAppState,
      currentPageSlug
    }),
    [currentPageSlug]
  );

  // To prevent creating a new query client on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppStateContext.Provider value={appState}>
        <Header />
        {children}
        <DevTools />
      </AppStateContext.Provider>
    </QueryClientProvider>
  );
}
