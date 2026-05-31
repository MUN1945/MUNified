import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getUserSubscriptionAccess, canAccessCourse } from "@/lib/subscription"

// POST /api/enrollments/complete-lesson - Mark a lesson as completed
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
    const { lessonId } = body

    if (!lessonId) {
      return NextResponse.json(
        { success: false, error: "Lesson ID is required" },
        { status: 400 }
      )
    }

    // Find the lesson and its course
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    })

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      )
    }

    if (!lesson.course.isPublished) {
      return NextResponse.json(
        { success: false, error: "Course is not available" },
        { status: 404 }
      )
    }

    const userId = session.user.id
    const courseId = lesson.courseId

    // Check if user is enrolled — if not, auto-enroll them
    let enrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      // Verify subscription access before auto-enrolling
      const access = await getUserSubscriptionAccess(userId)
      const courseOrder = lesson.course.order ?? 0
      const courseAccess = canAccessCourse(access, courseOrder)

      if (!courseAccess.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: courseAccess.reason || "This course requires a paid subscription",
            code: "SUBSCRIPTION_REQUIRED",
          },
          { status: 403 }
        )
      }

      // Auto-enroll the user (same logic as POST /api/enrollments)
      enrollment = await db.courseEnrollment.create({
        data: {
          userId,
          courseId,
          progress: 0,
          completed: false,
        },
      })

      // Award 10 XP for enrolling
      await db.delegateProfile.updateMany({
        where: { userId },
        data: { xp: { increment: 10 } },
      })
    }

    // Check if lesson was already completed before upsert
    const existingCompletion = await db.lessonCompletion.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    })

    // Use upsert on LessonCompletion to prevent duplicates
    await db.lessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        // No-op on update — the lesson is already completed
      },
      create: {
        userId,
        lessonId,
        enrollmentId: enrollment.id,
      },
    })

    // If the lesson was already completed, return early with current progress
    if (existingCompletion) {
      const [totalLessons, completedCount] = await Promise.all([
        db.lesson.count({
          where: { courseId, isPublished: true },
        }),
        db.lessonCompletion.count({
          where: {
            userId,
            lesson: { courseId },
          },
        }),
      ])

      const progress = totalLessons > 0
        ? Math.min(100, Math.max(0, Math.round((completedCount / totalLessons) * 100)))
        : 0

      return NextResponse.json({
        success: true,
        data: {
          alreadyCompleted: true,
          progress,
          completedLessons: completedCount,
          totalLessons,
        },
      })
    }

    // Newly completed — recalculate progress
    const [totalLessons, completedCount] = await Promise.all([
      db.lesson.count({
        where: { courseId, isPublished: true },
      }),
      db.lessonCompletion.count({
        where: {
          userId,
          lesson: { courseId },
        },
      }),
    ])

    const progress = totalLessons > 0
      ? Math.min(100, Math.max(0, Math.round((completedCount / totalLessons) * 100)))
      : 0

    const isCompleted = progress >= 100
    const wasAlreadyCompleted = enrollment.completed

    // Update enrollment with new progress
    const updatedEnrollment = await db.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      include: {
        course: { select: { xpReward: true } },
      },
    })

    // If course just completed (wasn't completed before, now is), award XP and update streak
    let xpAwarded = 0

    if (isCompleted && !wasAlreadyCompleted) {
      xpAwarded = updatedEnrollment.course.xpReward

      // Award XP to DelegateProfile
      await db.delegateProfile.updateMany({
        where: { userId },
        data: { xp: { increment: xpAwarded } },
      })

      // Update streak
      const profile = await db.delegateProfile.findUnique({
        where: { userId },
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
          where: { userId },
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
      data: {
        progress,
        completedLessons: completedCount,
        totalLessons,
        courseCompleted: isCompleted && !wasAlreadyCompleted,
        xpAwarded,
      },
    })
  } catch (error) {
    console.error("Complete lesson error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to complete lesson" },
      { status: 500 }
    )
  }
}
