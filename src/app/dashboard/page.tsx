'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
// import { prisma } from '@/lib/db' // Not used in client component

interface Problem {
  id: string
  title: string
  description: string
  type: string
  points: number
  isActive: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [problemsLoading, setProblemsLoading] = useState(true)
  const [activeRound, setActiveRound] = useState<{
    id: string
    title: string
    description: string
    duration: number
    endTime?: string
    problems: Array<{ id: string; title: string }>
  } | null>(null)
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set())
  const [userWarnings, setUserWarnings] = useState(0)
  const [isDisqualified, setIsDisqualified] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchProblems()
      fetchActiveRound()
      fetchSolvedProblems()
      fetchUserWarnings()
    }
  }, [user])

  // Refresh data when user returns to dashboard (e.g., after solving a problem)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchProblems()
        fetchActiveRound()
        fetchSolvedProblems()
        fetchUserWarnings()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user])

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/problems')
      if (response.ok) {
        const data = await response.json()
        setProblems(data.problems)
      } else if (response.status === 403) {
        setIsDisqualified(true)
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    } finally {
      setProblemsLoading(false)
    }
  }

  const fetchActiveRound = async () => {
    try {
      const response = await fetch('/api/rounds/active')
      if (response.ok) {
        const data = await response.json()
        setActiveRound(data.round)
      }
    } catch (error) {
      console.error('Failed to fetch active round:', error)
    }
  }

  const fetchSolvedProblems = async () => {
    try {
      const response = await fetch('/api/submissions/my-solved')
      if (response.ok) {
        const data = await response.json()
        setSolvedProblems(new Set(data.solvedProblemIds))
      }
    } catch (error) {
      console.error('Failed to fetch solved problems:', error)
    }
  }

  const fetchUserWarnings = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserWarnings(data.user?.warnings || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user warnings:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading || problemsLoading) {
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
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Return to Home
          </button>
        </div>
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
              <h1 className="text-xl font-semibold text-gray-900">
                IdeaRpit Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/leaderboard"
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                🏆 Leaderboard
              </Link>
              <span className="text-sm text-gray-700">
                Welcome, {user.username} ({user.role})
              </span>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Warning Banner */}
          {userWarnings > 0 && (
            <div className={`rounded-lg p-4 mb-8 ${
              userWarnings >= 3 
                ? 'bg-red-100 border-2 border-red-200' 
                : userWarnings >= 2 
                ? 'bg-yellow-100 border-2 border-yellow-200'
                : 'bg-orange-100 border-2 border-orange-200'
            }`}>
              <div className="flex items-center">
                <div className="text-2xl mr-3">
                  {userWarnings >= 3 ? '🚫' : userWarnings >= 2 ? '⚠️' : '⚠️'}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    userWarnings >= 3 ? 'text-red-800' : userWarnings >= 2 ? 'text-yellow-800' : 'text-orange-800'
                  }`}>
                    {userWarnings >= 3 
                      ? 'You have been disqualified!' 
                      : `Warning ${userWarnings}/3`
                    }
                  </h3>
                  <p className={`text-sm ${
                    userWarnings >= 3 ? 'text-red-600' : userWarnings >= 2 ? 'text-yellow-600' : 'text-orange-600'
                  }`}>
                    {userWarnings >= 3 
                      ? 'You have received 3 warnings and are disqualified from the competition.'
                      : userWarnings >= 2
                      ? 'You have 2 warnings. One more warning will result in disqualification.'
                      : 'You have received a warning. Please follow the rules to avoid further warnings.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Round Banner */}
          {activeRound && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">🏆 Active Competition Round</h2>
                  <h3 className="text-xl font-semibold mb-1">{activeRound.title}</h3>
                  <p className="text-green-100">{activeRound.description}</p>
                  <div className="mt-2 text-sm">
                    <span>Duration: {activeRound.duration} minutes</span>
                    <span className="ml-4">Problems: {activeRound.problems.length}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {activeRound.endTime && new Date(activeRound.endTime) > new Date() 
                      ? `${Math.ceil((new Date(activeRound.endTime).getTime() - new Date().getTime()) / (1000 * 60))} min left`
                      : 'Round Ended'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {activeRound ? 'Round Problems' : 'Available Problems'}
            </h2>
            <p className="text-gray-600">
              {activeRound 
                ? 'Solve these problems within the time limit to earn points.'
                : 'Choose a problem to start solving. Each problem has different requirements and scoring criteria.'
              }
            </p>
          </div>

          {problems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No problems available
              </h3>
              <p className="text-gray-500">
                {user.role === 'ADMIN' 
                  ? 'Create your first problem in the admin panel.'
                  : 'Check back later for new problems to solve.'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${
                    solvedProblems.has(problem.id) 
                      ? 'bg-green-50 border-2 border-green-200' 
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {problem.title}
                      </h3>
                      {solvedProblems.has(problem.id) && (
                        <span className="text-green-600 text-lg">✅</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {solvedProblems.has(problem.id) && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          SOLVED
                        </span>
                      )}
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {problem.points} pts
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {problem.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Type: {problem.type.replace('_', ' ')}
                    </span>
                    <Link
                      href={`/problem/${problem.id}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Start Solving
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
