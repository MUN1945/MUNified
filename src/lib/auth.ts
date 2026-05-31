import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { compare, hash } from "bcryptjs"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { subscription: true, delegateProfile: true, school: true },
        })

        if (!user || !user.isActive) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          munRole: user.munRole ?? undefined,
          avatar: user.avatar ?? undefined,
          schoolId: user.schoolId ?? undefined,
          subscriptionTier: user.subscription?.tier || "FREE",
          subscriptionStatus: user.subscription?.status || "TRIAL",
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-in (Google, GitHub)
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const email = user.email?.toLowerCase().trim()
          if (!email) {
            console.error("[OAUTH] No email returned from provider")
            return false
          }

          const existingUser = await db.user.findUnique({
            where: { email },
            include: { subscription: true, delegateProfile: true },
          })

          if (existingUser) {
            // Update last login
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                lastLoginAt: new Date(),
                // Update avatar if provided by OAuth and user doesn't have one
                ...(user.image && !existingUser.avatar ? { avatar: user.image } : {}),
              },
            })
            // Attach role info to user object for JWT callback
            user.id = existingUser.id
            user.role = existingUser.role
            user.munRole = existingUser.munRole ?? undefined
            user.avatar = existingUser.avatar ?? user.image ?? undefined
            user.schoolId = existingUser.schoolId ?? undefined
            user.subscriptionTier = existingUser.subscription?.tier || "FREE"
            user.subscriptionStatus = existingUser.subscription?.status || "TRIAL"
            return true
          }

          // New OAuth user — create account with random hashed password
          const randomPassword = randomUUID() + randomUUID()
          const hashedPassword = await hash(randomPassword, 12)

          const newUser = await db.user.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              password: hashedPassword,
              role: "STUDENT",
              isActive: true,
              emailVerified: true, // OAuth providers verify emails
              avatar: user.image || null,
              delegateProfile: {
                create: {
                  xp: 0,
                  level: "OBSERVER",
                  streak: 0,
                  longestStreak: 0,
                  conferencesAttended: 0,
                  committeesServed: 0,
                  awardsReceived: 0,
                  resolutionsWritten: 0,
                  speechesDelivered: 0,
                },
              },
              subscription: {
                create: {
                  tier: "FREE",
                  status: "TRIAL",
                  trialStartsAt: new Date(),
                  trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour trial
                },
              },
            },
            include: {
              subscription: true,
              delegateProfile: true,
            },
          })

          // Attach role info to user object for JWT callback
          user.id = newUser.id
          user.role = newUser.role
          user.munRole = newUser.munRole ?? undefined
          user.avatar = newUser.avatar ?? undefined
          user.schoolId = newUser.schoolId ?? undefined
          user.subscriptionTier = newUser.subscription?.tier || "FREE"
          user.subscriptionStatus = newUser.subscription?.status || "TRIAL"

          // Send welcome email for new OAuth users (non-blocking)
          try {
            const { sendWelcomeEmail } = await import("@/lib/email")
            await sendWelcomeEmail(email, newUser.name, newUser.role)
          } catch (emailError) {
            console.error("[OAUTH] Failed to send welcome email:", emailError)
          }

          return true
        } catch (error) {
          console.error("[OAUTH] Error during OAuth sign-in:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.munRole = user.munRole
        token.schoolId = user.schoolId
        token.subscriptionTier = user.subscriptionTier
        token.subscriptionStatus = user.subscriptionStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.munRole = token.munRole as string | undefined
        session.user.avatar = token.avatar as string | undefined
        session.user.schoolId = token.schoolId as string | undefined
        session.user.subscriptionTier = token.subscriptionTier as string
        session.user.subscriptionStatus = token.subscriptionStatus as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default redirect after login based on role would be handled client-side
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}
