'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, GraduationCap, Users, Activity, UserPlus, CreditCard,
  TrendingDown, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  Search, Shield, AlertTriangle, Eye, Edit, Trash2, Ban, CheckCircle2,
  XCircle, Star, RefreshCw, KeyRound, FileWarning, Ticket, Clock,
  MonitorSmartphone, ScrollText, Filter, ChevronDown, MoreHorizontal,
  Merge, Pin, Unlock, Lock, AlertCircle, CheckCircle, X as XIcon
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ChartContainer, type ChartConfig
} from '@/components/ui/chart'

// ============================================================
// TYPES
// ============================================================

interface MetricCardData {
  title: string
  value: string
  change: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  sparkData: { v: number }[]
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  school: string
  status: string
  subscription: string
  lastLogin: string
}

interface SchoolData {
  id: string
  name: string
  city: string
  country: string
  type: string
  verified: boolean
  students: number
  teachers: number
  status: string
  featured: boolean
}

interface TeacherData {
  id: string
  name: string
  email: string
  school: string
  students: number
  conferences: number
  activityScore: number
  status: string
}

interface StudentData {
  id: string
  name: string
  email: string
  school: string
  xpLevel: string
  tier: string
  coursesCompleted: number
  assessmentScore: number
}

interface AuditLogEntry {
  id: string
  action: string
  user: string
  target: string
  timestamp: string
  ip: string
  severity: string
}

interface SupportTicket {
  id: string
  type: string
  subject: string
  user: string
  status: string
  priority: string
  createdAt: string
}

// ============================================================
// DEMO DATA
// ============================================================

const sparkData = (base: number, variance: number) =>
  Array.from({ length: 12 }, (_, i) => ({
    v: base + Math.round(Math.sin(i * 0.8) * variance + variance * 0.5)
  }))

const OVERVIEW_METRICS: MetricCardData[] = [
  { title: 'Total Schools', value: '347', change: 12.4, icon: Building2, iconBg: 'bg-[#0D7377]/20', iconColor: 'text-[#0D7377]', sparkData: sparkData(28, 8) },
  { title: 'Total Teachers', value: '2,891', change: 8.2, icon: GraduationCap, iconBg: 'bg-[#D4A843]/20', iconColor: 'text-[#D4A843]', sparkData: sparkData(240, 30) },
  { title: 'Total Students', value: '48,237', change: 15.7, icon: Users, iconBg: 'bg-[#059669]/20', iconColor: 'text-[#059669]', sparkData: sparkData(4200, 600) },
  { title: 'Active Users', value: '31,412', change: 6.3, icon: Activity, iconBg: 'bg-[#8B5CF6]/20', iconColor: 'text-[#8B5CF6]', sparkData: sparkData(2800, 400) },
  { title: 'New Registrations', value: '1,284', change: 22.1, icon: UserPlus, iconBg: 'bg-[#F59E0B]/20', iconColor: 'text-[#F59E0B]', sparkData: sparkData(100, 30) },
  { title: 'Subscriptions', value: '8,942', change: 9.8, icon: CreditCard, iconBg: 'bg-[#0A7E8C]/20', iconColor: 'text-[#0A7E8C]', sparkData: sparkData(740, 80) },
  { title: 'Churn Rate', value: '2.4%', change: -0.8, icon: TrendingDown, iconBg: 'bg-[#EF4444]/20', iconColor: 'text-[#EF4444]', sparkData: sparkData(3, 1) },
  { title: 'Revenue', value: '$284K', change: 18.5, icon: DollarSign, iconBg: 'bg-[#059669]/20', iconColor: 'text-[#059669]', sparkData: sparkData(24, 5) },
]

const MRR_DATA = [
  { month: 'Sep', mrr: 186000 },
  { month: 'Oct', mrr: 201000 },
  { month: 'Nov', mrr: 218000 },
  { month: 'Dec', mrr: 235000 },
  { month: 'Jan', mrr: 256000 },
  { month: 'Feb', mrr: 284000 },
]

const SUBSCRIPTION_BY_TIER = [
  { tier: 'Free', count: 32100 },
  { tier: 'Student Pro', count: 8942 },
  { tier: 'Teacher Pro', count: 2340 },
  { tier: 'Enterprise', count: 347 },
]

const REVENUE_FORECAST = [
  { month: 'Mar', actual: 284000, forecast: 284000 },
  { month: 'Apr', actual: null, forecast: 302000 },
  { month: 'May', actual: null, forecast: 318000 },
  { month: 'Jun', actual: null, forecast: 337000 },
  { month: 'Jul', actual: null, forecast: 356000 },
  { month: 'Aug', actual: null, forecast: 378000 },
]

