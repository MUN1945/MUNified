import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate the user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Parse and validate the request body
    const body = await request.json()
    const { confirmation } = body

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Confirmation required. Please type DELETE to confirm." },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // Prevent deletion of master admin accounts
    const userRole = session.user.role
    if (userRole === 'FOUNDER' || userRole === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: "Master administrator accounts cannot be deleted. Please contact support if you need assistance." },
        { status: 403 }
      )
    }

    // Verify the user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      )
    }

    // Delete all user data in a transaction, respecting dependency order
    await db.$transaction(async (tx) => {
      // ── 1. Leaf records (no dependents) ──
      // AssessmentResponses → depend on Assessment
      await tx.assessmentResponse.deleteMany({
        where: { assessment: { userId } },
      })

      // PaperFeedbacks → depend on PaperEvaluation & ResearchPaper
      await tx.paperFeedback.deleteMany({
        where: { paper: { studentId: userId } },
      })

      // PaperEvaluations → depend on ResearchPaper
      await tx.paperEvaluation.deleteMany({
        where: { paper: { studentId: userId } },
      })

      // ── 2. Direct child records (Cascade targets) ──
      await tx.subscription.deleteMany({ where: { userId } })
      await tx.delegateProfile.deleteMany({ where: { userId } })
      await tx.conferenceRegistration.deleteMany({ where: { userId } })
      await tx.assessment.deleteMany({ where: { userId } })
      await tx.userBadge.deleteMany({ where: { userId } })
      await tx.courseEnrollment.deleteMany({ where: { userId } })
      await tx.notification.deleteMany({ where: { userId } })
      await tx.payment.deleteMany({ where: { userId } })
      await tx.invoice.deleteMany({ where: { userId } })
      await tx.message.deleteMany({ where: { userId } })
      await tx.session.deleteMany({ where: { userId } })
      await tx.securityEvent.deleteMany({ where: { userId } })

      // ResearchPapers owned by this user (as student)
      await tx.researchPaper.deleteMany({ where: { studentId: userId } })

      // ── 3. Set null on nullable foreign keys (preserve data, disassociate) ──
      await tx.activity.updateMany({
        where: { userId },
        data: { userId: null },
      })

      await tx.auditLog.updateMany({
        where: { userId },
        data: { userId: null },
      })

      await tx.committee.updateMany({
        where: { chairId: userId },
        data: { chairId: null },
      })

      await tx.researchTask.updateMany({
        where: { assignedTo: userId },
        data: { assignedTo: null },
      })

      await tx.researchTask.updateMany({
        where: { schoolId: userId },
        data: { schoolId: null },
      })

      // Disassociate teacher from papers they supervise (but don't own)
      await tx.researchPaper.updateMany({
        where: { teacherId: userId },
        data: { teacherId: null },
      })

      // ── 4. Finally, delete the User record ──
      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({
      message: "Account deleted successfully.",
    })
  } catch (error) {
    console.error("[ACCOUNT DELETE] Error deleting account:", error)
    // Check if it's a Prisma constraint error
    const errorMessage = error instanceof Error ? error.message : "Failed to delete account"
    return NextResponse.json(
      { error: "Failed to delete account. This may be because you have related records that need to be removed first. Please contact support for assistance." },
      { status: 500 }
    )
  }
}
