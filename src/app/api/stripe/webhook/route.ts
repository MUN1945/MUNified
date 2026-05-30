import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

// Disable body parsing — Stripe needs the raw body to verify the signature
export const runtime = 'nodejs'

async function getRawBody(req: NextRequest): Promise<Buffer> {
  const arrayBuffer = await req.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Log an event to the AuditLog table
 */
async function logAuditEvent(event: Stripe.Event, details?: string) {
  try {
    await db.auditLog.create({
      data: {
        userId: (event.data.object as { metadata?: { userId?: string } })?.metadata?.userId || null,
        action: 'CREATE' as const,
        resource: 'stripe_webhook',
        resourceId: event.id,
        details: JSON.stringify({
          type: event.type,
          eventId: event.id,
          timestamp: new Date(event.created * 1000).toISOString(),
          ...(details ? { info: details } : {}),
        }),
      },
    })
  } catch (logError) {
    console.error('Failed to log audit event:', logError)
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planType = session.metadata?.planType
  const billingPeriod = session.metadata?.billingPeriod

  if (!userId) {
    console.error('Webhook: checkout.session.completed — missing userId in metadata')
    return
  }

  // Create or update subscription in database
  const now = new Date()
  const periodEnd = new Date()
  if (billingPeriod === 'annual') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  await db.subscription.upsert({
    where: { userId },
    update: {
      tier: (planType || 'FREE') as never,
      status: 'ACTIVE',
      stripeCustomerId: session.customer as string || undefined,
      stripeSubscriptionId: session.subscription as string || undefined,
      stripePriceId: session.line_items?.data?.[0]?.price?.id || undefined,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      trialStartsAt: session.trial_start ? new Date(session.trial_start * 1000) : undefined,
      trialEndsAt: session.trial_end ? new Date(session.trial_end * 1000) : undefined,
    },
    create: {
      userId,
      tier: (planType || 'FREE') as never,
      status: 'ACTIVE',
      stripeCustomerId: session.customer as string || undefined,
      stripeSubscriptionId: session.subscription as string || undefined,
      stripePriceId: session.line_items?.data?.[0]?.price?.id || undefined,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialStartsAt: session.trial_start ? new Date(session.trial_start * 1000) : undefined,
      trialEndsAt: session.trial_end ? new Date(session.trial_end * 1000) : undefined,
    },
  })

  // Record payment
  await db.payment.create({
    data: {
      userId,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || 'usd',
      status: 'COMPLETED',
      stripePaymentId: session.payment_intent as string || undefined,
      description: `${planType} — ${billingPeriod || 'monthly'} subscription`,
      metadata: JSON.stringify({ planType, billingPeriod, sessionId: session.id }),
    },
  })

  console.log(`Webhook: checkout complete for user ${userId}, plan ${planType}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    trialing: 'TRIAL',
    canceled: 'CANCELLED',
    unpaid: 'EXPIRED',
    paused: 'PAST_DUE',
    incomplete: 'PAST_DUE',
    incomplete_expired: 'EXPIRED',
  }

  const dbStatus = statusMap[subscription.status] || 'PAST_DUE'

  await db.subscription.updateMany({
    where: { stripeSubscriptionId },
    data: {
      status: dbStatus as never,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
      currentPeriodStart: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripePriceId: subscription.items.data[0]?.price.id || undefined,
    },
  })

  console.log(`Webhook: subscription updated ${stripeSubscriptionId} → ${dbStatus}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id

  await db.subscription.updateMany({
    where: { stripeSubscriptionId },
    data: {
      status: 'CANCELLED',
      cancelAtPeriodEnd: false,
    },
  })

  console.log(`Webhook: subscription deleted ${stripeSubscriptionId}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  if (!customerId) return

  // Find subscription by Stripe customer ID
  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!sub) return

  // Update period end
  if (invoice.period_end) {
    await db.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'ACTIVE',
        currentPeriodEnd: new Date(invoice.period_end * 1000),
      },
    })
  }

  // Record payment
  await db.payment.create({
    data: {
      userId: sub.userId,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency || 'usd',
      status: 'COMPLETED',
      stripePaymentId: invoice.payment_intent as string || undefined,
      stripeInvoiceId: invoice.id,
      description: invoice.lines.data[0]?.description || 'Subscription payment',
      metadata: JSON.stringify({ invoiceId: invoice.id }),
    },
  })

  console.log(`Webhook: invoice payment succeeded for customer ${customerId}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  if (!customerId) return

  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!sub) return

  await db.subscription.update({
    where: { id: sub.id },
    data: { status: 'PAST_DUE' },
  })

  // Record failed payment
  await db.payment.create({
    data: {
      userId: sub.userId,
      amount: invoice.amount_due / 100,
      currency: invoice.currency || 'usd',
      status: 'FAILED',
      stripeInvoiceId: invoice.id,
      description: 'Failed payment attempt',
      metadata: JSON.stringify({ invoiceId: invoice.id, attemptCount: invoice.attempt_count }),
    },
  })

  console.log(`Webhook: invoice payment failed for customer ${customerId}`)
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log(`Webhook: customer created ${customer.id} (${customer.email})`)
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log(`Webhook: customer updated ${customer.id}`)
}

async function handleCustomerDeleted(customer: Stripe.Customer) {
  // Remove Stripe customer ID from any subscriptions
  await db.subscription.updateMany({
    where: { stripeCustomerId: customer.id },
    data: { stripeCustomerId: null },
  })
  console.log(`Webhook: customer deleted ${customer.id}`)
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Webhook: payment intent succeeded ${paymentIntent.id}`)
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Webhook: payment intent failed ${paymentIntent.id}`)
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const customerId = charge.customer as string
  if (!customerId) return

  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (sub) {
    await db.payment.create({
      data: {
        userId: sub.userId,
        amount: -(charge.amount_refunded / 100),
        currency: charge.currency || 'usd',
        status: 'REFUNDED',
        stripePaymentId: charge.payment_intent as string || undefined,
        description: 'Refund processed',
        metadata: JSON.stringify({ chargeId: charge.id, refundAmount: charge.amount_refunded }),
      },
    })
  }

  console.log(`Webhook: charge refunded ${charge.id}`)
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id
  console.log(`Webhook: trial will end for subscription ${stripeSubscriptionId}`)
  // Could send notification email here in the future
}

export async function POST(req: NextRequest) {
  const body = await getRawBody(req)
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  try {
    if (webhookSecret && webhookSecret !== 'whsec_placeholder') {
      // Production: verify signature with real webhook secret
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // Development: log warning but still parse the event without verification
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured — skipping signature verification. This is insecure for production!')
      try {
        event = JSON.parse(body.toString()) as Stripe.Event
      } catch {
        // If we can't parse the body as JSON and have no secret, try constructEvent anyway
        event = stripe.webhooks.constructEvent(body, signature, 'whsec_placeholder')
      }
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Log all events for audit
  console.log(`Webhook received: ${event.type} [${event.id}]`)
  await logAuditEvent(event)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        await handleTrialWillEnd(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_action_required': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Webhook: invoice payment action required ${invoice.id}`)
        break
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        await handleCustomerCreated(customer)
        break
      }

      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer
        await handleCustomerUpdated(customer)
        break
      }

      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer
        await handleCustomerDeleted(customer)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleChargeRefunded(charge)
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        console.warn(`Webhook: charge dispute created ${dispute.id} for charge ${dispute.charge}`)
        break
      }

      case 'charge.dispute.updated': {
        const dispute = event.data.object as Stripe.Dispute
        console.log(`Webhook: charge dispute updated ${dispute.id}`)
        break
      }

      case 'charge.dispute.closed': {
        const dispute = event.data.object as Stripe.Dispute
        console.log(`Webhook: charge dispute closed ${dispute.id}, status: ${dispute.status}`)
        break
      }

      case 'product.created':
      case 'product.updated':
      case 'price.created':
      case 'price.updated': {
        console.log(`Webhook: ${event.type} — ${event.data.object.id}`)
        break
      }

      default:
        console.log(`Webhook: unhandled event type ${event.type}`)
    }
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error)
    await logAuditEvent(event, `HANDLER_ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
