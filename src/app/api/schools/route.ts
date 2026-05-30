import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// SCHOOL DATA — Same comprehensive seed data used by the frontend
// ============================================================

type SchoolType = 'PUBLIC' | 'PRIVATE' | 'INTERNATIONAL' | 'CHARTER'
type Curriculum = 'AMERICAN' | 'BRITISH' | 'IB' | 'NATIONAL' | 'OTHER'

interface School {
  id: string
  name: string
  officialName: string
  city: string
  emirate: string
  country: string
  region: string
  schoolType: SchoolType
  curriculum: Curriculum
  isVerified: boolean
  munProgramActive: boolean
  munProgramSize?: number
  studentCount: number
  teacherCount?: number
  website: string
}

const SCHOOLS: School[] = [
  // UAE — Abu Dhabi
  { id: 'uae-ad-1', name: 'ACS Abu Dhabi', officialName: 'American Community School Abu Dhabi', city: 'Abu Dhabi', emirate: 'Abu Dhabi', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'AMERICAN', isVerified: true, munProgramActive: true, munProgramSize: 45, studentCount: 1200, teacherCount: 110, website: 'https://www.acs.sch.ae' },
  { id: 'uae-ad-2', name: 'Brighton College Abu Dhabi', officialName: 'Brighton College Abu Dhabi', city: 'Abu Dhabi', emirate: 'Abu Dhabi', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 1800, teacherCount: 160, website: 'https://www.brightoncollegeabudhabi.ae' },
  { id: 'uae-ad-3', name: 'Al Bateen Academy', officialName: 'Al Bateen Academy', city: 'Abu Dhabi', emirate: 'Abu Dhabi', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'IB', isVerified: true, munProgramActive: true, munProgramSize: 30, studentCount: 900, teacherCount: 85, website: '' },
  { id: 'uae-ad-4', name: 'Al Mawaheb School', officialName: 'Al Mawaheb School for Girls', city: 'Abu Dhabi', emirate: 'Abu Dhabi', country: 'UAE', region: 'GCC', schoolType: 'PUBLIC', curriculum: 'NATIONAL', isVerified: true, munProgramActive: false, studentCount: 650, teacherCount: 55, website: '' },
  { id: 'uae-ad-5', name: 'Al Nahda National School', officialName: 'Al Nahda National School', city: 'Abu Dhabi', emirate: 'Abu Dhabi', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'AMERICAN', isVerified: true, munProgramActive: false, studentCount: 2200, teacherCount: 180, website: 'https://www.alnahda.sch.ae' },
  // UAE — Dubai
  { id: 'uae-dx-1', name: 'GEMS Wellington International', officialName: 'GEMS Wellington International School', city: 'Dubai', emirate: 'Dubai', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: true, munProgramSize: 80, studentCount: 2600, teacherCount: 220, website: 'https://www.gemswellingtoninternationalschool.com' },
  { id: 'uae-dx-2', name: 'American School of Dubai', officialName: 'American School of Dubai', city: 'Dubai', emirate: 'Dubai', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'AMERICAN', isVerified: true, munProgramActive: true, munProgramSize: 60, studentCount: 1700, teacherCount: 145, website: 'https://www.asdubai.org' },
  { id: 'uae-dx-3', name: 'Dubai International Academy', officialName: 'Dubai International Academy', city: 'Dubai', emirate: 'Dubai', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'IB', isVerified: true, munProgramActive: true, munProgramSize: 55, studentCount: 2100, teacherCount: 190, website: 'https://www.diadubai.com' },
  { id: 'uae-dx-4', name: 'Jumeirah College', officialName: 'Jumeirah College', city: 'Dubai', emirate: 'Dubai', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 1100, teacherCount: 95, website: 'https://www.gemsjc.com' },
  { id: 'uae-dx-5', name: 'Dubai College', officialName: 'Dubai College', city: 'Dubai', emirate: 'Dubai', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'BRITISH', isVerified: true, munProgramActive: true, munProgramSize: 40, studentCount: 950, teacherCount: 85, website: 'https://www.dubaicollege.org' },
  { id: 'uae-dx-6', name: 'Repton School Dubai', officialName: 'Repton School Dubai', city: 'Dubai', emirate: 'Dubai', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 1800, teacherCount: 155, website: 'https://www.reptondubai.org' },
  { id: 'uae-dx-7', name: 'Deira International School', officialName: 'Deira International School', city: 'Dubai', emirate: 'Dubai', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'IB', isVerified: true, munProgramActive: false, studentCount: 1400, teacherCount: 120, website: 'https://www.disdubai.ae' },
  // UAE — Sharjah
  { id: 'uae-sh-1', name: 'Sharjah American Intl School', officialName: 'Sharjah American International School', city: 'Sharjah', emirate: 'Sharjah', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'AMERICAN', isVerified: true, munProgramActive: false, studentCount: 1600, teacherCount: 130, website: 'https://www.sais.sch.ae' },
  { id: 'uae-sh-2', name: 'Victoria Intl School Sharjah', officialName: 'Victoria International School of Sharjah', city: 'Sharjah', emirate: 'Sharjah', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'IB', isVerified: true, munProgramActive: true, munProgramSize: 25, studentCount: 1200, teacherCount: 100, website: 'https://www.viss.ae' },
  { id: 'uae-sh-3', name: 'Delhi Private School Sharjah', officialName: 'Delhi Private School Sharjah', city: 'Sharjah', emirate: 'Sharjah', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'NATIONAL', isVerified: true, munProgramActive: false, studentCount: 4500, teacherCount: 300, website: 'https://www.dpssharjah.com' },
  // UAE — Ajman
  { id: 'uae-aj-1', name: 'Ajman Academy', officialName: 'Ajman Academy', city: 'Ajman', emirate: 'Ajman', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'IB', isVerified: true, munProgramActive: false, studentCount: 800, teacherCount: 70, website: 'https://www.ajmanacademy.com' },
  { id: 'uae-aj-2', name: 'Crown Private School', officialName: 'Crown Private School Ajman', city: 'Ajman', emirate: 'Ajman', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 550, teacherCount: 45, website: '' },
  // UAE — Ras Al Khaimah
  { id: 'uae-rak-1', name: 'RAK Academy', officialName: 'Ras Al Khaimah Academy', city: 'Ras Al Khaimah', emirate: 'Ras Al Khaimah', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 1500, teacherCount: 120, website: 'https://www.rakacademy.org' },
  { id: 'uae-rak-2', name: 'Choueifat RAK', officialName: 'International School of Choueifat — Ras Al Khaimah', city: 'Ras Al Khaimah', emirate: 'Ras Al Khaimah', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'AMERICAN', isVerified: true, munProgramActive: false, studentCount: 1100, teacherCount: 90, website: '' },
  // UAE — Fujairah
  { id: 'uae-fj-1', name: 'Fujairah Private Academy', officialName: 'Fujairah Private Academy', city: 'Fujairah', emirate: 'Fujairah', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 700, teacherCount: 60, website: 'https://www.fpa.sch.ae' },
  { id: 'uae-fj-2', name: 'OOEHS Fujairah', officialName: 'Our Own English High School Fujairah', city: 'Fujairah', emirate: 'Fujairah', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'NATIONAL', isVerified: true, munProgramActive: false, studentCount: 2800, teacherCount: 180, website: '' },
  // UAE — Umm Al Quwain
  { id: 'uae-uaq-1', name: 'UAQ Educational Zone', officialName: 'Umm Al Quwain Educational Zone Schools', city: 'Umm Al Quwain', emirate: 'Umm Al Quwain', country: 'UAE', region: 'GCC', schoolType: 'PUBLIC', curriculum: 'NATIONAL', isVerified: true, munProgramActive: false, studentCount: 3200, teacherCount: 250, website: '' },
  // UAE — Al Ain
  { id: 'uae-aa-1', name: 'Al Ain English Speaking School', officialName: 'Al Ain English Speaking School', city: 'Al Ain', emirate: 'Al Ain', country: 'UAE', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: true, munProgramSize: 20, studentCount: 1000, teacherCount: 85, website: 'https://www.aesschool.com' },
  { id: 'uae-aa-2', name: 'Al Dhafra Private School', officialName: 'Al Dhafra Private School', city: 'Al Ain', emirate: 'Al Ain', country: 'UAE', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'AMERICAN', isVerified: true, munProgramActive: false, studentCount: 1300, teacherCount: 100, website: '' },
  // Qatar
  { id: 'qa-1', name: 'Qatar Academy', officialName: 'Qatar Academy Doha', city: 'Doha', emirate: 'Doha', country: 'Qatar', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'IB', isVerified: true, munProgramActive: true, munProgramSize: 70, studentCount: 1800, teacherCount: 160, website: 'https://www.qataracademy.qa' },
  { id: 'qa-2', name: 'American School of Doha', officialName: 'American School of Doha', city: 'Doha', emirate: 'Doha', country: 'Qatar', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'AMERICAN', isVerified: true, munProgramActive: true, munProgramSize: 50, studentCount: 1500, teacherCount: 130, website: 'https://www.asd.qa' },
  { id: 'qa-3', name: 'Doha College', officialName: 'Doha College', city: 'Doha', emirate: 'Doha', country: 'Qatar', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 1700, teacherCount: 140, website: 'https://www.dohacollege.com' },
  { id: 'qa-4', name: 'ISL Qatar', officialName: 'International School of London Qatar', city: 'Doha', emirate: 'Doha', country: 'Qatar', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'IB', isVerified: true, munProgramActive: false, studentCount: 800, teacherCount: 70, website: 'https://www.islqatar.com' },
  // Oman
  { id: 'om-1', name: 'ABA Muscat', officialName: 'American British Academy Muscat', city: 'Muscat', emirate: 'Muscat', country: 'Oman', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'IB', isVerified: true, munProgramActive: true, munProgramSize: 35, studentCount: 950, teacherCount: 80, website: 'https://www.abaoman.org' },
  { id: 'om-2', name: "Sultan's School", officialName: "The Sultan's School", city: 'Muscat', emirate: 'Muscat', country: 'Oman', region: 'GCC', schoolType: 'PRIVATE', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 1100, teacherCount: 95, website: 'https://www.sultansschool.edu.om' },
  { id: 'om-3', name: 'Muscat International School', officialName: 'Muscat International School', city: 'Muscat', emirate: 'Muscat', country: 'Oman', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 1400, teacherCount: 110, website: 'https://www.mis.edu.om' },
  // Bahrain
  { id: 'bh-1', name: "St. Christopher's Bahrain", officialName: "St. Christopher's School Bahrain", city: 'Manama', emirate: 'Manama', country: 'Bahrain', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: true, munProgramSize: 55, studentCount: 2200, teacherCount: 185, website: 'https://www.st-chris.net' },
  { id: 'bh-2', name: 'Bahrain School', officialName: 'Bahrain School', city: 'Manama', emirate: 'Manama', country: 'Bahrain', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'AMERICAN', isVerified: true, munProgramActive: false, studentCount: 700, teacherCount: 60, website: 'https://www.bahrainschool.org' },
  { id: 'bh-3', name: 'British School of Bahrain', officialName: 'British School of Bahrain', city: 'Hamala', emirate: 'Northern Governorate', country: 'Bahrain', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 2800, teacherCount: 200, website: 'https://www.bsb.bh' },
  // Kuwait
  { id: 'kw-1', name: 'American School of Kuwait', officialName: 'American School of Kuwait', city: 'Kuwait City', emirate: 'Al Asimah', country: 'Kuwait', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'AMERICAN', isVerified: true, munProgramActive: true, munProgramSize: 40, studentCount: 1900, teacherCount: 160, website: 'https://www.ask.edu.kw' },
  { id: 'kw-2', name: 'British School of Kuwait', officialName: 'The British School of Kuwait', city: 'Kuwait City', emirate: 'Al Asimah', country: 'Kuwait', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 3000, teacherCount: 250, website: 'https://www.bsk.edu.kw' },
  { id: 'kw-3', name: 'Kuwait English School', officialName: 'Kuwait English School', city: 'Salwa', emirate: 'Hawalli', country: 'Kuwait', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 2200, teacherCount: 180, website: 'https://www.kes.edu.kw' },
  // Saudi Arabia
  { id: 'sa-1', name: 'AIS Riyadh', officialName: 'American International School Riyadh', city: 'Riyadh', emirate: 'Riyadh', country: 'Saudi Arabia', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'AMERICAN', isVerified: true, munProgramActive: true, munProgramSize: 50, studentCount: 1600, teacherCount: 140, website: 'https://www.aisr.org' },
  { id: 'sa-2', name: 'BIS Jeddah', officialName: 'British International School Jeddah', city: 'Jeddah', emirate: 'Makkah', country: 'Saudi Arabia', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 1300, teacherCount: 110, website: 'https://www.bisj.edu.sa' },
  { id: 'sa-3', name: 'Dhahran British Grammar', officialName: 'Dhahran British Grammar School', city: 'Dhahran', emirate: 'Eastern Province', country: 'Saudi Arabia', region: 'GCC', schoolType: 'INTERNATIONAL', curriculum: 'BRITISH', isVerified: true, munProgramActive: false, studentCount: 900, teacherCount: 75, website: 'https://www.dbgs.org' },
]

