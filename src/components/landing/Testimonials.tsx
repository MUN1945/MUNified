'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    quote: 'DiplomatiQ has completely transformed how we prepare our delegates. The AI assessments pinpoint exactly where students need to improve, and the training modules have increased our conference performance by 40%.',
    name: 'Dr. Sarah Al-Mansouri',
    role: 'MUN Director',
    school: 'American School of Dubai',
    location: 'Dubai, UAE',
    rating: 5,
    avatar: 'SA',
  },
  {
    quote: 'As a student, I went from being nervous about my first conference to winning Best Delegate at THIMUN. The Diplomatic Academy gave me the skills and confidence I needed to represent my country effectively.',
    name: 'Ahmed Hassan',
    role: 'Head Delegate',
    school: 'GEMS Wellington Academy',
    location: 'Abu Dhabi, UAE',
    rating: 5,
    avatar: 'AH',
  },
  {
    quote: 'Managing a 200-delegate conference used to take months of planning. With DiplomatiQ\'s Conference Command, we streamlined registration, committee assignments, and voting — all in one platform. It\'s a game-changer.',
    name: 'Priya Sharma',
    role: 'Secretary-General',
    school: 'Delhi Public School',
    location: 'New Delhi, India',
    rating: 5,
    avatar: 'PS',
  },
]

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 bg-[#FAFBFC]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-[#0D7377] rounded-full opacity-[0.03] blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-[#D4A843] rounded-full opacity-[0.03] blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#059669]/10 text-[#059669] text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0D1B2A] tracking-tight">
            Demo Testimonials — Sample Content
          </h2>
          <p className="mt-4 text-lg text-[#0D1B2A]/60 leading-relaxed">
            The following testimonials are placeholder examples for demonstration purposes only.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Card className="bg-white border-[#1B3A4B]/10 hover:border-[#0D7377]/30 hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
                <CardContent className="p-6 flex flex-col flex-1">
                  {/* Quote mark */}
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-[#0D7377]/20 group-hover:text-[#0D7377]/40 transition-colors" />
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 fill-[#D4A843] text-[#D4A843]"
                      />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="text-[#1B3A4B]/70 text-sm leading-relaxed flex-1 mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#1B3A4B]/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D7377] to-[#10908F] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#1B3A4B]">{testimonial.name}</div>
                      <div className="text-xs text-[#1B3A4B]/50">
                        {testimonial.role} · {testimonial.school}
                      </div>
                      <div className="text-xs text-[#0D7377]/60">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
