import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SETUP_SECRET = 'diplomatiq-chat-setup-2026'

const DEFAULT_CHANNELS = [
  {
    name: 'general-assembly',
    description: 'General discussion for all delegates',
    type: 'text',
    category: 'General Assembly',
    isCommittee: false,
  },
  {
    name: 'announcements',
    description: 'Official announcements and updates',
    type: 'announcement',
    category: 'General Assembly',
    isCommittee: false,
  },
  {
    name: 'security-council',
    description: 'Security Council committee discussions and deliberations',
    type: 'committee',
    category: 'Security Council',
    isCommittee: true,
  },
  {
    name: 'crisis-committee',
    description: 'Crisis Committee — rapid response scenarios',
    type: 'committee',
    category: 'Security Council',
    isCommittee: true,
  },
  {
    name: 'arab-league',
    description: 'Arab League committee discussions',
    type: 'committee',
    category: 'Regional Bodies',
    isCommittee: true,
  },
  {
    name: 'african-union',
    description: 'African Union committee discussions',
    type: 'committee',
    category: 'Regional Bodies',
    isCommittee: true,
  },
  {
    name: 'study-group',
    description: 'Collaborative study sessions and resource sharing',
    type: 'study',
    category: 'Social & Study',
    isCommittee: false,
  },
  {
    name: 'networking',
    description: 'Connect with fellow delegates and advisors',
    type: 'text',
    category: 'Social & Study',
    isCommittee: false,
  },
]

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-setup-secret') || new URL(request.url).searchParams.get('secret')
    if (secret !== SETUP_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup secret' },
        { status: 403 }
      )
    }

    const results: { botUser: string; channels: string[]; skipped: string[] } = {
      botUser: '',
      channels: [],
      skipped: [],
    }

    const existingBot = await db.user.findFirst({
      where: { isBot: true, email: 'diplomatiq-guru@system.diplomatiq.com' },
    })

    if (existingBot) {
      results.botUser = existingBot.id
    } else {
      const botUser = await db.user.create({
        data: {
          email: 'diplomatiq-guru@system.diplomatiq.com',
          name: 'DiplomatiQ Guru',
          password: 'bot-no-login-' + Date.now(),
          role: 'ADMIN',
          isBot: true,
          isActive: true,
          emailVerified: true,
        },
      })
      results.botUser = botUser.id
    }

    for (const channelDef of DEFAULT_CHANNELS) {
      const existing = await db.channel.findFirst({
        where: { name: channelDef.name, schoolId: null },
      })

      if (existing) {
        results.skipped.push(channelDef.name)
        continue
      }

      const channel = await db.channel.create({
        data: {
          name: channelDef.name,
          description: channelDef.description,
          type: channelDef.type,
          category: channelDef.category,
          isCommittee: channelDef.isCommittee,
          schoolId: null,
        },
      })
      results.channels.push(channel.name)
    }

    return NextResponse.json({
      success: true,
      message: 'Chat setup completed',
      results,
    })
  } catch (error) {
    console.error('Chat setup error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set up chat' },
      { status: 500 }
    )
  }
}
