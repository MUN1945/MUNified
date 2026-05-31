/**
 * Test Master Admin Login — Simulates the authorize() function
 * from auth.ts to verify the login flow works at the database level.
 * 
 * Usage: DATABASE_URL='...' npx tsx scripts/test-login.ts
 */

import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const MASTER_ADMIN_EMAIL = "modelunitednations45@gmail.com"
const MASTER_ADMIN_PASSWORD = "DiplomatiQ2026!MasterAdmin"

const db = new PrismaClient()

async function main() {
  console.log("🧪 Testing Master Admin Login (simulating authorize())")
  console.log("=".repeat(55))

  // Step 1: Normalize email (same as auth.ts)
  const normalizedEmail = MASTER_ADMIN_EMAIL.toLowerCase().trim()
  console.log(`Normalized email: "${normalizedEmail}"`)

  // Step 2: Look up user (same query as auth.ts)
  console.log("\nQuerying database...")
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    include: { subscription: true, delegateProfile: true, school: true },
  })

  // Step 3: Check if user exists
  if (!user) {
    console.log("❌ FAIL: No user found with this email")
    console.log("   This means authorize() would return null → 'Invalid email or password'")
    process.exit(1)
  }
  console.log("✅ User found in database")
  console.log(`   ID: ${user.id}`)
  console.log(`   Name: ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   isActive: ${user.isActive}`)
  console.log(`   emailVerified: ${user.emailVerified}`)
  console.log(`   schoolId: ${user.schoolId ?? "null"}`)
  console.log(`   subscription: ${user.subscription ? `${user.subscription.tier} / ${user.subscription.status}` : "null"}`)
  console.log(`   delegateProfile: ${user.delegateProfile ? "exists" : "null"}`)

  // Step 4: Check if user is active
  if (!user.isActive) {
    console.log("\n❌ FAIL: User account is deactivated (isActive = false)")
    console.log("   This means authorize() would return null → 'Invalid email or password'")
    process.exit(1)
  }
  console.log("\n✅ User account is active (isActive = true)")

  // Step 5: Compare password (same as auth.ts)
  console.log("\nComparing password with bcryptjs...")
  const isValid = await compare(MASTER_ADMIN_PASSWORD, user.password)
  if (!isValid) {
    console.log("❌ FAIL: Password does not match")
    console.log("   Stored hash:", user.password.substring(0, 30) + "...")
    console.log("   This means authorize() would return null → 'Invalid email or password'")
    process.exit(1)
  }
  console.log("✅ Password matches!")

  // Step 6: Simulate successful return
  console.log("\n" + "=".repeat(55))
  console.log("🎉 LOGIN SIMULATION SUCCESSFUL!")
  console.log("=".repeat(55))
  console.log("\nThe authorize() function would return:")
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    munRole: user.munRole ?? undefined,
    avatar: user.avatar ?? undefined,
    schoolId: user.schoolId ?? undefined,
    subscriptionTier: user.subscription?.tier || "FREE",
    subscriptionStatus: user.subscription?.status || "TRIAL",
  }, null, 2))

  console.log("\n✅ The Master Admin should be able to log in successfully.")
  console.log("   If login still fails via the web UI, the issue is likely:")
  console.log("   1. Neon database cold start (first query times out)")
  console.log("   2. CSRF token mismatch")
  console.log("   3. Cookie/session configuration issue")

  await db.$disconnect()
}

main().catch((error) => {
  console.error("❌ Test failed with error:", error)
  process.exit(1)
})
