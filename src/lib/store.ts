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

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SCHOOL_ADMIN' | 'SUPER_ADMIN'
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
// DEMO DATA
// ============================================================

const DEMO_STUDENT_USER: User = {
  id: 'demo-student-1',
  name: 'Amara Okafor',
  email: 'amara@diplomatiq.io',
  role: 'STUDENT',
  munRole: 'DELEGATE',
  avatar: undefined,
  schoolId: 'demo-school-1',
  schoolName: 'International School of Geneva',
  country: 'Switzerland',
  subscriptionTier: 'STUDENT_PRO',
  subscriptionStatus: 'ACTIVE',
}

const DEMO_TEACHER_USER: User = {
  id: 'demo-teacher-1',
  name: 'Dr. Sarah Chen',
  email: 'sarah@diplomatiq.io',
  role: 'TEACHER',
  munRole: 'CHAIR',
  avatar: undefined,
  schoolId: 'demo-school-1',
  schoolName: 'International School of Geneva',
  country: 'Switzerland',
  subscriptionTier: 'TEACHER_PRO',
  subscriptionStatus: 'ACTIVE',
}

const DEMO_ADMIN_USER: User = {
  id: 'demo-admin-1',
  name: 'James Wright',
  email: 'james@diplomatiq.io',
  role: 'ADMIN',
  munRole: 'SECRETARY_GENERAL',
  avatar: undefined,
  schoolId: undefined,
  schoolName: 'DiplomatiQ HQ',
  country: 'United States',
  subscriptionTier: 'SCHOOL_ENTERPRISE',
  subscriptionStatus: 'ACTIVE',
}

const DEMO_DELEGATE_PROFILE: DelegateProfile = {
  xp: 2450,
  level: 'AMBASSADOR',
  streak: 7,
  longestStreak: 14,
  conferencesAttended: 8,
  committeesServed: 12,
  awardsReceived: 3,
  resolutionsWritten: 5,
  speechesDelivered: 22,
}

const DEMO_BADGES: BadgeData[] = [
  { id: 'b1', name: 'Skilled Orator', description: 'Delivered 20+ speeches', icon: 'Mic', category: 'ORATORY', xpReward: 200, earnedAt: '2026-02-10' },
  { id: 'b2', name: 'Resolution Writer', description: 'Wrote 5 resolutions', icon: 'FileText', category: 'SKILL_MASTERY', xpReward: 150, earnedAt: '2026-01-28' },
  { id: 'b3', name: 'Diplomat', description: 'Achieved Ambassador rank', icon: 'Handshake', category: 'MILESTONE', xpReward: 500, earnedAt: '2026-01-15' },
  { id: 'b4', name: 'First Steps', description: 'Completed first assessment', icon: 'Footprints', category: 'PARTICIPATION', xpReward: 50, earnedAt: '2024-12-01' },
  { id: 'b5', name: 'Global Delegate', description: 'Attended 5 conferences', icon: 'Globe', category: 'PARTICIPATION', xpReward: 300, earnedAt: '2024-11-20' },
]

const DEMO_CONFERENCES: ConferenceData[] = [
  { id: 'c1', name: 'Harvard WorldMUN 2026', description: 'The world\'s most diverse MUN conference', startDate: '2026-03-15', endDate: '2026-03-19', location: 'Paris, France', status: 'REGISTRATION_OPEN', theme: 'Bridging Divides' },
  { id: 'c2', name: 'NMUN New York 2026', description: 'National Model UN in New York', startDate: '2026-04-07', endDate: '2026-04-11', location: 'New York, USA', status: 'UPCOMING', theme: 'Global Cooperation' },
  { id: 'c3', name: 'RomeMUN 2026', description: 'Diplomacy in the Eternal City', startDate: '2026-05-20', endDate: '2026-05-24', location: 'Rome, Italy', status: 'REGISTRATION_OPEN', theme: 'Sustainable Futures' },
  { id: 'c4', name: 'THIMUN Singapore 2026', description: 'The Hague International MUN', startDate: '2026-06-10', endDate: '2026-06-14', location: 'Singapore', status: 'DRAFT', theme: 'Innovation & Progress' },
]

