import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, PRICING_PLANS, getPriceId, isStripeConfigured, type PricingPlanKey } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to continue.' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await req.json()
    const { planType, billingPeriod = 'monthly', userId, email } = body

    // 3. Validate plan type
    const validPlanKeys = Object.keys(PRICING_PLANS) as PricingPlanKey[]
    const planKey = planType as PricingPlanKey
    if (!validPlanKeys.includes(planKey)) {
      return NextResponse.json(
        { error: `Invalid plan type. Valid plans: ${validPlanKeys.join(', ')}` },
        { status: 400 }
      )
    }

    const plan = PRICING_PLANS[planKey]

    // 4. Validate billing period
    if (!['monthly', 'annual'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Billing period must be "monthly" or "annual"' },
        { status: 400 }
      )
    }

    // 5. For enterprise, redirect to contact sales
    if (planType === 'SCHOOL_ENTERPRISE') {
      return NextResponse.json({
        redirect: '/contact-sales',
        message: 'Enterprise plans require custom pricing. Please contact our sales team.',
      })
    }

    // 6. Check if Stripe is properly configured
    if (!isStripeConfigured()) {
      // For Student/Teacher plans, inform user that payment processing is being set up
      if (planKey === 'STUDENT_PRO' || planKey === 'TEACHER_PRO') {
        return NextResponse.json(
          {
            error: 'Payment processing is currently being configured. Please try again later or contact support.',
            code: 'STRIPE_NOT_CONFIGURED',
          },
          { status: 503 }
        )
      }

      // For school plans, offer a "Contact Sales" flow
      return NextResponse.json(
        {
          error: 'Payment processing is currently being configured. Please contact our sales team to set up your subscription.',
          code: 'STRIPE_NOT_CONFIGURED',
          redirect: '/contact-sales',
        },
        { status: 503 }
      )
    }

    // 7. Get the correct price ID
    const priceId = getPriceId(planKey, billingPeriod)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not available for this plan/period combination' },
        { status: 400 }
      )
    }

    // 8. Determine checkout mode
    const isOneTime = planType === 'CONFERENCE_PAY_PER_EVENT'
    const mode: 'subscription' | 'payment' = isOneTime ? 'payment' : 'subscription'

    // 9. Build trial period for student and teacher plans
    const trialPeriodDays = (planType === 'STUDENT_PRO' || planType === 'TEACHER_PRO') ? 14 : undefined

    // 10. Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: email || session.user.email,
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL || process.env.APP_URL || 'http://localhost:3000'}/dashboard?checkout=success&plan=${planType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || process.env.APP_URL || 'http://localhost:3000'}/pricing?checkout=cancelled`,
      metadata: {
        userId: userId || session.user.id,
        planType,
        billingPeriod,
      },
      ...(trialPeriodDays && { subscription_data: { trial_period_days: trialPeriodDays } }),
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)

    // Handle Stripe-specific errors
    if (error instanceof Error) {
      if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Payment plan configuration error. Please contact support.', code: 'INVALID_PRICE_ID' },
          { status: 500 }
        )
      }
      if (error.message.includes('Invalid API Key')) {
        return NextResponse.json(
          { error: 'Payment processing is currently being configured. Please try again later.', code: 'STRIPE_NOT_CONFIGURED' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
