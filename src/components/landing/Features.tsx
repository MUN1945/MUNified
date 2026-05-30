'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  GraduationCap,
  Building2,
  Users,
  BarChart3,
  Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Brain,
    title: 'Diagnostic Assessment',
    description: 'AI-powered evaluations that identify your diplomatic strengths and recommend the perfect MUN role for your skillset.',
    gradient: 'from-[#0D7377]/20 to-[#10908F]/20',
    iconColor: 'text-[#0D7377]',
    borderColor: 'hover:border-[#0D7377]/40',
    glowColor: 'group-hover:shadow-[#0D7377]/10',
  },
  {
    icon: GraduationCap,
    title: 'Diplomatic Academy',
    description: 'Role-specific training courses covering procedures, resolution writing, public speaking, and crisis management.',
    gradient: 'from-[#D4A843]/20 to-[#E2C06A]/20',
    iconColor: 'text-[#D4A843]',
    borderColor: 'hover:border-[#D4A843]/40',
    glowColor: 'group-hover:shadow-[#D4A843]/10',
  },
  {
    icon: Building2,
    title: 'Conference Command',
    description: 'Full event management system — from delegate registration and committee assignments to voting and awards.',
    gradient: 'from-[#059669]/20 to-[#34D399]/20',
    iconColor: 'text-[#059669]',
    borderColor: 'hover:border-[#059669]/40',
    glowColor: 'group-hover:shadow-[#059669]/10',
  },
  {
    icon: Users,
    title: 'Committee Hub',
    description: 'Real-time collaboration tools for delegates to draft resolutions, caucus, and coordinate strategies together.',
    gradient: 'from-[#1B3A4B]/20 to-[#254D63]/20',
    iconColor: 'text-[#254D63]',
    borderColor: 'hover:border-[#1B3A4B]/40',
    glowColor: 'group-hover:shadow-[#1B3A4B]/10',
  },
  {
    icon: BarChart3,
    title: 'Intelligence Dashboard',
    description: 'Comprehensive analytics and insights on delegate performance, training progress, and conference outcomes.',
    gradient: 'from-[#0D7377]/20 to-[#059669]/20',
    iconColor: 'text-[#0D7377]',
    borderColor: 'hover:border-[#0D7377]/40',
    glowColor: 'group-hover:shadow-[#0D7377]/10',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Connect with schools and delegates worldwide, discover conferences, and build international diplomatic relationships.',
    gradient: 'from-[#D4A843]/20 to-[#0D7377]/20',
    iconColor: 'text-[#D4A843]',
    borderColor: 'hover:border-[#D4A843]/40',
    glowColor: 'group-hover:shadow-[#D4A843]/10',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32 bg-[#FFF8F0]">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0D7377] rounded-full opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.03] blur-[120px]" />
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
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D7377]/10 text-[#0D7377] text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1B3A4B] tracking-tight">
            Everything Your MUN Program Needs
          </h2>
          <p className="mt-4 text-lg text-[#1B3A4B]/60 leading-relaxed">
            From diagnostic assessments to global networking, DiplomatiQ provides the complete ecosystem
            for diplomatic excellence.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card
                className={`group bg-white border-[#1B3A4B]/10 ${feature.borderColor} hover:shadow-xl ${feature.glowColor} transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full`}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#1B3A4B] group-hover:text-[#0D7377] transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#1B3A4B]/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
