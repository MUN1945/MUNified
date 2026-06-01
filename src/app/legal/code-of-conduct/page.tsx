'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Globe, Shield, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SECTIONS, CODE_OF_CONDUCT_VERSION, CODE_OF_CONDUCT_EFFECTIVE, TOTAL_SECTIONS, INTRODUCTION } from '@/lib/conduct/sections'

export default function CodeOfConductPage() {
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
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#0D7377] rounded-full opacity-[0.04] blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D7377]/10 border border-[#0D7377]/20 text-[#0D7377] text-sm font-medium mb-6">
              <Shield className="w-4 h-4" /> Code of Conduct
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1B3A4B] leading-[1.1]">
              DiplomatiQ <span className="text-[#0D7377]">Code of Conduct</span>
            </h1>
            <p className="mt-6 text-lg text-[#1B3A4B]/70 leading-relaxed max-w-2xl mx-auto">
              Version {CODE_OF_CONDUCT_VERSION} — Effective {CODE_OF_CONDUCT_EFFECTIVE}. {TOTAL_SECTIONS} sections establishing the standards of behavior, professionalism, integrity, and respect for all participants.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#1B3A4B] mb-4">Introduction</h2>
            <p className="text-[#1B3A4B]/75 leading-relaxed">{INTRODUCTION}</p>
          </div>
        </div>
      </section>

      {/* Sections Overview */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B3A4B] mb-8">
            {TOTAL_SECTIONS} Sections Covering All Aspects of Conduct
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
              >
                <Card className="border-gray-100 hover:border-[#0D7377]/15 hover:shadow-md hover:shadow-[#0D7377]/5 transition-all duration-300 h-full">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-bold text-[#0D7377] bg-[#0D7377]/10 rounded-md px-2 py-1 shrink-0">
                        {`§${i + 1}`}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-[#1B3A4B]">{section.title}</h3>
                        <p className="text-xs text-[#1B3A4B]/60 mt-1 leading-relaxed">{section.description}</p>
                        <p className="text-[10px] text-[#0D7377]/70 mt-2">
                          {section.rules.length} rule{section.rules.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary of Key Rules */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1B3A4B] mb-8">Key Principles</h2>
          <div className="space-y-4">
            {[
              'Uphold the values of the United Nations — human rights, dignity, and peaceful resolution of disputes.',
              'Academic integrity is paramount — plagiarism, fabrication, and dishonesty are strictly prohibited.',
              'Treat all participants with courtesy, professionalism, and respect regardless of background.',
              'AI tools may be used responsibly — with disclosure and a maximum 25% contribution threshold.',
              'Respect parliamentary procedure and the authority of committee chairs.',
              'Contribute to an inclusive, welcoming environment free from discrimination.',
              'Report violations through appropriate channels without fear of retaliation.',
            ].map((principle, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-gray-100">
                <CheckCircle2 className="w-5 h-5 text-[#0D7377] shrink-0 mt-0.5" />
                <p className="text-[#1B3A4B]/80 text-sm leading-relaxed">{principle}</p>
              </div>
            ))}
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
              Join a Platform Built on Integrity
            </h2>
            <p className="mt-4 text-white/75 text-lg max-w-xl mx-auto">
              Sign up to access the full Code of Conduct, track your compliance, and become part of a community that values diplomatic excellence.
            </p>
            <div className="mt-8">
              <Link href="/auth/register">
                <Button size="lg" className="bg-[#D4A843] text-[#1B3A4B] hover:bg-[#E0BC6A] font-semibold px-8 h-12 shadow-lg shadow-[#D4A843]/30">
                  Sign Up for DiplomatiQ <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
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
