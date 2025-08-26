import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/teams - Get all teams for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const teams = await db.team.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        schedules: {
          orderBy: {
            startTime: 'asc'
          },
          where: {
            startTime: {
              gte: new Date()
            }
          }
        },
        chatThreads: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(teams)

  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, description } = body

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the team
    const team = await db.team.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    // Create a default team chat thread
    await db.chatThread.create({
      data: {
        title: `${name} Team Chat`,
        type: 'TEAM',
        userId,
        teamId: team.id
      }
    })

    // Log the action
    await db.aILog.create({
      data: {
        userId,
        input: JSON.stringify({ action: 'create_team', ...body }),
        output: JSON.stringify({ teamId: team.id }),
        model: 'team-management',
        responseTime: Date.now()
      }
    })

    return NextResponse.json(team)

  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}