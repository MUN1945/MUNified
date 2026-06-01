'use client'

import React from 'react'
import Link from 'next/link'
import { Globe } from 'lucide-react'

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you create an account on DiplomatiQ, we collect your full name, email address, school affiliation, grade level, and country of residence. For school administrator accounts, we additionally collect institutional verification documents and contact phone numbers.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you use the platform, including pages visited, features accessed, assessment responses, course progress, time spent on activities, and interaction patterns. This data helps us improve the platform experience and provide personalized learning recommendations.',
      },
      {
        subtitle: 'Device & Technical Information',
        text: 'We collect technical information about the devices and browsers used to access DiplomatiQ, including IP address, device type, operating system, browser version, screen resolution, and referring URLs. This information is collected automatically when you use our services.',
      },
      {
        subtitle: 'Communication Data',
        text: 'We store messages, chat communications, and feedback that you submit through the platform\'s communication features. This data is processed to provide messaging services and to maintain a safe and respectful community environment in accordance with our Code of Conduct.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        text: 'We use collected information to: provide and maintain the DiplomatiQ platform and its features; process assessment results and generate competency reports; deliver and track progress through training courses; manage conference registrations and delegate assignments; operate the Research Lab\'s AI-powered evaluation tools; personalize your learning experience and provide relevant recommendations; communicate with you about your account, platform updates, and educational opportunities; ensure platform security, prevent fraud, and enforce our Code of Conduct; comply with applicable laws and regulations; and improve our platform through research and analytics.',
      },
    ],
  },
  {
    title: '3. Data Storage & Security',
    content: [
      {
        text: 'Your data is stored on secure servers with industry-standard encryption (TLS 1.3 in transit, AES-256 at rest). We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Access to personal data is restricted to authorized personnel who require it to perform their duties, and all personnel are bound by confidentiality obligations.',
      },
      {
        text: 'We conduct regular security assessments and penetration testing to identify and address vulnerabilities. In the event of a data breach, we will notify affected users and the relevant data protection authorities within 72 hours, as required by applicable law.',
      },
    ],
  },
  {
    title: '4. Your Rights',
    content: [
      {
        text: 'Under applicable data protection laws, including UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data, you have the right to: access the personal data we hold about you; request correction of inaccurate or incomplete data; request deletion of your personal data (subject to legal retention requirements); object to or restrict the processing of your data; request data portability in a structured, machine-readable format; and withdraw consent at any time where processing is based on consent.',
      },
      {
        text: 'To exercise any of these rights, please contact us at modelunitednations45@gmail.com. We will respond to your request within 30 days.',
      },
    ],
  },
  {
    title: '5. Cookies & Tracking Technologies',
    content: [
      {
        text: 'DiplomatiQ uses cookies and similar tracking technologies to operate and improve our platform. Essential cookies are required for the platform to function properly, including session management and security features. Analytics cookies help us understand how users interact with the platform so we can improve the experience. You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of the platform.',
      },
    ],
  },
  {
    title: '6. Third-Party Services',
    content: [
      {
        text: 'We may share limited data with trusted third-party service providers who assist us in operating the platform, including: cloud hosting providers for data storage and processing; payment processors for subscription billing; analytics services for understanding platform usage; and communication services for sending notifications and emails. All third-party providers are contractually obligated to protect your data and use it only for the purposes we specify. We do not sell your personal data to any third party.',
      },
    ],
  },
  {
    title: '7. Children\'s Privacy',
    content: [
      {
        text: 'DiplomatiQ is designed for students participating in Model United Nations programs. Users under the age of 13 must have parental or guardian consent to register, in compliance with applicable child privacy laws. We collect only the information necessary to provide our educational services and take additional precautions to protect children\'s data, including restricting profile visibility, limiting communication features, and providing enhanced parental controls. Parents or guardians may review, modify, or delete their child\'s personal information by contacting us at modelunitednations45@gmail.com.',
      },
    ],
  },
  {
    title: '8. Data Retention',
    content: [
      {
        text: 'We retain your personal data for as long as your account is active or as needed to provide our services. If you delete your account, we will delete or anonymize your personal data within 90 days, except where we are required to retain certain information by law (such as for tax, accounting, or legal compliance purposes). Assessment results and academic records may be retained for up to 5 years to support credential verification.',
      },
    ],
  },
  {
    title: '9. International Data Transfers',
    content: [
      {
        text: 'DiplomatiQ operates primarily within the United Arab Emirates. However, some of our service providers may process data outside the UAE. In such cases, we ensure that appropriate safeguards are in place, including standard contractual clauses and adequacy determinations, to protect your data in accordance with UAE data protection law.',
      },
    ],
  },
  {
    title: '10. Changes to This Privacy Policy',
    content: [
      {
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes via email or a prominent notice on the platform. Your continued use of the platform after such changes constitutes acceptance of the updated policy.',
      },
    ],
  },
  {
    title: '11. Contact Us',
    content: [
      {
        text: 'If you have questions about this Privacy Policy or your personal data, please contact us at:',
      },
      {
        text: 'Email: modelunitednations45@gmail.com',
      },
      {
        text: 'For data protection inquiries specifically, please include "Privacy Inquiry" in your email subject line.',
      },
    ],
  },
]

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-[#1B3A4B]/60 text-lg">
            Last updated: March 2026
          </p>
          <p className="mt-2 text-[#1B3A4B]/70">
            This Privacy Policy describes how DiplomatiQ (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects your personal information when you use our platform. We are committed to protecting your privacy and complying with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data.
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
                    <div key={i}>
                      {para.subtitle && (
                        <h3 className="text-lg font-semibold text-[#1B3A4B] mb-2">{para.subtitle}</h3>
                      )}
                      <p className="text-[#1B3A4B]/75 leading-relaxed">{para.text}</p>
                    </div>
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
