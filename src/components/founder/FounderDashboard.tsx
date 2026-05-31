'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Building2, GraduationCap, Users, Activity, UserPlus, CreditCard,
  TrendingDown, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  Search, Shield, Eye, Edit, Trash2, Ban, CheckCircle2,
  XCircle, Star, RefreshCw, KeyRound,
  Filter, MoreHorizontal,
  Pin, AlertCircle, Globe, Crown, Lock, Unlock,
  Plus, School, Mail, Clock, AlertTriangle,
  Send, MessageSquare
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  ChartContainer, type ChartConfig
} from '@/components/ui/chart'
import { Textarea } from '@/components/ui/textarea'

// Proper React Error Boundary - catches render errors in children
class TabErrorBoundaryClass extends React.Component<
  { children: React.ReactNode; fallback: (error: Error, reset: () => void) => React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: (error: Error, reset: () => void) => React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, () => this.setState({ hasError: false, error: null }))
    }
    return this.props.children
  }
}

// ============================================================
// TYPES
// ============================================================

interface OverviewData {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalSchools: number
  totalConferences: number
  activeSubscriptions: number
  totalRevenue: number
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  schoolId: string | null
  school: { name: string } | null
  subscription: { tier: string; status: string } | null
  delegateProfile: { xp: number; level: string } | null
}

interface SchoolData {
  id: string
  name: string
  officialName?: string | null
  city: string | null
  country: string
  schoolType: string | null
  isVerified: boolean
  isActive: boolean
  isFeatured: boolean
  verificationStatus: string
  studentCount: number
  teacherCount: number
  _count: { users: number }
}

interface PasswordResetRequest {
  id: string
  email: string
  token: string
  expiresAt: string
  used: boolean
  createdAt: string
  user: {
    id: string
    name: string
    role: string
    isActive: boolean
  } | null
  status: 'pending' | 'completed' | 'expired'
}

interface AuditLogEntry {
  id: string
  action: string
  resource: string
  resourceId: string | null
  details: string | null
  createdAt: string
  user: { id: string; name: string; email: string; role: string } | null
}

// ============================================================
// CHART CONFIG
// ============================================================

const tierChartConfig: ChartConfig = {
  count: { label: 'Users', color: '#0A7E8C' },
}

const PIE_COLORS = ['#0A7E8C', '#D4A843', '#059669', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899']

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
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
    Active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Suspended: 'bg-red-500/20 text-red-300 border-red-500/40',
    Unverified: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Inactive: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    expired: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    APPROVED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    trialing: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    past_due: 'bg-red-500/20 text-red-300 border-red-500/40',
    cancelled: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    paused: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    unpaid: 'bg-red-500/20 text-red-300 border-red-500/40',
  }
  return (
    <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${config[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'}`}>
      {status}
    </Badge>
  )
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, string> = {
    MASTER_ADMIN: 'bg-[#D4A843]/20 text-[#D4A843] border-[#D4A843]/40',
    FOUNDER: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    SUPER_ADMIN: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    ADMIN: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    SCHOOL_ADMIN: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    TEACHER: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    STUDENT: 'bg-slate-400/20 text-slate-300 border-slate-400/40',
  }
  return (
    <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold whitespace-nowrap ${config[role] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'}`}>
      {role === 'MASTER_ADMIN' && <Crown className="w-3 h-3 mr-1 inline" />}
      {role.replace(/_/g, ' ')}
    </Badge>
  )
}

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`bg-[#1B2A4A] border-white/10 text-white ${className}`}>
      {children}
    </Card>
  )
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ============================================================
// SECTION 1: PLATFORM OVERVIEW
// ============================================================

