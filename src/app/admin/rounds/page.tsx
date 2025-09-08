'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface Round {
  id: string
  title: string
  description: string | null
  status: string
  startTime: Date | null
  endTime: Date | null
  duration: number
  createdAt: string
  problems: Array<{
    problem: {
      id: string
      title: string
    }
  }>
  _count: {
    problems: number
  }
}

export default function RoundsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const fetchRounds = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/rounds')
      if (response.ok) {
        const data = await response.json()
        setRounds(data.rounds)
      }
    } catch (error) {
      console.error('Failed to fetch rounds:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchRounds()
    }
  }, [user, fetchRounds])

  // Redirect if not admin
  if (user && user.role !== 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  const updateRoundStatus = async (roundId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchRounds()
      }
    } catch (error) {
      console.error('Failed to update round status:', error)
    }
  }

  const deleteRound = async (roundId: string) => {
    if (!confirm('Are you sure you want to delete this round?')) return

    try {
      const response = await fetch(`/api/admin/rounds/${roundId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchRounds()
      }
    } catch (error) {
      console.error('Failed to delete round:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
              <Link href="/admin" className="text-indigo-600 hover:text-indigo-500 mr-4">
                ← Back to Admin Panel
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Round Management
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Competition Rounds
              </h2>
              <p className="text-gray-600">
                Create and manage competition rounds with multiple problems.
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Create New Round
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Create New Round</h3>
              <CreateRoundForm 
                onSuccess={() => {
                  setShowCreateForm(false)
                  fetchRounds()
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}

          {rounds.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏆</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No rounds created yet
              </h3>
              <p className="text-gray-500">
                Create your first competition round to get started.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {rounds.map((round) => (
                  <li key={round.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {round.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(round.status)}`}>
                                {round.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <p className="truncate">{round.description || 'No description'}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="mr-4">Duration: {round.duration} minutes</span>
                            <span className="mr-4">Problems: {round._count.problems}</span>
                            {round.startTime && (
                              <span className="mr-4">Started: {new Date(round.startTime).toLocaleString()}</span>
                            )}
                            {round.endTime && (
                              <span>Ends: {new Date(round.endTime).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {round.status === 'DRAFT' && (
                            <button
                              onClick={() => updateRoundStatus(round.id, 'PENDING_APPROVAL')}
                              className="bg-yellow-600 text-white px-3 py-1 text-xs font-medium rounded-md hover:bg-yellow-700"
                            >
                              Submit for Approval
                            </button>
                          )}
                          {round.status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() => updateRoundStatus(round.id, 'ACTIVE')}
                              className="bg-green-600 text-white px-3 py-1 text-xs font-medium rounded-md hover:bg-green-700"
                            >
                              Start Round
                            </button>
                          )}
                          {round.status === 'ACTIVE' && (
                            <button
                              onClick={() => updateRoundStatus(round.id, 'COMPLETED')}
                              className="bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-md hover:bg-blue-700"
                            >
                              End Round
                            </button>
                          )}
                          <button
                            onClick={() => deleteRound(round.id)}
                            className="bg-red-600 text-white px-3 py-1 text-xs font-medium rounded-md hover:bg-red-700"
                          >
                            Delete
                          </button>
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

function CreateRoundForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
  })
  const [problems, setProblems] = useState<Array<{ id: string; title: string; points: number }>>([])
  const [selectedProblems, setSelectedProblems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/problems')
      if (response.ok) {
        const data = await response.json()
        setProblems(data.problems)
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (selectedProblems.length === 0) {
      setError('Please select at least one problem')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          problemIds: selectedProblems,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create round')
    } finally {
      setLoading(false)
    }
  }

  const toggleProblem = (problemId: string) => {
    setSelectedProblems(prev => 
      prev.includes(problemId) 
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    )
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
          <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            required
            min="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Problems</label>
        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
          {problems.map((problem) => (
            <label key={problem.id} className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                checked={selectedProblems.includes(problem.id)}
                onChange={() => toggleProblem(problem.id)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="text-sm text-gray-900">{problem.title} ({problem.points} pts)</span>
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Selected: {selectedProblems.length} problem(s)
        </p>
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
          {loading ? 'Creating...' : 'Create Round'}
        </button>
      </div>
    </form>
  )
}
