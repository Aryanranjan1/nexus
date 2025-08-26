interface TimeZoneInfo {
  id: string
  name: string
  offset: string
  offsetMinutes: number
  isDst: boolean
}

interface ConvertedTime {
  localTime: Date
  targetTime: Date
  timeZone: string
  offset: string
  formatted: string
}

interface TimeSlot {
  start: Date
  end: Date
  duration: number // in minutes
}

class TimeZoneService {
  private static instance: TimeZoneService
  private timeZoneCache: Map<string, TimeZoneInfo> = new Map()

  private constructor() {}

  static getInstance(): TimeZoneService {
    if (!TimeZoneService.instance) {
      TimeZoneService.instance = new TimeZoneService()
    }
    return TimeZoneService.instance
  }

  /**
   * Get all available time zones
   */
  getAvailableTimeZones(): TimeZoneInfo[] {
    const timeZones: TimeZoneInfo[] = []
    
    // Common time zones with their IANA identifiers
    const commonTimeZones = [
      'UTC',
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Singapore',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Pacific/Auckland'
    ]

    commonTimeZones.forEach(tz => {
      const info = this.getTimeZoneInfo(tz)
      if (info) {
        timeZones.push(info)
      }
    })

    return timeZones.sort((a, b) => a.offsetMinutes - b.offsetMinutes)
  }

