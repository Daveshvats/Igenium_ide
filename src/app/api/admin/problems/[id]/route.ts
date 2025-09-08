import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function PATCH(
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

    const { isActive } = await request.json()

    const problem = await prisma.problem.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json({ problem })
  } catch (error) {
    console.error('Failed to update problem:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const problem = await prisma.problem.update({
      where: { id },
      data: {
        title,
        description,
        skeletonCode,
        language,
        type,
        timeLimit,
        memoryLimit,
        points,
      },
    })

    return NextResponse.json({ problem })
  } catch (error) {
    console.error('Failed to update problem:', error)
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

    const problem = await prisma.problem.findUnique({
      where: { id },
    })

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ problem })
  } catch (error) {
    console.error('Failed to fetch problem:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.problem.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Problem deleted successfully' })
  } catch (error) {
    console.error('Failed to delete problem:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
