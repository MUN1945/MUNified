'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, BookOpen, Users, School, ChevronDown, ChevronUp,
  Award, Zap, Target, Star, Shield, Crown, Flame, Compass,
  Lightbulb, TrendingUp, MessageSquare, FileText, Gavel,
  Handshake, Mic, Scale, Clock, CheckCircle2, Lock,
  Globe, Heart, Sparkles, BarChart3, Briefcase,
  Building2, Palette, TreePine, Sun
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import TrainingHub from './TrainingHub'
import { useAuthStore } from '@/lib/store'

// ============================================================
// TYPES
// ============================================================

type PathwayTab = 'student' | 'teacher' | 'school'

interface LevelInfo {
  name: string
  xpMin: number
  xpMax: number
  icon: React.ElementType
  color: string
  bgClass: string
  skills: string[]
  badgeName: string
  badgeIcon: React.ElementType
  requiredCourses: string[]
}

interface SkillData {
  name: string
  value: number
  icon: React.ElementType
  color: string
}

// ============================================================
// CONSTANTS
// ============================================================

const LEARNING_LEVELS: LevelInfo[] = [
  {
    name: 'Beginner', xpMin: 0, xpMax: 99, icon: BookOpen,
    color: '#059669', bgClass: 'bg-emerald-50 border-emerald-200',
    skills: ['Basic parliamentary procedure', 'Simple resolution writing', 'Research fundamentals'],
    badgeName: 'Novice Delegate', badgeIcon: BookOpen,
    requiredCourses: ['MUN Fundamentals', 'Parliamentary Procedure Basics'],
  },
  {
    name: 'Intermediate', xpMin: 100, xpMax: 299, icon: Compass,
    color: '#0D7377', bgClass: 'bg-teal-50 border-teal-200',
    skills: ['Advanced procedure', 'Position paper writing', 'Public speaking', 'Alliance building'],
    badgeName: 'Skilled Delegate', badgeIcon: Compass,
    requiredCourses: ['Resolution Writing Workshop', 'Public Speaking for MUN'],
  },
  {
    name: 'Advanced', xpMin: 300, xpMax: 599, icon: Target,
    color: '#D4A843', bgClass: 'bg-amber-50 border-amber-200',
    skills: ['Crisis management', 'Complex negotiation', 'Strategic voting blocs', 'Advanced research methods'],
    badgeName: 'Expert Delegate', badgeIcon: Target,
    requiredCourses: ['Crisis Committee Protocols', 'Advanced Negotiation'],
  },
  {
    name: 'Expert', xpMin: 600, xpMax: 999, icon: Shield,
    color: '#7C3AED', bgClass: 'bg-purple-50 border-purple-200',
    skills: ['Committee leadership', 'Mentoring delegates', 'Diplomatic strategy', 'Conflict resolution'],
    badgeName: 'Distinguished Delegate', badgeIcon: Shield,
    requiredCourses: ['Chair Training Program', 'Diplomatic Strategy'],
  },
  {
    name: 'Diplomat', xpMin: 1000, xpMax: 1999, icon: Crown,
    color: '#1B3A4B', bgClass: 'bg-slate-50 border-slate-300',
    skills: ['Conference organization', 'Multi-lateral negotiation', 'Policy analysis', 'MUN program development'],
    badgeName: 'Master Diplomat', badgeIcon: Crown,
    requiredCourses: ['Secretary-General Leadership', 'Conference Management'],
  },
  {
    name: 'Secretary-General', xpMin: 2000, xpMax: 99999, icon: Star,
    color: '#D4A843', bgClass: 'bg-yellow-50 border-yellow-200',
    skills: ['Executive leadership', 'Global program design', 'Educational innovation', 'Community building'],
    badgeName: 'Secretary-General', badgeIcon: Star,
    requiredCourses: ['All courses completed'],
  },
]

