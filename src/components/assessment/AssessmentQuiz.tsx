'use client'

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, Play, Share2, Trophy, Target,
  Brain, Mic, Handshake, BookOpen, Shield, Gavel, Users,
  Crown, Sparkles, CheckCircle2, Star, Zap, ArrowRight,
  RotateCcw, Award, Eye, Clock, AlertTriangle, ChevronUp,
  Flame, Scale, Landmark, Globe, FileText, Sword, Compass,
  ShieldCheck, Gem, Medal, Rocket, Lightbulb, XCircle,
  TrendingUp, ArrowUpRight, Lock, Unlock, Timer, ScrollText,
  BadgeCheck, CircleDot, ListChecks, BarChart3, GraduationCap, Heart,
  PartyPopper
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer
} from 'recharts'
import { useNavStore } from '@/lib/store'

// ============================================================
// TYPES
// ============================================================

type QuizPhase = 'intro' | 'quiz' | 'tier-gate' | 'analyzing' | 'results'
type QuestionType = 'multiple-choice' | 'scenario' | 'speech-eval' | 'negotiation' | 'writing' | 'leadership' | 'research' | 'open-ended'

interface Question {
  id: string
  tier: number
  type: QuestionType
  dimensions: string[]
  text: string
  subtext?: string
  options: { text: string; score: number; feedback?: string }[]
  timeLimit: number
  checkpoint: boolean
}

interface TierDef {
  id: number
  name: string
  subtitle: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  gradientFrom: string
  gradientTo: string
  description: string
  passingScore: number
  questionsPerTier: number
}

interface DimensionScore {
  key: string
  name: string
  score: number
  maxScore: number
  color: string
  icon: React.ElementType
  category: 'knowledge' | 'skills' | 'behavior'
}

interface AssessmentState {
  currentTier: number
  currentQuestionIndex: number
  answers: Record<string, number>
  tierWrongAnswers: Record<number, number>
  tierScores: Record<number, number>
  maxTierReached: number
  assessmentComplete: boolean
  timePerQuestion: Record<string, number>
  startedAt: number
  completedAt?: number
  placementTier: number
  stopReason: 'wrong-answers' | 'tier-failed' | 'completed' | null
}

// ============================================================
// TIER DEFINITIONS
// ============================================================

const TIERS: TierDef[] = [
  {
    id: 1, name: 'Basic Delegate', subtitle: 'Foundation',
    icon: Users, color: '#94A3B8', bgColor: '#94A3B815', borderColor: '#94A3B830',
    gradientFrom: '#1e293b', gradientTo: '#334155',
    description: 'Demonstrates foundational knowledge of MUN procedures, UN systems, and basic diplomatic conduct.',
    passingScore: 60, questionsPerTier: 10
  },
  {
    id: 2, name: 'Advanced Delegate', subtitle: 'Competence',
    icon: Star, color: '#0D7377', bgColor: '#0D737715', borderColor: '#0D737730',
    gradientFrom: '#0D7377', gradientTo: '#0A5C5F',
    description: 'Demonstrates competence in procedures, research methodology, and substantive debate preparation.',
    passingScore: 65, questionsPerTier: 10
  },
  {
    id: 3, name: 'Committee Leader', subtitle: 'Leadership',
    icon: Shield, color: '#7C3AED', bgColor: '#7C3AED15', borderColor: '#7C3AED30',
    gradientFrom: '#5B21B6', gradientTo: '#7C3AED',
    description: 'Shows leadership in committee, negotiation skills, and ability to build consensus among delegates.',
    passingScore: 70, questionsPerTier: 11
  },
  {
    id: 4, name: 'Chair', subtitle: 'Mastery',
    icon: Gavel, color: '#D4A843', bgColor: '#D4A84315', borderColor: '#D4A84330',
    gradientFrom: '#B8941F', gradientTo: '#D4A843',
    description: 'Masters procedural rules, can run committees effectively, and manages complex parliamentary situations.',
    passingScore: 72, questionsPerTier: 10
  },
  {
    id: 5, name: 'Under-Secretary-General', subtitle: 'Strategic',
    icon: Landmark, color: '#DC2626', bgColor: '#DC262615', borderColor: '#DC262630',
    gradientFrom: '#991B1B', gradientTo: '#DC2626',
    description: 'Demonstrates strategic thinking, crisis management capabilities, and organizational leadership.',
    passingScore: 75, questionsPerTier: 10
  },
  {
    id: 6, name: 'Deputy Secretary-General', subtitle: 'Executive',
    icon: Crown, color: '#F59E0B', bgColor: '#F59E0B15', borderColor: '#F59E0B30',
    gradientFrom: '#B45309', gradientTo: '#F59E0B',
    description: 'Exhibits executive leadership, organizational mastery, and the ability to guide multiple committees simultaneously.',
    passingScore: 78, questionsPerTier: 10
  },
  {
    id: 7, name: 'Secretary-General', subtitle: 'Pinnacle',
    icon: Gem, color: '#EC4899', bgColor: '#EC489915', borderColor: '#EC489930',
    gradientFrom: '#9D174D', gradientTo: '#EC4899',
    description: 'Complete mastery — the pinnacle of diplomatic excellence. Embodies vision, statesmanship, and transformative leadership.',
    passingScore: 80, questionsPerTier: 10
  },
]

// ============================================================
// DIMENSIONS (with strategic_thinking added)
// ============================================================

const DIMENSIONS: { key: string; name: string; color: string; icon: React.ElementType; category: 'knowledge' | 'skills' | 'behavior' }[] = [
  // Knowledge
  { key: 'mun_procedures', name: 'MUN Procedures', color: '#0D7377', icon: Gavel, category: 'knowledge' },
  { key: 'un_systems', name: 'UN Systems', color: '#1E40AF', icon: Globe, category: 'knowledge' },
  { key: 'international_relations', name: 'International Relations', color: '#7C3AED', icon: Scale, category: 'knowledge' },
  { key: 'geopolitics', name: 'Geopolitical Awareness', color: '#DC2626', icon: Compass, category: 'knowledge' },
  { key: 'strategic_thinking', name: 'Strategic Thinking', color: '#B45309', icon: Brain, category: 'knowledge' },
  // Skills
  { key: 'research', name: 'Research Skills', color: '#059669', icon: BookOpen, category: 'skills' },
  { key: 'public_speaking', name: 'Public Speaking', color: '#E11D48', icon: Mic, category: 'skills' },
  { key: 'negotiation', name: 'Negotiation', color: '#D4A843', icon: Handshake, category: 'skills' },
  { key: 'leadership', name: 'Leadership', color: '#F59E0B', icon: Shield, category: 'skills' },
  { key: 'crisis_management', name: 'Crisis Management', color: '#EF4444', icon: AlertTriangle, category: 'skills' },
  { key: 'resolution_drafting', name: 'Resolution Drafting', color: '#0D7377', icon: FileText, category: 'skills' },
  // Behavior
  { key: 'confidence', name: 'Confidence', color: '#D4A843', icon: Target, category: 'behavior' },
  { key: 'diplomacy', name: 'Diplomacy', color: '#8B5CF6', icon: Handshake, category: 'behavior' },
  { key: 'collaboration', name: 'Collaboration', color: '#10B981', icon: Users, category: 'behavior' },
  { key: 'professionalism', name: 'Professionalism', color: '#6366F1', icon: BadgeCheck, category: 'behavior' },
]

// ============================================================
// COURSE MAPPING & GENZ MESSAGES
// ============================================================

const COURSE_MAP: Record<number, string> = {
  1: "Parliamentary Procedure & Robert's Rules of Order",
  2: "Resolution Writing Workshop",
  3: "Diplomatic Negotiation Strategies",
  4: "Committee Chair Training",
  5: "Crisis Committee Protocols",
  6: "Secretary-General Leadership Program",
  7: "Secretary-General Leadership Program",
}

const GENZ_MESSAGES: Record<number, { emoji: string; message: string; subtext: string }> = {
  1: {
    emoji: '🎮',
    message: "Alright, you're officially in the game!",
    subtext: "Time to build that foundation from the ground up. Start with Parliamentary Procedure and you'll be debating like a pro in no time!"
  },
  2: {
    emoji: '💪',
    message: "Not bad at all! You know your stuff!",
    subtext: "But there's room to level up. Resolution Writing and Negotiation are your next power-ups!"
  },
  3: {
    emoji: '🔥',
    message: "Okay, we see you!",
    subtext: "You've got leadership potential written all over you. Time to sharpen those skills and own that committee room!"
  },
  4: {
    emoji: '👑',
    message: "Chair material spotted!",
    subtext: "You've got the procedural mastery. Now polish those leadership skills and you'll be running sessions like a boss!"
  },
  5: {
    emoji: '🧠',
    message: "Strategic mastermind in the making!",
    subtext: "Crisis management is your playground. Keep pushing and you'll be running the whole operation!"
  },
  6: {
    emoji: '✨',
    message: "Executive excellence!",
    subtext: "You're basically running the show behind the scenes. One more level and you're at the absolute top!"
  },
  7: {
    emoji: '💎',
    message: "Absolute legend status!",
    subtext: "You've reached the pinnacle. You don't just play the game — you define it. Now go inspire the next generation!"
  },
}

// ============================================================
// QUESTION BANK — 71 Questions Across 7 Tiers
// ============================================================

