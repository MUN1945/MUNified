/**
 * Subscription Enforcement & Access Control
 *
 * This module provides tier-based access control for the DiplomatiQ platform.
 * It works alongside the role-based auth-helpers.ts to enforce that:
 *
 * 1. Expired/CANCELLED/PAST_DUE users lose access to premium features
 * 2. Trial users (24h) get restricted access — basic courses & 1 assessment only
 * 3. FREE tier users get limited access (3 training modules, 1 assessment)
 * 4. Paid tiers (DELEGATE_PRO, DIRECTOR_PRO, etc.) unlock full features
 * 5. Payment failures result in downgrade to FREE after a grace period
 *
 * IMPORTANT: This module is used SERVER-SIDE in API routes.
 */

import { db } from "@/lib/db"

// ============================================================
// TYPES
// ============================================================

export type Tier = 'FREE' | 'DELEGATE_PRO' | 'DIRECTOR_PRO' | 'SCHOOL_STARTER' | 'SCHOOL_PROFESSIONAL' | 'SCHOOL_ENTERPRISE' | 'CONFERENCE_PACKAGE'
export type SubStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'

export interface SubscriptionAccess {
  /** Whether the user has any access at all (not fully locked out) */
  hasAccess: boolean
  /** The effective tier (downgraded if expired/cancelled) */
  effectiveTier: Tier
  /** The raw status from the DB */
  status: SubStatus
  /** Whether the user is on a 24-hour trial */
  isOnTrial: boolean
  /** Whether the trial has expired */
  isTrialExpired: boolean
  /** Whether the subscription is past due (grace period) */
  isPastDue: boolean
  /** Whether the subscription was cancelled (access until period end) */
  isCancelled: boolean
  /** Feature permissions based on tier */
  features: FeaturePermissions
}

export interface FeaturePermissions {
  // Training
  maxFreeCourses: number          // How many courses FREE users can access
  canAccessAllCourses: boolean    // Full course library
  canAccessTeacherTraining: boolean // Director-specific training modules

  // Assessment
  maxAssessments: number          // How many assessments FREE users can take
  canTakeUnlimitedAssessments: boolean
  canAccessProgressiveAssessment: boolean

  // Conferences
  canCreateConferences: boolean
  canRegisterForConferences: boolean
  canManageCommittees: boolean

  // Chat & Communication
  canAccessChat: boolean
  canAccessCommitteeChannels: boolean
  canUseAIAssistant: boolean

  // Research & Papers
  canSubmitResearchPapers: boolean
  canUseAIEvaluation: boolean
  canEvaluateStudentPapers: boolean  // Teacher feature

  // Analytics & Gamification
  canViewAnalytics: boolean
  canViewLeaderboard: boolean
  canEarnXP: boolean
  canEarnBadges: boolean

  // School Management
  canManageSchool: boolean
  canManageTeachers: boolean
  canManageStudents: boolean
  maxSchoolStudents: number       // -1 = unlimited
  maxSchoolTeachers: number       // -1 = unlimited

  // Conference Packages
  canHostConferences: boolean
  maxConferencesPerYear: number   // -1 = unlimited
}

// ============================================================
// FEATURE PERMISSIONS BY TIER
// ============================================================

const FREE_FEATURES: FeaturePermissions = {
  maxFreeCourses: 3,
  canAccessAllCourses: false,
  canAccessTeacherTraining: false,
  maxAssessments: 1,
  canTakeUnlimitedAssessments: false,
  canAccessProgressiveAssessment: true,   // Trial users can take the diagnostic
  canCreateConferences: false,
  canRegisterForConferences: false,
  canManageCommittees: false,
  canAccessChat: false,
  canAccessCommitteeChannels: false,
  canUseAIAssistant: false,
  canSubmitResearchPapers: false,
  canUseAIEvaluation: false,
  canEvaluateStudentPapers: false,
  canViewAnalytics: false,
  canViewLeaderboard: true,               // Can see but not compete
  canEarnXP: true,                        // Earn XP from free courses
  canEarnBadges: true,                    // Earn basic badges
  canManageSchool: false,
  canManageTeachers: false,
  canManageStudents: false,
  maxSchoolStudents: 0,
  maxSchoolTeachers: 0,
  canHostConferences: false,
  maxConferencesPerYear: 0,
}

