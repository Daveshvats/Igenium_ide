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

    // Get problem details
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    })

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      )
    }

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId,
        code,
        language,
        status: 'PENDING',
      },
    })

    // Execute code against all test cases
    const testResults = []
    let allPassed = true
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

        if (!passed) {
          allPassed = false
        }

        testResults.push({
          testCase: testResults.length + 1,
          passed,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.output,
          error: result.error,
        })
      } catch (error) {
        allPassed = false
        testResults.push({
          testCase: testResults.length + 1,
          passed: false,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    const finalStatus = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER'
    const score = allPassed ? problem.points : 0

    const executionResult = {
      status: finalStatus,
      executionTime: totalExecutionTime,
      memoryUsage: maxMemoryUsage,
      score,
      testResults,
    }

    // Update submission with results
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: executionResult.status as 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR',
        executionTime: executionResult.executionTime,
        memoryUsage: executionResult.memoryUsage,
        score: executionResult.score,
      },
    })

    return NextResponse.json(executionResult)
  } catch (error) {
    console.error('Submission failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
