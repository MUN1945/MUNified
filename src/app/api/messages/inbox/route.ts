import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// ============================================================
// GET /api/messages/inbox — Get current user's admin messages (inbox)
// Requires authenticated session
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

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || ""
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const skip = (page - 1) * limit

    // Build where clause — only messages addressed to the current user
    const where: Record<string, unknown> = { recipientId: session.user.id }

    if (category) {
      where.category = category
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const [messages, total, unreadCount] = await Promise.all([
      db.adminMessage.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.adminMessage.count({ where }),
      db.adminMessage.count({
        where: { recipientId: session.user.id, isRead: false },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: messages,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[INBOX] Error fetching inbox:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch inbox" },
      { status: 500 }
    )
  }
}

// ============================================================
// PATCH /api/messages/inbox — Mark message(s) as read
// Requires authenticated session
// Body: { id: string } or { markAllRead: true }
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, markAllRead } = body

    // Mark all messages as read for the current user
    if (markAllRead) {
      const result = await db.adminMessage.updateMany({
        where: {
          recipientId: session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      })

      return NextResponse.json({
        success: true,
        message: `Marked ${result.count} message(s) as read`,
        count: result.count,
      })
    }

    // Mark a single message as read
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required or set markAllRead to true" },
        { status: 400 }
      )
    }

    const message = await db.adminMessage.findUnique({
      where: { id },
    })

    if (!message || message.recipientId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      )
    }

    await db.adminMessage.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      message: "Message marked as read",
    })
  } catch (error) {
    console.error("[INBOX] Error updating message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    )
  }
}