const TRIAL_FEATURES: FeaturePermissions = {
  maxFreeCourses: 3,
  canAccessAllCourses: false,
  canAccessTeacherTraining: false,
  maxAssessments: 1,
  canTakeUnlimitedAssessments: false,
  canAccessProgressiveAssessment: true,   // The diagnostic assessment
  canCreateConferences: false,
  canRegisterForConferences: false,
  canManageCommittees: false,
  canAccessChat: true,                    // Trial users can view chat
  canAccessCommitteeChannels: false,
  canUseAIAssistant: true,               // Trial users get AI assistant access
  canSubmitResearchPapers: false,
  canUseAIEvaluation: false,
  canEvaluateStudentPapers: false,
  canViewAnalytics: false,
  canViewLeaderboard: true,
  canEarnXP: true,
  canEarnBadges: true,
  canManageSchool: false,
  canManageTeachers: false,
  canManageStudents: false,
  maxSchoolStudents: 0,
  maxSchoolTeachers: 0,
  canHostConferences: false,
  maxConferencesPerYear: 0,
}

const DELEGATE_PRO_FEATURES: FeaturePermissions = {
  maxFreeCourses: -1,
  canAccessAllCourses: true,
  canAccessTeacherTraining: false,
  maxAssessments: -1,
  canTakeUnlimitedAssessments: true,
  canAccessProgressiveAssessment: true,
  canCreateConferences: false,
  canRegisterForConferences: true,
  canManageCommittees: false,
  canAccessChat: true,
  canAccessCommitteeChannels: true,
  canUseAIAssistant: true,
  canSubmitResearchPapers: true,
  canUseAIEvaluation: true,
  canEvaluateStudentPapers: false,
  canViewAnalytics: true,
  canViewLeaderboard: true,
  canEarnXP: true,
  canEarnBadges: true,
  canManageSchool: false,
  canManageTeachers: false,
  canManageStudents: false,
  maxSchoolStudents: 0,
  maxSchoolTeachers: 0,
  canHostConferences: false,
  maxConferencesPerYear: 0,
}

const DIRECTOR_PRO_FEATURES: FeaturePermissions = {
  maxFreeCourses: -1,
  canAccessAllCourses: true,
  canAccessTeacherTraining: true,
  maxAssessments: -1,
  canTakeUnlimitedAssessments: true,
  canAccessProgressiveAssessment: true,
  canCreateConferences: true,
  canRegisterForConferences: true,
  canManageCommittees: true,
  canAccessChat: true,
  canAccessCommitteeChannels: true,
  canUseAIAssistant: true,
  canSubmitResearchPapers: true,
  canUseAIEvaluation: true,
  canEvaluateStudentPapers: true,
  canViewAnalytics: true,
  canViewLeaderboard: true,
  canEarnXP: true,
  canEarnBadges: true,
  canManageSchool: false,
  canManageTeachers: false,
  canManageStudents: false,
  maxSchoolStudents: 0,
  maxSchoolTeachers: 0,
  canHostConferences: false,
  maxConferencesPerYear: 0,
}

const SCHOOL_STARTER_FEATURES: FeaturePermissions = {
  ...DIRECTOR_PRO_FEATURES,
  canManageSchool: true,
  canManageTeachers: true,
  canManageStudents: true,
  maxSchoolStudents: 50,
  maxSchoolTeachers: 5,
  canHostConferences: true,
  maxConferencesPerYear: 2,
}

const SCHOOL_PROFESSIONAL_FEATURES: FeaturePermissions = {
  ...DIRECTOR_PRO_FEATURES,
  canManageSchool: true,
  canManageTeachers: true,
  canManageStudents: true,
  maxSchoolStudents: 200,
  maxSchoolTeachers: 20,
  canHostConferences: true,
  maxConferencesPerYear: 10,
}

const SCHOOL_ENTERPRISE_FEATURES: FeaturePermissions = {
  ...DIRECTOR_PRO_FEATURES,
  canManageSchool: true,
  canManageTeachers: true,
  canManageStudents: true,
  maxSchoolStudents: -1,
  maxSchoolTeachers: -1,
  canHostConferences: true,
  maxConferencesPerYear: -1,
}

