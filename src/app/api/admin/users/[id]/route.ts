import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

// ============================================================
// PATCH /api/admin/users/[id] — Update user (change role, suspend/activate)
// Requires FOUNDER or SUPER_ADMIN
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const adminRole = session.user.role as string
    if (adminRole !== "MASTER_ADMIN" && adminRole !== "FOUNDER" && adminRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "MASTER_ADMIN, FOUNDER, or SUPER_ADMIN access required" },
        { status: 403 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { role, isActive, name, schoolId } = body

    // Only MASTER_ADMIN or FOUNDER can change roles to MASTER_ADMIN, SUPER_ADMIN or FOUNDER
    if (role && (role === "MASTER_ADMIN" || role === "SUPER_ADMIN" || role === "FOUNDER") && adminRole !== "MASTER_ADMIN" && adminRole !== "FOUNDER") {
      return NextResponse.json(
        { success: false, error: "Only MASTER_ADMIN or FOUNDER can assign high-privilege roles" },
        { status: 403 }
      )
    }

    // Cannot deactivate yourself
    if (isActive === false && id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot suspend your own account" },
        { status: 400 }
      )
    }

    // Cannot change your own role
    if (role && id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot change your own role" },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Prisma.UserUpdateInput = {}
    if (role !== undefined) {
      const validRoles = ["STUDENT", "TEACHER", "ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN", "FOUNDER", "MASTER_ADMIN"]
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: "Invalid role" },
          { status: 400 }
        )
      }
      updateData.role = role
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    if (name !== undefined) {
      updateData.name = name
    }
    if (schoolId !== undefined) {
      updateData.school = schoolId
        ? { connect: { id: schoolId } }
        : { disconnect: true }
    }

    // When changing role, also update the subscription tier accordingly
    // Role -> Subscription tier mapping:
    //   STUDENT -> FREE (keep as is)
    //   TEACHER -> DIRECTOR_PRO + ACTIVE
    //   SCHOOL_ADMIN -> SCHOOL_STARTER + ACTIVE
    //   ADMIN / SUPER_ADMIN / FOUNDER / MASTER_ADMIN -> SCHOOL_PROFESSIONAL + ACTIVE
    if (role !== undefined) {
      const roleToTier: Record<string, { tier: string; status: string }> = {
        STUDENT: { tier: "FREE", status: "TRIAL" },
        TEACHER: { tier: "DIRECTOR_PRO", status: "ACTIVE" },
        SCHOOL_ADMIN: { tier: "SCHOOL_STARTER", status: "ACTIVE" },
        ADMIN: { tier: "SCHOOL_PROFESSIONAL", status: "ACTIVE" },
        SUPER_ADMIN: { tier: "SCHOOL_PROFESSIONAL", status: "ACTIVE" },
        FOUNDER: { tier: "SCHOOL_PROFESSIONAL", status: "ACTIVE" },
        MASTER_ADMIN: { tier: "SCHOOL_PROFESSIONAL", status: "ACTIVE" },
      }
      const subUpdate = roleToTier[role]
      if (subUpdate) {
        await db.subscription.upsert({
          where: { userId: id },
          update: { tier: subUpdate.tier as any, status: subUpdate.status as any },
          create: {
            userId: id,
            tier: subUpdate.tier as any,
            status: subUpdate.status as any,
            trialStartsAt: new Date(),
            trialEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        })
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        schoolId: true,
        school: { select: { name: true } },
        subscription: { select: { tier: true, status: true } },
        delegateProfile: { select: { xp: true, level: true } },
      },
    })

    // Log the action
    const actionDetails: string[] = []
    if (role) actionDetails.push(`role changed to ${role}`)
    if (isActive !== undefined) actionDetails.push(`account ${isActive ? "activated" : "suspended"}`)
    if (name) actionDetails.push(`name changed to ${name}`)

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE",
        resource: "User",
        resourceId: id,
        details: `Admin updated user ${user.email}: ${actionDetails.join(", ")}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error("[ADMIN USERS] Error updating user:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// ============================================================
// DELETE /api/admin/users/[id] — Delete a user (cascade)
// Requires FOUNDER
// ============================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const adminRole = session.user.role as string
    if (adminRole !== "MASTER_ADMIN" && adminRole !== "FOUNDER") {
      return NextResponse.json(
        { success: false, error: "MASTER_ADMIN or FOUNDER access required for user deletion" },
        { status: 403 }
      )
    }

    // Cannot delete yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account" },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Delete all user data in a transaction, respecting dependency order
    await db.$transaction(async (tx) => {
      // Leaf records
      await tx.assessmentResponse.deleteMany({
        where: { assessment: { userId: id } },
      })

      await tx.paperFeedback.deleteMany({
        where: { paper: { studentId: id } },
      })

      await tx.paperEvaluation.deleteMany({
        where: { paper: { studentId: id } },
      })

      // Direct child records
      await tx.subscription.deleteMany({ where: { userId: id } })
      await tx.delegateProfile.deleteMany({ where: { userId: id } })
      await tx.conferenceRegistration.deleteMany({ where: { userId: id } })
      await tx.assessment.deleteMany({ where: { userId: id } })
      await tx.userBadge.deleteMany({ where: { userId: id } })
      await tx.courseEnrollment.deleteMany({ where: { userId: id } })
      await tx.notification.deleteMany({ where: { userId: id } })
      await tx.payment.deleteMany({ where: { userId: id } })
      await tx.invoice.deleteMany({ where: { userId: id } })
      await tx.message.deleteMany({ where: { userId: id } })
      await tx.session.deleteMany({ where: { userId: id } })
      await tx.securityEvent.deleteMany({ where: { userId: id } })
      await tx.researchPaper.deleteMany({ where: { studentId: id } })

      // Set null on nullable foreign keys
      await tx.activity.updateMany({
        where: { userId: id },
        data: { userId: null },
      })

      await tx.auditLog.updateMany({
        where: { userId: id },
        data: { userId: null },
      })

      await tx.committee.updateMany({
        where: { chairId: id },
        data: { chairId: null },
      })

      await tx.researchTask.updateMany({
        where: { assignedTo: id },
        data: { assignedTo: null },
      })

      await tx.researchTask.updateMany({
        where: { schoolId: id },
        data: { schoolId: null },
      })

      await tx.researchPaper.updateMany({
        where: { teacherId: id },
        data: { teacherId: null },
      })

      // Finally, delete the User record
      await tx.user.delete({ where: { id } })
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        resource: "User",
        resourceId: id,
        details: `Admin deleted user: ${user.email} (${user.role})`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `User ${user.email} deleted successfully`,
    })
  } catch (error) {
    console.error("[ADMIN USERS] Error deleting user:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
