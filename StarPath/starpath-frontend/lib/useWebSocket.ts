import { useEffect, useRef, useState, useCallback } from 'react'
import { getToken } from './auth'

interface Notification {
  type: string
  title: string
  message: string
  data?: any
  facility_id?: string
  timestamp?: string
}

interface UseWebSocketOptions {
  onNotification?: (notification: Notification) => void
  autoConnect?: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onNotification, autoConnect = true } = options
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  const connect = useCallback(() => {
    try {
      const token = getToken()
      const userId = getUserIdFromToken(token)

      if (!userId) {
        setError('User not authenticated')
        return
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const backendHost = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).host : 'localhost:8001'
      const wsUrl = `${protocol}//${backendHost}/api/v1/ws/${userId}`

      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          onNotification?.(notification)
        } catch (e) {
          console.error('Failed to parse notification:', e)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection error')
        setConnected(false)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current += 1
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (attempt ${reconnectAttemptsRef.current})...`)
            connect()
          }, delay)
        }
      }

      wsRef.current = ws
    } catch (e) {
      console.error('Failed to connect WebSocket:', e)
      setError('Failed to connect to notification service')
    }
  }, [onNotification])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    setConnected(false)
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    connected,
    error,
    connect,
    disconnect,
  }
}

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null
  try {
    // Decode JWT token (assuming standard JWT format)
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const decoded = JSON.parse(atob(parts[1]))
    // Extract user ID from token (user_id field added in JWT)
    return decoded.user_id || decoded.sub
  } catch {
    return null
  }
}
