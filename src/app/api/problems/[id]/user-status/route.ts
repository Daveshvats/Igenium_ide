import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check if user has already passed this problem
    const passedSubmission = await prisma.submission.findFirst({
      where: {
        userId: user.id,
        problemId: id,
        status: 'ACCEPTED',
      },
      orderBy: { submittedAt: 'desc' },
    })

    // Get all user submissions for this problem
    const allSubmissions = await prisma.submission.findMany({
      where: {
        userId: user.id,
        problemId: id,
      },
      orderBy: { submittedAt: 'desc' },
    })

    // Check if user is disqualified
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        isDisqualified: true,
        warnings: true,
      },
    })

    return NextResponse.json({
      hasPassed: !!passedSubmission,
      passedSubmission,
      totalSubmissions: allSubmissions.length,
      allSubmissions,
      isDisqualified: currentUser?.isDisqualified || false,
      warnings: currentUser?.warnings || 0,
    })
  } catch (error) {
    console.error('Failed to check user status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
