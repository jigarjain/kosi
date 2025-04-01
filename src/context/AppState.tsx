"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LocalUser } from "@/types/User";
import { Page } from "@/types/Page";
import { setupLocalDB } from "@/lib/local";

export interface AppState {
  currentPage: Page | null;
  currentUser: LocalUser | null;
  setCurrentPage: (page: Page | null) => void;
  setCurrentUser: (user: LocalUser) => void;
}

const defaultAppState: AppState = {
  currentPage: null,
  currentUser: null,
  setCurrentPage: () => {}, // no-op function
  setCurrentUser: () => {} // no-op function
};

export const AppStateContext = createContext<AppState>(defaultAppState);

export const useAppState = () => useContext(AppStateContext);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    const setup = async () => {
      const user = await setupLocalDB();
      setCurrentUser(user);
    };

    setup();
  }, []);

  const appState: AppState = useMemo(
    () => ({
      currentPage,
      currentUser,
      setCurrentPage,
      setCurrentUser
    }),
    [currentPage, currentUser, setCurrentPage, setCurrentUser]
  );

  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
}
