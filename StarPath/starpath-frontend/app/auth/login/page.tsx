'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login, setToken, AuthError } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Show success message if redirected from registration
    if (searchParams.get('registered') === 'true') {
      setSuccess('Account created successfully! Please sign in.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const data = await login(email, password)
      setToken(data.access_token)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">StarPath SNF</h1>
          <p className="text-slate-300">CMS Five-Star Rating Optimizer</p>
        </div>

        {success && (
          <div className="p-3 bg-green-900 border border-green-700 rounded-lg text-green-100 text-sm mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
            <div className="text-right mt-2">
              <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-100 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition duration-200"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

