import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCustomerPortalUrl, isLemonSqueezyConfigured } from '@/lib/lemonsqueezy'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // If Lemon Squeezy is not configured, return error
    if (!isLemonSqueezyConfigured()) {
      return NextResponse.json(
        { error: 'Billing portal is not yet configured. Please contact support.' },
        { status: 503 }
      )
    }

    // Find the user's subscription to get the Lemon Squeezy customer ID
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription?.lemonsqueezyCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe to a plan first.' },
        { status: 404 }
      )
    }

    // Lemon Squeezy customer portal URL
    const portalUrl = getCustomerPortalUrl()

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('Lemon Squeezy portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
