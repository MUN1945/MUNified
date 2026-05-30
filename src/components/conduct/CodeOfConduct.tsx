'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import {
  Search, ChevronDown, Check, Shield, Expand, Shrink,
  BookOpen, AlertTriangle, CheckCircle2, Eye
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  SECTIONS, INTRODUCTION, CODE_OF_CONDUCT_VERSION,
  CODE_OF_CONDUCT_EFFECTIVE, TOTAL_RULES, TOTAL_SECTIONS,
  type ConductSection, type ConductRule, type Severity,
} from '@/lib/conduct/sections'

// ============================================================
// LOCALSTORAGE KEYS
// ============================================================
const LS_READ_KEY = 'diplomatiq-coc-read-sections'
const LS_ACK_KEY = 'diplomatiq-coc-acknowledged'

function loadReadSections(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(LS_READ_KEY)
    if (stored) return new Set(JSON.parse(stored))
  } catch { /* ignore */ }
  return new Set()
}

function saveReadSections(sections: Set<string>) {
  try {
    localStorage.setItem(LS_READ_KEY, JSON.stringify([...sections]))
  } catch { /* ignore */ }
}

function loadAcknowledged(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(LS_ACK_KEY) === 'true'
  } catch { /* ignore */ }
  return false
}

function saveAcknowledged(val: boolean) {
  try {
    localStorage.setItem(LS_ACK_KEY, val ? 'true' : 'false')
  } catch { /* ignore */ }
}

// ============================================================
// SEVERITY STYLING
// ============================================================
const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; border: string }> = {
  mandatory: {
    label: 'Mandatory',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-l-red-500',
  },
  important: {
    label: 'Important',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-l-amber-500',
  },
  recommended: {
    label: 'Recommended',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-l-sky-500',
  },
}

// ============================================================
// DYNAMIC ICON RESOLVER
// ============================================================
function getIcon(iconName: string): React.ElementType {
  const icons = LucideIcons as unknown as Record<string, React.ElementType>
  return icons[iconName] || Shield
}

