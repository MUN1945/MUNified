import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  PLANS,
  getCheckoutUrl,
  isLemonSqueezyConfigured,
  type PlanKey,
} from '@/lib/lemonsqueezy'

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
    const { planType, billingPeriod = 'monthly' } = body

    // 3. For enterprise, redirect to contact sales
    if (planType === 'SCHOOL_ENTERPRISE') {
      return NextResponse.json({
        redirect: '/contact-sales',
        message: 'Enterprise plans require custom pricing. Please contact our sales team.',
      })
    }

    // 4. Determine the exact plan key (combines plan type + billing period)
    let planKey: PlanKey

    if (planType === 'DELEGATE_PRO' || planType === 'STUDENT_PRO') {
      planKey = billingPeriod === 'annual' ? 'DELEGATE_PRO_YEARLY' : 'DELEGATE_PRO_MONTHLY'
    } else if (planType === 'DIRECTOR_PRO' || planType === 'TEACHER_PRO') {
      planKey = billingPeriod === 'annual' ? 'DIRECTOR_PRO_YEARLY' : 'DIRECTOR_PRO_MONTHLY'
    } else if (
      planType === 'SCHOOL_STARTER' ||
      planType === 'SCHOOL_PROFESSIONAL' ||
      planType === 'CONFERENCE_PAY_PER_EVENT' ||
      planType === 'CONFERENCE_ANNUAL'
    ) {
      planKey = planType as PlanKey
    } else {
      const validPlanKeys = Object.keys(PLANS) as PlanKey[]
      if (!validPlanKeys.includes(planType as PlanKey)) {
        return NextResponse.json(
          { error: `Invalid plan type. Valid plans: ${Object.keys(PLANS).join(', ')}` },
          { status: 400 }
        )
      }
      planKey = planType as PlanKey
    }

    // 5. Validate plan exists
    const plan = PLANS[planKey]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 400 }
      )
    }

    // 6. If Lemon Squeezy is not configured, return error
    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json(
        {
          error: 'Payment processing is currently being configured. Please try again later or contact support.',
          code: 'LEMONSQUEEZY_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    // 7. Build checkout URL with pre-fill data
    const checkoutUrl = getCheckoutUrl(planKey, {
      email: session.user.email,
      name: session.user.name,
      userId: session.user.id,
    })

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Unable to generate checkout link for this plan.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Lemon Squeezy checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
