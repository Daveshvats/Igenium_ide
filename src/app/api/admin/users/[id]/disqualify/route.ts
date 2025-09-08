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

    const { action } = await request.json() // 'disqualify' or 'undisqualify'

    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (action === 'disqualify') {
      if (targetUser.isDisqualified) {
        return NextResponse.json(
          { error: 'User is already disqualified' },
          { status: 400 }
        )
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          isDisqualified: true,
          disqualifiedAt: new Date(),
        },
      })

      return NextResponse.json({
        user: updatedUser,
        message: 'User has been disqualified',
      })
    } else if (action === 'undisqualify') {
      if (!targetUser.isDisqualified) {
        return NextResponse.json(
          { error: 'User is not disqualified' },
          { status: 400 }
        )
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          isDisqualified: false,
          disqualifiedAt: null,
          warnings: 0, // Reset warnings when undisqualifying
        },
      })

      return NextResponse.json({
        user: updatedUser,
        message: 'User has been un-disqualified and warnings reset',
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "disqualify" or "undisqualify"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to update disqualification status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
