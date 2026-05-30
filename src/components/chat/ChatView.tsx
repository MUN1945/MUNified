'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash, Bell, BellOff, Users, Plus, Search, Menu, X, Send,
  Paperclip, Bold, Italic, ChevronDown, ChevronRight,
  Shield, Globe, BookOpen, Megaphone,
  AtSign, Settings, Volume2, Pin,
  MoreHorizontal, Mic
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'

// ============================================================
// TYPES
// ============================================================

type ChannelType = 'text' | 'announcement' | 'voice' | 'study'
type UserRole = 'TEACHER' | 'STUDENT' | 'ADMIN'
type UserStatus = 'online' | 'away' | 'offline'

interface ChatChannel {
  id: string
  name: string
  type: ChannelType
  category: string
  description: string
  unread: number
  isMuted: boolean
}

interface ChatUser {
  id: string
  name: string
  role: UserRole
  status: UserStatus
  avatar?: string
}

interface ChatMessage {
  id: string
  channelId: string
  userId: string
  userName: string
  userRole: UserRole
  content: string
  timestamp: string
  isSystem?: boolean
  isEdited?: boolean
}

// ============================================================
// MOCK DATA
// ============================================================

const MOCK_CHANNELS: ChatChannel[] = [
  { id: 'ch-general', name: 'general', type: 'text', category: 'General', description: 'General discussion for all delegates', unread: 5, isMuted: false },
  { id: 'ch-announcements', name: 'announcements', type: 'announcement', category: 'General', description: 'Important updates and announcements', unread: 2, isMuted: false },
  { id: 'ch-casual', name: 'casual', type: 'text', category: 'General', description: 'Off-topic conversations and socializing', unread: 0, isMuted: false },
  { id: 'ch-security-council', name: 'security-council', type: 'text', category: 'Committee Rooms', description: 'Security Council delegates discussion', unread: 3, isMuted: false },
  { id: 'ch-ecosoc', name: 'ecosoc', type: 'text', category: 'Committee Rooms', description: 'ECOSOC delegates discussion', unread: 1, isMuted: false },
  { id: 'ch-crisis-committee', name: 'crisis-committee', type: 'text', category: 'Committee Rooms', description: 'Crisis Committee delegates only', unread: 0, isMuted: true },
  { id: 'ch-ga-disarmament', name: 'ga-disarmament', type: 'text', category: 'Committee Rooms', description: 'GA First Committee — Disarmament', unread: 4, isMuted: false },
  { id: 'ch-study-group', name: 'study-group', type: 'study', category: 'Study Groups', description: 'Collaborative research and preparation', unread: 0, isMuted: false },
]

const MOCK_USERS: ChatUser[] = [
  { id: 'u-sarah', name: 'Dr. Sarah Chen', role: 'TEACHER', status: 'online' },
  { id: 'u-james', name: 'Prof. James Wright', role: 'TEACHER', status: 'online' },
  { id: 'u-maria', name: 'Dr. Maria Santos', role: 'TEACHER', status: 'away' },
  { id: 'u-amara', name: 'Amara Okafor', role: 'STUDENT', status: 'online' },
  { id: 'u-elena', name: 'Elena Vasquez', role: 'STUDENT', status: 'online' },
  { id: 'u-kai', name: 'Kai Nakamura', role: 'STUDENT', status: 'online' },
  { id: 'u-fatima', name: 'Fatima Al-Rashid', role: 'STUDENT', status: 'away' },
  { id: 'u-lucas', name: 'Lucas Schmidt', role: 'STUDENT', status: 'online' },
  { id: 'u-priya', name: 'Priya Sharma', role: 'STUDENT', status: 'offline' },
  { id: 'u-oliver', name: 'Oliver Brooks', role: 'STUDENT', status: 'online' },
  { id: 'u-sofia', name: 'Sofia Costa', role: 'STUDENT', status: 'away' },
  { id: 'u-chen', name: 'Chen Wei', role: 'STUDENT', status: 'offline' },
  { id: 'u-aisha', name: 'Aisha Mohammed', role: 'STUDENT', status: 'online' },
]

