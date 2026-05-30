'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Home, ClipboardCheck, BookOpen, Building2, MessageSquare,
  Search, BarChart3, Settings, Users, Trophy, FileText,
  LogOut, ChevronLeft, ChevronRight, Shield, Crown, Star, Flame, FileSearch
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useNavStore, useAuthStore, useAppStore, type ViewName, getCurrentLevel, getNextLevel, getXPProgress } from '@/lib/store'

// ============================================================
// NAV CONFIG - Role-based items
// ============================================================

interface NavItem {
  id: ViewName
  label: string
  icon: React.ElementType
}

const STUDENT_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
  { id: 'training', label: 'Training', icon: BookOpen },
  { id: 'conferences', label: 'Conferences', icon: Building2 },
  { id: 'schools', label: 'Schools', icon: Building2 },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'research', label: 'Research Lab', icon: FileSearch },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

const TEACHER_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'assessment', label: 'Assessment', icon: ClipboardCheck },
  { id: 'training', label: 'Training', icon: BookOpen },
  { id: 'conferences', label: 'Conferences', icon: Building2 },
  { id: 'schools', label: 'Schools', icon: Building2 },
  { id: 'committees', label: 'Committees', icon: Shield },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'research', label: 'Research Lab', icon: FileSearch },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const ADMIN_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'conferences', label: 'Conferences', icon: Building2 },
  { id: 'settings', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const SUPER_ADMIN_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'founder', label: 'Command Center', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'conferences', label: 'Conferences', icon: Building2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'FOUNDER':
    case 'SUPER_ADMIN': return SUPER_ADMIN_NAV
    case 'TEACHER': return TEACHER_NAV
    case 'ADMIN':
    case 'SCHOOL_ADMIN': return ADMIN_NAV
    default: return STUDENT_NAV
  }
}

// ============================================================
// SUBSCRIPTION BADGE
// ============================================================

function SubscriptionBadge({ tier }: { tier: string }) {
  const config: Record<string, { label: string; className: string }> = {
    FREE: { label: 'Free', className: 'bg-white/10 text-white/60' },
    DELEGATE_PRO: { label: 'Pro', className: 'bg-[#0D7377]/20 text-[#0D7377]' },
    DIRECTOR_PRO: { label: 'Pro', className: 'bg-[#0D7377]/20 text-[#0D7377]' },
    SCHOOL_ENTERPRISE: { label: 'Enterprise', className: 'bg-[#D4A843]/20 text-[#D4A843]' },
  }
  const c = config[tier] || config.FREE
  return <Badge className={`text-[10px] px-2 py-0.5 border-0 ${c.className}`}>{c.label}</Badge>
}

// ============================================================
// MUN ROLE DISPLAY
// ============================================================

function getMUNRoleDisplay(munRole?: string): string {
  const map: Record<string, string> = {
    SECRETARY_GENERAL: 'Sec-Gen',
    DIRECTOR_GENERAL: 'Dir-Gen',
    CHAIR: 'Chair',
    DELEGATE: 'Delegate',
    DELEGATE_ADVANCED: 'Adv. Delegate',
    SDG_AMBASSADOR: 'SDG Amb.',
    RAPPORTEUR: 'Rapporteur',
  }
  return map[munRole || ''] || 'Delegate'
}

// ============================================================
// SIDEBAR COMPONENT
// ============================================================

interface SidebarProps {
  onMobileClose?: () => void
}

export default function Sidebar({ onMobileClose }: SidebarProps) {
  const { currentView, navigate } = useNavStore()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar, delegateProfile, badges } = useAppStore()

  if (!user) return null

  const navItems = getNavItems(user.role)
  const xp = delegateProfile?.xp || 0
  const currentLevel = getCurrentLevel(xp)
  const nextLevel = getNextLevel(xp)
  const xpProgress = getXPProgress(xp)
  const recentBadges = badges.slice(0, 3)

  const handleNavClick = (id: ViewName) => {
    navigate(id)
    onMobileClose?.()
  }

  const handleLogout = async () => {
    await logout()
    navigate('landing')
    window.location.href = '/'
  }

  return (
    <motion.aside
      className="h-screen flex flex-col bg-[#1B3A4B] border-r border-white/10 shrink-0 sticky top-0"
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 min-h-[64px]">
        <img src="/logo.svg" alt="DiplomatiQ" className="w-9 h-9 rounded-lg shrink-0" />
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              className="text-lg font-bold text-white tracking-tight whitespace-nowrap overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              Diplomati<span className="text-[#D4A843]">Q</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <Separator className="bg-white/10 mx-3" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id
            return (
              <TooltipProvider key={`${item.id}-${item.label}`} delayDuration={sidebarCollapsed ? 0 : 700}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group ${
                        isActive
                          ? 'bg-[#D4A843]/15 text-[#D4A843] font-medium'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/[0.06]'
                      }`}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Active indicator - gold left border */}
                      {isActive && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#D4A843] rounded-r-full"
                          layoutId="activeIndicator"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#D4A843]' : 'text-white/50 group-hover:text-white/60'}`} />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            className="whitespace-nowrap overflow-hidden"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right" className="bg-[#264B5E] text-white border-white/10">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </ScrollArea>

      {/* Bottom Section - User Profile */}
      <div className="px-3 pb-4">
        <Separator className="bg-white/10 mb-4" />

        {/* XP Progress */}
        <AnimatePresence>
          {!sidebarCollapsed && delegateProfile && (
            <motion.div
              className="mb-3 px-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between text-xs text-white/55 mb-1.5">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#D4A843]" />
                  {currentLevel.name}
                </span>
                <span>{xp.toLocaleString()} XP</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #0D7377, #D4A843)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              {nextLevel && (
                <div className="text-[10px] text-white/45 mt-1 text-right">
                  {(nextLevel.minXP - xp).toLocaleString()} XP to {nextLevel.name}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Badges */}
        <AnimatePresence>
          {!sidebarCollapsed && recentBadges.length > 0 && (
            <motion.div
              className="mb-3 px-2 flex items-center gap-1.5"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {recentBadges.map((badge) => (
                <TooltipProvider key={badge.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-7 h-7 rounded-full bg-[#D4A843]/15 flex items-center justify-center cursor-pointer hover:bg-[#D4A843]/25 transition-colors">
                        <Star className="w-3.5 h-3.5 text-[#D4A843]" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#264B5E] text-white border-white/10">
                      <div className="text-xs font-medium">{badge.name}</div>
                      <div className="text-[10px] text-white/60">{badge.description}</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User info row */}
        <div className="flex items-center gap-3 px-2">
          <Avatar className="w-9 h-9 border-2 border-[#D4A843]/30 shrink-0">
            <AvatarFallback className="bg-[#0D7377]/30 text-[#0D7377] text-sm font-semibold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-sm font-medium text-white truncate">{user.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/55">{getMUNRoleDisplay(user.munRole)}</span>
                  <SubscriptionBadge tier={user.subscriptionTier} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleLogout}
                        className="text-white/45 hover:text-white/60 transition-colors p-1"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#264B5E] text-white border-white/10">
                      Sign out
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1B3A4B] border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white/70 hover:bg-[#264B5E] transition-all z-10"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
