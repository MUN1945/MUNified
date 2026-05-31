'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Globe, Building2, Users, Medal, Crown, Shield,
  Zap, Star, Flame, ChevronUp, Search, Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useAuthStore, getCurrentLevel, getNextLevel, getXPProgress, type XPLevel } from '@/lib/store'

// ============================================================
// XP LEVEL CONFIG (matching task spec thresholds)
// ============================================================

const LEVEL_CONFIG: { name: XPLevel; minXP: number; color: string; icon: React.ElementType }[] = [
  { name: 'OBSERVER', minXP: 0, color: '#94A3B8', icon: Users },
  { name: 'DELEGATE', minXP: 100, color: '#0D7377', icon: Shield },
  { name: 'AMBASSADOR', minXP: 500, color: '#D4A843', icon: Crown },
  { name: 'DIPLOMAT', minXP: 1000, color: '#059669', icon: Medal },
  { name: 'ENVOY', minXP: 2500, color: '#A78BFA', icon: Globe },
  { name: 'SECRETARY_GENERAL', minXP: 5000, color: '#F59E0B', icon: Trophy },
]

function getLevelForXP(xp: number) {
  let level = LEVEL_CONFIG[0]
  for (const l of LEVEL_CONFIG) {
    if (xp >= l.minXP) level = l
    else break
  }
  return level
}

function getNextLevelForXP(xp: number) {
  const current = getLevelForXP(xp)
  const idx = LEVEL_CONFIG.findIndex(l => l.name === current.name)
  if (idx < LEVEL_CONFIG.length - 1) return LEVEL_CONFIG[idx + 1]
  return null
}

function getXPProgressLocal(xp: number): number {
  const current = getLevelForXP(xp)
  const next = getNextLevelForXP(xp)
  if (!next) return 100
  return Math.min(((xp - current.minXP) / (next.minXP - current.minXP)) * 100, 100)
}

// ============================================================
// Leaderboard data — populated from API
// ============================================================

interface LeaderboardUser {
  id: string
  name: string
  school: string
  xp: number
  conferences: number
  diplomacy: number
  research: number
}

const MOCK_USERS: LeaderboardUser[] = []

// ============================================================
// PODIUM CARD (Top 3)
// ============================================================

