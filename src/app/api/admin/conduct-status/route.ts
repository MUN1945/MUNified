import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/admin/conduct-status - Returns all users with their CoC acknowledgement status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check admin role
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (
      !currentUser ||
      !["MASTER_ADMIN", "FOUNDER", "SUPER_ADMIN"].includes(currentUser.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          conductAcknowledged: true,
          conductAcknowledgedAt: true,
          conductVersion: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.user.count(),
    ])

    return NextResponse.json({
      success: true,
      data: users.map((u) => ({
        ...u,
        conductAcknowledgedAt: u.conductAcknowledgedAt
          ? u.conductAcknowledgedAt.toISOString()
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get conduct status error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch conduct status" },
      { status: 500 }
    )
  }
}
