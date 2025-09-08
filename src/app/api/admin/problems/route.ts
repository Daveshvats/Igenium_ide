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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const problems = await prisma.problem.findMany({
      include: {
        _count: {
          select: {
            testCases: true,
            submissions: true,
          },
        },
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

export async function POST(request: NextRequest) {
  try {
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

    const {
      title,
      description,
      skeletonCode,
      language,
      type,
      timeLimit,
      memoryLimit,
      points,
    } = await request.json()

    if (!title || !description || !skeletonCode) {
      return NextResponse.json(
        { error: 'Title, description, and skeleton code are required' },
        { status: 400 }
      )
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        skeletonCode,
        language: language || 'javascript',
        type: type || 'GENERAL',
        timeLimit: timeLimit || 2000,
        memoryLimit: memoryLimit || 128,
        points: points || 100,
      },
    })

    return NextResponse.json({ problem })
  } catch (error) {
    console.error('Failed to create problem:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
