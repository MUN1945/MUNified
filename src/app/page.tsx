'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Globe, Award, Users, BarChart3, MessageSquare,
  Star, Trophy, Target, Shield, GraduationCap, Crown,
  Landmark, Gavel, FileSearch, Brain, Building2,
  Heart, ArrowRight, CheckCircle2, Menu, X,
  Layers, Cpu, LucideIcon, ArrowUpRight,
  FileText, Mic, BookOpen, Scale, Siren, Handshake, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/lib/store'

// ============================================================
// TYPES & CONSTANTS
// ============================================================

// Page type removed — now using proper Next.js routes

const ASSESSMENT_TIERS = [
  { name: 'Basic Delegate', tier: 1, color: '#94A3B8', icon: Users, desc: 'Foundation of MUN knowledge — procedures, etiquette, and committee basics.' },
  { name: 'Advanced Delegate', tier: 2, color: '#60A5FA', icon: MessageSquare, desc: 'Competent in debate, resolution drafting, and collaborative negotiation.' },
  { name: 'Committee Leader', tier: 3, color: '#0A7E8C', icon: Target, desc: 'Leadership readiness — caucusing, coalition-building, and strategic influence.' },
  { name: 'Chair', tier: 4, color: '#D4A843', icon: Gavel, desc: 'Mastery of procedure — moderating debate, ruling on points, and guiding committees.' },
  { name: 'Under-Secretary-General', tier: 5, color: '#A78BFA', icon: Shield, desc: 'Strategic oversight — managing multiple committees and crisis response.' },
  { name: 'Deputy Secretary-General', tier: 6, color: '#F59E0B', icon: Crown, desc: 'Executive coordination — conference logistics, delegate welfare, and program integrity.' },
  { name: 'Secretary-General', tier: 7, color: '#EF4444', icon: Star, desc: 'The pinnacle — visionary leadership, institutional judgment, and diplomatic authority.' },
]

