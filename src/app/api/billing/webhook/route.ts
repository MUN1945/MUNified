import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyWebhookSignature, getPlanKeyByVariantId, planKeyToSubscriptionTier } from '@/lib/lemonsqueezy'
import { db } from '@/lib/db'

// Disable body parsing — we need the raw body for signature verification
export const runtime = 'nodejs'

async function getRawBody(req: NextRequest): Promise<string> {
  const arrayBuffer = await req.arrayBuffer()
  return Buffer.from(arrayBuffer).toString('utf-8')
}

// ============================================================
// WEBHOOK EVENT HANDLERS
// ============================================================

interface WebhookEventData {
  id: string | number
  type: string
  attributes: Record<string, unknown>
}

interface WebhookPayload {
  meta: {
    event_name: string
    custom_data?: Record<string, string>
  }
  data: WebhookEventData
}

/**
 * Log an event to the AuditLog table
 */
async function logAuditEvent(eventName: string, resourceId: string | number, details?: string) {
  try {
    await db.auditLog.create({
      data: {
        action: 'CREATE' as const,
        resource: 'lemonsqueezy_webhook',
        resourceId: String(resourceId),
        details: JSON.stringify({
          type: eventName,
          resourceId: String(resourceId),
          timestamp: new Date().toISOString(),
          ...(details ? { info: details } : {}),
        }),
      },
    })
  } catch (logError) {
    console.error('Failed to log audit event:', logError)
  }
}

/**
 * Handle subscription_created event
 */
