import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("accessToken")?.value
  const refreshToken = request.cookies.get("refreshToken")?.value

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Protected routes
  const protectedRoutes = ["/dashboard", "/platforms"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // If user is authenticated and tries to access public auth routes, redirect to dashboard
  if (accessToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (!accessToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
