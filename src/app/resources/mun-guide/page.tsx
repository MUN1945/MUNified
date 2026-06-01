'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Globe, BookOpen, Gavel, FileText, Mic,
  Handshake, Search, ArrowRight, GraduationCap, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const SECTIONS = [
  {
    icon: Globe,
    title: 'What is Model United Nations?',
    content: [
      'Model United Nations (MUN) is an educational simulation of the United Nations where students role-play as delegates representing member states, international organizations, or other entities. Participants debate global issues, draft resolutions, negotiate solutions, and practice the art of diplomacy — all while following the parliamentary procedures used in real UN committees.',
      'MUN conferences bring together students from diverse backgrounds to engage with complex international challenges, from climate change and human rights to global health and international security. It is one of the most respected and widely practiced educational activities in the world, with conferences held in over 100 countries.',
      'Beyond the committee room, MUN develops critical thinking, public speaking, research, negotiation, and leadership skills — competencies that serve students throughout their academic and professional careers.',
    ],
  },
  {
    icon: Users,
    title: 'How MUN Works',
    content: [
      'At a Model United Nations conference, each participant is assigned a country or role to represent in a specific committee. Committees simulate real UN bodies — such as the General Assembly, Security Council, Economic and Social Council, or specialized agencies like the World Health Organization. Some conferences also feature crisis committees, where delegates must respond to evolving, real-time scenarios.',
      'The committee session follows a structured flow: delegates research their assigned country\'s position on the agenda topics, deliver speeches, engage in formal debate, participate in unmoderated caucuses for informal negotiation, draft and amend working papers and resolutions, and vote on final documents. Every step follows parliamentary procedure — typically Robert\'s Rules of Order as adapted for MUN.',
      'A committee is led by a Chair (or Director) who manages the flow of debate, rules on procedural matters, and ensures that all delegates have the opportunity to participate. The Secretary-General oversees the entire conference and serves as the highest authority.',
    ],
  },
  {
    icon: GraduationCap,
    title: 'Key Skills for Delegates',
    content: [
      'Research & Analysis: Delegates must thoroughly research their assigned country\'s foreign policy, the agenda topics, relevant UN resolutions and treaties, and the positions of other member states. Strong research skills are the foundation of effective participation.',
      'Public Speaking & Persuasion: Whether delivering a formal speech to the committee or negotiating one-on-one during an unmoderated caucus, the ability to communicate clearly and persuasively is essential. Great delegates know how to adapt their message to their audience — building consensus among allies while persuading skeptics.',
      'Negotiation & Coalition-Building: MUN is not a solo activity. The most successful delegates build broad coalitions, find common ground between competing interests, and craft solutions that attract widespread support. This requires empathy, patience, and strategic thinking.',
      'Resolution Writing: Drafting effective resolutions — with properly structured preambulatory and operative clauses — is a core MUN skill. A well-written resolution demonstrates both substantive knowledge and the ability to translate ideas into actionable policy proposals.',
    ],
  },
  {
    icon: Gavel,
    title: 'Rules of Procedure',
    content: [
      'MUN committees typically use Robert\'s Rules of Order as adapted for Model United Nations. Understanding parliamentary procedure is essential for effective participation. Key concepts include: motions (formal proposals to take a specific action), points (requests or inquiries directed to the Chair), seconding (indicating support for a motion to proceed), and voting (deciding on motions and resolutions).',
      'Common motions include: Motion to Set the Agenda (determines which topic is discussed first), Motion for a Moderated Caucus (structured debate on a specific subtopic with timed speeches), Motion for an Unmoderated Caucus (informal time for negotiation and resolution drafting), Motion to Introduce a Draft Resolution (presents a resolution for committee consideration), and Motion to Adjourn the Session (ends the committee meeting).',
      'Points include: Point of Order (corrects a procedural error), Point of Parliamentary Inquiry (asks the Chair about procedure), and Point of Personal Privilege (addresses personal comfort, such as audibility). Understanding when and how to use these tools is a hallmark of an experienced delegate.',
    ],
  },
  {
    icon: Search,
    title: 'Research Tips',
    content: [
      'Start with the basics: Understand your assigned country\'s geography, government structure, economy, and key allies. Then dive deeper into its foreign policy positions, UN voting record, and membership in international organizations. The CIA World Factbook, UN Member State profiles, and your country\'s Ministry of Foreign Affairs website are excellent starting points.',
      'Study the agenda topics thoroughly: Read the committee\'s background guide (if provided), then explore UN resolutions, reports, and treaties related to the topic. The UN Digital Library (documents.un.org) is an invaluable resource. Pay special attention to recent developments, as they often shape the direction of debate.',
      'Evaluate your sources critically: Not all information is equally reliable. Prioritize primary sources (official UN documents, government publications, peer-reviewed research) over secondary or opinion-based sources. Always verify statistics and quotations before including them in your position paper or speeches.',
    ],
  },
  {
    icon: FileText,
    title: 'Resolution Writing',
    content: [
      'A Model United Nations resolution is a formal document that proposes solutions to the agenda topic. It consists of three parts: the heading (committee name, topic, sponsors, and signatories), preambulatory clauses (context and references to past actions), and operative clauses (specific actions and recommendations).',
      'Preambulatory clauses set the stage by referencing relevant UN documents, treaties, prior resolutions, and international agreements. Each clause begins with a preambulatory phrase (e.g., &quot;Recalling,&quot; &quot;Deeply concerned,&quot; &quot;Reaffirming&quot;) and ends with a comma. These clauses do not take action — they provide context and justification for the operative clauses.',
      'Operative clauses are the heart of the resolution — each one proposes a specific, actionable recommendation. They begin with an operative phrase (e.g., &quot;Urges,&quot; &quot;Calls upon,&quot; &quot;Requests,&quot; &quot;Decides&quot;) and are numbered sequentially. The strongest resolutions contain clear, realistic, and well-supported operative clauses that address the root causes of the issue, not just its symptoms.',
    ],
  },
  {
    icon: Mic,
    title: 'Speaking & Debate',
    content: [
      'Effective MUN speeches are structured, concise, and persuasive. Begin with a strong opening that captures attention — a powerful statistic, a relevant quote, or a compelling narrative. State your country\'s position clearly, support it with evidence and reasoning, and conclude with a call to action. Always speak in the third person as your country (e.g., &quot;The delegation of France believes...&quot; rather than &quot;I think...&quot;).',
      'Adapt your speaking style to the context. In formal debate, deliver polished, structured speeches with clear signposting. During moderated caucuses, be more dynamic and responsive to the ongoing discussion. In unmoderated caucuses, shift to a conversational, persuasive style focused on building coalitions and negotiating resolution language.',
      'Practice makes perfect. Rehearse your speeches to ensure they fit within the time limit. Use your speaking time efficiently — a concise, impactful speech is always more effective than a rambling one. And remember: great speakers are also great listeners. Pay attention to other delegates\' speeches so you can respond strategically and find opportunities for collaboration.',
    ],
  },
  {
    icon: Handshake,
    title: 'Diplomacy & Negotiation',
    content: [
      'Diplomacy is the art of building agreements between parties with different interests. In MUN, this means working with delegates who represent countries with vastly different priorities, resources, and political systems. The most effective delegates approach negotiation with an open mind, seeking to understand other perspectives before advocating their own.',
      'Successful coalition-building starts early. During the first unmoderated caucus, identify potential allies — countries that share your position or have complementary interests. Form a working group, establish shared goals, and begin drafting a resolution together. Be inclusive: the more sponsors and signatories your resolution has, the stronger its legitimacy.',
      'When negotiations stall, focus on shared interests rather than fixed positions. Use the &quot;interest-based negotiation&quot; approach: instead of demanding specific outcomes, explore the underlying concerns driving each delegation\'s position. Often, creative solutions can satisfy multiple interests simultaneously — and that is the essence of diplomatic problem-solving.',
    ],
  },
]

