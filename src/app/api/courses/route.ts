import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { canCreateCourses } from "@/lib/auth-helpers"
import { db } from "@/lib/db"

// GET /api/courses - List courses with enrollment status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const targetRole = searchParams.get("targetRole")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { isPublished: true }

    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (targetRole) where.targetRole = targetRole

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        include: {
          _count: { select: { enrollments: true, lessons: true } },
          lessons: {
            select: { id: true, title: true, order: true, type: true, duration: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
        skip,
        take: limit,
      }),
      db.course.count({ where }),
    ])

    // If user is authenticated, get their enrollment status
    let enrollments: Record<string, { progress: number; completed: boolean }> = {}
    if (session?.user?.id) {
      const userEnrollments = await db.courseEnrollment.findMany({
        where: { userId: session.user.id },
        select: { courseId: true, progress: true, completed: true },
      })
      enrollments = userEnrollments.reduce(
        (acc, e) => {
          acc[e.courseId] = { progress: e.progress, completed: e.completed }
          return acc
        },
        {} as Record<string, { progress: number; completed: boolean }>
      )
    }

    const coursesWithEnrollment = courses.map((course) => ({
      ...course,
      enrollment: enrollments[course.id] || null,
    }))

    return NextResponse.json({
      success: true,
      data: coursesWithEnrollment,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get courses error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create course (requires ADMIN role)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    if (!canCreateCourses(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Admin role required." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      thumbnail,
      duration,
      difficulty,
      xpReward,
      targetRole,
      order,
      isPublished,
    } = body

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: "Title and category are required" },
        { status: 400 }
      )
    }

    const course = await db.course.create({
      data: {
        title,
        description: description || null,
        category,
        thumbnail: thumbnail || null,
        duration: duration || null,
        difficulty: difficulty || "BEGINNER",
        xpReward: xpReward || 50,
        targetRole: targetRole || null,
        order: order || 0,
        isPublished: isPublished !== undefined ? isPublished : true,
      },
    })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "Course",
        resourceId: course.id,
        details: `Created course: ${title}`,
      },
    })

    return NextResponse.json(
      { success: true, data: course, message: "Course created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    )
  }
}
