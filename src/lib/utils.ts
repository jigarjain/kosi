import { LocalEntry } from "@/types/Entry";
import { LocalPage } from "@/types/Page";

/**
 * Validates if a given string is a valid page date in YYYY-MM-DD format
 * @param pageDate - The page date to validate
 */
export function validatePageDate(pageDate: string): boolean {
  const date = new Date(pageDate);
  return date && /^\d{4}-\d{2}-\d{2}$/.test(pageDate);
}

/**
 * Converts a Date object to a page date in YYYY-MM-DD format
 * @param date - The date to convert
 */
export function convertToPageDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Gets the previous day's page date
 * @param currentPageDate - The current page date
 */
export function getPreviousPageDateString(currentPageDate: Date): string {
  const date = new Date(currentPageDate);
  date.setDate(date.getDate() - 1);
  return convertToPageDate(date);
}

/**
 * Gets the next day's page date. Returns null if the current page is today
 * @param currentPageDate - The current page date
 */
export function getNextPageDateString(currentPageDate: Date): string | null {
  const date = new Date(currentPageDate);
  if (date.toDateString() === new Date().toDateString()) {
    return null;
  }
  date.setDate(date.getDate() + 1);
  return convertToPageDate(date);
}

/**
 * Creates a new page with the given date
 * @param pageDate - The date for the new page
 */
export function createNewPage(pageDate: string, userId: string): LocalPage {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    created_at: new Date(pageDate),
    updated_at: new Date(pageDate)
  };
}

/**
 * Creates a new entry with the given text
 * @param entryText - The content of the new entry
 */
export function createNewEntry(entryText: string, pageId: string): LocalEntry {
  return {
    id: crypto.randomUUID(),
    page_id: pageId,
    content: entryText,
    created_at: new Date(),
    updated_at: new Date()
  };
}
