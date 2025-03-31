import { type NextRequest, NextResponse } from "next/server";
import { createJWT } from "@/lib/auth";
import { supabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username?.length) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseClient
    .from("users")
    .select("id, encrypted_dek_mk, password_salt, authkey_salt")
    .eq("username", username);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, hashed_authkey } = body;

  if (!user_id || !hashed_authkey) {
    return NextResponse.json(
      { error: "user_id and hashed_authkey are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseClient
    .from("users")
    .select("id")
    .eq("id", user_id)
    .eq("hashed_authkey", hashed_authkey)
    .limit(1);

  if (error || !data.length) {
    return NextResponse.json(
      { error: "Error generating authentication token" },
      { status: 500 }
    );
  }

  const jwt = createJWT({
    user_id: data[0].id
  });

  return NextResponse.json({
    data: {
      token: jwt
    }
  });
}