const SKILL_RADAR: SkillData[] = [
  { name: 'Communication', value: 72, icon: Mic, color: '#0D7377' },
  { name: 'Research', value: 58, icon: BookOpen, color: '#1B3A4B' },
  { name: 'Diplomacy', value: 65, icon: Handshake, color: '#D4A843' },
  { name: 'Leadership', value: 45, icon: Scale, color: '#7C3AED' },
  { name: 'Critical Thinking', value: 68, icon: Lightbulb, color: '#059669' },
]

const QUICK_START_CARDS = [
  { title: 'MUN Basics', desc: 'Start your journey with fundamentals', icon: BookOpen, xp: 50, color: '#059669' },
  { title: 'First Speech', desc: 'Build confidence in public speaking', icon: Mic, xp: 30, color: '#0D7377' },
  { title: 'Resolution Writing', desc: 'Learn to draft effective resolutions', icon: FileText, xp: 40, color: '#D4A843' },
  { title: 'Committee Prep', desc: 'Research and prepare for your committee', icon: Gavel, xp: 45, color: '#7C3AED' },
]

const TEACHER_CERT_STEPS = [
  { title: 'Complete MUN Certification', desc: 'Pass all fundamental MUN courses', icon: CheckCircle2, done: true },
  { title: 'Classroom Integration Course', desc: 'Learn to integrate MUN into curriculum', icon: BookOpen, done: false },
  { title: 'Student Assessment Training', desc: 'Master evaluation rubrics and feedback', icon: Target, done: false },
  { title: 'Conference Organization', desc: 'Plan and run school MUN conferences', icon: Users, done: false },
  { title: 'Advanced Facilitation', desc: 'Lead complex multi-school simulations', icon: Award, done: false },
]

const UAE_VALUES = [
  { title: 'Leadership & Vision', desc: 'Inspired by UAE\'s forward-thinking leadership, students develop strategic vision and decisive action.', icon: Crown, color: '#D4A843' },
  { title: 'Innovation & Excellence', desc: 'Aligned with UAE Innovation Strategy, encouraging creative problem-solving and excellence in diplomacy.', icon: Lightbulb, color: '#0D7377' },
  { title: 'Sustainability & Global Citizenship', desc: 'Reflecting UAE\'s commitment to SDGs and global cooperation through diplomatic engagement.', icon: TreePine, color: '#059669' },
  { title: 'Cultural Diversity & Tolerance', desc: 'Embracing UAE\'s multicultural society, fostering respect and understanding across cultures.', icon: Heart, color: '#1B3A4B' },
]

// ============================================================
// STUDENT PATHWAY PANEL
// ============================================================

