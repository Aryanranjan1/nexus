"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const user = session?.user

  const signIn = () => {
    router.push("/auth/signin")
  }

  const signOut = () => {
    router.push("/auth/signout")
  }

  const requireAuth = (callback?: () => void) => {
    if (isLoading) return
    
    if (!isAuthenticated) {
      router.push("/auth/signin")
      return
    }
    
    callback?.()
  }

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    requireAuth,
  }
}