  /**
   * Get time zone information for a specific time zone
   */
  getTimeZoneInfo(timeZone: string): TimeZoneInfo | null {
    try {
      // Check cache first
      if (this.timeZoneCache.has(timeZone)) {
        return this.timeZoneCache.get(timeZone)!
      }

      // Get current time in the specified time zone
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        timeZone,
        timeZoneName: 'longOffset',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }

      const formatter = new Intl.DateTimeFormat('en-US', options)
      const parts = formatter.formatToParts(now)
      
      // Extract time zone offset
      const offsetPart = parts.find(part => part.type === 'timeZoneName')
      if (!offsetPart) return null

      const offset = offsetPart.value
      const offsetMinutes = this.parseOffsetToMinutes(offset)

      const info: TimeZoneInfo = {
        id: timeZone,
        name: this.getTimeZoneDisplayName(timeZone),
        offset,
        offsetMinutes,
        isDst: this.isDST(now, timeZone)
      }

      // Cache the result
      this.timeZoneCache.set(timeZone, info)
      return info
    } catch (error) {
      console.error(`Error getting time zone info for ${timeZone}:`, error)
      return null
    }
  }

  /**
   * Convert time from one time zone to another
   */
  convertTime(
    sourceTime: Date,
    sourceTimeZone: string,
    targetTimeZone: string
  ): ConvertedTime {
    try {
      const sourceInfo = this.getTimeZoneInfo(sourceTimeZone)
      const targetInfo = this.getTimeZoneInfo(targetTimeZone)

      if (!sourceInfo || !targetInfo) {
        throw new Error('Invalid time zone')
      }

      // Calculate the time difference between time zones
      const timeDifference = targetInfo.offsetMinutes - sourceInfo.offsetMinutes
      
      // Convert the time
      const targetTime = new Date(sourceTime.getTime() + timeDifference * 60 * 1000)

      return {
        localTime: sourceTime,
        targetTime,
        timeZone: targetTimeZone,
        offset: targetInfo.offset,
        formatted: this.formatDateTime(targetTime, targetTimeZone)
      }
    } catch (error) {
      console.error('Error converting time:', error)
      throw new Error('Failed to convert time between time zones')
    }
  }

  /**
   * Find optimal meeting times across multiple time zones
   */
  findOptimalMeetingTimes(
    participants: Array<{
      timeZone: string
      workingHours: { start: string; end: string } // HH:mm format
      preferences?: {
        preferredDays: number[] // 0-6 (Sunday-Saturday)
        preferredTimes: { start: string; end: string }[]
      }
    }>,
    duration: number, // in minutes
    dateRange: { start: Date; end: Date },
    options: {
      maxResults?: number
      bufferTime?: number // minutes before/after meetings
    } = {}
  ): Array<{
    startTime: Date
    endTime: Date
    participantTimes: Array<{ timeZone: string; time: Date; isWorkingHours: boolean }>
    score: number
  }> {
    const {
      maxResults = 10,
      bufferTime = 15
    } = options

    const results: Array<{
      startTime: Date
      endTime: Date
      participantTimes: Array<{ timeZone: string; time: Date; isWorkingHours: boolean }>
      score: number
    }> = []

    // Generate time slots in 15-minute increments
    const slots = this.generateTimeSlots(dateRange.start, dateRange.end, 15)

    for (const slot of slots) {
      if (slot.duration < duration) continue

      const meetingEnd = new Date(slot.start.getTime() + duration * 60 * 1000)
      
      // Check if meeting fits within slot
      if (meetingEnd > slot.end) continue

      const participantTimes = participants.map(participant => {
        const localTime = this.convertTime(slot.start, 'UTC', participant.timeZone)
        const isWorkingHours = this.isInWorkingHours(
          localTime.targetTime,
          participant.workingHours,
          participant.timeZone
        )
        
        return {
          timeZone: participant.timeZone,
          time: localTime.targetTime,
          isWorkingHours
        }
      })

      // Calculate score based on:
      // 1. Number of participants in working hours
      // 2. Time preferences
      // 3. Avoid early morning/late evening times
      const workingHoursCount = participantTimes.filter(p => p.isWorkingHours).length
      const workingHoursScore = workingHoursCount / participants.length

      const timePreferenceScore = this.calculateTimePreferenceScore(
        slot.start,
        participants
      )

      const timeOfDayScore = this.calculateTimeOfDayScore(slot.start)

      const overallScore = (workingHoursScore * 0.5) + (timePreferenceScore * 0.3) + (timeOfDayScore * 0.2)

      results.push({
        startTime: slot.start,
        endTime: meetingEnd,
        participantTimes,
        score: overallScore
      })
    }

    // Sort by score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
  }

  /**
   * Format date and time for a specific time zone
   */
  formatDateTime(date: Date, timeZone: string, format: 'full' | 'date' | 'time' = 'full'): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }

    if (format === 'date') {
      delete options.hour
      delete options.minute
      delete options.hour12
    } else if (format === 'time') {
      delete options.year
      delete options.month
      delete options.day
    }

    return new Intl.DateTimeFormat('en-US', options).format(date)
  }

  /**
   * Get user-friendly time zone display name
   */
  private getTimeZoneDisplayName(timeZone: string): string {
    const names: Record<string, string> = {
      'UTC': 'Coordinated Universal Time',
      'America/New_York': 'Eastern Time',
      'America/Los_Angeles': 'Pacific Time',
      'America/Chicago': 'Central Time',
      'Europe/London': 'Greenwich Mean Time',
      'Europe/Paris': 'Central European Time',
      'Europe/Berlin': 'Central European Time',
      'Asia/Tokyo': 'Japan Standard Time',
      'Asia/Shanghai': 'China Standard Time',
      'Asia/Singapore': 'Singapore Time',
      'Asia/Kolkata': 'India Standard Time',
      'Australia/Sydney': 'Australian Eastern Time',
      'Pacific/Auckland': 'New Zealand Time'
    }

    return names[timeZone] || timeZone.replace(/_/g, ' ')
  }

  /**
   * Parse offset string to minutes
   */
  private parseOffsetToMinutes(offset: string): number {
    const match = offset.match(/GMT([+-])(\d{1,2}):?(\d{2})?/)
    if (!match) return 0

    const sign = match[1] === '+' ? 1 : -1
    const hours = parseInt(match[2], 10)
    const minutes = match[3] ? parseInt(match[3], 10) : 0

    return sign * (hours * 60 + minutes)
  }

  /**
   * Check if it's currently DST for a time zone
   */
  private isDST(date: Date, timeZone: string): boolean {
    const jan = new Date(date.getFullYear(), 0, 1)
    const jul = new Date(date.getFullYear(), 6, 1)
    
    const janOffset = this.getTimeZoneOffset(jan, timeZone)
    const julOffset = this.getTimeZoneOffset(jul, timeZone)
    
    return Math.max(janOffset, julOffset) === this.getTimeZoneOffset(date, timeZone)
  }

  /**
   * Get time zone offset in minutes for a specific date
   */
  private getTimeZoneOffset(date: Date, timeZone: string): number {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset'
    })
    
    const parts = formatter.formatToParts(date)
    const offsetPart = parts.find(part => part.type === 'timeZoneName')
    
    if (!offsetPart) return 0
    
    return this.parseOffsetToMinutes(offsetPart.value)
  }

  /**
   * Generate time slots between two dates
   */
  private generateTimeSlots(start: Date, end: Date, incrementMinutes: number): TimeSlot[] {
    const slots: TimeSlot[] = []
    const current = new Date(start)
    
    while (current < end) {
      const slotEnd = new Date(current.getTime() + incrementMinutes * 60 * 1000)
      
      slots.push({
        start: new Date(current),
        end: slotEnd,
        duration: incrementMinutes
      })
      
      current.setTime(slotEnd.getTime())
    }
    
    return slots
  }

  /**
   * Check if time is within working hours
   */
  private isInWorkingHours(
    time: Date,
    workingHours: { start: string; end: string },
    timeZone: string
  ): boolean {
    const [startHour, startMinute] = workingHours.start.split(':').map(Number)
    const [endHour, endMinute] = workingHours.end.split(':').map(Number)
    
    const startTime = new Date(time)
    startTime.setHours(startHour, startMinute, 0, 0)
    
    const endTime = new Date(time)
    endTime.setHours(endHour, endMinute, 0, 0)
    
    return time >= startTime && time <= endTime
  }

  /**
   * Calculate time preference score
   */
  private calculateTimePreferenceScore(
    time: Date,
    participants: Array<{
      timeZone: string
      preferences?: {
        preferredDays: number[]
        preferredTimes: { start: string; end: string }[]
      }
    }>
  ): number {
    let totalScore = 0
    let participantCount = 0

    for (const participant of participants) {
      if (!participant.preferences) continue

      participantCount++
      let participantScore = 0

      // Check preferred days
      const dayOfWeek = time.getDay()
      if (participant.preferences.preferredDays.includes(dayOfWeek)) {
        participantScore += 0.5
      }

      // Check preferred times
      const timeString = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
      
      for (const preferredTime of participant.preferences.preferredTimes || []) {
        if (timeString >= preferredTime.start && timeString <= preferredTime.end) {
          participantScore += 0.5
          break
        }
      }

      totalScore += participantScore
    }

    return participantCount > 0 ? totalScore / participantCount : 0
  }

  /**
   * Calculate time of day score (prefer 9 AM - 5 PM)
   */
  private calculateTimeOfDayScore(time: Date): number {
    const hour = time.getHours()
    
    if (hour >= 9 && hour <= 17) {
      return 1.0 // Business hours
    } else if (hour >= 8 && hour <= 18) {
      return 0.7 // Extended business hours
    } else if (hour >= 7 && hour <= 19) {
      return 0.4 // Early morning/late evening
    } else {
      return 0.1 // Night time
    }
  }
}

export const timeZoneService = TimeZoneService.getInstance()
export { TimeZoneService, type TimeZoneInfo, type ConvertedTime, type TimeSlot }