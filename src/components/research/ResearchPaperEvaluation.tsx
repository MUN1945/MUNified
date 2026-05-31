'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileSearch, Upload, FileText, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, BookOpen, PenTool, Globe, Brain, Lightbulb,
  Target, TrendingUp, Clock, Star, ThumbsUp, ThumbsDown, MessageSquare,
  Eye, ArrowRight, Sparkles, Shield, BarChart3, Users, Calendar,
  FileUp, ClipboardPaste, RotateCcw, Award, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts'
import { useAuthStore } from '@/lib/store'

// ============================================================
// TYPES
// ============================================================

interface EvaluationResult {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  citationQuality: { score: number; analysis: string }
  researchDepth: { score: number; analysis: string }
  writingQuality: { score: number; analysis: string }
  diplomacyRelevance: { score: number; analysis: string }
  argumentQuality: { score: number; analysis: string }
  analyticalThinking: { score: number; analysis: string }
  aiDetection: { aiContentPercentage: number; confidence: number; flaggedSections: string[] }
  originalityScore: number
  authenticityScore: number
  improvementRoadmap: { shortTerm: string[]; mediumTerm: string[]; longTerm: string[] }
}

interface Submission {
  id: string
  studentName: string
  studentInitials: string
  paperTitle: string
  score: number
  aiPercentage: number
  status: 'pending' | 'reviewed' | 'returned'
  date: string
  evaluation: EvaluationResult
  teacherComment?: string
  teacherRating?: number
}

// ============================================================
// DEFAULT EVALUATION DATA
// ============================================================

const DEFAULT_EVALUATION: EvaluationResult = {
  overallScore: 72,
  strengths: [
    'Strong understanding of UN Security Council procedures and dynamics',
    'Well-structured arguments with clear logical progression',
    'Good use of primary sources including UN resolutions and treaty texts',
    'Effective policy recommendations that are actionable and realistic',
  ],
  weaknesses: [
    'Limited engagement with counter-arguments and opposing perspectives',
    'Citation format inconsistent — mixes APA and Chicago styles',
    'Some claims lack supporting evidence, particularly regarding economic impacts',
    'Conclusion does not fully synthesize the main arguments presented',
  ],
  recommendations: [
    'Include a dedicated section addressing counter-arguments to strengthen analytical depth',
    'Standardize citation format throughout the paper (recommend APA 7th edition)',
    'Add quantitative data or statistics to support claims about economic impacts',
    'Rewrite conclusion to integrate key findings and explicitly connect to the thesis',
  ],
  citationQuality: { score: 65, analysis: 'Citations are present but inconsistent in format. Some claims lack proper attribution. Bibliography is incomplete with 3 missing references cited in-text.' },
  researchDepth: { score: 70, analysis: 'Good primary source research but limited secondary academic analysis. Would benefit from engagement with scholarly journal articles and policy think-tank reports.' },
  writingQuality: { score: 78, analysis: 'Generally clear and well-organized writing. Some paragraphs could be more concise. Transitions between sections could be smoother.' },
  diplomacyRelevance: { score: 82, analysis: 'Strong connection to MUN committee topics. Good understanding of diplomatic frameworks and negotiation dynamics. Policy recommendations are diplomatically sound.' },
  argumentQuality: { score: 68, analysis: 'Arguments are logical but would benefit from addressing counter-arguments more thoroughly. Some claims need stronger evidence support.' },
  analyticalThinking: { score: 71, analysis: 'Shows analytical capability but tends toward description over deep analysis. Critical evaluation of sources and their limitations would strengthen the paper.' },
  aiDetection: { aiContentPercentage: 18, confidence: 85, flaggedSections: ['Paragraph 3 shows AI-like phrasing patterns', 'Some transitions between sections appear AI-generated'] },
  originalityScore: 76,
  authenticityScore: 82,
  improvementRoadmap: {
    shortTerm: ['Standardize all citations to APA format', 'Add evidence for unsupported claims in Section 2', 'Strengthen conclusion with synthesis of main points'],
    mediumTerm: ['Develop counter-argument analysis section', 'Expand bibliography with peer-reviewed sources', 'Improve analytical depth beyond descriptive writing'],
    longTerm: ['Practice integrating multiple analytical frameworks', 'Develop original theoretical contributions', 'Build expertise in primary source analysis methodology'],
  },
}

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 's1', studentName: 'Elena Vasquez', studentInitials: 'EV',
    paperTitle: 'Nuclear Non-Proliferation in the 21st Century: Challenges and Pathways',
    score: 72, aiPercentage: 18, status: 'pending', date: '2026-02-28',
    evaluation: DEFAULT_EVALUATION,
  },
  {
    id: 's2', studentName: 'Kai Nakamura', studentInitials: 'KN',
    paperTitle: 'Security Council Reform: Expanding Permanent Membership',
    score: 88, aiPercentage: 8, status: 'reviewed', date: '2026-02-26',
    evaluation: { ...DEFAULT_EVALUATION, overallScore: 88, aiDetection: { aiContentPercentage: 8, confidence: 90, flaggedSections: [] } },
  },
  {
    id: 's3', studentName: 'Fatima Al-Rashid', studentInitials: 'FA',
    paperTitle: 'Climate-Induced Migration: A Human Security Framework',
    score: 45, aiPercentage: 42, status: 'returned', date: '2026-02-25',
    evaluation: {
      ...DEFAULT_EVALUATION, overallScore: 45,
      aiDetection: { aiContentPercentage: 42, confidence: 88, flaggedSections: ['Large sections appear AI-generated', 'Paragraph structure follows common AI patterns', 'Vocabulary usage suggests AI assistance'] },
      weaknesses: [...DEFAULT_EVALUATION.weaknesses, 'Excessive AI-generated content detected (42%)', 'Lacks personal voice and analytical perspective'],
    },
  },
  {
    id: 's4', studentName: 'Lucas Schmidt', studentInitials: 'LS',
    paperTitle: 'Global Trade Equity: Perspectives from the Global South',
    score: 76, aiPercentage: 12, status: 'pending', date: '2026-02-24',
    evaluation: { ...DEFAULT_EVALUATION, overallScore: 76, aiDetection: { aiContentPercentage: 12, confidence: 82, flaggedSections: ['Minor AI-like phrasing in introduction'] } },
  },
  {
    id: 's5', studentName: 'Priya Sharma', studentInitials: 'PS',
    paperTitle: 'The R2P Doctrine: Sovereignty vs. Humanitarian Intervention',
    score: 91, aiPercentage: 5, status: 'reviewed', date: '2026-02-22',
    evaluation: { ...DEFAULT_EVALUATION, overallScore: 91, aiDetection: { aiContentPercentage: 5, confidence: 92, flaggedSections: [] }, originalityScore: 94, authenticityScore: 95 },
  },
  {
    id: 's6', studentName: 'Oliver Brooks', studentInitials: 'OB',
    paperTitle: 'Cybersecurity Governance in International Relations',
    score: 63, aiPercentage: 31, status: 'pending', date: '2026-02-20',
    evaluation: {
      ...DEFAULT_EVALUATION, overallScore: 63,
      aiDetection: { aiContentPercentage: 31, confidence: 78, flaggedSections: ['Several paragraphs show AI-generated patterns', 'Transition sentences appear AI-crafted'] },
    },
  },
]

