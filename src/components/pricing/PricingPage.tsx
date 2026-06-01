'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check, X, Sparkles, HelpCircle, Mail,
  Zap, Shield, Globe, Users, Building2,
  Crown, GraduationCap, School, Landmark, Lock,
  Loader2, ArrowRight, CreditCard, BadgeCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { useAuthStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

// ============================================================
// PLAN DATA
// ============================================================

interface PlanFeature {
  name: string
  observer: boolean | string
  delegatePro: boolean | string
  directorPro: boolean | string
  schoolStarter: boolean | string
  schoolProfessional: boolean | string
  enterprise: boolean | string
}

const DELEGATE_PLANS = [
  {
    id: 'DELEGATE_PRO' as const,
    name: 'Delegate Pro',
    monthlyPrice: 11,
    yearlyPrice: 109,
    description: 'Full training and assessment access for individual delegates.',
    cta: 'Start Free Trial',
    icon: GraduationCap,
    features: [
      'Unlimited diagnostic assessments',
      'All training modules',
      'Conference registration',
      'Performance analytics',
      'Committee Hub access',
      'Real-time chat',
      '24-hour free trial',
    ],
    borderColor: 'border-[#0D7377]/30',
    accentColor: '#0D7377',
    popular: true,
  },
]

const DIRECTOR_PLANS = [
  {
    id: 'DIRECTOR_PRO' as const,
    name: 'Director Pro',
    monthlyPrice: 29,
    yearlyPrice: 278,
    description: 'Complete management suite for MUN directors and advisors.',
    cta: 'Start Free Trial',
    icon: Crown,
    features: [
      'All Delegate Pro features',
      'Conference Command Tools',
      'Team management',
      'Delegate progress tracking',
      'Custom assessments',
      'Export & reporting',
      'Priority support',
      '24-hour free trial',
    ],
    borderColor: 'border-[#D4A843]/30',
    accentColor: '#D4A843',
    popular: false,
  },
]

const SCHOOL_PLANS = [
  {
    id: 'SCHOOL_STARTER' as const,
    name: 'School Starter',
    monthlyPrice: 99,
    yearlyPrice: null,
    description: 'Essential tools for small MUN programs.',
    cta: 'Get Started',
    icon: School,
    maxStudents: 50,
    maxTeachers: 5,
    features: [
      'Up to 50 students',
      'Up to 5 teachers',
      'Conference management',
      'Basic analytics',
      'Email support',
    ],
    borderColor: 'border-[#0D7377]/20',
    accentColor: '#0D7377',
    popular: false,
  },
  {
    id: 'SCHOOL_PROFESSIONAL' as const,
    name: 'School Professional',
    monthlyPrice: 249,
    yearlyPrice: null,
    description: 'Advanced tools for established MUN programs.',
    cta: 'Get Started',
    icon: Building2,
    maxStudents: 200,
    maxTeachers: 20,
    features: [
      'Up to 200 students',
      'Up to 20 teachers',
      'All Starter features',
      'Advanced analytics',
      'Custom assessments',
      'Export & reporting',
      'Priority support',
    ],
    borderColor: 'border-[#D4A843]/30',
    accentColor: '#D4A843',
    popular: true,
  },
  {
    id: 'SCHOOL_ENTERPRISE' as const,
    name: 'School Enterprise',
    monthlyPrice: 0,
    yearlyPrice: null,
    description: 'Unlimited access for entire schools with dedicated support.',
    cta: 'Contact Sales',
    icon: Landmark,
    maxStudents: -1,
    maxTeachers: -1,
    features: [
      'Unlimited students & teachers',
      'All Professional features',
      'Dedicated account manager',
      'SSO & LMS integration',
      'Custom branding',
      'On-site training',
      'SLA guarantee',
      'API access',
    ],
    borderColor: 'border-[#059669]/20',
    accentColor: '#059669',
    popular: false,
  },
]

const CONFERENCE_PLANS = [
  {
    id: 'CONFERENCE_PAY_PER_EVENT' as const,
    name: 'Pay-Per-Event',
    price: 49,
    priceNote: 'one-time',
    description: 'Host a single conference with full tools.',
    cta: 'Get Started',
    icon: Zap,
    features: [
      'Single conference event',
      'Committee configuration',
      'Delegate management',
      'Real-time coordination',
      'Post-event analytics',
    ],
    borderColor: 'border-[#0D7377]/20',
    accentColor: '#0D7377',
    popular: false,
  },
  {
    id: 'CONFERENCE_ANNUAL' as const,
    name: 'Annual License',
    yearlyPrice: 399,
    priceNote: '/year',
    description: 'Unlimited conferences for one full year.',
    cta: 'Get Started',
    icon: Globe,
    features: [
      'Unlimited conferences',
      'All Pay-Per-Event features',
      'Multi-event analytics',
      'Priority support',
      'Custom templates',
      'Save $188 vs per-event',
    ],
    borderColor: 'border-[#D4A843]/30',
    accentColor: '#D4A843',
    popular: true,
  },
]

const COMPARISON_FEATURES: PlanFeature[] = [
  { name: 'Platform Access', observer: 'Basic', delegatePro: 'Full', directorPro: 'Full', schoolStarter: 'Full', schoolProfessional: 'Full', enterprise: 'Full' },
  { name: 'Diagnostic Assessments', observer: '1', delegatePro: 'Unlimited', directorPro: 'Unlimited', schoolStarter: 'Unlimited', schoolProfessional: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Training Modules', observer: '3 free', delegatePro: 'All', directorPro: 'All + Custom', schoolStarter: 'All', schoolProfessional: 'All + Custom', enterprise: 'All + Custom' },
  { name: 'Conference Directory', observer: true, delegatePro: true, directorPro: true, schoolStarter: true, schoolProfessional: true, enterprise: true },
  { name: 'Conference Registration', observer: false, delegatePro: true, directorPro: true, schoolStarter: true, schoolProfessional: true, enterprise: true },
  { name: 'Performance Analytics', observer: false, delegatePro: true, directorPro: true, schoolStarter: true, schoolProfessional: true, enterprise: true },
  { name: 'Committee Hub', observer: false, delegatePro: true, directorPro: true, schoolStarter: true, schoolProfessional: true, enterprise: true },
  { name: 'Real-time Chat', observer: false, delegatePro: true, directorPro: true, schoolStarter: true, schoolProfessional: true, enterprise: true },
  { name: 'Conference Command Tools', observer: false, delegatePro: false, directorPro: true, schoolStarter: true, schoolProfessional: true, enterprise: true },
  { name: 'Team Management', observer: false, delegatePro: false, directorPro: true, schoolStarter: true, schoolProfessional: true, enterprise: true },
  { name: 'Delegate Progress Tracking', observer: false, delegatePro: false, directorPro: true, schoolStarter: true, schoolProfessional: true, enterprise: true },
  { name: 'Custom Assessments', observer: false, delegatePro: false, directorPro: true, schoolStarter: false, schoolProfessional: true, enterprise: true },
  { name: 'Export & Reporting', observer: false, delegatePro: false, directorPro: true, schoolStarter: false, schoolProfessional: true, enterprise: true },
  { name: 'Priority Support', observer: false, delegatePro: false, directorPro: true, schoolStarter: false, schoolProfessional: true, enterprise: true },
  { name: 'Unlimited Student Seats', observer: false, delegatePro: false, directorPro: false, schoolStarter: false, schoolProfessional: false, enterprise: true },
  { name: 'Dedicated Account Manager', observer: false, delegatePro: false, directorPro: false, schoolStarter: false, schoolProfessional: false, enterprise: true },
  { name: 'SSO & LMS Integration', observer: false, delegatePro: false, directorPro: false, schoolStarter: false, schoolProfessional: false, enterprise: true },
  { name: 'Custom Branding', observer: false, delegatePro: false, directorPro: false, schoolStarter: false, schoolProfessional: false, enterprise: true },
  { name: 'On-site Training', observer: false, delegatePro: false, directorPro: false, schoolStarter: false, schoolProfessional: false, enterprise: true },
  { name: 'API Access', observer: false, delegatePro: false, directorPro: false, schoolStarter: false, schoolProfessional: false, enterprise: true },
]

const FAQ_ITEMS = [
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! Both Delegate Pro and Director Pro plans come with a 24-hour free trial. No credit card required. You get restricted access to basic features during the trial period.',
  },
  {
    question: 'Can I switch plans at any time?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, the change takes effect at the end of your current billing cycle.',
  },
  {
    question: 'What happens when my free trial ends?',
    answer: 'When your 24-hour trial ends, you\'ll be automatically moved to the free Observer plan with limited access. No charges will be made unless you explicitly choose to subscribe. We\'ll send you a reminder before your trial expires.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes, we offer a discount when you choose annual billing. Delegate Pro drops to $109/year ($9.08/month) and Director Pro to $278/year ($23.17/month).',
  },
  {
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied within the first 30 days, contact our support team for a full refund — no questions asked.',
  },
  {
    question: 'How does the School Enterprise plan work?',
    answer: 'School Enterprise provides unlimited access for your entire school. Pricing is based on school size and needs. Contact our sales team for a custom quote that includes dedicated support, training, and integration assistance.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for School Enterprise plans. All payments are processed securely through Lemon Squeezy.',
  },
  {
    question: 'Is my data secure on DiplomatiQ?',
    answer: 'Absolutely. We take data security seriously. All data is encrypted in transit and at rest. We comply with FERPA, COPPA, and GDPR regulations. Schools have full control over their data, and we never sell user information to third parties.',
  },
  {
    question: 'Can students and teachers use the same plan?',
    answer: 'Delegate Pro is designed for individual students, while Director Pro is built for teachers and MUN advisors. Schools can mix and match by purchasing School plans, which include access for all students and teachers.',
  },
  {
    question: 'What\'s the difference between Pay-Per-Event and Annual License?',
    answer: 'Pay-Per-Event lets you host a single conference for $49. The Annual License ($399/year) gives you unlimited conferences for a full year, saving you $188 if you host 9+ conferences. Both include full conference management tools.',
  },
]

// ============================================================
// FEATURE CELL
// ============================================================

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-sm text-[#1B3A4B]">{value}</span>
  }
  return value ? (
    <Check className="w-4 h-4 text-[#059669]" />
  ) : (
    <X className="w-4 h-4 text-gray-300" />
  )
}

