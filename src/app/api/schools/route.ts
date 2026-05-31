import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// ============================================================
// GET /api/schools — Search, filter, paginate schools from DB
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const country = searchParams.get('country')
    const emirate = searchParams.get('emirate')
    const city = searchParams.get('city')
    const schoolType = searchParams.get('schoolType')
    const curriculum = searchParams.get('curriculum')
    const munActive = searchParams.get('munActive')
    const isVerified = searchParams.get('isVerified')
    const isFeatured = searchParams.get('isFeatured')
    const sort = searchParams.get('sort') || 'name'
    const order = searchParams.get('order') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: Prisma.SchoolWhereInput = {
      isActive: true, // Only return active schools by default
    }

    // Text search across name, officialName, city, country, emirate
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { officialName: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { country: { contains: query, mode: 'insensitive' } },
        { emirate: { contains: query, mode: 'insensitive' } },
      ]
    }

    // Filters
    if (country && country !== 'all') {
      where.country = country
    }
    if (emirate && emirate !== 'all') {
      where.emirate = emirate
    }
    if (city && city !== 'all') {
      where.city = city
    }
    if (schoolType && schoolType !== 'all') {
      where.schoolType = schoolType
    }
    if (curriculum && curriculum !== 'all') {
      where.curriculum = curriculum
    }
    if (munActive === 'true') {
      where.munProgramActive = true
    }
    if (isVerified === 'true') {
      where.isVerified = true
    }
    if (isFeatured === 'true') {
      where.isFeatured = true
    }

    // Sorting
    const orderBy: Prisma.SchoolOrderByWithRelationInput = {}
    const validSortFields = ['name', 'city', 'country', 'studentCount', 'createdAt', 'munProgramSize']
    if (validSortFields.includes(sort)) {
      orderBy[sort as keyof Prisma.SchoolOrderByWithRelationInput] = order === 'desc' ? 'desc' : 'asc'
    } else {
      orderBy.name = 'asc'
    }

    // Pagination
    const skip = (page - 1) * limit

    const [schools, total] = await Promise.all([
      db.school.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      db.school.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      schools,
      total,
      page,
      totalPages,
      filters: { query, country, emirate, city, schoolType, curriculum, munActive, isVerified, isFeatured },
    })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 })
  }
}

// ============================================================
// POST /api/schools — Register / create a new school
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      officialName,
      city,
      country,
      emirate,
      region,
      website,
      schoolType,
      curriculum,
      contactEmail,
      contactPhone,
      contactPerson,
      gradeRange,
      source,
    } = body

    if (!name || !city || !country) {
      return NextResponse.json(
        { error: 'School name, city, and country are required' },
        { status: 400 }
      )
    }

    // Check if school already exists (by name or officialName)
    const existing = await db.school.findFirst({
      where: {
        isActive: true,
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          ...(officialName ? [{ officialName: { equals: officialName, mode: 'insensitive' } }] : []),
        ],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This school already exists in the directory', existingSchool: existing },
        { status: 409 }
      )
    }

    // Create the school in the database
    const school = await db.school.create({
      data: {
        name,
        officialName: officialName || name,
        city,
        country,
        emirate: emirate || null,
        region: region || null,
        website: website || null,
        schoolType: schoolType || null,
        curriculum: curriculum || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        contactPerson: contactPerson || null,
        gradeRange: gradeRange || null,
        source: source || 'SELF_REGISTERED',
        isVerified: false,
        verificationStatus: 'PENDING',
        isActive: true,
      },
    })

    return NextResponse.json(
      {
        message: 'School registered successfully. It will be reviewed for verification within 1-3 business days.',
        school,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating school:', error)

    // Handle Prisma unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A school with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'Failed to register school' }, { status: 500 })
  }
}
