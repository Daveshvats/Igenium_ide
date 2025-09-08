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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const rounds = await prisma.round.findMany({
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
        _count: {
          select: {
            problems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ rounds })
  } catch (error) {
    console.error('Failed to fetch rounds:', error)
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

    const { title, description, duration, problemIds } = await request.json()

    if (!title || !duration || !problemIds || problemIds.length === 0) {
      return NextResponse.json(
        { error: 'Title, duration, and at least one problem are required' },
        { status: 400 }
      )
    }

    const round = await prisma.round.create({
      data: {
        title,
        description,
        duration,
        status: 'DRAFT',
        problems: {
          create: problemIds.map((problemId: string, index: number) => ({
            problemId,
            order: index,
          })),
        },
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    })

    return NextResponse.json({ round })
  } catch (error) {
    console.error('Failed to create round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