// ============================================================
// SECTION NUMBER COLORS (rotating gold/teal palette)
// ============================================================
const SECTION_COLORS = [
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
  '#D4A843', '#0A7E8C', '#D4A843', '#0A7E8C',
]

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CodeOfConduct() {
  const [searchQuery, setSearchQuery] = useState('')
  const [readSections, setReadSections] = useState<Set<string>>(() => loadReadSections())
  const [acknowledged, setAcknowledged] = useState(() => loadAcknowledged())
  const [openItems, setOpenItems] = useState<string[]>([])
  const [showSeverity, setShowSeverity] = useState<Severity | 'all'>('all')

  // Persist read sections
  useEffect(() => {
    if (readSections.size > 0) saveReadSections(readSections)
  }, [readSections])

  // Persist acknowledgment
  useEffect(() => {
    saveAcknowledged(acknowledged)
  }, [acknowledged])

  const toggleRead = useCallback((id: string) => {
    setReadSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setReadSections(new Set(SECTIONS.map(s => s.id)))
  }, [])

  const expandAll = useCallback(() => {
    setOpenItems(SECTIONS.map(s => s.id))
  }, [])

  const collapseAll = useCallback(() => {
    setOpenItems([])
  }, [])

  const allRead = readSections.size >= TOTAL_SECTIONS
  const progressPercent = Math.round((readSections.size / TOTAL_SECTIONS) * 100)

  // Filter sections by search and severity
  const filteredSections = useMemo(() => {
    let result = SECTIONS
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.rules.some(r => r.text.toLowerCase().includes(q))
      )
    }
    if (showSeverity !== 'all') {
      result = result.filter(s =>
        s.rules.some(r => r.severity === showSeverity)
      )
    }
    return result
  }, [searchQuery, showSeverity])

  // Count rules by severity
  const severityCounts = useMemo(() => {
    const counts = { mandatory: 0, important: 0, recommended: 0 }
    SECTIONS.forEach(s => s.rules.forEach(r => { counts[r.severity]++ }))
    return counts
  }, [])

  const handleAcknowledge = useCallback(() => {
    if (allRead) {
      setAcknowledged(prev => !prev)
    }
  }, [allRead])

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">

        {/* ═══════════════ HEADER ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          {/* Emblem */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A843] to-[#A67C2E] flex items-center justify-center shadow-lg shadow-[#D4A843]/20">
              <Shield className="w-10 h-10 text-[#0A0F1C]" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#D4A843] via-[#F0D78C] to-[#D4A843] bg-clip-text text-transparent">
            Code of Conduct
          </h1>
          <p className="text-sm md:text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
            DiplomatiQ MUN Platform — Official Standards of Conduct
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge className="bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30 text-xs font-medium">
              Version {CODE_OF_CONDUCT_VERSION}
            </Badge>
            <Badge className="bg-white/5 text-white/60 border border-white/10 text-xs font-medium">
              Effective {CODE_OF_CONDUCT_EFFECTIVE}
            </Badge>
            <Badge className="bg-[#0A7E8C]/15 text-[#0A7E8C] border border-[#0A7E8C]/30 text-xs font-medium">
              {TOTAL_RULES} Rules · {TOTAL_SECTIONS} Sections
            </Badge>
          </div>

          <p className="text-sm text-white/40 max-w-3xl mx-auto leading-relaxed mt-2">
            {INTRODUCTION}
          </p>
        </motion.div>

        {/* ═══════════════ PROGRESS & SEARCH ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="bg-[#0D1B2A] border border-[#1B2A4A] overflow-hidden">
            <CardContent className="p-5 space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#D4A843]" />
                    <span className="text-sm text-white/60">
                      {readSections.size} of {TOTAL_SECTIONS} sections reviewed
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#D4A843]">{progressPercent}%</span>
                </div>
                <div className="relative">
                  <Progress value={progressPercent} className="h-2.5 bg-white/5 [&>[data-slot=indicator]]:bg-gradient-to-r [&>[data-slot=indicator]]:from-[#D4A843] [&>[data-slot=indicator]]:to-[#0A7E8C]" />
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="Search all rules and sections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-[#D4A843]/30 focus-visible:border-[#D4A843]/50"
                />
              </div>

              {/* Severity filters + controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowSeverity('all')}
                    className={`text-xs px-3 py-1 rounded-full transition-all ${
                      showSeverity === 'all'
                        ? 'bg-white/15 text-white font-semibold'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setShowSeverity('mandatory')}
                    className={`text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                      showSeverity === 'mandatory'
                        ? 'bg-red-500/20 text-red-400 font-semibold'
                        : 'bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-400/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Mandatory ({severityCounts.mandatory})
                  </button>
                  <button
                    onClick={() => setShowSeverity('important')}
                    className={`text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                      showSeverity === 'important'
                        ? 'bg-amber-500/20 text-amber-400 font-semibold'
                        : 'bg-white/5 text-white/40 hover:bg-amber-500/10 hover:text-amber-400/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Important ({severityCounts.important})
                  </button>
                  <button
                    onClick={() => setShowSeverity('recommended')}
                    className={`text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                      showSeverity === 'recommended'
                        ? 'bg-sky-500/20 text-sky-400 font-semibold'
                        : 'bg-white/5 text-white/40 hover:bg-sky-500/10 hover:text-sky-400/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Recommended ({severityCounts.recommended})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-white/40 hover:text-white/70 hover:bg-white/5"
                    onClick={markAllRead}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Mark All Read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-white/40 hover:text-white/70 hover:bg-white/5"
                    onClick={expandAll}
                  >
                    <Expand className="w-3 h-3 mr-1" /> Expand
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-white/40 hover:text-white/70 hover:bg-white/5"
                    onClick={collapseAll}
                  >
                    <Shrink className="w-3 h-3 mr-1" /> Collapse
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══════════════ SECTION QUICK NAV ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-[#0D1B2A] to-[#162040] border border-[#1B2A4A]">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-1">
                {SECTIONS.map((s, i) => {
                  const isRead = readSections.has(s.id)
                  const color = SECTION_COLORS[i % SECTION_COLORS.length]
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setOpenItems(prev =>
                          prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id]
                        )
                        setTimeout(() => {
                          const el = document.getElementById(`section-${s.id}`)
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }, 100)
                      }}
                      className={`text-[10px] font-mono w-7 h-7 rounded flex items-center justify-center transition-all ${
                        isRead
                          ? 'text-[#0A0F1C] font-bold shadow-sm'
                          : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                      }`}
                      style={isRead ? { backgroundColor: color } : undefined}
                      title={s.title}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══════════════ SECTIONS ACCORDION ═══════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Accordion
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className="space-y-3"
          >
            {filteredSections.map((section, idx) => {
              const isRead = readSections.has(section.id)
              const sectionColor = SECTION_COLORS[idx % SECTION_COLORS.length]
              const Icon = getIcon(section.icon)

              // Filter rules by severity and search
              const visibleRules = section.rules.filter(r => {
                if (showSeverity !== 'all' && r.severity !== showSeverity) return false
                if (searchQuery) {
                  const q = searchQuery.toLowerCase()
                  return r.text.toLowerCase().includes(q) || r.number.includes(q)
                }
                return true
              })

              // Skip section if no rules match
              if (searchQuery && visibleRules.length === 0) return null

              return (
                <div key={section.id} id={`section-${section.id}`}>
                  <AccordionItem
                    value={section.id}
                    className="bg-[#0D1B2A] border border-[#1B2A4A] rounded-xl overflow-hidden data-[state=open]:border-[#1B3A5A] transition-colors"
                  >
                    <AccordionTrigger className="hover:no-underline hover:bg-white/[0.02] px-4 md:px-6 py-4 group">
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 text-left">
                        {/* Icon */}
                        <div
                          className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: `${sectionColor}15` }}
                        >
                          <Icon className="w-5 h-5 md:w-5.5 md:h-5.5" style={{ color: sectionColor }} />
                        </div>

                        {/* Title & description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                              style={{ color: sectionColor, backgroundColor: `${sectionColor}15` }}
                            >
                              §{idx + 1}
                            </span>
                            <span className="text-[10px] text-white/30">
                              {section.rules.length} rules
                            </span>
                            {isRead && (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Read
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm md:text-base font-bold text-white/90 leading-tight truncate">
                            {section.title}
                          </h3>
                          <p className="text-xs text-white/30 mt-0.5 line-clamp-1 hidden sm:block">
                            {section.description}
                          </p>
                        </div>

                        {/* Read checkbox */}
                        <div
                          className="shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isRead}
                            onCheckedChange={() => toggleRead(section.id)}
                            className="border-white/20 data-[state=checked]:bg-[#D4A843] data-[state=checked]:border-[#D4A843] data-[state=checked]:text-[#0A0F1C]"
                          />
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 md:px-6 pb-5">
                      {/* Description */}
                      <p className="text-xs text-white/40 mb-4 leading-relaxed sm:hidden">
                        {section.description}
                      </p>

                      {/* Severity legend */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[10px] text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Mandatory
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Important
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-sky-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Recommended
                        </span>
                      </div>

                      <Separator className="bg-white/5 mb-4" />

                      {/* Rules list */}
                      <div className="space-y-2.5">
                        {visibleRules.map((rule) => {
                          const sev = SEVERITY_CONFIG[rule.severity]
                          return (
                            <motion.div
                              key={rule.number}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.15 }}
                              className={`flex gap-3 items-start pl-3 py-2 rounded-r-lg border-l-2 ${sev.border} ${sev.bg}`}
                            >
                              <span className="text-xs font-mono font-bold shrink-0 mt-0.5 w-8 text-white/50">
                                {rule.number}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/75 leading-relaxed">
                                  {rule.text}
                                </p>
                              </div>
                              <Badge
                                className={`text-[9px] h-5 shrink-0 border-0 ${sev.color} ${sev.bg}`}
                              >
                                {sev.label}
                              </Badge>
                            </motion.div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              )
            })}
          </Accordion>
        </motion.div>

        {/* ═══════════════ ACKNOWLEDGMENT SECTION ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`border-2 overflow-hidden transition-all duration-500 ${
            acknowledged
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : allRead
                ? 'border-[#D4A843]/40 bg-[#D4A843]/5'
                : 'border-white/10 bg-[#0D1B2A]'
          }`}>
            <CardContent className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  acknowledged
                    ? 'bg-emerald-500/20'
                    : 'bg-gradient-to-br from-[#D4A843] to-[#A67C2E]'
                }`}>
                  {acknowledged ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Shield className="w-6 h-6 text-[#0A0F1C]" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white/90">
                    Acknowledgment & Agreement
                  </h3>
                  <p className="text-xs text-white/40">
                    Section 36 — Required for full platform access
                  </p>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    allRead ? 'bg-emerald-500' : 'bg-white/10'
                  }`}>
                    {allRead && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-white/70 leading-relaxed">
                    I confirm that I have read, understood, and agree to abide by all <strong className="text-white/90">36 sections</strong> of the DiplomatiQ Code of Conduct.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white/10">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="text-sm text-white/70 leading-relaxed">
                    I understand that violations may result in <strong className="text-white/90">disciplinary action, suspension, or removal</strong> from the platform, conferences, committees, and affiliated activities.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white/10">
                    <BookOpen className="w-3 h-3 text-[#0A7E8C]" />
                  </div>
                  <span className="text-sm text-white/70 leading-relaxed">
                    I understand that the platform reserves the right to <strong className="text-white/90">investigate alleged violations</strong> and take appropriate action when necessary.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white/10">
                    <Shield className="w-3 h-3 text-[#D4A843]" />
                  </div>
                  <span className="text-sm text-white/70 leading-relaxed">
                    <strong className="text-white/90">Parent/Guardian acknowledgment</strong> is required for participants under 18 years of age.
                  </span>
                </div>
              </div>

              {/* Acknowledge Button */}
              <div className="flex flex-col items-center gap-3">
                {!allRead ? (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-white/40">
                      Read all {TOTAL_SECTIONS} sections to enable acknowledgment
                    </p>
                    <div className="flex items-center gap-2 justify-center">
                      <Progress
                        value={progressPercent}
                        className="w-48 h-1.5 bg-white/5 [&>[data-slot=indicator]]:bg-gradient-to-r [&>[data-slot=indicator]]:from-[#D4A843] [&>[data-slot=indicator]]:to-[#0A7E8C]"
                      />
                      <span className="text-xs text-[#D4A843] font-mono">{progressPercent}%</span>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleAcknowledge}
                    className={`px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                      acknowledged
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-[#D4A843] to-[#A67C2E] hover:from-[#E0B84D] hover:to-[#B88E3E] text-[#0A0F1C] shadow-lg shadow-[#D4A843]/20'
                    }`}
                  >
                    {acknowledged ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Code of Conduct Acknowledged
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        I Acknowledge & Accept
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Success message */}
              <AnimatePresence>
                {acknowledged && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <p className="text-sm font-semibold text-emerald-400">
                        ✓ Code of Conduct Successfully Acknowledged
                      </p>
                      <p className="text-xs text-emerald-400/60 mt-1">
                        You have accepted the DiplomatiQ MUN Official Code of Conduct. You may now access all platform features.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-4"
        >
          <p className="text-xs text-white/20">
            DiplomatiQ — Model United Nations Platform · Code of Conduct v{CODE_OF_CONDUCT_VERSION} · {CODE_OF_CONDUCT_EFFECTIVE}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