// In-memory pending requests store
interface SchoolRequest {
  id: string
  schoolName: string
  city: string
  country: string
  website: string
  requestedBy: string
  requesterRole: string
  requestedAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED'
}

const pendingRequests: SchoolRequest[] = [
  {
    id: 'req-api-1',
    schoolName: 'GEMS Founders School Dubai',
    city: 'Dubai',
    country: 'UAE',
    website: 'https://www.gemsfoundersschool.com',
    requestedBy: 'Ahmed Al Maktoum',
    requesterRole: 'TEACHER',
    requestedAt: new Date().toISOString(),
    status: 'PENDING',
  },
]

// ============================================================
// GET /api/schools — Search and filter schools
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const country = searchParams.get('country')
    const emirate = searchParams.get('emirate')
    const schoolType = searchParams.get('schoolType')
    const curriculum = searchParams.get('curriculum')
    const munActive = searchParams.get('munActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let results = SCHOOLS

    // Text search
    if (query) {
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.officialName.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query) ||
          s.country.toLowerCase().includes(query) ||
          s.emirate.toLowerCase().includes(query)
      )
    }

    // Filters
    if (country && country !== 'all') {
      results = results.filter((s) => s.country === country)
    }
    if (emirate && emirate !== 'all') {
      results = results.filter((s) => s.emirate === emirate)
    }
    if (schoolType && schoolType !== 'all') {
      results = results.filter((s) => s.schoolType === schoolType)
    }
    if (curriculum && curriculum !== 'all') {
      results = results.filter((s) => s.curriculum === curriculum)
    }
    if (munActive === 'true') {
      results = results.filter((s) => s.munProgramActive)
    }

    // Pagination
    const total = results.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const paginatedResults = results.slice(start, start + limit)

    return NextResponse.json({
      schools: paginatedResults,
      total,
      page,
      totalPages,
      filters: { query, country, emirate, schoolType, curriculum, munActive },
    })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 })
  }
}

// ============================================================
// POST /api/schools — Submit new school request
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { schoolName, city, country, website, requestedBy, requesterRole } = body

    if (!schoolName || !city || !country) {
      return NextResponse.json(
        { error: 'School name, city, and country are required' },
        { status: 400 }
      )
    }

    // Check if school already exists
    const existing = SCHOOLS.find(
      (s) =>
        s.name.toLowerCase() === schoolName.toLowerCase() ||
        s.officialName.toLowerCase() === schoolName.toLowerCase()
    )
    if (existing) {
      return NextResponse.json(
        { error: 'This school already exists in the directory', existingSchool: existing },
        { status: 409 }
      )
    }

    // Create pending request
    const newRequest: SchoolRequest = {
      id: `req-${Date.now()}`,
      schoolName,
      city,
      country,
      website: website || '',
      requestedBy: requestedBy || 'Unknown',
      requesterRole: requesterRole || 'STUDENT',
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
    }

    pendingRequests.push(newRequest)

    return NextResponse.json(
      {
        message: 'School request submitted successfully. It will be reviewed within 1-3 business days.',
        request: newRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating school request:', error)
    return NextResponse.json({ error: 'Failed to submit school request' }, { status: 500 })
  }
}
