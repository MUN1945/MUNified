import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth-helpers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid reset token. Please request a new password reset link." },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: "This reset link has already been used. Please request a new one." },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please request a new password reset link." },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update password and mark token as used in a transaction
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Invalidate all other reset tokens for this email
      db.passwordResetToken.updateMany({
        where: {
          email: resetToken.email,
          id: { not: resetToken.id },
          used: false,
        },
        data: { used: true },
      }),
      // Invalidate all sessions for this user
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
        details: "Password reset via email link",
        severity: "MEDIUM",
      },
    })

    return NextResponse.json({
      message: "Password has been successfully reset. You can now sign in with your new password.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
