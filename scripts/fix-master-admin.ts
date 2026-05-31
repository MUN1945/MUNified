/**
 * Fix Master Admin Account Script
 * 
 * This script ensures the Master Admin account exists with the correct
 * credentials, role, and associated records (delegateProfile, subscription).
 * 
 * Usage: npx tsx scripts/fix-master-admin.ts
 */

import { PrismaClient } from "@prisma/client"
import { hash, compare } from "bcryptjs"

const MASTER_ADMIN_EMAIL = "modelunitednations45@gmail.com"
const MASTER_ADMIN_PASSWORD = "DiplomatiQ2026!MasterAdmin"
const BCRYPT_SALT_ROUNDS = 12 // Must match auth.ts

const db = new PrismaClient()

async function main() {
  console.log("🔧 DiplomatiQ — Fix Master Admin Account")
  console.log("=" .repeat(50))
  console.log(`📧 Email: ${MASTER_ADMIN_EMAIL}`)
  console.log(`🔑 Password: ${"*".repeat(MASTER_ADMIN_PASSWORD.length)}`)
  console.log()

  // Step 1: Check if the user already exists
  console.log("📋 Step 1: Checking if user exists in database...")
  const existingUser = await db.user.findUnique({
    where: { email: MASTER_ADMIN_EMAIL },
    include: {
      subscription: true,
      delegateProfile: true,
    },
  })

  if (existingUser) {
    console.log("✅ User found in database:")
    console.log(`   ID: ${existingUser.id}`)
    console.log(`   Name: ${existingUser.name}`)
    console.log(`   Role: ${existingUser.role}`)
    console.log(`   isActive: ${existingUser.isActive}`)
    console.log(`   emailVerified: ${existingUser.emailVerified}`)
    console.log(`   Has delegateProfile: ${!!existingUser.delegateProfile}`)
    console.log(`   Has subscription: ${!!existingUser.subscription}`)
    if (existingUser.subscription) {
      console.log(`   Subscription tier: ${existingUser.subscription.tier}`)
      console.log(`   Subscription status: ${existingUser.subscription.status}`)
    }

    // Verify if current password works
    console.log()
    console.log("🔐 Step 2: Verifying current password hash...")
    const isPasswordCorrect = await compare(MASTER_ADMIN_PASSWORD, existingUser.password)
    console.log(`   Password matches: ${isPasswordCorrect}`)

    if (!isPasswordCorrect) {
      console.log("   ⚠️  Password does NOT match — will update password hash")
    }
  } else {
    console.log("❌ User NOT found in database — will create from scratch")
  }

  // Step 2: Hash the correct password
  console.log()
  console.log("🔐 Step 3: Hashing password with bcryptjs (salt rounds: 12)...")
  const hashedPassword = await hash(MASTER_ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS)
  console.log(`   Hash: ${hashedPassword.substring(0, 20)}...`)

  // Step 3: Upsert the user
  console.log()
  console.log("👤 Step 4: Upserting user record...")
  const user = await db.user.upsert({
    where: { email: MASTER_ADMIN_EMAIL },
    update: {
      password: hashedPassword,
      role: "MASTER_ADMIN",
      munRole: "SECRETARY_GENERAL",
      name: "DiplomatiQ Master Admin",
      isActive: true,
      emailVerified: true,
    },
    create: {
      email: MASTER_ADMIN_EMAIL,
      password: hashedPassword,
      name: "DiplomatiQ Master Admin",
      role: "MASTER_ADMIN",
      munRole: "SECRETARY_GENERAL",
      isActive: true,
      emailVerified: true,
      country: "UAE",
    },
    include: {
      subscription: true,
      delegateProfile: true,
    },
  })
  console.log(`✅ User upserted successfully (ID: ${user.id})`)

  // Step 4: Ensure delegate profile exists
  console.log()
  console.log("📊 Step 5: Ensuring delegate profile exists...")
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
    console.log("✅ Delegate profile created")
  } else {
    console.log("✅ Delegate profile already exists")
  }

  // Step 5: Ensure subscription exists
  console.log()
  console.log("💳 Step 6: Ensuring subscription exists...")
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
    console.log("✅ Subscription created (SCHOOL_ENTERPRISE / ACTIVE)")
  } else {
    // Update existing subscription to ensure it's active
    await db.subscription.update({
      where: { userId: user.id },
      data: {
        tier: "SCHOOL_ENTERPRISE",
        status: "ACTIVE",
      },
    })
    console.log("✅ Subscription updated (SCHOOL_ENTERPRISE / ACTIVE)")
  }

  // Step 6: Verify the fix by re-reading the user
  console.log()
  console.log("✔️  Step 7: Verifying the fix...")
  const verifiedUser = await db.user.findUnique({
    where: { email: MASTER_ADMIN_EMAIL },
    include: {
      subscription: true,
      delegateProfile: true,
    },
  })

  if (!verifiedUser) {
    console.log("❌ VERIFICATION FAILED: User not found after upsert!")
    process.exit(1)
  }

  // Check all critical fields
  const checks = [
    { label: "Email", value: verifiedUser.email, expected: MASTER_ADMIN_EMAIL },
    { label: "Role", value: verifiedUser.role, expected: "MASTER_ADMIN" },
    { label: "isActive", value: String(verifiedUser.isActive), expected: "true" },
    { label: "emailVerified", value: String(verifiedUser.emailVerified), expected: "true" },
    { label: "Has delegateProfile", value: String(!!verifiedUser.delegateProfile), expected: "true" },
    { label: "Has subscription", value: String(!!verifiedUser.subscription), expected: "true" },
  ]

  let allPassed = true
  for (const check of checks) {
    const passed = check.value === check.expected
    if (!passed) allPassed = false
    console.log(`   ${passed ? "✅" : "❌"} ${check.label}: ${check.value} ${passed ? "" : `(expected: ${check.expected})`}`)
  }

  // Verify password one final time
  const finalPasswordCheck = await compare(MASTER_ADMIN_PASSWORD, verifiedUser.password)
  console.log(`   ${finalPasswordCheck ? "✅" : "❌"} Password verification: ${finalPasswordCheck ? "PASS" : "FAIL"}`)
  if (!finalPasswordCheck) allPassed = false

  console.log()
  if (allPassed) {
    console.log("🎉 All checks passed! Master Admin account is now fully fixed.")
    console.log()
    console.log("   Login credentials:")
    console.log(`   📧 Email:    ${MASTER_ADMIN_EMAIL}`)
    console.log(`   🔑 Password: ${MASTER_ADMIN_PASSWORD}`)
  } else {
    console.log("❌ Some checks failed. Please review the output above.")
    process.exit(1)
  }

  await db.$disconnect()
}

main().catch((error) => {
  console.error("❌ Script failed with error:", error)
  process.exit(1)
})
