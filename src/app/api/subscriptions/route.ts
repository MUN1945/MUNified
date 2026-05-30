import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { isStripeConfigured } from "@/lib/stripe"

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
      return NextResponse.json({ success: true, data: updated, stripeConfigured: isStripeConfigured() })
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
      stripeConfigured: isStripeConfigured(),
    })
  } catch (error) {
    console.error("Get subscription error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions - Create checkout session or handle subscription actions
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

      const validTiers = ["FREE", "STUDENT_PRO", "TEACHER_PRO", "SCHOOL_STARTER", "SCHOOL_PROFESSIONAL", "SCHOOL_ENTERPRISE", "CONFERENCE_PACKAGE"]
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

      // Check if Stripe is configured
      if (!isStripeConfigured()) {
        // For Student/Teacher plans without Stripe, show payment setup message
        if (tier === "STUDENT_PRO" || tier === "TEACHER_PRO") {
          return NextResponse.json({
            success: false,
            error: "Payment processing is currently being configured. Please try again later or contact support.",
            code: "STRIPE_NOT_CONFIGURED",
          }, { status: 503 })
        }

        // For School plans without Stripe, offer "Contact Sales" flow
        return NextResponse.json({
          success: true,
          data: { redirect: "/contact-sales" },
          message: "Payment processing is being configured. Please contact our sales team to set up your subscription.",
          code: "STRIPE_NOT_CONFIGURED",
        })
      }

      // Stripe is configured — redirect to the real Stripe checkout endpoint
      return NextResponse.json({
        success: true,
        data: {
          checkoutEndpoint: "/api/stripe/checkout",
          tier,
          userId: session.user.id,
          email: session.user.email,
        },
        message: "Use /api/stripe/checkout to create a Stripe checkout session",
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

      // If there's a Stripe subscription, cancel via Stripe
      if (subscription.stripeSubscriptionId && isStripeConfigured()) {
        try {
          const { stripe } = await import("@/lib/stripe")
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
          })
        } catch (stripeError) {
          console.error("Stripe cancellation error:", stripeError)
          // Still mark locally even if Stripe fails
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

      // If there's a Stripe subscription, reactivate via Stripe
      if (subscription.stripeSubscriptionId && isStripeConfigured()) {
        try {
          const { stripe } = await import("@/lib/stripe")
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
          })
        } catch (stripeError) {
          console.error("Stripe reactivation error:", stripeError)
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