// ============================================================
// PRICING CARD COMPONENT
// ============================================================

interface PricingCardProps {
  plan: {
    id: string
    name: string
    monthlyPrice?: number
    yearlyPrice?: number | null
    price?: number
    priceNote?: string
    description: string
    cta: string
    icon: React.ElementType
    features: string[]
    borderColor: string
    accentColor: string
    popular?: boolean
    maxStudents?: number
    maxTeachers?: number
  }
  billingPeriod: 'monthly' | 'annual'
  isCurrentPlan: boolean
  onCtaClick: (planId: string) => void
  loading: boolean
}

function PricingCard({ plan, billingPeriod, isCurrentPlan, onCtaClick, loading }: PricingCardProps) {
  const { t } = useI18n()
  const Icon = plan.icon

  // Calculate display price
  let displayPrice: string
  let displayNote: string

  if (plan.id === 'SCHOOL_ENTERPRISE') {
    displayPrice = 'Custom'
    displayNote = 'pricing'
  } else if (plan.id === 'CONFERENCE_PAY_PER_EVENT') {
    displayPrice = `$${plan.price}`
    displayNote = plan.priceNote || ''
  } else if (plan.id === 'CONFERENCE_ANNUAL') {
    displayPrice = `$${plan.yearlyPrice}`
    displayNote = plan.priceNote || ''
  } else if (billingPeriod === 'annual' && plan.yearlyPrice) {
    displayPrice = `$${plan.yearlyPrice}`
    displayNote = '/year'
  } else {
    displayPrice = `$${plan.monthlyPrice}`
    displayNote = '/month'
  }

  // Calculate savings
  let savings: string | null = null
  if (billingPeriod === 'annual' && plan.monthlyPrice && plan.yearlyPrice) {
    const monthlyAnnual = plan.monthlyPrice * 12
    const saved = monthlyAnnual - plan.yearlyPrice
    if (saved > 0) savings = `Save $${saved}`
  }
  if (plan.id === 'CONFERENCE_ANNUAL' && plan.yearlyPrice) {
    savings = 'Save $188 vs per-event'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-[#D4A843] text-[#1B3A4B] border-0 shadow-lg shadow-[#D4A843]/30 px-3">
            <Sparkles className="w-3 h-3 mr-1" /> Popular
          </Badge>
        </div>
      )}

      <Card className={`border ${plan.borderColor} ${plan.popular ? 'ring-2 ring-[#D4A843]/30 shadow-lg shadow-[#D4A843]/5' : ''} hover:shadow-xl transition-all duration-300 h-full flex flex-col`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${plan.accentColor}15` }}
            >
              <Icon className="w-4 h-4" style={{ color: plan.accentColor }} />
            </div>
            <CardTitle className="text-lg text-[#1B3A4B]">{plan.id === 'DELEGATE_PRO' ? t('pricing.delegatePro') : plan.id === 'DIRECTOR_PRO' ? t('pricing.directorPro') : plan.id === 'SCHOOL_ENTERPRISE' ? t('pricing.schoolEnterprise') : plan.name}</CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground">{plan.description}</CardDescription>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#1B3A4B]">{displayPrice}</span>
            <span className="text-muted-foreground text-sm">{displayNote}</span>
          </div>
          {savings && billingPeriod === 'annual' && (
            <Badge className="bg-[#059669]/15 text-[#059669] border-0 text-[10px] w-fit mt-1">
              {savings}
            </Badge>
          )}
          {(plan.maxStudents !== undefined && plan.maxStudents !== undefined) && plan.maxStudents > 0 && (
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] border-[#E8DED0] text-muted-foreground">
                <Users className="w-3 h-3 mr-1" /> {plan.maxStudents} students
              </Badge>
              <Badge variant="outline" className="text-[10px] border-[#E8DED0] text-muted-foreground">
                <Crown className="w-3 h-3 mr-1" /> {plan.maxTeachers} teachers
              </Badge>
            </div>
          )}
          {plan.maxStudents === -1 && (
            <Badge variant="outline" className="text-[10px] border-[#059669]/30 text-[#059669] w-fit mt-1">
              Unlimited seats
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Features list */}
          <ul className="space-y-2 mb-4 flex-1">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                <span className="text-[#1B3A4B]/80">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          {isCurrentPlan ? (
            <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 w-full justify-center py-2">
              <Check className="w-3.5 h-3.5 mr-1" /> Current Plan
            </Badge>
          ) : (
            <Button
              onClick={() => onCtaClick(plan.id)}
              disabled={loading}
              className={`w-full font-semibold ${
                plan.popular
                  ? 'bg-[#D4A843] text-[#1B3A4B] hover:bg-[#D4BA6E] shadow-md shadow-[#D4A843]/20'
                  : plan.id === 'SCHOOL_ENTERPRISE'
                  ? 'border-[#059669]/30 text-[#059669] hover:bg-[#059669]/5'
                  : 'bg-[#0D7377] text-white hover:bg-[#0A5C5F] shadow-md shadow-[#0D7377]/20'
              }`}
              variant={plan.id === 'SCHOOL_ENTERPRISE' ? 'outline' : 'default'}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                plan.id !== 'SCHOOL_ENTERPRISE' && <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {plan.id === 'SCHOOL_ENTERPRISE' ? t('pricing.contactSales') : plan.id === 'DELEGATE_PRO' || plan.id === 'DIRECTOR_PRO' ? t('pricing.startFreeTrial') : plan.cta}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// OBSERVER PLAN (FREE)
// ============================================================

function ObserverCard({ isCurrentPlan }: { isCurrentPlan: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative">
      <Card className="border-[#E8DED0]/60 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#94A3B8]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <CardTitle className="text-lg text-[#1B3A4B]">Observer</CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground">Get started with basic MUN resources and explore the platform.</CardDescription>
          <div className="mt-3">
            <span className="text-3xl font-bold text-[#1B3A4B]">Free</span>
            <span className="text-muted-foreground text-sm ml-1">forever</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ul className="space-y-2 mb-4 flex-1">
            {['Basic platform access', '1 diagnostic assessment', '3 free training modules', 'Conference directory'].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                <span className="text-[#1B3A4B]/80">{f}</span>
              </li>
            ))}
          </ul>
          {isCurrentPlan ? (
            <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 w-full justify-center py-2">
              <Check className="w-3.5 h-3.5 mr-1" /> Current Plan
            </Badge>
          ) : (
            <Button variant="outline" className="w-full font-semibold border-[#E8DED0]" disabled>
              Current Plan
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// TRUST BADGES
// ============================================================

function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5 text-[#0D7377]" />
        SSL Encrypted
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-[#0D7377]" />
        PCI Compliant
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CreditCard className="w-3.5 h-3.5 text-[#0D7377]" />
        Secure payments
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BadgeCheck className="w-3.5 h-3.5 text-[#0D7377]" />
        30-Day Money-Back
      </div>
    </div>
  )
}

// ============================================================
// MAIN PRICING PAGE
// ============================================================

export default function PricingPage() {
  const { user } = useAuthStore()
  const { t } = useI18n()
  const currentPlan = user?.subscriptionTier || 'FREE'
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleCtaClick = async (planId: string) => {
    if (planId === 'SCHOOL_ENTERPRISE') {
      // Scroll to contact sales section
      document.getElementById('contact-sales')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // If user is not authenticated, redirect to auth
    if (!user?.id) {
      alert('Please sign in or create an account to start your free trial.')
      return
    }

    setLoadingPlan(planId)

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: planId,
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.redirect) {
        document.getElementById('contact-sales')?.scrollIntoView({ behavior: 'smooth' })
      } else if (data.error) {
        alert(`Unable to start checkout: ${data.error}. Please try again or contact support.`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Checkout is being configured. Please try again later or contact support for assistance.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <Badge className="bg-[#D4A843]/15 text-[#D4A843] border-0 mb-4">
          <Sparkles className="w-3 h-3 mr-1" /> Pricing
        </Badge>
        <h2 className="text-3xl font-bold text-[#1B3A4B]">{t('pricing.title')}</h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Choose the plan that matches your MUN ambitions. Start free, upgrade as you grow. All prices in USD.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-[#1B3A4B] font-medium' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-12 h-6 bg-[#0D7377] rounded-full transition-colors"
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingPeriod === 'annual' ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm ${billingPeriod === 'annual' ? 'text-[#1B3A4B] font-medium' : 'text-muted-foreground'}`}>
            Annual <Badge className="bg-[#059669]/15 text-[#059669] border-0 text-[9px] ml-1">Save 20%</Badge>
          </span>
        </div>

        <TrustBadges />
      </motion.div>

      {/* =============================================
          INDIVIDUAL PLANS: Observer + Student + Teacher
          ============================================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-[#0D7377]" />
          <h3 className="text-xl font-semibold text-[#1B3A4B]">Individual Plans</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ObserverCard isCurrentPlan={currentPlan === 'FREE'} />
          {DELEGATE_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              isCurrentPlan={currentPlan === plan.id}
              onCtaClick={handleCtaClick}
              loading={loadingPlan === plan.id}
            />
          ))}
          {DIRECTOR_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              isCurrentPlan={currentPlan === plan.id}
              onCtaClick={handleCtaClick}
              loading={loadingPlan === plan.id}
            />
          ))}
        </div>
      </div>

      {/* =============================================
          SCHOOL PLANS
          ============================================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-[#D4A843]" />
          <h3 className="text-xl font-semibold text-[#1B3A4B]">School Plans</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SCHOOL_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              isCurrentPlan={currentPlan === plan.id}
              onCtaClick={handleCtaClick}
              loading={loadingPlan === plan.id}
            />
          ))}
        </div>
      </div>

      {/* =============================================
          CONFERENCE PACKAGES
          ============================================= */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[#0D7377]" />
          <h3 className="text-xl font-semibold text-[#1B3A4B]">Conference Packages</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          {CONFERENCE_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              isCurrentPlan={currentPlan === plan.id}
              onCtaClick={handleCtaClick}
              loading={loadingPlan === plan.id}
            />
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-[#E8DED0]/60">
          <CardHeader>
            <CardTitle className="text-xl text-[#1B3A4B]">Feature Comparison</CardTitle>
            <CardDescription>See everything that&apos;s included in each plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b-2 border-[#E8DED0]">
                    <th className="text-left py-3 px-3 font-semibold text-[#1B3A4B] w-[180px]">Feature</th>
                    <th className="text-center py-3 px-2 font-semibold text-[#94A3B8]">Observer</th>
                    <th className="text-center py-3 px-2 font-semibold text-[#0D7377]">Delegate Pro</th>
                    <th className="text-center py-3 px-2 font-semibold text-[#D4A843]">Director Pro</th>
                    <th className="text-center py-3 px-2 font-semibold text-[#0D7377]/70">Starter</th>
                    <th className="text-center py-3 px-2 font-semibold text-[#D4A843]/70">Professional</th>
                    <th className="text-center py-3 px-2 font-semibold text-[#059669]">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((feature, i) => (
                    <tr key={feature.name} className={`border-b border-[#E8DED0]/50 ${i % 2 === 0 ? 'bg-[#F5F0EB]/30' : ''}`}>
                      <td className="py-2.5 px-3 text-[#1B3A4B]/80 font-medium">{feature.name}</td>
                      <td className="py-2.5 px-2 text-center"><FeatureCell value={feature.observer} /></td>
                      <td className="py-2.5 px-2 text-center"><FeatureCell value={feature.delegatePro} /></td>
                      <td className="py-2.5 px-2 text-center"><FeatureCell value={feature.directorPro} /></td>
                      <td className="py-2.5 px-2 text-center"><FeatureCell value={feature.schoolStarter} /></td>
                      <td className="py-2.5 px-2 text-center"><FeatureCell value={feature.schoolProfessional} /></td>
                      <td className="py-2.5 px-2 text-center"><FeatureCell value={feature.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-[#E8DED0]/60">
          <CardHeader>
            <CardTitle className="text-xl text-[#1B3A4B] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#0D7377]" /> Frequently Asked Questions
            </CardTitle>
            <CardDescription>Everything you need to know about DiplomatiQ pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-[#E8DED0]/50">
                  <AccordionTrigger className="text-sm font-medium text-[#1B3A4B] hover:text-[#0D7377] hover:no-underline text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Sales CTA */}
      <motion.div id="contact-sales" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-[#059669]/20 bg-gradient-to-r from-[#1B3A4B] to-[#264B5E] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#0D7377] rounded-full opacity-[0.08] -translate-y-1/2 translate-x-1/4" />
          <CardContent className="p-8 text-center relative z-10">
            <Building2 className="w-10 h-10 text-[#D4A843] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Need a custom solution for your school?</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Our School Enterprise plan includes unlimited seats, dedicated support, and custom integrations. Get a personalized quote.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="bg-[#D4A843] text-[#1B3A4B] hover:bg-[#D4BA6E] font-semibold px-6">
                <Mail className="w-4 h-4 mr-2" /> {t('pricing.contactSales')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
