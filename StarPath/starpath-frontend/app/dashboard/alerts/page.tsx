'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { API_URL } from '@/lib/api-config';

interface Alert {
  id: string;
  facility_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  created_at: string;
  resolved: boolean;
}

export default function AlertsPage() {
  const { user, token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  useEffect(() => {
    fetchAlerts();
  }, [token]);

  const fetchAlerts = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.notifications || []);
      } else if (response.status === 404) {
        setAlerts([]);
      } else {
        setError('Failed to load alerts');
      }
    } catch (err) {
      setError('Failed to load alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'resolved') return alert.resolved;
    if (filter === 'unresolved') return !alert.resolved;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      default:
        return '🔵';
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to access alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Alerts</h1>
        <p className="text-lg text-gray-600 mt-3">Monitor important notifications and facility alerts</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setFilter('unresolved')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'unresolved'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Unresolved ({alerts.filter(a => !a.resolved).length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'resolved'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Resolved ({alerts.filter(a => a.resolved).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All ({alerts.length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {filter === 'unresolved' ? 'No unresolved alerts. Great job!' : 'No alerts to display.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-6 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{getSeverityIcon(alert.severity)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{alert.title}</h3>
                  <p className="text-sm mt-1 opacity-90">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs opacity-75">
                    <span>Facility: {alert.facility_id}</span>
                    <span>Type: {alert.type}</span>
                    <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {alert.resolved && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
