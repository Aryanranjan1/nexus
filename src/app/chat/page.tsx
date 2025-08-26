"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { ChatInterface } from "@/components/chat/ChatInterface"

export default function ChatPage() {
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
      <div className="h-full">
        <ChatInterface />
      </div>
    </DashboardLayout>
  )
}