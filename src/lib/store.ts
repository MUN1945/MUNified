import { create } from 'zustand'

// ============================================================
// TYPES
// ============================================================

export type ViewName =
  | 'landing'
  | 'dashboard'
  | 'assessment'
  | 'training'
  | 'conferences'
  | 'committees'
  | 'chat'
  | 'research'
  | 'analytics'
  | 'settings'
  | 'pricing'
  | 'conduct'
  | 'profile'
  | 'leaderboard'
  | 'notifications'
  | 'founder'
  | 'schools'

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SCHOOL_ADMIN' | 'SUPER_ADMIN' | 'FOUNDER'
export type MUNRole = 'SECRETARY_GENERAL' | 'DIRECTOR_GENERAL' | 'CHAIR' | 'DELEGATE' | 'DELEGATE_ADVANCED' | 'SDG_AMBASSADOR' | 'RAPPORTEUR'
export type SubscriptionTier = 'FREE' | 'STUDENT_PRO' | 'TEACHER_PRO' | 'SCHOOL_STARTER' | 'SCHOOL_PROFESSIONAL' | 'SCHOOL_ENTERPRISE' | 'CONFERENCE_PACKAGE'
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
export type XPLevel = 'OBSERVER' | 'DELEGATE' | 'AMBASSADOR' | 'DIPLOMAT' | 'ENVOY' | 'SECRETARY_GENERAL'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  munRole?: MUNRole
  avatar?: string
  schoolId?: string
  schoolName?: string
  country?: string
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus
}

export interface DelegateProfile {
  xp: number
  level: XPLevel
  streak: number
  longestStreak: number
  conferencesAttended: number
  committeesServed: number
  awardsReceived: number
  resolutionsWritten: number
  speechesDelivered: number
}

export interface BadgeData {
  id: string
  name: string
  description?: string
  icon: string
  category: string
  xpReward: number
  earnedAt: string
}

export interface ConferenceData {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  status: string
  theme?: string
}

export interface CommitteeData {
  id: string
  name: string
  type: string
  topic?: string
  conferenceId: string
}

export interface CourseData {
  id: string
  title: string
  description?: string
  category: string
  difficulty: string
  duration?: number
  progress: number
  xpReward: number
}

export interface AssessmentData {
  id: string
  type: string
  totalScore: number
  completedAt: string
  recommendedRole?: string
}

export interface NotificationData {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  link?: string
}

export interface ActivityData {
  id: string
  type: string
  description: string
  xpEarned: number
  createdAt: string
}

export interface ChannelData {
  id: string
  name: string
  type: string
  description?: string
}

export interface MessageData {
  id: string
  content: string
  channelId: string
  userId: string
  userName: string
  createdAt: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  xp: number
  level: XPLevel
  school?: string
}

// ============================================================
// XP LEVELS CONFIG
// ============================================================

export const XP_LEVELS: { name: XPLevel; minXP: number; color: string }[] = [
  { name: 'OBSERVER', minXP: 0, color: '#94A3B8' },
  { name: 'DELEGATE', minXP: 500, color: '#0D7377' },
  { name: 'AMBASSADOR', minXP: 2000, color: '#D4A843' },
  { name: 'DIPLOMAT', minXP: 5000, color: '#059669' },
  { name: 'ENVOY', minXP: 10000, color: '#A78BFA' },
  { name: 'SECRETARY_GENERAL', minXP: 20000, color: '#F59E0B' },
]

export function getCurrentLevel(xp: number): { name: XPLevel; minXP: number; color: string } {
  let level = XP_LEVELS[0]
  for (const l of XP_LEVELS) {
    if (xp >= l.minXP) level = l
    else break
  }
  return level
}

export function getNextLevel(xp: number): { name: XPLevel; minXP: number; color: string } | null {
  const current = getCurrentLevel(xp)
  const idx = XP_LEVELS.findIndex(l => l.name === current.name)
  if (idx < XP_LEVELS.length - 1) return XP_LEVELS[idx + 1]
  return null
}

export function getXPProgress(xp: number): number {
  const current = getCurrentLevel(xp)
  const next = getNextLevel(xp)
  if (!next) return 100
  return Math.min(((xp - current.minXP) / (next.minXP - current.minXP)) * 100, 100)
}

// ============================================================
// NAV STORE - View routing
// ============================================================

interface NavState {
  currentView: ViewName
  previousView: ViewName | null
}

interface NavActions {
  navigate: (view: ViewName) => void
  goBack: () => void
}

export const useNavStore = create<NavState & NavActions>((set) => ({
  currentView: 'landing',
  previousView: null,
  navigate: (view) => set((state) => ({ previousView: state.currentView, currentView: view })),
  goBack: () => set((state) => {
    if (state.previousView) {
      return { currentView: state.previousView, previousView: null }
    }
    return state
  }),
}))

