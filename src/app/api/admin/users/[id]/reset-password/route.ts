import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth-helpers"

// ============================================================
// POST /api/admin/users/[id]/reset-password — Admin resets a user's password
// Requires FOUNDER or SUPER_ADMIN
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify user exists
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { success: false, error: "New password is required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)

    // Update the user's password
    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    // Invalidate all existing sessions for this user
    await db.session.updateMany({
      where: { userId: id, isActive: true },
      data: { isActive: false },
    })

    // Invalidate any unused password reset tokens for this email
    await db.passwordResetToken.updateMany({
      where: { email: user.email, used: false },
      data: { used: true },
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "User",
        resourceId: id,
        details: `Admin reset password for user: ${user.email}`,
      },
    })

    // Also log as a security event
    await db.securityEvent.create({
      data: {
        userId: id,
        eventType: "PASSWORD_CHANGE",
        details: "Password reset by admin",
        severity: "MEDIUM",
      },
    })

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${user.email}`,
    })
  } catch (error) {
    console.error("[ADMIN RESET PASSWORD] Error resetting password:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
