'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Expand, Shrink, Scale, Check, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  SECTIONS, INTRODUCTION, CODE_OF_CONDUCT_VERSION,
  CODE_OF_CONDUCT_EFFECTIVE, TOTAL_RULES, TOTAL_SECTIONS,
  type ConductSection
} from '@/lib/conduct/sections'

// ============================================================
// SECTION CARD COMPONENT
// ============================================================

function SectionCard({
  section,
  isOpen,
  onToggle,
  searchQuery,
}: {
  section: ConductSection
  isOpen: boolean
  onToggle: () => void
  searchQuery: string
}) {
  const Icon = section.icon
  const filteredRules = useMemo(() => {
    if (!searchQuery) return section.rules
    const q = searchQuery.toLowerCase()
    return section.rules.filter(r => r.text.toLowerCase().includes(q))
  }, [section.rules, searchQuery])

  const hasResults = !searchQuery || filteredRules.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: hasResults ? 1 : 0.3, y: 0 }}
      transition={{ duration: 0.3, delay: section.number * 0.02 }}
      style={{ display: hasResults ? undefined : 'none' }}
    >
      <Card className="border border-[#E8DED0]/50 overflow-hidden transition-shadow hover:shadow-sm">
        {/* Header */}
        <button
          onClick={onToggle}
          className="w-full text-left p-4 md:p-5 flex items-center gap-4 cursor-pointer group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${section.color}12` }}
          >
            <Icon className="w-5 h-5" style={{ color: section.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ color: section.color, backgroundColor: `${section.color}10` }}
              >
                {section.number}
              </span>
              <span className="text-xs text-muted-foreground">
                {section.rules.length} rules
              </span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-[#0D1B2A] mt-0.5 leading-tight">
              {section.title}
            </h3>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDown className="w-5 h-5 text-[#0D1B2A]/30" />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <Separator className="bg-[#E8DED0]/40" />
              <div className="p-4 md:p-5 space-y-3">
                {filteredRules.map((rule) => (
                  <div
                    key={rule.number}
                    className="flex gap-3 items-start pl-3"
                    style={{ borderLeft: `2px solid ${section.color}25` }}
                  >
                    <span
                      className="text-xs font-mono font-bold shrink-0 mt-0.5 w-7"
                      style={{ color: section.color }}
                    >
                      {rule.number}
                    </span>
                    <p className="text-sm text-[#0D1B2A]/80 leading-relaxed">
                      {rule.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// ============================================================
// MAIN CODE OF CONDUCT COMPONENT
// ============================================================

export default function CodeOfConduct() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [readSections, setReadSections] = useState<Set<string>>(new Set())
  const [acknowledgments, setAcknowledgments] = useState({
    read: false,
    violations: false,
    investigation: false,
    minor: false,
  })

  const toggleSection = useCallback((id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        setReadSections(r => new Set(r).add(id))
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setOpenSections(new Set(SECTIONS.map(s => s.id)))
    setReadSections(new Set(SECTIONS.map(s => s.id)))
  }, [])

  const collapseAll = useCallback(() => {
    setOpenSections(new Set())
  }, [])

  const allAcknowledged = acknowledgments.read && acknowledgments.violations && acknowledgments.investigation

  const progressPercent = Math.round((readSections.size / TOTAL_SECTIONS) * 100)

  const filteredSections = useMemo(() => {
    if (!searchQuery) return SECTIONS
    const q = searchQuery.toLowerCase()
    return SECTIONS.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.rules.some(r => r.text.toLowerCase().includes(q))
    )
  }, [searchQuery])

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#0D1B2A] flex items-center justify-center">
            <Scale className="w-6 h-6 text-[#D4A843]" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0D1B2A]">
          MUN Official Code of Conduct
        </h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <Badge className="bg-[#0D1B2A]/10 text-[#0D1B2A] border-0 text-xs">
            Version {CODE_OF_CONDUCT_VERSION}
          </Badge>
          <Badge className="bg-[#D4A843]/15 text-[#D4A843] border-0 text-xs">
            Effective {CODE_OF_CONDUCT_EFFECTIVE}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
          {INTRODUCTION}
        </p>
      </motion.div>

      {/* Progress & Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-[#E8DED0]/50">
          <CardContent className="p-4 space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {readSections.size} of {TOTAL_SECTIONS} sections reviewed
                </span>
                <span className="font-semibold text-[#0D1B2A]">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search all rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#E8DED0]/50 focus-visible:ring-[#0A7E8C]/20"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {TOTAL_RULES} rules across {TOTAL_SECTIONS} sections
                {searchQuery && ` · ${filteredSections.length} matching`}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={expandAll}
                >
                  <Expand className="w-3 h-3 mr-1" /> Expand All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={collapseAll}
                >
                  <Shrink className="w-3 h-3 mr-1" /> Collapse All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Quick Nav */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-[#E8DED0]/50 bg-gradient-to-r from-[#0D1B2A] to-[#1B2A4A]">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-1.5">
              {SECTIONS.map(s => {
                const isRead = readSections.has(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      toggleSection(s.id)
                      const el = document.getElementById(`section-${s.id}`)
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className={`text-[10px] px-2 py-1 rounded-full transition-all ${
                      isRead
                        ? 'bg-[#D4A843]/20 text-[#D4A843] font-semibold'
                        : 'bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/80'
                    }`}
                  >
                    {s.number}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sections */}
      <div className="space-y-3">
        {filteredSections.map(section => (
          <div key={section.id} id={`section-${section.id}`}>
            <SectionCard
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              searchQuery={searchQuery}
            />
          </div>
        ))}
      </div>

      {/* Acknowledgment */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className={`border-2 transition-all ${allAcknowledged ? 'border-[#059669]/30 bg-[#059669]/5' : 'border-[#0D1B2A]/15'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D1B2A] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#D4A843]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0D1B2A]">Acknowledgment & Acceptance</h3>
                <p className="text-xs text-muted-foreground">Section 36 — Required for platform access</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'read' as const, label: 'I confirm that I have read, understood, and agree to abide by the MUN Official Code of Conduct.' },
                { key: 'violations' as const, label: 'I understand that violations may result in disciplinary action, suspension, or removal from the platform, conferences, committees, leadership positions, or affiliated activities.' },
                { key: 'investigation' as const, label: 'I understand that the platform reserves the right to investigate alleged violations and take appropriate action when necessary.' },
                { key: 'minor' as const, label: 'Parent/Guardian acknowledgment required (for participants under 18).' },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    acknowledgments[item.key]
                      ? 'bg-[#059669]/8'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      acknowledgments[item.key]
                        ? 'bg-[#059669] border-[#059669]'
                        : 'border-[#0D1B2A]/20'
                    }`}
                    onClick={() => setAcknowledgments(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  >
                    {acknowledgments[item.key] && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-[#0D1B2A]/80 leading-relaxed">{item.label}</span>
                </label>
              ))}
            </div>

            {allAcknowledged && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-[#059669]/10 text-center"
              >
                <p className="text-sm font-semibold text-[#059669]">
                  ✓ Code of Conduct Acknowledged
                </p>
                <p className="text-xs text-[#059669]/70 mt-1">
                  You have accepted the MUN Official Code of Conduct. You may now access all platform features.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
