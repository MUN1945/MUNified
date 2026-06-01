'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, Zap, Award, ChevronRight,
  Search, CheckCircle2, Lock, Play, Trophy,
  Gavel, FileText, Mic, Handshake, Crown,
  Flame, ArrowLeft, GraduationCap, Siren, Scale, Clock4
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useNavStore } from '@/lib/store'

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

// Light-theme safe difficulty colors — -600/-700 for text on white, -100/-50 for backgrounds
const DIFFICULTY_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  Beginner: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Intermediate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Advanced: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  Expert: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
} as Record<string, { bg: string; text: string; dot: string }>

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
}

const ROLE_TAG_MAP: Record<string, string | undefined> = {
  DELEGATE: undefined,
  DELEGATE_ADVANCED: undefined,
  CHAIR: 'Chair',
  SECRETARY_GENERAL: 'Secretary-General',
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

// Light-theme safe rarity colors
const RARITY_CONFIG: Record<string, { bg: string; text: string }> = {
  Common: { bg: 'bg-slate-100', text: 'text-slate-600' },
  Uncommon: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Rare: { bg: 'bg-sky-50', text: 'text-sky-700' },
  Epic: { bg: 'bg-purple-50', text: 'text-purple-700' },
  Legendary: { bg: 'bg-amber-50', text: 'text-amber-700' },
}

// ============================================================
// XP NOTIFICATION COMPONENT
// ============================================================

function XPNotification({ xp, visible }: { xp: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4A843] text-[#0D1B2A] shadow-2xl font-bold text-sm"
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        >
          <Zap className="w-5 h-5" />
          +{xp} XP Earned!
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
// COURSE CARD COMPONENT
// ============================================================

function CourseCard({ course, progress, index, onOpen }: {
  course: Course
  progress: number
  index: number
  onOpen: (id: string) => void
}) {
  const diffConfig = DIFFICULTY_CONFIG[course.difficulty] || DIFFICULTY_CONFIG.Beginner

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.06 }}
    >
      <Card
        className="overflow-hidden cursor-pointer group h-full flex flex-col
          bg-white hover:border-[#0D7377]/30
          hover:shadow-lg hover:shadow-[#0D7377]/5
          transition-all duration-300 ease-out"
        onClick={() => onOpen(course.id)}
      >
        {/* Thumbnail */}
        <div className={`relative h-28 sm:h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 bg-black/5" />
          <course.icon className="w-10 h-10 sm:w-12 sm:h-12 text-white/80 group-hover:scale-110 transition-transform duration-500 ease-out relative z-10" />

          {/* Difficulty badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold ${diffConfig.bg} ${diffConfig.text} backdrop-blur-sm`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
              {course.difficulty}
            </span>
          </div>

          {/* XP badge */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/25 text-white text-[10px] sm:text-xs font-bold backdrop-blur-sm">
              <Zap className="w-3 h-3" />
              {course.xpReward} XP
            </span>
          </div>

          {/* Role tag */}
          {course.roleTag && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-medium backdrop-blur-sm">
                {course.roleTag}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3.5 sm:p-4 flex-1 flex flex-col min-h-0">
          <h3 className="font-semibold text-sm leading-snug mb-1.5 group-hover:text-[#0D7377] transition-colors line-clamp-2 text-[#0D1B2A]">
            {course.title}
          </h3>
          <p className="text-xs text-[#5A6A7A] mb-3 line-clamp-2 flex-1">{course.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-[11px] text-[#5A6A7A] mb-2.5">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span>{course.lessons.length} lessons</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{course.duration}</span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#F3F5F7] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-colors ${
                  progress >= 100 ? 'bg-[#059669]' :
                  progress > 0 ? 'bg-[#0D7377]' : 'bg-[#5A6A7A]/20'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.06 }}
              />
            </div>
            <span className="text-[10px] font-semibold text-[#5A6A7A] w-8 text-right tabular-nums">
              {Math.min(progress, 100)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// LESSON CONTENT RENDERER
// ============================================================

function LessonContent({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="text-base sm:text-lg font-bold mt-5 mb-2 text-[#0D1B2A]">
              {line.replace('## ', '')}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="text-sm sm:text-base font-semibold mt-4 mb-1.5 text-[#0D1B2A]">
              {line.replace('### ', '')}
            </h3>
          )
        }
        if (line.startsWith('- **')) {
          const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/)
          if (match) {
            return (
              <div key={i} className="flex gap-2 ml-1 sm:ml-2 mb-1.5 text-sm">
                <span className="text-[#0D7377] shrink-0 mt-0.5">•</span>
                <span className="min-w-0">
                  <strong className="text-[#0D1B2A]">{match[1]}</strong>
                  {match[2] ? <span className="text-[#5A6A7A]">: {match[2]}</span> : ''}
                </span>
              </div>
            )
          }
          return (
            <div key={i} className="flex gap-2 ml-1 sm:ml-2 mb-1.5 text-sm">
              <span className="text-[#0D7377] shrink-0 mt-0.5">•</span>
              <span className="text-[#5A6A7A] min-w-0">{line.replace('- ', '')}</span>
            </div>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 ml-1 sm:ml-2 mb-1.5 text-sm">
              <span className="text-[#0D7377] shrink-0 mt-0.5">•</span>
              <span className="text-[#5A6A7A] min-w-0">{line.replace('- ', '')}</span>
            </div>
          )
        }
        if (/^[1-9]\.\s/.test(line)) {
          const num = line.charAt(0)
          const rest = line.substring(3)
          return (
            <div key={i} className="flex gap-2 ml-1 sm:ml-2 mb-1.5 text-sm">
              <span className="font-bold text-[#0D7377] shrink-0">{num}.</span>
              <span className="text-[#0D1B2A] min-w-0">{rest}</span>
            </div>
          )
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />
        }
        return (
          <p key={i} className="text-sm text-[#0D1B2A]/80 mb-1.5 leading-relaxed break-words">
            {line}
          </p>
        )
      })}
    </div>
  )
}

// ============================================================
// ACHIEVEMENT CARD COMPONENT
// ============================================================

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const rarityCfg = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.Common

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.3 + index * 0.04 }}
      className={`p-3 sm:p-4 rounded-xl border text-center transition-all duration-200 overflow-hidden ${
        achievement.earned
          ? 'border-[#D4A843]/30 hover:shadow-md cursor-pointer bg-white'
          : 'border-[#E0E5EA] opacity-50 bg-white/50'
      }`}
    >
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full mx-auto mb-2 flex items-center justify-center ${
        achievement.earned ? 'bg-[#D4A843]/15' : 'bg-[#F3F5F7]'
      }`}>
        <achievement.icon className={`w-5 h-5 ${achievement.earned ? 'text-[#D4A843]' : 'text-[#5A6A7A]/40'}`} />
      </div>
      <div className="font-semibold text-xs mb-0.5 text-[#0D1B2A] truncate">{achievement.name}</div>
      <div className="text-[10px] sm:text-[11px] text-[#5A6A7A] mb-1.5 leading-tight line-clamp-2 min-h-[2rem]">
        {achievement.description}
      </div>
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold ${rarityCfg.bg} ${rarityCfg.text}`}>
        {achievement.rarity}
      </span>
    </motion.div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TrainingHub() {
  const { navigate } = useNavStore()
  const [view, setView] = useState<'grid' | 'detail'>('grid')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('all')
  const [xpNotification, setXpNotification] = useState<{ xp: number; visible: boolean }>({ xp: 0, visible: false })
  const [loading, setLoading] = useState(true)

  const [apiCourses, setApiCourses] = useState<Course[]>([])
  const [apiEnrollments, setApiEnrollments] = useState<Record<string, EnrollmentData>>({})
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({})

  const [userXp, setUserXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [userLevel, setUserLevel] = useState('Observer')

  // Fetch all data
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
            const roleTag = c.targetRole ? (ROLE_TAG_MAP[String(c.targetRole)] || String(c.targetRole)) : undefined

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
        // Silently handle
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Derive completed lessons from enrollment progress
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
    if (enrollment && enrollment.progress > 0) return Math.min(enrollment.progress, 100)
    const done = course.lessons.filter(l => completedLessons[l.id]).length
    if (course.lessons.length === 0) return 0
    return Math.min(Math.round((done / course.lessons.length) * 100), 100)
  }, [completedLessons, apiEnrollments])

  const handleOpenCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId)
    setActiveLessonId(null)
    setView('detail')
  }, [])

  const handleMarkComplete = useCallback(async (lessonId: string, xpReward: number) => {
    if (completedLessons[lessonId]) return

    setCompletedLessons(prev => ({ ...prev, [lessonId]: true }))
    setXpNotification({ xp: xpReward, visible: true })
    setTimeout(() => setXpNotification(prev => ({ ...prev, visible: false })), 3000)

    const course = courses.find(c => c.lessons.some(l => l.id === lessonId))
    if (!course) return

    const enrollment = apiEnrollments[course.id]
    const totalLessons = course.lessons.length
    const previouslyCompleted = course.lessons.filter(l => completedLessons[l.id] && l.id !== lessonId).length
    const completedCount = previouslyCompleted + 1
    const progress = Math.min(Math.round((completedCount / totalLessons) * 100), 100)

    try {
      if (enrollment) {
        await fetch('/api/enrollments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrollmentId: enrollment.id, progress }),
        })
        setApiEnrollments(prev => ({
          ...prev,
          [course.id]: { ...prev[course.id], progress, completed: progress >= 100 },
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
              body: JSON.stringify({ enrollmentId: newEnrollmentId, progress }),
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
        } catch { /* Ignore */ }
      }
    } catch { /* Local state already updated */ }
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
    const diffConfig = DIFFICULTY_CONFIG[selectedCourse.difficulty] || DIFFICULTY_CONFIG.Beginner

    return (
      <div className="space-y-5">
        <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToGrid}
            className="gap-2 text-[#5A6A7A] hover:text-[#0D1B2A] -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
        </motion.div>

        {/* Course header card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="overflow-hidden border-[#E0E5EA] bg-white">
            <div className={`h-1.5 bg-gradient-to-r ${selectedCourse.gradient}`} />
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${selectedCourse.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                  <selectedCourse.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold ${diffConfig.bg} ${diffConfig.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
                      {selectedCourse.difficulty}
                    </span>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium bg-[#F3F5F7] text-[#0D1B2A]">
                      <Clock4 className="w-3 h-3 mr-1 text-[#5A6A7A]" />
                      {selectedCourse.duration}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium bg-[#F3F5F7] text-[#0D1B2A]">
                      <Zap className="w-3 h-3 mr-1 text-[#5A6A7A]" />
                      {selectedCourse.xpReward} XP
                    </Badge>
                    {selectedCourse.roleTag && (
                      <Badge className="bg-[#0D7377]/10 text-[#0D7377] text-[10px] sm:text-xs font-medium border-[#0D7377]/20">
                        {selectedCourse.roleTag}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0D1B2A] mb-1.5 leading-tight break-words">
                    {selectedCourse.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#5A6A7A] leading-relaxed break-words">
                    {selectedCourse.description}
                  </p>

                  {/* Progress section */}
                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex-1 max-w-full sm:max-w-xs">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1.5">
                        <span className="text-[#5A6A7A] font-medium">Progress</span>
                        <span className="font-bold text-[#0D1B2A] tabular-nums">{Math.min(progress, 100)}%</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>
                    <span className="text-[11px] sm:text-xs text-[#5A6A7A] font-medium whitespace-nowrap">
                      {completedCount}/{selectedCourse.lessons.length} lessons completed
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lesson area — sidebar + content */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 sm:gap-5">
          {/* Lesson list sidebar */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="overflow-hidden border-[#E0E5EA] bg-white">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs sm:text-sm font-semibold text-[#0D1B2A] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0D7377]" />
                  Lessons
                  <span className="ml-auto text-[10px] font-normal text-[#5A6A7A]">
                    {completedCount}/{selectedCourse.lessons.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[320px] lg:max-h-[500px]">
                  <div className="space-y-0.5 px-2 pb-2">
                    {selectedCourse.lessons.map((lesson, i) => {
                      const isDone = completedLessons[lesson.id]
                      const isActive = activeLessonId === lesson.id
                      const isLocked = i > 0 && !completedLessons[selectedCourse.lessons[i - 1].id] && !isDone

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => !isLocked && setActiveLessonId(lesson.id)}
                          disabled={isLocked}
                          className={`w-full flex items-center gap-2.5 p-2.5 sm:p-3 rounded-lg text-left transition-all duration-150 text-sm ${
                            isActive
                              ? 'bg-[#0D7377]/8 border border-[#0D7377]/20'
                              : isLocked
                              ? 'opacity-40 cursor-not-allowed border border-transparent'
                              : 'hover:bg-[#F3F5F7] border border-transparent'
                          }`}
                        >
                          {/* Step indicator */}
                          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold ${
                            isDone
                              ? 'bg-[#059669]/10 text-[#059669]'
                              : isActive
                              ? 'bg-[#0D7377]/10 text-[#0D7377]'
                              : isLocked
                              ? 'bg-[#F3F5F7] text-[#5A6A7A]/40'
                              : 'bg-[#F3F5F7] text-[#5A6A7A]'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : isLocked ? <Lock className="w-3 h-3" /> : i + 1}
                          </div>

                          {/* Lesson info — wrap text instead of truncating */}
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-xs sm:text-sm leading-snug ${
                              isActive ? 'text-[#0D7377]' : 'text-[#0D1B2A]'
                            }`}>
                              {lesson.title}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-[#5A6A7A] flex items-center gap-1 mt-0.5">
                              <Clock4 className="w-2.5 h-2.5 shrink-0" />
                              <span>{lesson.duration}</span>
                            </div>
                          </div>

                          {/* Active indicator */}
                          {isActive && (
                            <ChevronRight className="w-3.5 h-3.5 text-[#0D7377] shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lesson content viewer */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card className="overflow-hidden border-[#E0E5EA] bg-white">
              {activeLesson ? (
                <>
                  {/* Lesson header */}
                  <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg font-bold text-[#0D1B2A] break-words leading-snug">
                          {activeLesson.title}
                        </CardTitle>
                        {activeLesson.description && (
                          <CardDescription className="mt-1 text-xs sm:text-sm text-[#5A6A7A] break-words">
                            {activeLesson.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium bg-[#F3F5F7] text-[#0D1B2A] shrink-0 whitespace-nowrap">
                        <Clock4 className="w-3 h-3 mr-1 text-[#5A6A7A]" />
                        {activeLesson.duration}
                      </Badge>
                    </div>
                  </CardHeader>

                  <Separator className="bg-[#E0E5EA]" />

                  {/* Lesson body — scrollable */}
                  <CardContent className="p-4 sm:p-5">
                    <ScrollArea className="max-h-[400px] lg:max-h-[500px]">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LessonContent content={activeLesson.content} />
                      </motion.div>
                    </ScrollArea>
                  </CardContent>

                  <Separator className="bg-[#E0E5EA]" />

                  {/* Mark Complete footer */}
                  <div className="px-4 sm:px-5 py-3 sm:py-4">
                    {completedLessons[activeLesson.id] ? (
                      <div className="flex items-center gap-2 text-[#059669]">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span className="font-semibold text-sm">Lesson Completed</span>
                      </div>
                    ) : (
                      <Button
                        className="bg-[#0D7377] hover:bg-[#0D7377]/90 text-white font-semibold text-sm shadow-sm"
                        onClick={() => handleMarkComplete(activeLesson.id, Math.round(selectedCourse.xpReward / Math.max(selectedCourse.lessons.length, 1)))}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                  <div className="w-16 h-16 rounded-2xl bg-[#F3F5F7] flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-[#5A6A7A]/40" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-[#0D1B2A] mb-1">Select a Lesson</h3>
                  <p className="text-xs sm:text-sm text-[#5A6A7A] max-w-[240px]">
                    Choose a lesson from the sidebar to begin learning
                  </p>
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

  const filterPills = [
    { value: 'all', label: 'All Courses' },
    { value: 'my-courses', label: 'My Courses' },
    { value: 'by-role', label: 'By Role' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#0D7377]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-[#0D7377]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0D1B2A] leading-tight">MUN Academy</h2>
            <p className="text-xs sm:text-sm text-[#5A6A7A] mt-0.5">
              Structured courses to master every aspect of Model United Nations
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats / Achievement bar — dark navy card matching sidebar aesthetic */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <Card className="overflow-hidden border-0">
          <div className="bg-gradient-to-r from-[#1B3A4B] to-[#243656]">
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                {/* Level & XP */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#D4A843]/15 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-[#D4A843]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-sm sm:text-base">{userLevel} Level</div>
                    <div className="text-white/50 text-[11px] sm:text-xs font-medium">
                      {userXp.toLocaleString()} XP earned
                    </div>
                  </div>
                </div>

                {/* Streak & badges */}
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-[#D4A843] shrink-0" />
                    <span className="text-[#D4A843] text-xs sm:text-sm font-bold whitespace-nowrap">
                      {streak}-day streak
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="text-white/50 text-[11px] sm:text-xs font-medium whitespace-nowrap">
                      {ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length} badges
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A7A]" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#E0E5EA] text-[#0D1B2A]"
              disabled={loading}
            />
          </div>

          {/* Filter pills — horizontally scrollable on mobile */}
          <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex items-center gap-1.5 pb-1" style={{ minWidth: 'max-content' }}>
              {filterPills.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterTab(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                    filterTab === f.value
                      ? 'bg-[#0D7377] text-white shadow-sm'
                      : 'bg-white text-[#5A6A7A] hover:bg-[#F3F5F7] border border-[#E0E5EA] hover:text-[#0D1B2A]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </motion.div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-[#F3F5F7] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#F3F5F7] flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#5A6A7A]/40" />
          </div>
          <h3 className="font-bold text-base text-[#0D1B2A] mb-1">No courses found</h3>
          <p className="text-xs sm:text-sm text-[#5A6A7A] max-w-[280px]">
            Try adjusting your search or filters to find what you&apos;re looking for
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredCourses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={getCourseProgress(course)}
              index={i}
              onOpen={handleOpenCourse}
            />
          ))}
        </div>
      )}

      {/* Achievements Section */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="overflow-hidden border-[#E0E5EA] bg-white">
          <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-[#D4A843]" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base font-bold text-[#0D1B2A]">Achievements</CardTitle>
                  <CardDescription className="text-[11px] sm:text-xs text-[#5A6A7A]">
                    Track your progress and unlock rewards
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-semibold bg-[#F3F5F7] text-[#0D1B2A] shrink-0">
                <Award className="w-3 h-3 mr-1 text-[#5A6A7A]" />
                {ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-4 sm:pb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
              {ACHIEVEMENTS.map((achievement, i) => (
                <AchievementCard key={achievement.id} achievement={achievement} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
