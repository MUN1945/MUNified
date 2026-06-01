'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, BookOpen, Users, BarChart3, MessageSquare,
  ChevronRight, Star, Trophy, Target, Clock, MapPin,
  Shield, GraduationCap, Crown, Gavel,
  Mic, Handshake, Brain, ArrowRight, Flame, Eye,
  ClipboardList, Sparkles, CalendarDays, Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuthStore, useAppStore, useNavStore, getCurrentLevel, getNextLevel, getXPProgress, type DelegateProfile, type BadgeData, type CourseData, type ConferenceData } from '@/lib/store'

// ============================================================
// COUNT-UP ANIMATION HOOK
// ============================================================

function useCountUp(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(start + (target - start) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return count
}

// ============================================================
// STAT CARD WITH COUNT-UP
// ============================================================

function StatCard({
  label, value, icon: Icon, color, bgColor, delay, suffix
}: {
  label: string; value: number; icon: React.ElementType;
  color: string; bgColor: string; delay: number; suffix?: string
}) {
  const countedValue = useCountUp(value, 1200)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer border-[#E8DED0]/60">
        <CardContent className="p-4">
          <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="text-2xl font-bold text-[#1B3A4B]">
            {countedValue}{suffix || ''}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// MUN ROLE DISPLAY
// ============================================================

function getMUNRoleFull(munRole?: string): string {
  const map: Record<string, string> = {
    SECRETARY_GENERAL: 'Secretary-General',
    DIRECTOR_GENERAL: 'Director-General',
    CHAIR: 'Committee Chair',
    DELEGATE: 'Delegate',
    DELEGATE_ADVANCED: 'Advanced Delegate',
    SDG_AMBASSADOR: 'SDG Ambassador',
    RAPPORTEUR: 'Rapporteur',
  }
  return map[munRole || ''] || 'Delegate'
}

// ============================================================
// LOADING SKELETON
// ============================================================

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-[#F5F0EB] rounded-xl" />
      <div className="h-28 bg-[#F5F0EB] rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-[#F5F0EB] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-[#F5F0EB] rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// ERROR STATE
// ============================================================

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-muted-foreground text-sm mb-4">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  )
}

// ============================================================
// STUDENT DASHBOARD
// ============================================================

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const { navigate } = useNavStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Local state loaded from API
  const [delegateProfile, setDelegateProfile] = useState<DelegateProfile | null>(null)
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [courses, setCourses] = useState<CourseData[]>([])
  const [conferences, setConferences] = useState<ConferenceData[]>([])
  const [conductAcknowledged, setConductAcknowledged] = useState<boolean | null>(null)
  const [conductAcknowledgedAt, setConductAcknowledgedAt] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [analyticsRes, coursesRes, assessmentsRes] = await Promise.allSettled([
        fetch('/api/analytics'),
        fetch('/api/courses'),
        fetch('/api/assessments'),
      ])

      // Process analytics (student stats)
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        const analyticsData = await analyticsRes.value.json()
        const d = analyticsData.data || analyticsData
        if (d.delegateProfile) {
          setDelegateProfile(d.delegateProfile)
        } else if (d.overview) {
          // Build profile from overview data
          setDelegateProfile({
            xp: d.overview.totalXP || 0,
            level: d.overview.level || 'OBSERVER',
            streak: d.overview.streak || 0,
            longestStreak: d.overview.longestStreak || 0,
            conferencesAttended: d.overview.conferencesAttended || 0,
            committeesServed: d.overview.committeesServed || 0,
            awardsReceived: d.overview.awardsReceived || 0,
            resolutionsWritten: d.overview.resolutionsWritten || 0,
            speechesDelivered: d.overview.speechesDelivered || 0,
          })
        }
        if (d.recentBadges) {
          setBadges(d.recentBadges)
        }
      }

      // Process courses (enrolled courses with progress)
      if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
        const coursesData = await coursesRes.value.json()
        const courseList = coursesData.data || (Array.isArray(coursesData) ? coursesData : coursesData.courses || [])
        setCourses(courseList)
      }

      // Process assessments (recent assessments)
      if (assessmentsRes.status === 'fulfilled' && assessmentsRes.value.ok) {
        // assessments endpoint used for context but not displayed directly here
      }

      // Fetch gamification (XP, badges, leaderboard position)
      try {
        const gamRes = await fetch('/api/gamification')
        if (gamRes.ok) {
          const gamData = await gamRes.json()
          const g = gamData.data || gamData
          if (g.xp !== undefined && !delegateProfile) {
            setDelegateProfile(prev => prev ? prev : {
              xp: g.xp || 0,
              level: g.level || 'OBSERVER',
              streak: g.streak || 0,
              longestStreak: g.longestStreak || 0,
              conferencesAttended: g.conferencesAttended || 0,
              committeesServed: g.committeesServed || 0,
              awardsReceived: g.awardsReceived || 0,
              resolutionsWritten: g.resolutionsWritten || 0,
              speechesDelivered: g.speechesDelivered || 0,
            })
          } else if (g.xp !== undefined && delegateProfile) {
            setDelegateProfile(prev => prev ? { ...prev, xp: g.xp, level: g.level || prev.level, streak: g.streak || prev.streak, longestStreak: g.longestStreak || prev.longestStreak } : prev)
          }
          if (g.user?.badges && g.user.badges.length > 0) {
            setBadges(g.user.badges.map((b: { badge?: Record<string, unknown>; earnedAt?: string }) => ({
              id: b.badge?.id || String(Math.random()),
              name: b.badge?.name || 'Badge',
              description: b.badge?.description || '',
              xpReward: b.badge?.xpReward || 0,
              icon: b.badge?.icon || 'star',
            })))
          }
        }
      } catch {
        // gamification fetch is non-critical
      }

      // Fetch notifications (recent notifications)
      try {
        const notifRes = await fetch('/api/notifications?limit=3')
        // notifications available for future display
        if (!notifRes.ok) { /* non-critical */ }
      } catch {
        // notifications fetch is non-critical
      }

      // Fetch conferences
      try {
        const confRes = await fetch('/api/conferences')
        if (confRes.ok) {
          const confData = await confRes.json()
          setConferences(Array.isArray(confData) ? confData : confData.conferences || [])
        }
      } catch {
        // conferences fetch is non-critical
      }

      // Fetch conduct acknowledgement status
      try {
        const conductRes = await fetch('/api/conduct/acknowledge')
        if (conductRes.ok) {
          const conductData = await conductRes.json()
          if (conductData.data) {
            setConductAcknowledged(conductData.data.acknowledged)
            setConductAcknowledgedAt(conductData.data.acknowledgedAt)
          }
        }
      } catch {
        // conduct fetch is non-critical
      }

      // If no profile from API, create a default
      if (!delegateProfile) {
        setDelegateProfile({
          xp: 0,
          level: 'OBSERVER',
          streak: 0,
          longestStreak: 0,
          conferencesAttended: 0,
          committeesServed: 0,
          awardsReceived: 0,
          resolutionsWritten: 0,
          speechesDelivered: 0,
        })
      }
    } catch {
      setError('Failed to load dashboard data. Please try again.')
      // Set defaults
      setDelegateProfile({
        xp: 0,
        level: 'OBSERVER',
        streak: 0,
        longestStreak: 0,
        conferencesAttended: 0,
        committeesServed: 0,
        awardsReceived: 0,
        resolutionsWritten: 0,
        speechesDelivered: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (!user) return null
  if (loading) return <DashboardSkeleton />
  if (error && !delegateProfile) return <ErrorState message={error} onRetry={fetchData} />

  if (!delegateProfile) return null

  const currentLevel = getCurrentLevel(delegateProfile.xp)
  const nextLevel = getNextLevel(delegateProfile.xp)
  const xpProgress = getXPProgress(delegateProfile.xp)
  const recentBadges = badges.slice(0, 3)
  const activeCourses = courses.filter(c => c.progress > 0 && c.progress < 100)
  const upcomingConferences = conferences.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED')

  const levelIcons: Record<string, React.ElementType> = {
    OBSERVER: Eye,
    DELEGATE: Users,
    AMBASSADOR: Crown,
    DIPLOMAT: Handshake,
    ENVOY: Shield,
    SECRETARY_GENERAL: Gavel,
  }

  const LevelIcon = levelIcons[currentLevel.name] || Star

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" className="ml-auto text-amber-700" onClick={fetchData}>Retry</Button>
        </div>
      )}

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-[#1B3A4B] to-[#264B5E] border-[#0D7377]/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D7377] rounded-full opacity-[0.06] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-[#D4A843] rounded-full opacity-[0.04] translate-y-1/2" />
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" /> Student Dashboard
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Welcome back, <span className="text-[#D4A843]">{user.name.split(' ')[0]}</span>
              </h2>
              <p className="text-white/65 mt-1">
                {getMUNRoleFull(user.munRole)} · {delegateProfile.xp.toLocaleString()} XP
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-[#D4A843]/15 flex items-center justify-center">
                <LevelIcon className="w-7 h-7 text-[#D4A843]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* XP Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-[#E8DED0]/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#1B3A4B]">XP Progress</CardTitle>
              <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 text-xs">
                <Flame className="w-3 h-3 mr-1" /> {currentLevel.name} Level
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{currentLevel.name}</span>
              <span className="font-semibold text-[#1B3A4B]">{delegateProfile.xp.toLocaleString()} XP</span>
              {nextLevel && <span className="text-muted-foreground">{nextLevel.name}</span>}
            </div>
            <div className="h-3 bg-[#F5F0EB] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #0D7377, #059669)' }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
            </div>
            {nextLevel && (
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {(nextLevel.minXP - delegateProfile.xp).toLocaleString()} XP to reach {nextLevel.name}
              </p>
            )}
            {/* Streak */}
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4 text-[#D4A843]" />
                <span className="font-medium text-[#1B3A4B]">{delegateProfile.streak} day streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Trophy className="w-4 h-4" />
                Best: {delegateProfile.longestStreak} days
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conferences"
          value={delegateProfile.conferencesAttended}
          icon={Globe}
          color="text-[#0D7377]"
          bgColor="bg-[#0D7377]/10"
          delay={0.15}
        />
        <StatCard
          label="Committees Served"
          value={delegateProfile.committeesServed}
          icon={Gavel}
          color="text-[#D4A843]"
          bgColor="bg-[#D4A843]/10"
          delay={0.2}
        />
        <StatCard
          label="Speeches Given"
          value={delegateProfile.speechesDelivered}
          icon={Mic}
          color="text-[#059669]"
          bgColor="bg-[#059669]/10"
          delay={0.25}
        />
        <StatCard
          label="Awards Won"
          value={delegateProfile.awardsReceived}
          icon={Trophy}
          color="text-purple-500"
          bgColor="bg-purple-500/10"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Code of Conduct Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.33 }}
        >
          <Card
            className="h-full border-[#E8DED0]/60 hover:shadow-md transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('conduct')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4A843]/20 to-[#0D7377]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-[#0D7377]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1B3A4B]">Code of Conduct</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {conductAcknowledged === true ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-emerald-600 font-medium">Acknowledged</span>
                        {conductAcknowledgedAt && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            {new Date(conductAcknowledgedAt).toLocaleDateString()}
                          </span>
                        )}
                      </>
                    ) : conductAcknowledged === false ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="text-[10px] text-amber-600 font-medium">Review Required</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Loading...</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {conductAcknowledged
                  ? 'You have accepted the platform\'s Code of Conduct. Thank you for your commitment to our community standards.'
                  : 'Please review and accept the Code of Conduct to access all platform features.'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="h-full border-[#E8DED0]/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Active Badges</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{badges.length} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {recentBadges.length > 0 ? (
                <div className="space-y-3">
                  {recentBadges.map((badge, i) => (
                    <motion.div
                      key={badge.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F0EB] hover:bg-[#F0EBE3] transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#D4A843]/15 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-[#D4A843]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#1B3A4B]">{badge.name}</div>
                        <div className="text-xs text-muted-foreground">{badge.description}</div>
                      </div>
                      <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 text-[10px]">
                        +{badge.xpReward} XP
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No badges earned yet</p>
                  <p className="text-xs mt-1">Complete activities to earn badges!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Courses Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full border-[#E8DED0]/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Current Courses</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-7"
                  onClick={() => navigate('training')}
                >
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCourses.length > 0 ? activeCourses.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#1B3A4B] truncate pr-2">{course.title}</span>
                      <span className="text-xs font-semibold text-[#0D7377]">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-[#F5F0EB] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-[#0D7377]"
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] h-5">{course.category}</Badge>
                      <Clock className="w-3 h-3" />
                      {course.duration ? `${Math.round(course.duration / 60)}h` : 'Self-paced'}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No active courses yet</p>
                    <Button variant="link" size="sm" className="text-[#0D7377] mt-1" onClick={() => navigate('training')}>
                      Browse Training
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Conferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="h-full border-[#E8DED0]/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Upcoming Conferences</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{upcomingConferences.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingConferences.length > 0 ? (
                <div className="space-y-3">
                  {upcomingConferences.slice(0, 3).map((conf) => (
                    <div
                      key={conf.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F0EB] hover:bg-[#F0EBE3] transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#1B3A4B] flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-[#D4A843]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#1B3A4B] truncate">{conf.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <CalendarDays className="w-3 h-3" />
                          {conf.startDate}
                          {conf.location && (
                            <>
                              <MapPin className="w-3 h-3 ml-1" />
                              {conf.location}
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className={`text-[10px] shrink-0 border-0 ${
                        conf.status === 'REGISTRATION_OPEN' ? 'bg-[#059669]/15 text-[#059669]' : 'bg-[#0D7377]/15 text-[#0D7377]'
                      }`}>
                        {conf.status === 'REGISTRATION_OPEN' ? 'Open' : 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No upcoming conferences</p>
                  <Button variant="link" size="sm" className="text-[#0D7377] mt-1" onClick={() => navigate('conferences')}>
                    Browse Conferences
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-[#E8DED0]/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B3A4B]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                className="h-auto py-4 flex flex-col gap-2 bg-[#0D7377] hover:bg-[#0A5C5F] text-white"
                onClick={() => navigate('assessment')}
              >
                <ClipboardList className="w-6 h-6" />
                <span className="text-sm font-medium">Take Assessment</span>
                <span className="text-xs opacity-70">Identify your strengths</span>
              </Button>
              <Button
                className="h-auto py-4 flex flex-col gap-2 bg-[#1B3A4B] hover:bg-[#264B5E] text-white"
                onClick={() => navigate('training')}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="text-sm font-medium">Continue Training</span>
                <span className="text-xs opacity-70">Pick up where you left off</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 border-[#0D7377]/30 text-[#0D7377] hover:bg-[#0D7377]/5"
                onClick={() => navigate('chat')}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm font-medium">Join Chat</span>
                <span className="text-xs opacity-70">Connect with delegates</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
