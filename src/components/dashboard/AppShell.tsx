'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Menu, X, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import Sidebar from './Sidebar'
import StudentDashboard from './StudentDashboard'
import TeacherDashboard from './TeacherDashboard'
import AssessmentQuiz from '@/components/assessment/AssessmentQuiz'
import TrainingHub from '@/components/training/TrainingHub'
import ConferenceManager from '@/components/conferences/ConferenceManager'
import ChatView from '@/components/chat/ChatView'
import AnalyticsView from '@/components/analytics/AnalyticsView'
import LeaderboardView from '@/components/gamification/LeaderboardView'
import ResearchPaperEvaluation from '@/components/research/ResearchPaperEvaluation'
import CodeOfConduct from '@/components/conduct/CodeOfConduct'
import PricingPage from '@/components/pricing/PricingPage'
import SettingsView from '@/components/settings/SettingsView'
import FounderDashboard from '@/components/founder/FounderDashboard'
import SchoolDirectory from '@/components/schools/SchoolDirectory'
import { useNavStore, useAuthStore, useAppStore, type ViewName } from '@/lib/store'

// ============================================================
// PLACEHOLDER VIEW COMPONENTS (for views not yet implemented)
// ============================================================

function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#0D7377]/10 flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-[#0D7377]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1B3A4B]">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-md">{description}</p>
        <p className="text-sm text-muted-foreground mt-4">This feature is currently in development</p>
      </motion.div>
    </div>
  )
}

// ============================================================
// VIEW ROUTER
// ============================================================

function ViewRouter({ view }: { view: ViewName }) {
  const { user } = useAuthStore()

  const isStudent = user?.role === 'STUDENT'
  const isFounderOrSuperAdmin = user?.role === 'FOUNDER' || user?.role === 'SUPER_ADMIN'

  switch (view) {
    case 'dashboard':
      return isStudent ? <StudentDashboard /> : <TeacherDashboard />
    case 'assessment':
      return <AssessmentQuiz />
    case 'training':
      return <TrainingHub />
    case 'conferences':
      return <ConferenceManager />
    case 'committees':
      return <PlaceholderView title="Committees" description="Manage committee assignments, topics, and delegate placements." />
    case 'chat':
      return <ChatView />
    case 'research':
      return <ResearchPaperEvaluation />
    case 'analytics':
      return <AnalyticsView />
    case 'settings':
      return <SettingsView />
    case 'pricing':
      return <PricingPage />
    case 'conduct':
      return <CodeOfConduct />
    case 'profile':
      return <SettingsView />
    case 'leaderboard':
      return <LeaderboardView />
    case 'notifications':
      return <PlaceholderView title="Notifications" description="Stay updated on conferences, training, and achievements." />
    case 'founder':
      if (!isFounderOrSuperAdmin) {
        return <PlaceholderView title="Access Denied" description="The Command Center is only accessible to founders and super admins." />
      }
      return <FounderDashboard />
    case 'schools':
      return <SchoolDirectory />
    default:
      return isStudent ? <StudentDashboard /> : <TeacherDashboard />
  }
}

// ============================================================
// APP SHELL
// ============================================================

export default function AppShell() {
  const { currentView } = useNavStore()
  const { user, logout } = useAuthStore()
  const { notifications, searchQuery, setSearchQuery, sidebarCollapsed, toggleSidebar, markNotificationRead } = useAppStore()
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Trial banner logic
  const isOnTrial = user?.subscriptionStatus === 'TRIAL'
  const trialEndsAt = user?.subscriptionTier === 'FREE' ? null : undefined
  const [trialTimeLeft, setTrialTimeLeft] = React.useState<string>('')

  React.useEffect(() => {
    if (!isOnTrial) return
    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/subscriptions')
        if (res.ok) {
          const data = await res.json()
          const endsAt = data.data?.trialEndsAt
          if (endsAt) {
            const updateTimer = () => {
              const now = new Date().getTime()
              const end = new Date(endsAt).getTime()
              const diff = end - now
              if (diff <= 0) {
                setTrialTimeLeft('Expired')
                return
              }
              const hours = Math.floor(diff / (1000 * 60 * 60))
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
              const seconds = Math.floor((diff % (1000 * 60)) / 1000)
              if (hours > 0) {
                setTrialTimeLeft(`${hours}h ${minutes}m remaining`)
              } else {
                setTrialTimeLeft(`${minutes}m ${seconds}s remaining`)
              }
            }
            updateTimer()
            const interval = setInterval(updateTimer, 1000)
            return () => clearInterval(interval)
          }
        }
      } catch {
        // silently fail
      }
    }
    fetchSubscription()
  }, [isOnTrial])

  // Session is already managed by auth store

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF8F0]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <Sidebar onMobileClose={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#E8DED0] bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#1B3A4B]"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conferences, courses, delegates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#F5F0EB] border-0 focus-visible:ring-[#0D7377]/20 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-[#1B3A4B]">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#0D7377] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Badge className="bg-[#0D7377]/10 text-[#0D7377] text-[10px] border-0">
                      {unreadCount} new
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-[#0D7377]'}`} />
                        <span className="text-sm font-medium">{notif.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground pl-4">{notif.message}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* User Avatar & Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="w-8 h-8 border-2 border-[#0D7377]/20">
                    <AvatarFallback className="bg-[#0D7377]/10 text-[#0D7377] text-xs font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-[#1B3A4B]">{user.name.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => useNavStore.getState().navigate('profile')}>
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => useNavStore.getState().navigate('settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={async () => { await logout(); useNavStore.getState().navigate('landing'); window.location.href = '/' }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content area */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar ${currentView === 'chat' ? 'flex flex-col' : ''}`}>
          {/* Trial Banner */}
          {isOnTrial && trialTimeLeft && (
            <div className="bg-[#D4A843]/10 border-b border-[#D4A843]/20 px-4 md:px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D4A843] rounded-full animate-pulse" />
                <span className="text-sm text-[#1B3A4B]">
                  <strong>24-Hour Free Trial</strong> — {trialTimeLeft}
                  <span className="text-[#1B3A4B]/50 ml-2">Restricted access: basic courses & limited assessments only</span>
                </span>
              </div>
              <Button
                size="sm"
                className="bg-[#D4A843] text-[#0D1B2A] hover:bg-[#E0BC6A] font-semibold text-xs h-7 shadow-sm"
                onClick={() => useNavStore.getState().navigate('pricing')}
              >
                Upgrade Now
              </Button>
            </div>
          )}
          <div className={currentView === 'chat' ? 'flex-1 flex flex-col p-2 md:p-3 min-h-0' : 'p-4 md:p-6 lg:p-8 max-w-7xl mx-auto'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className={currentView === 'chat' ? 'flex-1 min-h-0' : ''}
              >
                <ViewRouter view={currentView} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
