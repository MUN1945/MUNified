'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe, BookOpen, Award, Users, BarChart3, Settings, MessageSquare,
  ChevronRight, Star, Trophy, Target, Zap, Clock, MapPin, TrendingUp,
  Shield, GraduationCap, Crown, Gavel, FileText,
  Mic, Handshake, Brain, ArrowRight, Plus, Send, Bell,
  CalendarDays, Building2, Sparkles, ClipboardList, UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore, useAppStore, useNavStore, getCurrentLevel, getNextLevel, getXPProgress } from '@/lib/store'

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
// TEACHER DASHBOARD
// ============================================================

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const { delegateProfile, activities, conferences, courses, badges } = useAppStore()
  const { navigate } = useNavStore()

  if (!user) return null

  const xp = delegateProfile?.xp || 0
  const currentLevel = getCurrentLevel(xp)

  // Teacher-specific stats
  const totalStudents = 47
  const activeConferences = conferences.filter(c => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').length
  const avgAssessmentScore = 82
  const trainingCompletion = 68

  const recentActivity = [
    { text: 'New student registered: Kai Nakamura', time: '1 hour ago', icon: UserCheck, color: 'text-[#0D7377]' },
    { text: 'Assessment completed by 5 students', time: '3 hours ago', icon: ClipboardList, color: 'text-[#D4A843]' },
    { text: 'Conference "Harvard WorldMUN" updated', time: '5 hours ago', icon: Building2, color: 'text-[#059669]' },
    { text: 'Training progress milestone: 60% class average', time: '1 day ago', icon: TrendingUp, color: 'text-purple-500' },
    { text: '3 students earned "Skilled Orator" badge', time: '2 days ago', icon: Award, color: 'text-[#D4A843]' },
  ]

  const topStudents = [
    { name: 'Elena Vasquez', xp: 12500, level: 'ENVOY', score: 94 },
    { name: 'Amara Okafor', xp: 2450, level: 'AMBASSADOR', score: 92 },
    { name: 'Kai Nakamura', xp: 11200, level: 'ENVOY', score: 89 },
    { name: 'Fatima Al-Rashid', xp: 9800, level: 'DIPLOMAT', score: 87 },
    { name: 'Lucas Schmidt', xp: 2100, level: 'AMBASSADOR', score: 85 },
  ]

  const performanceData = [
    { name: 'Public Speaking', classAvg: 78, topAvg: 94 },
    { name: 'Resolution Writing', classAvg: 65, topAvg: 91 },
    { name: 'Research', classAvg: 72, topAvg: 88 },
    { name: 'Diplomacy', classAvg: 69, topAvg: 85 },
    { name: 'Procedures', classAvg: 74, topAvg: 90 },
    { name: 'Critical Thinking', classAvg: 70, topAvg: 87 },
  ]

  return (
    <div className="space-y-6">
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
                {user.schoolName || 'DiplomatiQ Academy'} · {currentLevel.name} Level · {xp.toLocaleString()} XP
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
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Student Performance Overview</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => navigate('analytics')}>
                  Details <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((skill, i) => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#1B3A4B]">{skill.name}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#0D7377]">Class: {skill.classAvg}%</span>
                        <span className="text-[#D4A843]">Top: {skill.topAvg}%</span>
                      </div>
                    </div>
                    <div className="relative h-2.5 bg-[#F5F0EB] rounded-full overflow-hidden">
                      <motion.div
                        className="absolute h-full rounded-full bg-[#0D7377]/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.classAvg}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      />
                      <motion.div
                        className="absolute h-full rounded-full bg-[#D4A843]"
                        style={{ left: 0 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.topAvg}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full bg-[#0D7377]/60" />
                  Class Average
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-1.5 rounded-full bg-[#D4A843]" />
                  Top Students
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Top Students</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => navigate('leaderboard')}>
                  Leaderboard <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topStudents.map((student, i) => (
                  <motion.div
                    key={student.name}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-[#D4A843]/15 text-[#D4A843]' :
                      i === 1 ? 'bg-gray-200 text-gray-600' :
                      i === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-[#F5F0EB] text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#0D7377]/10 text-[#0D7377] text-xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1B3A4B] truncate">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.level}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-[#0D7377]">{student.score}%</div>
                      <div className="text-[10px] text-muted-foreground">{student.xp.toLocaleString()} XP</div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
