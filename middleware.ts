import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of public routes that don't require authentication
const publicRoutes = ["/login", "/unauthorized"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Check if the path is for static files
  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo.svg") ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|json|txt|woff2?|ttf)$/i.test(pathname);

  // Get the token and expiration from cookies
  const token = request.cookies.get("token")?.value
  const expiration = request.cookies.get("expiration")?.value

  // Check if the token is valid (exists and not expired)
  const isTokenValid = token && expiration && Number(expiration) > Date.now()

  // If trying to access login page, always allow it regardless of token status
  if (pathname === "/login") {
    // If the user has a valid token and is trying to access login, redirect to dashboard
    if (isTokenValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // Otherwise, allow access to login page
    return NextResponse.next()
  }

  // If the route is not public and not a static file, and the token is invalid, redirect to login
  if (!isPublicRoute && !isStaticFile && !isTokenValid) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
