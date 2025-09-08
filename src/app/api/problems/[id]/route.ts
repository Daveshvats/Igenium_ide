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

    const problem = await prisma.problem.findUnique({
      where: { id, isActive: true },
    })

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      )
    }

    // Get test cases (only non-hidden ones for regular users)
    const testCases = await prisma.testCase.findMany({
      where: { 
        problemId: id,
        isHidden: user.role === 'ADMIN' ? undefined : false
      },
    })

    return NextResponse.json({ problem, testCases })
  } catch (error) {
    console.error('Failed to fetch problem:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
