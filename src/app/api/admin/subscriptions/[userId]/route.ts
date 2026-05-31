import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// ============================================================
// GET /api/admin/subscriptions/[userId]
// Returns the user's subscription details
// Requires MASTER_ADMIN, FOUNDER, or SUPER_ADMIN
// ============================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const adminRole = session.user.role as string
    if (
      adminRole !== "MASTER_ADMIN" &&
      adminRole !== "FOUNDER" &&
      adminRole !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "MASTER_ADMIN, FOUNDER, or SUPER_ADMIN access required",
        },
        { status: 403 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Fetch subscription (may not exist yet)
    const subscription = await db.subscription.findUnique({
      where: { userId },
    })

    // Log the read action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "READ",
        resource: "Subscription",
        resourceId: subscription?.id ?? userId,
        details: `Admin viewed subscription for user ${user.email}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    console.error("[ADMIN SUBSCRIPTIONS] Error fetching subscription:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}

// ============================================================
// PATCH /api/admin/subscriptions/[userId]
// Manage user subscription via actions
// Requires MASTER_ADMIN, FOUNDER, or SUPER_ADMIN
// ============================================================

const VALID_TIERS = [
  "FREE",
  "DELEGATE_PRO",
  "DIRECTOR_PRO",
  "SCHOOL_STARTER",
  "SCHOOL_PROFESSIONAL",
  "SCHOOL_ENTERPRISE",
  "CONFERENCE_PACKAGE",
] as const

const VALID_ACTIONS = [
  "upgrade",
  "downgrade",
  "extend_trial",
  "activate",
  "suspend",
  "cancel",
  "restore",
] as const

type SubscriptionAction = (typeof VALID_ACTIONS)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const adminRole = session.user.role as string
    if (
      adminRole !== "MASTER_ADMIN" &&
      adminRole !== "FOUNDER" &&
      adminRole !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "MASTER_ADMIN, FOUNDER, or SUPER_ADMIN access required",
        },
        { status: 403 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { action, tier, days } = body as {
      action: string
      tier?: string
      days?: number
    }

    if (!action || !VALID_ACTIONS.includes(action as SubscriptionAction)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Fetch existing subscription for audit diff
    const existing = await db.subscription.findUnique({
      where: { userId },
    })

    // Build update data based on action
    let updateData: Record<string, unknown> = {}
    let auditDetails = ""

    switch (action as SubscriptionAction) {
      case "upgrade": {
        if (!tier || !VALID_TIERS.includes(tier as (typeof VALID_TIERS)[number])) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid or missing tier. Must be one of: ${VALID_TIERS.join(", ")}`,
            },
            { status: 400 }
          )
        }
        updateData = {
          tier,
          status: "ACTIVE",
        }
        auditDetails = `Upgraded subscription from ${existing?.tier ?? "none"} to ${tier}, status set to ACTIVE`
        break
      }

      case "downgrade": {
        if (!tier || !VALID_TIERS.includes(tier as (typeof VALID_TIERS)[number])) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid or missing tier. Must be one of: ${VALID_TIERS.join(", ")}`,
            },
            { status: 400 }
          )
        }
        updateData = {
          tier,
          status: tier === "FREE" ? "TRIAL" : (existing?.status ?? "TRIAL"),
        }
        auditDetails = `Downgraded subscription from ${existing?.tier ?? "none"} to ${tier}${tier === "FREE" ? ", status set to TRIAL" : ""}`
        break
      }

      case "extend_trial": {
        if (!days || typeof days !== "number" || days <= 0) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid or missing 'days'. Must be a positive number.",
            },
            { status: 400 }
          )
        }
        const currentTrialEnd = existing?.trialEndsAt ?? new Date()
        // If trial already expired, extend from now; otherwise extend from current end
        const baseDate =
          currentTrialEnd > new Date() ? currentTrialEnd : new Date()
        const newTrialEnd = new Date(
          baseDate.getTime() + days * 24 * 60 * 60 * 1000
        )
        updateData = {
          trialEndsAt: newTrialEnd,
          // Ensure trialStartsAt is set if not already
          trialStartsAt: existing?.trialStartsAt ?? new Date(),
          status: "TRIAL",
        }
        auditDetails = `Extended trial period by ${days} day(s) (new end: ${newTrialEnd.toISOString()}), status set to TRIAL`
        break
      }

      case "activate": {
        updateData = {
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          cancelAtPeriodEnd: false,
        }
        auditDetails = `Activated subscription${existing?.status === "CANCELLED" ? " (restored from CANCELLED)" : ""}, currentPeriodStart set to now`
        break
      }

      case "suspend": {
        updateData = {
          status: "PAST_DUE",
        }
        auditDetails = `Suspended subscription (status set to PAST_DUE), was ${existing?.status ?? "none"}`
        break
      }

      case "cancel": {
        updateData = {
          status: "CANCELLED",
          cancelAtPeriodEnd: true,
        }
        auditDetails = `Cancelled subscription (status: CANCELLED, cancelAtPeriodEnd: true), was ${existing?.status ?? "none"}`
        break
      }

      case "restore": {
        if (existing?.status !== "CANCELLED") {
          return NextResponse.json(
            {
              success: false,
              error:
                "Cannot restore a subscription that is not in CANCELLED status",
            },
            { status: 400 }
          )
        }
        updateData = {
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
          currentPeriodStart: new Date(),
        }
        auditDetails = `Restored subscription from CANCELLED to ACTIVE, cancelAtPeriodEnd reset to false`
        break
      }
    }

    // Upsert the subscription
    const subscription = await db.subscription.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        tier: (updateData.tier as string) ?? "FREE",
        status: (updateData.status as string) ?? "TRIAL",
        trialStartsAt:
          (updateData.trialStartsAt as Date) ?? new Date(),
        trialEndsAt:
          (updateData.trialEndsAt as Date) ??
          new Date(Date.now() + 24 * 60 * 60 * 1000),
        currentPeriodStart:
          (updateData.currentPeriodStart as Date) ?? undefined,
        cancelAtPeriodEnd:
          (updateData.cancelAtPeriodEnd as boolean) ?? false,
      },
    })

    // Create audit log entry
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "Subscription",
        resourceId: subscription.id,
        details: `Admin ${auditDetails} for user ${user.email}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    console.error(
      "[ADMIN SUBSCRIPTIONS] Error managing subscription:",
      error
    )
    return NextResponse.json(
      { success: false, error: "Failed to manage subscription" },
      { status: 500 }
    )
  }
}
