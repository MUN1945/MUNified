'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, GraduationCap, BarChart3, TrendingUp, Award,
  Target, BookOpen, Globe, Trophy, Clock, Star, Flame,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Calendar,
  Mic, Handshake, Brain, Shield, Gavel, FileText, Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts'
import { useAuthStore, useAppStore, getCurrentLevel } from '@/lib/store'

// ============================================================
// MOCK DATA
// ============================================================

const assessmentDistribution = [
  { range: '0-20', count: 2 },
  { range: '21-40', count: 5 },
  { range: '41-60', count: 12 },
  { range: '61-80', count: 18 },
  { range: '81-100', count: 10 },
]

const trainingProgress = [
  { name: 'Parliamentary Procedure', progress: 78, students: 42 },
  { name: 'Resolution Writing', progress: 65, students: 38 },
  { name: 'Public Speaking', progress: 52, students: 35 },
  { name: 'Crisis Management', progress: 41, students: 28 },
  { name: 'Diplomacy Skills', progress: 73, students: 40 },
  { name: 'Research Methods', progress: 58, students: 32 },
]

const monthlyActivity = [
  { month: 'Sep', active: 22, assessments: 8, conferences: 2 },
  { month: 'Oct', active: 35, assessments: 14, conferences: 3 },
  { month: 'Nov', active: 41, assessments: 18, conferences: 4 },
  { month: 'Dec', active: 28, assessments: 10, conferences: 2 },
  { month: 'Jan', active: 38, assessments: 16, conferences: 3 },
  { month: 'Feb', active: 47, assessments: 22, conferences: 5 },
]

const conferenceSuccess = [
  { name: 'Best Delegate', value: 12, color: '#D4A843' },
  { name: 'Outstanding', value: 18, color: '#0D7377' },
  { name: 'Honorable Mention', value: 25, color: '#059669' },
  { name: 'Participated', value: 45, color: '#94A3B8' },
]

const topStudents = [
  { name: 'Elena Vasquez', school: 'Lycée Français', xp: 12500, score: 94, level: 'ENVOY' },
  { name: 'Kai Nakamura', school: 'Tokyo International', xp: 11200, score: 91, level: 'ENVOY' },
  { name: 'Amara Okafor', school: 'Intl School of Geneva', xp: 2450, score: 92, level: 'AMBASSADOR' },
  { name: 'Fatima Al-Rashid', school: 'American School Dubai', xp: 9800, score: 87, level: 'DIPLOMAT' },
  { name: 'Lucas Schmidt', school: 'Berlin Intl School', xp: 2100, score: 85, level: 'AMBASSADOR' },
  { name: 'Priya Sharma', school: 'Delhi Public School', xp: 1800, score: 83, level: 'DELEGATE' },
  { name: 'Oliver Brooks', school: 'Westminster School', xp: 1200, score: 80, level: 'DELEGATE' },
  { name: 'Sofia Costa', school: "St. Paul's Brazil", xp: 900, score: 78, level: 'DELEGATE' },
]

const studentSkills = [
  { subject: 'Confidence', A: 78 },
  { subject: 'Diplomacy', A: 85 },
  { subject: 'Public Speaking', A: 72 },
  { subject: 'Research', A: 90 },
  { subject: 'Leadership', A: 68 },
  { subject: 'Writing', A: 82 },
  { subject: 'Procedures', A: 76 },
  { subject: 'Critical Thinking', A: 88 },
  { subject: 'Collaboration', A: 74 },
  { subject: 'Debate', A: 80 },
]

const trainingTimeline = [
  { date: '2026-01-10', title: 'Started Parliamentary Procedure', xp: 0, progress: 0 },
  { date: '2026-01-18', title: 'Completed Module 1: Rules of Order', xp: 25, progress: 25 },
  { date: '2026-02-01', title: 'Completed Module 2: Motions & Voting', xp: 50, progress: 50 },
  { date: '2026-02-15', title: 'Started Resolution Writing', xp: 75, progress: 45 },
  { date: '2026-02-28', title: 'Achieved Ambassador Level', xp: 500, progress: 78 },
]