const MOCK_MESSAGES: ChatMessage[] = [
  // General channel
  { id: 'm1', channelId: 'ch-general', userId: 'system', userName: 'System', userRole: 'STUDENT', content: 'Amara Okafor has joined the server', timestamp: '2026-03-01T09:00:00Z', isSystem: true },
  { id: 'm2', channelId: 'ch-general', userId: 'u-sarah', userName: 'Dr. Sarah Chen', userRole: 'TEACHER', content: 'Good morning everyone! 🌍 Registration for Harvard WorldMUN closes this Friday. Make sure you\'ve submitted your country preferences.', timestamp: '2026-03-01T09:05:00Z' },
  { id: 'm3', channelId: 'ch-general', userId: 'u-elena', userName: 'Elena Vasquez', userRole: 'STUDENT', content: 'Thank you Dr. Chen! I\'ve already submitted mine — really hoping for Spain on the Security Council.', timestamp: '2026-03-01T09:12:00Z' },
  { id: 'm4', channelId: 'ch-general', userId: 'u-kai', userName: 'Kai Nakamura', userRole: 'STUDENT', content: 'Has anyone started researching the nuclear non-proliferation topic? I found some great UNODA resources.', timestamp: '2026-03-01T09:18:00Z' },
  { id: 'm5', channelId: 'ch-general', userId: 'u-amara', userName: 'Amara Okafor', userRole: 'STUDENT', content: 'Yes! The NPT review conference documents from 2023 are super helpful. Also check out the IAEA safeguards reports.', timestamp: '2026-03-01T09:25:00Z' },
  { id: 'm6', channelId: 'ch-general', userId: 'u-fatima', userName: 'Fatima Al-Rashid', userRole: 'STUDENT', content: 'Can someone explain the difference between a working paper and a draft resolution? I keep getting confused.', timestamp: '2026-03-01T09:30:00Z' },
  { id: 'm7', channelId: 'ch-general', userId: 'u-james', userName: 'Prof. James Wright', userRole: 'TEACHER', content: 'Great question Fatima! A working paper is informal — it\'s your initial ideas. A draft resolution follows specific UN format with pre-ambulatory and operative clauses. Check the Academy module on Resolution Writing for detailed guidance.', timestamp: '2026-03-01T09:35:00Z' },
  { id: 'm8', channelId: 'ch-general', userId: 'u-lucas', userName: 'Lucas Schmidt', userRole: 'STUDENT', content: 'The Resolution Writing course is excellent — went from zero to drafting a full resolution in one afternoon.', timestamp: '2026-03-01T09:40:00Z' },
  { id: 'm9', channelId: 'ch-general', userId: 'u-oliver', userName: 'Oliver Brooks', userRole: 'STUDENT', content: 'Anyone else representing UK? Would love to coordinate our positions before the conference.', timestamp: '2026-03-01T09:50:00Z' },
  { id: 'm10', channelId: 'ch-general', userId: 'u-sofia', userName: 'Sofia Costa', userRole: 'STUDENT', content: 'Is the crisis committee doing a historical or futuristic scenario this year?', timestamp: '2026-03-01T10:00:00Z' },
  { id: 'm11', channelId: 'ch-general', userId: 'u-sarah', userName: 'Dr. Sarah Chen', userRole: 'TEACHER', content: 'It\'s a futuristic scenario this year — cybersecurity threats to critical infrastructure. Very timely topic!', timestamp: '2026-03-01T10:05:00Z' },
  { id: 'm12', channelId: 'ch-general', userId: 'u-aisha', userName: 'Aisha Mohammed', userRole: 'STUDENT', content: 'That sounds amazing. Does anyone have resources on cyber warfare treaties? The Tallinn Manual is a start but I need more.', timestamp: '2026-03-01T10:12:00Z' },

  // Security Council channel
  { id: 'm13', channelId: 'ch-security-council', userId: 'system', userName: 'System', userRole: 'STUDENT', content: 'This channel is for Security Council delegates only', timestamp: '2026-03-01T08:00:00Z', isSystem: true },
  { id: 'm14', channelId: 'ch-security-council', userId: 'u-elena', userName: 'Elena Vasquez', userRole: 'STUDENT', content: 'SC delegates — let\'s discuss our approach to the Korean Peninsula denuclearization topic. Should we push for a new resolution or amend existing ones?', timestamp: '2026-03-01T10:30:00Z' },
  { id: 'm15', channelId: 'ch-security-council', userId: 'u-kai', userName: 'Kai Nakamura', userRole: 'STUDENT', content: 'I think building on Resolution 1718 makes more sense than starting from scratch. The framework is there, we just need stronger enforcement mechanisms.', timestamp: '2026-03-01T10:35:00Z' },
  { id: 'm16', channelId: 'ch-security-council', userId: 'u-amara', userName: 'Amara Okafor', userRole: 'STUDENT', content: 'Agreed. Nigeria\'s position would favor diplomatic engagement alongside enforcement. The Six-Party Talks framework deserves another look.', timestamp: '2026-03-01T10:42:00Z' },
  { id: 'm17', channelId: 'ch-security-council', userId: 'u-james', userName: 'Prof. James Wright', userRole: 'TEACHER', content: 'Excellent analysis team! Remember that SC resolutions need 9 affirmative votes and no veto from the P5. Consider your alliances carefully.', timestamp: '2026-03-01T10:48:00Z' },

  // ECOSOC channel
  { id: 'm18', channelId: 'ch-ecosoc', userId: 'u-fatima', userName: 'Fatima Al-Rashid', userRole: 'STUDENT', content: 'For the Global Trade Equity topic, I found the WTO\'s latest report on developing nations\' market access barriers very insightful.', timestamp: '2026-03-01T11:00:00Z' },
  { id: 'm19', channelId: 'ch-ecosoc', userId: 'u-lucas', userName: 'Lucas Schmidt', userRole: 'STUDENT', content: 'Germany\'s perspective is interesting — we\'re pro-free trade but also want fair competition. How do we balance that with developing nations\' needs?', timestamp: '2026-03-01T11:08:00Z' },
  { id: 'm20', channelId: 'ch-ecosoc', userId: 'u-maria', userName: 'Dr. Maria Santos', userRole: 'TEACHER', content: 'Consider looking into the concept of "policy space" for developing countries. UNCTAD has excellent resources on this. Also, think about how digital trade is reshaping the global economy.', timestamp: '2026-03-01T11:15:00Z' },

  // GA Disarmament
  { id: 'm21', channelId: 'ch-ga-disarmament', userId: 'u-oliver', userName: 'Oliver Brooks', userRole: 'STUDENT', content: 'Quick reminder: our working paper on autonomous weapons systems is due Thursday. Can we meet tonight to finalize the operative clauses?', timestamp: '2026-03-01T14:00:00Z' },
  { id: 'm22', channelId: 'ch-ga-disarmament', userId: 'u-aisha', userName: 'Aisha Mohammed', userRole: 'STUDENT', content: 'I\'ll be there! I\'ve drafted clauses 4-7 on verification mechanisms. We should also address the humanitarian impact angle.', timestamp: '2026-03-01T14:10:00Z' },
  { id: 'm23', channelId: 'ch-ga-disarmament', userId: 'u-sofia', userName: 'Sofia Costa', userRole: 'STUDENT', content: 'Brazil supports a complete ban on lethal autonomous weapons. We should align with the Campaign to Stop Killer Robots\' framework.', timestamp: '2026-03-01T14:18:00Z' },

  // Announcements
  { id: 'm24', channelId: 'ch-announcements', userId: 'u-sarah', userName: 'Dr. Sarah Chen', userRole: 'TEACHER', content: '📋 **IMPORTANT**: Conference registration deadline extended to Sunday, March 9th. All country preferences and committee selections must be submitted by 11:59 PM UTC.', timestamp: '2026-03-01T08:00:00Z' },
  { id: 'm25', channelId: 'ch-announcements', userId: 'u-james', userName: 'Prof. James Wright', userRole: 'TEACHER', content: '🎓 New Academy module available: "Advanced Crisis Management" — essential preparation for crisis committee delegates. 2 hours, worth 150 XP.', timestamp: '2026-03-01T12:00:00Z' },
  { id: 'm26', channelId: 'ch-announcements', userId: 'u-maria', userName: 'Dr. Maria Santos', userRole: 'TEACHER', content: '🏆 Congratulations to Elena Vasquez and Kai Nakamura for earning the "Diplomat" badge! Your dedication to research is exemplary.', timestamp: '2026-03-01T16:00:00Z' },

  // Study Group
  { id: 'm27', channelId: 'ch-study-group', userId: 'u-priya', userName: 'Priya Sharma', userRole: 'STUDENT', content: 'Starting a study session on parliamentary procedure at 7 PM tonight. We\'ll practice making motions, points of order, and voting procedures. All welcome!', timestamp: '2026-03-01T15:00:00Z' },
  { id: 'm28', channelId: 'ch-study-group', userId: 'u-chen', userName: 'Chen Wei', userRole: 'STUDENT', content: 'I\'ll join! Also, has anyone created flashcards for the UN Charter articles? Would be super helpful for quick reference during debate.', timestamp: '2026-03-01T15:15:00Z' },
]

