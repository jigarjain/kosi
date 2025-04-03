import { type NextRequest, NextResponse } from "next/server";
import {
  CreateSessionResponseDto,
  GetAuthRequestSchema,
  GetAuthResponseDto,
  SessionRequestSchema
} from "@/types/dto.types";
import { supabaseClient } from "@/lib/supabase";
import { PGHexToBase64, base64ToPGHex } from "@/lib/utils";
import { JWT_Payload, createJWT } from "@/app/api/auth/auth.helper";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Validate using Zod
  const result = GetAuthRequestSchema.safeParse({
    username: searchParams.get("username")
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.format() },
      { status: 400 }
    );
  }

  const { username } = result.data;

  const { data, error } = await supabaseClient
    .from("users")
    .select<
      string,
      GetAuthResponseDto
    >("id, encrypted_dek_mk, iv_mk, password_salt, authkey_salt")
    .eq("username", username)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedData: GetAuthResponseDto = {
    id: data.id,
    encrypted_dek_mk: PGHexToBase64(data.encrypted_dek_mk),
    iv_mk: PGHexToBase64(data.iv_mk),
    password_salt: PGHexToBase64(data.password_salt),
    authkey_salt: PGHexToBase64(data.authkey_salt)
  };

  return NextResponse.json(formattedData);
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json();

  // Validate using Zod
  const result = SessionRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation error", details: result.error.format() },
      { status: 400 }
    );
  }

  const { id, hashed_authkey } = result.data;

  const { data, error } = await supabaseClient
    .from("users")
    .select<string, JWT_Payload>("id, username, name, created_at, updated_at")
    .eq("id", id)
    .eq("hashed_authkey", base64ToPGHex(hashed_authkey))
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error generating authentication token" },
      { status: 500 }
    );
  }

  const jwt = createJWT({
    ...data
  });

  const tokenResponse: CreateSessionResponseDto = {
    jwt_token: jwt
  };

  return NextResponse.json(tokenResponse);
}
