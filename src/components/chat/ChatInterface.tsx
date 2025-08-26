"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Send, 
  Paperclip, 
  Mic, 
  Plus, 
  Search,
  Clock,
  CheckCheck,
  Bot,
  User,
  Calendar,
  Target,
  Users,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSocket } from "@/hooks/use-socket"
import { useSession } from "next-auth/react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  actions?: ChatAction[]
  senderId?: string
}

interface ChatAction {
  id: string
  label: string
  variant: "default" | "outline" | "secondary" | "destructive"
  onClick: () => void
}

interface ChatThread {
  id: string
  title: string
  description: string
  type: "personal" | "goal" | "schedule" | "team"
  lastMessage: string
  lastMessageTime: Date
  unread: number
  icon: React.ReactNode
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedThread, setSelectedThread] = useState("daily-schedule")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  const { send, joinRoom, leaveRoom, lastMessage, isConnected } = useSocket(
    process.env.NEXT_PUBLIC_SOCKET_URL || "/",
    {
      onConnect: () => {
        console.log("Socket connected")
      },
      onDisconnect: () => {
        console.log("Socket disconnected")
      },
    }
  )

  const chatThreads: ChatThread[] = [
    {
      id: "daily-schedule",
      title: "Daily Schedule",
      description: "Planning your daily tasks and priorities",
      type: "personal",
      lastMessage: "I've scheduled your study sessions for the week",
      lastMessageTime: new Date(Date.now() - 60000),
      unread: 0,
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: "devops-plan",
      title: "DevOps Plan",
      description: "Career transition to DevOps engineering",
      type: "goal",
      lastMessage: "Great progress on AWS certification!",
      lastMessageTime: new Date(Date.now() - 3600000),
      unread: 2,
      icon: <Target className="h-5 w-5" />
    },
    {
      id: "team-collab",
      title: "Team Collaboration",
      description: "Working with the development team",
      type: "team",
      lastMessage: "Meeting rescheduled to tomorrow 10 AM",
      lastMessageTime: new Date(Date.now() - 7200000),
      unread: 0,
      icon: <Users className="h-5 w-5" />
    },
    {
      id: "date-night",
      title: "Date Night Planning",
      description: "Planning evening with partner",
      type: "personal",
      lastMessage: "Restaurant booked for Friday 7 PM",
      lastMessageTime: new Date(Date.now() - 86400000),
      unread: 1,
      icon: <Calendar className="h-5 w-5" />
    }
  ]

  useEffect(() => {
    if (lastMessage && lastMessage.event === "new-message") {
      const receivedMessage = lastMessage.data[0]
      const role = receivedMessage.senderId === session?.user?.id ? "user" : "assistant"
      
      setMessages((prev) => [
        ...prev,
        {
          id: receivedMessage.id || Date.now().toString(),
          content: receivedMessage.content,
          role: role,
          timestamp: new Date(receivedMessage.timestamp),
          senderId: receivedMessage.senderId,
        },
      ])
    }
  }, [lastMessage, session?.user?.id])

  useEffect(() => {
    if (selectedThread) {
      joinRoom(selectedThread)
    }

    return () => {
      if (selectedThread) {
        leaveRoom(selectedThread)
      }
    }
  }, [selectedThread, joinRoom, leaveRoom])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || !session?.user) return

    const messageData = {
      content: inputValue,
      senderId: session.user.id,
      threadId: selectedThread,
      timestamp: new Date(),
    }

    send("send-message", messageData)
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatThreadTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-full bg-white dark:bg-slate-800">
      {/* Left Panel - Chat Threads */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Chats</h2>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search chats..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat Threads List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chatThreads.map((thread) => (
              <div
                key={thread.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                  selectedThread === thread.id && "bg-blue-50 dark:bg-blue-900/20"
                )}
                onClick={() => setSelectedThread(thread.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      thread.type === "personal" && "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                      thread.type === "goal" && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                      thread.type === "schedule" && "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                      thread.type === "team" && "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    )}>
                      {thread.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {thread.title}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {formatThreadTime(thread.lastMessageTime)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                      {thread.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">
                        {thread.description}
                      </span>
                      {thread.unread > 0 && (
                        <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                          {thread.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Daily Schedule
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Planning your daily tasks and priorities
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.senderId === session?.user?.id ? "justify-end" : "justify-start"
                )}
              >
                {message.senderId !== session?.user?.id && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[70%]",
                  message.senderId === session?.user?.id ? "order-1" : "order-2"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3",
                    message.senderId === session?.user?.id
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant={action.variant}
                          size="sm"
                          onClick={action.onClick}
                          className="text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className={cn(
                    "flex items-center gap-1 mt-1",
                    message.senderId === session?.user?.id ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-xs text-slate-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.senderId === session?.user?.id && (
                      <CheckCheck className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                </div>
                
                {message.senderId === session?.user?.id && (
                  <div className="flex-shrink-0 order-2">
                    <Avatar>
                      <AvatarImage src={session?.user?.image || "/placeholder-avatar.jpg"} />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[44px]"
                disabled={!isConnected}
              />
            </div>
            
            <Button variant="ghost" size="sm">
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={handleSendMessage}
              disabled={inputValue.trim() === "" || !isConnected}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}