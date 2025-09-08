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

    // Get all problems that the user has solved (ACCEPTED status)
    const solvedSubmissions = await prisma.submission.findMany({
      where: {
        userId: user.id,
        status: 'ACCEPTED',
      },
      select: {
        problemId: true,
      },
      distinct: ['problemId'],
    })

    const solvedProblemIds = solvedSubmissions.map(sub => sub.problemId)

    return NextResponse.json({ solvedProblemIds })
  } catch (error) {
    console.error('Failed to fetch solved problems:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
