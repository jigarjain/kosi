import Entry from "@/types/Entry";
import Page from "@/types/Page";

/**
 * Validates if a given string is a valid page slug in YYYY-MM-DD format
 * @param pageSlug - The page slug to validate
 */
export function validatePageSlug(pageSlug: string): boolean {
  const date = new Date(pageSlug);
  return date && /^\d{4}-\d{2}-\d{2}$/.test(pageSlug);
}

/**
 * Converts a Date object to a page slug in YYYY-MM-DD format
 * @param date - The date to convert
 */
export function convertToPageSlug(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Gets the previous day's page slug
 * @param pageSlug - The current page slug
 */
export function getPreviousPageSlug(pageSlug: string): string {
  const date = new Date(pageSlug);
  date.setDate(date.getDate() - 1);
  return convertToPageSlug(date);
}

/**
 * Gets the next day's page slug. Returns null if the current page is today
 * @param pageSlug - The current page slug
 */
export function getNextPageSlug(pageSlug: string): string | null {
  const date = new Date(pageSlug);
  if (date.toDateString() === new Date().toDateString()) {
    return null;
  }
  date.setDate(date.getDate() + 1);
  return convertToPageSlug(date);
}

/**
 * Creates a new page with the given slug
 * @param pageSlug - The slug for the new page
 */
export function createNewPage(pageSlug: string): Page {
  return {
    id: crypto.randomUUID(),
    slug: pageSlug,
    entries: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Creates a new entry with the given text
 * @param entryText - The content of the new entry
 */
export function createNewEntry(entryText: string): Entry {
  return {
    id: crypto.randomUUID(),
    content: entryText,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
