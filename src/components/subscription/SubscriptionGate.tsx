'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Lock, Crown, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavStore, useAuthStore } from '@/lib/store'

// ============================================================
// SUBSCRIPTION GATE COMPONENT
// Blocks content when user doesn't have required access
// ============================================================

interface SubscriptionGateProps {
  /** The feature being gated (maps to FEATURE_ACCESS keys) */
  feature: string
  /** The content to render if access is allowed */
  children: React.ReactNode
  /** Whether this is a trial-limited feature (viewable but restricted) */
  trialLimited?: boolean
}

export default function SubscriptionGate({
  feature,
  children,
  trialLimited = false,
}: SubscriptionGateProps) {
  const { user } = useAuthStore()
  const { navigate } = useNavStore()

  // Admin and teacher roles always have access
  const isAdminOrTeacher = user && [
    'MASTER_ADMIN', 'FOUNDER', 'SUPER_ADMIN', 'ADMIN', 'SCHOOL_ADMIN', 'TEACHER'
  ].includes(user.role)

  if (isAdminOrTeacher) {
    return <>{children}</>
  }

  const subscriptionStatus = user?.subscriptionStatus || 'EXPIRED'
  const subscriptionTier = user?.subscriptionTier || 'FREE'

  // Active paid subscription: full access
  const isActivePaid = subscriptionStatus === 'ACTIVE' && subscriptionTier !== 'FREE'

  if (isActivePaid) {
    return <>{children}</>
  }

  // Check trial status
  const isTrialActive = subscriptionStatus === 'TRIAL'
  const isExpired = subscriptionStatus === 'EXPIRED' ||
    (subscriptionStatus === 'TRIAL' && subscriptionTier === 'FREE')

  // Trial-limited features during active trial
  if (trialLimited && isTrialActive && !isExpired) {
    return (
      <div className="relative">
        {children}
        {/* Trial watermark overlay - content visible but actions restricted */}
        <TrialOverlay feature={feature} />
      </div>
    )
  }

  // All other cases: show upgrade wall
  return <UpgradeWall feature={feature} isExpired={isExpired} />
}

// ============================================================
// TRIAL OVERLAY - Shows trial limitations over content
// ============================================================

function TrialOverlay({ feature }: { feature: string }) {
  const { navigate } = useNavStore()

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Badge className="bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30 text-xs px-3 py-1.5 cursor-pointer hover:bg-[#D4A843]/25 transition-colors"
          onClick={() => navigate('pricing')}
        >
          <Crown className="w-3 h-3 mr-1.5" />
          Trial Access — Upgrade for full {feature}
        </Badge>
      </motion.div>
    </div>
  )
}

// ============================================================
// UPGRADE WALL - Full block for restricted features
// ============================================================

function UpgradeWall({ feature, isExpired }: { feature: string; isExpired: boolean }) {
  const { navigate } = useNavStore()

  const featureLabel: Record<string, string> = {
    assessment: 'Assessments',
    training: 'Training Modules',
    conferences: 'Conferences',
    committees: 'Committees',
    research: 'Research Lab',
    analytics: 'Analytics',
    leaderboard: 'Leaderboard',
    schools: 'School Directory',
    chat: 'Chat',
  }

  const label = featureLabel[feature] || feature

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="border-[#E8DED0]/60 text-center">
          <CardContent className="pt-8 pb-8 px-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#D4A843]/10 flex items-center justify-center mx-auto mb-5">
              {isExpired ? (
                <AlertTriangle className="w-8 h-8 text-[#D4A843]" />
              ) : (
                <Lock className="w-8 h-8 text-[#D4A843]" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#1B3A4B] mb-2">
              {isExpired ? 'Trial Expired' : `${label} Requires a Subscription`}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {isExpired
                ? `Your 24-hour free trial has expired. Upgrade to a paid plan to regain access to ${label.toLowerCase()} and all premium features.`
                : `${label} is available on paid plans. Start your journey with Delegate Pro or Director Pro to unlock this feature and more.`
              }
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {['Full Training Access', 'Assessments', 'Conferences', 'Chat', 'Research Lab'].map((benefit) => (
                <Badge key={benefit} variant="secondary" className="text-[10px] bg-[#0D7377]/10 text-[#0D7377] border-0">
                  {benefit}
                </Badge>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold h-11 shadow-md shadow-[#D4A843]/20"
                onClick={() => navigate('pricing')}
              >
                <Crown className="w-4 h-4 mr-2" />
                View Plans & Upgrade
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#0D7377]/30 text-[#0D7377] hover:bg-[#0D7377]/5 h-10"
                onClick={() => navigate('dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>

            {/* Trial info for non-expired */}
            {!isExpired && (
              <p className="text-[10px] text-muted-foreground mt-4">
                Plans start at $11/month. Cancel anytime.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ============================================================
// EXPIRED TRIAL BANNER - Persistent banner for expired users
// ============================================================

export function ExpiredTrialBanner() {
  const { navigate } = useNavStore()

  return (
    <div className="bg-[#D4A843]/10 border-b border-[#D4A843]/20 px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#D4A843] shrink-0" />
        <span className="text-sm text-[#1B3A4B]">
          <strong>Trial Expired</strong>
          <span className="text-[#1B3A4B]/50 ml-2">Upgrade to access premium features</span>
        </span>
      </div>
      <Button
        size="sm"
        className="bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold text-xs h-7 shadow-sm"
        onClick={() => navigate('pricing')}
      >
        <Crown className="w-3 h-3 mr-1" />
        Upgrade Now
      </Button>
    </div>
  )
}

// ============================================================
// CHAT RESTRICTION OVERLAY - For trial users viewing chat
// ============================================================

export function ChatRestrictionOverlay() {
  const { navigate } = useNavStore()

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-16 pb-4 px-6 z-20">
      <div className="text-center">
        <Lock className="w-6 h-6 text-[#D4A843] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#1B3A4B] mb-1">Chat messaging requires a subscription</p>
        <p className="text-xs text-muted-foreground mb-3">Upgrade to send messages and join conversations</p>
        <Button
          size="sm"
          className="bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold"
          onClick={() => navigate('pricing')}
        >
          <Crown className="w-3 h-3 mr-1" />
          Upgrade to Chat
        </Button>
      </div>
    </div>
  )
}
