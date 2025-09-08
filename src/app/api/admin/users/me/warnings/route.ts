import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth'

export const runtime = 'nodejs'

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

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { reason } = await request.json()
    // Note: reason is extracted but not currently used in the logic

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (currentUser.isDisqualified) {
      return NextResponse.json(
        { error: 'User is already disqualified' },
        { status: 400 }
      )
    }

    const newWarningCount = currentUser.warnings + 1
    const shouldDisqualify = newWarningCount >= 3

    // Update user with new warning count
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        warnings: newWarningCount,
        isDisqualified: shouldDisqualify,
        disqualifiedAt: shouldDisqualify ? new Date() : null,
      },
    })

    return NextResponse.json({
      user: updatedUser,
      message: shouldDisqualify 
        ? 'You have been disqualified after 3 warnings'
        : `Warning added. You now have ${newWarningCount}/3 warnings`,
      isDisqualified: shouldDisqualify,
    })
  } catch (error) {
    console.error('Failed to add warning:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
