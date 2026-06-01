import { db } from "@/lib/db"

/**
 * Subscription access levels for feature gating
 */
export type AccessLevel = 'PUBLIC' | 'TRIAL_LIMITED' | 'PAID_ONLY'

/**
 * Feature access requirements mapping
 * Each feature specifies the minimum access level required
 */
export const FEATURE_ACCESS: Record<string, AccessLevel> = {
  // Public features (available to everyone including expired trials)
  dashboard: 'PUBLIC',
  settings: 'PUBLIC',
  pricing: 'PUBLIC',
  conduct: 'PUBLIC',
  profile: 'PUBLIC',

  // Trial-limited features (available during active trial with restrictions)
  training: 'TRIAL_LIMITED',
  chat: 'TRIAL_LIMITED',

  // Paid-only features (require active paid subscription)
  assessment: 'PAID_ONLY',
  conferences: 'PAID_ONLY',
  committees: 'PAID_ONLY',
  research: 'PAID_ONLY',
  analytics: 'PAID_ONLY',
  leaderboard: 'PAID_ONLY',
  schools: 'PAID_ONLY',
}

/**
 * Training module difficulty levels accessible during trial
 */
export const TRIAL_ALLOWED_DIFFICULTIES = ['BEGINNER']

/**
 * Check if a user's subscription grants access to a specific feature
 * Returns an object with access status and restriction info
 */
export async function checkFeatureAccess(
  userId: string,
  feature: string
): Promise<{
  allowed: boolean
  reason?: string
  subscriptionStatus?: string
  subscriptionTier?: string
  trialEndsAt?: Date | null
}> {
  try {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    })

    const status = subscription?.status || 'EXPIRED'
    const tier = subscription?.tier || 'FREE'
    const trialEndsAt = subscription?.trialEndsAt || null

    // Admin and school accounts always have access
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (user && ['MASTER_ADMIN', 'FOUNDER', 'SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'TEACHER'].includes(user.role)) {
      return { allowed: true, subscriptionStatus: status, subscriptionTier: tier, trialEndsAt }
    }

    const accessLevel = FEATURE_ACCESS[feature] || 'PAID_ONLY'

    // Public features: always accessible
    if (accessLevel === 'PUBLIC') {
      return { allowed: true, subscriptionStatus: status, subscriptionTier: tier, trialEndsAt }
    }

    // Active paid subscription: full access
    if (status === 'ACTIVE' && tier !== 'FREE') {
      return { allowed: true, subscriptionStatus: status, subscriptionTier: tier, trialEndsAt }
    }

    // Trial-limited features during active trial
    if (accessLevel === 'TRIAL_LIMITED' && status === 'TRIAL') {
      // Check if trial hasn't expired
      if (trialEndsAt && new Date(trialEndsAt) > new Date()) {
        return {
          allowed: true,
          reason: 'trial_limited',
          subscriptionStatus: status,
          subscriptionTier: tier,
          trialEndsAt,
        }
      }
      // Trial expired
      return {
        allowed: false,
        reason: 'trial_expired',
        subscriptionStatus: 'EXPIRED',
        subscriptionTier: tier,
        trialEndsAt,
      }
    }

    // Paid-only features require active paid subscription
    if (accessLevel === 'PAID_ONLY') {
      if (status === 'TRIAL') {
        return {
          allowed: false,
          reason: 'subscription_required',
          subscriptionStatus: status,
          subscriptionTier: tier,
          trialEndsAt,
        }
      }
      return {
        allowed: false,
        reason: status === 'EXPIRED' ? 'trial_expired' : 'subscription_required',
        subscriptionStatus: status,
        subscriptionTier: tier,
        trialEndsAt,
      }
    }

    // Default: deny access
    return {
      allowed: false,
      reason: 'subscription_required',
      subscriptionStatus: status,
      subscriptionTier: tier,
      trialEndsAt,
    }
  } catch (error) {
    console.error("Check feature access error:", error)
    // On error, deny access for safety
    return { allowed: false, reason: 'error_checking_access' }
  }
}

/**
 * Check if a user can send chat messages (trial users cannot send)
 */
export async function canSendChatMessages(userId: string): Promise<boolean> {
  try {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    })

    if (!subscription) return false

    // Active paid subscribers can always chat
    if (subscription.status === 'ACTIVE' && subscription.tier !== 'FREE') return true

    // Trial and expired users cannot send messages
    return false
  } catch {
    return false
  }
}

/**
 * Check if a user can access a specific training difficulty
 */
export async function canAccessTrainingDifficulty(
  userId: string,
  difficulty: string
): Promise<boolean> {
  try {
    const subscription = await db.subscription.findUnique({
      where: { userId },
    })

    if (!subscription) return false

    // Active paid subscribers can access all difficulties
    if (subscription.status === 'ACTIVE' && subscription.tier !== 'FREE') return true

    // Trial users can only access beginner-level content
    if (subscription.status === 'TRIAL' && TRIAL_ALLOWED_DIFFICULTIES.includes(difficulty)) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Get user subscription summary for client-side use
 */
export async function getUserSubscriptionSummary(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  })

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  const isAdminOrTeacher = user && ['MASTER_ADMIN', 'FOUNDER', 'SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'TEACHER'].includes(user.role)

  const status = subscription?.status || 'EXPIRED'
  const tier = subscription?.tier || 'FREE'
  const trialEndsAt = subscription?.trialEndsAt || null

  // Check if trial is actually expired (auto-update)
  let effectiveStatus = status
  if (status === 'TRIAL' && trialEndsAt && new Date(trialEndsAt) < new Date()) {
    effectiveStatus = 'EXPIRED'
    // Auto-update in DB
    if (subscription) {
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      }).catch(() => {})
    }
  }

  const isActive = effectiveStatus === 'ACTIVE' && tier !== 'FREE'
  const isTrialActive = effectiveStatus === 'TRIAL' && trialEndsAt && new Date(trialEndsAt) > new Date()
  const isExpired = effectiveStatus === 'EXPIRED' || (effectiveStatus === 'TRIAL' && !isTrialActive)
  const hasAccess = isAdminOrTeacher || isActive

  return {
    status: effectiveStatus,
    tier,
    trialEndsAt,
    isActive,
    isTrialActive,
    isExpired,
    hasAccess,
    isAdminOrTeacher: isAdminOrTeacher || false,
  }
}
