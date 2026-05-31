'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Filter, Calendar, Clock, User, FileText,
  CheckCircle2, Circle, AlertCircle, Trash2, Edit3, X,
  ChevronDown, MoreHorizontal, ArrowUpRight, Flag, Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/lib/store'

// ============================================================
// TYPES
// ============================================================

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

interface ResearchTask {
  id: string
  title: string
  description: string
  assignee: string
  assigneeAvatar?: string
  dueDate: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
}

// ============================================================
// MOCK DATA
// ============================================================

const INITIAL_TASKS: ResearchTask[] = [
  { id: 't1', title: 'Research Nuclear Non-Proliferation Treaty', description: 'Compile a comprehensive brief on the NPT, its history, key provisions, and current challenges. Focus on recent developments in nuclear disarmament.', assignee: 'Elena Vasquez', dueDate: '2026-03-15', status: 'IN_PROGRESS', priority: 'HIGH', createdAt: '2026-02-20' },
  { id: 't2', title: 'Country Profile: Federal Republic of Nigeria', description: 'Create a detailed country profile covering Nigeria\'s foreign policy, UN voting record, key alliances, and stance on Security Council reform.', assignee: 'Amara Okafor', dueDate: '2026-03-10', status: 'IN_PROGRESS', priority: 'MEDIUM', createdAt: '2026-02-18' },
  { id: 't3', title: 'Climate Action Resolution Draft', description: 'Draft a model resolution on climate action for the General Assembly session, referencing the Paris Agreement and recent COP outcomes.', assignee: 'Lucas Schmidt', dueDate: '2026-03-20', status: 'PENDING', priority: 'HIGH', createdAt: '2026-02-22' },
  { id: 't4', title: 'Security Council Reform Analysis', description: 'Analyze proposals for Security Council reform, including expansion of permanent and non-permanent membership, and veto power modifications.', assignee: 'Kai Nakamura', dueDate: '2026-03-25', status: 'PENDING', priority: 'MEDIUM', createdAt: '2026-02-25' },
  { id: 't5', title: 'Position Paper: Global Trade Equity', description: 'Write a position paper on global trade equity for ECOSOC discussions, focusing on developing nations\' perspectives.', assignee: 'Priya Sharma', dueDate: '2026-03-05', status: 'COMPLETED', priority: 'MEDIUM', createdAt: '2026-02-10' },
  { id: 't6', title: 'Map UN Sustainable Development Goals Progress', description: 'Create a visual map tracking SDG progress across regions with key statistics and case studies.', assignee: 'Fatima Al-Rashid', dueDate: '2026-03-12', status: 'IN_PROGRESS', priority: 'LOW', createdAt: '2026-02-15' },
  { id: 't7', title: 'Historical Crisis Committee Brief', description: 'Prepare background guides for the historical crisis committee simulation on the Suez Crisis of 1956.', assignee: 'Oliver Brooks', dueDate: '2026-04-01', status: 'PENDING', priority: 'HIGH', createdAt: '2026-02-28' },
  { id: 't8', title: 'Delegate Preparation Guide - Rules of Procedure', description: 'Update the delegate preparation guide with the latest Robert\'s Rules of Order modifications used in MUN sessions.', assignee: 'Sofia Costa', dueDate: '2026-03-08', status: 'COMPLETED', priority: 'LOW', createdAt: '2026-02-05' },
  { id: 't9', title: 'Research Humanitarian Intervention Framework', description: 'Compile research on R2P (Responsibility to Protect) doctrine and its application in recent humanitarian crises.', assignee: 'Chen Wei', dueDate: '2026-03-18', status: 'PENDING', priority: 'MEDIUM', createdAt: '2026-02-26' },
]

const STUDENTS = [
  'Elena Vasquez', 'Amara Okafor', 'Kai Nakamura', 'Fatima Al-Rashid',
  'Lucas Schmidt', 'Priya Sharma', 'Oliver Brooks', 'Sofia Costa', 'Chen Wei',
]

