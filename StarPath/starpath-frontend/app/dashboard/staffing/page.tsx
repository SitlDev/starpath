'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { API_URL } from '@/lib/api-config';

interface StaffingData {
  facility_id: string;
  rn_staffing: number;
  ln_staffing: number;
  aide_staffing: number;
  staffing_score: number;
  reporting_period: string;
}

export default function StaffingPage() {
  const { user, token } = useAuth();
  const [staffing, setStaffing] = useState<StaffingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaffingData();
  }, [token]);

  const fetchStaffingData = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/staffing`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaffing(data.staffing || []);
      } else if (response.status === 404) {
        setStaffing([]);
      } else {
        setError('Failed to load staffing data');
      }
    } catch (err) {
      setError('Failed to load staffing data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to access staffing information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Staffing</h1>
        <p className="text-lg text-gray-600 mt-3">Monitor and analyze staffing levels and nursing ratios across facilities</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Staffing Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">RN Staffing</div>
          <div className="text-4xl font-bold text-blue-600 mt-3">—</div>
          <p className="text-xs text-gray-500 mt-2">Registered Nurses per resident day</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">LN Staffing</div>
          <div className="text-4xl font-bold text-green-600 mt-3">—</div>
          <p className="text-xs text-gray-500 mt-2">Licensed Nurses per resident day</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Aide Staffing</div>
          <div className="text-4xl font-bold text-purple-600 mt-3">—</div>
          <p className="text-xs text-gray-500 mt-2">Nursing aides per resident day</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Staffing Score</div>
          <div className="text-4xl font-bold text-orange-600 mt-3">—</div>
          <p className="text-xs text-gray-500 mt-2">Overall staffing rating</p>
        </div>
      </div>

      {/* Staffing Details */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Staffing Levels by Facility</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading staffing data...</p>
          </div>
        ) : staffing.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No staffing data available yet. Data will appear here as it is reported to CMS.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Facility</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">RN Staffing</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">LN Staffing</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Aide Staffing</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Score</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Period</th>
                </tr>
              </thead>
              <tbody>
                {staffing.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700 font-medium">{item.facility_id}</td>
                    <td className="px-6 py-4 text-gray-700">{item.rn_staffing.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-700">{item.ln_staffing.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-700">{item.aide_staffing.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                        {item.staffing_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">{item.reporting_period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