const CONFERENCE_PACKAGE_FEATURES: FeaturePermissions = {
  ...DELEGATE_PRO_FEATURES,
  canHostConferences: true,
  maxConferencesPerYear: 1,
}

const TIER_FEATURES: Record<string, FeaturePermissions> = {
  FREE: FREE_FEATURES,
  DELEGATE_PRO: DELEGATE_PRO_FEATURES,
  DIRECTOR_PRO: DIRECTOR_PRO_FEATURES,
  SCHOOL_STARTER: SCHOOL_STARTER_FEATURES,
  SCHOOL_PROFESSIONAL: SCHOOL_PROFESSIONAL_FEATURES,
  SCHOOL_ENTERPRISE: SCHOOL_ENTERPRISE_FEATURES,
  CONFERENCE_PACKAGE: CONFERENCE_PACKAGE_FEATURES,
}

// ============================================================
// ACCESS CHECK FUNCTIONS
// ============================================================

/**
 * Get the full subscription access profile for a user.
 * This checks the DB for the latest subscription status and
 * computes the effective tier and feature permissions.
 *
 * This is the primary server-side function for subscription enforcement.
 */
export async function getUserSubscriptionAccess(userId: string): Promise<SubscriptionAccess> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  })

  // No subscription record = no access (shouldn't happen, but handle gracefully)
  if (!subscription) {
    return {
      hasAccess: true, // Allow access so the user can be assigned a subscription
      effectiveTier: 'FREE',
      status: 'EXPIRED',
      isOnTrial: false,
      isTrialExpired: true,
      isPastDue: false,
      isCancelled: false,
      features: FREE_FEATURES,
    }
  }

  const now = new Date()

  // Check if trial has expired
  const isTrialExpired =
    subscription.status === 'TRIAL' &&
    subscription.trialEndsAt !== null &&
    new Date(subscription.trialEndsAt) < now

  // Auto-expire the trial in DB if needed
  if (isTrialExpired) {
    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: 'EXPIRED' },
    })
  }

  // Determine effective tier based on status
  let effectiveTier: Tier = subscription.tier as Tier
  let hasAccess = true

  // If subscription is expired or cancelled and past the period end → downgrade to FREE
  const isExpiredOrCancelled = subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED'
  const isPastPeriodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) < now : true

  if (isExpiredOrCancelled && isPastPeriodEnd) {
    effectiveTier = 'FREE'
  }

  // If PAST_DUE and past grace period (7 days after period end) → downgrade to FREE
  if (subscription.status === 'PAST_DUE') {
    const gracePeriodEnd = subscription.currentPeriodEnd
      ? new Date(new Date(subscription.currentPeriodEnd).getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 1) // Already past grace if no period end

    if (now > gracePeriodEnd) {
      effectiveTier = 'FREE'
    }
  }

  // Expired trial → downgrade to FREE
  if (isTrialExpired) {
    effectiveTier = 'FREE'
  }

  // FREE tier users always have access (just limited features)
  // But EXPIRED users with no active payment lose access entirely after trial
  if (subscription.status === 'EXPIRED' && effectiveTier === 'FREE' && isTrialExpired) {
    // They still have access but with FREE tier restrictions
    hasAccess = true
  }

  // Get features based on effective tier or trial status
  let features: FeaturePermissions
  if (subscription.status === 'TRIAL' && !isTrialExpired) {
    features = TRIAL_FEATURES
  } else {
    features = TIER_FEATURES[effectiveTier] || FREE_FEATURES
  }

  return {
    hasAccess,
    effectiveTier,
    status: isTrialExpired ? 'EXPIRED' : (subscription.status as SubStatus),
    isOnTrial: subscription.status === 'TRIAL' && !isTrialExpired,
    isTrialExpired,
    isPastDue: subscription.status === 'PAST_DUE',
    isCancelled: subscription.status === 'CANCELLED' || subscription.cancelAtPeriodEnd,
    features,
  }
}

/**
 * Quick check: Can a user access a specific feature?
 * Returns false if the subscription doesn't permit the feature.
 */
