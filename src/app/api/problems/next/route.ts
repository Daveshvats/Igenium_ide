import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth'

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

    // Get all problems that the user hasn't solved yet
    const solvedProblemIds = await prisma.submission.findMany({
      where: {
        userId: user.id,
        status: 'ACCEPTED',
      },
      select: {
        problemId: true,
      },
      distinct: ['problemId'],
    })

    const solvedIds = solvedProblemIds.map(sub => sub.problemId)

    // Find next unsolved problem
    const nextProblem = await prisma.problem.findFirst({
      where: {
        isActive: true,
        id: {
          notIn: solvedIds,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    if (!nextProblem) {
      return NextResponse.json({
        message: 'No more problems available',
        nextProblem: null,
      })
    }

    return NextResponse.json({
      nextProblem,
    })
  } catch (error) {
    console.error('Failed to fetch next problem:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
