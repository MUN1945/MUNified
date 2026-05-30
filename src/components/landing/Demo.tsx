'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Users, Brain, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const highlights = [
  { icon: Brain, label: 'AI Assessment Engine', desc: 'Real-time skill evaluation' },
  { icon: BarChart3, label: 'Intelligence Dashboard', desc: 'Performance analytics' },
  { icon: Users, label: 'Committee Hub', desc: 'Live collaboration' },
]

const features = [
  '10-skill diagnostic assessment',
  'Personalized learning paths',
  'Real-time delegate performance tracking',
  'Conference management dashboard',
  'Resolution drafting & collaboration',
  'Global delegate network',
]

export default function Demo() {
  return (
    <section id="demo" className="relative py-24 md:py-32 bg-[#FFF8F0]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0D7377] rounded-full opacity-[0.03] blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D7377]/10 text-[#0D7377] text-sm font-medium mb-4">
            Live Preview
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1B3A4B] tracking-tight">
            Experience <span className="text-[#0A7E8C]">DiplomatiQ</span>
          </h2>
          <p className="mt-4 text-lg text-[#1B3A4B]/60 leading-relaxed">
            See how DiplomatiQ brings together assessment, training, and conference management in one powerful platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Mock Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              {/* Dashboard mockup */}
              <div className="bg-[#1B3A4B] rounded-2xl border border-[#0D7377]/20 shadow-2xl shadow-[#1B3A4B]/30 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0F2530] border-b border-[#0D7377]/20">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="ml-3 text-xs text-white/30">app.diplomatiq.io/dashboard</span>
                </div>

                {/* Dashboard content mock */}
                <div className="p-6 space-y-4">
                  {/* Top bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm">Welcome back, Sarah</div>
                      <div className="text-white/40 text-xs">Ambassador Level · 2,450 XP</div>
                    </div>
                    <Badge className="bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30 text-[10px]">
                      Director Pro
                    </Badge>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Conferences', value: '8', color: 'text-[#0D7377]' },
                      { label: 'Delegates', value: '34', color: 'text-[#D4A843]' },
                      { label: 'Avg. Score', value: '87%', color: 'text-[#059669]' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/[0.06] rounded-xl p-3 text-center border border-white/[0.06]">
                        <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-white/40 text-[10px]">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-3">
                    {[
                      { label: 'Resolution Writing', pct: 78 },
                      { label: 'Public Speaking', pct: 65 },
                      { label: 'Diplomatic Procedures', pct: 92 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/50">{item.label}</span>
                          <span className="text-white/40">{item.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#0D7377] to-[#10908F] rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity */}
                  <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                    <div className="text-white/60 text-xs font-medium mb-2">Recent Activity</div>
                    <div className="space-y-2">
                      {[
                        'Completed "Crisis Management 101"',
                        'New delegate joined: Omar K.',
                        'Conference registration confirmed',
                      ].map((activity, j) => (
                        <div key={j} className="flex items-center gap-2 text-[11px] text-white/40">
                          <CheckCircle2 className="w-3 h-3 text-[#059669] shrink-0" />
                          {activity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Annotation badges */}
              {highlights.map((hl, i) => (
                <motion.div
                  key={hl.label}
                  className={`absolute ${
                    i === 0 ? '-right-2 top-8' : i === 1 ? '-right-2 top-1/3' : '-left-2 bottom-16'
                  } hidden lg:flex`}
                  initial={{ opacity: 0, x: i < 2 ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.2 }}
                >
                  <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg border border-[#0D7377]/10 px-3 py-2">
                    <hl.icon className="w-4 h-4 text-[#0D7377]" />
                    <div>
                      <div className="text-xs font-semibold text-[#1B3A4B]">{hl.label}</div>
                      <div className="text-[10px] text-[#1B3A4B]/50">{hl.desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature list & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-[#1B3A4B] mb-4">
              Your diplomatic command center
            </h3>
            <p className="text-[#1B3A4B]/60 leading-relaxed mb-8">
              DiplomatiQ brings everything together — assessments, training, conference management,
              and analytics — into one seamless platform designed for the way MUN actually works.
            </p>

            <ul className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <motion.li
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#0D7377]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0D7377]" />
                  </div>
                  <span className="text-[#1B3A4B]/70 text-sm">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Button
              size="lg"
              className="bg-[#0D7377] text-white hover:bg-[#10908F] font-semibold px-8 shadow-lg shadow-[#0D7377]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#0D7377]/30"
            >
              Try It Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="mt-3 text-xs text-[#1B3A4B]/40">No credit card required · 14-day free trial</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