function PodiumCard({ user, rank, currentUserId }: { user: LeaderboardUser; rank: number; currentUserId: string }) {
  const level = getLevelForXP(user.xp)
  const LevelIcon = level.icon
  const isCurrentUser = user.id === currentUserId

  const medals = [
    { bg: 'bg-gradient-to-b from-[#D4A843] to-[#B8902A]', text: 'text-[#1B3A4B]', ring: 'ring-[#D4A843]', label: '1st', size: 'w-20 h-20' },
    { bg: 'bg-gradient-to-b from-[#C0C0C0] to-[#A0A0A0]', text: 'text-[#1B3A4B]', ring: 'ring-[#C0C0C0]', label: '2nd', size: 'w-16 h-16' },
    { bg: 'bg-gradient-to-b from-[#CD7F32] to-[#A0652A]', text: 'text-white', ring: 'ring-[#CD7F32]', label: '3rd', size: 'w-16 h-16' },
  ]
  const medal = medals[rank - 1]
  const isFirst = rank === 1

  return (
    <motion.div
      className={`flex flex-col items-center ${isFirst ? 'order-first md:-mt-4' : rank === 2 ? 'order-2 md:mt-4' : 'order-3 md:mt-4'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (3 - rank) * 0.15 }}
    >
      <div className={`relative ${isCurrentUser ? 'ring-2 ring-[#0D7377] ring-offset-2 ring-offset-[#FFF8F0] rounded-2xl p-1' : ''}`}>
        <Avatar className={`${medal.size} ring-4 ${medal.ring}`}>
          <AvatarFallback className={`${medal.bg} ${medal.text} text-xl font-bold`}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        {/* Crown for first place */}
        {isFirst && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Crown className="w-6 h-6 text-[#D4A843]" />
          </div>
        )}
      </div>
      <div className={`mt-2 ${medal.bg} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${medal.text}`}>
        {rank}
      </div>
      <div className="text-center mt-1">
        <div className={`text-sm font-semibold text-[#1B3A4B] ${isCurrentUser ? 'text-[#0D7377]' : ''}`}>
          {user.name}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{user.school}</div>
        <Badge className={`mt-1 text-[10px] border-0`} style={{ backgroundColor: `${level.color}20`, color: level.color }}>
          <LevelIcon className="w-3 h-3 mr-0.5" />
          {level.name.replace('_', ' ')}
        </Badge>
        <div className="text-sm font-bold text-[#1B3A4B] mt-1">{user.xp.toLocaleString()} XP</div>
      </div>
    </motion.div>
  )
}

// ============================================================
// LEADERBOARD ROW
// ============================================================

function LeaderboardRow({ user, rank, category, currentUserId }: { user: LeaderboardUser; rank: number; category: string; currentUserId: string }) {
  const level = getLevelForXP(user.xp)
  const LevelIcon = level.icon
  const isCurrentUser = user.id === currentUserId

  const getValue = () => {
    switch (category) {
      case 'conferences': return `${user.conferences} conferences`
      case 'diplomacy': return `${user.diplomacy} pts`
      case 'research': return `${user.research} pts`
      default: return `${user.xp.toLocaleString()} XP`
    }
  }

  return (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
        isCurrentUser
          ? 'bg-[#0D7377]/8 border border-[#0D7377]/20'
          : 'hover:bg-[#F5F0EB]'
      }`}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(rank * 0.04, 0.8) }}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        rank <= 3 ? (
          rank === 1 ? 'bg-[#D4A843]/15 text-[#D4A843]' :
          rank === 2 ? 'bg-gray-200 text-gray-600' :
          'bg-amber-100 text-amber-700'
        ) : 'bg-[#F5F0EB] text-muted-foreground'
      }`}>
        {rank}
      </div>

      <Avatar className="w-9 h-9 shrink-0">
        <AvatarFallback className={`text-xs font-semibold ${isCurrentUser ? 'bg-[#0D7377]/20 text-[#0D7377]' : 'bg-[#0D7377]/10 text-[#0D7377]'}`}>
          {user.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${isCurrentUser ? 'text-[#0D7377]' : 'text-[#1B3A4B]'}`}>
            {user.name}
          </span>
          {isCurrentUser && (
            <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 text-[9px] shrink-0">You</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">{user.school}</div>
      </div>

      <Badge className={`text-[10px] border-0 shrink-0`} style={{ backgroundColor: `${level.color}20`, color: level.color }}>
        <LevelIcon className="w-3 h-3 mr-0.5" />
        {level.name.replace('_', ' ')}
      </Badge>

      <div className="text-right shrink-0 min-w-[70px]">
        <div className="text-sm font-bold text-[#1B3A4B]">{getValue()}</div>
      </div>
    </motion.div>
  )
}

// ============================================================
// CATEGORY LEADERBOARD
// ============================================================

function CategoryLeaderboard({ category, users, currentUserId }: { category: string; users: LeaderboardUser[]; currentUserId: string }) {
  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      switch (category) {
        case 'conferences': return b.conferences - a.conferences
        case 'diplomacy': return b.diplomacy - a.diplomacy
        case 'research': return b.research - a.research
        default: return b.xp - a.xp
      }
    })
  }, [category, users])

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-1 pr-2">
        {sorted.map((user, i) => (
          <LeaderboardRow key={user.id} user={user} rank={i + 1} category={category} currentUserId={currentUserId} />
        ))}
      </div>
    </ScrollArea>
  )
}

// ============================================================
// MAIN LEADERBOARD VIEW
// ============================================================

export default function LeaderboardView() {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('global')
  const [apiUsers, setApiUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/gamification?action=leaderboard')
        if (res.ok) {
          const data = await res.json()
          const leaderboardData = data.data && Array.isArray(data.data) ? data.data : []
          if (leaderboardData.length > 0) {
            setApiUsers(leaderboardData.map((entry: Record<string, unknown>) => {
              const userData = (entry.user as Record<string, unknown>) || {}
              const schoolData = (userData.school as Record<string, unknown>) || {}
              return {
                id: String(userData.id || entry.id || Math.random()),
                name: String(userData.name || 'Unknown'),
                school: String(schoolData.name || ''),
                xp: Number(entry.xp || 0),
                conferences: Number(entry.conferencesAttended || 0),
                diplomacy: Number(entry.awardsReceived || 0),
                research: Number(entry.resolutionsWritten || 0),
              }
            }))
          }
        }
      } catch {
        // API not available, use mock data
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const allUsers = apiUsers
  const currentUserId = user?.id || ''
  const userSchool = user?.schoolName || ''

  const filteredUsers = useMemo(() => {
    let filtered = allUsers
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) || u.school.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [searchQuery])

  const schoolUsers = useMemo(() => {
    return filteredUsers.filter(u => u.school === userSchool)
  }, [filteredUsers, userSchool])

  const globalSorted = useMemo(() => {
    return [...filteredUsers].sort((a, b) => b.xp - a.xp)
  }, [filteredUsers])

  const top3 = globalSorted.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-[#1B3A4B]">Leaderboard</h2>
        <p className="text-muted-foreground mt-1">Compete with delegates worldwide and climb the ranks</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search delegates or schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#F5F0EB] border-0 focus-visible:ring-[#0D7377]/20"
          />
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-[#E8DED0]/60 bg-gradient-to-b from-[#FFF8F0] to-[#F5F0EB]">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* 2nd place */}
              {top3[1] && <PodiumCard user={top3[1]} rank={2} currentUserId={currentUserId} />}
              {/* 1st place */}
              {top3[0] && <PodiumCard user={top3[0]} rank={1} currentUserId={currentUserId} />}
              {/* 3rd place */}
              {top3[2] && <PodiumCard user={top3[2]} rank={3} currentUserId={currentUserId} />}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Your Position Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-[#0D7377]/20 bg-[#0D7377]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0D7377]/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#0D7377]" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#1B3A4B]">Your Position: <span className="text-[#0D7377] font-bold">
                  {globalSorted.findIndex(u => u.id === currentUserId) >= 0 ? `#${globalSorted.findIndex(u => u.id === currentUserId) + 1}` : 'Unranked'}
                </span> of {globalSorted.length}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{user?.name || 'You'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#0D7377]">0 XP</div>
                <div className="text-[10px] text-muted-foreground">Start your journey!</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#F5F0EB]">
            <TabsTrigger value="global" className="data-[state=active]:bg-white data-[state=active]:text-[#0D7377]">
              <Globe className="w-4 h-4 mr-1.5" /> Global
            </TabsTrigger>
            <TabsTrigger value="school" className="data-[state=active]:bg-white data-[state=active]:text-[#0D7377]">
              <Building2 className="w-4 h-4 mr-1.5" /> My School
            </TabsTrigger>
            <TabsTrigger value="xp" className="data-[state=active]:bg-white data-[state=active]:text-[#0D7377]">
              <Zap className="w-4 h-4 mr-1.5" /> XP
            </TabsTrigger>
            <TabsTrigger value="conferences" className="data-[state=active]:bg-white data-[state=active]:text-[#0D7377] hidden sm:flex">
              <Globe className="w-4 h-4 mr-1.5" /> Conferences
            </TabsTrigger>
            <TabsTrigger value="diplomacy" className="data-[state=active]:bg-white data-[state=active]:text-[#0D7377] hidden sm:flex">
              <Shield className="w-4 h-4 mr-1.5" /> Diplomacy
            </TabsTrigger>
            <TabsTrigger value="research" className="data-[state=active]:bg-white data-[state=active]:text-[#0D7377] hidden sm:flex">
              <Search className="w-4 h-4 mr-1.5" /> Research
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-4">
            <Card className="border-[#E8DED0]/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-[#1B3A4B]">Global Rankings</CardTitle>
                  <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 text-xs">{filteredUsers.length} delegates</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CategoryLeaderboard category="xp" users={filteredUsers} currentUserId={currentUserId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="school" className="mt-4">
            <Card className="border-[#E8DED0]/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-[#1B3A4B]">{userSchool}</CardTitle>
                  <Badge className="bg-[#D4A843]/15 text-[#D4A843] border-0 text-xs">{schoolUsers.length} delegates</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {schoolUsers.length > 0 ? (
                  <CategoryLeaderboard category="xp" users={schoolUsers} currentUserId={currentUserId} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No delegates from your school on the leaderboard yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="xp" className="mt-4">
            <Card className="border-[#E8DED0]/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#1B3A4B]">XP Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryLeaderboard category="xp" users={filteredUsers} currentUserId={currentUserId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conferences" className="mt-4">
            <Card className="border-[#E8DED0]/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#1B3A4B]">Conference Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryLeaderboard category="conferences" users={filteredUsers} currentUserId={currentUserId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diplomacy" className="mt-4">
            <Card className="border-[#E8DED0]/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#1B3A4B]">Diplomacy Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryLeaderboard category="diplomacy" users={filteredUsers} currentUserId={currentUserId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="mt-4">
            <Card className="border-[#E8DED0]/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#1B3A4B]">Research Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryLeaderboard category="research" users={filteredUsers} currentUserId={currentUserId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
