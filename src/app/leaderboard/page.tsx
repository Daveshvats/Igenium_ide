'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LeaderboardEntry {
  id: string
  username: string
  totalScore: number
  problemsSolved: number
  lastSubmission: string | null
  submissions: Array<{
    score: number
    submittedAt: string
    problem: {
      title: string
      points: number
    }
  }>
}

export default function LeaderboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchLeaderboard()
      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(fetchLeaderboard, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return '🥇'
      case 1:
        return '🥈'
      case 2:
        return '🥉'
      default:
        return `#${index + 1}`
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-50 border-yellow-200'
      case 1:
        return 'bg-gray-50 border-gray-200'
      case 2:
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
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
                🏆 Leaderboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.username}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Real-time Rankings
            </h2>
            <p className="text-gray-600">
              See how you stack up against other participants. Rankings update automatically.
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-500">
                Start solving problems to appear on the leaderboard!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-6 ${getRankColor(index)} ${
                    entry.id === user.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entry.username}
                          {entry.id === user.id && (
                            <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {entry.problemsSolved} problem{entry.problemsSolved !== 1 ? 's' : ''} solved
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {entry.totalScore} pts
                      </div>
                      {entry.lastSubmission && (
                        <div className="text-sm text-gray-500">
                          Last: {new Date(entry.lastSubmission).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show solved problems */}
                  {entry.submissions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Solved Problems:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {entry.submissions.map((submission, subIndex) => (
                          <span
                            key={subIndex}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                          >
                            {submission.problem.title} (+{submission.score})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
