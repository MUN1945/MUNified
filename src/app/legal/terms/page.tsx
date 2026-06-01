'use client'

import React from 'react'
import Link from 'next/link'
import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using the DiplomatiQ platform (&quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Platform. These Terms constitute a legally binding agreement between you and DiplomatiQ.',
      'We reserve the right to modify these Terms at any time. We will notify users of material changes via email or a prominent notice on the Platform. Your continued use of the Platform after such modifications constitutes acceptance of the revised Terms.',
      'These Terms apply to all users of the Platform, including delegates, teachers, school administrators, and any other individuals who access or use our services.',
    ],
  },
  {
    title: '2. Account Registration',
    content: [
      'To use certain features of the Platform, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as necessary. Each user may maintain only one active account.',
      'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account by contacting modelunitednations45@gmail.com.',
      'Users under the age of 13 must have parental or guardian consent to register. School administrator accounts require institutional verification. We reserve the right to suspend or terminate accounts that are registered with false information.',
    ],
  },
  {
    title: '3. User Conduct',
    content: [
      'You agree to use the Platform in compliance with the DiplomatiQ Code of Conduct, which establishes standards of behavior, professionalism, integrity, and respect for all participants. The Code of Conduct is incorporated into these Terms by reference.',
      'You agree not to: engage in plagiarism, academic dishonesty, or misrepresentation of work; submit content that is unlawful, harmful, threatening, abusive, harassing, defamatory, or discriminatory; attempt to gain unauthorized access to other users\' accounts or restricted areas of the Platform; use automated scripts, bots, or scraping tools to access or extract data; impersonate another individual or create accounts under false pretenses; share or distribute content that violates the intellectual property rights of others; or use the Platform for any purpose that is unlawful or prohibited by these Terms.',
      'Violations of the Code of Conduct or these Terms may result in warnings, temporary suspension, or permanent termination of your account, at our discretion.',
    ],
  },
  {
    title: '4. Intellectual Property',
    content: [
      'The DiplomatiQ Platform, including its software, design, text, graphics, logos, and all content provided by DiplomatiQ, is the property of DiplomatiQ and is protected by copyright, trademark, and other intellectual property laws.',
      'Content you submit to the Platform — including position papers, resolutions, and assessment responses — remains your intellectual property. By submitting content, you grant DiplomatiQ a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content solely for the purpose of providing and improving the Platform\'s services, including AI-powered evaluation and feedback.',
      'You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any content from the DiplomatiQ Platform without our express written permission. Course materials, assessment content, and educational resources provided through the Platform are licensed for your personal, non-commercial educational use only.',
    ],
  },
  {
    title: '5. Subscription & Payment',
    content: [
      'Certain features of the Platform require a paid subscription. By subscribing, you agree to pay the applicable fees as described on the pricing page. Subscription fees are billed in advance on a monthly or annual basis, depending on the plan selected.',
      'We offer a free trial period for new subscribers. At the end of the trial period, your subscription will automatically convert to a paid plan unless you cancel before the trial ends. You may cancel your subscription at any time through your account settings or by contacting support.',
      'Refund requests will be considered on a case-by-case basis. Annual subscriptions may be eligible for a pro-rated refund within the first 30 days. Monthly subscriptions are non-refundable after the billing period has begun. All refund requests should be directed to modelunitednations45@gmail.com.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    content: [
      'To the maximum extent permitted by applicable law, DiplomatiQ shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or educational opportunities, arising from your use of or inability to use the Platform.',
      'DiplomatiQ does not guarantee that the Platform will be uninterrupted, error-free, or free of harmful components. We provide the Platform &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      'Our total liability to you for any claims arising from or related to the Platform shall not exceed the total fees you have paid to DiplomatiQ in the twelve (12) months preceding the claim.',
    ],
  },
  {
    title: '7. Indemnification',
    content: [
      'You agree to indemnify and hold harmless DiplomatiQ, its officers, directors, employees, and agents from any claims, damages, losses, costs, or expenses (including reasonable legal fees) arising from your use of the Platform, your violation of these Terms, or your violation of any rights of another party.',
    ],
  },
  {
    title: '8. Termination',
    content: [
      'We reserve the right to suspend or terminate your account at any time, with or without cause, and with or without notice. Causes for termination include, but are not limited to, violation of these Terms, violation of the Code of Conduct, fraudulent activity, or conduct that is harmful to other users or the Platform.',
      'Upon termination, your right to use the Platform will immediately cease. We will provide a reasonable opportunity to export your data before account deletion, where feasible. Provisions of these Terms that by their nature should survive termination — including intellectual property, limitation of liability, and indemnification — shall remain in effect.',
    ],
  },
  {
    title: '9. Governing Law',
    content: [
      'These Terms are governed by and construed in accordance with the laws of the United Arab Emirates, without regard to its conflict of law principles. Any disputes arising from these Terms or your use of the Platform shall be resolved through good-faith negotiation. If negotiation fails, disputes shall be submitted to the exclusive jurisdiction of the courts of the United Arab Emirates.',
      'For users located outside the UAE, you agree that any disputes will be resolved in accordance with UAE law, and you consent to the personal jurisdiction of UAE courts for the purposes of resolving any disputes related to these Terms.',
    ],
  },
  {
    title: '10. General Provisions',
    content: [
      'These Terms constitute the entire agreement between you and DiplomatiQ regarding your use of the Platform. If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.',
      'Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waivers must be in writing and signed by DiplomatiQ.',
      'You may not assign or transfer these Terms or your rights under these Terms, in whole or in part, without our prior written consent. We may assign our rights and obligations under these Terms without restriction.',
    ],
  },
  {
    title: '11. Contact',
    content: [
      'If you have questions about these Terms of Service, please contact us at:',
      'Email: modelunitednations45@gmail.com',
      'Please include &quot;Terms Inquiry&quot; in your email subject line for a faster response.',
    ],
  },
]

export default function TermsPage() {
  const { t } = useI18n()
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

      {/* Header */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#0D7377]/[0.03] via-white to-[#D4A843]/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A4B] tracking-tight">
            {t('legal.termsOfService')}
          </h1>
          <p className="mt-4 text-[#1B3A4B]/60 text-lg">
            Last updated: March 2026
          </p>
          <p className="mt-2 text-[#1B3A4B]/70">
            These Terms of Service govern your access to and use of the DiplomatiQ platform. Please read them carefully before using our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-2xl font-bold text-[#1B3A4B] mb-4">{section.title}</h2>
                <div className="space-y-4">
                  {section.content.map((para, i) => (
                    <p key={i} className="text-[#1B3A4B]/75 leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            ))}
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
