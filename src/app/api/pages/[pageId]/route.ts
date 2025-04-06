import { type NextRequest, NextResponse } from "next/server";
import { Tables } from "@/types/database.types";
import { EntryDto, PageDto } from "@/types/dto.types";
import { supabaseClient } from "@/lib/supabase";
import { PGHexToBase64 } from "@/lib/utils";
import { AUTH_USER_ID_HEADER } from "@/app/api/auth/auth.helper";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  // Get the user ID from the request header set by middleware
  const authorizedUserId = request.headers.get(AUTH_USER_ID_HEADER);
  const { pageId } = await params;

  // Validate user_id
  if (!authorizedUserId) {
    return NextResponse.json(
      { error: "authorizedUserId is required" },
      { status: 400 }
    );
  }

  try {
    const { data: page, error: pageError } = await supabaseClient
      .from("pages")
      .select<
        string,
        Pick<Tables<"pages">, "id" | "user_id" | "created_at" | "updated_at">
      >("id, user_id, created_at, updated_at")
      .eq("user_id", authorizedUserId)
      .eq("id", pageId)
      .single();

    if (pageError) {
      return NextResponse.json({ error: "No page found" }, { status: 404 });
    }

    // Get entries for this page
    const { data: entriesData, error: entriesError } = await supabaseClient
      .from("entries")
      .select<
        string,
        Pick<
          Tables<"entries">,
          "id" | "content" | "iv" | "created_at" | "updated_at" | "page_id"
        >
      >("id, content, iv, created_at, updated_at, page_id")
      .eq("page_id", page.id);

    if (entriesError) {
      return NextResponse.json(
        { error: "Error fetching entries" },
        { status: 500 }
      );
    }

    // Convert content from PGHex to base64
    const formattedEntries = entriesData.map((entry) => ({
      ...entry,
      content: PGHexToBase64(entry.content),
      iv: PGHexToBase64(entry.iv)
    }));

    // Format the single page response
    const response: PageDto = {
      id: page.id,
      user_id: page.user_id,
      created_at: page.created_at!,
      updated_at: page.updated_at!,
      entries: formattedEntries as EntryDto[]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to retrieve pages" },
      { status: 500 }
    );
  }
}
