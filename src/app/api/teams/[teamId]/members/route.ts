import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/teams/[teamId]/members - Get all members of a team
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const members = await db.teamMember.findMany({
      where: { teamId: params.teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    })

    return NextResponse.json(members)

  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/teams/[teamId]/members - Add a new member to a team
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const body = await request.json()
    const { userId, role = 'MEMBER' } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existingMember = await db.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: params.teamId
        }
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      )
    }

    // Add the member
    const member = await db.teamMember.create({
      data: {
        userId,
        teamId: params.teamId,
        role
      },
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
    })

    // Get team info for logging
    const team = await db.team.findUnique({
      where: { id: params.teamId }
    })

    // Log the action
    await db.aILog.create({
      data: {
        userId,
        input: JSON.stringify({ action: 'add_team_member', teamId: params.teamId, role }),
        output: JSON.stringify({ memberId: member.id, teamName: team?.name }),
        model: 'team-management',
        responseTime: Date.now()
      }
    })

    return NextResponse.json(member)

  } catch (error) {
    console.error('Error adding team member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}