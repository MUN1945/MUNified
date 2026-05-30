'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Globe, BookOpen, Award, Users, BarChart3, Settings, MessageSquare,
  ChevronRight, Star, Trophy, Target, Zap, Clock, MapPin, TrendingUp,
  Shield, GraduationCap, Crown, Sword, Landmark, Gavel, FileText,
  Mic, Handshake, Brain, Eye, Heart, ArrowRight, LogOut, Bell,
  Search, Plus, CheckCircle2, Circle, Play, Lock, Sparkles,
  Home as HomeIcon, ClipboardList, BookMarked, Building2, TrophyIcon,
  Radio, Send, Menu, X, User, Mail, KeyRound, BadgeCheck,
  Flame, Medal, Rocket, World, Siren, Scale, Briefcase,
  PieChart, Activity, CalendarDays, UsersRound, Signal,
  ChevronDown, ExternalLink, Filter, ArrowLeft,
  Monitor, FileSearch, Layers, Cpu, LucideIcon, ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AppShell from '@/components/dashboard/AppShell'
import { useAuthStore, useNavStore, type UserRole } from '@/lib/store'

// ============================================================
// TYPES & CONSTANTS
// ============================================================

type Page = 'landing' | 'auth' | 'dashboard'

interface UserData {
  name: string
  email: string
  role: string
  xp: number
  level: string
  levelIndex: number
  conferencesAttended: number
  committeesServed: number
  trainingProgress: number
}

const ASSESSMENT_TIERS = [
  { name: 'Basic Delegate', tier: 1, color: '#94A3B8', icon: Users, desc: 'Foundation of MUN knowledge — procedures, etiquette, and committee basics.' },
  { name: 'Advanced Delegate', tier: 2, color: '#60A5FA', icon: MessageSquare, desc: 'Competent in debate, resolution drafting, and collaborative negotiation.' },
  { name: 'Committee Leader', tier: 3, color: '#0A7E8C', icon: Target, desc: 'Leadership readiness — caucusing, coalition-building, and strategic influence.' },
  { name: 'Chair', tier: 4, color: '#D4A843', icon: Gavel, desc: 'Mastery of procedure — moderating debate, ruling on points, and guiding committees.' },
  { name: 'Under-Secretary-General', tier: 5, color: '#A78BFA', icon: Shield, desc: 'Strategic oversight — managing multiple committees and crisis response.' },
  { name: 'Deputy Secretary-General', tier: 6, color: '#F59E0B', icon: Crown, desc: 'Executive coordination — conference logistics, delegate welfare, and program integrity.' },
  { name: 'Secretary-General', tier: 7, color: '#EF4444', icon: Star, desc: 'The pinnacle — visionary leadership, institutional judgment, and diplomatic authority.' },
]

const SCHOOLS_LIST = [
  'American School of Dubai',
  'American School of Abu Dhabi',
  'GEMS Wellington International School',
  'GEMS Modern Academy',
  'Dubai International Academy',
  'Jumeirah College',
  'Repton School Dubai',
  'Khalifa A School',
  'Al Mawakeb School',
  'International School of Choueifat',
  'British School of Dubai',
  'Deira International School',
  'Dubai College',
  'English College Dubai',
  'Uptown School',
  'Raha International School',
  'Brighton College Abu Dhabi',
  'Cranleigh Abu Dhabi',
  'Sunmarke School',
  'Swiss International Scientific School',
]

