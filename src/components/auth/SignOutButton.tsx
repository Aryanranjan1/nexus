"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-slate-600 hover:text-slate-900"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  )
}