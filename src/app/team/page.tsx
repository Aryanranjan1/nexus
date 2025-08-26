"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default function TeamPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) router.push("/auth/signin") // Not authenticated
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Team content will be rendered by DashboardLayout */}
      </div>
    </DashboardLayout>
  )
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Plus, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  avatar?: string
  status: 'ACTIVE' | 'INACTIVE' | 'AWAY'
  lastActive: Date
  skills: string[]
}

interface Team {
  id: string
  name: string
  description: string
  members: TeamMember[]
  createdAt: Date
  sharedGoals: number
  activeProjects: number
}

interface TeamSchedule {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  assignedTo: string[]
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdBy: string
  createdAt: Date
}

interface TeamMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: Date
  type: 'TEXT' | 'FILE' | 'SCHEDULE_UPDATE'
}

const roleColors = {
  OWNER: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  ADMIN: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  MEMBER: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
}

const statusColors = {
  ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  INACTIVE: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400',
  AWAY: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
}

const priorityColors = {
  LOW: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
}

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "1",
      name: "Development Team",
      description: "Core product development and engineering",
      members: [
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah@company.com",
          role: "OWNER",
          status: "ACTIVE",
          lastActive: new Date(Date.now() - 5 * 60 * 1000),
          skills: ["React", "Node.js", "TypeScript"]
        },
        {
          id: "2",
          name: "Mike Chen",
          email: "mike@company.com",
          role: "ADMIN",
          status: "ACTIVE",
          lastActive: new Date(Date.now() - 15 * 60 * 1000),
          skills: ["Python", "Django", "PostgreSQL"]
        },
        {
          id: "3",
          name: "Emily Davis",
          email: "emily@company.com",
          role: "MEMBER",
          status: "AWAY",
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          skills: ["UI/UX Design", "Figma", "CSS"]
        }
      ],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      sharedGoals: 3,
      activeProjects: 2
    },
    {
      id: "2",
      name: "Marketing Team",
      description: "Marketing strategy and campaign management",
      members: [
        {
          id: "4",
          name: "Alex Rodriguez",
          email: "alex@company.com",
          role: "OWNER",
          status: "ACTIVE",
          lastActive: new Date(Date.now() - 10 * 60 * 1000),
          skills: ["Digital Marketing", "SEO", "Content Strategy"]
        },
        {
          id: "5",
          name: "Lisa Wang",
          email: "lisa@company.com",
          role: "MEMBER",
          status: "ACTIVE",
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
          skills: ["Social Media", "Analytics", "Copywriting"]
        }
      ],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      sharedGoals: 2,
      activeProjects: 1
    }
  ])

  const [teamSchedules, setTeamSchedules] = useState<TeamSchedule[]>([
    {
      id: "1",
      title: "Sprint Planning Meeting",
      description: "Plan next 2-week sprint for development team",
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
      assignedTo: ["1", "2", "3"],
      status: "SCHEDULED",
      priority: "HIGH",
      createdBy: "1",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: "2",
      title: "Q4 Marketing Strategy Review",
      description: "Review and finalize Q4 marketing strategy",
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
      assignedTo: ["4", "5"],
      status: "SCHEDULED",
      priority: "MEDIUM",
      createdBy: "4",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "3",
      title: "Team Building Event",
      description: "Monthly team building activity",
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000),
      assignedTo: ["1", "2", "3", "4", "5"],
      status: "SCHEDULED",
      priority: "LOW",
      createdBy: "1",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ])

  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([
    {
      id: "1",
      content: "Hey team! Don't forget about the sprint planning meeting tomorrow at 10 AM.",
      senderId: "1",
      senderName: "Sarah Johnson",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "TEXT"
    },
    {
      id: "2",
      content: "I've prepared the backlog items for review. Looking forward to discussing the priorities!",
      senderId: "2",
      senderName: "Mike Chen",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      type: "TEXT"
    },
    {
      id: "3",
      content: "I'll join remotely. Is the meeting link updated?",
      senderId: "3",
      senderName: "Emily Davis",
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      type: "TEXT"
    }
  ])

  const [selectedTeam, setSelectedTeam] = useState(teams[0])
  const [newMessage, setNewMessage] = useState("")
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: TeamMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: "1", // Current user
      senderName: "Sarah Johnson",
      timestamp: new Date(),
      type: "TEXT"
    }

    setTeamMessages(prev => [...prev, message])
    setNewMessage("")
  }

  const getMemberById = (id: string) => {
    return selectedTeam.members.find(member => member.id === id)
  }

  const getScheduleById = (id: string) => {
    return teamSchedules.find(schedule => schedule.id === id)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formatDate(date)
  }

  const getUpcomingSchedules = () => {
    const now = new Date()
    return teamSchedules
      .filter(schedule => new Date(schedule.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Team</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Collaborate with your team members and manage shared schedules
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Team Schedule</DialogTitle>
                  <DialogDescription>
                    Schedule a new event for your team members
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Event Title</label>
                    <Input placeholder="Meeting title" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Event description" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <Input type="datetime-local" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <Input type="datetime-local" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateScheduleOpen(false)}>
                      Cancel
                    </Button>
                    <Button>Create Schedule</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Set up a new team for collaboration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Team Name</label>
                    <Input placeholder="Team name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Team description" className="mt-1" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                      Cancel
                    </Button>
                    <Button>Create Team</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground">
                Active collaborations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.members.length, 0)}</div>
              <p className="text-xs text-muted-foreground">
                Across all teams
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUpcomingSchedules().length}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.activeProjects, 0)}</div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Team List and Members */}
          <div className="space-y-6">
            {/* Team Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Your Teams</CardTitle>
                <CardDescription>Select a team to view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedTeam.id === team.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">
                          {team.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {team.members.length} members
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">
                          {team.activeProjects} projects
                        </div>
                        <div className="text-xs text-slate-500">
                          {team.sharedGoals} goals
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>{selectedTeam.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTeam.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800",
                        member.status === 'ACTIVE' && "bg-green-500",
                        member.status === 'AWAY' && "bg-yellow-500",
                        member.status === 'INACTIVE' && "bg-slate-400"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{member.name}</p>
                        <Badge className={roleColors[member.role]} variant="secondary">
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          Active {formatRelativeTime(member.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Team Chat and Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="chat" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Team Chat</TabsTrigger>
                <TabsTrigger value="schedule">Team Schedule</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="space-y-4">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle>{selectedTeam.name} Chat</CardTitle>
                    <CardDescription>
                      Real-time collaboration with your team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {teamMessages.map((message) => (
                          <div key={message.id} className="flex gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {message.senderName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{message.senderName}</p>
                                <span className="text-xs text-slate-500">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Input */}
                    <div className="mt-4 flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Schedule</CardTitle>
                    <CardDescription>
                      Upcoming events and shared calendar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getUpcomingSchedules().map((schedule) => {
                        const assignedMembers = schedule.assignedTo.map(id => getMemberById(id)).filter(Boolean)
                        
                        return (
                          <div key={schedule.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                  {schedule.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                  {schedule.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(schedule.startTime)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge className={priorityColors[schedule.priority]}>
                                {schedule.priority}
                              </Badge>
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Assigned to:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {assignedMembers.map((member) => (
                                  <div key={member?.id} className="flex items-center gap-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {member?.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                      {member?.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}