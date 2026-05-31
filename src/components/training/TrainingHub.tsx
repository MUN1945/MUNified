'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, Zap, Award, ChevronRight,
  Search, CheckCircle2, Lock, Play, Trophy,
  Gavel, FileText, Shield, Mic, Handshake, Crown,
  Flame, Users, ArrowLeft,
  GraduationCap, Siren, Scale, BadgeCheck,
  Settings, Lightbulb, AlertTriangle, Crosshair, CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================================
// TYPES & CONSTANTS
// ============================================================

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  content: string
}

interface Course {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  duration: string
  xpReward: number
  gradient: string
  icon: React.ElementType
  roleTag?: string
  isTeacher?: boolean
  lessons: Lesson[]
  category: string
  order: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ElementType
  earned: boolean
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
}

interface EnrollmentData {
  id: string
  courseId: string
  progress: number
  completed: boolean
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Advanced: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  Expert: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
}

const DIFFICULTY_ORDER: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
}

const DIFFICULTY_MAP: Record<string, Difficulty> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
}

const CATEGORY_STYLE: Record<string, { gradient: string; icon: React.ElementType }> = {
  Procedure: { gradient: 'from-[#0D7377] to-[#059669]', icon: Gavel },
  Procedures: { gradient: 'from-[#0D7377] to-[#059669]', icon: Gavel },
  Writing: { gradient: 'from-[#059669] to-[#0D7377]', icon: FileText },
  Specialized: { gradient: 'from-[#E11D48] to-[#DC2626]', icon: Siren },
  Crisis: { gradient: 'from-[#E11D48] to-[#DC2626]', icon: Siren },
  Diplomacy: { gradient: 'from-[#D4A843] to-[#B8942E]', icon: Handshake },
  Negotiation: { gradient: 'from-[#D4A843] to-[#B8942E]', icon: Handshake },
  Communication: { gradient: 'from-[#7C3AED] to-[#6D28D9]', icon: Mic },
  Speaking: { gradient: 'from-[#7C3AED] to-[#6D28D9]', icon: Mic },
  Research: { gradient: 'from-[#1B3A4B] to-[#2D5A6B]', icon: BookOpen },
  Leadership: { gradient: 'from-[#7C3AED] to-[#5B21B6]', icon: Scale },
  Director: { gradient: 'from-[#7C3AED] to-[#5B21B6]', icon: GraduationCap },
  Classroom: { gradient: 'from-[#059669] to-[#047857]', icon: Users },
  Evaluation: { gradient: 'from-[#DC2626] to-[#B91C1C]', icon: BadgeCheck },
  Management: { gradient: 'from-[#F59E0B] to-[#D97706]', icon: Settings },
}

const ROLE_TAG_MAP: Record<string, string | undefined> = {
  DELEGATE: undefined,
  DELEGATE_ADVANCED: undefined,
  CHAIR: 'Chair',
  SECRETARY_GENERAL: 'Secretary-General',
  TEACHER: 'Director',
  DIRECTOR: 'Director',
  SCHOOL_ADMIN: 'Administrator',
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', name: 'First Steps', description: 'Complete your first lesson', icon: Play, earned: false, rarity: 'Common' },
  { id: 'course-complete', name: 'Graduate', description: 'Complete your first course', icon: GraduationCap, earned: false, rarity: 'Uncommon' },
  { id: 'streak-3', name: 'On Fire', description: '3-day learning streak', icon: Flame, earned: false, rarity: 'Uncommon' },
  { id: 'streak-7', name: 'Dedicated Scholar', description: '7-day learning streak', icon: Flame, earned: false, rarity: 'Rare' },
  { id: '5-courses', name: 'Renaissance Delegate', description: 'Complete 5 courses', icon: BookOpen, earned: false, rarity: 'Rare' },
  { id: 'crisis-master', name: 'Crisis Manager', description: 'Complete Crisis Committee Protocols', icon: Siren, earned: false, rarity: 'Rare' },
  { id: 'chair-cert', name: 'Certified Chair', description: 'Complete Chair Training', icon: Scale, earned: false, rarity: 'Epic' },
  { id: 'sg-cert', name: 'SG Certified', description: 'Complete SG Leadership Program', icon: Crown, earned: false, rarity: 'Legendary' },
  { id: 'orator', name: 'Skilled Orator', description: 'Complete Public Speaking course', icon: Mic, earned: false, rarity: 'Epic' },
  { id: 'resolution-pro', name: 'Resolution Pro', description: 'Complete Resolution Writing Workshop', icon: FileText, earned: false, rarity: 'Rare' },
]