// ============================================================
// AUTH STORE - Authentication state (production — no demo fallbacks)
// ============================================================

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  showAuthModal: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  setShowAuthModal: (show: boolean) => void
  clearError: () => void
  checkSession: () => Promise<void>
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
  school?: string
  country?: string
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  showAuthModal: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }),
      })
      if (res.ok) {
        // Fetch session
        const sessionRes = await fetch('/api/auth/session')
        if (sessionRes.ok) {
          const session = await sessionRes.json()
          if (session?.user) {
            set({
              user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role as UserRole,
                munRole: session.user.munRole as MUNRole | undefined,
                avatar: session.user.avatar,
                schoolId: session.user.schoolId,
                subscriptionTier: session.user.subscriptionTier as SubscriptionTier,
                subscriptionStatus: session.user.subscriptionStatus as SubscriptionStatus,
              },
              isAuthenticated: true,
              isLoading: false,
              showAuthModal: false,
            })
            return
          }
        }
      }
      // NO DEMO FALLBACK — show error
      set({
        isLoading: false,
        error: 'Invalid email or password. Please try again.',
      })
    } catch {
      set({
        isLoading: false,
        error: 'Unable to connect to server. Please check your connection.',
      })
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (res.ok && result?.user) {
        // Auto-login after registration
        const loginRes = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ email: data.email, password: data.password }),
        })
        if (loginRes.ok) {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const session = await sessionRes.json()
            if (session?.user) {
              set({
                user: {
                  id: session.user.id,
                  name: session.user.name,
                  email: session.user.email,
                  role: session.user.role as UserRole,
                  subscriptionTier: session.user.subscriptionTier as SubscriptionTier,
                  subscriptionStatus: session.user.subscriptionStatus as SubscriptionStatus,
                },
                isAuthenticated: true,
                isLoading: false,
                showAuthModal: false,
              })
              return
            }
          }
        }
        // If auto-login fails, set from registration result
        set({
          user: {
            id: result.user.id,
            name: result.user.name || data.name,
            email: result.user.email || data.email,
            role: data.role,
            subscriptionTier: 'FREE',
            subscriptionStatus: 'TRIAL',
          },
          isAuthenticated: true,
          isLoading: false,
          showAuthModal: false,
        })
      } else {
        set({
          isLoading: false,
          error: result?.error || result?.message || 'Registration failed. Please try again.',
        })
      }
    } catch {
      set({
        isLoading: false,
        error: 'Unable to connect to server. Please check your connection.',
      })
    }
  },

  logout: () => set({
    user: null,
    isAuthenticated: false,
    error: null,
  }),

  setShowAuthModal: (show) => set({ showAuthModal: show }),
  clearError: () => set({ error: null }),

  checkSession: async () => {
    try {
      const sessionRes = await fetch('/api/auth/session')
      if (sessionRes.ok) {
        const session = await sessionRes.json()
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              role: session.user.role as UserRole,
              munRole: session.user.munRole as MUNRole | undefined,
              avatar: session.user.avatar,
              schoolId: session.user.schoolId,
              subscriptionTier: session.user.subscriptionTier as SubscriptionTier,
              subscriptionStatus: session.user.subscriptionStatus as SubscriptionStatus,
            },
            isAuthenticated: true,
            isLoading: false,
          })
          return
        }
      }
      // No valid session
      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

// ============================================================
// APP STORE - Feature data (loaded from API, no demo data)
// ============================================================

interface AppState {
  // Delegate Profile
  delegateProfile: DelegateProfile | null
  // Badges
  badges: BadgeData[]
  // Conferences
  conferences: ConferenceData[]
  // Committees
  committees: CommitteeData[]
  // Courses
  courses: CourseData[]
  // Assessments
  assessments: AssessmentData[]
  // Notifications
  notifications: NotificationData[]
  // Activities
  activities: ActivityData[]
  // Chat
  channels: ChannelData[]
  messages: MessageData[]
  activeChannel: string | null
  // Leaderboard
  leaderboard: LeaderboardEntry[]
  // UI state
  sidebarCollapsed: boolean
  searchQuery: string
}

interface AppActions {
  setDelegateProfile: (profile: DelegateProfile) => void
  setBadges: (badges: BadgeData[]) => void
  setConferences: (conferences: ConferenceData[]) => void
  setCourses: (courses: CourseData[]) => void
  setNotifications: (notifications: NotificationData[]) => void
  setActivities: (activities: ActivityData[]) => void
  setChannels: (channels: ChannelData[]) => void
  setMessages: (messages: MessageData[]) => void
  setActiveChannel: (channelId: string | null) => void
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSearchQuery: (query: string) => void
  markNotificationRead: (id: string) => void
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  delegateProfile: null,
  badges: [],
  conferences: [],
  committees: [],
  courses: [],
  assessments: [],
  notifications: [],
  activities: [],
  channels: [],
  messages: [],
  activeChannel: null,
  leaderboard: [],
  sidebarCollapsed: false,
  searchQuery: '',

  setDelegateProfile: (profile) => set({ delegateProfile: profile }),
  setBadges: (badges) => set({ badges }),
  setConferences: (conferences) => set({ conferences }),
  setCourses: (courses) => set({ courses }),
  setNotifications: (notifications) => set({ notifications }),
  setActivities: (activities) => set({ activities }),
  setChannels: (channels) => set({ channels }),
  setMessages: (messages) => set({ messages }),
  setActiveChannel: (channelId) => set({ activeChannel: channelId }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ),
  })),
}))
