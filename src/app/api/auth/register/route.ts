import { NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-helpers"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, schoolId, schoolName, phone, country, city } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Validate role — only allow non-privileged roles from registration
    const validRoles = ["STUDENT", "TEACHER", "SCHOOL_ADMIN"]
    const userRole = validRoles.includes(role) ? role : "STUDENT"

    // Determine school: if schoolName is provided (custom school), create a new school record
    let resolvedSchoolId = schoolId || null

    if (!resolvedSchoolId && schoolName && typeof schoolName === "string" && schoolName.trim()) {
      // Check if school already exists by name (case-insensitive)
      const existingSchool = await db.school.findFirst({
        where: {
          name: { equals: schoolName.trim(), mode: "insensitive" },
        },
      })

      if (existingSchool) {
        // Use the existing school
        resolvedSchoolId = existingSchool.id
      } else {
        // Create a new school record for this custom school name
        const newSchool = await db.school.create({
          data: {
            name: schoolName.trim(),
            officialName: schoolName.trim(),
            city: city || "Unknown",
            country: country || "UAE",
            source: "SELF_REGISTERED",
            verificationStatus: "PENDING",
            isVerified: false,
            isActive: true,
          },
        })
        resolvedSchoolId = newSchool.id
      }
    }

    // Create user with delegate profile and trial subscription in a transaction
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name,
        password: hashedPassword,
        role: userRole,
        phone: phone || null,
        country: country || "UAE",
        city: city || null,
        schoolId: resolvedSchoolId,
        isActive: true,
        emailVerified: false,
        // Create delegate profile for all new users
        delegateProfile: {
          create: {
            xp: 0,
            level: "OBSERVER",
            streak: 0,
            longestStreak: 0,
            conferencesAttended: 0,
            committeesServed: 0,
            awardsReceived: 0,
            resolutionsWritten: 0,
            speechesDelivered: 0,
          },
        },
        // Create trial subscription — teachers get DIRECTOR_PRO trial, students get FREE trial
        subscription: {
          create: {
            tier: userRole === "TEACHER" ? "DIRECTOR_PRO" : "FREE",
            status: "TRIAL",
            trialStartsAt: new Date(),
            trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour trial
          },
        },
      },
      include: {
        subscription: true,
        delegateProfile: true,
      },
    })

    // Generate email verification token
    const verificationToken = randomUUID()
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.emailVerificationToken.create({
      data: {
        email: normalizedEmail,
        token: verificationToken,
        expiresAt: verificationExpiresAt,
      },
    })

    // Send verification + welcome emails (non-blocking — don't block the response)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationUrl = `${appUrl}/auth/verify-email?token=${verificationToken}`

    // Fire and forget — emails should not block registration
    ;(async () => {
      try {
        const { sendVerificationEmail, sendWelcomeEmail } = await import("@/lib/email")
        await Promise.all([
          sendVerificationEmail(normalizedEmail, name, verificationUrl),
          sendWelcomeEmail(normalizedEmail, name, userRole),
        ])
        console.log(`[REGISTER] Verification + welcome emails sent to ${normalizedEmail}`)
      } catch (emailError) {
        console.error("[REGISTER] Failed to send emails:", emailError)
        // Log the verification URL so it can be used manually if email fails
        console.log(`[REGISTER] Manual verification link for ${normalizedEmail}: ${verificationUrl}`)
      }
    })()

    // Return user data without password (using `user` key for store compatibility)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        user: {
          id: userWithoutPassword.id,
          name: userWithoutPassword.name,
          email: userWithoutPassword.email,
          role: userWithoutPassword.role,
          munRole: userWithoutPassword.munRole,
          avatar: userWithoutPassword.avatar,
          schoolId: userWithoutPassword.schoolId,
          subscriptionTier: userWithoutPassword.subscription?.tier || "FREE",
          subscriptionStatus: userWithoutPassword.subscription?.status || "TRIAL",
        },
        message: "Account created successfully. Your 24-hour trial has started."
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    )
  }
}
