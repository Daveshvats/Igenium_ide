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

    // Get all users with their total scores (exclude disqualified users)
    const users = await prisma.user.findMany({
      where: { 
        role: 'USER',
        isDisqualified: false, // Exclude disqualified users
      },
      select: {
        id: true,
        username: true,
        submissions: {
          where: { status: 'ACCEPTED' },
          select: {
            score: true,
            submittedAt: true,
            problem: {
              select: {
                title: true,
                points: true,
              },
            },
          },
        },
      },
    })

    // Calculate total scores and problem counts
    const leaderboard = users.map(user => {
      const totalScore = user.submissions.reduce((sum, submission) => sum + (submission.score || 0), 0)
      const problemsSolved = user.submissions.length
      const lastSubmission = user.submissions.length > 0 
        ? user.submissions.reduce((latest, submission) => 
            submission.submittedAt > latest.submittedAt ? submission : latest
          )
        : null

      return {
        id: user.id,
        username: user.username,
        totalScore,
        problemsSolved,
        lastSubmission: lastSubmission?.submittedAt,
        submissions: user.submissions,
      }
    }).sort((a, b) => {
      // Sort by total score (descending), then by problems solved (descending), then by last submission (ascending)
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore
      }
      if (b.problemsSolved !== a.problemsSolved) {
        return b.problemsSolved - a.problemsSolved
      }
      if (a.lastSubmission && b.lastSubmission) {
        return new Date(a.lastSubmission).getTime() - new Date(b.lastSubmission).getTime()
      }
      return 0
    })

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
