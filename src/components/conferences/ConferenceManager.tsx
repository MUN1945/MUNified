'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, CalendarDays, MapPin, Users, Building2,
  ArrowLeft, Filter, MoreHorizontal, Globe, Clock, Edit, Trash2,
  Eye, Shield, Landmark, Siren, Scale, UserPlus, LayoutGrid, CheckCircle2,
  X, Sparkles, Calculator, ChevronDown, Gavel, UserCheck,
  ToggleLeft, Rows3, CircleDot, Milestone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ============================================================
// TYPES
// ============================================================

type ConferenceStatus =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

type CommitteeType =
  | 'GENERAL_ASSEMBLY'
  | 'SECURITY_COUNCIL'
  | 'ECOSOC'
  | 'CRISIS_COMMITTEE'
  | 'HUMAN_RIGHTS_COUNCIL'
  | 'ICJ'
  | 'WHO'
  | 'UNEP'
  | 'CUSTOM'

type LayoutType = 'U_SHAPE' | 'CLASSROOM' | 'ROUND_TABLE' | 'HORSESHOE'

type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

interface Committee {
  id: string
  name: string
  type: CommitteeType
  topic: string
  countryLimit: number
  chair?: string
}

interface Delegate {
  id: string
  name: string
  country: string
  committeeId: string
  school: string
}

interface Conference {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  status: ConferenceStatus
  theme: string
  layout: LayoutType
  committees: Committee[]
  delegates: Delegate[]
}

// ============================================================
// STATUS BADGE CONFIG
// ============================================================