const DEMO_COURSES: CourseData[] = [
  { id: 'course1', title: 'Advanced Resolution Writing', description: 'Master the art of writing compelling UN resolutions', category: 'Writing', difficulty: 'ADVANCED', duration: 240, progress: 45, xpReward: 100 },
  { id: 'course2', title: 'Crisis Committee Survival Guide', description: 'Navigate high-pressure crisis simulations', category: 'Crisis', difficulty: 'INTERMEDIATE', duration: 180, progress: 0, xpReward: 75 },
  { id: 'course3', title: 'Mastering Parliamentary Procedure', description: 'Learn Robert\'s Rules and UN procedure', category: 'Procedures', difficulty: 'BEGINNER', duration: 300, progress: 78, xpReward: 50 },
  { id: 'course4', title: 'Public Speaking Masterclass', description: 'Command the floor with confidence', category: 'Speaking', difficulty: 'INTERMEDIATE', duration: 200, progress: 62, xpReward: 80 },
]

const DEMO_NOTIFICATIONS: NotificationData[] = [
  { id: 'n1', title: 'New Conference Registration Open', message: 'Harvard WorldMUN 2026 registration is now open!', type: 'info', isRead: false, createdAt: '2026-02-28T10:00:00Z' },
  { id: 'n2', title: 'Badge Earned!', message: 'You earned the "Skilled Orator" badge!', type: 'success', isRead: false, createdAt: '2026-02-27T14:00:00Z' },
  { id: 'n3', title: 'Training Reminder', message: 'Continue your "Advanced Resolution Writing" course', type: 'reminder', isRead: true, createdAt: '2026-02-26T09:00:00Z' },
]

const DEMO_ACTIVITIES: ActivityData[] = [
  { id: 'a1', type: 'course_complete', description: 'Completed "Resolution Writing Masterclass"', xpEarned: 100, createdAt: '2026-02-28T16:00:00Z' },
  { id: 'a2', type: 'badge_earned', description: 'Earned "Skilled Orator" badge', xpEarned: 200, createdAt: '2026-02-28T13:00:00Z' },
  { id: 'a3', type: 'conference_register', description: 'Registered for Harvard WorldMUN 2026', xpEarned: 50, createdAt: '2026-02-27T10:00:00Z' },
  { id: 'a4', type: 'assessment_complete', description: 'Scored 92% on Diplomatic Assessment', xpEarned: 150, createdAt: '2026-02-26T15:00:00Z' },
  { id: 'a5', type: 'committee_join', description: 'Joined Security Council committee', xpEarned: 75, createdAt: '2026-02-25T11:00:00Z' },
]

