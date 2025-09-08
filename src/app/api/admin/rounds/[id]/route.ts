import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth'

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

    const { status } = await request.json()

    if (status === 'ACTIVE') {
      // When starting a round, set start and end times
      const round = await prisma.round.findUnique({
        where: { id },
      })

      if (!round) {
        return NextResponse.json(
          { error: 'Round not found' },
          { status: 404 }
        )
      }

      const startTime = new Date()
      const endTime = new Date(startTime.getTime() + round.duration * 60 * 1000)

      const updatedRound = await prisma.round.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          startTime,
          endTime,
        },
      })

      return NextResponse.json({ round: updatedRound })
    } else {
      const updatedRound = await prisma.round.update({
        where: { id },
        data: { status },
      })

      return NextResponse.json({ round: updatedRound })
    }
  } catch (error) {
    console.error('Failed to update round:', error)
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

    await prisma.round.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Round deleted successfully' })
  } catch (error) {
    console.error('Failed to delete round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
