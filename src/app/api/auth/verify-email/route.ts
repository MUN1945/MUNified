import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle "resend" action — create a new verification token and send email
    if (body.action === "resend" && body.email) {
      const email = (body.email as string).toLowerCase().trim()

      if (!email) {
        return NextResponse.json(
          { error: "Email is required for resend." },
          { status: 400 }
        )
      }

      const user = await db.user.findUnique({ where: { email } })

      if (!user) {
        // Always return success to prevent email enumeration
        return NextResponse.json({
          message: "If an account exists with this email, a verification link has been sent.",
        })
      }

      if (user.emailVerified) {
        return NextResponse.json({
          message: "Email is already verified.",
        })
      }

      // Invalidate any existing verification tokens for this email
      await db.emailVerificationToken.updateMany({
        where: { email, used: false },
        data: { used: true },
      })

      // Generate new verification token
      const token = randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await db.emailVerificationToken.create({
        data: { email, token, expiresAt },
      })

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`

      try {
        await sendVerificationEmail(email, user.name, verificationUrl)
      } catch (emailError) {
        console.error("[VERIFY EMAIL] Failed to send verification email:", emailError)
      }

      console.log(`[VERIFY EMAIL] Verification link for ${email}: ${verificationUrl}`)

      return NextResponse.json({
        message: "If an account exists with this email, a verification link has been sent.",
      })
    }

    // Handle token verification
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    // Find the verification token
    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token." },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (verificationToken.used) {
      return NextResponse.json(
        { error: "This verification link has already been used." },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification link has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: verificationToken.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 400 }
      )
    }

    if (user.emailVerified) {
      // Mark token as used even if already verified
      await db.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      })
      return NextResponse.json({
        message: "Email is already verified.",
      })
    }

    // Mark email as verified and token as used
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
      db.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
      // Invalidate all other verification tokens for this email
      db.emailVerificationToken.updateMany({
        where: {
          email: verificationToken.email,
          id: { not: verificationToken.id },
          used: false,
        },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      message: "Email has been successfully verified.",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    )
  }
}

// GET handler for email verification links (click from email)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=Invalid+verification+link', request.url)
    )
  }

  try {
    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
      return NextResponse.redirect(
        new URL('/auth/signin?error=Invalid+or+expired+verification+link', request.url)
      )
    }

    const user = await db.user.findUnique({
      where: { email: verificationToken.email },
    })

    if (user && !user.emailVerified) {
      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        }),
        db.emailVerificationToken.update({
          where: { id: verificationToken.id },
          data: { used: true },
        }),
      ])
    }

    return NextResponse.redirect(
      new URL('/auth/signin?verified=true', request.url)
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(
      new URL('/auth/signin?error=Verification+failed', request.url)
    )
  }
}
