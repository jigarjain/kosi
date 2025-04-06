import { type NextRequest, NextResponse } from "next/server";
import { TablesInsert } from "@/types/database.types";
import { PageDto, SyncRequestSchema, SyncResponseDto } from "@/types/dto.types";
import { supabaseClient } from "@/lib/supabase";
import { base64ToPGHex } from "@/lib/utils";
import { AUTH_USER_ID_HEADER } from "@/app/api/auth/auth.helper";
import { fetchAndFormatEntries } from "@/app/api/pages/route.helper";

export async function POST(request: NextRequest) {
  const authorizedUserId = request.headers.get(AUTH_USER_ID_HEADER);

  if (!authorizedUserId) {
    return NextResponse.json(
      { error: "Unauthorized: User ID is required" },
      { status: 401 }
    );
  }

  const body: unknown = await request.json();

  const validationResult = SyncRequestSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Validation error", details: validationResult.error.format() },
      { status: 400 }
    );
  }

  const { pages: syncPages } = validationResult.data;

  try {
    const pageUpsertPromises = syncPages.map(async (syncPage) => {
      const { error: pageUpsertError } = await supabaseClient
        .from("pages")
        .upsert(
          {
            id: syncPage.id,
            created_at: syncPage.created_at,
            updated_at: syncPage.updated_at,
            user_id: authorizedUserId
          },
          {
            onConflict: "id"
          }
        );

      if (pageUpsertError) {
        console.error(
          `Error upserting page ${syncPage.id} for user ${authorizedUserId}:`,
          pageUpsertError
        );
        throw new Error(`Failed to upsert page ${syncPage.id}`);
      }

      const entryPromises = syncPage.entries.map(async (entry) => {
        if (entry.is_delete) {
          const { error: deleteError } = await supabaseClient
            .from("entries")
            .delete()
            .match({ id: entry.id, page_id: syncPage.id });

          if (deleteError) {
            console.error(
              `Error deleting entry ${entry.id} for page ${syncPage.id}:`,
              deleteError
            );
            throw new Error(`Failed to delete entry ${entry.id}`);
          }
        } else {
          const { error: entryUpsertError } = await supabaseClient
            .from("entries")
            .upsert(
              {
                id: entry.id,
                created_at: entry.created_at,
                updated_at: entry.updated_at,
                page_id: syncPage.id,
                content: base64ToPGHex(entry.content),
                iv: base64ToPGHex(entry.iv)
              } as TablesInsert<"entries">,
              {
                onConflict: "id"
              }
            );

          if (entryUpsertError) {
            console.error(
              `Error upserting entry ${entry.id} for page ${syncPage.id}:`,
              entryUpsertError
            );
            throw new Error(`Failed to upsert entry ${entry.id}`);
          }
        }
      });
      await Promise.all(entryPromises);
    });

    await Promise.all(pageUpsertPromises);

    const updatedPageIds = syncPages.map((p) => p.id);

    const { data: finalPagesData, error: fetchPagesError } =
      await supabaseClient
        .from("pages")
        .select("id, user_id, created_at, updated_at")
        .eq("user_id", authorizedUserId)
        .order("created_at", { ascending: false })
        .in("id", updatedPageIds);

    if (fetchPagesError) {
      console.error(
        `Error fetching final pages for user ${authorizedUserId}:`,
        fetchPagesError
      );
      return NextResponse.json(
        { error: "Failed to fetch final page state" },
        { status: 500 }
      );
    }

    const finalPageIds = finalPagesData.map((p) => p.id);
    const finalEntriesByPageId = await fetchAndFormatEntries(
      finalPageIds,
      supabaseClient
    );

    const formattedFinalPages: PageDto[] = finalPagesData.map((page) => ({
      ...page,
      entries: finalEntriesByPageId[page.id] || []
    }));

    const response: SyncResponseDto = {
      pages: formattedFinalPages
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error during sync process:", error);
    return NextResponse.json(
      { error: "An error occurred during the sync process." },
      { status: 500 }
    );
  }
}
