import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth-helpers"
import { Prisma } from "@prisma/client"

// ============================================================
// GET /api/admin/users — List all users with pagination, search, role filter
// Requires FOUNDER or SUPER_ADMIN
// ============================================================

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const roleFilter = searchParams.get("role") || ""
    const statusFilter = searchParams.get("status") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "25")
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (roleFilter) {
      where.role = roleFilter as Prisma.EnumUserRoleFilter["equals"]
    }

    if (statusFilter === "active") {
      where.isActive = true
    } else if (statusFilter === "inactive") {
      where.isActive = false
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          schoolId: true,
          school: {
            select: { name: true },
          },
          subscription: {
            select: { tier: true, status: true },
          },
          delegateProfile: {
            select: { xp: true, level: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[ADMIN USERS] Error fetching users:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// ============================================================
// POST /api/admin/users — Create a new user manually
// Requires FOUNDER or SUPER_ADMIN
// ============================================================

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { name, email, password, role } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Name, email, password, and role are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.toLowerCase().trim())) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ["STUDENT", "TEACHER", "ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN", "FOUNDER", "MASTER_ADMIN"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      )
    }

    // Only FOUNDER can create SUPER_ADMIN or FOUNDER accounts
    if ((role === "MASTER_ADMIN" || role === "SUPER_ADMIN" || role === "FOUNDER") && adminRole !== "MASTER_ADMIN" && adminRole !== "FOUNDER") {
      return NextResponse.json(
        { success: false, error: "Only MASTER_ADMIN or FOUNDER can create high-privilege accounts" },
        { status: 403 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user with email already exists
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Build the user creation data — teachers get DIRECTOR_PRO trial, students get FREE trial
    // Both roles get a DelegateProfile (even teachers are MUN participants)
    const isTeacherOrAbove = ["TEACHER", "ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN", "FOUNDER", "MASTER_ADMIN"].includes(role)
    const initialTier = isTeacherOrAbove ? "DIRECTOR_PRO" : "FREE"

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        isActive: true,
        emailVerified: true,
        subscription: {
          create: {
            tier: initialTier,
            status: "TRIAL",
            trialStartsAt: new Date(),
            trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
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
      },
      include: {
        subscription: { select: { tier: true, status: true } },
        delegateProfile: { select: { xp: true, level: true } },
        school: { select: { name: true } },
      },
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "User",
        resourceId: user.id,
        details: `Admin created user: ${user.email} with role ${user.role}`,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          subscription: user.subscription,
          delegateProfile: user.delegateProfile,
          school: user.school,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[ADMIN USERS] Error creating user:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = Unique constraint violation (duplicate email)
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[])?.join(', ') || 'unknown'
        return NextResponse.json(
          { success: false, error: `A record with this ${target} already exists` },
          { status: 409 }
        )
      }
      // P2003 = Foreign key constraint failure
      if (error.code === "P2003") {
        return NextResponse.json(
          { success: false, error: "Referenced record not found. Please check the school assignment." },
          { status: 400 }
        )
      }
      // P2012 = Missing required value
      if (error.code === "P2012") {
        const missing = (error.meta?.path as string[])?.join('.') || 'unknown field'
        return NextResponse.json(
          { success: false, error: `Missing required value: ${missing}` },
          { status: 400 }
        )
      }
      console.error("[ADMIN USERS] Prisma error code:", error.code, "meta:", error.meta)
      return NextResponse.json(
        { success: false, error: `Database error (${error.code}). Please try again or contact support.` },
        { status: 500 }
      )
    }

    // Log the full error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error("[ADMIN USERS] Full error:", errorMessage)

    return NextResponse.json(
      { success: false, error: `Failed to create user: ${errorMessage}` },
      { status: 500 }
    )
  }
}
