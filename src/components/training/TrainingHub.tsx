'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Clock, Zap, Award, ChevronRight, ChevronLeft,
  Search, Filter, CheckCircle2, Lock, Play, Star, Trophy,
  Gavel, FileText, Shield, Mic, Handshake, Brain, Crown,
  Flame, Target, Users, ArrowLeft, Sparkles, Eye,
  GraduationCap, Siren, Scale, BadgeCheck, Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ============================================================
// TYPES & DATA
// ============================================================

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  content: string
}

interface Course {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  xpReward: number
  gradient: string
  icon: React.ElementType
  roleTag?: string
  lessons: Lesson[]
  category: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ElementType
  earned: boolean
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
}

const COURSES: Course[] = [
  {
    id: 'parliamentary-procedure',
    title: 'Parliamentary Procedure & Robert\'s Rules',
    description: 'Master the formal rules of debate, motions, and voting procedures used in MUN committees worldwide.',
    difficulty: 'Beginner',
    duration: '5h',
    xpReward: 150,
    gradient: 'from-[#0D7377] to-[#059669]',
    icon: Gavel,
    category: 'Procedures',
    lessons: [
      { id: 'pp-1', title: 'Introduction to Parliamentary Procedure', description: 'Understand the foundations of formal debate rules and why they matter in MUN.', duration: '45m', completed: false, content: 'Parliamentary procedure provides the framework for orderly and efficient discussion in MUN committees. Based on Robert\'s Rules of Order, these procedures ensure every delegate has a voice while maintaining decorum and progress.\n\n## Key Concepts\n- **Order of Precedence**: Motions have a specific hierarchy that determines which takes priority\n- **Quorum**: The minimum number of delegates needed to conduct business\n- **Decorum**: Rules of respectful conduct during debate\n\nUnderstanding these fundamentals is essential before participating in any MUN committee session.' },
      { id: 'pp-2', title: 'Types of Motions & Their Order', description: 'Learn the different motion categories: main, subsidiary, privileged, and incidental.', duration: '60m', completed: false, content: 'Motions are the building blocks of committee action. Understanding their types and hierarchy is crucial.\n\n## Motion Categories\n\n### Main Motions\n- Introduce new business to the committee\n- Require a second and are debatable\n\n### Subsidiary Motions\n- Help dispose of main motions\n- Include: Lay on Table, Previous Question, Limit Debate, Refer to Committee, Amend, Postpone\n\n### Privileged Motions\n- Deal with urgent matters unrelated to pending business\n- Include: Adjourn, Recess, Raise Question of Privilege\n\n### Incidental Motions\n- Deal with procedure-related questions\n- Include: Point of Order, Appeal, Suspend Rules, Division of the Question' },
      { id: 'pp-3', title: 'Voting Procedures & Methods', description: 'Explore different voting methods including roll call, placard, and consensus.', duration: '50m', completed: false, content: 'Voting is the culminating step of committee deliberation. Different situations call for different voting methods.\n\n## Voting Methods\n\n1. **Placard Vote**: Delegates raise their placards; the Chair counts\n2. **Roll Call Vote**: Each delegate is called by name and must respond\n3. **Consensus**: No formal vote; agreement is reached through discussion\n\n## Important Rules\n- Simple majority (50%+1) for most procedural matters\n- Two-thirds majority for substantive resolutions in some committees\n- Security Council: 9 of 15 votes needed, with no veto from permanent members\n\nDelegates should understand when each method is appropriate and how to request a specific voting procedure.' },
      { id: 'pp-4', title: 'Points & Inquiries', description: 'Master Points of Order, Parliamentary Inquiry, and Information to navigate committee sessions.', duration: '40m', completed: false, content: 'Points allow delegates to address procedural concerns during committee sessions.\n\n## Types of Points\n\n### Point of Order\n- Used when rules are being violated\n- Takes precedence over the current speaker\n- Must be raised immediately when the infraction occurs\n\n### Point of Parliamentary Inquiry\n- Used to ask the Chair about proper procedure\n- Not debatable; the Chair responds directly\n\n### Point of Information\n- Used to ask a question of the current speaker\n- Requires the speaker\'s consent\n\n### Right of Reply\n- Used when a delegate feels personally insulted\n- Discretionary on the part of the Chair\n\nProper use of points demonstrates parliamentary expertise and protects your rights as a delegate.' },
      { id: 'pp-5', title: 'Practice Simulation: Running a Committee Session', description: 'Apply your knowledge in a guided walkthrough of a complete committee session.', duration: '90m', completed: false, content: 'This lesson walks through a complete committee session from start to finish.\n\n## Session Flow\n\n1. **Roll Call** → Delegates confirm presence\n2. **Setting the Agenda** → Vote on which topic to discuss first\n3. **General Speakers List (GSL)** → Delegates present their country\'s position\n4. **Moderated Caucus** → Focused debate on specific sub-topics\n5. **Unmoderated Caucus** → Informal negotiation and resolution drafting\n6. **Draft Resolution Submission** → Formal document presented\n7. **Amendment Process** → Changes debated and voted on\n8. **Voting Procedure** → Final vote on resolutions\n\n## Tips for Success\n- Always know where you are in the procedure\n- Use points effectively to protect your rights\n- Time your motions strategically\n- Build support before making substantive motions' },
    ],
  },
  {
    id: 'resolution-writing',
    title: 'Resolution Writing Workshop',
    description: 'Learn to craft compelling, legally sound resolutions that can pass committee vote.',
    difficulty: 'Intermediate',
    duration: '4h',
    xpReward: 200,
    gradient: 'from-[#059669] to-[#0D7377]',
    icon: FileText,
    category: 'Writing',
    lessons: [
      { id: 'rw-1', title: 'Resolution Structure & Format', description: 'Understand the three-part structure: heading, preambular clauses, and operative clauses.', duration: '50m', completed: false, content: 'A resolution is the formal document that expresses the committee\'s collective decision.\n\n## Resolution Structure\n\n### Heading\n- Committee name\n- Topic being addressed\n- Sponsors and signatories\n\n### Preambular Clauses\n- Begin with italicized verbs (Recognizing, Noting, Deeply Concerned)\n- Provide context and justification\n- Reference previous UN actions and documents\n- Do NOT introduce new actions\n\n### Operative Clauses\n- Begin with underlined verbs (Urges, Calls Upon, Decides)\n- Numbered sequentially (1, 2, 3...)\n- Each clause contains one specific action\n- Arranged from general to specific\n\nUnderstanding this structure is the foundation of effective resolution writing.' },
      { id: 'rw-2', title: 'Writing Effective Preambular Clauses', description: 'Master the art of building a strong foundation for your resolution with proper context.', duration: '45m', completed: false, content: 'Preambular clauses set the stage for your operative clauses by establishing the problem and its context.\n\n## Common Preambular Phrases\n- **Acknowledging** — Recognizing existing efforts\n- **Alarmed by** — Expressing urgency about a situation\n- **Deeply concerned** — Showing worry about developments\n- **Emphasizing** — Highlighting important principles\n- **Recalling** — Referencing previous UN resolutions\n- **Reaffirming** — Restating commitment to existing agreements\n\n## Best Practices\n1. Start broad, then narrow to your specific topic\n2. Reference relevant UN documents and treaties\n3. Build a logical argument leading to your operative clauses\n4. Keep clauses concise and factual\n5. Avoid emotional language without factual backing' },
      { id: 'rw-3', title: 'Crafting Actionable Operative Clauses', description: 'Write operative clauses that are specific, actionable, and within the committee\'s authority.', duration: '55m', completed: false, content: 'Operative clauses are the heart of your resolution — they specify what action the committee will take.\n\n## Common Operative Phrases\n- **Calls upon** — Requesting action from member states\n- **Urges** — Strongly recommending action\n- **Decides** — Making a binding decision\n- **Requests** — Asking the Secretary-General to act\n- **Establishes** — Creating new bodies or mechanisms\n- **Condemns** — Expressing strong disapproval\n\n## Writing Tips\n1. Each clause should contain ONE specific action\n2. Be realistic — stay within the committee\'s mandate\n3. Include implementation details (timelines, funding, reporting)\n4. Use progressively stronger language as needed\n5. Consider creating monitoring mechanisms\n6. Think about funding and feasibility' },
      { id: 'rw-4', title: 'Amendments & Consensus Building', description: 'Learn to navigate the amendment process and build coalitions around your resolution.', duration: '60m', completed: false, content: 'Even the best resolutions need amendments to gain broad support.\n\n## Types of Amendments\n\n### Friendly Amendments\n- Approved by all sponsors\n- Automatically incorporated without vote\n- Strengthen the resolution\n\n### Unfriendly Amendments\n- Not approved by all sponsors\n- Require a vote to be adopted\n- Need support from the committee\n\n## Building Consensus\n1. **Pre-negotiation**: Discuss with other delegates before formal submission\n2. **Incorporating feedback**: Be willing to modify clauses for broader support\n3. **Co-sponsorship**: Invite other delegates to sponsor your resolution\n4. **Strategic signatories**: Get signatories from diverse regional groups\n5. **Compromise**: Identify non-essential clauses you can modify\n\nRemember: A passed resolution with compromises beats a perfect resolution that fails.' },
    ],
  },
  {
    id: 'crisis-committee',
    title: 'Crisis Committee Protocols',
    description: 'Prepare for the unexpected — master crisis simulations, backroom strategy, and rapid response.',
    difficulty: 'Advanced',
    duration: '3.5h',
    xpReward: 250,
    gradient: 'from-[#E11D48] to-[#DC2626]',
    icon: Siren,
    category: 'Crisis',
    lessons: [
      { id: 'cc-1', title: 'Understanding Crisis Committees', description: 'Learn what makes crisis committees different from traditional GA committees.', duration: '40m', completed: false, content: 'Crisis committees are the most dynamic and unpredictable part of MUN.\n\n## Key Differences from Traditional Committees\n- **Dynamic agenda**: The situation evolves in real-time based on delegate actions\n- **Crisis updates**: New information is introduced periodically by the crisis staff\n- **Personal powers**: Delegates may have individual abilities beyond voting\n- **Backroom actions**: Delegates can send private notes to the crisis team\n- **Faster pace**: Decisions must be made quickly under pressure\n\n## Types of Crisis Committees\n1. **Historical**: Recreating past events (e.g., Cuban Missile Crisis)\n2. **Futurist**: Imagining future scenarios (e.g., Climate Crisis 2050)\n3. **Fictional**: Based on fictional universes (e.g., Starfleet Command)\n4. **Ad-Hoc**: Unique and creative scenarios\n\nCrisis committees reward creativity, quick thinking, and strategic action.' },
      { id: 'cc-2', title: 'Crisis Notes & Backroom Strategy', description: 'Master the art of writing effective crisis notes and executing backroom plans.', duration: '50m', completed: false, content: 'Crisis notes are your primary tool for backroom action.\n\n## Writing Effective Crisis Notes\n\n### Structure\n1. **Identity**: Who you are and your authority\n2. **Action**: What you want to do (be specific)\n3. **Resources**: What you\'re using to accomplish it\n4. **Justification**: Why this makes sense in character\n\n### Tips\n- Be specific but flexible — crisis staff may adapt your actions\n- Consider unintended consequences\n- Use your character\'s real-world resources and authority\n- Coordinate with allies before sending notes\n- Balance personal action with committee participation\n\n## Common Mistakes\n- Sending too many notes (quality over quantity)\n- Ignoring committee floor debate\n- Acting out of character\n- Requesting impossible actions\n- Forgetting to maintain your cover' },
      { id: 'cc-3', title: 'Responding to Crisis Updates', description: 'Develop strategies for adapting to new information and shifting circumstances.', duration: '45m', completed: false, content: 'Crisis updates change everything — your ability to adapt determines your success.\n\n## Types of Crisis Updates\n- **Escalation**: The situation worsens\n- **New Actor**: A new party enters the crisis\n- **Intelligence**: New information is revealed\n- **Consequence**: Results of previous delegate actions\n- **Complication**: New obstacles arise\n\n## Response Strategy\n\n1. **Read carefully**: Understand every detail of the update\n2. **Assess impact**: How does this change the current situation?\n3. **Adjust plans**: Modify your strategy accordingly\n4. **Communicate**: Share relevant information with allies\n5. **Act quickly**: Crisis moves fast — delay is costly\n\n## Maintaining Composure\n- Stay in character even when surprised\n- Use new information to your advantage\n- Don\'t panic — every update is an opportunity\n- Think two steps ahead' },
      { id: 'cc-4', title: 'Directives & Joint Crisis Actions', description: 'Write effective directives and coordinate joint crisis responses across committees.', duration: '55m', completed: false, content: 'Directives are the primary output of crisis committees — they differ from traditional resolutions.\n\n## Directives vs. Resolutions\n- **Shorter and more immediate**\n- **Focus on actionable steps**, not preambular context\n- **Can be classified** (secret directives)\n- **May request resources** from crisis staff\n- **Often time-sensitive** with expiration\n\n## Writing Effective Directives\n1. State the action clearly and concisely\n2. Specify who is responsible for implementation\n3. Include timeline and resource requirements\n4. Consider multiple scenarios and contingencies\n5. Build support before formal introduction\n\n## Joint Crisis Committees (JCC)\n- Two committees face the same crisis from different perspectives\n- Actions in one committee affect the other\n- Communication happens through crisis staff\n- Requires even more strategic thinking and coordination' },
    ],
  },
  {
    id: 'diplomatic-negotiation',
    title: 'Diplomatic Negotiation Strategies',
    description: 'Build alliances, negotiate compromises, and master the art of diplomatic persuasion.',
    difficulty: 'Intermediate',
    duration: '3h',
    xpReward: 200,
    gradient: 'from-[#D4A843] to-[#B8942E]',
    icon: Handshake,
    category: 'Negotiation',
    lessons: [
      { id: 'dn-1', title: 'Fundamentals of MUN Negotiation', description: 'Understand the principles of effective negotiation in a diplomatic context.', duration: '40m', completed: false, content: 'Negotiation is at the heart of diplomacy and MUN.\n\n## Core Principles\n\n1. **BATNA** (Best Alternative to Negotiated Agreement): Know your walk-away point\n2. **ZOPA** (Zone of Possible Agreement): The overlap between parties\' acceptable ranges\n3. **Interest-based negotiation**: Focus on underlying interests, not positions\n4. **Win-win mindset**: Seek solutions that benefit all parties\n\n## The Negotiation Process\n1. Preparation — Know your country\'s position and red lines\n2. Opening — Establish rapport and understand others\' positions\n3. Bargaining — Exchange concessions and find common ground\n4. Closing — Solidify agreements and document commitments\n\nIn MUN, successful negotiation means building a coalition that can pass your resolution.' },
      { id: 'dn-2', title: 'Building Alliances & Blocs', description: 'Learn to form effective voting blocs and strategic alliances.', duration: '45m', completed: false, content: 'Alliances are the engine of MUN committee work.\n\n## Types of Blocs\n- **Regional**: Countries in the same geographic area (EU, AU, ASEAN)\n- **Political**: Countries with similar political systems or ideologies\n- **Economic**: Countries with shared economic interests (G77, G7)\n- **Issue-based**: Countries aligned on a specific topic\n\n## Building Your Bloc\n1. **Identify natural allies** based on your country\'s interests\n2. **Approach early** — during unmoderated caucus or breaks\n3. **Offer value** — information, support, or resources\n4. **Be reliable** — follow through on commitments\n5. **Maintain communication** — keep allies informed\n\n## Managing Bloc Dynamics\n- Respect different perspectives within your bloc\n- Don\'t dominate — listen to smaller nations\n- Use bloc meetings efficiently\n- Be willing to compromise for bloc unity' },
      { id: 'dn-3', title: 'Compromise & Consensus Techniques', description: 'Master the art of finding common ground while advancing your interests.', duration: '50m', completed: false, content: 'The best delegates know when to hold firm and when to compromise.\n\n## Compromise Strategies\n\n### Logrolling\n- Exchange concessions on different issues\n- "I\'ll support your amendment if you support mine"\n\n### Bridging\n- Find a new option that satisfies both parties\' interests\n- Neither side gets exactly what they wanted\n\n### Cost-Cutting\n- Make the compromise less costly for the other side\n- Reduce the burden of concession\n\n### Compensation\n- Provide something unrelated to compensate for a concession\n\n## When NOT to Compromise\n- Core national interests / red lines\n- When the compromise undermines your resolution\n- When you have the votes without compromise\n- When the other side isn\'t negotiating in good faith\n\n## Achieving Consensus\n- Build broad support incrementally\n- Address concerns proactively\n- Create ownership among all parties\n- Use gradual implementation to ease concerns' },
      { id: 'dn-4', title: 'Handling Difficult Delegates', description: 'Strategies for managing obstinate, aggressive, or uncooperative counterparts.', duration: '45m', completed: false, content: 'Not every delegate will be easy to work with — preparation is key.\n\n## Common Difficult Behaviors\n- **The Blocker**: Refuses any compromise\n- **The Dominator**: Tries to control every discussion\n- **The Free-Rider**: Benefits from others\' work without contributing\n- **The Saboteur**: Actively works against coalition efforts\n\n## Response Strategies\n\n### For Blockers\n- Understand their underlying interests\n- Find creative solutions that address their concerns\n- Isolate them if they refuse to engage constructively\n\n### For Dominators\n- Assert your position firmly but politely\n- Use parliamentary procedure to manage speaking time\n- Build support from other delegates\n\n### For Free-Riders\n- Assign specific responsibilities\n- Make contribution a condition of membership\n\n### For Saboteurs\n- Document their actions\n- Build a strong coalition that can override their objections\n- Address their concerns directly if legitimate' },
    ],
  },
  {
    id: 'public-speaking',
    title: 'Public Speaking & Oratory Skills',
    description: 'Command the room with powerful speeches, persuasive delivery, and confident presence.',
    difficulty: 'Intermediate',
    duration: '4h',
    xpReward: 200,
    gradient: 'from-[#7C3AED] to-[#6D28D9]',
    icon: Mic,
    category: 'Speaking',
    lessons: [
      { id: 'ps-1', title: 'Speech Structure & Frameworks', description: 'Master the Point-Reason-Example framework and other speech structures.', duration: '45m', completed: false, content: 'A well-structured speech is the foundation of effective oratory in MUN.\n\n## The PRE Framework\n\n### Point\n- State your position clearly\n- Make it specific and actionable\n- Connect it to the topic at hand\n\n### Reason\n- Explain WHY your point is valid\n- Reference evidence, treaties, or data\n- Make the logic clear and compelling\n\n### Example\n- Provide a concrete illustration\n- Use real-world cases when possible\n- Show, don\'t just tell\n\n## Other Frameworks\n- **Problem-Solution**: Define the problem, then propose your solution\n- **Chronological**: Walk through the timeline of events\n- **Comparative**: Compare different approaches and advocate for yours\n- **Cause-Effect**: Trace the root causes and their consequences\n\n## The Rule of Three\n- Group your arguments in threes for impact\n- "We must act now, we must act together, we must act decisively"\n- Three is memorable and persuasive' },
      { id: 'ps-2', title: 'Delivery & Body Language', description: 'Master vocal technique, gestures, and stage presence for maximum impact.', duration: '40m', completed: false, content: 'How you say it matters as much as what you say.\n\n## Vocal Technique\n- **Pace**: Vary your speed — slow for emphasis, faster for energy\n- **Volume**: Project your voice, but use whispers for dramatic effect\n- **Pause**: Strategic silence is incredibly powerful\n- **Pitch**: Vary your tone to maintain interest\n\n## Body Language\n- **Posture**: Stand tall, shoulders back, feet planted\n- **Gestures**: Purposeful hand movements; avoid fidgeting\n- **Eye contact**: Look at different delegates, not just the Chair\n- **Movement**: Use the space purposefully\n\n## Common Mistakes\n- Reading from notes without looking up\n- Speaking too fast due to nervousness\n- Monotone delivery\n- Closed body language (crossed arms, hunched shoulders)\n- Over-gesturing or repetitive movements\n\nPractice in front of a mirror or record yourself to identify areas for improvement.' },
      { id: 'ps-3', title: 'Impromptu Speaking & Rebuttals', description: 'Think on your feet with structured impromptu responses and effective rebuttals.', duration: '50m', completed: false, content: 'Impromptu speaking separates good delegates from great ones.\n\n## The IMPROV Method\n1. **I**dentify the question or challenge\n2. **M**ake your position clear immediately\n3. **P**rovide reasoning with evidence\n4. **R**efer to real-world examples\n5. **O**ffer a forward-looking conclusion\n6. **V**isualize the impact\n\n## Rebuttal Strategies\n- **Direct Refutation**: Challenge the specific claim with evidence\n- **Minimization**: Acknowledge but minimize the importance\n- **Counter-Argument**: Present a stronger opposing argument\n- **Turn-around**: Use their point to support your position\n\n## Quick-Think Exercises\n- Practice 30-second speeches on random topics\n- Debate topics you don\'t personally agree with\n- Respond to rapid-fire questions from a partner\n\nThe key is structure — even with 30 seconds of preparation, a clear framework makes you sound prepared and persuasive.' },
      { id: 'ps-4', title: 'Rhetoric & Persuasion Techniques', description: 'Employ rhetorical devices that have moved nations — from anaphora to tricolon.', duration: '45m', completed: false, content: 'The great speeches of history all share one thing: masterful rhetoric.\n\n## Key Rhetorical Devices\n\n### Anaphora\nRepeating the opening phrase for emphasis:\n"We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields"\n\n### Tricolon\nGroups of three for rhythm and impact:\n"Government of the people, by the people, for the people"\n\n### Antithesis\nContrasting ideas in parallel structure:\n"Ask not what your country can do for you — ask what you can do for your country"\n\n### Chiasmus\nReversed parallel structure:\n"Let us never negotiate out of fear, but let us never fear to negotiate"\n\n## Ethos, Pathos, Logos\n- **Ethos**: Establish credibility and authority\n- **Pathos**: Appeal to emotions and shared values\n- **Logos**: Present logical arguments with evidence\n\nThe most persuasive speeches combine all three appeals.' },
    ],
  },
  {
    id: 'research-position-paper',
    title: 'Research & Position Paper Writing',
    description: 'Develop strong research skills and craft position papers that set you apart.',
    difficulty: 'Beginner',
    duration: '3.5h',
    xpReward: 150,
    gradient: 'from-[#1B3A4B] to-[#2D5A6B]',
    icon: BookOpen,
    category: 'Research',
    lessons: [
      { id: 'rp-1', title: 'Effective Research Methodology', description: 'Learn systematic approaches to researching your country and topic.', duration: '45m', completed: false, content: 'Great MUN performance starts with great research.\n\n## Research Framework\n\n### Phase 1: Country Profile\n- Political system and government structure\n- Economy and key industries\n- Geography and natural resources\n- Key allies and adversaries\n- UN voting record\n\n### Phase 2: Topic Deep-Dive\n- Background and history of the issue\n- Previous UN actions and resolutions\n- Key treaties and conventions\n- Current developments and debates\n\n### Phase 3: Country\'s Position\n- Official statements on the topic\n- Voting record on related resolutions\n- Relevant domestic policies\n- Regional bloc positions\n\n## Essential Sources\n- UN Official Document System (ODS)\n- CIA World Factbook\n- Country\'s Ministry of Foreign Affairs website\n- Academic journals and think tank reports\n- News from the country\'s own media' },
      { id: 'rp-2', title: 'Source Verification & Citation', description: 'Master the art of verifying information and citing sources properly.', duration: '35m', completed: false, content: 'In MUN, credibility is everything — bad sources undermine your entire position.\n\n## Evaluating Sources\n\n### The CRAAP Test\n- **Currency**: Is the information recent enough?\n- **Relevance**: Does it relate to your topic?\n- **Authority**: Who is the author/organization?\n- **Accuracy**: Is the information supported by evidence?\n- **Purpose**: Why does this information exist?\n\n## Source Hierarchy\n1. **Primary**: UN documents, treaties, official government statements\n2. **Secondary**: Academic papers, think tank reports, news analysis\n3. **Tertiary**: Encyclopedias, textbooks, general overviews\n\n## Common Pitfalls\n- Relying on a single source\n- Using outdated information\n- Citing opinion pieces as fact\n- Confusing correlation with causation\n- Ignoring contrary evidence\n\nAlways cross-reference important claims with at least two independent sources.' },
      { id: 'rp-3', title: 'Position Paper Structure & Writing', description: 'Write compelling position papers that showcase your preparation and diplomatic skill.', duration: '50m', completed: false, content: 'A position paper is your diplomatic mission statement.\n\n## Standard Structure\n\n### Paragraph 1: Topic Background\n- History and context of the issue\n- Previous UN actions\n- Current state of affairs\n\n### Paragraph 2: Country\'s Position\n- Official stance on the issue\n- Relevant policies and actions\n- Voting record on related matters\n\n### Paragraph 3: Proposed Solutions\n- Specific, actionable proposals\n- Implementation mechanisms\n- How to build international consensus\n\n## Writing Tips\n1. **Be specific** — vague proposals show weak preparation\n2. **Stay in character** — write from your country\'s perspective\n3. **Reference real documents** — cite UN resolutions and treaties\n4. **Be realistic** — propose achievable solutions\n5. **Show flexibility** — indicate willingness to negotiate\n\nA great position paper is concise (1-2 pages), well-organized, and demonstrates deep understanding of both the topic and your country\'s interests.' },
      { id: 'rp-4', title: 'Turning Research into Committee Performance', description: 'Translate your research preparation into effective committee strategy and speeches.', duration: '40m', completed: false, content: 'Research is only valuable if you can use it effectively in committee.\n\n## From Research to Strategy\n\n### Pre-Conference\n1. Prepare talking points for each sub-topic\n2. Draft opening speech outline\n3. Identify potential allies and adversaries\n4. Prepare responses to likely arguments\n5. Create a one-page reference sheet\n\n### During Committee\n1. **Listen actively** — Note other delegates\' positions\n2. **Adapt** — Adjust your strategy based on committee dynamics\n3. **Reference specifics** — Use your research to back claims\n4. **Build on others** — Use their points to advance your position\n5. **Stay current** — Reference recent developments\n\n## The Research Advantage\n- Confidently answer questions about your country\n- Reference specific UN documents by name and number\n- Propose detailed, realistic solutions\n- Anticipate and counter opposing arguments\n- Earn respect from fellow delegates and the Chair\n\nWell-researched delegates naturally emerge as committee leaders.' },
    ],
  },
  {
    id: 'chair-training',
    title: 'Committee Chair Training',
    description: 'Learn to lead committee sessions with authority, fairness, and professionalism.',
    difficulty: 'Advanced',
    duration: '4h',
    xpReward: 250,
    gradient: 'from-[#7C3AED] to-[#5B21B6]',
    icon: Scale,
    category: 'Leadership',
    roleTag: 'Chair',
    lessons: [
      { id: 'ct-1', title: 'The Role & Responsibilities of a Chair', description: 'Understand the Chair\'s duties, powers, and how to balance authority with fairness.', duration: '45m', completed: false, content: 'The Chair is the backbone of any MUN committee session.\n\n## Core Responsibilities\n- Maintain order and ensure rules are followed\n- Manage the General Speakers List and caucuses\n- Recognize delegates to speak\n- Rule on points and motions\n- Guide the committee toward productive outcomes\n- Ensure all voices are heard\n\n## Chair\'s Powers\n- **Recognition**: Decide who speaks and when\n- **Ruling**: Make decisions on procedural matters\n- **Time management**: Set speaking times and caucus durations\n- **Documentation**: Oversee resolution formatting\n\n## Balancing Act\n- Be firm but approachable\n- Enforce rules consistently\n- Don\'t show favoritism\n- Help struggling delegates without doing their work\n- Keep the committee on track without being authoritarian' },
      { id: 'ct-2', title: 'Managing Debate & Speakers List', description: 'Keep committee sessions running smoothly with effective speakers list management.', duration: '50m', completed: false, content: 'Effective debate management is the Chair\'s most visible skill.\n\n## General Speakers List (GSL) Management\n- Keep the GSL visible and updated\n- Manage yield types appropriately\n- Ensure equitable speaking opportunities\n- Recognize delegates from different regions\n\n## Caucus Management\n\n### Moderated Caucus\n- Set clear topic and time limits\n- Call on delegates fairly\n- Keep debate focused on the sub-topic\n- Manage transitions between speakers\n\n### Unmoderated Caucus\n- Set clear purpose and duration\n- Circulate and observe delegate interactions\n- Be available for procedural questions\n- Call the committee back to order promptly\n\n## Common Challenges\n- Dominant delegates monopolizing speaking time\n- Off-topic contributions\n- Losing quorum\n- Technical issues\n- Delegate conflicts\n\nPreparation and clear communication prevent most problems.' },
      { id: 'ct-3', title: 'Ruling on Points & Motions', description: 'Make fair, consistent rulings that maintain order and respect delegate rights.', duration: '55m', completed: false, content: 'Your rulings define the character of the committee.\n\n## Decision Framework\n1. **Is it in order?** — Does it follow the rules of procedure?\n2. **Is it timely?** — Is this the right moment for this motion?\n3. **Is it relevant?** — Does it serve the committee\'s work?\n4. **Is it fair?** — Does it respect all delegates\' rights?\n\n## Common Rulings\n\n### Points of Order\n- Must be ruled on immediately\n- Base decisions on the rules of procedure\n- Explain your reasoning briefly\n\n### Motions\n- Check for proper seconding\n- Verify that the motion is in order\n- Set appropriate debate/voting procedures\n\n## Handling Appeals\n- Stay calm and professional\n- Explain your ruling clearly\n- If overruled by the committee, accept gracefully\n\n## Tips for Fair Rulings\n- Be consistent — similar situations should receive similar rulings\n- Don\'t play favorites\n- When in doubt, consult your co-Chair or secretariat\n- Maintain your authority while being approachable' },
      { id: 'ct-4', title: 'Crisis Management as Chair', description: 'Handle unexpected situations, delegate conflicts, and committee emergencies.', duration: '45m', completed: false, content: 'Even the best-prepared Chair will face unexpected situations.\n\n## Common Crises\n- Delegate disputes escalating to personal attacks\n- Procedural confusion that halts committee\n- Loss of quorum\n- Crisis updates that require immediate action\n- Delegate medical emergencies\n- Technical failures\n\n## Crisis Response Protocol\n1. **Stay calm** — Your composure sets the tone\n2. **Pause** — Take a moment to assess the situation\n3. **Communicate** — Clearly state what\'s happening and what will happen next\n4. **Decide** — Make a ruling and move forward\n5. **Document** — Note the issue and how it was resolved\n\n## Conflict Resolution\n- Use your authority to separate warring parties\n- Call a brief recess if needed\n- Speak with delegates privately during breaks\n- Maintain professional decorum at all times\n- Refer to secretariat if a situation exceeds your authority\n\n## Maintaining Energy\n- Vary between moderated and unmoderated caucuses\n- Introduce creative formatting when interest wanes\n- Use crisis updates strategically\n- Keep a positive and encouraging demeanor' },
    ],
  },
  {
    id: 'secretary-general',
    title: 'Secretary-General Leadership Program',
    description: 'Develop the executive leadership skills to run entire conferences and inspire delegates.',
    difficulty: 'Advanced',
    duration: '5h',
    xpReward: 300,
    gradient: 'from-[#D4A843] to-[#B8860B]',
    icon: Crown,
    category: 'Leadership',
    roleTag: 'Secretary-General',
    lessons: [
      { id: 'sg-1', title: 'Conference Planning & Organization', description: 'Learn the fundamentals of planning and organizing a successful MUN conference.', duration: '60m', completed: false, content: 'The Secretary-General is the CEO of the conference.\n\n## Pre-Conference Planning\n\n### 6-12 Months Before\n- Set dates and venue\n- Establish conference theme\n- Recruit secretariat team\n- Begin outreach to schools\n\n### 3-6 Months Before\n- Finalize committee selections\n- Assign Chairs and Directors\n- Prepare background guides\n- Open registration\n\n### 1-3 Months Before\n- Finalize delegate assignments\n- Prepare conference materials\n- Train staff and Chairs\n- Handle logistics\n\n### Week Before\n- Final preparations\n- Brief all staff\n- Test all technology\n- Prepare opening ceremony\n\n## Key Planning Documents\n- Conference timeline and milestones\n- Budget and financial plan\n- Staff assignments and responsibilities\n- Emergency protocols\n- Delegate and advisor guides' },
      { id: 'sg-2', title: 'Secretariat Team Management', description: 'Build and lead an effective secretariat team that delivers conference excellence.', duration: '55m', completed: false, content: 'Your secretariat team is your most important asset.\n\n## Key Secretariat Roles\n- **Deputy Secretary-General**: Your right hand\n- **Under-Secretary-General**: Manages specific departments\n- **Director-General**: Oversees committee operations\n- **Chief of Staff**: Handles logistics and administration\n- **Head of Delegate Affairs**: Manages delegate experience\n\n## Building Your Team\n1. **Recruit early** — Top talent goes fast\n2. **Diversify** — Different strengths for different roles\n3. **Set expectations** — Clear job descriptions and timelines\n4. **Empower** — Give authority with responsibility\n5. **Communicate** — Regular check-ins and updates\n\n## Management Tips\n- Lead by example\n- Acknowledge good work publicly\n- Address problems privately and promptly\n- Create a positive team culture\n- Plan for succession — train your replacement\n\nThe best conferences are run by teams that trust each other and work seamlessly together.' },
      { id: 'sg-3', title: 'Crisis Management at Conference Level', description: 'Handle major conference crises from delegate emergencies to venue issues.', duration: '50m', completed: false, content: 'As Secretary-General, you\'re the ultimate crisis manager.\n\n## Conference-Level Crises\n- Venue emergencies (fire, power outage, security concerns)\n- Delegate medical emergencies\n- Major procedural disputes beyond Chair\'s authority\n- Technology failures during sessions\n- Last-minute speaker cancellations\n- Complaints from school advisors\n\n## Crisis Response Framework\n\n1. **Assess** — Understand the scope and severity\n2. **Delegate** — Assign response to the appropriate team member\n3. **Communicate** — Keep stakeholders informed\n4. **Resolve** — Execute the response plan\n5. **Recover** — Get back to normal operations\n6. **Review** — Document lessons learned\n\n## Prevention\n- Create detailed contingency plans\n- Conduct pre-conference staff training\n- Build buffer time into the schedule\n- Have backup plans for critical elements\n- Establish clear communication channels\n- Prepare emergency contact lists\n\nYour calm, decisive leadership during a crisis will be remembered long after the conference ends.' },
      { id: 'sg-4', title: 'Opening & Closing Ceremonies', description: 'Plan and deliver inspiring opening and closing ceremonies that set the conference tone.', duration: '45m', completed: false, content: 'Ceremonies bookend the conference experience and set its emotional tone.\n\n## Opening Ceremony\n\n### Essential Elements\n- National anthems or UN anthem\n- Welcome address by the Secretary-General\n- Keynote speaker\n- Introduction of the secretariat\n- Conference theme presentation\n- Gavel ceremony\n\n### Your Speech\n- Inspire and set the tone\n- Introduce the conference theme\n- Challenge delegates to excel\n- Share your MUN journey\n- End with a powerful call to action\n\n## Closing Ceremony\n\n### Essential Elements\n- Summary of conference achievements\n- Special recognition of contributions\n- Awards ceremony\n- Secretary-General\'s closing address\n- Gavel transfer (if applicable)\n\n### Your Closing Speech\n- Celebrate delegate accomplishments\n- Highlight memorable moments\n- Connect MUN experience to real-world impact\n- Inspire continued engagement\n- Thank everyone who made it possible\n\nBoth ceremonies should be well-rehearsed, professionally delivered, and emotionally resonant.' },
      { id: 'sg-5', title: 'Legacy & Succession Planning', description: 'Build a sustainable conference tradition and plan for future leadership.', duration: '40m', completed: false, content: 'Great Secretary-Generals think beyond their own conference.\n\n## Building a Legacy\n\n### Documentation\n- Create comprehensive handover documents\n- Record all procedures and best practices\n- Document lessons learned from challenges\n- Save templates for future conferences\n\n### Institutional Knowledge\n- Create a running guide for future SGs\n- Establish traditions that define your conference\n- Build relationships with school advisors\n- Develop a brand and reputation\n\n## Succession Planning\n1. **Identify potential successors** early in the year\n2. **Mentor actively** — share knowledge and experience\n3. **Give increasing responsibility** over time\n4. **Include them in key decisions**\n5. **Build their network** — introduce them to stakeholders\n\n## Measuring Success\n- Delegate satisfaction surveys\n- Return rate of participating schools\n- Growth in registration numbers\n- Quality of committee outcomes\n- Feedback from advisors and staff\n\nThe true measure of your leadership is how well the conference thrives after you\'re gone.' },
    ],
  },
]

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', name: 'First Steps', description: 'Complete your first lesson', icon: Play, earned: true, rarity: 'Common' },
  { id: 'course-complete', name: 'Graduate', description: 'Complete your first course', icon: GraduationCap, earned: true, rarity: 'Uncommon' },
  { id: 'streak-3', name: 'On Fire', description: '3-day learning streak', icon: Flame, earned: true, rarity: 'Uncommon' },
  { id: 'streak-7', name: 'Dedicated Scholar', description: '7-day learning streak', icon: Flame, earned: false, rarity: 'Rare' },
  { id: '5-courses', name: 'Renaissance Delegate', description: 'Complete 5 courses', icon: BookOpen, earned: false, rarity: 'Rare' },
  { id: 'crisis-master', name: 'Crisis Manager', description: 'Complete Crisis Committee Protocols', icon: Siren, earned: false, rarity: 'Rare' },
  { id: 'chair-cert', name: 'Certified Chair', description: 'Complete Chair Training', icon: Scale, earned: false, rarity: 'Epic' },
  { id: 'sg-cert', name: 'SG Certified', description: 'Complete SG Leadership Program', icon: Crown, earned: false, rarity: 'Legendary' },
  { id: 'orator', name: 'Skilled Orator', description: 'Complete Public Speaking course', icon: Mic, earned: false, rarity: 'Epic' },
  { id: 'resolution-pro', name: 'Resolution Pro', description: 'Complete Resolution Writing Workshop', icon: FileText, earned: false, rarity: 'Rare' },
]

