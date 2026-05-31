import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { XP_LEVELS, getLevelForXP } from "@/lib/xp-levels"

// GET /api/gamification - Get user profile with XP, level, badges
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
    const action = searchParams.get("action")

    // Leaderboard
    if (action === "leaderboard") {
      const limit = parseInt(searchParams.get("limit") || "20")
      const schoolId = searchParams.get("schoolId")

      const where: Record<string, unknown> = {}
      if (schoolId) {
        const schoolUsers = await db.user.findMany({
          where: { schoolId },
          select: { id: true },
        })
        where.userId = { in: schoolUsers.map((u) => u.id) }
      }

      const leaderboard = await db.delegateProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
              munRole: true,
              school: { select: { name: true } },
            },
          },
        },
        orderBy: { xp: "desc" },
        take: limit,
      })

      return NextResponse.json({ success: true, data: leaderboard })
    }

    // Default: get user's own gamification profile
    const profile = await db.delegateProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            role: true,
            munRole: true,
            badges: {
              include: {
                badge: true,
              },
              orderBy: { earnedAt: "desc" },
            },
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Delegate profile not found" },
        { status: 404 }
      )
    }

    // Calculate current level based on XP
    const calculatedLevel = getLevelForXP(profile.xp)

    // Update level if it has changed
    if (calculatedLevel !== profile.level) {
      await db.delegateProfile.update({
        where: { userId: session.user.id },
        data: { level: calculatedLevel as never },
      })
    }

    // Get next level threshold
    const levelEntries = Object.entries(XP_LEVELS).sort(([, a], [, b]) => a - b)
    const currentLevelIndex = levelEntries.findIndex(([l]) => l === calculatedLevel)
    const nextLevel = currentLevelIndex < levelEntries.length - 1
      ? levelEntries[currentLevelIndex + 1]
      : null

    const xpForNextLevel = nextLevel ? nextLevel[1] : profile.xp
    const xpProgress = nextLevel
      ? ((profile.xp - (XP_LEVELS[calculatedLevel] || 0)) /
          (nextLevel[1] - (XP_LEVELS[calculatedLevel] || 0))) *
        100
      : 100

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        level: calculatedLevel,
        levelProgress: {
          currentXP: profile.xp,
          nextLevelXP: xpForNextLevel,
          currentLevelXP: XP_LEVELS[calculatedLevel] || 0,
          progressPercentage: Math.min(100, Math.max(0, xpProgress)),
          nextLevelName: nextLevel ? nextLevel[0] : null,
        },
      },
    })
  } catch (error) {
    console.error("Get gamification profile error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch gamification data" },
      { status: 500 }
    )
  }
}

// POST /api/gamification - Award XP/badges
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
    const { userId, xpAmount, badgeId, action } = body

    // SECURITY: Only admin/teacher roles can award XP to others
    // Students can NEVER award XP — XP is server-earned only
    const isAdminOrTeacher = ["MASTER_ADMIN", "FOUNDER", "SUPER_ADMIN", "ADMIN", "SCHOOL_ADMIN", "TEACHER"].includes(session.user.role)

    if (!isAdminOrTeacher) {
      return NextResponse.json(
        { success: false, error: "Only administrators and teachers can award XP and badges" },
        { status: 403 }
      )
    }

    const targetUserId = userId || session.user.id

    const results: { xpAwarded?: number; badgeAwarded?: string } = {}

    // Award XP (only admin/teacher can do this)
    if (xpAmount && xpAmount > 0) {
      const maxXP = 100 // Reduced cap per request to prevent abuse
      const awardXP = Math.min(xpAmount, maxXP)

      await db.delegateProfile.updateMany({
        where: { userId: targetUserId },
        data: { xp: { increment: awardXP } },
      })

      // Log activity
      await db.activity.create({
        data: {
          type: action || "XP_EARNED",
          description: `Earned ${awardXP} XP`,
          userId: targetUserId,
          xpEarned: awardXP,
        },
      })

      results.xpAwarded = awardXP
    }

    // Award badge
    if (badgeId) {
      // Check if badge exists
      const badge = await db.badge.findUnique({
        where: { id: badgeId },
      })

      if (!badge) {
        return NextResponse.json(
          { success: false, error: "Badge not found" },
          { status: 404 }
        )
      }

      // Check if already earned
      const existingBadge = await db.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId: targetUserId,
            badgeId,
          },
        },
      })

      if (!existingBadge) {
        await db.userBadge.create({
          data: {
            userId: targetUserId,
            badgeId,
          },
        })

        // Award badge XP if applicable
        if (badge.xpReward > 0) {
          await db.delegateProfile.updateMany({
            where: { userId: targetUserId },
            data: { xp: { increment: badge.xpReward } },
          })
        }

        results.badgeAwarded = badge.name
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: "Rewards awarded successfully",
    })
  } catch (error) {
    console.error("Award gamification error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to award rewards" },
      { status: 500 }
    )
  }
}
