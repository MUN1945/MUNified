import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, returnUrl } = body

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_URL || process.env.APP_URL || 'http://localhost:3000'}/settings?tab=subscription`,
      configuration: await getPortalConfiguration(),
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}

/**
 * Create or retrieve a portal configuration with allowed features
 */
async function getPortalConfiguration(): Promise<string> {
  // Try to find an existing configuration first
  const configurations = await stripe.billingPortal.configurations.list({
    limit: 1,
    active: true,
  })

  if (configurations.data.length > 0) {
    return configurations.data[0].id
  }

  // Create a new configuration
  const config = await stripe.billingPortal.configurations.create({
    features: {
      payment_method_update: {
        enabled: true,
      },
      customer_update: {
        enabled: true,
        allowed_updates: ['email', 'address'],
      },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features',
            'switched_service',
            'unused',
            'other',
          ],
        },
      },
      subscription_pause: {
        enabled: false,
      },
      invoice_history: {
        enabled: true,
      },
    },
  })

  return config.id
}
