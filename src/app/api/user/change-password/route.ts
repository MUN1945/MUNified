import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hashPassword, verifyPassword } from "@/lib/auth-helpers"

// POST /api/user/change-password - Change password for authenticated user
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
    const { currentPassword, newPassword } = body

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: "Current password is required" },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: "New password is required" },
        { status: 400 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: "New password must contain at least one uppercase letter" },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { success: false, error: "New password must contain at least one number" },
        { status: 400 }
      )
    }

    // Get user with current password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword)

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      // Invalidate all other sessions for security
      db.session.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      }),
    ])

    // Log security event
    await db.securityEvent.create({
      data: {
        userId: user.id,
        eventType: "PASSWORD_CHANGE",
        details: "Password changed from settings",
        severity: "MEDIUM",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password changed successfully. Please sign in again.",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
