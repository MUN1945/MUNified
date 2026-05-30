import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, title } = body

    if (!content || typeof content !== 'string' || content.trim().length < 50) {
      return NextResponse.json(
        { error: 'Paper content must be at least 50 characters long.' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert academic evaluator specializing in Model United Nations research papers. Analyze the submitted paper and provide a detailed evaluation. You must return a JSON object with these exact fields:
{
  "overallScore": number (0-100),
  "strengths": string[] (3-5 items),
  "weaknesses": string[] (3-5 items),
  "recommendations": string[] (3-5 items),
  "citationQuality": { "score": number (0-100), "analysis": string },
  "researchDepth": { "score": number (0-100), "analysis": string },
  "writingQuality": { "score": number (0-100), "analysis": string },
  "diplomacyRelevance": { "score": number (0-100), "analysis": string },
  "argumentQuality": { "score": number (0-100), "analysis": string },
  "analyticalThinking": { "score": number (0-100), "analysis": string },
  "aiDetection": { "aiContentPercentage": number (0-100), "confidence": number (0-100), "flaggedSections": string[] },
  "originalityScore": number (0-100),
  "authenticityScore": number (0-100),
  "improvementRoadmap": { "shortTerm": string[], "mediumTerm": string[], "longTerm": string[] }
}

Important guidelines:
- Score fairly but rigorously. A score of 70+ should indicate genuinely good work.
- AI detection should look for: repetitive patterns, overly formal/sterile language, lack of personal voice, generic transitions, absence of specific examples, perfectly balanced paragraph structures.
- The AI content percentage threshold is 25%. Flag anything above this.
- Citation quality should assess: presence, format consistency, relevance, and completeness.
- Research depth should evaluate: source variety, primary vs secondary sources, depth of engagement.
- Writing quality should assess: clarity, organization, grammar, transitions, conciseness.
- Diplomacy relevance should measure: connection to MUN topics, understanding of diplomatic processes, policy feasibility.
- Argument quality should evaluate: logical coherence, evidence support, counter-argument engagement.
- Analytical thinking should assess: critical evaluation, synthesis, original insights, depth beyond description.

Return ONLY valid JSON, no markdown or extra text.`,
        },
        {
          role: 'user',
          content: `Please evaluate the following MUN research paper${title ? ` titled "${title}"` : ''}:\n\n${content}`,
        },
      ],
      temperature: 0.3,
    })

    // Extract the JSON from the response
    const responseText = completion.choices?.[0]?.message?.content || ''

    // Try to parse the JSON response
    let evaluation
    try {
      // Handle cases where the response might be wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText
      evaluation = JSON.parse(jsonStr.trim())
    } catch {
      // If parsing fails, return a structured error
      return NextResponse.json(
        { error: 'Failed to parse AI evaluation response.' },
        { status: 500 }
      )
    }

    // Validate the evaluation has required fields
    const requiredFields = ['overallScore', 'strengths', 'weaknesses', 'recommendations',
      'citationQuality', 'researchDepth', 'writingQuality', 'diplomacyRelevance',
      'argumentQuality', 'analyticalThinking', 'aiDetection', 'originalityScore',
      'authenticityScore', 'improvementRoadmap']

    const missingFields = requiredFields.filter(f => !(f in evaluation))
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `AI evaluation missing fields: ${missingFields.join(', ')}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ evaluation })
  } catch (error) {
    console.error('Research evaluation error:', error)
    return NextResponse.json(
      { error: 'An error occurred during evaluation. Please try again.' },
      { status: 500 }
    )
  }
}
