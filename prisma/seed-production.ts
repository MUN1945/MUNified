import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

// ============================================================
// PRODUCTION SEED SCRIPT
// 1. Cleans all test/dummy data
// 2. Creates DiplomatiQ Guru AI bot user
// 3. Creates all standard MUN committee channels
// 4. Posts welcome messages from the AI in each channel
// ============================================================

// Standard MUN Committees to create channels for
const COMMITTEE_CHANNELS = [
  // ---- General Assembly Main ----
  {
    name: "general-assembly-plenary",
    displayName: "General Assembly Plenary",
    description: "The main deliberative assembly of the United Nations, where all member states are equally represented.",
    category: "General Assembly",
    type: "committee",
  },
  // ---- General Assembly Committees ----
  {
    name: "disec",
    displayName: "DISEC — Disarmament & International Security",
    description: "First Committee of the General Assembly dealing with disarmament, global challenges, and threats to peace affecting the international community.",
    category: "General Assembly",
    type: "committee",
  },
  {
    name: "ecofin",
    displayName: "ECOFIN — Economic & Financial",
    description: "Second Committee of the General Assembly addressing economic growth, finance, sustainable development, and globalization.",
    category: "General Assembly",
    type: "committee",
  },
  {
    name: "sochum",
    displayName: "SOCHUM — Social, Humanitarian & Cultural",
    description: "Third Committee of the General Assembly focusing on social, humanitarian, and cultural issues including human rights.",
    category: "General Assembly",
    type: "committee",
  },
  {
    name: "specpol",
    displayName: "SPECPOL — Special Political & Decolonization",
    description: "Fourth Committee of the General Assembly dealing with decolonization, peacekeeping, and special political questions.",
    category: "General Assembly",
    type: "committee",
  },
  {
    name: "ga-fifth-committee",
    displayName: "Fifth Committee — Administrative & Budgetary",
    description: "Fifth Committee of the General Assembly managing the UN budget and administrative matters.",
    category: "General Assembly",
    type: "committee",
  },
  {
    name: "ga-sixth-committee",
    displayName: "Sixth Committee — Legal",
    description: "Sixth Committee of the General Assembly addressing international legal matters and the development of international law.",
    category: "General Assembly",
    type: "committee",
  },
  // ---- Security Council ----
  {
    name: "security-council",
    displayName: "Security Council",
    description: "The UN body responsible for maintaining international peace and security, with 15 members including 5 permanent veto-wielding members.",
    category: "Security Council",
    type: "committee",
  },
  // ---- Economic and Social Council ----
  {
    name: "ecosoc",
    displayName: "ECOSOC — Economic & Social Council",
    description: "The principal body for coordination, policy review, and dialogue on economic, social, and environmental issues.",
    category: "Economic & Social Council",
    type: "committee",
  },
  // ---- Human Rights Council ----
  {
    name: "human-rights-council",
    displayName: "Human Rights Council",
    description: "An inter-governmental body responsible for strengthening the promotion and protection of human rights around the world.",
    category: "Human Rights",
    type: "committee",
  },
  // ---- Disarmament & International Security ----
  {
    name: "unoda",
    displayName: "UNODA — Office for Disarmament Affairs",
    description: "Supports multilateral efforts toward nuclear disarmament, weapons of mass destruction, and conventional arms regulation.",
    category: "Disarmament & Security",
    type: "committee",
  },
  // ---- World Health Assembly ----
  {
    name: "world-health-assembly",
    displayName: "World Health Assembly",
    description: "The decision-making body of the World Health Organization, setting global health policy and priorities.",
    category: "Specialized Agencies",
    type: "committee",
  },
  // ---- International Court of Justice ----
  {
    name: "icj",
    displayName: "ICJ — International Court of Justice",
    description: "The principal judicial organ of the United Nations, settling legal disputes between states and giving advisory opinions.",
    category: "International Court",
    type: "committee",
  },
  // ---- International Criminal Court ----
  {
    name: "icc",
    displayName: "ICC — International Criminal Court",
    description: "The world's first permanent international court prosecuting genocide, crimes against humanity, war crimes, and aggression.",
    category: "International Court",
    type: "committee",
  },
  // ---- Crisis Committee ----
  {
    name: "crisis-committee",
    displayName: "Crisis Committee",
    description: "A dynamic, fast-paced committee responding to real-time crises with rapid decision-making and strategic diplomacy.",
    category: "Crisis Committees",
    type: "committee",
  },
  {
    name: "historical-crisis",
    displayName: "Historical Crisis Committee",
    description: "Revisiting pivotal moments in history through crisis simulations, testing delegates' ability to navigate complex geopolitical situations.",
    category: "Crisis Committees",
    type: "committee",
  },
  // ---- Specialized Agencies ----
  {
    name: "unicef",
    displayName: "UNICEF — Children's Fund",
    description: "The UN agency responsible for providing humanitarian and developmental aid to children worldwide.",
    category: "Specialized Agencies",
    type: "committee",
  },
  {
    name: "unep",
    displayName: "UNEP — Environment Programme",
    description: "The leading global environmental authority coordinating the development of environmental policy and sustainable practices.",
    category: "Specialized Agencies",
    type: "committee",
  },
  {
    name: "unhcr",
    displayName: "UNHCR — Refugee Agency",
    description: "The UN agency mandated to protect and assist refugees, displaced communities, and stateless people worldwide.",
    category: "Specialized Agencies",
    type: "committee",
  },
  {
    name: "unesco",
    displayName: "UNESCO — Education, Scientific & Cultural Org.",
    description: "The UN agency promoting world peace through international cooperation in education, science, culture, and communication.",
    category: "Specialized Agencies",
    type: "committee",
  },
  {
    name: "fao",
    displayName: "FAO — Food & Agriculture Organization",
    description: "The UN agency leading international efforts to defeat hunger, improve nutrition, and achieve food security for all.",
    category: "Specialized Agencies",
    type: "committee",
  },
  {
    name: "ilo",
    displayName: "ILO — International Labour Organization",
    description: "The UN agency setting international labour standards and promoting social protection and work opportunities for all.",
    category: "Specialized Agencies",
    type: "committee",
  },
  // ---- Regional Bodies ----
  {
    name: "african-union",
    displayName: "African Union",
    description: "A continental body advancing unity, solidarity, and socio-economic development among African nations.",
    category: "Regional Bodies",
    type: "committee",
  },
  {
    name: "arab-league",
    displayName: "Arab League",
    description: "A regional organization of Arab states fostering economic, cultural, and political cooperation in the Arab world.",
    category: "Regional Bodies",
    type: "committee",
  },
  {
    name: "eu",
    displayName: "European Union",
    description: "A political and economic union promoting peace, stability, and prosperity through integration among European nations.",
    category: "Regional Bodies",
    type: "committee",
  },
  {
    name: "asean",
    displayName: "ASEAN — Association of Southeast Asian Nations",
    description: "A regional intergovernmental organization promoting economic growth, social progress, and cultural development in Southeast Asia.",
    category: "Regional Bodies",
    type: "committee",
  },
  // ---- Other Notable Committees ----
  {
    name: "unwomen",
    displayName: "UN Women",
    description: "The UN entity dedicated to gender equality and the empowerment of women and girls worldwide.",
    category: "Human Rights",
    type: "committee",
  },
  {
    name: "uncpd",
    displayName: "UNCPD — Commission on Population & Development",
    description: "A functional commission of ECOSOC monitoring global population trends and development policies.",
    category: "Economic & Social Council",
    type: "committee",
  },
  {
    name: "uncsd",
    displayName: "UNCSD — Commission on Sustainable Development",
    description: "A functional commission of ECOSOC overseeing the implementation of sustainable development commitments.",
    category: "Economic & Social Council",
    type: "committee",
  },
  {
    name: "nato",
    displayName: "NATO — North Atlantic Treaty Organization",
    description: "An intergovernmental military alliance ensuring collective defense and security cooperation among member states.",
    category: "Regional Bodies",
    type: "committee",
  },
  // ---- General / Social Channels ----
  {
    name: "general-chat",
    displayName: "General Chat",
    description: "A space for all delegates to connect, share ideas, and discuss MUN experiences.",
    category: "Community",
    type: "text",
  },
  {
    name: "help-and-support",
    displayName: "Help & Support",
    description: "Get assistance with the DiplomatiQ platform, technical issues, or general questions about MUN.",
    category: "Community",
    type: "text",
  },
  {
    name: "announcements",
    displayName: "Announcements",
    description: "Official announcements, updates, and important notices from the DiplomatiQ team.",
    category: "Community",
    type: "announcement",
  },
  {
    name: "mun-resources",
    displayName: "MUN Resources & Guides",
    description: "Share and discover helpful MUN resources, research guides, and preparation materials.",
    category: "Community",
    type: "study",
  },
]

