import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface ScheduleRequest {
  tasks: Array<{
    id: string
    title: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    estimatedDuration: number // in minutes
    deadline?: Date
    preferredTime?: { start: Date; end: Date }
  }>
  existingEvents: Array<{
    id: string
    title: string
    startTime: Date
    endTime: Date
    isFixed: boolean
  }>
  workingHours: {
    start: string // HH:mm format
    end: string // HH:mm format
    timeZone: string
  }
  breakTimes: Array<{
    start: string // HH:mm format
    end: string // HH:mm format
    duration: number // in minutes
  }>
  userPreferences: {
    maxContinuousWork: number // in minutes
    preferredTaskTypes: string[]
    energyLevels: Array<{
      time: string // HH:mm format
      level: 'LOW' | 'MEDIUM' | 'HIGH'
    }>
  }
}

interface OptimizedSchedule {
  tasks: Array<{
    id: string
    title: string
    scheduledStart: Date
    scheduledEnd: Date
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    confidence: number // 0-1
    reasoning: string
  }>
  unscheduledTasks: string[]
  totalScheduledTime: number
  efficiency: number
  suggestions: string[]
}

const priorityWeights = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4
}

const energyLevelWeights = {
  LOW: 0.5,
  MEDIUM: 1,
  HIGH: 1.5
}

