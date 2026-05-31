import { hash, compare } from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword)
}

/**
 * Get the current authenticated user from the server session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

/**
 * Require a specific role - throws if user doesn't have the required role
 * MASTER_ADMIN bypasses all role checks
 */
export async function requireRole(role: string) {
  const user = await requireAuth()
  if (isMasterAdmin(user.role)) return user
  if (user.role !== role) {
    throw new Error(`Role '${role}' required. You have role '${user.role}'.`)
  }
  return user
}

/**
 * Require one of several roles - throws if user doesn't have any of the required roles
 * MASTER_ADMIN bypasses all role checks
 */
export async function requireAnyRole(roles: string[]) {
  const user = await requireAuth()
  if (isMasterAdmin(user.role)) return user
  if (!roles.includes(user.role)) {
    throw new Error(
      `One of roles [${roles.join(", ")}] required. You have role '${user.role}'.`
    )
  }
  return user
}

/**
 * Check if a user has admin-level privileges
 * MASTER_ADMIN > FOUNDER > SUPER_ADMIN > ADMIN
 */
export function isAdmin(role: string): boolean {
  return ["MASTER_ADMIN", "FOUNDER", "SUPER_ADMIN", "ADMIN"].includes(role)
}

/**
 * Check if a user is the MASTER_ADMIN (highest authority - sole platform owner)
 */
export function isMasterAdmin(role: string): boolean {
  return role === "MASTER_ADMIN"
}

/**
 * Check if a user is a FOUNDER or above
 */
export function isFounderOrAbove(role: string): boolean {
  return ["MASTER_ADMIN", "FOUNDER"].includes(role)
}

/**
 * Check if a user is a SUPER_ADMIN or above
 */
export function isSuperAdminOrAbove(role: string): boolean {
  return ["MASTER_ADMIN", "FOUNDER", "SUPER_ADMIN"].includes(role)
}

/**
 * Check if a user has teacher-level or above privileges
 */
export function isTeacherOrAbove(role: string): boolean {
  return ["TEACHER", "ADMIN", "SUPER_ADMIN", "FOUNDER", "MASTER_ADMIN", "SCHOOL_ADMIN"].includes(role)
}

/**
 * Check if a user can manage conferences
 */
export function canManageConferences(role: string): boolean {
  return isTeacherOrAbove(role)
}

/**
 * Check if a user can create courses
 */
export function canCreateCourses(role: string): boolean {
  return isAdmin(role)
}

/**
 * Check if a user can access admin dashboard
 */
export function canAccessAdmin(role: string): boolean {
  return isAdmin(role)
}

/**
 * Check if a user can access the Founder Command Center
 */
export function canAccessFounderDashboard(role: string): boolean {
  return isSuperAdminOrAbove(role)
}

/**
 * Check if a user has MASTER_ADMIN-level privileges
 * Only MASTER_ADMIN can: create other MASTER_ADMIN accounts, change MASTER_ADMIN roles,
 * delete MASTER_ADMIN accounts, access all platform settings
 */
export function canManageMasterAdmin(role: string): boolean {
  return isMasterAdmin(role)
}

/**
 * Role hierarchy for comparison
 * MASTER_ADMIN > FOUNDER > SUPER_ADMIN > ADMIN > SCHOOL_ADMIN > TEACHER > STUDENT
 */
const ROLE_HIERARCHY: Record<string, number> = {
  STUDENT: 1,
  TEACHER: 2,
  SCHOOL_ADMIN: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
  FOUNDER: 6,
  MASTER_ADMIN: 7,
}

/**
 * Check if a user's role is at least the specified level
 */
export function hasMinRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

/**
 * Permissions Matrix
 * Defines what each role can do within the platform.
 * MASTER_ADMIN has unrestricted access to everything.
 */
