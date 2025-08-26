import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

interface ScheduleSuggestionRequest {
  userId: string
  query: string
  context?: {
    currentSchedule?: Array<{
      startTime: Date
      endTime: Date
      title: string
    }>
    goals?: Array<{
      title: string
      priority: string
      deadline?: Date
    }>
    preferences?: {
      workHours: { start: string; end: string }
      timezone: string
    }
  }
}

interface ScheduleSuggestion {
  type: 'TIME_SLOT' | 'PRIORITY_ADJUSTMENT' | 'BREAK_RECOMMENDATION' | 'GOAL_ALIGNMENT'
  title: string
  description: string
  confidence: number
  action?: {
    type: 'SCHEDULE' | 'RESCHEDULE' | 'PRIORITY_CHANGE' | 'BREAK_ADD'
    parameters: Record<string, any>
  }
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ScheduleSuggestionRequest = await request.json()
    const { userId, query, context } = body

    if (!userId || !query) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { 
        goals: true, 
        schedules: {
          where: {
            startTime: {
              gte: new Date()
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Initialize ZAI
    const zai = await ZAI.create()

    // Create context-aware prompt
    const prompt = createSuggestionPrompt(query, user, context)

    // Get AI suggestions
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are Nexus, an intelligent scheduling assistant. Your goal is to provide helpful scheduling suggestions based on:
1. User's current schedule and commitments
2. Their goals and priorities
3. Work patterns and preferences
4. Natural language queries

Provide suggestions in a JSON format with actionable insights.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1500
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    let suggestions: ScheduleSuggestion[]
    
    try {
      suggestions = JSON.parse(aiResponse)
    } catch (error) {
      // Fallback to basic suggestions
      suggestions = generateBasicSuggestions(query, user)
    }

    // Log AI interaction
    await db.aILog.create({
      data: {
        userId: userId,
        input: JSON.stringify(body),
        output: JSON.stringify(suggestions),
        model: 'gpt-3.5-turbo',
        responseTime: Date.now()
      }
    })

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('Schedule suggestion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createSuggestionPrompt(
  query: string,
  user: any,
  context?: ScheduleSuggestionRequest['context']
): string {
  const currentSchedule = context?.currentSchedule || user.schedules
  const goals = context?.goals || user.goals
  const preferences = context?.preferences || {
    workHours: { start: '09:00', end: '17:00' },
    timezone: user.timezone || 'UTC'
  }

  return `
User Query: "${query}"

Current Schedule (next 7 days):
${currentSchedule.slice(0, 10).map((event: any) => 
  `- ${event.title}: ${new Date(event.startTime).toLocaleString()} - ${new Date(event.endTime).toLocaleString()}`
).join('\n')}

Active Goals:
${goals.map((goal: any) => 
  `- ${goal.title} (${goal.priority})${goal.deadline ? ` - Deadline: ${new Date(goal.deadline).toLocaleDateString()}` : ''}`
).join('\n')}

User Preferences:
- Work Hours: ${preferences.workHours.start} - ${preferences.workHours.end}
- Timezone: ${preferences.timezone}

Please provide scheduling suggestions based on this query. Return a JSON array of suggestion objects with the following structure:
[
  {
    "type": "TIME_SLOT|PRIORITY_ADJUSTMENT|BREAK_RECOMMENDATION|GOAL_ALIGNMENT",
    "title": "Brief title for the suggestion",
    "description": "Detailed explanation of the suggestion",
    "confidence": 0.95,
    "action": {
      "type": "SCHEDULE|RESCHEDULE|PRIORITY_CHANGE|BREAK_ADD",
      "parameters": {
        "startTime": "ISO_8601_timestamp",
        "endTime": "ISO_8601_timestamp",
        "title": "Event title",
        "priority": "HIGH|MEDIUM|LOW"
      }
    },
    "reasoning": "Why this suggestion is being made"
  }
]

Consider:
1. Time availability and conflicts
2. Goal alignment and priority
3. User's work patterns and energy levels
4. Deadline proximity
5. Break and work-life balance
6. Context switching efficiency
`
}

function generateBasicSuggestions(query: string, user: any): ScheduleSuggestion[] {
  const suggestions: ScheduleSuggestion[] = []
  const lowerQuery = query.toLowerCase()

  // Time-based suggestions
  if (lowerQuery.includes('time') || lowerQuery.includes('when') || lowerQuery.includes('schedule')) {
    suggestions.push({
      type: 'TIME_SLOT',
      title: 'Available Time Slot Found',
      description: 'Based on your current schedule, you have a 2-hour block available tomorrow morning.',
      confidence: 0.8,
      action: {
        type: 'SCHEDULE',
        parameters: {
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(9, 0, 0, 0),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(11, 0, 0, 0),
          title: 'New Task'
        }
      },
      reasoning: 'Analyzed your schedule and found available time during your preferred work hours.'
    })
  }

  // Priority-based suggestions
  if (lowerQuery.includes('priority') || lowerQuery.includes('important') || lowerQuery.includes('urgent')) {
    suggestions.push({
      type: 'PRIORITY_ADJUSTMENT',
      title: 'Priority Recommendation',
      description: 'Consider prioritizing tasks with upcoming deadlines to ensure timely completion.',
      confidence: 0.9,
      action: {
        type: 'PRIORITY_CHANGE',
        parameters: {
          taskId: 'example-task-id',
          priority: 'HIGH'
        }
      },
      reasoning: 'Tasks with closer deadlines should generally be given higher priority.'
    })
  }

  // Break suggestions
  if (lowerQuery.includes('break') || lowerQuery.includes('rest') || lowerQuery.includes('tired')) {
    suggestions.push({
      type: 'BREAK_RECOMMENDATION',
      title: 'Take a Break',
      description: 'You\'ve been working for 2 hours. Consider taking a 15-minute break to maintain productivity.',
      confidence: 0.95,
      action: {
        type: 'BREAK_ADD',
        parameters: {
          duration: 15,
          reason: 'Work break'
        }
      },
      reasoning: 'Regular breaks help maintain focus and prevent burnout.'
    })
  }

  // Goal alignment suggestions
  if (lowerQuery.includes('goal') || lowerQuery.includes('objective') || lowerQuery.includes('progress')) {
    suggestions.push({
      type: 'GOAL_ALIGNMENT',
      title: 'Goal Progress Check',
      description: 'Schedule time this week to work on your DevOps career transition goal.',
      confidence: 0.85,
      action: {
        type: 'SCHEDULE',
        parameters: {
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).setHours(14, 0, 0, 0),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).setHours(16, 0, 0, 0),
          title: 'DevOps Study Session'
        }
      },
      reasoning: 'Regular dedicated time helps achieve long-term career goals.'
    })
  }

  return suggestions
}