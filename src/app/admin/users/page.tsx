'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface User {
  id: string
  username: string
  email: string
  warnings: number
  isDisqualified: boolean
  disqualifiedAt: string | null
  createdAt: string
  _count: {
    submissions: number
  }
}

export default function UsersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [warningReason, setWarningReason] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers()
    }
  }, [user, fetchUsers])

  // Redirect if not admin
  if (user && user.role !== 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  const addWarning = async (userId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/warnings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchUsers()
      } else {
        const errorData = await response.json()
        alert(errorData.error)
      }
    } catch (error) {
      console.error('Failed to add warning:', error)
      alert('Failed to add warning')
    }
  }

  const toggleDisqualification = async (userId: string, action: 'disqualify' | 'undisqualify') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/disqualify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchUsers()
      } else {
        const errorData = await response.json()
        alert(errorData.error)
      }
    } catch (error) {
      console.error('Failed to update disqualification:', error)
      alert('Failed to update disqualification status')
    }
  }

  const handleAddWarning = () => {
    if (!selectedUser || !warningReason.trim()) return
    
    addWarning(selectedUser.id, warningReason)
    setShowWarningModal(false)
    setSelectedUser(null)
    setWarningReason('')
  }

  const getWarningColor = (warnings: number) => {
    if (warnings >= 3) return 'bg-red-100 text-red-800'
    if (warnings >= 2) return 'bg-yellow-100 text-yellow-800'
    if (warnings >= 1) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
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
                User Management
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              User Management & Disqualification
            </h2>
            <p className="text-gray-600">
              Manage user warnings and disqualifications. Users are automatically disqualified after 3 warnings.
            </p>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500">
                No users have registered yet.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {user.username}
                              </p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getWarningColor(user.warnings)}`}>
                                {user.warnings}/3 Warnings
                              </span>
                              {user.isDisqualified && (
                                <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                                  DISQUALIFIED
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="mr-4">Submissions: {user._count.submissions}</span>
                              <span className="mr-4">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                              {user.disqualifiedAt && (
                                <span className="text-red-600">
                                  Disqualified: {new Date(user.disqualifiedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!user.isDisqualified && user.warnings < 3 && (
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowWarningModal(true)
                              }}
                              className="bg-yellow-600 text-white px-3 py-1 text-xs font-medium rounded-md hover:bg-yellow-700"
                            >
                              Add Warning
                            </button>
                          )}
                          {!user.isDisqualified ? (
                            <button
                              onClick={() => toggleDisqualification(user.id, 'disqualify')}
                              className="bg-red-600 text-white px-3 py-1 text-xs font-medium rounded-md hover:bg-red-700"
                            >
                              Disqualify
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleDisqualification(user.id, 'undisqualify')}
                              className="bg-green-600 text-white px-3 py-1 text-xs font-medium rounded-md hover:bg-green-700"
                            >
                              Un-disqualify
                            </button>
                          )}
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

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Warning to {selectedUser?.username}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Warning
              </label>
              <textarea
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                rows={3}
                placeholder="Enter reason for warning..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWarningModal(false)
                  setSelectedUser(null)
                  setWarningReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWarning}
                disabled={!warningReason.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                Add Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
