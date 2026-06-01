'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Grid3X3, List, Building2, Globe, CheckCircle2,
  ChevronDown, X, ExternalLink, Users, GraduationCap, MapPin,
  ShieldCheck, Send, AlertCircle, Clock, CheckCircle, XCircle,
  MessageSquare, LayoutGrid, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

// ============================================================
// SCHOOL TYPES
// ============================================================

type SchoolType = 'PUBLIC' | 'PRIVATE' | 'INTERNATIONAL' | 'CHARTER'
type Curriculum = 'AMERICAN' | 'BRITISH' | 'IB' | 'CBSE' | 'NATIONAL' | 'OTHER'
type Country = 'UAE' | 'Qatar' | 'Oman' | 'Bahrain' | 'Kuwait' | 'Saudi Arabia'
type UAEEmirate = 'Abu Dhabi' | 'Dubai' | 'Sharjah' | 'Ajman' | 'Ras Al Khaimah' | 'Fujairah' | 'Umm Al Quwain' | 'Al Ain'

interface School {
  id: string
  name: string
  officialName: string
  city: string
  emirate: string
  country: Country
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
  rejectReason?: string
}

// ============================================================
// SCHOOL SEED DATA — 55+ Real UAE/GCC Schools
// ============================================================

const SCHOOLS: School[] = [
  // ===== UAE — Abu Dhabi =====
  {
    id: 'uae-ad-1',
    name: 'ACS Abu Dhabi',
    officialName: 'American Community School Abu Dhabi',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 45,
    studentCount: 1200,
    teacherCount: 110,
    website: 'https://www.acs.sch.ae',
  },
  {
    id: 'uae-ad-2',
    name: 'Brighton College Abu Dhabi',
    officialName: 'Brighton College Abu Dhabi',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1800,
    teacherCount: 160,
    website: 'https://www.brightoncollegeabudhabi.ae',
  },
  {
    id: 'uae-ad-3',
    name: 'Al Bateen Academy',
    officialName: 'Al Bateen Academy',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 30,
    studentCount: 900,
    teacherCount: 85,
    website: '',
  },
  {
    id: 'uae-ad-4',
    name: 'Al Mawaheb School',
    officialName: 'Al Mawaheb School for Girls',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PUBLIC',
    curriculum: 'NATIONAL',
    isVerified: true,
    munProgramActive: false,
    studentCount: 650,
    teacherCount: 55,
    website: '',
  },
  {
    id: 'uae-ad-5',
    name: 'Al Nahda National School',
    officialName: 'Al Nahda National School',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: false,
    studentCount: 2200,
    teacherCount: 180,
    website: 'https://www.alnahda.sch.ae',
  },
  {
    id: 'uae-ad-6',
    name: 'Raha International School',
    officialName: 'Raha International School',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 30,
    studentCount: 1600,
    teacherCount: 140,
    website: 'https://www.raha.sch.ae',
  },
  {
    id: 'uae-ad-7',
    name: 'Cranleigh Abu Dhabi',
    officialName: 'Cranleigh Abu Dhabi',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1150,
    teacherCount: 100,
    website: 'https://www.cranleigh.ae',
  },
  {
    id: 'uae-ad-8',
    name: 'Amity International Abu Dhabi',
    officialName: 'Amity International School Abu Dhabi',
    city: 'Abu Dhabi',
    emirate: 'Abu Dhabi',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'CBSE',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 25,
    studentCount: 1350,
    teacherCount: 115,
    website: 'https://www.amityabudhabi.ae',
  },
  // ===== UAE — Dubai =====
  {
    id: 'uae-dx-1',
    name: 'GEMS Wellington International',
    officialName: 'GEMS Wellington International School',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 80,
    studentCount: 2600,
    teacherCount: 220,
    website: 'https://www.gemswellingtoninternationalschool.com',
  },
  {
    id: 'uae-dx-2',
    name: 'American School of Dubai',
    officialName: 'American School of Dubai',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 60,
    studentCount: 1700,
    teacherCount: 145,
    website: 'https://www.asdubai.org',
  },
  {
    id: 'uae-dx-3',
    name: 'Dubai International Academy',
    officialName: 'Dubai International Academy',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 55,
    studentCount: 2100,
    teacherCount: 190,
    website: 'https://www.diadubai.com',
  },
  {
    id: 'uae-dx-4',
    name: 'Jumeirah College',
    officialName: 'Jumeirah College',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1100,
    teacherCount: 95,
    website: 'https://www.gemsjc.com',
  },
  {
    id: 'uae-dx-5',
    name: 'Dubai College',
    officialName: 'Dubai College',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 40,
    studentCount: 950,
    teacherCount: 85,
    website: 'https://www.dubaicollege.org',
  },
  {
    id: 'uae-dx-6',
    name: 'Repton School Dubai',
    officialName: 'Repton School Dubai',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1800,
    teacherCount: 155,
    website: 'https://www.reptondubai.org',
  },
  {
    id: 'uae-dx-7',
    name: 'Deira International School',
    officialName: 'Deira International School',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1400,
    teacherCount: 120,
    website: 'https://www.disdubai.ae',
  },
  {
    id: 'uae-dx-8',
    name: 'The Indian High School Dubai',
    officialName: 'The Indian High School Dubai',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'CBSE',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 30,
    studentCount: 3800,
    teacherCount: 280,
    website: 'https://www.indianhighschooldubai.org',
  },
  {
    id: 'uae-dx-9',
    name: 'GEMS Founders School Dubai',
    officialName: 'GEMS Founders School Dubai',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1650,
    teacherCount: 140,
    website: 'https://www.gemsfoundersschool.com',
  },
  {
    id: 'uae-dx-10',
    name: 'Our Own High School Al Warqa',
    officialName: 'Our Own High School Al Warqa Dubai',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'CBSE',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1550,
    teacherCount: 130,
    website: 'https://www.oohsaw.gems.ae',
  },
  // ===== UAE — Sharjah =====
  {
    id: 'uae-sh-1',
    name: 'Sharjah American Intl School',
    officialName: 'Sharjah American International School',
    city: 'Sharjah',
    emirate: 'Sharjah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1600,
    teacherCount: 130,
    website: 'https://www.sais.sch.ae',
  },
  {
    id: 'uae-sh-2',
    name: 'Victoria Intl School Sharjah',
    officialName: 'Victoria International School of Sharjah',
    city: 'Sharjah',
    emirate: 'Sharjah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 25,
    studentCount: 1200,
    teacherCount: 100,
    website: 'https://www.viss.ae',
  },
  {
    id: 'uae-sh-3',
    name: 'Delhi Private School Sharjah',
    officialName: 'Delhi Private School Sharjah',
    city: 'Sharjah',
    emirate: 'Sharjah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'CBSE',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 20,
    studentCount: 4500,
    teacherCount: 300,
    website: 'https://www.dpssharjah.com',
  },
  {
    id: 'uae-sh-4',
    name: 'Pristine Private School Sharjah',
    officialName: 'Pristine Private School Sharjah',
    city: 'Sharjah',
    emirate: 'Sharjah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 700,
    teacherCount: 60,
    website: 'https://www.pristineprivateschool.com',
  },
  // ===== UAE — Ajman =====
  {
    id: 'uae-aj-1',
    name: 'Ajman Academy',
    officialName: 'Ajman Academy',
    city: 'Ajman',
    emirate: 'Ajman',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: false,
    studentCount: 800,
    teacherCount: 70,
    website: 'https://www.ajmanacademy.com',
  },
  {
    id: 'uae-aj-2',
    name: 'Crown Private School',
    officialName: 'Crown Private School Ajman',
    city: 'Ajman',
    emirate: 'Ajman',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 550,
    teacherCount: 45,
    website: '',
  },
  {
    id: 'uae-aj-3',
    name: 'Woodlem Park School Ajman',
    officialName: 'Woodlem Park School Ajman',
    city: 'Ajman',
    emirate: 'Ajman',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'AMERICAN',
    isVerified: false,
    munProgramActive: false,
    studentCount: 550,
    teacherCount: 45,
    website: '',
  },
  // ===== UAE — Ras Al Khaimah =====
  {
    id: 'uae-rak-1',
    name: 'RAK Academy',
    officialName: 'Ras Al Khaimah Academy',
    city: 'Ras Al Khaimah',
    emirate: 'Ras Al Khaimah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 20,
    studentCount: 1500,
    teacherCount: 120,
    website: 'https://www.rakacademy.org',
  },
  {
    id: 'uae-rak-2',
    name: 'Choueifat RAK',
    officialName: 'International School of Choueifat — Ras Al Khaimah',
    city: 'Ras Al Khaimah',
    emirate: 'Ras Al Khaimah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1100,
    teacherCount: 90,
    website: '',
  },
  {
    id: 'uae-rak-3',
    name: 'Al Shomoukh Intl School RAK',
    officialName: 'Al Shomoukh International School Ras Al Khaimah',
    city: 'Ras Al Khaimah',
    emirate: 'Ras Al Khaimah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: false,
    munProgramActive: false,
    studentCount: 650,
    teacherCount: 55,
    website: '',
  },
  // ===== UAE — Fujairah =====
  {
    id: 'uae-fj-1',
    name: 'Fujairah Private Academy',
    officialName: 'Fujairah Private Academy',
    city: 'Fujairah',
    emirate: 'Fujairah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 15,
    studentCount: 700,
    teacherCount: 60,
    website: 'https://www.fpa.sch.ae',
  },
  {
    id: 'uae-fj-2',
    name: 'OOEHS Fujairah',
    officialName: 'Our Own English High School Fujairah',
    city: 'Fujairah',
    emirate: 'Fujairah',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'CBSE',
    isVerified: true,
    munProgramActive: false,
    studentCount: 2800,
    teacherCount: 180,
    website: '',
  },
  // ===== UAE — Umm Al Quwain =====
  {
    id: 'uae-uaq-1',
    name: 'UAQ Educational Zone',
    officialName: 'Umm Al Quwain Educational Zone Schools',
    city: 'Umm Al Quwain',
    emirate: 'Umm Al Quwain',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PUBLIC',
    curriculum: 'NATIONAL',
    isVerified: true,
    munProgramActive: false,
    studentCount: 3200,
    teacherCount: 250,
    website: '',
  },
  {
    id: 'uae-uaq-2',
    name: 'Al Salam Private School UAQ',
    officialName: 'Al Salam Private School Umm Al Quwain',
    city: 'Umm Al Quwain',
    emirate: 'Umm Al Quwain',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'CBSE',
    isVerified: false,
    munProgramActive: false,
    studentCount: 500,
    teacherCount: 40,
    website: '',
  },
  // ===== UAE — Al Ain =====
  {
    id: 'uae-aa-1',
    name: 'Al Ain English Speaking School',
    officialName: 'Al Ain English Speaking School',
    city: 'Al Ain',
    emirate: 'Al Ain',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 20,
    studentCount: 1000,
    teacherCount: 85,
    website: 'https://www.aesschool.com',
  },
  {
    id: 'uae-aa-2',
    name: 'Al Dhafra Private School',
    officialName: 'Al Dhafra Private School',
    city: 'Al Ain',
    emirate: 'Al Ain',
    country: 'UAE',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1300,
    teacherCount: 100,
    website: '',
  },
  // ===== Qatar =====
  {
    id: 'qa-1',
    name: 'Qatar Academy',
    officialName: 'Qatar Academy Doha',
    city: 'Doha',
    emirate: 'Doha',
    country: 'Qatar',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 70,
    studentCount: 1800,
    teacherCount: 160,
    website: 'https://www.qataracademy.qa',
  },
  {
    id: 'qa-2',
    name: 'American School of Doha',
    officialName: 'American School of Doha',
    city: 'Doha',
    emirate: 'Doha',
    country: 'Qatar',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 50,
    studentCount: 1500,
    teacherCount: 130,
    website: 'https://www.asd.qa',
  },
  {
    id: 'qa-3',
    name: 'Doha College',
    officialName: 'Doha College',
    city: 'Doha',
    emirate: 'Doha',
    country: 'Qatar',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1700,
    teacherCount: 140,
    website: 'https://www.dohacollege.com',
  },
  {
    id: 'qa-4',
    name: 'ISL Qatar',
    officialName: 'International School of London Qatar',
    city: 'Doha',
    emirate: 'Doha',
    country: 'Qatar',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: false,
    studentCount: 800,
    teacherCount: 70,
    website: 'https://www.islqatar.com',
  },
  // ===== Oman =====
  {
    id: 'om-1',
    name: 'ABA Muscat',
    officialName: 'American British Academy Muscat',
    city: 'Muscat',
    emirate: 'Muscat',
    country: 'Oman',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'IB',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 35,
    studentCount: 950,
    teacherCount: 80,
    website: 'https://www.abaoman.org',
  },
  {
    id: 'om-2',
    name: "Sultan's School",
    officialName: "The Sultan's School",
    city: 'Muscat',
    emirate: 'Muscat',
    country: 'Oman',
    region: 'GCC',
    schoolType: 'PRIVATE',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1100,
    teacherCount: 95,
    website: 'https://www.sultansschool.edu.om',
  },
  {
    id: 'om-3',
    name: 'Muscat International School',
    officialName: 'Muscat International School',
    city: 'Muscat',
    emirate: 'Muscat',
    country: 'Oman',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1400,
    teacherCount: 110,
    website: 'https://www.mis.edu.om',
  },
  // ===== Bahrain =====
  {
    id: 'bh-1',
    name: "St. Christopher's Bahrain",
    officialName: "St. Christopher's School Bahrain",
    city: 'Manama',
    emirate: 'Manama',
    country: 'Bahrain',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 55,
    studentCount: 2200,
    teacherCount: 185,
    website: 'https://www.st-chris.net',
  },
  {
    id: 'bh-2',
    name: 'Bahrain School',
    officialName: 'Bahrain School',
    city: 'Manama',
    emirate: 'Manama',
    country: 'Bahrain',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: false,
    studentCount: 700,
    teacherCount: 60,
    website: 'https://www.bahrainschool.org',
  },
  {
    id: 'bh-3',
    name: 'British School of Bahrain',
    officialName: 'British School of Bahrain',
    city: 'Hamala',
    emirate: 'Northern Governorate',
    country: 'Bahrain',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 2800,
    teacherCount: 200,
    website: 'https://www.bsb.bh',
  },
  // ===== Kuwait =====
  {
    id: 'kw-1',
    name: 'American School of Kuwait',
    officialName: 'American School of Kuwait',
    city: 'Kuwait City',
    emirate: 'Al Asimah',
    country: 'Kuwait',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 40,
    studentCount: 1900,
    teacherCount: 160,
    website: 'https://www.ask.edu.kw',
  },
  {
    id: 'kw-2',
    name: 'British School of Kuwait',
    officialName: 'The British School of Kuwait',
    city: 'Kuwait City',
    emirate: 'Al Asimah',
    country: 'Kuwait',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 3000,
    teacherCount: 250,
    website: 'https://www.bsk.edu.kw',
  },
  {
    id: 'kw-3',
    name: 'Kuwait English School',
    officialName: 'Kuwait English School',
    city: 'Salwa',
    emirate: 'Hawalli',
    country: 'Kuwait',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 2200,
    teacherCount: 180,
    website: 'https://www.kes.edu.kw',
  },
  // ===== Saudi Arabia =====
  {
    id: 'sa-1',
    name: 'AIS Riyadh',
    officialName: 'American International School Riyadh',
    city: 'Riyadh',
    emirate: 'Riyadh',
    country: 'Saudi Arabia',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'AMERICAN',
    isVerified: true,
    munProgramActive: true,
    munProgramSize: 50,
    studentCount: 1600,
    teacherCount: 140,
    website: 'https://www.aisr.org',
  },
  {
    id: 'sa-2',
    name: 'BIS Jeddah',
    officialName: 'British International School Jeddah',
    city: 'Jeddah',
    emirate: 'Makkah',
    country: 'Saudi Arabia',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 1300,
    teacherCount: 110,
    website: 'https://www.bisj.edu.sa',
  },
  {
    id: 'sa-3',
    name: 'Dhahran British Grammar',
    officialName: 'Dhahran British Grammar School',
    city: 'Dhahran',
    emirate: 'Eastern Province',
    country: 'Saudi Arabia',
    region: 'GCC',
    schoolType: 'INTERNATIONAL',
    curriculum: 'BRITISH',
    isVerified: true,
    munProgramActive: false,
    studentCount: 900,
    teacherCount: 75,
    website: 'https://www.dbgs.org',
  },
]

