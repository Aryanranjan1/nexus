"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useSession, signOut } from "next-auth/react"
import { useSocket } from "@/hooks/use-socket";
import { createContext, useContext } from "react";
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { SignOutButton } from "@/components/auth/SignOutButton"

const SocketContext = createContext<any>(null);

export const useSocketContext = () => useContext(SocketContext);

interface DashboardLayoutProps {
  children?: React.ReactNode
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Chats", href: "/chats" },
  { name: "Calendar", href: "/calendar" },
  { name: "Goals", href: "/goals" },
  { name: "Team", href: "/team" },
  { name: "Settings", href: "/settings" },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const socket = useSocket("http://localhost:3000", {
    onConnect: () => {
      console.log("Dashboard socket connected");
    },
  });
  
  // Redirect to sign in if not authenticated
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Please sign in to access the dashboard</div>
      </div>
    )
  }
  
  const getActiveItem = () => {
    if (pathname === "/demo" || pathname === "/") return "Dashboard"
    if (pathname.startsWith("/chat")) return "Chats"
    if (pathname.startsWith("/calendar")) return "Calendar"
    if (pathname.startsWith("/goals")) return "Goals"
    if (pathname.startsWith("/team")) return "Team"
    if (pathname.startsWith("/settings")) return "Settings"
    return "Dashboard"
  }

  const activeItem = getActiveItem()

  return (
    <SocketContext.Provider value={socket}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Nexus</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeItem === item.name
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={session.user.avatar} />
                <AvatarFallback>{session.user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{session.user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{session.user.email}</p>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeItem}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`w-3 h-3 rounded-full ${socket.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {socket.isConnected ? 'Connected' : 'Disconnected'}
              </p>
              {/* Search */}
              <div className="relative">
                <Input
                  placeholder="Search..."
                  className="w-64 pl-10"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>
              
              {/* User Avatar */}
              <Avatar>
                <AvatarImage src={session.user.avatar} />
                <AvatarFallback>{session.user.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {children || <DashboardContent />}
          </div>
        </div>
      </div>
    </SocketContext.Provider>
  )
}

function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, John! 👋
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Here's what's happening with your productivity today.
          </p>
        </div>
        <Button>
          New Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 on track
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">
              scheduled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +12% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Focus */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Focus</CardTitle>
              <CardDescription>
                Your top 3 high-priority tasks for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Complete Q4 Marketing Strategy
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Finalize the marketing plan and budget allocation
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Marketing</Badge>
                    <Badge variant="outline">High Priority</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Start
                </Button>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Team Standup Meeting
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Daily sync with development team
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Meeting</Badge>
                    <span className="text-xs text-slate-500">10:00 AM</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Join
                </Button>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Review Code Pull Requests
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Review and merge pending PRs
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">Development</Badge>
                    <Badge variant="outline">Medium Priority</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Goal Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
              <CardDescription>
                DevOps Career Transition Plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <Progress value={30} className="mt-2" />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Learn AWS</span>
                    <span className="text-green-600">✓ Done</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Docker & Kubernetes</span>
                    <span className="text-blue-600">In Progress</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>CI/CD Pipelines</span>
                    <span className="text-slate-400">Pending</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Infrastructure as Code</span>
                    <span className="text-slate-400">Pending</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Outlook */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Outlook</CardTitle>
              <CardDescription>
                Upcoming events and free time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Client Presentation</p>
                    <p className="text-xs text-slate-500">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Team Building Event</p>
                    <p className="text-xs text-slate-500">Friday, 4:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Free Time Block</p>
                    <p className="text-xs text-slate-500">Wednesday, 10:00 AM</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    12 hours available this week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