function PlatformOverview({ overview, isLoading }: { overview: OverviewData | null; isLoading: boolean }) {
  const metrics = overview ? [
    { title: 'Total Schools', value: String(overview.totalSchools), icon: Building2, iconBg: 'bg-[#0D7377]/20', iconColor: 'text-[#0D7377]' },
    { title: 'Total Teachers', value: String(overview.totalTeachers), icon: GraduationCap, iconBg: 'bg-[#D4A843]/20', iconColor: 'text-[#D4A843]' },
    { title: 'Total Students', value: String(overview.totalStudents), icon: Users, iconBg: 'bg-[#059669]/20', iconColor: 'text-[#059669]' },
    { title: 'Active Users', value: String(overview.totalUsers), icon: Activity, iconBg: 'bg-[#8B5CF6]/20', iconColor: 'text-[#8B5CF6]' },
    { title: 'Subscriptions', value: String(overview.activeSubscriptions), icon: CreditCard, iconBg: 'bg-[#0A7E8C]/20', iconColor: 'text-[#0A7E8C]' },
    { title: 'Conferences', value: String(overview.totalConferences), icon: Globe, iconBg: 'bg-[#D4A843]/20', iconColor: 'text-[#D4A843]' },
    { title: 'Revenue', value: overview.totalRevenue ? `$${overview.totalRevenue.toLocaleString()}` : '$0', icon: DollarSign, iconBg: 'bg-[#059669]/20', iconColor: 'text-[#059669]' },
    { title: 'Churn Rate', value: '—', icon: TrendingDown, iconBg: 'bg-[#EF4444]/20', iconColor: 'text-[#EF4444]' },
  ] : []

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DarkCard key={i}>
            <CardContent className="p-4">
              <div className="h-4 bg-white/10 rounded animate-pulse w-16 mb-3" />
              <div className="h-8 bg-white/10 rounded animate-pulse w-20" />
            </CardContent>
          </DarkCard>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {metrics.map((m, i) => (
        <motion.div key={m.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
          <DarkCard>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${m.iconBg} flex items-center justify-center`}>
                  <m.icon className={`w-4.5 h-4.5 ${m.iconColor}`} />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">{m.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.title}</div>
            </CardContent>
          </DarkCard>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================
// SECTION 2: SUBSCRIPTIONS OVERVIEW
// ============================================================

function SubscriptionOverview({ breakdown }: { breakdown: { tier: string; count: number }[] }) {
  const tierData = breakdown.map(s => ({ tier: s.tier || 'Free', count: s.count }))

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Subscriptions by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            {tierData.length > 0 ? (
              <ChartContainer config={tierChartConfig} className="h-[200px] w-full">
                <BarChart data={tierData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="tier" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ background: '#1B2A4A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }}
                    formatter={(v: number) => [v.toLocaleString(), 'Users']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {tierData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-slate-500 text-sm">No subscription data yet</div>
            )}
          </CardContent>
        </DarkCard>

        <DarkCard>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Tier Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tierData.length > 0 ? tierData.map((t, i) => (
                <div key={t.tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm text-slate-300">{t.tier.replace(/_/g, ' ')}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-white/20 text-slate-300">{t.count}</Badge>
                </div>
              )) : (
                <div className="text-slate-500 text-sm text-center py-8">No data</div>
              )}
            </div>
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
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [totalUsers, setTotalUsers] = useState(0)
  const [page, setPage] = useState(1)

  // Add User Dialog
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [isCreating, setIsCreating] = useState(false)

  // Reset Password Dialog
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<UserData | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  // Edit Role Dialog
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UserData | null>(null)
  const [editRole, setEditRole] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' })
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.data || [])
        setTotalUsers(data.pagination?.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('All fields are required')
      return
    }
    if (newUser.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`User ${newUser.email} created successfully`)
        setAddUserOpen(false)
        setNewUser({ name: '', email: '', password: '', role: 'STUDENT' })
        fetchUsers()
      } else {
        // Show the specific error from the API
        toast.error(data.error || 'Failed to create user')
      }
    } catch (err) {
      console.error('Add user error:', err)
      toast.error('Network error — please check your connection and try again')
    } finally {
      setIsCreating(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword) return
    setIsResetting(true)
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Password reset for ${resetTarget.email}`)
        setResetPwdOpen(false)
        setResetTarget(null)
        setNewPassword('')
      } else {
        toast.error(data.error || 'Failed to reset password')
      }
    } catch {
      toast.error('Failed to reset password')
    } finally {
      setIsResetting(false)
    }
  }

  const handleEditRole = async () => {
    if (!editTarget || !editRole) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Role updated for ${editTarget.email}`)
        setEditRoleOpen(false)
        setEditTarget(null)
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to update role')
      }
    } catch {
      toast.error('Failed to update role')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleActive = async (user: UserData) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`${user.email} ${user.isActive ? 'suspended' : 'activated'}`)
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to update user')
      }
    } catch {
      toast.error('Failed to update user')
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`User ${deleteTarget.email} deleted`)
        setDeleteTarget(null)
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = users

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Header with Add User Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">User Management</h3>
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0D7377] hover:bg-[#0A5E62] text-white">
              <UserPlus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1B2A4A] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription className="text-slate-400">Add a user to the platform with a specific role and subscription.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Full Name</Label>
                <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="bg-[#0D1B2A] border-white/10 text-white" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Email</Label>
                <Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-[#0D1B2A] border-white/10 text-white" placeholder="user@example.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Password</Label>
                <Input value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-[#0D1B2A] border-white/10 text-white" placeholder="Min 8 characters, 1 uppercase, 1 number" type="password" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Role</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                  <SelectTrigger className="bg-[#0D1B2A] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="FOUNDER">Founder</SelectItem>
                    <SelectItem value="MASTER_ADMIN">Master Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserOpen(false)} className="border-white/10 text-slate-300">Cancel</Button>
              <Button onClick={handleAddUser} disabled={isCreating} className="bg-[#0D7377] hover:bg-[#0A5E62] text-white">
                {isCreating ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-10 bg-[#1B2A4A] border-white/10 text-white placeholder:text-slate-500" />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px] bg-[#1B2A4A] border-white/10 text-white">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            <SelectItem value="FOUNDER">Founder</SelectItem>
            <SelectItem value="MASTER_ADMIN">Master Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px] bg-[#1B2A4A] border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchUsers} className="bg-[#1B2A4A] border-white/10 text-slate-300 hover:bg-white/10">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Table */}
      <DarkCard>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent bg-white/5 sticky top-0 z-10">
                    <TableHead className="text-slate-200 font-semibold min-w-[140px]">Name</TableHead>
                    <TableHead className="text-slate-200 font-semibold min-w-[180px]">Email</TableHead>
                    <TableHead className="text-slate-200 font-semibold min-w-[130px]">Role</TableHead>
                    <TableHead className="text-slate-200 font-semibold min-w-[120px]">School</TableHead>
                    <TableHead className="text-slate-200 font-semibold min-w-[100px]">Status</TableHead>
                    <TableHead className="text-slate-200 font-semibold min-w-[160px]">Subscription</TableHead>
                    <TableHead className="text-slate-200 font-semibold min-w-[100px] sticky right-0 bg-[#1B2A4A]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}><div className="h-4 bg-white/10 rounded animate-pulse w-20" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No users found</TableCell></TableRow>
                  ) : filtered.map((u) => (
                    <TableRow key={u.id} className="border-white/5 hover:bg-white/8 transition-colors">
                      <TableCell className="font-medium text-white whitespace-nowrap">{u.name}</TableCell>
                      <TableCell className="text-slate-200 text-sm whitespace-nowrap">{u.email}</TableCell>
                      <TableCell><RoleBadge role={u.role} /></TableCell>
                      <TableCell className="text-slate-200 text-sm whitespace-nowrap">{u.school?.name || '—'}</TableCell>
                      <TableCell><StatusBadge status={u.isActive ? 'Active' : 'Suspended'} /></TableCell>
                      <TableCell className="text-slate-200 text-sm whitespace-nowrap">{u.subscription ? `${u.subscription.tier.replace(/_/g, ' ')} (${u.subscription.status})` : 'Free'}</TableCell>
                      <TableCell className="sticky right-0 bg-[#1B2A4A]">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1B2A4A] border-white/10 z-50" align="end">
                            <DropdownMenuLabel className="text-slate-400">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10"
                              onClick={() => { setEditTarget(u); setEditRole(u.role); setEditRoleOpen(true) }}>
                              <Edit className="w-4 h-4 mr-2" /> Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 focus:text-white focus:bg-white/10"
                              onClick={() => { setResetTarget(u); setResetPwdOpen(true) }}>
                              <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem className={u.isActive ? "text-amber-400 focus:text-amber-300 focus:bg-white/10" : "text-emerald-400 focus:text-emerald-300 focus:bg-white/10"}
                              onClick={() => handleToggleActive(u)}>
                              {u.isActive ? <><Ban className="w-4 h-4 mr-2" /> Suspend</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Activate</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-white/10"
                              onClick={() => setDeleteTarget(u)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </DarkCard>
      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
        <span>Showing {filtered.length} of {totalUsers} users</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="bg-[#1B2A4A] border-white/10 text-slate-300 h-7 text-xs hover:bg-white/10">Previous</Button>
          <Button variant="outline" size="sm" disabled={filtered.length < 25} onClick={() => setPage(p => p + 1)} className="bg-[#1B2A4A] border-white/10 text-slate-300 h-7 text-xs hover:bg-white/10">Next</Button>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetPwdOpen} onOpenChange={setResetPwdOpen}>
        <DialogContent className="bg-[#1B2A4A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-[#D4A843]" /> Reset Password</DialogTitle>
            <DialogDescription className="text-slate-400">
              Set a new password for {resetTarget?.email}. The user will be logged out of all active sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-[#0D1B2A] border-white/10 text-white" placeholder="Min 8 characters, 1 uppercase, 1 number" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwdOpen(false)} className="border-white/10 text-slate-300">Cancel</Button>
            <Button onClick={handleResetPassword} disabled={isResetting || !newPassword} className="bg-[#0D7377] hover:bg-[#0A5E62] text-white">
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="bg-[#1B2A4A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription className="text-slate-400">
              Change role for {editTarget?.email}. Current role: {editTarget?.role}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">New Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="bg-[#0D1B2A] border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="FOUNDER">Founder</SelectItem>
                  <SelectItem value="MASTER_ADMIN">Master Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleOpen(false)} className="border-white/10 text-slate-300">Cancel</Button>
            <Button onClick={handleEditRole} disabled={isUpdating} className="bg-[#0D7377] hover:bg-[#0A5E62] text-white">
              {isUpdating ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent className="bg-[#1B2A4A] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to permanently delete {deleteTarget?.email}? This action cannot be undone. All associated data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-slate-300 bg-[#0D1B2A]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

// ============================================================
// SECTION 4: PASSWORD RESET REQUESTS
// ============================================================

function PasswordResetRequests() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')

  // Map statusFilter for API calls: 'all' means no filter
  const apiStatusFilter = statusFilter === 'all' ? '' : statusFilter

  // Reset Password Dialog
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetUserId, setResetUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (apiStatusFilter) params.set('status', apiStatusFilter)
      const res = await fetch(`/api/admin/password-resets?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch password resets:', err)
    } finally {
      setIsLoading(false)
    }
  }, [apiStatusFilter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const pendingCount = requests.filter(r => r.status === 'pending').length

  const handleResetFromRequest = (req: PasswordResetRequest) => {
    if (!req.user?.id) {
      toast.error('Cannot reset password: no user account found for this email')
      return
    }
    setResetEmail(req.email)
    setResetUserId(req.user.id)
    setResetPwdOpen(true)
  }

  const handleResetPassword = async () => {
    if (!resetUserId || !newPassword) return
    setIsResetting(true)
    try {
      const res = await fetch(`/api/admin/users/${resetUserId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Password reset for ${resetEmail}`)
        setResetPwdOpen(false)
        setNewPassword('')
        fetchRequests()
      } else {
        toast.error(data.error || 'Failed to reset password')
      }
    } catch {
      toast.error('Failed to reset password')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Password Reset Requests</h3>
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-[#1B2A4A] border-white/10 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchRequests} className="bg-[#1B2A4A] border-white/10 text-slate-300 hover:bg-[#264B5E]">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#1B2A4A] rounded-lg animate-pulse border border-white/5" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <DarkCard>
          <CardContent className="py-12 text-center">
            <Lock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-slate-400">No password reset requests</div>
            <div className="text-xs text-slate-500 mt-1">When users request a password reset, it will appear here</div>
          </CardContent>
        </DarkCard>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <div key={req.id} className={`flex items-center justify-between p-4 rounded-lg border ${req.status === 'pending' ? 'bg-[#1B2A4A] border-amber-500/30' : 'bg-[#1B2A4A] border-white/5'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{req.email}</span>
                  {req.user && <Badge variant="outline" className="text-[10px] border-white/20 text-slate-400">{req.user.name}</Badge>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(req.createdAt)}
                  </span>
                  {req.status === 'pending' && new Date(req.expiresAt) < new Date() && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Expired
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={req.status} />
                {req.status === 'pending' && req.user && (
                  <Button size="sm" className="h-7 bg-[#0D7377] hover:bg-[#0A5E62] text-white text-xs"
                    onClick={() => handleResetFromRequest(req)}>
                    <KeyRound className="w-3.5 h-3.5 mr-1" /> Reset Password
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset Password Dialog */}
      <Dialog open={resetPwdOpen} onOpenChange={setResetPwdOpen}>
        <DialogContent className="bg-[#1B2A4A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-[#D4A843]" /> Reset Password</DialogTitle>
            <DialogDescription className="text-slate-400">
              Set a new password for {resetEmail}. Since email delivery may not be available, please share the new password with the user through a secure channel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-[#0D1B2A] border-white/10 text-white" placeholder="Min 8 characters, 1 uppercase, 1 number" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwdOpen(false)} className="border-white/10 text-slate-300">Cancel</Button>
            <Button onClick={handleResetPassword} disabled={isResetting || !newPassword} className="bg-[#0D7377] hover:bg-[#0A5E62] text-white">
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ============================================================
// SECTION 5: SCHOOL MANAGEMENT
// ============================================================

function SchoolManagement() {
  const [schools, setSchools] = useState<SchoolData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Add School Dialog
  const [addSchoolOpen, setAddSchoolOpen] = useState(false)
  const [newSchool, setNewSchool] = useState({
    name: '', officialName: '', city: 'Dubai', country: 'UAE', emirate: 'Dubai',
    schoolType: 'INTERNATIONAL', curriculum: 'IB', contactEmail: '', contactPerson: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  const fetchSchools = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (search) params.set('q', search)
      const res = await fetch(`/api/schools?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSchools(data.schools || [])
      }
    } catch (err) {
      console.error('Failed to fetch schools:', err)
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => { fetchSchools() }, [fetchSchools])

  const pendingSchools = schools.filter(s => s.verificationStatus === 'PENDING')

  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.city) {
      toast.error('School name and city are required')
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSchool, source: 'ADMIN_CREATED' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`School "${newSchool.name}" created successfully`)
        setAddSchoolOpen(false)
        setNewSchool({ name: '', officialName: '', city: 'Dubai', country: 'UAE', emirate: 'Dubai', schoolType: 'INTERNATIONAL', curriculum: 'IB', contactEmail: '', contactPerson: '' })
        fetchSchools()
      } else {
        toast.error(data.error || 'Failed to create school')
      }
    } catch {
      toast.error('Failed to create school')
    } finally {
      setIsCreating(false)
    }
  }

  const handleApproveSchool = async (schoolId: string, schoolName: string) => {
    try {
      const res = await fetch(`/api/schools/${schoolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true, verificationStatus: 'APPROVED', isActive: true }),
      })
      if (res.ok) {
        toast.success(`School "${schoolName}" approved`)
        fetchSchools()
      } else {
        toast.error('Failed to approve school')
      }
    } catch {
      toast.error('Failed to approve school')
    }
  }

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">School Management</h3>
        <Dialog open={addSchoolOpen} onOpenChange={setAddSchoolOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0D7377] hover:bg-[#0A5E62] text-white">
              <Plus className="w-4 h-4 mr-2" /> Add School
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1B2A4A] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Add School</DialogTitle>
              <DialogDescription className="text-slate-400">Register a new school in the platform directory.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-300">School Name *</Label>
                  <Input value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} className="bg-[#0D1B2A] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Official Name</Label>
                  <Input value={newSchool.officialName} onChange={(e) => setNewSchool({ ...newSchool, officialName: e.target.value })} className="bg-[#0D1B2A] border-white/10 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-300">City *</Label>
                  <Input value={newSchool.city} onChange={(e) => setNewSchool({ ...newSchool, city: e.target.value })} className="bg-[#0D1B2A] border-white/10 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Emirate</Label>
                  <Select value={newSchool.emirate} onValueChange={(v) => setNewSchool({ ...newSchool, emirate: v })}>
                    <SelectTrigger className="bg-[#0D1B2A] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
                      <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                      <SelectItem value="Dubai">Dubai</SelectItem>
                      <SelectItem value="Sharjah">Sharjah</SelectItem>
                      <SelectItem value="Ajman">Ajman</SelectItem>
                      <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                      <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                      <SelectItem value="Fujairah">Fujairah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-300">School Type</Label>
                  <Select value={newSchool.schoolType} onValueChange={(v) => setNewSchool({ ...newSchool, schoolType: v })}>
                    <SelectTrigger className="bg-[#0D1B2A] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="INTERNATIONAL">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Curriculum</Label>
                  <Select value={newSchool.curriculum} onValueChange={(v) => setNewSchool({ ...newSchool, curriculum: v })}>
                    <SelectTrigger className="bg-[#0D1B2A] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
                      <SelectItem value="AMERICAN">American</SelectItem>
                      <SelectItem value="BRITISH">British</SelectItem>
                      <SelectItem value="IB">IB</SelectItem>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="NATIONAL">National</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Email</Label>
                <Input value={newSchool.contactEmail} onChange={(e) => setNewSchool({ ...newSchool, contactEmail: e.target.value })} className="bg-[#0D1B2A] border-white/10 text-white" type="email" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Contact Person</Label>
                <Input value={newSchool.contactPerson} onChange={(e) => setNewSchool({ ...newSchool, contactPerson: e.target.value })} className="bg-[#0D1B2A] border-white/10 text-white" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddSchoolOpen(false)} className="border-white/10 text-slate-300">Cancel</Button>
              <Button onClick={handleAddSchool} disabled={isCreating} className="bg-[#0D7377] hover:bg-[#0A5E62] text-white">
                {isCreating ? 'Creating...' : 'Add School'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                    <div className="text-xs text-slate-400">{s.city}, {s.country}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      onClick={() => handleApproveSchool(s.id, s.name)}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
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
        <Input placeholder="Search schools..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-[#1B2A4A] border-white/10 text-white placeholder:text-slate-500" />
      </div>

      {/* Table */}
      <DarkCard>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <ScrollArea className="max-h-[500px]">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent bg-white/5">
                    <TableHead className="text-slate-300 font-semibold min-w-[180px]">Name</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[100px]">City</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[100px]">Type</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[80px]">Verified</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[60px]">Users</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}><div className="h-4 bg-white/10 rounded animate-pulse w-20" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : schools.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No schools found</TableCell></TableRow>
                  ) : schools.map(s => (
                    <TableRow key={s.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {s.isFeatured && <Star className="w-3.5 h-3.5 text-[#D4A843] fill-[#D4A843]" />}
                          {s.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 whitespace-nowrap">{s.city || '—'}</TableCell>
                      <TableCell className="text-slate-300 whitespace-nowrap">{s.schoolType || '—'}</TableCell>
                      <TableCell>
                        {s.isVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                      </TableCell>
                      <TableCell className="text-slate-300">{s._count?.users || 0}</TableCell>
                      <TableCell><StatusBadge status={s.verificationStatus} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </DarkCard>
    </motion.div>
  )
}

// ============================================================
// SECTION 6: AUDIT LOGS
// ============================================================

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin?action=audit-logs&limit=50')
        if (res.ok) {
          const data = await res.json()
          setLogs(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
  }, [])

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Audit Logs</h3>
      <DarkCard>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <ScrollArea className="max-h-[500px]">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent bg-white/5">
                    <TableHead className="text-slate-300 font-semibold min-w-[100px]">Action</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[120px]">User</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[100px]">Resource</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[200px]">Details</TableHead>
                    <TableHead className="text-slate-300 font-semibold min-w-[140px]">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}><div className="h-4 bg-white/10 rounded animate-pulse w-20" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">No audit logs yet</TableCell></TableRow>
                  ) : logs.map(log => (
                    <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] border-white/20 text-slate-300 font-semibold">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm whitespace-nowrap">{log.user?.name || 'System'}</TableCell>
                      <TableCell className="text-slate-300 text-sm whitespace-nowrap">{log.resource}</TableCell>
                      <TableCell className="text-slate-400 text-xs max-w-[250px] truncate">{log.details || '—'}</TableCell>
                      <TableCell className="text-slate-400 text-xs whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </DarkCard>
    </motion.div>
  )
}

// ============================================================
// SECTION 7: SUBSCRIPTION MANAGEMENT
// ============================================================

interface SubscriptionDetail {
  tier: string
  status: string
  trialStartsAt: string | null
  trialEndsAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface SubUserData {
  id: string
  name: string
  email: string
  tier: string
  status: string
  trialStartsAt: string | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

const SUBSCRIPTION_TIERS = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE', 'SCHOOL']

function SubscriptionManagement() {
  const [users, setUsers] = useState<SubUserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Manage dialog
  const [manageOpen, setManageOpen] = useState(false)
  const [manageTarget, setManageTarget] = useState<SubUserData | null>(null)
  const [subscriptionDetail, setSubscriptionDetail] = useState<SubscriptionDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Action states
  const [selectedTier, setSelectedTier] = useState('')
  const [trialDays, setTrialDays] = useState(7)

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: '1', limit: '100' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        const mapped: SubUserData[] = (data.data || []).map((u: UserData) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          tier: u.subscription?.tier || 'FREE',
          status: u.subscription?.status || 'inactive',
          trialStartsAt: null,
          trialEndsAt: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        }))
        setUsers(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch subscription users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleManage = async (user: SubUserData) => {
    setManageTarget(user)
    setManageOpen(true)
    setIsLoadingDetail(true)
    setSelectedTier('')
    setTrialDays(7)
    try {
      const res = await fetch(`/api/admin/subscriptions/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setSubscriptionDetail(data.data || data.subscription || null)
      } else {
        setSubscriptionDetail({
          tier: user.tier,
          status: user.status,
          trialStartsAt: null,
          trialEndsAt: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        })
      }
    } catch {
      setSubscriptionDetail({
        tier: user.tier,
        status: user.status,
        trialStartsAt: null,
        trialEndsAt: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleAction = async (action: string, extra?: Record<string, unknown>) => {
    if (!manageTarget) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/subscriptions/${manageTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || `Subscription ${action} succeeded`)
        setManageOpen(false)
        setManageTarget(null)
        setSubscriptionDetail(null)
        fetchUsers()
      } else {
        toast.error(data.error || `Failed to ${action} subscription`)
      }
    } catch {
      toast.error(`Failed to ${action} subscription`)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#0A7E8C]" /> Subscription Management
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-[200px] bg-[#1B2A4A] border-white/10 text-white placeholder:text-slate-500 text-sm" />
          </div>
          <Button variant="outline" onClick={fetchUsers} className="bg-[#1B2A4A] border-white/10 text-slate-300 hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <DarkCard>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent bg-white/5 sticky top-0 z-10">
                  <TableHead className="text-slate-200 font-semibold min-w-[140px]">Name</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[180px]">Email</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[120px]">Tier</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[110px]">Status</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[120px]">Trial End</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[120px]">Period End</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[100px]">Cancel at End</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[80px] sticky right-0 bg-[#1B2A4A]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/5">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-white/10 rounded animate-pulse w-20" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No users found</TableCell></TableRow>
                ) : users.map((u) => (
                  <TableRow key={u.id} className="border-white/5 hover:bg-white/8 transition-colors">
                    <TableCell className="font-medium text-white whitespace-nowrap">{u.name}</TableCell>
                    <TableCell className="text-slate-200 text-sm whitespace-nowrap">{u.email}</TableCell>
                    <TableCell className="text-slate-200 text-sm whitespace-nowrap">{u.tier.replace(/_/g, ' ')}</TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell className="text-slate-300 text-sm whitespace-nowrap">{formatDate(u.trialEndsAt)}</TableCell>
                    <TableCell className="text-slate-300 text-sm whitespace-nowrap">{formatDate(u.currentPeriodEnd)}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{u.cancelAtPeriodEnd ? <span className="text-amber-400">Yes</span> : <span className="text-slate-500">No</span>}</TableCell>
                    <TableCell className="sticky right-0 bg-[#1B2A4A]">
                      <Button variant="outline" size="sm" onClick={() => handleManage(u)} className="bg-[#0D7377]/20 border-[#0D7377]/40 text-[#0D7377] hover:bg-[#0D7377]/30 hover:text-[#0A7E8C] h-7 text-xs">
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </DarkCard>

      {/* Manage Subscription Dialog */}
      <Dialog open={manageOpen} onOpenChange={(open) => { if (!open) { setManageOpen(false); setManageTarget(null); setSubscriptionDetail(null) } }}>
        <DialogContent className="bg-[#1B2A4A] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#0A7E8C]" /> Manage Subscription</DialogTitle>
            <DialogDescription className="text-slate-400">
              Manage subscription for {manageTarget?.email}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-white/10 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Current Subscription Details */}
              <div className="bg-[#0D1B2A] rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Current Subscription</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">Tier:</span> <span className="text-white font-medium">{(subscriptionDetail?.tier || manageTarget?.tier || 'FREE').replace(/_/g, ' ')}</span></div>
                  <div><span className="text-slate-400">Status:</span> <StatusBadge status={subscriptionDetail?.status || manageTarget?.status || 'inactive'} /></div>
                  <div><span className="text-slate-400">Trial Start:</span> <span className="text-white">{formatDate(subscriptionDetail?.trialStartsAt)}</span></div>
                  <div><span className="text-slate-400">Trial End:</span> <span className="text-white">{formatDate(subscriptionDetail?.trialEndsAt)}</span></div>
                  <div><span className="text-slate-400">Period Start:</span> <span className="text-white">{formatDate(subscriptionDetail?.currentPeriodStart)}</span></div>
                  <div><span className="text-slate-400">Period End:</span> <span className="text-white">{formatDate(subscriptionDetail?.currentPeriodEnd)}</span></div>
                  <div className="col-span-2"><span className="text-slate-400">Cancel at Period End:</span> <span className={subscriptionDetail?.cancelAtPeriodEnd ? 'text-amber-400' : 'text-slate-300'}>{subscriptionDetail?.cancelAtPeriodEnd ? 'Yes' : 'No'}</span></div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Upgrade */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-slate-300 text-xs">Upgrade Tier</Label>
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger className="bg-[#0D1B2A] border-white/10 text-white h-9 text-sm">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
                        {SUBSCRIPTION_TIERS.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" disabled={actionLoading || !selectedTier} onClick={() => handleAction('upgrade', { tier: selectedTier })} className="bg-[#059669] hover:bg-[#047857] text-white h-9">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" /> Upgrade
                  </Button>
                </div>

                {/* Downgrade */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-slate-300 text-xs">Downgrade Tier</Label>
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger className="bg-[#0D1B2A] border-white/10 text-white h-9 text-sm">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
                        {SUBSCRIPTION_TIERS.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" disabled={actionLoading || !selectedTier} onClick={() => handleAction('downgrade', { tier: selectedTier })} className="bg-amber-600 hover:bg-amber-700 text-white h-9">
                    <TrendingDown className="w-3.5 h-3.5 mr-1" /> Downgrade
                  </Button>
                </div>

                {/* Extend Trial */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-slate-300 text-xs">Extend Trial (days)</Label>
                    <Input type="number" min={1} max={365} value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} className="bg-[#0D1B2A] border-white/10 text-white h-9 text-sm" />
                  </div>
                  <Button size="sm" disabled={actionLoading || trialDays < 1} onClick={() => handleAction('extend_trial', { days: trialDays })} className="bg-[#0D7377] hover:bg-[#0A5E62] text-white h-9">
                    <Clock className="w-3.5 h-3.5 mr-1" /> Extend
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" disabled={actionLoading} onClick={() => handleAction('activate')} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Activate
                  </Button>
                  <Button size="sm" disabled={actionLoading} onClick={() => handleAction('suspend')} className="bg-amber-600 hover:bg-amber-700 text-white h-9 text-xs">
                    <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                  </Button>
                  <Button size="sm" disabled={actionLoading} onClick={() => handleAction('cancel')} className="bg-red-600 hover:bg-red-700 text-white h-9 text-xs">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" disabled={actionLoading} onClick={() => handleAction('restore')} className="bg-sky-600 hover:bg-sky-700 text-white h-9 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Restore
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setManageOpen(false); setManageTarget(null); setSubscriptionDetail(null) }} className="border-white/10 text-slate-300">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ============================================================
// SECTION 8: ADMIN MESSAGING
// ============================================================

interface MessageData {
  id: string
  recipientId: string
  recipientName: string
  recipientEmail: string
  subject: string
  content: string
  category: string
  isRead: boolean
  createdAt: string
}

const MESSAGE_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'account', label: 'Account' },
  { value: 'system', label: 'System' },
  { value: 'support', label: 'Support' },
]

function AdminMessaging() {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Compose dialog
  const [composeOpen, setComposeOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    category: 'general',
  })

  // User list for recipient search
  const [userList, setUserList] = useState<UserData[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  // View message dialog
  const [viewOpen, setViewOpen] = useState(false)
  const [viewMessage, setViewMessage] = useState<MessageData | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data.data || data.messages || [])
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const fetchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setUserList([])
      return
    }
    setIsLoadingUsers(true)
    try {
      const params = new URLSearchParams({ page: '1', limit: '20', search: searchTerm })
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUserList(data.data || [])
      }
    } catch {
      console.error('Failed to search users')
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(userSearch), 300)
    return () => clearTimeout(timer)
  }, [userSearch, fetchUsers])

  const handleSend = async () => {
    if (!composeData.recipientId || !composeData.subject || !composeData.content) {
      toast.error('Recipient, subject, and content are required')
      return
    }
    setIsSending(true)
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Message sent successfully')
        setComposeOpen(false)
        setComposeData({ recipientId: '', subject: '', content: '', category: 'general' })
        setUserSearch('')
        fetchMessages()
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const config: Record<string, string> = {
      general: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      password_reset: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      subscription: 'bg-[#0A7E8C]/20 text-[#0A7E8C] border-[#0A7E8C]/40',
      account: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      system: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      support: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    }
    return config[category] || 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  }

  return (
    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#D4A843]" /> Admin Messaging
        </h3>
        <div className="flex items-center gap-2">
          <Button className="bg-[#0D7377] hover:bg-[#0A5E62] text-white" onClick={() => setComposeOpen(true)}>
            <Send className="w-4 h-4 mr-2" /> Compose Message
          </Button>
          <Button variant="outline" onClick={fetchMessages} className="bg-[#1B2A4A] border-white/10 text-slate-300 hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <DarkCard>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent bg-white/5 sticky top-0 z-10">
                  <TableHead className="text-slate-200 font-semibold min-w-[140px]">Recipient</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[200px]">Subject</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[120px]">Category</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[140px]">Sent Date</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[80px]">Read</TableHead>
                  <TableHead className="text-slate-200 font-semibold min-w-[80px] sticky right-0 bg-[#1B2A4A]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/5">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-white/10 rounded animate-pulse w-20" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : messages.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">No messages sent yet</TableCell></TableRow>
                ) : messages.map((msg) => (
                  <TableRow key={msg.id} className="border-white/5 hover:bg-white/8 transition-colors">
                    <TableCell className="text-slate-200 text-sm whitespace-nowrap">{msg.recipientName || msg.recipientEmail}</TableCell>
                    <TableCell className="text-white text-sm font-medium whitespace-nowrap max-w-[250px] truncate">{msg.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold ${getCategoryBadge(msg.category)}`}>
                        {msg.category.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm whitespace-nowrap">{formatDateTime(msg.createdAt)}</TableCell>
                    <TableCell>
                      {msg.isRead ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-2 py-0.5">Read</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-slate-500/20 text-slate-300 border-slate-500/40 px-2 py-0.5">Unread</Badge>
                      )}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-[#1B2A4A]">
                      <Button variant="outline" size="sm" onClick={() => { setViewMessage(msg); setViewOpen(true) }} className="bg-[#1B2A4A] border-white/10 text-slate-300 hover:bg-white/10 hover:text-white h-7 text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </DarkCard>

      {/* Compose Message Dialog */}
      <Dialog open={composeOpen} onOpenChange={(open) => { if (!open) { setComposeOpen(false); setUserSearch('') } }}>
        <DialogContent className="bg-[#1B2A4A] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="w-5 h-5 text-[#D4A843]" /> Compose Message</DialogTitle>
            <DialogDescription className="text-slate-400">Send a message to a user on the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Recipient */}
            <div className="space-y-2">
              <Label className="text-slate-300">Recipient</Label>
              <div className="relative">
                <Input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-[#0D1B2A] border-white/10 text-white"
                />
                {isLoadingUsers && <div className="absolute right-3 top-1/2 -translate-y-1/2"><RefreshCw className="w-4 h-4 text-slate-400 animate-spin" /></div>}
              </div>
              {userList.length > 0 && userSearch.length >= 2 && (
                <div className="max-h-[150px] overflow-y-auto bg-[#0D1B2A] border border-white/10 rounded-lg">
                  {userList.map((u) => (
                    <button
                      key={u.id}
                      className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors flex items-center gap-2 text-sm"
                      onClick={() => {
                        setComposeData({ ...composeData, recipientId: u.id })
                        setUserSearch(`${u.name} (${u.email})`)
                        setUserList([])
                      }}
                    >
                      <span className="text-white">{u.name}</span>
                      <span className="text-slate-400 text-xs">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {composeData.recipientId && (
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Recipient selected
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-slate-300">Subject</Label>
              <Input
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                className="bg-[#0D1B2A] border-white/10 text-white"
                placeholder="Message subject"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-slate-300">Category</Label>
              <Select value={composeData.category} onValueChange={(v) => setComposeData({ ...composeData, category: v })}>
                <SelectTrigger className="bg-[#0D1B2A] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1B2A4A] border-white/10 z-50">
                  {MESSAGE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label className="text-slate-300">Content</Label>
              <Textarea
                value={composeData.content}
                onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                className="bg-[#0D1B2A] border-white/10 text-white min-h-[120px] resize-y"
                placeholder="Write your message here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setComposeOpen(false); setUserSearch('') }} className="border-white/10 text-slate-300">Cancel</Button>
            <Button onClick={handleSend} disabled={isSending || !composeData.recipientId || !composeData.subject || !composeData.content} className="bg-[#0D7377] hover:bg-[#0A5E62] text-white">
              {isSending ? 'Sending...' : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog open={viewOpen} onOpenChange={(open) => { if (!open) { setViewOpen(false); setViewMessage(null) } }}>
        <DialogContent className="bg-[#1B2A4A] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-[#D4A843]" /> Message Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              To: {viewMessage?.recipientName || viewMessage?.recipientEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-slate-400">Subject:</span> <span className="text-white font-medium">{viewMessage?.subject}</span></div>
              <div><span className="text-slate-400">Category:</span> <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold ${getCategoryBadge(viewMessage?.category || '')}`}>{viewMessage?.category?.replace(/_/g, ' ')}</Badge></div>
              <div><span className="text-slate-400">Sent:</span> <span className="text-white">{formatDateTime(viewMessage?.createdAt)}</span></div>
              <div><span className="text-slate-400">Read:</span> <span className={viewMessage?.isRead ? 'text-emerald-400' : 'text-slate-400'}>{viewMessage?.isRead ? 'Yes' : 'No'}</span></div>
            </div>
            <Separator className="bg-white/10" />
            <div className="bg-[#0D1B2A] rounded-lg p-4 text-sm text-slate-200 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {viewMessage?.content}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setViewOpen(false); setViewMessage(null) }} className="border-white/10 text-slate-300">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// ============================================================
// MAIN COMPONENT: MASTER ADMIN COMMAND CENTER
// ============================================================

export default function FounderDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState<{ tier: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [tabError, setTabError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch('/api/admin')
        if (res.ok) {
          const data = await res.json()
          setOverview(data.data?.overview || null)
          setSubscriptionBreakdown(data.data?.subscriptionBreakdown || [])
        } else {
          console.error('[FOUNDER] Admin API returned status:', res.status)
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAdminData()
  }, [])

  // Clear tab error when switching tabs
  const handleTabChange = (value: string) => {
    setTabError(null)
    setActiveTab(value)
  }

  // Error boundary wrapper for tab content
  const TabErrorBoundary = ({ children }: { children: React.ReactNode }) => (
    <TabErrorBoundaryClass
      fallback={(error, reset) => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
          <p className="text-slate-400">Something went wrong loading this section.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md">{error.message}</p>
          <Button variant="outline" onClick={reset} className="mt-3 bg-[#1B2A4A] border-white/10 text-slate-300 hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      )}
    >
      {children}
    </TabErrorBoundaryClass>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A4B] flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#D4A843]" />
            Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Master Administrator — Full platform control</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="text-[#1B3A4B] border-[#1B3A4B]/20 hover:bg-[#1B3A4B]/5">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-[#1B3A4B]/5 border border-[#1B3A4B]/10 w-full sm:w-auto inline-flex">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4">Overview</TabsTrigger>
            <TabsTrigger value="sub-overview" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4">Sub Overview</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4">Users</TabsTrigger>
            <TabsTrigger value="passwords" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4">
              Password Resets
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4">Subscriptions</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4">Messages</TabsTrigger>
            <TabsTrigger value="schools" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4">Schools</TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4">Audit Logs</TabsTrigger>
          </TabsList>
        </div>

        {tabError && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {tabError}
          </div>
        )}

        <TabsContent value="overview" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-4 md:p-6">
            <PlatformOverview overview={overview} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="sub-overview" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-4 md:p-6">
            <SubscriptionOverview breakdown={subscriptionBreakdown} />
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-4 md:p-6">
            <UserManagement />
          </div>
        </TabsContent>

        <TabsContent value="passwords" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-4 md:p-6">
            <PasswordResetRequests />
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-4 md:p-6">
            <SubscriptionManagement />
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-4 md:p-6">
            <AdminMessaging />
          </div>
        </TabsContent>

        <TabsContent value="schools" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-4 md:p-6">
            <SchoolManagement />
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-4 md:p-6">
            <AuditLogs />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
