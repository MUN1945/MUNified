import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserSubscriptionAccess } from "@/lib/subscription"

/**
 * GET /api/subscriptions/access
 *
 * Returns the full subscription access profile for the current user.
 * Used by the frontend to determine which features are available.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const access = await getUserSubscriptionAccess(session.user.id)

    return NextResponse.json({
      success: true,
      data: access,
    })
  } catch (error) {
    console.error("[SUBSCRIPTION ACCESS] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check subscription access" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/subscriptions/access
 *
 * Check if the current user can access a specific feature.
 * Body: { feature: string }
 *
 * Returns: { allowed: boolean, reason?: string }
 */
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
    const { feature } = body

    if (!feature) {
      return NextResponse.json(
        { success: false, error: "Feature name is required" },
        { status: 400 }
      )
    }

    const access = await getUserSubscriptionAccess(session.user.id)
    const allowed = Boolean(access.features[feature as keyof typeof access.features])

    return NextResponse.json({
      success: true,
      data: {
        allowed,
        effectiveTier: access.effectiveTier,
        status: access.status,
        isOnTrial: access.isOnTrial,
        isTrialExpired: access.isTrialExpired,
        reason: allowed ? undefined : `This feature requires a paid subscription. Your current plan: ${access.effectiveTier.replace(/_/g, ' ')}`,
      },
    })
  } catch (error) {
    console.error("[SUBSCRIPTION ACCESS CHECK] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check feature access" },
      { status: 500 }
    )
  }
}
