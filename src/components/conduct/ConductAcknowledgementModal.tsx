'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, CheckCircle2, AlertTriangle, BookOpen, Scale,
  Users, Globe, MessageSquare, FileText, Brain,
  KeyRound, Mic, Lock, Heart, Handshake, Eye,
  Gavel, Award, Star, Crown, Flag, Sparkles, Loader2
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CODE_OF_CONDUCT_VERSION, CODE_OF_CONDUCT_EFFECTIVE, SECTIONS } from '@/lib/conduct/sections'
import { useI18n } from '@/lib/i18n'

// Key sections to preview in the modal
const PREVIEW_SECTIONS = [
  { icon: Shield, title: 'General Conduct & Decorum', description: 'Foundational standards of behavior and professional decorum for all participants.' },
  { icon: Users, title: 'Registration & Identity', description: 'Rules governing account registration, identity verification, and profile management.' },
  { icon: Scale, title: 'Academic Integrity', description: 'Academic honesty standards governing all submitted work and scholarly activity.' },
  { icon: Brain, title: 'AI Content Usage Policy', description: 'Governance of AI tools for research, writing, and content generation.' },
  { icon: MessageSquare, title: 'Debate Conduct', description: 'Standards for participation in formal and informal debate within committee sessions.' },
  { icon: Lock, title: 'Anti-Harassment & Safety', description: 'Policies ensuring a safe, respectful, and harassment-free environment for all participants.' },
  { icon: Heart, title: 'Diversity, Equity & Inclusion', description: 'Commitment to fostering an inclusive and equitable community.' },
  { icon: Eye, title: 'Privacy & Data Protection', description: 'Standards for handling personal information and data privacy compliance.' },
  { icon: Gavel, title: 'Disciplinary Procedures', description: 'Formal processes for addressing and resolving Code of Conduct violations.' },
  { icon: Handshake, title: 'Dispute Resolution', description: 'Mediation and resolution mechanisms for disagreements between participants.' },
]

interface ConductAcknowledgementModalProps {
  open: boolean
  onAcknowledged: () => void
}

export default function ConductAcknowledgementModal({
  open,
  onAcknowledged,
}: ConductAcknowledgementModalProps) {
  const { t } = useI18n()
  const [checkbox1, setCheckbox1] = useState(false)
  const [checkbox2, setCheckbox2] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bothChecked = checkbox1 && checkbox2

  const handleAcknowledge = async () => {
    if (!bothChecked) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/conduct/acknowledge', {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok && data.success) {
        onAcknowledged()
      } else {
        setError(data.error || 'Failed to save acknowledgement. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => { /* Prevent closing without acknowledging */ }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-white border-[#E8DED0] p-0 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-[#1B3A4B] to-[#264B5E] px-6 py-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#0D7377] rounded-full opacity-[0.08] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-[#D4A843] rounded-full opacity-[0.06] translate-y-1/2" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#A67C2E] flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {t('conduct.title')}
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm mt-0.5">
                  DiplomatiQ MUN Platform — Required Acknowledgement
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Intro text */}
          <p className="text-sm text-[#1B3A4B]/70 leading-relaxed">
            Welcome to DiplomatiQ. Before accessing the platform, all participants must acknowledge our Code of Conduct, which establishes the standards of professionalism, integrity, diplomacy, and respect expected of everyone in our community.
          </p>

          {/* Scrollable preview of key sections */}
          <ScrollArea className="h-[220px] sm:h-[280px] rounded-lg border border-[#E8DED0] bg-[#FFF8F0]">
            <div className="p-4 space-y-3">
              {PREVIEW_SECTIONS.map((section, i) => {
                const Icon = section.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0D7377]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#0D7377]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1B3A4B]">{section.title}</div>
                      <div className="text-xs text-[#1B3A4B]/50 mt-0.5 leading-relaxed">{section.description}</div>
                    </div>
                  </motion.div>
                )
              })}
              <div className="text-center pt-2 pb-1">
                <p className="text-xs text-[#1B3A4B]/30 italic">
                  ...and {SECTIONS.length - PREVIEW_SECTIONS.length} more sections covering parliamentary procedure, voting, research, technology use, and more.
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div
              className="flex items-start gap-3 p-3 rounded-lg border border-[#E8DED0] bg-[#FFF8F0] cursor-pointer hover:border-[#0D7377]/30 transition-colors"
              onClick={() => setCheckbox1(!checkbox1)}
            >
              <Checkbox
                checked={checkbox1}
                onCheckedChange={(checked) => setCheckbox1(checked === true)}
                className="mt-0.5 data-[state=checked]:bg-[#0D7377] data-[state=checked]:border-[#0D7377] data-[state=checked]:text-white"
              />
              <span className="text-sm text-[#1B3A4B]/80 leading-relaxed">
                I have read and agree to abide by the <strong className="text-[#1B3A4B]">DiplomatiQ Code of Conduct</strong>, including all {SECTIONS.length} sections governing participant behavior.
              </span>
            </div>
            <div
              className="flex items-start gap-3 p-3 rounded-lg border border-[#E8DED0] bg-[#FFF8F0] cursor-pointer hover:border-[#D4A843]/30 transition-colors"
              onClick={() => setCheckbox2(!checkbox2)}
            >
              <Checkbox
                checked={checkbox2}
                onCheckedChange={(checked) => setCheckbox2(checked === true)}
                className="mt-0.5 data-[state=checked]:bg-[#D4A843] data-[state=checked]:border-[#D4A843] data-[state=checked]:text-white"
              />
              <span className="text-sm text-[#1B3A4B]/80 leading-relaxed">
                I understand that <strong className="text-[#1B3A4B]">violations may result in disciplinary action</strong>, including suspension or removal from the platform, conferences, and affiliated activities.
              </span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Acknowledge button */}
          <Button
            onClick={handleAcknowledge}
            disabled={!bothChecked || isSubmitting}
            className={`w-full py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              bothChecked
                ? 'bg-gradient-to-r from-[#0D7377] to-[#0A5C5F] hover:from-[#0A5C5F] hover:to-[#084A4D] text-white shadow-lg shadow-[#0D7377]/20'
                : 'bg-[#E8DED0] text-[#1B3A4B]/30 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                {t('conduct.acknowledge')}
              </>
            )}
          </Button>

          <Separator className="bg-[#E8DED0]" />

          {/* Version & effective date */}
          <div className="flex items-center justify-center gap-3 pb-1">
            <Badge className="bg-[#0D7377]/10 text-[#0D7377] border border-[#0D7377]/20 text-[10px] font-medium">
              Version {CODE_OF_CONDUCT_VERSION}
            </Badge>
            <Badge className="bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20 text-[10px] font-medium">
              Effective {CODE_OF_CONDUCT_EFFECTIVE}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