async function handleSubscriptionCreated(data: WebhookEventData, customData?: Record<string, string>) {
  const userId = customData?.user_id
  const attrs = data.attributes

  const variantId = String(attrs.variant_id || '')
  const planKey = getPlanKeyByVariantId(variantId)
  const tier = planKey ? planKeyToSubscriptionTier(planKey) : 'FREE'

  if (!userId) {
    console.error('Webhook: subscription_created — missing user_id in custom_data')
    return
  }

  const now = new Date()
  const periodEnd = new Date()
  if (planKey && PLANS_LOOKUP[planKey]?.isAnnual) {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  await db.subscription.upsert({
    where: { userId },
    update: {
      tier: tier as never,
      status: 'ACTIVE',
      lemonsqueezyCustomerId: String(attrs.customer_id || ''),
      lemonsqueezySubscriptionId: String(data.id),
      lemonsqueezyVariantId: variantId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId,
      tier: tier as never,
      status: 'ACTIVE',
      lemonsqueezyCustomerId: String(attrs.customer_id || ''),
      lemonsqueezySubscriptionId: String(data.id),
      lemonsqueezyVariantId: variantId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  })

  console.log(`Webhook: subscription created for user ${userId}, tier ${tier}`)
}

/**
 * Handle subscription_updated event
 */
async function handleSubscriptionUpdated(data: WebhookEventData) {
  const attrs = data.attributes
  const subscriptionId = String(data.id)

  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    on_trial: 'TRIAL',
    cancelled: 'CANCELLED',
    expired: 'EXPIRED',
    paused: 'PAST_DUE',
    unpaid: 'EXPIRED',
  }

  const lemonStatus = String(attrs.status || '')
  const dbStatus = statusMap[lemonStatus] || 'PAST_DUE'

  const variantId = String(attrs.variant_id || '')
  const planKey = variantId ? getPlanKeyByVariantId(variantId) : null
  const tier = planKey ? planKeyToSubscriptionTier(planKey) : undefined

  const updateData: Record<string, unknown> = {
    status: dbStatus,
    cancelAtPeriodEnd: Boolean(attrs.cancelled_at),
  }

  if (tier) {
    updateData.tier = tier
  }

  if (attrs.renews_at) {
    updateData.currentPeriodEnd = new Date(String(attrs.renews_at))
  }
  if (attrs.created_at) {
    updateData.currentPeriodStart = new Date(String(attrs.created_at))
  }

  await db.subscription.updateMany({
    where: { lemonsqueezySubscriptionId: subscriptionId },
    data: updateData,
  })

  console.log(`Webhook: subscription updated ${subscriptionId} → ${dbStatus}`)
}

/**
 * Handle subscription_cancelled event
 */
async function handleSubscriptionCancelled(data: WebhookEventData) {
  const subscriptionId = String(data.id)

  await db.subscription.updateMany({
    where: { lemonsqueezySubscriptionId: subscriptionId },
    data: {
      cancelAtPeriodEnd: true,
    },
  })

  console.log(`Webhook: subscription cancelled ${subscriptionId}`)
}

/**
 * Handle subscription_expired event
 */
async function handleSubscriptionExpired(data: WebhookEventData) {
  const subscriptionId = String(data.id)

  await db.subscription.updateMany({
    where: { lemonsqueezySubscriptionId: subscriptionId },
    data: {
      status: 'EXPIRED',
      cancelAtPeriodEnd: false,
    },
  })

  console.log(`Webhook: subscription expired ${subscriptionId}`)
}

/**
 * Handle subscription_payment_success event
 */
async function handleSubscriptionPaymentSuccess(data: WebhookEventData, customData?: Record<string, string>) {
  const userId = customData?.user_id
  const attrs = data.attributes

  // Find subscription by Lemon Squeezy subscription ID
  const sub = await db.subscription.findFirst({
    where: { lemonsqueezySubscriptionId: String(attrs.subscription_id || data.id) },
  })

  if (!sub && !userId) {
    console.error('Webhook: subscription_payment_success — could not find subscription or user')
    return
  }

  const targetUserId = sub?.userId || userId

  if (!targetUserId) return

  // Update period end
  if (attrs.renews_at) {
    await db.subscription.updateMany({
      where: { userId: targetUserId },
      data: {
        status: 'ACTIVE',
        currentPeriodEnd: new Date(String(attrs.renews_at)),
      },
    })
  }

  // Record payment
  await db.payment.create({
    data: {
      userId: targetUserId,
      amount: Number(attrs.total || 0) / 100,
      currency: String(attrs.currency || 'usd'),
      status: 'COMPLETED',
      lemonsqueezyOrderId: String(attrs.order_id || data.id),
      description: `Subscription payment`,
      metadata: JSON.stringify({
        subscriptionId: String(attrs.subscription_id || data.id),
        eventName: 'subscription_payment_success',
      }),
    },
  })

  console.log(`Webhook: subscription payment success for user ${targetUserId}`)
}

/**
 * Handle subscription_payment_failed event
 */
async function handleSubscriptionPaymentFailed(data: WebhookEventData) {
  const attrs = data.attributes
  const sub = await db.subscription.findFirst({
    where: { lemonsqueezySubscriptionId: String(attrs.subscription_id || data.id) },
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
      amount: Number(attrs.total || 0) / 100,
      currency: String(attrs.currency || 'usd'),
      status: 'FAILED',
      lemonsqueezyOrderId: String(attrs.order_id || data.id),
      description: 'Failed subscription payment',
      metadata: JSON.stringify({
        subscriptionId: String(attrs.subscription_id || data.id),
        eventName: 'subscription_payment_failed',
      }),
    },
  })

  console.log(`Webhook: subscription payment failed for subscription ${String(attrs.subscription_id || data.id)}`)
}

/**
 * Handle subscription_payment_recovered event
 */
async function handleSubscriptionPaymentRecovered(data: WebhookEventData) {
  const subscriptionId = String(data.id || data.attributes?.subscription_id)

  await db.subscription.updateMany({
    where: { lemonsqueezySubscriptionId: subscriptionId },
    data: { status: 'ACTIVE' },
  })

  console.log(`Webhook: subscription payment recovered ${subscriptionId}`)
}

/**
 * Handle order_created event (for one-time payments like Conference Pay-Per-Event)
 */