// ============================================================
// STATUS & PRIORITY CONFIG
// ============================================================

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  COMPLETED: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  LOW: { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50', icon: Flag },
  MEDIUM: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', icon: Flag },
  HIGH: { label: 'High', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
}

// ============================================================
// TASK CARD
// ============================================================

function TaskCard({ task, onStatusChange, onDelete }: {
  task: ResearchTask
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}) {
  const statusConfig = STATUS_CONFIG[task.status]
  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const StatusIcon = statusConfig.icon
  const PriorityIcon = priorityConfig.icon
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <Card className={`border-[#E8DED0]/60 hover:shadow-md transition-all ${task.status === 'COMPLETED' ? 'opacity-70' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className={`text-sm font-semibold ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : 'text-[#1B3A4B]'}`}>
                  {task.title}
                </h4>
                <Badge className={`${priorityConfig.bg} ${priorityConfig.color} border-0 text-[10px]`}>
                  <PriorityIcon className="w-3 h-3 mr-0.5" />
                  {priorityConfig.label}
                </Badge>
                <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0 text-[10px]`}>
                  <StatusIcon className="w-3 h-3 mr-0.5" />
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="bg-[#0D7377]/10 text-[#0D7377] text-[8px]">
                      {task.assignee.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {task.assignee}
                </div>
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                  <Calendar className="w-3 h-3" />
                  {task.dueDate}
                  {isOverdue && <span className="text-[10px]">(Overdue)</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {task.status === 'PENDING' && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onStatusChange(task.id, 'IN_PROGRESS')} title="Start task">
                  <ArrowUpRight className="w-4 h-4 text-amber-600" />
                </Button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onStatusChange(task.id, 'COMPLETED')} title="Complete task">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </Button>
              )}
              {task.status === 'COMPLETED' && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onStatusChange(task.id, 'PENDING')} title="Reopen task">
                  <Circle className="w-4 h-4 text-gray-400" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500" onClick={() => onDelete(task.id)} title="Delete task">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// CREATE TASK FORM
// ============================================================

function CreateTaskForm({ onCreate, open, onOpenChange }: {
  onCreate: (task: ResearchTask) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')

  const handleSubmit = () => {
    if (!title.trim() || !assignee || !dueDate) return
    const newTask: ResearchTask = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      assignee,
      dueDate,
      status: 'PENDING',
      priority,
      createdAt: new Date().toISOString().split('T')[0],
    }
    onCreate(newTask)
    setTitle('')
    setDescription('')
    setAssignee('')
    setDueDate('')
    setPriority('MEDIUM')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#1B3A4B]">Create Research Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title *</Label>
            <Input id="task-title" placeholder="Enter task title" value={title} onChange={(e) => setTitle(e.target.value)} className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" placeholder="Describe the research task..." value={description} onChange={(e) => setDescription(e.target.value)} className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20 min-h-[80px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assign To *</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="border-[#E8DED0]">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENTS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Due Date *</Label>
              <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger className="border-[#E8DED0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">
                  <span className="flex items-center gap-2"><Flag className="w-3 h-3 text-blue-500" /> Low</span>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <span className="flex items-center gap-2"><Flag className="w-3 h-3 text-amber-500" /> Medium</span>
                </SelectItem>
                <SelectItem value="HIGH">
                  <span className="flex items-center gap-2"><AlertCircle className="w-3 h-3 text-red-500" /> High</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-[#E8DED0]">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!title.trim() || !assignee || !dueDate} className="bg-[#0D7377] hover:bg-[#0A5C5F] text-white">
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// MAIN RESEARCH TASKS VIEW
// ============================================================

export default function ResearchTasks() {
  const { user } = useAuthStore()
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN' || user?.role === 'SCHOOL_ADMIN'

  const [tasks, setTasks] = useState<ResearchTask[]>(INITIAL_TASKS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter
      return matchesSearch && matchesStatus && matchesAssignee
    })
  }, [tasks, searchQuery, statusFilter, assigneeFilter])

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleCreate = (task: ResearchTask) => {
    setTasks(prev => [task, ...prev])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A4B]">Research Tasks</h2>
          <p className="text-muted-foreground mt-1">Manage and track research assignments</p>
        </div>
        {isTeacher && (
          <Button className="bg-[#0D7377] hover:bg-[#0A5C5F] text-white" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Task
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pendingCount, color: 'text-gray-600', bg: 'bg-gray-50', icon: Circle },
          { label: 'In Progress', count: inProgressCount, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
          { label: 'Completed', count: completedCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`border-[#E8DED0]/60 ${stat.bg}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-[#E8DED0]/60">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#F5F0EB] border-0 focus-visible:ring-[#0D7377]/20"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px] border-[#E8DED0]">
                  <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-[#E8DED0]">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {STUDENTS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-[#E8DED0]/60">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg text-[#1B3A4B] mb-1">No tasks found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskForm onCreate={handleCreate} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