const AI_THRESHOLD = 25

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getScoreColor(score: number): string {
  if (score >= 85) return '#D4A843'
  if (score >= 70) return '#059669'
  if (score >= 50) return '#F59E0B'
  return '#EF4444'
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Needs Improvement'
  return 'Insufficient'
}

function getScoreTextColor(score: number): string {
  if (score >= 85) return 'text-[#D4A843]'
  if (score >= 70) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-red-500'
}

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'reviewed': return { label: 'Reviewed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'returned': return { label: 'Returned', className: 'bg-amber-50 text-amber-700 border-amber-200' }
    default: return { label: 'Pending', className: 'bg-gray-50 text-gray-600 border-gray-200' }
  }
}

// ============================================================
// ANIMATED SCORE CIRCLE
// ============================================================

function AnimatedScoreCircle({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#E8DED0" strokeWidth="8" opacity={0.4}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-0.5">out of 100</span>
      </div>
    </div>
  )
}

// ============================================================
// AI DETECTION GAUGE
// ============================================================

function AIDetectionGauge({ percentage, threshold, confidence }: { percentage: number; threshold: number; confidence: number }) {
  const isOverThreshold = percentage > threshold
  const gaugeColor = isOverThreshold ? '#EF4444' : '#059669'
  const angle = (percentage / 100) * 180
  const thresholdAngle = (threshold / 100) * 180

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none" stroke="#E8DED0" strokeWidth="12" opacity={0.3}
          />
          {/* Threshold marker */}
          <line
            x1={20 + 160 * (threshold / 100)}
            y1={90 - Math.sin((thresholdAngle * Math.PI) / 180) * 80}
            x2={20 + 160 * (threshold / 100)}
            y2={90}
            stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2"
          />
          {/* Value arc */}
          <motion.path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none" stroke={gaugeColor} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
            initial={{ strokeDasharray: '0 251.2' }}
            animate={{ strokeDasharray: `${(percentage / 100) * 251.2} 251.2` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
          />
          {/* Needle */}
          <motion.line
            x1="100" y1="90"
            x2={100 + 70 * Math.cos(((180 - angle) * Math.PI) / 180)}
            y2={90 - 70 * Math.sin(((180 - angle) * Math.PI) / 180)}
            stroke="#1B3A4B" strokeWidth="2" strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          />
          <circle cx="100" cy="90" r="5" fill="#1B3A4B" />
        </svg>
        {/* Center value */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <motion.span
            className={`text-2xl font-bold ${isOverThreshold ? 'text-red-500' : 'text-emerald-600'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      <div className="text-center mt-1">
        <div className="text-xs text-muted-foreground">AI Content Detected</div>
        <div className="flex items-center gap-1.5 mt-1 justify-center">
          {isOverThreshold ? (
            <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">
              <AlertTriangle className="w-3 h-3 mr-1" /> Above {threshold}% Threshold
            </Badge>
          ) : (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
              <Shield className="w-3 h-3 mr-1" /> Within {threshold}% Threshold
            </Badge>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1.5">Confidence: {confidence}%</div>
      </div>
    </div>
  )
}

// ============================================================
// SCORE BREAKDOWN CARD
// ============================================================

function ScoreBreakdownCard({ icon: Icon, title, score, analysis, delay = 0 }: {
  icon: React.ElementType; title: string; score: number; analysis: string; delay?: number
}) {
  const color = getScoreColor(score)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-[#E8DED0]/60 hover:shadow-sm transition-shadow h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[#1B3A4B]">{title}</span>
                <span className="text-lg font-bold" style={{ color }}>{score}</span>
              </div>
              <Progress value={score} className="h-1.5 mb-2" style={{ '--progress-color': color } as React.CSSProperties} />
              <p className="text-xs text-muted-foreground line-clamp-2">{analysis}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================
// IMPROVEMENT ROADMAP
// ============================================================

function ImprovementRoadmap({ roadmap }: { roadmap: EvaluationResult['improvementRoadmap'] }) {
  const sections = [
    { title: 'Short Term', items: roadmap.shortTerm, icon: Clock, color: '#0D7377', bg: 'bg-teal-50', border: 'border-teal-200' },
    { title: 'Medium Term', items: roadmap.mediumTerm, icon: TrendingUp, color: '#D4A843', bg: 'bg-amber-50', border: 'border-amber-200' },
    { title: 'Long Term', items: roadmap.longTerm, icon: Award, color: '#7C3AED', bg: 'bg-purple-50', border: 'border-purple-200' },
  ]

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
        >
          <div className={`rounded-lg border ${section.border} ${section.bg} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="w-4 h-4" style={{ color: section.color }} />
              <span className="text-sm font-semibold" style={{ color: section.color }}>{section.title}</span>
            </div>
            <div className="space-y-2">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5" style={{ borderColor: section.color }}>
                    <span className="text-[9px] font-bold" style={{ color: section.color }}>{j + 1}</span>
                  </div>
                  <span className="text-xs text-[#1B3A4B]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================
// STUDENT VIEW
// ============================================================

function StudentView() {
  const [paperText, setPaperText] = useState('')
  const [paperTitle, setPaperTitle] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [showFullReport, setShowFullReport] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const [evalError, setEvalError] = useState<string | null>(null)

  const handleEvaluate = async () => {
    if (!paperText.trim()) return
    setIsEvaluating(true)
    setEvalError(null)
    try {
      const res = await fetch('/api/research/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: paperText, title: paperTitle }),
      })
      if (res.ok) {
        const data = await res.json()
        setEvaluation(data.evaluation)
      } else {
        const errData = await res.json().catch(() => null)
        setEvalError(errData?.error || `Evaluation failed (status ${res.status}). Please try again.`)
      }
    } catch {
      setEvalError('Network error — please check your connection and try again.')
    }
    setIsEvaluating(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        setPaperText(text)
        if (!paperTitle) setPaperTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
      reader.readAsText(file)
    }
  }

  const handleReset = () => {
    setPaperText('')
    setPaperTitle('')
    setEvaluation(null)
    setShowFullReport(false)
  }

  // If evaluation is loaded, show results
  if (evaluation) {
    const scoreBreakdown = [
      { icon: BookOpen, title: 'Citation Quality', ...evaluation.citationQuality },
      { icon: FileSearch, title: 'Research Depth', ...evaluation.researchDepth },
      { icon: PenTool, title: 'Writing Quality', ...evaluation.writingQuality },
      { icon: Globe, title: 'Diplomacy Relevance', ...evaluation.diplomacyRelevance },
      { icon: Target, title: 'Argument Quality', ...evaluation.argumentQuality },
      { icon: Brain, title: 'Analytical Thinking', ...evaluation.analyticalThinking },
    ]

    const radarData = [
      { subject: 'Citations', score: evaluation.citationQuality.score },
      { subject: 'Research', score: evaluation.researchDepth.score },
      { subject: 'Writing', score: evaluation.writingQuality.score },
      { subject: 'Diplomacy', score: evaluation.diplomacyRelevance.score },
      { subject: 'Argument', score: evaluation.argumentQuality.score },
      { subject: 'Analysis', score: evaluation.analyticalThinking.score },
    ]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1B3A4B]">Evaluation Results</h2>
            <p className="text-muted-foreground mt-1">{paperTitle || 'Research Paper Analysis'}</p>
          </div>
          <Button variant="outline" onClick={handleReset} className="border-[#E8DED0]">
            <RotateCcw className="w-4 h-4 mr-2" /> Submit Another Paper
          </Button>
        </div>

        {/* Top section: Score + AI Detection + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-[#E8DED0]/60 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">Overall Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-6">
                <AnimatedScoreCircle score={evaluation.overallScore} />
                <div className="mt-3 text-center">
                  <Badge className={`border-0 ${getScoreTextColor(evaluation.overallScore)}`} style={{ backgroundColor: `${getScoreColor(evaluation.overallScore)}15` }}>
                    {getScoreLabel(evaluation.overallScore)}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 w-full">
                  <div className="text-center p-2 rounded-lg bg-[#F5F0EB]">
                    <div className="text-lg font-bold text-[#0D7377]">{evaluation.originalityScore}</div>
                    <div className="text-[10px] text-muted-foreground">Originality</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-[#F5F0EB]">
                    <div className="text-lg font-bold text-[#0D7377]">{evaluation.authenticityScore}</div>
                    <div className="text-[10px] text-muted-foreground">Authenticity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Detection */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-[#E8DED0]/60 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">AI Content Detection</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-4">
                <AIDetectionGauge
                  percentage={evaluation.aiDetection.aiContentPercentage}
                  threshold={AI_THRESHOLD}
                  confidence={evaluation.aiDetection.confidence}
                />
                {evaluation.aiDetection.flaggedSections.length > 0 && (
                  <div className="mt-4 w-full">
                    <div className="text-xs font-medium text-[#1B3A4B] mb-2">Flagged Sections:</div>
                    <ScrollArea className="max-h-24">
                      <div className="space-y-1.5">
                        {evaluation.aiDetection.flaggedSections.map((section, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs">
                            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{section}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-[#E8DED0]/60 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E8DED0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#0D7377"
                      fill="#0D7377"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Score Breakdown Cards */}
        <div>
          <h3 className="text-lg font-semibold text-[#1B3A4B] mb-3">Detailed Scores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoreBreakdown.map((item, i) => (
              <ScoreBreakdownCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                score={item.score}
                analysis={item.analysis}
                delay={0.3 + i * 0.08}
              />
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-emerald-200 bg-emerald-50/30 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <ThumbsUp className="w-5 h-5" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {evaluation.strengths.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-emerald-900">{s}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-amber-200 bg-amber-50/30 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <ThumbsDown className="w-5 h-5" /> Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {evaluation.weaknesses.map((w, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-start gap-2 p-2 rounded-lg bg-amber-50"
                    >
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-amber-900">{w}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-[#0D7377]/30 bg-[#0D7377]/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[#0D7377]">
                <Lightbulb className="w-5 h-5" /> Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evaluation.recommendations.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-start gap-2 p-3 rounded-lg bg-white/80 border border-[#0D7377]/10"
                  >
                    <ArrowRight className="w-4 h-4 text-[#0D7377] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#1B3A4B]">{r}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Improvement Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-[#E8DED0]/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[#1B3A4B]">
                <TrendingUp className="w-5 h-5 text-[#D4A843]" /> Improvement Roadmap
              </CardTitle>
              <CardDescription>A structured plan to elevate your research paper quality</CardDescription>
            </CardHeader>
            <CardContent>
              <ImprovementRoadmap roadmap={evaluation.improvementRoadmap} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Full Report (expandable) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-[#E8DED0]/60">
            <button
              onClick={() => setShowFullReport(!showFullReport)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F5F0EB]/50 transition-colors"
            >
              <CardTitle className="flex items-center gap-2 text-[#1B3A4B]">
                <FileText className="w-5 h-5 text-[#0D7377]" /> Full Evaluation Report
              </CardTitle>
              {showFullReport ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <AnimatePresence>
              {showFullReport && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <ScrollArea className="max-h-96">
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-[#1B3A4B] mb-2">Overall Assessment</h4>
                          <p className="text-muted-foreground">
                            This paper demonstrates a <strong>{getScoreLabel(evaluation.overallScore).toLowerCase()}</strong> level
                            of research quality with an overall score of <strong>{evaluation.overallScore}/100</strong>.
                            The paper shows particular strength in diplomacy relevance ({evaluation.diplomacyRelevance.score}/100)
                            and writing quality ({evaluation.writingQuality.score}/100), while needing improvement in
                            citation quality ({evaluation.citationQuality.score}/100) and argument quality ({evaluation.argumentQuality.score}/100).
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1B3A4B] mb-2">AI Content Analysis</h4>
                          <p className="text-muted-foreground">
                            {evaluation.aiDetection.aiContentPercentage}% of the content appears to be AI-generated
                            (confidence: {evaluation.aiDetection.confidence}%).
                            {evaluation.aiDetection.aiContentPercentage > AI_THRESHOLD
                              ? ' This exceeds the acceptable threshold of 25% and should be revised to reflect more original student work.'
                              : ' This is within the acceptable threshold of 25%, indicating responsible AI use.'
                            }
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1B3A4B] mb-2">Citation Quality</h4>
                          <p className="text-muted-foreground">{evaluation.citationQuality.analysis}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1B3A4B] mb-2">Research Depth</h4>
                          <p className="text-muted-foreground">{evaluation.researchDepth.analysis}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1B3A4B] mb-2">Writing Quality</h4>
                          <p className="text-muted-foreground">{evaluation.writingQuality.analysis}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1B3A4B] mb-2">Diplomacy Relevance</h4>
                          <p className="text-muted-foreground">{evaluation.diplomacyRelevance.analysis}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1B3A4B] mb-2">Argument Quality</h4>
                          <p className="text-muted-foreground">{evaluation.argumentQuality.analysis}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#1B3A4B] mb-2">Analytical Thinking</h4>
                          <p className="text-muted-foreground">{evaluation.analyticalThinking.analysis}</p>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Upload view
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0D7377]/10 flex items-center justify-center">
            <FileSearch className="w-6 h-6 text-[#0D7377]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1B3A4B]">Research Lab</h2>
            <p className="text-muted-foreground">Submit your MUN research paper for AI-powered evaluation</p>
          </div>
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-[#E8DED0]/60">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paper-title" className="text-[#1B3A4B] font-medium">Paper Title</Label>
                <Input
                  id="paper-title"
                  placeholder="e.g., Nuclear Non-Proliferation in the 21st Century"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20"
                />
              </div>

              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragOver
                    ? 'border-[#0D7377] bg-[#0D7377]/5'
                    : 'border-[#E8DED0] hover:border-[#0D7377]/40 hover:bg-[#F5F0EB]/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
              >
                <motion.div
                  animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDragOver ? 'bg-[#0D7377]/15' : 'bg-[#F5F0EB]'}`}>
                    <FileUp className={`w-7 h-7 ${isDragOver ? 'text-[#0D7377]' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1B3A4B]">Drag & drop your paper here</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports .txt files — or paste your text below</p>
                  </div>
                </motion.div>
              </div>

              {/* Text Paste Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="paper-text" className="text-[#1B3A4B] font-medium">Paper Content</Label>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ClipboardPaste className="w-3 h-3" />
                    Paste your paper text
                  </div>
                </div>
                <Textarea
                  id="paper-text"
                  placeholder="Paste your MUN research paper content here..."
                  value={paperText}
                  onChange={(e) => setPaperText(e.target.value)}
                  className="border-[#E8DED0] focus-visible:ring-[#0D7377]/20 min-h-[200px] resize-y"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{paperText.length > 0 ? `${paperText.split(/\s+/).filter(Boolean).length} words` : 'No content yet'}</span>
                  <span>Minimum 100 words recommended</span>
                </div>
              </div>

              {/* AI Threshold Info */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#0D7377]/5 border border-[#0D7377]/10">
                <Shield className="w-4 h-4 text-[#0D7377] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1B3A4B]">
                  <span className="font-medium">AI Assistance Policy: </span>
                  Responsible AI use is allowed. Our system detects AI-generated content and flags submissions
                  exceeding <strong>25% AI contribution</strong>. Original thinking and authentic analysis are valued.
                </div>
              </div>

              {/* Error Message */}
              {evalError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-800">Evaluation Failed</div>
                    <div className="text-xs text-red-600/80 mt-0.5">{evalError}</div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleEvaluate}
                disabled={!paperText.trim() || isEvaluating}
                className="w-full bg-[#0D7377] hover:bg-[#0A5C5F] text-white h-12 text-base"
              >
                {isEvaluating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span className="ml-2">Analyzing Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Evaluate Paper with AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BarChart3, title: 'Comprehensive Scoring', desc: '6-dimension analysis from citations to analytical thinking' },
          { icon: Shield, title: 'AI Detection', desc: 'Responsible AI use monitoring with 25% threshold' },
          { icon: TrendingUp, title: 'Improvement Roadmap', desc: 'Short, medium, and long-term growth plan' },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Card className="border-[#E8DED0]/60 h-full">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-[#D4A843]" />
                </div>
                <h4 className="text-sm font-semibold text-[#1B3A4B]">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// TEACHER VIEW
// ============================================================

function TeacherView() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [teacherComment, setTeacherComment] = useState('')
  const [teacherRating, setTeacherRating] = useState(0)
  const [activeTab, setActiveTab] = useState('queue')
  const [isSaving, setIsSaving] = useState(false)

  // Fetch real papers from the API
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch('/api/research?type=paper')
        if (res.ok) {
          const data = await res.json()
          const rawPapers = Array.isArray(data) ? data : (data.data || [])
          const mapped: Submission[] = rawPapers.map((p: Record<string, unknown>) => {
            const evalData = p.evaluation as Record<string, unknown> | undefined
            const aiDet = evalData?.aiDetection as { aiContentPercentage?: number; confidence?: number; flaggedSections?: string[] } | undefined
            return {
              id: String(p.id || ''),
              studentName: String((p.student as Record<string, unknown>)?.name || 'Unknown'),
              studentInitials: String((p.student as Record<string, unknown>)?.name || 'U').split(' ').map((n: string) => n[0]).join(''),
              paperTitle: String(p.title || 'Untitled'),
              score: Number(evalData?.overallScore || 0),
              aiPercentage: Number(aiDet?.aiContentPercentage || 0),
              status: (p.status === 'EVALUATED' ? 'reviewed' : p.status === 'RETURNED' ? 'returned' : 'pending') as Submission['status'],
              date: String(p.evaluatedAt || p.submittedAt || p.createdAt || new Date().toISOString()).split('T')[0],
              evaluation: evalData ? {
                overallScore: Number(evalData.overallScore || 0),
                strengths: Array.isArray(evalData.strengths) ? evalData.strengths as string[] : [],
                weaknesses: Array.isArray(evalData.weaknesses) ? evalData.weaknesses as string[] : [],
                recommendations: Array.isArray(evalData.recommendations) ? evalData.recommendations as string[] : [],
                citationQuality: (evalData.citationQuality || { score: 0, analysis: '' }) as EvaluationResult['citationQuality'],
                researchDepth: (evalData.researchDepth || { score: 0, analysis: '' }) as EvaluationResult['researchDepth'],
                writingQuality: (evalData.writingQuality || { score: 0, analysis: '' }) as EvaluationResult['writingQuality'],
                diplomacyRelevance: (evalData.diplomacyRelevance || { score: 0, analysis: '' }) as EvaluationResult['diplomacyRelevance'],
                argumentQuality: (evalData.argumentQuality || { score: 0, analysis: '' }) as EvaluationResult['argumentQuality'],
                analyticalThinking: (evalData.analyticalThinking || { score: 0, analysis: '' }) as EvaluationResult['analyticalThinking'],
                aiDetection: (evalData.aiDetection || { aiContentPercentage: 0, confidence: 0, flaggedSections: [] }) as EvaluationResult['aiDetection'],
                originalityScore: Number(evalData.originalityScore || 0),
                authenticityScore: Number(evalData.authenticityScore || 0),
                improvementRoadmap: (evalData.improvementRoadmap || { shortTerm: [], mediumTerm: [], longTerm: [] }) as EvaluationResult['improvementRoadmap'],
              } : DEFAULT_EVALUATION,
            }
          })
          setSubmissions(mapped.length > 0 ? mapped : INITIAL_SUBMISSIONS)
        } else {
          // API not available, use mock data as fallback
          setSubmissions(INITIAL_SUBMISSIONS)
        }
      } catch {
        // Network error, use mock data
        setSubmissions(INITIAL_SUBMISSIONS)
      } finally {
        setIsLoadingSubmissions(false)
      }
    }
    fetchPapers()
  }, [])

  // Class Overview Stats
  const avgScore = submissions.length > 0 ? Math.round(submissions.reduce((a, s) => a + s.score, 0) / submissions.length) : 0
  const avgAI = submissions.length > 0 ? Math.round(submissions.reduce((a, s) => a + s.aiPercentage, 0) / submissions.length) : 0
  const studentsNeedingAttention = submissions.filter(s => s.score < 50 || s.aiPercentage > AI_THRESHOLD)

  const scoreDistribution = [
    { range: '0-49', count: submissions.filter(s => s.score < 50).length, color: '#EF4444' },
    { range: '50-69', count: submissions.filter(s => s.score >= 50 && s.score < 70).length, color: '#F59E0B' },
    { range: '70-84', count: submissions.filter(s => s.score >= 70 && s.score < 85).length, color: '#059669' },
    { range: '85-100', count: submissions.filter(s => s.score >= 85).length, color: '#D4A843' },
  ]

  const progressData = [
    { month: 'Oct', avg: 58 },
    { month: 'Nov', avg: 63 },
    { month: 'Dec', avg: 61 },
    { month: 'Jan', avg: 68 },
    { month: 'Feb', avg: 72 },
  ]

  const handleOpenReview = (submission: Submission) => {
    setSelectedSubmission(submission)
    setTeacherComment(submission.teacherComment || '')
    setTeacherRating(submission.teacherRating || 0)
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoadingSubmissions && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-[#0D7377]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-[#0D7377]/30 border-t-[#0D7377] rounded-full"
            />
            <span className="text-sm font-medium">Loading submissions...</span>
          </div>
        </div>
      )}

      {!isLoadingSubmissions && (
        <>
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-lg px-4 py-2 flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-[#D4A843]" />
        <span className="text-sm font-medium text-[#D4A843]">Research Lab — Teacher View</span>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
            <FileSearch className="w-6 h-6 text-[#D4A843]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1B3A4B]">Research Lab — Teacher View</h2>
            <p className="text-muted-foreground">Review and evaluate student research submissions</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F5F0EB]">
          <TabsTrigger value="queue">Submissions Queue</TabsTrigger>
          <TabsTrigger value="overview">Class Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Submissions', value: submissions.length, icon: FileText, color: '#0D7377' },
              { label: 'Avg Score', value: avgScore, icon: BarChart3, color: '#D4A843' },
              { label: 'Avg AI Content', value: `${avgAI}%`, icon: Shield, color: avgAI > AI_THRESHOLD ? '#EF4444' : '#059669' },
              { label: 'Needs Attention', value: studentsNeedingAttention.length, icon: AlertTriangle, color: studentsNeedingAttention.length > 0 ? '#EF4444' : '#059669' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border-[#E8DED0]/60">
                  <CardContent className="p-3 flex items-center gap-2">
                    <stat.icon className="w-4 h-4 shrink-0" style={{ color: stat.color }} />
                    <div>
                      <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Submissions Table */}
          <Card className="border-[#E8DED0]/60">
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[1fr_1.5fr_80px_80px_100px_100px_80px] gap-2 px-4 py-3 border-b border-[#E8DED0]/60 text-xs font-medium text-muted-foreground">
                  <span>Student</span>
                  <span>Paper Title</span>
                  <span>Score</span>
                  <span>AI %</span>
                  <span>Status</span>
                  <span>Date</span>
                  <span>Actions</span>
                </div>
                {submissions.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-[1fr_1.5fr_80px_80px_100px_100px_80px] gap-2 px-4 py-3 border-b border-[#E8DED0]/30 hover:bg-[#F5F0EB]/50 transition-colors items-center"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="bg-[#0D7377]/10 text-[#0D7377] text-[10px]">{sub.studentInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-[#1B3A4B] truncate">{sub.studentName}</span>
                    </div>
                    <span className="text-sm text-muted-foreground truncate">{sub.paperTitle}</span>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(sub.score) }}>{sub.score}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${sub.aiPercentage > AI_THRESHOLD ? 'text-red-500' : 'text-emerald-600'}`}>
                        {sub.aiPercentage}%
                      </span>
                      {sub.aiPercentage > AI_THRESHOLD && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    </div>
                    <Badge className={`text-[10px] border ${getStatusBadge(sub.status).className}`}>
                      {getStatusBadge(sub.status).label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{sub.date}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleOpenReview(sub)}>
                      <Eye className="w-3.5 h-3.5 mr-1" /> Review
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {submissions.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 border-b border-[#E8DED0]/30"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-[#0D7377]/10 text-[#0D7377] text-[10px]">{sub.studentInitials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-[#1B3A4B]">{sub.studentName}</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: getScoreColor(sub.score) }}>{sub.score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{sub.paperTitle}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-[10px] border ${getStatusBadge(sub.status).className}`}>
                        {getStatusBadge(sub.status).label}
                      </Badge>
                      <Badge className={`text-[10px] border ${sub.aiPercentage > AI_THRESHOLD ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        AI: {sub.aiPercentage}%
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] ml-auto" onClick={() => handleOpenReview(sub)}>
                        <Eye className="w-3 h-3 mr-1" /> Review
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Average Score Card */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-[#E8DED0]/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Class Average Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center pb-4">
                  <AnimatedScoreCircle score={avgScore} size={120} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Score Distribution */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-[#E8DED0]/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Score Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={scoreDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8DED0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="range" tick={{ fontSize: 10 }} width={45} />
                      <RechartsTooltip />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Trends */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-[#E8DED0]/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Progress Trends</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8DED0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="avg" stroke="#0D7377" strokeWidth={2} dot={{ fill: '#0D7377', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Students Needing Attention */}
          {studentsNeedingAttention.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-red-200 bg-red-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5" /> Students Needing Attention
                  </CardTitle>
                  <CardDescription className="text-red-600/70">
                    Low scores (&lt;50) or high AI content (&gt;{AI_THRESHOLD}%)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {studentsNeedingAttention.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-red-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-red-100 text-red-600 text-xs">{sub.studentInitials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-[#1B3A4B]">{sub.studentName}</div>
                            <div className="text-xs text-muted-foreground">{sub.paperTitle}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] border">
                            Score: {sub.score}
                          </Badge>
                          {sub.aiPercentage > AI_THRESHOLD && (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] border">
                              AI: {sub.aiPercentage}%
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleOpenReview(sub)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Review Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => { if (!open) setSelectedSubmission(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#1B3A4B] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0D7377]" />
                  Quick Review
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Student & Paper Info */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F5F0EB]">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-[#0D7377]/10 text-[#0D7377] text-sm">
                      {selectedSubmission.studentInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-[#1B3A4B]">{selectedSubmission.studentName}</div>
                    <div className="text-sm text-muted-foreground">{selectedSubmission.paperTitle}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Submitted: {selectedSubmission.date}</div>
                  </div>
                </div>

                {/* Score & AI */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg border border-[#E8DED0]">
                    <div className="text-3xl font-bold" style={{ color: getScoreColor(selectedSubmission.score) }}>
                      {selectedSubmission.score}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Overall Score</div>
                    <Badge className={`mt-2 border-0 text-xs`} style={{ backgroundColor: `${getScoreColor(selectedSubmission.score)}15`, color: getScoreColor(selectedSubmission.score) }}>
                      {getScoreLabel(selectedSubmission.score)}
                    </Badge>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-[#E8DED0]">
                    <div className={`text-3xl font-bold ${selectedSubmission.aiPercentage > AI_THRESHOLD ? 'text-red-500' : 'text-emerald-600'}`}>
                      {selectedSubmission.aiPercentage}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">AI Content</div>
                    {selectedSubmission.aiPercentage > AI_THRESHOLD ? (
                      <Badge className="mt-2 bg-red-50 text-red-700 border-red-200 text-xs border">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Above Threshold
                      </Badge>
                    ) : (
                      <Badge className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs border">
                        <Shield className="w-3 h-3 mr-1" /> Within Threshold
                      </Badge>
                    )}
                  </div>
                </div>

                {/* AI Warning */}
                {selectedSubmission.aiPercentage > AI_THRESHOLD && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-red-800">High AI Content Detected</div>
                      <div className="text-xs text-red-600/80 mt-0.5">
                        This submission has {selectedSubmission.aiPercentage}% AI-generated content, which exceeds the {AI_THRESHOLD}% threshold.
                        Consider requesting a revision with more original analysis.
                      </div>
                      {selectedSubmission.evaluation.aiDetection.flaggedSections.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {selectedSubmission.evaluation.aiDetection.flaggedSections.map((s, i) => (
                            <div key={i} className="text-xs text-red-600/70 flex items-start gap-1">
                              <span className="text-red-400">•</span> {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Score Breakdown Mini */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Citations', score: selectedSubmission.evaluation.citationQuality.score },
                    { label: 'Research', score: selectedSubmission.evaluation.researchDepth.score },
                    { label: 'Writing', score: selectedSubmission.evaluation.writingQuality.score },
                    { label: 'Diplomacy', score: selectedSubmission.evaluation.diplomacyRelevance.score },
                    { label: 'Argument', score: selectedSubmission.evaluation.argumentQuality.score },
                    { label: 'Analysis', score: selectedSubmission.evaluation.analyticalThinking.score },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-2 rounded-lg bg-[#F5F0EB]">
                      <div className="text-sm font-bold" style={{ color: getScoreColor(item.score) }}>{item.score}</div>
                      <div className="text-[10px] text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Top Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <h4 className="text-sm font-medium text-emerald-800 mb-2 flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" /> Top Strengths
                    </h4>
                    <div className="space-y-1.5">
                      {selectedSubmission.evaluation.strengths.slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs p-1.5 rounded bg-emerald-50">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-emerald-900">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4" /> Top Weaknesses
                    </h4>
                    <div className="space-y-1.5">
                      {selectedSubmission.evaluation.weaknesses.slice(0, 3).map((w, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs p-1.5 rounded bg-amber-50">
                          <XCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <span className="text-amber-900">{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Teacher Input */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#1B3A4B] font-medium">Your Comment</Label>
                    <Textarea
                      placeholder="Add feedback for the student..."
                      value={teacherComment}
                      onChange={(e) => setTeacherComment(e.target.value)}
                      className="mt-1.5 border-[#E8DED0] focus-visible:ring-[#0D7377]/20 min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#1B3A4B] font-medium">Your Rating</Label>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setTeacherRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${star <= teacherRating ? 'text-[#D4A843] fill-[#D4A843]' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                      {teacherRating > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">{teacherRating}/5</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  disabled={isSaving}
                  onClick={async () => {
                    if (!selectedSubmission) return
                    setIsSaving(true)
                    try {
                      // Save teacher feedback to the database
                      await fetch('/api/research', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'paper',
                          id: selectedSubmission.id,
                          status: 'RETURNED',
                          teacherComment,
                          teacherRating,
                        }),
                      })
                      // Update local state
                      setSubmissions(prev => prev.map(s =>
                        s.id === selectedSubmission.id
                          ? { ...s, status: 'returned' as const, teacherComment, teacherRating }
                          : s
                      ))
                    } catch {
                      // silently fail
                    }
                    setIsSaving(false)
                    setSelectedSubmission(null)
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Return to Student'}
                </Button>
                <Button
                  className="bg-[#0D7377] hover:bg-[#0A5C5F] text-white"
                  disabled={isSaving}
                  onClick={async () => {
                    if (!selectedSubmission) return
                    setIsSaving(true)
                    try {
                      await fetch('/api/research', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'paper',
                          id: selectedSubmission.id,
                          status: 'EVALUATED',
                          teacherComment,
                          teacherRating,
                        }),
                      })
                      setSubmissions(prev => prev.map(s =>
                        s.id === selectedSubmission.id
                          ? { ...s, status: 'reviewed' as const, teacherComment, teacherRating }
                          : s
                      ))
                    } catch {
                      // silently fail
                    }
                    setIsSaving(false)
                    setSelectedSubmission(null)
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Approve'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ResearchPaperEvaluation() {
  const { user } = useAuthStore()
  const isTeacher = user?.role ? ['TEACHER', 'ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'FOUNDER', 'MASTER_ADMIN'].includes(user.role) : false

  return isTeacher ? <TeacherView /> : <StudentView />
}
