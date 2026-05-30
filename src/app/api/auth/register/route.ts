import { NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-helpers"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, schoolId, phone, country, city } = body

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

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
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

    // Create user with delegate profile and trial subscription in a transaction
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: userRole,
        phone: phone || null,
        country: country || "UAE",
        city: city || null,
        schoolId: schoolId || null,
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
        // Create trial subscription
        subscription: {
          create: {
            tier: "FREE",
            status: "TRIAL",
            trialStartsAt: new Date(),
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        subscription: true,
        delegateProfile: true,
      },
    })

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
        message: "Account created successfully. Your 14-day trial has started.",
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
