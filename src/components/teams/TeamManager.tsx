"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  MoreHorizontal,
  UserPlus,
  Crown,
  Star,
  User,
  Activity,
  TrendingUp
} from "lucide-react"
import { useTeams, teamHelpers } from "@/hooks/use-teams"
import { Team } from "@/hooks/use-teams"

interface TeamManagerProps {
  userId: string
}

export function TeamManager({ userId }: TeamManagerProps) {
  const { teams, isLoading, error, fetchTeams, createTeam, addTeamMember } = useTeams()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  useEffect(() => {
    if (userId) {
      fetchTeams(userId)
    }
  }, [userId, fetchTeams])

  const handleCreateTeam = async (formData: FormData) => {
    try {
      await createTeam({
        userId,
        name: formData.get('name') as string,
        description: formData.get('description') as string
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const handleAddMember = async (teamId: string, memberEmail: string) => {
    try {
      // In a real app, you would first look up the user by email
      // For demo purposes, we'll use a placeholder user ID
      await addTeamMember(teamId, {
        userId: `user-${Date.now()}`, // This would be the actual user ID
        role: 'MEMBER'
      })
    } catch (error) {
      console.error('Error adding team member:', error)
    }
  }

  const sortedTeams = teamHelpers.sortTeamsByActivity(teams)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">Loading teams...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Teams</h2>
          <p className="text-slate-600 dark:text-slate-300">Collaborate with your team members</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a team to collaborate on projects and share schedules.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateTeam} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name</label>
                <Input name="name" placeholder="Enter team name" required />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea name="description" placeholder="What is this team about?" />
              </div>
              
              <Button type="submit" className="w-full">
                Create Team
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      {sortedTeams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No teams yet
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-center mb-4">
              Create your first team to start collaborating with others.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              userId={userId}
              onSelect={() => setSelectedTeam(team)}
              onAddMember={(email) => handleAddMember(team.id, email)}
            />
          ))}
        </div>
      )}

      {/* Team Detail Modal */}
      {selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          userId={userId}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  )
}

interface TeamCardProps {
  team: Team
  userId: string
  onSelect: () => void
  onAddMember: (email: string) => void
}

function TeamCard({ team, userId, onSelect, onAddMember }: TeamCardProps) {
  const userRole = team.members.find(m => m.userId === userId)?.role || 'MEMBER'
  const stats = teamHelpers.getTeamStats(team)
  const summary = teamHelpers.generateSummary(team)

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{team.name}</CardTitle>
            <CardDescription className="text-sm">
              {team.description || 'No description'}
            </CardDescription>
          </div>
          <Badge variant={stats.activityLevel === 'HIGH' ? 'default' : 'secondary'}>
            {teamHelpers.getTeamStatus(team)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Team Members */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {team.members.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-white dark:border-slate-800">
                  <AvatarImage src={member.user.avatar} />
                  <AvatarFallback>
                    {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {team.members.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  <span className="text-xs font-medium">+{team.members.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-sm text-slate-600">
              {teamHelpers.formatTeamSize(team.members)}
            </span>
          </div>
          
          {/* Activity Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{stats.upcomingEvents} events</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <span>{stats.recentMessages} messages</span>
            </div>
          </div>
          
          {/* Summary */}
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {summary}
          </div>
          
          {/* User Role */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Your role:</span>
            <Badge variant="outline" className={`text-${teamHelpers.getRoleColor(userRole)}-600`}>
              {teamHelpers.getRoleIcon(userRole)} {userRole}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface TeamDetailModalProps {
  team: Team
  userId: string
  onClose: () => void
}

function TeamDetailModal({ team, userId, onClose }: TeamDetailModalProps) {
  const userRole = team.members.find(m => m.userId === userId)?.role || 'MEMBER'
  const stats = teamHelpers.getTeamStats(team)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle>{team.name}</DialogTitle>
              <DialogDescription>{team.description || 'No description provided'}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <p className="text-xs text-slate-500">Members</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                <p className="text-xs text-slate-500">Upcoming Events</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                <div className="text-2xl font-bold">{stats.recentMessages}</div>
                <p className="text-xs text-slate-500">Recent Messages</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                <div className="text-2xl font-bold capitalize">{stats.activityLevel}</div>
                <p className="text-xs text-slate-500">Activity</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Team Members
                {teamHelpers.canPerformAction(userRole, 'INVITE_MEMBERS') && (
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.user.avatar} />
                        <AvatarFallback>
                          {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name || member.user.email}</p>
                        <p className="text-sm text-slate-500">{member.user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-${teamHelpers.getRoleColor(member.role)}-600`}>
                      {teamHelpers.getRoleIcon(member.role)} {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {team.schedules.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {team.schedules.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">{event.priority}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {team.chatThreads.length === 0 || team.chatThreads.every(thread => thread.messages.length === 0) ? (
                <p className="text-slate-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {team.chatThreads.flatMap(thread => 
                    thread.messages.slice(0, 3).map(message => (
                      <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          {message.role === 'USER' ? '👤' : '🤖'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}