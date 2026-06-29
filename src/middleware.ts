import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isComingSoonBypassPath, isComingSoonEnabled } from "@/lib/coming-soon";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isComingSoonEnabled() && !isComingSoonBypassPath(pathname) && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next({ request });

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
