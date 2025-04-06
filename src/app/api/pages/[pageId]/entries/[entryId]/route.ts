import { type NextRequest, NextResponse } from "next/server";
import { Tables } from "@/types/database.types";
import {
  DeleteEntryResponseDto,
  EntryDto,
  UpdateEntryRequestSchema
} from "@/types/dto.types";
import { supabaseClient } from "@/lib/supabase";
import { PGHexToBase64, base64ToPGHex } from "@/lib/utils";

type Params = {
  pageId: string;
  entryId: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  // Read pageId and entryId from the url next params
  const { pageId, entryId } = await params;

  // Parse and validate the request body
  const body: unknown = await request.json();

  // Validate using Zod
  const result = UpdateEntryRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.format() },
      { status: 400 }
    );
  }

  const { content, iv } = result.data;

  // Update the entry, converting base64 content to PGHex format
  const { data, error } = await supabaseClient
    .from("entries")
    .update({
      content: base64ToPGHex(content),
      iv: base64ToPGHex(iv),
      updated_at: new Date().toISOString()
    })
    .eq("id", entryId)
    .eq("page_id", pageId)
    .select<
      string,
      Pick<
        Tables<"entries">,
        "id" | "content" | "iv" | "created_at" | "updated_at" | "page_id"
      >
    >()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Convert PGHex content back to base64 before returning
  const formattedData = {
    ...data,
    content: PGHexToBase64(data.content),
    iv: PGHexToBase64(data.iv)
  };

  // Return the updated entry
  return NextResponse.json(formattedData as EntryDto);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  // Read pageId and entryId from the url next params
  const { pageId, entryId } = await params;

  // Get the entry
  const { data, error } = await supabaseClient
    .from("entries")
    .select<
      string,
      Pick<
        Tables<"entries">,
        "id" | "content" | "iv" | "created_at" | "updated_at" | "page_id"
      >
    >()
    .eq("id", entryId)
    .eq("page_id", pageId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Convert PGHex content back to base64 before returning
  const formattedData = {
    ...data,
    content: PGHexToBase64(data.content),
    iv: PGHexToBase64(data.iv)
  };

  return NextResponse.json(formattedData as EntryDto);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  // Read pageId and entryId from the url next params
  const { pageId, entryId } = await params;

  // Delete the entry
  const { error } = await supabaseClient
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("page_id", pageId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response: DeleteEntryResponseDto = { success: true };
  return NextResponse.json(response, { status: 200 });
}