const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-gray-100 text-gray-600 border-gray-200',
  Uncommon: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Rare: 'bg-sky-50 text-sky-600 border-sky-200',
  Epic: 'bg-purple-50 text-purple-600 border-purple-200',
  Legendary: 'bg-amber-50 text-amber-700 border-amber-200',
}

const RARITY_GLOW: Record<string, string> = {
  Common: '',
  Uncommon: '',
  Rare: 'shadow-sky-100/50 shadow-sm',
  Epic: 'shadow-purple-100/50 shadow-sm',
  Legendary: 'shadow-amber-200/50 shadow-md',
}

// ============================================================
// XP NOTIFICATION COMPONENT
// ============================================================

function XPNotification({ xp, visible }: { xp: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4A843] to-[#B8942E] text-[#1B3A4B] shadow-xl font-bold"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            <Zap className="w-5 h-5" />
          </motion.div>
          <span className="text-sm">+{xp} XP Earned!</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// HELPER: Format duration from minutes to human-readable
// ============================================================

function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return 'Self-paced'
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes}m`
}

// ============================================================
// LESSON CONTENT RENDERER
// ============================================================

function LessonContentRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const key = `line-${i}`

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={key} className="h-3" />)
      continue
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(
        <div key={key} className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#0D7377]/40" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      )
      continue
    }

    // ## Headers
    if (line.startsWith('## ')) {
      elements.push(
        <div key={key} className="mt-6 mb-3 flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0D7377] to-[#059669]" />
          <h2 className="text-base font-bold text-foreground tracking-tight">{line.replace('## ', '')}</h2>
        </div>
      )
      continue
    }

    // ### Subheaders
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key} className="mt-4 mb-2 text-sm font-semibold text-foreground/80 pl-3.5 border-l-2 border-[#0D7377]/30">
          {line.replace('### ', '')}
        </h3>
      )
      continue
    }

    // TIP: boxes
    if (line.startsWith('TIP:') || line.startsWith('💡')) {
      const tipText = line.startsWith('TIP:') ? line.replace('TIP:', '').trim() : line.replace('💡', '').trim()
      elements.push(
        <div key={key} className="my-3 flex gap-3 p-3.5 rounded-xl bg-sky-50 border border-sky-200/60 dark:bg-sky-950/30 dark:border-sky-800/40">
          <div className="shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-sm text-sky-800 dark:text-sky-200 leading-relaxed">{tipText}</p>
        </div>
      )
      continue
    }

    // WARNING: boxes
    if (line.startsWith('WARNING:') || line.startsWith('⚠️')) {
      const warnText = line.startsWith('WARNING:') ? line.replace('WARNING:', '').trim() : line.replace('⚠️', '').trim()
      elements.push(
        <div key={key} className="my-3 flex gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-800/40">
          <div className="shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{warnText}</p>
        </div>
      )
      continue
    }

    // KEY POINT: boxes
    if (line.startsWith('KEY POINT:') || line.startsWith('🎯')) {
      const kpText = line.startsWith('KEY POINT:') ? line.replace('KEY POINT:', '').trim() : line.replace('🎯', '').trim()
      elements.push(
        <div key={key} className="my-3 flex gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 dark:bg-emerald-950/30 dark:border-emerald-800/40">
          <div className="shrink-0 mt-0.5">
            <Crosshair className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{kpText}</p>
        </div>
      )
      continue
    }

    // CHECK: interactive checklist items
    if (line.startsWith('CHECK:') || line.startsWith('✅')) {
      const checkText = line.startsWith('CHECK:') ? line.replace('CHECK:', '').trim() : line.replace('✅', '').trim()
      const checkId = `check-${i}`
      elements.push(
        <div key={key} className="my-2 flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
          <CheckSquare className="w-4 h-4 text-[#0D7377] shrink-0 mt-0.5" />
          <span className="text-sm text-foreground/80 leading-relaxed">{checkText}</span>
        </div>
      )
      continue
    }

    // Bold bullet: - **text**
    if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/)
      if (match) {
        elements.push(
          <div key={key} className="flex gap-2.5 ml-1 mb-1.5">
            <span className="text-[#0D7377] mt-0.5 shrink-0 text-xs">&#9679;</span>
            <span className="text-sm leading-relaxed">
              <strong className="text-foreground font-semibold">{match[1]}</strong>
              {match[2] ? <span className="text-muted-foreground">: {match[2]}</span> : ''}
            </span>
          </div>
        )
        continue
      }
      // Fallback for unmatched
      elements.push(
        <div key={key} className="flex gap-2.5 ml-1 mb-1.5">
          <span className="text-[#0D7377] mt-0.5 shrink-0 text-xs">&#9679;</span>
          <span className="text-sm text-foreground leading-relaxed">{line.replace('- ', '')}</span>
        </div>
      )
      continue
    }

    // Regular bullet: - text
    if (line.startsWith('- ')) {
      elements.push(
        <div key={key} className="flex gap-2.5 ml-1 mb-1.5">
          <span className="text-[#0D7377]/60 mt-0.5 shrink-0 text-xs">&#9679;</span>
          <span className="text-sm text-muted-foreground leading-relaxed">{line.replace('- ', '')}</span>
        </div>
      )
      continue
    }

    // Numbered list: 1. text
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/)
    if (numberedMatch) {
      elements.push(
        <div key={key} className="flex gap-2.5 ml-1 mb-1.5">
          <span className="text-xs font-bold text-[#0D7377] bg-[#0D7377]/8 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            {numberedMatch[1]}
          </span>
          <span className="text-sm text-foreground leading-relaxed">{numberedMatch[2]}</span>
        </div>
      )
      continue
    }

    // Regular paragraph with **bold** support
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      }
      return <span key={j}>{part}</span>
    })
    elements.push(
      <p key={key} className="text-sm text-foreground/80 leading-relaxed mb-1">{rendered}</p>
    )
  }

  return <div className="space-y-0.5">{elements}</div>
}

// ============================================================
// LOADING SKELETON
// ============================================================

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 overflow-hidden bg-card">
          {/* Thumbnail skeleton */}
          <div className="relative h-32">
            <Skeleton className="absolute inset-0 rounded-none" />
          </div>
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-1.5 flex-1 rounded-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TrainingHub() {
  const [view, setView] = useState<'grid' | 'detail'>('grid')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('all')
  const [xpNotification, setXpNotification] = useState<{ xp: number; visible: boolean }>({ xp: 0, visible: false })
  const [loading, setLoading] = useState(true)

  // Course data from API
  const [apiCourses, setApiCourses] = useState<Course[]>([])
  const [apiEnrollments, setApiEnrollments] = useState<Record<string, EnrollmentData>>({})

  // Course completion state (local tracking for lesson-level)
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({})

  // Gamification data from API
  const [userXp, setUserXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [userLevel, setUserLevel] = useState('Observer')

  // Fetch courses, enrollments, and gamification data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [coursesRes, enrollmentsRes, gamificationRes] = await Promise.allSettled([
          fetch('/api/courses?limit=50'),
          fetch('/api/enrollments'),
          fetch('/api/gamification'),
        ])

        if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
          const raw = await coursesRes.value.json()
          const courseList = raw.data || (Array.isArray(raw) ? raw : raw.courses || [])

          const mapped = courseList.map((c: Record<string, unknown>) => {
            const category = String(c.category || 'General')
            const style = CATEGORY_STYLE[category] || { gradient: 'from-[#0D7377] to-[#059669]', icon: BookOpen }
            const difficulty = DIFFICULTY_MAP[String(c.difficulty || 'BEGINNER')] || 'Beginner'
            const targetRole = String(c.targetRole || '')
            const roleTag = c.targetRole ? (ROLE_TAG_MAP[targetRole] || String(c.targetRole)) : undefined
            const isTeacher = targetRole === 'TEACHER' || targetRole === 'DIRECTOR'

            return {
              id: String(c.id || ''),
              title: String(c.title || ''),
              description: String(c.description || ''),
              difficulty,
              duration: c.duration ? formatDuration(Number(c.duration)) : 'Self-paced',
              xpReward: Number(c.xpReward || 50),
              gradient: style.gradient,
              icon: style.icon,
              roleTag,
              isTeacher,
              lessons: Array.isArray(c.lessons) ? c.lessons.map((l: Record<string, unknown>, i: number) => ({
                id: String(l.id || `${c.id}-lesson-${i}`),
                title: String(l.title || `Lesson ${i + 1}`),
                description: '',
                duration: l.duration ? formatDuration(Number(l.duration)) : '30m',
                completed: false,
                content: String(l.content || ''),
              })) : [],
              category,
              order: Number(c.order || 0),
            } as Course
          })

          setApiCourses(mapped)
        }

        if (enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value.ok) {
          const raw = await enrollmentsRes.value.json()
          const data = raw.data || (Array.isArray(raw) ? raw : raw.enrollments || [])
          const enrollmentMap: Record<string, EnrollmentData> = {}

          for (const e of data as Record<string, unknown>[]) {
            const courseId = String(e.courseId || (e.course as Record<string, unknown>)?.id || '')
            const enrollmentId = String(e.id || '')
            const progress = Number(e.progress || 0)
            const completed = Boolean(e.completed)

            if (courseId) {
              enrollmentMap[courseId] = { id: enrollmentId, courseId, progress, completed }
            }
          }

          setApiEnrollments(enrollmentMap)
        }

        if (gamificationRes.status === 'fulfilled' && gamificationRes.value.ok) {
          const raw = await gamificationRes.value.json()
          const profile = raw.data
          if (profile) {
            setUserXp(Number(profile.xp || 0))
            setStreak(Number(profile.streak || 0))
            setUserLevel(String(profile.level || 'Observer'))
          }
        }
      } catch {
        // Silently handle - courses will be empty
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // After both courses and enrollments are loaded, derive completed lessons
  useEffect(() => {
    const completedMap: Record<string, boolean> = {}
    for (const course of apiCourses) {
      const enrollment = apiEnrollments[course.id]
      if (enrollment) {
        const totalLessons = course.lessons.length
        if (totalLessons > 0 && enrollment.progress > 0) {
          const completedCount = Math.round((enrollment.progress / 100) * totalLessons)
          for (let i = 0; i < completedCount && i < totalLessons; i++) {
            completedMap[course.lessons[i].id] = true
          }
        }
      }
    }
    if (Object.keys(completedMap).length > 0) {
      setCompletedLessons(prev => ({ ...prev, ...completedMap }))
    }
  }, [apiCourses, apiEnrollments])

  const courses = apiCourses
  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId) || null, [selectedCourseId, courses])

  const filteredCourses = useMemo(() => {
    let filtered = [...courses]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
    }
    if (filterTab === 'my-courses') {
      filtered = filtered.filter(c => c.lessons.some(l => completedLessons[l.id]))
    } else if (filterTab === 'by-role') {
      filtered = filtered.filter(c => c.roleTag)
    } else if (filterTab === 'for-teachers') {
      filtered = filtered.filter(c => c.isTeacher)
    } else if (filterTab === 'beginner') {
      filtered = filtered.filter(c => c.difficulty === 'Beginner')
    } else if (filterTab === 'intermediate') {
      filtered = filtered.filter(c => c.difficulty === 'Intermediate')
    } else if (filterTab === 'advanced') {
      filtered = filtered.filter(c => c.difficulty === 'Advanced')
    } else if (filterTab === 'expert') {
      filtered = filtered.filter(c => c.difficulty === 'Expert')
    }

    filtered.sort((a, b) => {
      const diffA = DIFFICULTY_ORDER[a.difficulty] || 99
      const diffB = DIFFICULTY_ORDER[b.difficulty] || 99
      if (diffA !== diffB) return diffA - diffB
      return a.order - b.order
    })

    return filtered
  }, [searchQuery, filterTab, completedLessons, courses])

  const getCourseProgress = useCallback((course: Course) => {
    const enrollment = apiEnrollments[course.id]
    if (enrollment && enrollment.progress > 0) return enrollment.progress
    const done = course.lessons.filter(l => completedLessons[l.id]).length
    if (course.lessons.length === 0) return 0
    return Math.round((done / course.lessons.length) * 100)
  }, [completedLessons, apiEnrollments])

  const handleOpenCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId)
    setActiveLessonId(null)
    setView('detail')
  }, [])

  const handleMarkComplete = useCallback(async (lessonId: string, xpReward: number) => {
    setCompletedLessons(prev => ({ ...prev, [lessonId]: true }))
    setXpNotification({ xp: xpReward, visible: true })
    setTimeout(() => setXpNotification(prev => ({ ...prev, visible: false })), 3000)

    const course = courses.find(c => c.lessons.some(l => l.id === lessonId))
    if (!course) return

    const enrollment = apiEnrollments[course.id]
    const totalLessons = course.lessons.length
    const completedCount = course.lessons.filter(l =>
      l.id === lessonId || completedLessons[l.id]
    ).length + 1
    const progress = Math.round((completedCount / totalLessons) * 100)

    try {
      if (enrollment) {
        await fetch('/api/enrollments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
            progress,
          }),
        })
        setApiEnrollments(prev => ({
          ...prev,
          [course.id]: {
            ...prev[course.id],
            progress,
            completed: progress >= 100,
          },
        }))
      } else {
        const enrollRes = await fetch('/api/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id }),
        })
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json()
          const newEnrollmentId = enrollData.data?.id
          if (newEnrollmentId) {
            await fetch('/api/enrollments', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                enrollmentId: newEnrollmentId,
                progress,
              }),
            })
            setApiEnrollments(prev => ({
              ...prev,
              [course.id]: { id: newEnrollmentId, courseId: course.id, progress, completed: progress >= 100 },
            }))
          }
        }
      }

      if (progress >= 100) {
        try {
          const gamRes = await fetch('/api/gamification')
          if (gamRes.ok) {
            const gamData = await gamRes.json()
            if (gamData.data) {
              setUserXp(Number(gamData.data.xp || 0))
              setStreak(Number(gamData.data.streak || 0))
              setUserLevel(String(gamData.data.level || 'Observer'))
            }
          }
        } catch {
          // Ignore gamification refresh errors
        }
      }
    } catch {
      // Progress persistence failed silently — local state is already updated
    }
  }, [courses, apiEnrollments, completedLessons])

  const handleBackToGrid = useCallback(() => {
    setView('grid')
    setSelectedCourseId(null)
    setActiveLessonId(null)
  }, [])

  // ============================================================
  // COURSE DETAIL VIEW
  // ============================================================
  if (view === 'detail' && selectedCourse) {
    const progress = getCourseProgress(selectedCourse)
    const completedCount = selectedCourse.lessons.filter(l => completedLessons[l.id]).length
    const activeLesson = selectedCourse.lessons.find(l => l.id === activeLessonId) || null

    return (
      <div className="space-y-5">
        <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToGrid}
            className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Courses</span>
          </Button>
        </motion.div>

        {/* Course header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden border-border/60">
            <div className={`h-1.5 bg-gradient-to-r ${selectedCourse.gradient}`} />
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row items-start gap-5">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedCourse.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                  <selectedCourse.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="outline" className={`text-[11px] font-medium ${DIFFICULTY_COLORS[selectedCourse.difficulty]}`}>
                      {selectedCourse.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px] font-medium gap-1">
                      <Clock className="w-3 h-3" /> {selectedCourse.duration}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px] font-medium gap-1">
                      <Zap className="w-3 h-3" /> {selectedCourse.xpReward} XP
                    </Badge>
                    {selectedCourse.roleTag && (
                      <Badge className="bg-[#0D7377]/10 text-[#0D7377] text-[11px] font-medium border border-[#0D7377]/20 gap-1">
                        <Shield className="w-3 h-3" /> {selectedCourse.roleTag}
                      </Badge>
                    )}
                    {selectedCourse.isTeacher && (
                      <Badge className="bg-purple-500/10 text-purple-600 text-[11px] font-medium border border-purple-500/20 gap-1">
                        <GraduationCap className="w-3 h-3" /> Teacher
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-foreground leading-tight mb-1.5">{selectedCourse.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{selectedCourse.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="font-semibold text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                      {completedCount}/{selectedCourse.lessons.length} lessons
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          {/* Lesson list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden border-border/60">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0D7377]" />
                  Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <ScrollArea className="max-h-[600px]">
                  <div className="space-y-0.5">
                    {selectedCourse.lessons.map((lesson, i) => {
                      const isDone = completedLessons[lesson.id]
                      const isActive = activeLessonId === lesson.id
                      const isLocked = i > 0 && !completedLessons[selectedCourse.lessons[i - 1].id] && !isDone
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => !isLocked && setActiveLessonId(lesson.id)}
                          disabled={isLocked}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 text-sm ${
                            isActive
                              ? 'bg-[#0D7377]/8 border border-[#0D7377]/20 shadow-sm'
                              : isLocked
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-muted/60 border border-transparent'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                            isDone
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : isActive
                              ? 'bg-[#0D7377]/10 text-[#0D7377]'
                              : isLocked
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-muted/60 text-muted-foreground'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate text-sm leading-tight ${isActive ? 'text-[#0D7377]' : isDone ? 'text-emerald-600' : ''}`}>
                              {lesson.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {lesson.duration}
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-[#0D7377] shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lesson content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="min-h-[500px] overflow-hidden border-border/60">
              {activeLesson ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-bold leading-tight">{activeLesson.title}</CardTitle>
                        {activeLesson.description && (
                          <CardDescription className="mt-1 text-sm">{activeLesson.description}</CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[11px] font-medium gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {activeLesson.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5 flex flex-col">
                    <ScrollArea className="max-h-[420px] flex-1">
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <LessonContentRenderer content={activeLesson.content} />
                      </motion.div>
                    </ScrollArea>

                    {/* Mark Complete button */}
                    <div className="mt-5 pt-4 border-t">
                      {completedLessons[activeLesson.id] ? (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2.5"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-emerald-600">Lesson Completed</span>
                            <span className="text-xs text-muted-foreground ml-2">+{Math.round(selectedCourse.xpReward / selectedCourse.lessons.length)} XP</span>
                          </div>
                        </motion.div>
                      ) : (
                        <Button
                          className="bg-gradient-to-r from-[#0D7377] to-[#059669] hover:from-[#0D7377]/90 hover:to-[#059669]/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          onClick={() => handleMarkComplete(activeLesson.id, Math.round(selectedCourse.xpReward / selectedCourse.lessons.length))}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5 text-foreground">Select a lesson</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">Choose a lesson from the list to begin your learning journey</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // ============================================================
  // COURSE GRID VIEW (default)
  // ============================================================
  return (
    <div className="space-y-6">
      <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">MUN Academy</h2>
          <p className="text-sm text-muted-foreground mt-1">Structured courses to master every aspect of Model United Nations</p>
        </div>
      </motion.div>

      {/* Stats Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
        <Card className="bg-gradient-to-r from-[#1B3A4B] to-[#243B4F] border-[#D4A843]/15 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#D4A843]/15 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-[#D4A843]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{userLevel} Level</div>
                  <div className="text-white/50 text-xs mt-0.5">{userXp.toLocaleString()} XP earned</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5 text-[#D4A843]">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-bold">{streak}-day streak</span>
                </div>
                <Separator orientation="vertical" className="h-5 bg-white/10" />
                <div className="flex items-center gap-1.5 text-white/60">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">{ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length} badges</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'my-courses', label: 'My Courses' },
              { value: 'by-role', label: 'By Role' },
              { value: 'for-teachers', label: 'For Teachers' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'expert', label: 'Expert' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterTab(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  filterTab === f.value
                    ? 'bg-[#0D7377] text-white shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Course Grid */}
      {loading ? (
        <CourseGridSkeleton />
      ) : (
      <>
      {filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="font-semibold text-base mb-1">No courses found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCourses.map((course, i) => {
          const progress = getCourseProgress(course)
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(0.1 + i * 0.06, 0.6) }}
            >
              <Card
                className="overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-border/50 hover:border-[#0D7377]/20 h-full flex flex-col"
                onClick={() => handleOpenCourse(course.id)}
              >
                {/* Thumbnail with gradient */}
                <div className={`relative h-28 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
                  <course.icon className="w-11 h-11 text-white/70 group-hover:scale-110 transition-transform duration-300" />
                  {/* Difficulty badge - top left */}
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="outline" className={`text-[10px] font-semibold backdrop-blur-sm ${DIFFICULTY_COLORS[course.difficulty]}`}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  {/* XP badge - top right */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <Zap className="w-3 h-3 text-white/80" />
                    <span className="text-[10px] text-white/90 font-semibold">{course.xpReward} XP</span>
                  </div>
                  {/* Role tag - bottom right */}
                  {course.roleTag && (
                    <div className="absolute bottom-2.5 right-2.5">
                      <Badge className="bg-white/15 text-white text-[9px] font-medium backdrop-blur-sm border-white/10">
                        {course.roleTag}
                      </Badge>
                    </div>
                  )}
                  {/* Teacher tag - bottom left */}
                  {course.isTeacher && (
                    <div className="absolute bottom-2.5 left-2.5">
                      <Badge className="bg-purple-500/30 text-white text-[9px] font-semibold backdrop-blur-sm border-purple-400/20 gap-0.5">
                        <GraduationCap className="w-2.5 h-2.5" /> TEACHER
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Card content */}
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm leading-snug mb-1.5 group-hover:text-[#0D7377] transition-colors duration-200 line-clamp-2 min-w-0">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed flex-1 min-w-0">
                    {course.description}
                  </p>
                  {/* Lesson count and duration */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2.5 font-medium">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {course.lessons.length} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full transition-colors duration-300 ${
                          progress >= 100 ? 'bg-emerald-500' :
                          progress >= 50 ? 'bg-[#0D7377]' :
                          progress > 0 ? 'bg-[#0D7377]/70' :
                          'bg-transparent'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground w-7 text-right tabular-nums">
                      {progress}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      )}

      {/* Achievements Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card className="overflow-hidden border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#D4A843]" />
                  Achievements
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Track your progress and unlock rewards</CardDescription>
              </div>
              <Badge variant="secondary" className="text-[11px] font-medium gap-1">
                <Award className="w-3 h-3" /> {ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ACHIEVEMENTS.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.04 }}
                  className={`p-3 rounded-xl border text-center transition-all duration-200 overflow-hidden ${
                    achievement.earned
                      ? `border-[#D4A843]/20 hover:border-[#D4A843]/40 hover:shadow-md cursor-pointer bg-gradient-to-b from-[#D4A843]/5 to-transparent ${RARITY_GLOW[achievement.rarity]}`
                      : 'border-border/40 opacity-40 bg-muted/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    achievement.earned ? 'bg-[#D4A843]/15' : 'bg-muted/60'
                  }`}>
                    <achievement.icon className={`w-5 h-5 ${achievement.earned ? 'text-[#D4A843]' : 'text-muted-foreground/50'}`} />
                  </div>
                  <div className="font-medium text-xs leading-tight mb-0.5 truncate">{achievement.name}</div>
                  <div className="text-[10px] text-muted-foreground mb-1.5 leading-tight line-clamp-2 min-h-[2rem]">{achievement.description}</div>
                  <Badge variant="outline" className={`text-[9px] font-semibold ${RARITY_COLORS[achievement.rarity]}`}>
                    {achievement.rarity}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </>
      )}
    </div>
  )
}
