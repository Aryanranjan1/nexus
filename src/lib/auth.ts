import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and user id to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from the token
      session.accessToken = token.accessToken as string
      session.user.id = token.userId as string
      
      // Fetch user data from database
      const dbUser = await db.user.findUnique({
        where: { id: token.userId as string },
        include: {
          subscription: true
        }
      })

      if (dbUser) {
        session.user.subscription = dbUser.subscription
        session.user.timezone = dbUser.timezone
        session.user.name = dbUser.name
        session.user.email = dbUser.email
        session.user.avatar = dbUser.avatar
      }

      return session
    },
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          // Create new user with default subscription
          const defaultSubscription = await db.subscription.create({
            data: {
              type: "FREE",
              status: "ACTIVE",
              lifetimeAccess: false
            }
          })

          await db.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              avatar: user.image,
              timezone: "UTC",
              subscriptionId: defaultSubscription.id
            }
          })
        }

        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  events: {
    async signIn(message) {
      console.log("Successful sign in:", message)
    },
    async signOut(message) {
      console.log("Successful sign out:", message)
    },
    async createUser(message) {
      console.log("New user created:", message)
    },
    async updateUser(message) {
      console.log("User updated:", message)
    },
    async linkAccount(message) {
      console.log("Account linked:", message)
    },
    async session(message) {
      console.log("Session created:", message)
    }
  },
  debug: process.env.NODE_ENV === "development",
}