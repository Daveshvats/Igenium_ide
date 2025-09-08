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

    const { reason } = await request.json()
    // Note: reason is extracted but not currently used in the logic

    // Get current user data
    const targetUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (targetUser.isDisqualified) {
      return NextResponse.json(
        { error: 'User is already disqualified' },
        { status: 400 }
      )
    }

    const newWarningCount = targetUser.warnings + 1
    const shouldDisqualify = newWarningCount >= 3

    // Update user with new warning count
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        warnings: newWarningCount,
        isDisqualified: shouldDisqualify,
        disqualifiedAt: shouldDisqualify ? new Date() : null,
      },
    })

    return NextResponse.json({
      user: updatedUser,
      message: shouldDisqualify 
        ? 'User has been disqualified after 3 warnings'
        : `Warning added. User now has ${newWarningCount}/3 warnings`,
    })
  } catch (error) {
    console.error('Failed to add warning:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
