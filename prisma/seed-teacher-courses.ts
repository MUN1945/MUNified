import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding teacher/director training courses...")

  // Check existing max order to avoid conflicts
  const existingCourses = await prisma.course.findMany({
    select: { order: true, title: true, targetRole: true },
    orderBy: { order: "asc" },
  })

  console.log(
    `📋 Found ${existingCourses.length} existing courses (max order: ${Math.max(...existingCourses.map((c) => c.order))})`
  )

  // Verify no TEACHER courses already exist
  const existingTeacherCourses = existingCourses.filter(
    (c) => c.targetRole === "TEACHER"
  )
  if (existingTeacherCourses.length > 0) {
    console.log(
      `⚠️  Found ${existingTeacherCourses.length} existing TEACHER courses. Skipping seed to avoid duplicates.`
    )
    console.log(
      `   Existing: ${existingTeacherCourses.map((c) => c.title).join(", ")}`
    )
    return
  }

  // ============================================================
  // COURSE 1: Director's Guide to MUN Program Setup
  // ============================================================
  const course1 = await prisma.course.create({
    data: {
      title: "Director's Guide to MUN Program Setup",
      description:
        "Everything you need to launch and sustain a thriving Model United Nations program at your school. From winning administrative buy-in to building a legacy that outlasts you — this course is your comprehensive roadmap for creating a MUN program from the ground up.",
      category: "Director",
      difficulty: "BEGINNER",
      xpReward: 150,
      targetRole: "TEACHER",
      order: 9,
      isPublished: true,
      duration: 130,
      lessons: {
        create: [
          {
            title: "Building Your MUN Program from Scratch",
            content: `## Starting a MUN Program: The Vision

Launching a Model United Nations program at your school is one of the most rewarding professional endeavors you can undertake. It transforms students into global thinkers, confident speakers, and collaborative leaders. But where do you begin?

### Getting Administrative Buy-In

Before you can recruit a single student, you need the support of your school's leadership. **This is the single most important step** — without it, nothing else matters.

1. **Prepare a proposal document** — Outline the educational value of MUN, alignment with your school's mission, projected costs, and expected enrollment. Include data: MUN participants show measurable improvements in critical thinking, public speaking, and research skills.

2. **Connect MUN to existing priorities** — If your school emphasizes global citizenship, 21st-century skills, or university preparation, position MUN as a direct contributor to those goals.

3. **Start small, think big** — Propose a pilot program with 15-20 students rather than a full-scale operation. Administrators are more likely to approve a low-risk trial.

4. **Identify a champion on the leadership team** — Find a vice-principal, head of secondary, or department head who sees the value. Their internal advocacy is priceless.

TIP: Create a one-page "MUN at a Glance" handout that answers the three questions administrators always ask: What does it cost? How much time does it take? What will students gain?

### Budget Planning

A MUN program requires investment, but it doesn't have to be expensive. Here's a realistic breakdown:

- **Essential costs**: Conference registration fees ($50-200 per delegate per conference), transportation, delegate supplies (placards, folders, name badges)
- **Recommended costs**: Training platform subscription (like DiplomatiQ), delegation polo shirts or blazers, awards for internal simulations
- **Optional costs**: Guest speaker honoraria, model conference hosting costs, travel to out-of-town conferences

KEY POINT: Most successful programs start with a budget of $500-1,500 for their first year and grow from there. Don't let budget constraints stop you — creativity and fundraising can bridge any gap.

### Recruiting Students

Your first cohort sets the tone for your entire program. Here's how to attract the right students:

1. **Host an info session** — Make it exciting. Show a short video of a real MUN committee in action. Have a former MUN delegate (even virtually) share their experience.
2. **Leverage existing classes** — Present to social studies, English, and debate classes. These students already have relevant skills.
3. **Create a sign-up form** — Ask about their interests, previous experience, and what they hope to gain. This helps you gauge commitment levels.
4. **Emphasize inclusivity** — MUN is not just for "smart kids" or "debate kids." It's for anyone willing to learn. Make that message clear.
5. **Use word of mouth** — Personal invitations work. Identify 5-10 students you think would thrive and ask them directly.

WARNING: Don't over-recruit for your first year. A manageable group of 15-20 committed students is far better than 40 casual participants. You can always expand later.

### Your First Meeting

The first meeting should accomplish three things: generate excitement, set expectations, and establish a routine. Plan a 45-minute session that includes a brief overview of MUN, a mini-activity (even a simple "represent your country and introduce yourself" exercise), and a clear schedule for future meetings.

CHECK: Before your first meeting, do you have: a confirmed meeting space, a semester schedule, a way to communicate with students (email list, group chat), and at least one conference identified for registration?

---`,
            type: "reading",
            duration: 25,
            order: 1,
            isPublished: true,
          },
          {
            title: "Structuring Your MUN Curriculum",
            content: `## Curriculum Design: The Blueprint for Learning

A MUN program without a structured curriculum is just a club. Transforming it into an educational experience requires intentional planning, clear learning objectives, and a progression that builds skills over time.

### Curriculum Mapping Fundamentals

Start by identifying what you want students to know and be able to do by the end of the program. Work backwards from those outcomes.

**Core Competency Areas:**
- Research and information literacy
- Parliamentary procedure and formal debate
- Public speaking and persuasion
- Diplomatic negotiation and coalition-building
- Resolution writing and formal documentation
- Global affairs awareness and country perspective-taking

### Aligning with Academic Standards

MUN naturally supports a wide range of academic standards. Document these connections — they strengthen your program's legitimacy and may unlock funding.

- **Social Studies/History**: Geopolitical analysis, international relations theory, historical context of UN bodies
- **English/Language Arts**: Argumentative writing, persuasive speaking, rhetorical analysis, formal register
- **Civics/Government**: Democratic processes, international law, diplomatic protocol
- **Science (via specialized committees)**: Climate policy, public health, technology governance

TIP: Create a "MUN Learning Standards Alignment" chart for your school's specific curriculum framework. Share it with administrators and department heads.

### Integration Models

There are three common approaches to integrating MUN into your school's academic structure:

1. **Co-Curricular (Most Common)**: MUN meets as an after-school activity or lunchtime club. Learning is supplementary but structured. This is the easiest model to launch.

2. **Cross-Curricular**: MUN skills are embedded into existing classes. The English teacher assigns position paper writing; the social studies teacher runs a mock Security Council session. This requires faculty collaboration but maximizes impact.

3. **Dedicated Course**: MUN is offered as a for-credit elective. This is the gold standard but requires the most administrative support and curriculum documentation.

### Semester vs. Year-Long Programs

**Semester-Long (16-18 weeks):**
- Weeks 1-4: Foundations — procedure, research skills, country assignment
- Weeks 5-8: Skill building — speaking, negotiation, resolution writing
- Weeks 9-12: Practice simulations — mini-committees, crisis scenarios
- Weeks 13-16: Conference preparation and attendance
- Weeks 17-18: Reflection and celebration

**Year-Long (32-36 weeks):**
- Quarter 1: Foundations and skill acquisition
- Quarter 2: Practice simulations and first conference
- Quarter 3: Advanced skills, leadership development, second conference
- Quarter 4: Internal conference hosting, mentorship, program reflection

KEY POINT: Year-long programs produce significantly stronger delegates because skills have time to consolidate through repeated practice. If you can only offer a semester program, consider extending with optional practice sessions.

### Differentiated Instruction

Not all students learn at the same pace. Build in differentiation:
- **Novice track**: Extra scaffolding on procedure, guided research templates, paired speaking opportunities
- **Intermediate track**: Independent research, leadership roles in practice sims, peer feedback responsibilities
- **Advanced track**: Chair training, crisis committee prep, mentoring younger delegates

CHECK: Does your curriculum include at least two practice simulations before the first conference? Students need the experience of a full committee session before facing the real thing.

---`,
            type: "reading",
            duration: 30,
            order: 2,
            isPublished: true,
          },
          {
            title: "Setting Up Conference Participation",
            content: `## The Conference Landscape: Finding Your Place

Conferences are the heart of the MUN experience. They are where classroom learning becomes real, where students test their skills against peers from other schools, and where lasting memories are made. Choosing the right conferences — and preparing for them properly — can make or break your program's first year.

### Choosing the Right Conferences

Not all conferences are created equal. For a new program, the right fit matters more than prestige.

**Factors to Consider:**
1. **Size** — Smaller conferences (50-150 delegates) are less intimidating for first-timers and offer more speaking opportunities per delegate
2. **Location** — Local conferences reduce costs and logistical complexity. Don't fly to your first conference.
3. **Difficulty level** — Some conferences explicitly welcome beginners. Look for "novice," "training," or "introductory" committees.
4. **Schedule compatibility** — Does the conference fall during exam season? A school holiday? Plan around your school calendar.
5. **Reputation** — Ask other MUN directors in your area about their experiences. Word of mouth is the most reliable guide.

### Registration Logistics

Conference registration typically involves:
- **School registration** — You register as a delegation, not as individuals. The director handles this.
- **Country assignments** — You'll request countries and committee placements for your delegates. Have a ranked preference list ready.
- **Delegate information forms** — Each student's name, committee preference, and any dietary/medical needs
- **Payment** — Registration fees vary widely ($25-200 per delegate). Many conferences offer early-bird discounts.
- **Permission slips** — Your school will likely require signed parental permission forms

TIP: Create a "Conference Registration Checklist" template at the start of the year. When registration opens, you'll be ready to move quickly — popular conferences fill up fast.

### Delegation Selection Criteria

When you have more interested students than conference spots, you need a fair selection process:

1. **Attendance and commitment** — Students who consistently attend meetings should be prioritized
2. **Skill readiness** — Use a simple rubric: Can they deliver a 1-minute speech? Do they understand basic procedure? Can they research independently?
3. **Effort and improvement** — A student who has grown significantly may deserve a spot over a naturally talented but inconsistent participant
4. **Role fit** — Match delegates to committees that suit their strengths (e.g., a strong writer for a resolution-heavy committee, a confident speaker for a debate-intensive one)

WARNING: Never select delegates based solely on grades or behavior in other classes. MUN rewards different strengths than traditional academics. Some of your best delegates will be students who struggle in conventional classroom settings.

### Fundraising Strategies

MUN can be expensive. Here are proven fundraising approaches:

- **School sponsorship** — Request partial or full funding from your school's activities budget
- **Parent contributions** — Many families are willing to pay conference fees when they understand the educational value
- **Corporate sponsorships** — Local businesses, especially those with international operations, may sponsor delegations
- **Bake sales and events** — Traditional but effective. A "MUN Cafe" at a school event can raise $200-500
- **Grant applications** — Many education foundations offer grants for extracurricular programs
- **Internal conference revenue** — Once you host your own conference (Year 2+), registration fees from visiting schools can fund future trips

KEY POINT: Be transparent about costs from the very first meeting. Families who understand the expenses upfront are more likely to support fundraising efforts. Create a clear fee schedule for the year.

CHECK: Have you identified at least one conference for each semester? Do you have a budget template that accounts for registration, transport, and meals?

---`,
            type: "reading",
            duration: 25,
            order: 3,
            isPublished: true,
          },
          {
            title: "Creating a Sustainable MUN Culture",
            content: `## Building a Program That Lasts

The difference between a MUN program that thrives for a decade and one that fizzles after two years isn't money or talent — it's culture. A sustainable MUN culture creates momentum that carries the program forward even when you, the director, step back.

### Building Tradition

Traditions give your program identity and create emotional investment. They're the things students look forward to and alumni remember fondly.

**Tradition Ideas:**
1. **The Delegation Dinner** — A special meal before each conference where delegates dress formally, review strategy, and build team spirit
2. **The Opening Ceremony** — A brief ritual at the start of each meeting that signals "this is MUN time" (a flag procession, a moment of reflection, a delegate oath)
3. **The Gavel Pass** — At the end-of-year ceremony, outgoing leaders pass a ceremonial gavel to incoming leaders, symbolizing the transfer of responsibility
4. **Country Selection Night** — A dramatic reveal of each delegate's assigned country for the upcoming conference
5. **The Delegate Wall** — A physical or digital display of every delegate who has represented your school, building a sense of belonging to something bigger

### Student Leadership Pipelines

The most sustainable programs are those run largely by student leaders, with the director as a guide rather than a driver.

**Leadership Structure:**
- **Secretary-General (Student)** — Overall program leader, runs meetings, represents the program
- **Under-Secretary-General** — Second-in-command, handles logistics and communications
- **Head Delegate** — Senior delegate who mentors newcomers and leads conference preparation
- **Committee Chairs (Students)** — Run internal practice simulations, develop chairing skills
- **Logistics Coordinator** — Manages supplies, registration paperwork, meeting space bookings

**Developing Leaders:**
1. Identify potential leaders early — look for initiative, reliability, and emotional intelligence
2. Give increasing responsibility each year — a Year 1 delegate should be a Year 2 mentor, a Year 3 leader
3. Provide explicit leadership training — running meetings, giving feedback, resolving conflicts
4. Let them fail safely — a student-run simulation that goes sideways is a better learning experience than a director-perfected one

TIP: Create a "Leadership Ladder" document that shows students the progression from new delegate to Secretary-General. When students can see a path, they're more likely to stay invested.

### Alumni Engagement

Your alumni are your program's greatest untapped resource.

**Ways to Engage Alumni:**
- **Guest coaching** — Alumni return to help prep delegates for specific conferences
- **Career panels** — Alumni share how MUN skills translated to university and career success
- **Social media ambassadors** — Alumni share program achievements, attracting new students and sponsors
- **Financial supporters** — Established alumni may contribute to a program fund
- **Conference staff** — Alumni can serve as chairs, judges, or crisis staff at conferences you attend or host

### School-Wide MUN Awareness

A MUN program that's invisible to the rest of the school misses opportunities for growth and support.

**Visibility Strategies:**
1. **Morning announcements** — Share conference results, award announcements, and upcoming events
2. **School newsletter features** — A monthly "MUN Spotlight" column with delegate interviews and photos
3. **Assembly presentations** — A 5-minute MUN demonstration at a school assembly (short moderated caucus on a fun topic)
4. **Open meeting days** — Once a semester, invite any student to observe a practice simulation
5. **Bulletin board** — A dedicated MUN display near the main entrance with photos, flags, and upcoming events

KEY POINT: The most successful MUN programs aren't exclusive clubs — they're inclusive communities that the whole school knows about and celebrates.

CHECK: Do you have at least one tradition planned for your first year? Have you identified 2-3 students who could take on leadership roles in Year 2? Is there a plan for communicating MUN activities to the broader school community?

---`,
            type: "reading",
            duration: 25,
            order: 4,
            isPublished: true,
          },
          {
            title: "First Year Toolkit: Your 90-Day Launch Plan",
            content: `## The 90-Day Launch Plan: Week by Week

Starting a MUN program can feel overwhelming. This lesson gives you a concrete, week-by-week plan for your first 90 days — from your first meeting to your first conference. Follow this roadmap and you'll build a program that's structured, sustainable, and successful.

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Kickoff Meeting**
- Host an exciting info session (45 minutes)
- Show a MUN video, share your vision, and have students sign up
- Distribute a "MUN Beginner's Guide" handout
- Assign each student a country to research for the next meeting
- Quick win: Every student introduces themselves as their assigned country

**Week 2: MUN Basics**
- Teach the three pillars: procedure, research, and diplomacy
- Run a simple "country introduction" round — each student speaks for 60 seconds as their country
- Explain the conference experience with photos and stories
- Quick win: Students can name the main UN bodies and explain what MUN is

**Week 3: Parliamentary Procedure Introduction**
- Teach the 5 most essential motions: Point of Order, Motion for Moderated Caucus, Motion for Unmoderated Caucus, Motion to Set Speaking Time, Motion to Close Debate
- Practice making motions in a simplified format
- Quick win: Every student successfully makes at least one motion during practice

**Week 4: Research Skills**
- Teach country research: government type, allies, key foreign policy positions
- Introduce the DiplomatiQ Research & Position Paper course as a resource
- Practice: Students present a 2-minute overview of their country's stance on a simple topic
- Quick win: Every student can articulate their country's general foreign policy orientation

### Phase 2: Skill Building (Weeks 5-8)

**Week 5: Public Speaking Workshop**
- Teach the SPEAK framework: State your point, Provide evidence, Explain relevance, Address counterarguments, Keep it concise
- Practice impromptu speaking: Give students a topic and 30 seconds of prep time
- Quick win: Every student delivers a 1-minute impromptu speech

**Week 6: Negotiation and Alliance-Building**
- Explain bloc politics: why countries form alliances and how to negotiate
- Run a 20-minute unmoderated caucus simulation
- Practice: Students form alliances and present a joint position
- Quick win: Students experience their first real negotiation

**Week 7: Resolution Writing Introduction**
- Teach resolution format: preamble clauses and operative clauses
- Practice writing a simple resolution as a group
- Quick win: The group collectively writes one complete resolution

**Week 8: Mini-Simulation**
- Run a full 60-minute practice simulation on a straightforward topic (e.g., "Access to Clean Water")
- Students use all skills learned so far
- Debrief: What worked? What was challenging?
- Quick win: Students complete their first full MUN simulation

### Phase 3: Conference Prep (Weeks 9-12)

**Week 9: Conference Registration and Country Assignment**
- Finalize conference registration and country assignments
- Distribute conference preparation packets
- Quick win: Every student knows their committee, country, and topic

**Week 10: Position Paper Writing**
- Teach position paper structure and purpose
- Students begin drafting their position papers
- Quick win: Every student has a position paper outline

**Week 11: Advanced Procedure and Strategy**
- Review complex motions and voting procedures
- Teach conference strategy: when to speak, when to form alliances, how to get into a resolution
- Run a second practice simulation with more advanced procedure
- Quick win: Students demonstrate strategic thinking during practice

**Week 12: Final Conference Prep**
- Finalize position papers
- Review conference logistics: schedule, dress code, what to bring
- Set personal goals for each delegate (not "win an award" but "speak 3 times" or "make 2 allies")
- Quick win: Every student feels prepared and excited

### Milestone Tracking

Track these milestones to ensure your program is on track:

1. ✅ 15+ students regularly attending meetings
2. ✅ Students can explain MUN procedure to a newcomer
3. ✅ Each student has delivered at least 3 speeches in practice
4. ✅ The group has completed at least 2 full simulations
5. ✅ Position papers are submitted before the conference
6. ✅ All logistics (registration, transport, permissions) are confirmed

WARNING: Don't expect perfection at your first conference. The goal is for students to have a positive experience and want to come back. Everything else is a bonus.

TIP: After the conference, hold a reflection session within one week while memories are fresh. Ask each student: What are you proud of? What would you do differently? What did you learn about yourself? These reflections are more valuable than any award.

---`,
            type: "reading",
            duration: 25,
            order: 5,
            isPublished: true,
          },
        ],
      },
    },
  })

  console.log(`✅ Course 1 created: "${course1.title}" with 5 lessons`)

  // ============================================================
  // COURSE 2: Observing & Mentoring Student Delegates
  // ============================================================
  const course2 = await prisma.course.create({
    data: {
      title: "Observing & Mentoring Student Delegates",
      description:
        "Learn the subtle art of watching your delegates in action, delivering feedback that actually changes behavior, and mentoring diverse personality types. This course transforms you from a chaperone into a coach who accelerates every delegate's growth.",
      category: "Director",
      difficulty: "INTERMEDIATE",
      xpReward: 130,
      targetRole: "TEACHER",
      order: 10,
      isPublished: true,
      duration: 110,
      lessons: {
        create: [
          {
            title: "The Art of Observation in Committee Sessions",
            content: `## Why Observation Matters

When your delegates are in committee, your role shifts from instructor to observer. But observation is not passive — it's an active, intentional practice that requires discipline and a framework. The best directors observe with purpose, capturing data that drives meaningful feedback and long-term growth.

### What to Look For

During committee sessions, focus your attention on these five dimensions:

**1. Verbal Participation**
- How often does the delegate raise their placard?
- Are they making motions, seconding others, or staying silent?
- Do they speak in moderated caucus or only in unmoderated?
- Is their speech substantive (policy-driven) or procedural (filling time)?

**2. Diplomatic Behavior**
- Who are they talking to during unmoderated caucus?
- Are they building coalitions or working alone?
- Do they approach others, or wait to be approached?
- How do they handle disagreements — with persuasion or aggression?

**3. Content Quality**
- Does their speech reflect actual research or generic statements?
- Do they reference their country's specific policies?
- Are they adapting their position based on the conversation?
- Do they contribute new ideas or repeat what others have said?

**4. Procedural Competence**
- Do they use correct parliamentary language?
- Are their motions appropriate and well-timed?
- Do they understand when to vote and how?
- Can they navigate Points (of Order, of Personal Privilege, of Inquiry) correctly?

**5. Emotional State**
- Do they appear confident, anxious, frustrated, or disengaged?
- How do they respond to setbacks (defeated motion, criticism, being ignored)?
- Are they having a positive social experience?

### When to Intervene

As a general rule, **do not intervene during committee sessions.** Delegates need to learn by doing, and your presence in the room should be as an observer, not a participant.

**Exceptions when you SHOULD intervene:**
- A delegate is visibly distressed (crying, panicking, or having a medical issue)
- Another delegate is being bullied or harassed
- A serious procedural violation is occurring that the chair doesn't catch
- A delegate asks you directly for help during a break

KEY POINT: The urge to intervene when your delegate is struggling is natural — but resist it. Struggle is part of the learning process. Your time to help is before and after the session, not during.

### Body Language Reading

Much of what you need to know about your delegates' experience isn't verbal — it's physical:

- **Leaning forward, making eye contact** — Engaged and confident
- **Slouched, looking at phone, avoiding eye contact** — Disengaged or discouraged
- **Fidgeting, looking around nervously** — Anxious but wants to participate
- **Arms crossed, jaw clenched** — Frustrated or defensive
- **Writing notes, whispering to neighbors constructively** — Strategically engaged

### Note-Taking Frameworks

Don't rely on memory. Use a structured observation template:

**The 3-2-1 Framework:**
- **3 things the delegate did well** — Be specific ("Made a strong motion for moderated caucus on the humanitarian sub-topic at 10:35am")
- **2 areas for improvement** — Also specific ("Could speak louder; position paper references were generic")
- **1 action item for next session** — Concrete and achievable ("Practice making at least one substantive speech in the next moderated caucus")

TIP: Use a small notebook or your phone's notes app to jot observations in real time. Date each entry and note the committee session context. Over a full conference, these notes become invaluable for post-conference feedback.

---`,
            type: "reading",
            duration: 25,
            order: 1,
            isPublished: true,
          },
          {
            title: "Providing Constructive Feedback That Sticks",
            content: `## The Feedback Challenge

Giving feedback to MUN delegates is an art. Too vague, and nothing changes. Too harsh, and confidence shatters. Too infrequent, and bad habits solidify. The best directors master the timing, delivery, and content of feedback to create lasting improvement.

### The Feedback Sandwich (And Why It's Just a Start)

The classic "sandwich" — positive, constructive, positive — is a decent starting point but has limitations. Delegates, especially teenagers, quickly learn to tune out the bread and only hear the filling. Use it as a baseline, then evolve.

**Better approach: The SPECIFIC Method**

- **S**ituation: Describe the specific moment ("During the moderated caucus on nuclear disarmament at 2:15pm...")
- **P**erformance: State what you observed objectively ("...you raised your placard three times but were not recognized before time expired")
- **E**motion: Acknowledge how it might have felt ("I can imagine that was frustrating")
- **C**onnection: Link to a broader skill or goal ("This is actually a common challenge — timing your placard raises to when the chair is most likely to select you")
- **I**nstruction: Provide a specific technique ("Try raising your placard the moment the previous speaker finishes their final sentence — the chair is scanning the room right at that moment")
- **F**orward: Set a goal for next time ("In tomorrow's session, try to be recognized at least once using this technique")
- **I**nquiry: Ask for their perspective ("How did it feel from your end? What was going through your mind?")
- **C**elebrate: End with genuine encouragement ("Your speeches are getting noticeably stronger — keep it up")

### Specific vs. Vague Praise

Vague praise feels good for five seconds but teaches nothing. Specific praise teaches AND motivates.

**Vague:** "Good job in committee today!"
**Specific:** "Your speech on humanitarian aid was excellent — the way you cited the WHO statistic and then connected it to your country's experience with the 2023 floods made it memorable and credible."

**Vague:** "You're really improving."
**Specific:** "Last conference, you didn't raise your placard once during moderated caucus. Today, you spoke three times, and your second speech had the whole room listening. That's real growth."

### Timing of Feedback

**Immediate feedback** (within 1-2 hours):
- Best for: Procedural corrections, tactical adjustments, confidence boosts
- During conference breaks or right after a session ends
- Keep it brief — one or two points maximum

**Delayed feedback** (within 24-48 hours):
- Best for: Strategic observations, behavioral patterns, skill development goals
- After the conference day, during a debrief session
- More comprehensive and reflective

**Seasonal feedback** (every 4-6 weeks):
- Best for: Long-term growth tracking, goal setting, program-level patterns
- Scheduled one-on-one meetings with each delegate
- Compare observations across multiple conferences

### Written vs. Verbal Feedback

**Verbal feedback** is better for:
- Immediate course corrections
- Emotional support and encouragement
- Collaborative problem-solving

**Written feedback** is better for:
- Detailed observations that are hard to absorb verbally
- Reference material for goal-setting
- Documentation of progress over time
- Sharing with parents (when appropriate)

TIP: After each conference, send each delegate a brief written feedback message (2-3 paragraphs). Students treasure these messages and often re-read them before future conferences.

KEY POINT: The most impactful feedback you can give is not about what they did wrong — it's about what they're capable of that they haven't realized yet. "I noticed you had an idea during unmoderated caucus but held back. I think your insight was valuable and worth sharing with the group. What held you back?"

---`,
            type: "reading",
            duration: 30,
            order: 2,
            isPublished: true,
          },
          {
            title: "Mentoring Different Delegate Personality Types",
            content: `## One Size Does Not Fit All

Every delegate who walks into your MUN room brings a unique personality, set of fears, and well of potential. The director who mentors every student the same way will reach some and lose others. Effective mentoring requires you to diagnose personality patterns and adapt your approach accordingly.

### The Shy Delegate

**What you see:** Rarely raises their placard, speaks softly when called on, avoids eye contact during unmoderated caucus, sits at the edge of the room.

**What's really happening:** They likely have valuable ideas but fear judgment. They want to participate but don't know how to enter the conversation.

**Mentoring strategies:**
1. **Pre-session preparation** — Help them prepare one specific speech before each session. Having a script reduces anxiety.
2. **Structured speaking opportunities** — Encourage them to speak during moderated caucus (where the structure is predictable) before attempting unmoderated caucus negotiation.
3. **The buddy system** — Pair them with a more experienced delegate who can introduce them to others and model social entry.
4. **Private validation** — Praise their preparation and thinking in private first. Public praise before they're ready can increase anxiety.
5. **Small wins** — Set micro-goals: "Today, just raise your placard once. That's it. If you're not called, that's okay — the raise counts."

WARNING: Never force a shy delegate to speak. Your job is to create conditions where they WANT to speak, not pressure them into it.

### The Dominator

**What you see:** Speaks constantly, interrupts others, tries to control every alliance, talks over quieter delegates, treats the committee as their personal stage.

**What's really happening:** They're often driven by genuine passion and intelligence, but lack social awareness. They may not realize they're dominating. In some cases, it masks insecurity — they speak more because they fear being overlooked.

**Mentoring strategies:**
1. **The 3-speech rule** — Challenge them: "You're clearly one of the strongest speakers in the room. I want you to speak no more than 3 times in the next session. Your challenge is to make each speech count and to help others speak more."
2. **Channel into leadership** — Give them a role that values influence over airtime: alliance coordinator, resolution editor, or mentor to a new delegate.
3. **Direct feedback** — Be honest: "When you speak over others, you lose credibility with the room. The best diplomats know when to listen."
4. **Model restraint** — In practice sessions, deliberately demonstrate the power of a well-timed pause or a brief, impactful statement.

### The Free-Rider

**What you see:** Shows up but doesn't contribute. Follows the group during unmoderated caucus without initiating. Signs their name on resolutions they didn't help write. Gives the minimum effort.

**What's really happening:** There are several possible causes — lack of confidence, lack of interest, confusion about what to do, or genuine disengagement. Diagnose before you act.

**Mentoring strategies:**
1. **Assign specific roles** — "During the next unmoderated caucus, your job is to find two delegates who haven't spoken to each other yet and introduce them. Be the connector."
2. **Accountability through contribution** — Each delegate must contribute something concrete before the session ends: a clause, a motion, a question, a negotiation outcome.
3. **Interest alignment** — Find the topic or committee type that genuinely interests them. A free-rider in Security Council might come alive in WHO or ECOSOC.
4. **The "teach back" technique** — Ask them to explain a concept to the group. When someone has to teach, they engage at a deeper level.

### The Perfectionist

**What you see:** Over-researches everything. Writes and rewrites their position paper. Hesitates to speak until their statement is "perfect." Gets visibly upset by minor errors. Avoids risk-taking.

**What's really happening:** They're driven by high standards and fear of making mistakes. This often comes from academic or parental pressure.

**Mentoring strategies:**
1. **Normalize imperfection** — Share stories of famous diplomats who made mistakes. Tell them about your own MUN blunders.
2. **Emphasize process over product** — "I'd rather see you speak three times and stumble once than stay silent waiting for the perfect moment."
3. **Set time limits** — "You have 15 minutes to write your opening speech. That's it. What you produce in 15 minutes is good enough."
4. **Celebrate risk-taking** — When they attempt something new (even imperfectly), make a big deal of the attempt, not the result.

KEY POINT: No student fits neatly into one category. Most delegates are a mix of types, and their dominant traits may shift depending on the context, their mood, or the committee. Stay observant and flexible.

TIP: At the start of the season, have each student complete a brief "MUN Self-Assessment" that asks about their comfort level with speaking, research, negotiation, and leadership. This gives you a baseline for personalized mentoring.

---`,
            type: "reading",
            duration: 30,
            order: 3,
            isPublished: true,
          },
          {
            title: "Tracking Progress Across the Season",
            content: `## Measuring Growth: Beyond Awards

The most common — and most misleading — measure of a MUN program's success is the number of awards its delegates win. Awards are influenced by committee size, competition level, judge subjectivity, and luck. A delegate who doesn't win an award may have grown more than one who did. You need better measures.

### Progress Rubrics

Create a simple, consistent rubric that you use to assess each delegate at regular intervals (every 4-6 weeks is ideal).

**5-Point Scale (1 = Novice, 5 = Expert):**

| Dimension | 1 (Novice) | 3 (Developing) | 5 (Expert) |
|-----------|-----------|----------------|-----------|
| Research | Relies on Wikipedia; cannot articulate country policy | Uses 2-3 quality sources; understands key policy positions | Uses primary sources; nuanced understanding of policy nuances |
| Speaking | Reads from notes; inaudible; no eye contact | Partially extemporaneous; audible; some eye contact | Fully extemporaneous; confident delivery; uses rhetoric effectively |
| Procedure | Doesn't know basic motions | Can make standard motions correctly | Uses procedure strategically; can chair a session |
| Negotiation | Stays alone; doesn't approach others | Joins alliances; contributes ideas | Initiates coalitions; brokers compromise |
| Writing | Cannot write a clause | Writes standard clauses | Crafts innovative, well-structured operative clauses |

### Portfolio Assessment

A MUN portfolio is a physical or digital collection of a delegate's work across the season. It provides concrete evidence of growth and a meaningful artifact for reflection.

**Portfolio Components:**
1. **Position papers** — One from each conference (with drafts showing revision)
2. **Speech outlines** — Key speeches prepared during the season
3. **Resolution contributions** — Clauses authored or co-authored
4. **Self-reflection entries** — After each conference or major activity
5. **Observation notes** — Your feedback (shared with the student)
6. **Photos and memorabilia** — Conference programs, delegation photos, certificates

### Self-Reflection Tools

Teaching students to evaluate themselves is more valuable than any external assessment.

**Post-Conference Reflection Template:**
1. What were your goals for this conference? Did you achieve them?
2. Describe a moment when you felt proud of your performance. What did you do?
3. Describe a moment when you felt challenged. What happened, and how did you respond?
4. What skill did you use most effectively?
5. What skill do you most want to improve before the next conference?
6. If you could give advice to yourself before this conference, what would you say?
7. On a scale of 1-10, how engaged were you during committee sessions?
8. Did you form any new alliances or friendships? How did that happen?

### Parent Communication

Parents are stakeholders in your MUN program. Keeping them informed builds support and helps them reinforce growth at home.

**Communication Schedule:**
- **Start of season**: Welcome letter with program overview, schedule, costs, and your contact information
- **Mid-season**: Progress update with specific observations about their child's growth (positive focus)
- **Post-conference**: Brief summary of the conference experience and their child's participation
- **End of season**: Comprehensive reflection with portfolio highlights and forward-looking recommendations

TIP: Frame feedback to parents around growth, not grades or awards. "Sarah has developed remarkable confidence in public speaking — she raised her placard 5 times in the last session, compared to zero at the first conference" is far more meaningful than "Sarah didn't win an award."

KEY POINT: The most powerful tracking system is one that the student owns. When delegates self-assess, set their own goals, and review their own progress, they develop metacognitive skills that transfer far beyond MUN.

CHECK: Do you have a rubric ready for the first assessment? Have you created a portfolio template? Is there a plan for sharing progress with parents at least twice during the season?

---`,
            type: "reading",
            duration: 25,
            order: 4,
            isPublished: true,
          },
        ],
      },
    },
  })

  console.log(`✅ Course 2 created: "${course2.title}" with 4 lessons`)

  // ============================================================
  // COURSE 3: Evaluating Research Papers & Position Papers
  // ============================================================
  const course3 = await prisma.course.create({
    data: {
      title: "Evaluating Research Papers & Position Papers",
      description:
        "Master the craft of evaluating student research and position papers with consistency and rigor. From detecting AI-generated content to building personalized improvement paths, this course equips you with frameworks that save time and elevate student writing.",
      category: "Evaluation",
      difficulty: "INTERMEDIATE",
      xpReward: 140,
      targetRole: "TEACHER",
      order: 11,
      isPublished: true,
      duration: 135,
      lessons: {
        create: [
          {
            title: "What Makes a Great Position Paper?",
            content: `## The Position Paper: A Director's Evaluation Guide

A position paper is a delegate's most important pre-conference deliverable. It demonstrates research depth, policy understanding, and the ability to articulate a country's stance clearly. For directors, it's also the most valuable assessment tool — a well-evaluated position paper reveals exactly where a student stands and where they need to grow.

### The Four Pillars of a Great Position Paper

**1. Structure**
A position paper must follow a clear, logical structure:
- **Introduction** — Contextualizes the issue and states the country's broad position
- **Body Paragraph 1: History and Context** — Demonstrates understanding of the issue's origins and key events
- **Body Paragraph 2: Country Policy** — Details the assigned country's specific stance, past actions, and alliances
- **Body Paragraph 3: Proposed Solutions** — Offers realistic, policy-aligned solutions
- **Conclusion** — Summarizes and reaffirms the country's commitment to action

WARNING: Many students skip the "country policy" section and write generic responses that could apply to any country. This is the most critical section and the one most commonly done poorly.

**2. Depth**
Surface-level research is the hallmark of a weak position paper. Look for:
- References to specific UN resolutions, treaties, and conventions
- Cited statistics from credible sources (UN agencies, WHO, World Bank)
- References to the country's own historical actions on the issue
- Acknowledgment of complexities and contradictions in the country's position

**3. Policy Accuracy**
A position paper that misrepresents the country's actual foreign policy is worse than one that's simply thin. Common errors include:
- Writing from a personal opinion rather than the country's official position
- Assuming all countries share democratic or Western-aligned perspectives
- Ignoring the country's voting record on relevant UN resolutions
- Failing to acknowledge alliances and regional bloc memberships

TIP: Before assigning position papers, provide students with a "Country Policy Cheat Sheet" — a curated list of 3-5 key sources for their specific country. This scaffolding helps weaker researchers while still requiring original work.

**4. Originality**
The best position papers go beyond summarizing existing information. They:
- Make connections between the assigned topic and related issues
- Propose solutions that are both creative and feasible
- Demonstrate independent thinking within the country's policy framework
- Show awareness of what other countries are likely to propose

### Grading Rubric with Examples

**A-Level Paper (90-100%)**
Example excerpt: *"Brazil's position on deforestation must be understood through the lens of both environmental stewardship and economic sovereignty. While Brazil ratified the Paris Agreement in 2016 and committed to reducing Amazon deforestation by 43% by 2030, the country simultaneously maintains that sovereign resource management is a fundamental right of developing nations. This tension — between global environmental obligations and national development priorities — shapes Brazil's approach to any binding resolution on forest conservation."*

Analysis: Specific, nuanced, acknowledges complexity, cites concrete commitments, demonstrates policy awareness.

**C-Level Paper (70-79%)**
Example excerpt: *"Brazil is against deforestation because the Amazon rainforest is important for the environment. Deforestation causes climate change and hurts biodiversity. Brazil should work with other countries to stop cutting down trees."*

Analysis: Generic, no specific policy references, reads like a middle school essay, doesn't reflect Brazil's actual complex position.

KEY POINT: The difference between an A paper and a C paper is rarely about writing ability — it's about research effort and the willingness to engage with complexity. Grade the thinking, not just the prose.

---`,
            type: "reading",
            duration: 30,
            order: 1,
            isPublished: true,
          },
          {
            title: "Detecting AI-Generated Content",
            content: `## The AI Detection Challenge

With the rapid advancement of large language models, AI-generated content in student submissions has become one of the most significant challenges facing MUN directors. This lesson provides practical detection strategies, constructive approaches to addressing AI use, and guidance on teaching academic integrity in the age of AI.

### Red Flags: Signs of AI-Generated Content

**Stylistic Indicators:**
- **Homogenous tone** — The entire paper reads in the same measured, diplomatic tone with no personality or voice variation
- **Excessive hedging** — Nearly every claim is qualified: "It is important to note that...", "Furthermore, it could be argued that...", "In many respects..."
- **Perfect grammar, zero voice** — Technically flawless but devoid of personal style, passion, or awkwardness that characterizes authentic student writing
- **Symmetric structure** — Every paragraph has the same length, same number of arguments, same transition phrases
- **Vague specificity** — Sounds specific but isn't: "Brazil has taken significant steps" without naming what those steps are

**Content Indicators:**
- **Hallucinated citations** — References to UN resolutions or reports that don't exist. This is the single most reliable indicator.
- **Anachronisms** — References to events or data from after the paper's supposed research period
- **Policy contradictions** — The paper states a position that directly contradicts the country's known foreign policy (AI often defaults to "reasonable" Western-aligned positions)
- **Generic solutions** — "The international community should work together," "Capacity building is essential," "A multi-stakeholder approach is needed" — these empty phrases are AI favorites
- **Missing local context** — No mention of country-specific programs, national legislation, or domestic stakeholders

### Verification Techniques

1. **The Citation Check** — Take every citation and verify it exists. Use the UN Digital Library, official government websites, and academic databases. AI frequently fabricates plausible-sounding but non-existent sources.

2. **The Oral Exam** — Ask the student to explain a specific claim from their paper in their own words. If they wrote it, they can elaborate. If AI wrote it, they'll struggle to explain the reasoning.

3. **The Process Review** — Ask to see their research notes, drafts, and browser history. Authentic research leaves a trail.

4. **The Follow-Up Question** — Pose a question that extends their paper's argument. A student who did their own research can build on it; an AI-reliant student cannot.

5. **Comparison with Previous Work** — Compare the submission against the student's in-class writing samples. A dramatic leap in vocabulary, sentence complexity, or argumentation sophistication is suspicious.

### Teaching Academic Integrity

Rather than simply policing AI use, create a culture where academic integrity is valued and understood.

**Constructive approaches:**
1. **Explicit AI policies** — State clearly in your syllabus what AI tools are and aren't permitted. Be specific: "You may use AI for brainstorming and grammar checking, but all final content must be your own writing."
2. **The research process grade** — Weight the research process (notes, drafts, source annotations) as heavily as the final paper. This incentivizes authentic work.
3. **In-class writing** — Include an in-class writing component that can't be AI-generated. Even 15 minutes of on-the-spot writing provides a valuable comparison point.
4. **The "AI Transparency" approach** — Allow students to use AI as a tool but require them to disclose exactly how they used it. This teaches responsible use rather than covert dependence.

WARNING: Never accuse a student of using AI based solely on suspicion. False accusations damage trust irreparably. Always verify before confronting.

KEY POINT: The goal isn't to eliminate AI from the learning process — it's to ensure that AI is a tool that enhances thinking, not a crutch that replaces it. Help students understand that the value of writing a position paper isn't the paper itself — it's the thinking that producing it requires.

---`,
            type: "reading",
            duration: 25,
            order: 2,
            isPublished: true,
          },
          {
            title: "The Research Paper Evaluation Framework",
            content: `## A Systematic Approach to Evaluation

Evaluating papers without a framework is like navigating without a map — you'll get somewhere, but probably not where you intended. This lesson presents a comprehensive six-dimension evaluation framework that ensures consistency, fairness, and actionable feedback.

### The 6-Dimension Rubric

**Dimension 1: Research Depth (0-20 points)**

| Score | Criteria |
|-------|----------|
| 16-20 | Uses primary sources (UN resolutions, government documents, treaty texts); references specific data; demonstrates nuanced understanding of historical context |
| 11-15 | Uses secondary sources of good quality; includes some specific data; shows adequate understanding of context |
| 6-10 | Relies primarily on general sources (Wikipedia, news articles); minimal specific data; surface-level context |
| 0-5 | Little or no evidence of research; generic statements; no supporting evidence |

**Dimension 2: Policy Alignment (0-20 points)**

| Score | Criteria |
|-------|----------|
| 16-20 | Accurately represents the country's foreign policy; references voting record and alliances; acknowledges policy tensions honestly |
| 11-15 | Generally accurate policy representation; some reference to alliances; minor inaccuracies |
| 6-10 | Partial policy representation; significant gaps or inaccuracies; doesn't mention key alliances |
| 0-5 | Misrepresents or ignores the country's actual policy; writes from personal opinion |

**Dimension 3: Writing Quality (0-20 points)**

| Score | Criteria |
|-------|----------|
| 16-20 | Clear, concise, and compelling prose; strong thesis; logical flow; varied sentence structure; no grammatical errors |
| 11-15 | Generally clear writing; identifiable thesis; adequate flow; minor grammatical issues |
| 6-10 | Unclear in places; weak or absent thesis; choppy flow; frequent grammatical errors |
| 0-5 | Difficult to follow; no thesis; poor organization; pervasive errors |

**Dimension 4: Evidence and Citation (0-20 points)**

| Score | Criteria |
|-------|----------|
| 16-20 | Every claim is supported by specific evidence; citations are complete and accurate; diverse source types |
| 11-15 | Most claims are supported; citations present but may have minor formatting issues; adequate source diversity |
| 6-10 | Some claims supported; inconsistent citation; limited source diversity |
| 0-5 | Unsupported claims; missing or fabricated citations; no source diversity |

**Dimension 5: Originality (0-10 points)**

| Score | Criteria |
|-------|----------|
| 8-10 | Offers creative solutions; makes unexpected connections; demonstrates independent thinking |
| 5-7 | Some original ideas; mostly conventional analysis; adequate independent thought |
| 2-4 | Primarily derivative; restates common positions; minimal original thinking |
| 0-1 | No original ideas; appears to be copied or AI-generated |

**Dimension 6: Formatting (0-10 points)**

| Score | Criteria |
|-------|----------|
| 8-10 | Follows all formatting requirements; appropriate length; professional presentation |
| 5-7 | Minor formatting issues; length acceptable; generally professional |
| 2-4 | Multiple formatting issues; too short or too long; unprofessional presentation |
| 0-1 | Does not follow formatting requirements; inappropriate length; sloppy |

### Using the Framework

1. **First pass**: Read the paper once without scoring to get an overall impression
2. **Second pass**: Score each dimension independently using the rubric
3. **Calibration**: If a paper scores very high in one dimension and very low in another, re-read to ensure you haven't over- or under-scored
4. **Total**: Sum the scores for a composite grade
5. **Narrative**: Write 2-3 sentences explaining the overall assessment

TIP: When evaluating a batch of papers, score one dimension across all papers before moving to the next dimension. This reduces the "halo effect" where a strong first dimension inflates scores on subsequent dimensions.

### Inter-Rater Reliability

If your school has multiple MUN directors, calibration is essential:
- Have two directors independently score 3-5 papers
- Compare scores — if they differ by more than 3 points on any dimension, discuss and align
- Create a shared "anchor paper" file — example papers at each quality level that all directors agree on

KEY POINT: A rubric is only as good as the person applying it. Take the time to calibrate your own scoring by re-evaluating a few papers from earlier in the season. You may find that your standards have drifted.

---`,
            type: "reading",
            duration: 25,
            order: 3,
            isPublished: true,
          },
          {
            title: "Writing Feedback That Improves the Next Draft",
            content: `## The Art of Marginalia

The feedback you write on a student's paper has one purpose: to make the next draft better. If your comments don't lead to improvement, they're not feedback — they're just judgment. This lesson teaches you how to write feedback that students actually use.

### Marginalia Best Practices

**The Golden Rule of Marginalia**: Every comment should answer the question "What should I do differently?"

**Weak marginalia:**
- "Unclear" — Unclear to whom? About what? What would make it clear?
- "Good point" — Which point? Why is it good? How could this strength be replicated?
- "Needs more research" — Research on what? Where should they look? What's missing?

**Strong marginalia:**
- "This paragraph would be stronger if you cited the actual voting record on Resolution 68/262. Check the UN Digital Library under 'Ukraine territorial integrity.'"
- "Excellent use of the WHO mortality data here. This kind of specific evidence makes your argument compelling — try to bring this level of specificity to paragraph 3."
- "You mention Brazil's 'recent environmental initiatives' but don't name any. Name at least one specific program (look up FUNAI and ICMBio) and your credibility doubles."

### Common Weakness Patterns

After evaluating hundreds of position papers, certain patterns emerge. Recognize these and you can provide targeted feedback efficiently:

**Pattern 1: The "Wikipedia Summary"**
- Symptom: The paper reads like an encyclopedia entry — factual but lifeless
- Prescription: "Your facts are solid, but the paper lacks YOUR country's voice. Rewrite the second paragraph as if you are Brazil's UN ambassador speaking to the General Assembly. What would you emphasize? What would you defend?"

**Pattern 2: The "Western Default"**
- Symptom: The paper argues for positions that align with US/EU perspectives regardless of the country assigned
- Prescription: "I notice your proposed solutions align with Western positions. Remember, you represent [Country], which has historically opposed outside intervention in sovereign matters. How would [Country]'s perspective change your proposals?"

**Pattern 3: The "Solution Dump"**
- Symptom: The paper lists 10+ vague solutions without prioritizing or connecting them
- Prescription: "You have many ideas, which is great — but a strong position paper advocates for 2-3 specific, well-developed solutions. Pick your strongest three and give each a full paragraph with evidence and implementation steps."

**Pattern 4: The "Copy-Paste"**
- Symptom: Paragraphs seem disconnected; the paper reads like it was assembled from different sources
- Prescription: "I can see the individual ideas, but the paper doesn't flow as one unified argument. Try using transition sentences that connect each paragraph to the one before it. Your thesis should be the thread that ties everything together."

### Model Feedback Templates

**Template 1: The Strong Paper (A-Level)**
"Excellent work, [Name]. Your paper demonstrates strong research, accurate policy representation, and clear writing. Three specific strengths: (1) Your use of primary sources, particularly the direct quotes from [Country]'s UN ambassador, adds credibility. (2) Your acknowledgment of [Country]'s policy tension on [issue] shows sophisticated thinking. (3) Your proposed solutions are specific and actionable. For the next level: Your conclusion could be more powerful with a clear 'call to action' — what specifically do you want the committee to adopt?"

**Template 2: The Developing Paper (C-Level)**
"Solid foundation, [Name], with clear room for growth. Here's what you're doing well: You understand the basic structure of a position paper, and your introduction effectively frames the issue. Three priorities for your revision: (1) Your country's specific policy is missing — right now, this could be written by any country. Research [Country]'s actual UN voting record and add at least 2 specific policy positions. (2) Your solutions section is too general — 'increase cooperation' and 'raise awareness' are not specific enough. What exactly should be done, by whom, and how? (3) Add at least 3 specific citations with actual sources. I've highlighted the claims that need evidence in the margins."

**Template 3: The Struggling Paper (D/F-Level)**
"[Name], I can see you've started the research process, and that's the important first step. Let's build from here. I'd like you to revise with these three specific actions: (1) Read the [Country] country guide I've linked — it will give you the basic policy positions you need. (2) Rewrite your body paragraphs using the template: 'Historical context → [Country]'s position → Evidence → Proposed solution.' (3) Come see me during office hours so we can work on your research approach together. Your ideas are good — we just need to anchor them in evidence."

KEY POINT: The best feedback is not the most detailed — it's the most actionable. If a student can't read your comment and immediately know what to do differently, rewrite the comment.

---`,
            type: "reading",
            duration: 30,
            order: 4,
            isPublished: true,
          },
          {
            title: "From Evaluation to Action: Personalized Learning Paths",
            content: `## Closing the Loop: Evaluation as a Starting Point

Evaluation is not an endpoint — it's a diagnostic tool. The real power of your evaluation framework lies in what you do with the results. This lesson teaches you how to transform evaluation data into personalized learning paths that accelerate each student's growth.

### The Diagnostic-Action Matrix

Map each student's evaluation scores to specific training interventions:

| Weakness Area | DiplomatiQ Course/Module | Supplementary Action |
|---------------|--------------------------|---------------------|
| Low research depth | Research & Position Paper Writing | Assign guided research template with 5 required source types |
| Poor policy alignment | Country Policy Masterclass (or research session) | Provide country-specific source packet; require policy memo before next paper |
| Weak writing quality | Public Speaking & Oratory Skills (for speech structure) + writing workshop | Assign in-class writing exercise; peer review session |
| Missing citations | Research Methodology module | Citation formatting workshop; provide model paper with annotations |
| Low originality | Crisis Committee Protocols (forces creative thinking) | "Devil's advocate" exercise: argue the opposite of your country's position |
| Formatting issues | Style guide distribution | Provide template with formatting locked in; require draft format check |

### Building Individual Learning Paths

**Step 1: Identify the Primary Growth Area**
Look at the lowest-scoring dimension from the evaluation. This is the student's primary growth area — the one where improvement will have the biggest overall impact.

**Step 2: Assign Targeted Training**
Based on the matrix above, assign 1-2 specific DiplomatiQ training modules. Don't overwhelm — focused improvement beats scattered effort.

**Step 3: Set Measurable Goals**
Translate the growth area into a concrete, measurable goal:
- "In your next position paper, include at least 4 primary source citations" (research depth)
- "Write from your country's perspective exclusively — no first-person personal opinions" (policy alignment)
- "Follow the provided template structure with no deviations" (formatting)

**Step 4: Provide Scaffolding**
Don't just assign and hope. Provide:
- A model paper at the target quality level
- A checklist specific to their growth area
- A mid-process check-in (draft review)
- Access to you for questions

**Step 5: Re-Evaluate**
After the student completes their next paper, evaluate it using the same rubric. Compare scores dimension by dimension. Celebrate growth in the target area, then identify the next growth area.

### Group-Level Interventions

Sometimes, evaluation reveals patterns across the entire group:

- **Everyone struggles with citations** → Run a group citation workshop before the next paper
- **Most students write generic solutions** → Dedicate a meeting session to "Solution Development Framework" (problem → mechanism → actors → timeline → metrics)
- **Policy alignment is universally weak** → Create a "Country Policy Speed Dating" activity where each student presents their country's stance in 60 seconds and gets peer feedback

### Tracking Learning Paths Over the Season

Create a simple tracking spreadsheet with these columns:
- Student name
- Paper 1 scores (6 dimensions)
- Primary growth area identified
- Training assigned
- Paper 2 scores (6 dimensions)
- Growth in primary area (+/- points)
- New primary growth area
- End-of-season composite score

TIP: Share the tracking data with students (without comparing them to peers). When students can see their own growth trajectory — "You went from a 7 to a 14 in research depth" — it's incredibly motivating.

### The Evaluation-Conference Connection

The strongest link in your feedback loop connects paper evaluation to conference performance:

1. A student who writes a strong position paper enters conference with confidence and deep knowledge
2. A student who revised based on your feedback has already practiced improving — a skill they'll use during unmoderated caucus
3. A student who identified their writing weaknesses can compensate strategically (e.g., a student who struggles with impromptu speaking but writes well can focus on resolution drafting during committee)

KEY POINT: The ultimate measure of your evaluation system's effectiveness isn't the quality of the papers — it's the quality of the delegates who write them. If your evaluations help students become better researchers, thinkers, and communicators, you've succeeded.

CHECK: Can you map each of your students to a specific learning path based on their most recent evaluation? Do you have a system for tracking growth across multiple evaluation cycles? Have you identified any group-level patterns that warrant a workshop?

---`,
            type: "reading",
            duration: 25,
            order: 5,
            isPublished: true,
          },
        ],
      },
    },
  })

  console.log(`✅ Course 3 created: "${course3.title}" with 5 lessons`)

  // ============================================================
  // COURSE 4: Classroom Management & Consequences Matrix
  // ============================================================
  const course4 = await prisma.course.create({
    data: {
      title: "Classroom Management & Consequences Matrix",
      description:
        "Establish authority, maintain order, and handle disruptions with confidence. This course provides MUN directors with a complete classroom management system — from setting expectations to implementing restorative practices — specifically designed for the unique dynamics of MUN sessions.",
      category: "Management",
      difficulty: "INTERMEDIATE",
      xpReward: 135,
      targetRole: "TEACHER",
      order: 12,
      isPublished: true,
      duration: 130,
      lessons: {
        create: [
          {
            title: "Establishing Expectations & Code of Conduct",
            content: `## The Foundation of Order: Clear Expectations

Classroom management in a MUN program is different from a regular classroom. Your students are simulating diplomats, engaging in debate, forming alliances, and navigating complex social dynamics — all within a structure that requires both formality and creativity. The foundation of managing this environment is establishing crystal-clear expectations from Day 1.

### Setting Ground Rules

Ground rules for MUN should be specific, reasonable, and enforceable. Avoid vague rules like "be respectful" — instead, define what respect looks like in the MUN context.

**Core Ground Rules:**
1. **When someone has the floor, everyone else is silent** — This mirrors real diplomatic protocol and teaches active listening.
2. **Address all comments through the Chair** — In committee, delegates speak to the committee, not to each other directly. This prevents personal attacks.
3. **Diplomatic language at all times** — Even disagreement must be expressed respectfully. "The delegate of [Country] respectfully disagrees" is the model.
4. **Phones away during sessions** — MUN requires full engagement. Phones are permitted only during breaks.
5. **Be prepared** — Every delegate should arrive with their research completed and materials ready.
6. **Support your peers** — Celebrate others' successes. Help struggling delegates. This is a team, not a competition.

### The MUN Delegate Contract

At the start of each season, have every delegate sign a "MUN Delegate Contract" that outlines both expectations and consequences. This creates accountability and gives you a reference point when issues arise.

**Sample Contract:**

*"As a DiplomatiQ MUN Delegate, I commit to:*
- *Attending all scheduled meetings and notifying the director in advance if I cannot attend*
- *Completing all preparation assignments before the deadline*
- *Treating all delegates, chairs, and directors with respect*
- *Using diplomatic language at all times during MUN sessions*
- *Representing my assigned country to the best of my ability*
- *Supporting my fellow delegates and contributing to a positive team culture*
- *Following the consequences matrix if I fail to meet these commitments*

*I understand that participation in MUN is a privilege, and that serious or repeated violations of this contract may result in removal from the program."*

TIP: Have students co-create the contract. When students have input into the rules, they're more likely to internalize them. Present your core non-negotiable rules, then ask the group to suggest 2-3 additional expectations they think are important.

### Creating a Respectful Committee Culture

Culture isn't built by rules alone — it's built by consistent modeling, celebration of positive behavior, and immediate addressing of negative behavior.

**Model the behavior you expect:**
- Use formal diplomatic language when addressing students during MUN sessions
- Show respect for student ideas, even when they're incorrect
- Demonstrate active listening when students speak
- Admit mistakes openly — "I was wrong about that procedural ruling" teaches students that accountability is strength

**Celebrate positive culture:**
- Acknowledge specific examples of good sportsmanship publicly: "I noticed how [Name] helped [Name] find their clause during unmoderated caucus — that's exactly the kind of teamwork this program is about."
- Create a "Delegate of the Week" recognition that emphasizes character, not just performance

KEY POINT: The culture you set in the first three meetings will persist for the entire season. Invest heavily in establishing norms early — it pays dividends all year.

---`,
            type: "reading",
            duration: 25,
            order: 1,
            isPublished: true,
          },
          {
            title: "The Consequences Matrix in Action",
            content: `## A Tiered Response System

Effective discipline is not about punishment — it's about teaching accountability while maintaining the relationship. The Consequences Matrix provides a clear, progressive system that both you and your students can rely on. When consequences are predictable and fair, students feel safe rather than targeted.

### The Five Tiers

**Tier 1: Verbal Warning**
- **When to use**: First minor infraction (side conversation, phone peek, off-topic comment)
- **How to deliver**: Private, brief, and specific. "I noticed you were on your phone during the speech. Please put it away — we need full attention during committee."
- **Documentation**: None required, but make a mental note. If the same student receives 3 verbal warnings, escalate to Tier 2.
- **Key principle**: Correct the behavior, not the person. "The behavior needs to change" not "You need to change."

**Tier 2: Written Reflection**
- **When to use**: Repeated minor infractions after verbal warnings, or a single moderate infraction (disrespectful comment, consistent lack of preparation, disrupting a simulation)
- **How to deliver**: After the session, give the student a reflection form to complete before the next meeting. The form asks:
  1. What happened?
  2. What expectation did I not meet?
  3. How did my behavior affect others?
  4. What will I do differently next time?
- **Documentation**: Keep the completed reflection form in your records.
- **Key principle**: Reflection, not punishment. The act of writing forces cognitive engagement with the behavior.

**Tier 3: Meeting with Director**
- **When to use**: Continued infractions despite reflection, or a more serious incident (verbal harassment, deliberate disruption, cheating on a position paper)
- **How to deliver**: Schedule a private meeting. Use the format:
  1. State what you've observed (with specific examples)
  2. Express concern for their success in the program
  3. Ask for their perspective
  4. Collaboratively develop a plan for improvement
  5. Document the agreement in writing (both parties sign)
- **Documentation**: Written summary of the meeting and agreed-upon plan.
- **Key principle**: This is a turning point. The student must understand that their continued participation depends on a genuine change.

**Tier 4: Parent Contact**
- **When to use**: When Tier 3 interventions have not resolved the issue, or when the incident is serious enough that parents should be informed regardless
- **How to deliver**: Phone call preferred over email. Frame the conversation around support, not punishment: "I'm calling because I want [Student] to succeed in MUN, and I've noticed some challenges that I think we can address together."
- **Documentation**: Log the date, time, and summary of the conversation.
- **Key principle**: Parents are allies, not adversaries. Most parents want to help but may not know there's an issue.

**Tier 5: Program Suspension**
- **When to use**: As a last resort, when all previous interventions have failed and the student's behavior is negatively impacting the program for others
- **How to deliver**: In person, with a written notification. Be clear about the reason, the duration (temporary or permanent), and the conditions for possible reinstatement.
- **Documentation**: Formal written notice to the student, parent, and school administration.
- **Key principle**: This should be rare. If you're reaching Tier 5 frequently, re-examine your Tier 1-3 implementation — the early system may need strengthening.

### When to Escalate (And When Not To)

**Escalate when:**
- The same behavior persists despite intervention at the current tier
- The behavior is escalating in severity
- The behavior is harming other students
- The student is not engaging with the reflection process

**Do NOT escalate when:**
- It's a first-time minor infraction (start at Tier 1)
- The student is having a bad day (use compassion, not consequences)
- The behavior is a symptom of a deeper issue (disengagement might mean they're lost, not defiant)

WARNING: Never skip tiers. Going directly to parent contact (Tier 4) for a first offense destroys trust with the student and makes you appear unreasonable. The tiered system works because it's gradual and predictable.

TIP: Post the Consequences Matrix in your meeting space. When students can see the system, they self-regulate more effectively. The matrix isn't a threat — it's a shared understanding.

---`,
            type: "reading",
            duration: 30,
            order: 2,
            isPublished: true,
          },
          {
            title: "Handling Disruptions During MUN Sessions",
            content: `## Disruptions Happen — Be Ready

MUN sessions are dynamic, social, and intense — a perfect recipe for disruptions. The key is not to prevent every disruption (that's impossible) but to handle each one swiftly, proportionately, and in a way that preserves the learning environment for everyone.

### Side Conversations

**The Problem:** Two or more delegates are having an off-topic conversation while another delegate is speaking.

**Immediate Response (during session):**
- Make eye contact with the talking students and raise an eyebrow or give a slight head shake
- If it continues, pause the session briefly: "Let's make sure everyone can hear the current speaker. Side conversations can wait for the break."
- If persistent, use the committee's own protocol: "Point of Order — the delegates of [Countries] are engaged in side conversation during another delegate's speech."

**Post-Session Follow-Up:**
- If it was a one-time occurrence, a verbal reminder is sufficient
- If it's a pattern, have a private conversation: "I've noticed you tend to chat during speeches. It's distracting to the speaker and to delegates nearby. What can we do to help you stay focused?"

### Phone Usage

**The Problem:** A delegate is texting, scrolling social media, or otherwise using their phone during a session.

**Immediate Response:**
- "Phones should be away during committee session. Please put it in your bag."
- For repeated offenses: Implement a "phone basket" policy — all phones go in a basket at the start of the session and are returned at the end.

**Prevention:**
- Establish the phone rule on Day 1 and enforce it consistently
- Explain WHY: "In a real UN session, delegates don't text during speeches. We're training for that standard."

### Off-Topic Arguments

**The Problem:** Two delegates get into a heated personal or political argument that has nothing to do with the simulation.

**Immediate Response:**
- "This is an important conversation, but it's not the one we're having in committee right now. Let's table it and return to the agenda."
- If emotions are running high: "Let's take a 2-minute breather. When we come back, we'll refocus on the committee topic."

**Script for Redirecting:**
"I can see you both feel strongly about this. Here's what I'd love to see: channel that passion into your delegate role. If [Country A] and [Country B] disagree on this issue, show us how they'd handle it through diplomatic procedure — not through a shouting match."

### Personal Attacks

**The Problem:** A delegate insults, mocks, or personally attacks another delegate (as opposed to disagreeing with their policy position).

**Immediate Response:**
1. **Stop the session immediately.** Do not let it continue, even for a moment.
2. **Address it directly:** "That was a personal comment, not a diplomatic one. In this program, we disagree with ideas, never with people. [Attacking delegate], please rephrase your point using diplomatic language. [Target delegate], I'm sorry that happened."
3. **If the attacking delegate refuses to rephrase:** "Then we'll move on without that point. I expect better from everyone in this room."

**Post-Session Follow-Up:**
- This warrants at minimum a Tier 2 response (written reflection)
- For severe or repeated personal attacks, escalate to Tier 3 immediately
- Check in with the targeted delegate separately to ensure they feel safe and supported

KEY POINT: Your response to the first personal attack sets the tone for the entire season. If you let it slide, you're telling everyone that personal attacks are tolerable. If you address it firmly and immediately, you're creating a culture of safety.

### Practical Scripts for Common Situations

**When a delegate won't stop talking:**
"[Name], I appreciate your enthusiasm, but I need to hear from other delegates now. You'll have another opportunity to speak shortly."

**When a delegate is clearly disengaged:**
"[Name], I can see you're not with us right now. Is everything okay? Do you need a moment, or is there something I can help with?"

**When two delegates are arguing across the room:**
"Gentle reminder — all comments go through the Chair. If you have a response to the delegate's point, raise your placard and you'll be recognized."

**When a delegate makes an inappropriate joke:**
"That kind of humor doesn't belong in committee. Let's keep it professional."

TIP: Practice these scripts before you need them. When a disruption happens, you'll respond instinctively — make sure your instincts are well-trained.

---`,
            type: "reading",
            duration: 25,
            order: 3,
            isPublished: true,
          },
          {
            title: "Managing the Overly Competitive Delegate",
            content: `## When Ambition Becomes a Problem

Competition is inherent to MUN — delegates compete for awards, speaking time, and influence. A healthy competitive drive motivates preparation and excellence. But when competition becomes excessive, it damages the individual, the delegation, and the program culture. This lesson helps you identify, understand, and redirect overly competitive delegates.

### Identifying Over-Competitiveness

**Signs of healthy competition:**
- Prepares thoroughly because they want to perform well
- Is disappointed by losses but gracious in defeat
- Celebrates teammates' successes
- Competes with themselves as much as with others

**Signs of unhealthy competition:**
- Becomes visibly angry or distraught when they don't win
- Undermines or speaks negatively about other delegates
- Focuses exclusively on awards rather than learning
- Argues with chairs over procedural decisions they perceive as unfair
- Treats allies as tools rather than partners
- Cheats, exaggerates, or misrepresents information to gain advantage
- Cannot enjoy the experience unless they "win"

### The Sportsmanship Conversation

When you identify an overly competitive delegate, have a private, honest conversation. Use this framework:

**1. Acknowledge the positive:**
"Your drive to succeed is one of your greatest strengths, and it's made you one of our most prepared delegates."

**2. Name the problem with specific examples:**
"I've noticed that when things don't go your way — like when your motion wasn't passed yesterday — your frustration affected how you interacted with other delegates. [Name] mentioned that you were dismissive of their contribution during unmoderated caucus."

**3. Explain the impact:**
"When one delegate's competitiveness makes others feel diminished, it hurts the entire delegation. People stop wanting to work with you, which actually reduces your effectiveness. In MUN, the best delegates are the ones others WANT to ally with."

**4. Reframe winning:**
"In MUN, winning isn't just about awards. It's about influence. The delegate who brings 5 people together, mediates a compromise, and produces a resolution that passes — they've won, even if they never get a gavel. That's a different kind of winning, and it's the one that matters most in real diplomacy."

**5. Set a specific goal:**
"For the next conference, I want you to try something: don't focus on winning an award. Focus on being the delegate that 3 other countries seek out as an ally. I think you'll find it more satisfying — and more effective."

### Channeling Ambition Productively

Overly competitive delegates have energy and drive. Don't suppress it — redirect it.

**Productive channels:**
1. **Leadership roles** — Put them in charge of something (delegation logistics, resolution editing, crisis response team). Leadership requires collaboration, which naturally moderates solo competitiveness.
2. **Mentorship** — Pair them with a new delegate. Teaching forces them to focus on someone else's success, which builds empathy.
3. **Skill mastery challenges** — Instead of "win the award," challenge them to "master 5 advanced procedural motions" or "write the best operative clause in the delegation." Skill-based goals satisfy competitive drive without creating interpersonal conflict.
4. **Self-competition** — Track their personal progress across conferences. "You spoke 3 times at your first conference and 8 times at your second. Can you reach 12 at the next?" This redirects competition inward.

### Dealing with Competitive Parents

Sometimes the competitiveness comes not from the student but from their parents. Signs include:
- Parents asking about awards before asking about the experience
- Parents comparing their child to other delegates
- Parents pressuring you for leadership roles or preferred committee assignments

**How to handle:**
- Reiterate your program's values: "In our MUN program, we measure growth, not just awards. [Student] has made remarkable progress in [specific skill]."
- Set boundaries: "I'm happy to discuss your child's development. I don't discuss other students' performance."
- Involve parents in the program positively: "We'd love your help with [logistics/fundraising] — it's a great way to support the program."

KEY POINT: The overly competitive delegate is not a "bad kid." They're often a high-achieving student who has been conditioned to equate their worth with their results. Your job is to help them discover that their value comes from who they are, not what they win.

---`,
            type: "reading",
            duration: 25,
            order: 4,
            isPublished: true,
          },
          {
            title: "Restorative Practices in MUN",
            content: `## Beyond Punishment: Repairing Harm

Traditional discipline focuses on punishment — what the rule-breaker deserves. Restorative practices focus on repair — what the harmed party needs and how the community can heal. In a MUN program, where relationships and trust are the foundation of everything, restorative practices are not just an alternative — they're essential.

### The Restorative Mindset

Before learning specific techniques, internalize these principles:

1. **Harm, not rules, is the focus** — When a delegate is disruptive, the question isn't "What rule was broken?" but "Who was harmed and how?"
2. **Accountability means understanding impact** — A delegate who understands the impact of their behavior is more likely to change than one who is simply punished.
3. **Reintegration is the goal** — The purpose of any consequence is to bring the person back into the community, not to exclude them.
4. **Voice matters** — Both the person who caused harm and the person who was harmed need to be heard.

### Conflict Resolution Circles

A conflict resolution circle is a structured conversation between the parties involved in a conflict, facilitated by the director.

**When to use:** After a personal conflict between delegates, a disruption that affected the group, or any situation where relationships need to be repaired.

**Structure:**
1. **Opening** — All participants sit in a circle (no desks between them). The director explains the purpose: "We're here to understand what happened, how it affected people, and how we can move forward."
2. **Sharing** — Each person speaks in turn, using a talking piece (any object that signals whose turn it is). No interruptions. The person who caused harm speaks first: "What I did, why I did it, and what I was thinking at the time."
3. **Impact** — The person who was harmed speaks: "How it affected me, how it made me feel, and what I need to move forward." Other affected parties may also speak.
4. **Repair** — The group collaboratively develops a repair plan: "What needs to happen to make things right?" This might include an apology, a specific behavior change, or an act of service to the program.
5. **Closing** — The director summarizes the agreement and expresses confidence in the group's ability to move forward.

**Ground Rules for Circles:**
- Speak from the heart (honesty, not performance)
- Listen from the heart (genuinely try to understand)
- No interrupting
- What's shared in the circle stays in the circle (confidentiality)
- It's okay to pass — no one is forced to speak

### Apology Protocols

A genuine apology is a powerful act of repair. A forced or insincere apology can make things worse. Teach delegates the four components of a real apology:

1. **Acknowledge what you did** — "I interrupted you during your speech and called your idea stupid."
2. **Express understanding of the impact** — "I know that made you feel embarrassed and disrespected, and it undermined your confidence to speak again."
3. **Take responsibility** — "It was wrong. There's no excuse for it."
4. **Commit to change** — "Next time I disagree with someone, I'll raise my placard and express my disagreement diplomatically, through the Chair."

WARNING: Never force a student to apologize. A forced apology teaches the wrong lesson — that words can be used to satisfy authority rather than to repair harm. Instead, help the student understand the impact of their behavior and invite them to make amends when they're ready.

### Rebuilding Trust After Incidents

After a significant conflict, trust doesn't automatically return. It must be rebuilt through consistent behavior over time.

**For the person who caused harm:**
- Follow through on commitments from the resolution circle
- Demonstrate changed behavior consistently (not just in front of the director)
- Be patient — trust takes longer to rebuild than to break

**For the person who was harmed:**
- Give yourself permission to be cautious
- Notice and acknowledge when the other person demonstrates changed behavior
- Don't feel pressured to "be fine" immediately

**For the director:**
- Check in with both parties regularly in the weeks following the incident
- Create natural opportunities for positive interaction (assign them to the same working group on a neutral topic)
- Don't re-litigate the incident — focus on the present and future

### Learning from Mistakes

The ultimate restorative practice is helping students see mistakes as learning opportunities, not defining moments.

**Reframe the narrative:**
- "This doesn't define who you are. What defines you is what you do next."
- "Some of the best diplomats in history made serious mistakes early in their careers. The ones we remember are the ones who grew from them."
- "In this program, we don't expect perfection. We expect growth."

TIP: Create a "MUN Fail Stories" tradition — a session where returning delegates share their worst MUN moments and what they learned. Normalizing failure is one of the most powerful restorative practices.

KEY POINT: Restorative practices are not "soft" on discipline. They require more courage, more skill, and more time than punitive approaches. But they produce lasting change, whereas punishment often produces only temporary compliance.

---`,
            type: "reading",
            duration: 30,
            order: 5,
            isPublished: true,
          },
        ],
      },
    },
  })

  console.log(`✅ Course 4 created: "${course4.title}" with 5 lessons`)

  // ============================================================
  // COURSE 5: Running Effective Weekly MUN Meetings
  // ============================================================
  const course5 = await prisma.course.create({
    data: {
      title: "Running Effective Weekly MUN Meetings",
      description:
        "Transform your weekly MUN meetings from scattered gatherings into powerful learning experiences. This course provides meeting templates, activity libraries, guest speaker strategies, and end-of-season celebration plans that keep delegates engaged and growing all year long.",
      category: "Classroom",
      difficulty: "BEGINNER",
      xpReward: 120,
      targetRole: "TEACHER",
      order: 13,
      isPublished: true,
      duration: 110,
      lessons: {
        create: [
          {
            title: "Structuring the Perfect MUN Meeting",
            content: `## The Anatomy of an Effective Meeting

A well-structured MUN meeting is the engine of your program. Every meeting should have a clear purpose, a predictable rhythm, and a balance of instruction and practice. This lesson provides you with battle-tested meeting templates that maximize learning and engagement in every minute.

### The 60-Minute Meeting Template

This is your default meeting structure — the one you use most weeks:

**Minutes 0-5: Warm-Up (5 min)**
- Quick energizer or icebreaker activity
- Brief review of the previous meeting's key takeaway
- Today's agenda preview

**Minutes 5-20: Skill Drill (15 min)**
- Focused instruction on one specific skill
- Could be: procedural motion practice, research technique, speech structure, negotiation strategy, or resolution writing
- Keep it interactive — not a lecture. Demonstrate, then have students practice immediately.

**Minutes 20-50: Practice Debate / Simulation (30 min)**
- The core of the meeting — students apply the skill drilled above in a realistic context
- Could be: a moderated caucus on a current event, a mini-committee session, a negotiation exercise, or a resolution drafting workshop
- This is where real learning happens through experience

**Minutes 50-60: Debrief (10 min)**
- What worked? What didn't? What will we do differently next time?
- 2-3 students share reflections
- Director provides targeted feedback on what was observed
- Preview of next week's meeting and any preparation needed

### The 90-Minute Meeting Template

Use this for weeks when you need more practice time (especially before conferences):

**Minutes 0-5: Warm-Up (5 min)**
- Same as 60-minute template

**Minutes 5-25: Skill Drill (20 min)**
- More in-depth instruction with extended practice time
- Include a "teach-back" component where a student demonstrates the skill for the group

**Minutes 25-70: Extended Simulation (45 min)**
- Full committee simulation with realistic procedure
- Rotate the chair so different students gain chairing experience
- Include both moderated and unmoderated caucus segments

**Minutes 70-80: Written Reflection (10 min)**
- Students complete a brief written reflection on their performance
- 3 questions: What did I do well? What challenged me? What's my goal for next week?

**Minutes 80-90: Group Debrief (10 min)**
- Share key observations and feedback
- Celebrate specific achievements
- Assign preparation for next meeting

### Meeting Cadence Recommendations

**Pre-Season (First 4 weeks):**
- 2 meetings per week, 60 minutes each
- Focus: foundations, procedure, and building team culture

**Regular Season:**
- 1 meeting per week, 60-90 minutes
- Focus: skill development and practice simulations
- Optional: Add a "drop-in practice" session for delegates who want extra time

**Pre-Conference (2 weeks before):**
- 2 meetings per week, 90 minutes each
- Focus: conference-specific preparation, position paper review, strategy sessions

**Post-Conference:**
- 1 meeting, 60 minutes
- Focus: reflection, celebration, and forward planning

### Meeting Management Tips

**Start on time, every time.** If you respect the schedule, students will too. If you're casual about start times, students will arrive late consistently.

**Have a visible agenda.** Write it on the board or display it on a screen. Students perform better when they know what's coming.

**Vary the format.** Don't do the exact same thing every week. Alternate between skill drills, simulations, guest speakers, and collaborative activities. Predictability in structure is good; monotony in content is deadly.

**End with energy.** The last 2 minutes of every meeting should be positive. A celebration, a preview of something exciting, or a quick group cheer. Students should leave wanting more, not watching the clock.

TIP: Create a "Meeting Log" where you record what you did each week, what worked, and what you'd change. After one season, this log becomes your most valuable planning resource.

---`,
            type: "reading",
            duration: 25,
            order: 1,
            isPublished: true,
          },
          {
            title: "Skill-Building Activities & Mini-Simulations",
            content: `## 10 Quick Activities for Every Skill

Variety is the spice of MUN meetings. This lesson provides 10 ready-to-use activities, each targeting a specific skill, each completable in 10-20 minutes. Keep this library at your fingertips and pull from it whenever your meeting needs an energy boost.

### Activity 1: Motion Madness (Procedure Practice)
**Time:** 10 minutes | **Skill:** Parliamentary Procedure

- Set a timer for 10 minutes
- Call out situations: "The delegate of France wants to change the speaking time from 1 minute to 2 minutes" or "The delegate of Japan wants to discuss a different sub-topic"
- Students must correctly state the motion they would make
- First student to state it correctly gets a point
- Variations: Have students practice Points as well as Motions

### Activity 2: Impromptu Speaking Challenge (Public Speaking)
**Time:** 15 minutes | **Skill:** Impromptu Speaking

- Prepare a list of 20 topics (current events, fun topics, MUN-related issues)
- Each student draws a topic and has 30 seconds to prepare
- They must speak for 60 seconds on that topic as their assigned country
- The group provides one specific piece of positive feedback after each speech
- Variations: Reduce prep time to 15 seconds for advanced students; add a "no filler words" challenge

### Activity 3: Resolution Relay (Resolution Writing)
**Time:** 20 minutes | **Skill:** Resolution Drafting

- Divide the group into teams of 3-4
- Give each team a topic and a blank resolution template
- Round 1 (5 min): Write the first two preamble clauses
- Pass the paper to the next team
- Round 2 (5 min): Write the next two preamble clauses and the first operative clause
- Continue rotating until each team has contributed to every resolution
- Read the final products aloud and discuss what worked

### Activity 4: Negotiation Triads (Negotiation)
**Time:** 15 minutes | **Skill:** Diplomatic Negotiation

- Create groups of three, each representing a different country with a different priority
- Example: Country A wants strict regulation, Country B wants voluntary guidelines, Country C wants no action
- They have 10 minutes to negotiate a joint statement
- Debrief: Who compromised? Who held firm? What strategies worked?

### Activity 5: Country Pitch (Research & Persuasion)
**Time:** 10 minutes | **Skill:** Research Synthesis

- Each student has 60 seconds to "pitch" their country as the best ally on a given issue
- They must reference at least one specific policy, alliance, or capability
- The group votes on which country they'd most want as an ally (and why)
- This teaches students to think about what makes their country valuable in negotiations

### Activity 6: Crisis Twitter (Crisis Response)
**Time:** 10 minutes | **Skill:** Quick Thinking & Crisis Management

- Announce a breaking crisis: "A major earthquake has hit your country's capital. You have 2 minutes to draft a 280-character statement as your country's UN representative."
- Students write their statements and read them aloud
- Discuss which statements were most effective and why
- Variations: Add follow-up crises that require evolving responses

### Activity 7: Procedural Jeopardy (Procedure Review)
**Time:** 15 minutes | **Skill:** Procedure Knowledge

- Create a Jeopardy-style board with categories: Motions, Points, Voting, Decorum, Resolution Format
- Point values from 100-500 based on difficulty
- Teams take turns selecting categories and answering questions
- Sample 500-point question: "What is the difference between a Point of Order and a Point of Parliamentary Inquiry?"

### Activity 8: The Lobbyist (Persuasion & Diplomacy)
**Time:** 15 minutes | **Skill:** Persuasion

- One student plays a "lobbyist" who must convince 3 other students (playing different countries) to support a specific policy
- The lobbyist has 5 minutes to make their case
- The "countries" can ask questions and push back
- After 5 minutes, each country votes yes or no and explains their reasoning
- Rotate so everyone gets a chance to be the lobbyist

### Activity 9: Clause Clinic (Resolution Writing)
**Time:** 15 minutes | **Skill:** Clause Construction

- Write 5 poorly-constructed operative clauses on the board
- Examples: "Countries should stop pollution" or "The UN needs to help people"
- Students work individually or in pairs to rewrite each clause using proper resolution language
- Share and compare: "Calls upon all Member States to reduce carbon emissions by 30% by 2030 in accordance with the Paris Agreement" vs. the original

### Activity 10: Two-Truths and a Policy (Research & Knowledge)
**Time:** 10 minutes | **Skill:** Country Knowledge

- Each student writes three statements about their country's foreign policy — two true and one false
- The group guesses which statement is false
- Points for correct guesses AND for convincing false statements
- This deepens country knowledge and teaches students to evaluate claims critically

KEY POINT: The best activities are the ones students request again. Pay attention to which activities generate the most energy and engagement — those are your program's greatest hits.

TIP: Keep an "Activity Bank" folder (physical or digital) with instructions, materials, and notes for each activity. After each meeting, jot down what worked and what didn't. Over time, you'll develop a curated collection of proven activities.

---`,
            type: "reading",
            duration: 30,
            order: 2,
            isPublished: true,
          },
          {
            title: "Guest Speakers & Real-World Connections",
            content: `## Bringing the Real World Into Your MUN Room

One of the most transformative experiences for MUN delegates is connecting with people who do the real work of diplomacy, international development, and global advocacy. A single conversation with a diplomat, NGO worker, or UN representative can change how a student sees the world — and their place in it.

### Why Guest Speakers Matter

Guest speakers provide:
- **Authenticity** — They make the simulation real. When a student hears a diplomat describe actual UN negotiations, their own committee sessions gain new meaning.
- **Inspiration** — Career paths that students never considered become visible and accessible.
- **Credibility** — Your program gains legitimacy when professionals invest their time in it.
- **Perspective** — Guests often share viewpoints and experiences that challenge students' assumptions.

### Finding Guest Speakers

You don't need to land the UN Secretary-General. Excellent speakers can be found much closer to home:

**Tier 1: Local Diplomats and Consulate Staff**
- Every country with an embassy or consulate has staff who work on international relations
- Contact the cultural attaché or public affairs officer — they're often tasked with community engagement
- Many embassies have outreach programs specifically designed for schools

**Tier 2: NGO and Nonprofit Professionals**
- Organizations like the Red Cross, UNICEF, WWF, and Amnesty International have local or regional offices
- Their staff can speak about humanitarian work, development, and advocacy from direct experience
- These speakers are often more accessible than diplomats and equally impactful

**Tier 3: Academics and University Faculty**
- Professors of international relations, political science, law, or environmental science
- They bring deep knowledge and can contextualize MUN topics in academic frameworks
- Many universities have outreach programs for secondary schools

**Tier 4: Returned Peace Corps Volunteers or Similar**
- Individuals who have served in international programs bring ground-level perspective
- Their stories are personal, vivid, and relatable for students

**Tier 5: Your Own Alumni and Parents**
- Parents who work in international business, law, or government
- Alumni who have gone on to study IR, work abroad, or participate in university MUN
- These speakers have the added benefit of being personally connected to your community

### Virtual Speaker Options

Not every school has access to local diplomats. Virtual speakers expand your options dramatically:

- **UN Virtual Tours and Speaker Programs** — The UN offers virtual briefings for school groups
- **Video calls with diaspora communities** — Connect with people from the countries your delegates represent
- **Recorded interviews** — If a live speaker isn't available, record a 15-minute interview that you can play during a meeting
- **Panel discussions via Zoom** — Bring 2-3 speakers together for a moderated conversation

TIP: Don't aim for a 45-minute lecture. The most impactful guest speaker format is 10 minutes of story-sharing followed by 20 minutes of Q&A. Students learn more from asking their own questions than from hearing a prepared speech.

### Preparing Students for Q&A

The worst guest speaker experiences happen when students sit in silence because they don't know what to ask. Preparation is essential.

**Pre-Speaker Preparation:**
1. Share the speaker's bio and background 1 week in advance
2. Have each student write 2 questions based on the bio
3. Review questions as a group and select the strongest 8-10
4. Assign specific students to ask specific questions (this prevents the "I was going to ask that" problem)
5. Brief students on professional etiquette: formal address, no interrupting, thank the speaker

**Sample Question Starters:**
- "What was the most challenging negotiation you've been part of?"
- "How does what happens in a real UN committee differ from what we do in MUN?"
- "What advice would you give to a student who wants to work in international relations?"
- "How has diplomacy changed in the era of social media?"
- "What's a common misconception people have about the UN?"

### Making the Connection Last

A guest speaker's impact shouldn't end when they leave the room.

**Follow-up activities:**
1. **Thank-you notes** — Have each student write a brief, personalized thank-you note. This teaches professional communication and often leads to an ongoing relationship.
2. **Reflection writing** — Ask students to write a paragraph about what surprised them, what inspired them, and what they want to learn more about.
3. **Topic integration** — Use the speaker's insights in your next simulation. "Remember what [Speaker] said about how negotiations actually work behind the scenes? Let's practice that in today's unmoderated caucus."
4. **Social media** — With permission, share photos and key takeaways on your program's social media. This shows the speaker their impact and builds your program's visibility.

KEY POINT: The goal of a guest speaker isn't entertainment — it's transformation. A 30-minute conversation that changes how a student thinks about the world is worth more than a semester of lectures.

---`,
            type: "reading",
            duration: 25,
            order: 3,
            isPublished: true,
          },
          {
            title: "End-of-Season Review & Celebration",
            content: `## Closing Strong: The Art of the Season Finale

How your MUN season ends matters as much as how it begins. A strong closing celebration honors the journey, acknowledges growth, builds excitement for next year, and reinforces the culture you've worked all season to create. This lesson provides a complete framework for ending your season with impact.

### Portfolio Presentations

Before the celebration, give students the opportunity to present their growth through their MUN portfolios.

**Format: 5-Minute Presentations**
- Each student presents to the group (or a smaller panel of directors and student leaders)
- They share: their best work, their biggest challenge, and their proudest moment
- The audience responds with specific, positive feedback

**Why This Matters:**
- Students practice formal presentation skills (a core MUN competency)
- They see their own growth in tangible form
- They learn from their peers' experiences
- It provides closure — a ritual that says "the season is complete"

**Assessment Integration:**
If you're using portfolio-based assessment, the presentation can serve as the final evaluation. Score it using the same rubric you've used all season, with an added "reflection and growth" dimension.

### Awards Ceremony Planning

Awards should celebrate the values your program prioritizes — not just the traditional measures of MUN success.

**Recommended Award Categories:**

**Performance Awards:**
- **Best Delegate** — Outstanding overall performance across the season
- **Most Improved Delegate** — Demonstrated the greatest growth from start to finish
- **Best Speaker** — Consistently delivered compelling, well-prepared speeches

**Character Awards:**
- **Diplomat of the Year** — Embodied the values of diplomacy: respect, collaboration, bridge-building
- **Best Teammate** — Always supported others, shared credit, and put the delegation first
- **Resilience Award** — Overcame significant challenges and persevered

**Skill Awards:**
- **Research Excellence** — Produced consistently thorough, well-sourced position papers
- **Master Negotiator** — Built coalitions, mediated disputes, and found common ground
- **Rising Chair** — Demonstrated exceptional potential as a committee chair

**Special Recognition:**
- **Program Spirit Award** — Brought energy, positivity, and enthusiasm to every meeting
- **Unsung Hero** — Contributed quietly but consistently, often behind the scenes
- **Director's Award** — Your personal recognition of a student who inspired you

WARNING: Avoid giving "Best Delegate" to the same student every year. Rotate recognition to validate different types of excellence. If one student truly dominates, consider giving them a "Hall of Fame" designation instead and awarding Best Delegate to someone else.

### Delegate Self-Assessments

Before the ceremony, have students complete a comprehensive self-assessment:

**Self-Assessment Questions:**
1. On a scale of 1-10, how confident are you in your MUN skills compared to the start of the season? Explain.
2. Which skill have you developed the most? Give a specific example.
3. Which skill do you still want to improve? What's your plan?
4. What was your most meaningful moment in MUN this year?
5. What would you tell a new student who's considering joining MUN?
6. What would you do differently if you could start the season over?
7. Are you interested in a leadership role next year? If so, which one and why?

**Using Self-Assessments:**
- Compare student self-assessments with your own observations — the gaps are revealing
- Use them to identify future leaders
- Share anonymized quotes at the ceremony to illustrate the program's impact

### Program Feedback Surveys

Collect honest feedback that will improve your program next year.

**Key Survey Questions:**
1. How would you rate the overall MUN program experience? (1-10)
2. What was the most valuable part of the program?
3. What was the least valuable part?
4. Were the meetings well-structured? What would you change?
5. Did you feel adequately prepared for conferences?
6. How would you rate the director's support and feedback? (1-10)
7. Would you recommend MUN to a friend? Why or why not?
8. What topics or skills should we add next year?
9. Any other suggestions for improvement?

TIP: Use an anonymous survey tool (Google Forms, etc.) to ensure honest responses. The feedback you get when students aren't worried about offending you is the most valuable feedback of all.

### The Celebration Event

**Event Structure (90 minutes):**

1. **Opening (10 min)** — Welcome, overview of the evening, and a highlight reel (slideshow or video of the season's best moments)
2. **Student Speeches (15 min)** — 2-3 students share reflections on the season
3. **Portfolio Showcase (20 min)** — Informal browsing of portfolios while enjoying refreshments
4. **Awards Ceremony (25 min)** — Present awards with brief, personalized citations
5. **Leadership Transition (10 min)** — Outgoing leaders pass the torch to incoming leaders
6. **Closing (10 min)** — Director's remarks, thank yous, and group photo

**Making It Special:**
- Invite parents, administrators, and guest speakers from the season
- Print certificates or small trophies for award recipients
- Create a "Season in Review" slideshow with photos from every meeting and conference
- Serve food — it transforms an event from a meeting into a celebration

KEY POINT: The end-of-season celebration is not just about looking back — it's about setting the stage for next year. When students leave the celebration feeling proud, valued, and excited to return, your program's future is secure.

CHECK: Do you have a date and venue for the celebration? Have you prepared awards and certificates? Have you collected student self-assessments and feedback? Have you identified next year's student leaders?

---`,
            type: "reading",
            duration: 25,
            order: 4,
            isPublished: true,
          },
        ],
      },
    },
  })

  console.log(`✅ Course 5 created: "${course5.title}" with 4 lessons`)

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n" + "=".repeat(60))
  console.log("📊 SEED SUMMARY: Teacher/Director Training Courses")
  console.log("=".repeat(60))

  const teacherCourses = await prisma.course.findMany({
    where: { targetRole: "TEACHER" },
    include: { lessons: { select: { id: true, title: true } } },
    orderBy: { order: "asc" },
  })

  let totalLessons = 0
  for (const course of teacherCourses) {
    console.log(
      `\n📚 ${course.title} (Order: ${course.order}, Category: ${course.category}, Difficulty: ${course.difficulty}, XP: ${course.xpReward})`
    )
    console.log(`   Lessons: ${course.lessons.length}`)
    for (const lesson of course.lessons) {
      console.log(`     - ${lesson.title}`)
    }
    totalLessons += course.lessons.length
  }

  console.log("\n" + "-".repeat(60))
  console.log(`Total courses created: ${teacherCourses.length}`)
  console.log(`Total lessons created: ${totalLessons}`)
  console.log(`Order range: ${teacherCourses[0]?.order} - ${teacherCourses[teacherCourses.length - 1]?.order}`)
  console.log("✅ Seed complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
