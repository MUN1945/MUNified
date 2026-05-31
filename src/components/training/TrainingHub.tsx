'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, Zap, Award, ChevronRight, ChevronLeft,
  Search, Filter, CheckCircle2, Lock, Play, Star, Trophy,
  Gavel, FileText, Shield, Mic, Handshake, Brain, Crown,
  Flame, Target, Users, ArrowLeft, Sparkles, Eye,
  GraduationCap, Siren, Scale, BadgeCheck, Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-[#059669]/10 text-[#059669]',
  Intermediate: 'bg-[#D4A843]/10 text-[#D4A843]',
  Advanced: 'bg-[#E11D48]/10 text-[#E11D48]',
  Expert: 'bg-purple-500/10 text-purple-600',
}

const DIFFICULTY_ORDER: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
}

// Map API difficulty enum to display format
const DIFFICULTY_MAP: Record<string, Difficulty> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  EXPERT: 'Expert',
}

// Map categories to gradients and icons for courses from the API
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

// Map API targetRole to display roleTag
const ROLE_TAG_MAP: Record<string, string> = {
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

const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-gray-500/10 text-gray-600',
  Uncommon: 'bg-green-500/10 text-green-600',
  Rare: 'bg-blue-500/10 text-blue-600',
  Epic: 'bg-purple-500/10 text-purple-600',
  Legendary: 'bg-[#D4A843]/10 text-[#D4A843]',
}

// ============================================================
// XP NOTIFICATION COMPONENT
// ============================================================

