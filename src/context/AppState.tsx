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
import { LocalPage } from "@/types/Page";
import { LocalUser } from "@/types/User";
import Store from "@/store";

export interface AppState {
  currentPage: LocalPage | null;
  currentUser: LocalUser | null;
  localAuth: LocalAuth | null;
  setCurrentPage: (page: LocalPage | null) => void;
  onLogout: () => Promise<void>;
  onLogin: (localAuth: LocalAuth, localUser: LocalUser) => Promise<void>;
}

const defaultAppState: AppState = {
  currentPage: null,
  currentUser: null,
  localAuth: null,
  setCurrentPage: () => {},
  onLogout: async () => {},
  onLogin: async () => {}
};

export const AppStateContext = createContext<AppState>(defaultAppState);

export const useAppState = () => useContext(AppStateContext);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<LocalPage | null>(null);
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [localAuth, setLocalAuth] = useState<LocalAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      await Store.setupLocalDB();
      const [localUser, localAuth] = await Promise.all([
        Store.getLocalUser(),
        Store.getLocalAuth()
      ]);
      setCurrentUser(localUser);
      setLocalAuth(localAuth);
      Store.syncPages();
      setIsLoading(false);
    };

    setup();
  }, []);

  const onLogout = useCallback(async () => {
    await Promise.all([
      Store.clearAuthStore(),
      Store.clearUserStore(),
      Store.clearPageStore(),
      Store.clearEntryStore()
    ]);
    window.location.reload();
  }, []);

  const onLogin = useCallback(
    async (localAuth: LocalAuth, localUser: LocalUser) => {
      setLocalAuth(localAuth);
      setCurrentUser(localUser);
      await Store.syncPages();
      Store.getPages();
    },
    []
  );

  const appState: AppState = useMemo(
    () => ({
      currentPage,
      currentUser,
      localAuth,
      setCurrentPage,
      onLogout,
      onLogin
    }),
    [currentPage, currentUser, localAuth, setCurrentPage, onLogout, onLogin]
  );

  if (isLoading) {
    return null;
  }

  return (
    <AppStateContext.Provider value={appState}>
      {children}
    </AppStateContext.Provider>
  );
}
