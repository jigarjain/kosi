import { type NextRequest, NextResponse } from "next/server";
import { Tables } from "@/types/database.types";
import {
  CreatePageRequestSchema,
  CreatePageResponseDto,
  EntryDto,
  GetPageRequestSchema,
  GetPagesResponseDto,
  PageDto
} from "@/types/dto.types";
import { supabaseClient } from "@/lib/supabase";
import { PGHexToBase64 } from "@/lib/utils";
import { AUTH_USER_ID_HEADER } from "@/app/api/auth/auth.helper";

// Helper function to fetch and format entries for given page IDs
async function fetchAndFormatEntries(
  pageIds: string[]
): Promise<Record<string, EntryDto[]>> {
  if (pageIds.length === 0) {
    return {};
  }

  const { data: allEntriesData, error: entriesError } = await supabaseClient
    .from("entries")
    .select<
      string,
      Pick<
        Tables<"entries">,
        "id" | "content" | "iv" | "created_at" | "updated_at" | "page_id"
      >
    >("id, content, iv, created_at, updated_at, page_id")
    .in("page_id", pageIds);

  if (entriesError) {
    console.error("Error fetching entries for pages:", entriesError);
    // Return an empty map, indicating no entries could be fetched
    return {};
  }

  // Convert content and iv from PGHex to base64
  const convertedEntriesData = allEntriesData.map((entry) => ({
    ...entry,
    content: PGHexToBase64(entry.content),
    iv: PGHexToBase64(entry.iv)
  }));

  // Group entries by page_id
  const entriesByPageId = convertedEntriesData.reduce(
    (acc, entry) => {
      const pageId = entry.page_id; // Type assertion needed if TS complains
      if (!acc[pageId]) {
        acc[pageId] = [];
      }
      // Ensure we push EntryDto compatible objects
      acc[pageId].push({
        id: entry.id,
        content: entry.content,
        iv: entry.iv,
        created_at: entry.created_at!,
        updated_at: entry.updated_at!,
        page_id: entry.page_id
      });
      return acc;
    },
    {} as Record<string, EntryDto[]> // Initialize with the correct type
  );

  return entriesByPageId;
}

export async function GET(request: NextRequest) {
  // Get the user ID from the request header set by middleware
  const authorizedUserId = request.headers.get(AUTH_USER_ID_HEADER);

  // Validate user_id
  if (!authorizedUserId) {
    return NextResponse.json(
      { error: "authorizedUserId is required" },
      { status: 400 }
    );
  }

  // Validate input using Zod
  const result = GetPageRequestSchema.safeParse({
    date: request.nextUrl.searchParams.get("date")
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.format() },
      { status: 400 }
    );
  }

  const { date } = result.data;

  try {
    // Base query for pages
    let pageQuery = supabaseClient
      .from("pages")
      .select<
        string,
        Pick<Tables<"pages">, "id" | "user_id" | "created_at" | "updated_at">
      >("id, user_id, created_at, updated_at")
      .eq("user_id", authorizedUserId);

    // Apply date filter if provided
    if (date) {
      // Parse the date string and create a range for that day (in UTC)
      const startDate = new Date(`${date}T00:00:00Z`);
      const endDate = new Date(`${date}T23:59:59.999Z`);
      pageQuery = pageQuery
        .gte("created_at", startDate.toISOString())
        .lt("created_at", endDate.toISOString())
        .limit(1); // Limit to 1 for single day fetch
    } else {
      // Order by creation date descending when fetching multiple pages
      pageQuery = pageQuery.order("created_at", { ascending: false });
    }

    // Execute the query
    const { data: pagesData, error: pagesError } = await pageQuery;

    if (pagesError) {
      console.error("Error fetching pages:", pagesError);
      return NextResponse.json(
        { error: "Error fetching pages" },
        { status: 500 }
      );
    }

    // Handle case where a specific date was requested but no page was found
    if (date && pagesData.length === 0) {
      return NextResponse.json(
        { error: "No page found for the specified date" },
        { status: 404 }
      );
    }

    // Fetch entries for the retrieved pages
    const pageIds = pagesData.map((page) => page.id);
    const entriesByPageId = await fetchAndFormatEntries(pageIds);

    // Map pages data and combine with entries
    const formattedPages = pagesData.map((page) => ({
      id: page.id,
      user_id: page.user_id,
      created_at: page.created_at!,
      updated_at: page.updated_at!,
      entries: entriesByPageId[page.id] || [] // Assign entries, default to empty array if none found
    }));

    // Format the final response
    const response: GetPagesResponseDto = {
      pages: formattedPages as PageDto[] // Assert type if needed, though structure matches
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing GET /api/pages request:", error);
    return NextResponse.json(
      { error: "Failed to retrieve pages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the user ID from the request header set by middleware
    const authorizedUserId = request.headers.get(AUTH_USER_ID_HEADER);

    if (!authorizedUserId) {
      return NextResponse.json(
        { error: "authorizedUserId is required" },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    const result = CreatePageRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.format() },
        { status: 400 }
      );
    }

    const { created_at, updated_at } = result.data;

    // Create new page
    const { data: newPage, error: createError } = await supabaseClient
      .from("pages")
      .insert({
        user_id: authorizedUserId as string,
        created_at,
        updated_at
      })
      .select<
        string,
        Pick<Tables<"pages">, "id" | "user_id" | "created_at" | "updated_at">
      >("id, user_id, created_at, updated_at")
      .single();

    if (createError) {
      return NextResponse.json(
        { error: "Failed to create page" },
        { status: 500 }
      );
    }

    // Return the newly created page
    const response: CreatePageResponseDto = {
      page: {
        id: newPage.id,
        user_id: newPage.user_id,
        created_at: newPage.created_at!,
        updated_at: newPage.updated_at!,
        entries: []
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/pages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
