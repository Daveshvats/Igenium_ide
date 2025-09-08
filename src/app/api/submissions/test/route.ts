import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateSession } from '@/lib/auth'
import { codeExecutor } from '@/lib/codeExecutor'

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

    const { problemId, code, language } = await request.json()

    if (!problemId || !code || !language) {
      return NextResponse.json(
        { error: 'Problem ID, code, and language are required' },
        { status: 400 }
      )
    }

    // Get problem details and test cases
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { 
        testCases: {
          where: { isHidden: false } // Only show non-hidden test cases for testing
        }
      },
    })

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      )
    }

    // Execute code against visible test cases only
    const testResults = []
    let totalExecutionTime = 0
    let maxMemoryUsage = 0

    for (const testCase of problem.testCases) {
      try {
        const result = await codeExecutor.executeCode(
          code,
          language,
          testCase.input,
          problem.timeLimit,
          problem.memoryLimit
        )

        totalExecutionTime = Math.max(totalExecutionTime, result.executionTime)
        maxMemoryUsage = Math.max(maxMemoryUsage, result.memoryUsage)

        const passed = result.status === 'SUCCESS' && 
                      result.output.trim() === testCase.expectedOutput.trim()

        testResults.push({
          testCase: testResults.length + 1,
          passed,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          error: result.error,
        })
      } catch (error) {
        testResults.push({
          testCase: testResults.length + 1,
          passed: false,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const executionResult = {
      status: 'TEST_COMPLETED',
      executionTime: totalExecutionTime,
      memoryUsage: maxMemoryUsage,
      testResults,
    }

    return NextResponse.json(executionResult)
  } catch (error) {
    console.error('Test execution failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
