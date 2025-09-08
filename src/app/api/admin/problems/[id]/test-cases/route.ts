import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth'

export async function POST(
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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { input, expectedOutput, isHidden = false } = await request.json()

    if (!input || !expectedOutput) {
      return NextResponse.json(
        { error: 'Input and expected output are required' },
        { status: 400 }
      )
    }

    // Verify problem exists
    const problem = await prisma.problem.findUnique({
      where: { id },
    })

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      )
    }

    const testCase = await prisma.testCase.create({
      data: {
        problemId: id,
        input,
        expectedOutput,
        isHidden,
      },
    })

    return NextResponse.json({ testCase })
  } catch (error) {
    console.error('Failed to create test case:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const testCases = await prisma.testCase.findMany({
      where: { problemId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ testCases })
  } catch (error) {
    console.error('Failed to fetch test cases:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
