'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, Zap, Award, ChevronRight,
  Search, CheckCircle2, Lock, Play, Star, Trophy,
  Gavel, FileText, Shield, Mic, Handshake, Brain, Crown,
  Flame, Target, Users, ArrowLeft, Sparkles,
  GraduationCap, Siren, Scale, Circle, LayoutGrid, List,
  ArrowRight, Bookmark, Clock4, TrendingUp
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

const DIFFICULTY_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Beginner: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  Intermediate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  Advanced: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-500' },
  Expert: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-500' },
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

const CATEGORY_STYLE: Record<string, { gradient: string; icon: React.ElementType; accent: string }> = {
  Procedure: { gradient: 'from-teal-600 to-emerald-600', icon: Gavel, accent: '#0D9488' },
  Procedures: { gradient: 'from-teal-600 to-emerald-600', icon: Gavel, accent: '#0D9488' },
  Writing: { gradient: 'from-emerald-600 to-teal-600', icon: FileText, accent: '#059669' },
  Specialized: { gradient: 'from-rose-600 to-red-600', icon: Siren, accent: '#E11D48' },
  Crisis: { gradient: 'from-rose-600 to-red-600', icon: Siren, accent: '#E11D48' },
  Diplomacy: { gradient: 'from-amber-500 to-yellow-600', icon: Handshake, accent: '#D4A843' },
  Negotiation: { gradient: 'from-amber-500 to-yellow-600', icon: Handshake, accent: '#D4A843' },
  Communication: { gradient: 'from-violet-600 to-purple-600', icon: Mic, accent: '#7C3AED' },
  Speaking: { gradient: 'from-violet-600 to-purple-600', icon: Mic, accent: '#7C3AED' },
  Research: { gradient: 'from-slate-600 to-slate-700', icon: BookOpen, accent: '#475569' },
  Leadership: { gradient: 'from-violet-700 to-purple-700', icon: Scale, accent: '#6D28D9' },
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

const RARITY_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  Common: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  Uncommon: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Rare: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  Epic: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  Legendary: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
}

// ============================================================
// XP NOTIFICATION COMPONENT
// ============================================================