const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-gray-500/10 text-gray-600',
  Uncommon: 'bg-green-500/10 text-green-600',
  Rare: 'bg-blue-500/10 text-blue-600',
  Epic: 'bg-purple-500/10 text-purple-600',
  Legendary: 'bg-[#D4A843]/10 text-[#D4A843]',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-[#059669]/10 text-[#059669]',
  Intermediate: 'bg-[#D4A843]/10 text-[#D4A843]',
  Advanced: 'bg-[#E11D48]/10 text-[#E11D48]',
}

// ============================================================
// XP NOTIFICATION COMPONENT
// ============================================================

function XPNotification({ xp, visible }: { xp: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#D4A843] text-[#1B3A4B] shadow-lg font-semibold"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        >
          <Zap className="w-5 h-5" />
          +{xp} XP Earned!
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TrainingHub() {
  const [view, setView] = useState<'grid' | 'detail'>('grid')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('all')
  const [xpNotification, setXpNotification] = useState<{ xp: number; visible: boolean }>({ xp: 0, visible: false })
  const [loading, setLoading] = useState(true)

  // Course data from API
  const [apiCourses, setApiCourses] = useState<Course[]>([])
  const [apiEnrollments, setApiEnrollments] = useState<Record<string, { progress: number; completed: boolean }>>({})

  // Fetch courses and enrollments from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [coursesRes, enrollmentsRes] = await Promise.allSettled([
          fetch('/api/courses?limit=50'),
          fetch('/api/enrollments'),
        ])
        if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
          const raw = await coursesRes.value.json()
          const courseList = raw.data || (Array.isArray(raw) ? raw : raw.courses || [])
          // Map API courses to local Course type
          setApiCourses(courseList.map((c: Record<string, unknown>) => {
            // Find matching local course for lesson content
            const localMatch = COURSES.find(lc => lc.id === c.id || lc.title.toLowerCase() === String(c.title || '').toLowerCase())
            return {
              id: String(c.id || ''),
              title: String(c.title || ''),
              description: String(c.description || ''),
              difficulty: String(c.difficulty || 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
              duration: c.duration ? String(c.duration) : (localMatch?.duration || 'Self-paced'),
              xpReward: Number(c.xpReward || localMatch?.xpReward || 50),
              gradient: localMatch?.gradient || 'from-[#0D7377] to-[#059669]',
              icon: localMatch?.icon || BookOpen,
              roleTag: c.targetRole ? String(c.targetRole) : localMatch?.roleTag,
              lessons: localMatch?.lessons || (Array.isArray(c.lessons) ? c.lessons.map((l: Record<string, unknown>, i: number) => ({
                id: String(l.id || `${c.id}-lesson-${i}`),
                title: String(l.title || `Lesson ${i + 1}`),
                description: String(l.description || ''),
                duration: String(l.duration || '30m'),
                completed: false,
                content: String(l.content || ''),
              })) : []),
              category: String(c.category || localMatch?.category || 'General'),
            }
          }))
        }
        if (enrollmentsRes.status === 'fulfilled' && enrollmentsRes.value.ok) {
          const raw = await enrollmentsRes.value.json()
          const data = raw.data || (Array.isArray(raw) ? raw : raw.enrollments || [])
          const enrollmentMap: Record<string, { progress: number; completed: boolean }> = {}
          for (const e of data as Record<string, unknown>[]) {
            const courseId = String(e.courseId || (e.course as Record<string, unknown>)?.id || '')
            if (courseId) {
              enrollmentMap[courseId] = { progress: Number(e.progress || 0), completed: Boolean(e.completed) }
            }
          }
          setApiEnrollments(enrollmentMap)
        }
      } catch {
        // Fallback to local courses
        setApiCourses(COURSES)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Course completion state (local tracking for lesson-level)
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({
    'pp-1': true, 'pp-2': true, 'rw-1': true,
  })
  const [userXp] = useState(2450)
  const [streak] = useState(3)

  const courses = apiCourses.length > 0 ? apiCourses : COURSES
  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId) || null, [selectedCourseId, courses])

  const filteredCourses = useMemo(() => {
    let filtered = courses
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
    }
    if (filterTab === 'my-courses') {
      filtered = filtered.filter(c => c.lessons.some(l => completedLessons[l.id]))
    } else if (filterTab === 'by-role') {
      filtered = filtered.filter(c => c.roleTag)
    } else if (filterTab === 'beginner') {
      filtered = filtered.filter(c => c.difficulty === 'Beginner')
    } else if (filterTab === 'intermediate') {
      filtered = filtered.filter(c => c.difficulty === 'Intermediate')
    } else if (filterTab === 'advanced') {
      filtered = filtered.filter(c => c.difficulty === 'Advanced')
    }
    return filtered
  }, [searchQuery, filterTab, completedLessons, courses])

  const getCourseProgress = useCallback((course: Course) => {
    // Check API enrollment progress first
    const enrollment = apiEnrollments[course.id]
    if (enrollment && enrollment.progress > 0) return enrollment.progress
    // Fall back to local lesson tracking
    const done = course.lessons.filter(l => completedLessons[l.id]).length
    return Math.round((done / course.lessons.length) * 100)
  }, [completedLessons, apiEnrollments])

  const handleOpenCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId)
    setActiveLessonId(null)
    setView('detail')
  }, [])

  const handleMarkComplete = useCallback((lessonId: string, xpReward: number) => {
    setCompletedLessons(prev => ({ ...prev, [lessonId]: true }))
    setXpNotification({ xp: xpReward, visible: true })
    setTimeout(() => setXpNotification(prev => ({ ...prev, visible: false })), 3000)
  }, [])

  const handleBackToGrid = useCallback(() => {
    setView('grid')
    setSelectedCourseId(null)
    setActiveLessonId(null)
  }, [])

  // COURSE DETAIL VIEW
  if (view === 'detail' && selectedCourse) {
    const progress = getCourseProgress(selectedCourse)
    const completedCount = selectedCourse.lessons.filter(l => completedLessons[l.id]).length
    const activeLesson = selectedCourse.lessons.find(l => l.id === activeLessonId) || null

    return (
      <div className="space-y-6">
        <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="sm" onClick={handleBackToGrid} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Button>
        </motion.div>

        {/* Course header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${selectedCourse.gradient}`} />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedCourse.gradient} flex items-center justify-center shrink-0`}>
                  <selectedCourse.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge className={DIFFICULTY_COLORS[selectedCourse.difficulty]}>{selectedCourse.difficulty}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" /> {selectedCourse.duration}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" /> {selectedCourse.xpReward} XP
                    </Badge>
                    {selectedCourse.roleTag && (
                      <Badge className="bg-[#0D7377]/10 text-[#0D7377] text-xs">{selectedCourse.roleTag}</Badge>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{selectedCourse.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <span className="text-xs text-muted-foreground">{completedCount}/{selectedCourse.lessons.length} lessons</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Lesson list */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Lessons</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-0.5 px-2 pb-2">
                    {selectedCourse.lessons.map((lesson, i) => {
                      const isDone = completedLessons[lesson.id]
                      const isActive = activeLessonId === lesson.id
                      const isLocked = i > 0 && !completedLessons[selectedCourse.lessons[i - 1].id] && !isDone
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => !isLocked && setActiveLessonId(lesson.id)}
                          disabled={isLocked}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all text-sm ${
                            isActive ? 'bg-[#0D7377]/10 border border-[#0D7377]/30' :
                            isLocked ? 'opacity-50 cursor-not-allowed' :
                            'hover:bg-muted'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                            isDone ? 'bg-[#059669]/15 text-[#059669]' :
                            isActive ? 'bg-[#0D7377]/15 text-[#0D7377]' :
                            isLocked ? 'bg-muted text-muted-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : isLocked ? <Lock className="w-3 h-3" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium truncate ${isActive ? 'text-[#0D7377]' : ''}`}>{lesson.title}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" /> {lesson.duration}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lesson content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="min-h-[400px]">
              {activeLesson ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{activeLesson.title}</CardTitle>
                        <CardDescription className="mt-1">{activeLesson.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" /> {activeLesson.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[400px]">
                      <motion.div
                        className="prose prose-sm max-w-none text-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {activeLesson.content.split('\n').map((line, i) => {
                          if (line.startsWith('## ')) {
                            return <h2 key={i} className="text-lg font-bold mt-6 mb-2 text-foreground">{line.replace('## ', '')}</h2>
                          } else if (line.startsWith('### ')) {
                            return <h3 key={i} className="text-base font-semibold mt-4 mb-1 text-foreground">{line.replace('### ', '')}</h3>
                          } else if (line.startsWith('- **')) {
                            const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/)
                            if (match) {
                              return (
                                <div key={i} className="flex items-start gap-2 ml-2 my-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D7377] mt-1.5 shrink-0" />
                                  <span><strong className="text-foreground">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}</span>
                                </div>
                              )
                            }
                          } else if (line.startsWith('- ')) {
                            return (
                              <div key={i} className="flex items-start gap-2 ml-2 my-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0D7377] mt-1.5 shrink-0" />
                                <span>{line.replace('- ', '')}</span>
                              </div>
                            )
                          } else if (line.match(/^\d+\.\s/)) {
                            return <div key={i} className="ml-2 my-1">{line}</div>
                          } else if (line.trim() === '') {
                            return <div key={i} className="h-2" />
                          }
                          return <p key={i} className="my-1 leading-relaxed">{line}</p>
                        })}
                      </motion.div>
                    </ScrollArea>

                    {/* Mark complete button */}
                    <div className="mt-6 pt-4 border-t">
                      {completedLessons[activeLesson.id] ? (
                        <div className="flex items-center gap-2 text-[#059669] text-sm font-medium">
                          <CheckCircle2 className="w-5 h-5" /> Lesson Completed
                        </div>
                      ) : (
                        <Button
                          className="bg-[#0D7377] hover:bg-[#0D7377]/90 text-white"
                          onClick={() => handleMarkComplete(activeLesson.id, Math.round(selectedCourse.xpReward / selectedCourse.lessons.length))}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="font-semibold text-lg mb-1">Select a lesson</h3>
                  <p className="text-sm text-muted-foreground">Choose a lesson from the list to begin learning</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // COURSE GRID VIEW (default)
  return (
    <div className="space-y-6">
      <XPNotification xp={xpNotification.xp} visible={xpNotification.visible} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-2xl font-bold">MUN Academy</h2>
        <p className="text-muted-foreground mt-1">Structured courses to master every aspect of Model United Nations</p>
      </motion.div>

      {/* Achievement bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
        <Card className="bg-gradient-to-r from-[#1B3A4B] to-[#243656] border-[#D4A843]/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4A843]/15 flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#D4A843]" />
              </div>
              <div>
                <div className="text-white font-semibold">Ambassador Level</div>
                <div className="text-white/50 text-xs">{userXp.toLocaleString()} XP · 2,550 XP to Diplomat</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[#D4A843]">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-bold">{streak}-day streak</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60">
                <Award className="w-4 h-4" />
                <span className="text-xs">{ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length} badges</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { value: 'all', label: 'All' },
              { value: 'my-courses', label: 'My Courses' },
              { value: 'by-role', label: 'By Role' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterTab(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterTab === f.value
                    ? 'bg-[#0D7377] text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCourses.map((course, i) => {
          const progress = getCourseProgress(course)
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              <Card
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 hover:border-[#0D7377]/30 h-full flex flex-col"
                onClick={() => handleOpenCourse(course.id)}
              >
                {/* Thumbnail */}
                <div className={`relative h-32 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}>
                  <course.icon className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge className={DIFFICULTY_COLORS[course.difficulty]}>{course.difficulty}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-white/70" />
                    <span className="text-xs text-white/80 font-medium">{course.xpReward} XP</span>
                  </div>
                  {course.roleTag && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-white/20 text-white text-[10px] backdrop-blur-sm">{course.roleTag}</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm mb-1.5 group-hover:text-[#0D7377] transition-colors leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.lessons.length} lessons</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${progress >= 80 ? 'bg-[#059669]' : progress > 0 ? 'bg-[#0D7377]' : 'bg-muted-foreground/30'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground w-7 text-right">{progress}%</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Achievements Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Achievements</CardTitle>
                <CardDescription>Track your progress and unlock rewards</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Award className="w-3 h-3 mr-1" /> {ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ACHIEVEMENTS.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    achievement.earned
                      ? 'hover:border-[#D4A843]/30 hover:shadow-sm cursor-pointer'
                      : 'opacity-40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    achievement.earned ? 'bg-[#D4A843]/15' : 'bg-muted'
                  }`}>
                    <achievement.icon className={`w-5 h-5 ${achievement.earned ? 'text-[#D4A843]' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="font-medium text-xs mb-0.5">{achievement.name}</div>
                  <div className="text-[10px] text-muted-foreground mb-1.5 leading-tight">{achievement.description}</div>
                  <Badge className={`text-[8px] ${RARITY_COLORS[achievement.rarity]}`}>{achievement.rarity}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </>
      )}
    </div>
  )
}
