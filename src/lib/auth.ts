import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
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
          munRole: user.munRole,
          avatar: user.avatar,
          schoolId: user.schoolId,
          subscriptionTier: user.subscription?.tier || "FREE",
          subscriptionStatus: user.subscription?.status || "TRIAL",
        }
      },
    }),
  ],
  callbacks: {
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
