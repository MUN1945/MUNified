'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Globe, GraduationCap, Brain, Building2, Trophy,
  ArrowRight, Shield, Users, Target, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const VALUES = [
  {
    icon: Shield,
    title: 'Diplomacy',
    description: 'We believe in the power of dialogue, negotiation, and peaceful resolution — the very principles the United Nations was founded upon.',
  },
  {
    icon: Target,
    title: 'Leadership',
    description: 'We cultivate leaders who can navigate complexity, build consensus, and inspire action in the face of global challenges.',
  },
  {
    icon: Heart,
    title: 'Sustainability',
    description: 'Aligned with the UAE\'s vision for a sustainable future, we embed the Sustainable Development Goals into every aspect of our platform.',
  },
]

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Assessments',
    description: 'A 7-tier progressive competency framework that identifies your diplomatic ceiling and charts your growth path.',
  },
  {
    icon: GraduationCap,
    title: 'DiplomatiQ Academy',
    description: '8 immersive courses and 40+ lessons researched and written by MUN veterans covering every aspect of diplomatic education.',
  },
  {
    icon: Building2,
    title: 'Conference Management',
    description: 'End-to-end conference management — registrations, committees, delegates, and voting — all in one platform.',
  },
  {
    icon: Trophy,
    title: 'Gamified Progress',
    description: 'Earn XP, unlock badges, and climb from Observer to Secretary-General as you develop your diplomatic skills.',
  },
  {
    icon: Users,
    title: 'School Directory',
    description: 'A verified UAE and GCC school directory to connect your MUN program and track your school\'s diplomatic impact.',
  },
  {
    icon: Globe,
    title: 'Research Lab',
    description: 'AI-powered research paper evaluation with originality detection, citation analysis, and improvement roadmaps.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#1B3A4B]">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0D7377] flex items-center justify-center shadow-md shadow-[#0D7377]/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1B3A4B]">
              Diplomati<span className="text-[#D4A843]">Q</span>
            </span>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-[#0D7377] text-white hover:bg-[#0A5F63] font-semibold shadow-md shadow-[#0D7377]/20">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D7377]/[0.03] via-white to-[#D4A843]/[0.03]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#D4A843] rounded-full opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#0D7377] rounded-full opacity-[0.04] blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D7377]/10 border border-[#0D7377]/20 text-[#0D7377] text-sm font-medium mb-6">
              <Globe className="w-4 h-4" /> About DiplomatiQ
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1B3A4B] leading-[1.1]">
              Building the Next Generation of{' '}
              <span className="text-[#0D7377]">Diplomats</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#1B3A4B]/70 leading-relaxed max-w-2xl mx-auto">
              DiplomatiQ is the all-in-one platform for Model United Nations — empowering students, educators, and institutions with AI-powered tools for training, assessment, and conference management.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-[#D4A843] text-[#1B3A4B] hover:bg-[#E0BC6A] font-semibold px-8 h-12 shadow-lg shadow-[#D4A843]/20">
                  Join DiplomatiQ <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="/#features">
                <Button size="lg" variant="outline" className="border-[#0D7377]/30 text-[#0D7377] hover:bg-[#0D7377]/5 font-semibold px-8 h-12">
                  Explore Features
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B3A4B] tracking-tight">
              Our Mission
            </h2>
            <p className="mt-6 text-lg text-[#1B3A4B]/70 leading-relaxed">
              DiplomatiQ exists to transform how Model United Nations is taught, practiced, and experienced. We believe that every student deserves access to world-class diplomatic education — regardless of their school&apos;s resources, location, or MUN program size.
            </p>
            <p className="mt-4 text-lg text-[#1B3A4B]/70 leading-relaxed">
              Rooted in the <span className="font-semibold text-[#0D7377]">United Arab Emirates</span>, our platform is built with the national values of diplomacy, leadership, tolerance, and sustainability at its core. We align with the UAE&apos;s vision for youth empowerment, global engagement, and the Sustainable Development Goals — preparing young leaders to represent their nations and their future with confidence and integrity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B3A4B] tracking-tight">
              Values That Guide Us
            </h2>
            <p className="mt-4 text-[#1B3A4B]/70 text-lg max-w-xl mx-auto">
              Aligned with the UAE&apos;s national vision and the principles of the United Nations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="border-gray-100 hover:border-[#0D7377]/20 hover:shadow-lg hover:shadow-[#0D7377]/5 transition-all duration-300 h-full">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="w-12 h-12 rounded-xl bg-[#0D7377]/10 flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-[#0D7377]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1B3A4B] mb-3">{value.title}</h3>
                    <p className="text-[#1B3A4B]/70 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B3A4B] tracking-tight">
              What We Built
            </h2>
            <p className="mt-4 text-[#1B3A4B]/70 text-lg max-w-xl mx-auto">
              Six integrated modules designed for the complete diplomatic education lifecycle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="border-gray-100 hover:border-[#D4A843]/20 hover:shadow-lg hover:shadow-[#D4A843]/5 transition-all duration-300 h-full">
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="w-10 h-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-5 h-5 text-[#D4A843]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B3A4B] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#1B3A4B]/70 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* UAE-Focused Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-[#0D7377]/[0.05] to-[#D4A843]/[0.05] rounded-2xl p-8 md:p-12 border border-[#0D7377]/10">
              <h2 className="text-3xl md:text-4xl font-bold text-[#1B3A4B] tracking-tight mb-6">
                Proudly Built in the <span className="text-[#0D7377]">UAE</span>
              </h2>
              <div className="space-y-4 text-[#1B3A4B]/70 leading-relaxed">
                <p>
                  The United Arab Emirates has long been a beacon of diplomacy, tolerance, and international cooperation — hosting the UN Climate Change Conference (COP28), serving on the UN Security Council, and championing youth empowerment through global dialogue.
                </p>
                <p>
                  DiplomatiQ is built to carry that legacy forward. Our platform is designed with the UAE&apos;s national values at its core: <span className="font-semibold text-[#0D7377]">respect for cultural diversity</span>, commitment to <span className="font-semibold text-[#0D7377]">sustainable development</span>, and the belief that <span className="font-semibold text-[#0D7377]">young people are the architects of a more peaceful world</span>.
                </p>
                <p>
                  We serve schools across the Emirates and the wider GCC region, providing students with the tools, training, and assessment they need to become confident, capable, and ethical diplomatic leaders.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0D7377] to-[#0A5F63]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ready to Begin Your Diplomatic Journey?
            </h2>
            <p className="mt-4 text-white/75 text-lg max-w-xl mx-auto">
              Join a growing community of MUN delegates and educators across the UAE and GCC.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-[#D4A843] text-[#1B3A4B] hover:bg-[#E0BC6A] font-semibold px-8 h-12 shadow-lg shadow-[#D4A843]/30">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="/#pricing">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12">
                  View Pricing
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F2530] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#D4A843]" />
              <span className="text-sm font-bold">
                Diplomati<span className="text-[#D4A843]">Q</span>
              </span>
            </Link>
            <p className="text-xs text-white/50">
              &copy; {new Date().getFullYear()} DiplomatiQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
