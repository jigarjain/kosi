"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { LocalAuth } from "@/types/Auth";
import { Page } from "@/types/Page";
import { LocalUser } from "@/types/User";
import Store from "@/store";

export interface AppState {
  currentPage: Page | null;
  currentUser: LocalUser | null;
  localAuth: LocalAuth | null;
  setCurrentPage: (page: Page | null) => void;
  setCurrentUser: (user: LocalUser | null) => void;
  setLocalAuth: (localAuth: LocalAuth | null) => void;
  handleLogout: () => Promise<void>;
}

const defaultAppState: AppState = {
  currentPage: null,
  currentUser: null,
  localAuth: null,
  setCurrentPage: () => {}, // no-op function
  setCurrentUser: () => {}, // no-op function
  setLocalAuth: () => {}, // no-op function
  handleLogout: async () => {} // no-op function
};

export const AppStateContext = createContext<AppState>(defaultAppState);

export const useAppState = () => useContext(AppStateContext);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [localAuth, setLocalAuth] = useState<LocalAuth | null>(null);

  const handleLogout = useCallback(async () => {
    await Store.deleteLocalAuth();
    await Store.deleteLocalUser();
    setLocalAuth(null);
    setCurrentUser(null);
  }, [setLocalAuth, setCurrentUser]);

  useEffect(() => {
    const setup = async () => {
      await Store.setupLocalDB();
      const [localUser, localAuth] = await Promise.all([
        Store.getLocalUser(),
        Store.getLocalAuth()
      ]);
      setCurrentUser(localUser);
      setLocalAuth(localAuth);
    };

    setup();
  }, []);

  const appState: AppState = useMemo(
    () => ({
      currentPage,
      currentUser,
      localAuth,
      setCurrentPage,
      setCurrentUser,
      setLocalAuth,
      handleLogout
    }),
    [
      currentPage,
      currentUser,
      localAuth,
      setCurrentPage,
      setCurrentUser,
      setLocalAuth,
      handleLogout
    ]
  );

  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
}
