import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * Middleware for handling authentication and routes protection
 */
export async function middleware(request: NextRequest) {
  // Initialize the Supabase client
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Get the requested URL path
  const { pathname } = request.nextUrl;
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/jobs",
    "/profile",
    "/settings",
  ];
  
  // Define auth routes for redirecting authenticated users away from
  const authRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Redirect unauthenticated users from protected routes to sign in
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/signin", request.url);
    // Store the original URL to redirect back after sign in
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // If users hit the root and are authenticated, redirect to dashboard
  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return res;
}

/**
 * Configure which routes this middleware should run on
 */
export const config = {
  // Apply this middleware to all routes except static assets
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};