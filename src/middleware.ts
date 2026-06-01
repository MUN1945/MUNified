import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 60 // 60 requests per minute for API

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/signin",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
]

// Routes that start with these prefixes are public
const publicPrefixes = [
  "/api/auth",
  "/api/courses",
  "/api/schools",
]

// Routes that require specific roles
const adminRoutes = [
  "/api/admin",
]

// API routes that are always accessible regardless of subscription
const subscriptionExemptApiRoutes = [
  "/api/auth",
  "/api/subscriptions",
  "/api/billing",
  "/api/conduct/acknowledge",
  "/api/user/delete",
  "/api/user/change-password",
  "/api/user/subscription-status",
  "/api/courses",        // Public course listing
  "/api/schools",        // Public school directory
  "/api/notifications",  // Allow viewing notifications
]

// Roles that bypass subscription checks
const subscriptionExemptRoles = [
  "MASTER_ADMIN",
  "FOUNDER",
  "SUPER_ADMIN",
  "ADMIN",
  "SCHOOL_ADMIN",
  "TEACHER",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 })
    response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Access-Control-Max-Age", "86400")
    return response
  }

  // ============================
  // RATE LIMITING (API routes only)
  // ============================
  if (pathname.startsWith("/api")) {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"
    const rateLimitKey = `${clientIp}:${pathname}`
    const now = Date.now()

    const rateLimitInfo = rateLimitMap.get(rateLimitKey)
    if (!rateLimitInfo || now - rateLimitInfo.lastReset > RATE_LIMIT_WINDOW) {
      rateLimitMap.set(rateLimitKey, { count: 1, lastReset: now })
    } else {
      rateLimitInfo.count++
      if (rateLimitInfo.count > RATE_LIMIT_MAX) {
        return NextResponse.json(
          { success: false, error: "Too many requests. Please try again later." },
          { status: 429 }
        )
      }
    }

    // Clean up old rate limit entries periodically
    if (Math.random() < 0.01) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (now - value.lastReset > RATE_LIMIT_WINDOW * 2) {
          rateLimitMap.delete(key)
        }
      }
    }
  }

  // ============================
  // AUTHENTICATION CHECKS
  // ============================

  // Check if the route is a public page route
  const isPublicPage = publicRoutes.some(route => pathname === route) ||
    pathname.startsWith("/auth/")

  // Check if the route is a public API route
  const isPublicApi = publicPrefixes.some(prefix => pathname.startsWith(prefix))

  // Protected page routes — /dashboard and sub-routes
  const isDashboardRoute = pathname.startsWith("/dashboard")

  // Admin API routes
  const isAdminApi = adminRoutes.some(prefix => pathname.startsWith(prefix))

  // For dashboard routes, check authentication
  if (isDashboardRoute) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      // Redirect to sign-in with callback URL
      const signInUrl = new URL("/auth/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // For admin-specific dashboard routes, check role
    if (pathname.includes("/admin") || pathname.includes("/founder")) {
      const role = token.role as string
      if (!["MASTER_ADMIN", "FOUNDER", "SUPER_ADMIN", "ADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  // For admin API routes, check authentication and role
  // Exception: /api/admin/ensure-accounts is accessible without auth (setup endpoint)
  if (isAdminApi && !pathname.includes('/api/admin/ensure-accounts')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const role = token.role as string
    if (!["MASTER_ADMIN", "FOUNDER", "SUPER_ADMIN", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }
  }

  // ============================
  // SUBSCRIPTION-BASED ACCESS CONTROL (API routes)
  // ============================
  // Enforce trial/subscription restrictions on protected API routes
  if (pathname.startsWith("/api/") && !isPublicApi && !isAdminApi) {
    // Check if this API route is exempt from subscription checks
    const isExempt = subscriptionExemptApiRoutes.some(
      prefix => pathname.startsWith(prefix)
    )

    if (!isExempt) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

      if (token) {
        const role = token.role as string
        const subscriptionStatus = token.subscriptionStatus as string
        const subscriptionTier = token.subscriptionTier as string

        // Admin/teacher roles bypass subscription checks
        if (!subscriptionExemptRoles.includes(role)) {
          const isExpired = subscriptionStatus === 'EXPIRED' ||
            (subscriptionStatus === 'TRIAL' && subscriptionTier === 'FREE')

          // Note: We do a basic check here using JWT data.
          // More granular checks (e.g., trial expiry time) are done in the API routes themselves.
          // The middleware provides a first line of defense.
          if (isExpired) {
            return NextResponse.json(
              {
                success: false,
                error: "Your trial has expired. Please upgrade to access this feature.",
                code: "TRIAL_EXPIRED",
              },
              { status: 403 }
            )
          }
        }
      }
    }
  }

  // ============================
  // SECURITY HEADERS
  // ============================
  const response = NextResponse.next()

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )

  // Add CORS headers for API routes
  if (pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Access-Control-Max-Age", "86400")
  }

  return response
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/auth/:path*",
  ],
}
