import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    responseStatus?: string
  }>
}

interface SyncRequest {
  userId: string
  action: 'SYNC_FROM_GOOGLE' | 'SYNC_TO_GOOGLE' | 'BIDIRECTIONAL'
  events?: CalendarEvent[]
  timeMin?: string
  timeMax?: string
}

interface SyncResponse {
  success: boolean
  syncedEvents: number
  createdEvents: number
  updatedEvents: number
  deletedEvents: number
  errors?: string[]
  message: string
}

// Mock Google Calendar API integration
// In a real implementation, you would use the Google Calendar API client library
class GoogleCalendarService {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      // Mock implementation - in real implementation, this would call Google Calendar API
      const mockEvents: CalendarEvent[] = [
        {
          id: 'google-event-1',
          summary: 'Team Standup',
          description: 'Daily team standup meeting',
          start: {
            dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
            timeZone: 'UTC'
          },
          location: 'Conference Room A'
        },
        {
          id: 'google-event-2',
          summary: 'Client Presentation',
          description: 'Q4 results presentation to client',
          start: {
            dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC'
          },
          location: 'Client Office'
        }
      ]

      return mockEvents
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error)
      throw new Error('Failed to fetch Google Calendar events')
    }
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      // Mock implementation - in real implementation, this would call Google Calendar API
      const createdEvent: CalendarEvent = {
        ...event,
        id: `google-${Date.now()}`
      }

      return createdEvent
    } catch (error) {
      console.error('Error creating Google Calendar event:', error)
      throw new Error('Failed to create Google Calendar event')
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      // Mock implementation - in real implementation, this would call Google Calendar API
      const updatedEvent: CalendarEvent = {
        id: eventId,
        summary: event.summary || 'Updated Event',
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location
      }

      return updatedEvent
    } catch (error) {
      console.error('Error updating Google Calendar event:', error)
      throw new Error('Failed to update Google Calendar event')
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      // Mock implementation - in real implementation, this would call Google Calendar API
      console.log(`Deleted Google Calendar event: ${eventId}`)
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error)
      throw new Error('Failed to delete Google Calendar event')
    }
  }
}

class CalendarSyncService {
  private googleCalendar: GoogleCalendarService

  constructor(accessToken: string) {
    this.googleCalendar = new GoogleCalendarService(accessToken)
  }

