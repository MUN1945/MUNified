'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, BookOpen, Award, Users, BarChart3, MessageSquare,
  ChevronRight, Star, Trophy, Target, Clock, MapPin, TrendingUp,
  Shield, GraduationCap, Crown, Gavel, FileText,
  Mic, Handshake, Brain, Plus, Send, Bell,
  CalendarDays, Building2, Sparkles, ClipboardList, UserCheck,
  Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore, useNavStore, getCurrentLevel, getNextLevel, getXPProgress, type ConferenceData } from '@/lib/store'

// ============================================================
// COUNT-UP ANIMATION HOOK
// ============================================================

function useCountUp(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return count
}

// ============================================================
// STAT CARD WITH COUNT-UP
// ============================================================

function TeacherStatCard({
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
// LOADING SKELETON
// ============================================================

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-[#F5F0EB] rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-[#F5F0EB] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="h-64 bg-[#F5F0EB] rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// TEACHER DASHBOARD
// ============================================================

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const { navigate } = useNavStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data loaded from API
  const [totalStudents, setTotalStudents] = useState(0)
  const [activeConferences, setActiveConferences] = useState(0)
  const [avgAssessmentScore, setAvgAssessmentScore] = useState(0)
  const [trainingCompletion, setTrainingCompletion] = useState(0)
  const [researchTaskCount, setResearchTaskCount] = useState(0)
  const [conferences, setConferences] = useState<ConferenceData[]>([])
  const [recentActivity, setRecentActivity] = useState<{ text: string; time: string; icon: React.ElementType; color: string }[]>([])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [analyticsRes, coursesRes, conferencesRes, researchRes] = await Promise.allSettled([
        fetch('/api/analytics'),
        fetch('/api/courses'),
        fetch('/api/conferences'),
        fetch('/api/research'),
      ])

      // Process analytics
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        const raw = await analyticsRes.value.json()
        const data = raw.data || raw
        const overview = data.overview || data
        setTotalStudents(overview.totalStudents || overview.studentCount || 0)
        setAvgAssessmentScore(overview.avgAssessmentScore || overview.averageScore || 0)
        setRecentActivity(
          (data.recentActivities || data.recentActivity || []).map((a: Record<string, unknown>) => ({
            text: a.description || a.text || String(a.type || ''),
            time: a.createdAt ? new Date(a.createdAt as string).toLocaleString() : (a.time || ''),
            icon: a.type === 'XP_EARNED' ? Trophy : a.type === 'COURSE_COMPLETED' ? GraduationCap : Users,
            color: a.type === 'XP_EARNED' ? 'text-[#D4A843]' : a.type === 'COURSE_COMPLETED' ? 'text-[#059669]' : 'text-[#0D7377]',
          }))
        )
      }

      // Process courses
      if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
        const raw = await coursesRes.value.json()
        const data = raw.data || raw
        const courseList = Array.isArray(data) ? data : data.courses || []
        const completed = courseList.filter((c: { progress?: number; completed?: boolean; enrollment?: { completed?: boolean } }) =>
          c.completed || c.progress === 100 || c.enrollment?.completed
        ).length
        const total = courseList.length
        setTrainingCompletion(total > 0 ? Math.round((completed / total) * 100) : 0)
      }

      // Process conferences
      if (conferencesRes.status === 'fulfilled' && conferencesRes.value.ok) {
        const raw = await conferencesRes.value.json()
        const data = raw.data || raw
        const confList = Array.isArray(data) ? data : data.conferences || []
        setConferences(confList)
        setActiveConferences(confList.filter((c: ConferenceData) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').length)
      }

      // Process research (assigned tasks)
      if (researchRes.status === 'fulfilled' && researchRes.value.ok) {
        const raw = await researchRes.value.json()
        const data = raw.data || raw
        const tasks = Array.isArray(data) ? data : (data.tasks || [])
        setResearchTaskCount(tasks.length)
      }
    } catch {
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (!user) return null
  if (loading) return <DashboardSkeleton />

  const xp = 0
  const currentLevel = getCurrentLevel(xp)

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
                  <GraduationCap className="w-3 h-3 mr-1" /> Teacher Dashboard
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Welcome back, <span className="text-[#D4A843]">{user.name.split(' ')[0]}</span>
              </h2>
              <p className="text-white/50 mt-1">
                {user.schoolName || 'DiplomatiQ Academy'} · {currentLevel.name} Level
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-white/40 text-xs">School</div>
                <div className="text-white text-sm font-medium">{user.schoolName || 'Not set'}</div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-[#D4A843]/15 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-[#D4A843]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TeacherStatCard
          label="Total Students"
          value={totalStudents}
          icon={Users}
          color="text-[#0D7377]"
          bgColor="bg-[#0D7377]/10"
          delay={0.1}
        />
        <TeacherStatCard
          label="Active Conferences"
          value={activeConferences}
          icon={Building2}
          color="text-[#D4A843]"
          bgColor="bg-[#D4A843]/10"
          delay={0.15}
        />
        <TeacherStatCard
          label="Avg Assessment Score"
          value={avgAssessmentScore}
          icon={Target}
          color="text-[#059669]"
          bgColor="bg-[#059669]/10"
          delay={0.2}
          suffix="%"
        />
        <TeacherStatCard
          label="Training Completion"
          value={trainingCompletion}
          icon={GraduationCap}
          color="text-purple-500"
          bgColor="bg-purple-500/10"
          delay={0.25}
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full border-[#E8DED0]/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Recent Activity</CardTitle>
                <Badge variant="secondary" className="text-[10px]">Today</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {recentActivity.map((act, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.35 + i * 0.08 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center shrink-0 mt-0.5">
                          <act.icon className={`w-4 h-4 ${act.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#1B3A4B]">{act.text}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{act.time}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                  <Bell className="w-8 h-8 mb-2 opacity-30" />
                  <p>No recent activity</p>
                  <p className="text-xs mt-1">Activity will appear as students engage with the platform</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Conferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="h-full border-[#E8DED0]/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Upcoming Conferences</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-7"
                  onClick={() => navigate('conferences')}
                >
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {conferences.length > 0 ? (
                <div className="space-y-3">
                  {conferences.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').slice(0, 4).map((conf, i) => (
                    <motion.div
                      key={conf.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F0EB] hover:bg-[#F0EBE3] transition-colors cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#1B3A4B] flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-[#D4A843]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#1B3A4B] truncate">{conf.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <CalendarDays className="w-3 h-3" />
                          {conf.startDate} — {conf.endDate}
                          {conf.location && (
                            <>
                              <MapPin className="w-3 h-3 ml-1" />
                              {conf.location}
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className={`text-[10px] shrink-0 border-0 ${
                        conf.status === 'REGISTRATION_OPEN' ? 'bg-[#059669]/15 text-[#059669]' :
                        conf.status === 'IN_PROGRESS' ? 'bg-[#0D7377]/15 text-[#0D7377]' :
                        'bg-[#D4A843]/15 text-[#D4A843]'
                      }`}>
                        {conf.status === 'REGISTRATION_OPEN' ? 'Open' : conf.status === 'IN_PROGRESS' ? 'Live' : 'Planned'}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                  <Globe className="w-8 h-8 mb-2 opacity-30" />
                  <p>No conferences yet</p>
                  <Button variant="link" size="sm" className="text-[#0D7377] mt-1" onClick={() => navigate('conferences')}>
                    Create a Conference
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
                onClick={() => navigate('conferences')}
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">Create Conference</span>
                <span className="text-xs opacity-70">Set up a new MUN event</span>
              </Button>
              <Button
                className="h-auto py-4 flex flex-col gap-2 bg-[#1B3A4B] hover:bg-[#264B5E] text-white"
                onClick={() => navigate('research')}
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm font-medium">Assign Research</span>
                <span className="text-xs opacity-70">Task students with topics</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 border-[#0D7377]/30 text-[#0D7377] hover:bg-[#0D7377]/5"
                onClick={() => navigate('chat')}
              >
                <Send className="w-6 h-6" />
                <span className="text-sm font-medium">Send Notification</span>
                <span className="text-xs opacity-70">Message your students</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
