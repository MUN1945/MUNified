'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, ChevronDown, HelpCircle, Settings, CreditCard,
  BookOpen, MessageCircle, Mail, ArrowRight, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const FAQ_CATEGORIES = [
  {
    icon: HelpCircle,
    title: 'Getting Started',
    questions: [
      {
        q: 'What is DiplomatiQ?',
        a: 'DiplomatiQ is an all-in-one platform for Model United Nations. It provides AI-powered assessments, immersive training courses through the DiplomatiQ Academy, conference management tools, research paper evaluation, and gamified progress tracking — everything students, educators, and institutions need for MUN programs.',
      },
      {
        q: 'How do I create an account?',
        a: 'Visit the registration page and choose your role: Delegate (student), Director (teacher/advisor), or School Administrator. You\'ll need to provide your name, email, school affiliation, and grade level. Students under 13 require parental consent. School administrators will need to verify their institutional affiliation.',
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! DiplomatiQ offers a 24-hour free trial for new users. You can explore the platform, take the diagnostic assessment, and preview training courses before committing to a subscription. No credit card is required to start your trial.',
      },
      {
        q: 'What roles are available on the platform?',
        a: 'There are three main roles: Delegate (for students participating in MUN), Director (for teachers and MUN advisors), and School Administrator (for managing institutional accounts and student rosters). Each role has tailored features and dashboards designed for their specific needs.',
      },
    ],
  },
  {
    icon: Settings,
    title: 'Account & Profile',
    questions: [
      {
        q: 'How do I update my profile information?',
        a: 'Navigate to your profile settings from the dashboard. You can update your name, profile photo, school affiliation, and contact preferences. Note that some information, such as your registered email, may require verification before the change takes effect.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Forgot Password" on the sign-in page and enter your registered email address. You\'ll receive a password reset link within a few minutes. If you don\'t see the email, check your spam folder. For further assistance, contact support at modelunitednations45@gmail.com.',
      },
      {
        q: 'Can I change my account role?',
        a: 'Account roles are assigned during registration and are tied to your verification status. If you need to change your role (e.g., from Delegate to Director), please contact support with your request and any required verification documents.',
      },
      {
        q: 'How do I delete my account?',
        a: 'You can request account deletion through your profile settings. Your data will be permanently removed within 90 days, except where retention is required by law. Please note that this action is irreversible and you will lose access to all your assessment results, course progress, and certificates.',
      },
    ],
  },
  {
    icon: BookOpen,
    title: 'Assessment & Training',
    questions: [
      {
        q: 'What is the 7-tier assessment system?',
        a: 'The DiplomatiQ assessment system evaluates your MUN competency across seven progressive tiers: Basic Delegate (T1), Advanced Delegate (T2), Committee Leader (T3), Chair (T4), Under-Secretary-General (T5), Deputy Secretary-General (T6), and Secretary-General (T7). The diagnostic assessment identifies your current tier and provides a personalized growth roadmap.',
      },
      {
        q: 'How do training courses work?',
        a: 'The DiplomatiQ Academy offers 8 immersive courses covering parliamentary procedure, resolution writing, crisis committee protocols, diplomatic negotiation, public speaking, research methodology, chair training, and secretary-general leadership. Each course includes video lessons, interactive exercises, quizzes, and practical assignments. Progress is tracked automatically and contributes to your XP and badge collection.',
      },
      {
        q: 'Can I retake an assessment?',
        a: 'Yes, you can retake assessments after a 30-day cooldown period. This gives you time to study and improve your skills between attempts. Your best score is always displayed on your profile.',
      },
      {
        q: 'What is the Research Lab?',
        a: 'The Research Lab is an AI-powered tool that evaluates research papers and position papers for originality, citation quality, argument strength, and alignment with MUN standards. It provides detailed feedback and improvement recommendations to help you produce higher-quality work.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Billing & Pricing',
    questions: [
      {
        q: 'What plans are available?',
        a: 'We offer three plans: Delegate Pro ($11/month) for individual delegates with full platform access, Director Pro ($29/month) for teachers and advisors with student analytics and class management, and School Enterprise ($99/month) for institutions with unlimited seats and conference management. Annual billing saves 20%.',
      },
      {
        q: 'How do I cancel my subscription?',
        a: 'You can cancel your subscription at any time through your account settings. Your access will continue until the end of your current billing period. We don\'t charge cancellation fees. Monthly subscriptions are non-refundable after the billing period begins, but annual subscriptions may be eligible for a pro-rated refund within the first 30 days.',
      },
      {
        q: 'Do you offer discounts for schools?',
        a: 'Yes! Our School Enterprise plan provides the best value for institutions, with unlimited student seats, custom branding, and a dedicated account manager. Contact us at modelunitednations45@gmail.com for custom pricing based on your institution\'s size and needs.',
      },
    ],
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[#1B3A4B] group-hover:text-[#0D7377] transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#1B3A4B]/40 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-[#1B3A4B]/70 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0)

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
      <section className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D7377]/[0.03] via-white to-[#D4A843]/[0.02]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D7377]/10 border border-[#0D7377]/20 text-[#0D7377] text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" /> Help Center
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1B3A4B]">
              How can we help?
            </h1>
            <p className="mt-4 text-lg text-[#1B3A4B]/70">
              Find answers to common questions about DiplomatiQ, your account, assessments, training, and billing.
            </p>
            <div className="mt-8 max-w-lg mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B3A4B]/40" />
              <Input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-[#0D7377]/30 focus:ring-[#0D7377]/20"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, title: 'MUN Guide', desc: 'Learn the fundamentals of Model United Nations', href: '/resources/mun-guide' },
              { icon: MessageCircle, title: 'Contact Support', desc: 'Get help from our team directly', href: 'mailto:modelunitednations45@gmail.com' },
              { icon: Settings, title: 'Account Settings', desc: 'Manage your profile and preferences', href: '/dashboard' },
            ].map((link) => (
              <a key={link.title} href={link.href}>
                <Card className="border-gray-100 hover:border-[#0D7377]/15 hover:shadow-md hover:shadow-[#0D7377]/5 transition-all duration-300 h-full">
                  <CardContent className="py-5 px-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0D7377]/10 flex items-center justify-center shrink-0">
                      <link.icon className="w-5 h-5 text-[#0D7377]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#1B3A4B]">{link.title}</h3>
                      <p className="text-xs text-[#1B3A4B]/60 mt-1">{link.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-[#1B3A4B]/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1B3A4B] mb-2">No results found</h3>
              <p className="text-[#1B3A4B]/60">Try a different search term or browse the categories below.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#0D7377]/10 flex items-center justify-center">
                      <category.icon className="w-4 h-4 text-[#0D7377]" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1B3A4B]">{category.title}</h2>
                  </div>
                  <Card className="border-gray-100">
                    <CardContent className="px-6 py-0">
                      {category.questions.map((faq) => (
                        <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#1B3A4B] mb-4">Still Need Help?</h2>
          <p className="text-[#1B3A4B]/70 mb-8 max-w-lg mx-auto">
            Our team is here to assist you. Reach out and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:modelunitednations45@gmail.com">
              <Button size="lg" className="bg-[#0D7377] text-white hover:bg-[#0A5F63] font-semibold px-8 h-12 shadow-md shadow-[#0D7377]/20">
                <Mail className="w-4 h-4 mr-2" /> Email Support
              </Button>
            </a>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="border-[#0D7377]/30 text-[#0D7377] hover:bg-[#0D7377]/5 font-semibold px-8 h-12">
                Create an Account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
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
