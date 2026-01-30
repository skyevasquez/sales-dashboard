import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
  "/",
  "/account",
  "/org-settings",
];

// Define auth routes that should redirect to home if already logged in
const authRoutes = [
  "/auth",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for auth token in cookies
  // Better Auth stores the session in a cookie
  const sessionCookie = request.cookies.get("better-auth.session_token") || 
                        request.cookies.get("__session");
  
  const isAuthenticated = !!sessionCookie?.value;

  // If accessing a protected route without authentication, redirect to login
  if (protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    if (!isAuthenticated) {
      const url = new URL("/auth", request.url);
      // Add the original URL as a redirect parameter
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // If accessing an auth route while authenticated, redirect to home
  if (authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    if (isAuthenticated) {
      // Check for redirect parameter
      const redirectUrl = request.nextUrl.searchParams.get("redirect");
      return NextResponse.redirect(new URL(redirectUrl || "/", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (we handle auth at the API level)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
