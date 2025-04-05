import { type NextRequest, NextResponse } from "next/server";
import { Tables } from "@/types/database.types";
import { CreateEntryRequestSchema, EntryDto } from "@/types/dto.types";
import { supabaseClient } from "@/lib/supabase";
import { PGHexToBase64, base64ToPGHex } from "@/lib/utils";

type Params = {
  pageId: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { pageId } = await params;

  // Parse and validate the request body
  const body: unknown = await request.json();

  // Validate using Zod
  const result = CreateEntryRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.format() },
      { status: 400 }
    );
  }

  const { content, iv, created_at, updated_at } = result.data;

  // Create the entry, converting base64 content to PGHex format
  const { data, error } = await supabaseClient
    .from("entries")
    .insert({
      content: base64ToPGHex(content),
      iv: base64ToPGHex(iv),
      page_id: pageId,
      created_at,
      updated_at
    })
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

  return NextResponse.json(formattedData as EntryDto, { status: 201 });
}
