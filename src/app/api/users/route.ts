import { type NextRequest, NextResponse } from "next/server";
import type { TablesInsert } from "@/types/database.types";
import {
  CreateUserRequestSchema,
  CreateUserResponseDto
} from "@/types/dto.types";
import { supabaseClient } from "@/lib/supabase";
import { base64ToPGHex } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const body: unknown = await request.json();

  const result = CreateUserRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.format() },
      { status: 400 }
    );
  }

  const {
    name,
    username,
    password_salt,
    encrypted_dek_mk,
    iv_mk,
    encrypted_dek_rk,
    iv_rk,
    hashed_authkey,
    authkey_salt
  } = result.data;

  try {
    const userInsert: TablesInsert<"users"> = {
      name,
      username,
      password_salt: base64ToPGHex(password_salt),
      encrypted_dek_mk: base64ToPGHex(encrypted_dek_mk),
      iv_mk: base64ToPGHex(iv_mk),
      encrypted_dek_rk: base64ToPGHex(encrypted_dek_rk),
      iv_rk: base64ToPGHex(iv_rk),
      hashed_authkey: base64ToPGHex(hashed_authkey),
      authkey_salt: base64ToPGHex(authkey_salt),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from("users")
      .insert(userInsert)
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response: CreateUserResponseDto = {
      id: data.id,
      username: data.username,
      name: data.name,
      created_at: data.created_at!,
      updated_at: data.updated_at!
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
