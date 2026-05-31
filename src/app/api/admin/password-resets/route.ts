import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// ============================================================
// GET /api/admin/password-resets — List recent password reset tokens
// Requires FOUNDER or SUPER_ADMIN
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const role = session.user.role as string
    if (role !== "MASTER_ADMIN" && role !== "FOUNDER" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "MASTER_ADMIN, FOUNDER, or SUPER_ADMIN access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const skip = (page - 1) * limit
    const statusFilter = searchParams.get("status") || ""

    const where: Record<string, unknown> = {}

    if (statusFilter === "pending") {
      where.used = false
    } else if (statusFilter === "completed") {
      where.used = true
    }

    const [tokens, total] = await Promise.all([
      db.passwordResetToken.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          // There's no direct relation to User via email, but we can look up users
        },
      }),
      db.passwordResetToken.count({ where }),
    ])

    // Enrich with user data
    const emails = [...new Set(tokens.map((t) => t.email))]
    const users = await db.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })

    const userMap = new Map(users.map((u) => [u.email, u]))

    const enrichedTokens = tokens.map((token) => {
      const user = userMap.get(token.email)
      return {
        id: token.id,
        email: token.email,
        token: token.token,
        expiresAt: token.expiresAt,
        used: token.used,
        createdAt: token.createdAt,
        user: user
          ? {
              id: user.id,
              name: user.name,
              role: user.role,
              isActive: user.isActive,
            }
          : null,
        status: token.used
          ? "completed"
          : new Date(token.expiresAt) < new Date()
            ? "expired"
            : "pending",
      }
    })

    return NextResponse.json({
      success: true,
      data: enrichedTokens,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[ADMIN PASSWORD RESETS] Error fetching tokens:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch password reset tokens" },
      { status: 500 }
    )
  }
}
