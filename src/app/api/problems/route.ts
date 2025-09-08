import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await validateSession(token)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Check if user is disqualified
    if (user.isDisqualified) {
      return NextResponse.json(
        { error: 'You have been disqualified and cannot access problems' },
        { status: 403 }
      )
    }

    const problems = await prisma.problem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        points: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ problems })
  } catch (error) {
    console.error('Failed to fetch problems:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
