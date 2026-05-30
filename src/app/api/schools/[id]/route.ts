import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// ============================================================
// GET /api/schools/[id] — Get a single school by ID
// ============================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const school = await db.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            conferences: true,
            schoolSubscriptions: true,
            verificationRequests: true,
          },
        },
      },
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    if (!school.isActive) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    return NextResponse.json({ school })
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json({ error: 'Failed to fetch school' }, { status: 500 })
  }
}

// ============================================================
// PATCH /api/schools/[id] — Update school details
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check school exists and is active
    const existing = await db.school.findUnique({ where: { id } })
    if (!existing || !existing.isActive) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      officialName,
      city,
      country,
      emirate,
      region,
      website,
      logo,
      description,
      contactEmail,
      contactPhone,
      contactPerson,
      schoolType,
      curriculum,
      gradeRange,
      studentCount,
      teacherCount,
      munProgramActive,
      munProgramSize,
      isFeatured,
      latitude,
      longitude,
    } = body

    // Build update data — only include fields that are provided
    const updateData: Prisma.SchoolUpdateInput = {}
    if (name !== undefined) updateData.name = name
    if (officialName !== undefined) updateData.officialName = officialName
    if (city !== undefined) updateData.city = city
    if (country !== undefined) updateData.country = country
    if (emirate !== undefined) updateData.emirate = emirate
    if (region !== undefined) updateData.region = region
    if (website !== undefined) updateData.website = website
    if (logo !== undefined) updateData.logo = logo
    if (description !== undefined) updateData.description = description
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson
    if (schoolType !== undefined) updateData.schoolType = schoolType
    if (curriculum !== undefined) updateData.curriculum = curriculum
    if (gradeRange !== undefined) updateData.gradeRange = gradeRange
    if (studentCount !== undefined) updateData.studentCount = studentCount
    if (teacherCount !== undefined) updateData.teacherCount = teacherCount
    if (munProgramActive !== undefined) updateData.munProgramActive = munProgramActive
    if (munProgramSize !== undefined) updateData.munProgramSize = munProgramSize
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude

    // If name is being changed, check for duplicates
    if (name && name !== existing.name) {
      const duplicate = await db.school.findFirst({
        where: {
          id: { not: id },
          isActive: true,
          name: { equals: name, mode: 'insensitive' },
        },
      })
      if (duplicate) {
        return NextResponse.json(
          { error: 'Another school with this name already exists' },
          { status: 409 }
        )
      }
    }

    const school = await db.school.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ school })
  } catch (error) {
    console.error('Error updating school:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 })
  }
}

// ============================================================
// DELETE /api/schools/[id] — Soft delete (set isActive = false)
// ============================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check school exists
    const existing = await db.school.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    if (!existing.isActive) {
      return NextResponse.json({ error: 'School is already deactivated' }, { status: 400 })
    }

    // Soft delete — set isActive to false
    const school = await db.school.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'School deactivated successfully',
      school,
    })
  } catch (error) {
    console.error('Error deleting school:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 })
  }
}
