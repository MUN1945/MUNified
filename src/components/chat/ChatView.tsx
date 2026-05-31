'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash, Bell, BellOff, Users, Plus, Search, Menu, X, Send,
  Paperclip, Bold, Italic, ChevronDown, ChevronRight,
  Shield, Globe, BookOpen, Megaphone, MessageSquare,
  AtSign, Settings, Volume2, Pin, Sparkles, Bot,
  MoreHorizontal, Mic, Loader2
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
import { useAuthStore } from '@/lib/store'

// ============================================================
// TYPES
// ============================================================

type ChannelType = 'text' | 'announcement' | 'voice' | 'study' | 'committee'
type UserRole = 'TEACHER' | 'STUDENT' | 'ADMIN' | 'SCHOOL_ADMIN' | 'SUPER_ADMIN' | 'FOUNDER' | 'MASTER_ADMIN'
type UserStatus = 'online' | 'away' | 'offline'

interface ChatChannel {
  id: string
  name: string
  type: ChannelType
  category: string
  description: string
  unread: number
  isMuted: boolean
  isCommittee: boolean
}

interface ChatUser {
  id: string
  name: string
  role: UserRole
  status: UserStatus
  avatar?: string
  isBot?: boolean
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
  isBot?: boolean
}

// ============================================================
// ROLE COLORS & BOT STYLE
// ============================================================

const ROLE_COLORS: Record<string, string> = {
  TEACHER: '#D4A843',
  STUDENT: '#0D7377',
  ADMIN: '#DC2626',
  SCHOOL_ADMIN: '#7C3AED',
  SUPER_ADMIN: '#DC2626',
  FOUNDER: '#D4A843',
  MASTER_ADMIN: '#D4A843',
}