const PL_DATA = [
  { category: 'Subscriptions', amount: 284000 },
  { category: 'Enterprise', amount: 98000 },
  { category: 'One-time', amount: 12000 },
  { category: 'Infrastructure', amount: -68000 },
  { category: 'Salaries', amount: -142000 },
  { category: 'Marketing', amount: -34000 },
  { category: 'Operations', amount: -22000 },
]

const REVENUE_BY_PLAN = [
  { plan: 'Student Pro', revenue: 89420 },
  { plan: 'Teacher Pro', revenue: 58500 },
  { plan: 'Enterprise', revenue: 98000 },
  { plan: 'Add-ons', revenue: 12000 },
]

const DEMO_USERS: UserData[] = [
  { id: 'u1', name: 'Amara Okafor', email: 'amara@diplomatiq.io', role: 'STUDENT', school: 'Intl School of Geneva', status: 'Active', subscription: 'Student Pro', lastLogin: '2 min ago' },
  { id: 'u2', name: 'Dr. Sarah Chen', email: 'sarah@diplomatiq.io', role: 'TEACHER', school: 'Intl School of Geneva', status: 'Active', subscription: 'Teacher Pro', lastLogin: '15 min ago' },
  { id: 'u3', name: 'Kai Nakamura', email: 'kai@tokyo-intl.jp', role: 'STUDENT', school: 'Tokyo International', status: 'Active', subscription: 'Free', lastLogin: '1 hr ago' },
  { id: 'u4', name: 'Elena Vasquez', email: 'elena@lycee.fr', role: 'STUDENT', school: 'Lycee Francais', status: 'Active', subscription: 'Student Pro', lastLogin: '3 hr ago' },
  { id: 'u5', name: 'James Wright', email: 'james@diplomatiq.io', role: 'SUPER_ADMIN', school: 'DiplomatiQ HQ', status: 'Active', subscription: 'Enterprise', lastLogin: 'Just now' },
  { id: 'u6', name: 'Priya Sharma', email: 'priya@dps.edu.in', role: 'STUDENT', school: 'Delhi Public School', status: 'Suspended', subscription: 'Free', lastLogin: '5 days ago' },
  { id: 'u7', name: 'Marcus Weber', email: 'marcus@berlin-intl.de', role: 'TEACHER', school: 'Berlin Intl School', status: 'Active', subscription: 'Teacher Pro', lastLogin: '2 hr ago' },
  { id: 'u8', name: 'Fatima Al-Rashid', email: 'fatima@asd.ae', role: 'SCHOOL_ADMIN', school: 'American School Dubai', status: 'Active', subscription: 'Enterprise', lastLogin: '30 min ago' },
  { id: 'u9', name: 'Oliver Brooks', email: 'oliver@westminster.uk', role: 'STUDENT', school: 'Westminster School', status: 'Unverified', subscription: 'Free', lastLogin: 'Never' },
  { id: 'u10', name: 'Sofia Costa', email: 'sofia@stpauls.br', role: 'STUDENT', school: "St. Paul's Brazil", status: 'Active', subscription: 'Student Pro', lastLogin: '6 hr ago' },
]

const DEMO_SCHOOLS: SchoolData[] = [
  { id: 's1', name: 'International School of Geneva', city: 'Geneva', country: 'Switzerland', type: 'International', verified: true, students: 1240, teachers: 87, status: 'Active', featured: true },
  { id: 's2', name: 'Tokyo International School', city: 'Tokyo', country: 'Japan', type: 'International', verified: true, students: 980, teachers: 62, status: 'Active', featured: true },
  { id: 's3', name: 'American School Dubai', city: 'Dubai', country: 'UAE', type: 'International', verified: true, students: 2100, teachers: 134, status: 'Active', featured: false },
  { id: 's4', name: 'Berlin International School', city: 'Berlin', country: 'Germany', type: 'International', verified: true, students: 760, teachers: 48, status: 'Active', featured: false },
  { id: 's5', name: 'Lycee Francais de New York', city: 'New York', country: 'USA', type: 'Bilingual', verified: true, students: 1560, teachers: 98, status: 'Active', featured: true },
  { id: 's6', name: 'Westminster School', city: 'London', country: 'UK', type: 'Independent', verified: true, students: 840, teachers: 56, status: 'Active', featured: false },
  { id: 's7', name: 'Nairobi Academy', city: 'Nairobi', country: 'Kenya', type: 'International', verified: false, students: 320, teachers: 24, status: 'Pending', featured: false },
  { id: 's8', name: 'Shanghai United', city: 'Shanghai', country: 'China', type: 'International', verified: false, students: 0, teachers: 0, status: 'Pending', featured: false },
]