// ============================================================
// ROLE COLORS
// ============================================================

const ROLE_COLORS: Record<UserRole, string> = {
  TEACHER: '#D4A843',
  STUDENT: '#0D7377',
  ADMIN: '#DC2626',
}

const STATUS_COLORS: Record<UserStatus, string> = {
  online: '#059669',
  away: '#F59E0B',
  offline: '#94A3B8',
}

// ============================================================
// CHANNEL TYPE ICON
// ============================================================

function ChannelIcon({ type, className = '' }: { type: ChannelType; className?: string }) {
  switch (type) {
    case 'announcement':
      return <Megaphone className={`w-4 h-4 ${className}`} />
    case 'voice':
      return <Volume2 className={`w-4 h-4 ${className}`} />
    case 'study':
      return <BookOpen className={`w-4 h-4 ${className}`} />
    default:
      return <Hash className={`w-4 h-4 ${className}`} />
  }
}

// ============================================================
// DATE FORMATTING
// ============================================================

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDateSeparator(timestamp: string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function shouldShowDateSeparator(messages: ChatMessage[], index: number): boolean {
  if (index === 0) return true
  const current = new Date(messages[index].timestamp).toDateString()
  const previous = new Date(messages[index - 1].timestamp).toDateString()
  return current !== previous
}

// ============================================================
// CHANNEL SIDEBAR
// ============================================================

function ChannelSidebar({
  channels,
  activeChannel,
  onSelectChannel,
  isTeacher,
}: {
  channels: ChatChannel[]
  activeChannel: string
  onSelectChannel: (id: string) => void
  isTeacher: boolean
}) {
  const categories = useMemo(() => {
    const cats: string[] = []
    channels.forEach((ch) => {
      if (!cats.includes(ch.category)) cats.push(ch.category)
    })
    return cats
  }, [channels])

  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set())

  const toggleCat = (cat: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const totalUnread = channels.reduce((acc, ch) => acc + ch.unread, 0)

  return (
    <div className="flex flex-col h-full bg-[#1B3A4B]">
      {/* Server Header */}
      <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#D4A843] flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#1B3A4B]" />
          </div>
          <span className="font-bold text-white text-sm">DiplomatiQ</span>
        </div>
        <div className="flex items-center gap-1">
          {totalUnread > 0 && (
            <Badge className="bg-red-500 text-white text-[10px] h-5 min-w-[20px] flex items-center justify-center px-1.5 border-0">
              {totalUnread}
            </Badge>
          )}
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-3 space-y-4">
          {categories.map((cat) => {
            const catChannels = channels.filter((ch) => ch.category === cat)
            const isCollapsed = collapsedCats.has(cat)
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCat(cat)}
                  className="flex items-center gap-1 px-1 mb-1 w-full text-left group"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-white/50" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-white/50" />
                  )}
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 group-hover:text-white/60">
                    {cat}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {catChannels.map((channel) => {
                      const isActive = activeChannel === channel.id
                      return (
                        <TooltipProvider key={channel.id} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => onSelectChannel(channel.id)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all group ${
                                  isActive
                                    ? 'bg-[#0D7377]/30 text-white'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                                }`}
                              >
                                <ChannelIcon
                                  type={channel.type}
                                  className={isActive ? 'text-[#0D7377]' : 'text-white/30 group-hover:text-white/50'}
                                />
                                <span className="flex-1 text-left truncate text-[13px]">
                                  {channel.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  {channel.isMuted && (
                                    <BellOff className="w-3 h-3 text-white/20" />
                                  )}
                                  {channel.unread > 0 && !isActive && (
                                    <span className="min-w-[18px] h-[18px] rounded-full bg-[#0D7377] text-white text-[10px] font-bold flex items-center justify-center px-1">
                                      {channel.unread}
                                    </span>
                                  )}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-[#264B5E] text-white border-white/10 max-w-[200px]">
                              <div className="font-medium text-xs">#{channel.name}</div>
                              <div className="text-[10px] text-white/50 mt-0.5">{channel.description}</div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Create Channel (teachers only) */}
      {isTeacher && (
        <div className="px-3 py-2 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-white/40 hover:text-white/70 hover:bg-white/[0.06] gap-2 justify-start text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Channel
          </Button>
        </div>
      )}

      {/* User area */}
      <div className="px-3 py-2.5 border-t border-white/10 flex items-center gap-2">
        <div className="relative">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-[#0D7377]/30 text-[#0D7377] text-xs font-semibold">
              AO
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1B3A4B] bg-[#059669]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white truncate">Amara Okafor</div>
          <div className="text-[10px] text-white/40">Delegate · Online</div>
        </div>
        <div className="flex items-center gap-1">
          <button className="text-white/30 hover:text-white/60 p-1"><Mic className="w-3.5 h-3.5" /></button>
          <button className="text-white/30 hover:text-white/60 p-1"><Settings className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MESSAGE BUBBLE
// ============================================================

function MessageBubble({ message, showHeader }: { message: ChatMessage; showHeader: boolean }) {
  const roleColor = ROLE_COLORS[message.userRole]
  const isTeacher = message.userRole === 'TEACHER'

  if (message.isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center py-2"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#F5F0EB] px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D7377]" />
          {message.content}
        </div>
      </motion.div>
    )
  }

  const initials = message.userName.split(' ').map((n) => n[0]).join('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-start gap-3 px-4 py-1 hover:bg-[#F5F0EB]/50 transition-colors ${showHeader ? 'mt-3' : ''}`}
    >
      {showHeader ? (
        <Avatar className="w-9 h-9 mt-0.5 shrink-0">
          <AvatarFallback
            className="text-xs font-semibold border"
            style={{
              backgroundColor: `${roleColor}15`,
              color: roleColor,
              borderColor: `${roleColor}30`,
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-9 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-semibold text-sm" style={{ color: roleColor }}>
              {message.userName}
            </span>
            {isTeacher && (
              <Badge className="text-[9px] h-4 px-1.5 border-0" style={{ backgroundColor: `${roleColor}20`, color: roleColor }}>
                {message.userRole === 'TEACHER' ? 'Teacher' : 'Admin'}
              </Badge>
            )}
            <span className="text-[11px] text-muted-foreground">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        )}
        <div className="text-sm text-[#1B3A4B] leading-relaxed break-words">
          {renderMessageContent(message.content)}
        </div>
      </div>
      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 self-center">
        <button className="p-1 rounded hover:bg-[#E8DED0] text-muted-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
      </div>
    </motion.div>
  )
}

function renderMessageContent(content: string) {
  // Simple bold/italic rendering
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }
    if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>)
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts.length > 0 ? parts : content
}

// ============================================================
// ONLINE USERS SIDEBAR
// ============================================================

function OnlineUsersSidebar({ users, onClose }: { users: ChatUser[]; onClose?: () => void }) {
  const teachers = users.filter((u) => u.role === 'TEACHER')
  const students = users.filter((u) => u.role === 'STUDENT')

  const UserRow = ({ user }: { user: ChatUser }) => (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/50 transition-colors group">
      <div className="relative shrink-0">
        <Avatar className="w-7 h-7">
          <AvatarFallback
            className="text-[10px] font-semibold border"
            style={{
              backgroundColor: `${ROLE_COLORS[user.role]}15`,
              color: ROLE_COLORS[user.role],
              borderColor: `${ROLE_COLORS[user.role]}30`,
            }}
          >
            {user.name.split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#FFF8F0]"
          style={{ backgroundColor: STATUS_COLORS[user.status] }}
        />
      </div>
      <span
        className="text-xs font-medium truncate"
        style={{ color: user.status === 'offline' ? '#94A3B8' : ROLE_COLORS[user.role] }}
      >
        {user.name}
      </span>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#FFF8F0] border-l border-[#E8DED0]">
      <div className="px-4 py-3 border-b border-[#E8DED0] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1B3A4B]">Members</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {users.filter((u) => u.status !== 'offline').length} online
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2 py-3">
        {/* Teachers */}
        <div className="mb-4">
          <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Teachers — {teachers.length}
          </div>
          {teachers.map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
        </div>

        {/* Students */}
        <div>
          <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Students — {students.filter((s) => s.status !== 'offline').length} online
          </div>
          {students.map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ============================================================
// TYPING INDICATOR
// ============================================================

function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null

  const text =
    users.length === 1
      ? `${users[0]} is typing`
      : users.length === 2
        ? `${users[0]} and ${users[1]} are typing`
        : `${users[0]} and ${users.length - 1} others are typing`

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-1"
    >
      <div className="flex items-center gap-1">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-[#0D7377]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-[#0D7377]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-[#0D7377]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-xs text-[#0D7377]">{text}...</span>
    </motion.div>
  )
}

// ============================================================
// MESSAGE INPUT
// ============================================================

function MessageInput({ onSend, channelName }: { onSend: (msg: string) => void; channelName: string }) {
  const [message, setMessage] = useState('')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const MAX_CHARS = 2000

  const handleSend = () => {
    if (!message.trim()) return
    let finalMsg = message
    if (isBold) finalMsg = `**${finalMsg}**`
    if (isItalic) finalMsg = `*${finalMsg}*`
    onSend(finalMsg)
    setMessage('')
    setIsBold(false)
    setIsItalic(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const charCount = message.length
  const isNearLimit = charCount > MAX_CHARS * 0.9

  return (
    <div className="border-t border-[#E8DED0] bg-white p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isBold ? 'secondary' : 'ghost'}
                size="icon"
                className={`h-7 w-7 ${isBold ? 'bg-[#0D7377]/10 text-[#0D7377]' : 'text-muted-foreground'}`}
                onClick={() => setIsBold(!isBold)}
              >
                <Bold className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isItalic ? 'secondary' : 'ghost'}
                size="icon"
                className={`h-7 w-7 ${isItalic ? 'bg-[#0D7377]/10 text-[#0D7377]' : 'text-muted-foreground'}`}
                onClick={() => setIsItalic(!isItalic)}
              >
                <Italic className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <Paperclip className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach file</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <AtSign className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mention</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}...`}
          rows={1}
          className="w-full resize-none rounded-lg border border-[#E8DED0] bg-[#FFF8F0] px-4 py-2.5 text-sm focus:outline-none focus:border-[#0D7377]/40 focus:ring-2 focus:ring-[#0D7377]/10 placeholder:text-muted-foreground/50 min-h-[42px] max-h-[120px]"
          style={{ overflow: 'auto' }}
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className={`text-[10px] ${isNearLimit ? 'text-red-500' : 'text-muted-foreground/50'}`}>
            {charCount} / {MAX_CHARS}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">
              Ctrl+Enter to send
            </span>
            <Button
              size="sm"
              className="h-7 bg-[#0D7377] hover:bg-[#0A5C5F] text-white gap-1.5 px-3 text-xs"
              disabled={!message.trim()}
              onClick={handleSend}
            >
              <Send className="w-3 h-3" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN CHAT VIEW
// ============================================================

export default function ChatView() {
  const isMobile = useIsMobile()
  const [activeChannel, setActiveChannel] = useState('ch-general')
  const [showMembers, setShowMembers] = useState(!isMobile)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channels = MOCK_CHANNELS
  const currentChannel = channels.find((c) => c.id === activeChannel) || channels[0]
  const channelMessages = MOCK_MESSAGES.filter((m) => m.channelId === activeChannel)

  // Simulate typing indicator
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]
        setTypingUsers([randomUser.name.split(' ')[0]])
        setTimeout(() => setTypingUsers([]), 3000)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages.length, activeChannel])

  const handleSelectChannel = (id: string) => {
    setActiveChannel(id)
    setMobileSidebarOpen(false)
  }

  const handleSendMessage = (content: string) => {
    // In a real app, this would send to backend
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      channelId: activeChannel,
      userId: 'u-amara',
      userName: 'Amara Okafor',
      userRole: 'STUDENT',
      content,
      timestamp: new Date().toISOString(),
    }
    MOCK_MESSAGES.push(newMsg)
  }

  // Determine consecutive messages from same user
  const getMessageGroups = () => {
    const groups: { showHeader: boolean; message: ChatMessage }[] = []
    channelMessages.forEach((msg, i) => {
      const prevMsg = i > 0 ? channelMessages[i - 1] : null
      const showHeader =
        !msg.isSystem &&
        (!prevMsg ||
          prevMsg.userId !== msg.userId ||
          prevMsg.isSystem ||
          shouldShowDateSeparator(channelMessages, i))
      groups.push({ showHeader, message: msg })
    })
    return groups
  }

  const messageGroups = getMessageGroups()

  const channelSidebarContent = (
    <ChannelSidebar
      channels={channels}
      activeChannel={activeChannel}
      onSelectChannel={handleSelectChannel}
      isTeacher={false}
    />
  )

  return (
    <div className="flex h-full rounded-xl overflow-hidden border border-[#E8DED0] shadow-sm">
      {/* Desktop Channel Sidebar */}
      {!isMobile && (
        <div className="w-60 shrink-0">{channelSidebarContent}</div>
      )}

      {/* Mobile Channel Sidebar */}
      {isMobile && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-[#1B3A4B] border-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Channels</SheetTitle>
            </SheetHeader>
            {channelSidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Channel Header */}
        <div className="h-12 border-b border-[#E8DED0] flex items-center justify-between px-4 shrink-0 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-[#1B3A4B]"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <ChannelIcon type={currentChannel.type} className="text-[#0D7377] shrink-0" />
            <span className="font-semibold text-sm text-[#1B3A4B] truncate">{currentChannel.name}</span>
            {currentChannel.unread > 0 && (
              <Badge className="bg-[#0D7377] text-white text-[10px] h-5 border-0">
                {currentChannel.unread} new
              </Badge>
            )}
            <Separator orientation="vertical" className="h-5 mx-1 hidden sm:block" />
            <span className="text-xs text-muted-foreground truncate hidden sm:block">
              {currentChannel.description}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Pin className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pinned Messages</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${showMembers ? 'text-[#0D7377] bg-[#0D7377]/5' : 'text-muted-foreground'}`}
                    onClick={() => setShowMembers(!showMembers)}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showMembers ? 'Hide Members' : 'Show Members'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="py-4">
            {/* Channel Welcome */}
            <div className="px-4 py-6 text-center border-b border-[#E8DED0]/50 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#0D7377]/10 flex items-center justify-center mx-auto mb-3">
                <ChannelIcon type={currentChannel.type} className="w-7 h-7 text-[#0D7377]" />
              </div>
              <h3 className="text-lg font-bold text-[#1B3A4B]">Welcome to #{currentChannel.name}!</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentChannel.description}</p>
            </div>

            {/* Messages */}
            {messageGroups.map(({ showHeader, message }, i) => (
              <React.Fragment key={message.id}>
                {shouldShowDateSeparator(channelMessages, channelMessages.indexOf(message)) && (
                  <div className="flex items-center gap-4 px-4 my-4">
                    <div className="flex-1 h-px bg-[#E8DED0]" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {formatDateSeparator(message.timestamp)}
                    </span>
                    <div className="flex-1 h-px bg-[#E8DED0]" />
                  </div>
                )}
                <MessageBubble message={message} showHeader={showHeader} />
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Typing Indicator */}
        <TypingIndicator users={typingUsers} />

        {/* Message Input */}
        <MessageInput onSend={handleSendMessage} channelName={currentChannel.name} />
      </div>

      {/* Online Users Sidebar (Desktop) */}
      {!isMobile && showMembers && (
        <motion.div
          className="w-56 shrink-0"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 224, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <OnlineUsersSidebar users={MOCK_USERS} />
        </motion.div>
      )}

      {/* Online Users Sidebar (Mobile - Sheet) */}
      {isMobile && showMembers && (
        <Sheet open={showMembers} onOpenChange={setShowMembers}>
          <SheetContent side="right" className="p-0 w-72 border-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Members</SheetTitle>
            </SheetHeader>
            <OnlineUsersSidebar users={MOCK_USERS} onClose={() => setShowMembers(false)} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
