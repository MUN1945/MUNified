import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

/**
 * Check if Lemon Squeezy is properly configured with a valid API key.
 * Placeholder keys are NOT considered configured.
 */
export function isLemonSqueezyConfigured(): boolean {
  const key = process.env.LEMONSQUEEZY_API_KEY
  if (!key) return false
  if (key === 'placeholder_set_in_vercel') return false
  return key.length > 20 // Real JWT keys are long
}

/**
 * Initialize the Lemon Squeezy client.
 * Called once at module load; subsequent calls are no-ops.
 */
if (isLemonSqueezyConfigured()) {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  })
}

// ============================================================
// PRODUCT / VARIANT / CHECKOUT CONFIGURATION
// ============================================================

export const LEMON_SQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || '392578'
export const LEMON_SQUEEZY_STORE_URL = 'diplomatiq.lemonsqueezy.com'

interface PlanConfig {
  name: string
  productId: string
  variantId: string
  checkoutSlug: string
  price: number
  currency: string
  /** Human-readable period label (e.g. "/month", "/year", "one-time") */
  period: string
  /** Is this an annual variant of a monthly plan? */
  isAnnual?: boolean
  /** Max students for school plans */
  maxStudents?: number
  /** Max teachers for school plans */
  maxTeachers?: number
}

/**
 * All product plans mapped by their internal plan key.
 *
 * The keys here map directly to the SubscriptionTier enum in Prisma
 * (STUDENT_PRO → DELEGATE_PRO, TEACHER_PRO → DIRECTOR_PRO).
 * We keep the old STUDENT_PRO / TEACHER_PRO keys internally in this map
 * for backwards compatibility during checkout, but the DB enum values
 * are now DELEGATE_PRO / DIRECTOR_PRO.
 */
export const PLANS: Record<string, PlanConfig> = {
  DELEGATE_PRO_MONTHLY: {
    name: 'Delegate Pro Monthly',
    productId: '1101813',
    variantId: '1725644',
    checkoutSlug: 'f27e80e2-6cbb-47d3-91ff-fce5644f0417',
    price: 11,
    currency: 'USD',
    period: '/month',
  },
  DELEGATE_PRO_YEARLY: {
    name: 'Delegate Pro Yearly',
    productId: '1101822',
    variantId: '1725657',
    checkoutSlug: '6cac7d2e-2683-4077-93d7-4e274b5e2f6b',
    price: 109,
    currency: 'USD',
    period: '/year',
    isAnnual: true,
  },
  DIRECTOR_PRO_MONTHLY: {
    name: 'Director Pro Monthly',
    productId: '1101824',
    variantId: '1725660',
    checkoutSlug: '9f3a594c-5102-4d6f-8179-1a0afc1d3818',
    price: 29,
    currency: 'USD',
    period: '/month',
  },
  DIRECTOR_PRO_YEARLY: {
    name: 'Director Pro Yearly',
    productId: '1101827',
    variantId: '1725667',
    checkoutSlug: 'fb20b273-a810-4502-aa8b-cb212fb0202e',
    price: 278,
    currency: 'USD',
    period: '/year',
    isAnnual: true,
  },
  SCHOOL_STARTER: {
    name: 'School Starter',
    productId: '1101828',
    variantId: '1725668',
    checkoutSlug: '40603ef4-dcfd-48eb-ac39-bc8358b8c4c6',
    price: 99,
    currency: 'USD',
    period: '/month',
    maxStudents: 50,
    maxTeachers: 5,
  },
  SCHOOL_PROFESSIONAL: {
    name: 'School Professional',
    productId: '1101829',
    variantId: '1725669',
    checkoutSlug: 'dd2fa285-1c70-499c-880a-5caad575985d',
    price: 249,
    currency: 'USD',
    period: '/month',
    maxStudents: 200,
    maxTeachers: 20,
  },
  CONFERENCE_PAY_PER_EVENT: {
    name: 'Conference Pay-Per-Event',
    productId: '1101830',
    variantId: '1725670',
    checkoutSlug: 'ab64e1bf-9e47-4743-904c-bede6881f12c',
    price: 49,
    currency: 'USD',
    period: 'one-time',
  },
  CONFERENCE_ANNUAL: {
    name: 'Conference Annual',
    productId: '1101832',
    variantId: '1725674',
    checkoutSlug: '1179cd0e-88bb-4b25-a107-f9ea0f1c7c77',
    price: 399,
    currency: 'USD',
    period: '/year',
    isAnnual: true,
  },
  SCHOOL_ENTERPRISE: {
    name: 'School Enterprise',
    productId: '',
    variantId: '',
    checkoutSlug: '',
    price: 0, // Custom pricing
    currency: 'USD',
    period: 'custom',
    maxStudents: -1, // Unlimited
    maxTeachers: -1,
  },
} as const

