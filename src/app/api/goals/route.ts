import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// GET /api/goals - Get all goals for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const goals = await db.goal.findMany({
      where: { userId },
      include: {
        milestones: {
          orderBy: { dueDate: 'asc' }
        },
        tasks: {
          orderBy: { dueDate: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(goals)

  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      title, 
      description, 
      category, 
      priority, 
      targetDate,
      generateRoadmap = false 
    } = body

    if (!userId || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the goal
    const goal = await db.goal.create({
      data: {
        userId,
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        targetDate: targetDate ? new Date(targetDate) : null,
        progress: 0,
        status: 'ACTIVE'
      }
    })

    // Generate AI-powered roadmap if requested
    if (generateRoadmap) {
      try {
        await generateGoalRoadmap(goal.id, userId, title, description, category, targetDate)
      } catch (error) {
        console.error('Error generating roadmap:', error)
        // Continue even if roadmap generation fails
      }
    }

    // Log the action
    await db.aILog.create({
      data: {
        userId,
        input: JSON.stringify({ action: 'create_goal', ...body }),
        output: JSON.stringify({ goalId: goal.id }),
        model: 'goal-management',
        responseTime: Date.now()
      }
    })

    return NextResponse.json(goal)

  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateGoalRoadmap(
  goalId: string,
  userId: string,
  title: string,
  description: string,
  category: string,
  targetDate?: Date
) {
  const zai = await ZAI.create()

  const prompt = `
Create a step-by-step roadmap for the following goal:

Goal Title: ${title}
Description: ${description}
Category: ${category}
Target Date: ${targetDate ? new Date(targetDate).toLocaleDateString() : 'Not specified'}

Please provide a JSON response with milestones and tasks in the following format:
{
  "milestones": [
    {
      "title": "Milestone title",
      "description": "Milestone description",
      "estimatedDuration": 30, // in days
      "dependencies": [] // array of milestone indices this depends on
    }
  ],
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "estimatedDuration": 120, // in minutes
      "priority": "HIGH|MEDIUM|LOW",
      "milestoneIndex": 0 // which milestone this task belongs to
    }
  ]
}

Consider:
1. Logical progression of steps
2. Dependencies between milestones
3. Realistic time estimates
4. Category-specific best practices
5. Break down large goals into manageable tasks
`

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert goal-setting and project planning assistant. Create detailed, actionable roadmaps that help users achieve their goals effectively.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 2000
  })

  const aiResponse = completion.choices[0]?.message?.content
  if (!aiResponse) {
    throw new Error('No response from AI')
  }

  const roadmap = JSON.parse(aiResponse)

  // Create milestones
  for (let i = 0; i < roadmap.milestones.length; i++) {
    const milestone = roadmap.milestones[i]
    const dueDate = targetDate ? new Date(targetDate) : new Date()
    dueDate.setDate(dueDate.getDate() - (roadmap.milestones.length - i - 1) * milestone.estimatedDuration)

    await db.milestone.create({
      data: {
        title: milestone.title,
        description: milestone.description,
        dueDate,
        goalId
      }
    })
  }

  // Create tasks
  for (const task of roadmap.tasks) {
    await db.task.create({
      data: {
        title: task.title,
        description: task.description,
        estimatedDuration: task.estimatedDuration,
        priority: task.priority,
        goalId
      }
    })
  }
}