const achievementMilestones = [
  { date: 'Dec 2024', title: 'First Assessment', desc: 'Completed your first diagnostic assessment', icon: ClipboardIcon, earned: true },
  { date: 'Jan 2026', title: 'Global Delegate', desc: 'Attended 5 conferences worldwide', icon: GlobeIcon, earned: true },
  { date: 'Jan 2026', title: 'Diplomat Badge', desc: 'Achieved Ambassador rank on the platform', icon: ShieldIcon, earned: true },
  { date: 'Feb 2026', title: 'Skilled Orator', desc: 'Delivered 20+ speeches in sessions', icon: MicIcon, earned: true },
  { date: 'Mar 2026', title: 'Resolution Writer', desc: 'Write 10 resolutions', icon: FileTextIcon, earned: false },
  { date: 'Apr 2026', title: 'Master Diplomat', desc: 'Achieve Diplomat rank', icon: GavelIcon, earned: false },
]

// Simple icon components for milestones
function ClipboardIcon({ className }: { className?: string }) { return <Target className={className} /> }
function GlobeIcon({ className }: { className?: string }) { return <Globe className={className} /> }
function ShieldIcon({ className }: { className?: string }) { return <Shield className={className} /> }
function MicIcon({ className }: { className?: string }) { return <Mic className={className} /> }
function FileTextIcon({ className }: { className?: string }) { return <FileText className={className} /> }
function GavelIcon({ className }: { className?: string }) { return <Gavel className={className} /> }

// Generate heatmap data for last 90 days
function generateHeatmapData() {
  const data: { date: string; count: number; week: number; day: number }[] = []
  const today = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const week = Math.floor(i / 7)
    const day = d.getDay()
    const count = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0
    data.push({ date: d.toISOString().split('T')[0], count, week, day })
  }
  return data
}

const heatmapData = generateHeatmapData()

const COLORS = {
  teal: '#0D7377',
  gold: '#D4A843',
  emerald: '#059669',
  navy: '#1B3A4B',
  cream: '#FFF8F0',
}

// ============================================================
// TEACHER ANALYTICS VIEW
// ============================================================