function StudentPathwayPanel({ userXp }: { userXp: number }) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  const currentLevelIdx = LEARNING_LEVELS.findIndex(
    (l, i) => userXp >= l.xpMin && (i === LEARNING_LEVELS.length - 1 || userXp < LEARNING_LEVELS[i + 1].xpMin)
  )
  const currentLevel = LEARNING_LEVELS[currentLevelIdx >= 0 ? currentLevelIdx : 0]
  const xpInLevel = userXp - currentLevel.xpMin
  const xpNeeded = currentLevel.xpMax - currentLevel.xpMin
  const levelProgress = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100)

  return (
    <div className="space-y-5">
      {/* Learning Journey Roadmap */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-[#0D7377]/20 bg-gradient-to-r from-[#0D7377]/5 to-[#D4A843]/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#1B3A4B] text-base">
              <Flame className="w-5 h-5 text-[#D4A843]" />
              Your Learning Journey
            </CardTitle>
            <CardDescription>
              Level {currentLevelIdx + 1} — {currentLevel.name} Delegate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {LEARNING_LEVELS.map((level, i) => {
                const isUnlocked = i <= currentLevelIdx
                const isCurrent = i === currentLevelIdx
                const isExpanded = expandedLevel === i
                const Icon = level.icon

                return (
                  <div key={level.name}>
                    <button
                      onClick={() => setExpandedLevel(isExpanded ? null : i)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                        isCurrent
                          ? 'bg-[#0D7377]/10 border border-[#0D7377]/20'
                          : isUnlocked
                          ? 'hover:bg-[#F5F0EB]/50'
                          : 'opacity-40 cursor-not-allowed'
                      }`}
                      disabled={!isUnlocked && !isExpanded}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-[#0D7377] text-white'
                          : isUnlocked
                          ? 'bg-[#0D7377]/10 text-[#0D7377]'
                          : 'bg-[#E8DED0] text-[#94A3B8]'
                      }`}>
                        {isUnlocked ? <Icon className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isCurrent ? 'text-[#0D7377]' : isUnlocked ? 'text-[#1B3A4B]' : 'text-[#94A3B8]'}`}>
                            {level.name}
                          </span>
                          {isCurrent && (
                            <Badge className="text-[9px] h-4 px-1.5 bg-[#0D7377] text-white border-0">Current</Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {level.xpMin}–{level.xpMax === 99999 ? '∞' : level.xpMax} XP
                          </span>
                        </div>
                        {isCurrent && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <Progress value={levelProgress} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-medium text-[#0D7377]">{levelProgress}%</span>
                          </div>
                        )}
                      </div>
                      {isUnlocked && (
                        isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isExpanded && isUnlocked && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className={`ml-11 mt-1 mb-2 p-3 rounded-lg ${level.bgClass} border`}>
                            <div className="flex items-center gap-2 mb-2">
                              <level.badgeIcon className="w-4 h-4" style={{ color: level.color }} />
                              <span className="text-xs font-semibold" style={{ color: level.color }}>{level.badgeName} Badge</span>
                            </div>
                            <div className="space-y-1 mb-2">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Skills Unlocked</span>
                              {level.skills.map((skill) => (
                                <div key={skill} className="flex items-center gap-1.5 text-xs text-[#1B3A4B]">
                                  <CheckCircle2 className="w-3 h-3" style={{ color: level.color }} />
                                  {skill}
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Required Courses</span>
                              {level.requiredCourses.map((course) => (
                                <div key={course} className="flex items-center gap-1.5 text-xs text-[#1B3A4B]">
                                  <BookOpen className="w-3 h-3 text-muted-foreground" />
                                  {course}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skill Progress & Quick Start */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Your Progress - Skill Radar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-[#E8DED0]/60 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#1B3A4B] text-base">
                <BarChart3 className="w-5 h-5 text-[#0D7377]" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SKILL_RADAR.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <skill.icon className="w-3.5 h-3.5" style={{ color: skill.color }} />
                        <span className="text-xs font-medium text-[#1B3A4B]">{skill.name}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: skill.color }}>{skill.value}%</span>
                    </div>
                    <Progress value={skill.value} className="h-1.5" />
                  </div>
                ))}
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 rounded-lg bg-[#F5F0EB]">
                    <div className="text-lg font-bold text-[#0D7377]">{userXp}</div>
                    <div className="text-[10px] text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[#F5F0EB]">
                    <div className="text-lg font-bold text-[#D4A843]">{currentLevel.name}</div>
                    <div className="text-[10px] text-muted-foreground">Current Level</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Start Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-[#E8DED0]/60 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#1B3A4B] text-base">
                <Zap className="w-5 h-5 text-[#D4A843]" />
                Quick Start
              </CardTitle>
              <CardDescription>Jump right into learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_START_CARDS.map((card, i) => (
                  <motion.button
                    key={card.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="p-3 rounded-xl border border-[#E8DED0] hover:border-[#0D7377]/30 hover:shadow-md transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${card.color}15` }}>
                      <card.icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                    <div className="text-xs font-semibold text-[#1B3A4B] group-hover:text-[#0D7377] transition-colors">{card.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{card.desc}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Zap className="w-3 h-3 text-[#D4A843]" />
                      <span className="text-[10px] font-bold text-[#D4A843]">+{card.xp} XP</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================
// TEACHER PATHWAY PANEL
// ============================================================

function TeacherPathwayPanel() {
  const completedSteps = TEACHER_CERT_STEPS.filter(s => s.done).length
  const totalSteps = TEACHER_CERT_STEPS.length
  const certProgress = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="space-y-5">
      {/* Teacher Certification Progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-[#D4A843]/20 bg-gradient-to-r from-[#D4A843]/5 to-[#1B3A4B]/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#1B3A4B] text-base">
              <Award className="w-5 h-5 text-[#D4A843]" />
              Teacher Certification
            </CardTitle>
            <CardDescription>{completedSteps} of {totalSteps} steps completed</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={certProgress} className="h-2 mb-4" />
            <div className="space-y-2">
              {TEACHER_CERT_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    step.done ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-[#F5F0EB]/50'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-[#E8DED0] text-[#94A3B8]'
                  }`}>
                    <step.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${step.done ? 'text-emerald-800' : 'text-[#1B3A4B]'}`}>
                      {step.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{step.desc}</div>
                  </div>
                  {step.done && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Teacher Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: 'Classroom Implementation', desc: 'Guides for integrating MUN into your curriculum', icon: BookOpen, color: '#0D7377' },
          { title: 'Student Performance Tracking', desc: 'Monitor delegate progress and skill development', icon: BarChart3, color: '#1B3A4B' },
          { title: 'Lesson Plan Templates', desc: 'Ready-to-use MUN lesson plans and activities', icon: FileText, color: '#D4A843' },
          { title: 'Professional Development', desc: 'Advance your MUN teaching expertise', icon: TrendingUp, color: '#7C3AED' },
        ].map((resource, i) => (
          <motion.div
            key={resource.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="border-[#E8DED0]/60 hover:border-[#0D7377]/20 hover:shadow-sm transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${resource.color}12` }}>
                    <resource.icon className="w-4.5 h-4.5" style={{ color: resource.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1B3A4B]">{resource.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{resource.desc}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* MUN Program Builder */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-[#1B3A4B]/20 bg-[#1B3A4B]/[0.03]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#1B3A4B] text-base">
              <Building2 className="w-5 h-5 text-[#1B3A4B]" />
              MUN Program Builder
            </CardTitle>
            <CardDescription>Step-by-step guide to launching a school MUN program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '1', title: 'Plan & Structure', desc: 'Define program goals, select committees, build timeline' },
                { step: '2', title: 'Train & Prepare', desc: 'Train delegates, prepare resources, assign positions' },
                { step: '3', title: 'Execute & Evaluate', desc: 'Run the conference, gather feedback, iterate' },
              ].map((item) => (
                <div key={item.step} className="p-3 rounded-lg bg-white border border-[#E8DED0]">
                  <div className="w-7 h-7 rounded-full bg-[#1B3A4B] text-white flex items-center justify-center text-xs font-bold mb-2">
                    {item.step}
                  </div>
                  <div className="text-xs font-semibold text-[#1B3A4B]">{item.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ============================================================
// SCHOOL PATHWAY PANEL
// ============================================================

function SchoolPathwayPanel() {
  const checklistItems = [
    { title: 'Create school profile', done: true },
    { title: 'Add teacher accounts', done: true },
    { title: 'Enroll student delegates', done: false },
    { title: 'Configure training pathways', done: false },
    { title: 'Set up assessment criteria', done: false },
    { title: 'Schedule first conference', done: false },
  ]
  const doneCount = checklistItems.filter(i => i.done).length

  return (
    <div className="space-y-5">
      {/* Onboarding Checklist */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-[#0D7377]/20 bg-gradient-to-r from-[#0D7377]/5 to-[#1B3A4B]/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#1B3A4B] text-base">
              <CheckCircle2 className="w-5 h-5 text-[#0D7377]" />
              Program Onboarding Checklist
            </CardTitle>
            <CardDescription>{doneCount} of {checklistItems.length} completed</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={Math.round((doneCount / checklistItems.length) * 100)} className="h-2 mb-3" />
            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div key={item.title} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    item.done ? 'bg-[#0D7377] border-[#0D7377]' : 'border-[#E8DED0]'
                  }`}>
                    {item.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-xs ${item.done ? 'text-[#0D7377] font-medium line-through' : 'text-[#1B3A4B]'}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* School Management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Training Framework', desc: 'School-wide MUN training structure', icon: GraduationCap, color: '#0D7377' },
          { title: 'Performance Analytics', desc: 'Track school-wide delegate performance', icon: BarChart3, color: '#1B3A4B' },
          { title: 'Multi-Class Management', desc: 'Organize classes, committees, and delegates', icon: Users, color: '#D4A843' },
          { title: 'Conference Management', desc: 'Plan and manage school conferences', icon: Gavel, color: '#7C3AED' },
          { title: 'Accreditation Progress', desc: 'Track DiplomatiQ school accreditation', icon: Award, color: '#059669' },
          { title: 'Teacher Coordination', desc: 'Manage and coordinate faculty advisors', icon: Briefcase, color: '#DC2626' },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="border-[#E8DED0]/60 hover:border-[#0D7377]/20 hover:shadow-sm transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}12` }}>
                    <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1B3A4B]">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// UAE VALUES SECTION
// ============================================================

function UAEValuesSection() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-[#D4A843]/20 bg-gradient-to-r from-[#FFF8F0] to-[#F5F0EB]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-[#1B3A4B] text-base">
            <Sun className="w-5 h-5 text-[#D4A843]" />
            UAE Educational Values
          </CardTitle>
          <CardDescription>
            Aligned with UAE national priorities for leadership, innovation, and global citizenship
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UAE_VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#E8DED0]/50"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${value.color}12` }}>
                  <value.icon className="w-4 h-4" style={{ color: value.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#1B3A4B]">{value.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{value.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-[#0D7377]/5 border border-[#0D7377]/10">
            <div className="flex items-center gap-1.5 text-[10px] text-[#0D7377]">
              <Globe className="w-3.5 h-3.5" />
              <span className="font-medium">Content adapted for UAE public and private school environments, respecting cultural context and educational standards.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function EnhancedTrainingHub() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<PathwayTab>('student')
  const [pathwayExpanded, setPathwayExpanded] = useState(false)

  const isSchoolAdmin = user?.role ? ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'FOUNDER', 'MASTER_ADMIN'].includes(user.role) : false
  const userXp = 150 // Default for demo; would come from gamification API

  return (
    <div className="space-y-5">
      {/* Tab-based Learning Pathway Navigation */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D7377]/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-[#0D7377]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1B3A4B] leading-tight">MUN Academy</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Structured courses to master every aspect of Model United Nations
              </p>
            </div>
          </div>

          {/* Pathway Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPathwayExpanded(!pathwayExpanded)}
            className="gap-2 border-[#0D7377]/20 text-[#0D7377] hover:bg-[#0D7377]/5"
          >
            {pathwayExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {pathwayExpanded ? 'Hide Pathways' : 'Show Pathways'}
          </Button>
        </div>
      </motion.div>

      {/* Learning Pathway Tabs - Collapsible */}
      <AnimatePresence>
        {pathwayExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-[#0D7377]/15">
              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PathwayTab)}>
                  <TabsList className="w-full grid grid-cols-2 mb-4" style={isSchoolAdmin ? { gridTemplateColumns: 'repeat(3, 1fr)' } : undefined}>
                    <TabsTrigger value="student" className="gap-1.5 text-xs">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Student Pathway
                    </TabsTrigger>
                    <TabsTrigger value="teacher" className="gap-1.5 text-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                      Teacher Pathway
                    </TabsTrigger>
                    {isSchoolAdmin && (
                      <TabsTrigger value="school" className="gap-1.5 text-xs">
                        <School className="w-3.5 h-3.5" />
                        School Pathway
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="student" className="mt-0">
                    <StudentPathwayPanel userXp={userXp} />
                  </TabsContent>
                  <TabsContent value="teacher" className="mt-0">
                    <TeacherPathwayPanel />
                  </TabsContent>
                  {isSchoolAdmin && (
                    <TabsContent value="school" className="mt-0">
                      <SchoolPathwayPanel />
                    </TabsContent>
                  )}
                </Tabs>

                {/* UAE Values - always visible in pathway section */}
                <div className="mt-5">
                  <UAEValuesSection />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing TrainingHub - Course Grid + Detail */}
      <TrainingHub />
    </div>
  )
}
