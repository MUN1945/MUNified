import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isTeacherOrAbove } from "@/lib/auth-helpers"
import { db } from "@/lib/db"

// GET /api/channels - List channels
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
    const type = searchParams.get("type")
    const schoolId = searchParams.get("schoolId")

    const where: Record<string, unknown> = {}

    if (type) where.type = type
    // Filter channels relevant to user's school
    if (schoolId) {
      where.schoolId = schoolId
    } else if (session.user.schoolId) {
      where.OR = [
        { schoolId: session.user.schoolId },
        { schoolId: null }, // Global channels
      ]
    }

    const channels = await db.channel.findMany({
      where,
      include: {
        _count: { select: { messages: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: channels })
  } catch (error) {
    console.error("Get channels error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch channels" },
      { status: 500 }
    )
  }
}

// POST /api/channels - Create channel (requires TEACHER/ADMIN role)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    if (!isTeacherOrAbove(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Teacher or Admin role required." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, type, committeeId, schoolId } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Channel name is required" },
        { status: 400 }
      )
    }

    // Check if channel with same name exists in same scope
    const existingChannel = await db.channel.findFirst({
      where: {
        name,
        schoolId: schoolId || session.user.schoolId || null,
      },
    })

    if (existingChannel) {
      return NextResponse.json(
        { success: false, error: "A channel with this name already exists" },
        { status: 409 }
      )
    }

    const channel = await db.channel.create({
      data: {
        name,
        description: description || null,
        type: type || "general",
        committeeId: committeeId || null,
        schoolId: schoolId || session.user.schoolId || null,
      },
    })

    return NextResponse.json(
      { success: true, data: channel, message: "Channel created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create channel error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create channel" },
      { status: 500 }
    )
  }
}