// Pending school requests
const PENDING_REQUESTS: SchoolRequest[] = [
  {
    id: 'req-1',
    schoolName: 'GEMS Founders School Dubai',
    city: 'Dubai',
    country: 'UAE',
    website: 'https://www.gemsfoundersschool.com',
    requestedBy: 'Ahmed Al Maktoum',
    requesterRole: 'TEACHER',
    requestedAt: '2026-02-28T10:30:00Z',
    status: 'PENDING',
  },
  {
    id: 'req-2',
    schoolName: 'International School of Muscat',
    city: 'Muscat',
    country: 'Oman',
    website: '',
    requestedBy: 'Sara Al Balushi',
    requesterRole: 'STUDENT',
    requestedAt: '2026-02-27T14:20:00Z',
    status: 'PENDING',
  },
  {
    id: 'req-3',
    schoolName: 'Al Muntazir School',
    city: 'Dar es Salaam',
    country: 'Tanzania',
    website: 'https://www.almuntazir.org',
    requestedBy: 'Fatima Juma',
    requesterRole: 'TEACHER',
    requestedAt: '2026-02-26T09:15:00Z',
    status: 'INFO_REQUESTED',
  },
]

// ============================================================
// HELPER MAPS
// ============================================================

const COUNTRY_FLAGS: Record<Country, string> = {
  'UAE': '🇦🇪',
  'Qatar': '🇶🇦',
  'Oman': '🇴🇲',
  'Bahrain': '🇧🇭',
  'Kuwait': '🇰🇼',
  'Saudi Arabia': '🇸🇦',
}

