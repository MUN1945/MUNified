import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { isLemonSqueezyConfigured, getCheckoutUrl, PLANS, type PlanKey, planKeyToSubscriptionTier } from "@/lib/lemonsqueezy"
import { cancelSubscription, updateSubscription } from "@lemonsqueezy/lemonsqueezy.js"

// GET /api/subscriptions - Get current subscription
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "No subscription found" },
        { status: 404 }
      )
    }

    // Check if trial has expired
    const now = new Date()
    const isTrialExpired =
      subscription.status === "TRIAL" &&
      subscription.trialEndsAt &&
      new Date(subscription.trialEndsAt) < now

    if (isTrialExpired) {
      const updated = await db.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      })
      return NextResponse.json({ success: true, data: updated, billingConfigured: isLemonSqueezyConfigured() })
    }

    // Get available pricing plans
    const plans = await db.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: subscription,
      plans,
      billingConfigured: isLemonSqueezyConfigured(),
    })
  } catch (error) {
    console.error("Get subscription error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions - Create checkout or handle subscription actions
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
    const { action, tier } = body

    if (action === "checkout") {
      // Validate tier
      if (!tier) {
        return NextResponse.json(
          { success: false, error: "Subscription tier is required" },
          { status: 400 }
        )
      }

      const validTiers = ["FREE", "DELEGATE_PRO", "DIRECTOR_PRO", "SCHOOL_STARTER", "SCHOOL_PROFESSIONAL", "SCHOOL_ENTERPRISE", "CONFERENCE_PACKAGE"]
      if (!validTiers.includes(tier)) {
        return NextResponse.json(
          { success: false, error: "Invalid subscription tier" },
          { status: 400 }
        )
      }

      // Enterprise plan — always redirect to contact sales
      if (tier === "SCHOOL_ENTERPRISE") {
        return NextResponse.json({
          success: true,
          data: { redirect: "/contact-sales" },
          message: "Enterprise plans require custom pricing. Please contact our sales team.",
        })
      }

      // Check if Lemon Squeezy is configured
      if (!isLemonSqueezyConfigured()) {
        // For Delegate/Director plans without billing, show payment setup message
        if (tier === "DELEGATE_PRO" || tier === "DIRECTOR_PRO") {
          return NextResponse.json({
            success: false,
            error: "Payment processing is currently being configured. Please try again later or contact support.",
            code: "BILLING_NOT_CONFIGURED",
          }, { status: 503 })
        }

        // For School plans without billing, offer "Contact Sales" flow
        return NextResponse.json({
          success: true,
          data: { redirect: "/contact-sales" },
          message: "Payment processing is being configured. Please contact our sales team to set up your subscription.",
          code: "BILLING_NOT_CONFIGURED",
        })
      }

      // Lemon Squeezy is configured — redirect to the billing checkout endpoint
      return NextResponse.json({
        success: true,
        data: {
          checkoutEndpoint: "/api/billing/checkout",
          tier,
          userId: session.user.id,
          email: session.user.email,
        },
        message: "Use /api/billing/checkout to get a Lemon Squeezy checkout URL",
      })
    }

    if (action === "cancel") {
      // Cancel subscription at period end
      const subscription = await db.subscription.findUnique({
        where: { userId: session.user.id },
      })

      if (!subscription) {
        return NextResponse.json(
          { success: false, error: "No subscription found" },
          { status: 404 }
        )
      }

      // If there's a Lemon Squeezy subscription, cancel via API
      if (subscription.lemonsqueezySubscriptionId && isLemonSqueezyConfigured()) {
        try {
          await cancelSubscription(subscription.lemonsqueezySubscriptionId)
        } catch (lsError) {
          console.error("Lemon Squeezy cancellation error:", lsError)
          // Still mark locally even if LS API fails
        }
      }

      const updated = await db.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true },
      })

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Subscription will be cancelled at the end of the billing period",
      })
    }

    if (action === "reactivate") {
      // Reactivate a subscription that was set to cancel
      const subscription = await db.subscription.findUnique({
        where: { userId: session.user.id },
      })

      if (!subscription) {
        return NextResponse.json(
          { success: false, error: "No subscription found" },
          { status: 404 }
        )
      }

      if (!subscription.cancelAtPeriodEnd) {
        return NextResponse.json(
          { success: false, error: "Subscription is not scheduled for cancellation" },
          { status: 400 }
        )
      }

      // If there's a Lemon Squeezy subscription, reactivate via API
      if (subscription.lemonsqueezySubscriptionId && isLemonSqueezyConfigured()) {
        try {
          await updateSubscription(subscription.lemonsqueezySubscriptionId, {
            cancelled: false,
          })
        } catch (lsError) {
          console.error("Lemon Squeezy reactivation error:", lsError)
        }
      }

      const updated = await db.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: false },
      })

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Subscription has been reactivated",
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use: checkout, cancel, or reactivate" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Subscription action error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process subscription action" },
      { status: 500 }
    )
  }
}
