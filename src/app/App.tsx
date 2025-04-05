"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppStateProvider } from "@/context/AppState";
import Header from "@/components/Header";

export default function App({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // To prevent creating a new query client on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            retry: 0,
            refetchOnWindowFocus: false,
            refetchOnMount: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <Header />
        {children}
      </AppStateProvider>
    </QueryClientProvider>
  );
}