// ============================================================
// ANIMATED BACKGROUND COMPONENTS
// ============================================================

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* UN background image — proper fixed attachment */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/un-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.15,
        }}
      />
      {/* Dark navy overlay for readability — ensures 4.5:1+ contrast ratio */}
      <div className="absolute inset-0 bg-[#0D1B2A]/[0.92]" />
      {/* Deep navy base with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A] via-[#0F2030] to-[#0D1B2A]" />

      {/* Concentric globe circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="absolute w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 border border-[#D4A843]/[0.07] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 border border-[#D4A843]/[0.05] rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 border border-[#D4A843]/[0.03] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[1100px] h-[1100px] -translate-x-1/2 -translate-y-1/2 border border-[#D4A843]/[0.02] rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 300, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Cross lines on globe circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="absolute w-[700px] h-[1px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#D4A843]/[0.04] to-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute w-[1px] h-[700px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#D4A843]/[0.04] to-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4A843] rounded-full opacity-[0.04] blur-[120px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.03] blur-[150px]" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#0A7E8C] rounded-full opacity-[0.04] blur-[100px]" />

      {/* Gold floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-[#D4A843]"
          style={{
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
            y: [0, -20 - Math.random() * 30, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            delay: Math.random() * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Laurel pattern hints — subtle arcs */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.02]" viewBox="0 0 800 800">
        <path d="M400 100 C 200 200, 100 400, 100 600" stroke="#D4A843" fill="none" strokeWidth="1.5" />
        <path d="M400 100 C 600 200, 700 400, 700 600" stroke="#D4A843" fill="none" strokeWidth="1.5" />
        <path d="M150 350 C 200 300, 250 280, 300 270" stroke="#D4A843" fill="none" strokeWidth="1" />
        <path d="M650 350 C 600 300, 550 280, 500 270" stroke="#D4A843" fill="none" strokeWidth="1" />
      </svg>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(#D4A843 1px, transparent 1px), linear-gradient(90deg, #D4A843 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}

// ============================================================
// NAVIGATION BAR
// ============================================================

function Navbar({ onGetStarted, onSignIn }: { onGetStarted: () => void; onSignIn: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Assessment', href: '#assessment' },
    { label: 'Training', href: '#training' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Schools', href: '#schools' },
  ]

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0D1B2A]/95 backdrop-blur-xl border-b border-[#D4A843]/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <img src="/logo.svg" alt="DiplomatiQ" className="w-9 h-9 rounded-lg group-hover:opacity-90 transition-opacity shadow-md shadow-[#D4A843]/20" />
          <span className="text-xl font-bold tracking-tight text-white">
            Diplomati<span className="text-[#D4A843]">Q</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 text-sm text-white/60 hover:text-[#D4A843] transition-all duration-200 rounded-lg hover:bg-white/[0.04]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 font-medium"
            onClick={onSignIn}
          >
            Sign In
          </Button>
          <Button
            className="bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold shadow-md shadow-[#D4A843]/20 transition-all duration-200"
            onClick={onGetStarted}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white/80 hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-[#0D1B2A]/98 backdrop-blur-xl border-t border-[#D4A843]/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-3 text-white/70 hover:text-[#D4A843] hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <Button variant="ghost" className="w-full text-white/80 hover:text-white hover:bg-white/10 justify-center" onClick={() => { onSignIn(); setMobileOpen(false) }}>
                  Sign In
                </Button>
                <Button className="w-full bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold" onClick={() => { onGetStarted(); setMobileOpen(false) }}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

// ============================================================
// HERO SECTION
// ============================================================

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <HeroBackground />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 md:pt-40 pb-16 text-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
        }}
      >
        {/* Badge */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
          }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4A843]/10 border border-[#D4A843]/20 text-[#D4A843] text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-[#D4A843] rounded-full animate-pulse" />
            AI-Powered Diplomatic Assessments
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.08]"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
          }}
        >
          The Operating System
          <br />
          for <span className="text-[#D4A843]">Model United Nations</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
          }}
        >
          AI-powered assessments, immersive training, conference management, and gamified achievements — building the next generation of diplomats.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
          }}
        >
          <Button
            size="lg"
            className="bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold text-base px-8 h-13 shadow-lg shadow-[#D4A843]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4A843]/35 hover:scale-[1.02]"
            onClick={onGetStarted}
          >
            Begin Your Journey
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <a href="/auth/register?role=SCHOOL_ADMIN">
            <Button
              size="lg"
              variant="outline"
              className="border-[#D4A843]/40 text-[#D4A843] hover:bg-[#D4A843]/10 hover:border-[#D4A843]/60 text-base px-8 h-13 transition-all duration-300 bg-[#D4A843]/[0.06]"
            >
              For Schools
            </Button>
          </a>
        </motion.div>

        {/* Community Banner */}
        <motion.div
          className="mt-20 md:mt-24 pt-8 border-t border-white/[0.06]"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.8, delay: 0.6 } },
          }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#D4A843]/[0.08] border border-[#D4A843]/15">
            <Globe className="w-5 h-5 text-[#D4A843]/70" />
            <span className="text-sm text-white/75">Join schools across the <span className="text-[#D4A843] font-semibold">UAE and GCC</span></span>
          </div>
          <p className="text-white/60 text-sm mt-4">Growing community of MUN delegates and educators.</p>
          <a href="#features" className="inline-block mt-3 text-xs text-[#0A7E8C] hover:text-[#0FBACA] transition-colors font-medium">
            Explore the Platform <ArrowRight className="w-3 h-3 inline ml-0.5" />
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D1B2A] to-transparent" />
    </section>
  )
}

// ============================================================
// FEATURES GRID
// ============================================================

