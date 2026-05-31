'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Globe, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const reasons = [
  {
    title: 'Purpose-Built for MUN',
    desc: 'Every feature is designed around how Model United Nations actually works — from delegate prep to committee voting.',
  },
  {
    title: 'AI That Understands Diplomacy',
    desc: 'Our assessment engine evaluates real diplomatic competencies, not just quiz answers. Get actionable feedback that improves performance.',
  },
  {
    title: 'One Platform, Zero Fragmentation',
    desc: 'Replace scattered spreadsheets, group chats, and paper forms with one integrated system for training, conferences, and analytics.',
  },
]

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 bg-[#FAFBFC]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-[#0D7377] rounded-full opacity-[0.03] blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-[#D4A843] rounded-full opacity-[0.03] blur-[100px]" />
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
            <Sparkles className="w-4 h-4" />
            Join the Community
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0D1B2A] tracking-tight">
            Why Teams Choose <span className="text-[#D4A843]">DiplomatiQ</span>
          </h2>
          <p className="mt-4 text-lg text-[#0D1B2A]/60 leading-relaxed">
            Schools and delegates around the world trust DiplomatiQ to elevate their MUN experience.
          </p>
        </motion.div>

        {/* Reason Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Card className="bg-white border-[#1B3A4B]/10 hover:border-[#0D7377]/30 hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#0D7377]/10 flex items-center justify-center mb-4">
                    <Globe className="w-5 h-5 text-[#0D7377]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1B3A4B] mb-2 group-hover:text-[#0D7377] transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-[#1B3A4B]/60 text-sm leading-relaxed flex-1">
                    {reason.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-[#1B3A4B] to-[#0D1B2A] rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Elevate Your MUN Program?
            </h3>
            <p className="text-white/65 mb-6 max-w-lg mx-auto">
              Join thousands of delegates and educators who are transforming their MUN experience with DiplomatiQ.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-[#D4A843] text-[#1B3A4B] hover:bg-[#C49B38] font-semibold px-8 shadow-lg shadow-[#D4A843]/20 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-white/55">No credit card required · 24-hour free trial · Cancel anytime</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
