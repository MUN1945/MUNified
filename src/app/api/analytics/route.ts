import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/analytics - Dashboard analytics (role-based)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d"

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Teacher/Admin analytics: school-wide stats
    if (["TEACHER", "ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      const schoolFilter = session.user.schoolId
        ? { schoolId: session.user.schoolId }
        : {}

      const [
        totalStudents,
        totalTeachers,
        activeSubscriptions,
        totalConferences,
        totalCourses,
        totalEnrollments,
        recentActivities,
        topPerformers,
        enrollmentTrend,
      ] = await Promise.all([
        // Total students
        db.user.count({
          where: { role: "STUDENT", ...schoolFilter, isActive: true },
        }),
        // Total teachers
        db.user.count({
          where: { role: { in: ["TEACHER", "SCHOOL_ADMIN"] }, ...schoolFilter, isActive: true },
        }),
        // Active subscriptions
        db.subscription.count({
          where: {
            status: { in: ["ACTIVE", "TRIAL"] },
            user: { ...schoolFilter },
          },
        }),
        // Total conferences
        db.conference.count({
          where: {
            ...schoolFilter,
            status: { in: ["REGISTRATION_OPEN", "IN_PROGRESS", "COMPLETED"] },
          },
        }),
        // Total courses
        db.course.count({ where: { isPublished: true } }),
        // Total enrollments
        db.courseEnrollment.count({
          where: {
            user: { ...schoolFilter },
            enrolledAt: { gte: startDate },
          },
        }),
        // Recent activities
        db.activity.findMany({
          where: {
            createdAt: { gte: startDate },
            user: { ...schoolFilter },
          },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        // Top performers
        db.delegateProfile.findMany({
          where: {
            user: { ...schoolFilter, isActive: true },
          },
          include: {
            user: {
              select: { id: true, name: true, avatar: true, munRole: true },
            },
          },
          orderBy: { xp: "desc" },
          take: 10,
        }),
        // Enrollment trend (last 7 days)
        db.courseEnrollment.groupBy({
          by: ["enrolledAt"],
          where: {
            user: { ...schoolFilter },
            enrolledAt: { gte: startDate },
          },
          _count: true,
        }),
      ])

      return NextResponse.json({
        success: true,
        data: {
          role: session.user.role,
          overview: {
            totalStudents,
            totalTeachers,
            activeSubscriptions,
            totalConferences,
            totalCourses,
            totalEnrollments,
          },
          recentActivities,
          topPerformers,
          enrollmentTrend: enrollmentTrend.length,
        },
      })
    }

    // Student analytics: personal stats
    const [
      enrollments,
      assessments,
      badges,
      profile,
      activities,
    ] = await Promise.all([
      db.courseEnrollment.findMany({
        where: { userId: session.user.id },
        include: {
          course: { select: { id: true, title: true, xpReward: true, category: true } },
        },
      }),
      db.assessment.findMany({
        where: { userId: session.user.id },
        orderBy: { completedAt: "desc" },
        take: 5,
      }),
      db.userBadge.findMany({
        where: { userId: session.user.id },
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      }),
      db.delegateProfile.findUnique({
        where: { userId: session.user.id },
      }),
      db.activity.findMany({
        where: { userId: session.user.id, createdAt: { gte: startDate } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ])

    const completedCourses = enrollments.filter((e) => e.completed)
    const inProgressCourses = enrollments.filter((e) => !e.completed)
    const totalXPEarned = activities.reduce((sum, a) => sum + a.xpEarned, 0)

    return NextResponse.json({
      success: true,
      data: {
        role: session.user.role,
        overview: {
          totalCourses: enrollments.length,
          completedCourses: completedCourses.length,
          inProgressCourses: inProgressCourses.length,
          totalBadges: badges.length,
          totalXP: profile?.xp || 0,
          level: profile?.level || "OBSERVER",
          streak: profile?.streak || 0,
          xpEarnedThisPeriod: totalXPEarned,
        },
        recentAssessments: assessments,
        recentBadges: badges.slice(0, 5),
        recentActivities: activities,
        courseProgress: enrollments.map((e) => ({
          courseId: e.course.id,
          title: e.course.title,
          progress: e.progress,
          completed: e.completed,
          xpReward: e.course.xpReward,
        })),
      },
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
