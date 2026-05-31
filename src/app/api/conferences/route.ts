import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { canManageConferences } from "@/lib/auth-helpers"
import { db } from "@/lib/db"

// GET /api/conferences - List conferences with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const schoolId = searchParams.get("schoolId")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (schoolId) where.schoolId = schoolId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { theme: { contains: search, mode: "insensitive" } },
      ]
    }

    const [conferences, total] = await Promise.all([
      db.conference.findMany({
        where,
        include: {
          school: { select: { id: true, name: true, logo: true } },
          committees: {
            select: {
              id: true,
              name: true,
              type: true,
              topic: true,
              countryLimit: true,
            },
          },
          _count: { select: { registrations: true } },
        },
        orderBy: { startDate: "asc" },
        skip,
        take: limit,
      }),
      db.conference.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: conferences,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get conferences error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch conferences" },
      { status: 500 }
    )
  }
}

// POST /api/conferences - Create conference (requires TEACHER/ADMIN role)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    if (!canManageConferences(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions. Teacher or Admin role required." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, startDate, endDate, location, theme, schoolId, website, logo } = body

    // Validation
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Name, start date, and end date are required" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "End date must be after start date" },
        { status: 400 }
      )
    }

    const conference = await db.conference.create({
      data: {
        name,
        description: description || null,
        startDate: start,
        endDate: end,
        location: location || null,
        theme: theme || null,
        schoolId: schoolId || session.user.schoolId || null,
        createdBy: session.user.id,
        status: "DRAFT",
        website: website || null,
        logo: logo || null,
      },
      include: {
        school: { select: { id: true, name: true } },
      },
    })

    // Log activity
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE",
        resource: "Conference",
        resourceId: conference.id,
        details: `Created conference: ${name}`,
      },
    })

    return NextResponse.json(
      { success: true, data: conference, message: "Conference created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create conference error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create conference" },
      { status: 500 }
    )
  }
}

// PATCH /api/conferences - Update conference
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    if (!canManageConferences(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Conference ID is required" },
        { status: 400 }
      )
    }

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate)
      const end = new Date(updateData.endDate)
      if (end <= start) {
        return NextResponse.json(
          { success: false, error: "End date must be after start date" },
          { status: 400 }
        )
      }
    }

    const conference = await db.conference.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: conference,
      message: "Conference updated successfully",
    })
  } catch (error) {
    console.error("Update conference error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update conference" },
      { status: 500 }
    )
  }
}

// DELETE /api/conferences - Delete conference
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    if (!canManageConferences(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Conference ID is required" },
        { status: 400 }
      )
    }

    await db.conference.delete({ where: { id } })

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE",
        resource: "Conference",
        resourceId: id,
        details: "Deleted conference",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Conference deleted successfully",
    })
  } catch (error) {
    console.error("Delete conference error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete conference" },
      { status: 500 }
    )
  }
}
