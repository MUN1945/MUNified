import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// ============================================================
// GET /api/admin/messages — List all admin messages with pagination
// Requires MASTER_ADMIN, FOUNDER, or SUPER_ADMIN
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

    const adminRole = session.user.role as string
    if (adminRole !== "MASTER_ADMIN" && adminRole !== "FOUNDER" && adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "MASTER_ADMIN, FOUNDER, or SUPER_ADMIN access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get("recipientId") || ""
    const category = searchParams.get("category") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (recipientId) {
      where.recipientId = recipientId
    }

    if (category) {
      where.category = category
    }

    const [messages, total, unreadTotal] = await Promise.all([
      db.adminMessage.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.adminMessage.count({ where }),
      db.adminMessage.count({ where: { ...where, isRead: false } }),
    ])

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        unreadTotal,
      },
    })
  } catch (error) {
    console.error("[ADMIN MESSAGES] Error fetching messages:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// ============================================================
// POST /api/admin/messages — Send a message from admin to user
// Requires MASTER_ADMIN, FOUNDER, or SUPER_ADMIN
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const adminRole = session.user.role as string
    if (adminRole !== "MASTER_ADMIN" && adminRole !== "FOUNDER" && adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "MASTER_ADMIN, FOUNDER, or SUPER_ADMIN access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { recipientId, subject, content, category } = body

    // Validate required fields
    if (!recipientId || !subject || !content) {
      return NextResponse.json(
        { success: false, error: "Recipient ID, subject, and content are required" },
        { status: 400 }
      )
    }

    // Validate subject length
    const trimmedSubject = subject.trim()
    if (trimmedSubject.length === 0) {
      return NextResponse.json(
        { success: false, error: "Subject cannot be empty" },
        { status: 400 }
      )
    }

    // Validate content length
    const trimmedContent = content.trim()
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { success: false, error: "Content cannot be empty" },
        { status: 400 }
      )
    }

    // Validate category if provided
    const validCategories = ["general", "password_reset", "subscription", "account", "system", "support"]
    const messageCategory = category || "general"
    if (!validCategories.includes(messageCategory)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate recipient exists
    const recipient = await db.user.findUnique({
      where: { id: recipientId },
      select: { id: true, name: true, email: true },
    })

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: "Recipient user not found" },
        { status: 404 }
      )
    }

    // Create AdminMessage and Notification in a transaction
    const message = await db.$transaction(async (tx) => {
      // Create the admin message
      const adminMessage = await tx.adminMessage.create({
        data: {
          senderId: session.user.id!,
          recipientId,
          subject: trimmedSubject,
          content: trimmedContent,
          category: messageCategory,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      })

      // Create a notification for the recipient
      await tx.notification.create({
        data: {
          userId: recipientId,
          title: `Message from Admin: ${trimmedSubject}`,
          message: trimmedContent.length > 100 ? trimmedContent.substring(0, 100) + "..." : trimmedContent,
          type: "admin_message",
          senderId: session.user.id!,
          link: "/messages/inbox",
        },
      })

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: session.user.id!,
          action: "CREATE",
          resource: "AdminMessage",
          resourceId: adminMessage.id,
          details: `Admin sent message to ${recipient.email} (${recipient.name}) with subject "${trimmedSubject}" and category "${messageCategory}"`,
        },
      })

      return adminMessage
    })

    return NextResponse.json(
      {
        success: true,
        data: message,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[ADMIN MESSAGES] Error sending message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    )
  }
}