function TeacherAnalytics() {
  const [loading, setLoading] = useState(true)
  const [apiData, setApiData] = useState<{
    totalStudents: number; avgAssessment: number; trainingCompletion: number; confParticipation: number;
    assessmentDist: { range: string; count: number }[]; trainingProg: { name: string; progress: number; students: number }[];
    monthlyAct: { month: string; active: number; assessments: number; conferences: number }[];
    confSuccess: { name: string; value: number; color: string }[];
    topStudents: { name: string; school: string; xp: number; score: number; level: string }[];
  } | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) {
          const data = await res.json()
          if (data.teacherAnalytics) {
            setApiData(data.teacherAnalytics)
          }
        }
      } catch {
        // API not available, use sample data
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#0D7377]/30 border-t-[#0D7377] rounded-full animate-spin" />
      </div>
    )
  }

  const totalStudents = apiData?.totalStudents ?? 0
  const avgAssessment = apiData?.avgAssessment ?? 0
  const trainingCompletion = apiData?.trainingCompletion ?? 0
  const confParticipation = apiData?.confParticipation ?? 0

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-[#0D7377]', bg: 'bg-[#0D7377]/10', trend: '', suffix: '' },
    { label: 'Avg Assessment', value: avgAssessment, icon: Target, color: 'text-[#059669]', bg: 'bg-[#059669]/10', trend: '', suffix: '%' },
    { label: 'Training Complete', value: trainingCompletion, icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '', suffix: '%' },
    { label: 'Conf. Participation', value: confParticipation, icon: Globe, color: 'text-[#D4A843]', bg: 'bg-[#D4A843]/10', trend: '', suffix: '%' },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
            <Card className="border-[#E8DED0]/60 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-[#1B3A4B]">{stat.value}{stat.suffix || ''}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {totalStudents === 0 && !apiData ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm">
          <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
          <p>No analytics data available yet</p>
          <p className="text-xs mt-1">Data will appear as users engage with the platform</p>
        </div>
      ) : (
      <>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Score Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#1B3A4B]">Assessment Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={assessmentDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DED0" />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <RTooltip contentStyle={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DED0', borderRadius: '8px', fontSize: 13 }} />
                  <Bar dataKey="count" fill="#0D7377" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Training Progress by Course */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#1B3A4B]">Training Progress by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trainingProgress} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DED0" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#1B3A4B' }} width={130} />
                  <RTooltip contentStyle={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DED0', borderRadius: '8px', fontSize: 13 }} />
                  <Bar dataKey="progress" fill="#D4A843" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="lg:col-span-2">
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#1B3A4B]">Monthly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyActivity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DED0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <RTooltip contentStyle={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DED0', borderRadius: '8px', fontSize: 13 }} />
                  <Legend />
                  <Line type="monotone" dataKey="active" stroke="#0D7377" strokeWidth={2.5} dot={{ fill: '#0D7377', r: 4 }} name="Active Students" />
                  <Line type="monotone" dataKey="assessments" stroke="#D4A843" strokeWidth={2.5} dot={{ fill: '#D4A843', r: 4 }} name="Assessments" />
                  <Line type="monotone" dataKey="conferences" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 4 }} name="Conferences" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conference Success Rate Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#1B3A4B]">Conference Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={conferenceSuccess} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {conferenceSuccess.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={{ backgroundColor: '#FFF8F0', border: '1px solid #E8DED0', borderRadius: '8px', fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performing Students Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <Card className="border-[#E8DED0]/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#1B3A4B]">Top Performing Students</CardTitle>
              <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 text-xs">8 students</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8DED0]">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground text-xs">#</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground text-xs">Student</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground text-xs hidden md:table-cell">School</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground text-xs">Level</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground text-xs">Score</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground text-xs">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, i) => (
                    <motion.tr
                      key={student.name}
                      className="border-b border-[#E8DED0]/50 hover:bg-[#F5F0EB]/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.55 + i * 0.05 }}
                    >
                      <td className="py-3 px-2">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-[#D4A843]/15 text-[#D4A843]' :
                          i === 1 ? 'bg-gray-200 text-gray-600' :
                          i === 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-[#F5F0EB] text-muted-foreground'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="bg-[#0D7377]/10 text-[#0D7377] text-[10px]">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-[#1B3A4B]">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{student.school}</td>
                      <td className="py-3 px-2">
                        <Badge className={`text-[10px] border-0 ${
                          student.level === 'ENVOY' ? 'bg-purple-100 text-purple-700' :
                          student.level === 'AMBASSADOR' ? 'bg-[#D4A843]/15 text-[#D4A843]' :
                          student.level === 'DIPLOMAT' ? 'bg-[#059669]/15 text-[#059669]' :
                          'bg-[#0D7377]/10 text-[#0D7377]'
                        }`}>
                          {student.level}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-[#0D7377]">{student.score}%</td>
                      <td className="py-3 px-2 text-right text-muted-foreground">{student.xp.toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </>
      )}
    </div>
  )
}

// ============================================================
// STUDENT ANALYTICS VIEW
// ============================================================

function StudentAnalytics() {
  const { delegateProfile, badges, courses } = useAppStore()
  const xp = delegateProfile?.xp || 2450
  const levelInfo = getCurrentLevel(xp)

  // Personal stats
  const personalStats = [
    { label: 'Assessment Score', value: '84%', icon: Target, color: 'text-[#0D7377]', bg: 'bg-[#0D7377]/10' },
    { label: 'Courses Completed', value: '3', icon: BookOpen, color: 'text-[#D4A843]', bg: 'bg-[#D4A843]/10' },
    { label: 'XP Earned', value: xp.toLocaleString(), icon: Zap, color: 'text-[#059669]', bg: 'bg-[#059669]/10' },
    { label: 'Conferences', value: '8', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Badges Earned', value: String(badges.length), icon: Award, color: 'text-[#D4A843]', bg: 'bg-[#D4A843]/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Personal Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {personalStats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
            <Card className="border-[#E8DED0]/60 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-[#1B3A4B]">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Radar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Skill Profile</CardTitle>
                <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 text-xs">{levelInfo.name} Level</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={studentSkills} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#E8DED0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#1B3A4B' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <Radar name="Your Skills" dataKey="A" stroke="#0D7377" fill="#0D7377" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Activity Heatmap</CardTitle>
                <span className="text-xs text-muted-foreground">Last 90 days</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-0.5 flex-wrap justify-center">
                {Array.from({ length: 7 }, (_, day) => (
                  <div key={day} className="flex flex-col gap-0.5">
                    {Array.from({ length: 13 }, (_, week) => {
                      const entry = heatmapData.find(d => d.week === week && d.day === day)
                      const count = entry?.count || 0
                      const intensity = count === 0 ? 'bg-[#E8DED0]/40' : count === 1 ? 'bg-[#0D7377]/20' : count <= 2 ? 'bg-[#0D7377]/40' : count <= 3 ? 'bg-[#0D7377]/60' : 'bg-[#0D7377]/90'
                      return (
                        <div
                          key={`${week}-${day}`}
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] ${intensity} transition-colors`}
                          title={`${entry?.date || ''}: ${count} activities`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="w-3 h-3 rounded-[2px] bg-[#E8DED0]/40" />
                <div className="w-3 h-3 rounded-[2px] bg-[#0D7377]/20" />
                <div className="w-3 h-3 rounded-[2px] bg-[#0D7377]/40" />
                <div className="w-3 h-3 rounded-[2px] bg-[#0D7377]/60" />
                <div className="w-3 h-3 rounded-[2px] bg-[#0D7377]/90" />
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Progress Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#1B3A4B]">Training Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[340px]">
                <div className="relative pl-8">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#E8DED0]" />
                  {trainingTimeline.map((item, i) => (
                    <motion.div
                      key={i}
                      className="relative mb-6 last:mb-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-5 top-1 w-4 h-4 rounded-full border-2 ${
                        i === trainingTimeline.length - 1 ? 'border-[#D4A843] bg-[#D4A843]' : 'border-[#0D7377] bg-white'
                      }`}>
                        {i === trainingTimeline.length - 1 && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[2px]" />}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{item.date}</div>
                      <div className="text-sm font-medium text-[#1B3A4B]">{item.title}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 text-[10px]">
                          <Zap className="w-3 h-3 mr-0.5" /> +{item.xp} XP
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.progress}% complete</span>
                      </div>
                      {item.progress > 0 && (
                        <div className="mt-1.5 h-1.5 bg-[#F5F0EB] rounded-full overflow-hidden max-w-[200px]">
                          <div className="h-full bg-[#0D7377] rounded-full" style={{ width: `${item.progress}%` }} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Milestones */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#1B3A4B]">Achievement Milestones</CardTitle>
                <Badge className="bg-[#D4A843]/15 text-[#D4A843] border-0 text-xs">
                  <Star className="w-3 h-3 mr-0.5" /> {achievementMilestones.filter(m => m.earned).length}/{achievementMilestones.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[340px]">
                <div className="space-y-4">
                  {achievementMilestones.map((milestone, i) => (
                    <motion.div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        milestone.earned ? 'bg-[#F5F0EB]' : 'bg-[#F5F0EB]/30'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        milestone.earned ? 'bg-[#D4A843]/15' : 'bg-gray-100'
                      }`}>
                        <milestone.icon className={`w-5 h-5 ${milestone.earned ? 'text-[#D4A843]' : 'text-gray-300'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${milestone.earned ? 'text-[#1B3A4B]' : 'text-muted-foreground'}`}>
                            {milestone.title}
                          </span>
                          {milestone.earned ? (
                            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{milestone.desc}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{milestone.date}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN ANALYTICS VIEW
// ============================================================

export default function AnalyticsView() {
  const { user } = useAuthStore()
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SCHOOL_ADMIN'

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-[#1B3A4B]">Analytics</h2>
        <p className="text-muted-foreground mt-1">
          {isTeacher ? 'Insights into student performance and program effectiveness' : 'Track your progress and skill development'}
        </p>
      </motion.div>

      {isTeacher ? <TeacherAnalytics /> : <StudentAnalytics />}
    </div>
  )
}