export const PERMISSIONS_MATRIX: Record<string, Record<string, boolean>> = {
  MASTER_ADMIN: {
    // User Management
    createUsers: true,
    editUsers: true,
    deleteUsers: true,
    suspendUsers: true,
    changeUserPasswords: true,
    forcePasswordResets: true,
    viewUserActivity: true,
    viewLoginHistory: true,
    assignRoles: true,
    modifyRoles: true,
    manageMasterAdmin: true,
    // Role & Subscription Management
    upgradeSubscriptions: true,
    downgradeSubscriptions: true,
    overrideAccessRestrictions: true,
    grantCustomPermissions: true,
    manageAllTiers: true,
    // Password Recovery & Notifications
    receivePasswordResetNotifications: true,
    manuallyResetPasswords: true,
    internalPasswordRecovery: true,
    // School & Organization Management
    createSchools: true,
    editSchools: true,
    approveSchools: true,
    suspendSchools: true,
    removeSchools: true,
    transferOwnership: true,
    manageSchoolData: true,
    // Platform Administration
    accessAllDashboards: true,
    accessAnalytics: true,
    accessReports: true,
    accessSettings: true,
    accessSystemLogs: true,
    managePlatformConfig: true,
    controlFeatureFlags: true,
    manageContent: true,
    manageEvents: true,
    manageRegistrations: true,
    exportData: true,
    viewAuditLogs: true,
    manageWebhooks: true,
    manageBilling: true,
  },
  FOUNDER: {
    createUsers: true, editUsers: true, deleteUsers: true, suspendUsers: true,
    changeUserPasswords: true, forcePasswordResets: true, viewUserActivity: true,
    viewLoginHistory: true, assignRoles: true, modifyRoles: true, manageMasterAdmin: false,
    upgradeSubscriptions: true, downgradeSubscriptions: true, overrideAccessRestrictions: true,
    grantCustomPermissions: true, manageAllTiers: true,
    receivePasswordResetNotifications: true, manuallyResetPasswords: true, internalPasswordRecovery: true,
    createSchools: true, editSchools: true, approveSchools: true, suspendSchools: true,
    removeSchools: true, transferOwnership: true, manageSchoolData: true,
    accessAllDashboards: true, accessAnalytics: true, accessReports: true,
    accessSettings: true, accessSystemLogs: true, managePlatformConfig: true,
    controlFeatureFlags: true, manageContent: true, manageEvents: true,
    manageRegistrations: true, exportData: true, viewAuditLogs: true,
    manageWebhooks: true, manageBilling: true,
  },
  SUPER_ADMIN: {
    createUsers: true, editUsers: true, deleteUsers: false, suspendUsers: true,
    changeUserPasswords: true, forcePasswordResets: true, viewUserActivity: true,
    viewLoginHistory: true, assignRoles: false, modifyRoles: true, manageMasterAdmin: false,
    upgradeSubscriptions: true, downgradeSubscriptions: false, overrideAccessRestrictions: true,
    grantCustomPermissions: false, manageAllTiers: true,
    receivePasswordResetNotifications: true, manuallyResetPasswords: true, internalPasswordRecovery: true,
    createSchools: true, editSchools: true, approveSchools: true, suspendSchools: true,
    removeSchools: false, transferOwnership: false, manageSchoolData: true,
    accessAllDashboards: true, accessAnalytics: true, accessReports: true,
    accessSettings: true, accessSystemLogs: true, managePlatformConfig: true,
    controlFeatureFlags: false, manageContent: true, manageEvents: true,
    manageRegistrations: true, exportData: true, viewAuditLogs: true,
    manageWebhooks: true, manageBilling: true,
  },
  ADMIN: {
    createUsers: false, editUsers: true, deleteUsers: false, suspendUsers: false,
    changeUserPasswords: false, forcePasswordResets: false, viewUserActivity: true,
    viewLoginHistory: false, assignRoles: false, modifyRoles: false, manageMasterAdmin: false,
    upgradeSubscriptions: false, downgradeSubscriptions: false, overrideAccessRestrictions: false,
    grantCustomPermissions: false, manageAllTiers: false,
    receivePasswordResetNotifications: false, manuallyResetPasswords: false, internalPasswordRecovery: false,
    createSchools: false, editSchools: true, approveSchools: false, suspendSchools: false,
    removeSchools: false, transferOwnership: false, manageSchoolData: true,
    accessAllDashboards: true, accessAnalytics: true, accessReports: true,
    accessSettings: true, accessSystemLogs: false, managePlatformConfig: false,
    controlFeatureFlags: false, manageContent: true, manageEvents: true,
    manageRegistrations: true, exportData: false, viewAuditLogs: false,
    manageWebhooks: false, manageBilling: false,
  },
  SCHOOL_ADMIN: {
    createUsers: false, editUsers: true, deleteUsers: false, suspendUsers: false,
    changeUserPasswords: false, forcePasswordResets: false, viewUserActivity: false,
    viewLoginHistory: false, assignRoles: false, modifyRoles: false, manageMasterAdmin: false,
    upgradeSubscriptions: false, downgradeSubscriptions: false, overrideAccessRestrictions: false,
    grantCustomPermissions: false, manageAllTiers: false,
    receivePasswordResetNotifications: false, manuallyResetPasswords: false, internalPasswordRecovery: false,
    createSchools: false, editSchools: true, approveSchools: false, suspendSchools: false,
    removeSchools: false, transferOwnership: false, manageSchoolData: true,
    accessAllDashboards: false, accessAnalytics: true, accessReports: true,
    accessSettings: true, accessSystemLogs: false, managePlatformConfig: false,
    controlFeatureFlags: false, manageContent: false, manageEvents: true,
    manageRegistrations: true, exportData: false, viewAuditLogs: false,
    manageWebhooks: false, manageBilling: false,
  },
  TEACHER: {
    createUsers: false, editUsers: false, deleteUsers: false, suspendUsers: false,
    changeUserPasswords: false, forcePasswordResets: false, viewUserActivity: false,
    viewLoginHistory: false, assignRoles: false, modifyRoles: false, manageMasterAdmin: false,
    upgradeSubscriptions: false, downgradeSubscriptions: false, overrideAccessRestrictions: false,
    grantCustomPermissions: false, manageAllTiers: false,
    receivePasswordResetNotifications: false, manuallyResetPasswords: false, internalPasswordRecovery: false,
    createSchools: false, editSchools: false, approveSchools: false, suspendSchools: false,
    removeSchools: false, transferOwnership: false, manageSchoolData: false,
    accessAllDashboards: false, accessAnalytics: false, accessReports: true,
    accessSettings: true, accessSystemLogs: false, managePlatformConfig: false,
    controlFeatureFlags: false, manageContent: false, manageEvents: true,
    manageRegistrations: true, exportData: false, viewAuditLogs: false,
    manageWebhooks: false, manageBilling: false,
  },
  STUDENT: {
    createUsers: false, editUsers: false, deleteUsers: false, suspendUsers: false,
    changeUserPasswords: false, forcePasswordResets: false, viewUserActivity: false,
    viewLoginHistory: false, assignRoles: false, modifyRoles: false, manageMasterAdmin: false,
    upgradeSubscriptions: false, downgradeSubscriptions: false, overrideAccessRestrictions: false,
    grantCustomPermissions: false, manageAllTiers: false,
    receivePasswordResetNotifications: false, manuallyResetPasswords: false, internalPasswordRecovery: false,
    createSchools: false, editSchools: false, approveSchools: false, suspendSchools: false,
    removeSchools: false, transferOwnership: false, manageSchoolData: false,
    accessAllDashboards: false, accessAnalytics: false, accessReports: false,
    accessSettings: true, accessSystemLogs: false, managePlatformConfig: false,
    controlFeatureFlags: false, manageContent: false, manageEvents: false,
    manageRegistrations: false, exportData: false, viewAuditLogs: false,
    manageWebhooks: false, manageBilling: false,
  },
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: string): boolean {
  // MASTER_ADMIN always has all permissions
  if (isMasterAdmin(role)) return true
  return PERMISSIONS_MATRIX[role]?.[permission] ?? false
}