const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', name: 'Elena Vasquez', xp: 12500, level: 'ENVOY', school: 'Lycee Francais' },
  { rank: 2, userId: 'u2', name: 'Kai Nakamura', xp: 11200, level: 'ENVOY', school: 'Tokyo International' },
  { rank: 3, userId: 'u3', name: 'Fatima Al-Rashid', xp: 9800, level: 'DIPLOMAT', school: 'American School Dubai' },
  { rank: 4, userId: 'demo-student-1', name: 'Amara Okafor', xp: 2450, level: 'AMBASSADOR', school: 'Intl School of Geneva' },
  { rank: 5, userId: 'u5', name: 'Lucas Schmidt', xp: 2100, level: 'AMBASSADOR', school: 'Berlin Intl School' },
  { rank: 6, userId: 'u6', name: 'Priya Sharma', xp: 1800, level: 'DELEGATE', school: 'Delhi Public School' },
  { rank: 7, userId: 'u7', name: 'Oliver Brooks', xp: 1200, level: 'DELEGATE', school: 'Westminster School' },
  { rank: 8, userId: 'u8', name: 'Sofia Costa', xp: 900, level: 'DELEGATE', school: 'St. Paul\'s Brazil' },
  { rank: 9, userId: 'u9', name: 'Chen Wei', xp: 600, level: 'DELEGATE', school: 'Shanghai Intl' },
  { rank: 10, userId: 'u10', name: 'Aisha Mohammed', xp: 300, level: 'OBSERVER', school: 'Cairo English School' },
]

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
// AUTH STORE - Authentication state
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
  demoLogin: (role: UserRole) => void
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        // Try to get session after login
        const sessionRes = await fetch('/api/auth/[...nextauth]')
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
      // Fallback to demo on API failure
      set({
        user: DEMO_STUDENT_USER,
        isAuthenticated: true,
        isLoading: false,
        showAuthModal: false,
      })
    } catch {
      // Demo fallback
      set({
        user: DEMO_STUDENT_USER,
        isAuthenticated: true,
        isLoading: false,
        showAuthModal: false,
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
      if (res.ok) {
        const result = await res.json()
        if (result?.user) {
          set({
            user: {
              id: result.user.id,
              name: result.user.name || data.name,
              email: result.user.email || data.email,
              role: data.role,
              country: data.country,
              subscriptionTier: 'FREE',
              subscriptionStatus: 'TRIAL',
            },
            isAuthenticated: true,
            isLoading: false,
            showAuthModal: false,
          })
          return
        }
      }
      // Demo fallback
      const demoUser: User = {
        id: 'demo-new-user',
        name: data.name,
        email: data.email,
        role: data.role,
        country: data.country,
        subscriptionTier: 'FREE',
        subscriptionStatus: 'TRIAL',
      }
      set({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        showAuthModal: false,
      })
    } catch {
      const demoUser: User = {
        id: 'demo-new-user',
        name: data.name,
        email: data.email,
        role: data.role,
        country: data.country,
        subscriptionTier: 'FREE',
        subscriptionStatus: 'TRIAL',
      }
      set({
        user: demoUser,
        isAuthenticated: true,
        isLoading: false,
        showAuthModal: false,
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

  demoLogin: (role) => {
    const demoUsers: Record<string, User> = {
      STUDENT: DEMO_STUDENT_USER,
      TEACHER: DEMO_TEACHER_USER,
      ADMIN: DEMO_ADMIN_USER,
    }
    set({
      user: demoUsers[role] || DEMO_STUDENT_USER,
      isAuthenticated: true,
      isLoading: false,
      showAuthModal: false,
    })
  },
}))

// ============================================================
// APP STORE - Feature data
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
  loadDemoData: (role: UserRole) => void
}

const TEACHER_STATS_PROFILE: DelegateProfile = {
  xp: 8500,
  level: 'DIPLOMAT',
  streak: 14,
  longestStreak: 30,
  conferencesAttended: 25,
  committeesServed: 40,
  awardsReceived: 10,
  resolutionsWritten: 15,
  speechesDelivered: 60,
}

const ADMIN_STATS_PROFILE: DelegateProfile = {
  xp: 22000,
  level: 'SECRETARY_GENERAL',
  streak: 30,
  longestStreak: 60,
  conferencesAttended: 50,
  committeesServed: 80,
  awardsReceived: 20,
  resolutionsWritten: 30,
  speechesDelivered: 120,
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
  loadDemoData: (role) => {
    const profile = role === 'ADMIN' ? ADMIN_STATS_PROFILE : role === 'TEACHER' ? TEACHER_STATS_PROFILE : DEMO_DELEGATE_PROFILE
    set({
      delegateProfile: profile,
      badges: DEMO_BADGES,
      conferences: DEMO_CONFERENCES,
      committees: [
        { id: 'cm1', name: 'Security Council', type: 'SECURITY_COUNCIL', topic: 'Nuclear Non-Proliferation', conferenceId: 'c1' },
        { id: 'cm2', name: 'General Assembly', type: 'GENERAL_ASSEMBLY', topic: 'Climate Action', conferenceId: 'c1' },
        { id: 'cm3', name: 'ECOSOC', type: 'ECOSOC', topic: 'Global Trade Equity', conferenceId: 'c2' },
      ],
      courses: DEMO_COURSES,
      assessments: [
        { id: 'as1', type: 'DIAGNOSTIC', totalScore: 84, completedAt: '2026-02-15', recommendedRole: 'Head Delegate' },
        { id: 'as2', type: 'SKILL_EVALUATION', totalScore: 78, completedAt: '2026-01-28' },
        { id: 'as3', type: 'ROLE_PLACEMENT', totalScore: 91, completedAt: '2026-01-10', recommendedRole: 'Crisis Committee Member' },
      ],
      notifications: DEMO_NOTIFICATIONS,
      activities: DEMO_ACTIVITIES,
      channels: [
        { id: 'ch1', name: 'General', type: 'general', description: 'General discussion' },
        { id: 'ch2', name: 'Security Council', type: 'committee', description: 'SC delegates chat' },
        { id: 'ch3', name: 'Training Help', type: 'support', description: 'Get help with courses' },
      ],
      messages: [
        { id: 'm1', content: 'Has anyone started the resolution writing assignment?', channelId: 'ch1', userId: 'u1', userName: 'Elena Vasquez', createdAt: '2026-02-28T15:30:00Z' },
        { id: 'm2', content: 'Yes! I found the crisis committee section really helpful.', channelId: 'ch1', userId: 'u2', userName: 'Kai Nakamura', createdAt: '2026-02-28T15:35:00Z' },
        { id: 'm3', content: 'Can someone explain the difference between a working paper and a draft resolution?', channelId: 'ch1', userId: 'demo-student-1', userName: 'Amara Okafor', createdAt: '2026-02-28T15:40:00Z' },
      ],
      activeChannel: 'ch1',
      leaderboard: DEMO_LEADERBOARD,
    })
  },
}))
