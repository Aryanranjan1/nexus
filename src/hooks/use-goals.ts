import { useState, useCallback } from 'react'

interface Goal {
  id: string
  title: string
  description?: string
  category: 'CAREER' | 'HEALTH' | 'PERSONAL' | 'FINANCIAL' | 'EDUCATION' | 'RELATIONSHIPS' | 'OTHER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  progress: number
  targetDate?: Date
  createdAt: Date
  updatedAt: Date
  milestones?: Milestone[]
  tasks?: Task[]
}

interface Milestone {
  id: string
  title: string
  description?: string
  dueDate: Date
  completed: boolean
  goalId: string
  createdAt: Date
  updatedAt: Date
}

interface Task {
  id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  estimatedDuration?: number
  actualDuration?: number
  dueDate?: Date
  goalId?: string
  scheduleId?: string
  createdAt: Date
  updatedAt: Date
}

interface CreateGoalRequest {
  userId: string
  title: string
  description?: string
  category: Goal['category']
  priority?: Goal['priority']
  targetDate?: Date
  generateRoadmap?: boolean
}

interface UpdateGoalRequest {
  title?: string
  description?: string
  category?: Goal['category']
  priority?: Goal['priority']
  targetDate?: Date
  status?: Goal['status']
  progress?: number
}

interface UseGoalsReturn {
  goals: Goal[]
  isLoading: boolean
  error: string | null
  fetchGoals: (userId: string) => Promise<void>
  createGoal: (request: CreateGoalRequest) => Promise<Goal>
  updateGoal: (goalId: string, request: UpdateGoalRequest) => Promise<Goal>
  deleteGoal: (goalId: string) => Promise<void>
  getGoalProgress: (goalId: string) => number
}

export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/goals?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch goals')
      }

      const data = await response.json()
      setGoals(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createGoal = useCallback(async (request: CreateGoalRequest): Promise<Goal> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create goal')
      }

      const newGoal = await response.json()
      setGoals(prev => [newGoal, ...prev])
      return newGoal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateGoal = useCallback(async (goalId: string, request: UpdateGoalRequest): Promise<Goal> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update goal')
      }

      const updatedGoal = await response.json()
      setGoals(prev => prev.map(goal => goal.id === goalId ? updatedGoal : goal))
      return updatedGoal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteGoal = useCallback(async (goalId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete goal')
      }

      setGoals(prev => prev.filter(goal => goal.id !== goalId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getGoalProgress = useCallback((goalId: string): number => {
    const goal = goals.find(g => g.id === goalId)
    return goal?.progress || 0
  }, [goals])

  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalProgress,
  }
}

// Helper functions for goal management
export const goalHelpers = {
  // Get color based on goal category
  getCategoryColor: (category: Goal['category']): string => {
    const colors = {
      CAREER: 'blue',
      HEALTH: 'green',
      PERSONAL: 'purple',
      FINANCIAL: 'yellow',
      EDUCATION: 'indigo',
      RELATIONSHIPS: 'pink',
      OTHER: 'gray',
    }
    return colors[category] || 'gray'
  },

  // Get icon based on goal category
  getCategoryIcon: (category: Goal['category']): string => {
    const icons = {
      CAREER: '💼',
      HEALTH: '💪',
      PERSONAL: '🌟',
      FINANCIAL: '💰',
      EDUCATION: '📚',
      RELATIONSHIPS: '❤️',
      OTHER: '🎯',
    }
    return icons[category] || '🎯'
  },

  // Format progress for display
  formatProgress: (progress: number): string => {
    return `${Math.round(progress)}%`
  },

  // Get progress status
  getProgressStatus: (progress: number): 'NOT_STARTED' | 'IN_PROGRESS' | 'NEARLY_COMPLETE' | 'COMPLETED' => {
    if (progress === 0) return 'NOT_STARTED'
    if (progress < 75) return 'IN_PROGRESS'
    if (progress < 100) return 'NEARLY_COMPLETE'
    return 'COMPLETED'
  },

  // Get priority color
  getPriorityColor: (priority: Goal['priority']): string => {
    const colors = {
      LOW: 'gray',
      MEDIUM: 'blue',
      HIGH: 'orange',
      URGENT: 'red',
    }
    return colors[priority] || 'gray'
  },

  // Calculate days remaining until target date
  getDaysRemaining: (targetDate?: Date): number => {
    if (!targetDate) return -1
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  // Check if goal is overdue
  isOverdue: (targetDate?: Date, status?: Goal['status']): boolean => {
    if (!targetDate || status === 'COMPLETED') return false
    return new Date(targetDate) < new Date()
  },

  // Generate goal summary
  generateSummary: (goal: Goal): string => {
    const progress = goal.progress
    const daysRemaining = goalHelpers.getDaysRemaining(goal.targetDate)
    
    if (goal.status === 'COMPLETED') {
      return '🎉 Goal completed! Great job!'
    }
    
    if (goalHelpers.isOverdue(goal.targetDate, goal.status)) {
      return `⚠️ Goal is overdue by ${Math.abs(daysRemaining)} days`
    }
    
    if (daysRemaining > 0 && daysRemaining <= 7) {
      return `⏰ ${daysRemaining} days remaining - time to focus!`
    }
    
    if (progress === 0) {
      return '🚀 Ready to start? Let\'s begin!'
    }
    
    if (progress < 30) {
      return '🌱 Just getting started. Keep going!'
    }
    
    if (progress < 70) {
      return '📈 Making good progress. Stay focused!'
    }
    
    return '🎯 Almost there! Final push needed!'
  },

  // Sort goals by priority and status
  sortGoals: (goals: Goal[]): Goal[] => {
    const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
    const statusOrder = { ACTIVE: 1, PAUSED: 2, CANCELLED: 3, COMPLETED: 4 }

    return [...goals].sort((a, b) => {
      // First sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff

      // Then sort by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Finally sort by progress (descending)
      return b.progress - a.progress
    })
  },

  // Filter goals by status
  filterByStatus: (goals: Goal[], status: Goal['status']): Goal[] => {
    return goals.filter(goal => goal.status === status)
  },

  // Filter goals by category
  filterByCategory: (goals: Goal[], category: Goal['category']): Goal[] => {
    return goals.filter(goal => goal.category === category)
  },

  // Get goal statistics
  getStatistics: (goals: Goal[]) => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'COMPLETED').length
    const activeGoals = goals.filter(g => g.status === 'ACTIVE').length
    const avgProgress = totalGoals > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals : 0

    const byCategory = goals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatus = goals.reduce((acc, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalGoals,
      completedGoals,
      activeGoals,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
      averageProgress: Math.round(avgProgress),
      byCategory,
      byStatus,
    }
  },
}