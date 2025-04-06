"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query.client";
import { AppStateProvider } from "@/context/AppState";
import Header from "@/components/Header";

export default function App({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <Header />
        {children}
      </AppStateProvider>
    </QueryClientProvider>
  );
}
