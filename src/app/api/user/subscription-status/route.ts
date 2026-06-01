import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserSubscriptionSummary } from "@/lib/subscription"

// GET /api/user/subscription-status - Get current user's subscription summary
// Used by middleware and client-side for access control
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const summary = await getUserSubscriptionSummary(session.user.id)

    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error("Get subscription status error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription status" },
      { status: 500 }
    )
  }
}
