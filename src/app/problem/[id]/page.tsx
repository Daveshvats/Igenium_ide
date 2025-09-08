'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import MonacoEditor from '@monaco-editor/react'
import { TabRestriction } from '@/components/TabRestriction'
import { RoundTimer } from '@/components/RoundTimer'

interface Problem {
  id: string
  title: string
  description: string
  skeletonCode: string
  language: string
  type: string
  timeLimit: number
  memoryLimit: number
  points: number
}


export default function ProblemPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    status?: string
    executionTime?: number
    memoryUsage?: number
    score?: number
    testResults?: Array<{
      testCase: number
      passed: boolean
      expectedOutput: string
      actualOutput: string
      error?: string
    }>
    error?: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'problem' | 'code' | 'test'>('code')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [roundEndTime, setRoundEndTime] = useState<Date | null>(null)
  const [userStatus, setUserStatus] = useState<{
    hasPassed: boolean
    passedSubmission: {
      id: string
      code: string
      status: string
      score: number
      submittedAt: string
    } | null
    totalSubmissions: number
    isDisqualified: boolean
    warnings: number
  } | null>(null)
  const [nextProblem, setNextProblem] = useState<{
    id: string
    title: string
    points: number
  } | null>(null)
  const [isDisqualified, setIsDisqualified] = useState(false)

  const fetchProblem = useCallback(async () => {
    try {
      const response = await fetch(`/api/problems/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProblem(data.problem)
        setCode(data.problem.skeletonCode)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch problem:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  const fetchActiveRound = useCallback(async () => {
    try {
      const response = await fetch('/api/rounds/active')
      if (response.ok) {
        const data = await response.json()
        if (data.round && data.round.endTime) {
          setRoundEndTime(new Date(data.round.endTime))
        }
      }
    } catch (error) {
      console.error('Failed to fetch active round:', error)
    }
  }, [])

  const fetchUserStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/problems/${params.id}/user-status`)
      if (response.ok) {
        const data = await response.json()
        setUserStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch user status:', error)
    }
  }, [params.id])

  const fetchNextProblem = useCallback(async () => {
    try {
      const response = await fetch('/api/problems/next')
      if (response.ok) {
        const data = await response.json()
        setNextProblem(data.nextProblem)
      } else if (response.status === 403) {
        setIsDisqualified(true)
      }
    } catch (error) {
      console.error('Failed to fetch next problem:', error)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchProblem()
    fetchActiveRound()
    fetchUserStatus()
    fetchNextProblem()
  }, [params.id, user, router, fetchProblem, fetchActiveRound, fetchUserStatus, fetchNextProblem])

  const handleWarningAdded = () => {
    // Refresh user status to check if disqualified
    fetchUserStatus()
  }

  // Check for disqualification when user status updates
  useEffect(() => {
    if (userStatus?.isDisqualified) {
      setIsDisqualified(true)
    }
  }, [userStatus])

  const handleSubmit = async () => {
    if (!problem || !code.trim()) return

    setSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language: problem.language,
        }),
      })

      const data = await response.json()
      setResult(data)
      
      // Show animated popup if submission was accepted
      if (data.status === 'ACCEPTED') {
        setShowSuccessPopup(true)
        setTimeout(() => setShowSuccessPopup(false), 3000) // Hide after 3 seconds
      }
    } catch (error) {
      console.error('Submission failed:', error)
      setResult({ error: 'Submission failed' })
    } finally {
      setSubmitting(false)
      // Refresh user status after submission
      fetchUserStatus()
    }
  }

  const runTest = async () => {
    if (!problem || !code.trim()) return

    setSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/submissions/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem.id,
          code,
          language: problem.language,
        }),
      })

      const data = await response.json()
      setResult(data)
      
      // Auto-forward to test results tab
      setActiveTab('test')
    } catch (error) {
      console.error('Test failed:', error)
      setResult({ error: 'Test failed' })
      setActiveTab('test')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (isDisqualified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You Have Been Disqualified
          </h1>
          <p className="text-gray-600 mb-6">
            You have received 3 warnings and have been disqualified from the competition. 
            Please contact an administrator to request reinstatement.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Problem not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TabRestriction onWarningAdded={handleWarningAdded} />
      
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-indigo-600 hover:text-indigo-500 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {problem.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {roundEndTime && (
                <RoundTimer 
                  endTime={roundEndTime} 
                  onTimeUp={() => {
                    alert('Time is up! The round has ended.')
                    router.push('/dashboard')
                  }}
                />
              )}
              {userStatus && userStatus.warnings > 0 && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userStatus.warnings >= 3 
                    ? 'bg-red-100 text-red-800' 
                    : userStatus.warnings >= 2 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  ⚠️ {userStatus.warnings}/3 Warnings
                </div>
              )}
              <span className="text-sm text-gray-700">
                {user?.username} | {problem.points} points
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Problem Description */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Problem</h2>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {problem.type.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-gray-700">
                    {problem.description}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Constraints</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Time Limit: {problem.timeLimit}ms</div>
                    <div>Memory Limit: {problem.memoryLimit}MB</div>
                    <div>Language: {problem.language}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor and Results */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'code'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Code Editor
                    </button>
                    <button
                      onClick={() => setActiveTab('test')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'test'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Test Results
                    </button>
                  </nav>
                </div>

                {/* Code Editor */}
                {activeTab === 'code' && (
                  <div className="p-6">
                    <div className="h-[600px] mb-4 border border-gray-300 rounded-md overflow-hidden">
                      <MonacoEditor
                        height="100%"
                        language={problem.language}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>

                    <div className="flex justify-between">
                      <div className="flex space-x-3">
                        <button
                          onClick={runTest}
                          disabled={submitting || !code.trim()}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                        >
                          {submitting ? 'Running...' : 'Run Test'}
                        </button>
                        {userStatus?.hasPassed ? (
                          <div className="flex items-center space-x-2">
                            <button
                              disabled
                              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium opacity-75 cursor-not-allowed"
                            >
                              ✅ Problem Solved
                            </button>
                            <span className="text-sm text-green-600">
                              You&apos;ve already passed this problem!
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={handleSubmit}
                            disabled={submitting || !code.trim()}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {submitting ? 'Submitting...' : 'Submit Solution'}
                          </button>
                        )}
                      </div>
                      {userStatus && (
                        <div className="text-sm text-gray-500">
                          Submissions: {userStatus.totalSubmissions}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Test Results */}
                {activeTab === 'test' && (
                  <div className="p-6">
                    {result ? (
                      <div className="space-y-4">
                        {result.error ? (
                          <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="text-red-800 font-medium">Error</div>
                            <div className="text-red-700 text-sm mt-1">{result.error}</div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-green-50 border border-green-200 rounded-md p-4">
                              <div className="text-green-800 font-medium">Submission Result</div>
                              <div className="text-green-700 text-sm mt-1">
                                Status: {result.status}
                              </div>
                              {result.executionTime && (
                                <div className="text-green-700 text-sm">
                                  Execution Time: {result.executionTime}ms
                                </div>
                              )}
                              {result.memoryUsage && (
                                <div className="text-green-700 text-sm">
                                  Memory Usage: {result.memoryUsage}KB
                                </div>
                              )}
                              {result.score && (
                                <div className="text-green-700 text-sm">
                                  Score: {result.score} points
                                </div>
                              )}
                            </div>

                            {result.testResults && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Test Case Results</h4>
                                {result.testResults.map((test, index: number) => (
                                  <div
                                    key={index}
                                    className={`border rounded-md p-3 ${
                                      test.passed
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-red-200 bg-red-50'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">
                                        Test Case {index + 1}
                                      </span>
                                      <span
                                        className={`text-xs font-medium px-2 py-1 rounded ${
                                          test.passed
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                      >
                                        {test.passed ? 'PASSED' : 'FAILED'}
                                      </span>
                                    </div>
                                    {!test.passed && (
                                      <div className="mt-2 text-sm text-gray-600">
                                        <div>Expected: {test.expectedOutput}</div>
                                        <div>Got: {test.actualOutput}</div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 text-4xl mb-4">🧪</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No test results yet
                        </h3>
                        <p className="text-gray-500">
                          Run your code to see test results here.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">All Tests Passed!</h3>
            <p className="text-gray-600 mb-4">Great job! Your solution is working correctly.</p>
            <div className="text-4xl font-bold text-indigo-600 animate-pulse mb-6">
              +{problem?.points || 100} Points
            </div>
            {nextProblem && (
              <button
                onClick={() => router.push(`/problem/${nextProblem.id}`)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                🚀 Solve Next Problem
              </button>
            )}
            {!nextProblem && (
              <p className="text-gray-500 text-sm">
                🏆 Congratulations! You&apos;ve solved all available problems!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
