'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setSuccess(true)
        setEmail('')
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to send reset email. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again later.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-slate-400 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {success ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">Check your email</h3>
                  <p className="text-emerald-200/80 text-sm">
                    If an account exists with {email}, we've sent a password reset link. 
                    The link expires in 1 hour.
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
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition duration-200"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : null}

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-slate-400 text-sm">
              Remember your password?{' '}
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
