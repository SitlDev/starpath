'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenError, setTokenError] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenError(true)
      setError('No reset token provided. Please use the link from your email.')
    }
  }, [token])

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/reset-password?token=${encodeURIComponent(token || '')}&new_password=${encodeURIComponent(password)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        setSuccess(true)
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to reset password. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again later.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-300 mb-1">Invalid Reset Link</h3>
                  <p className="text-red-200/80 text-sm">{error}</p>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-center text-slate-400 text-sm">
                <Link href="/auth/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Request a new reset link
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400 mb-6">
            Enter your new password below.
          </p>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">Password Reset Successful</h3>
                  <p className="text-emerald-200/80 text-sm">
                    Your password has been reset. Redirecting to login...
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          ) : null}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition duration-200"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : null}

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-slate-400 text-sm">
              <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