function XPNotification({ xp, visible }: { xp: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#D4A843] text-[#1B3A4B] shadow-lg font-semibold"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
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

          // Map API courses to local Course type
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
          const completedMap: Record<string, boolean> = {}

          for (const e of data as Record<string, unknown>[]) {
            const courseId = String(e.courseId || (e.course as Record<string, unknown>)?.id || '')
            const enrollmentId = String(e.id || '')
            const progress = Number(e.progress || 0)
            const completed = Boolean(e.completed)

            if (courseId) {
              enrollmentMap[courseId] = { id: enrollmentId, courseId, progress, completed }
            }

            // Derive completed lessons from enrollment progress
            if (completed && courseId) {
              const course = (data as Record<string, unknown>[]).length > 0
                ? (await coursesRes).status === 'fulfilled'
                  ? null // We'll handle this below after courses are set
                : null
                : null
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
        // If enrollment progress > 0, mark proportional lessons as completed
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

    // Sort by difficulty order, then by course order
    filtered.sort((a, b) => {
      const diffA = DIFFICULTY_ORDER[a.difficulty] || 99
      const diffB = DIFFICULTY_ORDER[b.difficulty] || 99
      if (diffA !== diffB) return diffA - diffB
      return a.order - b.order
    })

    return filtered
  }, [searchQuery, filterTab, completedLessons, courses])

  const getCourseProgress = useCallback((course: Course) => {
    // Check API enrollment progress first
    const enrollment = apiEnrollments[course.id]
    if (enrollment && enrollment.progress > 0) return enrollment.progress
    // Fall back to local lesson tracking
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
    // Update local state immediately for responsiveness
    setCompletedLessons(prev => ({ ...prev, [lessonId]: true }))
    setXpNotification({ xp: xpReward, visible: true })
    setTimeout(() => setXpNotification(prev => ({ ...prev, visible: false })), 3000)

    // Persist progress via the enrollments API
    const course = courses.find(c => c.lessons.some(l => l.id === lessonId))
    if (!course) return

    const enrollment = apiEnrollments[course.id]
    const totalLessons = course.lessons.length
    const completedCount = course.lessons.filter(l =>
      l.id === lessonId || completedLessons[l.id]
    ).length + 1 // +1 for the lesson being marked now
    const progress = Math.round((completedCount / totalLessons) * 100)

    try {
      if (enrollment) {
        // Update existing enrollment
        await fetch('/api/enrollments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
            progress,
          }),
        })
        // Update local enrollment state
        setApiEnrollments(prev => ({
          ...prev,
          [course.id]: {
            ...prev[course.id],
            progress,
            completed: progress >= 100,
          },
        }))
      } else {
        // Enroll first, then update progress
        const enrollRes = await fetch('/api/enrollments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id }),
        })
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json()
          const newEnrollmentId = enrollData.data?.id
          if (newEnrollmentId) {
            // Now update progress
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

      // Refresh gamification data if course is completed
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

  // COURSE DETAIL VIEW
  if (view === 'detail' && selectedCourse) {
    const progress = getCourseProgress(selectedCourse)
    const completedCount = selectedCourse.lessons.filter(l => completedLessons[l.id]).length
    const activeLesson = selectedCourse.lessons.find(l => l.id === activeLessonId) || null

    return (
      <div className="space-y-6">
        <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="sm" onClick={handleBackToGrid} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Button>
        </motion.div>

        {/* Course header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${selectedCourse.gradient}`} />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedCourse.gradient} flex items-center justify-center shrink-0`}>
                  <selectedCourse.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge className={DIFFICULTY_COLORS[selectedCourse.difficulty]}>{selectedCourse.difficulty}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" /> {selectedCourse.duration}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" /> {selectedCourse.xpReward} XP
                    </Badge>
                    {selectedCourse.roleTag && (
                      <Badge className="bg-[#0D7377]/10 text-[#0D7377] text-xs">{selectedCourse.roleTag}</Badge>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{selectedCourse.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <span className="text-xs text-muted-foreground">{completedCount}/{selectedCourse.lessons.length} lessons</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Lesson list */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Lessons</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[500px]">
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
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all text-sm ${
                            isActive ? 'bg-[#0D7377]/10 border border-[#0D7377]/30' :
                            isLocked ? 'opacity-50 cursor-not-allowed' :
                            'hover:bg-muted'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                            isDone ? 'bg-[#059669]/15 text-[#059669]' :
                            isActive ? 'bg-[#0D7377]/15 text-[#0D7377]' :
                            isLocked ? 'bg-muted text-muted-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-3 h-3" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${isActive ? 'text-[#0D7377]' : ''}`}>{lesson.title}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" /> {lesson.duration}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lesson content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="min-h-[400px]">
              {activeLesson ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{activeLesson.title}</CardTitle>
                        <CardDescription className="mt-1">{activeLesson.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" /> {activeLesson.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[400px]">
                      <motion.div
                        className="prose prose-sm max-w-none text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {activeLesson.content.split('\n').map((line, i) => {
                          if (line.startsWith('## ')) {
                            return <h2 key={i} className="text-lg font-bold mt-6 mb-2 text-foreground">{line.replace('## ', '')}</h2>
                          } else if (line.startsWith('### ')) {
                            return <h3 key={i} className="text-base font-semibold mt-4 mb-1 text-foreground">{line.replace('### ', '')}</h3>
                          } else if (line.startsWith('- **')) {
                            const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/)
                            if (match) {
                              return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="text-[#0D7377]">•</span><span><strong className="text-foreground">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}</span></div>
                            }
                            return <div key={i} className="ml-2 mb-1">• {line.replace('- ', '')}</div>
                          } else if (line.startsWith('- ')) {
                            return <div key={i} className="ml-2 mb-1 text-muted-foreground">• {line.replace('- ', '')}</div>
                          } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') || line.startsWith('7. ') || line.startsWith('8. ')) {
                            const num = line.charAt(0)
                            const rest = line.substring(3)
                            return <div key={i} className="flex gap-2 ml-2 mb-1"><span className="font-semibold text-[#0D7377]">{num}.</span><span className="text-foreground">{rest}</span></div>
                          } else if (line.trim() === '') {
                            return <div key={i} className="h-2" />
                          } else {
                            return <p key={i} className="text-sm text-foreground/80 mb-1">{line}</p>
                          }
                        })}
                      </motion.div>
                    </ScrollArea>

                    {/* Mark Complete button */}
                    <div className="mt-6 pt-4 border-t">
                      {completedLessons[activeLesson.id] ? (
                        <div className="flex items-center gap-2 text-[#059669]">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium text-sm">Lesson Completed</span>
                        </div>
                      ) : (
                        <Button
                          className="bg-[#0D7377] hover:bg-[#0D7377]/90 text-white"
                          onClick={() => handleMarkComplete(activeLesson.id, Math.round(selectedCourse.xpReward / selectedCourse.lessons.length))}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="font-semibold text-lg mb-1">Select a lesson</h3>
                  <p className="text-sm text-muted-foreground">Choose a lesson from the list to begin learning</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // COURSE GRID VIEW (default)
  return (
    <div className="space-y-6">
      <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold">MUN Academy</h2>
        <p className="text-muted-foreground mt-1">Structured courses to master every aspect of Model United Nations</p>
      </motion.div>

      {/* Achievement bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
        <Card className="bg-gradient-to-r from-[#1B3A4B] to-[#243656] border-[#D4A843]/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4A843]/15 flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#D4A843]" />
              </div>
              <div>
                <div className="text-white font-semibold">{userLevel} Level</div>
                <div className="text-white/50 text-xs">{userXp.toLocaleString()} XP earned</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[#D4A843]">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">{streak}-day streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60">
                <Award className="w-4 h-4" />
                <span className="text-xs">{ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length} badges</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'my-courses', label: 'My Courses' },
              { value: 'by-role', label: 'By Role' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'expert', label: 'Expert' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterTab(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterTab === f.value
                    ? 'bg-[#0D7377] text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCourses.map((course, i) => {
          const progress = getCourseProgress(course)
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <Card
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 hover:border-[#0D7377]/30 h-full flex flex-col"
                onClick={() => handleOpenCourse(course.id)}
              >
                {/* Thumbnail */}
                <div className={`relative h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                  <course.icon className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge className={DIFFICULTY_COLORS[course.difficulty]}>{course.difficulty}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-white/70" />
                    <span className="text-xs text-white/80 font-medium">{course.xpReward} XP</span>
                  </div>
                  {course.roleTag && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-white/20 text-white text-[10px] backdrop-blur-sm">{course.roleTag}</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm mb-1.5 group-hover:text-[#0D7377] transition-colors leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.lessons.length} lessons</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${progress >= 80 ? 'bg-[#059669]' : progress > 0 ? 'bg-[#0D7377]' : 'bg-muted-foreground/30'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground w-7 text-right">{progress}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Achievements Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Achievements</CardTitle>
                <CardDescription>Track your progress and unlock rewards</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Award className="w-3 h-3 mr-1" /> {ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ACHIEVEMENTS.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    achievement.earned
                      ? 'hover:border-[#D4A843]/30 hover:shadow-sm cursor-pointer'
                      : 'opacity-40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    achievement.earned ? 'bg-[#D4A843]/15' : 'bg-muted'
                  }`}>
                    <achievement.icon className={`w-5 h-5 ${achievement.earned ? 'text-[#D4A843]' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="font-medium text-xs mb-0.5">{achievement.name}</div>
                  <div className="text-[10px] text-muted-foreground mb-1.5 leading-tight">{achievement.description}</div>
                  <Badge className={`text-[8px] ${RARITY_COLORS[achievement.rarity]}`}>{achievement.rarity}</Badge>
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