async function handleOrderCreated(data: WebhookEventData, customData?: Record<string, string>) {
  const userId = customData?.user_id
  const attrs = data.attributes

  if (!userId) {
    console.error('Webhook: order_created — missing user_id in custom_data')
    return
  }

  const variantId = String(attrs.first_order_item?.variant_id || attrs.variant_id || '')
  const planKey = variantId ? getPlanKeyByVariantId(variantId) : null
  const tier = planKey ? planKeyToSubscriptionTier(planKey) : null

  // Record payment
  await db.payment.create({
    data: {
      userId,
      amount: Number(attrs.total || 0) / 100,
      currency: String(attrs.currency || 'usd'),
      status: attrs.status === 'paid' ? 'COMPLETED' : 'PENDING',
      lemonsqueezyOrderId: String(data.id),
      description: planKey ? PLANS_LOOKUP[planKey]?.name || 'One-time purchase' : 'One-time purchase',
      metadata: JSON.stringify({
        orderId: String(data.id),
        planKey: planKey || 'unknown',
        eventName: 'order_created',
      }),
    },
  })

  // If this is a subscription-less plan (e.g. Conference Pay-Per-Event), update the user's tier
  if (tier && planKey === 'CONFERENCE_PAY_PER_EVENT') {
    await db.subscription.upsert({
      where: { userId },
      update: {
        tier: tier as never,
        status: 'ACTIVE',
        lemonsqueezyCustomerId: String(attrs.customer_id || ''),
      },
      create: {
        userId,
        tier: tier as never,
        status: 'ACTIVE',
        lemonsqueezyCustomerId: String(attrs.customer_id || ''),
      },
    })
  }

  console.log(`Webhook: order created for user ${userId}, plan ${planKey || 'unknown'}`)
}

// ============================================================
// PLAN LOOKUP HELPER (for handler access)
// ============================================================

const PLANS_LOOKUP: Record<string, { name: string; isAnnual?: boolean }> = {
  DELEGATE_PRO_MONTHLY: { name: 'Delegate Pro Monthly' },
  DELEGATE_PRO_YEARLY: { name: 'Delegate Pro Yearly', isAnnual: true },
  DIRECTOR_PRO_MONTHLY: { name: 'Director Pro Monthly' },
  DIRECTOR_PRO_YEARLY: { name: 'Director Pro Yearly', isAnnual: true },
  SCHOOL_STARTER: { name: 'School Starter' },
  SCHOOL_PROFESSIONAL: { name: 'School Professional' },
  CONFERENCE_PAY_PER_EVENT: { name: 'Conference Pay-Per-Event' },
  CONFERENCE_ANNUAL: { name: 'Conference Annual', isAnnual: true },
  SCHOOL_ENTERPRISE: { name: 'School Enterprise' },
}

// ============================================================
// MAIN WEBHOOK HANDLER
// ============================================================

export async function POST(req: NextRequest) {
  const rawBody = await getRawBody(req)
  const headersList = await headers()
  const signature = headersList.get('x-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing X-Signature header' }, { status: 400 })
  }

  // Verify webhook signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Parse the webhook payload
  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody) as WebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const eventName = payload.meta?.event_name
  const customData = payload.meta?.custom_data
  const data = payload.data

  // Log all events for audit
  console.log(`Webhook received: ${eventName} [${data.id}]`)
  await logAuditEvent(eventName, data.id)

  try {
    switch (eventName) {
      case 'subscription_created': {
        await handleSubscriptionCreated(data, customData)
        break
      }

      case 'subscription_updated': {
        await handleSubscriptionUpdated(data)
        break
      }

      case 'subscription_cancelled': {
        await handleSubscriptionCancelled(data)
        break
      }

      case 'subscription_expired': {
        await handleSubscriptionExpired(data)
        break
      }

      case 'subscription_payment_success': {
        await handleSubscriptionPaymentSuccess(data, customData)
        break
      }

      case 'subscription_payment_failed': {
        await handleSubscriptionPaymentFailed(data)
        break
      }

      case 'subscription_payment_recovered': {
        await handleSubscriptionPaymentRecovered(data)
        break
      }

      case 'order_created': {
        await handleOrderCreated(data, customData)
        break
      }

      default:
        console.log(`Webhook: unhandled event type ${eventName}`)
    }
  } catch (error) {
    console.error(`Webhook handler error for ${eventName}:`, error)
    await logAuditEvent(eventName, data.id, `HANDLER_ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
