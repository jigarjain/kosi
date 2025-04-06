import { NextRequest, NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";
import { AUTH_USER_ID_HEADER, verifyJWT } from "@/app/api/auth/auth.helper";

export async function middleware(request: NextRequest) {
  console.log("[Middleware] URL:", request.url);
  const jwt = request.headers.get("Authorization")?.split(" ")[1];

  if (!jwt) {
    console.log("[Middleware] No Authorization JWT found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = await verifyJWT(jwt);

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newHeaders = new Headers(request.headers);
  console.log(`[Middleware] Setting ${AUTH_USER_ID_HEADER}:`, decoded.id);
  newHeaders.set(AUTH_USER_ID_HEADER, decoded.id);

  // For routes that include specific pageId, verify the user owns the page
  const segments = request.nextUrl.pathname.split("/");
  const pagesIndex = segments.findIndex((segment) => segment === "pages");

  if (pagesIndex >= 0 && segments.length > pagesIndex + 1) {
    const pageId = segments[pagesIndex + 1];

    // Skip validation for new page creation or route files
    if (pageId === "route" || pageId === "index") {
      return NextResponse.next({
        request: {
          headers: newHeaders
        }
      });
    }

    console.log(
      "Validating page ownership for pageId: & user_id: ",
      pageId,
      decoded.id
    );

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

  return NextResponse.next({
    request: {
      headers: newHeaders
    }
  });
}

export const config = {
  matcher: ["/api/pages(.*)", "/api/sync"]
};
