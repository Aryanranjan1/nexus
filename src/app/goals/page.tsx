"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default function GoalsPage() {
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
        {/* Goals content will be rendered by DashboardLayout */}
      </div>
    </DashboardLayout>
  )
}
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Edit,
  Trash2,
  Award,
  BookOpen,
  Briefcase,
  Heart,
  DollarSign,
  GraduationCap,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Goal {
  id: string
  title: string
  description: string
  category: 'CAREER' | 'HEALTH' | 'PERSONAL' | 'FINANCIAL' | 'EDUCATION' | 'RELATIONSHIPS' | 'OTHER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  targetDate?: Date
  progress: number
  milestones: Milestone[]
  createdAt: Date
}

interface Milestone {
  id: string
  title: string
  description: string
  dueDate?: Date
  completed: boolean
  createdAt: Date
}

const categoryIcons = {
  CAREER: Briefcase,
  HEALTH: Heart,
  PERSONAL: Target,
  FINANCIAL: DollarSign,
  EDUCATION: GraduationCap,
  RELATIONSHIPS: Users,
  OTHER: Target
}

const categoryColors = {
  CAREER: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  HEALTH: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  PERSONAL: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  FINANCIAL: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  EDUCATION: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  RELATIONSHIPS: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  OTHER: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
}

const priorityColors = {
  LOW: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  MEDIUM: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  HIGH: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  URGENT: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
}

const statusColors = {
  ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  COMPLETED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  PAUSED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "DevOps Career Transition",
      description: "Complete transition from software development to DevOps engineering within 6 months",
      category: "CAREER",
      priority: "HIGH",
      status: "ACTIVE",
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      progress: 30,
      milestones: [
        {
          id: "1-1",
          title: "Learn AWS Fundamentals",
          description: "Complete AWS Certified Solutions Architect certification",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          completed: true,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        },
        {
          id: "1-2",
          title: "Master Docker & Kubernetes",
          description: "Gain proficiency in containerization and orchestration",
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          completed: false,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: "1-3",
          title: "Learn CI/CD Pipelines",
          description: "Implement automated deployment pipelines",
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          completed: false,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
      ],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    },
    {
      id: "2",
      title: "Improve Physical Fitness",
      description: "Achieve better health through regular exercise and balanced nutrition",
      category: "HEALTH",
      priority: "MEDIUM",
      status: "ACTIVE",
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      progress: 65,
      milestones: [
        {
          id: "2-1",
          title: "Establish Workout Routine",
          description: "Exercise 4 times per week consistently",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          completed: true,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
        },
        {
          id: "2-2",
          title: "Improve Nutrition",
          description: "Follow balanced meal plan and track calories",
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          completed: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      ],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: "3",
      title: "Learn Spanish",
      description: "Achieve conversational fluency in Spanish",
      category: "EDUCATION",
      priority: "LOW",
      status: "ACTIVE",
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      progress: 15,
      milestones: [
        {
          id: "3-1",
          title: "Complete Basic Course",
          description: "Finish beginner Spanish course",
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          completed: false,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        }
      ],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "PERSONAL" as Goal['category'],
    priority: "MEDIUM" as Goal['priority'],
    targetDate: ""
  })

  const activeGoals = goals.filter(goal => goal.status === 'ACTIVE')
  const completedGoals = goals.filter(goal => goal.status === 'COMPLETED')
  const pausedGoals = goals.filter(goal => goal.status === 'PAUSED')

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      status: 'ACTIVE',
      targetDate: newGoal.targetDate ? new Date(newGoal.targetDate) : undefined,
      progress: 0,
      milestones: [],
      createdAt: new Date()
    }

    setGoals(prev => [...prev, goal])
    setNewGoal({
      title: "",
      description: "",
      category: "PERSONAL",
      priority: "MEDIUM",
      targetDate: ""
    })
    setIsCreateDialogOpen(false)
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            return { ...milestone, completed: !milestone.completed }
          }
          return milestone
        })
        
        // Recalculate progress
        const completedMilestones = updatedMilestones.filter(m => m.completed).length
        const totalMilestones = updatedMilestones.length
        const newProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
        
        return {
          ...goal,
          milestones: updatedMilestones,
          progress: newProgress
        }
      }
      return goal
    }))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (targetDate: Date) => {
    const now = new Date()
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Goals</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Track your progress and achieve your dreams
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new goal to work towards. Break it down into manageable milestones.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Goal Title</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What do you want to achieve?"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your goal in detail..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value as Goal['category'] }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAREER">Career</SelectItem>
                      <SelectItem value="HEALTH">Health</SelectItem>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="FINANCIAL">Financial</SelectItem>
                      <SelectItem value="EDUCATION">Education</SelectItem>
                      <SelectItem value="RELATIONSHIPS">Relationships</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newGoal.priority} onValueChange={(value) => setNewGoal(prev => ({ ...prev, priority: value as Goal['priority'] }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Target Date (Optional)</label>
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGoal}>
                    Create Goal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeGoals.filter(g => g.progress >= 50).length} on track
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals.length}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeGoals.length > 0 
                  ? Math.round(activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all goals
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Milestones</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goals.reduce((sum, goal) => sum + goal.milestones.filter(m => m.completed).length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed milestones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goals Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({pausedGoals.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGoals.map((goal) => {
                const IconComponent = categoryIcons[goal.category]
                const daysRemaining = goal.targetDate ? getDaysRemaining(goal.targetDate) : null
                
                return (
                  <Card key={goal.id} className="relative overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            categoryColors[goal.category]
                          )}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {goal.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={statusColors[goal.status]}>
                            {goal.status}
                          </Badge>
                          <Badge className={priorityColors[goal.priority]}>
                            {goal.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} className="mt-2" />
                      </div>
                      
                      {/* Target Date */}
                      {goal.targetDate && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Calendar className="h-4 w-4" />
                          <span>Target: {formatDate(goal.targetDate)}</span>
                          {daysRemaining !== null && (
                            <Badge variant="outline" className="text-xs">
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Milestones */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Milestones</h4>
                        <div className="space-y-2">
                          {goal.milestones.map((milestone) => (
                            <div
                              key={milestone.id}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                milestone.completed 
                                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                              onClick={() => toggleMilestone(goal.id, milestone.id)}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <div className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center",
                                  milestone.completed
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-slate-300 dark:border-slate-600"
                                )}>
                                  {milestone.completed && <CheckCircle2 className="h-3 w-3" />}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "text-sm font-medium",
                                  milestone.completed && "line-through text-slate-500"
                                )}>
                                  {milestone.title}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                  {milestone.description}
                                </p>
                                {milestone.dueDate && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3 text-slate-400" />
                                    <span className="text-xs text-slate-500">
                                      {formatDate(milestone.dueDate)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedGoals.map((goal) => {
                const IconComponent = categoryIcons[goal.category]
                
                return (
                  <Card key={goal.id} className="relative overflow-hidden opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            categoryColors[goal.category]
                          )}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {goal.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={statusColors[goal.status]}>
                          {goal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>100% Complete</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Completed: {formatDate(goal.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="paused" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pausedGoals.map((goal) => {
                const IconComponent = categoryIcons[goal.category]
                
                return (
                  <Card key={goal.id} className="relative overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            categoryColors[goal.category]
                          )}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {goal.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={statusColors[goal.status]}>
                          {goal.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Progress: {goal.progress}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Paused: {formatDate(goal.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}