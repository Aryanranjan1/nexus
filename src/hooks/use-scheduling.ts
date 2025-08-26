import { useState } from 'react'

interface OptimizeScheduleRequest {
  userId: string
  tasks: Array<{
    id: string
    title: string
    description?: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    estimatedDuration: number
    deadline?: Date
    flexible?: boolean
  }>
  existingEvents: Array<{
    id: string
    title: string
    startTime: Date
    endTime: Date
    isFixed: boolean
  }>
  preferences: {
    workHours: {
      start: string
      end: string
    }
    breakDuration: number
    maxContinuousWork: number
    preferredDays: string[]
  }
}

interface ScheduledTask {
  id: string
  title: string
  startTime: Date
  endTime: Date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  confidence: number
  reasoning: string
}

interface OptimizationResult {
  optimizedSchedule: ScheduledTask[]
  unscheduledTasks: string[]
  totalProductivityScore: number
  improvements: string[]
  warnings: string[]
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

interface UseSchedulingReturn {
  optimizeSchedule: (request: OptimizeScheduleRequest) => Promise<OptimizationResult>
  getSuggestions: (userId: string, query: string, context?: any) => Promise<ScheduleSuggestion[]>
  isLoading: boolean
  error: string | null
}

export function useScheduling(): UseSchedulingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const optimizeSchedule = async (request: OptimizeScheduleRequest): Promise<OptimizationResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/schedule/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to optimize schedule')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getSuggestions = async (
    userId: string, 
    query: string, 
    context?: any
  ): Promise<ScheduleSuggestion[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/schedule/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          query,
          context,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get suggestions')
      }

      const result = await response.json()
      return result.suggestions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    optimizeSchedule,
    getSuggestions,
    isLoading,
    error,
  }
}

// Helper functions for common scheduling operations
export const schedulingHelpers = {
  // Create a default optimization request
  createDefaultRequest: (userId: string, tasks: any[]): OptimizeScheduleRequest => ({
    userId,
    tasks: tasks.map(task => ({
      id: task.id || Date.now().toString(),
      title: task.title,
      description: task.description,
      priority: task.priority || 'MEDIUM',
      estimatedDuration: task.duration || 60,
      deadline: task.deadline,
      flexible: task.flexible || false,
    })),
    existingEvents: [],
    preferences: {
      workHours: { start: '09:00', end: '17:00' },
      breakDuration: 15,
      maxContinuousWork: 120,
      preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  }),

  // Parse natural language duration
  parseDuration: (text: string): number => {
    const matches = text.match(/(\d+)\s*(hour|hr|minute|min|day)/gi)
    if (!matches) return 60 // Default to 1 hour

    let totalMinutes = 0
    matches.forEach(match => {
      const [, num, unit] = match.match(/(\d+)\s*(hour|hr|minute|min|day)/i) || []
      const value = parseInt(num)
      
      if (unit.toLowerCase().includes('hour') || unit.toLowerCase().includes('hr')) {
        totalMinutes += value * 60
      } else if (unit.toLowerCase().includes('minute') || unit.toLowerCase().includes('min')) {
        totalMinutes += value
      } else if (unit.toLowerCase().includes('day')) {
        totalMinutes += value * 8 * 60 // Assume 8-hour work day
      }
    })

    return totalMinutes || 60
  },

  // Extract priority from text
  extractPriority: (text: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('emergency')) {
      return 'URGENT'
    }
    if (lowerText.includes('high') || lowerText.includes('important') || lowerText.includes('critical')) {
      return 'HIGH'
    }
    if (lowerText.includes('low') || lowerText.includes('optional') || lowerText.includes('sometime')) {
      return 'LOW'
    }
    return 'MEDIUM'
  },

  // Check if two time ranges overlap
  doTimeRangesOverlap: (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    return start1 < end2 && end1 > start2
  },

  // Find available time slots
  findAvailableSlots: (
    existingEvents: Array<{ startTime: Date; endTime: Date }>,
    duration: number,
    workHours: { start: string; end: string },
    startDate: Date = new Date()
  ): Array<{ startTime: Date; endTime: Date }> => {
    const slots: Array<{ startTime: Date; endTime: Date }> = []
    const [workStartHour, workStartMin] = workHours.start.split(':').map(Number)
    const [workEndHour, workEndMin] = workHours.end.split(':').map(Number)

    // Check next 7 days
    for (let day = 0; day < 7; day++) {
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + day)
      
      // Set work hours for this day
      const dayStart = new Date(currentDay)
      dayStart.setHours(workStartHour, workStartMin, 0, 0)
      
      const dayEnd = new Date(currentDay)
      dayEnd.setHours(workEndHour, workEndMin, 0, 0)

      // Get events for this day
      const dayEvents = existingEvents.filter(event => {
        const eventStart = new Date(event.startTime)
        const eventEnd = new Date(event.endTime)
        return eventStart.toDateString() === currentDay.toDateString()
      }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

      // Find gaps between events
      let currentTime = new Date(dayStart)

      for (const event of dayEvents) {
        const eventStart = new Date(event.startTime)
        const eventEnd = new Date(event.endTime)

        // Check if there's a gap before this event
        const gapDuration = eventStart.getTime() - currentTime.getTime()
        if (gapDuration >= duration * 60000) {
          slots.push({
            startTime: new Date(currentTime),
            endTime: new Date(currentTime.getTime() + duration * 60000),
          })
        }

        currentTime = new Date(eventEnd)
      }

      // Check gap after last event
      const remainingTime = dayEnd.getTime() - currentTime.getTime()
      if (remainingTime >= duration * 60000) {
        slots.push({
          startTime: new Date(currentTime),
          endTime: new Date(currentTime.getTime() + duration * 60000),
        })
      }
    }

    return slots.slice(0, 5) // Return first 5 available slots
  },

  // Format time for display
  formatTimeRange: (startTime: Date, endTime: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
    
    const startStr = startTime.toLocaleDateString('en-US', options)
    const endStr = endTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
    
    return `${startStr} - ${endStr}`
  },
}