const DEMO_TEACHERS: TeacherData[] = [
  { id: 't1', name: 'Dr. Sarah Chen', email: 'sarah@diplomatiq.io', school: 'Intl School of Geneva', students: 87, conferences: 12, activityScore: 94, status: 'Active' },
  { id: 't2', name: 'Marcus Weber', email: 'marcus@berlin-intl.de', school: 'Berlin Intl School', students: 48, conferences: 8, activityScore: 78, status: 'Active' },
  { id: 't3', name: 'Aisha Patel', email: 'aisha@asd.ae', school: 'American School Dubai', students: 134, conferences: 15, activityScore: 91, status: 'Active' },
  { id: 't4', name: 'Hiroshi Tanaka', email: 'hiroshi@tokyo-intl.jp', school: 'Tokyo International', students: 62, conferences: 10, activityScore: 85, status: 'Active' },
  { id: 't5', name: 'Claire Dubois', email: 'claire@lycee.fr', school: 'Lycee Francais', students: 98, conferences: 11, activityScore: 88, status: 'Active' },
  { id: 't6', name: 'Robert Osei', email: 'robert@nairobi-ac.ke', school: 'Nairobi Academy', students: 24, conferences: 2, activityScore: 32, status: 'Inactive' },
]

const DEMO_STUDENTS: StudentData[] = [
  { id: 'st1', name: 'Amara Okafor', email: 'amara@diplomatiq.io', school: 'Intl School of Geneva', xpLevel: 'Ambassador', tier: 'Student Pro', coursesCompleted: 12, assessmentScore: 84 },
  { id: 'st2', name: 'Kai Nakamura', email: 'kai@tokyo-intl.jp', school: 'Tokyo International', xpLevel: 'Envoy', tier: 'Free', coursesCompleted: 8, assessmentScore: 91 },
  { id: 'st3', name: 'Elena Vasquez', email: 'elena@lycee.fr', school: 'Lycee Francais', xpLevel: 'Envoy', tier: 'Student Pro', coursesCompleted: 15, assessmentScore: 96 },
  { id: 'st4', name: 'Priya Sharma', email: 'priya@dps.edu.in', school: 'Delhi Public School', xpLevel: 'Delegate', tier: 'Free', coursesCompleted: 3, assessmentScore: 62 },
  { id: 'st5', name: 'Oliver Brooks', email: 'oliver@westminster.uk', school: 'Westminster School', xpLevel: 'Delegate', tier: 'Free', coursesCompleted: 5, assessmentScore: 71 },
  { id: 'st6', name: 'Sofia Costa', email: 'sofia@stpauls.br', school: "St. Paul's Brazil", xpLevel: 'Ambassador', tier: 'Student Pro', coursesCompleted: 11, assessmentScore: 88 },
  { id: 'st7', name: 'Fatima Al-Rashid', email: 'fatima@asd.ae', school: 'American School Dubai', xpLevel: 'Diplomat', tier: 'Student Pro', coursesCompleted: 9, assessmentScore: 79 },
  { id: 'st8', name: 'Chen Wei', email: 'wei@shanghai-intl.cn', school: 'Shanghai United', xpLevel: 'Delegate', tier: 'Free', coursesCompleted: 2, assessmentScore: 55 },
]

const DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'al1', action: 'USER_SUSPENDED', user: 'James Wright', target: 'Priya Sharma', timestamp: '2026-03-01 14:23:10', ip: '192.168.1.45', severity: 'warning' },
  { id: 'al2', action: 'SCHOOL_APPROVED', user: 'James Wright', target: 'Nairobi Academy', timestamp: '2026-03-01 13:45:00', ip: '192.168.1.45', severity: 'info' },
  { id: 'al3', action: 'ROLE_CHANGED', user: 'James Wright', target: 'Fatima Al-Rashid', timestamp: '2026-03-01 11:20:30', ip: '192.168.1.45', severity: 'warning' },
  { id: 'al4', action: 'PASSWORD_RESET', user: 'System', target: 'Oliver Brooks', timestamp: '2026-03-01 10:15:00', ip: '203.45.67.89', severity: 'info' },
  { id: 'al5', action: 'LOGIN_FAILED', user: 'Unknown', target: 'admin@diplomatiq.io', timestamp: '2026-03-01 09:45:22', ip: '45.33.32.156', severity: 'critical' },
  { id: 'al6', action: 'SUBSCRIPTION_CANCELLED', user: 'System', target: 'Marcus Weber', timestamp: '2026-02-28 22:10:00', ip: 'N/A', severity: 'info' },
  { id: 'al7', action: 'BULK_IMPORT', user: 'James Wright', target: '42 students', timestamp: '2026-02-28 16:30:00', ip: '192.168.1.45', severity: 'info' },
  { id: 'al8', action: 'SUSPICIOUS_LOGIN', user: 'System', target: 'amara@diplomatiq.io', timestamp: '2026-02-28 03:22:11', ip: '91.108.56.23', severity: 'critical' },
]

