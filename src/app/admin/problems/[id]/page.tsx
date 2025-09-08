'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

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
  isActive: boolean
}

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
}

interface Submission {
  id: string
  code: string
  status: string
  score?: number
  executionTime?: number
  memoryUsage?: number
  submittedAt: string
  user: {
    username: string
    email: string
  }
}

export default function EditProblemPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'submissions'>('edit')
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchProblem = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/problems/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProblem(data.problem)
      } else {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Failed to fetch problem:', error)
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  const fetchTestCases = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/problems/${params.id}/test-cases`)
      if (response.ok) {
        const data = await response.json()
        setTestCases(data.testCases)
      }
    } catch (error) {
      console.error('Failed to fetch test cases:', error)
    }
  }, [params.id])

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/problems/${params.id}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    }
  }, [params.id])

  useEffect(() => {
    if (user?.role === 'ADMIN' && params.id) {
      fetchProblem()
    }
  }, [user?.role, params.id, fetchProblem])

  useEffect(() => {
    if (problem) {
      fetchTestCases()
      fetchSubmissions()
    }
  }, [problem, fetchTestCases, fetchSubmissions])

  const handleSave = async () => {
    if (!problem) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/problems/${problem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problem),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save problem')
    } finally {
      setSaving(false)
    }
  }

  const addTestCase = async () => {
    try {
      const response = await fetch(`/api/admin/problems/${params.id}/test-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: '',
          expectedOutput: '',
          isHidden: false,
        }),
      })

      if (response.ok) {
        fetchTestCases()
      }
    } catch (error) {
      console.error('Failed to add test case:', error)
    }
  }

  const updateTestCase = useCallback(async (testCaseId: string, field: string, value: string | boolean) => {
    // Update local state first for immediate UI feedback
    setTestCases(prev => prev.map(tc => 
      tc.id === testCaseId ? { ...tc, [field]: value } : tc
    ))

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout for API call
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/test-cases/${testCaseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        })

        if (!response.ok) {
          // Revert local state if API call failed
          fetchTestCases()
        }
      } catch (error) {
        console.error('Failed to update test case:', error)
        // Revert local state if API call failed
        fetchTestCases()
      }
    }, 1000) // 1 second debounce
  }, [fetchTestCases])

  const deleteTestCase = async (testCaseId: string) => {
    try {
      const response = await fetch(`/api/admin/test-cases/${testCaseId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTestCases()
      }
    } catch (error) {
      console.error('Failed to delete test case:', error)
    }
  }

  // Redirect if not admin
  if (user && user.role !== 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Problem not found</h2>
          <Link
            href="/admin"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Admin Panel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-500 mr-4">
                ← Back to Admin Panel
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Edit Problem: {problem.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.username} (Admin)
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'edit'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Edit Problem
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'submissions'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  User Submissions ({submissions.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'edit' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        value={problem.title}
                        onChange={(e) => setProblem({ ...problem, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <select
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        value={problem.language}
                        onChange={(e) => setProblem({ ...problem, language: e.target.value })}
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      rows={6}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      value={problem.description}
                      onChange={(e) => setProblem({ ...problem, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skeleton Code</label>
                    <textarea
                      rows={10}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900"
                      value={problem.skeletonCode}
                      onChange={(e) => setProblem({ ...problem, skeletonCode: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        value={problem.type}
                        onChange={(e) => setProblem({ ...problem, type: e.target.value })}
                      >
                        <option value="GENERAL">General</option>
                        <option value="TIME_OPTIMIZATION">Time Optimization</option>
                        <option value="SPACE_OPTIMIZATION">Space Optimization</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time Limit (ms)</label>
                      <input
                        type="number"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        value={problem.timeLimit}
                        onChange={(e) => setProblem({ ...problem, timeLimit: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Memory Limit (MB)</label>
                      <input
                        type="number"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        value={problem.memoryLimit}
                        onChange={(e) => setProblem({ ...problem, memoryLimit: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Points</label>
                      <input
                        type="number"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        value={problem.points}
                        onChange={(e) => setProblem({ ...problem, points: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Test Cases */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Test Cases</h3>
                      <button
                        onClick={addTestCase}
                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Add Test Case
                      </button>
                    </div>

                    <div className="space-y-4">
                      {testCases.map((testCase) => (
                        <div key={testCase.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Test Case {testCases.indexOf(testCase) + 1}</h4>
                            <button
                              onClick={() => deleteTestCase(testCase.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Input</label>
                              <textarea
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900"
                                value={testCase.input}
                                onChange={(e) => updateTestCase(testCase.id, 'input', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Expected Output</label>
                              <textarea
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900"
                                value={testCase.expectedOutput}
                                onChange={(e) => updateTestCase(testCase.id, 'expectedOutput', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                checked={testCase.isHidden}
                                onChange={(e) => updateTestCase(testCase.id, 'isHidden', e.target.checked)}
                              />
                              <span className="ml-2 text-sm text-gray-700">Hidden test case</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Link
                      href="/admin"
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Link>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      User Submissions for &quot;{problem?.title}&quot;
                    </h3>
                    
                    {submissions.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-4">📝</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          No submissions yet
                        </h4>
                        <p className="text-gray-500">
                          Users haven&apos;t submitted solutions for this problem yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {submissions.map((submission) => (
                          <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {submission.user.username}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {submission.user.email}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  submission.status === 'ACCEPTED' 
                                    ? 'bg-green-100 text-green-800'
                                    : submission.status === 'WRONG_ANSWER'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submission.status.replace('_', ' ')}
                                </span>
                                {submission.score && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    Score: {submission.score}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Submitted:</span> {new Date(submission.submittedAt).toLocaleString()}
                              </div>
                              {submission.executionTime && (
                                <div>
                                  <span className="font-medium">Time:</span> {submission.executionTime}ms
                                </div>
                              )}
                              {submission.memoryUsage && (
                                <div>
                                  <span className="font-medium">Memory:</span> {submission.memoryUsage}KB
                                </div>
                              )}
                            </div>

                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Code:</h5>
                              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                                <code>{submission.code}</code>
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}