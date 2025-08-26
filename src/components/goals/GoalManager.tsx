"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Edit,
  Trash2,
  Play,
  Pause
} from "lucide-react"
import { useGoals, goalHelpers } from "@/hooks/use-goals"
import { Goal } from "@/hooks/use-goals"

interface GoalManagerProps {
  userId: string
}

export function GoalManager({ userId }: GoalManagerProps) {
  const { goals, isLoading, error, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoals()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  useEffect(() => {
    if (userId) {
      fetchGoals(userId)
    }
  }, [userId, fetchGoals])

  const handleCreateGoal = async (formData: FormData) => {
    try {
      await createGoal({
        userId,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as Goal['category'],
        priority: formData.get('priority') as Goal['priority'],
        targetDate: formData.get('targetDate') ? new Date(formData.get('targetDate') as string) : undefined,
        generateRoadmap: true
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const handleUpdateGoal = async (goalId: string, updates: any) => {
    try {
      await updateGoal(goalId, updates)
      setEditingGoal(null)
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId)
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const sortedGoals = goalHelpers.sortGoals(goals)
  const stats = goalHelpers.getStatistics(goals)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">Loading goals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Goals</h2>
          <p className="text-slate-600 dark:text-slate-300">Track your progress and achieve your objectives</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new goal and let AI help you create a roadmap to achieve it.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Goal Title</label>
                <Input name="title" placeholder="What do you want to achieve?" required />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" placeholder="Describe your goal in detail..." />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAREER">💼 Career</SelectItem>
                    <SelectItem value="HEALTH">💪 Health</SelectItem>
                    <SelectItem value="PERSONAL">🌟 Personal</SelectItem>
                    <SelectItem value="FINANCIAL">💰 Financial</SelectItem>
                    <SelectItem value="EDUCATION">📚 Education</SelectItem>
                    <SelectItem value="RELATIONSHIPS">❤️ Relationships</SelectItem>
                    <SelectItem value="OTHER">🎯 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select name="priority" defaultValue="MEDIUM">
                  <SelectTrigger>
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
                <Input name="targetDate" type="date" />
              </div>
              
              <Button type="submit" className="w-full">
                Create Goal & Generate Roadmap
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGoals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeGoals} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedGoals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate.toFixed(0)}% completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              across all goals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGoals}</div>
            <p className="text-xs text-muted-foreground">
              in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {sortedGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No goals yet
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-center mb-4">
                  Create your first goal and let AI help you build a roadmap to achieve it.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sortedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => setEditingGoal(goal)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  onUpdate={(updates) => handleUpdateGoal(goal.id, updates)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          <div className="grid gap-4">
            {goalHelpers.filterByStatus(sortedGoals, 'ACTIVE').map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => handleDeleteGoal(goal.id)}
                onUpdate={(updates) => handleUpdateGoal(goal.id, updates)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="grid gap-4">
            {goalHelpers.filterByStatus(sortedGoals, 'COMPLETED').map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => handleDeleteGoal(goal.id)}
                onUpdate={(updates) => handleUpdateGoal(goal.id, updates)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="paused">
          <div className="grid gap-4">
            {goalHelpers.filterByStatus(sortedGoals, 'PAUSED').map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => setEditingGoal(goal)}
                onDelete={() => handleDeleteGoal(goal.id)}
                onUpdate={(updates) => handleUpdateGoal(goal.id, updates)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface GoalCardProps {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
  onUpdate: (updates: any) => void
}

function GoalCard({ goal, onEdit, onDelete, onUpdate }: GoalCardProps) {
  const categoryColor = goalHelpers.getCategoryColor(goal.category)
  const priorityColor = goalHelpers.getPriorityColor(goal.priority)
  const daysRemaining = goalHelpers.getDaysRemaining(goal.targetDate)
  const isOverdue = goalHelpers.isOverdue(goal.targetDate, goal.status)
  const summary = goalHelpers.generateSummary(goal)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-${categoryColor}-100 dark:bg-${categoryColor}-900/30 flex items-center justify-center`}>
              <span className="text-lg">{goalHelpers.getCategoryIcon(goal.category)}</span>
            </div>
            <div>
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <CardDescription>{goal.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-slate-600">{goalHelpers.formatProgress(goal.progress)}</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>
          
          {/* Status and Priority */}
          <div className="flex items-center gap-2">
            <Badge variant={goal.status === 'COMPLETED' ? 'default' : 'secondary'}>
              {goal.status}
            </Badge>
            <Badge variant="outline" className={`text-${priorityColor}-600 border-${priorityColor}-200`}>
              {goal.priority}
            </Badge>
            <Badge variant="outline">
              {goal.category}
            </Badge>
          </div>
          
          {/* Target Date */}
          {goal.targetDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className={isOverdue ? 'text-red-600' : 'text-slate-600'}>
                {isOverdue ? `Overdue by ${Math.abs(daysRemaining)} days` : 
                 daysRemaining > 0 ? `${daysRemaining} days remaining` : 
                 'Due today'}
              </span>
            </div>
          )}
          
          {/* Summary */}
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {summary}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {goal.status === 'ACTIVE' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUpdate({ status: 'PAUSED' })}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            {goal.status === 'PAUSED' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onUpdate({ status: 'ACTIVE' })}
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
            {goal.status !== 'COMPLETED' && (
              <Button 
                size="sm"
                onClick={() => onUpdate({ status: 'COMPLETED', progress: 100 })}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}