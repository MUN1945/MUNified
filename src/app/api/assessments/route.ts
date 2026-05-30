import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Calculate recommended MUN role based on assessment scores
function calculateRecommendedRole(scores: {
  knowledge: number
  confidence: number
  research: number
  speaking: number
  diplomacy: number
  procedure: number
}): string {
  const { knowledge, confidence, research, speaking, diplomacy, procedure } = scores
  const total = knowledge + confidence + research + speaking + diplomacy + procedure

  if (total >= 90) return "SECRETARY_GENERAL"
  if (procedure >= 18 && diplomacy >= 16 && speaking >= 15) return "CHAIR"
  if (diplomacy >= 17 && speaking >= 15 && confidence >= 14) return "DELEGATE_ADVANCED"
  if (research >= 16 && knowledge >= 14) return "RAPPORTEUR"
  if (diplomacy >= 15 && speaking >= 12) return "SDG_AMBASSADOR"
  return "DELEGATE"
}

// GET /api/assessments - Get user assessments
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const assessments = await db.assessment.findMany({
      where: { userId: session.user.id },
      orderBy: { completedAt: "desc" },
    })

    return NextResponse.json({ success: true, data: assessments })
  } catch (error) {
    console.error("Get assessments error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessments" },
      { status: 500 }
    )
  }
}

// POST /api/assessments - Save assessment results
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      knowledgeScore,
      confidenceScore,
      researchScore,
      speakingScore,
      diplomacyScore,
      procedureScore,
      answers,
    } = body

    // Validation
    if (!type) {
      return NextResponse.json(
        { success: false, error: "Assessment type is required" },
        { status: 400 }
      )
    }

    const validTypes = ["DIAGNOSTIC", "SKILL_EVALUATION", "ROLE_PLACEMENT", "PROGRESS_CHECK", "PRE_CONFERENCE"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid assessment type" },
        { status: 400 }
      )
    }

    // Validate score ranges (0-20 each)
    const scores = {
      knowledge: Math.min(20, Math.max(0, Number(knowledgeScore) || 0)),
      confidence: Math.min(20, Math.max(0, Number(confidenceScore) || 0)),
      research: Math.min(20, Math.max(0, Number(researchScore) || 0)),
      speaking: Math.min(20, Math.max(0, Number(speakingScore) || 0)),
      diplomacy: Math.min(20, Math.max(0, Number(diplomacyScore) || 0)),
      procedure: Math.min(20, Math.max(0, Number(procedureScore) || 0)),
    }

    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0)
    const recommendedRole = calculateRecommendedRole(scores)

    // Save assessment
    const assessment = await db.assessment.create({
      data: {
        userId: session.user.id,
        type,
        knowledgeScore: scores.knowledge,
        confidenceScore: scores.confidence,
        researchScore: scores.research,
        speakingScore: scores.speaking,
        diplomacyScore: scores.diplomacy,
        procedureScore: scores.procedure,
        totalScore,
        recommendedRole,
        answers: answers ? JSON.stringify(answers) : null,
      },
    })

    // If this is a diagnostic or role placement assessment, update user's MUN role
    if (type === "DIAGNOSTIC" || type === "ROLE_PLACEMENT") {
      await db.user.update({
        where: { id: session.user.id },
        data: { munRole: recommendedRole as never },
      })

      // Award XP for completing assessment
      await db.delegateProfile.updateMany({
        where: { userId: session.user.id },
        data: { xp: { increment: 25 } },
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...assessment,
          roleBreakdown: {
            knowledge: scores.knowledge,
            confidence: scores.confidence,
            research: scores.research,
            speaking: scores.speaking,
            diplomacy: scores.diplomacy,
            procedure: scores.procedure,
          },
        },
        message: "Assessment completed successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Save assessment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save assessment" },
      { status: 500 }
    )
  }
}
