import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/notifications - Get user notifications
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
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const type = searchParams.get("type")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { userId: session.user.id }

    if (unreadOnly) where.isRead = false
    if (type) where.type = type

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Mark as read
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

    if (markAllRead) {
      await db.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      })
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      )
    }

    const notification = await db.notification.findUnique({
      where: { id },
    })

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      )
    }

    await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Mark notification error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    )
  }
}
