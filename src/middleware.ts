import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isComingSoonBypassPath, isComingSoonEnabled } from "@/lib/coming-soon";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/google8892a9fc6bec8836.html") {
    return NextResponse.next();
  }

  if (isComingSoonEnabled() && !isComingSoonBypassPath(pathname) && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next({ request });
  const noIndexPrefixes = ["/admin", "/branch", "/display", "/lobby", "/auth", "/warenkorb", "/lieferung", "/abholung", "/bestellung"];
  if (noIndexPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (pathname.startsWith("/admin")) {
    if (!pathname.startsWith("/admin/login")) {
      const admin = request.cookies.get("pastera_admin")?.value;
      if (admin !== "1") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    return updateSupabaseSession(request, response);
  }

  if (pathname.startsWith("/branch") && !pathname.startsWith("/branch/login")) {
    if (!request.cookies.get("pastera_branch_id")?.value) {
      return NextResponse.redirect(new URL("/branch/login", request.url));
    }
    return updateSupabaseSession(request, response);
  }

  if (pathname.startsWith("/display") && pathname !== "/display/login") {
    if (request.cookies.get("pastera_display")?.value !== "1") {
      return NextResponse.redirect(new URL("/display/login", request.url));
    }
    return updateSupabaseSession(request, response);
  }

  if (pathname.startsWith("/lobby") && pathname !== "/lobby/login") {
    if (request.cookies.get("pastera_lobby")?.value !== "1") {
      return NextResponse.redirect(new URL("/lobby/login", request.url));
    }
    return updateSupabaseSession(request, response);
  }

  return updateSupabaseSession(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
