import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

const SETUP_SECRET = "diplomatiq-setup-2026"

const ACCOUNTS = [
  {
    email: "superadmin@diplomatiq.io",
    password: "DiplomatiQ2026!SuperAdmin",
    name: "Super Admin",
    role: "SUPER_ADMIN" as const,
    munRole: "SECRETARY_GENERAL" as const,
  },
  {
    email: "modelunitednations45@gmail.com",
    password: "DiplomatiQ2026!Founder",
    name: "DiplomatiQ Founder",
    role: "FOUNDER" as const,
    munRole: "SECRETARY_GENERAL" as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    // Verify secret — check both query param and header
    const url = new URL(request.url)
    const querySecret = url.searchParams.get("secret")
    const headerSecret = request.headers.get("x-setup-secret")

    if (querySecret !== SETUP_SECRET && headerSecret !== SETUP_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized. Provide ?secret=diplomatiq-setup-2026 or X-Setup-Secret header." },
        { status: 401 }
      )
    }

    const results = []

    for (const account of ACCOUNTS) {
      const hashedPassword = await hash(account.password, 12)

      // Upsert user
      const user = await db.user.upsert({
        where: { email: account.email },
        update: {
          password: hashedPassword,
          role: account.role,
          munRole: account.munRole,
          name: account.name,
          isActive: true,
          emailVerified: true,
        },
        create: {
          email: account.email,
          password: hashedPassword,
          name: account.name,
          role: account.role,
          munRole: account.munRole,
          isActive: true,
          emailVerified: true,
          country: "UAE",
        },
        include: {
          subscription: true,
          delegateProfile: true,
        },
      })

      // Ensure delegate profile exists
      if (!user.delegateProfile) {
        await db.delegateProfile.create({
          data: {
            userId: user.id,
            xp: 0,
            level: "SECRETARY_GENERAL",
            streak: 0,
            longestStreak: 0,
            conferencesAttended: 0,
            committeesServed: 0,
            awardsReceived: 0,
            resolutionsWritten: 0,
            speechesDelivered: 0,
          },
        })
      }

      // Ensure subscription exists — SUPER_ADMIN and FOUNDER get SCHOOL_ENTERPRISE tier
      if (!user.subscription) {
        await db.subscription.create({
          data: {
            userId: user.id,
            tier: "SCHOOL_ENTERPRISE",
            status: "ACTIVE",
            trialStartsAt: new Date(),
            trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          },
        })
      } else {
        // Update existing subscription to ensure it's active with enterprise tier
        await db.subscription.update({
          where: { userId: user.id },
          data: {
            tier: "SCHOOL_ENTERPRISE",
            status: "ACTIVE",
          },
        })
      }

      results.push({
        email: account.email,
        role: account.role,
        status: "ensured",
      })
    }

    return NextResponse.json({
      success: true,
      message: "All accounts ensured successfully",
      accounts: results,
    })
  } catch (error) {
    console.error("[ENSURE-ACCOUNTS] Error:", error)
    return NextResponse.json(
      { error: "Failed to ensure accounts", details: String(error) },
      { status: 500 }
    )
  }
}

// Also allow GET for easy browser-triggered setup
export async function GET(request: NextRequest) {
  return POST(request)
}
