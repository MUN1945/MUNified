import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/messages - Get messages for channel (paginated)
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
    const channelId = searchParams.get("channelId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const cursor = searchParams.get("cursor")

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: "Channel ID is required" },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { channelId }

    // If cursor is provided, get messages before the cursor (for infinite scroll)
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) }
    }

    const messages = await db.message.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            munRole: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    // Reverse to show oldest first
    const sortedMessages = messages.reverse()

    return NextResponse.json({
      success: true,
      data: sortedMessages,
      pagination: {
        hasMore: messages.length === limit,
        oldestMessageDate: sortedMessages[0]?.createdAt || null,
      },
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { channelId, content } = body

    if (!channelId || !content) {
      return NextResponse.json(
        { success: false, error: "Channel ID and content are required" },
        { status: 400 }
      )
    }

    // Validate content length
    const trimmedContent = content.trim()
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty" },
        { status: 400 }
      )
    }
    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Message content cannot exceed 2000 characters" },
        { status: 400 }
      )
    }

    // Verify channel exists
    const channel = await db.channel.findUnique({
      where: { id: channelId },
    })

    if (!channel) {
      return NextResponse.json(
        { success: false, error: "Channel not found" },
        { status: 404 }
      )
    }

    const message = await db.message.create({
      data: {
        content: trimmedContent,
        channelId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(
      { success: true, data: message },
      { status: 201 }
    )
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    )
  }
}
