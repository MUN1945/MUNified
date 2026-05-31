import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

const SETUP_SECRET = "diplomatiq-setup-2026"

const MASTER_ACCOUNT = {
  email: "modelunitednations45@gmail.com",
  password: "DiplomatiQ2026!MasterAdmin",
  name: "DiplomatiQ Master Admin",
  role: "MASTER_ADMIN" as const,
  munRole: "SECRETARY_GENERAL" as const,
}

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

    // 1. Ensure the single MASTER_ADMIN account exists
    const hashedPassword = await hash(MASTER_ACCOUNT.password, 12)

    const user = await db.user.upsert({
      where: { email: MASTER_ACCOUNT.email },
      update: {
        password: hashedPassword,
        role: MASTER_ACCOUNT.role,
        munRole: MASTER_ACCOUNT.munRole,
        name: MASTER_ACCOUNT.name,
        isActive: true,
        emailVerified: true,
      },
      create: {
        email: MASTER_ACCOUNT.email,
        password: hashedPassword,
        name: MASTER_ACCOUNT.name,
        role: MASTER_ACCOUNT.role,
        munRole: MASTER_ACCOUNT.munRole,
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

    // Ensure subscription exists — MASTER_ADMIN gets SCHOOL_ENTERPRISE tier
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
      email: MASTER_ACCOUNT.email,
      role: MASTER_ACCOUNT.role,
      status: "ensured",
    })

    // 2. Demote the old SUPER_ADMIN account (superadmin@diplomatiq.io) to regular ADMIN
    //    or deactivate it if it's no longer needed
    const oldSuperAdmin = await db.user.findUnique({
      where: { email: "superadmin@diplomatiq.io" },
    })

    if (oldSuperAdmin) {
      // Downgrade to regular ADMIN role — no longer need two high-privilege accounts
      await db.user.update({
        where: { email: "superadmin@diplomatiq.io" },
        data: {
          role: "ADMIN",
          isActive: false, // Deactivate the redundant account
        },
      })
      results.push({
        email: "superadmin@diplomatiq.io",
        role: "ADMIN (demoted, deactivated)",
        status: "demoted",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Master Administrator account ensured. Old accounts demoted.",
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
