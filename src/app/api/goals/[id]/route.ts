import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/goals/[id] - Update a goal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, category, priority, targetDate, status, progress } = body

    const goal = await db.goal.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(priority && { priority }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(status && { status }),
        ...(progress !== undefined && { progress })
      },
      include: {
        milestones: true,
        tasks: true
      }
    })

    // Auto-calculate progress if not explicitly provided
    if (progress === undefined) {
      const calculatedProgress = calculateGoalProgress(goal)
      await db.goal.update({
        where: { id: params.id },
        data: { progress: calculatedProgress }
      })
      goal.progress = calculatedProgress
    }

    // Log the action
    await db.aILog.create({
      data: {
        userId: goal.userId,
        input: JSON.stringify({ action: 'update_goal', goalId: params.id, ...body }),
        output: JSON.stringify({ updatedGoal: goal }),
        model: 'goal-management',
        responseTime: Date.now()
      }
    })

    return NextResponse.json(goal)

  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/goals/[id] - Delete a goal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goal = await db.goal.delete({
      where: { id: params.id }
    })

    // Log the action
    await db.aILog.create({
      data: {
        userId: goal.userId,
        input: JSON.stringify({ action: 'delete_goal', goalId: params.id }),
        output: JSON.stringify({ deletedGoal: goal }),
        model: 'goal-management',
        responseTime: Date.now()
      }
    })

    return NextResponse.json({ message: 'Goal deleted successfully' })

  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateGoalProgress(goal: any): number {
  const milestones = goal.milestones || []
  const tasks = goal.tasks || []

  // Calculate milestone progress
  const completedMilestones = milestones.filter((m: any) => m.completed).length
  const milestoneProgress = milestones.length > 0 ? (completedMilestones / milestones.length) * 50 : 0

  // Calculate task progress
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length
  const taskProgress = tasks.length > 0 ? ((completedTasks + inProgressTasks * 0.5) / tasks.length) * 50 : 0

  return Math.round(milestoneProgress + taskProgress)
}