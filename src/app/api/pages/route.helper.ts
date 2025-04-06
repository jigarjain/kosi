import { Tables } from "@/types/database.types";
import { EntryDto } from "@/types/dto.types";
import { supabaseClient } from "@/lib/supabase";
import { PGHexToBase64 } from "@/lib/utils";

// Helper function to fetch and format entries for given page IDs
export async function fetchAndFormatEntries(
  pageIds: string[],
  supabase: typeof supabaseClient // Use the inferred type
): Promise<Record<string, EntryDto[]>> {
  if (pageIds.length === 0) {
    return {};
  }

  const { data: allEntriesData, error: entriesError } = await supabase
    .from("entries")
    .select<
      string,
      Pick<
        Tables<"entries">,
        "id" | "content" | "iv" | "created_at" | "updated_at" | "page_id"
      >
    >("id, content, iv, created_at, updated_at, page_id")
    .in("page_id", pageIds)
    .order("created_at", { ascending: true });

  if (entriesError) {
    console.error("Error fetching entries for pages:", entriesError);
    // Return an empty map, indicating no entries could be fetched
    return {};
  }

  const convertedEntriesData = allEntriesData.map((entry) => ({
    ...entry,
    content: PGHexToBase64(entry.content),
    iv: PGHexToBase64(entry.iv)
  }));

  // Group entries by page_id
  const entriesByPageId = convertedEntriesData.reduce(
    (acc, entry) => {
      if (!acc[entry.page_id]) {
        acc[entry.page_id] = [];
      }
      acc[entry.page_id].push(entry);
      return acc;
    },
    {} as Record<string, EntryDto[]> // Initialize with the correct type
  );

  return entriesByPageId;
}
