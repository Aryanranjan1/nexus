"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useSession } from "next-auth/react"

interface UseSocketOptions {
  onConnect?: () => void
  onDisconnect?: () => void
  onAuthenticated?: (data: any) => void
  onError?: (error: any) => void
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  lastMessage: any | null
  send: (event: string, data: any) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
}

export const useSocket = (
  uri: string,
  options?: UseSocketOptions
): UseSocketReturn => {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any | null>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!session?.user) {
      return
    }

    const socket = io(uri, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    const handleConnect = () => {
      console.log("Socket connected:", socket.id)
      setIsConnected(true)
      
      // Authenticate with the server
      socket.emit("authenticate", {
        userId: session.user.id,
        token: session.accessToken, // Assuming you have an access token
      })

      options?.onConnect?.()
    }

    const handleDisconnect = () => {
      console.log("Socket disconnected")
      setIsConnected(false)
      options?.onDisconnect?.()
    }

    const handleAuthenticated = (data: any) => {
      console.log("Socket authenticated:", data)
      options?.onAuthenticated?.(data)
    }

    const handleError = (error: any) => {
      console.error("Socket error:", error)
      options?.onError?.(error)
    }

    const handleAnyEvent = (event: string, ...args: any[]) => {
      setLastMessage({ event, data: args })
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("authenticated", handleAuthenticated)
    socket.on("error", handleError)
    socket.onAny(handleAnyEvent)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("authenticated", handleAuthenticated)
      socket.off("error", handleError)
      socket.offAny(handleAnyEvent)
      socket.disconnect()
    }
  }, [uri, session, options])

  const send = (event: string, data: any) => {
    socketRef.current?.emit(event, data)
  }

  const joinRoom = (roomId: string) => {
    if (session?.user) {
      send("join-room", { roomId, userId: session.user.id })
    }
  }

  const leaveRoom = (roomId: string) => {
    if (session?.user) {
      send("leave-room", { roomId, userId: session.user.id })
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    lastMessage,
    send,
    joinRoom,
    leaveRoom,
  }
}