export async function POST(request: NextRequest) {
  try {
    const body: ScheduleRequest = await request.json()
    
    // Initialize ZAI SDK
    const zai = await ZAI.create()
    
    // Create AI prompt for schedule optimization
    const aiPrompt = createOptimizationPrompt(body)
    
    // Get AI recommendations
    const aiResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert scheduling AI assistant for Nexus. Your task is to optimize schedules based on:
          - Task priorities and deadlines
          - User's working hours and energy levels
          - Existing fixed commitments
          - User preferences for work patterns
          - Break times and work-life balance
          
          Respond with a JSON object containing optimized schedule, reasoning, and suggestions.`
        },
        {
          role: 'user',
          content: aiPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    // Parse AI response
    const aiRecommendations = JSON.parse(aiResponse.choices[0].message.content || '{}')
    
    // Apply algorithmic optimization
    const optimizedSchedule = optimizeScheduleAlgorithm(body, aiRecommendations)
    
    return NextResponse.json(optimizedSchedule)
  } catch (error) {
    console.error('Schedule optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize schedule' },
      { status: 500 }
    )
  }
}

function createOptimizationPrompt(request: ScheduleRequest): string {
  const { tasks, existingEvents, workingHours, breakTimes, userPreferences } = request
  
  return `
    Please optimize the following schedule:

    TASKS:
    ${tasks.map(task => `
      - ${task.title} (Priority: ${task.priority}, Duration: ${task.estimatedDuration}min${task.deadline ? `, Deadline: ${task.deadline}` : ''})
    `).join('\n')}

    EXISTING EVENTS:
    ${existingEvents.map(event => `
      - ${event.title} (${event.startTime} - ${event.endTime})${event.isFixed ? ' [FIXED]' : ''}
    `).join('\n')}

    WORKING HOURS: ${workingHours.start} - ${workingHours.end} (${workingHours.timeZone})
    
    BREAK TIMES:
    ${breakTimes.map(breakTime => `
      - ${breakTime.start} - ${breakTime.end} (${breakTime.duration}min)
    `).join('\n')}

    USER PREFERENCES:
    - Max continuous work: ${userPreferences.maxContinuousWork} minutes
    - Energy levels throughout day:
      ${userPreferences.energyLevels.map(level => `
        - ${level.time}: ${level.level}
      `).join('\n')}

    Please provide:
    1. Optimized schedule with specific time slots
    2. Reasoning for each scheduling decision
    3. Confidence scores (0-1) for each scheduled task
    4. Suggestions for improving productivity
    5. List of any tasks that couldn't be scheduled

    Respond in JSON format with the following structure:
    {
      "tasks": [
        {
          "id": "task_id",
          "scheduledStart": "ISO_8601_timestamp",
          "scheduledEnd": "ISO_8601_timestamp",
          "confidence": 0.8,
          "reasoning": "Explanation of scheduling decision"
        }
      ],
      "unscheduledTasks": ["task_id1", "task_id2"],
      "suggestions": ["suggestion1", "suggestion2"],
      "efficiency": 0.85
    }
  `
}

function optimizeScheduleAlgorithm(request: ScheduleRequest, aiRecommendations: any): OptimizedSchedule {
  const { tasks, existingEvents, workingHours, breakTimes, userPreferences } = request
  
  // Sort tasks by priority and deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    // First by priority
    const priorityDiff = priorityWeights[b.priority] - priorityWeights[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Then by deadline (if exists)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }
    
    // Finally by estimated duration (shorter tasks first for better fitting)
    return a.estimatedDuration - b.estimatedDuration
  })
  
  // Get available time slots
  const availableSlots = getAvailableTimeSlots(existingEvents, workingHours, breakTimes)
  
  // Schedule tasks
  const scheduledTasks: any[] = []
  const unscheduledTasks: string[] = []
  
  for (const task of sortedTasks) {
    let bestSlot: any = null
    let bestScore = -1
    
    // Find the best available slot for this task
    for (const slot of availableSlots) {
      if (slot.duration >= task.estimatedDuration) {
        const score = calculateSlotScore(slot, task, userPreferences)
        
        if (score > bestScore) {
          bestScore = score
          bestSlot = slot
        }
      }
    }
    
    if (bestSlot) {
      // Schedule the task
      const scheduledStart = new Date(bestSlot.start)
      const scheduledEnd = new Date(scheduledStart.getTime() + task.estimatedDuration * 60000)
      
      scheduledTasks.push({
        id: task.id,
        title: task.title,
        scheduledStart,
        scheduledEnd,
        priority: task.priority,
        confidence: Math.min(bestScore, 1),
        reasoning: `Scheduled based on priority (${task.priority}) and optimal time slot`
      })
      
      // Remove the used time from available slots
      const slotIndex = availableSlots.indexOf(bestSlot)
      if (slotIndex > -1) {
        const remainingDuration = bestSlot.duration - task.estimatedDuration
        if (remainingDuration > 0) {
          availableSlots[slotIndex] = {
            ...bestSlot,
            start: scheduledEnd,
            duration: remainingDuration
          }
        } else {
          availableSlots.splice(slotIndex, 1)
        }
      }
    } else {
      unscheduledTasks.push(task.id)
    }
  }
  
  // Calculate total scheduled time and efficiency
  const totalScheduledTime = scheduledTasks.reduce((total, task) => {
    return total + (task.scheduledEnd.getTime() - task.scheduledStart.getTime()) / 60000
  }, 0)
  
  const totalTaskTime = tasks.reduce((total, task) => total + task.estimatedDuration, 0)
  const efficiency = totalTaskTime > 0 ? totalScheduledTime / totalTaskTime : 0
  
  // Generate suggestions
  const suggestions = generateSuggestions(scheduledTasks, unscheduledTasks, request)
  
  return {
    tasks: scheduledTasks,
    unscheduledTasks,
    totalScheduledTime,
    efficiency,
    suggestions
  }
}

function getAvailableTimeSlots(existingEvents: any[], workingHours: any, breakTimes: any[]): any[] {
  const slots: any[] = []
  
  // Parse working hours
  const [workStartHour, workStartMinute] = workingHours.start.split(':').map(Number)
  const [workEndHour, workEndMinute] = workingHours.end.split(':').map(Number)
  
  // Create time slots for the next 7 days
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() + day)
    currentDate.setHours(workStartHour, workStartMinute, 0, 0)
    
    const workEnd = new Date(currentDate)
    workEnd.setHours(workEndHour, workEndMinute, 0, 0)
    
    // Get events for this day
    const dayEvents = existingEvents.filter(event => {
      const eventStart = new Date(event.startTime)
      const eventEnd = new Date(event.endTime)
      return eventStart.toDateString() === currentDate.toDateString()
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    
    let currentTime = new Date(currentDate)
    
    // Add slots between events
    for (const event of dayEvents) {
      const eventStart = new Date(event.startTime)
      const eventEnd = new Date(event.endTime)
      
      if (currentTime < eventStart) {
        const duration = (eventStart.getTime() - currentTime.getTime()) / 60000
        if (duration > 15) { // Only add slots longer than 15 minutes
          slots.push({
            start: new Date(currentTime),
            end: new Date(eventStart),
            duration
          })
        }
      }
      
      currentTime = new Date(eventEnd)
    }
    
    // Add slot after last event
    if (currentTime < workEnd) {
      const duration = (workEnd.getTime() - currentTime.getTime()) / 60000
      if (duration > 15) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(workEnd),
          duration
        })
      }
    }
  }
  
  return slots
}

function calculateSlotScore(slot: any, task: any, userPreferences: any): number {
  let score = 0.5 // Base score
  
  // Priority bonus
  score += priorityWeights[task.priority] * 0.1
  
  // Energy level bonus
  const slotHour = slot.start.getHours()
  const slotMinute = slot.start.getMinutes()
  const timeString = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`
  
  const energyLevel = userPreferences.energyLevels.find(level => {
    const [levelHour, levelMinute] = level.time.split(':').map(Number)
    return levelHour === slotHour && Math.abs(levelMinute - slotMinute) <= 30
  })
  
  if (energyLevel) {
    score += energyLevelWeights[energyLevel.level] * 0.2
  }
  
  // Duration fit bonus (prefer slots that are not too tight)
  const fitRatio = task.estimatedDuration / slot.duration
  if (fitRatio <= 0.8) {
    score += 0.1
  } else if (fitRatio <= 0.95) {
    score += 0.05
  }
  
  // Time of day preferences
  if (slotHour >= 9 && slotHour <= 11) {
    score += 0.1 // Morning bonus
  } else if (slotHour >= 14 && slotHour <= 16) {
    score += 0.05 // Afternoon bonus
  }
  
  return Math.min(score, 1)
}

function generateSuggestions(scheduledTasks: any[], unscheduledTasks: string[], request: ScheduleRequest): string[] {
  const suggestions: string[] = []
  
  // Analyze scheduled tasks
  const highPriorityTasks = scheduledTasks.filter(task => task.priority === 'HIGH' || task.priority === 'URGENT')
  const morningTasks = scheduledTasks.filter(task => task.scheduledStart.getHours() < 12)
  
  if (highPriorityTasks.length > 0 && morningTasks.length === 0) {
    suggestions.push("Consider scheduling high-priority tasks in the morning when energy levels are typically higher.")
  }
  
  if (unscheduledTasks.length > 0) {
    suggestions.push(`${unscheduledTasks.length} tasks couldn't be scheduled. Consider extending working hours or delegating some tasks.`)
  }
  
  // Check for back-to-back scheduling
  let hasBackToBack = false
  for (let i = 1; i < scheduledTasks.length; i++) {
    const prevTask = scheduledTasks[i - 1]
    const currentTask = scheduledTasks[i]
    const gap = currentTask.scheduledStart.getTime() - prevTask.scheduledEnd.getTime()
    
    if (gap < 15 * 60 * 1000) { // Less than 15 minutes gap
      hasBackToBack = true
      break
    }
  }
  
  if (hasBackToBack) {
    suggestions.push("Consider adding short breaks between tasks to maintain productivity and focus.")
  }
  
  // Check work-life balance
  const totalScheduledTime = scheduledTasks.reduce((total, task) => {
    return total + (task.scheduledEnd.getTime() - task.scheduledStart.getTime()) / 60000
  }, 0)
  
  const avgDailyTime = totalScheduledTime / 7
  if (avgDailyTime > 480) { // More than 8 hours per day
    suggestions.push("Your schedule appears quite packed. Consider balancing workload across the week for better sustainability.")
  }
  
  return suggestions
}