export function canAccessFeature(access: SubscriptionAccess, feature: keyof FeaturePermissions): boolean {
  return Boolean(access.features[feature])
}

/**
 * Require a specific feature — throws if the user's subscription doesn't allow it.
 * Use this in API routes to enforce subscription-gated access.
 */
export function requireFeature(access: SubscriptionAccess, feature: keyof FeaturePermissions): void {
  if (!access.features[feature]) {
    throw new SubscriptionError(
      `This feature requires a paid subscription. Please upgrade to access ${
        feature.replace(/can/g, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase()
      }.`
    )
  }
}

/**
 * Require a minimum tier — throws if the user's effective tier is below the required one.
 */
const TIER_HIERARCHY: Record<string, number> = {
  FREE: 0,
  CONFERENCE_PACKAGE: 1,
  DELEGATE_PRO: 2,
  DIRECTOR_PRO: 3,
  SCHOOL_STARTER: 4,
  SCHOOL_PROFESSIONAL: 5,
  SCHOOL_ENTERPRISE: 6,
}

export function requireMinTier(access: SubscriptionAccess, requiredTier: Tier): void {
  const userLevel = TIER_HIERARCHY[access.effectiveTier] || 0
  const requiredLevel = TIER_HIERARCHY[requiredTier] || 0
  if (userLevel < requiredLevel) {
    throw new SubscriptionError(
      `This feature requires the ${requiredTier.replace(/_/g, ' ')} plan or higher. Please upgrade your subscription.`
    )
  }
}

/**
 * Check if a user can access a specific course (based on free tier limits).
 * Returns { allowed: boolean, reason?: string }
 */
export function canAccessCourse(access: SubscriptionAccess, courseIndex: number): { allowed: boolean; reason?: string } {
  if (access.features.canAccessAllCourses) {
    return { allowed: true }
  }

  const maxFree = access.features.maxFreeCourses
  if (maxFree === -1) {
    return { allowed: true }
  }

  if (courseIndex < maxFree) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `Free accounts can access ${maxFree} training modules. Upgrade to Delegate Pro for unlimited access.`,
  }
}

/**
 * Check if a user can take an assessment (based on free tier limits).
 * Returns { allowed: boolean, reason?: string }
 */
export function canTakeAssessment(access: SubscriptionAccess, assessmentsTaken: number): { allowed: boolean; reason?: string } {
  if (access.features.canTakeUnlimitedAssessments) {
    return { allowed: true }
  }

  const maxAssessments = access.features.maxAssessments
  if (maxAssessments === -1) {
    return { allowed: true }
  }

  if (assessmentsTaken < maxAssessments) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `Free accounts are limited to ${maxAssessments} assessment${maxAssessments === 1 ? '' : 's'}. Upgrade to Delegate Pro for unlimited assessments.`,
  }
}

// ============================================================
// CUSTOM ERROR
// ============================================================

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SubscriptionError'
  }
}

// ============================================================
// 24-HOUR TRIAL: WHAT CAN AND CANNOT BE ACCESSED
// ============================================================

/**
 * TRIAL ACCESS RULES:
 *
 * ✅ CAN ACCESS during 24-hour trial:
 *   - Up to 3 beginner training modules (courses 1-3)
 *   - 1 diagnostic/progressive assessment
 *   - Chat (view only — can read messages, can use AI assistant)
 *   - Leaderboard (view only)
 *   - Delegate profile & XP tracking (from free courses only)
 *   - Basic badge earning
 *   - Settings & profile management
 *   - Pricing/plans page (to upgrade)
 *
 * ❌ CANNOT ACCESS during 24-hour trial:
 *   - Advanced training modules (course 4+)
 *   - Teacher/director-specific training
 *   - Conference registration & management
 *   - Committee channels (full access)
 *   - Research paper submission & AI evaluation
 *   - Analytics dashboard
 *   - Creating or hosting conferences
 *   - School management features
 *   - Additional assessments beyond the first one
 *
 * AFTER TRIAL EXPIRES:
 *   - All the above restrictions apply
 *   - User is downgraded to FREE tier
 *   - Any progress in restricted courses is preserved but inaccessible
 *   - A prominent banner directs them to upgrade
 */
