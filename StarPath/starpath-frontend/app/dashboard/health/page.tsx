'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { API_URL } from '@/lib/api-config';

interface HealthInspection {
  id: string;
  facility_id: string;
  survey_date: string;
  survey_type: string;
  cycle: number;
  deficiency_count: number;
  health_score: number;
}

export default function HealthInspectionsPage() {
  const { user, token } = useAuth();
  const [inspections, setInspections] = useState<HealthInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInspections();
  }, [token]);

  const fetchInspections = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/inspections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInspections(data.inspections || []);
      } else if (response.status === 404) {
        setInspections([]);
      } else {
        setError('Failed to load health inspections');
      }
    } catch (err) {
      setError('Failed to load health inspections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please log in to access health inspections.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Health Inspections</h1>
        <p className="text-lg text-gray-600 mt-3">Track and analyze facility health inspection records and deficiency trends</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Inspections List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Inspections</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading inspections...</p>
          </div>
        ) : inspections.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No health inspections found. Inspections will appear here as they are conducted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Facility</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Survey Date</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Cycle</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Deficiencies</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Health Score</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((inspection, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{inspection.facility_id}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(inspection.survey_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{inspection.survey_type}</td>
                    <td className="px-6 py-4 text-gray-700">{inspection.cycle}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        {inspection.deficiency_count}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${inspection.health_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{inspection.health_score}%</span>
                      </div>
                    </td>
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
