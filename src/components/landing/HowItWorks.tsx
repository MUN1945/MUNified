'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, BookOpen, Trophy, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Take the Assessment',
    description: 'Discover your unique diplomatic strengths through our AI-powered diagnostic evaluation. Get matched with the MUN role that fits you best.',
    color: '#0D7377',
    bgColor: 'bg-[#0D7377]/10',
    borderColor: 'border-[#0D7377]/30',
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Train with Purpose',
    description: 'Master your diplomatic skills with role-specific courses, practice sessions, and real-time feedback from our training platform.',
    color: '#D4A843',
    bgColor: 'bg-[#D4A843]/10',
    borderColor: 'border-[#D4A843]/30',
  },
  {
    number: '03',
    icon: Trophy,
    title: 'Lead with Confidence',
    description: 'Represent your school at conferences with confidence. Manage events, collaborate in committees, and achieve diplomatic excellence.',
    color: '#059669',
    bgColor: 'bg-[#059669]/10',
    borderColor: 'border-[#059669]/30',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-[#FFF8F0]">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#0D7377]/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#D4A843]/5 rounded-full" />
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
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A843]/10 text-[#D4A843] text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1B3A4B] tracking-tight">
            Your Journey to
            <br />
            <span className="text-[#0D7377]">Diplomatic Excellence</span>
          </h2>
          <p className="mt-4 text-lg text-[#1B3A4B]/60 leading-relaxed">
            Three steps to transform your MUN experience from uncertain to unstoppable.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line - desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0D7377]/20 via-[#D4A843]/20 to-[#059669]/20 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <div className="relative bg-white rounded-2xl border border-[#1B3A4B]/10 p-6 md:p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  {/* Step number */}
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center text-xs font-bold shadow-md"
                    style={{ borderColor: step.color, color: step.color }}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl ${step.bgColor} border ${step.borderColor} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-[#1B3A4B] mb-3">{step.title}</h3>
                  <p className="text-[#1B3A4B]/60 text-sm leading-relaxed">{step.description}</p>

                  {/* Arrow to next step (mobile) */}
                  {i < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-6">
                      <ArrowRight className="w-5 h-5 text-[#0D7377]/30 rotate-90" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
