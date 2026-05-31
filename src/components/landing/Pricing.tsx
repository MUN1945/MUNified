'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const plans = [
  {
    name: 'Observer',
    price: 'Free',
    priceNote: 'forever',
    description: 'Get started with basic MUN resources and explore the platform.',
    features: [
      'Basic platform access',
      '1 diagnostic assessment',
      'Limited training modules',
      'Community forum access',
      'Conference directory',
    ],
    cta: 'Get Started',
    ctaVariant: 'outline' as const,
    popular: false,
    borderColor: 'border-[#1B3A4B]/10',
    hoverBorder: 'hover:border-[#1B3A4B]/30',
    accentColor: '#1B3A4B',
  },
  {
    name: 'Delegate Pro',
    price: '$9',
    priceNote: '/month',
    description: 'Full training and assessment access for individual delegates.',
    features: [
      'Everything in Observer',
      'Unlimited assessments',
      'Full Diplomatic Academy access',
      'Committee Hub collaboration',
      'Performance analytics',
      'Real-time chat support',
      'Conference registration',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
    popular: true,
    borderColor: 'border-[#0D7377]/30',
    hoverBorder: 'hover:border-[#0D7377]/60',
    accentColor: '#0D7377',
  },
  {
    name: 'Director Pro',
    price: '$29',
    priceNote: '/month',
    description: 'Complete management suite for MUN directors and advisors.',
    features: [
      'Everything in Delegate Pro',
      'Conference Command tools',
      'Intelligence Dashboard',
      'Team management',
      'Delegate progress tracking',
      'Custom assessments',
      'Priority support',
      'Export & reporting',
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
    popular: false,
    borderColor: 'border-[#D4A843]/30',
    hoverBorder: 'hover:border-[#D4A843]/60',
    accentColor: '#D4A843',
  },
  {
    name: 'School Enterprise',
    price: 'Custom',
    priceNote: 'pricing',
    description: 'Unlimited access for entire schools with dedicated support.',
    features: [
      'Everything in Director Pro',
      'Unlimited student seats',
      'Dedicated account manager',
      'SSO & LMS integration',
      'Custom branding',
      'On-site training',
      'SLA guarantee',
      'API access',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
    popular: false,
    borderColor: 'border-[#1B3A4B]/10',
    hoverBorder: 'hover:border-[#059669]/40',
    accentColor: '#059669',
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-[#1B3A4B]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0D7377] rounded-full opacity-[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A843]/15 text-[#D4A843] text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Invest in Diplomatic Excellence
          </h2>
          <p className="mt-4 text-lg text-white/65 leading-relaxed">
            Choose the plan that matches your MUN ambitions. Start free, upgrade as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-[#0D7377] text-white border-0 shadow-lg shadow-[#0D7377]/30 px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`bg-white/[0.06] backdrop-blur-sm border ${plan.borderColor} ${plan.hoverBorder} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col ${
                  plan.popular ? 'ring-2 ring-[#0D7377]/50 shadow-lg shadow-[#0D7377]/10' : ''
                }`}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                  <CardDescription className="text-white/55 text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/55 text-sm ml-1">{plan.priceNote}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className="w-4 h-4 mt-0.5 shrink-0"
                          style={{ color: plan.accentColor }}
                        />
                        <span className="text-white/65">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <a href="/auth/register">
                      <Button
                        variant={plan.ctaVariant}
                        className={`w-full font-semibold transition-all duration-300 ${
                          plan.popular
                            ? 'bg-[#0D7377] text-white hover:bg-[#10908F] shadow-md shadow-[#0D7377]/30'
                            : plan.ctaVariant === 'outline'
                            ? 'border-white/20 text-white hover:bg-white/10 hover:text-white'
                            : ''
                        }`}
                        style={
                          !plan.popular && plan.ctaVariant === 'default'
                            ? { backgroundColor: plan.accentColor }
                            : undefined
                        }
                      >
                        {plan.cta}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