const UAE_EMIRATES: UAEEmirate[] = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain']

const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  'PUBLIC': 'Public',
  'PRIVATE': 'Private',
  'INTERNATIONAL': 'International',
  'CHARTER': 'Charter',
}

const CURRICULUM_LABELS: Record<Curriculum, string> = {
  'AMERICAN': 'American',
  'BRITISH': 'British',
  'IB': 'IB',
  'CBSE': 'CBSE (Indian)',
  'NATIONAL': 'National',
  'OTHER': 'Other',
}

const SCHOOL_TYPE_COLORS: Record<SchoolType, string> = {
  'PUBLIC': 'bg-emerald-100 text-emerald-700',
  'PRIVATE': 'bg-sky-100 text-sky-700',
  'INTERNATIONAL': 'bg-amber-100 text-amber-700',
  'CHARTER': 'bg-purple-100 text-purple-700',
}

const CURRICULUM_COLORS: Record<Curriculum, string> = {
  'AMERICAN': 'bg-red-50 text-red-600 border-red-200',
  'BRITISH': 'bg-blue-50 text-blue-600 border-blue-200',
  'IB': 'bg-orange-50 text-orange-600 border-orange-200',
  'CBSE': 'bg-teal-50 text-teal-600 border-teal-200',
  'NATIONAL': 'bg-green-50 text-green-600 border-green-200',
  'OTHER': 'bg-gray-50 text-gray-600 border-gray-200',
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function SchoolDirectory() {
  const { user } = useAuthStore()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'directory' | 'registration' | 'admin'>('directory')
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [emirateFilter, setEmirateFilter] = useState<string>('all')
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<string>('all')
  const [curriculumFilter, setCurriculumFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Registration flow state
  const [regSearch, setRegSearch] = useState('')
  const [showNotListedForm, setShowNotListedForm] = useState(false)
  const [isOtherSchoolSelected, setIsOtherSchoolSelected] = useState(false)
  const [customSchoolName, setCustomSchoolName] = useState('')
  const [notListedForm, setNotListedForm] = useState({
    schoolName: '',
    city: '',
    emirate: '',
    country: 'UAE',
    curriculum: 'OTHER' as Curriculum,
    website: '',
    yourRole: 'STUDENT',
    additionalInfo: '',
  })
  const [regSubmitted, setRegSubmitted] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  // Admin approval state
  const [pendingRequests, setPendingRequests] = useState<SchoolRequest[]>(PENDING_REQUESTS)
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  // ============================================================
  // FILTERED SCHOOLS
  // ============================================================

  const filteredSchools = useMemo(() => {
    let result = SCHOOLS

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.officialName.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.emirate.toLowerCase().includes(q)
      )
    }

    if (countryFilter !== 'all') {
      result = result.filter((s) => s.country === countryFilter)
    }

    if (emirateFilter !== 'all') {
      result = result.filter((s) => s.emirate === emirateFilter)
    }

    if (schoolTypeFilter !== 'all') {
      result = result.filter((s) => s.schoolType === schoolTypeFilter)
    }

    if (curriculumFilter !== 'all') {
      result = result.filter((s) => s.curriculum === curriculumFilter)
    }

    return result
  }, [searchQuery, countryFilter, emirateFilter, schoolTypeFilter, curriculumFilter])

  // Registration autocomplete results
  const regSearchResults = useMemo(() => {
    if (!regSearch.trim()) return []
    const q = regSearch.toLowerCase()
    return SCHOOLS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.officialName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [regSearch])

  const activeFilterCount = [countryFilter, emirateFilter, schoolTypeFilter, curriculumFilter].filter(
    (f) => f !== 'all'
  ).length

  const clearFilters = useCallback(() => {
    setCountryFilter('all')
    setEmirateFilter('all')
    setSchoolTypeFilter('all')
    setCurriculumFilter('all')
  }, [])

  const openSchoolProfile = useCallback((school: School) => {
    setSelectedSchool(school)
    setShowProfileModal(true)
  }, [])

  // ============================================================
  // ADMIN ACTIONS
  // ============================================================

  const handleApprove = useCallback((id: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id))
    setSelectedRequests((prev) => prev.filter((rid) => rid !== id))
  }, [])

  const handleReject = useCallback(() => {
    if (!rejectTarget) return
    setPendingRequests((prev) =>
      prev.map((r) =>
        r.id === rejectTarget ? { ...r, status: 'REJECTED' as const, rejectReason } : r
      )
    )
    setRejectDialogOpen(false)
    setRejectTarget(null)
    setRejectReason('')
    setSelectedRequests((prev) => prev.filter((rid) => rid !== rejectTarget))
  }, [rejectTarget, rejectReason])

  const handleBulkApprove = useCallback(() => {
    setPendingRequests((prev) => prev.filter((r) => !selectedRequests.includes(r.id)))
    setSelectedRequests([])
  }, [selectedRequests])

  const toggleRequestSelection = useCallback((id: string) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    )
  }, [])

  const handleRequestInfo = useCallback((id: string) => {
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'INFO_REQUESTED' as const } : r))
    )
  }, [])

  // ============================================================
  // STATS
  // ============================================================

  const stats = useMemo(() => ({
    total: SCHOOLS.length,
    verified: SCHOOLS.filter((s) => s.isVerified).length,
    munActive: SCHOOLS.filter((s) => s.munProgramActive).length,
    countries: [...new Set(SCHOOLS.map((s) => s.country))].length,
  }), [])

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A4B] flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#0D7377]" />
            {t('schools.title')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Verified UAE &amp; GCC schools — find your school, check MUN program status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#0D7377]/10 text-[#0D7377] border-0 px-3 py-1 text-xs font-medium">
            {stats.total} Schools
          </Badge>
          <Badge className="bg-[#D4A843]/10 text-[#D4A843] border-0 px-3 py-1 text-xs font-medium">
            {stats.munActive} MUN Active
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Schools', value: stats.total, icon: Building2, color: '#0D7377' },
          { label: 'Verified', value: stats.verified, icon: ShieldCheck, color: '#059669' },
          { label: 'MUN Programs', value: stats.munActive, icon: Globe, color: '#D4A843' },
          { label: 'Countries', value: stats.countries, icon: MapPin, color: '#6366F1' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#E8DED0] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1B3A4B]">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="bg-white border border-[#E8DED0]">
          <TabsTrigger value="directory" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-white">
            <LayoutGrid className="w-4 h-4 mr-1.5" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="registration" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-white">
            <GraduationCap className="w-4 h-4 mr-1.5" />
            Registration
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-white">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Approval Queue
            </TabsTrigger>
          )}
        </TabsList>

        {/* ============== DIRECTORY TAB ============== */}
        <TabsContent value="directory" className="mt-4 space-y-4">
          {/* Search & Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('schools.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`border-[#E8DED0] ${showFilters ? 'bg-[#0D7377]/5 text-[#0D7377]' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-1.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1.5 bg-[#0D7377] text-white text-[10px] px-1.5 min-w-[18px] h-[18px] border-0">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              <div className="border border-[#E8DED0] rounded-md flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-r-none px-2.5 ${viewMode === 'grid' ? 'bg-[#0D7377]/10 text-[#0D7377]' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-l-none px-2.5 ${viewMode === 'list' ? 'bg-[#0D7377]/10 text-[#0D7377]' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl border border-[#E8DED0] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#1B3A4B]">Filter Schools</span>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-[#0D7377] h-7 text-xs" onClick={clearFilters}>
                        Clear all
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5">Country</Label>
                      <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); if (v !== 'UAE') setEmirateFilter('all'); }}>
                        <SelectTrigger className="h-9 text-sm border-[#E8DED0]">
                          <SelectValue placeholder="All Countries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Countries</SelectItem>
                          {Object.entries(COUNTRY_FLAGS).map(([country, flag]) => (
                            <SelectItem key={country} value={country}>
                              {flag} {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {countryFilter === 'UAE' && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5">Emirate</Label>
                        <Select value={emirateFilter} onValueChange={setEmirateFilter}>
                          <SelectTrigger className="h-9 text-sm border-[#E8DED0]">
                            <SelectValue placeholder="All Emirates" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Emirates</SelectItem>
                            {UAE_EMIRATES.map((em) => (
                              <SelectItem key={em} value={em}>{em}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5">School Type</Label>
                      <Select value={schoolTypeFilter} onValueChange={setSchoolTypeFilter}>
                        <SelectTrigger className="h-9 text-sm border-[#E8DED0]">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {Object.entries(SCHOOL_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5">Curriculum</Label>
                      <Select value={curriculumFilter} onValueChange={setCurriculumFilter}>
                        <SelectTrigger className="h-9 text-sm border-[#E8DED0]">
                          <SelectValue placeholder="All Curricula" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Curricula</SelectItem>
                          {Object.entries(CURRICULUM_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-[#1B3A4B]">{filteredSchools.length}</span> of{' '}
            {SCHOOLS.length} schools
          </div>

          {/* School Cards - Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredSchools.map((school, idx) => (
                  <motion.div
                    key={school.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    layout
                  >
                    <Card
                      className="cursor-pointer hover:shadow-md hover:border-[#0D7377]/30 transition-all group border-[#E8DED0]"
                      onClick={() => openSchoolProfile(school)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{COUNTRY_FLAGS[school.country]}</span>
                              <h3 className="font-semibold text-[#1B3A4B] text-sm truncate group-hover:text-[#0D7377] transition-colors">
                                {school.name}
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {school.city}, {school.emirate}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {school.isVerified && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mb-3">
                          <Badge className={`text-[10px] px-1.5 py-0 border-0 ${SCHOOL_TYPE_COLORS[school.schoolType]}`}>
                            {SCHOOL_TYPE_LABELS[school.schoolType]}
                          </Badge>
                          <Badge className={`text-[10px] px-1.5 py-0 border ${CURRICULUM_COLORS[school.curriculum]}`}>
                            {CURRICULUM_LABELS[school.curriculum]}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {school.studentCount.toLocaleString()} students
                          </div>
                          {school.munProgramActive ? (
                            <div className="flex items-center gap-1 text-[#D4A843]">
                              <Globe className="w-3 h-3" />
                              <span className="font-medium">MUN Active</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60">No MUN</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredSchools.map((school, idx) => (
                  <motion.div
                    key={school.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.02 }}
                    layout
                  >
                    <div
                      className="bg-white rounded-lg border border-[#E8DED0] p-3 flex items-center gap-4 cursor-pointer hover:border-[#0D7377]/30 hover:shadow-sm transition-all group"
                      onClick={() => openSchoolProfile(school)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#0D7377]/10 flex items-center justify-center shrink-0">
                        <span className="text-lg">{COUNTRY_FLAGS[school.country]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#1B3A4B] text-sm truncate group-hover:text-[#0D7377] transition-colors">
                            {school.name}
                          </h3>
                          {school.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {school.city}, {school.emirate}, {school.country}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${SCHOOL_TYPE_COLORS[school.schoolType]}`}>
                          {SCHOOL_TYPE_LABELS[school.schoolType]}
                        </Badge>
                        <Badge className={`text-[10px] px-1.5 py-0 border ${CURRICULUM_COLORS[school.curriculum]}`}>
                          {CURRICULUM_LABELS[school.curriculum]}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 w-24 text-right">
                        {school.studentCount.toLocaleString()} students
                      </div>
                      <div className="shrink-0 w-20 text-right">
                        {school.munProgramActive ? (
                          <div className="flex items-center gap-1 text-[#D4A843] justify-end">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">MUN</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredSchools.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-[#1B3A4B]">No schools found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              <Button variant="outline" className="mt-3 border-[#E8DED0]" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ============== REGISTRATION TAB ============== */}
        <TabsContent value="registration" className="mt-4 space-y-4">
          <Card className="border-[#E8DED0]">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-[#1B3A4B] mb-1">Select Your School</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Find and select your school during registration. If your school is not listed, you can request to add it.
              </p>

              {!regSubmitted ? (
                <>
                  {!showNotListedForm ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Type your school name..."
                          value={regSearch}
                          onChange={(e) => { setRegSearch(e.target.value); setIsOtherSchoolSelected(false) }}
                          className="pl-10 bg-white border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                        />
                      </div>

                      {/* Autocomplete results */}
                      {regSearch.trim() && (
                        <div className="bg-white border border-[#E8DED0] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {regSearchResults.length > 0 ? (
                            regSearchResults.map((school) => (
                              <button
                                key={school.id}
                                className="w-full text-left px-4 py-2.5 hover:bg-[#0D7377]/5 transition-colors flex items-center gap-3 border-b border-[#E8DED0]/50 last:border-0"
                                onClick={() => {
                                  setRegSearch(school.name)
                                  setIsOtherSchoolSelected(false)
                                }}
                              >
                                <div className="w-8 h-8 rounded-lg bg-[#0D7377]/10 flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4 text-[#0D7377]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-[#1B3A4B] truncate">
                                    {school.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {COUNTRY_FLAGS[school.country]} {school.city}, {school.country} · {CURRICULUM_LABELS[school.curriculum]}
                                  </div>
                                </div>
                                {school.isVerified && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                              No schools match &quot;{regSearch}&quot;
                            </div>
                          )}
                          {/* "Other School" option at bottom of dropdown */}
                          <div className="border-t-2 border-[#D4A843]/30">
                            <button
                              className="w-full text-left px-4 py-3 hover:bg-[#D4A843]/5 transition-colors flex items-center gap-3"
                              onClick={() => {
                                setIsOtherSchoolSelected(true)
                                setCustomSchoolName(regSearch)
                              }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-4 h-4 text-[#D4A843]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-[#D4A843]">
                                  Other School — Not Listed
                                </div>
                                <div className="text-xs text-[#D4A843]/70">
                                  Select this if your school is not in our directory. You can type your school name manually.
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Manual school name input when "Other School" is selected */}
                      {isOtherSchoolSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#D4A843]/5 border border-[#D4A843]/30 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-[#D4A843]" />
                            <span className="text-sm font-medium text-[#D4A843]">Your school is not in our directory yet</span>
                          </div>
                          <div>
                            <Label className="text-sm text-[#1B3A4B]">Enter your school name</Label>
                            <Input
                              placeholder="Type your school name exactly as it appears"
                              value={customSchoolName}
                              onChange={(e) => setCustomSchoolName(e.target.value)}
                              className="mt-1.5 border-[#E8DED0] focus-visible:ring-[#D4A843]/20"
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              className="bg-[#0D7377] hover:bg-[#0A6266] text-white"
                              disabled={!customSchoolName.trim()}
                              onClick={() => {
                                setRegSubmitted(true)
                              }}
                            >
                              Continue with &quot;{customSchoolName || 'Other School'}&quot;
                            </Button>
                            <Button
                              variant="outline"
                              className="border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843]/10"
                              onClick={() => {
                                setNotListedForm((f) => ({ ...f, schoolName: customSchoolName }))
                                setShowNotListedForm(true)
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Request School Addition Instead
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You can proceed with registration using your school name, or submit a request to have it officially added to the directory.
                          </p>
                        </motion.div>
                      )}

                      {/* Quick access: Popular Schools */}
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-[#1B3A4B] mb-2">Popular Schools</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SCHOOLS.filter((s) => s.munProgramActive).slice(0, 6).map((school) => (
                            <button
                              key={school.id}
                              className="text-left p-3 rounded-lg border border-[#E8DED0] hover:border-[#0D7377]/30 hover:bg-[#0D7377]/5 transition-all"
                              onClick={() => { setRegSearch(school.name); setIsOtherSchoolSelected(false) }}
                            >
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#D4A843] shrink-0" />
                                <span className="text-sm font-medium text-[#1B3A4B] truncate">{school.name}</span>
                              </div>
                              <div className="text-xs text-muted-foreground ml-6">
                                {COUNTRY_FLAGS[school.country]} {school.city}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Request School Addition link at bottom */}
                      <div className="mt-4 pt-4 border-t border-[#E8DED0]">
                        <button
                          className="flex items-center gap-2 text-sm text-[#0D7377] hover:text-[#0A6266] font-medium transition-colors"
                          onClick={() => setShowNotListedForm(true)}
                        >
                          <Send className="w-4 h-4" />
                          Request School Addition — Submit your school to be added to the directory
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Request School Addition Form */
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => setShowNotListedForm(false)}
                        >
                          ← Back
                        </Button>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800">
                          Your school addition request will be reviewed by our team before being added to the directory. This typically takes 1–3 business days. You&apos;ll receive a notification once it&apos;s approved.
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-[#1B3A4B]">School Name *</Label>
                          <Input
                            placeholder="Official school name"
                            value={notListedForm.schoolName}
                            onChange={(e) => setNotListedForm((f) => ({ ...f, schoolName: e.target.value }))}
                            className="mt-1.5 border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-[#1B3A4B]">City *</Label>
                          <Input
                            placeholder="City"
                            value={notListedForm.city}
                            onChange={(e) => setNotListedForm((f) => ({ ...f, city: e.target.value }))}
                            className="mt-1.5 border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-[#1B3A4B]">Emirate</Label>
                          <Select value={notListedForm.emirate} onValueChange={(v) => setNotListedForm((f) => ({ ...f, emirate: v }))}>
                            <SelectTrigger className="mt-1.5 border-[#E8DED0]">
                              <SelectValue placeholder="Select emirate" />
                            </SelectTrigger>
                            <SelectContent>
                              {UAE_EMIRATES.map((em) => (
                                <SelectItem key={em} value={em}>{em}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-[#1B3A4B]">Country</Label>
                          <Select value={notListedForm.country} onValueChange={(v) => setNotListedForm((f) => ({ ...f, country: v }))}>
                            <SelectTrigger className="mt-1.5 border-[#E8DED0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(COUNTRY_FLAGS).map(([country, flag]) => (
                                <SelectItem key={country} value={country}>
                                  {flag} {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-[#1B3A4B]">Curriculum</Label>
                          <Select value={notListedForm.curriculum} onValueChange={(v) => setNotListedForm((f) => ({ ...f, curriculum: v as Curriculum }))}>
                            <SelectTrigger className="mt-1.5 border-[#E8DED0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CURRICULUM_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm text-[#1B3A4B]">Website (optional)</Label>
                          <Input
                            placeholder="https://"
                            value={notListedForm.website}
                            onChange={(e) => setNotListedForm((f) => ({ ...f, website: e.target.value }))}
                            className="mt-1.5 border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-[#1B3A4B]">Your Role at School</Label>
                          <Select value={notListedForm.yourRole} onValueChange={(v) => setNotListedForm((f) => ({ ...f, yourRole: v }))}>
                            <SelectTrigger className="mt-1.5 border-[#E8DED0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="TEACHER">Teacher / Faculty</SelectItem>
                              <SelectItem value="ADMIN">School Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-sm text-[#1B3A4B]">Additional Info (optional)</Label>
                          <Textarea
                            placeholder="Any additional details about the school, MUN program, etc."
                            value={notListedForm.additionalInfo}
                            onChange={(e) => setNotListedForm((f) => ({ ...f, additionalInfo: e.target.value }))}
                            className="mt-1.5 border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                            rows={2}
                          />
                        </div>
                      </div>
                      <Button
                        className="bg-[#0D7377] hover:bg-[#0A6266] text-white"
                        disabled={!notListedForm.schoolName || !notListedForm.city}
                        onClick={() => setRegSubmitted(true)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit School Addition Request
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                /* Submission success */
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-[#1B3A4B]">
                    {isOtherSchoolSelected ? 'Registered with Custom School!' : 'Request Submitted!'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    {isOtherSchoolSelected
                      ? `You have been registered with "${customSchoolName}". Our team will verify and add your school to the directory.`
                      : 'Your school addition request has been submitted. Our team will review it within 1–3 business days. You\'ll receive a notification once it\'s approved.'
                    }
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-[#E8DED0]"
                    onClick={() => {
                      setRegSubmitted(false)
                      setShowNotListedForm(false)
                      setIsOtherSchoolSelected(false)
                      setRegSearch('')
                      setCustomSchoolName('')
                      setNotListedForm({ schoolName: '', city: '', emirate: '', country: 'UAE', curriculum: 'OTHER' as Curriculum, website: '', yourRole: 'STUDENT', additionalInfo: '' })
                    }}
                  >
                    Submit Another Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request School Addition Card — always visible below registration */}
          {!regSubmitted && !showNotListedForm && (
            <Card className="border-[#D4A843]/30 bg-[#D4A843]/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#D4A843]/20 flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5 text-[#D4A843]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#1B3A4B]">Don&apos;t see your school?</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submit a request to have your school added to the DiplomatiQ directory. Our team reviews all requests within 1–3 business days.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843]/10"
                      onClick={() => setShowNotListedForm(true)}
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Request School Addition
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ============== ADMIN APPROVAL TAB ============== */}
        {isAdmin && (
          <TabsContent value="admin" className="mt-4 space-y-4">
            {/* Bulk actions */}
            {selectedRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0D7377]/5 border border-[#0D7377]/20 rounded-lg p-3 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-[#0D7377]">
                  {selectedRequests.length} request(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleBulkApprove}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Bulk Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      selectedRequests.forEach((id) => {
                        setRejectTarget(id)
                      })
                      setRejectDialogOpen(true)
                    }}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Bulk Reject
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Pending requests list */}
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-[#1B3A4B]">All caught up!</h3>
                  <p className="text-sm text-muted-foreground mt-1">No pending school verification requests</p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-[#E8DED0] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedRequests.includes(req.id)}
                        onCheckedChange={() => toggleRequestSelection(req.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#1B3A4B] text-sm">{req.schoolName}</h3>
                          <Badge
                            className={`text-[10px] px-1.5 py-0 border-0 ${
                              req.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-700'
                                : req.status === 'INFO_REQUESTED'
                                ? 'bg-sky-100 text-sky-700'
                                : req.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {req.status === 'INFO_REQUESTED' ? 'Info Requested' : req.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {req.city}, {req.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {req.requestedBy} ({req.requesterRole})
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(req.requestedAt).toLocaleDateString()}
                          </span>
                          {req.website && (
                            <span className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              <a
                                href={req.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0D7377] hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Website
                              </a>
                            </span>
                          )}
                        </div>
                        {req.status === 'REJECTED' && req.rejectReason && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                            Rejection reason: {req.rejectReason}
                          </div>
                        )}
                        {req.status === 'INFO_REQUESTED' && (
                          <div className="mt-2 text-xs text-sky-700 bg-sky-50 rounded p-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Additional information has been requested from the submitter.
                          </div>
                        )}
                      </div>
                      {req.status !== 'REJECTED' && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                            onClick={() => handleApprove(req.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 h-8"
                            onClick={() => {
                              setRejectTarget(req.id)
                              setRejectDialogOpen(true)
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                          {req.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-sky-200 text-sky-600 hover:bg-sky-50 h-8"
                              onClick={() => handleRequestInfo(req.id)}
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-1" />
                              Request Info
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* ============== SCHOOL PROFILE MODAL ============== */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedSchool && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{COUNTRY_FLAGS[selectedSchool.country]}</span>
                  <DialogTitle className="text-[#1B3A4B]">{selectedSchool.officialName}</DialogTitle>
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  {selectedSchool.city}, {selectedSchool.emirate}, {selectedSchool.country}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${SCHOOL_TYPE_COLORS[selectedSchool.schoolType]} border-0 text-xs px-2.5 py-1`}>
                    {SCHOOL_TYPE_LABELS[selectedSchool.schoolType]}
                  </Badge>
                  <Badge className={`${CURRICULUM_COLORS[selectedSchool.curriculum]} text-xs px-2.5 py-1`}>
                    {CURRICULUM_LABELS[selectedSchool.curriculum]} Curriculum
                  </Badge>
                  {selectedSchool.isVerified && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs px-2.5 py-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* MUN Program Status */}
                <div
                  className={`rounded-lg p-4 ${
                    selectedSchool.munProgramActive
                      ? 'bg-[#D4A843]/10 border border-[#D4A843]/30'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe
                      className={`w-5 h-5 ${
                        selectedSchool.munProgramActive ? 'text-[#D4A843]' : 'text-gray-400'
                      }`}
                    />
                    <span className={`font-semibold text-sm ${selectedSchool.munProgramActive ? 'text-[#D4A843]' : 'text-gray-500'}`}>
                      MUN Program {selectedSchool.munProgramActive ? 'Active' : 'Not Active'}
                    </span>
                  </div>
                  {selectedSchool.munProgramActive && selectedSchool.munProgramSize && (
                    <p className="text-xs text-[#D4A843]/80 ml-7">
                      ~{selectedSchool.munProgramSize} active delegates
                    </p>
                  )}
                  {!selectedSchool.munProgramActive && (
                    <p className="text-xs text-muted-foreground ml-7">
                      This school doesn&apos;t have an active MUN program yet. Be the first to start one!
                    </p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Users className="w-3.5 h-3.5" />
                      Students
                    </div>
                    <div className="font-bold text-[#1B3A4B]">{selectedSchool.studentCount.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Teachers
                    </div>
                    <div className="font-bold text-[#1B3A4B]">{selectedSchool.teacherCount?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Location
                    </div>
                    <div className="text-sm font-medium text-[#1B3A4B]">
                      {selectedSchool.city}, {selectedSchool.emirate}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Globe className="w-3.5 h-3.5" />
                      Region
                    </div>
                    <div className="text-sm font-medium text-[#1B3A4B]">{selectedSchool.region}</div>
                  </div>
                </div>

                {/* Website */}
                {selectedSchool.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-[#0D7377]" />
                    <a
                      href={selectedSchool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#0D7377] hover:underline"
                    >
                      {selectedSchool.website}
                    </a>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 bg-[#0D7377] hover:bg-[#0A6266] text-white">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Request to Join
                  </Button>
                  {user?.role === 'TEACHER' && (
                    <Button variant="outline" className="flex-1 border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843]/10">
                      <Globe className="w-4 h-4 mr-2" />
                      Manage MUN Program
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============== REJECT DIALOG ============== */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B3A4B]">Reject School Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. The requester will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm">Rejection Reason</Label>
            <Textarea
              placeholder="e.g., School already exists in the directory, insufficient information..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
              rows={3}
            />
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" className="border-[#E8DED0]" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!rejectReason.trim()}
                onClick={handleReject}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
