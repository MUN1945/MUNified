'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
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
import { useI18n } from '@/lib/i18n'

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

function formatDateSeparator(timestamp: string, t: (key: string) => string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return t('chat.timeLabels.today')
  if (date.toDateString() === yesterday.toDateString()) return t('chat.timeLabels.yesterday')
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
  const { t } = useI18n()

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
    <div className="flex flex-col h-full bg-[#1B3A4B] overflow-hidden">
      {/* Server Header */}
      <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#D4A843] flex items-center justify-center">
            <Globe className="w-4 h-4 text-[#1B3A4B]" />
          </div>
          <span className="font-bold text-white text-sm">{t('chat.appName')}</span>
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
                                  <Bot className="w-3 h-3" /> {t('chat.guruActive')}
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
        <div className="px-3 py-2 border-t border-white/10 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-white/40 hover:text-white/70 hover:bg-white/[0.06] gap-2 justify-start text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('chat.createChannel')}
          </Button>
        </div>
      )}

      {/* User area */}
      <div className="px-3 py-2.5 border-t border-white/10 flex items-center gap-2 shrink-0">
        <div className="relative">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-[#0D7377]/30 text-[#0D7377] text-xs font-semibold">
              <Users className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1B3A4B] bg-[#059669]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white truncate">{t('chat.tabs.chat')}</div>
          <div className="text-[10px] text-white/40">{t('chat.online')}</div>
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
  const { t } = useI18n()
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
      className={`group flex items-start gap-2 md:gap-3 px-3 md:px-4 py-1 hover:bg-[#F5F0EB]/50 transition-colors ${showHeader ? 'mt-3' : ''} ${isBot ? 'bg-[#0D7377]/[0.03]' : ''}`}
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
          <div className="flex items-baseline gap-1.5 md:gap-2 mb-0.5 flex-wrap min-w-0">
            <span className="font-semibold text-sm shrink-0" style={{ color: roleColor }}>
              {message.userName}
            </span>
            {isBot && (
              <Badge className="text-[9px] h-4 px-1.5 border-0 bg-[#0D7377]/15 text-[#0D7377]">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                {t('chat.tabs.aiAssistant')}
              </Badge>
            )}
            {message.userRole === 'TEACHER' && !isBot && (
              <Badge className="text-[9px] h-4 px-1.5 border-0" style={{ backgroundColor: `${roleColor}20`, color: roleColor }}>
                {t('chat.teachers')}
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
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 self-center shrink-0 ml-1">
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
  const { t } = useI18n()
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
          {t('chat.tabs.ai')}
        </Badge>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-[#FFF8F0] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E8DED0] flex items-center gap-2 shrink-0">
        <h3 className="text-sm font-semibold text-[#1B3A4B] shrink-0">{t('chat.members')}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Users className="w-3.5 h-3.5" />
          {users.filter((u) => u.status !== 'offline' || u.isBot).length} {t('chat.online')}
        </div>
        <div className="flex-1" />
        {onClose && (
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-2 py-3">
        {/* AI Assistants */}
        {bots.length > 0 && (
          <div className="mb-4">
            <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0D7377]">
              {t('chat.aiAssistants')} — {bots.length}
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
              {t('chat.teachers')} — {teachers.length}
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
              {t('chat.students')} — {students.filter((s) => s.status !== 'offline').length} {t('chat.online')}
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
      className="flex items-center gap-2 px-3 md:px-4 py-1 shrink-0"
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
  const { t } = useI18n()
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
    <div className="border-t border-[#E8DED0] bg-white p-2 md:p-3 shrink-0">
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
            {isAILoading ? t('chat.guruThinking') : t('chat.askGuru')}
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
            <TooltipContent>{t('chat.formatting.bold')}</TooltipContent>
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
            <TooltipContent>{t('chat.formatting.italic')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <Paperclip className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('chat.formatting.attachFile')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <AtSign className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('chat.formatting.mention')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`${t('chat.channelMessage', { channel: channelName })}${isCommitteeChannel ? ' (type @DiplomatiQ Guru to ask AI)' : ''}...`}
          rows={1}
          className="w-full resize-none rounded-lg border border-[#E8DED0] bg-[#FFF8F0] px-3 md:px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:border-[#0D7377]/40 focus:ring-2 focus:ring-[#0D7377]/10 placeholder:text-muted-foreground/50 min-h-[42px] max-h-[120px]"
          style={{ overflow: 'auto' }}
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className={`text-[10px] ${isNearLimit ? 'text-red-500' : 'text-muted-foreground/50'}`}>
            {charCount} / {MAX_CHARS}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">
              {t('chat.sendShortcut')}
            </span>
            <Button
              size="sm"
              className="h-7 bg-[#0D7377] hover:bg-[#0A5C5F] text-white gap-1.5 px-3 text-xs"
              disabled={!message.trim()}
              onClick={handleSend}
            >
              <Send className="w-3 h-3" />
              {t('chat.send')}
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
  const { t } = useI18n()
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 md:gap-3 px-3 md:px-4 py-2 bg-[#0D7377]/[0.03]"
    >
      <Avatar className="w-9 h-9 mt-0.5 shrink-0">
        <AvatarFallback className="text-xs font-semibold border bg-[#0D7377]/20 text-[#0D7377] border-[#0D7377]/30">
          <Sparkles className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-baseline gap-1.5 md:gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm text-[#0D7377] shrink-0">DiplomatiQ Guru</span>
          <Badge className="text-[9px] h-4 px-1.5 border-0 bg-[#0D7377]/15 text-[#0D7377]">
            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
            {t('chat.tabs.aiAssistant')}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#0D7377]/60">
          <Loader2 className="w-3 h-3 animate-spin" />
          {t('chat.thinking')}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// MAIN CHAT VIEW
// ============================================================

export default function ChatView() {
  const { t } = useI18n()
  const isMobile = useIsMobile()
  const [activeChannel, setActiveChannel] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileMembersOpen, setMobileMembersOpen] = useState(false)
  const { user: authUser } = useAuthStore()
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isAILoading, setIsAILoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [users, setUsers] = useState<ChatUser[]>([])
  const [loading, setLoading] = useState(true)
  const [setupLoading, setSetupLoading] = useState(false)

  useEffect(() => {
    if (!isMobile) {
      setShowMembers(true)
    }
  }, [isMobile])

  // Determine if user is teacher/admin for channel creation
  const isTeacher = authUser?.role ? ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'FOUNDER', 'MASTER_ADMIN'].includes(authUser.role) : false

  // Auto-setup chat channels if none exist
  const autoSetupChat = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/setup/chat', {
        method: 'POST',
        headers: { 'x-setup-secret': 'diplomatiq-chat-setup-2026' },
      })
      if (res.ok) {
        const result = await res.json()
        return result.success === true
      }
    } catch {
      // Setup failed silently
    }
    return false
  }, [])

  // Map raw API channel data to ChatChannel, handling Prisma nested objects
  const mapChannelData = useCallback((rawChannels: Record<string, unknown>[]): ChatChannel[] => {
    // Channel types the UI recognizes; 'general' from API maps to 'text'
    const VALID_TYPES = ['text', 'announcement', 'voice', 'study', 'committee']
    const TYPE_MAP: Record<string, ChannelType> = { general: 'text' }

    return rawChannels.map((ch) => {
      const rawType = String(ch.type || '')
      const mappedType = TYPE_MAP[rawType] || (VALID_TYPES.includes(rawType) ? rawType as ChannelType : 'text')

      return {
        id: String(ch.id || ''),
        name: String(ch.name || ''),
        type: mappedType,
        category: (ch.category && String(ch.category) !== 'null' && String(ch.category) !== 'undefined')
          ? String(ch.category)
          : 'General',
        description: String(ch.description || ''),
        // Use _count.messages if available, otherwise fall back to unread field
        unread: Number(ch.unread || (ch._count as Record<string, unknown>)?.messages || 0),
        isMuted: Boolean(ch.isMuted || false),
        isCommittee: Boolean(ch.isCommittee || ch.type === 'committee' || false),
      }
    })
  }, [])

  // Fetch channels on mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const channelsRes = await fetch('/api/channels')
        if (channelsRes.ok) {
          const data = await channelsRes.json()
          // API returns { success: true, data: [...] }
          const rawChannels = Array.isArray(data) ? data : (data.channels || data.data || [])
          let channelList = mapChannelData(rawChannels)

          // Auto-setup if no channels exist
          if (channelList.length === 0) {
            setSetupLoading(true)
            const setupSuccess = await autoSetupChat()
            setSetupLoading(false)

            if (setupSuccess) {
              // Re-fetch channels after setup
              const retryRes = await fetch('/api/channels')
              if (retryRes.ok) {
                const retryData = await retryRes.json()
                const retryRaw = Array.isArray(retryData) ? retryData : (retryData.channels || retryData.data || [])
                channelList = mapChannelData(retryRaw)
              }
            }
          }

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
  }, [mapChannelData, autoSetupChat])

  // Fetch online users for the members sidebar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/channels')
        if (res.ok) {
          // We don't have a dedicated online-users endpoint,
          // so we'll show the bot user statically
          const botUser: ChatUser = {
            id: 'bot-diplomatiq-guru',
            name: 'DiplomatiQ Guru',
            role: 'ADMIN',
            status: 'online',
            isBot: true,
          }
          setUsers([botUser])
        }
      } catch {
        // fallback: just show the bot
        setUsers([{
          id: 'bot-diplomatiq-guru',
          name: 'DiplomatiQ Guru',
          role: 'ADMIN',
          status: 'online',
          isBot: true,
        }])
      }
    }
    fetchUsers()
  }, [])

  // Map raw API message data to ChatMessage, handling Prisma nested user objects
  const mapMessageData = useCallback((rawMessages: Record<string, unknown>[]): ChatMessage[] => {
    return rawMessages.map((m) => {
      const userObj = m.user as Record<string, unknown> | null
      return {
        id: String(m.id || ''),
        channelId: String(m.channelId || ''),
        userId: String(m.userId || userObj?.id || ''),
        userName: String(m.userName || userObj?.name || 'Unknown'),
        userRole: String(m.userRole || userObj?.role || 'STUDENT') as UserRole,
        content: String(m.content || ''),
        timestamp: String(m.timestamp || m.createdAt || new Date().toISOString()),
        isSystem: Boolean(m.isSystem || false),
        isEdited: Boolean(m.isEdited || false),
        isBot: Boolean(userObj?.isBot || m.isBot || false),
      }
    })
  }, [])

  // Extract raw messages array from API response: { success, data: [...] }
  const extractMessagesFromResponse = useCallback((msgData: Record<string, unknown>): Record<string, unknown>[] => {
    if (Array.isArray(msgData)) return msgData
    // API returns { success: true, data: [...messages] }
    if (Array.isArray(msgData.data)) return msgData.data as Record<string, unknown>[]
    if (Array.isArray(msgData.messages)) return msgData.messages as Record<string, unknown>[]
    return []
  }, [])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeChannel) return
    pollingRef.current = setInterval(async () => {
      try {
        const messagesRes = await fetch(`/api/messages?channelId=${activeChannel}`)
        if (messagesRes.ok) {
          const msgData = await messagesRes.json()
          const rawMessages = extractMessagesFromResponse(msgData)
          const mappedMessages = mapMessageData(rawMessages)
          // Merge with existing messages — deduplicate by ID to avoid
          // losing optimistic local-only messages or duplicating them.
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const newFromServer = mappedMessages.filter(m => !existingIds.has(m.id))
            if (newFromServer.length === 0) return prev // no change, skip re-render
            return [...prev, ...newFromServer]
          })
        }
      } catch {
        // polling failed silently
      }
    }, 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [activeChannel, mapMessageData, extractMessagesFromResponse])

  // Fetch messages when active channel changes
  const fetchMessages = useCallback(async (channelId: string) => {
    try {
      const messagesRes = await fetch(`/api/messages?channelId=${channelId}`)
      if (messagesRes.ok) {
        const msgData = await messagesRes.json()
        const rawMessages = extractMessagesFromResponse(msgData)
        const mappedMessages = mapMessageData(rawMessages)
        setMessages(mappedMessages)
      }
    } catch {
      // Failed to fetch
    }
  }, [mapMessageData, extractMessagesFromResponse])

  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel)
    }
  }, [activeChannel, fetchMessages])

  const currentChannel: ChatChannel | null = channels.length > 0
    ? (channels.find((c) => c.id === activeChannel) || channels[0])
    : null

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
        // API returns { success: true, data: { ...message with nested user } }
        const rawMsg = response.data || response
        const userObj = rawMsg.user as Record<string, unknown> | null
        const newMsg: ChatMessage = {
          id: String(rawMsg.id || ''),
          channelId: String(rawMsg.channelId || activeChannel),
          userId: String(rawMsg.userId || userObj?.id || ''),
          userName: String(rawMsg.userName || userObj?.name || 'You'),
          userRole: String(rawMsg.userRole || userObj?.role || 'STUDENT') as UserRole,
          content: String(rawMsg.content || content),
          timestamp: String(rawMsg.timestamp || rawMsg.createdAt || new Date().toISOString()),
          isSystem: Boolean(rawMsg.isSystem || false),
          isEdited: Boolean(rawMsg.isEdited || false),
          isBot: Boolean(userObj?.isBot || false),
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
        // API returns { success: true, data: { ...message with nested user } }
        if (response.data) {
          const botData = response.data
          const botUserObj = botData.user as Record<string, unknown> | null
          const botMsg: ChatMessage = {
            id: String(botData.id || ''),
            channelId: String(botData.channelId || activeChannel),
            userId: String(botData.userId || botUserObj?.id || ''),
            userName: String(botUserObj?.name || BOT_NAME),
            userRole: String(botUserObj?.role || 'ADMIN') as UserRole,
            content: String(botData.content || ''),
            timestamp: String(botData.createdAt || new Date().toISOString()),
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
      isTeacher={isTeacher}
    />
  )

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center py-20 px-6">
          <div className="w-12 h-12 rounded-full border-2 border-[#0D7377] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{t('chat.loadingChannels')}</p>
        </div>
      </div>
    )
  }

  // Empty state when no channels exist
  if (!currentChannel) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0D7377]/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-[#0D7377]" />
          </div>
          <h2 className="text-xl font-bold text-[#1B3A4B]">{t('chat.noChannels')}</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Chat channels will appear here once they are created. Committee channels include the DiplomatiQ Guru AI assistant.
          </p>
          <Button
            className="mt-4 bg-[#0D7377] hover:bg-[#0A5C5F] text-white gap-2"
            disabled={setupLoading}
            onClick={async () => {
              setSetupLoading(true)
              try {
                const res = await fetch('/api/setup/chat', {
                  method: 'POST',
                  headers: { 'x-setup-secret': 'diplomatiq-chat-setup-2026' },
                })
                if (res.ok) {
                  window.location.reload()
                }
              } catch {
                // Setup failed silently
              }
              setSetupLoading(false)
            }}
          >
            {setupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {setupLoading ? 'Setting up...' : t('chat.setupChannels')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-white rounded-lg shadow-sm border border-[#E8DED0]/60">
      {/* Desktop Channel Sidebar */}
      {!isMobile && (
        <div className="w-60 shrink-0 border-r border-[#E8DED0] h-full overflow-hidden">{channelSidebarContent}</div>
      )}

      {/* Mobile Channel Sidebar */}
      {isMobile && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 bg-[#1B3A4B] border-0 h-full overflow-hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Channels</SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-hidden">{channelSidebarContent}</div>
          </SheetContent>
        </Sheet>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
        {/* Channel Header */}
        <div className="h-12 border-b border-[#E8DED0] flex items-center justify-between px-3 md:px-4 shrink-0 bg-white gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
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
              <Badge className="bg-[#0D7377]/10 text-[#0D7377] text-[9px] h-4 px-1.5 border-0 gap-0.5 shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                {t('chat.tabs.ai')}
              </Badge>
            )}
            {currentChannel.unread > 0 && (
              <Badge className="bg-[#0D7377] text-white text-[10px] h-5 border-0 shrink-0">
                {currentChannel.unread} new
              </Badge>
            )}
            <Separator orientation="vertical" className="h-5 mx-1 hidden md:block shrink-0" />
            <span className="text-xs text-muted-foreground truncate hidden md:block">
              {currentChannel.description}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
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
                  <TooltipContent>{t('chat.guruActive')}</TooltipContent>
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
                <TooltipContent>{t('chat.pinnedMessages')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('chat.search')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${showMembers ? 'text-[#0D7377] bg-[#0D7377]/5' : 'text-muted-foreground'}`}
                    onClick={() => {
                      if (isMobile) {
                        setMobileMembersOpen(true)
                      } else {
                        setShowMembers(!showMembers)
                      }
                    }}
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showMembers ? t('chat.hideMembers') : t('chat.showMembers')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0 overflow-x-hidden">
          <div className="py-2 md:py-4">
            {/* Channel Welcome */}
            <div className="px-3 md:px-4 py-4 md:py-6 text-center border-b border-[#E8DED0]/50 mb-2 md:mb-4">
              <div className="w-14 h-14 rounded-full bg-[#0D7377]/10 flex items-center justify-center mx-auto mb-3">
                <ChannelIcon type={currentChannel.type} className="w-7 h-7 text-[#0D7377]" />
              </div>
              <h3 className="text-lg font-bold text-[#1B3A4B]">{t('chat.channelWelcome', { channel: currentChannel.name })}</h3>
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
                  <div className="flex items-center gap-4 px-3 md:px-4 my-3 md:my-4">
                    <div className="flex-1 h-px bg-[#E8DED0]" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {formatDateSeparator(message.timestamp, t)}
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
        </div>

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
        <div className="w-56 shrink-0 h-full overflow-hidden border-l border-[#E8DED0]">
          <OnlineUsersSidebar users={users} />
        </div>
      )}

      {/* Online Users Sidebar (Mobile - Sheet) */}
      {isMobile && (
        <Sheet open={mobileMembersOpen} onOpenChange={setMobileMembersOpen}>
          <SheetContent side="right" className="p-0 w-72 border-0 h-full overflow-hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>{t('chat.members')}</SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-hidden">
              <OnlineUsersSidebar users={users} onClose={() => setMobileMembersOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
