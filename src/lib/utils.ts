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
  const str = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

  return str;
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
  console.log("Creating new page", pageDate, new Date(pageDate));

  return {
    id: crypto.randomUUID(),
    user_id: userId,
    created_at: new Date(
      `${pageDate}T${new Date().toISOString().split("T")[1]}`
    ),
    updated_at: new Date(
      `${pageDate}T${new Date().toISOString().split("T")[1]}`
    )
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

/**
 * Converts a Uint8Array to a Base64 string
 * @param uint8Array - The Uint8Array to convert
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  // Create a Buffer view directly over the Uint8Array's underlying ArrayBuffer
  return Buffer.from(uint8Array).toString("base64");
}

/**
 * Converts a Base64 string to a Uint8Array
 * @param base64 - The Base64 string to convert
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, "base64"));
}

export function PGHexToBase64(hex: string): string {
  if (hex.startsWith("\\x")) {
    hex = hex.slice(2); // Remove the "\x" prefix
  }

  const uint8Array = Buffer.from(hex, "hex");

  return uint8ArrayToBase64(uint8Array);
}

export function base64ToPGHex(base64: string): string {
  const buffer = Buffer.from(base64, "base64");
  return `\\x${buffer.toString("hex")}`;
}
