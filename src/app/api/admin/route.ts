import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { canAccessAdmin } from "@/lib/auth-helpers"
import { db } from "@/lib/db"

// GET /api/admin - Admin dashboard stats and audit logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    if (!canAccessAdmin(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    // Get audit logs
    if (action === "audit-logs") {
      const page = parseInt(searchParams.get("page") || "1")
      const limit = parseInt(searchParams.get("limit") || "50")
      const skip = (page - 1) * limit
      const userId = searchParams.get("userId")
      const resource = searchParams.get("resource")
      const actionFilter = searchParams.get("actionFilter")

      const where: Record<string, unknown> = {}
      if (userId) where.userId = userId
      if (resource) where.resource = resource
      if (actionFilter) where.action = actionFilter

      const [logs, total] = await Promise.all([
        db.auditLog.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        db.auditLog.count({ where }),
      ])

      return NextResponse.json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    }

    // Default: admin dashboard stats
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalSchools,
      totalConferences,
      activeSubscriptions,
      totalRevenue,
      recentSignups,
      subscriptionBreakdown,
      activityStats,
    ] = await Promise.all([
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { role: "STUDENT", isActive: true } }),
      db.user.count({ where: { role: { in: ["TEACHER", "SCHOOL_ADMIN"] }, isActive: true } }),
      db.school.count({ where: { isActive: true } }),
      db.conference.count(),
      db.subscription.count({ where: { status: "ACTIVE" } }),
      db.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      db.user.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          school: { select: { name: true } },
        },
      }),
      db.subscription.groupBy({
        by: ["tier"],
        _count: true,
      }),
      db.activity.groupBy({
        by: ["type"],
        _count: true,
        orderBy: { _count: { type: "desc" } },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStudents,
          totalTeachers,
          totalSchools,
          totalConferences,
          activeSubscriptions,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        recentSignups,
        subscriptionBreakdown: subscriptionBreakdown.map((s) => ({
          tier: s.tier,
          count: s._count,
        })),
        activityStats: activityStats.map((a) => ({
          type: a.type,
          count: a._count,
        })),
      },
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin data" },
      { status: 500 }
    )
  }
}
