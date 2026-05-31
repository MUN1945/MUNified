'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Globe, Twitter, Linkedin, Youtube, Instagram, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  Platform: [
    { label: 'Diagnostic Assessment', href: '#assessment' },
    { label: 'Diplomatic Academy', href: '#training' },
    { label: 'Conference Command', href: '#features' },
    { label: 'Committee Hub', href: '#features' },
    { label: 'Intelligence Dashboard', href: '#features' },
  ],
  Resources: [
    { label: 'MUN Guide', href: '#training' },
    { label: 'Blog', href: '#features' },
    { label: 'Webinars', href: '#training' },
    { label: 'Help Center', href: '#features' },
    { label: 'API Documentation', href: '#pricing' },
  ],
  Company: [
    { label: 'About Us', href: '#features' },
    { label: 'Careers', href: '#features' },
    { label: 'Partners', href: '#features' },
    { label: 'Press Kit', href: '#features' },
    { label: 'Contact', href: 'mailto:modelunitednations45@gmail.com' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#pricing' },
    { label: 'Terms of Service', href: '#pricing' },
    { label: 'Cookie Policy', href: '#pricing' },
    { label: 'GDPR', href: '#pricing' },
    { label: 'Security', href: '#pricing' },
  ],
}

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/diplomatiq', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/diplomatiq', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/@diplomatiq', label: 'YouTube' },
  { icon: Instagram, href: 'https://instagram.com/diplomatiq', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0F2530] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <motion.div
          className="py-16 md:py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <a href="#" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#0D7377] flex items-center justify-center shadow-md shadow-[#0D7377]/30">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  Diplomati<span className="text-[#D4A843]">Q</span>
                </span>
              </a>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
                The all-in-one platform for Model United Nations. Training delegates, managing conferences,
                and building the next generation of diplomats.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <p className="text-sm font-medium text-white/75 mb-3">Stay updated</p>
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const input = e.currentTarget.querySelector('input'); if (input) { input.value = ''; } }}>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    required
                    className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 focus:border-[#0D7377]/50 focus:ring-[#0D7377]/20 h-10"
                  />
                  <Button type="submit" className="bg-[#0D7377] text-white hover:bg-[#10908F] shrink-0 h-10 px-4 shadow-md shadow-[#0D7377]/20">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/40 hover:text-[#D4A843] hover:border-[#D4A843]/30 hover:bg-[#D4A843]/10 transition-all duration-200"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-semibold text-sm text-white/80 mb-4">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/60 hover:text-[#D4A843] transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        <Separator className="bg-white/10" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} DiplomatiQ. All rights reserved.
          </p>
          <p className="text-xs text-white/50 flex items-center gap-1.5">
            Made with <span className="text-[#D4A843]">diplomatic precision</span>
            <Mail className="w-3 h-3" />
          </p>
        </div>
      </div>
    </footer>
  )
}
