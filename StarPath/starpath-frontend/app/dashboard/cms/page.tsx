'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { API_URL } from '@/lib/api-config';

interface CMSStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  acceptedSubmissions: number;
  failedSubmissions: number;
  exportCount: number;
}

export default function CMSPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<CMSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/cms/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalSubmissions: data.count,
          pendingSubmissions: data.submissions.filter((s: any) => s.status === 'PENDING').length,
          acceptedSubmissions: data.submissions.filter((s: any) => s.status === 'ACCEPTED').length,
          failedSubmissions: data.submissions.filter((s: any) => s.status === 'FAILED').length,
          exportCount: 0, // Will be fetched from export endpoint
        });
      }
    } catch (err) {
      setError('Failed to load CMS statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to access CMS integration features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">CMS Integration</h1>
        <p className="text-lg text-gray-600 mt-3">Export and submit facility data to the CMS Five-Star Quality Rating System</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-2v-2m0-4V9m0 0V7m0 2V5" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Submissions</div>
            <div className="text-4xl font-bold text-gray-900 mt-3">{stats.totalSubmissions}</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Pending</div>
            <div className="text-4xl font-bold text-yellow-600 mt-3">{stats.pendingSubmissions}</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Accepted</div>
            <div className="text-4xl font-bold text-green-600 mt-3">{stats.acceptedSubmissions}</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Failed</div>
            <div className="text-4xl font-bold text-red-600 mt-3">{stats.failedSubmissions}</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Exports</div>
            <div className="text-4xl font-bold text-blue-600 mt-3">{stats.exportCount}</div>
          </div>
        </div>
      ) : null}

      {/* Main Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Export Card */}
          <Link href="/dashboard/cms/export">
            <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl border border-blue-200 p-8 hover:shadow-xl transition-all cursor-pointer group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-lg mb-6 group-hover:bg-blue-600 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Export Data</h3>
              <p className="text-gray-600 mt-3 text-sm">Export facility ratings and inspection data in CMS-compliant format for regulatory submission</p>
              <div className="mt-6 text-sm font-semibold text-blue-600 group-hover:text-blue-700">Get Started →</div>
            </div>
          </Link>

          {/* Validate Card */}
          <Link href="/dashboard/cms/export">
            <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 rounded-xl border border-purple-200 p-8 hover:shadow-xl transition-all cursor-pointer group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-500 rounded-lg mb-6 group-hover:bg-purple-600 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Validate Data</h3>
              <p className="text-gray-600 mt-3 text-sm">Verify that facility data meets all CMS requirements before submission to reduce rejection rates</p>
              <div className="mt-6 text-sm font-semibold text-purple-600 group-hover:text-purple-700">Check Status →</div>
            </div>
          </Link>

          {/* Submissions Card */}
          <Link href="/dashboard/cms/submissions">
            <div className="bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl border border-green-200 p-8 hover:shadow-xl transition-all cursor-pointer group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-lg mb-6 group-hover:bg-green-600 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">View Submissions</h3>
              <p className="text-gray-600 mt-3 text-sm">Track submission history, status updates, and CMS responses in real-time</p>
              <div className="mt-6 text-sm font-semibold text-green-600 group-hover:text-green-700">View History →</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* About CMS Integration */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-8">
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 ml-4">About CMS Integration</h3>
          </div>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">What is CMS Integration?</p>
              <p className="text-sm mt-1">Export your facility's Five-Star Quality ratings and inspection data in official CMS format for regulatory compliance.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Data Validation</p>
              <p className="text-sm mt-1">All data is validated against CMS requirements before submission to ensure compliance and reduce rejection rates.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Submission Tracking</p>
              <p className="text-sm mt-1">Monitor the status of all submissions to CMS and view confirmation responses.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Audit Trail</p>
              <p className="text-sm mt-1">Maintain complete records of all exports and submissions for regulatory audits.</p>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-200">
                <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 ml-4">Getting Started</h3>
          </div>
          <ol className="space-y-3 text-gray-700">
            {[
              'Navigate to a facility to export data',
              'Choose JSON or XML export format',
              'Review validation results for any issues',
              'Submit validated data to CMS',
              'Track submission status in the submissions page'
            ].map((item, i) => (
              <li key={i} className="flex items-start text-sm">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-gray-700 text-sm font-semibold mr-3 flex-shrink-0">{i + 1}</span>
                <span className="pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
