import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { verifyJWT } from "./api/auth/auth.helper";

export default async function middleware(request: NextRequest) {
  console.log("middleware path:", request.nextUrl.pathname);
  const jwt = request.headers.get("Authorization")?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyJWT(jwt);

  console.log("Decoded JWT", decoded);

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Set the user id in the request object as additional metadata
  request.nextUrl.searchParams.set("authorizedUserId", decoded.id);

  // For routes that include specific pageId, verify the user owns the page
  const segments = request.nextUrl.pathname.split("/");
  const pagesIndex = segments.findIndex((segment) => segment === "pages");

  if (pagesIndex >= 0 && segments.length > pagesIndex + 1) {
    const pageId = segments[pagesIndex + 1];

    // Skip validation for new page creation or route files
    if (pageId === "route" || pageId === "index") {
      return NextResponse.next();
    }

    console.log("Validating page ownership for pageId:", pageId);

    // Query the database to check if the page belongs to the user
    const { data, error } = await supabaseClient
      .from("pages")
      .select("user_id")
      .eq("id", pageId)
      .eq("user_id", decoded.id)
      .single();

    if (error || !data) {
      console.error("Page not found or unauthorized user:", error);
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/pages", "/api/pages/:path*"]
};
