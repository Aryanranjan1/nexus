import { useState, useCallback } from 'react'

interface TeamMember {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  userId: string
  teamId: string
  joinedAt: Date
  user: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
}

interface Team {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  members: TeamMember[]
  schedules: Array<{
    id: string
    title: string
    startTime: Date
    endTime: Date
    location?: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
  }>
  chatThreads: Array<{
    id: string
    title: string
    type: 'PERSONAL' | 'TEAM' | 'GOAL' | 'SCHEDULE'
    messages: Array<{
      id: string
      content: string
      role: 'USER' | 'ASSISTANT' | 'SYSTEM'
      createdAt: Date
    }>
  }>
}

interface CreateTeamRequest {
  userId: string
  name: string
  description?: string
}

interface AddTeamMemberRequest {
  userId: string
  role?: 'OWNER' | 'ADMIN' | 'MEMBER'
}

interface UseTeamsReturn {
  teams: Team[]
  isLoading: boolean
  error: string | null
  fetchTeams: (userId: string) => Promise<void>
  createTeam: (request: CreateTeamRequest) => Promise<Team>
  addTeamMember: (teamId: string, request: AddTeamMemberRequest) => Promise<TeamMember>
  removeTeamMember: (teamId: string, userId: string) => Promise<void>
  getTeamMembers: (teamId: string) => Promise<TeamMember[]>
  getUserRole: (teamId: string, userId: string) => string | null
}

export function useTeams(): UseTeamsReturn {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teams?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }

      const data = await response.json()
      setTeams(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTeam = useCallback(async (request: CreateTeamRequest): Promise<Team> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create team')
      }

      const newTeam = await response.json()
      setTeams(prev => [newTeam, ...prev])
      return newTeam
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addTeamMember = useCallback(async (teamId: string, request: AddTeamMemberRequest): Promise<TeamMember> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add team member')
      }

      const newMember = await response.json()
      
      // Update the team in the local state
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, members: [...team.members, newMember] }
          : team
      ))

      return newMember
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeTeamMember = useCallback(async (teamId: string, userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove team member')
      }

      // Update the team in the local state
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, members: team.members.filter(member => member.userId !== userId) }
          : team
      ))

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTeamMembers = useCallback(async (teamId: string): Promise<TeamMember[]> => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`)
      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    }
  }, [])

  const getUserRole = useCallback((teamId: string, userId: string): string | null => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return null

    const member = team.members.find(m => m.userId === userId)
    return member?.role || null
  }, [teams])

  return {
    teams,
    isLoading,
    error,
    fetchTeams,
    createTeam,
    addTeamMember,
    removeTeamMember,
    getTeamMembers,
    getUserRole,
  }
}

// Helper functions for team management
export const teamHelpers = {
  // Get role color
  getRoleColor: (role: string): string => {
    const colors = {
      OWNER: 'purple',
      ADMIN: 'blue',
      MEMBER: 'gray',
    }
    return colors[role as keyof typeof colors] || 'gray'
  },

  // Get role icon
  getRoleIcon: (role: string): string => {
    const icons = {
      OWNER: '👑',
      ADMIN: '⭐',
      MEMBER: '👤',
    }
    return icons[role as keyof typeof icons] || '👤'
  },

  // Check if user can perform action
  canPerformAction: (userRole: string, action: 'MANAGE_TEAM' | 'INVITE_MEMBERS' | 'REMOVE_MEMBERS' | 'EDIT_SCHEDULE'): boolean => {
    const permissions = {
      OWNER: ['MANAGE_TEAM', 'INVITE_MEMBERS', 'REMOVE_MEMBERS', 'EDIT_SCHEDULE'],
      ADMIN: ['INVITE_MEMBERS', 'EDIT_SCHEDULE'],
      MEMBER: ['EDIT_SCHEDULE'],
    }

    return permissions[userRole as keyof typeof permissions]?.includes(action) || false
  },

  // Format team size
  formatTeamSize: (members: TeamMember[]): string => {
    if (members.length === 1) return '1 member'
    return `${members.length} members`
  },

  // Get team activity level
  getActivityLevel: (team: Team): 'LOW' | 'MEDIUM' | 'HIGH' => {
    const recentSchedules = team.schedules.filter(s => 
      new Date(s.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    const recentMessages = team.chatThreads.reduce((total, thread) => 
      total + thread.messages.filter(m => 
        new Date(m.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length, 0
    )

    const activityScore = recentSchedules + recentMessages

    if (activityScore >= 10) return 'HIGH'
    if (activityScore >= 5) return 'MEDIUM'
    return 'LOW'
  },

  // Get team status
  getTeamStatus: (team: Team): string => {
    const activity = teamHelpers.getActivityLevel(team)
    const memberCount = team.members.length

    if (activity === 'HIGH') return 'Very Active'
    if (activity === 'MEDIUM') return 'Active'
    if (memberCount <= 2) return 'Small Team'
    return 'Inactive'
  },

  // Sort teams by activity
  sortTeamsByActivity: (teams: Team[]): Team[] => {
    return [...teams].sort((a, b) => {
      const activityA = teamHelpers.getActivityLevel(a)
      const activityB = teamHelpers.getActivityLevel(b)

      const activityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return activityOrder[activityB] - activityOrder[activityA]
    })
  },

  // Filter teams by user role
  filterByUserRole: (teams: Team[], userId: string, role: string): Team[] => {
    return teams.filter(team => 
      team.members.some(member => 
        member.userId === userId && member.role === role
      )
    )
  },

  // Get team statistics
  getTeamStats: (team: Team) => {
    const totalMembers = team.members.length
    const roleDistribution = team.members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const upcomingEvents = team.schedules.filter(s => 
      new Date(s.startTime) > new Date()
    ).length

    const recentMessages = team.chatThreads.reduce((total, thread) => 
      total + thread.messages.filter(m => 
        new Date(m.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length, 0
    )

    return {
      totalMembers,
      roleDistribution,
      upcomingEvents,
      recentMessages,
      activityLevel: teamHelpers.getActivityLevel(team),
    }
  },

  // Generate team summary
  generateSummary: (team: Team): string => {
    const stats = teamHelpers.getTeamStats(team)
    const activity = teamHelpers.getActivityLevel(team)

    if (activity === 'HIGH') {
      return `🔥 Very active team with ${stats.recentMessages} recent messages and ${stats.upcomingEvents} upcoming events.`
    }

    if (activity === 'MEDIUM') {
      return `📊 Active team with ${stats.totalMembers} members and ${stats.upcomingEvents} upcoming events.`
    }

    return `👥 Team of ${stats.totalMembers} members. Get the conversation started!`
  },
}