const QUESTIONS: Question[] = [
  // ──────────────────────────────────────────────
  // TIER 1: BASIC DELEGATE (10 questions)
  // ──────────────────────────────────────────────
  {
    id: 't1q1', tier: 1, type: 'multiple-choice',
    dimensions: ['mun_procedures', 'un_systems'],
    text: 'What is the primary purpose of a Model United Nations conference?',
    options: [
      { text: 'To simulate diplomatic proceedings and develop skills in negotiation, public speaking, and resolution writing', score: 4 },
      { text: 'To compete for awards and recognition', score: 1 },
      { text: 'To learn about geography and world capitals', score: 2 },
      { text: 'To socialize with students from other schools', score: 1 },
    ],
    timeLimit: 30, checkpoint: false
  },
  {
    id: 't1q2', tier: 1, type: 'multiple-choice',
    dimensions: ['un_systems'],
    text: 'Which of the following is NOT a principal organ of the United Nations?',
    options: [
      { text: 'The Human Rights Council', score: 4, feedback: 'The HRC is a subsidiary body of the GA, not a principal organ.' },
      { text: 'The Security Council', score: 1 },
      { text: 'The International Court of Justice', score: 1 },
      { text: 'The Economic and Social Council', score: 1 },
    ],
    timeLimit: 30, checkpoint: false
  },
  {
    id: 't1q3', tier: 1, type: 'multiple-choice',
    dimensions: ['mun_procedures'],
    text: 'During a moderated caucus, who has the right to yield the floor?',
    options: [
      { text: 'The delegate who currently holds the floor', score: 4 },
      { text: 'The Chair only', score: 1 },
      { text: 'Any delegate in the room', score: 2 },
      { text: 'The sponsor of the resolution being debated', score: 1 },
    ],
    timeLimit: 30, checkpoint: false
  },
  {
    id: 't1q4', tier: 1, type: 'multiple-choice',
    dimensions: ['mun_procedures'],
    text: 'What is the correct order for considering a draft resolution?',
    options: [
      { text: 'Debate → Amendments → Voting Procedure', score: 4 },
      { text: 'Voting → Debate → Amendments', score: 1 },
      { text: 'Amendments → Voting → Debate', score: 1 },
      { text: 'Debate → Voting → Amendments', score: 2 },
    ],
    timeLimit: 30, checkpoint: false
  },
  {
    id: 't1q5', tier: 1, type: 'scenario',
    dimensions: ['diplomacy', 'professionalism'],
    text: 'You are representing France in the General Assembly. Another delegate makes a factual error about your country\'s position on climate policy. What is the most diplomatic response?',
    subtext: 'Scenario: A delegate from another country states that France opposes the Paris Agreement, which is incorrect.',
    options: [
      { text: 'Raise a Point of Information to politely correct the record and reaffirm France\'s commitment to the Paris Agreement', score: 4 },
      { text: 'Interrupt the delegate immediately to correct them', score: 1 },
      { text: 'Ignore the error — it\'s not your problem', score: 1 },
      { text: 'File a formal complaint with the Chair', score: 2 },
    ],
    timeLimit: 45, checkpoint: true
  },
  {
    id: 't1q6', tier: 1, type: 'multiple-choice',
    dimensions: ['un_systems'],
    text: 'How many member states does the United Nations currently have?',
    options: [
      { text: '193', score: 4 },
      { text: '195', score: 2 },
      { text: '189', score: 1 },
      { text: '200', score: 1 },
    ],
    timeLimit: 25, checkpoint: false
  },
  {
    id: 't1q7', tier: 1, type: 'multiple-choice',
    dimensions: ['mun_procedures', 'confidence'],
    text: 'What is a "Point of Order" and when should it be used?',
    options: [
      { text: 'A procedural objection raised when the rules of procedure are being violated', score: 4 },
      { text: 'A request to extend speaking time', score: 1 },
      { text: 'A motion to change the topic of debate', score: 1 },
      { text: 'A way to ask the Chair a question about the topic', score: 2 },
    ],
    timeLimit: 30, checkpoint: false
  },
  {
    id: 't1q8', tier: 1, type: 'scenario',
    dimensions: ['collaboration', 'research'],
    text: 'You arrive at your first MUN committee session and realize you haven\'t prepared enough on the topic. What is the best course of action?',
    options: [
      { text: 'Listen carefully to other delegates\' speeches, take notes on key arguments, and contribute where your general knowledge allows', score: 4 },
      { text: 'Skip the first session to research in the library', score: 1 },
      { text: 'Make up facts to seem knowledgeable', score: 0 },
      { text: 'Stay silent for the entire conference', score: 2 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't1q9', tier: 1, type: 'multiple-choice',
    dimensions: ['mun_procedures'],
    text: 'What does "abstaining" mean during a vote?',
    options: [
      { text: 'The delegate chooses not to vote for or against the resolution, which neither adds to nor subtracts from the majority', score: 4 },
      { text: 'The delegate votes against the resolution', score: 1 },
      { text: 'The delegate\'s absence counts as a "no" vote', score: 1 },
      { text: 'The delegate wants to discuss the resolution more before voting', score: 2 },
    ],
    timeLimit: 30, checkpoint: false
  },
  {
    id: 't1q10', tier: 1, type: 'scenario',
    dimensions: ['confidence', 'professionalism'],
    text: 'During an unmoderated caucus, a group of experienced delegates dominates the conversation and ignores your input. What should you do?',
    options: [
      { text: 'Assertively but respectfully interject, referencing your country\'s position to add value to the discussion', score: 4 },
      { text: 'Wait silently until they notice you', score: 1 },
      { text: 'Complain to the Chair about being excluded', score: 2 },
      { text: 'Leave the group and work alone', score: 1 },
    ],
    timeLimit: 40, checkpoint: true
  },

  // ──────────────────────────────────────────────
  // TIER 2: ADVANCED DELEGATE (10 questions)
  // ──────────────────────────────────────────────
  {
    id: 't2q1', tier: 2, type: 'multiple-choice',
    dimensions: ['mun_procedures', 'resolution_drafting'],
    text: 'What is the key difference between a working paper and a draft resolution?',
    options: [
      { text: 'A working paper is an informal document for discussion; a draft resolution is formally introduced and follows strict formatting with preambular and operative clauses', score: 4 },
      { text: 'A working paper is longer than a draft resolution', score: 1 },
      { text: 'A draft resolution can only have one sponsor', score: 1 },
      { text: 'There is no difference — they are interchangeable terms', score: 0 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't2q2', tier: 2, type: 'multiple-choice',
    dimensions: ['international_relations', 'un_systems'],
    text: 'What is the significance of the "Uniting for Peace" resolution (UNGA Resolution 377)?',
    options: [
      { text: 'It allows the General Assembly to recommend collective action when the Security Council is deadlocked by a veto', score: 4 },
      { text: 'It established the Peacekeeping operations', score: 2 },
      { text: 'It reformed the Security Council membership', score: 1 },
      { text: 'It created the International Criminal Court', score: 1 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't2q3', tier: 2, type: 'scenario',
    dimensions: ['negotiation', 'diplomacy'],
    text: 'You are in a deadlock on an amendment to a resolution. Two blocs have irreconcilable positions on a key operative clause. How do you break the impasse?',
    options: [
      { text: 'Propose a compromise clause that incorporates key elements from both positions, framed in mutually acceptable language', score: 4 },
      { text: 'Push for a vote immediately — majority rules', score: 1 },
      { text: 'Withdraw your amendment entirely', score: 1 },
      { text: 'Ask the Chair to decide the wording', score: 2 },
    ],
    timeLimit: 45, checkpoint: true
  },
  {
    id: 't2q4', tier: 2, type: 'research',
    dimensions: ['research'],
    text: 'You need to write a position paper for your country on nuclear disarmament. Which source would carry the MOST credibility in an academic MUN context?',
    options: [
      { text: 'The Treaty on the Non-Proliferation of Nuclear Weapons (NPT) text and your country\'s official statements at the NPT Review Conference', score: 4 },
      { text: 'A Wikipedia article on nuclear weapons', score: 1 },
      { text: 'A blog post by a political commentator', score: 0 },
      { text: 'A news article from last week summarizing the issue', score: 2 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't2q5', tier: 2, type: 'multiple-choice',
    dimensions: ['resolution_drafting'],
    text: 'In a draft resolution, which type of clause calls for action and is operative in nature?',
    options: [
      { text: 'Operative clauses (numbered, begin with action verbs)', score: 4 },
      { text: 'Preambular clauses (italicized, begin with participles)', score: 1 },
      { text: 'Preamble', score: 2 },
      { text: 'Signatory section', score: 0 },
    ],
    timeLimit: 30, checkpoint: false
  },
  {
    id: 't2q6', tier: 2, type: 'scenario',
    dimensions: ['public_speaking', 'confidence'],
    text: 'You are giving a formal speech and notice several delegates appear disengaged — some are on their phones. What is the most effective response?',
    options: [
      { text: 'Modulate your delivery: increase vocal emphasis, use a compelling anecdote or statistic, and make direct eye contact with disengaged delegates', score: 4 },
      { text: 'Stop speaking until they pay attention', score: 1 },
      { text: 'Call them out publicly', score: 0 },
      { text: 'Ignore it and continue reading your prepared text', score: 2 },
    ],
    timeLimit: 40, checkpoint: false
  },
  {
    id: 't2q7', tier: 2, type: 'multiple-choice',
    dimensions: ['un_systems', 'international_relations'],
    text: 'Which UN body has the authority to authorize military action under Chapter VII of the UN Charter?',
    options: [
      { text: 'The Security Council', score: 4 },
      { text: 'The General Assembly', score: 1 },
      { text: 'The Secretary-General', score: 1 },
      { text: 'The International Court of Justice', score: 1 },
    ],
    timeLimit: 30, checkpoint: false
  },
  {
    id: 't2q8', tier: 2, type: 'scenario',
    dimensions: ['negotiation', 'collaboration'],
    text: 'Your ally in committee wants to submit a resolution that you believe will fail because it\'s too aggressive. How do you handle this?',
    options: [
      { text: 'Privately share your concerns with specific suggestions for modifications that could broaden support while preserving core objectives', score: 4 },
      { text: 'Publicly distance yourself from the resolution', score: 1 },
      { text: 'Sign it anyway — loyalty matters more than winning', score: 2 },
      { text: 'Submit your own competing resolution without telling them', score: 0 },
    ],
    timeLimit: 40, checkpoint: false
  },
  {
    id: 't2q9', tier: 2, type: 'research',
    dimensions: ['research', 'international_relations'],
    text: 'When preparing a country profile for an MUN conference, which element is MOST critical for effective representation?',
    options: [
      { text: 'Understanding your country\'s foreign policy priorities, alliances, and voting patterns in relevant UN bodies', score: 4 },
      { text: 'Memorizing your country\'s GDP and population statistics', score: 2 },
      { text: 'Knowing the name of your country\'s current leader', score: 1 },
      { text: 'Finding the most dramatic facts about your country\'s history', score: 1 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't2q10', tier: 2, type: 'scenario',
    dimensions: ['resolution_drafting', 'mun_procedures'],
    text: 'A fellow delegate submits an amendment to your resolution that changes the fundamental intent of your operative clause. What is the correct procedural response?',
    options: [
      { text: 'Request a speaker\'s list on the amendment and argue that it constitutes a substantive change that should be a separate resolution', score: 4 },
      { text: 'Accept all amendments without question to show cooperation', score: 1 },
      { text: 'Veto the amendment — as main sponsor, you have that right', score: 2 },
      { text: 'Withdraw your resolution in protest', score: 0 },
    ],
    timeLimit: 45, checkpoint: true
  },

  // ──────────────────────────────────────────────
  // TIER 3: COMMITTEE LEADER (11 questions)
  // ──────────────────────────────────────────────
  {
    id: 't3q1', tier: 3, type: 'scenario',
    dimensions: ['leadership', 'negotiation'],
    text: 'Your committee has been debating for two hours with no progress toward a resolution. Several delegates are repeating the same arguments. What leadership action would be most effective?',
    options: [
      { text: 'Propose a structured framework: identify areas of agreement, isolate key disputes, and suggest a moderated caucus on the most divisive issue', score: 4 },
      { text: 'Let the debate continue — eventually someone will break through', score: 1 },
      { text: 'Push for an immediate vote to force a decision', score: 2 },
      { text: 'Ask the Chair to intervene and set the agenda', score: 1 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't3q2', tier: 3, type: 'speech-eval',
    dimensions: ['public_speaking', 'research'],
    text: 'Read this speech excerpt: "My country has always stood for peace. We believe in doing the right thing. The international community must act now. Something must be done about this crisis. Thank you." What is the PRIMARY weakness?',
    options: [
      { text: 'Vague language with no specific policy proposals, evidence, or reference to the country\'s actual position', score: 4 },
      { text: 'The speech is too short', score: 2 },
      { text: 'It mentions peace, which is too cliché', score: 1 },
      { text: 'The tone is not aggressive enough', score: 0 },
    ],
    timeLimit: 40, checkpoint: false
  },
  {
    id: 't3q3', tier: 3, type: 'scenario',
    dimensions: ['diplomacy', 'leadership'],
    text: 'Two powerful blocs in your committee are refusing to compromise. You represent a smaller nation whose interests align with both sides on different issues. What is your strategic move?',
    options: [
      { text: 'Position yourself as a bridge-builder: identify overlapping interests and propose a framework that allows both sides to claim victories on their priorities', score: 4 },
      { text: 'Join the more powerful bloc for protection', score: 1 },
      { text: 'Remain neutral and wait for others to resolve it', score: 2 },
      { text: 'Threaten to block both resolutions unless your demands are met', score: 1 },
    ],
    timeLimit: 45, checkpoint: true
  },
  {
    id: 't3q4', tier: 3, type: 'negotiation',
    dimensions: ['negotiation', 'diplomacy'],
    text: 'During a bilateral negotiation, the other delegate demands a concession you cannot make due to your country\'s national interest. What is the most effective diplomatic response?',
    options: [
      { text: 'Acknowledge their concern, explain your constraint, and offer an alternative concession that addresses their underlying interest without violating your mandate', score: 4 },
      { text: 'Simply refuse — your country\'s position is non-negotiable', score: 2 },
      { text: 'Agree to their demand to maintain the relationship', score: 0 },
      { text: 'Walk away from the negotiation', score: 1 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't3q5', tier: 3, type: 'multiple-choice',
    dimensions: ['mun_procedures', 'leadership'],
    text: 'What is the purpose of a "moderated caucus" and how does a committee leader best utilize it?',
    options: [
      { text: 'It allows focused debate on a specific subtopic with shorter speaking times; leaders use it to drill into contentious issues and generate specific proposals', score: 4 },
      { text: 'It is a break from formal debate for delegates to socialize', score: 1 },
      { text: 'It is used only for voting on amendments', score: 1 },
      { text: 'It allows the Chair to lecture the committee on procedure', score: 0 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't3q6', tier: 3, type: 'scenario',
    dimensions: ['collaboration', 'leadership'],
    text: 'A first-time delegate in your committee is visibly nervous and has not spoken once. You are leading a coalition. What do you do?',
    options: [
      { text: 'During an unmoderated caucus, approach them privately, express that their perspective is valuable, and help them prepare a brief talking point for the next moderated caucus', score: 4 },
      { text: 'Call on them during formal debate to force participation', score: 1 },
      { text: 'Ignore them — if they can\'t speak up, they\'re not ready', score: 0 },
      { text: 'Ask the Chair to encourage them to speak', score: 2 },
    ],
    timeLimit: 40, checkpoint: false
  },
  {
    id: 't3q7', tier: 3, type: 'multiple-choice',
    dimensions: ['resolution_drafting'],
    text: 'Which of the following is a correctly formatted operative clause?',
    options: [
      { text: '"Calls upon all Member States to increase their contributions to the Green Climate Fund by 20% annually;"', score: 4 },
      { text: '"Believing that climate change is important;"', score: 1 },
      { text: '"We think countries should pay more;"', score: 0 },
      { text: '"Recalling the Paris Agreement;"', score: 2 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't3q8', tier: 3, type: 'scenario',
    dimensions: ['international_relations', 'geopolitics'],
    text: 'A delegate from a Permanent Five member threatens to veto your resolution. What is the most strategically sound approach?',
    options: [
      { text: 'Engage the P5 delegate privately to understand their specific objections and modify the resolution to address their concerns while preserving your core objectives', score: 4 },
      { text: 'Call for a vote immediately before they can veto', score: 1 },
      { text: 'Abandon the resolution entirely', score: 0 },
      { text: 'Publicly shame them for using the veto threat', score: 1 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't3q9', tier: 3, type: 'multiple-choice',
    dimensions: ['un_systems', 'international_relations'],
    text: 'The concept of "Responsibility to Protect" (R2P) primarily addresses:',
    options: [
      { text: 'The obligation of states to protect their populations from genocide, war crimes, ethnic cleansing, and crimes against humanity', score: 4 },
      { text: 'The duty of wealthy nations to provide foreign aid', score: 1 },
      { text: 'The right of states to maintain military forces', score: 1 },
      { text: 'Environmental protection obligations under international law', score: 2 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't3q10', tier: 3, type: 'writing',
    dimensions: ['resolution_drafting', 'research'],
    text: 'Which preambular clause correctly references a prior UN document?',
    options: [
      { text: '"Recalling the Universal Declaration of Human Rights (1948), which established the inherent dignity and equal rights of all members of the human family,"', score: 4 },
      { text: '"Remembering that human rights exist,"', score: 1 },
      { text: '"Noting that the UN did something about human rights once,"', score: 0 },
      { text: '"Referring to some document about rights,"', score: 0 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't3q11', tier: 3, type: 'scenario',
    dimensions: ['confidence', 'leadership'],
    text: 'You\'ve been selected to present your bloc\'s resolution to the full committee, but you disagree with a key clause that was added through compromise. How do you handle the presentation?',
    options: [
      { text: 'Present the resolution professionally and completely, including the compromised clause, as you are representing the bloc\'s collective position — not your personal preference', score: 4 },
      { text: 'Skip the clause you disagree with during your presentation', score: 0 },
      { text: 'Publicly state your disagreement before presenting', score: 1 },
      { text: 'Refuse to present and ask someone else to do it', score: 1 },
    ],
    timeLimit: 40, checkpoint: true
  },

  // ──────────────────────────────────────────────
  // TIER 4: CHAIR (10 questions)
  // ──────────────────────────────────────────────
  {
    id: 't4q1', tier: 4, type: 'leadership',
    dimensions: ['mun_procedures', 'leadership'],
    text: 'As Chair, a delegate raises a Point of Order claiming you incorrectly ruled on a motion. How do you handle this?',
    options: [
      { text: 'Calmly cite the specific rule from the Rules of Procedure, explain your ruling, and offer to review it during a recess if needed', score: 4 },
      { text: 'Overrule them immediately — the Chair\'s decision is final', score: 1 },
      { text: 'Apologize and reverse your ruling to maintain harmony', score: 2 },
      { text: 'Ask the committee to vote on whether your ruling was correct', score: 1 },
    ],
    timeLimit: 40, checkpoint: true
  },
  {
    id: 't4q2', tier: 4, type: 'scenario',
    dimensions: ['leadership', 'crisis_management'],
    text: 'Two delegates get into a heated personal argument during formal debate that violates decorum. As Chair, what is your immediate response?',
    options: [
      { text: 'Gavel the committee to order, remind delegates of Rule X regarding decorum, and redirect to substantive debate on the topic', score: 4 },
      { text: 'Let them argue it out — passion is part of MUN', score: 0 },
      { text: 'Expel both delegates from the committee', score: 2 },
      { text: 'Suspend the session and call the Secretary-General', score: 1 },
    ],
    timeLimit: 40, checkpoint: false
  },
  {
    id: 't4q3', tier: 4, type: 'multiple-choice',
    dimensions: ['mun_procedures'],
    text: 'What is the difference between a "friendly amendment" and an "unfriendly amendment"?',
    options: [
      { text: 'A friendly amendment is approved by all sponsors and passes without vote; an unfriendly amendment requires a vote because not all sponsors consent', score: 4 },
      { text: 'A friendly amendment is shorter than an unfriendly one', score: 1 },
      { text: 'A friendly amendment comes from allies; an unfriendly one comes from opponents', score: 2 },
      { text: 'There is no difference in procedure', score: 0 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't4q4', tier: 4, type: 'leadership',
    dimensions: ['leadership', 'crisis_management'],
    text: 'Your committee is 30 minutes behind schedule and no resolution has been drafted. The conference Secretariat pressures you to move to voting. What do you do?',
    options: [
      { text: 'Announce a 15-minute unmoderated caucus specifically for resolution drafting, set clear expectations, and facilitate rapid progress toward a workable document', score: 4 },
      { text: 'Move to voting immediately — the Secretariat\'s schedule takes priority', score: 1 },
      { text: 'Extend the session by an hour without consultation', score: 2 },
      { text: 'End the session with no resolution and blame the delegates', score: 0 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't4q5', tier: 4, type: 'scenario',
    dimensions: ['mun_procedures', 'professionalism'],
    text: 'A delegate motions for a roll call vote, but you believe a simple placard vote would suffice. How do you rule?',
    options: [
      { text: 'Accept the motion — any delegate has the right to request a roll call vote under most MUN rules of procedure', score: 4 },
      { text: 'Deny the motion — the Chair decides the voting method', score: 1 },
      { text: 'Put it to a vote whether to have a roll call vote', score: 2 },
      { text: 'Ask the delegate why they want a roll call vote and decide based on their answer', score: 2 },
    ],
    timeLimit: 40, checkpoint: false
  },
  {
    id: 't4q6', tier: 4, type: 'multiple-choice',
    dimensions: ['mun_procedures'],
    text: 'What is "table debate" and when is it appropriately used?',
    options: [
      { text: 'A motion to temporarily set aside the current topic; used when an urgent matter requires immediate attention or to make time for another pressing issue', score: 4 },
      { text: 'A way to end debate permanently', score: 1 },
      { text: 'A method to change the speaking time', score: 1 },
      { text: 'A procedure to remove a delegate from the room', score: 0 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't4q7', tier: 4, type: 'scenario',
    dimensions: ['leadership', 'diplomacy'],
    text: 'A delegate consistently dominates speaking time and intimidates others from speaking. As Chair, what is the most balanced approach?',
    options: [
      { text: 'Implement equitable speaking opportunities: limit repeat speakers, actively recognize delegates who haven\'t spoken, and maintain a fair speakers\' list', score: 4 },
      { text: 'Publicly scold the dominant delegate', score: 1 },
      { text: 'Let the natural dynamics play out', score: 0 },
      { text: 'Skip the dominant delegate every time they raise their placard', score: 2 },
    ],
    timeLimit: 40, checkpoint: true
  },
  {
    id: 't4q8', tier: 4, type: 'multiple-choice',
    dimensions: ['resolution_drafting', 'mun_procedures'],
    text: 'When a resolution has multiple amendments, what is the proper order for voting?',
    options: [
      { text: 'Vote on amendments in reverse order of submission (last amendment first), then vote on the resolution as amended', score: 4 },
      { text: 'Vote on all amendments simultaneously', score: 1 },
      { text: 'Vote on amendments in order of submission', score: 2 },
      { text: 'The Chair decides which amendments to vote on', score: 0 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't4q9', tier: 4, type: 'speech-eval',
    dimensions: ['public_speaking', 'research'],
    text: 'A delegate gives a speech that is well-researched and technically perfect but delivered in a monotone voice with no eye contact. The primary improvement needed is:',
    options: [
      { text: 'Enhancing delivery dynamics: vocal variety, strategic pauses, eye contact, and physical engagement to connect with the audience emotionally', score: 4 },
      { text: 'Adding more statistics to the speech', score: 1 },
      { text: 'Making the speech longer', score: 0 },
      { text: 'Using more complicated vocabulary', score: 0 },
    ],
    timeLimit: 35, checkpoint: false
  },
  {
    id: 't4q10', tier: 4, type: 'leadership',
    dimensions: ['crisis_management', 'leadership'],
    text: 'A fire alarm interrupts your committee session. After the all-clear, delegates are distracted and energy is low. How do you restore momentum?',
    options: [
      { text: 'Briefly acknowledge the disruption, transition to a high-engagement moderated caucus on the most debated issue, and set an ambitious but achievable goal for the remaining time', score: 4 },
      { text: 'Cancel the remaining session', score: 0 },
      { text: 'Resume exactly where you left off without acknowledging the disruption', score: 2 },
      { text: 'Give delegates a 30-minute break to settle down', score: 1 },
    ],
    timeLimit: 40, checkpoint: true
  },

  // ──────────────────────────────────────────────
  // TIER 5: UNDER-SECRETARY-GENERAL (10 questions)
  // ──────────────────────────────────────────────
  {
    id: 't5q1', tier: 5, type: 'leadership',
    dimensions: ['crisis_management', 'strategic_thinking'],
    text: 'A crisis erupts: news breaks that a fictional nation has launched a military offensive. As USG, you must advise the Secretary-General on the immediate UN response. What framework do you apply?',
    options: [
      { text: 'Assess the threat level under Chapter VII, recommend emergency Security Council consultation, coordinate with relevant agencies (OCHA, UNHCR), and prepare a briefing for the GA if the SC is deadlocked', score: 4 },
      { text: 'Issue a press condemning the attack and wait for instructions', score: 1 },
      { text: 'Deploy peacekeepers immediately without Security Council authorization', score: 0 },
      { text: 'Call an emergency General Assembly session only', score: 2 },
    ],
    timeLimit: 60, checkpoint: true
  },
  {
    id: 't5q2', tier: 5, type: 'scenario',
    dimensions: ['strategic_thinking', 'international_relations'],
    text: 'Your conference has three committees, but the Crisis Committee is consuming disproportionate Secretariat attention. The GA and ECOSOC are falling behind schedule. What is your strategic response?',
    options: [
      { text: 'Redistribute Secretariat resources: assign a deputy to the Crisis Committee, personally check in on GA and ECOSOC, and create a shared timeline to ensure all committees reach resolution stage', score: 4 },
      { text: 'Focus entirely on the Crisis Committee — it\'s the flagship', score: 1 },
      { text: 'Cancel the GA and ECOSOC final sessions', score: 0 },
      { text: 'Let each committee figure it out independently', score: 1 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't5q3', tier: 5, type: 'scenario',
    dimensions: ['negotiation', 'diplomacy'],
    text: 'A major donor nation threatens to withdraw conference funding unless their preferred agenda topic is prioritized. This topic is controversial and may alienate other participants. How do you navigate this?',
    options: [
      { text: 'Acknowledge the donor\'s interest, propose a balanced agenda that includes their topic alongside others, and emphasize the diplomatic value of diverse perspectives for all stakeholders', score: 4 },
      { text: 'Accept their demand — funding is critical', score: 1 },
      { text: 'Refuse categorically — the UN doesn\'t negotiate with donors', score: 2 },
      { text: 'Publicly expose their pressure tactics', score: 0 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't5q4', tier: 5, type: 'scenario',
    dimensions: ['geopolitics', 'international_relations'],
    text: 'Your Security Council simulation faces a realistic scenario: one P5 member is expected to veto any resolution on the conflict. How do you, as USG, advise the other delegates to proceed?',
    options: [
      { text: 'Advise delegates to craft a resolution that addresses the P5 member\'s stated concerns where possible, while preparing a "Uniting for Peace" GA resolution as a backup if the veto is exercised', score: 4 },
      { text: 'Tell them to give up — the veto can\'t be overcome', score: 0 },
      { text: 'Recommend they draft the most aggressive resolution possible to make a statement', score: 1 },
      { text: 'Suggest they avoid the topic entirely', score: 0 },
    ],
    timeLimit: 55, checkpoint: false
  },
  {
    id: 't5q5', tier: 5, type: 'writing',
    dimensions: ['resolution_drafting', 'international_relations'],
    text: 'You are reviewing a draft resolution on cybersecurity. Which operative clause demonstrates the highest level of diplomatic sophistication?',
    options: [
      { text: '"Establishes a multilateral Cybersecurity norms Dialogue Forum under the auspices of the UN Secretary-General, with balanced regional representation, to develop binding international norms on state behavior in cyberspace, with progress reports to the GA annually;"', score: 4 },
      { text: '"Says that cyber attacks are bad and countries should stop doing them;"', score: 0 },
      { text: '"Bans all cyber weapons immediately;"', score: 1 },
      { text: '"Requests that countries be nicer on the internet;"', score: 0 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't5q6', tier: 5, type: 'leadership',
    dimensions: ['crisis_management', 'leadership'],
    text: 'During a live crisis simulation, conflicting intelligence reports arrive simultaneously. One suggests a chemical attack, the other suggests a conventional explosion. As USG, your immediate action should be:',
    options: [
      { text: 'Acknowledge both reports, establish a verification protocol, brief the Security Council on the conflicting intelligence, and prepare contingency plans for both scenarios while awaiting confirmation', score: 4 },
      { text: 'Assume the worst (chemical attack) and act accordingly', score: 2 },
      { text: 'Wait for confirmed intelligence before taking any action', score: 1 },
      { text: 'Choose the less severe scenario to avoid panic', score: 0 },
    ],
    timeLimit: 50, checkpoint: true
  },
  {
    id: 't5q7', tier: 5, type: 'scenario',
    dimensions: ['leadership', 'collaboration'],
    text: 'A committee Chair is struggling and losing control of their session. Delegates are frustrated. As USG, what intervention do you make?',
    options: [
      { text: 'Observe briefly to identify specific issues, then privately coach the Chair on procedural tools and facilitation techniques, remaining available as backup without undermining their authority', score: 4 },
      { text: 'Publicly take over the committee', score: 1 },
      { text: 'Replace the Chair immediately with someone more experienced', score: 2 },
      { text: 'Ignore it — struggling builds character', score: 0 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't5q8', tier: 5, type: 'scenario',
    dimensions: ['strategic_thinking', 'geopolitics'],
    text: 'A new global health emergency requires rapid UN coordination. Which mechanism allows the fastest multilateral response?',
    options: [
      { text: 'WHO emergency declaration + Security Council resolution authorizing international cooperation + coordinated GA resolution for funding', score: 4 },
      { text: 'A press release from the Secretary-General', score: 1 },
      { text: 'Waiting for the next scheduled General Assembly session', score: 0 },
      { text: 'Bilateral agreements between affected nations only', score: 1 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't5q9', tier: 5, type: 'negotiation',
    dimensions: ['negotiation', 'strategic_thinking'],
    text: 'In a multilateral negotiation, you need to bring five opposing factions to consensus. Your optimal strategy is:',
    options: [
      { text: 'Map each faction\'s core interests and red lines, identify a "zone of possible agreement," build a coalition of the most flexible parties first, then gradually bring in harder-line factions with targeted concessions', score: 4 },
      { text: 'Present your proposal first and demand acceptance', score: 0 },
      { text: 'Negotiate with each faction separately and hope the agreements are compatible', score: 2 },
      { text: 'Ask everyone to compromise equally regardless of their interests', score: 1 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't5q10', tier: 5, type: 'scenario',
    dimensions: ['professionalism', 'diplomacy'],
    text: 'A senior diplomat at the conference makes an inappropriate comment about a delegate\'s nationality. As USG, how do you address this?',
    options: [
      { text: 'Immediately and privately address the issue with the individual, issue a formal statement reaffirming the conference\'s commitment to respect and inclusivity, and offer support to the affected delegate', score: 4 },
      { text: 'Ignore it — diplomacy requires thick skin', score: 0 },
      { text: 'Publicly humiliate the offender in front of everyone', score: 1 },
      { text: 'Wait until the conference is over to address it', score: 1 },
    ],
    timeLimit: 45, checkpoint: true
  },

  // ──────────────────────────────────────────────
  // TIER 6: DEPUTY SECRETARY-GENERAL (10 questions)
  // ──────────────────────────────────────────────
  {
    id: 't6q1', tier: 6, type: 'leadership',
    dimensions: ['leadership', 'strategic_thinking'],
    text: 'You must design the agenda for a 3-day MUN conference with 200 delegates across 6 committees. What is your strategic approach?',
    options: [
      { text: 'Create a thematic arc: Day 1 focuses on identification and debate of issues, Day 2 on negotiation and resolution drafting, Day 3 on crisis response and final voting, with cross-committee events that build conference-wide momentum', score: 4 },
      { text: 'Let each committee set its own agenda independently', score: 1 },
      { text: 'Pack all substantive debate into Day 1 and use Days 2-3 for social events', score: 0 },
      { text: 'Follow the exact same agenda as last year\'s conference', score: 1 },
    ],
    timeLimit: 55, checkpoint: true
  },
  {
    id: 't6q2', tier: 6, type: 'scenario',
    dimensions: ['crisis_management', 'leadership'],
    text: 'Halfway through the conference, a real-world geopolitical crisis breaks out that directly mirrors your Crisis Committee scenario. Delegates are emotionally affected. How do you, as DSG, manage this?',
    options: [
      { text: 'Acknowledge the sensitivity, offer delegates the option to pause or continue, adjust the crisis scenario to be less directly parallel, and ensure counseling resources are available for those affected', score: 4 },
      { text: 'Cancel the crisis committee entirely', score: 2 },
      { text: 'Continue unchanged — MUN is about dealing with real crises', score: 1 },
      { text: 'Use the real crisis as a teaching moment without adjusting', score: 2 },
    ],
    timeLimit: 55, checkpoint: false
  },
  {
    id: 't6q3', tier: 6, type: 'scenario',
    dimensions: ['strategic_thinking', 'international_relations'],
    text: 'Your conference is criticized for lacking diversity in represented nations — too many delegations default to Western positions. How do you address this systemic issue?',
    options: [
      { text: 'Restructure country assignments to ensure Global South representation in key committees, create training modules on non-Western diplomatic traditions, and invite diverse guest speakers', score: 4 },
      { text: 'Dismiss the criticism — delegates can represent any country', score: 0 },
      { text: 'Only assign countries that match delegates\' nationalities', score: 1 },
      { text: 'Add more African and Asian topics to the agenda without changing representation', score: 2 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't6q4', tier: 6, type: 'negotiation',
    dimensions: ['negotiation', 'diplomacy'],
    text: 'A school threatens to withdraw their delegation over a dispute about committee assignments. They are your largest participating school. How do you negotiate?',
    options: [
      { text: 'Listen to their specific concerns, acknowledge their importance to the conference, propose a solution that addresses their core interest (not necessarily their stated position), and frame it within the broader commitment to fairness for all participants', score: 4 },
      { text: 'Give them everything they want — losing them would be devastating', score: 1 },
      { text: 'Call their bluff — they need us more than we need them', score: 0 },
      { text: 'Offer them a discount instead of addressing the actual issue', score: 2 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't6q5', tier: 6, type: 'leadership',
    dimensions: ['leadership', 'professionalism'],
    text: 'You discover that a Chair has been showing favoritism toward delegates from their own school. What action do you take?',
    options: [
      { text: 'Document specific instances, privately address the Chair with clear expectations, implement an anonymous feedback mechanism, and establish a monitoring protocol for their sessions', score: 4 },
      { text: 'Fire the Chair immediately and publicly', score: 1 },
      { text: 'Ignore it — a little favoritism is natural', score: 0 },
      { text: 'Wait for complaints from delegates before acting', score: 2 },
    ],
    timeLimit: 50, checkpoint: true
  },
  {
    id: 't6q6', tier: 6, type: 'scenario',
    dimensions: ['strategic_thinking', 'crisis_management'],
    text: 'Your conference is running over budget with two months remaining. The venue contract is signed. How do you manage the financial crisis?',
    options: [
      { text: 'Conduct a line-item budget review, identify non-essential expenses for reduction, negotiate with vendors for discounts, explore sponsorship opportunities, and develop a transparent financial communication plan for stakeholders', score: 4 },
      { text: 'Cancel the conference', score: 0 },
      { text: 'Raise registration fees for all delegates', score: 2 },
      { text: 'Cut quality on food and materials without telling anyone', score: 0 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't6q7', tier: 6, type: 'scenario',
    dimensions: ['leadership', 'collaboration'],
    text: 'Two of your committee Chairs have conflicting interpretations of the same rule. Their committees are producing inconsistent outcomes. How do you resolve this?',
    options: [
      { text: 'Call a Chairs\' meeting, present both interpretations, facilitate a consensus on the correct ruling based on the Rules of Procedure, and issue a conference-wide clarification to ensure consistency', score: 4 },
      { text: 'Let each Chair interpret rules independently', score: 0 },
      { text: 'Side with the more senior Chair', score: 1 },
      { text: 'Overrule both and impose your own interpretation without discussion', score: 2 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't6q8', tier: 6, type: 'scenario',
    dimensions: ['geopolitics', 'strategic_thinking'],
    text: 'You are designing a historical crisis simulation set during the Cold War. What makes it educationally valuable rather than just entertaining?',
    options: [
      { text: 'Grounding it in actual historical constraints and diplomatic options available at the time, including primary sources, and designing learning outcomes that connect historical decisions to contemporary global governance challenges', score: 4 },
      { text: 'Making it as dramatic and surprising as possible', score: 1 },
      { text: 'Letting delegates use modern knowledge to solve historical problems', score: 1 },
      { text: 'Ensuring the "right" side always wins', score: 0 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't6q9', tier: 6, type: 'scenario',
    dimensions: ['confidence', 'leadership'],
    text: 'The Secretary-General falls ill on the morning of the conference. You must step up and deliver the opening ceremony address with 30 minutes of preparation. What do you focus on?',
    options: [
      { text: 'Deliver a concise, inspiring address that sets the conference tone: welcome delegates, articulate the conference\'s mission and relevance, challenge delegates to think beyond their comfort zones, and establish your authority with confidence', score: 4 },
      { text: 'Cancel the opening ceremony', score: 0 },
      { text: 'Read the SG\'s prepared speech word for word', score: 2 },
      { text: 'Wing it with no preparation — authenticity beats preparation', score: 1 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't6q10', tier: 6, type: 'scenario',
    dimensions: ['strategic_thinking', 'diplomacy'],
    text: 'A parent complains that their child didn\'t win an award and alleges the judging was biased. How do you, as DSG, respond?',
    options: [
      { text: 'Thank them for their feedback, explain the transparent rubric-based judging process, offer to share specific feedback on their child\'s performance, and use this as an opportunity to improve the feedback system for all delegates', score: 4 },
      { text: 'Give their child an award to resolve the complaint', score: 0 },
      { text: 'Dismiss the complaint — awards are final', score: 1 },
      { text: 'Blame the Chairs for biased judging', score: 0 },
    ],
    timeLimit: 45, checkpoint: true
  },

  // ──────────────────────────────────────────────
  // TIER 7: SECRETARY-GENERAL (10 questions)
  // ──────────────────────────────────────────────
  {
    id: 't7q1', tier: 7, type: 'leadership',
    dimensions: ['leadership', 'strategic_thinking'],
    text: 'As Secretary-General, you must articulate a vision for the future of MUN education. Which approach creates lasting institutional impact?',
    options: [
      { text: 'Develop a comprehensive 5-year strategic plan with measurable outcomes: curriculum standards, certification pathways, global partnership networks, and a digital platform that enables year-round engagement beyond conferences', score: 4 },
      { text: 'Focus entirely on making next year\'s conference the biggest ever', score: 1 },
      { text: 'Delegate all planning to subordinates — a good SG doesn\'t micromanage', score: 0 },
      { text: 'Replicate what successful conferences do without customization', score: 1 },
    ],
    timeLimit: 60, checkpoint: true
  },
  {
    id: 't7q2', tier: 7, type: 'scenario',
    dimensions: ['crisis_management', 'leadership'],
    text: 'A major geopolitical event causes several embassies to issue travel warnings for your conference location. International delegations consider withdrawing. As SG, your response:',
    options: [
      { text: 'Immediately convene a crisis team, communicate transparently with all stakeholders about safety measures, offer virtual participation options, coordinate with local authorities for enhanced security, and develop contingency plans for a hybrid or relocated conference', score: 4 },
      { text: 'Cancel the conference immediately', score: 1 },
      { text: 'Ignore the warnings — the show must go on', score: 0 },
      { text: 'Only communicate with local delegations and hope international ones don\'t notice', score: 0 },
    ],
    timeLimit: 60, checkpoint: false
  },
  {
    id: 't7q3', tier: 7, type: 'scenario',
    dimensions: ['strategic_thinking', 'international_relations'],
    text: 'You want to establish DiplomatiQ as a globally recognized standard for MUN excellence. Your strategic roadmap includes:',
    options: [
      { text: 'Build partnerships with UN agencies and academic institutions, create an accredited certification framework, develop open-source training materials, establish regional chapters, and launch an annual global summit to share best practices', score: 4 },
      { text: 'Just keep hosting conferences and hope the brand grows organically', score: 0 },
      { text: 'Focus exclusively on social media marketing', score: 1 },
      { text: 'Trademark the name and license it to anyone who pays', score: 1 },
    ],
    timeLimit: 55, checkpoint: false
  },
  {
    id: 't7q4', tier: 7, type: 'negotiation',
    dimensions: ['negotiation', 'diplomacy'],
    text: 'You are mediating a dispute between two major participating organizations that both claim the right to host the regional championship. Both have valid claims. How do you resolve this?',
    options: [
      { text: 'Facilitate interest-based negotiation: identify what each party truly needs (prestige, revenue, student opportunities), propose a co-hosting model or rotation agreement, and frame the solution as a partnership that elevates both organizations', score: 4 },
      { text: 'Flip a coin — fairness means equal chance', score: 0 },
      { text: 'Give it to the organization that hosted last time', score: 1 },
      { text: 'Host it yourself and exclude both', score: 0 },
    ],
    timeLimit: 55, checkpoint: false
  },
  {
    id: 't7q5', tier: 7, type: 'scenario',
    dimensions: ['leadership', 'crisis_management'],
    text: 'During a keynote address at your conference, a distinguished guest speaker makes controversial political statements that offend several delegations. As SG, what is your immediate and follow-up response?',
    options: [
      { text: 'Immediately after the speech, deliver brief remarks reaffirming the conference\'s commitment to respectful dialogue and diverse perspectives. Privately reach out to offended delegations. Issue a conference statement clarifying that speaker views don\'t represent the conference. Review speaker vetting process.', score: 4 },
      { text: 'Pretend nothing happened', score: 0 },
      { text: 'Publicly condemn the speaker during their speech', score: 1 },
      { text: 'Cancel the rest of the conference', score: 0 },
    ],
    timeLimit: 55, checkpoint: true
  },
  {
    id: 't7q6', tier: 7, type: 'scenario',
    dimensions: ['strategic_thinking', 'geopolitics'],
    text: 'Your organization is expanding to a region with no MUN tradition. The educational culture emphasizes rote learning over debate. How do you introduce MUN effectively?',
    options: [
      { text: 'Design a culturally adaptive MUN curriculum that begins with structured research exercises, gradually introduces public speaking in low-pressure settings, frames negotiation as collaborative problem-solving, and trains local educators to sustain the program long-term', score: 4 },
      { text: 'Import the Western MUN format unchanged — delegates will adapt', score: 0 },
      { text: 'Give up on the expansion — it won\'t work in that cultural context', score: 0 },
      { text: 'Only offer online MUN to avoid cultural friction', score: 1 },
    ],
    timeLimit: 55, checkpoint: false
  },
  {
    id: 't7q7', tier: 7, type: 'writing',
    dimensions: ['resolution_drafting', 'international_relations'],
    text: 'You are drafting a conference declaration on "The Future of Multilateralism." Which preamble-structure demonstrates the highest strategic vision?',
    options: [
      { text: 'Begin with the founding principles of the UN, acknowledge current challenges to multilateralism, reference specific resolutions and frameworks (SDGs, Paris Agreement), identify the inflection point, and transition to bold operative commitments', score: 4 },
      { text: 'Start with a joke to lighten the mood', score: 0 },
      { text: 'List every UN document ever written', score: 0 },
      { text: 'Skip the preamble — only operative clauses matter', score: 1 },
    ],
    timeLimit: 50, checkpoint: false
  },
  {
    id: 't7q8', tier: 7, type: 'leadership',
    dimensions: ['leadership', 'confidence'],
    text: 'A journalist asks you a pointed question about a past conference failure. Your response exemplifies:',
    options: [
      { text: 'Transparent accountability: acknowledge what went wrong, explain the specific changes implemented as a result, and redirect to the organization\'s growth trajectory and commitment to continuous improvement', score: 4 },
      { text: 'Deny that anything went wrong', score: 0 },
      { text: 'Blame individual team members', score: 0 },
      { text: 'Refuse to answer and walk away', score: 0 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't7q9', tier: 7, type: 'scenario',
    dimensions: ['strategic_thinking', 'collaboration'],
    text: 'You must build a leadership team for next year\'s conference. Your most important criterion for selecting your Deputy SG is:',
    options: [
      { text: 'Complementary strengths: someone who excels where you are weaker, shares your vision but challenges your assumptions, and commands respect across different stakeholder groups', score: 4 },
      { text: 'Someone who always agrees with you', score: 0 },
      { text: 'The most popular person in the organization', score: 1 },
      { text: 'The person with the most MUN experience, regardless of working style', score: 2 },
    ],
    timeLimit: 45, checkpoint: false
  },
  {
    id: 't7q10', tier: 7, type: 'scenario',
    dimensions: ['leadership', 'diplomacy', 'professionalism'],
    text: 'At the closing ceremony, you must deliver a speech that inspires 500 delegates. What structure has the greatest lasting impact?',
    options: [
      { text: 'Open with a shared experience from the conference, acknowledge specific moments of growth you witnessed, challenge delegates to apply what they\'ve learned to real-world problems, and close with a call to action that connects their MUN experience to their future as global citizens', score: 4 },
      { text: 'Read a list of award winners for 30 minutes', score: 0 },
      { text: 'Give a generic "you are the future" speech', score: 1 },
      { text: 'Skip the speech — delegates just want the awards', score: 0 },
    ],
    timeLimit: 55, checkpoint: true
  },
]

// ============================================================
// SCORING LOGIC
// ============================================================

function calculateDimensionScores(answers: Record<string, number>): DimensionScore[] {
  const dimensionTotals: Record<string, { total: number; max: number }> = {}

  for (const dim of DIMENSIONS) {
    dimensionTotals[dim.key] = { total: 0, max: 0 }
  }

  for (const q of QUESTIONS) {
    const answerScore = answers[q.id] ?? 0
    for (const dimKey of q.dimensions) {
      if (dimensionTotals[dimKey]) {
        dimensionTotals[dimKey].total += answerScore
        dimensionTotals[dimKey].max += 4
      }
    }
  }

  return DIMENSIONS.map(dim => {
    const data = dimensionTotals[dim.key]
    const score = data.max > 0 ? Math.round((data.total / data.max) * 100) : 0
    return {
      key: dim.key,
      name: dim.name,
      score,
      maxScore: 100,
      color: dim.color,
      icon: dim.icon,
      category: dim.category,
    }
  })
}

function calculateTierScore(tier: number, answers: Record<string, number>): number {
  const tierQuestions = QUESTIONS.filter(q => q.tier === tier)
  if (tierQuestions.length === 0) return 0
  const totalPossible = tierQuestions.length * 4
  const totalEarned = tierQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
  return Math.round((totalEarned / totalPossible) * 100)
}

function isWrongAnswer(score: number): boolean {
  return score <= 1
}

function getRecommendedTraining(dimScores: DimensionScore[]): string[] {
  const weak = dimScores.filter(d => d.score < 60).sort((a, b) => a.score - b.score)
  const trainingMap: Record<string, string> = {
    'mun_procedures': 'Parliamentary Procedure Masterclass',
    'un_systems': 'UN Systems & Architecture Deep Dive',
    'international_relations': 'International Relations Foundations',
    'geopolitics': 'Global Geopolitics & Current Affairs',
    'strategic_thinking': 'Strategic Thinking & Planning',
    'research': 'Research Methodology for MUN',
    'public_speaking': 'Public Speaking & Rhetoric Lab',
    'negotiation': 'Diplomatic Negotiation Workshop',
    'leadership': 'Committee Leadership Academy',
    'crisis_management': 'Crisis Management Bootcamp',
    'resolution_drafting': 'Resolution Writing Masterclass',
    'confidence': 'Confidence & Presence Training',
    'diplomacy': 'Advanced Diplomatic Skills',
    'collaboration': 'Collaborative Problem Solving',
    'professionalism': 'Professional Conduct & Protocol',
  }
  return weak.map(w => trainingMap[w.key] || `${w.name} Training`).slice(0, 5)
}

// ============================================================
// CONFETTI COMPONENT
// ============================================================

function ConfettiEffect({ active }: { active: boolean }) {
  const particles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#D4A843', '#0D7377', '#7C3AED'][Math.floor(Math.random() * 10)],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    })), []
  )

  if (!active) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.6 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: '110vh', opacity: 0, rotate: p.rotation + 720, scale: 0.5 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ============================================================
// SPARKLE COMPONENT
// ============================================================

function SparkleEffect({ active }: { active: boolean }) {
  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      delay: Math.random() * 2,
      size: 8 + Math.random() * 16,
    })), []
  )

  if (!active) return null
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 1.5, delay: s.delay, repeat: Infinity, repeatDelay: 2 }}
        >
          <Sparkles className="text-yellow-400" style={{ width: s.size, height: s.size }} />
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================
// TIMER BAR COMPONENT
// ============================================================

function TimerBar({ timeLimit, onExpire, isActive }: {
  timeLimit: number
  onExpire: () => void
  isActive: boolean
}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setTimeLeft(timeLimit)
  }, [timeLimit])

  useEffect(() => {
    if (!isActive) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isActive, onExpire, timeLimit])

  const percent = (timeLeft / timeLimit) * 100
  const isWarning = timeLeft <= 10
  const isCritical = timeLeft <= 5

  return (
    <div className="w-full">
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-[#0D7377]'}`}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="flex items-center justify-end mt-1">
        <div className="flex items-center gap-1">
          <Timer className={`w-3 h-3 ${isCritical ? 'text-red-500 animate-pulse' : isWarning ? 'text-amber-500' : 'text-muted-foreground'}`} />
          <span className={`text-[11px] font-mono font-semibold ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TIER BADGE COMPONENT
// ============================================================

function TierBadge({ tier, size = 'md' }: {
  tier: TierDef
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' }
  const iconSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center border-2`}
      style={{
        backgroundColor: tier.bgColor,
        borderColor: tier.borderColor,
        boxShadow: `0 0 20px ${tier.color}20`,
      }}
    >
      <tier.icon className={iconSizes[size]} style={{ color: tier.color }} />
    </div>
  )
}

// ============================================================
// TIER GATE ANIMATION (auto-advances after 1.5s)
// ============================================================

function TierGateAnimation({ fromTier, toTier, onContinue }: {
  fromTier: TierDef
  toTier: TierDef
  onContinue: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 1500)
    return () => clearTimeout(timer)
  }, [onContinue])

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center border-4"
          style={{
            backgroundColor: toTier.bgColor,
            borderColor: toTier.color,
            boxShadow: `0 0 60px ${toTier.color}40, 0 0 120px ${toTier.color}20`,
          }}
        >
          <toTier.icon className="w-12 h-12" style={{ color: toTier.color }} />
        </div>
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-2xl border-2"
            style={{ borderColor: `${toTier.color}30` }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.5 + ring * 0.3, opacity: 0 }}
            transition={{ duration: 1.5, delay: ring * 0.3, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Badge className="mb-2 text-xs" style={{ backgroundColor: fromTier.bgColor, color: fromTier.color, borderColor: fromTier.borderColor }}>
          TIER {fromTier.id} COMPLETE
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: toTier.color }}>
          Advancing to Tier {toTier.id}
        </h2>
        <p className="text-base font-semibold mb-1" style={{ color: toTier.color }}>{toTier.name}</p>
        <p className="text-muted-foreground text-sm max-w-md">{toTier.description}</p>
      </motion.div>
    </motion.div>
  )
}

// ============================================================
// QUESTION TYPE BADGE
// ============================================================

function QuestionTypeBadge({ type }: { type: QuestionType }) {
  const typeMap: Record<QuestionType, { label: string; icon: React.ElementType; color: string }> = {
    'multiple-choice': { label: 'Knowledge', icon: Brain, color: '#0D7377' },
    'scenario': { label: 'Scenario', icon: Compass, color: '#7C3AED' },
    'speech-eval': { label: 'Speech Analysis', icon: Mic, color: '#E11D48' },
    'negotiation': { label: 'Negotiation', icon: Handshake, color: '#D4A843' },
    'writing': { label: 'Resolution Writing', icon: FileText, color: '#059669' },
    'leadership': { label: 'Leadership', icon: Shield, color: '#F59E0B' },
    'research': { label: 'Research', icon: BookOpen, color: '#0D7377' },
    'open-ended': { label: 'Open Response', icon: Lightbulb, color: '#8B5CF6' },
  }
  const info = typeMap[type]
  return (
    <Badge className="text-[10px] gap-1" style={{ backgroundColor: `${info.color}15`, color: info.color, borderColor: `${info.color}30` }}>
      <info.icon className="w-3 h-3" />
      {info.label}
    </Badge>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AssessmentQuiz() {
  const { navigate } = useNavStore()
  const [phase, setPhase] = useState<QuizPhase>('intro')
  const [state, setState] = useState<AssessmentState>({
    currentTier: 1,
    currentQuestionIndex: 0,
    answers: {},
    tierWrongAnswers: {},
    tierScores: {},
    maxTierReached: 1,
    assessmentComplete: false,
    timePerQuestion: {},
    startedAt: Date.now(),
    placementTier: 1,
    stopReason: null,
  })
  const [showResults, setShowResults] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null)
  const [feedbackShown, setFeedbackShown] = useState(false)
  const [timerActive, setTimerActive] = useState(true)

  const currentTierDef = TIERS.find(t => t.id === state.currentTier) || TIERS[0]
  const tierQuestions = QUESTIONS.filter(q => q.tier === state.currentTier)
  const currentQuestion = tierQuestions[state.currentQuestionIndex]
  const tierProgress = tierQuestions.length > 0 ? ((state.currentQuestionIndex) / tierQuestions.length) * 100 : 0

  // Tier score so far for questions answered in current tier
  const currentTierAnsweredCount = Object.keys(state.answers).filter(id => {
    const q = QUESTIONS.find(qu => qu.id === id)
    return q && q.tier === state.currentTier
  }).length
  const currentTierCorrectCount = Object.entries(state.answers).filter(([id, score]) => {
    const q = QUESTIONS.find(qu => qu.id === id)
    return q && q.tier === state.currentTier && score >= 3
  }).length

  const dimensionScores = useMemo(() => calculateDimensionScores(state.answers), [state.answers])
  const recommendedTraining = useMemo(() => getRecommendedTraining(dimensionScores), [dimensionScores])

  const placementTierDef = TIERS.find(t => t.id === state.placementTier) || TIERS[0]
  const genzMessage = GENZ_MESSAGES[state.placementTier] || GENZ_MESSAGES[1]
  const recommendedCourse = COURSE_MAP[state.placementTier] || COURSE_MAP[1]
  const overallScore = Math.round(dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length)

  const handleSelectOption = useCallback((score: number, index: number) => {
    if (feedbackShown) return
    setSelectedOption(score)
    setAnsweredCorrectly(score >= 3)
    setFeedbackShown(true)
    setTimerActive(false)
  }, [feedbackShown])

  const handleNext = useCallback(() => {
    if (!currentQuestion || selectedOption === null) return

    const newAnswers = { ...state.answers, [currentQuestion.id]: selectedOption }
    const isWrong = isWrongAnswer(selectedOption)
    const currentWrongCount = (state.tierWrongAnswers[state.currentTier] || 0) + (isWrong ? 1 : 0)
    const newTierWrongAnswers = { ...state.tierWrongAnswers, [state.currentTier]: currentWrongCount }

    // CHECK 1: 3 wrong answers in this tier → assessment ends immediately
    if (currentWrongCount >= 3) {
      const tierScore = calculateTierScore(state.currentTier, newAnswers)
      const newTierScores = { ...state.tierScores, [state.currentTier]: tierScore }
      setState(prev => ({
        ...prev,
        answers: newAnswers,
        tierWrongAnswers: newTierWrongAnswers,
        tierScores: newTierScores,
        maxTierReached: Math.max(prev.maxTierReached, state.currentTier),
        assessmentComplete: true,
        completedAt: Date.now(),
        placementTier: state.currentTier,
        stopReason: 'wrong-answers',
      }))
      setPhase('analyzing')
      setTimeout(() => {
        setPhase('results')
        setTimeout(() => setShowResults(true), 200)
      }, 2500)
      return
    }

    // CHECK 2: Is this the last question in the tier?
    if (state.currentQuestionIndex >= tierQuestions.length - 1) {
      const tierScore = calculateTierScore(state.currentTier, newAnswers)
      const newTierScores = { ...state.tierScores, [state.currentTier]: tierScore }
      const passingScore = currentTierDef.passingScore

      // All tiers completed?
      if (state.currentTier >= 7) {
        setState(prev => ({
          ...prev,
          answers: newAnswers,
          tierWrongAnswers: newTierWrongAnswers,
          tierScores: newTierScores,
          maxTierReached: 7,
          assessmentComplete: true,
          completedAt: Date.now(),
          placementTier: tierScore >= passingScore ? 7 : 7,
          stopReason: 'completed',
        }))
        setPhase('analyzing')
        setTimeout(() => {
          setPhase('results')
          setTimeout(() => setShowResults(true), 200)
        }, 2500)
        return
      }

      // Passed tier → advance to next
      if (tierScore >= passingScore) {
        setState(prev => ({
          ...prev,
          answers: newAnswers,
          tierWrongAnswers: newTierWrongAnswers,
          tierScores: newTierScores,
          currentTier: state.currentTier + 1,
          currentQuestionIndex: 0,
          maxTierReached: Math.max(prev.maxTierReached, state.currentTier + 1),
        }))
        setSelectedOption(null)
        setAnsweredCorrectly(null)
        setFeedbackShown(false)
        setTimerActive(true)
        setPhase('tier-gate')
        return
      }

      // Failed tier → assessment ends at this tier
      setState(prev => ({
        ...prev,
        answers: newAnswers,
        tierWrongAnswers: newTierWrongAnswers,
        tierScores: newTierScores,
        maxTierReached: Math.max(prev.maxTierReached, state.currentTier),
        assessmentComplete: true,
        completedAt: Date.now(),
        placementTier: state.currentTier,
        stopReason: 'tier-failed',
      }))
      setPhase('analyzing')
      setTimeout(() => {
        setPhase('results')
        setTimeout(() => setShowResults(true), 200)
      }, 2500)
      return
    }

    // Next question in same tier
    setState(prev => ({
      ...prev,
      answers: newAnswers,
      tierWrongAnswers: newTierWrongAnswers,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }))
    setSelectedOption(null)
    setAnsweredCorrectly(null)
    setFeedbackShown(false)
    setTimerActive(true)
  }, [currentQuestion, selectedOption, state, tierQuestions, currentTierDef])

  // Auto-advance after feedback
  useEffect(() => {
    if (feedbackShown && selectedOption !== null) {
      const timer = setTimeout(handleNext, 1200)
      return () => clearTimeout(timer)
    }
  }, [feedbackShown, selectedOption, handleNext])

  const handleTimerExpire = useCallback(() => {
    if (selectedOption === null && !feedbackShown) {
      setSelectedOption(0)
      setAnsweredCorrectly(false)
      setFeedbackShown(true)
      setTimerActive(false)
    }
  }, [selectedOption, feedbackShown])

  const handleRestart = useCallback(() => {
    setState({
      currentTier: 1,
      currentQuestionIndex: 0,
      answers: {},
      tierWrongAnswers: {},
      tierScores: {},
      maxTierReached: 1,
      assessmentComplete: false,
      timePerQuestion: {},
      startedAt: Date.now(),
      placementTier: 1,
      stopReason: null,
    })
    setPhase('intro')
    setShowResults(false)
    setSelectedOption(null)
    setAnsweredCorrectly(null)
    setFeedbackShown(false)
    setTimerActive(true)
  }, [])

  // ──────────── INTRO PHASE ────────────
  if (phase === 'intro') {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold text-[#1B3A4B]">Competency Assessment</h2>
          <p className="text-muted-foreground mt-1">Progressive evaluation — you advance until you hit your limit</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-[#0D1B2A] to-[#1B3A4B] border-[#D4A843]/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A843] rounded-full opacity-[0.04] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0D7377] rounded-full opacity-[0.06] translate-y-1/2 -translate-x-1/4" />

            <CardContent className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="flex-1">
                  <Badge className="bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30 mb-3">
                    <Gem className="w-3 h-3 mr-1" /> Progressive Tier System
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    Find Your Diplomatic Level
                  </h3>
                  <p className="text-white/50 text-sm mb-4 leading-relaxed">
                    This isn&apos;t about answering all 71 questions. Start at Tier 1 and work your way up.
                    Get 3 wrong answers in a tier and the assessment stops — you&apos;re placed at that level.
                    Pass a tier and you advance. Simple as that.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-[10px] bg-white/10 text-white/70 border-white/10">
                      <Timer className="w-3 h-3 mr-1" /> Timed Questions
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-red-500/15 text-red-400 border-red-500/20">
                      <AlertTriangle className="w-3 h-3 mr-1" /> 3 Wrong = Stop
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                      <TrendingUp className="w-3 h-3 mr-1" /> Pass = Advance
                    </Badge>
                  </div>
                  <Button
                    className="bg-[#D4A843] text-[#1B3A4B] hover:bg-[#D4BA6E] font-semibold"
                    onClick={() => { setPhase('quiz'); setTimerActive(true) }}
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Assessment
                  </Button>
                </div>

                <div className="w-full lg:w-[320px] shrink-0">
                  <div className="space-y-1.5">
                    {[...TIERS].reverse().map((tier, i) => {
                      const widthPercent = tier.id === 7 ? 40 : tier.id === 6 ? 50 : tier.id === 5 ? 60 : tier.id === 4 ? 70 : tier.id === 3 ? 80 : tier.id === 2 ? 90 : 100
                      return (
                        <motion.div
                          key={tier.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                          className="flex items-center justify-center"
                        >
                          <div className="relative group" style={{ width: `${widthPercent}%` }}>
                            <div
                              className="flex items-center gap-2.5 p-2 rounded-lg border transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg"
                              style={{ backgroundColor: `${tier.color}12`, borderColor: `${tier.color}25` }}
                            >
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${tier.color}20` }}>
                                <tier.icon className="w-3.5 h-3.5" style={{ color: tier.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-white/90 block leading-tight">{tier.name}</span>
                                <span className="text-[10px] text-white/40">{tier.subtitle} · {tier.passingScore}% pass</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold" style={{ color: tier.color }}>T{tier.id}</span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: ListChecks, title: 'Start at Tier 1', desc: 'Answer questions starting from the basics. Each tier gets progressively harder.' },
                  { icon: AlertTriangle, title: '3 Strikes Per Tier', desc: 'Get 3 wrong answers (score 0-1) in any tier and the assessment stops at that level.' },
                  { icon: Trophy, title: 'Advance or Place', desc: 'Pass a tier to advance. Fail a tier and you\'re placed there with a personalized learning plan.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-lg bg-[#0D7377]/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-[#0D7377]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-0.5">{item.title}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tier Levels</CardTitle>
                <Badge variant="secondary" className="text-[10px]">7 Tiers</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {TIERS.map((tier, i) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${tier.color}15` }}>
                            <tier.icon className="w-4.5 h-4.5" style={{ color: tier.color }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold leading-tight">{tier.name}</div>
                            <div className="text-[10px] text-muted-foreground">Tier {tier.id} · {tier.subtitle}</div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{tier.description}</p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{tier.questionsPerTier} questions</span>
                          <span className="font-medium" style={{ color: tier.color }}>{tier.passingScore}% pass</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="border-[#0D7377]/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0D7377]/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-[#0D7377]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Research Paper Evaluation</div>
                <div className="text-xs text-muted-foreground">Submit position papers for AI-powered evaluation with originality detection</div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => navigate('research')}>
                <ArrowRight className="w-3 h-3 mr-1" /> Research Lab
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ──────────── TIER GATE PHASE ────────────
  if (phase === 'tier-gate') {
    const fromTier = TIERS.find(t => t.id === state.currentTier - 1) || TIERS[0]
    return (
      <div className="min-h-[400px]">
        <TierGateAnimation
          fromTier={fromTier}
          toTier={currentTierDef}
          onContinue={() => { setPhase('quiz'); setTimerActive(true) }}
        />
      </div>
    )
  }

  // ──────────── ANALYZING PHASE ────────────
  if (phase === 'analyzing') {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0D7377] to-[#D4A843] flex items-center justify-center mb-6"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold mb-2">Analyzing Your Results...</h3>
          <p className="text-muted-foreground text-sm">Calculating placement across {state.maxTierReached} tier{state.maxTierReached > 1 ? 's' : ''}</p>
          <div className="mt-6 flex gap-2">
            {DIMENSIONS.slice(0, 10).map((dim, i) => (
              <motion.div
                key={dim.key}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dim.color }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // ──────────── RESULTS PHASE (GenZ Popup) ────────────
  if (phase === 'results') {
    const radarData = dimensionScores.map(d => ({ subject: d.name, value: d.score, fullMark: 100 }))
    const showConfetti = state.placementTier >= 3 || (state.stopReason === 'completed')

    return (
      <>
        <ConfettiEffect active={showResults && showConfetti} />
        <ScrollArea className="max-h-[calc(100vh-8rem)]">
          <div className="space-y-6 pb-8">
            {/* GenZ Result Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={showResults ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <Card className="overflow-hidden border-2 relative" style={{ borderColor: `${placementTierDef.color}40` }}>
                <div className="h-3" style={{ background: `linear-gradient(90deg, ${placementTierDef.gradientFrom}, ${placementTierDef.gradientTo})` }} />
                <SparkleEffect active={showResults && state.placementTier >= 3} />
                <CardContent className="p-6 md:p-8 relative z-10">
                  <div className="text-center">
                    {/* Tier Icon */}
                    <motion.div
                      className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center border-4"
                      style={{
                        backgroundColor: placementTierDef.bgColor,
                        borderColor: placementTierDef.color,
                        boxShadow: `0 0 50px ${placementTierDef.color}40`,
                      }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={showResults ? { scale: 1, rotate: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.3, type: 'spring' }}
                    >
                      <placementTierDef.icon className="w-12 h-12" style={{ color: placementTierDef.color }} />
                    </motion.div>

                    {/* Tier Badge */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={showResults ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}>
                      <Badge className="mb-3 text-xs" style={{ backgroundColor: `${placementTierDef.color}15`, color: placementTierDef.color, borderColor: `${placementTierDef.color}30` }}>
                        TIER {state.placementTier} OF 7
                      </Badge>
                    </motion.div>

                    {/* Tier Name */}
                    <motion.h2
                      className="text-2xl md:text-3xl font-bold mb-1"
                      style={{ color: placementTierDef.color }}
                      initial={{ opacity: 0 }}
                      animate={showResults ? { opacity: 1 } : {}}
                      transition={{ delay: 0.6 }}
                    >
                      {placementTierDef.name}
                    </motion.h2>
                    <motion.p className="text-sm text-muted-foreground mb-4" initial={{ opacity: 0 }} animate={showResults ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}>
                      {placementTierDef.subtitle}
                    </motion.p>

                    {/* GenZ Message */}
                    <motion.div
                      className="bg-muted/50 rounded-2xl p-5 mb-5 max-w-lg mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={showResults ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="text-3xl mb-2">{genzMessage.emoji}</div>
                      <p className="text-lg font-bold mb-2" style={{ color: placementTierDef.color }}>{genzMessage.message}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{genzMessage.subtext}</p>
                    </motion.div>

                    {/* Score Ring */}
                    <motion.div
                      className="flex items-center justify-center gap-6 mb-5"
                      initial={{ opacity: 0 }}
                      animate={showResults ? { opacity: 1 } : {}}
                      transition={{ delay: 1 }}
                    >
                      <div className="relative w-24 h-24">
                        <svg width={96} height={96} className="-rotate-90">
                          <circle cx={48} cy={48} r={38} fill="none" stroke="#e5e7eb" strokeWidth={6} />
                          <motion.circle
                            cx={48} cy={48} r={38} fill="none" stroke={placementTierDef.color} strokeWidth={6}
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 38}
                            initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                            animate={showResults ? { strokeDashoffset: 2 * Math.PI * 38 * (1 - overallScore / 100) } : {}}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 1.2 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold" style={{ color: placementTierDef.color }}>{overallScore}</span>
                          <span className="text-[8px] text-muted-foreground font-medium">OVERALL</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Stop Reason */}
                    {state.stopReason && (
                      <motion.div initial={{ opacity: 0 }} animate={showResults ? { opacity: 1 } : {}} transition={{ delay: 1.1 }}>
                        <Badge variant="outline" className="text-xs gap-1">
                          {state.stopReason === 'wrong-answers' && <><XCircle className="w-3 h-3 text-red-500" /> Stopped — 3 wrong answers in Tier {state.placementTier}</>}
                          {state.stopReason === 'tier-failed' && <><AlertTriangle className="w-3 h-3 text-amber-500" /> Tier {state.placementTier} not passed</>}
                          {state.stopReason === 'completed' && <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> All 7 tiers completed!</>}
                        </Badge>
                      </motion.div>
                    )}

                    {/* Start Your Journey Button */}
                    <motion.div
                      className="mt-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={showResults ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 1.3 }}
                    >
                      <Button
                        size="lg"
                        className="font-semibold px-8 h-12 text-base"
                        style={{ background: `linear-gradient(135deg, ${placementTierDef.gradientFrom}, ${placementTierDef.gradientTo})`, color: '#fff' }}
                        onClick={() => navigate('training')}
                      >
                        <Rocket className="w-5 h-5 mr-2" /> Start Your Journey
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">Recommended: {recommendedCourse}</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tier Progress Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showResults ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.4 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tier Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {TIERS.map((tier) => {
                      const reached = tier.id <= state.maxTierReached
                      const score = state.tierScores[tier.id]
                      return (
                        <div
                          key={tier.id}
                          className={`flex flex-col items-center p-2 rounded-lg border transition-all ${reached ? 'border-current' : 'border-muted opacity-40'}`}
                          style={reached ? { borderColor: `${tier.color}40`, backgroundColor: `${tier.color}08` } : {}}
                        >
                          <tier.icon className="w-5 h-5 mb-1" style={{ color: reached ? tier.color : '#94A3B8' }} />
                          <span className="text-[10px] font-semibold text-center" style={{ color: reached ? tier.color : undefined }}>
                            {tier.name.split(' ')[0]}
                          </span>
                          {score !== undefined && <span className="text-[9px] font-bold mt-0.5" style={{ color: tier.color }}>{score}%</span>}
                          {reached && <CheckCircle2 className="w-3 h-3 mt-1" style={{ color: tier.color }} />}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Radar Chart + Skill Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={showResults ? { opacity: 1, x: 0 } : {}} transition={{ delay: 1.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Competency Radar</CardTitle>
                    <CardDescription>Multi-dimension diplomatic skill profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full aspect-square max-w-[400px] mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e5e7eb" strokeOpacity={0.5} />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                          <Radar name="Score" dataKey="value" stroke={placementTierDef.color} fill={placementTierDef.color} fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={showResults ? { opacity: 1, x: 0 } : {}} transition={{ delay: 1.6 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Competency Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {['knowledge', 'skills', 'behavior'].map((category) => {
                      const catScores = dimensionScores.filter(d => d.category === category)
                      const catLabel = category === 'knowledge' ? 'Knowledge' : category === 'skills' ? 'Skills' : 'Behavior'
                      const catIcon = category === 'knowledge' ? Brain : category === 'skills' ? Zap : Heart
                      return (
                        <div key={category}>
                          <div className="flex items-center gap-2 mb-2">
                            {React.createElement(catIcon, { className: 'w-4 h-4 text-muted-foreground' })}
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{catLabel}</span>
                            <Separator className="flex-1" />
                          </div>
                          {catScores.map((dim) => (
                            <div key={dim.key} className="mb-2.5">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  <dim.icon className="w-3.5 h-3.5" style={{ color: dim.color }} />
                                  <span className="text-xs font-medium">{dim.name}</span>
                                </div>
                                <span className="text-xs font-bold" style={{ color: dim.score >= 70 ? '#059669' : dim.score >= 50 ? '#D4A843' : '#DC2626' }}>
                                  {dim.score}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: dim.color }}
                                  initial={{ width: 0 }}
                                  animate={showResults ? { width: `${dim.score}%` } : { width: 0 }}
                                  transition={{ duration: 0.8, delay: 1.7 + dimensionScores.indexOf(dim) * 0.04, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recommended Training */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={showResults ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.8 }}>
              <Card className="border-[#0D7377]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#0D7377]" />
                    Recommended Training
                  </CardTitle>
                  <CardDescription>Your personalized learning path starting at Tier {state.placementTier}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recommendedTraining.map((course, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#0D7377]/30 hover:bg-[#0D7377]/5 transition-all cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-[#0D7377]/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-[#0D7377]" />
                        </div>
                        <span className="text-sm font-medium">{course}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showResults ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Button
                className="bg-[#0D7377] hover:bg-[#0D7377]/90 text-white font-semibold px-8 h-12"
                onClick={() => navigate('training')}
              >
                <GraduationCap className="w-4 h-4 mr-2" /> Continue Your Training
              </Button>
              <Button variant="outline" className="px-6 h-12" onClick={handleRestart}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retake Assessment
              </Button>
              <Button variant="outline" className="px-6 h-12">
                <Share2 className="w-4 h-4 mr-2" /> Share Report
              </Button>
            </motion.div>
          </div>
        </ScrollArea>
      </>
    )
  }

  // ──────────── QUIZ PHASE ────────────
  return (
    <div className="space-y-4">
      {/* Top bar: Tier info + progress */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <TierBadge tier={currentTierDef} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#1B3A4B]">Tier {state.currentTier}: {currentTierDef.name}</h2>
                <Badge className="text-[10px]" style={{ backgroundColor: `${currentTierDef.color}15`, color: currentTierDef.color, borderColor: `${currentTierDef.color}30` }}>
                  {currentTierDef.subtitle}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Question {state.currentQuestionIndex + 1} of {tierQuestions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Score counter */}
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Score</div>
              <div className="text-sm font-bold" style={{ color: currentTierDef.color }}>
                {currentTierCorrectCount}/{currentTierAnsweredCount}
              </div>
            </div>
            {/* Wrong answer strikes */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((strike) => (
                <motion.div
                  key={strike}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    strike <= (state.tierWrongAnswers[state.currentTier] || 0)
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-muted-foreground/30 text-muted-foreground/40'
                  }`}
                  animate={strike === (state.tierWrongAnswers[state.currentTier] || 0) + 1 && feedbackShown && answeredCorrectly === false ? {
                    scale: [1, 1.3, 1],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <XCircle className="w-3.5 h-3.5" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tier progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: currentTierDef.color }}
            animate={{ width: `${tierProgress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Tier ladder dots */}
        <div className="flex items-center gap-1 mt-2">
          {TIERS.map((tier) => {
            const isCurrent = tier.id === state.currentTier
            const isCompleted = state.tierScores[tier.id] !== undefined
            return (
              <div
                key={tier.id}
                className={`flex-1 h-2 rounded-full transition-all ${isCurrent ? 'ring-2 ring-offset-1' : ''}`}
                style={{
                  backgroundColor: isCompleted ? tier.color : isCurrent ? `${tier.color}60` : '#e5e7eb',
                  ...(isCurrent ? { boxShadow: `0 0 0 2px white, 0 0 0 4px ${tier.color}` } : {}),
                }}
                title={`Tier ${tier.id}: ${tier.name}${state.tierScores[tier.id] ? ` (${state.tierScores[tier.id]}%)` : ''}`}
              />
            )
          })}
        </div>
      </motion.div>

      {/* Question card */}
      {currentQuestion && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="overflow-hidden">
              {/* Timer bar at top */}
              <TimerBar
                timeLimit={currentQuestion.timeLimit}
                onExpire={handleTimerExpire}
                isActive={timerActive && !feedbackShown}
              />

              <CardContent className="p-5 md:p-6">
                {/* Question meta */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <QuestionTypeBadge type={currentQuestion.type} />
                    {currentQuestion.checkpoint && (
                      <Badge className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20 gap-1">
                        <AlertTriangle className="w-3 h-3" /> Checkpoint
                      </Badge>
                    )}
                    {currentQuestion.dimensions.slice(0, 2).map(dim => {
                      const dimInfo = DIMENSIONS.find(d => d.key === dim)
                      if (!dimInfo) return null
                      return (
                        <Badge key={dim} variant="outline" className="text-[10px]">
                          {dimInfo.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {/* Question text */}
                <h3 className="text-base md:text-lg font-semibold mb-2 leading-relaxed text-[#1B3A4B]">{currentQuestion.text}</h3>
                {currentQuestion.subtext && (
                  <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed bg-muted/30 p-3 rounded-lg">
                    {currentQuestion.subtext}
                  </p>
                )}

                {/* Option Cards */}
                <div className="grid grid-cols-1 gap-2.5 mt-4">
                  {currentQuestion.options.map((option, i) => {
                    const isSelected = selectedOption === option.score
                    const isCorrectOption = option.score >= 3
                    const isWrongOption = isWrongAnswer(option.score)
                    const showCorrectHighlight = feedbackShown && isSelected && isCorrectOption
                    const showWrongHighlight = feedbackShown && isSelected && isWrongOption
                    const showThisCorrect = feedbackShown && !isSelected && isCorrectOption && answeredCorrectly === false

                    let borderClass = 'border-muted hover:border-[#0D7377]/40'
                    let bgClass = 'hover:bg-[#0D7377]/4'

                    if (showCorrectHighlight) {
                      borderClass = 'border-emerald-500'
                      bgClass = 'bg-emerald-500/8'
                    } else if (showWrongHighlight) {
                      borderClass = 'border-red-500'
                      bgClass = 'bg-red-500/8'
                    } else if (showThisCorrect) {
                      borderClass = 'border-emerald-500/50'
                      bgClass = 'bg-emerald-500/4'
                    } else if (isSelected && !feedbackShown) {
                      borderClass = 'border-[#0D7377]'
                      bgClass = 'bg-[#0D7377]/8'
                    }

                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleSelectOption(option.score, i)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${borderClass} ${bgClass} ${feedbackShown ? 'pointer-events-none' : ''}`}
                        whileHover={!feedbackShown ? { scale: 1.005, y: -1 } : {}}
                        whileTap={!feedbackShown ? { scale: 0.995 } : {}}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold transition-all ${
                            showCorrectHighlight
                              ? 'bg-emerald-500 text-white'
                              : showWrongHighlight
                              ? 'bg-red-500 text-white'
                              : isSelected && !feedbackShown
                              ? 'bg-[#0D7377] text-white'
                              : 'bg-muted text-muted-foreground group-hover:bg-[#0D7377]/10 group-hover:text-[#0D7377]'
                          }`}>
                            {showCorrectHighlight ? <CheckCircle2 className="w-4 h-4" /> : showWrongHighlight ? <XCircle className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm leading-relaxed ${isSelected ? 'font-medium' : ''} ${showWrongHighlight ? 'text-red-600' : showCorrectHighlight ? 'text-emerald-700' : ''}`}>
                              {option.text}
                            </span>
                            {option.feedback && feedbackShown && isSelected && (
                              <motion.p
                                className="text-xs text-muted-foreground mt-1 italic"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                              >
                                {option.feedback}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Feedback indicator */}
                <AnimatePresence>
                  {feedbackShown && (
                    <motion.div
                      className="mt-4 flex items-center gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {answeredCorrectly ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-medium text-emerald-600">Correct!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="text-sm font-medium text-red-600">Not quite right</span>
                          {(state.tierWrongAnswers[state.currentTier] || 0) + (isWrongAnswer(selectedOption ?? 0) ? 1 : 0) >= 3 && (
                            <Badge className="text-[10px] bg-red-500/10 text-red-500 border-red-500/20 ml-2">
                              3 strikes — assessment ending
                            </Badge>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Bottom info */}
      <div className="text-xs text-muted-foreground text-center">
        {Object.keys(state.answers).length} questions answered across {Object.keys(state.tierScores).length + (state.tierScores[state.currentTier] === undefined ? 1 : 0)} tier{Object.keys(state.tierScores).length + (state.tierScores[state.currentTier] === undefined ? 1 : 0) !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
