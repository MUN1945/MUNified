import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      munRole?: string
      avatar?: string
      schoolId?: string
      subscriptionTier: string
      subscriptionStatus: string
    }
  }
  interface User {
    role: string
    munRole?: string
    schoolId?: string
    subscriptionTier: string
    subscriptionStatus: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    munRole?: string
    schoolId?: string
    subscriptionTier: string
    subscriptionStatus: string
  }
}