const DEMO_TICKETS: SupportTicket[] = [
  { id: 'tk1', type: 'PASSWORD_RESET', subject: 'Cannot access my account', user: 'Oliver Brooks', status: 'Open', priority: 'High', createdAt: '2026-03-01 10:15' },
  { id: 'tk2', type: 'VERIFICATION', subject: 'School verification request', user: 'Nairobi Academy', status: 'Pending', priority: 'Medium', createdAt: '2026-02-28 16:45' },
  { id: 'tk3', type: 'BILLING', subject: 'Double charge on subscription', user: 'Sofia Costa', status: 'Open', priority: 'High', createdAt: '2026-02-28 14:20' },
  { id: 'tk4', type: 'TECHNICAL', subject: 'Assessment not loading', user: 'Chen Wei', status: 'In Progress', priority: 'Medium', createdAt: '2026-02-27 09:30' },
  { id: 'tk5', type: 'INCIDENT', subject: 'Data sync failure - Geneva', user: 'System Alert', status: 'Resolved', priority: 'Critical', createdAt: '2026-02-26 21:00' },
]

const RECENT_LOGINS = [
  { user: 'James Wright', ip: '192.168.1.45', location: 'San Francisco, US', time: '2 min ago', device: 'Chrome / macOS' },
  { user: 'Dr. Sarah Chen', ip: '85.214.32.10', location: 'Geneva, CH', time: '15 min ago', device: 'Safari / iOS' },
  { user: 'Kai Nakamura', ip: '210.168.45.22', location: 'Tokyo, JP', time: '1 hr ago', device: 'Chrome / Windows' },
  { user: 'Unknown', ip: '45.33.32.156', location: 'Unknown', time: '3 hr ago', device: 'Firefox / Linux' },
  { user: 'Fatima Al-Rashid', ip: '94.200.87.33', location: 'Dubai, AE', time: '4 hr ago', device: 'Safari / iOS' },
]

// ============================================================
// CHART CONFIG
// ============================================================

const mrrChartConfig: ChartConfig = {
  mrr: { label: 'MRR', color: '#0A7E8C' },
}

const tierChartConfig: ChartConfig = {
  count: { label: 'Users', color: '#0A7E8C' },
}

const forecastChartConfig: ChartConfig = {
  actual: { label: 'Actual', color: '#0A7E8C' },
  forecast: { label: 'Forecast', color: '#D4A843' },
}

const plChartConfig: ChartConfig = {
  amount: { label: 'Amount', color: '#0A7E8C' },
}

const planRevenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: '#0A7E8C' },
}

const PIE_COLORS = ['#0A7E8C', '#D4A843', '#059669', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899']

const plPieConfig: ChartConfig = {
  Subscriptions: { label: 'Subscriptions', color: '#0A7E8C' },
  Enterprise: { label: 'Enterprise', color: '#D4A843' },
  'One-time': { label: 'One-time', color: '#059669' },
  Infrastructure: { label: 'Infrastructure', color: '#EF4444' },
  Salaries: { label: 'Salaries', color: '#EC4899' },
  Marketing: { label: 'Marketing', color: '#F59E0B' },
  Operations: { label: 'Operations', color: '#8B5CF6' },
}

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' }
  }),
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

// ============================================================
// HELPER COMPONENTS
// ============================================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    Unverified: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    Open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'In Progress': 'bg-[#0A7E8C]/20 text-[#0A7E8C] border-[#0A7E8C]/30',
    Resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${config[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
      {status}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${config[priority] || config.Low}`}>
      {priority}
    </Badge>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    info: 'bg-[#0A7E8C]/20 text-[#0A7E8C] border-[#0A7E8C]/30',
  }
  return (
    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${config[severity] || config.info}`}>
      {severity}
    </Badge>
  )
}

function ActivityScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-400">{score}</span>
    </div>
  )
}

function MiniSparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width={80} height={28}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace('#', '')})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`bg-[#1B2A4A] border-white/10 text-white ${className}`}>
      {children}
    </Card>
  )
}

// ============================================================
// SECTION 1: PLATFORM OVERVIEW
// ============================================================

