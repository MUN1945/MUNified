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
  Plus, School, Mail, Clock, AlertTriangle
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
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    Unverified: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    expired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-medium ${config[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
      {status}
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
                  <SelectContent className="bg-[#1B2A4A] border-white/10">
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
          <SelectContent className="bg-[#1B2A4A] border-white/10">
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
          <SelectContent className="bg-[#1B2A4A] border-white/10">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchUsers} className="bg-[#1B2A4A] border-white/10 text-slate-300 hover:bg-[#264B5E]">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
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
                  <TableHead className="text-slate-400">Actions</TableHead>
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
                  <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-8">No users found</TableCell></TableRow>
                ) : filtered.map((u) => (
                  <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{u.name}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] border-white/20 ${u.role === 'MASTER_ADMIN' ? 'text-[#D4A843] border-[#D4A843]/30' : 'text-slate-300'}`}>
                        {u.role === 'MASTER_ADMIN' && <Crown className="w-3 h-3 mr-1" />}
                        {u.role.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 hidden md:table-cell text-sm">{u.school?.name || '—'}</TableCell>
                    <TableCell><StatusBadge status={u.isActive ? 'Active' : 'Suspended'} /></TableCell>
                    <TableCell className="text-slate-400 hidden lg:table-cell text-xs">{u.subscription ? `${u.subscription.tier} (${u.subscription.status})` : 'Free'}</TableCell>
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
          </ScrollArea>
        </CardContent>
      </DarkCard>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filtered.length} of {totalUsers} users</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="bg-[#1B2A4A] border-white/10 text-slate-300 h-7 text-xs">Previous</Button>
          <Button variant="outline" size="sm" disabled={filtered.length < 25} onClick={() => setPage(p => p + 1)} className="bg-[#1B2A4A] border-white/10 text-slate-300 h-7 text-xs">Next</Button>
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
                <SelectContent className="bg-[#1B2A4A] border-white/10">
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

  // Reset Password Dialog
  const [resetPwdOpen, setResetPwdOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetUserId, setResetUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter) params.set('status', statusFilter)
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
  }, [statusFilter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const pendingCount = requests.filter(r => r.status === 'pending').length

  const handleResetFromRequest = (req: PasswordResetRequest) => {
    setResetEmail(req.email)
    setResetUserId(req.user?.id || '')
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
            <SelectContent className="bg-[#1B2A4A] border-white/10">
              <SelectItem value="">All</SelectItem>
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
                    <SelectContent className="bg-[#1B2A4A] border-white/10">
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
                    <SelectContent className="bg-[#1B2A4A] border-white/10">
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
                    <SelectContent className="bg-[#1B2A4A] border-white/10">
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
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">City</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Verified</TableHead>
                  <TableHead className="text-slate-400 hidden lg:table-cell">Users</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
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
                  <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-8">No schools found</TableCell></TableRow>
                ) : schools.map(s => (
                  <TableRow key={s.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        {s.isFeatured && <Star className="w-3.5 h-3.5 text-[#D4A843] fill-[#D4A843]" />}
                        {s.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 hidden md:table-cell">{s.city || '—'}</TableCell>
                    <TableCell className="text-slate-400">{s.schoolType || '—'}</TableCell>
                    <TableCell>
                      {s.isVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    </TableCell>
                    <TableCell className="text-slate-400 hidden lg:table-cell">{s._count?.users || 0}</TableCell>
                    <TableCell><StatusBadge status={s.verificationStatus} /></TableCell>
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
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-400">Action</TableHead>
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Resource</TableHead>
                  <TableHead className="text-slate-400 hidden md:table-cell">Details</TableHead>
                  <TableHead className="text-slate-400">Time</TableHead>
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
                  <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-8">No audit logs yet</TableCell></TableRow>
                ) : logs.map(log => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-white/20 text-slate-300">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{log.user?.name || 'System'}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{log.resource}</TableCell>
                    <TableCell className="text-slate-500 text-xs hidden md:table-cell max-w-[200px] truncate">{log.details || '—'}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{formatDateTime(log.createdAt)}</TableCell>
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
// MAIN COMPONENT: MASTER ADMIN COMMAND CENTER
// ============================================================

export default function FounderDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState<{ tier: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch('/api/admin')
        if (res.ok) {
          const data = await res.json()
          setOverview(data.data?.overview || null)
          setSubscriptionBreakdown(data.data?.subscriptionBreakdown || [])
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAdminData()
  }, [])

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
        <Button variant="outline" onClick={() => window.location.reload()} className="text-[#1B3A4B] border-[#1B3A4B]/20">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#1B3A4B]/5 border border-[#1B3A4B]/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white">Subscriptions</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white">Users</TabsTrigger>
          <TabsTrigger value="passwords" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white">
            Password Resets
          </TabsTrigger>
          <TabsTrigger value="schools" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white">Schools</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#1B3A4B] data-[state=active]:text-white">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-6">
            <PlatformOverview overview={overview} isLoading={isLoading} />
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-6">
            <SubscriptionOverview breakdown={subscriptionBreakdown} />
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-6">
            <UserManagement />
          </div>
        </TabsContent>

        <TabsContent value="passwords" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-6">
            <PasswordResetRequests />
          </div>
        </TabsContent>

        <TabsContent value="schools" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-6">
            <SchoolManagement />
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="bg-[#0D1B2A] rounded-2xl p-6">
            <AuditLogs />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
