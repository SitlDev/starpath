'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { API_URL } from '@/lib/api-config';
import { mockStaffing } from '@/lib/mock-data';
import Sidebar from '@/components/Sidebar';
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
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');

  const renderStars = (score: number, maxScore: number = 5) => {
    const percentage = (score / maxScore) * 5;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(percentage)) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i - percentage < 1 && i - percentage > 0) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-slate-600">★</span>);
      }
    }
    return stars;
  };

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
        // Use mock data for demo
        setStaffing(mockStaffing);
      } else {
        setError('Failed to load staffing data');
      }
    } catch (err) {
      // Use mock data for demo
      setStaffing(mockStaffing);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // CMS National Benchmarks (hours per resident day)
  const benchmarks = {
    rn: 0.75,
    ln: 0.45,
    aide: 1.3,
  };

  const getStatusColor = (value: number, benchmark: number) => {
    if (value >= benchmark * 1.1) return 'text-green-400 bg-green-900 bg-opacity-20';
    if (value >= benchmark) return 'text-blue-400 bg-blue-900 bg-opacity-20';
    if (value >= benchmark * 0.9) return 'text-yellow-400 bg-yellow-900 bg-opacity-20';
    return 'text-red-400 bg-red-900 bg-opacity-20';
  };

  const getStatusLabel = (value: number, benchmark: number) => {
    if (value >= benchmark * 1.1) return 'Above Average';
    if (value >= benchmark) return 'At Target';
    if (value >= benchmark * 0.9) return 'Near Target';
    return 'Below Target';
  };

  const stats = {
    averageRN: (staffing.reduce((sum, s) => sum + s.rn_staffing, 0) / staffing.length || 0).toFixed(2),
    averageLN: (staffing.reduce((sum, s) => sum + s.ln_staffing, 0) / staffing.length || 0).toFixed(2),
    averageAide: (staffing.reduce((sum, s) => sum + s.aide_staffing, 0) / staffing.length || 0).toFixed(2),
    facilitiesAboveAverage: staffing.filter(s => s.rn_staffing >= benchmarks.rn).length,
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-300">Please log in to access staffing information.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" /><path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2V2a1 1 0 112 0v1h1a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v1a2 2 0 01-2 2h-1v1a1 1 0 11-2 0v-1h-2v1a1 1 0 11-2 0v-1H9a2 2 0 01-2-2v-1H6a1 1 0 110-2h1V9H6a1 1 0 010-2h1V5a2 2 0 012-2h1V2a1 1 0 010-2H7V0a1 1 0 010 2v1H5a2 2 0 00-2 2v1H2a1 1 0 110 2h1v2H2a1 1 0 110 2h1v1a2 2 0 002 2h1v1a1 1 0 11-2 0v-1H7z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Staffing Levels</h1>
          </div>
          <p className="text-slate-400 text-base sm:text-lg ml-11">
            Monitor nursing staff ratios and compare against CMS national benchmarks
          </p>
        </div>

        {/* CMS Benchmarks Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold text-white">CMS National Benchmarks (Hours per Resident Day)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4 border border-slate-600">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Registered Nurses (RN)</div>
              <div className="text-3xl font-bold text-emerald-400 mt-2">{benchmarks.rn}</div>
              <div className="text-xs text-slate-500 mt-1">Hours per resident day</div>
            </div>
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4 border border-slate-600">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Licensed Nurses (LN)</div>
              <div className="text-3xl font-bold text-teal-400 mt-2">{benchmarks.ln}</div>
              <div className="text-xs text-slate-500 mt-1">Hours per resident day</div>
            </div>
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4 border border-slate-600">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nursing Aides</div>
              <div className="text-3xl font-bold text-cyan-400 mt-2">{benchmarks.aide}</div>
              <div className="text-xs text-slate-500 mt-1">Hours per resident day</div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg RN Staffing</span>
                <div className="p-2 bg-slate-700 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-10-3v3m0 0h3m-3 0L13 1.5" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-blue-400">{stats.averageRN}</div>
              <div className="mt-3 text-xs text-slate-500">per resident day</div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg LN Staffing</span>
                <div className="p-2 bg-slate-700 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-10-3v3m0 0h3m-3 0L13 1.5" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-indigo-400">{stats.averageLN}</div>
              <div className="mt-3 text-xs text-slate-500">per resident day</div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Aide Staffing</span>
                <div className="p-2 bg-slate-700 rounded-lg">
                  <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-10-3v3m0 0h3m-3 0L13 1.5" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-cyan-400">{stats.averageAide}</div>
              <div className="mt-3 text-xs text-slate-500">per resident day</div>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Above Average</span>
                <div className="p-2 bg-slate-700 rounded-lg">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h.01a1 1 0 110 2H12zm-2 2a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2zm2 2a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-green-400">{stats.facilitiesAboveAverage}</div>
              <div className="mt-3 text-xs text-slate-500">of {staffing.length} facilities</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
              viewMode === 'compare'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Benchmark Comparison
          </button>
        </div>

        {/* Staffing Data */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-700 rounded-full">
                <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-slate-300 font-medium">Loading staffing data...</p>
            </div>
          </div>
        ) : staffing.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6M6 12h6m0 0H6" />
              </svg>
              <p className="text-slate-300 font-medium">No staffing data available</p>
              <p className="text-slate-500 text-sm mt-1">Data will appear once facilities are added</p>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {staffing.map((item, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Facility</span>
                    <div className="font-bold text-white mt-2">{item.facility_id}</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">RN Staffing</span>
                    <div className={`font-bold mt-2 inline-flex items-center px-3 py-1 rounded-lg text-sm ${getStatusColor(item.rn_staffing, benchmarks.rn)}`}>
                      {item.rn_staffing.toFixed(2)} / {benchmarks.rn}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{getStatusLabel(item.rn_staffing, benchmarks.rn)}</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">LN Staffing</span>
                    <div className={`font-bold mt-2 inline-flex items-center px-3 py-1 rounded-lg text-sm ${getStatusColor(item.ln_staffing, benchmarks.ln)}`}>
                      {item.ln_staffing.toFixed(2)} / {benchmarks.ln}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{getStatusLabel(item.ln_staffing, benchmarks.ln)}</div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Aide Staffing</span>
                    <div className={`font-bold mt-2 inline-flex items-center px-3 py-1 rounded-lg text-sm ${getStatusColor(item.aide_staffing, benchmarks.aide)}`}>
                      {item.aide_staffing.toFixed(2)} / {benchmarks.aide}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{getStatusLabel(item.aide_staffing, benchmarks.aide)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-500">{item.reporting_period}</div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                    item.staffing_score >= 4
                      ? 'bg-green-900 bg-opacity-20 text-green-400'
                      : item.staffing_score >= 3
                      ? 'bg-blue-900 bg-opacity-20 text-blue-400'
                      : 'bg-red-900 bg-opacity-20 text-red-400'
                  }`}>
                    ★ {item.staffing_score}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-300">Facility</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-300">RN Staffing</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-300">vs Benchmark</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-300">LN Staffing</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-300">vs Benchmark</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-300">Aide Staffing</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-300">vs Benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  {staffing.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700 hover:bg-opacity-50">
                      <td className="px-6 py-4 font-medium text-slate-300">{item.facility_id}</td>
                      <td className="px-6 py-4 text-center text-slate-300">{item.rn_staffing.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          item.rn_staffing >= benchmarks.rn ? 'bg-green-900 bg-opacity-20 text-green-400' : 'bg-red-900 bg-opacity-20 text-red-400'
                        }`}>
                          {((item.rn_staffing / benchmarks.rn - 1) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-300">{item.ln_staffing.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          item.ln_staffing >= benchmarks.ln ? 'bg-green-900 bg-opacity-20 text-green-400' : 'bg-red-900 bg-opacity-20 text-red-400'
                        }`}>
                          {((item.ln_staffing / benchmarks.ln - 1) * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-300">{item.aide_staffing.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          item.aide_staffing >= benchmarks.aide ? 'bg-green-900 bg-opacity-20 text-green-400' : 'bg-red-900 bg-opacity-20 text-red-400'
                        }`}>
                          {((item.aide_staffing / benchmarks.aide - 1) * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    </main>
  </div>
  );
}

// Helper function to get status label
function getStatusLabel(value: number, benchmark: number) {
  if (value >= benchmark * 1.1) return 'Above benchmark';
  if (value >= benchmark) return 'Meets benchmark';
  if (value >= benchmark * 0.9) return 'Near benchmark';
  return 'Below benchmark';
}

// Mock stats calculation
const stats = {
  averageRN: mockStaffing.length > 0 ? (mockStaffing.reduce((sum, s) => sum + s.rn_staffing, 0) / mockStaffing.length).toFixed(2) : '0.00',
  averageLN: mockStaffing.length > 0 ? (mockStaffing.reduce((sum, s) => sum + s.ln_staffing, 0) / mockStaffing.length).toFixed(2) : '0.00',
  averageAide: mockStaffing.length > 0 ? (mockStaffing.reduce((sum, s) => sum + s.aide_staffing, 0) / mockStaffing.length).toFixed(2) : '0.00',
  facilitiesAboveAverage: mockStaffing.length > 0 ? mockStaffing.filter(s => s.staffing_score >= 4).length : 0,
};
