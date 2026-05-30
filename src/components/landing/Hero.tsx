'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Globe, Handshake, Gavel } from 'lucide-react'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '50+', label: 'Schools' },
  { value: '2,000+', label: 'Delegates' },
  { value: '100+', label: 'Conferences' },
  { value: '98%', label: 'Satisfaction' },
]

const floatingIcons = [
  { Icon: Globe, x: '10%', y: '20%', delay: 0, size: 24 },
  { Icon: Handshake, x: '85%', y: '25%', delay: 0.5, size: 20 },
  { Icon: Gavel, x: '75%', y: '70%', delay: 1, size: 22 },
  { Icon: Globe, x: '15%', y: '75%', delay: 1.5, size: 18 },
  { Icon: Handshake, x: '90%', y: '55%', delay: 2, size: 16 },
  { Icon: Gavel, x: '5%', y: '50%', delay: 0.8, size: 20 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden hero-gradient">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Globe-like circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#0D7377]/15 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#0D7377]/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-[#0D7377]/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-[#D4A843]/[0.03] rounded-full" />

        {/* Glow orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0D7377] rounded-full opacity-[0.06] blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.05] blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#0D7377] rounded-full opacity-[0.04] blur-[80px]" />

        {/* Orbiting dots */}
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#D4A843]/30 rounded-full"
            style={{
              top: `${50 + 38 * Math.sin((i / 16) * Math.PI * 2)}%`,
              left: `${50 + 38 * Math.cos((i / 16) * Math.PI * 2)}%`,
            }}
            animate={{ opacity: [0.15, 0.6, 0.15] }}
            transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
          />
        ))}

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#0D7377 1px, transparent 1px), linear-gradient(90deg, #0D7377 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map(({ Icon, x, y, delay, size }, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.15, 0.3, 0.15],
              y: [0, -15, 0],
              scale: 1,
            }}
            transition={{
              opacity: { duration: 4, delay, repeat: Infinity },
              y: { duration: 5, delay, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1, delay: delay + 0.5 },
            }}
          >
            <Icon className="text-[#D4A843]/40" style={{ width: size, height: size }} />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-40 pb-16 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D7377]/15 border border-[#0D7377]/30 text-[#10908F] text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-[#0D7377] rounded-full animate-pulse" />
            Now with AI-Powered Diplomatic Assessments
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.1]"
          variants={itemVariants}
        >
          Where Model UN
          <br />
          <span className="diplomatiq-gradient-text">Meets Mastery</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          The all-in-one platform that transforms how schools train delegates,
          manage conferences, and cultivate the next generation of diplomatic leaders.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={itemVariants}
        >
          <Button
            size="lg"
            className="bg-[#0D7377] text-white hover:bg-[#10908F] font-semibold text-base px-8 h-13 shadow-lg shadow-[#0D7377]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#0D7377]/40 hover:scale-[1.02]"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 text-base px-8 h-13 transition-all duration-300 hover:border-[#D4A843]/50 hover:text-[#D4A843] group"
          >
            <Play className="w-4 h-4 mr-2 group-hover:text-[#D4A843] transition-colors" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="mt-20 md:mt-24 pt-8 border-t border-white/10"
          variants={itemVariants}
        >
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + i * 0.1 }}
              >
                <span className="text-2xl md:text-3xl font-bold text-[#D4A843]">{stat.value}</span>
                <span className="text-sm text-white/50 mt-1">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFF8F0] to-transparent" />
    </section>
  )
}
