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
 * FOUNDER and SUPER_ADMIN bypass all role checks
 */
export async function requireRole(role: string) {
  const user = await requireAuth()
  if (user.role === "FOUNDER" || user.role === "SUPER_ADMIN") return user
  if (user.role !== role) {
    throw new Error(`Role '${role}' required. You have role '${user.role}'.`)
  }
  return user
}

/**
 * Require one of several roles - throws if user doesn't have any of the required roles
 * FOUNDER and SUPER_ADMIN bypass all role checks
 */
export async function requireAnyRole(roles: string[]) {
  const user = await requireAuth()
  if (user.role === "FOUNDER" || user.role === "SUPER_ADMIN") return user
  if (!roles.includes(user.role)) {
    throw new Error(
      `One of roles [${roles.join(", ")}] required. You have role '${user.role}'.`
    )
  }
  return user
}

/**
 * Check if a user has admin-level privileges
 * FOUNDER > SUPER_ADMIN > ADMIN
 */
export function isAdmin(role: string): boolean {
  return ["FOUNDER", "SUPER_ADMIN", "ADMIN"].includes(role)
}

/**
 * Check if a user is the FOUNDER (highest authority)
 */
export function isFounder(role: string): boolean {
  return role === "FOUNDER"
}

/**
 * Check if a user is a SUPER_ADMIN or above
 */
export function isSuperAdminOrAbove(role: string): boolean {
  return ["FOUNDER", "SUPER_ADMIN"].includes(role)
}

/**
 * Check if a user has teacher-level or above privileges
 */
export function isTeacherOrAbove(role: string): boolean {
  return ["TEACHER", "ADMIN", "SUPER_ADMIN", "FOUNDER", "SCHOOL_ADMIN"].includes(role)
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
 * Role hierarchy for comparison
 * FOUNDER > SUPER_ADMIN > ADMIN > SCHOOL_ADMIN > TEACHER > STUDENT
 */
const ROLE_HIERARCHY: Record<string, number> = {
  STUDENT: 1,
  TEACHER: 2,
  SCHOOL_ADMIN: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
  FOUNDER: 6,
}

/**
 * Check if a user's role is at least the specified level
 */
export function hasMinRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}
