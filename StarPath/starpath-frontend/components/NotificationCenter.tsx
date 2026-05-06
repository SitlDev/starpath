'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, TrendingUp, FileText } from 'lucide-react'
import { useWebSocket } from '@/lib/useWebSocket'
import { getToken } from '@/lib/auth'

interface Notification {
  id?: string
  type: string
  title: string
  message: string
  data?: any
  facility_id?: string
  timestamp?: string
  is_read?: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [loading, setLoading] = useState(false)

  // WebSocket for real-time notifications
  useWebSocket({
    onNotification: (notification) => {
      setNotifications((prev) => [
        {
          ...notification,
          id: Math.random().toString(),
          is_read: false,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ])
      setUnreadCount((prev) => prev + 1)

      // Show toast notification
      showNotificationToast(notification)
    },
  })

  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications?limit=20`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)

        // Get unread count
        const unreadResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        })
        const unreadData = await unreadResp.json()
        setUnreadCount(unreadData.unread_count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ is_read: true }),
      })

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_inspection':
        return <AlertCircle size={18} className="text-blue-400" />
      case 'rating_change':
        return <TrendingUp size={18} className="text-green-400" />
      case 'low_rating_alert':
        return <AlertCircle size={18} className="text-red-400" />
      case 'report_ready':
        return <FileText size={18} className="text-indigo-400" />
      default:
        return <Bell size={18} className="text-slate-400" />
    }
  }

  const showNotificationToast = (notification: Notification) => {
    // You can integrate this with a toast library like react-hot-toast
    console.log('🔔 New notification:', notification.title)
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'now'
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-slate-400 hover:text-slate-200 transition"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-750">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Bell size={18} />
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded hover:bg-slate-700"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-slate-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 transition cursor-pointer ${
                    !notification.is_read ? 'bg-slate-700/20' : ''
                  }`}
                  onClick={() => !notification.is_read && notification.id && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{notification.title}</p>
                      <p className="text-sm text-slate-300 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-2">{formatTime(notification.timestamp)}</p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        notification.id && deleteNotification(notification.id)
                      }}
                      className="text-slate-400 hover:text-red-400 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-700 bg-slate-750 text-center">
              <a href="/dashboard/notifications" className="text-sm text-indigo-400 hover:text-indigo-300">
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