// ============================================================
// ANIMATED BACKGROUND COMPONENTS
// ============================================================

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* UN background image — fixed, subtle */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/un-bg.png)' }}
      />
      {/* Dark navy overlay for readability */}
      <div className="absolute inset-0 bg-[#0D1B2A]/[0.88]" />
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
    { label: 'Academy', href: '#academy' },
    { label: 'Conferences', href: '#conferences' },
    { label: 'Pricing', href: '#pricing' },
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
          <div className="w-9 h-9 rounded-lg bg-[#D4A843] flex items-center justify-center group-hover:bg-[#E0BC6A] transition-colors shadow-md shadow-[#D4A843]/20">
            <Globe className="w-5 h-5 text-[#0D1B2A]" />
          </div>
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
          className="mt-6 text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed"
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
          <Button
            size="lg"
            variant="outline"
            className="border-[#D4A843]/40 text-[#D4A843] hover:bg-[#D4A843]/10 hover:border-[#D4A843]/60 text-base px-8 h-13 transition-all duration-300 bg-[#D4A843]/[0.06]"
          >
            For Schools
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-20 md:mt-24 pt-8 border-t border-white/[0.06]"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.8, delay: 0.6 } },
          }}
        >
          <p className="text-white/30 text-sm mb-4">Trusted by MUN Programs Worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {['Growing Network', 'Active Delegates', 'Global Conferences', 'Diplomatic Excellence'].map((label) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-semibold text-[#D4A843]/70">&#10022;</span>
                <span className="text-xs text-white/35 mt-1">{label}</span>
              </div>
            ))}
          </div>
          <a href="#features" className="inline-block mt-4 text-xs text-[#0A7E8C] hover:text-[#0A9EAC] transition-colors font-medium">
            Join the Network <ArrowRight className="w-3 h-3 inline ml-0.5" />
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
          <p className="mt-4 text-white/45 text-lg max-w-2xl mx-auto">
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
                  <p className="text-white/45 text-sm leading-relaxed">{feature.desc}</p>
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
    <section id="academy" className="relative py-24 md:py-32 bg-[#0A1525]" ref={ref}>
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
          <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto">
            From foundation to pinnacle — each tier unlocks new competencies and challenges. Discover where you stand and where you can grow.
          </p>
        </motion.div>

        {/* Tier Pyramid */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-2 md:space-y-3">
            {ASSESSMENT_TIERS.slice().reverse().map((tier, i) => {
              // Width progression: top tier is narrowest, bottom is widest
              const widthPercent = tier.tier === 7 ? 35 : tier.tier === 6 ? 45 : tier.tier === 5 ? 55 : tier.tier === 4 ? 65 : tier.tier === 3 ? 75 : tier.tier === 2 ? 85 : 100
              const TierIcon = tier.icon
              const isTopTier = tier.tier === 7
              // Scale icon sizes: Secretary-General gets biggest icon
              const iconSize = tier.tier >= 6 ? 'w-10 h-10' : 'w-9 h-9'
              const innerIconSize = tier.tier >= 6 ? 'w-5 h-5' : 'w-4.5 h-4.5'
              // Color saturation increases going up
              const bgOpacity = tier.tier >= 5 ? '12' : tier.tier >= 3 ? '08' : '06'
              const borderOpacity = tier.tier >= 5 ? '35' : '25'
              const iconBgOpacity = tier.tier >= 5 ? '25' : '20'
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-center justify-center"
                >
                  <div
                    className="relative group cursor-pointer w-full md:w-auto"
                    style={{ width: undefined }}
                  >
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 group-hover:scale-[1.01] ${isTopTier ? 'ring-1 ring-[#D4A843]/20' : ''}`}
                      style={{
                        backgroundColor: `${tier.color}${bgOpacity}`,
                        borderColor: `${tier.color}${borderOpacity}`,
                        width: `${widthPercent}%`,
                        margin: '0 auto',
                      }}
                    >
                      {/* Glow pulse on appear */}
                      {isInView && isTopTier && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{ boxShadow: `0 0 20px ${tier.color}30, 0 0 40px ${tier.color}15` }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <div
                        className={`${iconSize} rounded-lg flex items-center justify-center shrink-0`}
                        style={{ backgroundColor: `${tier.color}${iconBgOpacity}` }}
                      >
                        <TierIcon className={innerIconSize} style={{ color: tier.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold" style={{ color: tier.color }}>
                            TIER {tier.tier}
                          </span>
                          <span className="text-sm font-semibold text-white/90">{tier.name}</span>
                          {isTopTier && <Star className="w-3.5 h-3.5 text-[#D4A843] fill-[#D4A843]/40" />}
                        </div>
                        <p className="text-xs text-white/45 mt-0.5 hidden sm:truncate sm:block">{tier.desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
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
// PRICING PREVIEW
// ============================================================

function PricingPreview({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: 'Delegate Pro',
      target: 'Individual delegates',
      monthlyPrice: 9,
      annualPrice: 7,
      features: ['7-tier assessment', 'Full academy access', 'XP & badge tracking', 'Conference registration', 'Research Lab'],
      icon: Users,
      gradient: 'from-[#0A7E8C]/20 to-teal-600/20',
      popular: false,
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
          <p className="mt-4 text-white/45 text-lg max-w-xl mx-auto">
            Starting from $9/month. Choose the plan that matches your mission.
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
                    <CardDescription className="text-white/40 text-xs">{plan.target}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold text-white">${price}</span>
                      <span className="text-white/40 text-sm">/month</span>
                    </div>
                    <div className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0A7E8C] shrink-0 mt-0.5" />
                          <span className="text-sm text-white/55">{feature}</span>
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
                      onClick={onGetStarted}
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
          <a href="#pricing" className="text-sm text-[#0A7E8C] hover:text-[#0A9EAC] transition-colors">
            View All Plans <ArrowRight className="w-3 h-3 inline ml-1" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// DEMO / SALES CONVERSION
// ============================================================

function DemoSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
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
                <span className="ml-3 text-xs text-white/30 font-mono">diplomatiq.io/dashboard</span>
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
                  <div className="text-sm font-bold text-white mb-1">Welcome back, Amara</div>
                  <div className="text-xs text-white/40">Delegate · 2,450 XP · Ambassador Level</div>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-[#D4A843] rounded-full" />
                  </div>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Conferences', val: '8', color: 'bg-blue-500/10 text-blue-400' },
                    { label: 'Committees', val: '12', color: 'bg-[#D4A843]/10 text-[#D4A843]' },
                    { label: 'Training', val: '67%', color: 'bg-emerald-500/10 text-emerald-400' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-white/[0.03] p-3 border border-white/[0.05]">
                      <div className={`text-lg font-bold ${s.color.split(' ')[1]}`}>{s.val}</div>
                      <div className="text-[10px] text-white/30">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Mini chart area */}
                <div className="rounded-lg bg-white/[0.03] p-3 border border-white/[0.05]">
                  <div className="text-xs text-white/40 mb-2">Assessment Progress</div>
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
            <Badge className="mb-4 bg-[#0A7E8C]/15 text-[#0A7E8C] border-[#0A7E8C]/25 hover:bg-[#0A7E8C]/20">
              <Monitor className="w-3 h-3 mr-1" /> Live Demo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              See DiplomatiQ in Action
            </h2>
            <p className="text-white/45 text-lg leading-relaxed mb-8">
              Experience the platform that is transforming how delegates train, teachers assess, and schools compete. No credit card required.
            </p>

            <div className="space-y-4 mb-8">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold px-8 h-12 shadow-lg shadow-[#D4A843]/20"
                onClick={onGetStarted}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white/90 hover:bg-white/[0.06] hover:border-[#D4A843]/40 font-medium px-8 h-12"
                onClick={() => alert('Demo booking coming soon! We\'ll notify you when this feature is available.')}
              >
                Book a Demo
                <CalendarDays className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/35">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#0A7E8C]" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#0A7E8C]" /> 14-day free trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#0A7E8C]" /> Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FOOTER
// ============================================================

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const platformLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Academy', href: '#academy' },
    { label: 'Conferences', href: '#conferences' },
    { label: 'Pricing', href: '#pricing' },
  ]
  const companyLinks = [
    { label: 'About', action: () => onNavigate('auth') },
    { label: 'Contact', href: 'mailto:hello@diplomatiq.io' },
  ]
  const legalLinks = [
    { label: 'Code of Conduct', action: () => onNavigate('auth') },
    { label: 'Privacy', action: () => alert('Privacy Policy coming soon.') },
    { label: 'Terms', action: () => alert('Terms of Service coming soon.') },
  ]

  const handleLinkClick = (e: React.MouseEvent, item: { label: string; href?: string; action?: () => void }) => {
    if (item.action) {
      e.preventDefault()
      item.action()
    }
    // If href is set, browser handles the anchor scrolling natively
  }

  return (
    <footer className="relative bg-[#070F1A] pt-16 pb-8">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#D4A843] flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#0D1B2A]" />
              </div>
              <span className="text-xl font-bold text-white">
                Diplomati<span className="text-[#D4A843]">Q</span>
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Building the next generation of diplomats.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-white/40 hover:text-[#D4A843] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href || '#'}
                    onClick={(e) => handleLinkClick(e, item)}
                    className="text-sm text-white/40 hover:text-[#D4A843] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href="#"
                    onClick={(e) => handleLinkClick(e, item)}
                    className="text-sm text-white/40 hover:text-[#D4A843] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-white/[0.06] mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
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

function LandingSection({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white overflow-x-hidden relative">
      {/* Fixed UN background across entire landing page */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/un-bg.png)', opacity: 0.06 }}
      />
      {/* Content above background */}
      <div className="relative z-10">
        <Navbar
          onGetStarted={() => onNavigate('auth')}
          onSignIn={() => onNavigate('auth')}
        />
        <HeroSection onGetStarted={() => onNavigate('auth')} />
        <FeaturesSection />
        <AssessmentShowcase onGetStarted={() => onNavigate('auth')} />
        <PricingPreview onGetStarted={() => onNavigate('auth')} />
        <DemoSection onGetStarted={() => onNavigate('auth')} />
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  )
}

// ============================================================
// AUTH SECTION
// ============================================================

function AuthSection({ onNavigate, onLogin }: { onNavigate: (page: Page) => void; onLogin: (data: UserData) => void }) {
  const [isRegister, setIsRegister] = useState(true)
  const [selectedRole, setSelectedRole] = useState('DELEGATE')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolSearch, setSchoolSearch] = useState('')
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState('')
  const [schoolNotListed, setSchoolNotListed] = useState(false)

  const roles = [
    { value: 'DELEGATE', label: 'Student / Delegate', icon: Users, desc: 'Join conferences, train, and compete' },
    { value: 'TEACHER', label: 'Teacher / MUN Advisor', icon: GraduationCap, desc: 'Guide students and manage programs' },
    { value: 'SCHOOL_ADMIN', label: 'School Administrator', icon: Building2, desc: 'Oversee school MUN programs' },
    { value: 'SECRETARIAT', label: 'Secretariat', icon: Gavel, desc: 'Organize and run conferences' },
  ]

  const filteredSchools = SCHOOLS_LIST.filter(s =>
    s.toLowerCase().includes(schoolSearch.toLowerCase())
  ).slice(0, 6)

  const handleSubmit = () => {
    const roleLabel = roles.find(r => r.value === selectedRole)?.label || 'Delegate'
    onLogin({
      name: name || 'Alex Diplomat',
      email: email || 'alex@diplomatiq.io',
      role: roleLabel,
      xp: 2450,
      level: 'Ambassador',
      levelIndex: 2,
      conferencesAttended: 8,
      committeesServed: 12,
      trainingProgress: 67,
    })
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4A843] rounded-full opacity-[0.03] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[#D4A843]/[0.05] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-[#D4A843]/[0.03] rounded-full" />
      </div>
      <motion.div className="relative z-10 w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#D4A843] flex items-center justify-center">
            <Globe className="w-6 h-6 text-[#0D1B2A]" />
          </div>
          <span className="text-xl font-bold">Diplomati<span className="text-[#D4A843]">Q</span></span>
        </div>
        <Card className="bg-white/[0.05] border-white/[0.08] backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-white">Welcome to DiplomatiQ</CardTitle>
            <CardDescription className="text-white/45">
              {isRegister ? 'Begin your diplomatic journey' : 'Continue your mission'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label className="text-white/60 text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <Input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/40 focus:ring-[#D4A843]/15"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-white/60 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <Input
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/40 focus:ring-[#D4A843]/15"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-sm">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <Input
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/40 focus:ring-[#D4A843]/15"
                />
              </div>
            </div>
            {isRegister && (
              <>
                <div className="space-y-3">
                  <Label className="text-white/60 text-sm">I am a...</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {roles.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => setSelectedRole(role.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          selectedRole === role.value
                            ? 'border-[#D4A843]/40 bg-[#D4A843]/10'
                            : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'
                        }`}
                      >
                        <role.icon className={`w-5 h-5 ${selectedRole === role.value ? 'text-[#D4A843]' : 'text-white/30'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${selectedRole === role.value ? 'text-[#D4A843]' : 'text-white/60'}`}>
                            {role.label}
                          </div>
                          <div className="text-xs text-white/30">{role.desc}</div>
                        </div>
                        {selectedRole === role.value && <CheckCircle2 className="w-4 h-4 text-[#D4A843] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* School Selector */}
                {(selectedRole === 'DELEGATE' || selectedRole === 'TEACHER' || selectedRole === 'SCHOOL_ADMIN') && (
                  <div className="space-y-2">
                    <Label className="text-white/60 text-sm">School</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                      <Input
                        placeholder="Search for your school..."
                        value={schoolNotListed ? 'My school is not listed' : schoolSearch || selectedSchool}
                        onChange={(e) => {
                          if (schoolNotListed) {
                            setSchoolNotListed(false)
                            setSchoolSearch('')
                            setSelectedSchool('')
                          } else {
                            setSchoolSearch(e.target.value)
                            setSelectedSchool('')
                            setShowSchoolDropdown(true)
                          }
                        }}
                        onFocus={() => { if (!schoolNotListed && !selectedSchool) setShowSchoolDropdown(true) }}
                        onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                        className="pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 focus:border-[#D4A843]/40 focus:ring-[#D4A843]/15"
                      />
                      {showSchoolDropdown && filteredSchools.length > 0 && !selectedSchool && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0D1B2A] border border-white/[0.08] rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                          {filteredSchools.map((school) => (
                            <button
                              key={school}
                              className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                              onMouseDown={() => {
                                setSelectedSchool(school)
                                setSchoolSearch('')
                                setShowSchoolDropdown(false)
                              }}
                            >
                              {school}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {!schoolNotListed && (
                      <button
                        onClick={() => { setSchoolNotListed(true); setSelectedSchool(''); setSchoolSearch('') }}
                        className="text-xs text-[#0A7E8C] hover:text-[#0A9EAC] transition-colors"
                      >
                        My school is not listed
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button className="w-full bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold h-11" onClick={handleSubmit}>
              {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-white/35 hover:text-white/55 transition-colors">
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </CardFooter>
        </Card>
        <button onClick={() => onNavigate('landing')} className="mt-6 text-sm text-white/25 hover:text-white/45 transition-colors flex items-center gap-1 mx-auto">
          <ChevronRight className="w-3 h-3 rotate-180" /> Back to home
        </button>
      </motion.div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Home() {
  const [page, setPage] = useState<Page>('landing')
  const { user: storeUser, isAuthenticated, demoLogin, logout: storeLogout } = useAuthStore()
  const { navigate } = useNavStore()

  const handleLogin = (data: UserData) => {
    const roleMap: Record<string, UserRole> = {
      'Student / Delegate': 'STUDENT',
      'Teacher / MUN Advisor': 'TEACHER',
      'School Administrator': 'SCHOOL_ADMIN',
      'Secretariat': 'ADMIN',
    }
    const role = roleMap[data.role] || 'STUDENT'
    demoLogin(role)
    navigate('dashboard')
    setPage('dashboard')
  }

  const handleLogout = () => {
    storeLogout()
    setPage('landing')
  }

  // Landing page
  if (page === 'landing' || (!isAuthenticated && page !== 'auth')) {
    return <LandingSection onNavigate={setPage} />
  }

  // Auth page
  if (page === 'auth' && !isAuthenticated) {
    return <AuthSection onNavigate={setPage} onLogin={handleLogin} />
  }

  // Dashboard - use AppShell with Zustand store integration
  if (isAuthenticated) {
    return <AppShell />
  }

  return <LandingSection onNavigate={setPage} />
}
