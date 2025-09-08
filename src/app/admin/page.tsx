'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Problem {
  id: string
  title: string
  description: string
  type: string
  points: number
  isActive: boolean
  createdAt: string
  _count: {
    testCases: number
    submissions: number
  }
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const fetchProblems = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/problems')
      if (response.ok) {
        const data = await response.json()
        setProblems(data.problems)
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchProblems()
    }
  }, [user, fetchProblems])

  // Redirect if not admin
  if (user && user.role !== 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  const toggleProblemStatus = async (problemId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/problems/${problemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        setProblems(problems.map(p => 
          p.id === problemId ? { ...p, isActive: !currentStatus } : p
        ))
      }
    } catch (error) {
      console.error('Failed to toggle problem status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/rounds"
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Manage Rounds
              </Link>
              <Link
                href="/admin/users"
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Manage Users
              </Link>
              <span className="text-sm text-gray-700">
                {user?.username} (Admin)
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Problem Management
              </h2>
              <p className="text-gray-600">
                Create and manage coding problems for the platform.
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Create New Problem
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Create New Problem</h3>
              <CreateProblemForm 
                onSuccess={() => {
                  setShowCreateForm(false)
                  fetchProblems()
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}

          {problems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No problems created yet
              </h3>
              <p className="text-gray-500">
                Create your first problem to get started.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {problems.map((problem) => (
                  <li key={problem.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {problem.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                problem.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {problem.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <p className="truncate">{problem.description}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="mr-4">Type: {problem.type.replace('_', ' ')}</span>
                            <span className="mr-4">Points: {problem.points}</span>
                            <span className="mr-4">Test Cases: {problem._count.testCases}</span>
                            <span>Submissions: {problem._count.submissions}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleProblemStatus(problem.id, problem.isActive)}
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              problem.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {problem.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <Link
                            href={`/admin/problems/${problem.id}`}
                            className="bg-indigo-600 text-white px-3 py-1 text-xs font-medium rounded-md hover:bg-indigo-700"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreateProblemForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skeletonCode: '',
    language: 'javascript',
    type: 'GENERAL',
    timeLimit: 2000,
    memoryLimit: 128,
    points: 100,
  })
  const [testCases, setTestCases] = useState<Array<{ input: string; expectedOutput: string; isHidden: boolean }>>([
    { input: '', expectedOutput: '', isHidden: false }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }])
  }

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index))
    }
  }

  const updateTestCase = (index: number, field: string, value: string | boolean) => {
    const updated = [...testCases]
    updated[index] = { ...updated[index], [field]: value }
    setTestCases(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate test cases
    const validTestCases = testCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim())
    if (validTestCases.length === 0) {
      setError('At least one test case with input and expected output is required')
      setLoading(false)
      return
    }

    try {
      // Create problem first
      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      const { problem } = await response.json()

      // Add test cases
      for (const testCase of validTestCases) {
        await fetch(`/api/admin/problems/${problem.id}/test-cases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCase),
        })
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create problem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
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
          required
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Skeleton Code</label>
        <textarea
          required
          rows={8}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900"
          value={formData.skeletonCode}
          onChange={(e) => setFormData({ ...formData, skeletonCode: e.target.value })}
          placeholder="// Write your solution here"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.timeLimit}
            onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Memory Limit (MB)</label>
          <input
            type="number"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.memoryLimit}
            onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Points</label>
          <input
            type="number"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
          />
        </div>
      </div>

      {/* Test Cases Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Test Cases</h4>
          <button
            type="button"
            onClick={addTestCase}
            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700"
          >
            Add Test Case
          </button>
        </div>
        
        <div className="space-y-4">
          {testCases.map((testCase, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">Test Case {index + 1}</h5>
                {testCases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTestCase(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Input</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900"
                    placeholder="Enter test input..."
                    value={testCase.input}
                    onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Output</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm text-gray-900"
                    placeholder="Enter expected output..."
                    value={testCase.expectedOutput}
                    onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    checked={testCase.isHidden}
                    onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Hidden test case (not visible to users during testing)</span>
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
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Problem'}
        </button>
      </div>
    </form>
  )
}