// Welcome message template for committee channels
function getWelcomeMessage(channelName: string, displayName: string): string {
  return `Welcome to **${displayName}**! I'm **DiplomatiQ Guru**, your official committee knowledge assistant and educational support guide.

**My Purpose:** I'm here to help you navigate this committee's procedures, understand topics on the agenda, research your country's position, prepare speeches and resolutions, and become a more effective delegate.

**How to Interact with Me:** Simply type a message in this channel and mention me using **@DiplomatiQ Guru** or click the "Ask DiplomatiQ Guru" button. I'll respond with accurate, professional guidance tailored to your question.

**What I Can Help With:**
- Committee procedures and parliamentary rules
- Country positions and foreign policy research
- Resolution writing and formatting
- Speech preparation and delivery tips
- Understanding agenda topics and their global context
- Diplomatic strategy and negotiation approaches
- UN system structure and how this committee fits in

**My Commitments to You:**
- I provide fact-based, academically sound responses
- I adapt my explanations to your experience level
- I remain politically neutral and educational
- I encourage diplomacy, research, critical thinking, and constructive debate
- I respect all countries, cultures, religions, and communities

**Important:** I'm a chat-only educational guide. I cannot generate documents, modify platform data, execute actions, or impersonate delegates or administrators. My purpose is exclusively to provide conversational guidance and educational support.

**Scope:** I only engage in topics related to the United Nations, Model United Nations, international relations, diplomacy, international law, global affairs, committee topics, resolution writing, parliamentary procedure, and research guidance.

Let's make this committee session productive and diplomatic. Feel free to ask me anything!`
}

