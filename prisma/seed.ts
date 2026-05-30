import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Clean existing data
  await prisma.userBadge.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.channel.deleteMany()
  await prisma.researchTask.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.courseEnrollment.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.conferenceRegistration.deleteMany()
  await prisma.committee.deleteMany()
  await prisma.conference.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.delegateProfile.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.schoolSubscription.deleteMany()
  await prisma.pricingPlan.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.user.deleteMany()
  await prisma.school.deleteMany()

  // ============================
  // SEED SCHOOLS
  // ============================
  console.log("📦 Seeding schools...")
  const school1 = await prisma.school.create({
    data: {
      name: "American School of Dubai",
      location: "Al Barsha, Dubai",
      city: "Dubai",
      country: "UAE",
      website: "https://asdubai.org",
      contactEmail: "info@asdubai.org",
      studentCount: 120,
      isActive: true,
    },
  })

  const school2 = await prisma.school.create({
    data: {
      name: "GEMS Wellington International School",
      location: "Al Sufouh, Dubai",
      city: "Dubai",
      country: "UAE",
      website: "https://gemswellington.com",
      contactEmail: "info@gemswellington.com",
      studentCount: 85,
      isActive: true,
    },
  })

  const school3 = await prisma.school.create({
    data: {
      name: "Abu Dhabi International School",
      location: "Khalidiya, Abu Dhabi",
      city: "Abu Dhabi",
      country: "UAE",
      website: "https://adis.sch.ae",
      contactEmail: "info@adis.sch.ae",
      studentCount: 95,
      isActive: true,
    },
  })

  // ============================
  // SEED BADGES (20+ across categories)
  // ============================
  console.log("🏅 Seeding badges...")
  const badges = await Promise.all([
    // PARTICIPATION badges
    prisma.badge.create({
      data: {
        name: "First Steps",
        description: "Complete your first course lesson",
        icon: "footprints",
        category: "PARTICIPATION",
        xpReward: 10,
        requirement: "Complete 1 lesson",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Conference Debut",
        description: "Register for your first MUN conference",
        icon: "flag",
        category: "PARTICIPATION",
        xpReward: 25,
        requirement: "Register for 1 conference",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Active Delegate",
        description: "Attend 5 conferences",
        icon: "users",
        category: "PARTICIPATION",
        xpReward: 50,
        requirement: "Attend 5 conferences",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Globe Trotter",
        description: "Represent 10 different countries in MUN simulations",
        icon: "globe",
        category: "PARTICIPATION",
        xpReward: 75,
        requirement: "Represent 10 countries",
      },
    }),

    // ACHIEVEMENT badges
    prisma.badge.create({
      data: {
        name: "Honourable Mention",
        description: "Receive an Honourable Mention at a conference",
        icon: "award",
        category: "ACHIEVEMENT",
        xpReward: 50,
        requirement: "1 Honourable Mention",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Outstanding Delegate",
        description: "Receive an Outstanding Delegate award",
        icon: "trophy",
        category: "ACHIEVEMENT",
        xpReward: 100,
        requirement: "1 Outstanding Delegate award",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Best Delegate",
        description: "Win Best Delegate at a conference",
        icon: "crown",
        category: "ACHIEVEMENT",
        xpReward: 150,
        requirement: "1 Best Delegate award",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Resolution Master",
        description: "Write 5 resolutions that pass committee vote",
        icon: "scroll",
        category: "ACHIEVEMENT",
        xpReward: 75,
        requirement: "5 passed resolutions",
      },
    }),

    // LEADERSHIP badges
    prisma.badge.create({
      data: {
        name: "Committee Chair",
        description: "Serve as a committee chair for the first time",
        icon: "gavel",
        category: "LEADERSHIP",
        xpReward: 100,
        requirement: "Chair 1 committee",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Crisis Director",
        description: "Direct a crisis committee simulation",
        icon: "alert-triangle",
        category: "LEADERSHIP",
        xpReward: 125,
        requirement: "Direct 1 crisis committee",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Secretary-General",
        description: "Serve as Secretary-General of a conference",
        icon: "star",
        category: "LEADERSHIP",
        xpReward: 200,
        requirement: "Serve as Secretary-General",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Mentor",
        description: "Help 5 new delegates prepare for their first conference",
        icon: "heart-handshake",
        category: "LEADERSHIP",
        xpReward: 75,
        requirement: "Mentor 5 delegates",
      },
    }),

    // SKILL_MASTERY badges
    prisma.badge.create({
      data: {
        name: "Rules Expert",
        description: "Master parliamentary procedure and Robert's Rules",
        icon: "book-open",
        category: "SKILL_MASTERY",
        xpReward: 50,
        requirement: "Complete Parliamentary Procedure course",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Diplomat",
        description: "Successfully negotiate 3 multilateral agreements",
        icon: "handshake",
        category: "SKILL_MASTERY",
        xpReward: 75,
        requirement: "3 successful negotiations",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Research Scholar",
        description: "Complete all research methodology courses",
        icon: "microscope",
        category: "SKILL_MASTERY",
        xpReward: 50,
        requirement: "Complete research courses",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Wordsmith",
        description: "Write 3 position papers rated Excellent",
        icon: "pen-tool",
        category: "SKILL_MASTERY",
        xpReward: 60,
        requirement: "3 excellent position papers",
      },
    }),

    // MILESTONE badges
    prisma.badge.create({
      data: {
        name: "Week Warrior",
        description: "Maintain a 7-day learning streak",
        icon: "flame",
        category: "MILESTONE",
        xpReward: 30,
        requirement: "7-day streak",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Monthly Scholar",
        description: "Maintain a 30-day learning streak",
        icon: "calendar-check",
        category: "MILESTONE",
        xpReward: 100,
        requirement: "30-day streak",
      },
    }),
    prisma.badge.create({
      data: {
        name: "XP Centurion",
        description: "Earn 100 XP",
        icon: "zap",
        category: "MILESTONE",
        xpReward: 25,
        requirement: "100 XP earned",
        isHidden: true,
      },
    }),

    // DIPLOMACY badges
    prisma.badge.create({
      data: {
        name: "Peace Broker",
        description: "Successfully mediate between two opposing blocs",
        icon: "dove",
        category: "DIPLOMACY",
        xpReward: 80,
        requirement: "1 successful mediation",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Alliance Builder",
        description: "Form a coalition of 5+ countries",
        icon: "link",
        category: "DIPLOMACY",
        xpReward: 60,
        requirement: "Build 1 coalition of 5+",
      },
    }),

    // ORATORY badges
    prisma.badge.create({
      data: {
        name: "Rising Voice",
        description: "Deliver 5 formal speeches in committee",
        icon: "mic",
        category: "ORATORY",
        xpReward: 40,
        requirement: "5 formal speeches",
      },
    }),
    prisma.badge.create({
      data: {
        name: "Master Orator",
        description: "Deliver 20 formal speeches in committee",
        icon: "volume-2",
        category: "ORATORY",
        xpReward: 100,
        requirement: "20 formal speeches",
      },
    }),

    // SPECIAL badges
    prisma.badge.create({
      data: {
        name: "Founding Member",
        description: "Join DiplomatiQ during the launch period",
        icon: "sparkles",
        category: "SPECIAL",
        xpReward: 50,
        requirement: "Join during launch",
        isHidden: true,
      },
    }),
    prisma.badge.create({
      data: {
        name: "SDG Champion",
        description: "Represent an SDG Ambassador role and advocate for Sustainable Development Goals",
        icon: "target",
        category: "SPECIAL",
        xpReward: 75,
        requirement: "Serve as SDG Ambassador",
      },
    }),
  ])

  // ============================
  // SEED PRICING PLANS
  // ============================
  console.log("💰 Seeding pricing plans...")
  await Promise.all([
    prisma.pricingPlan.create({
      data: {
        name: "Free",
        tier: "FREE",
        priceMonthly: 0,
        priceYearly: 0,
        currency: "USD",
        features: JSON.stringify([
          "Basic MUN training courses (3 courses)",
          "Diagnostic assessment",
          "Community channels access",
          "Basic gamification profile",
          "Conference listings",
        ]),
        maxStudents: 1,
        maxTeachers: 0,
        isPopular: false,
        isActive: true,
        order: 1,
      },
    }),
    prisma.pricingPlan.create({
      data: {
        name: "Student Pro",
        tier: "STUDENT_PRO",
        priceMonthly: 29,
        priceYearly: 290,
        currency: "USD",
        features: JSON.stringify([
          "All training courses (8+ courses)",
          "All assessment types",
          "Advanced gamification & leaderboard",
          "Research task management",
          "Position paper templates",
          "Priority conference registration",
          "Certificate of completion",
        ]),
        maxStudents: 1,
        maxTeachers: 0,
        isPopular: true,
        isActive: true,
        order: 2,
      },
    }),
    prisma.pricingPlan.create({
      data: {
        name: "Teacher Pro",
        tier: "TEACHER_PRO",
        priceMonthly: 99,
        priceYearly: 990,
        currency: "USD",
        features: JSON.stringify([
          "All Student Pro features",
          "Conference management tools",
          "Student progress tracking",
          "Research task assignment",
          "Committee creation & management",
          "Custom assessment creation",
          "Communication channels management",
          "Analytics dashboard",
          "Export reports (PDF/CSV)",
        ]),
        maxStudents: 30,
        maxTeachers: 1,
        isPopular: false,
        isActive: true,
        order: 3,
      },
    }),
    prisma.pricingPlan.create({
      data: {
        name: "School Enterprise",
        tier: "SCHOOL_ENTERPRISE",
        priceMonthly: 499,
        priceYearly: 4990,
        currency: "USD",
        features: JSON.stringify([
          "All Teacher Pro features",
          "Unlimited student accounts",
          "Multiple teacher accounts",
          "School-wide analytics",
          "White-label conference pages",
          "Priority support",
          "Custom onboarding & training",
          "API access for integrations",
          "SSO/SAML authentication",
          "Dedicated account manager",
        ]),
        maxStudents: 500,
        maxTeachers: 20,
        isPopular: false,
        isActive: true,
        order: 4,
      },
    }),
  ])

  // ============================
  // SEED COURSES WITH LESSONS
  // ============================
  console.log("📚 Seeding courses and lessons...")

  // Course 1: Parliamentary Procedure & Robert's Rules
  const course1 = await prisma.course.create({
    data: {
      title: "Parliamentary Procedure & Robert's Rules of Order",
      description: "Master the rules of parliamentary procedure that govern Model United Nations debates. Learn Robert's Rules of Order, motion types, voting procedures, and proper decorum for formal debate.",
      category: "Procedure",
      difficulty: "BEGINNER",
      xpReward: 100,
      targetRole: "DELEGATE",
      order: 1,
      isPublished: true,
      duration: 180,
    },
  })
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course1.id,
        title: "Introduction to Parliamentary Procedure",
        content: `# Introduction to Parliamentary Procedure

Parliamentary procedure is the body of rules, ethics, and customs governing meetings and operations of organizations. In Model United Nations, parliamentary procedure provides the framework for orderly debate and decision-making.

## Why Parliamentary Procedure Matters

In MUN, parliamentary procedure serves several critical purposes:

1. **Order and Efficiency**: It ensures that meetings proceed in an orderly manner, allowing all delegates to participate meaningfully.
2. **Fairness**: Every delegate has equal rights to speak, make motions, and vote.
3. **Clarity**: Procedures provide clear rules for how decisions are made, preventing confusion.
4. **Professionalism**: Following formal rules mirrors real diplomatic proceedings at the United Nations.

## Historical Context

The rules used in MUN are derived from **Robert's Rules of Order**, first published in 1876 by Henry Martyn Robert, a U.S. Army officer. These rules have been adapted by the United Nations for its own proceedings and further modified for MUN simulations.

## Key Principles

- **One motion at a time**: Only one main motion can be considered at a time.
- **Majority rule**: Most decisions are made by majority vote.
- **Minority rights**: The minority has the right to be heard.
- **Chair authority**: The Chair maintains order and interprets rules.
- **Quorum**: A minimum number of members must be present for business to be conducted.

## The Role of the Chair

The committee Chair (or President) is responsible for:
- Maintaining order and decorum
- Recognizing speakers
- Ruling on points of order
- Managing the flow of debate
- Ensuring all delegates have opportunity to participate
- Counting votes and announcing results

In the next lesson, we will explore the specific types of motions used in MUN debates.`,
        type: "reading",
        duration: 20,
        order: 1,
      },
      {
        courseId: course1.id,
        title: "Types of Motions in MUN",
        content: `# Types of Motions in MUN

Motions are formal proposals made by delegates to direct the committee's action. Understanding the hierarchy and proper use of motions is essential for effective participation.

## Motion Categories

Motions in MUN are categorized by their priority:

### 1. Dilatory Motions (Highest Priority)
These motions take precedence over all other business:

- **Point of Personal Privilege**: Relates to the comfort or well-being of a delegate (e.g., "Point of Personal Privilege—may the delegate speak louder?")
- **Point of Order**: Points out a procedural error (e.g., "Point of Order—the delegate is speaking on a topic not currently under discussion")
- **Point of Parliamentary Inquiry**: Asks the Chair a question about procedure (e.g., "Point of Parliamentary Inquiry—how many votes are needed to close debate?")

### 2. Subsidiary Motions
These help dispose of the main motion:

- **Motion to Table Debate**: Temporarily sets aside the current topic
- **Motion to Resume Debate on a Tabled Topic**: Returns to a tabled topic
- **Motion to Close Debate (Previous Question)**: Ends debate and moves to voting
- **Motion to Limit Speaking Time**: Restricts the duration of speeches
- **Motion to Extend Speaking Time**: Increases the duration of speeches

### 3. Procedural Motions
These affect the conduct of the meeting:

- **Motion for a Moderated Caucus**: Structured debate where delegates raise placards to speak on a specific sub-topic for a set duration
- **Motion for an Unmoderated Caucus**: Informal break where delegates can move around, negotiate, and form alliances
- **Motion to Suspend Meeting**: Pauses the session (e.g., for lunch or end of day)
- **Motion to Adjourn Meeting**: Ends the session permanently

### 4. Main Motions
These propose substantive action:

- **Working Paper**: A preliminary document outlining proposed solutions
- **Draft Resolution**: A formal document following specific format rules that, if passed, becomes the committee's official position

## Making a Motion

To make a motion, a delegate must:
1. Raise their placard when the Chair asks for motions
2. State the motion clearly: "The delegate of [Country] motions to [specific motion]"
3. Provide any required specifications (time, topic, etc.)
4. The Chair may ask for a second (another delegate supporting the motion)
5. If the motion is debatable, delegates may speak for or against
6. The committee votes on the motion

## Common Mistakes

- Making a motion when another delegate has the floor
- Not specifying required details (e.g., duration for a caucus)
- Confusing Points (which can interrupt) with Motions (which cannot)
- Using dilatory motions to disrupt debate`,
        type: "reading",
        duration: 25,
        order: 2,
      },
      {
        courseId: course1.id,
        title: "Voting Procedures",
        content: `# Voting Procedures in MUN

Voting is the mechanism by which the committee makes collective decisions. Understanding voting procedures is crucial for both delegates and chairs.

## Types of Votes

### Procedural Votes
These concern the operation of the committee itself:
- Motions for caucus
- Motions to close debate
- Motions to set speaking time

**All delegates must vote on procedural matters.** Observers and non-member states do not vote on procedural matters in some committees.

### Substantive Votes
These concern the actual content of resolutions:
- Voting on draft resolutions
- Voting on amendments

**Only full member states vote on substantive matters.** Observers and non-members do not vote.

## Voting Methods

### Placard Vote (Roll Call Vote)
Delegates raise their placards to indicate their vote. The Chair counts and announces the result.

### Roll Call Vote
The Chair calls each country's name alphabetically. Each delegate states their vote aloud:
- **"Yes"** / **"In Favor"**: Supports the resolution
- **"No"** / **"Against"**: Opposes the resolution
- **"Abstain"**: Chooses not to vote (does not count as yes or no)
- **"Present"**: When called initially, indicates attendance
- **"Present and Voting"**: Indicates attendance and commitment to vote yes or no (no abstention)

### Important Rules

1. **Majority Vote**: Most resolutions pass with a simple majority (50% + 1 of members present and voting)
2. **Two-Thirds Majority**: Required for important questions in the General Assembly (e.g., security, budget)
3. **Security Council Veto**: In the Security Council, any of the five permanent members (P5) can veto a substantive resolution
4. **Abstentions**: Do not count as "No" votes. A resolution passes if it has more "Yes" than "No" votes from members present and voting.

## The Voting Process

1. The Chair announces the transition to voting procedure
2. All doors are closed—no delegates may enter or exit
3. The Chair reads the draft resolution title
4. If roll call: countries are called alphabetically
5. Delegates state their vote clearly
6. The Chair tallies and announces the result
7. If passed, the resolution becomes the committee's official recommendation

## Right of Explanation

After a vote, delegates may request a **Right of Explanation** to explain their vote. This is typically used when a delegate's vote may seem contradictory to their country's expected position.`,
        type: "reading",
        duration: 20,
        order: 3,
      },
      {
        courseId: course1.id,
        title: "Caucus Types and Debate Flow",
        content: `# Caucus Types and Debate Flow

Understanding the flow of debate and the different types of caucuses is essential for strategic participation in MUN.

## The Speakers List

When a topic is opened, the Chair creates a **Speakers List**. Delegates raise their placards to be added. Each speaker delivers a prepared speech (typically 1-2 minutes) presenting their country's position.

The Speakers List alternates between for and against the topic to ensure balanced debate.

## Moderated Caucus

A **Moderated Caucus** is a structured debate on a specific sub-topic:
- A delegate motions for it: "The delegate of France motions for a 10-minute moderated caucus, 1-minute speaking time, on the topic of economic sanctions."
- The Chair sets the speaking order
- Delegates raise placards to be recognized
- Each delegate speaks for the allotted time
- No yielding is required

**When to use**: To drill down on specific aspects of the topic, respond to arguments, or shift focus.

## Unmoderated Caucus

An **Unmoderated Caucus** is an informal break:
- A delegate motions for it: "The delegate of Brazil motions for a 15-minute unmoderated caucus."
- Delegates may leave their seats
- Informal negotiations, alliance-building, and resolution drafting occur
- Often the most productive time for building consensus

**When to use**: When formal debate has stalled, when blocs need to negotiate, or when drafting/resolving documents need collaborative work.

## Strategic Debate Flow

### Opening Phase
1. **Speakers List**: Countries state general positions
2. **First Moderated Caucus**: Clarify key issues and identify allies/opponents
3. **First Unmoderated Caucus**: Form blocs, identify common ground

### Middle Phase
4. **Moderated Caucuses**: Debate specific sub-topics in depth
5. **Working Papers**: Blocs begin drafting preliminary ideas
6. **Unmoderated Caucuses**: Negotiate between blocs, merge working papers

### Closing Phase
7. **Draft Resolutions**: Formal documents presented to committee
8. **Amendments**: Modifications to draft resolutions
9. **Final Unmoderated Caucus**: Last-minute negotiations
10. **Voting Procedure**: Committee votes on resolutions

## Tips for Effective Participation

- **Be strategic with motions**: Timing matters—motion for caucuses at the right moment
- **Use moderated caucuses wisely**: Focus on the most debated sub-topics
- **Maximize unmoderated time**: Build relationships, negotiate, and draft
- **Stay engaged**: Even when not speaking, listen for arguments to address
- **Control the debate flow**: If discussion is going in circles, motion to shift focus`,
        type: "reading",
        duration: 25,
        order: 4,
      },
      {
        courseId: course1.id,
        title: "Yields and Decorum",
        content: `# Yields and Decorum

Proper use of yields and maintaining decorum are hallmarks of an experienced delegate.

## Yields

When a delegate finishes speaking before their time expires on the Speakers List, they may **yield** their remaining time in one of three ways:

### Yield to Another Delegate
"I yield my remaining time to the delegate of Japan."
- The yielded delegate speaks for the remaining time
- Cannot yield again (no chain yields)
- Useful for allies who want to reinforce each other's points

### Yield to Questions
"I yield my remaining time to questions."
- The Chair selects delegates to ask questions
- Only the speaker responds
- Good for clarifying positions or engaging with opponents

### Yield to the Chair
"I yield my remaining time to the Chair."
- The speaking time ends
- The Chair moves to the next speaker
- Used when no strategic yield is available

## Points During Speeches

### Point of Personal Privilege
Can be raised **during** a speech if a delegate cannot hear or see the speaker:
- "Point of Personal Privilege—the delegate requests the speaker speak more slowly"
- Must relate to personal comfort, not content

### Point of Order
Can be raised **after** a speech if a procedural error occurred:
- "Point of Order—the previous speaker's time had expired before they concluded"
- Must address procedure, not content

## Decorum Rules

### Formal Address
- Always address other delegates as "the delegate of [Country]"
- Never use personal names or pronouns like "you"
- Address the Chair as "Mr./Madam Chair" or "Honorable Chair"

### Language
- Use formal, diplomatic language
- Avoid slang, colloquialisms, or overly casual speech
- Maintain a respectful tone, even in disagreement
- Use third-person: "The delegate of China believes..." not "I believe..."

### Physical Decorum
- Remain seated when not speaking
- Raise your placard to be recognized
- Do not interrupt other delegates
- Maintain professional posture and appearance
- No electronic devices visible during formal session

### Common Decorum Violations
- Using first-person pronouns
- Addressing delegates by name
- Interrupting speakers
- Side conversations during formal debate
- Using phones during session
- Clapping or showing visible reaction to votes

## Practice Makes Perfect

Understanding these rules is only the beginning. The best way to master parliamentary procedure is through practice. Attend simulations, observe experienced delegates, and don't be afraid to ask the Chair for guidance through Points of Parliamentary Inquiry.`,
        type: "reading",
        duration: 20,
        order: 5,
      },
    ],
  })

  // Course 2: Resolution Writing Workshop
  const course2 = await prisma.course.create({
    data: {
      title: "Resolution Writing Workshop",
      description: "Learn to craft professional UN-style resolutions. Master the formal structure, preambulatory and operative clauses, amendment procedures, and persuasive writing techniques.",
      category: "Writing",
      difficulty: "INTERMEDIATE",
      xpReward: 120,
      targetRole: "DELEGATE",
      order: 2,
      isPublished: true,
      duration: 150,
    },
  })
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course2.id,
        title: "Resolution Structure and Format",
        content: `# Resolution Structure and Format

A UN resolution is a formal document expressing the collective will of the committee. Understanding its structure is fundamental to effective MUN participation.

## The Three Parts of a Resolution

### 1. Heading
The heading identifies the resolution and its sponsors:
- **Committee Name**: The full name of the committee
- **Topic**: The agenda item being addressed
- **Sponsors**: Countries that wrote and support the resolution
- **Signatories**: Countries that agree the resolution should be debated (they may not support its content)

### 2. Preambular Clauses
These set the context and justification for the resolution:
- Begin with preambulatory phrases (italicized or underlined)
- Describe the problem, reference past actions, and state principles
- Each clause ends with a comma
- Clauses are ordered from general to specific

**Common Preambular Phrases:**
Affirming, Alarmed by, Approving, Aware of, Bearing in mind, Believing, Confident, Contemplating, Convinced, Declaring, Deeply concerned, Deeply convinced, Deeply disturbed, Deeply regretting, Desiring, Emphasizing, Expecting, Expressing its appreciation, Fulfilling, Fully aware, Fully believing, Further deploring, Further recalling, Guided by, Having adopted, Having considered, Having examined, Having received, Keeping in mind, Noting, Noting with deep concern, Noting with satisfaction, Noting further, Observing, Reaffirming, Realizing, Recalling, Recognizing, Referring, Regretting, Reiterating, Seeking, Taking into account, Taking into consideration, Taking note of, Viewing with appreciation, Welcoming

### 3. Operative Clauses
These are the actionable proposals:
- Begin with operative phrases (underlined)
- Numbered sequentially (1, 2, 3...)
- Each clause ends with a semicolon (;), except the last which ends with a period (.)
- Clauses progress from least to most ambitious

**Common Operative Phrases:**
Accepts, Affirms, Approves, Authorizes, Calls upon, Condemns, Confirms, Congratulates, Considers, Declares, Deplores, Designates, Determines, Directs, Emphasizes, Encourages, Endorses, Expresses its appreciation, Expresses its hope, Further invites, Further requests, Further resolves, Notes, Proclaims, Reaffirms, Recommends, Regrets, Reminds, Requests, Resolves, Solemnly affirms, Strongly condemns, Strongly urges, Suggests, Supports, Takes note of, Urges

## Sample Resolution Format

\`\`\`
COMMITTEE: General Assembly Third Committee
TOPIC: Promoting the Rights of Persons with Disabilities

SPONSORS: Brazil, Japan, Spain
SIGNATORIES: Argentina, Australia, Canada, Egypt, France, India, Kenya, Mexico, Nigeria, South Africa

The General Assembly Third Committee,

Guided by the principles enshrined in the Universal Declaration of Human Rights,

Recalling the Convention on the Rights of Persons with Disabilities adopted on 13 December 2006,

Deeply concerned that over one billion people worldwide experience some form of disability,

1. Calls upon all Member States to implement the Convention on the Rights of Persons with Disabilities;

2. Urges Member States to allocate adequate resources for inclusive education programs;

3. Requests the Secretary-General to report on progress at the next session;
\`\`\``,
        type: "reading",
        duration: 25,
        order: 1,
      },
      {
        courseId: course2.id,
        title: "Writing Effective Preambular Clauses",
        content: `# Writing Effective Preambular Clauses

Preambular clauses establish the legal and moral foundation for your operative clauses. They must be accurate, relevant, and build a compelling case for action.

## The Purpose of Preambular Clauses

1. **Establish legal basis**: Reference existing international law and treaties
2. **Define the problem**: Describe the current situation requiring action
3. **Acknowledge past efforts**: Reference previous UN actions and resolutions
4. **Build moral authority**: Appeal to shared values and principles

## Best Practices

### Start Broad, Then Narrow
Begin with universally accepted principles, then narrow to the specific issue:
1. Universal Declaration of Human Rights (broad)
2. Convention on the specific right (narrower)
3. Recent reports showing the problem (most specific)

### Use Accurate References
- Full names of treaties and conventions
- Correct resolution numbers and dates
- Accurate statistics from credible sources
- Proper names of UN bodies and agencies

### Keep It Relevant
Each preambular clause should directly support your operative clauses. Avoid filler clauses that don't add substance.

### Order Matters
1. Overarching principles and charter references
2. Relevant international treaties and conventions
3. Previous UN resolutions on the topic
4. Recent reports and findings
5. Expressions of concern or recognition of the problem

## Common Mistakes

- **Vague references**: "Recalling a past resolution" — specify which one
- **Inaccurate citations**: Double-check resolution numbers and dates
- **Too many clauses**: Quality over quantity; 5-8 preambular clauses are typical
- **Operative language in preamble**: Preambular clauses describe, not prescribe
- **Missing key references**: Omitting the foundational treaty for your topic

## Example: Good vs. Bad Preambular Clauses

### ❌ Bad
"Concerned about the problem," — Vague and lacks specificity

### ✅ Good
"Deeply concerned by the report of the World Health Organization indicating that 1.3 billion people lack access to essential health services," — Specific, cites a source, provides data

### ❌ Bad
"Recalling previous resolutions," — Which ones?

### ✅ Good
"Recalling General Assembly resolution 70/1 entitled 'Transforming our world: the 2030 Agenda for Sustainable Development,'" — Precise reference`,
        type: "reading",
        duration: 20,
        order: 2,
      },
      {
        courseId: course2.id,
        title: "Crafting Operative Clauses",
        content: `# Crafting Operative Clauses

Operative clauses are the heart of the resolution—they propose specific, actionable steps the international community should take.

## Principles of Effective Operative Clauses

### 1. Be Specific and Actionable
Each clause should clearly state what action is being proposed and by whom.

**Vague**: "Encourages countries to help with education"
**Specific**: "Encourages Member States to allocate at least 6% of GDP to education, with targeted investments in rural and underserved communities"

### 2. Use the Right Operative Verb
The operative verb sets the tone and strength of each clause:
- **Strong**: Condemns, Demands, Requires, Mandates (use sparingly)
- **Medium**: Urges, Calls upon, Recommends, Requests
- **Soft**: Encourages, Invites, Suggests, Notes

### 3. Progressive Structure
Order clauses from least to most ambitious:
1. Existing commitments reaffirmation
2. Recommendations for action
3. Requests for reports/studies
4. Establishment of new mechanisms
5. Allocation of resources
6. Timeline and review mechanisms

### 4. Assign Responsibility
Clearly indicate which entity is responsible:
- "Requests the Secretary-General to..."
- "Calls upon Member States to..."
- "Urges UNDP, UNICEF, and WHO to..."
- "Directs the Economic and Social Council to..."

## Types of Operative Clauses

### Information-Gathering
"Requests the Secretary-General to commission a comprehensive study on..."

### Recommendation
"Recommends that Member States adopt national legislation ensuring..."

### Action-Oriented
"Establishes a Special Rapporteur to monitor and report on..."

### Financial
"Decides to allocate funds from the regular budget not exceeding $5 million for..."

### Timeline-Based
"Sets a target date of 2030 for the achievement of..."

### Review Mechanism
"Decides to review progress at its eighty-fifth session..."

## Working with Blocs

When negotiating resolutions with other delegations:
- **Merge ideas**: Combine similar operative clauses from different working papers
- **Compromise on language**: Weaker operative verbs may gain more signatories
- **Log-roll**: Support another delegation's clause in exchange for their support on yours
- **Avoid redundancy**: Two clauses saying the same thing weakens both

## Amendments

After a draft resolution is submitted, delegates may propose amendments:

### Friendly Amendment
- Sponsored by all original resolution sponsors
- Automatically incorporated without vote

### Unfriendly Amendment
- Not approved by all original sponsors
- Requires a vote to be incorporated
- Needs a certain number of signatories (typically 20% of committee)`,
        type: "reading",
        duration: 25,
        order: 3,
      },
      {
        courseId: course2.id,
        title: "Amendment Procedures",
        content: `# Amendment Procedures

Amendments allow delegates to modify draft resolutions after they have been formally introduced. Understanding amendment procedures is essential for both supporting and opposing changes.

## What is an Amendment?

An amendment is a formal proposal to change, add, or delete words in a draft resolution's operative clauses. Preambular clauses are generally not amended.

## Types of Amendments

### Friendly Amendments
A friendly amendment is one that ALL sponsors of the original draft resolution agree to:
- No vote required—automatically incorporated
- The Chair announces the change
- The amendment is read into the record

### Unfriendly Amendments
An unfriendly amendment is NOT approved by all original sponsors:
- Requires a specified number of signatories (varies by conference, typically 20% of committee members)
- Must be formally debated
- Voted upon by the committee
- If passed, the amendment is incorporated regardless of sponsors' objections

## Amendment Format

Amendments follow this structure:
- **Add**: Inserts new language into a specific operative clause
- **Delete**: Removes language from a specific operative clause
- **Replace/Modify**: Replaces specific language in a clause with new language

Example:
"Amendment to Clause 3: Replace 'encourages' with 'urges' and add 'by 2028' after 'implement'"

## Strategic Use of Amendments

### For Sponsors
- Accept friendly amendments that strengthen your resolution
- Be open to compromise—resolutions that reflect broader consensus are more likely to pass
- Don't accept amendments that fundamentally change your resolution's intent

### For Non-Sponsors
- Use amendments to add your country's priorities to the resolution
- Build coalitions to support unfriendly amendments
- Strategic unfriendly amendments can make a competing resolution more palatable

## Procedural Steps

1. Delegate submits written amendment to the Chair
2. Chair reviews for proper format
3. Chair announces the amendment to the committee
4. If unfriendly: debate proceeds on the amendment
5. Delegates speak for and against
6. Vote is taken on the amendment
7. If passed: amendment is incorporated; if failed: resolution remains unchanged
8. Process repeats for additional amendments

## Common Pitfalls

- Submitting too many minor amendments (dilatory tactic)
- Not gathering enough signatories for unfriendly amendments
- Failing to clearly specify which clause and which words are being changed
- Not coordinating with allies before submitting amendments`,
        type: "reading",
        duration: 20,
        order: 4,
      },
    ],
  })

  // Course 3: Crisis Committee Protocols
  const course3 = await prisma.course.create({
    data: {
      title: "Crisis Committee Protocols",
      description: "Master the dynamic world of crisis committees. Learn crisis response frameworks, real-time decision making, backroom communication, and adaptive strategy for high-pressure MUN simulations.",
      category: "Specialized",
      difficulty: "ADVANCED",
      xpReward: 150,
      targetRole: "DELEGATE_ADVANCED",
      order: 3,
      isPublished: true,
      duration: 200,
    },
  })
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course3.id,
        title: "Understanding Crisis Committees",
        content: `# Understanding Crisis Committees

Crisis committees are among the most dynamic and exciting experiences in Model United Nations. Unlike traditional GA committees, crisis committees feature evolving scenarios that require rapid adaptation and creative problem-solving.

## What Makes Crisis Different?

### Real-Time Evolution
Unlike standard committees where the topic is fixed, crisis committees feature:
- **Crisis Updates**: Breaking news and developments injected by the crisis staff
- **Dynamic Situations**: The scenario changes based on delegate actions
- **Time Pressure**: Decisions must be made quickly
- **Unpredictability**: No one knows what will happen next

### Dual-Track Gameplay
Crisis delegates operate on two tracks simultaneously:

1. **Committee Track**: Formal debate in the committee room following standard parliamentary procedure
2. **Crisis Track**: Directing actions through crisis notes—private communications to the crisis staff

### Crisis Staff
Behind every crisis committee is a team:
- **Crisis Director (CD)**: Oversees the entire crisis simulation
- **Crisis Staff**: Process delegate notes and determine outcomes
- **Backroom Team**: Develops crisis updates and manages the evolving narrative

## Types of Crisis Committees

### Historical Crisis
Set in a specific historical period with real events:
- Example: The Cuban Missile Crisis (1962)
- Delegates represent historical figures
- Can change the course of history through their actions

### Futuristic/Contemporary Crisis
Set in present or future scenarios:
- Example: UN Security Council response to a fictional conflict
- Delegates represent current leaders
- Often involves emerging global challenges

### Fantasy/Themed Crisis
Set in fictional universes:
- Example: Ministry of Magic responding to a dark wizard threat
- Creative and engaging scenarios
- Less bound by real-world constraints

## Key Differences from Standard MUN

| Feature | Standard Committee | Crisis Committee |
|---------|-------------------|------------------|
| Topic | Fixed agenda item | Evolving scenario |
| Actions | Debate & resolution | Direct actions via notes |
| Information | Provided in background guide | Revealed through updates |
| Pace | Measured | Rapid |
| Powers | Propose resolutions | Direct personal/country actions |
| Outcome | Vote on resolution | Multiple possible endings |

## The Crisis Mindset

Success in crisis requires a different approach:
- **Be proactive**: Don't wait for the crisis to come to you
- **Think creatively**: Unconventional solutions often work best
- **Stay in character**: Your actions should be consistent with your role
- **Balance committee and crisis tracks**: Excel in both
- **Adapt quickly**: When circumstances change, change your strategy`,
        type: "reading",
        duration: 20,
        order: 1,
      },
      {
        courseId: course3.id,
        title: "Writing Crisis Notes",
        content: `# Writing Crisis Notes

Crisis notes are your primary tool for directing actions outside the committee room. Mastering the art of crisis note writing is essential for crisis committee success.

## What Are Crisis Notes?

Crisis notes are private messages sent from delegates to the crisis staff. They describe actions your character is taking behind the scenes. The crisis staff processes these notes and determines their outcomes.

## Structure of a Crisis Note

A well-written crisis note includes:

### 1. Header Information
- Your name and title/position
- Date and time (in simulation)
- Classification level (Public, Confidential, Top Secret)

### 2. Action Statement
Clearly state what you want to do:
- Be specific about the action
- Include relevant details (who, what, when, where, how)
- Explain the resources you're using

### 3. Justification
Briefly explain why this action makes sense:
- Reference your character's motivations
- Connect to recent events in the simulation
- Show how this serves your country/position

### 4. Expected Outcome
What you hope to achieve (this doesn't guarantee the result)

## Example Crisis Notes

### Military Action
\`\`\`
FROM: Minister of Defense, Republic of Krasnov
DATE: Day 2, 0300 hours
CLASSIFICATION: TOP SECRET

ACTION: I am mobilizing the 7th Infantry Division (3,000 troops) to secure the border crossing at Novi Grad. The troops will establish a defensive perimeter 5km from the crossing and will not engage unless fired upon. I am also deploying two reconnaissance drones to monitor enemy movements.

JUSTIFICATION: Recent intelligence indicates hostile forces massing near the border. This defensive posture protects our citizens while maintaining the peace.

EXPECTED OUTCOME: Secure border, prevent incursion, gather intelligence.
\`\`\`

### Diplomatic Action
\`\`\`
FROM: Ambassador Chen, People's Republic of Xin
DATE: Day 2, 1400 hours
CLASSIFICATION: CONFIDENTIAL

ACTION: I am initiating a backchannel meeting with the Ambassador of Zoravia at the neutral embassy in Geneva. I will propose a 48-hour ceasefire and the establishment of a demilitarized zone along the disputed border.

JUSTIFICATION: Escalating tensions threaten regional stability. A ceasefire allows for diplomatic negotiations while preventing further casualties.

EXPECTED OUTCOME: Zoravia agrees to ceasefire; negotiations begin.
\`\`\`

## Best Practices

### Do's
- **Be specific**: Vague notes get vague responses
- **Use your resources**: Reference your actual powers and assets
- **Be realistic**: Actions should be plausible for your position
- **Stay in character**: Act as your character would
- **Follow up**: Send related notes to build on previous actions
- **Be patient**: Crisis staff needs time to process

### Don'ts
- **Don't god-mod**: You can't control other delegates' actions
- **Don't be vague**: "I attack the enemy" is too imprecise
- **Don't submit too many notes**: Quality over quantity
- **Don't metagame**: Use only information your character would have
- **Don't ignore committee**: Balance note-writing with formal debate`,
        type: "reading",
        duration: 25,
        order: 2,
      },
      {
        courseId: course3.id,
        title: "Crisis Strategy and Adaptation",
        content: `# Crisis Strategy and Adaptation

The ability to adapt your strategy in response to evolving crisis scenarios separates exceptional crisis delegates from good ones.

## Strategic Frameworks

### The OODA Loop
Developed by military strategist John Boyd, the OODA Loop is perfect for crisis committees:

1. **Observe**: Gather information from crisis updates, committee debate, and intelligence
2. **Orient**: Analyze the information in context—what does it mean for your position?
3. **Decide**: Choose a course of action based on your analysis
4. **Act**: Execute through crisis notes and committee participation

Cycle through this loop rapidly. Delegates who "get inside" their opponents' OODA loops—reacting and adapting faster—gain a significant advantage.

### Alliance Strategy
In crisis, alliances are fluid and situational:
- **Identify natural allies**: Countries or factions with shared interests
- **Build trust early**: Establish credibility before asking for favors
- **Maintain flexibility**: Don't lock yourself into positions that prevent adaptation
- **Prepare for betrayal**: Have contingency plans if allies defect

### Information Management
- **Control information flow**: Decide what to share and what to keep secret
- **Gather intelligence**: Use crisis notes for reconnaissance
- **Verify information**: Don't trust everything you hear—cross-reference
- **Disinformation**: Strategic leaks can misdirect opponents (use ethically)

## Adapting to Crisis Updates

When a crisis update drops:
1. **Read carefully**: Every detail matters
2. **Assess impact**: How does this change your position/goals?
3. **Identify opportunities**: Crisis often creates new possibilities
4. **Adjust quickly**: Don't be rigid—adapt your strategy
5. **Communicate**: Update allies and coordinate response

## Common Crisis Scenarios

### Military Escalation
- Decide whether to respond with force or diplomacy
- Consider escalation risks and de-escalation options
- Coordinate with allies on collective response

### Political Crisis
- Navigate coups, assassinations, or government collapse
- Determine your character's position in the new order
- Form new alliances or reinforce existing ones

### Economic Emergency
- Respond to market crashes, sanctions, or resource shortages
- Propose economic policy solutions
- Negotiate trade agreements and aid packages

### Humanitarian Disaster
- Balance strategic interests with humanitarian obligations
- Mobilize international response
- Navigate sovereignty concerns vs. intervention needs

## The Endgame

As the crisis simulation approaches its conclusion:
- Push for your key objectives while compromise is still possible
- Formalize agreements through committee resolutions
- Ensure your actions are documented for the crisis staff's evaluation
- Make a final impact—crisis directors remember strong closing moves`,
        type: "reading",
        duration: 25,
        order: 3,
      },
      {
        courseId: course3.id,
        title: "Crisis Directing for Chairs",
        content: `# Crisis Directing for Chairs

For those stepping into the role of Crisis Director or Chair of a crisis committee, this lesson covers the unique responsibilities and skills needed.

## The Crisis Director's Role

The Crisis Director (CD) is the architect of the crisis experience:
- **Designs the scenario**: Creates the backstory, characters, and potential arcs
- **Manages the narrative**: Decides how the story evolves based on delegate actions
- **Controls pacing**: Ensures the simulation remains engaging and challenging
- **Evaluates performance**: Assesses delegate contributions for awards

## Pre-Conference Preparation

### Building the Crisis Arc
1. **Establish the baseline**: Create a detailed backstory and initial situation
2. **Plan major plot points**: Key events that will drive the narrative forward
3. **Prepare multiple paths**: Anticipate different delegate responses
4. **Create crisis updates**: Pre-write several updates that can be deployed at appropriate moments
5. **Develop character profiles**: For each delegate, provide background, resources, and secret objectives

### Resource Preparation
- Maps and visual aids
- Intelligence reports and documents
- Crisis update templates
- Delegate character packets
- Emergency backup scenarios

## During the Simulation

### Processing Crisis Notes
1. **Read carefully**: Understand the full intent of each note
2. **Assess plausibility**: Is the action realistic given the delegate's position and resources?
3. **Determine outcome**: Based on realism, balance, and narrative interest
4. **Write response**: Provide outcome that advances the story while rewarding creative play
5. **Update the board**: Track all actions and their consequences

### Pacing the Crisis
- **Early phase**: Establish the scenario, let delegates settle into roles
- **Middle phase**: Escalate tension, introduce complications
- **Climax**: Peak crisis moment requiring decisive action
- **Resolution**: Allow delegates to resolve the crisis, for better or worse

### Managing Delegate Engagement
- Ensure all delegates are involved, not just the most vocal
- Create sub-plots for quieter delegates through crisis notes
- Balance power—don't let one delegate dominate
- Use crisis updates to redirect focus if needed

## Common Directing Challenges

### Delegate Passivity
If delegates aren't engaging:
- Send targeted crisis updates to their characters
- Create personal stakes that require action
- Have NPCs approach them with information or requests

### Runaway Escalation
If the crisis escalates too quickly:
- Introduce moderating factors (diplomatic pressure, resource constraints)
- Provide de-escalation opportunities
- Create consequences for overreaction

### Stalled Narrative
If the crisis stalls:
- Introduce a dramatic twist through a crisis update
- Reveal new information that changes the calculation
- Create a time-sensitive emergency

## Awards Consideration

When evaluating delegates for awards, consider:
- Quality and creativity of crisis notes
- Consistency of character portrayal
- Contribution to the narrative
- Diplomatic skill in committee
- Adaptability to changing circumstances
- Leadership and coalition-building`,
        type: "reading",
        duration: 25,
        order: 4,
      },
    ],
  })

  // Course 4: Diplomatic Negotiation Strategies
  const course4 = await prisma.course.create({
    data: {
      title: "Diplomatic Negotiation Strategies",
      description: "Develop advanced negotiation skills for MUN and beyond. Learn interest-based bargaining, coalition building, bloc dynamics, and the art of diplomatic compromise.",
      category: "Diplomacy",
      difficulty: "INTERMEDIATE",
      xpReward: 120,
      targetRole: "DELEGATE",
      order: 4,
      isPublished: true,
      duration: 180,
    },
  })
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course4.id,
        title: "Fundamentals of Diplomatic Negotiation",
        content: `# Fundamentals of Diplomatic Negotiation

Negotiation is at the heart of diplomacy and Model United Nations. This lesson covers the foundational principles of effective diplomatic negotiation.

## What is Diplomatic Negotiation?

Diplomatic negotiation is a process where parties with different interests seek to reach a mutually acceptable agreement through dialogue, compromise, and creative problem-solving.

In MUN, negotiation occurs constantly:
- During unmoderated caucuses when forming blocs
- When merging draft resolutions
- In informal discussions between delegates
- When seeking signatories for your resolution
- During amendment negotiations

## The Harvard Negotiation Framework

The Harvard Negotiation Project identifies four key principles:

### 1. Separate People from the Problem
- Focus on the issue, not the person
- Don't take disagreements personally
- Maintain respectful relationships even with opponents
- In MUN: The delegate of Country X is not your enemy—their position is simply different

### 2. Focus on Interests, Not Positions
- Positions are what delegates say they want
- Interests are why they want it
- Understanding interests reveals opportunities for mutual gain

**Example:**
- Position: "My country demands a complete ban on nuclear energy"
- Interest: "My country fears nuclear accidents and wants energy security"
- Solution: Could include strict safety regulations and alternative energy support

### 3. Invent Options for Mutual Gain
- Brainstorm creative solutions before committing
- Expand the pie before dividing it
- Look for win-win possibilities

### 4. Insist on Objective Criteria
- Base agreements on fair standards (international law, UN precedents, expert reports)
- Use objective criteria to evaluate proposals
- This depersonalizes disagreements

## The Negotiation Spectrum

### Competitive (Zero-Sum)
- One party's gain is another's loss
- Common when resources are fixed
- Can lead to deadlock in MUN

### Collaborative (Win-Win)
- Both parties gain through cooperation
- Requires trust and information sharing
- Ideal for MUN resolution building

### Compromise
- Both parties give something up
- Middle ground between positions
- Often necessary when interests truly conflict

## Your Negotiation Style

Understanding your natural style helps you adapt:

- **Accommodating**: Prioritize relationships over outcomes (good for building trust, bad for getting your way)
- **Competing**: Prioritize your own outcome (good for critical issues, bad for relationships)
- **Avoiding**: Sidestep conflict (good for trivial issues, bad for important ones)
- **Compromising**: Meet in the middle (good for time pressure, bad for creative solutions)
- **Collaborating**: Work together for mutual gain (best outcomes, but time-intensive)

The best MUN delegates can use all five styles depending on the situation.`,
        type: "reading",
        duration: 25,
        order: 1,
      },
      {
        courseId: course4.id,
        title: "Coalition Building and Bloc Dynamics",
        content: `# Coalition Building and Bloc Dynamics

In MUN, no delegate achieves their goals alone. Understanding how to build and navigate coalitions and blocs is essential.

## Understanding Blocs

A **bloc** is a group of countries with shared interests that work together during the conference. Common MUN blocs include:

### Regional Blocs
- **African Group**: 54 member states focused on development, peace, and health
- **European Union**: 27 members focused on human rights, trade, and climate
- **ASEAN**: 10 Southeast Asian nations focused on regional stability and growth
- **Arab League**: 22 member states focused on regional issues and cultural concerns
- **GRULAC (Latin America & Caribbean)**: 33 states focused on development and sovereignty
- **G77 + China**: 134 developing nations focused on economic development

### Interest-Based Blocs
- **Nuclear States vs. Non-Nuclear States**
- **Developed vs. Developing Nations**
- **Oil Producers vs. Renewable Energy Advocates**
- **Human Rights Advocates vs. Sovereignty Defenders**

## Building a Coalition

### Step 1: Identify Potential Allies
Review the country matrix and background guide:
- Which countries share your interests?
- Which countries have complementary capabilities?
- Who are your natural partners based on geography, economy, and history?

### Step 2: Make Initial Contact
During the first unmoderated caucus:
- Approach potential allies with a clear, concise pitch
- Share your country's key priorities
- Listen to their priorities
- Identify common ground

### Step 3: Establish the Coalition
- Agree on shared goals and non-negotiables
- Assign roles (who drafts, who lobbies, who speaks)
- Set communication norms (regular check-ins, shared documents)
- Establish a mechanism for resolving internal disagreements

### Step 4: Maintain the Coalition
- Keep allies informed of developments
- Address concerns before they become fractures
- Celebrate wins together
- Be willing to compromise on lesser issues to maintain unity

## Navigating Bloc Politics

### When Your Interests Diverge from Your Bloc
- You're not required to follow the bloc on every issue
- Communicate your position early and clearly
- Offer support on other issues in exchange for flexibility
- Sometimes you must break from the bloc—do so diplomatically

### Merging Blocs
When two blocs want to merge their resolutions:
1. Identify common operative clauses
2. Negotiate on differing clauses—look for middle ground
3. Stronger language can often bridge gaps ("Encourages" → "Urges")
4. Create new clauses that address both blocs' priorities
5. Present a united front to the committee

### The Power of Small States
Small states can have outsized influence by:
- Being reliable coalition partners
- Offering bridge-building between larger blocs
- Providing technical expertise on niche issues
- Leveraging moral authority
- Being swing votes in tight negotiations`,
        type: "reading",
        duration: 25,
        order: 2,
      },
      {
        courseId: course4.id,
        title: "The Art of Compromise",
        content: `# The Art of Compromise

Compromise is not weakness—it is the essence of diplomacy. Learning when and how to compromise is crucial for passing resolutions and building lasting partnerships.

## When to Compromise

### Compromise When:
- The issue is less important to your country than to others
- You're gaining something of greater value in exchange
- The alternative is no agreement at all
- Compromise builds goodwill for future negotiations
- Your position is unlikely to win majority support

### Don't Compromise When:
- The issue is a core national interest or non-negotiable
- Your country's fundamental values are at stake
- You're being pressured without receiving anything in return
- The compromise creates a worse outcome than no agreement
- It would undermine your credibility with allies

## Compromise Techniques

### 1. Log-Rolling
Trade support on different issues:
"I'll support your clause on economic sanctions if you support my clause on humanitarian aid."

### 2. Bridging
Create a new option that satisfies both parties' interests:
Instead of: "Complete ban" vs. "No restrictions"
Bridge to: "Graduated restrictions with review mechanisms"

### 3. Cost-Cutting
Reduce the cost of agreement for the other party:
"Instead of requiring all nations to contribute, we'll make it voluntary with incentives."

### 4. Compensation
Offset the concession with something else:
"We'll agree to the weaker language on emissions if you support stronger language on technology transfer."

### 5. Gradual Implementation
Agree to a phased approach:
"Phase 1: Voluntary guidelines. Phase 2: Review and strengthen. Phase 3: Binding commitments if targets not met."

## Language Compromises

One of the most common compromise techniques in MUN is adjusting operative verbs:

| Weakest → Strongest |
|---------------------|
| Notes → Acknowledges |
| Acknowledges → Recognizes |
| Recognizes → Encourages |
| Encourages → Recommends |
| Recommends → Calls upon |
| Calls upon → Urges |
| Urges → Demands |
| Demands → Condemns |

Moving a clause one step stronger or weaker can often bridge the gap between positions.

## Managing Deadlock

When negotiations stall:

1. **Identify the real obstacle**: Is it the issue, the relationship, or the process?
2. **Take a break**: Unmoderated caucus to cool tensions
3. **Reframe the problem**: Look at it from a different angle
4. **Bring in a mediator**: A neutral delegate can help bridge gaps
5. **Expand the options**: Can additional clauses address concerns?
6. **Accept partial agreement**: It's better to agree on some issues than none

## The Final Push

As the conference approaches voting:
- Prioritize your absolute non-negotiables
- Be generous on lesser issues
- Help other delegates save face
- Build momentum—once a few key delegates support, others often follow
- Remember: a good resolution that passes is better than a perfect one that fails`,
        type: "reading",
        duration: 25,
        order: 3,
      },
      {
        courseId: course4.id,
        title: "Advanced Persuasion Techniques",
        content: `# Advanced Persuasion Techniques

Beyond basic negotiation, advanced persuasion techniques can help you win support for your positions and resolutions.

## Ethos, Pathos, Logos

The ancient Greek rhetorical framework remains powerful:

### Ethos (Credibility)
Establish your authority and trustworthiness:
- Reference your country's expertise or experience with the issue
- Cite credible sources and data
- Demonstrate deep understanding of the topic
- Show consistency in your positions

### Pathos (Emotion)
Connect emotionally with your audience:
- Use vivid, specific examples (real stories of affected people)
- Appeal to shared values (justice, dignity, human rights)
- Paint a picture of consequences—both of action and inaction
- Use measured, genuine emotion—not melodrama

### Logos (Logic)
Build a rational case:
- Present clear cause-and-effect relationships
- Use statistics and data effectively
- Show how your proposal logically addresses the problem
- Anticipate and preemptively address counterarguments

## The Power of Framing

How you frame an issue dramatically affects how others perceive it:

### Positive Framing
"Investing in renewable energy creates 3 million new jobs" vs.
"Not investing in renewables costs 3 million potential jobs"

### Urgency Framing
"If we don't act now, 500,000 more children will suffer" vs.
"Action on this issue would benefit children"

### Common Ground Framing
"We all agree that peace is essential—let's discuss how to achieve it" vs.
"My plan for peace is better than yours"

## Social Proof

Delegates are more likely to support a position if others already do:
- Build momentum by securing key endorsements first
- Mention countries that support your position
- Create the impression of growing support
- Use co-sponsorship strategically

## Reciprocity

People feel obligated to return favors:
- Support other delegates on their priority issues
- Share useful information or intelligence
- Help newer delegates with procedure
- The goodwill you build becomes currency later

## Scarcity and Urgency

People value what is scarce or time-limited:
- "We have a unique window of opportunity"
- "If we don't act in this session, the situation will worsen"
- "Only three clauses remain unaddressed—let's finish strong"

## Ethical Persuasion

Effective persuasion in MUN must be ethical:
- **Do**: Use facts, logic, and genuine appeals
- **Do**: Acknowledge legitimate counterarguments
- **Do**: Represent your country's actual position accurately
- **Don't**: Misrepresent facts or data
- **Don't**: Make promises you can't keep
- **Don't**: Pressure or intimidate other delegates
- **Don't**: Use confidential information unethically`,
        type: "reading",
        duration: 25,
        order: 4,
      },
    ],
  })

  // Course 5: Public Speaking & Oratory Skills
  const course5 = await prisma.course.create({
    data: {
      title: "Public Speaking & Oratory Skills",
      description: "Develop powerful speaking skills for MUN committee sessions. Master speech structure, delivery techniques, extemporaneous speaking, and the art of persuasive oratory.",
      category: "Communication",
      difficulty: "BEGINNER",
      xpReward: 100,
      targetRole: "DELEGATE",
      order: 5,
      isPublished: true,
      duration: 160,
    },
  })
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course5.id,
        title: "Speech Structure for MUN",
        content: `# Speech Structure for MUN

A well-structured speech is the foundation of effective MUN participation. This lesson teaches you how to craft speeches that are clear, persuasive, and memorable.

## The Basic Speech Framework

Every MUN speech should follow a clear structure:

### 1. Hook (10-15 seconds)
Grab the committee's attention:
- Startling statistic: "Every 3 seconds, a child dies from preventable causes"
- Compelling question: "How many more must suffer before we act?"
- Powerful quote: "As Nelson Mandela said, 'Education is the most powerful weapon...'"
- Vivid scenario: "Imagine a world where clean water is a luxury, not a right"

### 2. Position Statement (15-20 seconds)
Clearly state your country's position:
- "The Republic of Kenya firmly believes that..."
- "The People's Republic of China stands in strong support of..."
- "The United States of America cannot support this approach because..."

### 3. Supporting Arguments (45-90 seconds)
Present 2-3 key arguments with evidence:
- Each argument should have a clear claim, evidence, and impact
- Use specific data, examples, and references
- Connect each argument to the committee's mandate

### 4. Call to Action (15-20 seconds)
End with a clear request:
- "This committee must adopt concrete measures to..."
- "We urge all delegates to support..."
- "The time for action is now—let us not fail those who depend on us"

## Speech Types in MUN

### Opening Speech (Speakers List)
- 1-2 minutes
- General position statement
- Sets the tone for your country's participation
- Should be polished and well-prepared

### Moderated Caucus Speech
- 30 seconds to 2 minutes (varies)
- Focused on a specific sub-topic
- Must be responsive to previous arguments
- More extemporaneous in nature

### Right of Reply
- 30-60 seconds
- Responds to attacks on your country
- Must be measured, not emotional
- Defend your position with facts

### Closing Statement
- 1-2 minutes
- Summarize your key positions
- Make final appeals
- Leave a lasting impression

## The Rule of Three

Grouping arguments in threes is psychologically powerful:
- "This crisis demands action on three fronts: prevention, protection, and prosecution"
- "We must act for the victims, for the future, and for the principles we claim to uphold"

## Transitions

Effective transitions keep your speech flowing:
- "Turning to the economic dimension..."
- "Furthermore, the humanitarian cost cannot be ignored..."
- "In addition to these measures..."
- "Most critically, however..."
- "Building on the previous delegate's point..."`,
        type: "reading",
        duration: 25,
        order: 1,
      },
      {
        courseId: course5.id,
        title: "Delivery and Body Language",
        content: `# Delivery and Body Language

Your message is not just what you say—it's how you say it. Mastering delivery and body language dramatically increases your speech's impact.

## Vocal Delivery

### Pace
- Normal speaking pace: 130-150 words per minute
- Slow down for emphasis on key points
- Speed up slightly during narrative passages
- Pauses are powerful—a 2-second pause before a key statement builds anticipation

### Volume
- Speak loudly enough to be heard clearly
- Increase volume for emphasis (not shouting)
- Decrease volume to draw listeners in (creates intimacy)
- Vary volume to maintain interest

### Tone and Inflection
- Avoid monotone—vary your pitch
- Rise in pitch at the end of questions
- Drop pitch for definitive statements
- Use upward inflection to express hope; downward for concern

### Articulation
- Pronounce words clearly
- Avoid filler words (um, uh, like, you know)
- Don't rush—clarity over speed
- Practice difficult words and country names

## Body Language

### Posture
- Stand tall with shoulders back
- Plant your feet firmly
- Lean slightly forward to show engagement
- Avoid slouching or leaning on the podium

### Gestures
- Use purposeful, controlled hand gestures
- Open palms convey honesty and openness
- Pointing can seem aggressive—use sparingly
- Gesture size should match the room (larger in bigger rooms)

### Eye Contact
- Scan the room—make eye contact with different delegates
- Don't stare at your notes or a single point
- Look at delegates when making direct appeals
- The Chair is also your audience—include them

### Facial Expressions
- Match expression to content
- Show concern when discussing suffering
- Show determination when making commitments
- A slight smile can warm up an opening

## Common Delivery Mistakes

### Reading from Notes
- Glance at notes, don't read verbatim
- Use bullet points, not full sentences
- Practice enough that you can speak extemporaneously

### Nervous Habits
- Pacing, fidgeting, playing with hair/clothes
- Clicking pens, tapping feet
- Excessive water drinking
- Practice and preparation reduce nervousness

### Lack of Energy
- MUN speeches require conviction
- If you don't seem to care, why should anyone else?
- Channel your passion appropriately

## Practice Techniques

1. **Record yourself**: Watch for unconscious habits
2. **Mirror practice**: Observe your facial expressions
3. **Timer drills**: Practice fitting content into time limits
4. **Impromptu exercises**: Give speeches on random topics for 1 minute
5. **Peer feedback**: Ask others to critique your delivery`,
        type: "reading",
        duration: 25,
        order: 2,
      },
      {
        courseId: course5.id,
        title: "Extemporaneous Speaking",
        content: `# Extemporaneous Speaking

Most MUN speeches require thinking on your feet. This lesson develops your ability to speak effectively without a prepared script.

## What is Extemporaneous Speaking?

Extemporaneous speaking is delivering a speech with limited preparation time. In MUN, this happens constantly—during moderated caucuses, when responding to arguments, or when given speaking opportunities on short notice.

This is NOT the same as impromptu speaking (no preparation at all) or memorized speaking (fully scripted). Extemporaneous speaking occupies the middle ground: you know your topic and key points, but you craft the actual words in real-time.

## The PREP Framework

When you need to speak quickly, use PREP:

### P - Point
State your main point clearly:
"The delegate of Japan believes that multilateral cooperation is essential to addressing climate change."

### R - Reason
Explain why:
"Climate change is a transboundary problem that no single nation can solve alone."

### E - Example
Provide evidence:
"The Paris Agreement demonstrates that when nations work together, meaningful progress is possible—global emissions growth has slowed since its adoption."

### P - Point (Restated)
Reinforce your point:
"Therefore, Japan urges all delegates to commit to strengthened multilateral frameworks."

## Quick Preparation Strategy

When you have 30-60 seconds before speaking:

1. **Identify your one key message** (What's the ONE thing they should remember?)
2. **Choose 2 supporting points** (What evidence supports your message?)
3. **Select a hook** (How will you start?)
4. **Determine your ask** (What do you want the committee to do?)

## Responding to Other Delegates

### Agreeing
"Japan aligns with the delegate of Brazil's position on sustainable development, and would add that..."

### Disagreeing Respectfully
"While Japan appreciates the delegate's perspective, we must consider that..."

### Building Upon
"Building on the delegate of Kenya's excellent point about agricultural subsidies, Japan proposes..."

### Reframing
"The delegate raises an important concern. However, viewed differently, this challenge presents an opportunity to..."

## Managing Speaking Time

### When You Have Too Much to Say
- Prioritize your strongest 2-3 points
- Cut examples before cutting arguments
- Speak faster only slightly—maintain clarity
- Use the remaining time for a powerful conclusion

### When You Have Too Little to Say
- Expand on your strongest point
- Add a relevant anecdote or example
- Connect your point to a broader principle
- Make a direct appeal to other delegates

## Developing Quick Thinking

### Daily Exercises
- **Topic drill**: Pick a random news headline and speak for 1 minute
- **Devil's advocate**: Practice arguing positions you disagree with
- **Link drill**: Connect any two unrelated topics in a coherent speech
- **Abbreviation drill**: Take a random acronym and deliver a speech where each letter is a point

### During Conference
- Listen actively to all speeches
- Take quick notes on key arguments
- Identify gaps in others' reasoning
- Prepare counter-arguments while others speak
- Always be ready—you never know when you'll be called upon`,
        type: "reading",
        duration: 25,
        order: 3,
      },
      {
        courseId: course5.id,
        title: "Persuasive Rhetoric",
        content: `# Persuasive Rhetoric

Move beyond informative speaking to truly persuasive rhetoric—speeches that change minds and mobilize action.

## The Persuasion Spectrum

### 1. Inform → Convince → Inspire → Activate

- **Inform**: "Water scarcity affects 2 billion people worldwide"
- **Convince**: "Without action, 3.5 billion will face water scarcity by 2030"
- **Inspire**: "We have the technology and resources to ensure clean water for all—what we lack is the collective will"
- **Activate**: "This committee must commit today to doubling investment in water infrastructure by 2030"

## Rhetorical Devices for MUN

### Repetition
Repeat key phrases for emphasis:
"We must act **now**. We must act **together**. We must act **decisively**."

### Anaphora
Begin successive phrases with the same words:
"We demand accountability. We demand transparency. We demand justice."

### Tricolon
Groups of three for impact:
"This crisis demands courage, commitment, and cooperation."

### Antithesis
Contrast opposing ideas:
"We can choose the path of conflict, or we can choose the path of dialogue."

### Rhetorical Questions
Questions that make a point rather than seek an answer:
"How many more reports must we commission before we take action?"

### Alliteration
Repetition of initial sounds:
"We face a future of floods, famine, and fear if we fail to act."

### Metaphor
Comparisons that paint vivid pictures:
"This crisis is not a storm that will pass—it is a rising tide that threatens to engulf us all."

## Emotional Appeals in MUN

### When Appropriate
- Humanitarian crises
- Human rights violations
- Suffering of vulnerable populations
- Existential threats

### How to Use Emotion Effectively
- Be specific: Name a specific child, village, or incident
- Show you care: Genuine emotion is more powerful than performative emotion
- Connect to values: Link emotion to shared principles
- Balance with logic: Emotion opens hearts; logic changes minds

## Addressing the Room

### Speaking to the Persuaded
When addressing allies:
- Reinforce shared values
- Call for specific action
- Build momentum for your coalition

### Speaking to the Undecided
When addressing swing delegates:
- Acknowledge their concerns
- Present balanced arguments
- Offer compromise where possible
- Emphasize common ground

### Speaking to Opponents
When addressing adversaries:
- Show respect for their perspective
- Find areas of agreement, however small
- Reframe disagreements as shared challenges
- Appeal to their interests, not just yours

## The Power of Silence

Don't underestimate the power of pauses:
- A pause before a key statement builds anticipation
- A pause after an emotional point lets it sink in
- A pause before your conclusion signals importance
- Silence can be more powerful than words

## Final Tips

1. **End strong**: Your closing words are what people remember most
2. **Be authentic**: Genuine conviction is more persuasive than theatrical performance
3. **Adapt to feedback**: Read the room and adjust your approach
4. **Practice, practice, practice**: Great speakers are made, not born`,
        type: "reading",
        duration: 25,
        order: 4,
      },
    ],
  })

  // Course 6: Research & Position Paper Writing
  const course6 = await prisma.course.create({
    data: {
      title: "Research & Position Paper Writing",
      description: "Master the research and writing skills that form the backbone of effective MUN participation. Learn to research countries, analyze topics, and write compelling position papers.",
      category: "Research",
      difficulty: "BEGINNER",
      xpReward: 100,
      targetRole: "DELEGATE",
      order: 6,
      isPublished: true,
      duration: 150,
    },
  })
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course6.id,
        title: "Effective Research Methodology",
        content: `# Effective Research Methodology

Strong research is the foundation of successful MUN participation. This lesson teaches you systematic approaches to researching your country and topic.

## The Research Pyramid

### Level 1: Understanding the Topic
Before diving deep, establish broad understanding:
- Read the committee's background guide thoroughly
- Review the UN Charter provisions relevant to your committee
- Understand the historical context of the issue
- Identify key stakeholders and their positions

### Level 2: Country Research
Know your country inside and out:
- **CIA World Factbook**: Basic country profile, economy, demographics
- **Ministry of Foreign Affairs**: Official foreign policy positions
- **UN Member State Portal**: Voting records, statements, and treaty ratifications
- **National Development Plans**: Priorities and goals
- **Regional Organizations**: AU, ASEAN, EU, Arab League positions

### Level 3: Deep Topic Research
Specialized sources for your specific topic:
- **UN Documents**: Resolutions, reports, and debates (documents.un.org)
- **UN Agency Reports**: WHO, UNDP, UNHCR, etc.
- **Academic Journals**: Peer-reviewed research
- **Think Tank Reports**: Brookings, Chatham House, Carnegie
- **News Sources**: Reuters, AP, Al Jazeera, BBC

### Level 4: Current Developments
Real-time information for committee debate:
- Recent UN sessions and votes
- Current events and breaking news
- Social media of key officials
- Recent statements by your country's representatives

## Research Organization

### The Country Profile Template
Create a one-page summary with:
1. Official name, capital, government type
2. Population, GDP, HDI ranking
3. Key allies and adversaries
4. Regional group memberships
5. Key UN voting bloc
6. Main foreign policy priorities
7. Specific interests in your committee's topic

### The Topic Analysis Template
1. History of the issue
2. Current situation
3. Key actors and their positions
4. Previous UN actions
5. Existing treaties and conventions
6. Proposed solutions and debates
7. Your country's specific interest and position

## Credible Sources

### Tier 1: Primary Sources
- UN official documents
- Treaty texts
- Government statements
- Original data and statistics

### Tier 2: Secondary Sources
- Academic journals and books
- Think tank analyses
- Reputable news organizations
- UN agency reports

### Tier 3: Supplementary Sources
- Opinion pieces
- Blogs and commentary
- Social media
- Wikipedia (for overview only—verify everything)

### Avoid
- Unverified social media posts
- Partisan sources without fact-checking
- Outdated statistics
- Sources with clear bias that isn't acknowledged

## Research Tips

1. **Start early**: Research takes longer than you think
2. **Use keywords effectively**: Learn boolean search operators
3. **Follow citations**: One good source leads to others
4. **Keep a research log**: Track sources and key findings
5. **Verify facts**: Cross-reference important claims
6. **Know your country's red lines**: Some positions are non-negotiable`,
        type: "reading",
        duration: 25,
        order: 1,
      },
      {
        courseId: course6.id,
        title: "Writing Position Papers",
        content: `# Writing Position Papers

A position paper is your country's formal statement on the committee's topic. It demonstrates your research, outlines your country's position, and proposes solutions.

## Why Position Papers Matter

- **Preparation**: Forces you to organize your research and thinking
- **Credibility**: Shows you've done your homework—chairs notice
- **Awards**: Many conferences give awards for best position papers
- **Strategy**: Helps you identify allies and opponents before the conference
- **Reference**: Serves as your guide during committee sessions

## Position Paper Structure

### Heading
\`\`\`
Committee: [Full Committee Name]
Country: [Official Country Name]
Topic: [Agenda Item Title]
Delegate: [Your Name]
School: [Your School Name]
\`\`\`

### Section 1: Topic Background (1-2 paragraphs)
Describe the issue and its significance:
- When and how the problem emerged
- Key facts and statistics
- Why this issue matters to the international community
- Previous UN actions on the topic

### Section 2: Country Position (1-2 paragraphs)
State your country's stance clearly:
- Your country's official position on the issue
- Relevant domestic policies and legislation
- Actions your country has taken
- Treaties and conventions your country has ratified
- Speeches by your country's leaders at the UN

### Section 3: Proposed Solutions (1-2 paragraphs)
Recommend specific actions:
- Concrete, actionable proposals
- Solutions consistent with your country's position
- Multilateral approaches
- Innovative ideas that demonstrate creative thinking
- How your proposals address root causes

## Writing Best Practices

### Do
- **Be specific**: Use data, dates, and concrete references
- **Be consistent**: Your solutions should follow logically from your position
- **Be realistic**: Propose solutions your country would actually support
- **Be concise**: Most position papers are 1-2 pages
- **Be diplomatic**: Even when criticizing, maintain professional tone
- **Cite sources**: Use footnotes or in-text citations

### Don't
- **Write in first person**: Use "France believes" not "I believe"
- **Plagiarize**: Always write in your own words
- **Be vague**: "Something should be done" is not a proposal
- **Contradict your country**: Don't propose solutions your country would oppose
- **Ignore the format**: Follow your conference's specific guidelines
- **Submit late**: Deadlines are strictly enforced

## Sample Position Paper Excerpt

\`\`\`
Committee: United Nations Security Council
Country: Federal Republic of Nigeria
Topic: The Situation in the Sahel Region

The Sahel region faces an unprecedented convergence of security, humanitarian, 
and environmental crises that threaten the stability of the entire African 
continent. According to the United Nations Office for the Coordination of 
Humanitarian Affairs (OCHA), over 29 million people across the Sahel require 
humanitarian assistance in 2024, a 60% increase from 2020...

Nigeria, as the most populous nation in Africa and a regional power, has 
consistently advocated for a comprehensive approach to Sahel security. As a 
leading contributor to the Multinational Joint Task Force (MNJTF), Nigeria has 
demonstrated its commitment to regional stability through both military 
engagement and humanitarian support...

Nigeria proposes the following measures: First, the Security Council should 
authorize an expanded mandate for MINUSMA that includes proactive civilian 
protection. Second, we call for the establishment of a Sahel Stabilization 
Fund, with contributions from both traditional donors and emerging economies...
\`\`\``,
        type: "reading",
        duration: 25,
        order: 2,
      },
      {
        courseId: course6.id,
        title: "Using UN Documents and Resources",
        content: `# Using UN Documents and Resources

The United Nations produces vast amounts of documentation that can strengthen your MUN preparation and participation. This lesson teaches you how to navigate and use these resources effectively.

## Key UN Document Resources

### UN Official Document System (ODS)
- **URL**: documents.un.org
- **Contains**: All official UN documents in all six official languages
- **Search by**: Symbol, title, date, or keywords
- **Tip**: Use advanced search for precise results

### UN Bibliographic Information System (UNBISnet)
- Catalog of UN documents and publications
- Voting records of all member states
- Index to speeches made in the General Assembly and Security Council

### UN Treaty Collection
- **URL**: treaties.un.org
- **Contains**: Status of all multilateral treaties
- **Find**: Which countries have signed/ratified specific treaties
- **Essential for**: Determining your country's treaty obligations

### UN Member State Portal
- Each country's profile with links to statements, votes, and treaty participation
- **URL**: un.org/en/member-states/

## Understanding Document Symbols

UN document symbols follow a specific format:
\`\`\`
A/RES/70/1
│  │   │  └── Document number
│  │   └────── Session number
│  └────────── Subsidiary body indicator (RES = Resolution)
└───────────── Principal organ (A = General Assembly)
\`\`\`

### Common Principal Organs
- **A/**: General Assembly
- **S/**: Security Council
- **E/**: Economic and Social Council
- **ST/**: Secretariat

### Common Subsidiary Body Indicators
- **RES**: Resolution
- **PV**: Verbatim Record
- **SR**: Summary Record
- **INF**: Information
- **L.**: Limited distribution (draft)
- **R.**: Revision
- **Add.**: Addendum
- **Corr.**: Corrigendum

## Essential Documents by Committee

### General Assembly
- Annual session resolutions
- Regular budget and programme of action
- Reports from subsidiary bodies

### Security Council
- Resolutions (binding)
- Presidential Statements
- Secretary-General reports on specific conflicts
- Panel of Experts reports

### ECOSOC
- Resolutions and decisions
- Reports from functional commissions
- Coordination segment reports

## Using Voting Records

Your country's voting record reveals its priorities and positions:
- Look for patterns in how your country votes on specific issues
- Note explanations of vote (why they voted yes/no/abstain)
- Compare your country's votes with allies and adversaries

## Practical Research Workflow

1. **Start with the background guide**: Follow its suggested reading list
2. **Find relevant UN resolutions**: Use ODS to search your topic
3. **Check your country's statements**: Search UNBISnet for speeches
4. **Review treaty ratifications**: Check UN Treaty Collection
5. **Look for recent reports**: UN agencies publish annual reports
6. **Cross-reference with NGO reports**: Amnesty International, Human Rights Watch
7. **Check current news**: Recent developments may not yet be in official documents

## Citation Format

When referencing UN documents in position papers and speeches:
- **Resolutions**: "General Assembly resolution 70/1 (2015)"
- **Reports**: "Report of the Secretary-General (A/74/345)"
- **Treaties**: "Convention on the Rights of the Child (1989)"
- **Speeches**: "Statement by the Permanent Representative of Japan to the Security Council, 15 March 2024"`,
        type: "reading",
        duration: 25,
        order: 3,
      },
      {
        courseId: course6.id,
        title: "Fact-Checking and Source Verification",
        content: `# Fact-Checking and Source Verification

In MUN, accuracy builds credibility. This lesson teaches you to verify information and avoid common research pitfalls.

## Why Fact-Checking Matters

- **Credibility**: A single inaccurate claim can undermine your entire argument
- **Awards**: Chairs evaluate research quality
- **Respect**: Well-researched delegates earn respect from peers and chairs
- **Real-world impact**: The skills you develop are essential for academic and professional success

## The CRAAP Test

Evaluate sources using this framework:

### C - Currency
- When was the information published?
- Has it been updated?
- Is the information still current for your topic?
- Are the statistics recent enough?

### R - Relevance
- Does the information directly relate to your topic?
- Who is the intended audience?
- Is the information at an appropriate level of detail?

### A - Authority
- Who is the author/organization?
- What are their credentials?
- Are they qualified to speak on this topic?
- Is there contact information?

### A - Accuracy
- Is the information supported by evidence?
- Has it been peer-reviewed or fact-checked?
- Can you verify the claims from other sources?
- Are there obvious errors?

### P - Purpose
- Why does this information exist? (Inform, persuade, sell, entertain?)
- Is the purpose clear?
- Are there potential biases?
- Is the language objective or emotional?

## Common Research Pitfalls

### 1. Confirmation Bias
Seeking only information that supports your pre-existing position.
**Solution**: Actively seek opposing viewpoints and counterarguments.

### 2. Outdated Information
Using statistics or policies that have changed.
**Solution**: Always check the publication date and look for the most recent data.

### 3. Taking Quotes Out of Context
A quote means something different when removed from its context.
**Solution**: Read the full source and understand the context before citing.

### 4. Relying on Single Sources
One source may be wrong, biased, or incomplete.
**Solution**: Cross-reference key claims with at least 2-3 independent sources.

### 5. Confusing Correlation with Causation
Just because two things occur together doesn't mean one causes the other.
**Solution**: Look for evidence of causal mechanisms, not just statistical relationships.

### 6. Misinterpreting Statistics
Statistics can be manipulated through selective presentation.
**Solution**: Understand what the statistic actually measures and its limitations.

## Verifying Specific Claims

### Statistics
- Find the original source of the data
- Check the methodology
- Look for alternative estimates
- Note confidence intervals and margins of error

### Quotes
- Verify the exact wording
- Check the original context
- Confirm the speaker and occasion
- Use reputable quotation databases

### Treaty/Convention Status
- Use the UN Treaty Collection
- Check for reservations and declarations
- Note the date of signature vs. ratification
- Verify current party status

## Building a Research Verification Habit

1. **Flag uncertain claims**: Mark anything you're not sure about
2. **Triangulate**: Find three independent sources for key claims
3. **Check primary sources**: Go to the original document whenever possible
4. **Note discrepancies**: If sources disagree, investigate why
5. **Be transparent**: If information is uncertain, acknowledge it`,
        type: "reading",
        duration: 20,
        order: 4,
      },
    ],
  })

  // Course 7: Committee Chair Training
  const course7 = await prisma.course.create({
    data: {
      title: "Committee Chair Training",
      description: "Prepare to lead MUN committees with confidence. Learn chair responsibilities, ruling procedures, managing difficult delegates, running efficient sessions, and creating an inclusive environment.",
      category: "Leadership",
      difficulty: "ADVANCED",
      xpReward: 150,
      targetRole: "CHAIR",
      order: 7,
      isPublished: true,
      duration: 180,
    },
  })
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course7.id,
        title: "The Role and Responsibilities of a Chair",
        content: `# The Role and Responsibilities of a Chair

The committee Chair is the backbone of any MUN session. This lesson covers the comprehensive responsibilities of the chairing role.

## Core Responsibilities

### Before the Conference
1. **Study the Rules of Procedure**: Know every rule and be prepared to apply them
2. **Prepare the Background Guide**: Research and write a comprehensive guide for delegates
3. **Design Committee Flow**: Plan the general progression of debate
4. **Prepare Crisis Materials** (if crisis committee): Develop crisis arcs and updates
5. **Coordinate with Co-Chair/Director**: Establish roles and communication

### During the Conference
1. **Maintain Order**: Ensure debate proceeds smoothly and respectfully
2. **Apply Rules Fairly**: Be consistent in rulings and decisions
3. **Manage Time**: Keep the committee on schedule
4. **Facilitate Participation**: Ensure all delegates have the opportunity to speak
5. **Process Documents**: Review and approve working papers and draft resolutions
6. **Evaluate Performance**: Take notes for awards consideration

## The Chair's Authority

The Chair has significant authority within the committee:
- **Recognize speakers**: Decide who speaks and when
- **Rule on procedure**: Make binding decisions on procedural questions
- **Set speaking time**: Determine default and modified speaking times
- **Manage the speakers list**: Add, remove, and reorder speakers
- **Suspend or adjourn**: Pause or end sessions
- **Enforce decorum**: Remind delegates of proper conduct

## The Chair's Limitations

The Chair must NOT:
- **Show bias**: Treat all delegates equally regardless of personal relationships
- **Influence content**: The Chair should not steer debate toward specific outcomes
- **Override valid motions**: If a motion is properly made, it must be considered
- **Participate in debate**: The Chair speaks only to manage procedure
- **Make up rules**: Apply the established Rules of Procedure consistently

## Working with a Co-Chair

If your committee has a Co-Chair or Director:
- **Divide responsibilities**: Who handles what (speakers list vs. documents vs. crisis)
- **Communicate constantly**: Brief each other on developments
- **Present a united front**: Never disagree publicly—discuss privately
- **Alternate roles**: Share the gavel to give both experience
- **Support each other**: Step in when the other needs help

## Pre-Session Checklist

Before each session:
- [ ] Review the day's agenda and time allocation
- [ ] Confirm all materials are ready (background guides, placards, notepads)
- [ ] Test any technology (microphones, projectors)
- [ ] Brief the rapporteur/secretary on their responsibilities
- [ ] Review any overnight developments (crisis committees)
- [ ] Set up the dais and committee room
- [ ] Prepare roll call

## The First 15 Minutes

The opening of committee sets the tone:
1. **Call to order**: Gavel the session to begin
2. **Roll call**: Take attendance of all member states
3. **Set the agenda**: If multiple topics, motion to set the agenda
4. **Opening statements**: Brief welcome and overview
5. **Open the speakers list**: Begin substantive debate

Your demeanor in these first minutes tells delegates what kind of chair you are—professional, organized, and fair.`,
        type: "reading",
        duration: 25,
        order: 1,
      },
      {
        courseId: course7.id,
        title: "Ruling on Points and Motions",
        content: `# Ruling on Points and Motions

The Chair's most visible role is ruling on points and motions. This lesson provides a comprehensive guide to handling parliamentary situations.

## Handling Points

### Point of Order
When a delegate raises a Point of Order:
1. **Listen carefully** to the delegate's concern
2. **Determine** if a procedural error has occurred
3. **Rule immediately**: Either sustain (agree) or overrule (disagree)
4. **Explain briefly**: "The point is well taken/not well taken because..."
5. **Resume debate**: Move on quickly

**Common Points of Order:**
- "The delegate is discussing a topic not currently on the floor"
- "The delegate's speaking time has expired"
- "The Chair did not follow proper voting procedure"

### Point of Parliamentary Inquiry
When a delegate raises a Point of Parliamentary Inquiry:
1. **Listen** to the question
2. **Answer clearly** with the relevant rule
3. **Do not debate**: Just state the rule
4. **If unsure**: "The Chair will take that under advisement and rule shortly"

**Common Parliamentary Inquiries:**
- "Is it in order to motion for a moderated caucus at this time?"
- "How many signatories are needed for a draft resolution?"
- "What is the required majority for this vote?"

### Point of Personal Privilege
When a delegate raises a Point of Personal Privilege:
1. **Address the concern** if reasonable
2. **Common concerns**: Can't hear, room too hot/cold, need break
3. **Be responsive**: These are about delegate comfort and should be addressed

## Handling Motions

### Motion for Moderated Caucus
1. **Hear the motion**: "The delegate of [Country] motions for a [duration] moderated caucus, [speaking time] per delegate, on the topic of [sub-topic]"
2. **Check for second**: "Is there a second?" (Some conferences require this)
3. **Vote if necessary**: If multiple motions, vote on the most extreme first
4. **Announce**: "The motion passes/fails. We are now in moderated caucus on [topic]. Delegates wishing to speak, please raise your placards."

### Motion for Unmoderated Caucus
1. **Hear the motion**: "The delegate of [Country] motions for a [duration] unmoderated caucus"
2. **Typically passes**: These are almost always granted
3. **Announce**: "The motion passes. The committee is now in unmoderated caucus for [duration]. Delegates may leave their seats."

### Motion to Close Debate (Previous Question)
1. **Hear the motion**: "The delegate of [Country] motions to close debate on [topic/resolution]"
2. **Two speakers**: Typically one for, one against
3. **Vote**: Requires 2/3 majority in most conferences
4. **If passes**: Move immediately to voting procedure
5. **If fails**: Debate continues

### Multiple Motions on the Floor
When several delegates make motions simultaneously:
1. **Rank by precedence**: Procedural motions before subsidiary motions
2. **Most extreme first**: For caucus motions, vote on longest duration/largest first
3. **If same type**: Vote on each in order proposed
4. **State clearly**: "We will vote on each motion in order of precedence"

## Difficult Rulings

### When Delegates Challenge Your Ruling
- Remain calm and professional
- If the challenge has merit, reconsider
- If not, firmly but politely stand your ground
- "The Chair's ruling stands. The delegate may submit a written appeal if they wish."

### When You're Unsure
- It's okay to pause and consult your Rules of Procedure
- "The Chair will take a brief moment to consult the rules"
- When in doubt, err on the side of allowing debate
- Consult your Co-Chair or Secretariat for guidance`,
        type: "reading",
        duration: 25,
        order: 2,
      },
      {
        courseId: course7.id,
        title: "Managing Committee Dynamics",
        content: `# Managing Committee Dynamics

A skilled Chair doesn't just enforce rules—they shape the committee experience. This lesson covers managing difficult situations and creating an inclusive environment.

## Encouraging Participation

### The Quiet Delegate Problem
Some delegates rarely speak. As Chair, you can:
- **Directly invite participation**: "Does any delegate who hasn't spoken yet wish to be added to the speakers list?"
- **Recognize new speakers first**: Prioritize delegates who haven't spoken
- **Create smaller settings**: Short moderated caucuses with brief speaking times give more people chances
- **Use round-robin**: Go around the room so everyone speaks in turn
- **Approach privately**: During unmoderated caucus, encourage quiet delegates personally

### The Dominant Delegate Problem
Some delegates speak too much. As Chair, you can:
- **Enforce speaking times strictly**: Use a timer and cut off when time expires
- **Recognize others first**: "The delegate has spoken several times; let's hear from others"
- **Set expectations**: "The Chair will prioritize recognizing delegates who haven't spoken on this point"
- **Use moderated caucuses**: Limited speaking time naturally limits dominance

## Managing Conflict

### Between Delegates
When delegates clash:
- **Stay neutral**: Don't take sides
- **Enforce decorum**: Remind delegates of respectful language
- **Channel conflict productively**: "The delegates clearly have strong views—perhaps a moderated caucus on this specific point would be helpful"
- **Intervene if personal**: "Delegates, please address the substance, not each other"

### When a Delegate Becomes Disruptive
1. **Verbal warning**: "The delegate will please maintain proper decorum"
2. **Formal warning**: "This is the Chair's formal warning. Further disruptions will result in removal from the committee"
3. **Removal**: If behavior continues, ask the delegate to leave and consult the Secretariat

## Inclusive Chairing

### Cultural Sensitivity
- Be aware that delegates come from different cultural backgrounds
- Some cultures value indirect communication—don't penalize subtlety
- English may not be a first language—be patient with language barriers
- Avoid idioms that may not translate across cultures

### Gender Inclusivity
- Use gender-neutral language when possible
- Ensure equitable speaking opportunities
- Address any inappropriate comments immediately

### Accessibility
- Ensure the committee room is accessible
- Accommodate delegates with disabilities
- Speak clearly and face the committee
- Provide materials in advance when possible

## Time Management

### Creating a Session Plan
Allocate time for each phase of debate:
| Phase | Typical Time | Activity |
|-------|-------------|----------|
| Opening | 15 min | Roll call, agenda setting |
| General Debate | 60-90 min | Speakers list |
| Substantive Debate | 60-120 min | Moderated caucuses |
| Working Papers | 30-45 min | Introduction and discussion |
| Draft Resolutions | 45-60 min | Introduction and debate |
| Amendments | 30-45 min | Debate and vote |
| Voting | 15-30 min | Final vote on resolutions |
| Closing | 10 min | Announcements, awards |

### When Running Behind
- Shorten moderated caucus times
- Limit number of speakers per caucus
- Combine similar sub-topics
- Announce: "Given time constraints, the Chair will limit each delegate to one statement"

### When Ahead of Schedule
- Extend moderated caucus times
- Add additional sub-topics for discussion
- Allow more speakers per round
- Use the time for quality debate rather than rushing through`,
        type: "reading",
        duration: 25,
        order: 3,
      },
      {
        courseId: course7.id,
        title: "Document Processing and Awards",
        content: `# Document Processing and Awards

Managing working papers, draft resolutions, and evaluating delegates for awards are key chair responsibilities.

## Document Processing

### Working Papers
A working paper is a preliminary document outlining ideas:
1. **Receive**: The sponsoring delegates submit the working paper
2. **Review format**: Check for basic formatting (no strict requirements)
3. **Assign number**: "Working Paper 1.1"
4. **Introduce**: Allow sponsors to present the working paper to the committee
5. **Discussion**: Delegates may ask questions and discuss

### Draft Resolutions
A draft resolution follows strict formatting rules:
1. **Receive**: Submitted by sponsors with required signatories
2. **Review format**: Check proper structure (heading, preambular, operative clauses)
3. **Check signatories**: Ensure minimum number of signatories (varies by conference)
4. **Assign number**: "Draft Resolution 1.1"
5. **Distribute**: Share with all delegates
6. **Introduce**: Sponsors read the resolution aloud
7. **Debate**: Formal debate on the resolution

### Common Format Issues to Check
- Proper preambular phrase usage
- Operative clauses numbered and ending with proper punctuation
- Correct formatting of the heading
- No contradictory clauses
- Signatories listed correctly
- No first-person language

## Amendment Processing
1. **Receive written amendment** from submitting delegate
2. **Check format**: Clearly specifies which clause, what changes
3. **Determine type**: Friendly (all sponsors agree) or unfriendly
4. **Announce**: Read the amendment to the committee
5. **Process**: Friendly amendments automatically incorporated; unfriendly require debate and vote

## Awards Evaluation

### What to Evaluate
- **Diplomacy**: Building consensus, negotiating effectively
- **Public Speaking**: Quality of speeches, persuasiveness
- **Knowledge**: Understanding of topic and country position
- **Leadership**: Guiding blocs, mediating disputes
- **Creativity**: Innovative solutions, strategic thinking
- **Collaboration**: Working with others constructively
- **Rules of Procedure**: Using procedure strategically and correctly

### Taking Notes
Keep a running evaluation sheet:
- Note standout moments for each delegate
- Track participation frequency and quality
- Record contributions to resolution writing
- Note diplomatic skill in negotiations
- Track who built bridges vs. created unnecessary conflict

### Common Awards (in order of prestige)
1. **Best Delegate**: Overall excellence across all criteria
2. **Outstanding Delegate**: Exceptional performance in most areas
3. **Honourable Mention**: Strong performance with notable contributions
4. **Best Position Paper**: Research and writing quality (may be pre-judged)

### Fairness in Awards
- Consider all delegates, not just the loudest
- Quiet delegates who make significant contributions deserve recognition
- The "best" delegate isn't always the most vocal
- Cultural differences in communication style should be considered
- Awards should reflect genuine merit, not favoritism`,
        type: "reading",
        duration: 25,
        order: 4,
      },
    ],
  })

  // Course 8: Secretary-General Leadership
  const course8 = await prisma.course.create({
    data: {
      title: "Secretary-General Leadership Program",
      description: "The ultimate MUN leadership course. Learn to organize and run entire conferences, manage teams, handle crises, build partnerships, and create transformative MUN experiences.",
      category: "Leadership",
      difficulty: "EXPERT",
      xpReward: 200,
      targetRole: "SECRETARY_GENERAL",
      order: 8,
      isPublished: true,
      duration: 240,
    },
  })
  await prisma.lesson.createMany({
    data: [
      {
        courseId: course8.id,
        title: "Conference Planning and Organization",
        content: `# Conference Planning and Organization

As Secretary-General, you are responsible for the entire conference experience. This lesson covers the comprehensive planning process.

## The Conference Planning Timeline

### 6-12 Months Before
- **Form the Secretariat team**: Secretary-General, Director-General, Under-Secretaries-General
- **Select conference dates and venue**: Consider school calendar, competing events
- **Define conference theme and committees**: Choose timely, engaging topics
- **Set budget**: Venue, materials, catering, technology, awards
- **Begin recruitment**: Chairs, crisis staff, administrative staff

### 4-6 Months Before
- **Open delegate registration**: Create registration system, set fees
- **Assign chairs to committees**: Match expertise to committee topics
- **Background guide production**: Chairs begin research and writing
- **School outreach**: Invite schools, send promotional materials
- **Secure sponsors and partnerships**: Universities, organizations, companies

### 2-4 Months Before
- **Finalize background guides**: Review, edit, and distribute
- **Country matrix assignment**: Allocate countries to schools based on delegation size
- **Plan social events**: Opening ceremony, delegate dance, closing ceremony
- **Coordinate logistics**: Transportation, meals, signage, technology
- **Train staff**: Chair training, crisis staff training, admin training

### 2-4 Weeks Before
- **Final delegate preparation**: Send delegate guides, rules of procedure
- **Prepare all materials**: Placards, notepads, resolution paper, voting cards
- **Technology check**: Microphones, projectors, delegate management software
- **Emergency planning**: First aid, crisis protocols, weather contingencies
- **Staff briefings**: Final preparation meetings

### Conference Weekend
- **Day 1**: Registration, opening ceremony, first committee sessions
- **Day 2**: Full committee sessions, social events
- **Day 3**: Final sessions, closing ceremony, awards

## Committee Selection

Choose committees that:
1. **Balance difficulty**: Mix GA, specialized, and crisis committees
2. **Reflect current events**: Timely topics generate more engagement
3. **Vary in size**: Small (15-20), medium (30-50), large (100+)
4. **Offer different experiences**: Debate, crisis, court, press

## Budget Management

### Revenue Sources
- Delegate registration fees
- School delegation fees
- Sponsorships
- Merchandise sales
- Grant funding

### Major Expenses
- Venue rental
- Food and catering
- Printing and materials
- Technology and A/V
- Awards and certificates
- Insurance and permits
- Staff expenses

### Tips
- Always have a 10-15% contingency fund
- Negotiate venue costs early
- Consider university venues (often cheaper)
- Digital programs save printing costs
- Seek in-kind sponsorships (food, venue, printing)

## Team Management

### The Secretariat Structure
- **Secretary-General**: Overall leadership and vision
- **Director-General**: Operations and logistics
- **USG for Committees**: Oversees all chairs and committee content
- **USG for Delegate Affairs**: Registration, delegate experience
- **USG for Logistics**: Venue, technology, materials
- **USG for External Relations**: Sponsors, media, partnerships

### Leadership Principles
1. **Delegate effectively**: Trust your team to execute
2. **Communicate constantly**: Weekly meetings, shared documents, clear timelines
3. **Set high standards**: Excellence requires expectation-setting
4. **Be supportive**: Your team is volunteering their time
5. **Lead by example**: Be the hardest worker in the room`,
        type: "reading",
        duration: 30,
        order: 1,
      },
      {
        courseId: course8.id,
        title: "Secretariat Team Management",
        content: `# Secretariat Team Management

Managing a team of 20-100+ staff members requires distinct leadership skills. This lesson covers building, motivating, and leading your Secretariat.

## Building Your Team

### Recruitment
- Start with a core team of trusted, experienced MUN participants
- Hold formal interviews for senior positions (Chairs, USGs)
- Look for reliability and commitment, not just MUN experience
- Diversify your team—different perspectives improve the conference
- Set clear expectations during recruitment (time commitment, responsibilities)

### Team Structure
Define clear roles and reporting lines:
\`\`\`
Secretary-General
├── Director-General
├── USG Committees
│   ├── GA Chairs
│   ├── Specialized Committee Chairs
│   └── Crisis Directors
├── USG Delegate Affairs
│   ├── Registration Team
│   └── Hospitality Team
├── USG Logistics
│   ├── Venue Management
│   ├── Technology Team
│   └── Materials/Printing
└── USG External Relations
    ├── Sponsorship Team
    └── Media/Communications
\`\`\`

## Communication Systems

### Regular Meetings
- **Weekly Secretariat meetings**: All USGs attend
- **Bi-weekly department meetings**: Within each department
- **Monthly all-staff meetings**: Entire team together

### Communication Tools
- Group messaging (WhatsApp, Slack, Discord)
- Shared document system (Google Drive, Notion)
- Project management (Trello, Asana)
- Email for formal communications

### Communication Norms
- Respond to messages within 24 hours
- Escalate issues, don't hide them
- Share progress updates proactively
- Document important decisions

## Motivation and Morale

### Keeping the Team Engaged
- **Purpose**: Remind everyone why MUN matters—the impact on delegates
- **Recognition**: Acknowledge good work publicly
- **Growth**: Provide opportunities for skill development
- **Community**: Build social bonds through team events
- **Autonomy**: Give people ownership of their areas

### Dealing with Underperformance
1. **Private conversation**: Understand the root cause
2. **Reset expectations**: Clarify what's needed
3. **Provide support**: Remove obstacles, offer help
4. **Set timeline**: When will improvement be visible?
5. **Have a backup plan**: If the person can't deliver, you need alternatives

## Conflict Resolution

### Between Staff Members
- Address conflicts early—don't let them fester
- Meet with each person individually, then together
- Focus on behavior and impact, not personality
- Find solutions that preserve the working relationship
- If irreconcilable, restructure roles to minimize interaction

### Between Staff and Delegates
- Always support your staff in public
- Address valid delegate concerns privately
- If staff was wrong, correct quietly and coach
- If delegate was wrong, enforce conference policies

## Crisis Leadership

During the conference, things WILL go wrong:
- **Stay calm**: Your team takes cues from your demeanor
- **Gather facts**: Don't react to rumors
- **Decide quickly**: Delayed decisions are often worse than imperfect ones
- **Communicate**: Tell your team what's happening and what to do
- **Debrief later**: Learn from every crisis

## The SG's Personal Preparation

- Get enough sleep (seriously)
- Eat properly during the conference
- Have a "battle buddy" (DG or trusted USG)
- Schedule 15-minute breaks for yourself
- Remember: It's supposed to be fun!`,
        type: "reading",
        duration: 25,
        order: 2,
      },
      {
        courseId: course8.id,
        title: "Crisis Management for Conference Leadership",
        content: `# Crisis Management for Conference Leadership

As Secretary-General, you are the ultimate problem-solver. This lesson covers handling real-world crises that can occur during MUN conferences.

## Types of Conference Crises

### Logistical Crises
- **Venue problems**: Double booking, HVAC failure, power outage
- **Technology failures**: WiFi down, projector broken, microphone malfunction
- **Catering issues**: Food not delivered, dietary restrictions not met
- **Transportation**: Delegates stuck in traffic, buses delayed
- **Material shortages**: Not enough placards, resolution paper, name tags

### People Crises
- **Medical emergencies**: Fainting, allergic reactions, injuries
- **Behavioral issues**: Delegate misconduct, disruptive behavior, substance use
- **No-shows**: Key staff missing, fewer delegates than expected
- **Conflicts**: Delegates fighting, parent complaints, school advisor issues

### Content Crises
- **Chair incapacity**: Chair becomes ill or can't continue
- **Background guide errors**: Incorrect information discovered
- **Country assignment conflicts**: Two schools assigned the same country
- **Procedural disputes**: Major disagreement about rules interpretation

## Crisis Response Framework

### The 4 A's

#### 1. Assess
- What exactly happened?
- Who is affected?
- How urgent is it? (Safety > Operations > Convenience)
- What resources do I have?

#### 2. Act
- Address immediate safety concerns first
- Make a decision—you can adjust later
- Delegate tasks to appropriate team members
- Implement the solution

#### 3. Announce
- Inform affected parties clearly and calmly
- Provide instructions on what to do
- Set expectations for resolution timeline
- Control the narrative—prevent rumors

#### 4. Adjust
- Monitor the situation
- Make adjustments as needed
- Document what happened for future reference
- Follow up with affected parties

## Specific Crisis Playbooks

### Medical Emergency
1. Call for first aid/medical support immediately
2. Clear the area around the person
3. Assign someone to meet emergency services at the entrance
4. Inform the school advisor
5. Continue conference operations in other rooms if possible
6. Follow up with the person and their family

### Technology Failure
1. Switch to backup equipment if available
2. If no backup, adapt: Chairs can manage without projectors
3. Use mobile hotspots if WiFi fails
4. Communicate to delegates that there may be delays
5. Most committee work doesn't require technology

### Chair Emergency
1. The Co-Chair takes over immediately
2. If no Co-Chair, the most experienced delegate can chair pro tempore
3. Contact USG for Committees to find a replacement
4. Brief the replacement chair on committee status
5. If necessary, merge with another committee temporarily

### Severe Weather
1. Monitor weather alerts throughout the conference
2. Have a shelter-in-place plan for the venue
3. Communicate with school advisors about dismissal plans
4. If conditions are dangerous, cancel sessions and ensure everyone is safe
5. Safety always comes first—no conference is worth risking lives

## Prevention

Many crises can be prevented:
- **Backup plans**: Have alternatives for every critical component
- **Redundancy**: Extra equipment, extra staff, extra materials
- **Testing**: Test all technology before the conference
- **Briefings**: Ensure all staff know emergency procedures
- **Communication**: Clear channels for reporting problems quickly
- **Insurance**: Always have event insurance`,
        type: "reading",
        duration: 25,
        order: 3,
      },
      {
        courseId: course8.id,
        title: "Building a Lasting MUN Legacy",
        content: `# Building a Lasting MUN Legacy

The best Secretary-Generals don't just run a great conference—they build programs that endure and grow. This lesson covers sustainable conference development.

## Institutional Knowledge

### Documentation
Create comprehensive records that future teams can use:
- **Conference handbook**: Step-by-step guide for organizing the conference
- **Timeline template**: Detailed planning schedule with milestones
- **Budget template**: Spreadsheet with actual costs and revenue
- **Chair guidelines**: Standards for background guides and committee management
- **Logistics manual**: Venue requirements, vendor contacts, technology specs
- **Post-conference report**: What worked, what didn't, recommendations

### Transition
- Start training your successor during the current conference
- Hold formal handover meetings with documentation
- Introduce your team to key contacts and partners
- Be available for questions after your tenure
- Create a continuity file with critical information

## Program Growth

### Expanding Participation
- **Outreach to new schools**: Present at teacher conferences, school visits
- **Beginner-friendly options**: Novice committees, training sessions
- **Scholarship program**: Financial aid for schools that can't afford fees
- **Middle school track**: Start students earlier
- **Online/hybrid options**: Expand geographic reach

### Quality Improvement
- **Delegate feedback**: Survey after every conference
- **Staff debrief**: Honest evaluation of what could improve
- **Benchmark**: Compare with other conferences (HMUN, NHSMUN, etc.)
- **Innovation**: Try new committee formats, technology, or experiences
- **Professional development**: Train staff through workshops and resources

### Building Partnerships
- **University partnerships**: Host conferences at universities
- **NGO collaborations**: Partner with organizations related to your topics
- **Corporate sponsors**: Businesses interested in youth leadership
- **Government support**: Education ministries, diplomatic missions
- **Media coverage**: Local newspapers, social media, school publications

## The MUN Ecosystem

### Alumni Network
- Create a database of MUN alumni
- Host alumni events and reunions
- Alumni can serve as guest speakers, judges, or mentors
- Alumni connections help with university applications and career networking

### Training Pipeline
- **Middle school program**: Introduction to MUN
- **High school program**: Regular conferences and training
- **Leadership track**: Chair training, Secretariat development
- **Mentorship**: Pair experienced delegates with newcomers

## Impact Measurement

### Quantitative Metrics
- Number of delegates and schools
- Geographic diversity of participants
- Resolution passage rate
- Post-conference survey scores
- Year-over-year growth rate
- Budget sustainability

### Qualitative Impact
- Delegate skill development (pre/post assessment)
- School advisor satisfaction
- Staff member growth and development
- Community engagement and awareness
- Long-term alumni outcomes

## The Personal Legacy

Your legacy as Secretary-General isn't just the conference itself—it's:
- The delegates whose interest in global affairs you sparked
- The staff members you mentored into leaders
- The institutional knowledge you created and preserved
- The culture of excellence and inclusion you established
- The next generation of MUN leaders you inspired

Remember: The goal is not to create a conference that depends on you—it's to build a program that thrives beyond your involvement.`,
        type: "reading",
        duration: 25,
        order: 4,
      },
      {
        courseId: course8.id,
        title: "Post-Conference Operations",
        content: `# Post-Conference Operations

The conference doesn't end when delegates go home. Proper post-conference operations ensure sustainability and continuous improvement.

## Immediate Post-Conference (Days 1-3)

### Wrap-Up
- **Thank your team**: Personal messages to every staff member
- **Clean up**: Return all venue items, collect lost and found
- **Financial reconciliation**: Collect all outstanding payments, reconcile budget
- **Secure data**: Back up registration data, delegate feedback, documents

### Communication
- **Thank delegates and advisors**: Email with highlights and photos
- **Share awards**: Publish results on website/social media
- **Address complaints**: Respond to any issues raised during the conference

## Short-Term Follow-Up (Days 4-30)

### Evaluation
- **Send surveys**: To delegates, advisors, and staff
- **Collect feedback**: On every aspect—content, logistics, experience
- **Analyze data**: Identify patterns and key improvement areas
- **Staff debrief**: Meeting to discuss what worked and what didn't

### Financial Close-Out
- **Final budget**: Complete accounting of all income and expenses
- **Pay all vendors**: Settle outstanding invoices promptly
- **Refund deposits**: Return any security deposits
- **Sponsor reports**: Provide impact reports to sponsors

### Content Preservation
- **Save all resolutions**: Archive committee documents
- **Save background guides**: For future reference and improvement
- **Record awards**: Maintain a historical record
- **Photos and videos**: Organize and share on social media/website

## Long-Term Development (Months 1-6)

### Conference Report
Create a comprehensive report including:
- Attendance statistics
- Budget summary
- Survey results and analysis
- Notable achievements
- Challenges and how they were addressed
- Specific recommendations for next year

### Succession Planning
- **Identify future leaders**: Who showed potential during the conference?
- **Begin training**: Involve next year's team in planning early
- **Hand over documentation**: Ensure nothing is lost in transition
- **Set up transition meetings**: Regular handover sessions

### Continuous Improvement
Based on feedback and analysis:
- **Address top 3 complaints**: Fix the most impactful issues
- **Build on strengths**: Amplify what delegates loved
- **Innovate**: Try at least one new thing each year
- **Raise the bar**: Set higher standards for the next conference

## Building Community Year-Round

- **Monthly MUN meetings**: Keep the club active
- **Training workshops**: Regular skill development sessions
- **Mini-conferences**: Smaller events throughout the year
- **Social events**: Build team cohesion
- **Community service**: Connect MUN skills to real-world impact
- **Online engagement**: Social media, newsletters, discussion groups`,
        type: "reading",
        duration: 20,
        order: 5,
      },
    ],
  })

  // ============================
  // SEED SAMPLE CONFERENCE DATA
  // ============================
  console.log("🏛️ Seeding conferences...")
  const conference1 = await prisma.conference.create({
    data: {
      name: "DiplomatiQ MUN 2026",
      description: "The flagship Model United Nations conference organized by DiplomatiQ. Featuring 8 committees covering global challenges from security to sustainability.",
      startDate: new Date("2026-10-15"),
      endDate: new Date("2026-10-17"),
      location: "Dubai World Trade Centre, Dubai, UAE",
      status: "REGISTRATION_OPEN",
      theme: "Bridging Divides: Diplomacy in a Fragmented World",
      schoolId: school1.id,
      website: "https://diplomatiqmun.org",
    },
  })

  const conference2 = await prisma.conference.create({
    data: {
      name: "Abu Dhabi Youth MUN",
      description: "A premier youth MUN conference bringing together students from across the UAE to debate pressing global issues.",
      startDate: new Date("2026-11-20"),
      endDate: new Date("2026-11-22"),
      location: "Emirates Palace, Abu Dhabi, UAE",
      status: "REGISTRATION_OPEN",
      theme: "Sustainable Futures: Empowering the Next Generation",
      schoolId: school3.id,
    },
  })

  const conference3 = await prisma.conference.create({
    data: {
      name: "GEMS Global Affairs Summit",
      description: "An intensive one-day MUN simulation focusing on crisis management and rapid response diplomacy.",
      startDate: new Date("2026-09-05"),
      endDate: new Date("2026-09-06"),
      location: "GEMS Wellington Academy, Dubai, UAE",
      status: "REGISTRATION_OPEN",
      theme: "Crisis and Cooperation: Navigating Global Emergencies",
      schoolId: school2.id,
    },
  })

  // Seed committees for conferences
  console.log("📋 Seeding committees...")
  await Promise.all([
    prisma.committee.create({
      data: {
        name: "General Assembly - First Committee (Disarmament)",
        description: "The First Committee deals with disarmament, global challenges, and threats to peace that affect the international community.",
        type: "DISARMAMENT_COMMITTEE",
        topic: "Nuclear Disarmament and Non-Proliferation in the Middle East",
        topicDescription: "Addressing nuclear weapons programs and establishing a nuclear-weapon-free zone in the Middle East.",
        countryLimit: 50,
        conferenceId: conference1.id,
      },
    }),
    prisma.committee.create({
      data: {
        name: "Security Council",
        description: "The UN Security Council has primary responsibility for maintaining international peace and security.",
        type: "SECURITY_COUNCIL",
        topic: "The Situation in the South China Sea",
        topicDescription: "Addressing territorial disputes and freedom of navigation in the South China Sea.",
        countryLimit: 15,
        conferenceId: conference1.id,
      },
    }),
    prisma.committee.create({
      data: {
        name: "Human Rights Council",
        description: "The HRC is responsible for strengthening the promotion and protection of human rights around the globe.",
        type: "HUMAN_RIGHTS_COUNCIL",
        topic: "Protecting the Rights of Climate Refugees",
        topicDescription: "Developing international legal frameworks for people displaced by climate change.",
        countryLimit: 47,
        conferenceId: conference1.id,
      },
    }),
    prisma.committee.create({
      data: {
        name: "Crisis Committee: 1962 Cuban Missile Crisis",
        description: "A historical crisis simulation of the most dangerous confrontation of the Cold War.",
        type: "CRISIS_COMMITTEE",
        topic: "The Cuban Missile Crisis",
        topicDescription: "Navigate the 13-day confrontation between the US and Soviet Union over Soviet missiles in Cuba.",
        countryLimit: 20,
        conferenceId: conference1.id,
      },
    }),
    prisma.committee.create({
      data: {
        name: "ECOSOC",
        description: "The Economic and Social Council coordinates the economic and social fields of the organization.",
        type: "ECOSOC",
        topic: "Financing for Sustainable Development",
        topicDescription: "Mobilizing resources and creating innovative financing mechanisms for the 2030 Agenda.",
        countryLimit: 54,
        conferenceId: conference1.id,
      },
    }),
    prisma.committee.create({
      data: {
        name: "WHO - World Health Assembly",
        description: "The decision-making body of WHO, setting global health priorities and standards.",
        type: "WORLD_HEALTH_ASSEMBLY",
        topic: "Global Preparedness for Pandemic Outbreaks",
        topicDescription: "Strengthening international health regulations and early warning systems.",
        countryLimit: 40,
        conferenceId: conference2.id,
      },
    }),
    prisma.committee.create({
      data: {
        name: "Historical Security Council: 1994 Rwanda",
        description: "A historical simulation examining the international response to the Rwandan genocide.",
        type: "HISTORICAL_COMMITTEE",
        topic: "The Crisis in Rwanda",
        topicDescription: "Re-examining the Security Council's response to the genocide in Rwanda.",
        countryLimit: 15,
        conferenceId: conference2.id,
      },
    }),
    prisma.committee.create({
      data: {
        name: "Crisis Committee: Global Cyberattack",
        description: "A contemporary crisis simulating a coordinated cyberattack on critical infrastructure.",
        type: "CRISIS_COMMITTEE",
        topic: "Global Cybersecurity Crisis",
        topicDescription: "Responding to a coordinated cyberattack targeting banking, power grids, and communications.",
        countryLimit: 20,
        conferenceId: conference3.id,
      },
    }),
  ])

  // ============================
  // SEED ADMIN USER
  // ============================
  console.log("👤 Seeding admin user...")
  const hashedPassword = await hash("Admin@2026", 12)
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@diplomatiq.org",
      name: "Admin User",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      country: "UAE",
      city: "Dubai",
      schoolId: school1.id,
      isActive: true,
      emailVerified: true,
    },
  })

  // Create admin subscription
  await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      tier: "SCHOOL_ENTERPRISE",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 12)),
    },
  })

  // Create sample student users
  console.log("👥 Seeding sample users...")
  const studentPassword = await hash("Student@2026", 12)
  const studentNames = [
    { name: "Fatima Al-Rashid", email: "fatima@school.ae", schoolId: school1.id, munRole: "DELEGATE" },
    { name: "Ahmed Hassan", email: "ahmed@school.ae", schoolId: school1.id, munRole: "CHAIR" },
    { name: "Sara Chen", email: "sara@school.ae", schoolId: school2.id, munRole: "DELEGATE_ADVANCED" },
    { name: "Omar Khalil", email: "omar@school.ae", schoolId: school3.id, munRole: "RAPPORTEUR" },
    { name: "Priya Sharma", email: "priya@school.ae", schoolId: school2.id, munRole: "SDG_AMBASSADOR" },
  ]

  for (const student of studentNames) {
    const studentUser = await prisma.user.create({
      data: {
        email: student.email,
        name: student.name,
        password: studentPassword,
        role: "STUDENT",
        munRole: student.munRole as never,
        country: "UAE",
        city: "Dubai",
        schoolId: student.schoolId,
        isActive: true,
        emailVerified: true,
      },
    })

    // Create delegate profile
    const randomXP = Math.floor(Math.random() * 500)
    await prisma.delegateProfile.create({
      data: {
        userId: studentUser.id,
        xp: randomXP,
        level: "OBSERVER" as never,
        streak: Math.floor(Math.random() * 14),
        longestStreak: Math.floor(Math.random() * 30),
        conferencesAttended: Math.floor(Math.random() * 5),
        committeesServed: Math.floor(Math.random() * 3),
        awardsReceived: Math.floor(Math.random() * 2),
        resolutionsWritten: Math.floor(Math.random() * 4),
        speechesDelivered: Math.floor(Math.random() * 15),
        lastActivityDate: new Date(),
      },
    })

    // Create subscription
    await prisma.subscription.create({
      data: {
        userId: studentUser.id,
        tier: "STUDENT_PRO",
        status: "TRIAL",
        trialStartsAt: new Date(),
        trialEndsAt: new Date(new Date().setDate(new Date().getDate() + 14)),
      },
    })

    // Award some badges
    const randomBadge = badges[Math.floor(Math.random() * badges.length)]
    if (randomBadge) {
      await prisma.userBadge.create({
        data: {
          userId: studentUser.id,
          badgeId: randomBadge.id,
        },
      })
    }
  }

  // Create sample teacher
  const teacherPassword = await hash("Teacher@2026", 12)
  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@school.ae",
      name: "Dr. Layla Mahmoud",
      password: teacherPassword,
      role: "TEACHER",
      country: "UAE",
      city: "Dubai",
      schoolId: school1.id,
      isActive: true,
      emailVerified: true,
    },
  })

  await prisma.subscription.create({
    data: {
      userId: teacherUser.id,
      tier: "TEACHER_PRO",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  console.log("✅ Seeding completed successfully!")
  console.log("📋 Sample accounts:")
  console.log("   Admin: admin@diplomatiq.org / Admin@2026")
  console.log("   Teacher: teacher@school.ae / Teacher@2026")
  console.log("   Student: fatima@school.ae / Student@2026")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