export type PlanKey = keyof typeof PLANS

/**
 * Get the checkout URL for a given plan.
 * Optionally pre-fill email, name, and custom user_id.
 */
export function getCheckoutUrl(
  planKey: PlanKey,
  options?: { email?: string; name?: string; userId?: string }
): string | null {
  const plan = PLANS[planKey]
  if (!plan || !plan.checkoutSlug) return null

  const base = `https://${LEMON_SQUEEZY_STORE_URL}/checkout/buy/${plan.checkoutSlug}`

  const params = new URLSearchParams()
  if (options?.email) params.set('checkout[email]', options.email)
  if (options?.name) params.set('checkout[name]', options.name)
  if (options?.userId) params.set('checkout[custom][user_id]', options.userId)

  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

/**
 * Get the customer portal URL for managing subscriptions.
 */
export function getCustomerPortalUrl(): string {
  return `https://${LEMON_SQUEEZY_STORE_URL}/billing`
}

/**
 * Resolve a Lemon Squeezy variant ID back to a plan key.
 * Used in webhooks where we receive the variant_id.
 */
export function getPlanKeyByVariantId(variantId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.variantId === variantId) {
      return key as PlanKey
    }
  }
  return null
}

/**
 * Map a plan key to the SubscriptionTier enum value in the database.
 * Handles the STUDENT_PRO → DELEGATE_PRO and TEACHER_PRO → DIRECTOR_PRO renaming.
 */
export function planKeyToSubscriptionTier(planKey: string): string {
  // Direct mapping — plan keys already use DELEGATE_PRO / DIRECTOR_PRO naming
  if (planKey === 'DELEGATE_PRO_MONTHLY' || planKey === 'DELEGATE_PRO_YEARLY') {
    return 'DELEGATE_PRO'
  }
  if (planKey === 'DIRECTOR_PRO_MONTHLY' || planKey === 'DIRECTOR_PRO_YEARLY') {
    return 'DIRECTOR_PRO'
  }
  if (planKey === 'CONFERENCE_PAY_PER_EVENT' || planKey === 'CONFERENCE_ANNUAL') {
    return 'CONFERENCE_PACKAGE'
  }
  // SCHOOL_STARTER, SCHOOL_PROFESSIONAL, SCHOOL_ENTERPRISE map directly
  if (['SCHOOL_STARTER', 'SCHOOL_PROFESSIONAL', 'SCHOOL_ENTERPRISE'].includes(planKey)) {
    return planKey
  }
  return 'FREE'
}

/**
 * Get the display price for a plan and billing period
 */
export function getDisplayPrice(planKey: PlanKey): { price: number; period: string } | null {
  const plan = PLANS[planKey]
  if (!plan) return null

  if (planKey === 'SCHOOL_ENTERPRISE') {
    return { price: 0, period: 'custom' }
  }

  return { price: plan.price, period: plan.period }
}

/**
 * Verify a Lemon Squeezy webhook signature using HMAC-SHA256.
 *
 * @param rawBody - The raw request body as a string
 * @param signature - The X-Signature header value
 * @returns Whether the signature is valid
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret || secret === 'placeholder_set_in_vercel') {
    console.warn('⚠️ LEMONSQUEEZY_WEBHOOK_SECRET not configured — skipping signature verification. This is insecure for production!')
    return true // Allow in development
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  try {
    const sigBuffer = Buffer.from(signature, 'utf8')
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')
    if (sigBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}
