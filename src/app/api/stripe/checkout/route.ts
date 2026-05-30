import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING_PLANS, getPriceId, type PricingPlanKey } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { planType, billingPeriod = 'monthly', userId, email } = body

    // Validate plan type
    const planKey = planType as PricingPlanKey
    const plan = PRICING_PLANS[planKey]
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    // For enterprise, redirect to contact sales
    if (planType === 'SCHOOL_ENTERPRISE') {
      return NextResponse.json({ redirect: '/contact-sales' })
    }

    // Get the correct price ID
    const priceId = getPriceId(planKey, billingPeriod)
    if (!priceId) {
      return NextResponse.json({ error: 'Price not available for this plan/period combination' }, { status: 400 })
    }

    // Determine checkout mode
    const isOneTime = planType === 'CONFERENCE_PAY_PER_EVENT'
    const mode: 'subscription' | 'payment' = isOneTime ? 'payment' : 'subscription'

    // Build trial period for student and teacher plans
    const trialPeriodDays = (planType === 'STUDENT_PRO' || planType === 'TEACHER_PRO') ? 14 : undefined

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
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
        userId: userId || '',
        planType,
        billingPeriod,
      },
      ...(trialPeriodDays && { subscription_data: { trial_period_days: trialPeriodDays } }),
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
