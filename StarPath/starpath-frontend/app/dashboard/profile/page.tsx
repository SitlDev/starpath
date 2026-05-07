'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { getToken, getCurrentUser, type User as UserType } from '@/lib/auth'
import { API_URL } from '@/lib/api-config'

interface ActivityLog {
  id: string
  action: string
  timestamp: string
  details?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile')

  // Profile form states
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  // Password form states
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Activity log
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken()
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        const userData = await getCurrentUser(token)
        setUser(userData)
        setFormData({
          full_name: userData.full_name || '',
          email: userData.email || '',
        })

        // Mock activity log (in production, this would come from an API)
        setActivityLog([
          {
            id: '1',
            action: 'Logged in',
            timestamp: new Date().toISOString(),
            details: 'From dashboard',
          },
          {
            id: '2',
            action: 'Viewed facility',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            details: 'Golden Years Care Home',
          },
          {
            id: '3',
            action: 'Generated report',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            details: 'Monthly summary',
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSave = async () => {
    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch(`${API_URL}/api/v1/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
        }),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      setUser(await response.json())
      setEditMode(false)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    setPasswordError('')
  }

  const handlePasswordSubmit = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordData.current_password || !passwordData.new_password) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    try {
      const token = getToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch(`${API_URL}/api/v1/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      })

      if (!response.ok) throw new Error('Failed to change password')

      setPasswordSuccess('Password changed successfully!')
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      setShowPasswordForm(false)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-900">
        <Sidebar user={user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-slate-300">Loading profile...</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-slate-900">
        <Sidebar user={user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">Failed to load profile</p>
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
              ← Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{user.full_name || 'User'}</h1>
              <p className="text-slate-400">{user.email}</p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm">
              {passwordSuccess}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-4 border-b border-slate-700">
              {(['profile', 'security', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'text-blue-400 border-blue-400'
                      : 'text-slate-400 border-transparent hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Info Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Personal Information</h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                  >
                    {editMode ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {!editMode ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Full Name</p>
                      <p className="text-white font-medium">{user.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Email Address</p>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Account Status</p>
                      <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded">
                        Active
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleProfileSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Member Since</span>
                    <span className="text-slate-200">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Updated</span>
                    <span className="text-slate-200">
                      {user.updated_at
                        ? new Date(user.updated_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Section */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">Password Management</h2>

                {!showPasswordForm ? (
                  <div>
                    <p className="text-slate-400 mb-4">
                      Protect your account with a strong password
                    </p>
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {passwordError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 text-sm">
                        {passwordError}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Current Password</label>
                      <input
                        type="password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">New Password</label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password (min 6 characters)"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handlePasswordSubmit}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        Update Password
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordData({
                            current_password: '',
                            new_password: '',
                            confirm_password: '',
                          })
                          setPasswordError('')
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Tips */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">Security Tips</h3>
                <ul className="space-y-2 text-sm text-blue-200">
                  <li>• Use a password with at least 8 characters</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Add numbers and special characters (@, #, $)</li>
                  <li>• Avoid using personal information</li>
                  <li>• Change your password regularly</li>
                </ul>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-6">Activity Log</h2>

                {activityLog.length === 0 ? (
                  <p className="text-slate-400">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {activityLog.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600 rounded-lg hover:border-slate-500 transition"
                      >
                        <div>
                          <p className="text-slate-200 font-medium">{log.action}</p>
                          {log.details && (
                            <p className="text-xs text-slate-400 mt-1">{log.details}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