function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const features: { icon: LucideIcon; title: string; desc: string; gradient: string }[] = [
    {
      icon: Brain,
      title: 'AI-Powered Assessments',
      desc: '7-tier progressive competency framework that identifies your diplomatic ceiling — from Basic Delegate to Secretary-General. Not a quiz. A pathway.',
      gradient: 'from-violet-500/20 to-purple-600/20',
    },
    {
      icon: GraduationCap,
      title: 'DiplomatiQ Academy',
      desc: '8 immersive courses, 40+ lessons researched and written by MUN veterans. From parliamentary procedure to crisis committee survival. Content that passes scrutiny.',
      gradient: 'from-[#D4A843]/20 to-amber-600/20',
    },
    {
      icon: Building2,
      title: 'Conference Command',
      desc: 'Manage registrations, committees, delegates, and voting — all in one platform. Built for Secretariats who refuse to use spreadsheets.',
      gradient: 'from-[#0A7E8C]/20 to-teal-600/20',
    },
    {
      icon: FileSearch,
      title: 'Research Lab',
      desc: 'AI-powered research paper evaluation with originality detection, citation analysis, and improvement roadmaps. Responsible AI assistance, not prohibition.',
      gradient: 'from-blue-500/20 to-cyan-600/20',
    },
    {
      icon: Trophy,
      title: 'Gamified Progress',
      desc: 'Earn XP, unlock badges, climb from Observer to Secretary-General. Every speech, resolution, and negotiation earns you recognition.',
      gradient: 'from-emerald-500/20 to-green-600/20',
    },
    {
      icon: Landmark,
      title: 'School Directory',
      desc: 'Verified UAE and GCC school directory. Find your institution, connect your program, and track your school\'s diplomatic impact.',
      gradient: 'from-rose-500/20 to-orange-600/20',
    },
  ]

  return (
    <section id="features" className="relative py-24 md:py-32 bg-[#0D1B2A]" ref={ref}>
      {/* Subtle section divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4 bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/20 hover:bg-[#D4A843]/15">
            <Layers className="w-3 h-3 mr-1" /> Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Everything Your MUN Program Needs
          </h2>
          <p className="mt-4 text-white/65 text-lg max-w-2xl mx-auto">
            Six integrated modules designed for the complete diplomatic education lifecycle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] hover:border-[#D4A843]/20 transition-all duration-500 group cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-[#D4A843]" />
                  </div>
                  <CardTitle className="text-white text-lg font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// ASSESSMENT SHOWCASE
// ============================================================

function AssessmentShowcase({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="assessment" className="relative py-24 md:py-32 bg-[#0A1525]" ref={ref}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4 bg-[#0A7E8C]/15 text-[#0A7E8C] border-[#0A7E8C]/25 hover:bg-[#0A7E8C]/20">
            <Cpu className="w-3 h-3 mr-1" /> 7-Tier Framework
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Progressive Assessment System
          </h2>
          <p className="mt-4 text-white/65 text-lg max-w-2xl mx-auto">
            From foundation to pinnacle — each tier unlocks new competencies and challenges. Discover where you stand and where you can grow.
          </p>
        </motion.div>

        {/* Tier Pyramid */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-1.5 md:space-y-2.5">
            {ASSESSMENT_TIERS.slice().reverse().map((tier, i) => {
              // Width progression: top tier is narrowest, bottom is widest — pyramid shape
              const widthPercent = tier.tier === 7 ? 40 : tier.tier === 6 ? 50 : tier.tier === 5 ? 60 : tier.tier === 4 ? 70 : tier.tier === 3 ? 80 : tier.tier === 2 ? 90 : 100
              const TierIcon = tier.icon
              const isTopTier = tier.tier === 7
              const isHighTier = tier.tier >= 5
              // Scale icon sizes progressively
              const iconSize = isTopTier ? 'w-11 h-11' : isHighTier ? 'w-10 h-10' : 'w-9 h-9'
              const innerIconSize = isTopTier ? 'w-5.5 h-5.5' : isHighTier ? 'w-5 h-5' : 'w-4 h-4'
              // Color saturation increases going up
              const bgOpacity = isTopTier ? '15' : isHighTier ? '10' : '06'
              const borderOpacity = isTopTier ? '40' : isHighTier ? '30' : '20'
              const iconBgOpacity = isTopTier ? '30' : isHighTier ? '22' : '15'
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                  className="flex items-center justify-center"
                >
                  <div className="relative group cursor-pointer" style={{ width: `${widthPercent}%` }}>
                    <div
                      className={`flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl border transition-all duration-300 group-hover:scale-[1.015] group-hover:shadow-lg ${isTopTier ? 'ring-2 ring-[#D4A843]/25' : ''}`}
                      style={{
                        backgroundColor: `${tier.color}${bgOpacity}`,
                        borderColor: `${tier.color}${borderOpacity}`,
                      }}
                    >
                      {/* Glow pulse for top tier */}
                      {isInView && isTopTier && (
                        <motion.div
                          className="absolute -inset-px rounded-xl pointer-events-none"
                          style={{ boxShadow: `0 0 25px ${tier.color}25, 0 0 50px ${tier.color}10` }}
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <div
                        className={`${iconSize} rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}
                        style={{ backgroundColor: `${tier.color}${iconBgOpacity}` }}
                      >
                        <TierIcon className={innerIconSize} style={{ color: tier.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] md:text-xs font-mono font-bold tracking-wider" style={{ color: tier.color }}>
                            T{tier.tier}
                          </span>
                          <span className={`text-sm font-semibold ${isTopTier ? 'text-white' : 'text-white/90'}`}>{tier.name}</span>
                          {isTopTier && (
                            <motion.span
                              animate={{ rotate: [0, 15, -15, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                            >
                              <Star className="w-4 h-4 text-[#D4A843] fill-[#D4A843]/50" />
                            </motion.span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 hidden sm:block ${isTopTier ? 'text-white/65' : 'text-white/50'} sm:truncate`}>{tier.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Button
              size="lg"
              className="bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold px-8 h-12 shadow-lg shadow-[#D4A843]/20"
              onClick={onGetStarted}
            >
              Discover Your Diplomatic Ceiling
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// TRAINING SECTION
// ============================================================

const TRAINING_COURSES = [
  {
    title: 'Parliamentary Procedure & Robert\'s Rules',
    difficulty: 'Beginner',
    icon: Gavel,
    desc: 'Master the rules of order, motions, and debate procedures that govern every MUN committee session.',
    duration: '4 hours',
    color: '#0A7E8C',
  },
  {
    title: 'Resolution Writing Workshop',
    difficulty: 'Intermediate',
    icon: FileText,
    desc: 'Learn to draft, format, and amend resolutions that persuade committees and attract sponsors.',
    duration: '5 hours',
    color: '#D4A843',
  },
  {
    title: 'Crisis Committee Protocols',
    difficulty: 'Advanced',
    icon: Siren,
    desc: 'Navigate fast-paced crisis scenarios with improvisation, directive writing, and real-time decision-making.',
    duration: '6 hours',
    color: '#EF4444',
  },
  {
    title: 'Diplomatic Negotiation Strategies',
    difficulty: 'Intermediate',
    icon: Handshake,
    desc: 'Build coalitions, manage blocs, and negotiate win-win outcomes across diverse delegations.',
    duration: '4.5 hours',
    color: '#D4A843',
  },
  {
    title: 'Public Speaking & Oratory Skills',
    difficulty: 'Intermediate',
    icon: Mic,
    desc: 'Develop commanding presence, persuasive rhetoric, and confident delivery for committee speeches.',
    duration: '3.5 hours',
    color: '#D4A843',
  },
  {
    title: 'Research & Position Paper Writing',
    difficulty: 'Beginner',
    icon: BookOpen,
    desc: 'Conduct credible research, evaluate sources, and write position papers that demonstrate expertise.',
    duration: '5 hours',
    color: '#0A7E8C',
  },
  {
    title: 'Committee Chair Training',
    difficulty: 'Advanced',
    icon: Scale,
    desc: 'Lead committee sessions with authority: manage debate flow, rule on points, and maintain decorum.',
    duration: '6.5 hours',
    color: '#EF4444',
  },
  {
    title: 'Secretary-General Leadership Program',
    difficulty: 'Advanced',
    icon: Crown,
    desc: 'Executive leadership: oversee conferences, manage secretariat teams, and set the strategic vision.',
    duration: '8 hours',
    color: '#EF4444',
  },
]

function TrainingSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const difficultyBadge = (difficulty: string) => {
    const config: Record<string, string> = {
      Beginner: 'bg-[#0A7E8C]/15 text-[#0A7E8C] border-[#0A7E8C]/25',
      Intermediate: 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/25',
      Advanced: 'bg-red-500/15 text-red-400 border-red-500/25',
    }
    return config[difficulty] || config.Beginner
  }

  return (
    <section id="training" className="relative py-24 md:py-32 bg-[#0D1B2A]" ref={ref}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4 bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/20 hover:bg-[#D4A843]/15">
            <GraduationCap className="w-3 h-3 mr-1" /> DiplomatiQ Academy
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Train Like a Diplomat
          </h2>
          <p className="mt-4 text-white/65 text-lg max-w-2xl mx-auto">
            8 immersive courses, 40+ lessons covering parliamentary procedure, resolution writing, crisis management, negotiation, public speaking, research methodology, chair training, and secretary-general leadership.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRAINING_COURSES.map((course, i) => {
            const CourseIcon = course.icon
            return (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] hover:border-[#D4A843]/20 transition-all duration-500 group cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CourseIcon className="w-5 h-5 text-[#D4A843]" />
                      </div>
                      <Badge className={`text-[10px] px-2 py-0.5 border ${difficultyBadge(course.difficulty)}`}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-sm font-bold leading-snug">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-white/65 text-xs leading-relaxed">{course.desc}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-1.5 text-white/55 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            size="lg"
            className="bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold px-8 h-12 shadow-lg shadow-[#D4A843]/20"
            onClick={onGetStarted}
          >
            Start Learning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// PRICING PREVIEW
// ============================================================

function PricingPreview({ onGetStarted }: { onGetStarted: (plan?: string) => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: 'Delegate Pro',
      target: 'Individual delegates',
      monthlyPrice: 11,
      annualPrice: 9,
      features: ['7-tier assessment', 'Full academy access', 'XP & badge tracking', 'Conference registration', 'Research Lab'],
      icon: Users,
      gradient: 'from-[#0A7E8C]/20 to-teal-600/20',
      popular: false,
      planKey: 'DELEGATE_PRO',
    },
    {
      name: 'Director Pro',
      target: 'MUN advisors & teachers',
      monthlyPrice: 29,
      annualPrice: 24,
      features: ['Everything in Delegate Pro', 'Student analytics dashboard', 'Research paper evaluation', 'Class management', 'Priority support'],
      icon: GraduationCap,
      gradient: 'from-[#D4A843]/20 to-amber-600/20',
      popular: true,
      planKey: 'DIRECTOR_PRO',
    },
    {
      name: 'School Enterprise',
      target: 'Institutions & districts',
      monthlyPrice: 99,
      annualPrice: 79,
      features: ['Everything in Director Pro', 'Unlimited student seats', 'Conference management', 'Custom branding', 'Dedicated account manager'],
      icon: Building2,
      gradient: 'from-violet-500/20 to-purple-600/20',
      popular: false,
      planKey: 'SCHOOL_ENTERPRISE',
    },
  ]

  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-[#0D1B2A]" ref={ref}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-4 bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/20 hover:bg-[#D4A843]/15">
            <Award className="w-3 h-3 mr-1" /> Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Invest in Diplomatic Excellence
          </h2>
          <p className="mt-4 text-white/65 text-lg max-w-xl mx-auto">
            Starting from $11/month. Choose the plan that matches your mission.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? 'text-white' : 'text-white/40'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-[#D4A843]' : 'bg-white/15'}`}
              aria-label="Toggle annual pricing"
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-white/40'}`}>
              Annual <span className="text-[#D4A843] text-xs font-semibold ml-1">Save 20%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const PlanIcon = plan.icon
            const price = annual ? plan.annualPrice : plan.monthlyPrice
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-[#D4A843] text-[#0D1B2A] font-semibold shadow-md shadow-[#D4A843]/30">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`bg-white/[0.03] border-white/[0.06] backdrop-blur-sm h-full transition-all duration-300 hover:bg-white/[0.06] ${
                  plan.popular ? 'border-[#D4A843]/30 hover:border-[#D4A843]/50' : 'hover:border-[#D4A843]/20'
                }`}>
                  <CardHeader className="pb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3`}>
                      <PlanIcon className="w-5 h-5 text-[#D4A843]" />
                    </div>
                    <CardTitle className="text-white text-lg font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-white/55 text-xs">{plan.target}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold text-white">${price}</span>
                      <span className="text-white/55 text-sm">/month</span>
                    </div>
                    <div className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0A7E8C] shrink-0 mt-0.5" />
                          <span className="text-sm text-white/60">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full font-semibold h-10 ${
                        plan.popular
                          ? 'bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] shadow-md shadow-[#D4A843]/20'
                          : 'bg-white/[0.08] text-white/90 hover:bg-white/[0.14] border border-white/15'
                      }`}
                      onClick={() => onGetStarted(plan.planKey)}
                    >
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a href="#pricing" className="text-sm text-[#0A7E8C] hover:text-[#0FBACA] transition-colors">
            View All Plans <ArrowRight className="w-3 h-3 inline ml-1" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// PLATFORM OVERVIEW / SALES CONVERSION
// ============================================================

function PlatformSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <>
      <div id="schools" className="relative" />
      <section id="conferences" className="relative py-24 md:py-32 bg-[#0A1525]" ref={ref}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#0D1B2A] shadow-2xl shadow-black/40">
              {/* Mock window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0A1525]">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-xs text-white/40 font-mono">diplomatiq.io/dashboard</span>
              </div>
              {/* Mock dashboard content */}
              <div className="p-5 space-y-4">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#D4A843]/20 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-[#D4A843]" />
                    </div>
                    <span className="text-xs font-semibold text-white/70">DiplomatiQ</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-5 rounded bg-white/[0.06]" />
                    <div className="w-16 h-5 rounded bg-white/[0.06]" />
                  </div>
                </div>
                {/* Welcome card */}
                <div className="rounded-lg bg-gradient-to-r from-[#1B3A4B] to-[#243656] p-4 border border-[#D4A843]/15">
                  <div className="text-sm font-bold text-white mb-1">Your Dashboard</div>
                  <div className="text-xs text-white/50">Delegate · 2,450 XP · Ambassador Level</div>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-[#D4A843] rounded-full" />
                  </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Conferences', val: 'â', color: 'bg-blue-500/10 text-blue-400' },
                    { label: 'Committees', val: 'â', color: 'bg-[#D4A843]/10 text-[#D4A843]' },
                    { label: 'Training', val: 'â%', color: 'bg-emerald-500/10 text-emerald-400' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-white/[0.03] p-3 border border-white/[0.05]">
                      <div className={`text-lg font-bold ${s.color.split(' ')[1]}`}>{s.val}</div>
                          <div className="text-[10px] text-white/60">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Mini chart area */}
                <div className="rounded-lg bg-white/[0.03] p-3 border border-white/[0.05]">
                  <div className="text-xs text-white/65 mb-2">Assessment Progress</div>
                  <div className="flex items-end gap-1.5 h-12">
                    {[40, 60, 35, 80, 55, 90, 70].map((h, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-sm bg-[#0A7E8C]/40"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Glow behind mockup */}
            <div className="absolute -inset-4 bg-[#D4A843]/[0.03] rounded-2xl blur-2xl -z-10" />
          </motion.div>

          {/* Right — CTA Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Start Your Diplomatic Journey
            </h2>
            <p className="text-white/65 text-lg leading-relaxed mb-8">
              Experience the platform that is transforming how delegates train, teachers assess, and schools compete. No credit card required.
            </p>

            <div className="mb-8">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold px-8 h-12 shadow-lg shadow-[#D4A843]/20"
                onClick={onGetStarted}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#0A7E8C]" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#0A7E8C]" /> 24-hour free trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#0A7E8C]" /> Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  )
}

// ============================================================
// FOOTER
// ============================================================

function Footer({ onNavigate }: { onNavigate: () => void }) {
  const platformLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Assessment', href: '#assessment' },
    { label: 'Training', href: '#training' },
    { label: 'Schools', href: '#schools' },
    { label: 'Pricing', href: '#pricing' },
  ]
  const companyLinks = [
    { label: 'About', href: '#features' },
    { label: 'Contact', href: 'mailto:modelunitednations45@gmail.com' },
  ]
  const legalLinks = [
    { label: 'Code of Conduct', href: '#features' },
    { label: 'Privacy', href: '#pricing' },
    { label: 'Terms', href: '#pricing' },
  ]

  const handleLinkClick = (e: React.MouseEvent, item: { label: string; href?: string; action?: () => void }) => {
    // If href is set, browser handles the link natively
  }

  return (
    <footer className="relative bg-[#070F1A] pt-16 pb-8">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="DiplomatiQ" className="w-9 h-9 rounded-lg" />
              <span className="text-xl font-bold text-white">
                Diplomati<span className="text-[#D4A843]">Q</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Growing community of MUN delegates and educators.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/75 mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-white/65 hover:text-[#D4A843] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/75 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href || '#top'}
                    onClick={(e) => handleLinkClick(e, item)}
                    className="text-sm text-white/65 hover:text-[#D4A843] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/75 mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href || '#top'}
                    onClick={(e) => handleLinkClick(e, item)}
                    className="text-sm text-white/65 hover:text-[#D4A843] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-white/[0.06] mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/55">
          <span>&copy; 2026 DiplomatiQ. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-[#D4A843]/50" /> for diplomatic education
          </span>
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// LANDING PAGE
// ============================================================

function LandingSection() {
  const navigateToAuth = (path: string = '/auth/register') => {
    window.location.href = path
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white overflow-x-hidden relative">
      {/* Fixed UN background across entire landing page */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/un-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      {/* Dark overlay for text readability */}
      <div className="fixed inset-0 z-[1] bg-[#0D1B2A]/[0.93]" />
      {/* Content above background */}
      <div className="relative z-[2]">
        <Navbar
          onGetStarted={() => navigateToAuth('/auth/register')}
          onSignIn={() => navigateToAuth('/auth/signin')}
        />
        <HeroSection onGetStarted={() => navigateToAuth('/auth/register')} />
        <FeaturesSection />
        <AssessmentShowcase onGetStarted={() => navigateToAuth('/auth/register')} />
        <TrainingSection onGetStarted={() => navigateToAuth('/auth/register')} />
        <PricingPreview onGetStarted={(plan) => navigateToAuth(plan ? `/auth/register?plan=${plan}` : '/auth/register')} />
        <PlatformSection onGetStarted={() => navigateToAuth('/auth/register')} />
        <Footer onNavigate={() => navigateToAuth('/auth/register')} />
      </div>
    </div>
  )
}

// AuthSection removed — auth is handled by /auth/signin and /auth/register routes.

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Home() {
  const { isAuthenticated, checkSession } = useAuthStore()

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // If authenticated, redirect to dashboard route
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard'
    }
  }, [isAuthenticated])

  // Landing page — auth is handled by proper Next.js routes (/auth/signin, /auth/register, etc.)
  return <LandingSection />
}
