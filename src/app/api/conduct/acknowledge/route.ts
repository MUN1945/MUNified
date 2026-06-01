import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const CONDUCT_VERSION = "2.0"

// GET /api/conduct/acknowledge - Check acknowledgement status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        conductAcknowledged: true,
        conductAcknowledgedAt: true,
        conductVersion: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        acknowledged: user.conductAcknowledged,
        acknowledgedAt: user.conductAcknowledgedAt
          ? user.conductAcknowledgedAt.toISOString()
          : null,
        version: user.conductVersion,
      },
    })
  } catch (error) {
    console.error("Get conduct acknowledgement error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch acknowledgement status" },
      { status: 500 }
    )
  }
}

// POST /api/conduct/acknowledge - Save acknowledgement
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { conductAcknowledged: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    if (user.conductAcknowledged) {
      return NextResponse.json({
        success: true,
        data: {
          acknowledged: true,
          message: "Already acknowledged",
        },
      })
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        conductAcknowledged: true,
        conductAcknowledgedAt: new Date(),
        conductVersion: CONDUCT_VERSION,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        acknowledged: true,
        message: "Code of Conduct acknowledged successfully",
      },
    })
  } catch (error) {
    console.error("Save conduct acknowledgement error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save acknowledgement" },
      { status: 500 }
    )
  }
}