const STATUS_CONFIG: Record<ConferenceStatus, { label: string; className: string; dotColor: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600 border-gray-200', dotColor: 'bg-gray-400' },
  REGISTRATION_OPEN: { label: 'Registration Open', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
  REGISTRATION_CLOSED: { label: 'Reg. Closed', className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-teal-50 text-[#0D7377] border-teal-200', dotColor: 'bg-[#0D7377]' },
  COMPLETED: { label: 'Completed', className: 'bg-[#1B3A4B]/5 text-[#1B3A4B] border-[#1B3A4B]/20', dotColor: 'bg-[#1B3A4B]' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-50 text-red-600 border-red-200', dotColor: 'bg-red-500' },
}

// ============================================================
// COMMITTEE TYPE CONFIG
// ============================================================

const COMMITTEE_TYPE_CONFIG: Record<CommitteeType, { label: string; icon: React.ElementType; color: string }> = {
  GENERAL_ASSEMBLY: { label: 'General Assembly', icon: Landmark, color: '#0D7377' },
  SECURITY_COUNCIL: { label: 'Security Council', icon: Shield, color: '#DC2626' },
  ECOSOC: { label: 'ECOSOC', icon: Scale, color: '#D4A843' },
  CRISIS_COMMITTEE: { label: 'Crisis Committee', icon: Siren, color: '#F59E0B' },
  HUMAN_RIGHTS_COUNCIL: { label: 'Human Rights Council', icon: Users, color: '#8B5CF6' },
  ICJ: { label: 'International Court of Justice', icon: Gavel, color: '#059669' },
  WHO: { label: 'World Health Organization', icon: Globe, color: '#06B6D4' },
  UNEP: { label: 'UN Environment Programme', icon: Landmark, color: '#10B981' },
  CUSTOM: { label: 'Custom Committee', icon: CircleDot, color: '#6B7280' },
}

// ============================================================
// LAYOUT CONFIG
// ============================================================

const LAYOUT_CONFIG: Record<LayoutType, { label: string; icon: React.ElementType }> = {
  U_SHAPE: { label: 'U-Shape', icon: ToggleLeft },
  CLASSROOM: { label: 'Classroom', icon: Rows3 },
  ROUND_TABLE: { label: 'Round Table', icon: CircleDot },
  HORSESHOE: { label: 'Horseshoe', icon: Milestone },
}

// ============================================================
// DATA IS FETCHED FROM /api/conferences
// ============================================================

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ============================================================
// STATUS BADGE COMPONENT
// ============================================================

function StatusBadge({ status }: { status: ConferenceStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={`text-[11px] font-medium gap-1.5 ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </Badge>
  )
}

// ============================================================
// COMMITTEE TYPE ICON
// ============================================================

function CommitteeTypeIcon({ type, size = 16 }: { type: CommitteeType; size?: number }) {
  const config = COMMITTEE_TYPE_CONFIG[type]
  const Icon = config.icon
  return <Icon style={{ width: size, height: size, color: config.color }} />
}

// ============================================================
// LAYOUT ICON VISUAL
// ============================================================

function LayoutVisual({ layout, selected, onClick }: { layout: LayoutType; selected: boolean; onClick: () => void }) {
  const config = LAYOUT_CONFIG[layout]
  const Icon = config.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        selected
          ? 'border-[#0D7377] bg-[#0D7377]/5 text-[#0D7377]'
          : 'border-[#E8DED0] bg-white text-muted-foreground hover:border-[#0D7377]/30 hover:bg-[#0D7377]/[0.02]'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{config.label}</span>
    </button>
  )
}

// ============================================================
// CONFERENCE LIST VIEW
// ============================================================

function ConferenceListView({
  conferences,
  onSelect,
  onCreateNew,
}: {
  conferences: Conference[]
  onSelect: (conf: Conference) => void
  onCreateNew: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ConferenceStatus | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    return conferences.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.theme.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [conferences, searchQuery, statusFilter])

  const statusFilters: { value: ConferenceStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'REGISTRATION_OPEN', label: 'Open' },
    { value: 'REGISTRATION_CLOSED', label: 'Closed' },
    { value: 'IN_PROGRESS', label: 'Active' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'COMPLETED', label: 'Done' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1B3A4B]">Conferences</h2>
            <p className="text-muted-foreground mt-1">Discover and manage MUN conferences worldwide</p>
          </div>
          <Button
            className="bg-[#0D7377] hover:bg-[#0A5C5F] text-white gap-2 shrink-0"
            onClick={onCreateNew}
          >
            <Plus className="w-4 h-4" />
            Create Conference
          </Button>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conferences, locations, themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground mr-1" />
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-[#0D7377] text-white'
                    : 'bg-[#F5F0EB] text-muted-foreground hover:bg-[#0D7377]/10 hover:text-[#0D7377]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Conference Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {filtered.map((conference) => (
          <motion.div key={conference.id} variants={staggerItem}>
            <Card
              className="cursor-pointer hover:shadow-lg hover:border-[#0D7377]/30 transition-all duration-300 group overflow-hidden"
              onClick={() => onSelect(conference)}
            >
              {/* Color strip at top */}
              <div
                className="h-1.5"
                style={{
                  background: STATUS_CONFIG[conference.status].dotColor,
                  opacity: 0.8,
                }}
              />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-bold text-[#1B3A4B] group-hover:text-[#0D7377] transition-colors truncate">
                      {conference.name}
                    </CardTitle>
                    <StatusBadge status={conference.status} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(conference) }}>
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                {conference.theme && (
                  <p className="text-sm text-[#0D7377] font-medium italic line-clamp-2">
                    &ldquo;{conference.theme}&rdquo;
                  </p>
                )}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-[#0D7377]" />
                    <span>
                      {new Date(conference.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' — '}
                      {new Date(conference.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#D4A843]" />
                    <span>{conference.location}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#0D7377]" />
                    <span>{conference.committees.length} Committee{conference.committees.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#D4A843]" />
                    <span>{conference.delegates.length} Delegate{conference.delegates.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1B3A4B]">No conferences found</h3>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </div>
  )
}

// ============================================================
// CREATE/EDIT CONFERENCE FORM
// ============================================================

function ConferenceForm({
  onSave,
  onCancel,
  initialData,
}: {
  onSave: (conference: Conference) => void
  onCancel: () => void
  initialData?: Conference | null
}) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [theme, setTheme] = useState(initialData?.theme || '')
  const [layout, setLayout] = useState<LayoutType>(initialData?.layout || 'U_SHAPE')
  const [committees, setCommittees] = useState<Committee[]>(
    initialData?.committees || [{ id: `new-cm-${Date.now()}`, name: '', type: 'GENERAL_ASSEMBLY', topic: '', countryLimit: 50 }]
  )

  const addCommittee = () => {
    setCommittees([
      ...committees,
      { id: `new-cm-${Date.now()}`, name: '', type: 'GENERAL_ASSEMBLY', topic: '', countryLimit: 50 },
    ])
  }

  const removeCommittee = (id: string) => {
    if (committees.length <= 1) return
    setCommittees(committees.filter((c) => c.id !== id))
  }

  const updateCommittee = (id: string, field: keyof Committee, value: string | number) => {
    setCommittees(
      committees.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const handleSave = (status: ConferenceStatus) => {
    const conference: Conference = {
      id: initialData?.id || `conf-${Date.now()}`,
      name,
      description,
      startDate,
      endDate,
      location,
      status,
      theme,
      layout,
      committees,
      delegates: initialData?.delegates || [],
    }
    onSave(conference)
  }

  const isValid = name.trim() && startDate && endDate && location.trim()

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-[#1B3A4B]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#1B3A4B]">
              {initialData ? 'Edit Conference' : 'Create Conference'}
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              {initialData ? 'Update conference details and configuration' : 'Set up a new MUN conference'}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conference Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conf-name">Conference Name *</Label>
                  <Input
                    id="conf-name"
                    placeholder="e.g., Harvard WorldMUN 2026"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conf-desc">Description</Label>
                  <Textarea
                    id="conf-desc"
                    placeholder="Brief description of the conference..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20 min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conf-start">Start Date *</Label>
                    <Input
                      id="conf-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conf-end">End Date *</Label>
                    <Input
                      id="conf-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conf-location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="conf-location"
                      placeholder="e.g., Paris, France"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conf-theme">Conference Theme</Label>
                  <Input
                    id="conf-theme"
                    placeholder="e.g., Bridging Divides: Diplomacy in a Fragmented World"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Layout Selector */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Committee Layout</CardTitle>
                <CardDescription>Choose the seating arrangement for your committees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.keys(LAYOUT_CONFIG) as LayoutType[]).map((lt) => (
                    <LayoutVisual
                      key={lt}
                      layout={lt}
                      selected={layout === lt}
                      onClick={() => setLayout(lt)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Committee Configuration */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Committees</CardTitle>
                    <CardDescription>Configure committees for this conference</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-[#0D7377]/30 text-[#0D7377] hover:bg-[#0D7377]/5"
                    onClick={addCommittee}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Committee
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {committees.map((cm, idx) => (
                  <motion.div
                    key={cm.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="p-4 rounded-xl border border-[#E8DED0] bg-[#FFF8F0]/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CommitteeTypeIcon type={cm.type} />
                        <span className="text-sm font-semibold text-[#1B3A4B]">Committee {idx + 1}</span>
                      </div>
                      {committees.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeCommittee(cm.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Committee Name</Label>
                        <Input
                          placeholder="e.g., Security Council"
                          value={cm.name}
                          onChange={(e) => updateCommittee(cm.id, 'name', e.target.value)}
                          className="text-sm border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={cm.type}
                          onValueChange={(val) => updateCommittee(cm.id, 'type', val)}
                        >
                          <SelectTrigger className="text-sm border-[#E8DED0]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(COMMITTEE_TYPE_CONFIG) as CommitteeType[]).map((ct) => (
                              <SelectItem key={ct} value={ct}>
                                {COMMITTEE_TYPE_CONFIG[ct].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Topic</Label>
                        <Input
                          placeholder="e.g., Nuclear Non-Proliferation"
                          value={cm.topic}
                          onChange={(e) => updateCommittee(cm.id, 'topic', e.target.value)}
                          className="text-sm border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Country Limit</Label>
                        <Input
                          type="number"
                          min={1}
                          value={cm.countryLimit}
                          onChange={(e) => updateCommittee(cm.id, 'countryLimit', parseInt(e.target.value) || 10)}
                          className="text-sm border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right - Preview & Actions */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#0D7377]" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-bold text-[#1B3A4B]">{name || 'Conference Name'}</h3>
                {theme && (
                  <p className="text-sm italic text-[#0D7377]">&ldquo;{theme}&rdquo;</p>
                )}
                {location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {location}
                  </div>
                )}
                {startDate && endDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
                <Separator className="bg-[#E8DED0]" />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#0D7377]" />
                    {committees.length} Committee{committees.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {committees.map((cm, i) => (
                    <div key={cm.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CommitteeTypeIcon type={cm.type} size={12} />
                      <span>{cm.name || `Committee ${i + 1}`}</span>
                      <span className="text-muted-foreground/50">({cm.countryLimit} seats)</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#D4A843]" />
                  {LAYOUT_CONFIG[layout].label} Layout
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button
                  className="w-full bg-[#0D7377] hover:bg-[#0A5C5F] text-white gap-2"
                  disabled={!isValid}
                  onClick={() => handleSave('REGISTRATION_OPEN')}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Publish Conference
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-[#E8DED0]"
                  disabled={!name.trim()}
                  onClick={() => handleSave('DRAFT')}
                >
                  <Clock className="w-4 h-4" />
                  Save as Draft
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={onCancel}>
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// CONFERENCE DETAIL VIEW
// ============================================================

function ConferenceDetailView({
  conference,
  onBack,
}: {
  conference: Conference
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'committees' | 'delegates'>('overview')

  const totalCountrySeats = conference.committees.reduce((acc, cm) => acc + cm.countryLimit, 0)

  return (
    <div className="space-y-6">
      {/* Back button + Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-[#1B3A4B] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Conferences
        </Button>

        <Card className="overflow-hidden">
          <div className="h-2" style={{ background: STATUS_CONFIG[conference.status].dotColor }} />
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#1B3A4B]">{conference.name}</h1>
                  <StatusBadge status={conference.status} />
                </div>
                {conference.theme && (
                  <p className="text-[#0D7377] font-medium italic mt-2">&ldquo;{conference.theme}&rdquo;</p>
                )}
                {conference.description && (
                  <p className="text-muted-foreground text-sm mt-2 max-w-2xl">{conference.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-[#0D7377]" />
                    {new Date(conference.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — {new Date(conference.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#D4A843]" />
                    {conference.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#0D7377]" />
                    {conference.committees.length} Committees
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#D4A843]" />
                    {conference.delegates.length} / {totalCountrySeats} Delegates
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 border-[#0D7377]/30 text-[#0D7377] hover:bg-[#0D7377]/5">
                  <UserPlus className="w-3.5 h-3.5" /> Open Registration
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/5">
                  <UserCheck className="w-3.5 h-3.5" /> Assign Chairs
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 border-[#059669]/30 text-[#059669] hover:bg-[#059669]/5">
                  <LayoutGrid className="w-3.5 h-3.5" /> Generate Layout
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 border-red-300 text-red-500 hover:bg-red-50">
                  <X className="w-3.5 h-3.5" /> Close Conference
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="bg-[#F5F0EB]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="committees">Committees</TabsTrigger>
          <TabsTrigger value="delegates">Delegates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#0D7377]/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#0D7377]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1B3A4B]">{conference.committees.length}</div>
                      <div className="text-xs text-muted-foreground">Committees</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#D4A843]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1B3A4B]">{conference.delegates.length}</div>
                      <div className="text-xs text-muted-foreground">Registered Delegates</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#059669]/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[#059669]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1B3A4B]">{totalCountrySeats}</div>
                      <div className="text-xs text-muted-foreground">Total Seats</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="committees" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conference.committees.map((cm, i) => {
              const typeConfig = COMMITTEE_TYPE_CONFIG[cm.type]
              const delegatesInCm = conference.delegates.filter((d) => d.committeeId === cm.id)
              return (
                <motion.div key={cm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${typeConfig.color}15` }}>
                          <CommitteeTypeIcon type={cm.type} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#1B3A4B]">{cm.name}</h4>
                          <Badge variant="secondary" className="text-[10px] mt-1">{typeConfig.label}</Badge>
                          <p className="text-sm text-muted-foreground mt-2">{cm.topic}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {delegatesInCm.length} / {cm.countryLimit} delegates
                            </span>
                            {cm.chair && (
                              <span className="flex items-center gap-1">
                                <Gavel className="w-3 h-3" />
                                {cm.chair}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="delegates" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {conference.delegates.length > 0 ? (
                <div className="divide-y divide-[#E8DED0]">
                  {conference.delegates.map((d, i) => {
                    const cm = conference.committees.find((c) => c.id === d.committeeId)
                    return (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i }}
                        className="flex items-center gap-3 p-4 hover:bg-[#F5F0EB]/50 transition-colors"
                      >
                        <Avatar className="w-9 h-9 border border-[#E8DED0]">
                          <AvatarFallback className="bg-[#0D7377]/10 text-[#0D7377] text-xs font-semibold">
                            {d.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#1B3A4B]">{d.name}</div>
                          <div className="text-xs text-muted-foreground">{d.school}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-[#0D7377]/20 text-[#0D7377]">
                          {d.country}
                        </Badge>
                        {cm && (
                          <Badge variant="secondary" className="text-[10px]">
                            {cm.name}
                          </Badge>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-[#1B3A4B]">No delegates registered yet</h3>
                  <p className="text-xs text-muted-foreground mt-1">Open registration to start receiving delegates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================
// PARTICIPATION CALCULATOR
// ============================================================

function ParticipationCalculator() {
  const [population, setPopulation] = useState(500)
  const [experience, setExperience] = useState<ExperienceLevel>('INTERMEDIATE')

  const multiplierMap: Record<ExperienceLevel, number> = {
    BEGINNER: 1.0,
    INTERMEDIATE: 1.5,
    ADVANCED: 2.0,
  }

  const recommendedTeamSize = Math.max(3, Math.round(Math.sqrt(population) * multiplierMap[experience]))

  const committeeDist = useMemo(() => {
    const dist: { type: CommitteeType; count: number; delegates: number }[] = []
    let remaining = recommendedTeamSize

    // Large GA gets the most
    const gaCount = Math.max(1, Math.floor(remaining * 0.4))
    dist.push({ type: 'GENERAL_ASSEMBLY', count: gaCount, delegates: Math.min(gaCount * 3, remaining) })
    remaining -= dist[0].delegates

    // SC gets dedicated delegates
    const scCount = Math.max(1, Math.floor(remaining * 0.25))
    dist.push({ type: 'SECURITY_COUNCIL', count: 1, delegates: Math.min(scCount, remaining) })
    remaining -= dist[1].delegates

    // ECOSOC
    if (remaining > 0) {
      const ecoCount = Math.max(1, Math.floor(remaining * 0.4))
      dist.push({ type: 'ECOSOC', count: 1, delegates: Math.min(ecoCount, remaining) })
      remaining -= dist[2].delegates
    }

    // Crisis if enough delegates
    if (remaining > 0) {
      dist.push({ type: 'CRISIS_COMMITTEE', count: 1, delegates: remaining })
    }

    return dist
  }, [recommendedTeamSize])

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#D4A843]" />
            Participation Calculator
          </CardTitle>
          <CardDescription>Estimate the ideal team size for your school</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>School Population</Label>
            <Input
              type="number"
              min={50}
              max={10000}
              value={population}
              onChange={(e) => setPopulation(parseInt(e.target.value) || 100)}
              className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
            />
          </div>
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ExperienceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setExperience(lvl)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    experience === lvl
                      ? 'border-[#0D7377] bg-[#0D7377]/5 text-[#0D7377]'
                      : 'border-[#E8DED0] bg-white text-muted-foreground hover:border-[#0D7377]/30'
                  }`}
                >
                  {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <Separator className="bg-[#E8DED0]" />
          <div className="text-center py-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recommended Team Size</div>
            <div className="text-4xl font-bold text-[#0D7377]">{recommendedTeamSize}</div>
            <div className="text-xs text-muted-foreground mt-1">delegates for {population} students ({experience.toLowerCase()} level)</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-[#1B3A4B]">Suggested Distribution</div>
            {committeeDist.map((d) => {
              const config = COMMITTEE_TYPE_CONFIG[d.type]
              return (
                <div key={d.type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CommitteeTypeIcon type={d.type} size={14} />
                    <span className="text-muted-foreground">{config.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{d.delegates} delegate{d.delegates !== 1 ? 's' : ''}</Badge>
                </div>
              )
            })}
          </div>
          <div className="bg-[#0D7377]/5 rounded-lg p-3 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#0D7377] shrink-0 mt-0.5" />
            <p className="text-xs text-[#0D7377]">
              Formula: sqrt({population}) &times; {multiplierMap[experience]} ({experience.toLowerCase()} multiplier) = {Math.sqrt(population).toFixed(1)} &times; {multiplierMap[experience]} &asymp; <strong>{recommendedTeamSize}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ConferenceManager() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'detail' | 'create' | 'edit'>('list')
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const res = await fetch('/api/conferences')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setConferences(data)
          } else if (data.conferences && Array.isArray(data.conferences)) {
            setConferences(data.conferences)
          } else if (data.data && Array.isArray(data.data)) {
            setConferences(data.data)
          }
        }
      } catch {
        // API not available, show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchConferences()
  }, [])

  const handleSelect = (conf: Conference) => {
    setSelectedConference(conf)
    setView('detail')
  }

  const handleCreateNew = () => {
    setSelectedConference(null)
    setView('create')
  }

  const handleSave = (conference: Conference) => {
    if (selectedConference) {
      setConferences(conferences.map((c) => (c.id === conference.id ? conference : c)))
    } else {
      setConferences([conference, ...conferences])
    }
    setSelectedConference(null)
    setView('list')
  }

  const handleBack = () => {
    setSelectedConference(null)
    setView('list')
  }

  return (
    <div className="space-y-0">
      {/* Calculator Toggle */}
      {view === 'list' && (
        <div className="flex justify-end mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/5"
                  onClick={() => setShowCalculator(!showCalculator)}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  {showCalculator ? 'Hide Calculator' : 'Team Calculator'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Estimate your ideal delegation size</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#0D7377] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading conferences...</p>
        </div>
      ) : (
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <ConferenceListView
                  conferences={conferences}
                  onSelect={handleSelect}
                  onCreateNew={handleCreateNew}
                />
              </div>
              {showCalculator && (
                <motion.div
                  className="xl:w-80 shrink-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ParticipationCalculator />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'detail' && selectedConference && (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ConferenceDetailView conference={selectedConference} onBack={handleBack} />
          </motion.div>
        )}

        {(view === 'create' || view === 'edit') && (
          <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ConferenceForm
              onSave={handleSave}
              onCancel={handleBack}
              initialData={view === 'edit' ? selectedConference : null}
            />
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </div>
  )
}