function PlatformOverview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {OVERVIEW_METRICS.map((m, i) => (
        <motion.div
          key={m.title}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <DarkCard>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${m.iconBg} flex items-center justify-center`}>
                  <m.icon className={`w-4.5 h-4.5 ${m.iconColor}`} />
                </div>
                <MiniSparkline data={m.sparkData} color={m.iconColor.replace('text-', '#').replace('[', '').replace(']', '') || '#0A7E8C'} />
              </div>
              <div className="text-2xl font-bold tracking-tight">{m.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {m.change >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                )}
                <span className={`text-xs font-medium ${m.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Math.abs(m.change)}%
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{m.title}</div>
            </CardContent>
          </DarkCard>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================
// SECTION 2: FINANCIAL DASHBOARD
// ============================================================

function FinancialDashboard() {
  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Top Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <DarkCard>
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">MRR</div>
            <div className="text-2xl font-bold text-[#D4A843]">$284,000</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">+10.9%</span>
            </div>
          </CardContent>
        </DarkCard>
        <DarkCard>
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">ARR</div>
            <div className="text-2xl font-bold text-[#D4A843]">$3,408,000</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">+15.2%</span>
            </div>
          </CardContent>
        </DarkCard>
        <DarkCard>
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">Failed Payments</div>
            <div className="text-2xl font-bold text-red-400">23</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">-12%</span>
            </div>
          </CardContent>
        </DarkCard>
        <DarkCard>
          <CardContent className="p-4">
            <div className="text-xs text-slate-400 mb-1">Customer LTV</div>
            <div className="text-2xl font-bold text-[#0A7E8C]">$342</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400">+8.4%</span>
            </div>
          </CardContent>
        </DarkCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MRR Trend */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Monthly Recurring Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={mrrChartConfig} className="h-[200px] w-full">
              <AreaChart data={MRR_DATA}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A7E8C" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0A7E8C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <RechartsTooltip
                  contentStyle={{ background: '#1B2A4A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']}
                />
                <Area type="monotone" dataKey="mrr" stroke="#0A7E8C" strokeWidth={2} fill="url(#mrrGrad)" dot={false} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </DarkCard>

        {/* Subscription by Tier */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Subscriptions by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={tierChartConfig} className="h-[200px] w-full">
              <BarChart data={SUBSCRIPTION_BY_TIER}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="tier" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                <RechartsTooltip
                  contentStyle={{ background: '#1B2A4A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => [v.toLocaleString(), 'Users']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {SUBSCRIPTION_BY_TIER.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </DarkCard>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Revenue Forecast */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Revenue Forecast (6-Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={forecastChartConfig} className="h-[200px] w-full">
              <LineChart data={REVENUE_FORECAST}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <RechartsTooltip
                  contentStyle={{ background: '#1B2A4A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#0A7E8C" strokeWidth={2} dot={{ r: 4, fill: '#0A7E8C' }} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" stroke="#D4A843" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: '#D4A843' }} connectNulls={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </DarkCard>

        {/* P&L Summary */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Profit & Loss Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={plPieConfig} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={PL_DATA}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {PL_DATA.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ background: '#1B2A4A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v: number) => [`$${Math.abs(v).toLocaleString()}`, '']}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, color: '#94A3B8' }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </DarkCard>
      </div>

      {/* Revenue by Plan */}
      <DarkCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Revenue by Plan Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={planRevenueChartConfig} className="h-[180px] w-full">
            <BarChart layout="vertical" data={REVENUE_BY_PLAN}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="plan" type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <RechartsTooltip
                contentStyle={{ background: '#1B2A4A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {REVENUE_BY_PLAN.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </DarkCard>

      {/* Refunds & Other Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <DarkCard>
          <CardContent className="p-4 text-center">
            <div className="text-xs text-slate-400 mb-1">Refunds (This Month)</div>
            <div className="text-xl font-bold text-red-400">$2,340</div>
            <div className="text-xs text-slate-500">7 refunds</div>
          </CardContent>
        </DarkCard>
        <DarkCard>
          <CardContent className="p-4 text-center">
            <div className="text-xs text-slate-400 mb-1">Net Revenue</div>
            <div className="text-xl font-bold text-emerald-400">$128,660</div>
            <div className="text-xs text-slate-500">After costs</div>
          </CardContent>
        </DarkCard>
        <DarkCard>
          <CardContent className="p-4 text-center">
            <div className="text-xs text-slate-400 mb-1">ARPU</div>
            <div className="text-xl font-bold text-[#0A7E8C]">$31.75</div>
            <div className="text-xs text-slate-500">Avg revenue per user</div>
          </CardContent>
        </DarkCard>
      </div>
    </motion.div>
  )
}

// ============================================================
// SECTION 3: USER MANAGEMENT
// ============================================================

function UserManagement() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return DEMO_USERS.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [search, roleFilter, statusFilter])

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#1B2A4A] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#0A7E8C]/30"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-[#1B2A4A] border-white/10 text-white">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-[#1B2A4A] border-white/10">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-[#1B2A4A] border-white/10 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1B2A4A] border-white/10">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
            <SelectItem value="Unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="bg-[#1B2A4A] border-white/10 text-slate-300 hover:bg-[#264B5E] hover:text-white">
          <Filter className="w-4 h-4 mr-2" />
          Bulk Actions
        </Button>
      </div>

      {/* Table */}
      <DarkCard>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">School</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">Subscription</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">Last Login</TableHead>
                  <TableHead className="text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{u.name}</TableCell>
                    <TableCell className="text-slate-400">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-white/20 text-slate-300">
                        {u.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 hidden md:table-cell">{u.school}</TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell className="text-slate-400 hidden lg:table-cell">{u.subscription}</TableCell>
                    <TableCell className="text-slate-500 text-xs hidden lg:table-cell">{u.lastLogin}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1B2A4A] border-white/10">
                          <DropdownMenuLabel className="text-slate-400">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10">
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Verify
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-amber-400 focus:text-amber-300 focus:bg-white/10">
                            <Ban className="w-4 h-4 mr-2" /> Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-white/10">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </DarkCard>
      <div className="text-xs text-slate-500 text-right">Showing {filtered.length} of {DEMO_USERS.length} users</div>
    </motion.div>
  )
}

// ============================================================
// SECTION 4: SCHOOL MANAGEMENT
// ============================================================

function SchoolManagement() {
  const [search, setSearch] = useState('')
  const pendingSchools = DEMO_SCHOOLS.filter(s => s.status === 'Pending')

  const filtered = DEMO_SCHOOLS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Verification Queue */}
      {pendingSchools.length > 0 && (
        <DarkCard className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Verification Queue ({pendingSchools.length} pending)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingSchools.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.city}, {s.country} &middot; {s.type}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </DarkCard>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search schools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#1B2A4A] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#0A7E8C]/30"
        />
      </div>

      {/* Table */}
      <DarkCard>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">City</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">Country</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Verified</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">Students</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">Teachers</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        {s.featured && <Star className="w-3.5 h-3.5 text-[#D4A843] fill-[#D4A843]" />}
                        {s.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 hidden md:table-cell">{s.city}</TableCell>
                    <TableCell className="text-slate-400 hidden sm:table-cell">{s.country}</TableCell>
                    <TableCell className="text-slate-400">{s.type}</TableCell>
                    <TableCell>
                      {s.verified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </TableCell>
                    <TableCell className="text-slate-400 hidden lg:table-cell">{s.students.toLocaleString()}</TableCell>
                    <TableCell className="text-slate-400 hidden lg:table-cell">{s.teachers}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1B2A4A] border-white/10">
                          <DropdownMenuLabel className="text-slate-400">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10">
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10">
                            <Merge className="w-4 h-4 mr-2" /> Merge
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10">
                            <Pin className="w-4 h-4 mr-2" /> {s.featured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-white/10">
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </DarkCard>
    </motion.div>
  )
}

// ============================================================
// SECTION 5: TEACHER MANAGEMENT
// ============================================================

function TeacherManagement() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return DEMO_TEACHERS.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.school.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#1B2A4A] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#0A7E8C]/30"
        />
      </div>

      <DarkCard>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-slate-400">School</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">Students</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">Conferences</TableHead>
                  <TableHead className="text-slate-400">Activity</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => (
                  <TableRow key={t.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{t.name}</TableCell>
                    <TableCell className="text-slate-400 hidden md:table-cell">{t.email}</TableCell>
                    <TableCell className="text-slate-400">{t.school}</TableCell>
                    <TableCell className="text-slate-400 hidden sm:table-cell">{t.students}</TableCell>
                    <TableCell className="text-slate-400 hidden sm:table-cell">{t.conferences}</TableCell>
                    <TableCell><ActivityScoreBar score={t.activityScore} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </DarkCard>
    </motion.div>
  )
}

// ============================================================
// SECTION 6: STUDENT MANAGEMENT
// ============================================================

function StudentManagement() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return DEMO_STUDENTS.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.school.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#1B2A4A] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#0A7E8C]/30"
        />
      </div>

      <DarkCard>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">School</TableHead>
                  <TableHead className="text-slate-400">XP Level</TableHead>
                  <TableHead className="text-slate-400 hidden sm:table-cell">Tier</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">Courses</TableHead>
                  <TableHead className="text-slate-400">Assessment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{s.name}</TableCell>
                    <TableCell className="text-slate-400 hidden md:table-cell">{s.email}</TableCell>
                    <TableCell className="text-slate-400 hidden sm:table-cell">{s.school}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-[#D4A843]/40 text-[#D4A843]">
                        {s.xpLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 hidden sm:table-cell">{s.tier}</TableCell>
                    <TableCell className="text-slate-400 hidden lg:table-cell">{s.coursesCompleted}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${s.assessmentScore >= 80 ? 'text-emerald-400' : s.assessmentScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {s.assessmentScore}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </DarkCard>
    </motion.div>
  )
}

// ============================================================
// SECTION 7: SUPPORT & RECOVERY
// ============================================================

function SupportRecovery() {
  const passwordResets = DEMO_TICKETS.filter(t => t.type === 'PASSWORD_RESET')
  const verifications = DEMO_TICKETS.filter(t => t.type === 'VERIFICATION')
  const incidents = DEMO_TICKETS.filter(t => t.type === 'INCIDENT')

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Password Resets */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              Password Resets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {passwordResets.length > 0 ? passwordResets.map(t => (
              <div key={t.id} className="p-2.5 bg-[#0D1B2A] rounded-lg border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{t.user}</span>
                  <PriorityBadge priority={t.priority} />
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.subject}</div>
                <div className="text-[10px] text-slate-500 mt-1">{t.createdAt}</div>
                <Button size="sm" className="mt-2 h-7 text-xs bg-[#0A7E8C] hover:bg-[#0A7E8C]/80">
                  <RefreshCw className="w-3 h-3 mr-1" /> Reset Password
                </Button>
              </div>
            )) : (
              <div className="text-xs text-slate-500 text-center py-4">No pending resets</div>
            )}
          </CardContent>
        </DarkCard>

        {/* Verification Queue */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0A7E8C]" />
              Verification Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {verifications.length > 0 ? verifications.map(t => (
              <div key={t.id} className="p-2.5 bg-[#0D1B2A] rounded-lg border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{t.user}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.subject}</div>
                <div className="text-[10px] text-slate-500 mt-1">{t.createdAt}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Verify
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-white/10 text-slate-300 hover:bg-white/10">
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-xs text-slate-500 text-center py-4">No pending verifications</div>
            )}
          </CardContent>
        </DarkCard>

        {/* Incident Reports */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Incident Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incidents.length > 0 ? incidents.map(t => (
              <div key={t.id} className="p-2.5 bg-[#0D1B2A] rounded-lg border border-red-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{t.user}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.subject}</div>
                <div className="text-[10px] text-slate-500 mt-1">{t.createdAt}</div>
              </div>
            )) : (
              <div className="text-xs text-slate-500 text-center py-4">No incidents</div>
            )}
          </CardContent>
        </DarkCard>
      </div>

      {/* Support Tickets Table */}
      <DarkCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#D4A843]" />
            All Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">ID</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Subject</TableHead>
                <TableHead className="text-slate-400 hidden md:table-cell">User</TableHead>
                <TableHead className="text-slate-400">Priority</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 hidden lg:table-cell">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_TICKETS.map(t => (
                <TableRow key={t.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-slate-400 font-mono text-xs">{t.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] border-white/20 text-slate-300">
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white text-sm">{t.subject}</TableCell>
                  <TableCell className="text-slate-400 hidden md:table-cell">{t.user}</TableCell>
                  <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-slate-500 text-xs hidden lg:table-cell">{t.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </DarkCard>
    </motion.div>
  )
}

// ============================================================
// SECTION 8: SECURITY CENTER
// ============================================================

function SecurityCenter() {
  const [auditFilter, setAuditFilter] = useState('all')

  const filteredLogs = useMemo(() => {
    if (auditFilter === 'all') return DEMO_AUDIT_LOGS
    return DEMO_AUDIT_LOGS.filter(l => l.severity === auditFilter)
  }, [auditFilter])

  const suspiciousAlerts = DEMO_AUDIT_LOGS.filter(l => l.severity === 'critical')

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Alert Banner */}
      {suspiciousAlerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400 font-medium text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            {suspiciousAlerts.length} Security Alert{suspiciousAlerts.length > 1 ? 's' : ''}
          </div>
          <div className="space-y-1.5">
            {suspiciousAlerts.map(a => (
              <div key={a.id} className="text-xs text-red-300/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
                <span className="font-medium">{a.action}</span> — {a.target} from {a.ip} ({a.timestamp})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Logins */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <MonitorSmartphone className="w-4 h-4 text-[#0A7E8C]" />
              Recent Logins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RECENT_LOGINS.map((login, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-[#0D1B2A] rounded-lg border border-white/5">
                <div>
                  <div className="text-sm text-white flex items-center gap-2">
                    {login.user}
                    {login.location === 'Unknown' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{login.device}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">{login.ip}</div>
                  <div className="text-[10px] text-slate-500">{login.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </DarkCard>

        {/* Access Summary */}
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4A843]" />
              Access Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Successful Logins (24h)</span>
                <span className="text-sm font-medium text-emerald-400">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Failed Attempts (24h)</span>
                <span className="text-sm font-medium text-red-400">23</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Active Sessions</span>
                <span className="text-sm font-medium text-[#0A7E8C]">342</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Suspended Accounts</span>
                <span className="text-sm font-medium text-amber-400">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Locked Accounts</span>
                <span className="text-sm font-medium text-red-400">2</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">2FA Enabled</span>
                <span className="text-sm font-medium text-emerald-400">68%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Admin Actions (24h)</span>
                <span className="text-sm font-medium text-[#D4A843]">14</span>
              </div>
            </div>
          </CardContent>
        </DarkCard>
      </div>

      {/* Audit Logs */}
      <DarkCard>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[#0A7E8C]" />
              Audit Logs
            </CardTitle>
            <Select value={auditFilter} onValueChange={setAuditFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-[#0D1B2A] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1B2A4A] border-white/10">
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Action</TableHead>
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400 hidden md:table-cell">Target</TableHead>
                <TableHead className="text-slate-400">Severity</TableHead>
                <TableHead className="text-slate-400 hidden lg:table-cell">IP</TableHead>
                <TableHead className="text-slate-400 hidden sm:table-cell">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map(l => (
                <TableRow key={l.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-white text-sm">{l.action}</TableCell>
                  <TableCell className="text-slate-400">{l.user}</TableCell>
                  <TableCell className="text-slate-400 hidden md:table-cell">{l.target}</TableCell>
                  <TableCell><SeverityBadge severity={l.severity} /></TableCell>
                  <TableCell className="text-slate-500 text-xs font-mono hidden lg:table-cell">{l.ip}</TableCell>
                  <TableCell className="text-slate-500 text-xs hidden sm:table-cell">{l.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </DarkCard>

      {/* Administrative Actions History */}
      <DarkCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4A843]" />
            Administrative Actions History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DEMO_AUDIT_LOGS.filter(l => l.user !== 'System' && l.user !== 'Unknown').map(a => (
              <div key={a.id} className="flex items-center gap-3 p-2.5 bg-[#0D1B2A] rounded-lg border border-white/5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  a.severity === 'critical' ? 'bg-red-400' :
                  a.severity === 'warning' ? 'bg-amber-400' : 'bg-[#0A7E8C]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    <span className="font-medium">{a.user}</span>
                    <span className="text-slate-400"> performed </span>
                    <span className="text-[#D4A843]">{a.action}</span>
                    <span className="text-slate-400"> on </span>
                    <span className="text-slate-300">{a.target}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{a.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </DarkCard>
    </motion.div>
  )
}

// ============================================================
// MAIN FOUNDER DASHBOARD
// ============================================================

export default function FounderDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-[#0D1B2A] -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
      {/* Demo Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[#D4A843]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#D4A843]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Command Center</h1>
                <p className="text-xs text-slate-400">DiplomatiQ Platform Administration</p>
              </div>
            </div>
          </div>
          <Badge className="bg-[#D4A843]/20 text-[#D4A843] border-[#D4A843]/30 text-xs px-3 py-1">
            DEMO DATA — Founder Dashboard Preview
          </Badge>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1B2A4A] border border-white/10 h-auto p-1 flex-wrap">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#0A7E8C] data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="data-[state=active]:bg-[#0A7E8C] data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
          >
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            Financial
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-[#0A7E8C] data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="schools"
            className="data-[state=active]:bg-[#0A7E8C] data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Schools
          </TabsTrigger>
          <TabsTrigger
            value="teachers"
            className="data-[state=active]:bg-[#0A7E8C] data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
            Teachers
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-[#0A7E8C] data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Students
          </TabsTrigger>
          <TabsTrigger
            value="support"
            className="data-[state=active]:bg-[#0A7E8C] data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
          >
            <FileWarning className="w-3.5 h-3.5 mr-1.5" />
            Support
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-[#0A7E8C] data-[state=active]:text-white text-slate-400 text-xs px-3 py-1.5"
          >
            <Shield className="w-3.5 h-3.5 mr-1.5" />
            Security
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="overview">
            <PlatformOverview />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="schools">
            <SchoolManagement />
          </TabsContent>

          <TabsContent value="teachers">
            <TeacherManagement />
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="support">
            <SupportRecovery />
          </TabsContent>

          <TabsContent value="security">
            <SecurityCenter />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