function XPNotification({ xp, visible }: { xp: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-900 shadow-2xl shadow-amber-500/25 font-bold text-sm"
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.06 }}
      className="h-full"
    >
      <Card
        className="overflow-hidden cursor-pointer group h-full flex flex-col
          bg-card border-border hover:border-primary/30
          hover:shadow-xl hover:shadow-primary/5
          transition-all duration-300 ease-out"
        onClick={() => onOpen(course.id)}
      >
        {/* Thumbnail */}
        <div className={`relative h-28 sm:h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <course.icon className="w-10 h-10 sm:w-12 sm:h-12 text-white/80 group-hover:scale-110 transition-transform duration-500 ease-out relative z-10" />

          {/* Difficulty badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${diffConfig.bg} ${diffConfig.text} backdrop-blur-sm`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
              {course.difficulty}
            </span>
          </div>

          {/* XP badge */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/25 text-white text-[10px] sm:text-xs font-semibold backdrop-blur-sm">
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
        <CardContent className="p-3.5 sm:p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          <h3 className="font-semibold text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{course.description}</p>

          {/* Meta row */}
          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground mb-2.5">
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
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-colors ${
                  progress >= 100 ? 'bg-emerald-500' :
                  progress >= 50 ? 'bg-primary' :
                  progress > 0 ? 'bg-primary/70' : 'bg-muted-foreground/20'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.06 }}
              />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right tabular-nums">
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
            <h2 key={i} className="text-base sm:text-lg font-bold mt-5 mb-2 text-foreground">
              {line.replace('## ', '')}
            </h2>
          )
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="text-sm sm:text-base font-semibold mt-4 mb-1.5 text-foreground">
              {line.replace('### ', '')}
            </h3>
          )
        }
        if (line.startsWith('- **')) {
          const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/)
          if (match) {
            return (
              <div key={i} className="flex gap-2 ml-1 sm:ml-2 mb-1.5 text-sm">
                <span className="text-primary shrink-0 mt-0.5">•</span>
                <span className="min-w-0">
                  <strong className="text-foreground">{match[1]}</strong>
                  {match[2] ? <span className="text-muted-foreground">: {match[2]}</span> : ''}
                </span>
              </div>
            )
          }
          return (
            <div key={i} className="flex gap-2 ml-1 sm:ml-2 mb-1.5 text-sm">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span className="text-muted-foreground min-w-0">{line.replace('- ', '')}</span>
            </div>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 ml-1 sm:ml-2 mb-1.5 text-sm">
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span className="text-muted-foreground min-w-0">{line.replace('- ', '')}</span>
            </div>
          )
        }
        if (/^[1-9]\.\s/.test(line)) {
          const num = line.charAt(0)
          const rest = line.substring(3)
          return (
            <div key={i} className="flex gap-2 ml-1 sm:ml-2 mb-1.5 text-sm">
              <span className="font-bold text-primary shrink-0">{num}.</span>
              <span className="text-foreground min-w-0">{rest}</span>
            </div>
          )
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />
        }
        return (
          <p key={i} className="text-sm text-foreground/80 mb-1.5 leading-relaxed break-words">
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
      className={`relative p-3 sm:p-4 rounded-xl border text-center transition-all duration-200 overflow-hidden ${
        achievement.earned
          ? `${rarityCfg.border} hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer bg-card`
          : 'border-border/50 opacity-50 bg-card/50'
      }`}
    >
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full mx-auto mb-2 flex items-center justify-center ${
        achievement.earned ? 'bg-amber-500/15' : 'bg-muted'
      }`}>
        <achievement.icon className={`w-5 h-5 sm:w-5.5 sm:h-5.5 ${achievement.earned ? 'text-amber-400' : 'text-muted-foreground/50'}`} />
      </div>
      <div className="font-semibold text-xs mb-0.5 truncate">{achievement.name}</div>
      <div className="text-[10px] sm:text-[11px] text-muted-foreground mb-1.5 leading-tight line-clamp-2 min-h-[2rem]">
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
            const style = CATEGORY_STYLE[category] || { gradient: 'from-teal-600 to-emerald-600', icon: BookOpen, accent: '#0D9488' }
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
      <div className="flex flex-col h-full min-h-0">
        <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

        {/* Scrollable detail content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="space-y-4 sm:space-y-5 pb-6">

            {/* Back button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToGrid}
                className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Courses
              </Button>
            </motion.div>

            {/* Course header card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="overflow-hidden border-border">
                <div className={`h-1.5 bg-gradient-to-r ${selectedCourse.gradient}`} />
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                    {/* Icon */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${selectedCourse.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                      <selectedCourse.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      {/* Badges row */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold ${diffConfig.bg} ${diffConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
                          {selectedCourse.difficulty}
                        </span>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium">
                          <Clock4 className="w-3 h-3 mr-1" />
                          {selectedCourse.duration}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium">
                          <Zap className="w-3 h-3 mr-1" />
                          {selectedCourse.xpReward} XP
                        </Badge>
                        {selectedCourse.roleTag && (
                          <Badge className="bg-primary/10 text-primary text-[10px] sm:text-xs font-medium border-primary/20">
                            {selectedCourse.roleTag}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1.5 leading-tight break-words">
                        {selectedCourse.title}
                      </h2>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                        {selectedCourse.description}
                      </p>

                      {/* Progress section */}
                      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex-1 max-w-full sm:max-w-xs">
                          <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1.5">
                            <span className="text-muted-foreground font-medium">Progress</span>
                            <span className="font-bold text-foreground tabular-nums">{Math.min(progress, 100)}%</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                        </div>
                        <span className="text-[11px] sm:text-xs text-muted-foreground font-medium whitespace-nowrap">
                          {completedCount}/{selectedCourse.lessons.length} lessons completed
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lesson area — sidebar + content */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-4 sm:gap-5">
              {/* Lesson list */}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <Card className="overflow-hidden border-border h-full">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Lessons
                      <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                        {completedCount}/{selectedCourse.lessons.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="max-h-[280px] sm:max-h-[350px] lg:max-h-[460px]">
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
                                  ? 'bg-primary/10 border border-primary/25'
                                  : isLocked
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-muted/80 border border-transparent'
                              }`}
                            >
                              {/* Step indicator */}
                              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-bold ${
                                isDone
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : isActive
                                  ? 'bg-primary/15 text-primary'
                                  : isLocked
                                  ? 'bg-muted text-muted-foreground/40'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : isLocked ? <Lock className="w-3 h-3" /> : i + 1}
                              </div>

                              {/* Lesson info */}
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className={`font-medium text-xs sm:text-sm truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                  {lesson.title}
                                </div>
                                <div className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock4 className="w-2.5 h-2.5 shrink-0" />
                                  <span>{lesson.duration}</span>
                                </div>
                              </div>

                              {/* Active indicator */}
                              {isActive && (
                                <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
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
                <Card className="overflow-hidden border-border min-h-[350px] sm:min-h-[400px] flex flex-col">
                  {activeLesson ? (
                    <>
                      {/* Lesson header */}
                      <CardHeader className="pb-3 pt-4 px-4 sm:px-5 shrink-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 overflow-hidden">
                            <CardTitle className="text-base sm:text-lg font-bold text-foreground break-words leading-snug">
                              {activeLesson.title}
                            </CardTitle>
                            {activeLesson.description && (
                              <CardDescription className="mt-1 text-xs sm:text-sm break-words">
                                {activeLesson.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] sm:text-xs font-medium shrink-0 whitespace-nowrap">
                            <Clock4 className="w-3 h-3 mr-1" />
                            {activeLesson.duration}
                          </Badge>
                        </div>
                      </CardHeader>

                      <Separator />

                      {/* Lesson body — scrollable */}
                      <CardContent className="flex-1 overflow-hidden p-4 sm:p-5">
                        <ScrollArea className="h-full max-h-[280px] sm:max-h-[350px] lg:max-h-[420px]">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <LessonContent content={activeLesson.content} />
                          </motion.div>
                        </ScrollArea>
                      </CardContent>

                      <Separator />

                      {/* Mark Complete footer */}
                      <div className="px-4 sm:px-5 py-3 sm:py-4 shrink-0">
                        {completedLessons[activeLesson.id] ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="w-4.5 h-4.5" />
                            <span className="font-semibold text-sm">Lesson Completed</span>
                          </div>
                        ) : (
                          <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm"
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
                    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-foreground mb-1">Select a Lesson</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-[240px]">
                        Choose a lesson from the sidebar to begin learning
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
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
    <div className="flex flex-col h-full min-h-0">
      <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

      {/* Scrollable grid content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="space-y-5 sm:space-y-6 pb-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">MUN Academy</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Structured courses to master every aspect of Model United Nations
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats / Achievement bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <Card className="overflow-hidden border-border">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-900">
                <CardContent className="p-3.5 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Level & XP */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                        <Crown className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-bold text-sm sm:text-base">{userLevel} Level</div>
                        <div className="text-slate-400 text-[11px] sm:text-xs font-medium">
                          {userXp.toLocaleString()} XP earned
                        </div>
                      </div>
                    </div>

                    {/* Streak & badges */}
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-amber-400 text-xs sm:text-sm font-bold whitespace-nowrap">
                          {streak}-day streak
                        </span>
                      </div>
                      <div className="w-px h-4 bg-slate-700" />
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-slate-400 text-[11px] sm:text-xs font-medium whitespace-nowrap">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border"
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
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-card text-muted-foreground hover:bg-muted border border-border hover:text-foreground'
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
                <div key={i} className="h-64 bg-muted/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-1">No courses found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-[280px]">
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
            <Card className="overflow-hidden border-border">
              <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <CardTitle className="text-sm sm:text-base font-bold text-foreground">Achievements</CardTitle>
                      <CardDescription className="text-[11px] sm:text-xs">
                        Track your progress and unlock rewards
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs font-semibold shrink-0">
                    <Award className="w-3 h-3 mr-1" />
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
      </div>
    </div>
  )
}
