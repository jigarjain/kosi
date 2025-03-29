import { createContext, useContext } from "react";
import { convertToPageSlug } from "../lib/utils";

export interface AppState {
  currentPageSlug: string;
}

export const defaultAppState: AppState = {
  currentPageSlug: convertToPageSlug(new Date())
};

export const AppStateContext = createContext<AppState>(defaultAppState);

export const useAppState = () => useContext(AppStateContext);