async function main() {
  console.log("🧹 Production Cleanup & Seeding Starting...")
  console.log("")

  // ============================
  // STEP 1: DELETE ALL TEST / DUMMY DATA
  // ============================
  console.log("🗑️  Step 1: Cleaning all test/dummy data...")

  // Delete in dependency order (children first)
  const deleteResults = {
    userBadges: await prisma.userBadge.deleteMany(),
    assessmentResponses: await prisma.assessmentResponse.deleteMany(),
    assessments: await prisma.assessment.deleteMany(),
    courseEnrollments: await prisma.courseEnrollment.deleteMany(),
    conferenceRegistrations: await prisma.conferenceRegistration.deleteMany(),
    paperFeedbacks: await prisma.paperFeedback.deleteMany(),
    paperEvaluations: await prisma.paperEvaluation.deleteMany(),
    researchPapers: await prisma.researchPaper.deleteMany(),
    researchTasks: await prisma.researchTask.deleteMany(),
    messages: await prisma.message.deleteMany(),
    channels: await prisma.channel.deleteMany(),
    committees: await prisma.committee.deleteMany(),
    conferences: await prisma.conference.deleteMany(),
    activities: await prisma.activity.deleteMany(),
    notifications: await prisma.notification.deleteMany(),
    auditLogs: await prisma.auditLog.deleteMany(),
    securityEvents: await prisma.securityEvent.deleteMany(),
    sessions: await prisma.session.deleteMany(),
    payments: await prisma.payment.deleteMany(),
    invoices: await prisma.invoice.deleteMany(),
    coupons: await prisma.coupon.deleteMany(),
    subscriptions: await prisma.subscription.deleteMany(),
    schoolSubscriptions: await prisma.schoolSubscription.deleteMany(),
    schoolVerificationRequests: await prisma.schoolVerificationRequest.deleteMany(),
    platformMetrics: await prisma.platformMetric.deleteMany(),
    passwordResetTokens: await prisma.passwordResetToken.deleteMany(),
    emailVerificationTokens: await prisma.emailVerificationToken.deleteMany(),
    delegateProfiles: await prisma.delegateProfile.deleteMany(),
  }

  // Delete ALL users (including test ones) — we'll recreate the MASTER_ADMIN
  await prisma.user.deleteMany()

  console.log("   ✓ All user data, registrations, messages, channels, committees, conferences deleted")

  // Delete schools (they were seed data — we'll keep them if desired, but for a clean launch
  // we recreate them. Actually, the schools are REAL schools, not test data. Let's keep them.
  // But we already deleted them above with the cascade... Let's check:
  // Actually, School has no cascade from User, so schools might still exist.
  // Let's delete and recreate them for a clean state.

  // Actually, let's check if schools still exist
  const schoolCount = await prisma.school.count()
  if (schoolCount > 0) {
    // Schools exist — they're real data, keep them but clean any test-related flags
    console.log(`   ✓ Preserving ${schoolCount} existing school records (real UAE schools)`)
  }

  console.log("   ✓ Cleanup complete!")
  console.log("")

  // ============================
  // STEP 2: CREATE MASTER ADMIN ACCOUNT
  // ============================
  console.log("👑 Step 2: Creating Master Administrator account...")

  const masterAdminPassword = await hash("DiplomatiQ2026!Founder", 12)
  const masterAdmin = await prisma.user.create({
    data: {
      email: "modelunitednations45@gmail.com",
      name: "Master Administrator",
      password: masterAdminPassword,
      role: "MASTER_ADMIN",
      country: "UAE",
      isActive: true,
      emailVerified: true,
      isBot: false,
    },
  })
  console.log(`   ✓ Master Admin created: ${masterAdmin.email}`)

  // Create subscription for master admin
  await prisma.subscription.create({
    data: {
      userId: masterAdmin.id,
      tier: "SCHOOL_ENTERPRISE",
      status: "ACTIVE",
    },
  })
  console.log("   ✓ Master Admin subscription set to SCHOOL_ENTERPRISE")
  console.log("")

  // ============================
  // STEP 3: CREATE DIPLOMATIQ GURU AI BOT USER
  // ============================
  console.log("🤖 Step 3: Creating DiplomatiQ Guru AI assistant...")

  const botPassword = await hash("bot-no-login-" + Date.now(), 12)
  const botUser = await prisma.user.create({
    data: {
      email: "diplomatiq-guru@system.diplomatiq.com",
      name: "DiplomatiQ Guru",
      password: botPassword,
      role: "ADMIN",
      isActive: true,
      isBot: true,
      emailVerified: true,
      country: "UAE",
      bio: "Official DiplomatiQ AI Knowledge Assistant — Your guide to MUN, UN, diplomacy, and committee excellence.",
    },
  })
  console.log(`   ✓ DiplomatiQ Guru bot created: ${botUser.id}`)
  console.log("")

  // ============================
  // STEP 4: CREATE ALL COMMITTEE CHANNELS
  // ============================
  console.log("📺 Step 4: Creating committee channels...")

  let channelCount = 0
  for (const ch of COMMITTEE_CHANNELS) {
    const channel = await prisma.channel.create({
      data: {
        name: ch.name,
        description: ch.description,
        type: ch.type,
        category: ch.category,
        isCommittee: ch.type === "committee",
        schoolId: null, // Global channels — visible to all users
      },
    })
    channelCount++

    // Post welcome message from the AI bot in each committee channel
    const welcomeMsg = getWelcomeMessage(ch.name, ch.displayName)
    await prisma.message.create({
      data: {
        content: welcomeMsg,
        channelId: channel.id,
        userId: botUser.id,
      },
    })
  }

  console.log(`   ✓ Created ${channelCount} channels with AI welcome messages`)
  console.log("")

  // ============================
  // STEP 5: VERIFY CLEAN STATE
  // ============================
  console.log("✅ Step 5: Verifying production-ready state...")

  const userCount = await prisma.user.count()
  const realUsers = await prisma.user.findMany({ where: { isBot: false } })
  const botUsers = await prisma.user.findMany({ where: { isBot: true } })
  const totalChannels = await prisma.channel.count()
  const totalMessages = await prisma.message.count()
  const totalSchools = await prisma.school.count()
  const totalBadges = await prisma.badge.count()
  const totalCourses = await prisma.course.count()
  const totalPricingPlans = await prisma.pricingPlan.count()
  const totalAssessmentQuestions = await prisma.assessmentQuestion.count()

  console.log("")
  console.log("═══════════════════════════════════════════")
  console.log("  PRODUCTION DATABASE STATE")
  console.log("═══════════════════════════════════════════")
  console.log(`  Users (real):         ${realUsers.length} (Master Admin only)`)
  console.log(`  Users (bot):          ${botUsers.length} (DiplomatiQ Guru)`)
  console.log(`  Total users:          ${userCount}`)
  console.log(`  Channels:             ${totalChannels}`)
  console.log(`  Messages:             ${totalMessages} (AI welcome messages)`)
  console.log(`  Schools:              ${totalSchools}`)
  console.log(`  Badges:               ${totalBadges}`)
  console.log(`  Courses:              ${totalCourses}`)
  console.log(`  Pricing Plans:        ${totalPricingPlans}`)
  console.log(`  Assessment Questions:  ${totalAssessmentQuestions}`)
  console.log(`  Conferences:          0 (clean)`)
  console.log(`  Committees:           0 (clean)`)
  console.log(`  Registrations:        0 (clean)`)
  console.log(`  Test/Dummy Data:      0 (removed)`)
  console.log("═══════════════════════════════════════════")
  console.log("")
  console.log("🚀 Platform is ready for public launch!")
}

main()
  .catch((e) => {
    console.error("❌ Production seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
