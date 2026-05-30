import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isTeacherOrAbove } from "@/lib/auth-helpers"
import { db } from "@/lib/db"

// GET /api/research - List research tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")
    const priority = searchParams.get("priority")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    // Non-admin users can only see their own tasks or tasks from their school
    if (!isTeacherOrAbove(session.user.role)) {
      where.OR = [
        { assignedTo: session.user.id },
        { schoolId: session.user.schoolId || "unknown" },
      ]
    } else if (session.user.schoolId) {
      where.schoolId = session.user.schoolId
    }

    if (status) where.status = status
    if (assignedTo) where.assignedTo = assignedTo
    if (priority) where.priority = priority

    const [tasks, total] = await Promise.all([
      db.researchTask.findMany({
        where,
        include: {
          assignee: {
            select: { id: true, name: true, avatar: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.researchTask.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get research tasks error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch research tasks" },
      { status: 500 }
    )
  }
}

// POST /api/research - Create research task or research paper
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
    const { type } = body

    // Handle research paper creation (students can create papers)
    if (type === "paper") {
      const { title, abstract, content, fileUrl, fileName, fileSize, teacherId } = body

      if (!title) {
        return NextResponse.json(
          { success: false, error: "Title is required" },
          { status: 400 }
        )
      }

      // Validate file URL if provided
      if (fileUrl && !fileUrl.startsWith("/api/upload/")) {
        return NextResponse.json(
          { success: false, error: "Invalid file URL. File must be uploaded via /api/upload." },
          { status: 400 }
        )
      }

      const paper = await db.researchPaper.create({
        data: {
          studentId: session.user.id,
          teacherId: teacherId || null,
          title,
          abstract: abstract || null,
          content: content || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileSize: fileSize || null,
          status: "DRAFT",
        },
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
          teacher: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return NextResponse.json(
        { success: true, data: paper, message: "Research paper created successfully" },
        { status: 201 }
      )
    }

    // Handle research task creation (teachers only)
    if (!isTeacherOrAbove(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Teacher or Admin role required." },
        { status: 403 }
      )
    }

    const { title, description, assignedTo, dueDate, priority, category } = body

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      )
    }

    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
    const taskPriority = validPriorities.includes(priority) ? priority : "MEDIUM"

    const task = await db.researchTask.create({
      data: {
        schoolId: session.user.schoolId || session.user.id,
        title,
        description,
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
        priority: taskPriority,
        category: category || null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    // Create notification for assigned user
    if (assignedTo) {
      await db.notification.create({
        data: {
          userId: assignedTo,
          title: "New Research Task Assigned",
          message: `You have been assigned a research task: ${title}`,
          type: "assignment",
          link: `/research`,
        },
      })
    }

    return NextResponse.json(
      { success: true, data: task, message: "Research task created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create research error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create research item" },
      { status: 500 }
    )
  }
}

// PATCH /api/research - Update task or paper status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, id } = body

    // Handle research paper update
    if (type === "paper") {
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Paper ID is required" },
          { status: 400 }
        )
      }

      const existingPaper = await db.researchPaper.findUnique({
        where: { id },
      })

      if (!existingPaper) {
        return NextResponse.json(
          { success: false, error: "Research paper not found" },
          { status: 404 }
        )
      }

      // Only the student who owns the paper or a teacher can update it
      if (existingPaper.studentId !== session.user.id && !isTeacherOrAbove(session.user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        )
      }

      const { title, abstract, content, fileUrl, fileName, fileSize, status: paperStatus, teacherId } = body

      const updateData: Record<string, unknown> = {}
      if (title) updateData.title = title
      if (abstract !== undefined) updateData.abstract = abstract
      if (content !== undefined) updateData.content = content
      if (fileUrl !== undefined) {
        if (fileUrl && !fileUrl.startsWith("/api/upload/")) {
          return NextResponse.json(
            { success: false, error: "Invalid file URL" },
            { status: 400 }
          )
        }
        updateData.fileUrl = fileUrl
      }
      if (fileName !== undefined) updateData.fileName = fileName
      if (fileSize !== undefined) updateData.fileSize = fileSize
      if (teacherId !== undefined) updateData.teacherId = teacherId

      // Status transitions
      if (paperStatus) {
        const validStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "EVALUATED", "RETURNED"]
        if (!validStatuses.includes(paperStatus)) {
          return NextResponse.json(
            { success: false, error: `Invalid paper status. Valid: ${validStatuses.join(", ")}` },
            { status: 400 }
          )
        }

        // Students can only submit (DRAFT → SUBMITTED)
        // Teachers can transition: SUBMITTED → UNDER_REVIEW, UNDER_REVIEW → EVALUATED/RETURNED
        if (!isTeacherOrAbove(session.user.role) && paperStatus !== "SUBMITTED") {
          return NextResponse.json(
            { success: false, error: "Students can only submit papers" },
            { status: 403 }
          )
        }

        updateData.status = paperStatus

        if (paperStatus === "SUBMITTED") {
          updateData.submittedAt = new Date()
        }
        if (paperStatus === "EVALUATED") {
          updateData.evaluatedAt = new Date()
        }
      }

      const updatedPaper = await db.researchPaper.update({
        where: { id },
        data: updateData,
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
          teacher: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedPaper,
        message: "Research paper updated successfully",
      })
    }

    // Handle research task update
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Task ID is required" },
        { status: 400 }
      )
    }

    // Verify task exists and user has access
    const existingTask = await db.researchTask.findUnique({
      where: { id },
    })

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Research task not found" },
        { status: 404 }
      )
    }

    // Only assigned user or teachers can update
    if (
      existingTask.assignedTo !== session.user.id &&
      !isTeacherOrAbove(session.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { status, title, description, assignedTo, dueDate, priority, category } = body

    const updateData: Record<string, unknown> = {}
    if (status) {
      const validStatuses = ["PENDING", "IN_PROGRESS", "SUBMITTED", "REVIEWED", "COMPLETED"]
      if (validStatuses.includes(status)) {
        updateData.status = status
      }
    }
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (priority) updateData.priority = priority
    if (category !== undefined) updateData.category = category || null

    const updatedTask = await db.researchTask.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: "Research task updated successfully",
    })
  } catch (error) {
    console.error("Update research error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update research item" },
      { status: 500 }
    )
  }
}

// DELETE /api/research - Delete task or paper
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type") || "task"

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      )
    }

    if (type === "paper") {
      const paper = await db.researchPaper.findUnique({ where: { id } })
      if (!paper) {
        return NextResponse.json(
          { success: false, error: "Research paper not found" },
          { status: 404 }
        )
      }

      // Only the student owner or a teacher/admin can delete
      if (paper.studentId !== session.user.id && !isTeacherOrAbove(session.user.role)) {
        return NextResponse.json(
          { success: false, error: "Insufficient permissions" },
          { status: 403 }
        )
      }

      // Delete related evaluations and feedbacks first
      await db.paperFeedback.deleteMany({ where: { paperId: id } })
      await db.paperEvaluation.deleteMany({ where: { paperId: id } })
      await db.researchPaper.delete({ where: { id } })

      return NextResponse.json({
        success: true,
        message: "Research paper deleted successfully",
      })
    }

    // Default: delete task (teachers only)
    if (!isTeacherOrAbove(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    await db.researchTask.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Research task deleted successfully",
    })
  } catch (error) {
    console.error("Delete research error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete research item" },
      { status: 500 }
    )
  }
}
