import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

// Simple in-memory rate limiter: 1 request per email per 5 minutes
const rateLimitMap = new Map<string, { lastRequest: number }>()
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Rate limit check
    const rateLimitKey = `forgot-password:${normalizedEmail}`
    const rateLimitInfo = rateLimitMap.get(rateLimitKey)
    const now = Date.now()

    if (rateLimitInfo && now - rateLimitInfo.lastRequest < RATE_LIMIT_WINDOW) {
      const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW - (now - rateLimitInfo.lastRequest)) / 1000)
      return NextResponse.json(
        { error: `Please wait ${waitSeconds} seconds before requesting another reset link.` },
        { status: 429 }
      )
    }

    // Clean up old rate limit entries periodically
    if (Math.random() < 0.05) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (now - value.lastRequest > RATE_LIMIT_WINDOW * 2) {
          rateLimitMap.delete(key)
        }
      }
    }

    // Find user by email — always return success to prevent email enumeration
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (user) {
      // Invalidate any existing reset tokens for this email
      await db.passwordResetToken.updateMany({
        where: { email: normalizedEmail, used: false },
        data: { used: true },
      })

      // Generate new reset token
      const token = randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token,
          expiresAt,
        },
      })

      // Send password reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
      try {
        await sendPasswordResetEmail(normalizedEmail, user.name, resetUrl)
      } catch (emailError) {
        console.error("[PASSWORD RESET] Failed to send email:", emailError)
      }
      console.log(`[PASSWORD RESET] Reset link generated for ${normalizedEmail}: ${resetUrl}`)
    }

    // Update rate limiter
    rateLimitMap.set(rateLimitKey, { lastRequest: now })

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link shortly.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}