const BOT_COLOR = '#0D7377'
const BOT_NAME = 'DiplomatiQ Guru'

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
    case 'committee':
      return <Shield className={`w-4 h-4 ${className}`} />
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
                                  {channel.isCommittee && (
                                    <Sparkles className="w-3 h-3 text-[#D4A843]/60" />
                                  )}
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
                            <TooltipContent side="right" className="bg-[#264B5E] text-white border-white/10 max-w-[240px]">
                              <div className="font-medium text-xs">{channel.name}</div>
                              <div className="text-[10px] text-white/50 mt-0.5">{channel.description}</div>
                              {channel.isCommittee && (
                                <div className="text-[10px] text-[#D4A843] mt-1 flex items-center gap-1">
                                  <Bot className="w-3 h-3" /> DiplomatiQ Guru Active
                                </div>
                              )}
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
              <Users className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1B3A4B] bg-[#059669]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white truncate">Chat</div>
          <div className="text-[10px] text-white/40">Online</div>
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
  const isBot = message.isBot || message.userName === BOT_NAME
  const roleColor = isBot ? BOT_COLOR : (ROLE_COLORS[message.userRole] || '#0D7377')

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

  const initials = isBot ? 'DG' : message.userName.split(' ').map((n) => n[0]).join('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-start gap-3 px-4 py-1 hover:bg-[#F5F0EB]/50 transition-colors ${showHeader ? 'mt-3' : ''} ${isBot ? 'bg-[#0D7377]/[0.03]' : ''}`}
    >
      {showHeader ? (
        <Avatar className="w-9 h-9 mt-0.5 shrink-0">
          <AvatarFallback
            className={`text-xs font-semibold border ${isBot ? 'bg-[#0D7377]/20 text-[#0D7377] border-[#0D7377]/30' : ''}`}
            style={!isBot ? {
              backgroundColor: `${roleColor}15`,
              color: roleColor,
              borderColor: `${roleColor}30`,
            } : undefined}
          >
            {isBot ? <Sparkles className="w-4 h-4" /> : initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-9 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        {showHeader && (
          <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
            <span className="font-semibold text-sm" style={{ color: roleColor }}>
              {message.userName}
            </span>
            {isBot && (
              <Badge className="text-[9px] h-4 px-1.5 border-0 bg-[#0D7377]/15 text-[#0D7377]">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                AI Assistant
              </Badge>
            )}
            {message.userRole === 'TEACHER' && !isBot && (
              <Badge className="text-[9px] h-4 px-1.5 border-0" style={{ backgroundColor: `${roleColor}20`, color: roleColor }}>
                Teacher
              </Badge>
            )}
            <span className="text-[11px] text-muted-foreground">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        )}
        <div className={`text-sm leading-relaxed break-words ${isBot ? 'text-[#1B3A4B]' : 'text-[#1B3A4B]'}`}>
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
  const bots = users.filter((u) => u.isBot)
  const teachers = users.filter((u) => u.role === 'TEACHER' && !u.isBot)
  const students = users.filter((u) => u.role === 'STUDENT' && !u.isBot)

  const UserRow = ({ user }: { user: ChatUser }) => (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/50 transition-colors group">
      <div className="relative shrink-0">
        <Avatar className="w-7 h-7">
          <AvatarFallback
            className={`text-[10px] font-semibold border ${user.isBot ? 'bg-[#0D7377]/20 text-[#0D7377] border-[#0D7377]/30' : ''}`}
            style={!user.isBot ? {
              backgroundColor: `${ROLE_COLORS[user.role] || '#0D7377'}15`,
              color: ROLE_COLORS[user.role] || '#0D7377',
              borderColor: `${ROLE_COLORS[user.role] || '#0D7377'}30`,
            } : undefined}
          >
            {user.isBot ? <Sparkles className="w-3.5 h-3.5" /> : user.name.split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        {!user.isBot && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#FFF8F0]"
            style={{ backgroundColor: STATUS_COLORS[user.status] }}
          />
        )}
      </div>
      <span
        className={`text-xs font-medium truncate ${user.isBot ? 'text-[#0D7377]' : ''}`}
        style={!user.isBot ? { color: user.status === 'offline' ? '#94A3B8' : (ROLE_COLORS[user.role] || '#0D7377') } : undefined}
      >
        {user.name}
      </span>
      {user.isBot && (
        <Badge className="text-[8px] h-3.5 px-1 border-0 bg-[#0D7377]/15 text-[#0D7377] ml-auto">
          AI
        </Badge>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#FFF8F0] border-l border-[#E8DED0]">
      <div className="px-4 py-3 border-b border-[#E8DED0] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1B3A4B]">Members</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {users.filter((u) => u.status !== 'offline' || u.isBot).length} online
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2 py-3">
        {/* AI Assistants */}
        {bots.length > 0 && (
          <div className="mb-4">
            <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0D7377]">
              AI Assistants — {bots.length}
            </div>
            {bots.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </div>
        )}

        {/* Teachers */}
        {teachers.length > 0 && (
          <div className="mb-4">
            <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Teachers — {teachers.length}
            </div>
            {teachers.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </div>
        )}

        {/* Students */}
        {students.length > 0 && (
          <div>
            <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Students — {students.filter((s) => s.status !== 'offline').length} online
            </div>
            {students.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </div>
        )}
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

function MessageInput({
  onSend,
  onAskAI,
  channelName,
  isCommitteeChannel,
  isAILoading,
}: {
  onSend: (msg: string) => void
  onAskAI: (msg: string) => void
  channelName: string
  isCommitteeChannel: boolean
  isAILoading: boolean
}) {
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

  const handleAskAI = () => {
    if (!message.trim()) return
    onAskAI(message.trim())
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

  // Auto-detect @DiplomatiQ Guru mention
  const hasAIMention = message.toLowerCase().includes('@diplomatiq guru') || message.toLowerCase().includes('@diplomatiq')

  return (
    <div className="border-t border-[#E8DED0] bg-white p-3">
      {/* AI Assistant Ask Button (committee channels only) */}
      {isCommitteeChannel && (
        <div className="mb-2">
          <Button
            variant="outline"
            size="sm"
            className={`w-full gap-2 text-xs transition-all ${
              hasAIMention
                ? 'border-[#0D7377] bg-[#0D7377]/5 text-[#0D7377]'
                : 'border-[#E8DED0] text-muted-foreground hover:border-[#0D7377]/40 hover:text-[#0D7377]'
            }`}
            onClick={handleAskAI}
            disabled={!message.trim() || isAILoading}
          >
            {isAILoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isAILoading ? 'DiplomatiQ Guru is thinking...' : hasAIMention ? 'Ask DiplomatiQ Guru' : 'Ask DiplomatiQ Guru'}
          </Button>
        </div>
      )}
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
          placeholder={`Message #${channelName}${isCommitteeChannel ? ' (type @DiplomatiQ Guru to ask AI)' : ''}...`}
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
// AI THINKING INDICATOR
// ============================================================

function AIThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 px-4 py-2 bg-[#0D7377]/[0.03]"
    >
      <Avatar className="w-9 h-9 mt-0.5 shrink-0">
        <AvatarFallback className="text-xs font-semibold border bg-[#0D7377]/20 text-[#0D7377] border-[#0D7377]/30">
          <Sparkles className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm text-[#0D7377]">DiplomatiQ Guru</span>
          <Badge className="text-[9px] h-4 px-1.5 border-0 bg-[#0D7377]/15 text-[#0D7377]">
            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
            AI Assistant
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#0D7377]/60">
          <Loader2 className="w-3 h-3 animate-spin" />
          Thinking...
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// MAIN CHAT VIEW
// ============================================================

export default function ChatView() {
  const isMobile = useIsMobile()
  const { user } = useAuthStore()
  const isTeacher = user && ['TEACHER', 'ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'FOUNDER', 'MASTER_ADMIN'].includes(user.role)
  const [activeChannel, setActiveChannel] = useState('')
  const [showMembers, setShowMembers] = useState(!isMobile)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isAILoading, setIsAILoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch channels on mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const channelsRes = await fetch('/api/channels')
        if (channelsRes.ok) {
          const data = await channelsRes.json()
          const rawChannels = Array.isArray(data) ? data : (data.channels || data.data || [])
          const channelList: ChatChannel[] = rawChannels.map((ch: Record<string, unknown>) => ({
            id: String(ch.id || ''),
            name: String(ch.name || ''),
            type: (ch.type as ChannelType) || 'text',
            category: String(ch.category || 'General'),
            description: String(ch.description || ''),
            unread: Number(ch.unread || 0),
            isMuted: Boolean(ch.isMuted || false),
            isCommittee: Boolean(ch.isCommittee || false),
          }))
          setChannels(channelList)
          if (channelList.length > 0) {
            setActiveChannel(channelList[0].id)
          }
        }
      } catch {
        // API not available
      } finally {
        setLoading(false)
      }
    }
    fetchChannels()
  }, [])

  // Fetch messages when active channel changes
  const fetchMessages = useCallback(async (channelId: string) => {
    try {
      const messagesRes = await fetch(`/api/messages?channelId=${channelId}`)
      if (messagesRes.ok) {
        const msgData = await messagesRes.json()
        const rawMessages = Array.isArray(msgData) ? msgData : (msgData.messages || msgData.data || [])
        const mappedMessages: ChatMessage[] = rawMessages.map((m: Record<string, unknown>) => ({
          id: String(m.id || ''),
          channelId: String(m.channelId || ''),
          userId: String(m.userId || (m.user as Record<string, unknown>)?.id || ''),
          userName: String(m.userName || (m.user as Record<string, unknown>)?.name || 'Unknown'),
          userRole: String(m.userRole || (m.user as Record<string, unknown>)?.role || 'STUDENT') as UserRole,
          content: String(m.content || ''),
          timestamp: String(m.timestamp || m.createdAt || new Date().toISOString()),
          isSystem: Boolean(m.isSystem || false),
          isEdited: Boolean(m.isEdited || false),
          isBot: Boolean((m.user as Record<string, unknown>)?.isBot || m.isBot || false),
        }))
        setMessages(mappedMessages)
      }
    } catch {
      // Failed to fetch
    }
  }, [])

  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel)
    }
  }, [activeChannel, fetchMessages])

  const currentChannel = channels.find((c) => c.id === activeChannel) || channels[0] || null

  const channelMessages = messages.filter((m) => m.channelId === activeChannel)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages.length, activeChannel, isAILoading])

  const handleSelectChannel = (id: string) => {
    setActiveChannel(id)
    setMobileSidebarOpen(false)
  }

  const handleSendMessage = async (content: string) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: activeChannel,
          content,
        }),
      })
      if (res.ok) {
        const response = await res.json()
        const rawMsg = response.data || response
        const newMsg: ChatMessage = {
          id: String(rawMsg.id || ''),
          channelId: String(rawMsg.channelId || activeChannel),
          userId: String(rawMsg.userId || (rawMsg.user as Record<string, unknown>)?.id || ''),
          userName: String(rawMsg.userName || (rawMsg.user as Record<string, unknown>)?.name || 'You'),
          userRole: String(rawMsg.userRole || (rawMsg.user as Record<string, unknown>)?.role || 'STUDENT') as UserRole,
          content: String(rawMsg.content || content),
          timestamp: String(rawMsg.timestamp || rawMsg.createdAt || new Date().toISOString()),
          isSystem: Boolean(rawMsg.isSystem || false),
          isEdited: Boolean(rawMsg.isEdited || false),
          isBot: Boolean((rawMsg.user as Record<string, unknown>)?.isBot || false),
        }
        setMessages(prev => [...prev, newMsg])
      }
    } catch {
      // Failed to send message
    }
  }

  const handleAskAI = async (question: string) => {
    // First, send the user's question as a regular message (so it appears in the chat)
    const cleanedQuestion = question
      .replace(/@diplomatiq\s*guru/gi, '')
      .replace(/@diplomatiq/gi, '')
      .trim()

    if (cleanedQuestion) {
      await handleSendMessage(`@DiplomatiQ Guru ${cleanedQuestion}`)
    }

    // Then call the AI assistant
    setIsAILoading(true)
    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: activeChannel,
          message: cleanedQuestion || question,
        }),
      })

      if (res.ok) {
        const response = await res.json()
        if (response.data) {
          const botMsg: ChatMessage = {
            id: String(response.data.id || ''),
            channelId: String(response.data.channelId || activeChannel),
            userId: String(response.data.userId || (response.data.user as Record<string, unknown>)?.id || ''),
            userName: String((response.data.user as Record<string, unknown>)?.name || BOT_NAME),
            userRole: String((response.data.user as Record<string, unknown>)?.role || 'ADMIN') as UserRole,
            content: String(response.data.content || ''),
            timestamp: String(response.data.createdAt || new Date().toISOString()),
            isBot: true,
          }
          setMessages(prev => [...prev, botMsg])
        }
      }
    } catch {
      // AI request failed — add error message
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        channelId: activeChannel,
        userId: 'bot',
        userName: BOT_NAME,
        userRole: 'ADMIN',
        content: "I'm experiencing a temporary issue and can't respond right now. Please try again in a moment!",
        timestamp: new Date().toISOString(),
        isBot: true,
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsAILoading(false)
    }
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
          prevMsg.isBot !== msg.isBot ||
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
      isTeacher={!!isTeacher}
    />
  )

  // Loading state when channels haven't loaded yet
  if (!currentChannel) {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full rounded-xl border border-[#E8DED0] bg-white">
          <div className="text-center py-20 px-6">
            <div className="w-16 h-16 rounded-2xl bg-[#0D7377]/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <MessageSquare className="w-8 h-8 text-[#0D7377]" />
            </div>
            <h2 className="text-xl font-bold text-[#1B3A4B]">Loading Channels...</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Please wait while we load your chat channels.
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center h-full rounded-xl border border-[#E8DED0] bg-white">
        <div className="text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0D7377]/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-[#0D7377]" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3A4B]">No Channels Yet</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Chat channels will appear here once they are created. Committee channels include the DiplomatiQ Guru AI assistant.
          </p>
        </div>
      </div>
    )
  }

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
            {currentChannel.isCommittee && (
              <Badge className="bg-[#0D7377]/10 text-[#0D7377] text-[9px] h-4 px-1.5 border-0 gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </Badge>
            )}
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
            {currentChannel.isCommittee && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#0D7377] bg-[#0D7377]/5"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>DiplomatiQ Guru is active in this channel</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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
              {currentChannel.isCommittee && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#0D7377] bg-[#0D7377]/5 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  DiplomatiQ Guru is here to help — mention @DiplomatiQ Guru or use the Ask button
                </div>
              )}
            </div>

            {/* Messages */}
            {messageGroups.map(({ showHeader, message }) => (
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

            {/* AI Thinking Indicator */}
            {isAILoading && <AIThinkingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Typing Indicator */}
        <TypingIndicator users={typingUsers} />

        {/* Message Input */}
        <MessageInput
          onSend={handleSendMessage}
          onAskAI={handleAskAI}
          channelName={currentChannel.name}
          isCommitteeChannel={currentChannel.isCommittee}
          isAILoading={isAILoading}
        />
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
          <OnlineUsersSidebar users={users} />
        </motion.div>
      )}

      {/* Online Users Sidebar (Mobile - Sheet) */}
      {isMobile && showMembers && (
        <Sheet open={showMembers} onOpenChange={setShowMembers}>
          <SheetContent side="right" className="p-0 w-72 border-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Members</SheetTitle>
            </SheetHeader>
            <OnlineUsersSidebar users={users} onClose={() => setShowMembers(false)} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
