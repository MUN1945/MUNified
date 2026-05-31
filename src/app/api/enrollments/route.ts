import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/enrollments - Get user enrollments
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const enrollments = await db.courseEnrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            lessons: {
              select: { id: true, title: true, order: true, type: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    })

    return NextResponse.json({ success: true, data: enrollments })
  } catch (error) {
    console.error("Get enrollments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}

// POST /api/enrollments - Enroll in course
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
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      )
    }

    // Check if course exists and is published
    const course = await db.course.findUnique({
      where: { id: courseId },
    })

    if (!course || !course.isPublished) {
      return NextResponse.json(
        { success: false, error: "Course not found or not available" },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: "You are already enrolled in this course" },
        { status: 409 }
      )
    }

    const enrollment = await db.courseEnrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        progress: 0,
        completed: false,
      },
      include: {
        course: { select: { id: true, title: true, xpReward: true } },
      },
    })

    // Award 10 XP for enrolling
    await db.delegateProfile.updateMany({
      where: { userId: session.user.id },
      data: { xp: { increment: 10 } },
    })

    return NextResponse.json(
      { success: true, data: enrollment, message: "Successfully enrolled in course" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to enroll in course" },
      { status: 500 }
    )
  }
}

// PATCH /api/enrollments - Update progress
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { enrollmentId, progress } = body

    if (!enrollmentId || progress === undefined) {
      return NextResponse.json(
        { success: false, error: "Enrollment ID and progress are required" },
        { status: 400 }
      )
    }

    // Verify enrollment belongs to user
    const enrollment = await db.courseEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    })

    if (!enrollment || enrollment.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      )
    }

    const clampedProgress = Math.min(100, Math.max(0, Number(progress)))
    const isCompleted = clampedProgress >= 100

    const updatedEnrollment = await db.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: clampedProgress,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    // If course completed, award XP
    if (isCompleted && !enrollment.completed) {
      await db.delegateProfile.updateMany({
        where: { userId: session.user.id },
        data: { xp: { increment: enrollment.course.xpReward } },
      })

      // Update streak
      const profile = await db.delegateProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (profile) {
        const today = new Date()
        const lastActivity = profile.lastActivityDate
        let newStreak = profile.streak

        if (lastActivity) {
          const diffDays = Math.floor(
            (today.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (diffDays === 1) {
            newStreak += 1
          } else if (diffDays > 1) {
            newStreak = 1
          }
        } else {
          newStreak = 1
        }

        await db.delegateProfile.update({
          where: { userId: session.user.id },
          data: {
            streak: newStreak,
            longestStreak: Math.max(newStreak, profile.longestStreak),
            lastActivityDate: today,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedEnrollment,
      message: isCompleted && !enrollment.completed
        ? `Course completed! You earned ${enrollment.course.xpReward} XP`
        : "Progress updated",
    })
  } catch (error) {
    console.error("Update enrollment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