  async syncFromGoogle(userId: string, timeMin?: string, timeMax?: string): Promise<SyncResponse> {
    try {
      const googleEvents = await this.googleCalendar.getEvents(timeMin, timeMax)
      
      let createdEvents = 0
      let updatedEvents = 0
      const errors: string[] = []

      for (const googleEvent of googleEvents) {
        try {
          // Check if event already exists in our database
          const existingEvent = await db.calendarEvent.findFirst({
            where: {
              userId,
              externalId: googleEvent.id
            }
          })

          const startTime = googleEvent.start.dateTime ? new Date(googleEvent.start.dateTime) : 
                          googleEvent.start.date ? new Date(googleEvent.start.date) : new Date()
          const endTime = googleEvent.end.dateTime ? new Date(googleEvent.end.dateTime) : 
                        googleEvent.end.date ? new Date(googleEvent.end.date) : new Date()

          if (existingEvent) {
            // Update existing event
            await db.calendarEvent.update({
              where: { id: existingEvent.id },
              data: {
                title: googleEvent.summary,
                description: googleEvent.description,
                startTime,
                endTime,
                isAllDay: !googleEvent.start.dateTime,
                location: googleEvent.location,
                lastSyncedAt: new Date()
              }
            })
            updatedEvents++
          } else {
            // Create new event
            await db.calendarEvent.create({
              data: {
                userId,
                externalId: googleEvent.id,
                title: googleEvent.summary,
                description: googleEvent.description,
                startTime,
                endTime,
                isAllDay: !googleEvent.start.dateTime,
                location: googleEvent.location,
                timezone: googleEvent.start.timeZone || 'UTC',
                lastSyncedAt: new Date()
              }
            })
            createdEvents++
          }
        } catch (error) {
          console.error('Error syncing Google Calendar event:', error)
          errors.push(`Failed to sync event: ${googleEvent.summary}`)
        }
      }

      return {
        success: true,
        syncedEvents: googleEvents.length,
        createdEvents,
        updatedEvents,
        deletedEvents: 0,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully synced ${googleEvents.length} events from Google Calendar`
      }
    } catch (error) {
      console.error('Error syncing from Google Calendar:', error)
      return {
        success: false,
        syncedEvents: 0,
        createdEvents: 0,
        updatedEvents: 0,
        deletedEvents: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Failed to sync from Google Calendar'
      }
    }
  }

  async syncToGoogle(userId: string, events?: CalendarEvent[]): Promise<SyncResponse> {
    try {
      // Get events from our database that need to be synced to Google
      const nexusEvents = events || await db.calendarEvent.findMany({
        where: {
          userId,
          OR: [
            { externalId: null }, // New events not in Google Calendar
            { lastSyncedAt: null } // Events that haven't been synced
          ]
        }
      })

      let createdEvents = 0
      let updatedEvents = 0
      const errors: string[] = []

      for (const nexusEvent of nexusEvents) {
        try {
          const googleEvent: Omit<CalendarEvent, 'id'> = {
            summary: nexusEvent.title,
            description: nexusEvent.description,
            start: {
              dateTime: nexusEvent.isAllDay ? undefined : nexusEvent.startTime.toISOString(),
              date: nexusEvent.isAllDay ? nexusEvent.startTime.toISOString().split('T')[0] : undefined,
              timeZone: nexusEvent.timezone
            },
            end: {
              dateTime: nexusEvent.isAllDay ? undefined : nexusEvent.endTime.toISOString(),
              date: nexusEvent.isAllDay ? nexusEvent.endTime.toISOString().split('T')[0] : undefined,
              timeZone: nexusEvent.timezone
            },
            location: nexusEvent.location
          }

          if (nexusEvent.externalId) {
            // Update existing Google Calendar event
            await this.googleCalendar.updateEvent(nexusEvent.externalId, googleEvent)
            updatedEvents++
          } else {
            // Create new Google Calendar event
            const createdGoogleEvent = await this.googleCalendar.createEvent(googleEvent)
            
            // Update our database with the external ID
            await db.calendarEvent.update({
              where: { id: nexusEvent.id },
              data: {
                externalId: createdGoogleEvent.id,
                lastSyncedAt: new Date()
              }
            })
            createdEvents++
          }
        } catch (error) {
          console.error('Error syncing event to Google Calendar:', error)
          errors.push(`Failed to sync event: ${nexusEvent.title}`)
        }
      }

      return {
        success: true,
        syncedEvents: nexusEvents.length,
        createdEvents,
        updatedEvents,
        deletedEvents: 0,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully synced ${nexusEvents.length} events to Google Calendar`
      }
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error)
      return {
        success: false,
        syncedEvents: 0,
        createdEvents: 0,
        updatedEvents: 0,
        deletedEvents: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Failed to sync to Google Calendar'
      }
    }
  }

  async bidirectionalSync(userId: string, timeMin?: string, timeMax?: string): Promise<SyncResponse> {
    try {
      // First sync from Google to Nexus
      const fromGoogleResponse = await this.syncFromGoogle(userId, timeMin, timeMax)
      
      // Then sync from Nexus to Google
      const toGoogleResponse = await this.syncToGoogle(userId)

      const totalErrors = [
        ...(fromGoogleResponse.errors || []),
        ...(toGoogleResponse.errors || [])
      ]

      return {
        success: fromGoogleResponse.success && toGoogleResponse.success,
        syncedEvents: fromGoogleResponse.syncedEvents + toGoogleResponse.syncedEvents,
        createdEvents: fromGoogleResponse.createdEvents + toGoogleResponse.createdEvents,
        updatedEvents: fromGoogleResponse.updatedEvents + toGoogleResponse.updatedEvents,
        deletedEvents: fromGoogleResponse.deletedEvents + toGoogleResponse.deletedEvents,
        errors: totalErrors.length > 0 ? totalErrors : undefined,
        message: `Bidirectional sync completed. ${fromGoogleResponse.message} ${toGoogleResponse.message}`
      }
    } catch (error) {
      console.error('Error during bidirectional sync:', error)
      return {
        success: false,
        syncedEvents: 0,
        createdEvents: 0,
        updatedEvents: 0,
        deletedEvents: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        message: 'Failed to perform bidirectional sync'
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json()
    const { userId, action, events, timeMin, timeMax } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would get the access token from your database
    // based on the user ID
    const accessToken = 'mock-google-access-token'

    const syncService = new CalendarSyncService(accessToken)
    let response: SyncResponse

    switch (action) {
      case 'SYNC_FROM_GOOGLE':
        response = await syncService.syncFromGoogle(userId, timeMin, timeMax)
        break
      case 'SYNC_TO_GOOGLE':
        response = await syncService.syncToGoogle(userId, events)
        break
      case 'BIDIRECTIONAL':
        response = await syncService.bidirectionalSync(userId, timeMin, timeMax)
        break
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid sync action' },
          { status: 400 }
        )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to sync calendar',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 500 }
    )
  }
}