export default function MunGuidePage() {
  return (
    <div className="min-h-screen bg-white text-[#1B3A4B]">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0D7377] flex items-center justify-center shadow-md shadow-[#0D7377]/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1B3A4B]">
              Diplomati<span className="text-[#D4A843]">Q</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-[#0D7377] hover:text-[#0A5F63] font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D7377]/[0.03] via-white to-[#D4A843]/[0.03]" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#D4A843] rounded-full opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#0D7377] rounded-full opacity-[0.04] blur-[150px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D7377]/10 border border-[#0D7377]/20 text-[#0D7377] text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" /> Resource Guide
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1B3A4B] leading-[1.1]">
              Model United Nations <span className="text-[#0D7377]">Guide</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#1B3A4B]/70 leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about Model United Nations — from your first conference to mastering the art of diplomacy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0D7377]/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-5 h-5 text-[#0D7377]" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1B3A4B]">{section.title}</h2>
                </div>
                <div className="space-y-4 pl-0 md:pl-13">
                  {section.content.map((para, j) => (
                    <p key={j} className="text-[#1B3A4B]/75 leading-relaxed">{para}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B3A4B] mb-8">Quick Reference Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-100">
              <CardContent className="pt-6 pb-6 px-6">
                <h3 className="text-lg font-bold text-[#1B3A4B] mb-4">Common Preambulatory Phrases</h3>
                <div className="space-y-2 text-sm text-[#1B3A4B]/70">
                  {['Acknowledging', 'Alarmed by', 'Approving', 'Aware of', 'Bearing in mind', 'Concerned by', 'Confident', 'Convinced', 'Deeply concerned', 'Emphasizing', 'Expecting', 'Fully aware', 'Guided by', 'Having adopted', 'Keeping in mind', 'Noting with regret', 'Reaffirming', 'Recalling', 'Recognizing', 'Referring'].map((phrase) => (
                    <span key={phrase} className="inline-block mr-2 mb-1 px-2 py-0.5 bg-[#0D7377]/5 rounded text-[#0D7377] text-xs font-medium">{phrase}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-100">
              <CardContent className="pt-6 pb-6 px-6">
                <h3 className="text-lg font-bold text-[#1B3A4B] mb-4">Common Operative Phrases</h3>
                <div className="space-y-2 text-sm text-[#1B3A4B]/70">
                  {['Accepts', 'Affirms', 'Approves', 'Authorizes', 'Calls upon', 'Condemns', 'Confirms', 'Decides', 'Demands', 'Deplores', 'Designates', 'Emphasizes', 'Encourages', 'Endorses', 'Expresses its appreciation', 'Further invites', 'Notes', 'Proclaims', 'Recommends', 'Requests', 'Resolves', 'Strongly condemns', 'Suggests', 'Urges'].map((phrase) => (
                    <span key={phrase} className="inline-block mr-2 mb-1 px-2 py-0.5 bg-[#D4A843]/5 rounded text-[#D4A843] text-xs font-medium">{phrase}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#0D7377] to-[#0A5F63]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ready to Put These Skills Into Practice?
            </h2>
            <p className="mt-4 text-white/75 text-lg max-w-xl mx-auto">
              Join DiplomatiQ for AI-powered assessments, immersive training courses, and real conference experience.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-[#D4A843] text-[#1B3A4B] hover:bg-[#E0BC6A] font-semibold px-8 h-12 shadow-lg shadow-[#D4A843]/30">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="/#training">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12">
                  Explore Training
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#0D7377]" />
              <span className="text-sm font-bold text-[#1B3A4B]">
                Diplomati<span className="text-[#D4A843]">Q</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-xs text-[#1B3A4B]/50">
              <Link href="/legal/privacy" className="hover:text-[#0D7377] transition-colors">Privacy Policy</Link>
              <Link href="/legal/terms" className="hover:text-[#0D7377] transition-colors">Terms of Service</Link>
              <Link href="/legal/code-of-conduct" className="hover:text-[#0D7377] transition-colors">Code of Conduct</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
